'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface UserData {
  id: string; email: string; full_name: string; created_at: string
  last_sign_in: string; status: string; role: string; plan: string
  subscription_status: string; reconciliations: number
  stripe_customer_id: string; plan_expires_at: string
}

const STATUS_OPTS  = ['pending','active','suspended']
const PLAN_OPTS    = ['none','starter','pro']
const ROLE_OPTS    = ['user','admin']

export default function AdminUsuarioDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [user,   setUser]   = useState<UserData | null>(null)
  const [saving, setSaving] = useState(false)
  const [msg,    setMsg]    = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/users')
      .then(r => r.json())
      .then((users: UserData[]) => setUser(users.find(u => u.id === id) ?? null))
  }, [id])

  async function save(field: string, value: string) {
    setSaving(true); setMsg(null)
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    })
    if (res.ok) {
      setUser(u => u ? { ...u, [field]: value } : u)
      setMsg('Salvo com sucesso')
    } else {
      setMsg('Erro ao salvar')
    }
    setSaving(false)
  }

  if (!user) return <div className="text-gray-400 text-sm">Carregando...</div>

  const info = [
    { label: 'E-mail',        value: user.email },
    { label: 'Cadastro',      value: new Date(user.created_at).toLocaleDateString('pt-BR') },
    { label: 'Último acesso', value: user.last_sign_in ? new Date(user.last_sign_in).toLocaleDateString('pt-BR') : '—' },
    { label: 'Conciliações',  value: String(user.reconciliations) },
    { label: 'Stripe ID',     value: user.stripe_customer_id || '—' },
    { label: 'Plano expira',  value: user.plan_expires_at ? new Date(user.plan_expires_at).toLocaleDateString('pt-BR') : '—' },
  ]

  return (
    <div className="max-w-2xl">
      <Link href="/admin/usuarios" className="text-xs text-gray-400 hover:text-gray-600">← Usuários</Link>
      <h1 className="text-2xl font-bold text-gray-900 mt-2 mb-1">{user.full_name || '(sem nome)'}</h1>
      <p className="text-sm text-gray-400 mb-8">{user.email}</p>

      {/* Info */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <h2 className="font-bold text-gray-700 mb-4">Informações</h2>
        <dl className="grid grid-cols-2 gap-y-3 text-sm">
          {info.map(i => (
            <div key={i.label}>
              <dt className="text-xs font-bold text-gray-400 uppercase tracking-wide">{i.label}</dt>
              <dd className="font-medium text-gray-900 mt-0.5">{i.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
        <h2 className="font-bold text-gray-700">Controles de acesso</h2>

        {[
          { label: 'Status',  field: 'status', value: user.status,  opts: STATUS_OPTS },
          { label: 'Plano',   field: 'plan',   value: user.plan,    opts: PLAN_OPTS   },
          { label: 'Função',  field: 'role',   value: user.role,    opts: ROLE_OPTS   },
        ].map(({ label, field, value, opts }) => (
          <div key={field} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-700">{label}</p>
              <p className="text-xs text-gray-400 capitalize">Atual: {value}</p>
            </div>
            <div className="flex gap-2">
              {opts.map(opt => (
                <button
                  key={opt}
                  onClick={() => save(field, opt)}
                  disabled={saving || value === opt}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${
                    value === opt
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'border-gray-200 text-gray-600 hover:border-primary-400 hover:text-primary-600'
                  } disabled:opacity-50`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}

        {msg && <p className={`text-xs font-semibold ${msg.includes('Erro') ? 'text-red-500' : 'text-emerald-600'}`}>{msg}</p>}
      </div>
    </div>
  )
}
