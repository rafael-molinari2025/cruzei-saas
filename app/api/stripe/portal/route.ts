export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireActiveUser } from '@/lib/supabase/require-active'

export async function POST() {
  const result = await requireActiveUser()
  if (!result.ok) return result.response

  const { user } = result
  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (!profile?.stripe_customer_id) {
    return NextResponse.json({ error: 'Sem assinatura ativa' }, { status: 400 })
  }

  const origin = 'https://cruzei.primetitec.com.br'

  const session = await stripe.billingPortal.sessions.create({
    customer:   profile.stripe_customer_id as string,
    return_url: `${origin}/dashboard`,
  })

  return NextResponse.json({ url: session.url })
}
