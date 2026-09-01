'use client';

import React, { useState } from 'react';
import styles from './styles.module.css';

type QA = { q: string; a: string };

/**
 * Perguntas da página de mentoria, na copy de 29/08/2026.
 *
 * A ORDEM NÃO É ALEATÓRIA. Abre em "quem será o meu mentor", que é a primeira
 * dúvida de quem vai pagar quatro mil reais, e só depois entra em preço. As
 * duas de reembolso e cancelamento ficam perto do fim porque quem chega até lá
 * já está decidindo, e é ali que a objeção final aparece.
 */
const ITEMS: QA[] = [
  {
    q: 'Quem será o meu mentor?',
    a: 'A mentoria foi criada e é liderada pelo Prof. Sérgio Furtado, autor do Esquematiza Aí, especialista em métodos de estudo e revisão, com mais de 10 anos de experiência em concursos públicos, Auditor Fiscal do Estado, Coordenador no Estratégia Concursos (Rodadas Avançadas de Simulados) e ex-coordenador e professor no TEC Concursos. O acompanhamento é realizado pelo Prof. Sérgio Furtado e/ou por mentores da equipe do Esquematiza Aí, todos capacitados e supervisionados por ele na aplicação do método. O Esquematiza Aí surgiu em 2019 e hoje conta com mais de 30.000 alunos e milhares de aprovados em todo o país.',
  },
  {
    q: 'O que está incluso em todos os planos?',
    a: 'Todos os planos, recorrentes e anuais, incluem: planejamento completo com metas diárias; plataforma de estudos pra gerenciamento e organização das tarefas; uma reunião individual inicial com o mentor, na qual são apresentados o planejamento e a estratégia de estudos; assessoria pedagógica pra aplicação de diferentes métodos de estudo e revisão; orientação na escolha de concursos, com análise estratégica de editais publicados e concursos previstos; e descontos exclusivos com nossos parceiros.',
  },
  {
    q: 'Quanto custa e como funciona o pagamento?',
    a: 'São cinco planos. Dois recorrentes, cobrados no cartão e renovados automaticamente até o cancelamento: o Recorrente Mensal, a R$ 497/mês, e o Recorrente Mensal + Estratégia, a R$ 597/mês com a Assinatura Premium do Estratégia inclusa. E três anuais, de contratação única de 12 meses: o Anual, a R$ 4.997 à vista ou 12x de R$ 516,80 no cartão, total de R$ 6.201,60; o Anual VIP, a R$ 5.997 à vista ou 12x de R$ 620,23, total de R$ 7.442,76, com todos os materiais Esquematiza Aí inclusos; e o Anual Premium, a R$ 6.997 à vista ou 12x de R$ 723,65, total de R$ 8.683,80, com materiais e Estratégia inclusos. À vista você paga em cartão, boleto ou pix. Faça sua aplicação e a equipe confirma com você a disponibilidade de vagas do plano escolhido.',
  },
  {
    q: 'Preciso possuir uma assinatura do Estratégia Concursos?',
    a: 'Sim. Toda a metodologia da mentoria, incluindo o planejamento e as metas diárias, é estruturada com base nos materiais disponibilizados pelo Estratégia Concursos. Nos planos que não incluem a Assinatura Premium, é obrigatório que você possua e mantenha uma assinatura ativa durante todo o período da mentoria. Se você não tem assinatura ativa, precisa optar por um dos planos que já a incluem: o Recorrente Mensal + Estratégia ou o Anual Premium.',
  },
  {
    q: 'Qual a diferença entre o plano recorrente mensal e o plano anual?',
    a: 'O recorrente mensal renova automaticamente a cada mês, até você cancelar, e é ideal pra quem quer testar o acompanhamento sem compromisso longo. O anual é a contratação fechada de 12 meses, com as condições e os descontos garantidos durante todo o período; o parcelamento em até 12 vezes é apenas uma forma de pagamento do valor total, não transforma o plano em mensal.',
  },
  {
    q: 'Trabalho quarenta horas por semana, dou conta?',
    a: 'O plano é montado a partir do tempo que você tem. Se são duas horas por dia, é nesse tamanho que as metas chegam. A maioria dos mentorados concilia trabalho e estudo justamente porque o plano respeita a rotina.',
  },
  {
    q: 'Funciona pra quem está começando do zero?',
    a: 'Sim. A primeira fase é a Construção de Base, feita justamente pra quem começa, montando a fundação do zero e no seu ritmo. Quem entra nessa fase é quem mais ganha, porque não vai perder meses tentando achar o jeito certo de estudar.',
  },
  {
    q: 'A mentoria serve pra qual área de concurso?',
    a: 'O método vale pra qualquer área, porque o critério é sempre o mesmo: peso de cada matéria na sua banca e revisão espaçada com resumos e flashcards. A mentoria atende a área fiscal (SEFAZ, ISS e Receita), controle e gestão (TCEs, TCU, CGU, CGEs e CGMs), carreiras policiais, tribunais e outras áreas, com plano ajustado à banca e ao edital de cada uma.',
  },
  {
    q: 'E se eu não passar?',
    a: 'Garantia de aprovação não existe em produto sério nenhum, porque depende da sua execução na prova. O que a gente garante é o que você vai aprender a estudar competitivamente, o método, o acompanhamento e o material que colocaram nossos alunos nos quatro grandes fiscos em 2026. E você ainda tem sete dias pra testar tudo por dentro e pedir reembolso se não fizer sentido.',
  },
  {
    q: 'O que está incluso nos materiais do Esquematiza Aí?',
    a: 'Todos os Combos e Assinaturas do Esquematiza Aí abrangidos pelo plano contratado e disponíveis durante o período de vigência da mentoria.',
  },
  {
    q: 'Por quanto tempo terei acesso aos materiais e à assinatura do Estratégia?',
    a: 'Nos planos que incluem os materiais do Esquematiza Aí e/ou a Assinatura Premium do Estratégia Concursos, o acesso permanece ativo durante toda a vigência da mentoria. Encerrado o período contratado, os acessos vinculados ao plano são automaticamente interrompidos, salvo em caso de nova contratação.',
  },
  {
    q: 'Como funciona o reembolso?',
    a: 'O pedido deve ser enviado por e-mail para contato@esquematizaai.com, dentro do prazo de 7 dias contado da confirmação do pagamento. Após esse prazo, não há reembolso por desistência do aluno.',
  },
  {
    q: 'Como funciona o cancelamento? Existe multa?',
    a: 'Não existe multa por cancelamento. No plano recorrente mensal, o cancelamento impede a próxima renovação automática e você mantém o acesso à mentoria e aos benefícios do plano até o término do período já pago. No plano anual, a contratação é de 12 meses e o parcelamento é apenas uma forma de pagamento do valor total, então a desistência após os 7 dias não interrompe a cobrança das parcelas restantes; o acesso permanece disponível até o fim dos 12 meses contratados. Ao término do período, os acessos vinculados ao plano são encerrados automaticamente. As condições completas estão nos Termos de Uso.',
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
