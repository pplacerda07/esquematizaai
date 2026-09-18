import { criarSupabaseServer } from '@/lib/supabase/server';
import { funcoesDeQuemEstaLogado } from '@/lib/supabase/admin-guard';
import Moldura from './Moldura';

/**
 * A moldura do painel precisa saber quem entrou para montar o menu.
 *
 * Por isso o layout virou componente de servidor e a parte com clique mudou
 * para Moldura.tsx. Quem lê os papéis é o banco, não o navegador: se o menu
 * decidisse sozinho, bastaria abrir o console para fazer aparecer a aba que
 * não é da pessoa. Ela ainda bateria na política do banco, mas veria uma tela
 * que não é dela.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await criarSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const funcoes = user ? await funcoesDeQuemEstaLogado() : [];

  return (
    <Moldura funcoes={funcoes} email={user?.email ?? null}>
      {children}
    </Moldura>
  );
}
