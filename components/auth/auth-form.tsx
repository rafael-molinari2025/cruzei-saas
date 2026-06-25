'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props { mode: 'login' | 'signup' }

export default function AuthForm({ mode }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail]     = useState('')
  const [pwd, setPwd]         = useState('')
  const [name, setName]       = useState('')
  const [terms, setTerms]     = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (mode === 'signup') {
      if (!terms) { setError('Você precisa aceitar os Termos de Uso para criar uma conta.'); setLoading(false); return }
      const { error } = await supabase.auth.signUp({
        email, password: pwd,
        options: { data: { full_name: name }, emailRedirectTo: `${location.origin}/auth/callback` },
      })
      if (error) { setError(error.message); setLoading(false); return }
      setSuccess('Verifique seu e-mail para confirmar o cadastro.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password: pwd })
    if (error) { setError('E-mail ou senha incorretos.'); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  const isLogin = mode === 'login'

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-700 to-violet-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <Link href="/" className="text-2xl font-extrabold text-primary-600 tracking-tight">✕ Cruzei</Link>
            <p className="text-gray-500 mt-1 text-sm">
              {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta gratuitamente'}
            </p>
          </div>

          {success ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 text-sm text-center">
              ✅ {success}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Nome completo</label>
                  <input
                    type="text" required value={name} onChange={e => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">E-mail</label>
                <input
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Senha</label>
                <input
                  type="password" required minLength={6} value={pwd} onChange={e => setPwd(e.target.value)}
                  placeholder={isLogin ? '••••••••' : 'Mínimo 6 caracteres'}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
              </div>

              {!isLogin && (
                <label className="flex items-start gap-2.5 cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    checked={terms}
                    onChange={e => setTerms(e.target.checked)}
                    className="mt-0.5 accent-primary-600"
                  />
                  <span className="text-xs text-gray-500 leading-relaxed">
                    Li e aceito os{' '}
                    <Link href="/termos" target="_blank" className="text-primary-600 underline font-medium">Termos de Uso</Link>
                    {' '}e a{' '}
                    <Link href="/privacidade" target="_blank" className="text-primary-600 underline font-medium">Política de Privacidade</Link>
                  </span>
                </label>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-2.5 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit" disabled={loading}
                className="w-full bg-primary-600 text-white font-bold py-3 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 mt-2"
              >
                {loading ? 'Aguarde...' : isLogin ? 'Entrar' : 'Criar conta'}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 mt-6">
            {isLogin ? (
              <>Não tem conta? <Link href="/auth/cadastro" className="text-primary-600 font-semibold">Cadastre-se</Link></>
            ) : (
              <>Já tem conta? <Link href="/auth/entrar" className="text-primary-600 font-semibold">Entrar</Link></>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
