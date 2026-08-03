import { listarNoticiasAdmin } from '@/lib/blog-admin';
import Gerenciador from './Gerenciador';

// Painel de notícias: sempre dinâmico (mostra rascunhos e reflete edições na hora).
export const dynamic = 'force-dynamic';

export default async function NoticiasAdminPage() {
  const noticias = await listarNoticiasAdmin();
  return <Gerenciador noticiasIniciais={noticias} />;
}
