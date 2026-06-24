export const dynamic = 'force-dynamic'

import AuthForm from '@/components/auth/auth-form'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Entrar' }

export default function EntrarPage() {
  return <AuthForm mode="login" />
}
