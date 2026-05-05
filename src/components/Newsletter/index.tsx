'use client';

import React from 'react';
import styles from './styles.module.css';

export default function Newsletter() {
  return (
    <section className={styles.newsletterSection}>
      <div className={styles.container}>
        <h2 className={styles.title}>Dicas e Materiais Gratuitos</h2>
        <p className={styles.subtitle}>
          Junte-se a mais de 20.000 estudantes e receba conteúdos exclusivos semanalmente.
        </p>
        
        <form className={styles.formGroup} onSubmit={(e) => e.preventDefault()}>
          <input 
            type="email" 
            placeholder="Seu melhor e-mail" 
            className={styles.input} 
            required
          />
          <button type="submit" className={styles.btnSubmit}>
            Assinar
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    </section>
  );
}
