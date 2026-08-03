import { criarSupabaseServer } from '@/lib/supabase/server';
import { produtos, ofertaAtual } from '@/data/catalogo';
import Gerenciador, { type ItemAdmin } from './Gerenciador';

// Sempre dinâmico: reflete os ajustes na hora em que são salvos.
export const dynamic = 'force-dynamic';

export default async function MateriaisAdminPage() {
  const supabase = await criarSupabaseServer();
  const { data: ajustes } = await supabase.from('produtos_ajustes').select('*');

  const porId = new Map((ajustes ?? []).map((a) => [a.produto_id as string, a]));

  // Junta a planilha (base) com os ajustes do painel. Os dois valores aparecem
  // lado a lado, para ninguém editar achando que está mexendo na planilha.
  const itens: ItemAdmin[] = produtos.map((p) => {
    const ajuste = porId.get(p.id);
    const oferta = ofertaAtual(p);

    return {
      id: p.id,
      nome: p.nome,
      categoria: p.categoria,
      area: p.area,
      ferramenta: p.ferramenta,
      precoPlanilha: p.precos.cheio,
      precoAjustado: ajuste?.preco != null ? Number(ajuste.preco) : null,
      temCheckout: Boolean(p.checkouts.normal || p.checkouts.black),
      vendavel: oferta !== null,
      descricaoAjustada: (ajuste?.descricao as string | null) ?? null,
      observacao: (ajuste?.observacao as string | null) ?? null,
      oculto: Boolean(ajuste?.oculto),
      destaque: Boolean(ajuste?.destaque),
      ajustadoEm: (ajuste?.atualizado_em as string | null) ?? null,
    };
  });

  return <Gerenciador itens={itens} />;
}
