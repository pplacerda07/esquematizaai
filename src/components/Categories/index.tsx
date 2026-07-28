import Image from 'next/image';
import Link from 'next/link';
import styles from './styles.module.css';
import { produtosVendaveis } from '@/data/catalogo';

// Áreas do catálogo -> rotas da vitrine (Legislativa ainda não tem rota própria)
const AREAS_HOME = [
  { area: 'Fiscal', nome: 'Fiscal', href: '/vitrine/fiscal' },
  { area: 'Controle', nome: 'Controle e Gestão', href: '/vitrine/controle-e-gestao' },
  { area: 'Policial', nome: 'Policial', href: '/vitrine/policial' },
  { area: 'Tribunais', nome: 'Tribunais', href: '/vitrine/tribunais' },
  { area: 'Bancária', nome: 'Bancária', href: '/vitrine/bancaria' },
  { area: 'Legislativo', nome: 'Legislativa', href: '/vitrine' },
];

export default function Categories() {
  const vendaveis = produtosVendaveis();
  const categorias = AREAS_HOME
    .map((c) => ({ ...c, total: vendaveis.filter((p) => p.area === c.area).length }))
    .filter((c) => c.total > 0);

  return (
    <section className={styles.categoriesSection}>
      <div className={styles.container}>
        <div className={styles.leftColumn}>
          <h2 className={styles.title}>
            Explore nossos materiais por{' '}
            <span className={styles.titleAccent}>área de concurso</span>
          </h2>

          <div className={styles.categoryList}>
            {categorias.map((cat) => (
              <Link key={cat.area} href={cat.href} className={styles.categoryItem}>
                <div className={styles.categoryInfo}>
                  <span className={styles.categoryName}>{cat.nome}</span>
                  <span className={styles.categoryCount}>
                    {cat.total} {cat.total === 1 ? 'material à venda' : 'materiais à venda'}
                  </span>
                </div>
                <div className={styles.arrowIcon} aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.imageShape}>
            <Image
              /* -v2: nome novo de propósito. Sobrescrever o arquivo antigo mantendo
                 o mesmo nome fazia o otimizador do Next (e o cache do navegador e
                 da Vercel) continuarem servindo os bytes velhos. */
              src="/assets/mulher-esquematiza-v2.webp"
              alt="Aluna do Esquematiza Aí"
              width={520}
              height={650}
              className={styles.heroImage}
              priority={false}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
