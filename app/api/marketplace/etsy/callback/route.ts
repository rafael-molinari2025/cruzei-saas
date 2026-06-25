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
    return NextResponse.redirect(`${origin}/dashboard/conexoes?error=etsy_auth`)
  }

  const cookieStore  = cookies()
  const codeVerifier = cookieStore.get('etsy_cv')?.value
  const savedState   = cookieStore.get('etsy_st')?.value

  if (!codeVerifier || state !== savedState) {
    return NextResponse.redirect(`${origin}/dashboard/conexoes?error=etsy_auth`)
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(`${origin}/auth/entrar`)

  const clientId   = process.env.ETSY_CLIENT_ID!
  const redirectUri = process.env.ETSY_REDIRECT_URI!

  // Troca code por tokens
  const tokenRes = await fetch('https://api.etsy.com/v3/public/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:    'authorization_code',
      client_id:     clientId,
      redirect_uri:  redirectUri,
      code,
      code_verifier: codeVerifier,
    }),
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${origin}/dashboard/conexoes?error=etsy_token`)
  }

  const tokens = await tokenRes.json()

  // Busca dados do usuário Etsy
  const meRes = await fetch('https://openapi.etsy.com/v3/application/users/me', {
    headers: { 'x-api-key': clientId, Authorization: `Bearer ${tokens.access_token}` },
  })
  const me = meRes.ok ? await meRes.json() : {}

  // Busca nome da loja
  let shopName = ''
  if (me.user_id) {
    const shopRes = await fetch(
      `https://openapi.etsy.com/v3/application/users/${me.user_id}/shops`,
      { headers: { 'x-api-key': clientId, Authorization: `Bearer ${tokens.access_token}` } }
    )
    if (shopRes.ok) {
      const shopData = await shopRes.json()
      shopName = shopData.shop_name ?? ''
    }
  }

  const admin = createAdminClient()
  await admin.from('marketplace_connections').upsert({
    user_id:          user.id,
    marketplace:      'etsy',
    access_token:     tokens.access_token,
    refresh_token:    tokens.refresh_token ?? null,
    token_expires_at: new Date(Date.now() + (tokens.expires_in ?? 3600) * 1000).toISOString(),
    seller_id:        String(me.user_id ?? ''),
    seller_name:      shopName || me.login || me.primary_email || '',
    connected_at:     new Date().toISOString(),
  }, { onConflict: 'user_id,marketplace' })

  const response = NextResponse.redirect(`${origin}/dashboard/conexoes?success=etsy`)
  response.cookies.delete('etsy_cv')
  response.cookies.delete('etsy_st')
  return response
}
