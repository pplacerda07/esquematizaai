'use client';

import React, { useEffect, useState } from 'react';
import styles from './styles.module.css';

const STORAGE_KEY = 'esquematiza_lead_popup_dismissed';
const DELAY_MS = 8000;

export default function LeadPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.localStorage.getItem(STORAGE_KEY)) return;

    const timer = window.setTimeout(() => setOpen(true), DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const close = () => {
    setOpen(false);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, '1');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, '1');
    }
    window.setTimeout(() => setOpen(false), 2200);
  };

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={close} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={close} aria-label="Fechar">×</button>

        {!submitted ? (
          <>
            <div className={styles.badge}>📬 Lista exclusiva</div>
            <h3 className={styles.title}>
              Você quer saber quais os <span className={styles.highlight}>próximos concursos</span>?
            </h3>
            <p className={styles.subtitle}>
              Receba antes de todo mundo os editais do Fisco, datas de prova e dicas de estudo direto no seu e-mail.
            </p>

            <form className={styles.form} onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                required
              />
              <button type="submit" className={styles.submit}>
                Quero receber
              </button>
            </form>

            <p className={styles.disclaimer}>
              Sem spam. Cancele quando quiser.
            </p>
          </>
        ) : (
          <div className={styles.success}>
            <div className={styles.successIcon}>✓</div>
            <h3 className={styles.title}>Pronto!</h3>
            <p className={styles.subtitle}>
              Em breve você vai receber novidades dos próximos concursos no seu e-mail.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
