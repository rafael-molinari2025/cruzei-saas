import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin — Usuários' }

const STATUS_BADGE: Record<string, string> = {
  active:    'bg-emerald-100 text-emerald-700',
  pending:   'bg-amber-100 text-amber-700',
  suspended: 'bg-red-100 text-red-700',
}
const PLAN_BADGE: Record<string, string> = {
  none:    'bg-gray-100 text-gray-500',
  starter: 'bg-violet-100 text-violet-700',
  pro:     'bg-indigo-100 text-indigo-700',
}

export default async function AdminUsuariosPage() {
  const admin = createAdminClient()

  const [
    { data: { users } },
    { data: profiles },
    { data: recStats },
  ] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 500 }),
    admin.from('profiles').select('*'),
    admin.from('reconciliations').select('user_id'),
  ])

  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]))
  const recCount: Record<string, number> = {}
  for (const r of recStats ?? []) recCount[r.user_id] = (recCount[r.user_id] ?? 0) + 1

  const rows = users.map(u => ({ ...u, ...profileMap[u.id], reconciliations: recCount[u.id] ?? 0 }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Usuários ({rows.length})</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="px-5 py-3 text-left">Usuário</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-left">Plano</th>
              <th className="px-5 py-3 text-left">Função</th>
              <th className="px-5 py-3 text-right">Conciliações</th>
              <th className="px-5 py-3 text-left">Cadastro</th>
              <th className="px-5 py-3 text-left">Último acesso</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-5 py-3.5">
                  <p className="font-semibold text-gray-900">{u.full_name || '—'}</p>
                  <p className="text-xs text-gray-400">{u.email}</p>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_BADGE[u.status] ?? 'bg-gray-100 text-gray-500'}`}>
                    {u.status ?? 'pending'}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${PLAN_BADGE[u.plan] ?? 'bg-gray-100 text-gray-500'}`}>
                    {u.plan ?? 'none'}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-gray-600 capitalize">{u.role ?? 'user'}</td>
                <td className="px-5 py-3.5 text-right font-semibold text-gray-700">{u.reconciliations}</td>
                <td className="px-5 py-3.5 text-gray-500 text-xs">
                  {new Date(u.created_at).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-5 py-3.5 text-gray-500 text-xs">
                  {u.last_sign_in ? new Date(u.last_sign_in).toLocaleDateString('pt-BR') : '—'}
                </td>
                <td className="px-5 py-3.5">
                  <Link href={`/admin/usuarios/${u.id}`} className="text-primary-600 font-semibold text-xs hover:underline">
                    Gerenciar →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
