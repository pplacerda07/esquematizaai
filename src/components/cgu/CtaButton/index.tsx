import React from 'react';
import styles from './styles.module.css';
import { GRUPO_VIP_URL } from '@/config';

type Props = {
  children: React.ReactNode;
  variant?: 'solid' | 'gradient';
};

export default function CtaButton({ children, variant = 'solid' }: Props) {
  return (
    <a
      href={GRUPO_VIP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`${styles.btn} ${variant === 'gradient' ? styles.gradient : ''}`}
    >
      {children}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
      </svg>
    </a>
  );
}
