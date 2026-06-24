export interface Plan {
  id: 'starter' | 'pro'
  name: string
  description: string
  price: string
  priceId: string
  features: string[]
  highlight?: boolean
}

export const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Para vendedores individuais',
    price: 'R$ 49/mês',
    priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID ?? '',
    features: [
      '1 marketplace conectado',
      'Conciliações ilimitadas',
      'Histórico completo',
      'Exportação CSV',
      'Suporte por e-mail',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Para quem vende em múltiplos canais',
    price: 'R$ 99/mês',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID ?? '',
    highlight: true,
    features: [
      'Todos os marketplaces',
      'Conciliações ilimitadas',
      'Importação automática via API',
      'Dashboard de tendências',
      'Exportação CSV',
      'Suporte prioritário',
    ],
  },
]
