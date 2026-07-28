import { produtoPor, ofertaAtual, formatarPreco } from '@/data/catalogo';
import styles from './conteudo.module.css';

/**
 * Card de oferta dentro do artigo (`::produto{id=...}`).
 *
 * O preço e o link vêm do catálogo, não do texto: quando a planilha muda, o artigo
 * muda junto. Escrever "R$ 1.094" na mão dentro da matéria era garantia de o blog
 * anunciar um preço que a loja não cobra mais.
 *
 * Se o id não existir ou o produto ficar sem oferta, o bloco simplesmente não
 * aparece, em vez de renderizar um card quebrado no meio da leitura.
 */
export default function CtaProduto({ id, chamada }: { id: string; chamada?: string }) {
  const produto = produtoPor(id);
  const oferta = produto ? ofertaAtual(produto) : null;
  if (!produto || !oferta) return null;

  return (
    <aside className={styles.ctaProduto}>
      <p className={styles.ctaEtiqueta}>{chamada ?? 'Material recomendado'}</p>
      <h3 className={styles.ctaTitulo}>{produto.nome}</h3>

      {produto.sobre && <p className={styles.ctaTexto}>{primeiraFrase(produto.sobre)}</p>}

      <div className={styles.ctaPreco}>
        {oferta.precoAntigo !== null && (
          <span className={styles.ctaPrecoAntigo}>de {formatarPreco(oferta.precoAntigo)}</span>
        )}
        <strong className={styles.ctaValor}>{formatarPreco(oferta.preco)}</strong>
      </div>

      <a
        className={styles.ctaBotao}
        href={oferta.checkout}
        target="_blank"
        rel="noopener noreferrer"
      >
        {oferta.viaPaginaDeVendas ? 'Ver na loja →' : 'Quero esse material →'}
      </a>
    </aside>
  );
}

/** Primeiras frases da descrição do catálogo, para o card não virar um paredão. */
function primeiraFrase(texto: string, limite = 240): string {
  const limpo = texto.replace(/\s+/g, ' ').trim();
  if (limpo.length <= limite) return limpo;
  const corte = limpo.slice(0, limite);
  const fim = corte.lastIndexOf('. ');
  return fim > 80 ? corte.slice(0, fim + 1) : corte.trimEnd() + '…';
}
