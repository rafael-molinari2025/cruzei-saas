import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function BloqueadoPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('status, plan, subscription_status')
    .eq('id', user!.id)
    .single()

  const isPending    = !profile || profile.status === 'pending'
  const isSuspended  = profile?.status === 'suspended'

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
        <div className="text-5xl mb-5">{isSuspended ? '🚫' : '⏳'}</div>

        {isSuspended ? (
          <>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Conta suspensa</h1>
            <p className="text-sm text-gray-500 mb-6">
              Sua conta foi suspensa. Entre em contato com o suporte para mais informações.
            </p>
            <a href="mailto:suporte@primetitec.com.br" className="text-primary-600 font-semibold text-sm hover:underline">
              suporte@primetitec.com.br
            </a>
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Ative sua assinatura</h1>
            <p className="text-sm text-gray-500 mb-6">
              Para acessar o Cruzei, escolha um plano. O acesso é liberado automaticamente após o pagamento.
            </p>
            <Link
              href="/planos"
              className="inline-block bg-primary-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-primary-700 transition-colors"
            >
              Ver planos →
            </Link>
            <p className="text-xs text-gray-400 mt-4">
              Já assinou?{' '}
              <Link href="/dashboard" className="text-primary-600 hover:underline">
                Atualizar acesso
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
