import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './styles.module.css';

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
      {/* A logo levava para o WordPress antigo, e o Sérgio viu: quem clicava
          saía do site novo no meio da leitura. Agora vai para a home daqui. */}
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

      <a href="#planos" className={styles.cta}>
        Ver planos
      </a>
    </nav>
  );
}
