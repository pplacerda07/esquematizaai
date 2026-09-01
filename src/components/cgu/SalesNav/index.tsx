import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './styles.module.css';
import { GRUPO_VIP_URL } from '@/config';

export default function SalesNav() {
  return (
    <nav className={styles.navbar}>
      {/* Mesma correção da página da mentoria: a logo ia para o WordPress
          antigo e tirava a pessoa do site novo no meio da leitura. */}
      <Link href="/" className={styles.logoLink} aria-label="Esquematiza Aí, ir para o início">
        <Image
          src="/logos/logo-horizontal-azul.png"
          alt="Esquematiza Aí"
          width={170}
          height={44}
          style={{ objectFit: 'contain' }}
          priority
        />
      </Link>

      <a
        href={GRUPO_VIP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.cta}
      >
        Entrar no grupo
      </a>
    </nav>
  );
}
