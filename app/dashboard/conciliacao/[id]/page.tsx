import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { fmtBRL, fmtPct, fmtDate } from '@/lib/utils'
import type { DBReconciliation, DBReconciliationItem } from '@/lib/engine/types'
import DetailCharts from './detail-charts'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Conciliação' }

const MP_LABELS: Record<string, string> = {
  shopee: '🛍 Shopee', etsy: '🎨 Etsy', ml: '🛒 Mercado Livre', amazon: '📦 Amazon', custom: '⚙️ Personalizado',
}

export default async function ReconciliationDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: rec } = await supabase
    .from('reconciliations')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user!.id)
    .single()

  if (!rec) notFound()
  const r = rec as DBReconciliation

  const { data: itemsData } = await supabase
    .from('reconciliation_items')
    .select('*')
    .eq('reconciliation_id', params.id)
    .order('sale_date', { ascending: true })

  const items = (itemsData ?? []) as DBReconciliationItem[]
  const matched   = items.filter(i => i.item_type === 'matched')
  const unSales   = items.filter(i => i.item_type === 'unmatched_sale')
  const unBank    = items.filter(i => i.item_type === 'unmatched_bank')

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <Link href="/dashboard/historico" className="text-xs text-gray-400 hover:text-gray-600 font-medium">← Histórico</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{r.name}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {MP_LABELS[r.marketplace] ?? r.marketplace} · {r.match_mode === 'batch' ? 'Por lote' : 'Pedido a pedido'} ·{' '}
            Criado em {new Date(r.created_at).toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Vendas brutas',    value: fmtBRL(r.total_gross),        color: 'border-primary-500' },
          { label: 'Taxas',            value: fmtBRL(r.total_fees),          color: 'border-red-400',    cls: 'text-red-600' },
          { label: 'Líquido esperado', value: fmtBRL(r.total_expected_net),  color: 'border-emerald-500' },
          { label: 'Diferença',
            value: (r.difference >= 0 ? '+' : '') + fmtBRL(r.difference),
            color: r.difference < -0.01 ? 'border-red-400' : r.difference > 0.01 ? 'border-amber-400' : 'border-emerald-500',
            cls:   r.difference < -0.01 ? 'text-red-600' : r.difference > 0.01 ? 'text-amber-600' : 'text-emerald-600',
          },
          { label: 'Conciliação',      value: fmtPct(r.match_rate),
            color: r.match_rate >= 90 ? 'border-emerald-500' : r.match_rate >= 70 ? 'border-amber-400' : 'border-red-400',
          },
        ].map(c => (
          <div key={c.label} className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${c.color}`}>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{c.label}</p>
            <p className={`text-xl font-extrabold mt-1 ${c.cls ?? 'text-gray-900'}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <DetailCharts items={matched} />

      {/* Config info */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Configuração aplicada</p>
        <div className="grid grid-cols-6 gap-4 text-sm">
          {[
            { label: 'Comissão',    value: fmtPct(r.commission_pct) },
            { label: 'Pgto.',       value: fmtPct(r.payment_pct) },
            { label: 'Serviço',     value: fmtPct(r.service_pct) },
            { label: 'Taxa fixa',   value: fmtBRL(r.fixed_fee) },
            { label: 'Janela',      value: `${r.payment_window_days} dias` },
            { label: 'Tolerância',  value: fmtBRL(r.tolerance) },
          ].map(c => (
            <div key={c.label}>
              <p className="text-xs text-gray-400">{c.label}</p>
              <p className="font-semibold text-gray-800">{c.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Matched */}
      <SectionTable title={`✅ Conciliadas (${matched.length})`} empty="Nenhuma">
        <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
          <tr>
            {['Pedido','Data','Produto','Bruto','Taxas','Liq. Esp.','Recebido','Diferença','Dep.','Status'].map(h => (
              <th key={h} className="px-5 py-2.5 text-left font-bold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {matched.map(item => {
            const d = item.difference ?? 0
            return (
              <tr key={item.id} className="hover:bg-gray-50/50">
                <td className="px-5 py-2.5"><code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{item.order_id}</code></td>
                <td className="px-5 py-2.5 text-gray-600">{item.sale_date ? fmtDate(new Date(item.sale_date + 'T00:00:00')) : '—'}</td>
                <td className="px-5 py-2.5 text-gray-700" title={item.product ?? ''}>{(item.product ?? '').slice(0, 22)}{(item.product?.length ?? 0) > 22 ? '…' : ''}</td>
                <td className="px-5 py-2.5 text-gray-700">{fmtBRL(item.gross ?? 0)}</td>
                <td className="px-5 py-2.5 text-red-500">{fmtBRL(item.fees ?? 0)}</td>
                <td className="px-5 py-2.5">{fmtBRL(item.expected_net ?? 0)}</td>
                <td className="px-5 py-2.5">{fmtBRL(item.actual_net ?? 0)}</td>
                <td className={`px-5 py-2.5 font-semibold ${d < -0.01 ? 'text-red-600' : d > 0.01 ? 'text-amber-600' : 'text-gray-400'}`}>
                  {d >= 0 ? '+' : ''}{fmtBRL(d)}
                </td>
                <td className="px-5 py-2.5 text-gray-500 text-xs">{item.bank_date ? fmtDate(new Date(item.bank_date + 'T00:00:00')) : '—'}</td>
                <td className="px-5 py-2.5">
                  <StatusBadge status={item.status ?? ''} />
                  {item.is_batch && <span className="ml-1 inline-flex px-1.5 py-0.5 rounded-full text-xs font-bold bg-violet-100 text-violet-700">lote ×{item.batch_size}</span>}
                </td>
              </tr>
            )
          })}
        </tbody>
      </SectionTable>

      {/* Unmatched sales */}
      <SectionTable title={`⚠️ Sem depósito (${unSales.length})`} empty="Todas as vendas foram conciliadas ✅">
        <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
          <tr>{['Pedido','Data','Produto','Bruto','Taxas','Liq. Esperado','Status'].map(h=><th key={h} className="px-5 py-2.5 text-left font-bold">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {unSales.map(item => (
            <tr key={item.id} className="hover:bg-gray-50/50">
              <td className="px-5 py-2.5"><code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{item.order_id}</code></td>
              <td className="px-5 py-2.5 text-gray-600">{item.sale_date ? fmtDate(new Date(item.sale_date+'T00:00:00')) : '—'}</td>
              <td className="px-5 py-2.5">{(item.product ?? '').slice(0,25)}</td>
              <td className="px-5 py-2.5">{fmtBRL(item.gross ?? 0)}</td>
              <td className="px-5 py-2.5 text-red-500">{fmtBRL(item.fees ?? 0)}</td>
              <td className="px-5 py-2.5">{fmtBRL(item.expected_net ?? 0)}</td>
              <td className="px-5 py-2.5"><StatusBadge status="pending" /></td>
            </tr>
          ))}
        </tbody>
      </SectionTable>

      {/* Unmatched bank */}
      <SectionTable title={`🏦 Depósitos sem venda (${unBank.length})`} empty="Nenhum depósito extra ✅">
        <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
          <tr>{['Data','Descrição','Crédito','Status'].map(h=><th key={h} className="px-5 py-2.5 text-left font-bold">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {unBank.map(item => (
            <tr key={item.id} className="hover:bg-gray-50/50">
              <td className="px-5 py-2.5 text-gray-600">{item.bank_date ? fmtDate(new Date(item.bank_date+'T00:00:00')) : '—'}</td>
              <td className="px-5 py-2.5 text-gray-700">{item.bank_description}</td>
              <td className="px-5 py-2.5 text-emerald-600 font-semibold">{fmtBRL(item.bank_credit ?? 0)}</td>
              <td className="px-5 py-2.5"><StatusBadge status="extra" /></td>
            </tr>
          ))}
        </tbody>
      </SectionTable>
    </div>
  )
}

function SectionTable({ title, empty, children }: { title: string; empty: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="font-bold text-gray-800">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">{children}</table>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    ok:      'bg-emerald-100 text-emerald-700',
    div:     'bg-amber-100   text-amber-700',
    pending: 'bg-red-100     text-red-700',
    extra:   'bg-blue-100    text-blue-700',
  }
  const label: Record<string, string> = { ok: '✓ OK', div: '⚠ Divergência', pending: '⏳ Pendente', extra: '🔍 Sem venda' }
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>{label[status] ?? status}</span>
}
