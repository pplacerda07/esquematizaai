import { capaDe } from '@/data/catalogo';
import { catalogoParaVitrine } from '@/lib/catalogo-ajustes';
import Catalogo, { type ItemVitrine } from './Catalogo';

// ISR: os ajustes feitos no painel (ocultar, destacar, mudar preço) aparecem
// em até 1 minuto, sem precisar de novo deploy.
export const revalidate = 60;

// Server component: reduz o catálogo ao mínimo que a vitrine precisa,
// para o navegador não receber os textos longos do produtos.json.
export default async function ProductVitrine({
  tudoVisivel = false,
  comoH1 = false,
}: {
  tudoVisivel?: boolean;
  comoH1?: boolean;
} = {}) {
  const catalogo = await catalogoParaVitrine();

  const candidatos: ItemVitrine[] = catalogo.map(({ produto, oferta, destaque, ordem, capaDoPainel }) => ({
    id: produto.id,
    nome: produto.nome,
    categoria: produto.categoria,
    area: produto.area,
    ferramenta: produto.ferramenta,
    preco: oferta.preco,
    precoAntigo: oferta.precoAntigo,
    percentualOff: oferta.percentualOff,
    checkout: oferta.checkout,
    viaPaginaDeVendas: oferta.viaPaginaDeVendas,
    // a do painel vem do Supabase; as 92 da planilha continuam no capas.json
    capa: capaDoPainel ?? capaDe(produto),
    destaque,
    ordem,
  }));

  // a planilha tem produtos gêmeos (mesmo nome ou mesmo checkout em cadastros
  // Eduzz distintos); na vitrine fica um card por nome e por checkout,
  // priorizando o que o painel marcou como destaque e depois a melhor oferta
  candidatos.sort((a, b) => {
    // a posição digitada no painel decide antes de tudo, inclusive de qual
    // gêmeo sobrevive à limpeza de duplicados logo abaixo
    if ((a.ordem ?? null) !== (b.ordem ?? null)) {
      if (a.ordem == null) return 1;
      if (b.ordem == null) return -1;
      return a.ordem - b.ordem;
    }
    if (a.destaque !== b.destaque) return a.destaque ? -1 : 1;
    return (b.percentualOff ?? -1) - (a.percentualOff ?? -1);
  });

  const nomesUsados = new Set<string>();
  const checkoutsUsados = new Set<string>();
  const itens: ItemVitrine[] = [];
  for (const item of candidatos) {
    if (nomesUsados.has(item.nome) || checkoutsUsados.has(item.checkout)) continue;
    nomesUsados.add(item.nome);
    checkoutsUsados.add(item.checkout);
    itens.push(item);
  }

  /**
   * Sem Suspense, e isso é o ponto.
   *
   * A fronteira existia porque o Catalogo lia a URL com useSearchParams, o que
   * impedia a pré-renderização. Na prática o fallback era `null`, então o HTML
   * de /vitrine saía com 83 KB e zero produto: nem o Google nem quem abre no
   * celular via nada até o JavaScript chegar.
   *
   * Agora o Catalogo monta com o filtro padrão e lê a URL depois de montado, o
   * que dispensa a fronteira e faz o catálogo sair pronto do servidor.
   */
  return <Catalogo itens={itens} tudoVisivel={tudoVisivel} comoH1={comoH1} />;
}
