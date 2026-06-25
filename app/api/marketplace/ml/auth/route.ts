export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { origin } = new URL(request.url)
  const appId       = process.env.ML_APP_ID
  const redirectUri = process.env.ML_REDIRECT_URI

  if (!appId || !redirectUri) {
    return NextResponse.redirect(`${origin}/dashboard/conexoes?error=ml_not_configured`)
  }

  const mlAuthUrl = new URL('https://auth.mercadolivre.com.br/authorization')
  mlAuthUrl.searchParams.set('response_type', 'code')
  mlAuthUrl.searchParams.set('client_id', appId)
  mlAuthUrl.searchParams.set('redirect_uri', redirectUri)

  return NextResponse.redirect(mlAuthUrl.toString())
}
