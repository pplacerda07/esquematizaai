import { createBrowserClient } from '@supabase/ssr';

/** Cliente Supabase para componentes client (ex.: formulário de login do admin). */
export function criarSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
