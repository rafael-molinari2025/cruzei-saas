import {
  FeeConfig, SaleRow, BankRow, SaleWithFee,
  MatchedItem, ReconciliationResults, ReconciliationSummary,
} from './types'
import { toDateStr } from '@/lib/utils'

const MS_DAY = 864e5

function calcFee(sale: SaleRow, fees: FeeConfig): number {
  if (sale.feeCSV > 0) return sale.feeCSV
  return sale.gross * (fees.commission + fees.payment + fees.service) / 100 + fees.fixed
}

function enrichSales(sales: SaleRow[], fees: FeeConfig): SaleWithFee[] {
  return sales.map(s => {
    const fee = calcFee(s, fees)
    return { ...s, fee, expectedNet: s.gross - fee }
  })
}

// ─── Individual mode: 1 sale ↔ 1 bank entry ────────────────────────────────
function reconcileIndividual(
  sales: SaleWithFee[],
  bank: BankRow[],
  fees: FeeConfig,
): Pick<ReconciliationResults, 'matched' | 'unmatchedSales' | 'unmatchedBank'> {
  const pool = bank.filter(b => b.credit > 0).map(b => ({ ...b, _used: false }))
  const matched: MatchedItem[] = []
  const usedSaleIdx = new Set<number>()

  for (const sale of sales) {
    const wideT = Math.max(fees.tolerance * 20, 5)
    let best: BankRow | null = null
    let bestScore = Infinity

    for (const b of pool) {
      if (b._used) continue
      const days  = ((b.date?.getTime() ?? 0) - (sale.date?.getTime() ?? 0)) / MS_DAY
      const delta = Math.abs(b.credit - sale.expectedNet)
      if (days >= -1 && days <= fees.window && delta <= wideT) {
        const score = days * 0.1 + delta
        if (score < bestScore) { bestScore = score; best = b }
      }
    }

    if (best) {
      best._used = true
      usedSaleIdx.add(sale.idx)
      const d = best.credit - sale.expectedNet
      matched.push({
        sale, bank: best, fees: sale.fee, expectedNet: sale.expectedNet,
        actualNet: best.credit, difference: d,
        status: Math.abs(d) <= fees.tolerance ? 'ok' : 'div',
        batch: false, batchSize: 1,
      })
    }
  }

  return {
    matched,
    unmatchedSales: sales.filter(s => !usedSaleIdx.has(s.idx)).map(s => ({ sale: s })),
    unmatchedBank:  pool.filter(b => !b._used && b.credit > 0).map(b => ({ bank: b })),
  }
}

// ─── Batch mode: N sales ↔ 1 bank entry ────────────────────────────────────
function greedySubsetSum(items: SaleWithFee[], target: number, tol: number): SaleWithFee[] | null {
  for (const it of items) if (Math.abs(it.expectedNet - target) <= tol) return [it]
  for (let i = 0; i < items.length; i++)
    for (let j = i + 1; j < items.length; j++)
      if (Math.abs(items[i].expectedNet + items[j].expectedNet - target) <= tol)
        return [items[i], items[j]]
  const total = items.reduce((a, s) => a + s.expectedNet, 0)
  if (Math.abs(total - target) <= tol) return [...items]
  const sorted = [...items].sort((a, b) => b.expectedNet - a.expectedNet)
  let sum = 0; const res: SaleWithFee[] = []
  for (const it of sorted) {
    if (sum >= target + tol) break
    res.push(it); sum += it.expectedNet
    if (Math.abs(sum - target) <= tol) return res
  }
  return null
}

function reconcileBatch(
  sales: SaleWithFee[],
  bank: BankRow[],
  fees: FeeConfig,
): Pick<ReconciliationResults, 'matched' | 'unmatchedSales' | 'unmatchedBank'> {
  const pool = bank.filter(b => b.credit > 0).map(b => ({ ...b, _used: false }))
  const matched: MatchedItem[] = []
  const usedIdx = new Set<number>()

  for (const b of pool) {
    const wideT = Math.max(fees.tolerance * 20, 5)
    const candidates = sales.filter(s => {
      if (usedIdx.has(s.idx)) return false
      const days = ((b.date?.getTime() ?? 0) - (s.date?.getTime() ?? 0)) / MS_DAY
      return days >= -1 && days <= fees.window
    })
    if (!candidates.length) continue
    const subset = greedySubsetSum(candidates, b.credit, wideT)
    if (!subset) continue
    b._used = true
    const subTotal = subset.reduce((a, s) => a + s.expectedNet, 0)
    const d = b.credit - subTotal
    const perItem = d / subset.length
    subset.forEach(s => {
      usedIdx.add(s.idx)
      matched.push({
        sale: s, bank: b, fees: s.fee, expectedNet: s.expectedNet,
        actualNet: s.expectedNet + perItem, difference: perItem,
        status: Math.abs(d) <= fees.tolerance * subset.length ? 'ok' : 'div',
        batch: true, batchSize: subset.length,
      })
    })
  }

  return {
    matched,
    unmatchedSales: sales.filter(s => !usedIdx.has(s.idx)).map(s => ({ sale: s })),
    unmatchedBank:  pool.filter(b => !b._used && b.credit > 0).map(b => ({ bank: b })),
  }
}

// ─── Main entry point ───────────────────────────────────────────────────────
export function reconcile(
  salesRaw: SaleRow[],
  bankRaw: BankRow[],
  fees: FeeConfig,
  mode: 'individual' | 'batch',
): ReconciliationResults {
  const sales = enrichSales(salesRaw, fees)
  const bank  = bankRaw.map(b => ({ ...b, _used: false }))

  const { matched, unmatchedSales, unmatchedBank } =
    mode === 'batch'
      ? reconcileBatch(sales, bank, fees)
      : reconcileIndividual(sales, bank, fees)

  const totalGross      = sales.reduce((a, s) => a + s.gross, 0)
  const totalFees       = sales.reduce((a, s) => a + s.fee, 0)
  const totalExpectedNet = totalGross - totalFees
  const totalActualNet  = matched.reduce((a, m) => a + m.actualNet, 0)
  const difference      = totalActualNet - totalExpectedNet
  const matchRate       = sales.length ? matched.length / sales.length * 100 : 0

  const allDates = sales.map(s => s.date).filter(Boolean) as Date[]
  const summary: ReconciliationSummary = {
    totalGross,
    totalFees,
    totalExpectedNet,
    totalActualNet,
    difference,
    matchRate,
    matchedCount:        matched.length,
    divergenciaCount:    matched.filter(m => m.status === 'div').length,
    unmatchedSalesCount: unmatchedSales.length,
    unmatchedBankCount:  unmatchedBank.length,
    periodStart: allDates.length ? new Date(Math.min(...allDates.map(d => d.getTime()))) : null,
    periodEnd:   allDates.length ? new Date(Math.max(...allDates.map(d => d.getTime()))) : null,
  }

  return { matched, unmatchedSales, unmatchedBank, summary }
}

// ─── Serialize for DB ───────────────────────────────────────────────────────
export function toDBItems(results: ReconciliationResults, reconciliationId: string) {
  const items: object[] = []

  for (const m of results.matched) {
    items.push({
      reconciliation_id: reconciliationId,
      item_type:         'matched',
      status:            m.status,
      order_id:          m.sale.order_id,
      sale_date:         toDateStr(m.sale.date),
      product:           m.sale.product,
      gross:             m.sale.gross,
      fees:              m.fees,
      expected_net:      m.expectedNet,
      actual_net:        m.actualNet,
      difference:        m.difference,
      bank_date:         toDateStr(m.bank.date),
      bank_description:  m.bank.description,
      bank_credit:       m.bank.credit,
      is_batch:          m.batch,
      batch_size:        m.batchSize,
    })
  }

  for (const u of results.unmatchedSales) {
    items.push({
      reconciliation_id: reconciliationId,
      item_type:         'unmatched_sale',
      status:            'pending',
      order_id:          u.sale.order_id,
      sale_date:         toDateStr(u.sale.date),
      product:           u.sale.product,
      gross:             u.sale.gross,
      fees:              u.sale.fee,
      expected_net:      u.sale.expectedNet,
      is_batch:          false,
      batch_size:        1,
    })
  }

  for (const u of results.unmatchedBank) {
    items.push({
      reconciliation_id: reconciliationId,
      item_type:         'unmatched_bank',
      status:            'extra',
      bank_date:         toDateStr(u.bank.date),
      bank_description:  u.bank.description,
      bank_credit:       u.bank.credit,
      is_batch:          false,
      batch_size:        1,
    })
  }

  return items
}
