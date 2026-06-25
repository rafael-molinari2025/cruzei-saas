export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { requireActiveUser } from '@/lib/supabase/require-active'

function base64url(buf: Buffer) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export async function GET(request: Request) {
  const { origin } = new URL(request.url)

  const result = await requireActiveUser()
  if (!result.ok) return result.response
  if (result.profile.plan !== 'pro') {
    return NextResponse.redirect(`${origin}/dashboard/conexoes?error=plan_required`)
  }

  const clientId   = process.env.ETSY_CLIENT_ID
  const redirectUri = process.env.ETSY_REDIRECT_URI

  if (!clientId || !redirectUri) {
    return NextResponse.redirect(`${origin}/dashboard/conexoes?error=etsy_not_configured`)
  }

  // PKCE — Etsy v3 exige code_challenge S256
  const codeVerifier  = base64url(crypto.randomBytes(32))
  const codeChallenge = base64url(crypto.createHash('sha256').update(codeVerifier).digest())
  const state         = crypto.randomBytes(16).toString('hex')

  const authUrl = new URL('https://www.etsy.com/oauth/connect')
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('scope', 'transactions_r shops_r')
  authUrl.searchParams.set('client_id', clientId)
  authUrl.searchParams.set('state', state)
  authUrl.searchParams.set('code_challenge', codeChallenge)
  authUrl.searchParams.set('code_challenge_method', 'S256')

  const response = NextResponse.redirect(authUrl.toString())
  response.cookies.set('etsy_cv', codeVerifier, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 600, path: '/' })
  response.cookies.set('etsy_st', state,        { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 600, path: '/' })
  return response
}
