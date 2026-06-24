'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PLANS } from '@/lib/stripe/plans'

export default function PlanosPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError]     = useState<string | null>(null)

  async function assinar(priceId: string, planId: string) {
    if (!priceId) { setError('Plano não configurado. Contate o suporte.'); return }
    setLoading(planId); setError(null)
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId }),
    })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      setError(data.error ?? 'Erro ao iniciar pagamento')
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg text-primary-600 tracking-tight">✕ Cruzei</Link>
          <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 font-medium">Ir para o dashboard →</Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Escolha seu plano</h1>
          <p className="text-lg text-gray-500">Comece a cruzar seus dados. Cancele quando quiser.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm text-center mb-8">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PLANS.map(plan => (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl p-8 shadow-sm border-2 relative ${
                plan.highlight ? 'border-primary-500 shadow-lg' : 'border-gray-100'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs font-bold px-4 py-1.5 rounded-full">
                  Mais popular
                </div>
              )}

              <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
              <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-4">{plan.price}</p>

              <ul className="mt-6 space-y-3">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700">
                    <span className="text-emerald-500 font-bold text-base">✓</span> {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => assinar(plan.priceId, plan.id)}
                disabled={loading === plan.id}
                className={`mt-8 w-full font-bold py-3 rounded-xl transition-colors disabled:opacity-50 ${
                  plan.highlight
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {loading === plan.id ? 'Redirecionando...' : `Assinar ${plan.name}`}
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          Pagamento processado com segurança pelo Stripe · Cancele a qualquer momento
        </p>
      </div>
    </div>
  )
}
