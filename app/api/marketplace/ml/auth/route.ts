export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { requireActiveUser } from '@/lib/supabase/require-active'

export async function GET(request: Request) {
  const { origin } = new URL(request.url)

  const result = await requireActiveUser()
  if (!result.ok) return result.response
  if (result.profile.plan !== 'pro') {
    return NextResponse.redirect(`${origin}/dashboard/conexoes?error=plan_required`)
  }

  const appId       = process.env.ML_APP_ID
  const redirectUri = process.env.ML_REDIRECT_URI

  if (!appId || !redirectUri) {
    return NextResponse.redirect(`${origin}/dashboard/conexoes?error=ml_not_configured`)
  }

  // CSRF protection: state nonce armazenado em cookie httpOnly
  const state = crypto.randomBytes(16).toString('hex')

  const mlAuthUrl = new URL('https://auth.mercadolivre.com.br/authorization')
  mlAuthUrl.searchParams.set('response_type', 'code')
  mlAuthUrl.searchParams.set('client_id', appId)
  mlAuthUrl.searchParams.set('redirect_uri', redirectUri)
  mlAuthUrl.searchParams.set('state', state)

  const response = NextResponse.redirect(mlAuthUrl.toString())
  response.cookies.set('ml_oauth_state', state, {
    httpOnly: true,
    secure:   true,
    sameSite: 'lax',
    maxAge:   600,
    path:     '/',
  })
  return response
}
