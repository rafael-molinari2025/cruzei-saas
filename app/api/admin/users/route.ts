import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const admin = createAdminClient()
  const { data: myProfile } = await admin.from('profiles').select('role').eq('id', user.id).single()
  if (myProfile?.role !== 'admin') return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

  const { data: { users }, error } = await admin.auth.admin.listUsers({ perPage: 500 })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: profiles } = await admin.from('profiles').select('*')
  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]))

  const { data: recStats } = await admin
    .from('reconciliations')
    .select('user_id')

  const recCount: Record<string, number> = {}
  for (const r of recStats ?? []) {
    recCount[r.user_id] = (recCount[r.user_id] ?? 0) + 1
  }

  const result = users.map(u => ({
    id:            u.id,
    email:         u.email,
    created_at:    u.created_at,
    last_sign_in:  u.last_sign_in_at,
    ...profileMap[u.id],
    reconciliations: recCount[u.id] ?? 0,
  }))

  return NextResponse.json(result)
}
