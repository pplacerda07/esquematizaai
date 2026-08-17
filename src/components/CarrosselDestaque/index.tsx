'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from './styles.module.css';

/**
 * Carrossel de destaque, ao lado da chamada do hero.
 *
 * PARA QUE SERVE: lançamento, masterclass, aula magna. Um banner grande que
 * passa sozinho e a pessoa também passa, no formato que o Sérgio mandou de
 * referência.
 *
 * ESTÁ DESLIGADO. Não porque falte código, e sim porque não há banner: ligar com
 * a lista vazia deixaria um retângulo cinza ocupando meia tela. Quando houver
 * uma arte, é preencher DESTAQUES abaixo e trocar MOSTRAR para true.
 *
 * A rolagem é nativa com scroll-snap, então arrastar no celular funciona sem
 * código; as setas e as bolinhas só empurram a mesma rolagem.
 */

export type Destaque = {
  /** imagem do banner, em /public */
  src: string;
  /** descreve a arte para quem não enxerga; não repita o texto do botão */
  alt: string;
  titulo: string;
  linha?: string;
  /** para onde o botão leva */
  href: string;
  rotuloDoBotao: string;
};

/** Nenhum banner hoje. Preencher aqui quando houver lançamento. */
export const DESTAQUES: Destaque[] = [];

/** Liga o bloco. Só faz sentido com DESTAQUES preenchido. */
export const MOSTRAR_CARROSSEL_DESTAQUE = false;

const INTERVALO_MS = 5000;

export default function CarrosselDestaque({ destaques = DESTAQUES }: { destaques?: Destaque[] }) {
  const trilho = useRef<HTMLDivElement>(null);
  const [indice, setIndice] = useState(0);
  const [pausado, setPausado] = useState(false);

  const irPara = useCallback((i: number) => {
    const el = trilho.current;
    const slide = el?.children[i] as HTMLElement | undefined;
    if (!el || !slide) return;
    el.scrollTo({ left: slide.offsetLeft - el.offsetLeft, behavior: 'smooth' });
    setIndice(i);
  }, []);

  useEffect(() => {
    if (pausado || destaques.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const t = window.setInterval(() => {
      setIndice((atual) => {
        const proximo = (atual + 1) % destaques.length;
        const el = trilho.current;
        const slide = el?.children[proximo] as HTMLElement | undefined;
        if (el && slide) {
          el.scrollTo({ left: slide.offsetLeft - el.offsetLeft, behavior: 'smooth' });
        }
        return proximo;
      });
    }, INTERVALO_MS);

    return () => window.clearInterval(t);
  }, [pausado, destaques.length]);

  if (destaques.length === 0) return null;

  return (
    <div
      className={styles.palco}
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocusCapture={() => setPausado(true)}
      onBlurCapture={() => setPausado(false)}
      onTouchStart={() => setPausado(true)}
    >
      <div className={styles.trilho} ref={trilho} role="group" aria-label="Destaques">
        {destaques.map((d) => (
          <article key={d.src} className={styles.slide}>
            <div className={styles.arte}>
              <Image src={d.src} alt={d.alt} fill sizes="(max-width: 900px) 92vw, 520px" />
            </div>

            <div className={styles.texto}>
              <h3 className={styles.titulo}>{d.titulo}</h3>
              {d.linha && <p className={styles.linha}>{d.linha}</p>}
              <a href={d.href} className={styles.botao}>
                {d.rotuloDoBotao}
              </a>
            </div>
          </article>
        ))}
      </div>

      {destaques.length > 1 && (
        <>
          <button
            type="button"
            className={`${styles.seta} ${styles.setaEsquerda}`}
            onClick={() => irPara((indice - 1 + destaques.length) % destaques.length)}
            aria-label="Destaque anterior"
          >
            ‹
          </button>
          <button
            type="button"
            className={`${styles.seta} ${styles.setaDireita}`}
            onClick={() => irPara((indice + 1) % destaques.length)}
            aria-label="Próximo destaque"
          >
            ›
          </button>

          <div className={styles.bolinhas}>
            {destaques.map((d, i) => (
              <button
                key={d.src}
                type="button"
                className={`${styles.bolinha} ${i === indice ? styles.bolinhaAtiva : ''}`}
                onClick={() => irPara(i)}
                aria-label={`Ver destaque ${i + 1} de ${destaques.length}`}
                aria-current={i === indice ? 'true' : undefined}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
