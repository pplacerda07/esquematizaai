import React from 'react';
import styles from './styles.module.css';

const posts = [
  { category: 'Dicas de Estudo', date: '12 Abr 2026', title: 'Como gabaritar Contabilidade na RFB', excerpt: 'Descubra a técnica correta para estudar normas complexas e aumentar sua nota.', authorImg: '/assets/22.png' },
  { category: 'Atualizações', date: '10 Abr 2026', title: 'Principais mudanças na Legislação Tributária', excerpt: 'Um resumo completo e esquematizado das alterações mais cobradas nas provas.', authorImg: '/assets/22.png' },
  { category: 'Entrevistas', date: '05 Abr 2026', title: 'A rotina de quem passou na SEFAZ', excerpt: 'Conversamos com a Mariana, que utilizou nossa metodologia para aprovação.', authorImg: '/assets/22.png' },
];

export default function BlogPreview() {
  return (
    <section className={styles.blogSection} id="blog">
      <span className={styles.sectionTag}>Blog</span>
      <h2 className={styles.title}>
        Artigos e <span className={styles.titleAccent}>Conteúdos</span>
      </h2>
      
      <div className={styles.grid}>
        {posts.map((post, idx) => (
          <div key={idx} className={styles.card}>
            <span className={styles.badge}>{post.category}</span>
            <span className={styles.date}>{post.date}</span>
            <h3 className={styles.articleTitle}>{post.title}</h3>
            <p className={styles.excerpt}>{post.excerpt}</p>
            <div className={styles.footer}>
              <div className={styles.author}>
                <img src={post.authorImg} alt="Autor" className={styles.avatar} />
              </div>
              <a href="#" className={styles.readMore}>Ler Mais →</a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
