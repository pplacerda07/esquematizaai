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

  // animateMotion é SMIL, não CSS: a regra prefers-reduced-motion não o alcança.
  // Sem esta checagem, quem pediu menos movimento no sistema veria o avião voar
  // do mesmo jeito. Começa em false para o servidor e o cliente renderizarem
  // igual, e só depois a preferência é lida.
  const [semMovimento, setSemMovimento] = useState(false);

  useEffect(() => {
    const consulta = window.matchMedia('(prefers-reduced-motion: reduce)');
    setSemMovimento(consulta.matches);
    const aoMudar = (e: MediaQueryListEvent) => setSemMovimento(e.matches);
    consulta.addEventListener('change', aoMudar);
    return () => consulta.removeEventListener('change', aoMudar);
  }, []);

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
                  {/* Rota e avião no MESMO svg, de propósito: o avião percorre
                      exatamente a curva desenhada pelo rastro, via animateMotion.
                      Antes eram dois elementos com animações separadas em CSS, e
                      o avião pulava entre pontos em vez de curvar. Decorativo, o
                      título se lê sem isto. */}
                  <svg className={styles.rota} viewBox="0 0 200 46" fill="none" aria-hidden="true">
                    <path
                      id="rota-do-aviao"
                      d="M8 38 C 54 6, 128 2, 186 20"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeDasharray="5 8"
                      className={styles.rastro}
                    />

                    <g className={styles.aviao}>
                      {/* Velocidade constante, de propósito.
                          Com aceleração o avião disparava no meio e quase
                          parava no fim: medido, andava 9, 33, 32, 13 e 3
                          unidades entre amostras iguais no tempo. Avião não
                          freia no ar; linear deixa o voo parelho e ainda tira o
                          solavanco na volta do ciclo. */}
                      {!semMovimento && (
                        <animateMotion
                          dur="5s"
                          repeatCount="indefinite"
                          rotate="auto"
                          calcMode="linear"
                        >
                          <mpath href="#rota-do-aviao" />
                        </animateMotion>
                      )}
                      {/* desenhado em torno da origem para animateMotion o
                          posicionar pelo centro, e não pelo canto */}
                      <g transform="scale(0.8) translate(-12.5, -12)">
                        {/* asa de cima e asa de baixo: são as duas faces da
                            dobra do papel. A diferença de opacidade é o que faz
                            parecer papel dobrado, e não uma seta chapada. */}
                        <path d="M23 12 L2 3 L7 12 Z" fill="currentColor" />
                        <path d="M23 12 L7 12 L2 21 Z" fill="currentColor" opacity="0.55" />
                      </g>
                    </g>
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
                {/* o mesmo avião do título, agora pousado */}
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M23 12 L2 3 L7 12 Z" fill="currentColor" />
                  <path d="M23 12 L7 12 L2 21 Z" fill="currentColor" opacity="0.55" />
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
