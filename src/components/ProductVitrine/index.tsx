import { produtosVendaveis, ofertaAtual, capaDe } from '@/data/catalogo';
import Catalogo, { type ItemVitrine } from './Catalogo';

// Server component: reduz o catálogo ao mínimo que a vitrine precisa,
// para o navegador não receber os textos longos do produtos.json.
export default function ProductVitrine() {
  const candidatos: ItemVitrine[] = [];

  for (const p of produtosVendaveis()) {
    // produtos guarda-chuva do comercial não vão para a vitrine
    if (p.categoria === 'oferta-personalizada') continue;
    const oferta = ofertaAtual(p);
    if (!oferta) continue;

    candidatos.push({
      id: p.id,
      nome: p.nome,
      categoria: p.categoria,
      area: p.area,
      ferramenta: p.ferramenta,
      preco: oferta.preco,
      precoAntigo: oferta.precoAntigo,
      percentualOff: oferta.percentualOff,
      checkout: oferta.checkout,
      viaPaginaDeVendas: oferta.viaPaginaDeVendas,
      capa: capaDe(p),
    });
  }

  // a planilha tem produtos gêmeos (mesmo nome ou mesmo checkout em cadastros
  // Eduzz distintos); na vitrine fica um card por nome e por checkout,
  // priorizando a melhor oferta
  candidatos.sort((a, b) => (b.percentualOff ?? -1) - (a.percentualOff ?? -1));
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
