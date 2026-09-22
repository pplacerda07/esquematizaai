import { criarSupabaseServer } from '@/lib/supabase/server';
import { exigirAdmin } from '@/lib/supabase/admin-guard';
import Gerenciador, { type Acesso } from './Gerenciador';

export const dynamic = 'force-dynamic';

/**
 * A lista de quem entra no painel.
 *
 * Só dono abre. O proxy já barra antes de chegar aqui, e a pergunta é feita de
 * novo porque proxy é conveniência: quem chamar a rota por fora não passa por
 * ele. A lista em si vem de lista_de_acessos(), que também confere.
 */
export default async function AcessosPage({
  searchParams,
}: {
  searchParams: Promise<{ novo?: string }>;
}) {
  // o botão de + da moldura chega aqui com ?novo=1 e já abre o formulário, do
  // mesmo jeito que as outras telas do painel
  const { novo } = await searchParams;
  const guarda = await exigirAdmin('dono');

  const supabase = await criarSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!guarda.ok) {
    return (
      <div style={{ maxWidth: '640px' }}>
        <h1>Quem entra no painel</h1>
        <p>{guarda.erro}</p>
      </div>
    );
  }

  const { data } = await supabase.rpc('lista_de_acessos');

  const acessos: Acesso[] = (data ?? []).map(
    (a: {
      user_id: string;
      email: string;
      funcoes: string[] | null;
      criado_em: string;
      ultimo_acesso: string | null;
    }) => ({
      userId: a.user_id,
      email: a.email,
      funcoes: (a.funcoes ?? []) as Acesso['funcoes'],
      criadoEm: a.criado_em,
      ultimoAcesso: a.ultimo_acesso,
    }),
  );

  return <Gerenciador acessos={acessos} meuUserId={user?.id ?? ''} abrirNovo={novo === '1'} />;
}
