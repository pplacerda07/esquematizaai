import { listarPostsAdmin } from '@/lib/blog-admin';
import { produtosVendaveis } from '@/data/catalogo';
import Gerenciador from './Gerenciador';

// Painel do blog: sempre dinâmico (mostra rascunhos e reflete edições na hora).
export const dynamic = 'force-dynamic';

export default async function BlogAdminPage() {
  const posts = await listarPostsAdmin();

  /**
   * Lista para o campo "produto em destaque" do post.
   *
   * Só o que está à venda, e só id e nome: o catálogo inteiro traria os textos
   * longos de cada produto para o navegador sem necessidade. Ordenado por nome
   * porque quem procura ali procura pelo nome, não pelo código.
   */
  const produtos = produtosVendaveis()
    .filter((p) => p.categoria !== 'oferta-personalizada')
    .map((p) => ({ id: p.id, nome: p.nome }))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

  return <Gerenciador postsIniciais={posts} produtos={produtos} />;
}
