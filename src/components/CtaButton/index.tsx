import React from 'react';
import styles from './styles.module.css';
import { CHECKOUT_URL } from '@/config';

type Props = {
  children: React.ReactNode;
  /**
   * "azul" é o do topo da página, logo abaixo do vídeo, e "verde" é o do fim,
   * que devolve a pessoa para os planos. Os dois a pedido do Sérgio.
   */
  variant?: 'solid' | 'gradient' | 'azul' | 'verde';
  /**
   * Destino alternativo ao formulário de aplicação. Serve para as âncoras da
   * própria página, como "#planos": nesse caso o link NÃO abre em aba nova,
   * porque abrir uma aba para rolar a mesma página é só confusão.
   */
  href?: string;
};

const CORES = {
  solid: '',
  gradient: 'gradient',
  azul: 'azul',
  verde: 'verde',
} as const;

export default function CtaButton({ children, variant = 'solid', href }: Props) {
  const cor = styles[CORES[variant]] ?? '';
  const destino = href ?? CHECKOUT_URL;
  const mesmaPagina = destino.startsWith('#');

  return (
    <a
      href={destino}
      target={mesmaPagina ? undefined : '_blank'}
      rel={mesmaPagina ? undefined : 'noopener noreferrer'}
      className={`${styles.btn} ${cor}`}
    >
      {children}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
      </svg>
    </a>
  );
}
