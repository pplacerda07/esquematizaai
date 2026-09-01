import React from 'react';
import styles from './styles.module.css';
import { CHECKOUT_URL } from '@/config';

type Props = {
  children: React.ReactNode;
  /** "azul" é o do topo da página, logo abaixo do vídeo, a pedido do Sérgio */
  variant?: 'solid' | 'gradient' | 'azul';
};

export default function CtaButton({ children, variant = 'solid' }: Props) {
  const cor = variant === 'gradient' ? styles.gradient : variant === 'azul' ? styles.azul : '';

  return (
    <a
      href={CHECKOUT_URL}
      target="_blank"
      rel="noopener noreferrer"
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
