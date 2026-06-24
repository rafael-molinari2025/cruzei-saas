import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import Stripe from 'stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return NextResponse.json({ error: 'Webhook inválido' }, { status: 400 })
  }

  const admin = createAdminClient()

  async function upsertSubscription(sub: Stripe.Subscription) {
    const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id
    const customer   = await stripe.customers.retrieve(customerId) as Stripe.Customer
    const userId     = customer.metadata?.supabase_id
    if (!userId) return

    const item     = sub.items.data[0]
    const plan     = item?.price?.lookup_key ?? item?.price?.metadata?.plan ?? 'starter'
    const isActive = sub.status === 'active' || sub.status === 'trialing'

    await admin.from('profiles').update({
      stripe_subscription_id: sub.id,
      subscription_status:    sub.status,
      plan:                   isActive ? plan : 'none',
      status:                 isActive ? 'active' : 'pending',
      plan_expires_at:        sub.items?.data?.[0]?.current_period_end
        ? new Date((sub.items.data[0].current_period_end as number) * 1000).toISOString()
        : null,
      updated_at:             new Date().toISOString(),
    }).eq('id', userId)
  }

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await upsertSubscription(event.data.object as Stripe.Subscription)
      break

    case 'customer.subscription.deleted': {
      const sub        = event.data.object as Stripe.Subscription
      const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id
      const customer   = await stripe.customers.retrieve(customerId) as Stripe.Customer
      const userId     = customer.metadata?.supabase_id
      if (userId) {
        await admin.from('profiles').update({
          subscription_status: 'canceled',
          plan:                'none',
          status:              'pending',
          updated_at:          new Date().toISOString(),
        }).eq('id', userId)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
