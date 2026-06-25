export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code  = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(`${origin}/dashboard/conexoes?error=ml_auth`)
  }

  // Validação CSRF: compara state com o cookie gerado no auth
  const cookieStore  = cookies()
  const savedState   = cookieStore.get('ml_oauth_state')?.value
  if (!savedState || state !== savedState) {
    return NextResponse.redirect(`${origin}/dashboard/conexoes?error=ml_auth`)
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(`${origin}/auth/entrar`)

  // Troca o code por access_token + refresh_token
  const tokenRes = await fetch('https://api.mercadolibre.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:    'authorization_code',
      client_id:     process.env.ML_APP_ID!,
      client_secret: process.env.ML_CLIENT_SECRET!,
      code,
      redirect_uri:  process.env.ML_REDIRECT_URI!,
    }),
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${origin}/dashboard/conexoes?error=ml_token`)
  }

  const tokens = await tokenRes.json()

  // Busca dados do vendedor
  const meRes = await fetch('https://api.mercadolibre.com/users/me', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })
  const me = meRes.ok ? await meRes.json() : {}

  const admin = createAdminClient()
  await admin.from('marketplace_connections').upsert({
    user_id:          user.id,
    marketplace:      'ml',
    access_token:     tokens.access_token,
    refresh_token:    tokens.refresh_token,
    token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    seller_id:        String(me.id ?? ''),
    seller_name:      me.nickname ?? me.email ?? '',
    connected_at:     new Date().toISOString(),
  }, { onConflict: 'user_id,marketplace' })

  const response = NextResponse.redirect(`${origin}/dashboard/conexoes?success=ml`)
  response.cookies.delete('ml_oauth_state')
  return response
}
