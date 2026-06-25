export const dynamic = 'force-dynamic'

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
    authUrl: '/api/marketplace/etsy/auth',
    note: 'Conecte sua loja Etsy para importar pedidos automaticamente.',
  },
  {
    id: 'amazon', name: 'Amazon', icon: '📦', color: 'border-blue-400',
    authUrl: null,
    note: 'Em breve — requer conta Amazon SP-API.',
  },
]

const MESSAGES: Record<string, { type: 'ok' | 'err'; text: string }> = {
  ml:                    { type: 'ok',  text: 'Mercado Livre conectado com sucesso!' },
  ml_disconnected:       { type: 'ok',  text: 'Mercado Livre desconectado.' },
  ml_auth:               { type: 'err', text: 'Erro ao autorizar o Mercado Livre. Tente novamente.' },
  ml_token:              { type: 'err', text: 'Não foi possível obter o token do Mercado Livre. Verifique as credenciais do app.' },
  ml_not_configured:     { type: 'err', text: 'A integração com Mercado Livre ainda não foi ativada. Configure ML_APP_ID e ML_CLIENT_SECRET no painel de administração.' },
  etsy:                  { type: 'ok',  text: 'Etsy conectado com sucesso!' },
  etsy_disconnected:     { type: 'ok',  text: 'Etsy desconectado.' },
  etsy_auth:             { type: 'err', text: 'Erro ao autorizar o Etsy. Tente novamente.' },
  etsy_token:            { type: 'err', text: 'Não foi possível obter o token do Etsy. Verifique as credenciais do app.' },
  etsy_not_configured:   { type: 'err', text: 'A integração com Etsy ainda não foi ativada. Configure ETSY_CLIENT_ID e ETSY_REDIRECT_URI no painel de administração.' },
  plan_required:         { type: 'err', text: 'Conexões de marketplace requerem o plano Pro.' },
}

export default async function ConexoesPage({
  searchParams,
}: {
  searchParams: { success?: string; error?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const admin = createAdminClient()
  const { data: connections } = await admin
    .from('marketplace_connections')
    .select('*')
    .eq('user_id', user!.id)

  const connMap = Object.fromEntries((connections ?? []).map((c: Record<string, unknown>) => [c.marketplace, c]))

  const msgKey = searchParams.success ?? searchParams.error ?? null
  const msg    = msgKey ? MESSAGES[msgKey] : null

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Conexões de marketplace</h1>
      <p className="text-sm text-gray-500 mb-6">
        Conecte suas contas para importar pedidos automaticamente, sem precisar de CSV.
        Disponível apenas no plano <Link href="/planos" className="font-semibold text-primary-600">Pro</Link>.
      </p>

      {msg && (
        <div className={`mb-6 px-4 py-3 rounded-xl text-sm font-medium border ${
          msg.type === 'ok'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {msg.type === 'ok' ? '✅' : '❌'} {msg.text}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {MARKETPLACES.map(mp => {
          const conn       = connMap[mp.id] as Record<string, unknown> | undefined
          const isConn     = !!conn
          const comingSoon = !mp.authUrl

          return (
            <div key={mp.id} className={`bg-white rounded-2xl p-6 shadow-sm border-2 ${isConn ? 'border-emerald-300' : comingSoon ? 'border-gray-100' : mp.color}`}>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-2xl">{mp.icon}</span>
                  <h2 className="font-bold text-gray-900 mt-2">{mp.name}</h2>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">{isConn ? 'Conta conectada e ativa.' : mp.note}</p>
                </div>
                {isConn ? (
                  <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 whitespace-nowrap">
                    ● Conectado
                  </span>
                ) : comingSoon ? (
                  <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-400">
                    Em breve
                  </span>
                ) : null}
              </div>

              {isConn && conn && (
                <div className="mt-4 bg-gray-50 rounded-xl px-4 py-3 text-xs text-gray-500 space-y-1">
                  {Boolean(conn.seller_name) && (
                    <p>Conta: <span className="font-semibold text-gray-800">{String(conn.seller_name)}</span></p>
                  )}
                  {Boolean(conn.connected_at) && (
                    <p>Conectado em: <span className="font-semibold text-gray-800">{new Date(String(conn.connected_at)).toLocaleDateString('pt-BR')}</span></p>
                  )}
                  {Boolean(conn.token_expires_at) && (
                    <p>Token válido até: <span className="font-semibold text-gray-800">{new Date(String(conn.token_expires_at)).toLocaleDateString('pt-BR')}</span></p>
                  )}
                </div>
              )}

              <div className="mt-5">
                {comingSoon ? (
                  <button disabled className="w-full text-sm font-semibold py-2.5 rounded-xl bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-100">
                    Em breve
                  </button>
                ) : isConn ? (
                  <form action={`/api/marketplace/${mp.id}/disconnect`} method="POST">
                    <button
                      type="submit"
                      className="w-full text-sm font-semibold py-2.5 rounded-xl border-2 border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                    >
                      Desconectar {mp.name}
                    </button>
                  </form>
                ) : (
                  <Link
                    href={mp.authUrl!}
                    className="block w-full text-center text-sm font-bold py-2.5 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                  >
                    Conectar {mp.name}
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Info sobre ML App */}
      <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 text-sm text-blue-800">
        <p className="font-bold mb-1">Como conectar o Mercado Livre?</p>
        <p className="leading-relaxed text-blue-700">
          É necessário criar um aplicativo em{' '}
          <a href="https://developers.mercadolibre.com.br" target="_blank" rel="noopener noreferrer" className="underline font-medium">
            developers.mercadolibre.com.br
          </a>
          {' '}e adicionar as credenciais <strong>ML_APP_ID</strong> e <strong>ML_CLIENT_SECRET</strong> nas configurações do sistema.
          Entre em contato com o suporte para configuração.
        </p>
      </div>
    </div>
  )
}
