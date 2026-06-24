import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Conexões de marketplace' }

const MARKETPLACES = [
  {
    id: 'ml', name: 'Mercado Livre', icon: '🛒', color: 'border-yellow-400',
    authUrl: '/api/marketplace/ml/auth',
    note: 'Conecte sua conta para importar pedidos automaticamente.',
  },
  {
    id: 'shopee', name: 'Shopee', icon: '🛍', color: 'border-orange-400',
    authUrl: null,
    note: 'Em breve — requer aprovação como parceiro Shopee.',
  },
  {
    id: 'etsy', name: 'Etsy', icon: '🎨', color: 'border-amber-400',
    authUrl: null,
    note: 'Em breve — conexão via OAuth Etsy.',
  },
  {
    id: 'amazon', name: 'Amazon', icon: '📦', color: 'border-blue-400',
    authUrl: null,
    note: 'Em breve — requer conta Amazon SP-API.',
  },
]

export default async function ConexoesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const admin = createAdminClient()
  const { data: connections } = await admin
    .from('marketplace_connections')
    .select('*')
    .eq('user_id', user!.id)

  const connMap = Object.fromEntries((connections ?? []).map(c => [c.marketplace, c]))

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Conexões de marketplace</h1>
      <p className="text-sm text-gray-500 mb-8">
        Conecte suas contas para importar pedidos automaticamente, sem precisar de CSV.
        Disponível apenas no plano <span className="font-semibold text-primary-600">Pro</span>.
      </p>

      <div className="grid grid-cols-2 gap-4">
        {MARKETPLACES.map(mp => {
          const conn    = connMap[mp.id]
          const isConn  = !!conn
          const comingSoon = !mp.authUrl

          return (
            <div key={mp.id} className={`bg-white rounded-2xl p-6 shadow-sm border-l-4 ${mp.color} border border-gray-100`}>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-2xl">{mp.icon}</span>
                  <h2 className="font-bold text-gray-900 mt-2">{mp.name}</h2>
                  <p className="text-xs text-gray-400 mt-1">{mp.note}</p>
                </div>
                {isConn ? (
                  <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">Conectado</span>
                ) : comingSoon ? (
                  <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-400">Em breve</span>
                ) : null}
              </div>

              {isConn && (
                <div className="mt-4 text-xs text-gray-500 space-y-0.5">
                  <p>Conta: <span className="font-semibold text-gray-700">{conn.seller_name}</span></p>
                  <p>Conectado em: {new Date(conn.connected_at).toLocaleDateString('pt-BR')}</p>
                </div>
              )}

              <div className="mt-5">
                {comingSoon ? (
                  <button disabled className="w-full text-sm font-semibold py-2 rounded-lg bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-100">
                    Em breve
                  </button>
                ) : isConn ? (
                  <form action={`/api/marketplace/${mp.id}/disconnect`} method="POST">
                    <button type="submit" className="w-full text-sm font-semibold py-2 rounded-lg border-2 border-red-200 text-red-500 hover:bg-red-50 transition-colors">
                      Desconectar
                    </button>
                  </form>
                ) : (
                  <Link
                    href={mp.authUrl!}
                    className="block w-full text-center text-sm font-semibold py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                  >
                    Conectar {mp.name}
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
