import { SaleRow, BankRow } from './types'
import { parseLocalDate, pickCol, toNum } from '@/lib/utils'

export function normalizeSales(rows: Record<string, unknown>[]): SaleRow[] {
  return rows.map((row, i) => {
    const gross  = toNum(pickCol(row, ['valor_bruto','gross_amount','gross','total','order_value','item_price','price','valor']))
    const feeCSV = toNum(pickCol(row, ['taxa_marketplace','fees','fee','marketplace_fee','taxa','taxas','total_fees','commission']))
    const netCSV = toNum(pickCol(row, ['valor_liquido','net_amount','net','net_total','payout','net_value']))
    return {
      idx:      i,
      date:     parseLocalDate(String(pickCol(row, ['data_venda','data','date','sale_date','order_date','data_pedido']) ?? '')),
      order_id: String(pickCol(row, ['id_pedido','order_id','pedido','id','order_number','number']) ?? `#${i + 1}`),
      product:  String(pickCol(row, ['produto','product','item','descricao','product_name','item_title','title']) ?? 'Produto'),
      qty:      toNum(pickCol(row, ['quantidade','qty','quantity'])) || 1,
      gross,
      feeCSV,
      netCSV,
    }
  }).filter(r => r.gross > 0)
}

export function normalizeBank(rows: Record<string, unknown>[]): BankRow[] {
  return rows.map((row, i) => {
    const credit = toNum(pickCol(row, ['credito','credit','entrada','deposit','valor_entrada','in']))
    const debit  = toNum(pickCol(row, ['debito','debit','saida','withdrawal','valor_saida','out']))
    return {
      idx:         i,
      date:        parseLocalDate(String(pickCol(row, ['data','date','data_lancamento','transaction_date','data_mov']) ?? '')),
      description: String(pickCol(row, ['descricao','description','desc','historico','memo','hist']) ?? ''),
      credit,
      debit,
      _used:       false,
    }
  })
}
