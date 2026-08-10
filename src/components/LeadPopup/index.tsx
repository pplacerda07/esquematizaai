'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from './styles.module.css';

const STORAGE_KEY = 'esquematiza_lead_popup_dismissed';
const DELAY_MS = 8000;

/**
 * Pop-up de captação da newsletter.
 *
 * Passou a ser o ÚNICO lugar da newsletter no site: a faixa laranja que ficava
 * entre os depoimentos e a vitrine saiu. Um convite só, na hora certa, em vez
 * de uma barra colorida cortando a home no meio.
 */
export default function LeadPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const campoEmail = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.localStorage.getItem(STORAGE_KEY)) return;

    const timer = window.setTimeout(() => setOpen(true), DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, '1');
    }
  }, []);

  // Esc fecha, e o foco vai para o campo ao abrir: sem isso a pessoa que navega
  // por teclado fica presa atrás de uma janela que ela não consegue dispensar.
  useEffect(() => {
    if (!open) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', aoTeclar);
    campoEmail.current?.focus();
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [open, close]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, '1');
    }
    window.setTimeout(() => setOpen(false), 2600);
  };

  if (!open) return null;

  return (
    <div
      className={styles.overlay}
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-newsletter"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Faixa Azul Marinho com o símbolo: é o que dá cara de Esquematiza à
            janela, no lugar do fio laranja que havia antes no topo. */}
        <div className={styles.topo}>
          <Image
            src="/logos/logo-simbolo-3cores.png"
            alt=""
            width={44}
            height={53}
            className={styles.simbolo}
            aria-hidden="true"
            /* eager e não lazy: este elemento só existe depois que a janela
               abre, então esperar ele entrar em viewport não adianta nada e
               ainda deixa o topo sem logo por um instante. */
            loading="eager"
          />
          <button className={styles.closeBtn} onClick={close} aria-label="Fechar">
            ×
          </button>
        </div>

        <div className={styles.corpo}>
          {!submitted ? (
            <>
              <h3 className={styles.title} id="titulo-newsletter">
                Assine a nossa{' '}
                <span className={styles.palavraNewsletter}>
                  {/* Rastro e avião: decorativos, o texto se lê sem eles. */}
                  <svg className={styles.rastro} viewBox="0 0 200 44" fill="none" aria-hidden="true">
                    <path
                      d="M4 34 C 46 6, 108 4, 150 20"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeDasharray="5 7"
                    />
                  </svg>
                  <svg className={styles.aviao} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M22 2 L15 22 L11 13 L2 9 Z"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                  </svg>
                  newsletter
                </span>
              </h3>

              <p className={styles.subtitle}>
                Receba antes de todo mundo os editais do Fisco, datas de prova e dicas de
                estudo direto no seu e-mail.
              </p>

              <form className={styles.form} onSubmit={handleSubmit}>
                <input
                  ref={campoEmail}
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

              <p className={styles.disclaimer}>Sem spam. Cancele quando quiser.</p>
            </>
          ) : (
            <div className={styles.success}>
              <div className={styles.successIcon} aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22 2 L15 22 L11 13 L2 9 Z"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className={styles.title}>Voou.</h3>
              <p className={styles.subtitle}>
                Em breve você recebe as novidades dos próximos concursos no seu e-mail.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
