import { listarPostsAdmin } from '@/lib/blog-admin';
import Gerenciador from './Gerenciador';

// Painel do blog: sempre dinâmico (mostra rascunhos e reflete edições na hora).
export const dynamic = 'force-dynamic';

export default async function BlogAdminPage() {
  const posts = await listarPostsAdmin();
  return <Gerenciador postsIniciais={posts} />;
}
