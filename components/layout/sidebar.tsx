'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface SidebarProps {
  role?: string
  plan?: string
  userEmail?: string
}

const nav = [
  { href: '/dashboard',            label: 'Visão geral',      icon: '📊', exact: true  },
  { href: '/dashboard/nova',       label: 'Nova conciliação', icon: '➕', exact: false },
  { href: '/dashboard/historico',  label: 'Histórico',        icon: '📁', exact: false },
  { href: '/dashboard/conexoes',   label: 'Conexões',         icon: '🔗', exact: false },
]

const PLAN_BADGE: Record<string, { label: string; cls: string }> = {
  starter: { label: 'Starter', cls: 'bg-violet-100 text-violet-700' },
  pro:     { label: 'Pro',     cls: 'bg-indigo-600 text-white'      },
  none:    { label: 'Sem plano', cls: 'bg-amber-100 text-amber-700' },
}

export default function Sidebar({ role, plan, userEmail }: SidebarProps) {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()

  const badge = PLAN_BADGE[plan ?? 'none'] ?? PLAN_BADGE['none']

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  async function openPortal() {
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    const { url } = await res.json()
    if (url) window.location.href = url
  }

  return (
    <aside className="w-56 bg-gray-900 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-800">
        <span className="text-lg font-extrabold text-white tracking-tight">✕ Cruzei</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(item => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800',
              )}
            >
              <span>{item.icon}</span>{item.label}
            </Link>
          )
        })}

        {/* Admin link */}
        {role === 'admin' && (
          <Link
            href="/admin"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mt-2',
              pathname.startsWith('/admin') ? 'bg-red-600 text-white' : 'text-red-400 hover:text-white hover:bg-red-900/30',
            )}
          >
            <span>🛡</span> Admin
          </Link>
        )}
      </nav>

      {/* Plan + user */}
      <div className="px-3 py-4 border-t border-gray-800 space-y-2">
        {/* Plan badge */}
        <button
          onClick={plan && plan !== 'none' ? openPortal : () => router.push('/planos')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-colors hover:bg-gray-800 ${badge.cls}`}
        >
          <span>{badge.label}</span>
          <span className="opacity-60">{plan && plan !== 'none' ? 'Gerenciar →' : 'Assinar →'}</span>
        </button>

        {/* Email */}
        {userEmail && (
          <p className="px-3 text-xs text-gray-500 truncate">{userEmail}</p>
        )}

        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 w-full transition-colors"
        >
          <span>🚪</span> Sair
        </button>
      </div>
    </aside>
  )
}
