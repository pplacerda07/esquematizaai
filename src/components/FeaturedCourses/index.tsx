import Image from 'next/image';
import Link from 'next/link';
import styles from './styles.module.css';
import { produtoPor, ofertaAtual, formatarPreco, capaDe, type Produto, type Oferta } from '@/data/catalogo';

// Um combo em destaque por área (todos com capa própria).
// Se um deles perder preço ou checkout no catálogo, sai da seção sozinho.
const DESTAQUE_IDS = ['2895045', '2903931', '2903935', '2903937'];

type Destaque = { produto: Produto; oferta: Oferta };

const AREA_THUMB: Record<string, string> = {
  Fiscal: 'thumbFiscal',
  Controle: 'thumbControle',
  Policial: 'thumbPolicial',
  Tribunais: 'thumbTribunais',
};

export default function FeaturedCourses() {
  const destaques: Destaque[] = DESTAQUE_IDS.flatMap((id) => {
    const produto = produtoPor(id);
    const oferta = produto ? ofertaAtual(produto) : null;
    return produto && oferta ? [{ produto, oferta }] : [];
  });

  if (destaques.length === 0) return null;

  return (
    <section className={styles.coursesSection} id="combos">
      <h2 className={styles.title}>
        Combos em <span className={styles.titleAccent}>Destaque</span>
      </h2>
      <p className={styles.subtitle}>
        Resumos e flashcards das áreas mais concorridas, reunidos num pacote só e com desconto real.
      </p>

      <div className={styles.grid}>
        {destaques.map(({ produto, oferta }) => {
          const capa = capaDe(produto);
          return (
          <article key={produto.id} className={styles.card}>
            <div className={`${styles.thumb} ${styles[AREA_THUMB[produto.area ?? ''] ?? 'thumbFiscal']}`}>
              {capa ? (
                <Image
                  src={capa.src}
                  alt={`Capa de ${produto.nome}`}
                  width={capa.width}
                  height={capa.height}
                  className={styles.thumbCapa}
                />
              ) : (
                <span className={styles.thumbMark} aria-hidden="true">
                  {(produto.area ?? 'E').charAt(0)}
                </span>
              )}
              {oferta.percentualOff !== null && (
                <span className={styles.offBadge}>-{oferta.percentualOff}%</span>
              )}
            </div>

            <div className={styles.cardBody}>
              {produto.area && <span className={styles.badge}>Área {produto.area}</span>}
              <h3 className={styles.courseTitle}>
                <Link href={`/vitrine/produto/${produto.id}`} className={styles.courseTitleLink}>
                  {produto.nome}
                </Link>
              </h3>

              <div className={styles.priceContainer}>
                {oferta.precoAntigo !== null && (
                  <span className={styles.oldPrice}>de {formatarPreco(oferta.precoAntigo)}</span>
                )}
                <span className={styles.currentPrice}>{formatarPreco(oferta.preco)}</span>
              </div>

              <a
                className={styles.btnEnroll}
                href={oferta.checkout}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Comprar ${produto.nome} por ${formatarPreco(oferta.preco)}`}
              >
                Garantir agora →
              </a>
            </div>
          </article>
          );
        })}
      </div>
    </section>
  );
}
