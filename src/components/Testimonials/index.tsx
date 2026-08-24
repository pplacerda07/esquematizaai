'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from './styles.module.css';

/**
 * Depoimentos de alunos, em prints do WhatsApp.
 *
 * POR QUE PRINT E TRANSCRIÇÃO JUNTOS:
 * antes a seção era uma esteira de prints passando, e ninguém lê texto pequeno
 * dentro de imagem que anda. Cada cartão traz a janelinha com o print de um
 * lado e a transcrição do outro, para ler com calma.
 *
 * SEM SELO DE "É REAL":
 * havia aqui uma linha dizendo que os prints eram reais e um rodapé repetindo
 * "print real, recebido no WhatsApp" em cada cartão. Insistir que é verdade
 * produz o efeito contrário, cara de página que precisa se defender. O print
 * mostra o WhatsApp sozinho; não precisa de legenda jurando.
 *
 * As transcrições são fiéis ao que está escrito na imagem, com a pontuação e
 * as abreviações do aluno. Corrigir o português deles seria reescrever
 * depoimento, e aí deixa de ser depoimento.
 */

type Depoimento = {
  src: string;
  alt: string;
  /** o que está escrito no print, palavra por palavra */
  texto: string;
  /** contexto curto, quando a mensagem sozinha não se explica */
  contexto?: string;
  destaque?: boolean;
};

const DEPOIMENTOS: Depoimento[] = [
  {
    src: '/reviews/review-3.webp',
    alt: 'Print de conversa em que uma aluna conta que foi aprovada em 19º lugar para procuradora no ES e diz que o material do Esquematiza Aí é o melhor entre os flashcards que testou',
    contexto: 'Aprovada em 19º lugar para procuradora, ES',
    // Cortado o miolo, que era tutorial de Anki: como baixar, que é de graça, o
    // canal do YouTube. O [...] marca o corte, e a frase final fica porque é o
    // único ponto da mensagem em que ela fala do nosso material.
    texto:
      'Boa tarde. Passando para dar minha contribuição. Anki na minha vida foi coisa de Deus, pois de aprovada nos concursos nas posições bem afastadas, baixei para a posição 19 para procuradora aqui do ES (dentro da faixa de corte que é 20 primeiros colocados). Eu descobri o Anki por acaso no YouTube. [...] Comprei também o material do esquematiza aí que é o melhor de todos os flashcards que já baixei pra testar.',
    destaque: true,
  },
  {
    src: '/reviews/review-2.webp',
    alt: 'Print de conversa em que um aluno elogia a qualidade dos resumos e a jurisprudência relacionada ao assunto',
    texto:
      'Cara, a qualidade dos resumos está muito foda!! Ter a jurisprudência relacionada no assunto tb ajuda mt. Confesso que estou ansioso pela liberação do resumo de constitucional. Rsrsrs',
  },
  {
    src: '/reviews/review-4.webp',
    alt: 'Print de conversa em que um aluno diz que a seção saiba mais é o diferencial e que os layouts são impecáveis',
    texto:
      'Esse saiba mais é o pulo do gato! É o diferencial do diferencial se vocês! Além da organização, layouts impecáveis claro. Uma leitura muito agradável. Até agora, já teste vários fornecedores. Não tem nada igual no mercado...',
  },
  {
    src: '/reviews/review-1.webp',
    alt: 'Print de conversa em que um aluno parabeniza pela rapidez na entrega dos resumos do combo fiscal',
    texto:
      'Boa tarde mestre. Pow, parabéns pela celeridade na entrega dos resumos do combo fiscal. Superou minhas expectativas',
  },
  {
    src: '/reviews/review-5.webp',
    alt: 'Print de conversa em que um aluno diz que confia no trabalho do Esquematiza Aí e pede material de Direito do Trabalho',
    contexto: 'Respondendo se já achou material parecido em outro lugar',
    texto:
      'Nada! Faz para Trabalho e Processo do Trabalho... Ainda não achei nenhum... Confio super no trabalho de vocês,. Mas a galera tá bem aí pra DT.. rsss',
  },
];

const INTERVALO_MS = 3000;

export default function Testimonials() {
  const trilho = useRef<HTMLDivElement>(null);
  const [indice, setIndice] = useState(0);
  const [pausado, setPausado] = useState(false);

  const irPara = useCallback((i: number) => {
    const el = trilho.current;
    if (!el) return;
    const cartao = el.children[i] as HTMLElement | undefined;
    if (!cartao) return;
    el.scrollTo({ left: cartao.offsetLeft - el.offsetLeft, behavior: 'smooth' });
    setIndice(i);
  }, []);

  /**
   * Avanço automático a cada 3s, como o Sérgio pediu.
   *
   * Pausa quando o mouse está em cima, quando algo do bloco tem foco e enquanto
   * a pessoa arrasta: depoimento é para ler, e texto que foge no meio da frase
   * irrita mais do que ajuda. Quem pede menos movimento no sistema não recebe
   * avanço nenhum e navega só pelos botões.
   */
  useEffect(() => {
    if (pausado) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const t = window.setInterval(() => {
      setIndice((atual) => {
        const proximo = (atual + 1) % DEPOIMENTOS.length;
        const el = trilho.current;
        const cartao = el?.children[proximo] as HTMLElement | undefined;
        if (el && cartao) {
          el.scrollTo({ left: cartao.offsetLeft - el.offsetLeft, behavior: 'smooth' });
        }
        return proximo;
      });
    }, INTERVALO_MS);

    return () => window.clearInterval(t);
  }, [pausado]);

  // mantém as bolinhas em dia quando a pessoa arrasta com o dedo ou o trackpad
  const aoRolar = () => {
    const el = trilho.current;
    if (!el) return;
    const filhos = [...el.children] as HTMLElement[];
    const meio = el.scrollLeft + el.clientWidth / 2;
    const maisProximo = filhos.reduce(
      (melhor, c, i) =>
        Math.abs(c.offsetLeft - el.offsetLeft + c.offsetWidth / 2 - meio) <
        Math.abs(filhos[melhor].offsetLeft - el.offsetLeft + filhos[melhor].offsetWidth / 2 - meio)
          ? i
          : melhor,
      0,
    );
    setIndice(maisProximo);
  };

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
          onScroll={aoRolar}
          tabIndex={0}
          role="group"
          aria-label="Depoimentos de alunos"
        >
          {DEPOIMENTOS.map((d) => (
            <figure
              key={d.src}
              className={`${styles.cartao} ${d.destaque ? styles.cartaoDestaque : ''}`}
            >
              {/* Janela do print: recorte fixo, como uma telinha. Mostra o
                  suficiente para provar que a mensagem existe sem tomar o cartão. */}
              <div className={styles.janela}>
                <Image
                  src={d.src}
                  alt={d.alt}
                  width={720}
                  height={560}
                  sizes="(max-width: 640px) 90vw, 150px"
                  className={styles.print}
                />
              </div>

              <div className={styles.conteudo}>
                {d.contexto && <p className={styles.contexto}>{d.contexto}</p>}

                <blockquote className={styles.texto}>{d.texto}</blockquote>
              </div>
            </figure>
          ))}
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
                key={d.src}
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
