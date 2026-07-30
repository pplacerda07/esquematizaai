'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './styles.module.css';

/**
 * Barra fixa no rodapé da tela com o botão de compra.
 *
 * Só aparece quando o botão de compra de verdade sai de vista. Mostrar as duas
 * ao mesmo tempo seria dois CTAs iguais brigando na mesma tela, e a barra
 * roubaria espaço bem na hora em que a pessoa está lendo a oferta.
 *
 * Usa IntersectionObserver e não evento de scroll: o navegador avisa quando o
 * alvo entra e sai, sem rodar código a cada pixel rolado.
 */
export default function BarraCompra({
  alvoId,
  preco,
  precoAntigo,
  rotulo,
  href,
  externo,
}: {
  /** id do elemento que, ao sair da tela, faz a barra aparecer */
  alvoId: string;
  preco: string;
  precoAntigo?: string | null;
  rotulo: string;
  href: string;
  externo: boolean;
}) {
  const [visivel, setVisivel] = useState(false);
  const jaMediu = useRef(false);

  useEffect(() => {
    const alvo = document.getElementById(alvoId);
    if (!alvo) return;

    const obs = new IntersectionObserver(
      ([entrada]) => {
        jaMediu.current = true;
        setVisivel(!entrada.isIntersecting);
      },
      { rootMargin: '-80px 0px 0px 0px' },
    );
    obs.observe(alvo);
    return () => obs.disconnect();
  }, [alvoId]);

  return (
    <div
      className={`${styles.barra} ${visivel ? styles.barraVisivel : ''}`}
      aria-hidden={!visivel}
    >
      <div className={styles.conteudo}>
        <div className={styles.precos}>
          {precoAntigo && <span className={styles.antigo}>{precoAntigo}</span>}
          <span className={styles.preco}>{preco}</span>
        </div>
        <a
          className={styles.botao}
          href={href}
          {...(externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          /* fora de vista a barra sai da ordem de tabulação, senão o teclado
             para num botão que ninguém enxerga */
          tabIndex={visivel ? 0 : -1}
        >
          {rotulo}
        </a>
      </div>
    </div>
  );
}
