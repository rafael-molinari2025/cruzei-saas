export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { priceId } = await req.json()
  if (!priceId) return NextResponse.json({ error: 'priceId obrigatório' }, { status: 400 })

  const admin = createAdminClient()
  const { data: profile } = await admin.from('profiles').select('stripe_customer_id').eq('id', user.id).single()

  let customerId = profile?.stripe_customer_id as string | undefined

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email!,
      name:  user.user_metadata?.full_name ?? undefined,
      metadata: { supabase_id: user.id },
    })
    customerId = customer.id
    await admin.from('profiles').update({ stripe_customer_id: customer.id }).eq('id', user.id)
  }

  const origin = req.headers.get('origin') ?? 'https://cruzei.primetitec.com.br'

  const session = await stripe.checkout.sessions.create({
    customer:             customerId,
    payment_method_types: ['card'],
    line_items:           [{ price: priceId, quantity: 1 }],
    mode:                 'subscription',
    success_url:          `${origin}/dashboard?plano=ativado`,
    cancel_url:           `${origin}/planos`,
    subscription_data:    { metadata: { supabase_id: user.id } },
  })

  return NextResponse.json({ url: session.url })
}
