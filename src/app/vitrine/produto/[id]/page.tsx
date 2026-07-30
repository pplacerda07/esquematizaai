import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { produtos, produtoPor, ofertaAtual, formatarPreco, capaDe, amostraDe, type Produto } from '@/data/catalogo';
import { rotuloDeFerramenta, SLUG_DA_AREA } from '@/data/catalogo/rotulos';
import styles from './styles.module.css';

// Uma página por produto vendável (mesmo critério da vitrine da home):
// precisa ter par consistente de preço + checkout.
function publicaveis(): Produto[] {
  return produtos.filter((p) => {
    if (p.categoria === 'oferta-personalizada') return false;
    if (p.status === 'inativo') return false;
    return ofertaAtual(p) !== null;
  });
}

export function generateStaticParams() {
  return publicaveis().map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const produto = produtoPor(id);
  if (!produto) return { title: 'Produto não encontrado' };
  const descricao = produto.sobre
    ? produto.sobre.replace(/\s+/g, ' ').trim().slice(0, 155)
    : `${produto.nome}: material do Esquematiza Aí para concursos públicos.`;
  return {
    title: `${produto.nome} | Esquematiza Aí`,
    description: descricao,
  };
}

export default async function ProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const produto = produtoPor(id);
  const oferta = produto ? ofertaAtual(produto) : null;

  if (!produto || !oferta || produto.status === 'inativo' || produto.categoria === 'oferta-personalizada') {
    notFound();
  }

  const areaSlug = produto.area ? SLUG_DA_AREA[produto.area] : null;
  const linkArea = areaSlug ? `/vitrine/${areaSlug}` : '/vitrine';
  const capa = capaDe(produto);
  const amostra = amostraDe(produto);

  const cardCompra = (
    <div className={styles.buyCard}>
      {capa && (
        <Image
          src={capa.src}
          alt={`Capa de ${produto.nome}`}
          width={capa.width}
          height={capa.height}
          priority
          className={styles.buyCapa}
        />
      )}
      {oferta.percentualOff !== null && (
        <span className={styles.offPill}>-{oferta.percentualOff}% de desconto</span>
      )}
      <div className={styles.priceBlock}>
        {oferta.precoAntigo !== null && (
          <span className={styles.oldPrice}>de {formatarPreco(oferta.precoAntigo)}</span>
        )}
        <span className={styles.currentPrice}>{formatarPreco(oferta.preco)}</span>
      </div>
      <a
        className={styles.btnBuy}
        href={oferta.checkout}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${oferta.viaPaginaDeVendas ? 'Ver na loja' : 'Comprar'} ${produto.nome} por ${formatarPreco(oferta.preco)}`}
      >
        {oferta.viaPaginaDeVendas ? 'Ver na loja →' : 'Comprar agora →'}
      </a>

      {/* Amostra grátis: só aparece em quem tem arquivo mapeado. Sem `target`,
          com `download`: o PDF baixa direto em vez de abrir num leitor do
          navegador, que no celular costuma ser ruim. */}
      {amostra && (
        <a className={styles.btnAmostra} href={amostra.src} download>
          Ver amostra grátis
          <span className={styles.amostraPeso}>PDF · {amostra.kb > 1024 ? `${(amostra.kb / 1024).toFixed(1)} MB` : `${amostra.kb} KB`}</span>
        </a>
      )}

      <p className={styles.buyNote}>
        {oferta.viaPaginaDeVendas
          ? 'A compra é finalizada na página do produto.'
          : 'Pagamento processado pela Eduzz.'}
      </p>
    </div>
  );

  return (
    <main className={styles.main}>
      <Navbar />

      <div className={styles.page}>
        <nav className={styles.breadcrumb} aria-label="Você está em">
          <Link href="/">Início</Link>
          <span aria-hidden="true">/</span>
          <Link href="/vitrine">Vitrine</Link>
          {produto.area && (
            <>
              <span aria-hidden="true">/</span>
              <Link href={linkArea}>{produto.area}</Link>
            </>
          )}
        </nav>

        <header className={styles.header}>
          <div className={styles.badges}>
            <span className={styles.badge}>{rotuloDeFerramenta(produto.ferramenta, produto.categoria)}</span>
            {produto.area && <span className={styles.badgeArea}>Área {produto.area}</span>}
            {produto.formato && <span className={styles.badgeFormato}>{produto.formato}</span>}
          </div>
          <h1 className={styles.title}>{produto.nome}</h1>
          {produto.observacao && <p className={styles.observacao}>{produto.observacao}</p>}
        </header>

        <div className={styles.layout}>
          <article className={styles.content}>
            {produto.sobre && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  Sobre o <span className={styles.sectionAccent}>material</span>
                </h2>
                <div className={styles.longText}>{produto.sobre}</div>
              </section>
            )}

            {produto.disciplinas && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  O que vem <span className={styles.sectionAccent}>dentro</span>
                </h2>
                <div className={styles.longText}>{produto.disciplinas}</div>
              </section>
            )}

            {produto.cronograma && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  Cronograma de <span className={styles.sectionAccent}>entrega</span>
                </h2>
                <div className={styles.longText}>{produto.cronograma}</div>
              </section>
            )}

            {!produto.sobre && !produto.disciplinas && !produto.cronograma && (
              <section className={styles.section}>
                <p className={styles.longText}>
                  A descrição completa deste material está sendo preparada. Qualquer dúvida,
                  fale com a gente pelo WhatsApp antes de comprar.
                </p>
              </section>
            )}
          </article>

          <aside className={styles.sidebar}>{cardCompra}</aside>
        </div>

        <div className={styles.backRow}>
          <Link href={linkArea} className={styles.backLink}>
            ← Ver mais materiais {produto.area ? `da área ${produto.area}` : 'na vitrine'}
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
