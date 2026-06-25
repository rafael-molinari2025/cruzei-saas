export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const { origin } = new URL(request.url)

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(`${origin}/auth/entrar`)

  const admin = createAdminClient()
  await admin
    .from('marketplace_connections')
    .delete()
    .eq('user_id', user.id)
    .eq('marketplace', 'etsy')

  return NextResponse.redirect(`${origin}/dashboard/conexoes?success=etsy_disconnected`)
}
