import { criarSupabaseServer } from './server';

/**
 * Confere se quem está chamando é administrador.
 *
 * POR QUE ESTAR LOGADO NÃO BASTA:
 * o cadastro do Supabase aceita qualquer pessoa, e a chave anônima vai no HTML
 * de todas as páginas do site. Então "ter sessão" é algo que qualquer um na
 * internet consegue em dois minutos. Administrador é quem está na tabela
 * `administradores`, e quem decide isso é o banco, pela função eh_admin().
 *
 * A checagem de verdade mora nas políticas do banco: mesmo que alguém chame uma
 * Server Action direto, sem passar pelo painel, o banco recusa a escrita. Esta
 * função existe para dar uma resposta clara em vez de um erro cru do Postgres,
 * e para o painel não abrir para quem não vai conseguir fazer nada nele.
 */
export async function exigirAdmin(): Promise<
  { ok: true; email: string | null } | { ok: false; erro: string }
> {
  const supabase = await criarSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, erro: 'Sessão expirada. Faça login de novo.' };

  const { data: ehAdmin, error } = await supabase.rpc('eh_admin');

  if (error) return { ok: false, erro: 'Não foi possível confirmar sua permissão. Tente de novo.' };
  if (!ehAdmin) return { ok: false, erro: 'Sua conta não tem permissão para alterar o site.' };

  // devolvido para registrar quem alterou o quê (coluna atualizado_por)
  return { ok: true, email: user.email ?? null };
}
