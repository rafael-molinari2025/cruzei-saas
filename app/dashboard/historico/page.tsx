import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { fmtBRL, fmtPct } from '@/lib/utils'
import type { DBReconciliation } from '@/lib/engine/types'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Histórico' }

const MP_LABELS: Record<string, string> = {
  shopee: '🛍 Shopee', etsy: '🎨 Etsy', ml: '🛒 Mercado Livre', amazon: '📦 Amazon', custom: '⚙️ Personalizado',
}

export default async function HistoricoPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('reconciliations')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const recs = (data ?? []) as DBReconciliation[]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Histórico</h1>
        <Link href="/dashboard/nova" className="bg-primary-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-primary-700 transition-colors">
          + Nova conciliação
        </Link>
      </div>

      {recs.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-semibold text-gray-700">Nenhuma conciliação ainda</p>
          <Link href="/dashboard/nova" className="text-primary-600 text-sm font-semibold hover:underline mt-2 inline-block">
            Criar a primeira →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-6 py-3 text-left">Nome</th>
                <th className="px-6 py-3 text-left">Marketplace</th>
                <th className="px-6 py-3 text-left">Período</th>
                <th className="px-6 py-3 text-right">Bruto</th>
                <th className="px-6 py-3 text-right">Taxas</th>
                <th className="px-6 py-3 text-right">Líquido</th>
                <th className="px-6 py-3 text-right">Diferença</th>
                <th className="px-6 py-3 text-right">Conciliado</th>
                <th className="px-6 py-3 text-left">Data</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recs.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3.5 font-semibold text-gray-900">{r.name}</td>
                  <td className="px-6 py-3.5 text-gray-600">{MP_LABELS[r.marketplace] ?? r.marketplace}</td>
                  <td className="px-6 py-3.5 text-gray-500 text-xs">
                    {r.period_start ? new Date(r.period_start + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}
                    {' → '}
                    {r.period_end   ? new Date(r.period_end   + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}
                  </td>
                  <td className="px-6 py-3.5 text-right font-mono text-gray-700">{fmtBRL(r.total_gross)}</td>
                  <td className="px-6 py-3.5 text-right font-mono text-red-500">{fmtBRL(r.total_fees)}</td>
                  <td className="px-6 py-3.5 text-right font-mono text-gray-700">{fmtBRL(r.total_actual_net)}</td>
                  <td className="px-6 py-3.5 text-right font-mono">
                    <span className={r.difference < -0.01 ? 'text-red-600 font-semibold' : r.difference > 0.01 ? 'text-amber-600 font-semibold' : 'text-gray-400'}>
                      {r.difference >= 0 ? '+' : ''}{fmtBRL(r.difference)}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${r.match_rate >= 90 ? 'bg-emerald-100 text-emerald-700' : r.match_rate >= 70 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                      {fmtPct(r.match_rate, 0)}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-gray-500 text-xs">
                    {new Date(r.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-3.5">
                    <Link href={`/dashboard/conciliacao/${r.id}`} className="text-primary-600 font-semibold text-xs hover:underline">
                      Ver →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
