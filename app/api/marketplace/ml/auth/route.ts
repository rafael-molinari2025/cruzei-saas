export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

export async function GET() {
  const appId      = process.env.ML_APP_ID
  const redirectUri = process.env.ML_REDIRECT_URI

  if (!appId || !redirectUri) {
    return NextResponse.json(
      { error: 'Integração com Mercado Livre não configurada. Adicione ML_APP_ID e ML_REDIRECT_URI nas variáveis de ambiente.' },
      { status: 503 }
    )
  }

  const mlAuthUrl = new URL('https://auth.mercadolivre.com.br/authorization')
  mlAuthUrl.searchParams.set('response_type', 'code')
  mlAuthUrl.searchParams.set('client_id', appId)
  mlAuthUrl.searchParams.set('redirect_uri', redirectUri)

  return NextResponse.redirect(mlAuthUrl.toString())
}
