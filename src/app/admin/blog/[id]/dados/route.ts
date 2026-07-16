import { NextResponse } from 'next/server';
import { getPostAdmin } from '@/lib/blog-admin';

// Entrega o post completo (com conteúdo) para preencher o formulário de edição.
// Fica sob /admin, então o proxy exige sessão autenticada.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const post = await getPostAdmin(id);
  if (!post) return NextResponse.json({ erro: 'Post não encontrado' }, { status: 404 });
  return NextResponse.json(post);
}
