import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

type ActiveUser = { id: string; email: string | undefined }
type Profile = { status: string; plan: string }

type Result =
  | { ok: true;  user: ActiveUser; profile: Profile }
  | { ok: false; response: NextResponse }

/**
 * Verifica autenticação E status 'active' do perfil.
 * Retorna user + profile se OK, ou NextResponse de erro 401/403.
 */
export async function requireActiveUser(): Promise<Result> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Não autenticado' }, { status: 401 }),
    }
  }

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('status, plan')
    .eq('id', user.id)
    .single()

  if (!profile || profile.status !== 'active') {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Conta suspensa ou pendente de ativação.' },
        { status: 403 }
      ),
    }
  }

  return {
    ok:      true,
    user:    { id: user.id, email: user.email },
    profile: { status: profile.status, plan: profile.plan },
  }
}
