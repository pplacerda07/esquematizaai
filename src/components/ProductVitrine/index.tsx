import React from 'react';
import styles from './styles.module.css';

const fiscalProducts = [
  { 
    id: 1,
    type: 'Mapas Mentais', 
    title: 'Direito Tributário Esquematizado', 
    description: 'Os conceitos mais complexos de Tributário mastigados e estruturados em mapas de alta memorização.',
    oldPrice: 'R$ 97,00', 
    newPrice: 'R$ 47,00' 
  },
  { 
    id: 2,
    type: 'E-book Passo a Passo', 
    title: 'Auditoria Fiscal na Prática', 
    description: 'Guia definitivo para dominar Auditoria, com foco direto na Receita Federal e fiscos estaduais (SEFAZ).',
    oldPrice: 'R$ 89,90', 
    newPrice: 'R$ 39,90' 
  },
  { 
    id: 3,
    type: 'Resumão', 
    title: 'Contabilidade Pública e Geral', 
    description: 'A base que aprova. Resumos cirúrgicos das normas contábeis cobradas pelas maiores bancas.',
    oldPrice: 'R$ 119,00', 
    newPrice: 'R$ 59,00' 
  },
  { 
    id: 4,
    type: 'Combo', 
    title: 'Pacote Aprovação Receita Federal', 
    description: 'O combo supremo: legislação aduaneira, tributário, auditoria e contabilidade com 40% OFF.',
    oldPrice: 'R$ 297,00', 
    newPrice: 'R$ 147,00' 
  },
];

export default function ProductVitrine() {
  return (
    <section className={styles.vitrineSection} id="vitrine-fiscal">
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.sectionTag}>Material de Alto Rendimento</span>
          <h2 className={styles.title}>
            Vitrine <span className={styles.titleAccent}>Fiscal</span>
          </h2>
          <p className={styles.subtitle}>
            Acelere sua aprovação na Área Fiscal (Receita Federal, SEFAZ, ISS) com nossos materiais 100% focados no que realmente cai nas provas.
          </p>
        </div>
        
        <div className={styles.grid}>
          {fiscalProducts.map((product) => (
            <div key={product.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.badge}>{product.type}</span>
              </div>
              <div className={styles.cardBody}>
                <h3 className={styles.productTitle}>{product.title}</h3>
                <p className={styles.productDescription}>{product.description}</p>
                <div className={styles.priceContainer}>
                  <span className={styles.oldPrice}>{product.oldPrice}</span>
                  <span className={styles.currentPrice}>{product.newPrice}</span>
                </div>
              </div>
              <div className={styles.cardFooter}>
                <button className={styles.btnBuy}>Garantir Material →</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
