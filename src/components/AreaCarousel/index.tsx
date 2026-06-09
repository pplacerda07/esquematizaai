'use client';

import React, { useState } from 'react';
import styles from './styles.module.css';
import { MENTORIA_URL } from '@/components/Navbar/areas';

type Product = {
  title: string;
  description: string;
  price?: string;
};

type Section = {
  key: string;
  title: string;
  subtitle: string;
  badge: string;
  products: Product[];
  cta: { label: string; href: string; external?: boolean };
};

function buildSections(areaName: string): Section[] {
  return [
    {
      key: 'assinaturas',
      title: 'Assinaturas',
      subtitle: `Acesso completo a todo o conteúdo da área ${areaName}.`,
      badge: 'Recorrente',
      products: [
        { title: 'Plano Mensal', description: 'Acesso a todos os materiais por 30 dias.', price: 'R$ 89,90/mês' },
        { title: 'Plano Anual', description: 'Acesso por 12 meses com 40% de desconto.', price: '12x R$ 99,90' },
        { title: 'Plano 2 Anos', description: 'O melhor custo-benefício para sua aprovação.', price: '24x R$ 79,90' },
      ],
      cta: { label: 'Quero ser assinante', href: '#assinaturas' },
    },
    {
      key: 'combos',
      title: 'Combos',
      subtitle: 'Pacotes esquematizados com tudo que você precisa para sua aprovação.',
      badge: 'Mais vendido',
      products: [
        { title: `Combo Completo ${areaName}`, description: 'Mapas, resumos, flashcards e questões.', price: 'R$ 497' },
        { title: `Combo Essencial ${areaName}`, description: 'Os tópicos mais cobrados nas provas.', price: 'R$ 297' },
        { title: `Combo Reta Final ${areaName}`, description: 'Revisão intensiva para os últimos 30 dias.', price: 'R$ 197' },
      ],
      cta: { label: 'Ver todos os combos', href: '#combos' },
    },
    {
      key: 'resumos',
      title: 'Resumos isolados',
      subtitle: 'Conteúdos cirúrgicos por matéria — compre apenas o que você precisa.',
      badge: 'Por matéria',
      products: [
        { title: 'Direito Constitucional', description: 'Resumo esquematizado com jurisprudência atualizada.', price: 'R$ 67' },
        { title: 'Direito Administrativo', description: 'Conceitos, princípios e súmulas.', price: 'R$ 67' },
        { title: 'Direito Tributário', description: 'CTN comentado e tabelas de prazos.', price: 'R$ 67' },
      ],
      cta: { label: 'Ver todos os resumos', href: '#resumos' },
    },
    {
      key: 'flashcards',
      title: 'Flashcards isolados',
      subtitle: 'Revisão ativa e memorização de longo prazo, na medida certa.',
      badge: 'Repetição espaçada',
      products: [
        { title: 'Flashcards Constitucional', description: '+500 cards com gabarito comentado.', price: 'R$ 47' },
        { title: 'Flashcards Administrativo', description: '+450 cards organizados por tema.', price: 'R$ 47' },
        { title: 'Flashcards Tributário', description: '+380 cards focados em prova.', price: 'R$ 47' },
      ],
      cta: { label: 'Ver todos os flashcards', href: '#flashcards' },
    },
    {
      key: 'mentoria',
      title: 'Mentoria',
      subtitle: `Acompanhamento individual para você passar na área ${areaName}.`,
      badge: 'Vagas limitadas',
      products: [
        { title: 'Mentoria Individual', description: 'Plano de estudos sob medida + acompanhamento semanal.' },
        { title: 'Mentoria em Grupo', description: 'Aulas ao vivo com mentores aprovados.' },
        { title: 'Consultoria de Edital', description: 'Análise técnica do edital e priorização de matérias.' },
      ],
      cta: { label: 'Aplicar para a mentoria', href: MENTORIA_URL, external: true },
    },
  ];
}

export default function AreaCarousel({ areaName }: { areaName: string }) {
  const sections = buildSections(areaName);
  const [active, setActive] = useState(0);
  const total = sections.length;

  const go = (idx: number) => setActive(((idx % total) + total) % total);

  return (
    <div className={styles.carousel}>
      <div className={styles.viewport}>
        <div
          className={styles.track}
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          {sections.map((section) => (
            <div key={section.key} className={styles.slide}>
              <div className={styles.slideHeader}>
                <span className={styles.badge}>{section.badge}</span>
                <h2 className={styles.slideTitle}>{section.title}</h2>
                <p className={styles.slideSubtitle}>{section.subtitle}</p>
              </div>

              <div className={styles.cards}>
                {section.products.map((product, i) => (
                  <article key={i} className={styles.card}>
                    <h3 className={styles.cardTitle}>{product.title}</h3>
                    <p className={styles.cardDesc}>{product.description}</p>
                    {product.price && (
                      <div className={styles.cardPrice}>{product.price}</div>
                    )}
                    <button className={styles.cardBtn}>Quero esse</button>
                  </article>
                ))}
              </div>

              <div className={styles.slideFooter}>
                {section.cta.external ? (
                  <a
                    href={section.cta.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.sectionCta}
                  >
                    {section.cta.label} →
                  </a>
                ) : (
                  <a href={section.cta.href} className={styles.sectionCta}>
                    {section.cta.label} →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        className={`${styles.arrow} ${styles.arrowLeft}`}
        onClick={() => go(active - 1)}
        aria-label="Seção anterior"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <button
        type="button"
        className={`${styles.arrow} ${styles.arrowRight}`}
        onClick={() => go(active + 1)}
        aria-label="Próxima seção"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>

      <div className={styles.tabs} role="tablist">
        {sections.map((section, i) => (
          <button
            key={section.key}
            type="button"
            role="tab"
            aria-selected={i === active}
            className={`${styles.tab} ${i === active ? styles.tabActive : ''}`}
            onClick={() => go(i)}
          >
            {section.title}
          </button>
        ))}
      </div>
    </div>
  );
}
