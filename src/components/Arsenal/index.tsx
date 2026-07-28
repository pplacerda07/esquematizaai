'use client';

import { useState } from 'react';
import Image from 'next/image';
import HeadlineEsquema from '@/components/HeadlineEsquema';
import styles from './styles.module.css';

// Resumos reais (public/amostras-produto), duplicados para o scroll em loop.
const RESUMOS = ['9', '11', '12', '13', '14', '16'];

export default function Arsenal() {
  const [flipped, setFlipped] = useState(false);

  return (
    <section className={styles.arsenal} id="arsenal">
      <span className={`${styles.bgIcon} ${styles.bgIconLeft}`} aria-hidden="true" />
      <span className={`${styles.bgIcon} ${styles.bgIconRight}`} aria-hidden="true" />

      {/* A headline da seção é o esquema das duas janelas: a promessa e a entrega.
          O flashcard e o iPad abaixo são a demonstração dela, e seguem intocados. */}
      <div className={styles.header}>
        <HeadlineEsquema />
      </div>

      <div className={styles.grid}>
        {/* ESQUERDA: a prática, flashcards */}
        <div className={styles.col}>
          <h3 className={styles.colTitle}>Flashcards para retenção máxima</h3>
          <p className={styles.colSub}>
            Revisão ativa de verdade: você tenta responder e só então confere. É assim que o
            conteúdo gruda.
          </p>

          <button
            type="button"
            className={`${styles.flashcard} ${flipped ? styles.flashcardFlipped : ''}`}
            onClick={() => setFlipped((f) => !f)}
            aria-pressed={flipped}
            aria-label="Flashcard de exemplo. Clique para virar e ver a resposta."
          >
            <div className={styles.flashInner}>
              <div className={`${styles.flashFace} ${styles.flashFront}`}>
                <div className={styles.flashHead}>Direito Constitucional</div>
                <div className={styles.flashTopic}>
                  Dos Direitos e Garantias Fundamentais (arts. 5º a 17 da CF/1988)
                </div>
                <div className={styles.flashBody}>
                  <span className={styles.flashNum}>#00153</span> Qual remédio constitucional é
                  concedido sempre que a falta de norma regulamentadora torna inviável o
                  exercício dos direitos e liberdades constitucionais e das prerrogativas
                  inerentes à nacionalidade, à soberania e à cidadania?
                </div>
                <div className={styles.flashFoot}>frente · pergunta</div>
              </div>

              <div className={`${styles.flashFace} ${styles.flashBack}`}>
                <div className={styles.flashHead}>Resposta</div>
                <div className={styles.flashAnswer}>Mandado de Injunção</div>
                <ul className={styles.flashList}>
                  <li>Cabível quando falta norma regulamentadora (art. 5º, LXXI, CF/88)</li>
                  <li>Que inviabilize direitos e liberdades constitucionais</li>
                  <li>E as prerrogativas de nacionalidade, soberania e cidadania</li>
                </ul>
                <div className={styles.flashFoot}>verso · resposta</div>
              </div>
            </div>
          </button>

          <span className={styles.hint} aria-hidden="true">
            passe o mouse ou toque no card para virar
          </span>
        </div>

        {/* DIREITA: a teoria, resumos no iPad */}
        <div className={styles.col}>
          <h3 className={styles.colTitle}>A teoria que importa</h3>
          <p className={styles.colSub}>
            Resumos esquematizados com o histórico de cobrança de cada banca. Direto ao ponto,
            do jeito que a memória visual pede.
          </p>

          <div className={styles.ipad}>
            <span className={styles.ipadCamera} aria-hidden="true"></span>
            <div className={styles.ipadScreen}>
              <div className={styles.ipadScroll}>
                {[...RESUMOS, ...RESUMOS].map((n, i) => (
                  <Image
                    key={`${n}-${i}`}
                    src={`/amostras-produto/${n}.png`}
                    alt="Página de um resumo esquematizado do Esquematiza Aí"
                    width={1414}
                    height={2000}
                    className={styles.resumoImg}
                    aria-hidden={i >= RESUMOS.length ? 'true' : undefined}
                  />
                ))}
              </div>
            </div>
          </div>

          <span className={styles.hint} aria-hidden="true">
            página real de um resumo, rolando em tempo real
          </span>
        </div>
      </div>
    </section>
  );
}
