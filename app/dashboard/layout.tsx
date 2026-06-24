import Sidebar from '@/components/layout/sidebar'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/entrar')

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('role, plan')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex min-h-screen">
      <Sidebar
        role={profile?.role ?? 'user'}
        plan={profile?.plan ?? 'none'}
        userEmail={user.email}
      />
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
