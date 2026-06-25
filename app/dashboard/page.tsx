import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { fmtBRL, fmtPct } from '@/lib/utils'
import type { DBReconciliation } from '@/lib/engine/types'
import MonthlyChart from '@/components/dashboard/monthly-chart'
import WelcomeBanner from '@/components/dashboard/welcome-banner'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Visão geral' }

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const admin = createAdminClient()
  const { data: profile } = await admin.from('profiles').select('plan').eq('id', user!.id).single()
  const plan = (profile?.plan as string) ?? 'none'

  const { data: allRecs } = await supabase
    .from('reconciliations')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: true })

  const all = (allRecs ?? []) as DBReconciliation[]
  const recent = [...all].reverse().slice(0, 10)

  // Agrega por mês para o gráfico
  const byMonth: Record<string, { gross: number; fees: number; net: number; count: number }> = {}
  for (const r of all) {
    const m = r.created_at.slice(0, 7)
    if (!byMonth[m]) byMonth[m] = { gross: 0, fees: 0, net: 0, count: 0 }
    byMonth[m].gross += r.total_gross
    byMonth[m].fees  += r.total_fees
    byMonth[m].net   += r.total_actual_net
    byMonth[m].count += 1
  }
  const monthlyData = Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, v]) => ({ month: month.slice(5) + '/' + month.slice(2, 4), ...v }))

  // Aggregate stats from all reconciliations
  const totalGross   = all.reduce((a, r) => a + r.total_gross, 0)
  const totalFees    = all.reduce((a, r) => a + r.total_fees, 0)
  const totalNet     = all.reduce((a, r) => a + r.total_actual_net, 0)
  const avgMatch     = all.length ? all.reduce((a, r) => a + r.match_rate, 0) / all.length : 0
  void totalNet

  const mpLabel: Record<string, string> = {
    shopee: '🛍 Shopee', etsy: '🎨 Etsy', ml: '🛒 Mercado Livre', amazon: '📦 Amazon', custom: '⚙️ Personalizado',
  }

  return (
    <div>
      <WelcomeBanner plan={plan} />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Visão geral</h1>
          <p className="text-sm text-gray-500 mt-1">Olá, {user?.user_metadata?.full_name || user?.email}</p>
        </div>
        <Link
          href="/dashboard/nova"
          className="bg-primary-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-primary-700 transition-colors"
        >
          + Nova conciliação
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Conciliações', value: String(all.length), sub: 'no total', color: 'border-primary-500' },
          { label: 'Vendas brutas', value: fmtBRL(totalGross), sub: 'acumulado', color: 'border-violet-500' },
          { label: 'Taxas pagas', value: fmtBRL(totalFees), sub: 'para marketplaces', color: 'border-red-400' },
          { label: 'Taxa média concil.', value: fmtPct(avgMatch), sub: 'de conciliação', color: 'border-emerald-500' },
        ].map(s => (
          <div key={s.label} className={`bg-white rounded-xl p-5 shadow-sm border-l-4 ${s.color}`}>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{s.label}</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-1">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Monthly chart */}
      {monthlyData.length > 1 && <MonthlyChart data={monthlyData} />}

      {/* Recent reconciliations */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-800">Conciliações recentes</h2>
          <Link href="/dashboard/historico" className="text-xs text-primary-600 font-semibold hover:underline">Ver todas →</Link>
        </div>

        {recent.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-medium">Nenhuma conciliação ainda</p>
            <p className="text-sm mt-1">
              <Link href="/dashboard/nova" className="text-primary-600 font-semibold hover:underline">Criar a primeira</Link>
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="px-6 py-3 text-left">Nome</th>
                  <th className="px-6 py-3 text-left">Marketplace</th>
                  <th className="px-6 py-3 text-right">Bruto</th>
                  <th className="px-6 py-3 text-right">Líquido</th>
                  <th className="px-6 py-3 text-right">Conciliado</th>
                  <th className="px-6 py-3 text-left">Data</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recent.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3.5 font-medium text-gray-900">{r.name}</td>
                    <td className="px-6 py-3.5 text-gray-600">{mpLabel[r.marketplace] ?? r.marketplace}</td>
                    <td className="px-6 py-3.5 text-right font-mono text-gray-700">{fmtBRL(r.total_gross)}</td>
                    <td className="px-6 py-3.5 text-right font-mono text-gray-700">{fmtBRL(r.total_actual_net)}</td>
                    <td className="px-6 py-3.5 text-right">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${
                        r.match_rate >= 90 ? 'bg-emerald-100 text-emerald-700' :
                        r.match_rate >= 70 ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {r.match_rate.toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-gray-500">
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
    </div>
  )
}
