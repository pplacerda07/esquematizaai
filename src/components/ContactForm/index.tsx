'use client';

import React from 'react';
import styles from './styles.module.css';

export default function ContactForm() {
  return (
    <section className={styles.contactSection} id="contato">
      <div className={styles.container}>
        <span className={styles.sectionTag}>Contato</span>
        <h2 className={styles.title}>
          Fale com a Nossa <span className={styles.titleAccent}>Equipe</span>
        </h2>
        
        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>Nome Completo</label>
            <input type="text" id="name" className={styles.input} placeholder="João da Silva" required />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>E-mail</label>
            <input type="email" id="email" className={styles.input} placeholder="joao@exemplo.com" required />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="message" className={styles.label}>Mensagem</label>
            <textarea id="message" className={styles.textarea} placeholder="Como podemos te ajudar?" required></textarea>
          </div>
          
          <button type="submit" className={styles.btnSubmit}>Enviar Mensagem</button>
        </form>
      </div>
    </section>
  );
}
