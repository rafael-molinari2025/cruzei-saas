export type MarketplaceKey = 'shopee' | 'etsy' | 'ml' | 'amazon' | 'custom'

export interface FeeConfig {
  commission: number
  payment: number
  service: number
  fixed: number
  window: number
  tolerance: number
}

export interface SaleRow {
  idx: number
  date: Date | null
  order_id: string
  product: string
  qty: number
  gross: number
  feeCSV: number
  netCSV: number
}

export interface BankRow {
  idx: number
  date: Date | null
  description: string
  credit: number
  debit: number
  _used?: boolean
}

export interface SaleWithFee extends SaleRow {
  fee: number
  expectedNet: number
}

export interface MatchedItem {
  sale: SaleWithFee
  bank: BankRow
  fees: number
  expectedNet: number
  actualNet: number
  difference: number
  status: 'ok' | 'div'
  batch: boolean
  batchSize: number
}

export interface UnmatchedSale {
  sale: SaleWithFee
}

export interface UnmatchedBank {
  bank: BankRow
}

export interface ReconciliationSummary {
  totalGross: number
  totalFees: number
  totalExpectedNet: number
  totalActualNet: number
  difference: number
  matchRate: number
  matchedCount: number
  divergenciaCount: number
  unmatchedSalesCount: number
  unmatchedBankCount: number
  periodStart: Date | null
  periodEnd: Date | null
}

export interface ReconciliationResults {
  matched: MatchedItem[]
  unmatchedSales: UnmatchedSale[]
  unmatchedBank: UnmatchedBank[]
  summary: ReconciliationSummary
}

// ─── Database types ────────────────────────────────────────────────────────
export interface DBReconciliation {
  id: string
  user_id: string
  name: string
  marketplace: string
  match_mode: string
  period_start: string | null
  period_end: string | null
  commission_pct: number
  payment_pct: number
  service_pct: number
  fixed_fee: number
  payment_window_days: number
  tolerance: number
  total_sales: number
  total_gross: number
  total_fees: number
  total_expected_net: number
  total_actual_net: number
  difference: number
  match_rate: number
  matched_count: number
  created_at: string
}

export interface DBReconciliationItem {
  id: string
  reconciliation_id: string
  item_type: 'matched' | 'unmatched_sale' | 'unmatched_bank'
  status: string | null
  order_id: string | null
  sale_date: string | null
  product: string | null
  gross: number | null
  fees: number | null
  expected_net: number | null
  actual_net: number | null
  difference: number | null
  bank_date: string | null
  bank_description: string | null
  bank_credit: number | null
  is_batch: boolean
  batch_size: number
}
