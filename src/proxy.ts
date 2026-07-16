import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Proxy (o antigo "middleware" do Next < 16). Faz duas coisas:
 *  1. Mantém a sessão do Supabase fresca, sincronizando os cookies a cada request.
 *  2. Protege /admin: sem usuário logado, redireciona para /admin/login.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANTE: getUser() valida o token no servidor (getSession() apenas lê o cookie).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const ehAreaAdmin = pathname.startsWith('/admin');
  const ehLogin = pathname === '/admin/login';

  // Sem login tentando entrar no admin (menos a própria tela de login) -> manda pro login.
  if (ehAreaAdmin && !ehLogin && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }

  // Já logado tentando abrir o login -> manda pro painel.
  if (ehLogin && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
