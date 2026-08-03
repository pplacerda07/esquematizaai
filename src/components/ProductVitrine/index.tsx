import { capaDe } from '@/data/catalogo';
import { catalogoParaVitrine } from '@/lib/catalogo-ajustes';
import Catalogo, { type ItemVitrine } from './Catalogo';

// ISR: os ajustes feitos no painel (ocultar, destacar, mudar preço) aparecem
// em até 1 minuto, sem precisar de novo deploy.
export const revalidate = 60;

// Server component: reduz o catálogo ao mínimo que a vitrine precisa,
// para o navegador não receber os textos longos do produtos.json.
export default async function ProductVitrine() {
  const catalogo = await catalogoParaVitrine();

  const candidatos: ItemVitrine[] = catalogo.map(({ produto, oferta, destaque }) => ({
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
    capa: capaDe(produto),
    destaque,
  }));

  // a planilha tem produtos gêmeos (mesmo nome ou mesmo checkout em cadastros
  // Eduzz distintos); na vitrine fica um card por nome e por checkout,
  // priorizando o que o painel marcou como destaque e depois a melhor oferta
  candidatos.sort((a, b) => {
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

  return <Catalogo itens={itens} />;
}
