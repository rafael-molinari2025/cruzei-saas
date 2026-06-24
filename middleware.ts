import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(toSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          toSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as Parameters<typeof supabaseResponse.cookies.set>[2]))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  const isAuthPage      = pathname.startsWith('/auth')
  const isDashboard     = pathname.startsWith('/dashboard')
  const isBloqueado     = pathname === '/dashboard/bloqueado'
  const isAdmin         = pathname.startsWith('/admin')
  const isPlanos        = pathname.startsWith('/planos')

  // Redireciona não autenticados
  if ((isDashboard || isAdmin) && !user) {
    return NextResponse.redirect(new URL('/auth/entrar', request.url))
  }

  // Redireciona autenticados fora das páginas de auth
  if (isAuthPage && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Gate de acesso: verifica status do perfil para rotas de dashboard (exceto /bloqueado)
  if (isDashboard && !isBloqueado && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('status, role')
      .eq('id', user.id)
      .single()

    const status = profile?.status ?? 'pending'

    if (status === 'pending' || status === 'suspended') {
      return NextResponse.redirect(new URL('/dashboard/bloqueado', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
