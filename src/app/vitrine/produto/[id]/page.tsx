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
import GaleriaMaterial from '@/components/GaleriaMaterial';
import Depoimentos from '@/components/Depoimentos';
import { produtos, produtoPor, ofertaAtual, formatarPreco, capaDe, conteudoDe, selosDe, type Produto } from '@/data/catalogo';
import { produtoAjustado } from '@/lib/catalogo-ajustes';
import { rotuloDeFerramenta, SLUG_DA_AREA } from '@/data/catalogo/rotulos';
import { SITE_URL, AMOSTRAS_DRIVE_URL } from '@/config';
import { jsonLdSeguro } from '@/lib/json-ld';
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
  // passa pela camada de ajustes: preço editado no painel vale mais que o da
  // planilha, e produto marcado como oculto responde 404 como se não existisse
  const ajustado = await produtoAjustado(id);
  if (!ajustado) notFound();

  const { produto, oferta } = ajustado;

  const areaSlug = produto.area ? SLUG_DA_AREA[produto.area] : null;
  const linkArea = areaSlug ? `/vitrine/${areaSlug}` : '/vitrine';
  const capa = capaDe(produto);
  /**
   * O que este produto entrega, para a galeria mostrar o formato certo.
   *
   * A regra antiga era `ferramenta === 'Flashcards' || nome começa com
   * "Flashcards"`, e errava em 6 produtos: a "Assinatura Flashcards Regular"
   * tem ferramenta "Assinatura" e o nome não COMEÇA com Flashcards, então caía
   * no conjunto de resumos. Foi o erro que o Sérgio viu.
   *
   * Os combos ("R + F + Q + V") entregam os dois formatos e agora mostram os
   * dois: antes escolhiam um só.
   */
  const descricaoDoProduto = `${produto.ferramenta ?? ''} ${produto.nome}`;
  const ehCombo = /R \+ F/i.test(produto.ferramenta ?? '');
  const temFlashcards = ehCombo || /flashcard/i.test(descricaoDoProduto);
  const temResumos = ehCombo || /resumo|vade\s*mecum/i.test(descricaoDoProduto);

  // AutoridadeCientifica argumenta por recuperação e espaçamento, que é o
  // mecanismo do flashcard; num combo isso continua valendo.
  const ehFlashcards = temFlashcards;
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
      {/* A linha de parcelamento acompanha o preço riscado, e os dois só
          aparecem em produto com preço de referência confirmado pelo Sérgio.
          Sem referência, fica o preço sozinho, como sempre foi. */}
      <div className={styles.priceBlock}>
        {oferta.precoAntigo !== null && (
          <span className={styles.oldPrice}>{formatarPreco(oferta.precoAntigo)}</span>
        )}
        <span className={styles.currentPrice}>{formatarPreco(oferta.preco)}</span>
        {oferta.precoAntigo !== null && (
          <span className={styles.parcelamento}>
            <strong>12x de {formatarPreco(oferta.parcela12x)}</strong> ou{' '}
            {formatarPreco(oferta.preco)} à vista
          </span>
        )}
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

      {/* Amostras: aparece em TODO produto e leva à pasta compartilhada no Drive,
          em vez de servir um PDF por produto. A segunda linha avisa que abre no
          Drive e que a pasta é geral, senão a pessoa clica esperando a amostra
          deste produto específico e se perde no meio dos arquivos. */}
      <a
        className={styles.btnAmostra}
        href={AMOSTRAS_DRIVE_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        Ver amostras grátis
        <span className={styles.amostraPeso}>abre a pasta no Google Drive</span>
      </a>

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
        dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }}
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

            <GaleriaMaterial
              temResumos={temResumos || (!temResumos && !temFlashcards)}
              temFlashcards={temFlashcards}
            />

            {/* Depois da galeria e antes do argumento científico: a pessoa acabou
                de ver o material por dentro, e a pergunta que vem é "isso
                funcionou para alguém?". */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                Alunos <span className={styles.sectionAccent}>aprovados</span>
              </h2>
              <Depoimentos />
            </section>

            {/* o argumento muda por material: para flashcard a evidência de
                recuperação e espaçamento é direta; para resumo ela é de outra
                natureza, e usar a do flashcard esticaria o que a pesquisa diz */}
            <AutoridadeCientifica ehFlashcards={ehFlashcards} />

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
