import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Cliente Supabase para Server Components / Server Actions, ligado aos cookies da
 * sessão (auth). Use este no /admin e onde precisar saber quem está logado.
 * No Next 16 `cookies()` é async.
 */
export async function criarSupabaseServer() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // chamado de um Server Component: o refresh de sessão fica a cargo do proxy.
          }
        },
      },
    },
  );
}
