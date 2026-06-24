import { createClient } from '@supabase/supabase-js'

// Usa a service role key — NUNCA expor ao cliente. Apenas em API routes server-side.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
