'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function PerfilForm({ initialName, email }: { initialName: string; email: string }) {
  const [name, setName]       = useState(initialName)
  const [saving, setSaving]   = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const supabase = createClient()

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    const { error } = await supabase.auth.updateUser({ data: { full_name: name } })

    if (!error) {
      await supabase.from('profiles').update({ full_name: name, updated_at: new Date().toISOString() })
        .eq('id', (await supabase.auth.getUser()).data.user!.id)
      setMessage({ type: 'ok', text: 'Nome atualizado com sucesso.' })
    } else {
      setMessage({ type: 'err', text: error.message })
    }
    setSaving(false)
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome completo</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Seu nome"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail</label>
        <input
          type="email"
          value={email}
          disabled
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
        />
        <p className="text-xs text-gray-400 mt-1">O e-mail não pode ser alterado aqui.</p>
      </div>
      {message && (
        <p className={`text-sm font-medium ${message.type === 'ok' ? 'text-emerald-600' : 'text-red-600'}`}>
          {message.text}
        </p>
      )}
      <button
        type="submit"
        disabled={saving}
        className="bg-primary-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50"
      >
        {saving ? 'Salvando...' : 'Salvar alterações'}
      </button>
    </form>
  )
}
