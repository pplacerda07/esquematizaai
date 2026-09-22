import { redirect } from 'next/navigation';
import { funcoesDeQuemEstaLogado, type Funcao } from '@/lib/supabase/admin-guard';

export const dynamic = 'force-dynamic';

/**
 * A porta do painel manda cada um para a primeira tela que ele pode abrir.
 *
 * ANTES ERA UM `redirect('/admin/materiais')` FIXO, E ISSO VIRAVA UM LAÇO.
 * Quem tivesse só o papel de blog caía em /admin/materiais, o proxy recusava e
 * devolvia para /admin, que mandava de novo para /admin/materiais. O navegador
 * roda isso até desistir e mostrar erro.
 *
 * Não acontecia porque todo mundo tinha o papel de produtos por acaso. Com a
 * tela de acessos, criar alguém só de blog passou a ser um clique, então o laço
 * deixou de ser hipótese.
 */
const PRIMEIRA_TELA: { funcao: Funcao; destino: string }[] = [
  { funcao: 'produtos', destino: '/admin/materiais' },
  { funcao: 'blog', destino: '/admin/blog' },
  { funcao: 'dono', destino: '/admin/acessos' },
];

export default async function AdminRoot() {
  const funcoes = await funcoesDeQuemEstaLogado();
  const porta = PRIMEIRA_TELA.find((p) => funcoes.includes(p.funcao));

  // sem papel nenhum não há tela para abrir, e o login explica o que houve
  redirect(porta?.destino ?? '/admin/login?erro=sem-permissao');
}
