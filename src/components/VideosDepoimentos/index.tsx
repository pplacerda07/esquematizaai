'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { DEPOIMENTOS_VIDEO_BASE } from '@/config';
import styles from './styles.module.css';

/**
 * Depoimentos em vídeo, em carrossel.
 *
 * O VÍDEO SÓ CARREGA NO PLAY. Até lá a página baixa apenas a capa, que tem uns
 * 30 KB. Sem isso, quatro vídeos somariam 22 MB de tráfego por visita, cobrados
 * do plano do Supabase mesmo para quem passou direto sem assistir. Com a capa,
 * a franquia só é gasta por quem realmente quis ver.
 *
 * O avanço automático PARA quando alguém dá play. Carrossel que troca de slide
 * no meio de um depoimento é o oposto do que a seção quer.
 *
 * Os quatro vídeos são 16:9. Os dois gravados na vertical já vieram montados
 * dentro desse formato por quem editou, com fundo desfocado nas laterais, então
 * não há mistura de proporção para resolver aqui.
 *
 * NÃO TEM SEÇÃO NEM TÍTULO PRÓPRIOS: quem monta isso é o ProvaSocial, que
 * reúne este carrossel e o dos prints sob um título só. Separados, a página
 * trazia dois títulos grandes seguidos dizendo a mesma coisa.
 */

type Depoimento = {
  slug: string;
  nome: string;
  /** aparece abaixo do nome; vazio some da tela */
  aprovacao?: string;
};

const DEPOIMENTOS: Depoimento[] = [
  { slug: 'lucas-magalhaes', nome: 'Lucas Magalhães' },
  { slug: 'walyson-kadu', nome: 'Walyson Kadu', aprovacao: 'Aprovado na SEFAZ-AC' },
  { slug: 'wagner-borges', nome: 'Wagner Borges' },
  { slug: 'yan-almeida', nome: 'Yan Almeida' },
];

const INTERVALO_MS = 6000;

export default function VideosDepoimentos() {
  const trilho = useRef<HTMLDivElement>(null);
  const [indice, setIndice] = useState(0);
  const [tocando, setTocando] = useState<string | null>(null);
  const [pausado, setPausado] = useState(false);

  const irPara = useCallback((i: number) => {
    const el = trilho.current;
    const slide = el?.children[i] as HTMLElement | undefined;
    if (!el || !slide) return;
    el.scrollTo({ left: slide.offsetLeft - el.offsetLeft, behavior: 'smooth' });
    setIndice(i);
  }, []);

  useEffect(() => {
    // alguém assistindo trava o carrossel, e é o comportamento certo
    if (pausado || tocando) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const t = window.setInterval(() => {
      setIndice((atual) => {
        const proximo = (atual + 1) % DEPOIMENTOS.length;
        const el = trilho.current;
        const slide = el?.children[proximo] as HTMLElement | undefined;
        if (el && slide) {
          el.scrollTo({ left: slide.offsetLeft - el.offsetLeft, behavior: 'smooth' });
        }
        return proximo;
      });
    }, INTERVALO_MS);

    return () => window.clearInterval(t);
  }, [pausado, tocando]);

  return (
      <div
        className={styles.palco}
        onMouseEnter={() => setPausado(true)}
        onMouseLeave={() => setPausado(false)}
        onFocusCapture={() => setPausado(true)}
        onBlurCapture={() => setPausado(false)}
        onTouchStart={() => setPausado(true)}
      >
        <div
          className={styles.trilho}
          ref={trilho}
          role="group"
          aria-label="Depoimentos em vídeo"
        >
          {DEPOIMENTOS.map((d) => {
            const capa = `${DEPOIMENTOS_VIDEO_BASE}/${d.slug}.jpg`;
            const video = `${DEPOIMENTOS_VIDEO_BASE}/${d.slug}.mp4`;
            const ativo = tocando === d.slug;

            return (
              <figure key={d.slug} className={styles.slide}>
                <div className={styles.moldura}>
                  {ativo ? (
                    /* eslint-disable-next-line jsx-a11y/media-has-caption */
                    <video
                      className={styles.video}
                      src={video}
                      poster={capa}
                      controls
                      autoPlay
                      playsInline
                      preload="metadata"
                      onEnded={() => setTocando(null)}
                    />
                  ) : (
                    <button
                      type="button"
                      className={styles.capa}
                      onClick={() => setTocando(d.slug)}
                      aria-label={`Assistir ao depoimento de ${d.nome}`}
                    >
                      <Image
                        src={capa}
                        alt=""
                        fill
                        sizes="(max-width: 900px) 92vw, 520px"
                        className={styles.imagem}
                      />
                      <span className={styles.play} aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5.5 L19 12 L8 18.5 Z" />
                        </svg>
                      </span>
                    </button>
                  )}
                </div>

                <figcaption className={styles.legenda}>
                  <span className={styles.nome}>{d.nome}</span>
                  {d.aprovacao && <span className={styles.aprovacao}>{d.aprovacao}</span>}
                </figcaption>
              </figure>
            );
          })}
        </div>

        <div className={styles.controles}>
          <button
            type="button"
            className={styles.seta}
            onClick={() => irPara((indice - 1 + DEPOIMENTOS.length) % DEPOIMENTOS.length)}
            aria-label="Depoimento anterior"
          >
            ‹
          </button>

          <div className={styles.bolinhas}>
            {DEPOIMENTOS.map((d, i) => (
              <button
                key={d.slug}
                type="button"
                className={`${styles.bolinha} ${i === indice ? styles.bolinhaAtiva : ''}`}
                onClick={() => irPara(i)}
                aria-label={`Ver depoimento ${i + 1} de ${DEPOIMENTOS.length}`}
                aria-current={i === indice ? 'true' : undefined}
              />
            ))}
          </div>

          <button
            type="button"
            className={styles.seta}
            onClick={() => irPara((indice + 1) % DEPOIMENTOS.length)}
            aria-label="Próximo depoimento"
          >
            ›
          </button>
        </div>
      </div>
  );
}
