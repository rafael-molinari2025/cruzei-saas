import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/entrar')

  const admin = createAdminClient()
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const nav = [
    { href: '/admin',           label: 'Visão geral',  icon: '📊' },
    { href: '/admin/usuarios',  label: 'Usuários',     icon: '👥' },
  ]

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 bg-gray-900 min-h-screen flex flex-col">
        <div className="px-5 py-5 border-b border-gray-800">
          <span className="text-lg font-extrabold text-white tracking-tight">✕ Cruzei</span>
          <span className="ml-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">ADMIN</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map(item => (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-gray-800 mt-4">
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
              <span>↩</span> Voltar ao app
            </Link>
          </div>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  )
}
