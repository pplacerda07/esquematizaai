import Image from 'next/image';
import Link from 'next/link';
import styles from './styles.module.css';
import { produtoPor, ofertaAtual, formatarPreco, capaDe, type Produto, type Oferta } from '@/data/catalogo';
import { rotuloDeFerramenta } from '@/data/catalogo/rotulos';

// As assinaturas em destaque. Se uma perder preço ou destino de compra no
// catálogo, ela sai da seção sozinha.
const ASSINATURA_IDS = [
  'assinatura-flashcards-regular',
  'assinatura-resumos-regular',
  'assinatura-resumos-regular-flashcards-regular',
  'assinatura-legislacao-tributaria',
];

// A única que contém as outras duas: recebe o card em evidência.
const ID_EM_EVIDENCIA = 'assinatura-resumos-regular-flashcards-regular';

type Plano = { produto: Produto; oferta: Oferta };

export default function FeaturedCourses() {
  const planos: Plano[] = ASSINATURA_IDS.flatMap((id) => {
    const produto = produtoPor(id);
    const oferta = produto ? ofertaAtual(produto) : null;
    return produto && oferta ? [{ produto, oferta }] : [];
  });

  if (planos.length === 0) return null;

  return (
    // id="assinaturas" é o alvo do link "Assinaturas" da navbar (/#assinaturas)
    <section className={styles.coursesSection} id="assinaturas">
      <h2 className={styles.title}>
        Mais <span className={styles.titleAccent}>procurados</span>
      </h2>
      <p className={styles.subtitle}>
        Acesso ao acervo de resumos e flashcards por um período, em vez de comprar material por
        material. Compra direta no checkout da Eduzz.
      </p>

      <div className={styles.grid}>
        {planos.map(({ produto, oferta }) => {
          const emEvidencia = produto.id === ID_EM_EVIDENCIA;
          const capa = capaDe(produto);

          return (
            <article
              key={produto.id}
              className={`${styles.card} ${emEvidencia ? styles.cardDestaque : ''}`}
            >
              {/* mesmo molde do catálogo: capa 3/4, etiquetas, título, preço e botão */}
              <Link
                href={`/vitrine/produto/${produto.id}`}
                className={styles.capaWrap}
                aria-label={`Ver detalhes de ${produto.nome}`}
                tabIndex={-1}
              >
                {capa && (
                  <Image
                    src={capa.src}
                    alt={`Capa de ${produto.nome}`}
                    width={capa.width}
                    height={capa.height}
                    className={styles.capaImg}
                  />
                )}
              </Link>

              <div className={styles.cardHeader}>
                <span className={styles.badge}>
                  {rotuloDeFerramenta(produto.ferramenta, produto.categoria)}
                </span>
                {produto.area && <span className={styles.badgeArea}>{produto.area}</span>}
                {oferta.percentualOff !== null && (
                  <span className={styles.offPill}>-{oferta.percentualOff}%</span>
                )}
              </div>

              <div className={styles.cardBody}>
                <h3 className={styles.courseTitle}>
                  <Link href={`/vitrine/produto/${produto.id}`} className={styles.courseTitleLink}>
                    {produto.nome}
                  </Link>
                </h3>

                {emEvidencia && (
                  <span className={styles.selo}>Resumos e flashcards no mesmo plano</span>
                )}

                <div className={styles.priceContainer}>
                  {oferta.precoAntigo !== null && (
                    <span className={styles.oldPrice}>de {formatarPreco(oferta.precoAntigo)}</span>
                  )}
                  <span className={styles.currentPrice}>{formatarPreco(oferta.preco)}</span>
                </div>
              </div>

              <a
                className={styles.btnEnroll}
                href={oferta.checkout}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Assinar ${produto.nome} por ${formatarPreco(oferta.preco)}`}
              >
                {oferta.viaPaginaDeVendas ? 'Ver na loja →' : 'Assinar agora →'}
              </a>
            </article>
          );
        })}
      </div>

      <a className={styles.verTodas} href="#vitrine">
        Ver também os combos e materiais avulsos →
      </a>
    </section>
  );
}
