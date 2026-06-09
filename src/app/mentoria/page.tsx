import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import styles from './styles.module.css';
import SalesNav from '@/components/SalesNav';
import SalesFooter from '@/components/SalesFooter';
import FloatingCta from '@/components/FloatingCta';
import CtaButton from '@/components/CtaButton';
import Faq from '@/components/Faq';
import RevealController from '@/components/RevealController';
import SocialProofToasts from '@/components/SocialProofToasts';
import CountUp from '@/components/CountUp';
import YouTubeEmbed from '@/components/YouTubeEmbed';
import ScrollTrail from '@/components/ScrollTrail';
import StackedCards from '@/components/StackedCards';

export const metadata: Metadata = {
  title: 'Esquematiza Mentoria | Aprovação em concursos fiscais e de controle',
  description:
    'A mentoria que prioriza o que cada banca cobra, com plano individual e mentores aprovados. Alunos da casa nas listas de SEFAZ-SP, SEFA-PA, SEFAZ-MT e SEFAZ-RN em 2026.',
};

// stagger: define o atraso da animação de entrada de cada elemento
const delay = (ms: number) => ({ ['--reveal-delay']: `${ms}ms` } as React.CSSProperties);

const PILLARS = [
  { letter: 'T', title: 'Teoria', desc: 'Para entender o conceito', tone: 'cold' },
  { letter: 'Q', title: 'Questões', desc: 'Para treinar o que a banca cobra', tone: 'hot' },
  { letter: 'R', title: 'Revisão', desc: 'Para não esquecer o que aprendeu', tone: 'green' },
  { letter: 'S', title: 'Simulados', desc: 'Para ensaiar a prova inteira', tone: 'cold' },
] as const;

const PILLAR_TONE: Record<string, string> = {
  cold: styles.toneCold,
  hot: styles.toneHot,
  green: styles.toneGreen,
};

const DELIVERABLES: [string, string][] = [
  ['Planejamento estratégico de estudos, pré e pós-edital', 'Reuniões de organização no começo pra montar o seu plano completo, seja do zero ou aproveitando o que você já estudou.'],
  ['Plataforma com metas diárias', 'Você abre o app e já sabe o que estudar no dia, entre teoria, questões e revisão, no tempo que você tem.'],
  ['Relatórios semanais de desempenho', 'Toda segunda você recebe o painel da sua evolução, com comparativo entre os mentorados pra saber exatamente onde está.'],
  ['Encontros quinzenais de mentoria ao vivo', 'Ora com tema específico da sua área pra aprofundar, ora como plantão de dúvidas com o Pietro e o Sérgio.'],
  ['Assinatura Total Esquematiza Aí', 'Resumos e flashcards de todas as matérias, pré-edital e os combos de pós-edital, atualizados pelo tempo que você ficar na mentoria. Vendida à parte por R$ 1.997.'],
  ['Assinatura Premium do Estratégia Concursos', 'O material teórico mais completo do mercado, incluído no plano pra você estudar a teoria de qualquer matéria. Vendida à parte por R$ 2.628.'],
  ['Módulo de Discursiva', 'O passo a passo da redação técnica que a banca espera, pra você não ser eliminado na segunda fase.'],
  ['Simulados exclusivos dos mentorados', 'Provas no ritmo e no ambiente oficiais pra medir desempenho e acostumar com a prova.'],
  ['Acesso direto ao Pietro e ao Sérgio todos os dias', 'Dúvida por texto, áudio ou vídeo no WhatsApp, mais a comunidade exclusiva de mentorados.'],
  ['Descontos na rede de parceiros', 'Condições de aluno na TEC Concursos, na DP e em outros parceiros.'],
];

export default function MentoriaPage() {
  return (
    <div className={styles.pageRoot}>
      <ScrollTrail />
      <SalesNav />

      <main>
        {/* Bloco 01 — Hero */}
        <section className={styles.hero}>
          <div className={`${styles.orb} ${styles.orbTopLeft}`} />
          <div className={`${styles.orb} ${styles.orbBottomRight}`} />
          <div className={styles.heroGrid} aria-hidden="true" />

          <div className={styles.heroContainer}>
            <div className={`${styles.heroBadge} ${styles.heroIn}`} style={delay(0)}>
              <span className={styles.pulseDot} />
              Concursos fiscais e de controle
            </div>

            <h1 className={`${styles.heroTitle} ${styles.heroIn}`} style={delay(90)}>
              Estudar mais horas é o conselho que mais{' '}
              <span className={styles.titleHighlight}>reprova</span>.
            </h1>

            <p className={`${styles.heroSubtitle} ${styles.heroIn}`} style={delay(200)}>
              Em concursos fiscais e de controle, o que aprova é uma estratégia que
              prioriza o que cada banca cobra, com plano individual e mentores aprovados
              te acompanhando de perto.
            </p>

            {/* VSL no topo: o visitante já se depara com o vídeo pra qualificar */}
            <div className={`${styles.vslFrame} ${styles.heroIn}`} style={delay(320)}>
              <YouTubeEmbed />
            </div>

            <ul className={styles.heroBullets}>
              <li className={styles.heroIn} style={delay(440)}>
                <span className={styles.checkIcon}>✓</span>
                Enquanto você revisa aleatoriamente, a banca cobra justamente o que o seu
                cronograma deixou pra trás. Aqui você revisa pelo peso que cada matéria
                tem na prova que você quer passar, seja ela fiscal ou de controle.
              </li>
              <li className={styles.heroIn} style={delay(520)}>
                <span className={styles.checkIcon}>✓</span>
                Cada mês adiado sem direção é um contracheque de R$ 20 mil que não entra
                na sua conta. Tendo duas horas por dia ou o dia inteiro livre, o plano se
                ajusta à sua rotina e mira a prova mais próxima ou uma preparação pra sua
                área como um todo.
              </li>
              <li className={styles.heroIn} style={delay(600)}>
                <span className={styles.checkIcon}>✓</span>
                Os aprovados que você acompanha no Instagram seguiram um critério de
                incidência por banca. Aqui você recebe esse mesmo critério aplicado ao
                seu plano individual, semana após semana.
              </li>
            </ul>

            <div className={`${styles.heroCta} ${styles.heroIn}`} style={delay(700)}>
              <CtaButton variant="gradient">Quero o diagnóstico do meu plano de estudos</CtaButton>
              <p className={styles.heroCtaNote}>Sem checkout. A conversa começa direto no WhatsApp.</p>
            </div>

            <div className={`${styles.trustStrip} ${styles.heroIn}`} style={delay(800)}>
              <span className={styles.trustLabel}>Alunos da casa aprovados em 2026</span>
              <div className={styles.trustBadges}>
                <span>SEFAZ-SP</span>
                <span>SEFA-PA</span>
                <span>SEFAZ-MT</span>
                <span>SEFAZ-RN</span>
              </div>
            </div>
          </div>
        </section>

        {/* Bloco 02 — Dor */}
        <section className={`${styles.section} ${styles.sectionDark}`}>
          <div className={`${styles.orb} ${styles.orbDarkRight}`} />
          <div className={styles.containerNarrow}>
            <span className={`${styles.eyebrow} ${styles.eyebrowHot}`} data-reveal>Por que você empaca</span>
            <h2 className={styles.sectionTitle} data-reveal style={delay(80)}>
              Existe um motivo técnico pra você estudar muito e render pouco em concursos
              fiscais e de controle.
            </h2>
            <div className={styles.prose}>
              <p data-reveal style={delay(120)}>
                Todo domingo à noite você abre a planilha e monta o cronograma da semana.
                Na terça já furou, porque um plantão no trabalho comeu duas horas e você
                não soube o que cortar. Na quarta você até estuda, mas estuda no escuro,
                sem saber se aquela matéria vale o tempo que está gastando nela.
              </p>
              <p data-reveal style={delay(160)}>
                Para resolver isso, você compra mais um curso completo, seja do Estratégia,
                do Gran ou de qualquer outro, com duzentas aulas e aquela sensação boa de
                quem finalmente vai organizar a vida. Só que três meses depois você
                continua na mesma faixa de acerto, com a diferença de que agora tem
                duzentas aulas para dar conta em vez de cem.
              </p>
              <p data-reveal style={delay(200)}>
                A causa não é preguiça nem falta de inteligência. É que ninguém te mostrou
                que perto de 40% dessas aulas têm incidência baixa na banca que você quer,
                e por isso você revisa por data, esquece o que não entrou no ciclo e
                descobre, na prova, que ela cobrou justamente o que ficou pra trás. O
                esforço existe, mas a direção não.
              </p>
              <p data-reveal style={delay(240)}>
                Enquanto isso, o aprovado que você acompanha no Instagram posta a posse, a
                sua mãe pergunta quando isso acaba, e você começa a achar que o problema é
                você. Quando, na verdade, o problema é o método que te venderam: volume de
                conteúdo no lugar de leitura de banca, e curso genérico no lugar de um
                material de revisão que prioriza o que realmente cai.
              </p>
            </div>
          </div>
        </section>

        {/* Bloco 03 — Prova social */}
        <section className={`${styles.section} ${styles.sectionTint}`}>
          <div className={`${styles.orb} ${styles.orbTintLeft}`} />
          <div className={styles.containerNarrow}>
            <span className={styles.eyebrow} data-reveal>Resultados 2026</span>
            <h2 className={styles.sectionTitle} data-reveal style={delay(80)}>
              Quatro provas fiscais em 2026, e o mesmo nome de material aparecendo em todas
              as listas.
            </h2>
            <p className={styles.lead} data-reveal style={delay(120)}>
              Não foi um número isolado de um concurso de sorte. Ao longo de 2026, em
              quatro provas fiscais diferentes, os candidatos que estudaram com os nossos
              materiais apareceram nas listas oficiais, do topo da classificação até o
              cadastro de reserva. Todos os números abaixo vêm de listas públicas, e
              qualquer pessoa pode conferir.
            </p>

            <div className={styles.statsGrid}>
              <div className={styles.statCard} data-reveal="fade" style={delay(0)}>
                <span className={styles.statNumber}><CountUp end={102} /></span>
                <span className={styles.statLabel}>aprovados na SEFAZ-SP</span>
                <span className={styles.statDetail}>46 nas vagas imediatas · 6 no Top 5 · 10 no Top 10</span>
              </div>
              <div className={styles.statCard} data-reveal="fade" style={delay(100)}>
                <span className={styles.statNumber}><CountUp end={75} /></span>
                <span className={styles.statLabel}>aprovados na SEFA-PA</span>
                <span className={styles.statDetail}>entre os novos auditores e fiscais</span>
              </div>
              <div className={styles.statCard} data-reveal="fade" style={delay(200)}>
                <span className={styles.statNumber}><CountUp end={156} /></span>
                <span className={styles.statLabel}>aprovados na SEFAZ-MT</span>
                <span className={styles.statDetail}>alunos da casa nas listas oficiais</span>
              </div>
              <div className={styles.statCard} data-reveal="fade" style={delay(300)}>
                <span className={styles.statNumber}><CountUp end={28} suffix="%" /></span>
                <span className={styles.statLabel}>das vagas imediatas na SEFAZ-RN</span>
                <span className={styles.statDetail}>e 40% das vagas reservadas a PcD</span>
              </div>
            </div>

            <div className={styles.bigStat} data-reveal="scale" style={delay(120)}>
              <span className={styles.bigStatNumber}><CountUp end={28} prefix="+" suffix=" mil" /></span>
              <span className={styles.bigStatLabel}>alunos já estudaram com os nossos materiais</span>
            </div>
          </div>
        </section>

        {/* Bloco 04 — CTA intermediário */}
        <section className={styles.ctaBand}>
          <div className={`${styles.orb} ${styles.orbBandLeft}`} />
          <div className={`${styles.orb} ${styles.orbBandRight}`} />
          <div className={styles.containerNarrow}>
            <p className={styles.ctaBandText} data-reveal>
              Se você chegou até aqui e se reconheceu, o caminho pra virar esse jogo começa
              antes de estudar mais uma hora. Começa por entender onde o seu plano de hoje
              está gastando tempo com matérias que quase não caem.
            </p>
            <div data-reveal style={delay(120)}>
              <CtaButton>Quero o diagnóstico do meu plano de estudos</CtaButton>
            </div>
          </div>
        </section>

        {/* Bloco 05 — Método */}
        <section className={`${styles.section} ${styles.sectionDots}`}>
          <div className={styles.containerNarrow}>
            <span className={styles.eyebrow} data-reveal>O Método Esquematizado</span>
            <h2 className={styles.sectionTitle} data-reveal style={delay(80)}>
              A ordem em que você estuda decide mais que o número de horas.
            </h2>
            <p className={styles.lead} data-reveal style={delay(120)}>
              A Esquematiza Mentoria organiza a sua preparação no Método Esquematizado, o
              mesmo que colocou alunos da casa nas listas de SEFAZ-SP, SEFA-PA, SEFAZ-MT e
              SEFAZ-RN em 2026. Ele se apoia em três fases de preparação e em quatro
              pilares de estudo que se repetem todos os dias, do primeiro PDF até a véspera
              da prova.
            </p>

            <h3 className={styles.subheading} data-reveal>As três fases organizam a sua jornada</h3>
            <div className={styles.phaseGrid}>
              <div className={styles.phaseCard} data-reveal="fade" style={delay(0)}>
                <span className={styles.phaseStep}>Fase 1</span>
                <h4 className={styles.phaseTitle}>Construção de Base</h4>
                <p>
                  Cerca de mil horas para rodar todo o conteúdo da sua área, do início ao
                  fim de cada disciplina, montando a fundação que sustenta qualquer banca e
                  qualquer edital.
                </p>
              </div>
              <div className={styles.phaseCard} data-reveal="fade" style={delay(120)}>
                <span className={styles.phaseStep}>Fase 2</span>
                <h4 className={styles.phaseTitle}>Treinamento Específico</h4>
                <p>
                  Cerca de quinhentas horas para aprofundar nas disciplinas que mais pesam
                  na sua banca, com volume maior de questões e o material de revisão já
                  refinado pelos seus próprios erros.
                </p>
              </div>
              <div className={styles.phaseCard} data-reveal="fade" style={delay(240)}>
                <span className={styles.phaseStep}>Fase 3</span>
                <h4 className={styles.phaseTitle}>Intensificação e Competitividade</h4>
                <p>
                  A fase de pós-edital, com alto volume de questões da banca-alvo e
                  simulados no ritmo da prova, para você chegar no dia da prova no ritmo
                  certo.
                </p>
              </div>
            </div>

            <h3 className={styles.subheading} data-reveal>Quatro pilares todos os dias: o TQRS</h3>
            <div className={styles.pillarGrid}>
              {PILLARS.map((p, i) => (
                <div key={p.letter} className={styles.pillar} data-reveal="fade" style={delay(i * 100)}>
                  <span className={`${styles.pillarBadge} ${PILLAR_TONE[p.tone]}`}>{p.letter}</span>
                  <h4 className={styles.pillarTitle}>{p.title}</h4>
                  <p className={styles.pillarDesc}>{p.desc}</p>
                </div>
              ))}
            </div>

            <div className={styles.prose}>
              <p data-reveal>
                O que muda de uma fase para a outra é a dose de cada pilar, porque no
                começo pesa a teoria e, perto da prova, pesam questão e simulado.
              </p>
              <p data-reveal>
                Antes, sem esse critério, você estudava todas as matérias com o mesmo peso
                e revisava por data, o que faz esquecer justamente o conteúdo que não
                voltou no ciclo. Com o Método Esquematizado, cada matéria entra no seu
                plano na proporção em que ela cai na sua banca, a revisão acontece de forma
                espaçada para fixar de verdade, e todo erro que você comete vira anotação
                no Caderno de Erros, que é o ativo mais valioso da preparação e a base das
                suas revisões até o dia da prova.
              </p>
              <p data-reveal>
                Tudo isso vive na nossa plataforma de estudos, que ajusta suas metas
                diárias a partir do tempo que você tem e reorganiza o plano sempre que a
                semana foge do previsto. Você estuda com o melhor material de revisão do
                mercado, pré e pós-edital, com resumos esquematizados, flashcards e a
                Legislação Tributária Esquematizada, sem precisar comprar material por
                fora, e tem reuniões quinzenais com o Pietro e o Sérgio, mentores já
                aprovados em carreira fiscal e de controle ajustando a sua rota. Para a
                hora da prova, você ainda treina o Método das 5 Camadas, que organiza a
                ordem de ataque das questões para você não travar na prova e aproveitar
                cada minuto.
              </p>
            </div>
          </div>
        </section>

        {/* Bloco 06 — Para quem é / não é */}
        <section className={`${styles.section} ${styles.sectionTint}`}>
          <div className={styles.containerNarrow}>
            <span className={styles.eyebrow} data-reveal>Diagnóstico de perfil</span>
            <h2 className={styles.sectionTitle} data-reveal style={delay(80)}>
              Antes de entrar, veja se você é o tipo de concurseiro que essa mentoria
              costuma aprovar.
            </h2>

            <div className={styles.fitGrid}>
              <div className={`${styles.fitCard} ${styles.fitYes}`} data-reveal="left">
                <h3 className={styles.fitTitle}>Para quem é</h3>
                <ul className={styles.fitList}>
                  <li>Quem trabalha quarenta horas por semana, tem de duas a três horas líquidas por dia e precisa que cada hora renda o triplo.</li>
                  <li>Quem já estuda há anos, conhece a rotina, mas empacou numa faixa de acerto e não consegue mais evoluir sozinho.</li>
                  <li>Quem está começando agora, vindo de Direito, Contábeis, Economia ou de qualquer outra formação, e quer começar certo desde o primeiro dia.</li>
                  <li>Quem já é servidor de uma carreira menor ou militar e quer dar o salto para uma vaga fiscal ou de controle de R$ 20 mil.</li>
                  <li>Quem mira concursos fiscais, de SEFAZ, ISS e Receita, ou controle, TCEs, TCU, CGU, CGEs e CGMs, e quer um plano ajustado à banca de cada um.</li>
                </ul>
              </div>
              <div className={`${styles.fitCard} ${styles.fitNo}`} data-reveal="right">
                <h3 className={styles.fitTitle}>Para quem não é</h3>
                <ul className={styles.fitList}>
                  <li>Quem procura um atalho mágico e não aceita de doze a vinte e quatro meses de estudo com disciplina.</li>
                  <li>Quem prefere estudar totalmente sozinho, sem plano individual e sem mentor acompanhando.</li>
                  <li>Quem quer apenas comprar material e não vai abrir a plataforma nem seguir as metas combinadas.</li>
                  <li>Quem não consegue reservar pelo menos duas a três horas de estudo na maioria dos dias.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Bloco 07 — Entregáveis (deck que trava no scroll, título junto) */}
        <StackedCards
          eyebrow="O que está incluso"
          title="Tudo que entra na sua preparação no dia em que você assina."
          items={DELIVERABLES.map(([title, desc]) => ({ title, desc }))}
        />

        <section className={`${styles.section} ${styles.sectionDots}`}>
          <div className={styles.containerNarrow}>
            <p className={styles.highlightNote} data-reveal>
              Repare numa coisa: na maioria das mentorias do mercado, o preço cobre apenas
              o acompanhamento, e o material teórico e o de revisão você compra por fora.
              Aqui, as duas assinaturas, que somam <strong>R$ 4.625</strong>, já estão
              dentro do mesmo valor.
            </p>
          </div>
        </section>

        {/* Bloco 08 — Bônus */}
        <section className={`${styles.section} ${styles.sectionGreen}`}>
          <div className={`${styles.orb} ${styles.orbGreen}`} />
          <div className={styles.containerNarrow}>
            <span className={`${styles.eyebrow} ${styles.eyebrowGreen}`} data-reveal>Bônus exclusivos</span>
            <h2 className={styles.sectionTitle} data-reveal style={delay(80)}>
              O que você ainda leva além de toda a estrutura da mentoria.
            </h2>

            <div className={styles.bonusGrid}>
              <div className={styles.bonusCard} data-reveal="fade" style={delay(0)}>
                <span className={styles.bonusTag}>Bônus 1</span>
                <h4 className={styles.bonusTitle}>Estudo Esquematizado</h4>
                <p>
                  O curso completo de técnicas de estudo e planejamento, com treze módulos,
                  que entra como a sua primeira tarefa pra você estudar do jeito certo desde
                  o primeiro dia.
                </p>
                <span className={styles.bonusValue}>Valor: R$ 397</span>
              </div>
              <div className={styles.bonusCard} data-reveal="fade" style={delay(130)}>
                <span className={styles.bonusTag}>Bônus 2</span>
                <h4 className={styles.bonusTitle}>Sala de Estudos Virtual</h4>
                <p>
                  O ambiente onde você estuda junto com outros mentorados, com presença e
                  foco, como uma biblioteca online da turma.
                </p>
                <span className={styles.bonusValue}>Exclusivo dos mentorados</span>
              </div>
              <div className={styles.bonusCard} data-reveal="fade" style={delay(260)}>
                <span className={styles.bonusTag}>Bônus 3</span>
                <h4 className={styles.bonusTitle}>Revisão Esquematizada</h4>
                <p>
                  O treinamento de técnicas de revisão pra você transformar o nosso
                  material no seu, com os seus erros e os seus pontos fracos mapeados.
                </p>
                <span className={styles.bonusValue}>Valor: R$ 397</span>
              </div>
            </div>
          </div>
        </section>

        {/* Bloco 09 — Stack de valor */}
        <section className={`${styles.section} ${styles.sectionDark}`}>
          <div className={`${styles.orb} ${styles.orbDarkRight}`} />
          <div className={styles.containerNarrow}>
            <span className={`${styles.eyebrow} ${styles.eyebrowHot} ${styles.eyebrowCenter}`} data-reveal>A conta real</span>
            <h2 className={`${styles.sectionTitle} ${styles.sectionTitleCenter}`} data-reveal style={delay(80)}>O que custaria montar tudo isso separado.</h2>

            <div className={styles.stackCard} data-reveal="scale" style={delay(120)}>
              <div className={styles.stackRow}><span>Mentoria de 12 meses</span><span>R$ 4.764</span></div>
              <div className={styles.stackRow}><span>Assinatura Premium do Estratégia Concursos</span><span>R$ 2.628</span></div>
              <div className={styles.stackRow}><span>Assinatura Total Esquematiza Aí</span><span>R$ 1.997</span></div>
              <div className={`${styles.stackRow} ${styles.stackTotal}`}>
                <span>Total se você contratasse tudo separado</span><span>R$ 9.389</span>
              </div>

              <div className={styles.priceBox}>
                <span className={styles.priceLabel}>Hoje, num lugar só, a mentoria de 12 meses com tudo incluído</span>
                <div className={styles.priceMain}>
                  <span className={styles.priceCurrency}>R$</span>
                  <span className={styles.priceValue}>3.997</span>
                  <span className={styles.priceSuffix}>à vista</span>
                </div>
                <span className={styles.priceSub}>+5% de desconto no pix · ou 12x de R$ 413,38 no cartão</span>
                <span className={styles.priceSave}>Você economiza mais de R$ 5.300</span>
              </div>
            </div>

            <p className={styles.stackNote} data-reveal>
              E tem um detalhe que muda a conta: nas outras mentorias, o ticket que você vê
              na frente cobre só o acompanhamento. O material teórico e o de revisão vêm
              separados, somando facilmente mais de R$ 4 mil por fora. Aqui, esses R$ 4.625
              de material já estão dentro do preço, e você não precisa juntar mais nada.
            </p>

            <div className={styles.centerCta} data-reveal style={delay(80)}>
              <CtaButton variant="gradient">Quero garantir minha vaga na mentoria</CtaButton>
            </div>
          </div>
        </section>

        {/* Bloco 10 — Depoimentos */}
        <section className={`${styles.section} ${styles.sectionTint}`}>
          <div className={`${styles.orb} ${styles.orbTintLeft}`} />
          <div className={styles.containerNarrow}>
            <span className={styles.eyebrow} data-reveal>Quem já está dentro</span>
            <h2 className={styles.sectionTitle} data-reveal style={delay(80)}>
              Antes de aparecer na lista, a diferença já aparece na sua rotina de estudo.
            </h2>

            <div className={styles.testimonialGrid}>
              <blockquote className={styles.testimonial} data-reveal="fade" style={delay(0)}>
                <span className={styles.quoteMark}>&ldquo;</span>
                <p>
                  Você estabelece o tempo disponível e o planejamento começa pelas
                  matérias mais necessárias. Conforme vai girando nas disciplinas, outras
                  vão sendo inseridas e você amplia o conhecimento, até pra ter repertório
                  de redação. A parceria com o Estratégia, com PDF de fácil entendimento,
                  deixa a mentoria bem objetiva, estudando o que realmente é necessário.{' '}
                  <strong>Venho observando minha evolução na hora de resolver as questões.</strong>
                </p>
                <cite><span className={styles.citeAvatar}>CC</span>Carla Cristina</cite>
              </blockquote>

              <blockquote className={styles.testimonial} data-reveal="fade" style={delay(110)}>
                <span className={styles.quoteMark}>&ldquo;</span>
                <p>
                  A plataforma é ótima e{' '}
                  <strong>aumentou meu nível de acerto nas questões</strong>, por causa do
                  direcionamento e da orientação. Sou muito grata por essa oportunidade.
                </p>
                <cite><span className={styles.citeAvatar}>RM</span>Roseli Maria</cite>
              </blockquote>

              <blockquote className={styles.testimonial} data-reveal="fade" style={delay(60)}>
                <span className={styles.quoteMark}>&ldquo;</span>
                <p>
                  Tô gostando muito da estrutura da plataforma.{' '}
                  <strong>Me ajudou demais na organização dos estudos, que era um dos meus
                  principais problemas.</strong> E o acompanhamento tem sido satisfatório:
                  sempre que tenho uma dúvida, sou respondido.
                </p>
                <cite><span className={styles.citeAvatar}>NB</span>Nayton Brenno</cite>
              </blockquote>

              <blockquote className={styles.testimonial} data-reveal="fade" style={delay(170)}>
                <span className={styles.quoteMark}>&ldquo;</span>
                <p>
                  A mentoria foi um <strong>divisor de águas</strong> na minha
                  preparação. O diferencial é o foco absoluto no que realmente é cobrado,
                  sem enrolação, com uma carga intensa de exercícios pra entender como a
                  banca se comporta.{' '}
                  <strong>Em poucas semanas já noto uma evolução clara e consistente.</strong>
                </p>
                <cite><span className={styles.citeAvatar}>MJ</span>Maiko Julião</cite>
              </blockquote>
            </div>
          </div>
        </section>

        {/* Bloco 11 — Suporte */}
        <section className={`${styles.section} ${styles.sectionDots}`}>
          <div className={styles.containerNarrow}>
            <span className={styles.eyebrow} data-reveal>Suporte de verdade</span>
            <h2 className={styles.sectionTitle} data-reveal style={delay(80)}>
              Na hora em que a dúvida trava o seu estudo, você não fica esperando resposta
              por dias.
            </h2>
            <p className={styles.lead} data-reveal style={delay(120)}>
              O suporte da mentoria não é um formulário que responde em três dias úteis.
              Você fala direto com o Pietro e o Sérgio pelo WhatsApp, por texto, áudio ou
              vídeo quando a situação pede, e a resposta vem no ritmo do seu estudo, no
              mesmo dia. A cada quinze dias acontece o encontro de mentoria ao vivo, ora
              pra aprofundar um tema da sua área, ora como plantão de dúvidas. Toda segunda
              chega o seu relatório de desempenho, pra você e o mentor enxergarem juntos o
              que ajustar na semana. E a comunidade exclusiva de mentorados mantém você
              perto de quem mira o mesmo cargo, todos os dias.
            </p>
          </div>
        </section>

        {/* Bloco 12 — Garantia */}
        <section className={`${styles.section} ${styles.sectionTint}`}>
          <div className={styles.containerNarrow}>
            <div className={styles.guaranteeCard} data-reveal="scale">
              <div className={styles.guaranteeSeal}>
                <span className={styles.guaranteeDays}>7</span>
                <span className={styles.guaranteeDaysLabel}>dias</span>
              </div>
              <div>
                <span className={`${styles.eyebrow} ${styles.eyebrowGreen}`}>Risco zero</span>
                <h2 className={styles.guaranteeTitle}>
                  Você tem sete dias pra entrar, testar tudo por dentro e decidir sem risco.
                </h2>
                <p className={styles.guaranteeText}>
                  Você assina, recebe o seu plano de estudos individual, participa da sessão
                  de organização, abre a plataforma e acessa tanto o material de revisão da
                  casa quanto a Assinatura Premium do Estratégia. Tem sete dias pra sentir,
                  na prática, se a mentoria é pra você. Se em qualquer momento dentro desse
                  prazo decidir que não faz sentido, devolvemos cem por cento do valor pago,
                  sem pergunta e sem burocracia. O risco de experimentar fica todo com a gente.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Bloco 13 — Autoridade */}
        <section className={`${styles.section} ${styles.sectionDark}`}>
          <div className={`${styles.orb} ${styles.orbDarkLeft}`} />
          <div className={styles.containerNarrow}>
            <span className={`${styles.eyebrow} ${styles.eyebrowHot}`} data-reveal>Seus mentores</span>
            <h2 className={styles.sectionTitle} data-reveal style={delay(80)}>
              Quem vai montar o seu plano já sentou nas cadeiras que você quer ocupar.
            </h2>
            <p className={styles.lead} data-reveal style={delay(120)}>
              A Esquematiza Mentoria é conduzida por dois auditores que cobrem as duas
              frentes que você pode mirar. Por trás dos dois está a marca que já levou mais
              de 28 mil alunos a estudar com os seus materiais e que, só em 2026, viu alunos
              da casa aprovados na SEFAZ-SP, na SEFA-PA, na SEFAZ-MT e na SEFAZ-RN. Quem vai
              ler a sua banca e ajustar o seu plano não aprendeu isso na teoria, aprendeu
              passando.
            </p>

            <div className={styles.mentorGrid}>
              <article className={styles.mentorCard} data-reveal="left">
                <div className={styles.mentorPhoto}>
                  <Image
                    src="/mentores/pietro.jpg"
                    alt="Pietro Viecili, Auditor Federal de Finanças e Controle na CGU"
                    fill
                    sizes="(max-width: 768px) 100vw, 450px"
                    className={styles.mentorImg}
                  />
                </div>
                <div className={styles.mentorBody}>
                  <span className={styles.mentorRole}>Auditor Federal de Finanças e Controle · CGU</span>
                  <h3 className={styles.mentorName}>Pietro Viecili</h3>
                  <p className={styles.mentorBio}>
                    Passou em segundo lugar na CGU, com aprovações em primeiro lugar no
                    TJ-RO e na DPE-RO e aprovação na PF. Hoje está à frente da vertical de
                    mentoria.
                  </p>
                  <blockquote className={styles.mentorQuote}>
                    Antes de qualquer aprovação, eu colecionei muitas reprovações. Sou um
                    mero Tecnólogo que terminou o ensino médio pelo ENCCEJA, pai de quatro
                    filhos, atleta nas horas vagas, e bati na trave sete vezes antes de
                    virar auditor: TCE-RJ, TCDF por cinco centésimos de ponto, TCE-AM por
                    errar o preenchimento de uma folha de discursiva, TCU, TCE-SC. Cada uma
                    dessas doeu demais! Mas foram elas que me ensinaram a estudar com
                    estratégia em vez de estudar no escuro. Foi assim que vieram os primeiros
                    lugares no TJ-RO e na DPE-RO, a aprovação na PF e o segundo lugar na CGU.
                    Agora vou montar pra você o plano que eu queria ter tido lá no começo.
                    Vem que eu te mostro o caminho!
                  </blockquote>
                </div>
              </article>

              <article className={styles.mentorCard} data-reveal="right">
                <div className={styles.mentorPhoto}>
                  <Image
                    src="/mentores/sergio.jpg"
                    alt="Sérgio Furtado, Auditor-Fiscal e criador do método de revisão da Esquematiza"
                    fill
                    sizes="(max-width: 768px) 100vw, 450px"
                    className={styles.mentorImg}
                  />
                </div>
                <div className={styles.mentorBody}>
                  <span className={styles.mentorRole}>Auditor-Fiscal · criador do método de revisão</span>
                  <h3 className={styles.mentorName}>Sérgio Furtado</h3>
                  <p className={styles.mentorBio}>
                    Foi professor e coordenador no Tec Concursos, coordena as Rodadas
                    Avançadas de Simulados no Estratégia e ajudou a abrir o mercado de
                    flashcards para concursos no Brasil. O método de revisão da Esquematiza
                    nasceu da cabeça dele.
                  </p>
                  <blockquote className={styles.mentorQuote}>
                    Eu demorei onze anos pra tomar posse como auditor. No caminho, fui
                    aprovado como analista e depois como auditor na SEFIN-RO, e também como
                    Auditor do ISS de Guarulhos. Aprendi na pele que o que separa quem passa
                    de quem desiste é método e constância, mais do que talento. Foi esse
                    método que eu organizei aqui dentro pra você não precisar levar onze anos
                    como eu levei. Estude, trabalhe e desfrute.
                  </blockquote>
                </div>
              </article>
            </div>

            <p className={styles.proofIntro} data-reveal>
              Não é teoria de quem nunca passou. É a rotina de quem senta na cadeira, vive
              o cargo e constrói o método que você vai estudar.
            </p>

            <div className={styles.proofGallery}>
              <figure className={styles.proofItem} data-reveal="fade" style={delay(0)}>
                <div className={styles.proofImgWrap}>
                  <Image src="/mentores/pietro-campo.jpg" alt="Pietro auditando em campo com a polo da CGU" fill sizes="(max-width: 768px) 100vw, 300px" className={styles.proofImg} />
                </div>
                <figcaption>Pietro auditando em campo, como servidor da CGU.</figcaption>
              </figure>
              <figure className={styles.proofItem} data-reveal="fade" style={delay(110)}>
                <div className={styles.proofImgWrap}>
                  <Image src="/mentores/sergio-evento.jpg" alt="Sérgio em evento do Estratégia Concursos" fill sizes="(max-width: 768px) 100vw, 300px" className={styles.proofImg} />
                </div>
                <figcaption>Sérgio em evento do Estratégia Concursos, nosso parceiro.</figcaption>
              </figure>
              <figure className={styles.proofItem} data-reveal="fade" style={delay(220)}>
                <div className={styles.proofImgWrap}>
                  <Image src="/mentores/pietro-podcast.jpg" alt="Pietro em entrevista falando sobre preparação para concursos" fill sizes="(max-width: 768px) 100vw, 300px" className={styles.proofImg} />
                </div>
                <figcaption>Pietro em entrevista, falando sobre preparação.</figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* Bloco 14 — FAQ */}
        <section className={`${styles.section} ${styles.sectionDots}`}>
          <div className={styles.containerNarrow}>
            <span className={`${styles.eyebrow} ${styles.eyebrowCenter}`} data-reveal>Tira-dúvidas</span>
            <h2 className={`${styles.sectionTitle} ${styles.sectionTitleCenter}`} data-reveal style={delay(80)}>As perguntas que todo mundo faz antes de entrar.</h2>
            <div data-reveal style={delay(120)}>
              <Faq />
            </div>
          </div>
        </section>

        {/* Bloco 15 — Oferta final */}
        <section className={`${styles.section} ${styles.sectionFinal}`}>
          <div className={`${styles.orb} ${styles.orbFinalLeft}`} />
          <div className={`${styles.orb} ${styles.orbFinalRight}`} />
          <div className={styles.containerNarrow}>
            <span className={`${styles.eyebrow} ${styles.eyebrowHot}`} data-reveal>Sua vaga</span>
            <h2 className={styles.sectionTitle} data-reveal style={delay(80)}>
              Tudo que você precisa pra passar, num lugar só, sem comprar mais nada por fora.
            </h2>
            <p className={styles.lead} data-reveal style={delay(120)}>Quando você entra na Esquematiza Mentoria, leva:</p>

            <ul className={styles.finalList}>
              {[
                'Planejamento estratégico de estudos, pré e pós-edital',
                'Plataforma com metas diárias de teoria, questões e revisão',
                'Relatórios semanais de desempenho com comparativo entre os mentorados',
                'Encontros quinzenais ao vivo com o Pietro e o Sérgio',
                'Assinatura Total Esquematiza Aí, com resumos e flashcards de todas as matérias, pré e pós-edital',
                'Assinatura Premium do Estratégia Concursos',
                'Módulo de Discursiva e simulados exclusivos dos mentorados',
                'Acesso diário aos mentores no WhatsApp e à comunidade de mentorados',
                'E os bônus: Estudo Esquematizado, Sala de Estudos Virtual e o treinamento Revisão Esquematizada',
              ].map((item, i) => (
                <li key={item} data-reveal="fade" style={delay((i % 2) * 80)}>
                  <span className={styles.checkIcon}>✓</span>{item}
                </li>
              ))}
            </ul>

            <p className={styles.prose} data-reveal>
              Montar tudo isso separado custaria R$ 9.389. Na mentoria de doze meses, com
              tudo incluído, sai por <strong>R$ 3.997 à vista</strong>, com mais 5% de
              desconto no pix, ou em doze vezes de R$ 413,38. Se você já é aluno do
              Estratégia, ganha um desconto exclusivo de 15% e fica em R$ 3.397,45 com o
              cupom <strong>ESTRATÉGIA15</strong>, porque você não precisa do material
              teórico de novo. E você ainda tem sete dias de garantia incondicional pra
              testar tudo por dentro e pedir o dinheiro de volta se não fizer sentido.
            </p>

            <div className={styles.centerCta} data-reveal style={delay(80)}>
              <CtaButton variant="gradient">Quero garantir minha vaga na mentoria</CtaButton>
              <p className={styles.finalNote}>
                Ao continuar, você concorda com os termos de uso e a política de privacidade.
              </p>
            </div>
          </div>
        </section>
      </main>

      <SalesFooter />
      <FloatingCta />
      <SocialProofToasts />
      <RevealController />
    </div>
  );
}
