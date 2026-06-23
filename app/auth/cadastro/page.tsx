import AuthForm from '@/components/auth/auth-form'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Criar conta' }

export default function CadastroPage() {
  return <AuthForm mode="signup" />
}
