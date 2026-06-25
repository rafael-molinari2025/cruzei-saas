'use client'
import { useState } from 'react'

export default function PortalButtonClient() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function openPortal() {
    setLoading(true)
    setError(null)
    try {
      const res  = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error ?? 'Não foi possível abrir o portal. Tente novamente.')
        setLoading(false)
      }
    } catch {
      setError('Erro de conexão. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={openPortal}
        disabled={loading}
        className="text-sm bg-gray-900 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        {loading ? 'Abrindo...' : 'Gerenciar assinatura →'}
      </button>
      {error && (
        <p className="text-xs text-red-600 font-medium">{error}</p>
      )}
    </div>
  )
}
