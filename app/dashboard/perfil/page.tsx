import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Metadata } from 'next'
import PerfilForm from './perfil-form'
import PortalButtonClient from './portal-button'

export const metadata: Metadata = { title: 'Meu perfil' }

const PLAN_LABELS: Record<string, string> = {
  starter: 'Starter — R$ 49/mês',
  pro:     'Pro — R$ 99/mês',
  none:    'Sem plano ativo',
}

const STATUS_LABELS: Record<string, string> = {
  active:    'Ativo',
  pending:   'Pendente',
  suspended: 'Suspenso',
}

export default async function PerfilPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('full_name, plan, status, subscription_status, plan_expires_at, stripe_customer_id')
    .eq('id', user!.id)
    .single()

  const plan   = (profile?.plan   as string) ?? 'none'
  const status = (profile?.status as string) ?? 'pending'

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Meu perfil</h1>

      {/* Conta */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="font-bold text-gray-800 mb-5">Dados da conta</h2>
        <PerfilForm
          initialName={(profile?.full_name as string) ?? ''}
          email={user!.email ?? ''}
        />
      </section>

      {/* Assinatura */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-bold text-gray-800 mb-5">Assinatura</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-sm text-gray-500">Plano atual</span>
            <span className="text-sm font-semibold text-gray-900">{PLAN_LABELS[plan] ?? plan}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-sm text-gray-500">Status</span>
            <span className={`text-sm font-semibold ${status === 'active' ? 'text-emerald-600' : status === 'suspended' ? 'text-red-600' : 'text-amber-600'}`}>
              {STATUS_LABELS[status] ?? status}
            </span>
          </div>
          {profile?.plan_expires_at && (
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-500">Próxima cobrança</span>
              <span className="text-sm font-semibold text-gray-900">
                {new Date(profile.plan_expires_at as string).toLocaleDateString('pt-BR')}
              </span>
            </div>
          )}
          <div className="pt-2 flex flex-wrap gap-3">
            {plan !== 'none' && profile?.stripe_customer_id ? (
              <PortalButton />
            ) : (
              <a href="/planos" className="text-sm bg-primary-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-primary-700 transition-colors">
                Assinar um plano →
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

function PortalButton() {
  return <PortalButtonClient />
}
