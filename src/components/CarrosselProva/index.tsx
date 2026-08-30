'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ITENS_PROVA } from '@/data/prova-social';
import styles from './styles.module.css';

/**
 * Carrossel de prova social, em arco 3D, no modelo que o Pedro mandou.
 *
 * COMO FUNCIONA: cada cartão recebe uma posição calculada a partir da distância
 * dele até o centro. Quem está no centro fica reto e em tamanho real; os
 * vizinhos deslizam para o lado, giram em torno do eixo vertical e recuam em
 * profundidade, o que dá o efeito de leque. Tudo em `transform`, então quem
 * anima é a placa de vídeo, e a transição do CSS cuida do movimento entre uma
 * posição e outra.
 *
 * POR QUE ARCO RASO E NÃO O ANEL DA REFERÊNCIA. A referência monta um anel
 * fechado: 14 cartões em círculo, todos girando juntos. Fica lindo, mas o
 * cartão central é o mais AFASTADO da câmera, e a perspectiva o encolhe. Medi
 * no celular: 169px de largura, com o texto encolhendo junto. Para as fotos da
 * referência isso não incomoda; para um parágrafo de 400 caracteres, deixa
 * ilegível exatamente o cartão que a pessoa está tentando ler. No arco raso o
 * central fica no plano da tela, em tamanho real, e o leque acontece à volta
 * dele.
 *
 * O QUE VEM DA REFERÊNCIA: o leque em perspectiva, o arrasto com o dedo, o
 * encaixe no cartão mais próximo, o contador grande, as bolinhas e as setas.
 *
 * ROLAGEM DA PÁGINA PRESERVADA: a referência usa `touch-action: none`, que no
 * celular prende o dedo na seção. Aqui é `pan-y`, então o arrasto lateral é do
 * carrossel e o vertical continua sendo da página.
 */

const ITENS = ITENS_PROVA;

/** quantos cartões aparecem de cada lado do central */
const VIZINHOS = 3;

/** o quanto o dedo precisa andar para trocar de cartão */
const ARRASTO_MINIMO = 60;

/**
 * Distância de um cartão até o centro, pelo caminho mais curto.
 * Com 14 itens, o de índice 13 está a uma casa do de índice 0, não a treze.
 */
function distancia(i: number, centro: number, total: number): number {
  let d = ((i - centro) % total + total) % total;
  if (d > total / 2) d -= total;
  return d;
}

export default function CarrosselProva() {
  const [centro, setCentro] = useState(0);
  const [arrastoAtual, setArrastoAtual] = useState(0);

  const arrastando = useRef(false);
  const xInicial = useRef(0);
  const palco = useRef<HTMLDivElement>(null);

  const irPara = useCallback((delta: number) => {
    setCentro((c) => ((c + delta) % ITENS.length + ITENS.length) % ITENS.length);
  }, []);

  const aoPressionar = (e: React.PointerEvent) => {
    arrastando.current = true;
    xInicial.current = e.clientX;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const aoMover = (e: React.PointerEvent) => {
    if (!arrastando.current) return;
    setArrastoAtual(e.clientX - xInicial.current);
  };

  const aoSoltar = () => {
    if (!arrastando.current) return;
    arrastando.current = false;
    const d = arrastoAtual;
    setArrastoAtual(0);
    if (Math.abs(d) > ARRASTO_MINIMO) irPara(d < 0 ? 1 : -1);
  };

  // as setas do teclado só fazem sentido quando o carrossel está em foco
  const aoTeclar = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      irPara(1);
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      irPara(-1);
      e.preventDefault();
    }
  };

  // solta o arrasto mesmo se o dedo sair da área
  useEffect(() => {
    const cancelar = () => {
      arrastando.current = false;
      setArrastoAtual(0);
    };
    window.addEventListener('pointercancel', cancelar);
    return () => window.removeEventListener('pointercancel', cancelar);
  }, []);

  const item = ITENS[centro];

  return (
    <div className={styles.bloco}>
      <div
        ref={palco}
        className={`${styles.palco} ${arrastando.current ? styles.arrastando : ''}`}
        onPointerDown={aoPressionar}
        onPointerMove={aoMover}
        onPointerUp={aoSoltar}
        onKeyDown={aoTeclar}
        tabIndex={0}
        role="group"
        aria-label={`${ITENS.length} depoimentos de alunos. Use as setas do teclado para navegar.`}
      >
        <div className={styles.chao} aria-hidden="true" />

        {ITENS.map((it, i) => {
          const d = distancia(i, centro, ITENS.length);
          // fora do leque o cartão nem é posicionado: 14 cartões empilhados
          // com transform custam caro e ninguém vê os do fim
          if (Math.abs(d) > VIZINHOS) return null;

          const noCentro = d === 0;
          // o arrasto empurra o leque junto com o dedo, para o movimento
          // acompanhar a mão em vez de saltar só no fim
          const empurrao = arrastando.current ? arrastoAtual * 0.35 : 0;

          return (
            <article
              key={it.tipo === 'aprovacao' ? `${it.nome}-${it.colocacao}` : it.src}
              className={`${styles.cartao} ${noCentro ? styles.cartaoCentro : ''}`}
              style={{
                ['--d' as string]: d,
                ['--ad' as string]: Math.abs(d),
                ['--empurrao' as string]: `${empurrao}px`,
                zIndex: VIZINHOS - Math.abs(d),
              }}
              aria-hidden={noCentro ? undefined : 'true'}
            >
              <div className={styles.miolo}>
                {it.tipo === 'aprovacao' ? (
                  <>
                    <span className={styles.selo}>{it.colocacao}º lugar</span>
                    <blockquote className={styles.citacao}>{it.citacao}</blockquote>
                    <footer className={styles.autor}>
                      <cite className={styles.nome}>{it.nome}</cite>
                      <span className={styles.cargo}>{it.cargo}</span>
                    </footer>
                  </>
                ) : (
                  <>
                    {/* A miniatura do print saiu a pedido do Sérgio. Em 62px
                        ela não se lia, então não provava nada, e ainda competia
                        com a mensagem transcrita, que é o que a pessoa lê de
                        verdade. O selo azul já diz de onde veio. */}
                    <span className={`${styles.selo} ${styles.seloMensagem}`}>WhatsApp</span>
                    <blockquote className={styles.citacao}>{it.texto}</blockquote>
                    {it.contexto && (
                      <footer className={styles.autor}>
                        <span className={styles.cargo}>{it.contexto}</span>
                      </footer>
                    )}
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* O contador "14 / 14" saiu a pedido do Sérgio: número pequeno ao lado
          de prova social vira objeção, porque quatorze depoimentos podem soar
          como poucos para quem não sabe que são só os que temos por escrito.
          As bolinhas e as setas continuam dando a noção de onde a pessoa está. */}
      <div className={styles.controles}>
        <div className={styles.bolinhas} role="tablist" aria-label="Ir para um depoimento">
          {ITENS.map((it, i) => (
            <button
              key={it.tipo === 'aprovacao' ? `p-${it.nome}-${it.colocacao}` : `p-${it.src}`}
              type="button"
              role="tab"
              className={`${styles.bolinha} ${i === centro ? styles.bolinhaAtiva : ''}`}
              onClick={() => setCentro(i)}
              aria-label={`Depoimento ${i + 1} de ${ITENS.length}`}
              aria-selected={i === centro}
            />
          ))}
        </div>

        <div className={styles.setas}>
          <button
            type="button"
            className={styles.seta}
            onClick={() => irPara(-1)}
            aria-label="Depoimento anterior"
          >
            ‹
          </button>
          <button
            type="button"
            className={styles.seta}
            onClick={() => irPara(1)}
            aria-label="Próximo depoimento"
          >
            ›
          </button>
        </div>
      </div>

      {/* Fora da tela, para o leitor de tela e para o buscador: o leque esconde
          13 dos 14 depoimentos, e prova social que o Google não lê não conta. */}
      <div className={styles.paraLeitores}>
        <h3>Depoimentos de alunos</h3>
        <ul>
          {ITENS.map((it) => (
            <li key={it.tipo === 'aprovacao' ? `s-${it.nome}-${it.colocacao}` : `s-${it.src}`}>
              {it.tipo === 'aprovacao'
                ? `${it.nome}, ${it.cargo}, aprovad${it.genero === 'f' ? 'a' : 'o'} em ${it.colocacao}º lugar: ${it.citacao}`
                : `Mensagem recebida no WhatsApp: ${it.texto}`}
            </li>
          ))}
        </ul>
      </div>

      <p className={styles.dica} aria-hidden="true">
        arraste para o lado, ou use as setas
      </p>
      <span className={styles.aoVivo} aria-live="polite">
        {item.tipo === 'aprovacao' ? `${item.nome}, ${item.colocacao}º lugar` : 'Mensagem no WhatsApp'}
      </span>
    </div>
  );
}
