import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Conteudo from '@/components/Artigo/Conteudo';
import SelosTicker from '@/components/SelosTicker';
import BarraCompra from '@/components/BarraCompra';
import FaqProduto from '@/components/FaqProduto';
import AutoridadeCientifica from '@/components/AutoridadeCientifica';
import { produtos, produtoPor, ofertaAtual, formatarPreco, capaDe, amostraDe, conteudoDe, selosDe, type Produto } from '@/data/catalogo';
import { rotuloDeFerramenta, SLUG_DA_AREA } from '@/data/catalogo/rotulos';
import { SITE_URL } from '@/config';
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
  const conteudo = conteudoDe(produto);
  const sobre = conteudo.sobre ?? null;
  const selos = selosDe(produto);

  const cardCompra = (
    <div className={styles.buyCard} id="card-compra">
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

      {/* letreiro com o que está incluído; os selos saem do texto do próprio
          produto, então nenhum deles promete algo que aquele item não tem */}
      <SelosTicker selos={selos} />
    </div>
  );

  // Product + FAQPage para o Google: o primeiro dá direito ao selo de preço e
  // disponibilidade na busca, o segundo faz as dúvidas aparecerem expandidas
  // no resultado. Tudo já está na tela; aqui só está em formato de máquina.
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: produto.nome,
      description: (produto.sobre ?? '').replace(/\s+/g, ' ').trim().slice(0, 500) || undefined,
      category: produto.area ?? undefined,
      ...(capa ? { image: `${SITE_URL}${capa.src}` } : {}),
      brand: { '@type': 'Brand', name: 'Esquematiza Aí' },
      offers: {
        '@type': 'Offer',
        price: oferta.preco,
        priceCurrency: 'BRL',
        availability: 'https://schema.org/InStock',
        url: `${SITE_URL}/vitrine/produto/${produto.id}`,
      },
    },
    ...(conteudo.faq?.length
      ? [{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: conteudo.faq.map((q) => ({
            '@type': 'Question',
            name: q.pergunta,
            acceptedAnswer: {
              '@type': 'Answer',
              text: q.resposta.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim(),
            },
          })),
        }]
      : []),
  ];

  return (
    <main className={styles.main}>
      <Navbar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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
            {/* Prefere a descrição rica da página de vendas (listas, destaques
                e caixas) e cai no parágrafo corrido da planilha se faltar. */}
            {(sobre || produto.sobre) && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  Sobre o <span className={styles.sectionAccent}>material</span>
                </h2>
                {sobre ? (
                  <Conteudo markdown={sobre} />
                ) : (
                  <div className={styles.longText}>{produto.sobre}</div>
                )}
              </section>
            )}

            {/* Detalhes: os módulos, com o que já está liberado e o que vem depois */}
            {(conteudo.detalhes || produto.disciplinas) && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  Detalhes do <span className={styles.sectionAccent}>produto</span>
                </h2>
                {conteudo.detalhesTitulo && (
                  <p className={styles.detalhesEtiqueta}>{conteudo.detalhesTitulo}</p>
                )}
                {conteudo.detalhes ? (
                  <Conteudo markdown={conteudo.detalhes} />
                ) : (
                  <div className={styles.longText}>{produto.disciplinas}</div>
                )}
              </section>
            )}

            {conteudo.sumario && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  Sumário <span className={styles.sectionAccent}>completo</span>
                </h2>
                <Conteudo markdown={conteudo.sumario} />
              </section>
            )}

            {/* Cronograma: alguns materiais vão à venda antes de ficarem
                prontos, e quem compra precisa saber disso ANTES de pagar */}
            {conteudo.cronograma && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  Cronograma de <span className={styles.sectionAccent}>entrega</span>
                </h2>
                <Conteudo markdown={conteudo.cronograma} />
              </section>
            )}

            {/* o argumento muda por material: para flashcard a evidência de
                recuperação e espaçamento é direta; para resumo ela é de outra
                natureza, e usar a do flashcard esticaria o que a pesquisa diz */}
            <AutoridadeCientifica
              ehFlashcards={produto.ferramenta === 'Flashcards' || /^Flashcards/i.test(produto.nome)}
            />

            {conteudo.faq && conteudo.faq.length > 0 && (
              <FaqProduto perguntas={conteudo.faq} nomeDoProduto={produto.nome} />
            )}

            {!sobre && !produto.sobre && !conteudo.detalhes && !produto.disciplinas && (
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

      {/* aparece só quando o card de compra sai de vista */}
      <BarraCompra
        alvoId="card-compra"
        preco={formatarPreco(oferta.preco)}
        precoAntigo={oferta.precoAntigo !== null ? formatarPreco(oferta.precoAntigo) : null}
        rotulo={oferta.viaPaginaDeVendas ? 'Ver na loja →' : 'Comprar agora →'}
        href={oferta.checkout}
        externo
      />

      <Footer />
    </main>
  );
}
