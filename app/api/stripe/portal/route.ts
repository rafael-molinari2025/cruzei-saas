export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const admin = createAdminClient()
  const { data: profile } = await admin.from('profiles').select('stripe_customer_id').eq('id', user.id).single()

  if (!profile?.stripe_customer_id) {
    return NextResponse.json({ error: 'Sem assinatura ativa' }, { status: 400 })
  }

  const origin = req.headers.get('origin') ?? 'https://cruzei.primetitec.com.br'

  const session = await stripe.billingPortal.sessions.create({
    customer:   profile.stripe_customer_id as string,
    return_url: `${origin}/dashboard`,
  })

  return NextResponse.json({ url: session.url })
}
