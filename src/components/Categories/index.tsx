import React from 'react';
import Image from 'next/image';
import styles from './styles.module.css';

const categories = [
  { name: 'Direito Tributário', count: '12 Materiais' },
  { name: 'Auditoria Fiscal', count: '8 Materiais' },
  { name: 'Contabilidade', count: '15 Materiais' },
  { name: 'Legislação Aduaneira', count: '10 Materiais' },
  { name: 'Preparatório RFB', count: '5 Combos Completos' },
];

export default function Categories() {
  return (
    <section className={styles.categoriesSection}>
      <div className={styles.container}>
        <div className={styles.leftColumn}>
          <span className={styles.sectionTag}>Explore</span>
          <h2 className={styles.title}>
            Nossas Categorias <span className={styles.titleAccent}>Principais</span>
          </h2>
          
          <div className={styles.categoryList}>
            {categories.map((cat, idx) => (
              <div key={idx} className={styles.categoryItem}>
                <div className={styles.categoryInfo}>
                  <span className={styles.categoryName}>{cat.name}</span>
                  <span className={styles.categoryCount}>{cat.count}</span>
                </div>
                <div className={styles.arrowIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className={styles.rightColumn}>
          <div className={styles.imageShape}>
            <Image
              src="/assets/mulher-esquematiza.webp"
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
