import React from 'react';
import Image from 'next/image';
import styles from './styles.module.css';
import { SITE_URL } from '@/config';

/**
 * Barra de topo das páginas de venda.
 *
 * O BOTÃO LEVA AOS PLANOS, e não mais direto para a aplicação. A pedido do
 * Sérgio, e faz sentido: quem acabou de chegar ainda não sabe quanto custa, e
 * pedir aplicação antes de mostrar preço é o convite mais fácil de recusar.
 * "Ver planos" leva a pessoa até a tabela, onde a decisão realmente acontece.
 *
 * Por ser âncora na mesma página, não abre em aba nova.
 */
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

      <a href="#planos" className={styles.cta}>
        Ver planos
      </a>
    </nav>
  );
}
