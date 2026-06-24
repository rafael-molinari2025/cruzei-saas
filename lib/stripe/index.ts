import Stripe from 'stripe'

// Inicialização lazy — evita erro de build quando STRIPE_SECRET_KEY não está definida
let _stripe: Stripe | undefined

function lazyStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  }
  return _stripe
}

export const stripe = new Proxy({} as Stripe, {
  get(_, prop: string | symbol) {
    return (lazyStripe() as unknown as Record<string | symbol, unknown>)[prop]
  },
})
