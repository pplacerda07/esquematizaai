'use client';

import { useEffect, useRef, useState } from 'react';
import { avisarGtm, comCampanha, type ItemMedido } from '@/lib/rastreio';
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
  item,
  externo,
}: {
  /** id do elemento que, ao sair da tela, faz a barra aparecer */
  alvoId: string;
  preco: string;
  precoAntigo?: string | null;
  rotulo: string;
  href: string;
  /** o produto, para medir o clique. Sem ele a barra segue funcionando sem medir. */
  item?: ItemMedido;
  externo: boolean;
}) {
  const [visivel, setVisivel] = useState(false);
  const jaMediu = useRef(false);
  const caixa = useRef<HTMLDivElement>(null);

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

  /**
   * Mede o clique e leva a campanha junto, igual ao botão do card.
   *
   * São dois botões que fazem a mesma coisa na mesma página, e por isso os dois
   * precisam medir: no celular esta barra é quem a pessoa clica quase sempre,
   * porque o card já saiu da tela quando ela terminou de ler.
   */
  function aoClicar(evento: React.MouseEvent<HTMLAnchorElement>) {
    if (!item) return;
    avisarGtm('begin_checkout', item);
    evento.currentTarget.href = comCampanha(href);
  }

  /**
   * Avisa o resto da página que esta barra está no ar, e o quanto ela ocupa.
   *
   * O botão flutuante do WhatsApp mora no mesmo canto e ficava POR CIMA do
   * "Comprar agora": o Sérgio abriu no celular e o dedo caía no WhatsApp em vez
   * do checkout. Ele não pode simplesmente subir sempre, porque nas outras
   * páginas não existe barra e ele ficaria flutuando alto à toa.
   *
   * A altura vai junto porque ela muda com a tela; assim o botão sobe exatamente
   * o necessário, em vez de um valor chutado que quebra quando a barra muda.
   */
  useEffect(() => {
    const corpo = document.body;
    if (visivel) {
      corpo.dataset.barraCompra = 'visivel';
      const altura = caixa.current?.offsetHeight ?? 72;
      corpo.style.setProperty('--altura-barra-compra', `${altura}px`);
    } else {
      delete corpo.dataset.barraCompra;
    }
    return () => {
      delete corpo.dataset.barraCompra;
    };
  }, [visivel]);

  return (
    <div
      ref={caixa}
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
          onClick={aoClicar}
        >
          {rotulo}
        </a>
      </div>
    </div>
  );
}
