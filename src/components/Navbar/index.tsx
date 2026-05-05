import React from 'react';
import Image from 'next/image';
import styles from './styles.module.css';

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <a href="/" className={styles.logoLink}>
        <Image
          src="/logos/logo-horizontal-azul.png"
          alt="Esquematiza Aí"
          width={200}
          height={52}
          style={{ objectFit: 'contain' }}
          priority
        />
      </a>

      <div className={styles.navLinks}>
        <a href="/vitrine" className={styles.link}>Vitrine</a>
        <a href="/#sobre" className={styles.link}>Sobre Nós</a>
        <a href="/#aulas" className={styles.link}>Aulas ao Vivo</a>
        <a href="/#blog" className={styles.link}>Blog</a>
        <a href="/#contato" className={styles.link}>Contato</a>
      </div>

      <div className={styles.actions}>
        <a href="/admin" className={styles.btnLogin}>Entrar</a>
        <button className={styles.btnSignup}>Cadastrar</button>
      </div>
    </nav>
  );
}
