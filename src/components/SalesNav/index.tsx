import React from 'react';
import Image from 'next/image';
import styles from './styles.module.css';
import { CHECKOUT_URL, SITE_URL } from '@/config';

export default function SalesNav() {
  return (
    <nav className={styles.navbar}>
      <a href={SITE_URL} className={styles.logoLink} aria-label="Esquematiza Aí">
        <Image
          src="/logos/logo-horizontal-azul.png"
          alt="Esquematiza Aí"
          width={170}
          height={44}
          style={{ objectFit: 'contain' }}
          priority
        />
      </a>

      <a
        href={CHECKOUT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.cta}
      >
        Quero minha vaga
      </a>
    </nav>
  );
}
