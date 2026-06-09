import React from 'react';
import Image from 'next/image';
import styles from './styles.module.css';

const newsFeatured = {
  date: '13/Maio',
  title: 'Concurso CGM Porto Velho (RO): edital retificado',
};

const newsItems = [
  { date: '13/05', title: 'Concurso ISS Porto Velho (RO): edital retificado' },
  { date: '13/05', title: 'Concurso Hidrolândia GO: provas em junho!' },
  { date: '13/05', title: 'Concurso CGM Porto Velho 2026: salários de R$ 21,2 mil!' },
  { date: '13/05', title: 'Concurso ISS Porto Velho: salários de até R$ 18,4 mil!' },
];

const articles = [
  { title: 'Estatuto da PcD: principais pontos que caem em questões de prova', date: '10/05/2026', author: 'Gabriela Maia de Gouvêa' },
  { title: 'Concurso Petrobras e Transpetro: como conciliar os dois editais', date: '10/05/2026', author: 'Teo Brum Breunig' },
  { title: 'Hábitos atômicos para concurseiros que trabalham: como vencer o cansaço com pequenas vitórias', date: '09/05/2026', author: 'Jazon Paulino Lisboa Moreira' },
  { title: 'Concurso TRF: qual é o tribunal com o salário mais atrativo?', date: '09/05/2026', author: 'Gabriela Maia de Gouvêa' },
  { title: 'Concurso PM/AL: Comando e Subordinação', date: '09/05/2026', author: 'Icaro Alves de Souza' },
  { title: 'Mudança nos estudos', date: '09/05/2026', author: 'Carlos Augusto Canada Silva' },
];

function Dots({ active = 0, count = 5 }: { active?: number; count?: number }) {
  return (
    <div className={styles.dots} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className={`${styles.dot} ${i === active ? styles.dotActive : ''}`}></span>
      ))}
    </div>
  );
}

export default function BlogPreview() {
  return (
    <section className={styles.blogSection} id="blog">
      <div className={styles.container}>

        {/* Últimas notícias */}
        <div className={styles.block}>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <h2 className={styles.title}>
                Últimas <span className={styles.titleAccent}>notícias</span>
              </h2>
              <Dots active={2} count={5} />
            </div>
            <a href="#" className={styles.outlineBtn}>Ver todas as notícias</a>
          </div>

          <div className={styles.newsGrid}>
            <article className={styles.featuredCard}>
              <span className={styles.featuredDate}>
                <span className={styles.dateDash}>—</span> {newsFeatured.date}
              </span>
              <h3 className={styles.featuredTitle}>{newsFeatured.title}</h3>
            </article>

            <div className={styles.newsSmallGrid}>
              {newsItems.map((item, i) => (
                <article key={i} className={styles.newsCard}>
                  <h4 className={styles.newsTitle}>{item.title}</h4>
                  <span className={styles.newsDate}>{item.date}</span>
                </article>
              ))}
            </div>
          </div>
        </div>

        {/* Artigos em destaque */}
        <div className={styles.block}>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <h2 className={styles.title}>
                Artigos em <span className={styles.titleAccent}>destaque</span>
              </h2>
              <Dots active={2} count={5} />
            </div>
            <a href="#" className={styles.outlineBtn}>Ver todos os artigos</a>
          </div>

          <div className={styles.articlesRow}>
            {articles.map((article, i) => (
              <article key={i} className={styles.articleCard}>
                <div className={styles.articleIconWrap}>
                  <Image
                    src="/logos/logo-simbolo-semlinhas.png"
                    alt=""
                    width={56}
                    height={56}
                    className={styles.articleIcon}
                  />
                </div>
                <h4 className={styles.articleTitle}>{article.title}</h4>
                <div className={styles.articleMeta}>
                  <span className={styles.articleDate}>{article.date}</span>
                  <span className={styles.articleAuthor}>por {article.author}</span>
                </div>
              </article>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
