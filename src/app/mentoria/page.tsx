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
import FitToggle from '@/components/FitToggle';
import BonusFlip from '@/components/BonusFlip';
import Pilares from '@/components/Pilares';
import VideosDepoimentos from '@/components/VideosDepoimentos';
import PlanosMentoria from '@/components/PlanosMentoria';

export const metadata: Metadata = {
  title: 'Esquematiza Mentoria | Aprovação em concursos públicos com método e revisão',
  description:
    'A mentoria que prioriza o que cada banca cobra, com plano individual e acompanhamento de quem já foi aprovado. Nossos alunos nas listas de SEFAZ-SP, SEFA-PA, SEFAZ-MT e SEFAZ-RN em 2026.',
};

// stagger: define o atraso da animação de entrada de cada elemento
const delay = (ms: number) => ({ ['--reveal-delay']: `${ms}ms` } as React.CSSProperties);

/**
 * Os oito entregáveis, na copy de 29/08.
 *
 * Eram dez, e três saíram porque a mentoria mudou: relatórios semanais,
 * encontros quinzenais ao vivo e o módulo de discursiva não estão mais na
 * oferta. Prometer entrega que não existe é o caminho mais curto para o pedido
 * de reembolso.
 *
 * As duas assinaturas deixaram de ser "inclusas" para todo mundo: agora
 * dependem do plano, e o texto diz isso.
 */
const DELIVERABLES: [string, string][] = [
  ['Planejamento estratégico de estudos, pré e pós-edital', 'Reunião individual inicial com o mentor pra montar o seu plano completo e apresentar a estratégia, seja do zero ou aproveitando o que você já estudou.'],
  ['Plataforma com metas diárias', 'Você abre o app e já sabe o que estudar no dia, entre teoria, questões e revisão, no tempo que você tem.'],
  ['Assessoria pedagógica contínua', 'Aplicação de diferentes métodos de estudo e revisão, ajustada ao seu momento, à sua rotina e à banca do seu concurso.'],
  ['Orientação na escolha de concursos', 'Análise estratégica dos editais publicados e dos concursos previstos ou no radar da sua área, pra você mirar a prova certa na hora certa.'],
  ['Materiais Esquematiza Aí em condição de mentorado', 'Resumos e flashcards de todas as matérias, pré-edital e combos de pós-edital, com desconto exclusivo de 30% a 70% conforme o plano, ou já inclusos nos planos anuais VIP e Premium.'],
  ['Assinatura Premium do Estratégia Concursos', 'O material teórico mais completo do mercado, já incluso nos planos que a contemplam, pra você estudar a teoria de qualquer matéria.'],
  ['Canal direto no WhatsApp', 'Dúvida por texto, áudio ou vídeo, respondida pela equipe de mentoria supervisionada pelo Prof. Sérgio, mais a comunidade exclusiva de mentorados.'],
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
          <div className={styles.heroGrid} aria-hidden="true" />

          <div className={styles.heroContainer}>
            <h1 className={`${styles.heroTitle} ${styles.heroIn}`} style={delay(90)}>
              Estudar mais horas é o conselho que mais{' '}
              <span className={styles.titleHighlight}>reprova</span>.
            </h1>

            {/* A copy de 29/08 abriu o alvo: era "concursos fiscais e de
                controle", virou concurso público em geral. A mentoria passou a
                atender policial, tribunais e outras áreas, e a headline não
                podia continuar excluindo quem ela agora atende. */}
            <p className={`${styles.heroSubtitle} ${styles.heroIn}`} style={delay(200)}>
              Em concurso público, o que aprova é uma estratégia que prioriza o que cada
              banca cobra, com plano individual e acompanhamento de perto por quem já foi
              aprovado.
            </p>

            {/* VSL no topo: o visitante já se depara com o vídeo pra qualificar */}
            <div className={`${styles.vslFrame} ${styles.heroIn}`} style={delay(320)}>
              <YouTubeEmbed />
            </div>

            <div className={styles.heroPitch}>
              <p className={styles.heroIn} style={delay(440)}>
                Enquanto você revisa <em>aleatoriamente</em>, a banca cobra justamente o que
                o seu cronograma <strong>deixou pra trás</strong>. Aqui você revisa{' '}
                <strong>pelo peso que cada matéria tem na prova</strong> que você quer
                passar, seja qual for a sua área.
              </p>
              <p className={styles.heroIn} style={delay(520)}>
                Cada mês de estudo <strong>sem critério</strong> é um contracheque inteiro
                que não entra na sua conta, e nas carreiras mais altas isso passa de{' '}
                <strong>R$ 20 mil</strong>. Tendo <em>duas horas por dia</em> ou o dia
                inteiro livre, o plano se ajusta à sua rotina e mira a prova mais próxima.
              </p>
              <p className={styles.heroIn} style={delay(600)}>
                Os aprovados que você acompanha no Instagram seguiram um{' '}
                <strong>critério de incidência por banca</strong>. Aqui você recebe{' '}
                <em>esse mesmo critério</em> aplicado ao <strong>seu plano individual</strong>,
                semana após semana.
              </p>
            </div>

            <div className={`${styles.heroCta} ${styles.heroIn}`} style={delay(700)}>
              <CtaButton variant="gradient">Quero fazer minha aplicação pra mentoria</CtaButton>
            </div>

            <div className={`${styles.trustStrip} ${styles.heroIn}`} style={delay(800)}>
              <span className={styles.trustLabel}>Nossos alunos já foram aprovados em 2026 para as maiores provas:</span>
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
          <span className={`${styles.bgIcon} ${styles.bgIconLeft}`} aria-hidden="true" />
          <span className={`${styles.bgIcon} ${styles.bgIconRight}`} aria-hidden="true" />
          <div className={styles.containerNarrow}>
            <h2 className={styles.sectionTitle} data-reveal style={delay(80)}>
              Existe um motivo técnico pra você estudar muito e render pouco, seja qual for
              o concurso que você mira.
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
                esforço existe. O que falta é critério.
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
            <h2 className={styles.sectionTitle} data-reveal style={delay(80)}>
              Quatro provas fiscais em 2026, e o mesmo material aparecendo em todas
              as listas.
            </h2>
            <p className={styles.lead} data-reveal style={delay(120)}>
              Não foi um número isolado de um concurso de sorte. Ao longo de 2026, em
              quatro provas fiscais diferentes, os candidatos que estudaram com os nossos
              materiais apareceram nas listas oficiais, do topo da classificação até o
              cadastro de reserva. Todos os números abaixo vêm de listas públicas, e
              qualquer pessoa pode conferir.
            </p>

          {/* OS CONTADORES ANIMADOS SAÍRAM, com a copy de 29/08. Eram 102, 75,
              156 e 28%, e a copy nova não traz nenhum desses totais: onde havia
              "28% das vagas da SEFAZ-RN" agora se lê "parcela expressiva".
              Número que encolhe assim entre uma versão e outra é número que não
              se sustenta, e afirmação sobre aprovação é justamente o que a
              concorrência confere. Ficaram os fatos que as listas mostram. */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard} data-reveal="fade" style={delay(0)}>
                <span className={styles.statLabel}>Aprovados na SEFAZ-SP</span>
                <span className={styles.statDetail}>46 nas vagas imediatas · 6 no Top 5 · 10 no Top 10</span>
              </div>
              <div className={styles.statCard} data-reveal="fade" style={delay(100)}>
                <span className={styles.statLabel}>Aprovados na SEFA-PA</span>
                <span className={styles.statDetail}>entre os novos auditores e fiscais</span>
              </div>
              <div className={styles.statCard} data-reveal="fade" style={delay(200)}>
                <span className={styles.statLabel}>Aprovados na SEFAZ-MT</span>
                <span className={styles.statDetail}>nossos alunos nas listas oficiais</span>
              </div>
              <div className={styles.statCard} data-reveal="fade" style={delay(300)}>
                <span className={styles.statLabel}>SEFAZ-RN</span>
                <span className={styles.statDetail}>
                  parcela expressiva das vagas imediatas e 40% das vagas reservadas a PcD
                </span>
              </div>
            </div>

            <div className={styles.bigStat} data-reveal="scale" style={delay(120)}>
              <span className={styles.bigStatNumber}><CountUp end={30} prefix="+" suffix=" mil" /></span>
              <span className={styles.bigStatLabel}>alunos já estudaram com os nossos materiais</span>
            </div>

            {/* Aluno com nome e rosto contando o resultado prova mais que
                qualquer número subindo na tela, e é o que a concorrência não
                consegue copiar. São os mesmos depoimentos da página de vendas. */}
            <div className={styles.depoimentosMentoria} data-reveal style={delay(160)}>
              <p className={styles.depoimentosRotulo}>Aprovados falando</p>
              <VideosDepoimentos />
            </div>
          </div>
        </section>

        {/* Bloco 04 — CTA intermediário */}
        <section className={styles.ctaBand}>
          <div className={`${styles.orb} ${styles.orbBandLeft}`} />
          <div className={`${styles.orb} ${styles.orbBandRight}`} />
          <div className={styles.containerNarrow}>
            <p className={styles.ctaBandText} data-reveal>
              Virar esse jogo começa antes de estudar mais uma hora. Começa por entender
              onde o seu plano de hoje está gastando tempo com matérias que quase não caem.
            </p>
            <div data-reveal style={delay(120)}>
              <CtaButton>Quero fazer minha aplicação pra mentoria</CtaButton>
            </div>
          </div>
        </section>

        {/* Bloco 05 — Método */}
        <section className={`${styles.section} ${styles.sectionDots}`}>
          <div className={styles.containerNarrow}>
            <h2 className={styles.sectionTitle} data-reveal style={delay(80)}>
              A ordem em que você estuda decide mais que o número de horas.
            </h2>
            <p className={styles.lead} data-reveal style={delay(120)}>
              A Esquematiza Mentoria organiza a sua preparação no Método Esquematizado, o
              mesmo que colocou nossos alunos nas listas de SEFAZ-SP, SEFA-PA, SEFAZ-MT e
              SEFAZ-RN em 2026. Ele se apoia em três fases de preparação e num sistema de
              revisão contínua com Resumos Esquematizados e Flashcards, do primeiro PDF até
              a véspera da prova.
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

            {/* Os quatro pilares TQRS saíram com a copy de 29/08. No lugar
                entrou o que a marca de fato vende e o aluno reconhece: resumo,
                flashcard e caderno de erros. */}
            <h3 className={styles.subheading} data-reveal>
              A revisão do jeito Esquematiza Aí: Resumos + Flashcards
            </h3>
            <div className={styles.revisaoGrid}>
              <div className={styles.revisaoCard} data-reveal="fade" style={delay(0)}>
                <h4 className={styles.revisaoTitle}>Resumos Esquematizados</h4>
                <p>
                  O conteúdo inteiro condensado no formato em que a banca cobra, pra você
                  revisar em minutos o que levou horas pra aprender.
                </p>
              </div>
              <div className={styles.revisaoCard} data-reveal="fade" style={delay(120)}>
                <h4 className={styles.revisaoTitle}>Flashcards</h4>
                <p>
                  Revisão ativa e espaçada, que te obriga a lembrar da resposta antes de
                  virar o cartão, no intervalo exato pra fixar antes de esquecer.
                </p>
              </div>
              <div className={styles.revisaoCard} data-reveal="fade" style={delay(240)}>
                <h4 className={styles.revisaoTitle}>Caderno de Erros</h4>
                <p>
                  Todo erro que você comete vira anotação e volta pra sua fila de revisão
                  até o dia da prova. É o ativo mais valioso da sua preparação.
                </p>
              </div>
            </div>

            <div className={styles.prose}>
              <p data-reveal>
                Antes, sem esse critério, você estudava todas as matérias com o mesmo peso,
                revisava por data relendo PDF inteiro, e esquecia justamente o conteúdo que
                não voltou no ciclo. Com o Método Esquematizado, cada matéria entra no seu
                plano na proporção em que ela cai na sua banca, e a revisão acontece de
                forma espaçada, com o material que virou referência nacional em resumos e
                flashcards para concursos.
              </p>
              <p data-reveal>
                Tudo isso vive na nossa plataforma de estudos, que ajusta suas metas
                diárias a partir do tempo que você tem e reorganiza o plano sempre que a
                semana foge do previsto. Você estuda com o melhor material de revisão do
                mercado, pré e pós-edital, com resumos esquematizados, flashcards e, na
                área fiscal, a Legislação Tributária Esquematizada, e conta com a
                assessoria pedagógica do Prof. Sérgio Furtado, auditor fiscal aprovado, e
                da equipe de mentores que ele treinou no método, ajustando a sua rota do
                primeiro dia até a prova.
              </p>
            </div>
          </div>
        </section>

        {/* Bloco 06 — Para quem é / não é */}
        <section className={`${styles.section} ${styles.sectionTint}`}>
          <div className={styles.containerNarrow}>
            <h2 className={`${styles.sectionTitle} ${styles.sectionTitleCenter}`} data-reveal style={delay(80)}>
              Antes de entrar, veja se você é o tipo de concurseiro que essa mentoria
              costuma aprovar.
            </h2>

            <div data-reveal style={delay(140)}>
              <FitToggle />
            </div>
          </div>
        </section>

        {/* Bloco 07 — Entregáveis (deck que trava no scroll, título junto) */}
        <StackedCards
          title="Tudo que entra na sua preparação no dia em que você assina."
          items={DELIVERABLES.map(([title, desc]) => ({ title, desc }))}
        />

        <section className={`${styles.section} ${styles.sectionDots}`}>
          <div className={styles.containerNarrow}>
            <p className={styles.highlightNote} data-reveal>
              Repare numa coisa: na maioria das mentorias do mercado, o preço cobre apenas
              o acompanhamento, e o material teórico e o de revisão você compra por fora, a
              preço cheio. Aqui, conforme o plano que você escolher, o material de revisão{' '}
              <strong>entra incluso ou com desconto exclusivo de mentorado</strong>, e a
              Assinatura Premium do Estratégia já vem inclusa nos planos que a contemplam.
            </p>
          </div>
        </section>

        {/* Bloco 08 — Bônus REMOVIDO: a copy de 29/08 não tem essa seção. Os
            bônus que ela listava (Estudo Esquematizado, Sala de Estudos Virtual
            e o treinamento Revisão Esquematizada) saíram da oferta. */}

        {/* Bloco 09 — Planos.
            Substituiu a pilha de valor, aquela conta de quanto custaria comprar
            tudo separado até chegar num preço único de 12x R$ 413,38. A oferta
            deixou de ser uma só: agora são cinco planos, e o que muda entre eles
            é o prazo e o que entra de material. */}
        {/* id="planos": é para cá que o botão "Ver planos" do topo leva */}
        <section id="planos" className={`${styles.section} ${styles.sectionDark}`}>
          <span className={`${styles.bgLogo} ${styles.bgLogoA}`} aria-hidden="true" />
          <span className={`${styles.bgLogo} ${styles.bgLogoB}`} aria-hidden="true" />
          <span className={`${styles.bgLogo} ${styles.bgLogoC}`} aria-hidden="true" />
          <div className={styles.containerNarrow}>
            <h2
              className={`${styles.sectionTitle} ${styles.sectionTitleCenter}`}
              data-reveal
              style={delay(80)}
            >
              Escolha o plano que cabe na sua rotina e no seu bolso.
            </h2>

            <PlanosMentoria />
          </div>
        </section>

        {/* Bloco 10 (Depoimentos) removido: os prints do carrossel eram de teste
            ("Teste, Teste, Teste"), não depoimentos reais de alunos. Volta quando
            houver review de verdade da mentoria. */}

        {/* Bloco 11 — Suporte */}
        <section className={`${styles.section} ${styles.sectionDots}`}>
          <div className={styles.containerNarrow}>
            <h2 className={styles.sectionTitle} data-reveal style={delay(80)}>
              Na hora em que a dúvida aparece, você não fica esperando resposta por dias.
            </h2>
            {/* Saíram daqui o encontro quinzenal ao vivo e o relatório semanal:
                não estão mais na oferta, e prometer entrega que não existe é o
                caminho mais curto para o pedido de reembolso. */}
            <p className={styles.lead} data-reveal style={delay(120)}>
              O suporte da mentoria não é um formulário que responde em três dias úteis.
              Você fala com a equipe de mentoria pelo WhatsApp, por texto, áudio ou vídeo
              quando a situação pede, e a resposta vem no ritmo do seu estudo. Na reunião
              individual inicial, o mentor apresenta o seu planejamento e a estratégia
              montada pro seu caso, e a partir daí a assessoria pedagógica acompanha a
              aplicação do método e ajusta a rota sempre que a sua semana foge do previsto.
              E a comunidade exclusiva de mentorados mantém você perto de quem mira o mesmo
              cargo, todos os dias.
            </p>
          </div>
        </section>

        {/* Bloco 12 — Garantia */}
        <section className={`${styles.section} ${styles.sectionTint}`}>
          <div className={styles.containerNarrow}>
            <div className={styles.guarantee}>
              <div className={styles.guaranteeVisual} data-reveal="scale">
                <span className={styles.guaranteeBig}>7</span>
                <span className={styles.guaranteeDias}>dias</span>
              </div>
              <div className={styles.guaranteeBody}>
                <h2 className={styles.guaranteeTitle} data-reveal style={delay(80)}>
                  Você tem sete dias pra entrar, testar tudo por dentro e decidir sem risco.
                </h2>
                <p className={styles.guaranteePara} data-reveal style={delay(230)}>
                  Você assina, recebe o seu plano de estudos individual, participa da
                  reunião inicial com o mentor, abre a plataforma e acessa os materiais e
                  assinaturas do seu plano.
                </p>
                <p className={styles.guaranteePara} data-reveal style={delay(380)}>
                  Tem sete dias, contados da confirmação do pagamento, pra sentir na prática
                  se a mentoria é pra você. Se dentro desse prazo decidir que não faz
                  sentido, basta enviar um e-mail pra{' '}
                  <a href="mailto:contato@esquematizaai.com">contato@esquematizaai.com</a> e
                  devolvemos cem por cento do valor pago.
                </p>
                {/* O "sem pergunta e sem burocracia" saiu: os termos preveem
                    analise do pedido, e prometer o contrario na pagina de venda
                    cria uma expectativa que o contrato nao sustenta. */}
                <p className={styles.guaranteePara} data-reveal style={delay(460)}>
                  Após esse prazo, valem as condições de cancelamento previstas nos Termos
                  de Uso.
                </p>
                <p className={styles.guaranteeClose} data-reveal style={delay(530)}>
                  <a href="/termos-de-uso-mentoria">Consulte os Termos de Uso da mentoria.</a>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Bloco 13 — Autoridade */}
        <section className={`${styles.section} ${styles.sectionDark}`}>
          <div className={`${styles.orb} ${styles.orbDarkLeft}`} />
          <div className={styles.containerNarrow}>
            <h2 className={styles.sectionTitle} data-reveal style={delay(80)}>
              Quem criou o seu método já sentou na cadeira que você quer ocupar.
            </h2>
            <p className={styles.lead} data-reveal style={delay(120)}>
              A Esquematiza Mentoria foi criada e é liderada pelo Prof. Sérgio Furtado,
              autor do Esquematiza Aí, especialista em métodos de estudo e revisão, com mais
              de 10 anos de experiência em concursos públicos. Auditor Fiscal do Estado,
              Coordenador no Estratégia Concursos (Rodadas Avançadas de Simulados) e
              ex-coordenador e professor no TEC Concursos. O acompanhamento é realizado por
              ele e/ou por mentores da equipe do Esquematiza Aí, todos capacitados e
              supervisionados por ele na aplicação do método.
            </p>
            <p className={styles.lead} data-reveal style={delay(160)}>
              O Esquematiza Aí surgiu em 2019 e hoje conta com mais de 30.000 alunos e
              milhares de aprovados nos mais diversos cargos em todo o país. É uma das
              marcas pioneiras na utilização e popularização de Flashcards no estudo para
              concursos públicos e referência nacional em Resumos Esquematizados e
              Flashcards para provas e exames.
            </p>

            <div className={styles.mentorGrid}>
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
                  <span className={styles.mentorRole}>Auditor-Fiscal · autor do Esquematiza Aí</span>
                  <h3 className={styles.mentorName}>Sérgio Furtado</h3>
                  <p className={styles.mentorBio}>
                    Auditor Fiscal do Estado, autor do Esquematiza Aí e especialista em
                    métodos de estudo e revisão. Coordena as Rodadas Avançadas de Simulados
                    no Estratégia Concursos, foi coordenador e professor no TEC Concursos e
                    ajudou a abrir o mercado de flashcards para concursos no Brasil. O
                    método de revisão da Esquematiza nasceu da cabeça dele.
                  </p>
                  <blockquote className={styles.mentorQuote}>
                    Fui aprovado como analista e como auditor na SEFIN-RO, e também como
                    Auditor do ISS de Guarulhos. Em todas essas provas, o que decidiu foi o
                    mesmo: método, leitura de banca e revisão feita no dia certo. Foi esse
                    método que eu transformei no Esquematiza Aí, que já colocou milhares de
                    alunos nas listas, e é ele que a mentoria aplica no seu plano, ajustado
                    ao seu tempo e à sua banca. Estude, trabalhe e desfrute.
                  </blockquote>
                </div>
              </article>
            </div>

            <p className={styles.proofIntro} data-reveal>
              Método testado em prova pelo próprio autor e confirmado, ano após ano, nas
              listas de aprovação dos alunos.
            </p>

            <div className={styles.proofGallery}>
              <figure className={styles.proofItem} data-reveal="fade" style={delay(0)}>
                <div className={styles.proofImgWrap}>
                  <Image src="/mentores/sergio.jpg" alt="Sérgio Furtado, auditor-fiscal da SEFIN-RO" fill sizes="(max-width: 768px) 100vw, 300px" className={styles.proofImg} />
                </div>
                <figcaption>Sérgio Furtado, auditor-fiscal da SEFIN-RO e criador do método.</figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* Bloco 14 — FAQ */}
        <section className={`${styles.section} ${styles.sectionDots}`}>
          <div className={styles.containerNarrow}>
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
            <h2 className={styles.sectionTitle} data-reveal style={delay(80)}>
              Tudo que você precisa pra passar, num lugar só.
            </h2>
            <p className={styles.lead} data-reveal style={delay(120)}>Quando você entra na Esquematiza Mentoria, leva:</p>

            {([
              {
                marked: 2,
                items: [
                  ['Planejamento estratégico de estudos', ', pré e pós-edital, com metas diárias'],
                  ['Reunião individual inicial com o mentor', ' pra apresentar plano e estratégia'],
                  ['Plataforma de estudos', ' pra organizar teoria, questões e revisão'],
                  ['Assessoria pedagógica', ' na aplicação dos métodos de estudo e revisão'],
                ],
              },
              {
                marked: 1,
                items: [
                  ['Orientação estratégica na escolha de concursos', ' e análise de editais'],
                  ['Materiais Esquematiza Aí', ' (resumos e flashcards) inclusos ou com desconto exclusivo, conforme o plano'],
                  ['Assinatura Premium do Estratégia Concursos', ' nos planos que a incluem'],
                  ['Canal no WhatsApp', ' com a equipe de mentoria e comunidade de mentorados'],
                ],
              },
            ] as { marked: number; items: [string, string][] }[]).map((group, g) => (
              <ol className={styles.gabarito} key={g} data-reveal style={delay(160 + g * 100)}>
                {group.items.map(([lead, rest], i) => (
                  <li key={lead} className={styles.gabItem}>
                    <span className={`${styles.gabLetter} ${i === group.marked ? styles.gabMarked : ''}`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className={styles.gabText}>
                      <mark className={styles.gabMark}>{lead}</mark>
                      {rest}
                    </span>
                  </li>
                ))}
              </ol>
            ))}

            <p className={styles.prose} data-reveal>
              Planos a partir de <strong>R$ 497/mês</strong>, com opções anuais que já
              incluem todo o material de revisão e a teoria. Você ainda tem sete dias de
              garantia incondicional pra testar tudo por dentro e pedir o dinheiro de volta
              se não fizer sentido. A sua condição exata e as formas de pagamento a equipe
              acerta com você no WhatsApp.
            </p>

            <div className={styles.centerCta} data-reveal style={delay(80)}>
              <CtaButton variant="gradient">Quero fazer minha aplicação pra mentoria</CtaButton>
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
