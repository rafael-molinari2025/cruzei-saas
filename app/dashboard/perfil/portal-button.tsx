'use client'
import { useState } from 'react'

export default function PortalButtonClient() {
  const [loading, setLoading] = useState(false)

  async function openPortal() {
    setLoading(true)
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    const { url } = await res.json()
    if (url) window.location.href = url
    else setLoading(false)
  }

  return (
    <button
      onClick={openPortal}
      disabled={loading}
      className="text-sm bg-gray-900 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
    >
      {loading ? 'Abrindo...' : 'Gerenciar assinatura →'}
    </button>
  )
}
