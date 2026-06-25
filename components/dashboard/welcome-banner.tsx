'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function WelcomeBanner({ plan }: { plan?: string }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dismissed = sessionStorage.getItem('welcome_dismissed')
    if (!dismissed) setVisible(true)
  }, [])

  function dismiss() {
    sessionStorage.setItem('welcome_dismissed', '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="bg-gradient-to-r from-primary-600 to-violet-600 text-white rounded-2xl p-6 mb-8 relative">
      <button
        onClick={dismiss}
        className="absolute top-4 right-4 text-white/60 hover:text-white text-lg leading-none"
        aria-label="Fechar"
      >
        ✕
      </button>
      <div className="flex items-start gap-4">
        <div className="text-4xl">🎉</div>
        <div>
          <h2 className="text-lg font-bold mb-1">
            Bem-vindo ao Cruzei{plan && plan !== 'none' ? ` — plano ${plan === 'pro' ? 'Pro' : 'Starter'} ativo!` : '!'}
          </h2>
          <p className="text-white/80 text-sm mb-4">
            Para fazer sua primeira conciliação, você precisa de dois arquivos: o <strong>relatório de vendas</strong> do marketplace e o <strong>extrato bancário</strong> do período.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/nova"
              className="bg-white text-primary-700 font-bold text-sm px-5 py-2 rounded-xl hover:bg-primary-50 transition-colors"
            >
              Fazer primeira conciliação →
            </Link>
            <button
              onClick={dismiss}
              className="text-white/70 text-sm font-medium hover:text-white transition-colors"
            >
              Já sei, pode fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
