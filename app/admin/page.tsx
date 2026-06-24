import { createAdminClient } from '@/lib/supabase/admin'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin — Visão geral' }

export default async function AdminPage() {
  const admin = createAdminClient()

  const [
    { data: { users } },
    { data: profiles },
    { data: recs },
  ] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 500 }),
    admin.from('profiles').select('status, plan, role'),
    admin.from('reconciliations').select('id, created_at, total_gross'),
  ])

  const total      = users.length
  const pending    = profiles?.filter(p => p.status === 'pending').length    ?? 0
  const active     = profiles?.filter(p => p.status === 'active').length     ?? 0
  const suspended  = profiles?.filter(p => p.status === 'suspended').length  ?? 0
  const admins     = profiles?.filter(p => p.role   === 'admin').length      ?? 0
  const starters   = profiles?.filter(p => p.plan   === 'starter').length    ?? 0
  const pros       = profiles?.filter(p => p.plan   === 'pro').length        ?? 0

  const totalRecs  = recs?.length ?? 0
  const totalGross = recs?.reduce((a, r) => a + (r.total_gross ?? 0), 0) ?? 0

  // Conciliações por mês (últimos 6 meses)
  const byMonth: Record<string, number> = {}
  for (const r of recs ?? []) {
    const m = r.created_at.slice(0, 7)
    byMonth[m] = (byMonth[m] ?? 0) + 1
  }

  const stats = [
    { label: 'Total usuários',     value: total,     color: 'border-primary-500' },
    { label: 'Ativos',             value: active,    color: 'border-emerald-500' },
    { label: 'Pendentes',          value: pending,   color: 'border-amber-400' },
    { label: 'Suspensos',          value: suspended, color: 'border-red-400' },
    { label: 'Plano Starter',      value: starters,  color: 'border-violet-400' },
    { label: 'Plano Pro',          value: pros,      color: 'border-indigo-500' },
    { label: 'Conciliações total', value: totalRecs, color: 'border-primary-500' },
    { label: 'Volume bruto (R$)',  value: totalGross.toLocaleString('pt-BR', { minimumFractionDigits: 2 }), color: 'border-emerald-500' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Painel administrativo</h1>

      <div className="grid grid-cols-4 gap-4 mb-10">
        {stats.map(s => (
          <div key={s.label} className={`bg-white rounded-xl p-5 shadow-sm border-l-4 ${s.color}`}>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{s.label}</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-800 mb-4">Conciliações por mês</h2>
        <div className="flex items-end gap-3 h-32">
          {Object.entries(byMonth).sort().slice(-6).map(([month, count]) => {
            const max = Math.max(...Object.values(byMonth))
            const pct = max > 0 ? (count / max) * 100 : 0
            return (
              <div key={month} className="flex flex-col items-center gap-1 flex-1">
                <span className="text-xs font-bold text-gray-600">{count}</span>
                <div className="w-full bg-primary-500 rounded-t" style={{ height: `${Math.max(pct, 4)}%` }} />
                <span className="text-xs text-gray-400">{month.slice(5)}/{month.slice(2, 4)}</span>
              </div>
            )
          })}
          {Object.keys(byMonth).length === 0 && (
            <p className="text-sm text-gray-400">Nenhuma conciliação ainda</p>
          )}
        </div>
      </div>
    </div>
  )
}
