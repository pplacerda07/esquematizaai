'use client';

import React, { useState } from 'react';
import styles from './styles.module.css';

type QA = { q: string; a: string };

const ITEMS: QA[] = [
  {
    q: 'R$ 3.997 cabe no meu orçamento?',
    a: 'Dá pra pagar à vista por R$ 3.997, com mais 5% de desconto no pix, ou em até doze vezes de R$ 413,38 no cartão. Como inclui acompanhamento, material teórico e material de revisão, você não gasta mais nada por fora. E se já é aluno do Estratégia, tem 15% de desconto.',
  },
  {
    q: 'Trabalho quarenta horas por semana, dou conta?',
    a: 'O plano é montado a partir do tempo que você tem. Se são duas horas por dia, é nesse tamanho que as metas chegam. A maioria dos mentorados concilia trabalho e estudo justamente porque o plano respeita a rotina.',
  },
  {
    q: 'E se eu não passar?',
    a: 'Garantia de aprovação não existe em produto sério nenhum, porque depende da sua execução na prova. O que a gente garante é o que você vai aprender a estudar competitivamente, o método, o acompanhamento e o material que colocaram alunos da casa nos quatro grandes fiscos em 2026. E você ainda tem sete dias pra testar tudo por dentro e pedir reembolso se não fizer sentido.',
  },
  {
    q: 'Funciona pra quem está começando do zero?',
    a: 'Sim. A primeira fase é a Construção de Base, feita justamente pra quem começa, montando a fundação do zero e no seu ritmo. Quem entra nessa fase é quem mais ganha, porque não vai perder meses tentando achar o jeito certo de estudar.',
  },
  {
    q: 'É só pra fiscal ou serve pra controle?',
    a: 'Serve pras duas frentes. A mentoria atende concursos fiscais, de SEFAZ, ISS e Receita, e de controle, de TCEs, TCU, CGU, CGEs e CGMs, com plano ajustado à banca de cada um.',
  },
  {
    q: 'Já assino o Estratégia, vale a pena mesmo assim?',
    a: 'Vale, e sai mais barato. Como você não precisa do material teórico de novo, tem 15% de desconto e a mentoria fica em R$ 3.397,45.',
  },
  {
    q: 'Em quanto tempo vejo resultado?',
    a: 'Os primeiros ganhos aparecem já nas primeiras semanas, na organização da rotina e na clareza do que estudar todo dia. A evolução no acerto das questões vem ao longo dos ciclos de revisão.',
  },
  {
    q: 'Preciso largar o emprego?',
    a: 'Não. O plano foi feito pra caber na rotina de quem trabalha, e na maioria dos casos largar o emprego não é necessário nem recomendado.',
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className={styles.list}>
      {ITEMS.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className={`${styles.item} ${isOpen ? styles.itemOpen : ''}`}>
            <button
              type="button"
              className={styles.question}
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : i)}
            >
              <span>{item.q}</span>
              <span className={styles.icon} aria-hidden="true">{isOpen ? '−' : '+'}</span>
            </button>
            <div className={styles.answerWrap} hidden={!isOpen}>
              <p className={styles.answer}>{item.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
