import React from 'react';
import type { Metadata } from 'next';
import styles from './page.module.css';
import SalesNav from '@/components/cgu/SalesNav';
import SalesFooter from '@/components/cgu/SalesFooter';
import FloatingCta from '@/components/cgu/FloatingCta';
import CtaButton from '@/components/cgu/CtaButton';
import SocialProofToasts from '@/components/cgu/SocialProofToasts';
import RevealController from '@/components/RevealController';
import CountUp from '@/components/CountUp';
import YouTubeEmbed from '@/components/YouTubeEmbed';
import MentorPhoto from '@/components/MentorPhoto';

export const metadata: Metadata = {
  title: 'Pré-edital CGU | Aula gratuita + grupo VIP — Esquematiza Aí',
  description:
    'O concurso da CGU já foi autorizado. Assista à aula gratuita com o Pietro (aprovado em 2º lugar na CGU) e entre no grupo VIP do pré-edital para receber o ciclo de estudos e largar na frente.',
};

const delay = (ms: number) => ({ ['--reveal-delay']: `${ms}ms` } as React.CSSProperties);

const PIETRO_SHOTS = [
  { src: '/mentores/pietro.jpg', caption: 'No estúdio' },
  { src: '/mentores/pietro-campo.jpg', caption: 'Auditando em campo, na CGU' },
  { src: '/mentores/pietro-podcast.jpg', caption: 'Em entrevista' },
];

const SERGIO_SHOTS = [
  { src: '/mentores/sergio.jpg', caption: 'Time Esquematiza' },
  { src: '/mentores/sergio-evento.jpg', caption: 'Evento do Estratégia Concursos' },
];

const GROUP_PERKS: [string, string][] = [
  ['O ciclo de estudos completo', 'Receba o cronograma em Excel pra começar a base hoje, no caminho certo, antes do edital sair.'],
  ['A análise da banca', 'Assim que a banca for definida, eu abro a leitura dela em primeira mão dentro do grupo.'],
  ['As condições da turma de pré-edital', 'Você fica sabendo das vagas e das condições antes de todo mundo — e elas são limitadas.'],
  ['Suas dúvidas respondidas', 'Tire dúvidas sobre o cargo, o concurso e a preparação direto com quem passou.'],
  ['Primeiro a saber da abertura', 'Quando as vagas abrirem, quem está no grupo entra na frente.'],
  ['Acompanhamento de perto', 'Você acompanha a preparação de perto, sem ficar perdido esperando o edital.'],
];

export default function CguCapturePage() {
  return (
    <div className={styles.pageRoot}>
      <SalesNav />

      <main>
        {/* HERO */}
        <section className={styles.hero}>
          <div className={`${styles.orb} ${styles.orbTopLeft}`} />
          <div className={`${styles.orb} ${styles.orbBottomRight}`} />
          <div className={styles.heroGrid} aria-hidden="true" />

          <div className={styles.heroContainer}>
            <div className={`${styles.badge} ${styles.heroIn}`} style={delay(0)}>
              <span className={styles.pulseDot} />
              Aula gratuita · Pré-edital CGU
            </div>

            <h1 className={`${styles.heroTitle} ${styles.heroIn}`} style={delay(90)}>
              O concurso da CGU já foi autorizado. Quem começa a base agora já{' '}
              <span className={styles.titleHighlight}>larga na frente</span>.
            </h1>

            <p className={`${styles.heroSubtitle} ${styles.heroIn}`} style={delay(200)}>
              Eu passei em segundo lugar pra Auditor da CGU depois de reprovar sete vezes.
              Nesta aula gratuita eu te mostro o que a banca cobra e te entrego o ciclo de
              estudos pra começar hoje, antes do edital sair.
            </p>

            <div className={`${styles.videoBlock} ${styles.heroIn}`} style={delay(320)}>
              <YouTubeEmbed
                id="jo9o6IG7NBE"
                start={23}
                title="Aula gratuita — pré-edital CGU"
                badge="Assista à aula gratuita"
                alt="Aula gratuita do pré-edital CGU"
              />
            </div>

            <div className={`${styles.heroCta} ${styles.heroIn}`} style={delay(440)}>
              <CtaButton variant="gradient">Entrar no grupo exclusivo do pré-edital CGU</CtaButton>
              <p className={styles.ctaNote}>
                É de graça. Você entra no grupo e já recebe o ciclo de estudos.
              </p>
            </div>

            <div className={`${styles.statStrip} ${styles.heroIn}`} style={delay(540)}>
              <div className={styles.stat}>
                <span className={styles.statNum}><CountUp end={60} /></span>
                <span className={styles.statLabel}>vagas imediatas</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.stat}>
                <span className={styles.statNum}>+<CountUp end={60} /></span>
                <span className={styles.statLabel}>cadastro de reserva</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.stat}>
                <span className={styles.statNum}>R$ <CountUp end={22} />mil</span>
                <span className={styles.statLabel}>por mês, com auxílios</span>
              </div>
            </div>

            <div className={`${styles.trustStrip} ${styles.heroIn}`} style={delay(640)}>
              <span className={styles.trustLabel}>Nossos alunos dominaram as listas em 2026</span>
              <div className={styles.trustBadges}>
                <span>SEFAZ-SP</span>
                <span>SEFAZ-MT</span>
                <span>SEFAZ-RN</span>
                <span>SEFA-PA</span>
              </div>
            </div>
          </div>
        </section>

        {/* POR QUE COMEÇAR AGORA (bullets) */}
        <section className={`${styles.section} ${styles.sectionDots}`}>
          <div className={styles.container}>
            <span className={styles.eyebrow} data-reveal>Por que começar agora</span>
            <h2 className={styles.sectionTitle} data-reveal style={delay(80)}>
              O edital ainda não saiu. É exatamente por isso que essa é a hora.
            </h2>

            <div className={styles.bulletGrid}>
              <div className={styles.bulletCard} data-reveal="fade" style={delay(0)}>
                <span className={styles.bulletIcon}>🏁</span>
                <p>
                  Enquanto a maioria espera o edital pra começar, você sai na frente com a
                  sua base feita no caminho certo. Quem chega no pós-edital preparado vai
                  pra disputa com muita vantagem.
                </p>
              </div>
              <div className={styles.bulletCard} data-reveal="fade" style={delay(110)}>
                <span className={styles.bulletIcon}>💰</span>
                <p>
                  São 60 vagas imediatas e mais 60 de cadastro de reserva, para uma carreira
                  que, com os auxílios, passa de R$ 22 mil por mês. Você precisa começar a
                  se mexer agora.
                </p>
              </div>
              <div className={styles.bulletCard} data-reveal="fade" style={delay(220)}>
                <span className={styles.bulletIcon}>🔑</span>
                <p>
                  No grupo eu abro tudo em primeira mão: o ciclo de estudos completo, a
                  análise da banca assim que ela for definida, e as condições da turma de
                  pré-edital, que tem vagas limitadas.
                </p>
              </div>
            </div>

            <div className={styles.centerCta} data-reveal style={delay(120)}>
              <CtaButton>Quero entrar no grupo do pré-edital CGU</CtaButton>
            </div>
          </div>
        </section>

        {/* AUTORIDADE */}
        <section className={`${styles.section} ${styles.sectionDark} ${styles.authority}`}>
          <div className={`${styles.orb} ${styles.orbDarkRight}`} />
          <div className={`${styles.orb} ${styles.orbDarkLeft}`} />
          <div className={styles.container}>
            <div className={styles.authorityHead}>
              <span className={`${styles.eyebrow} ${styles.eyebrowHot}`} data-reveal>Quem conduz</span>
              <h2 className={styles.authorityTitle} data-reveal style={delay(80)}>
                Quem vai te orientar já passou — e ainda senta na cadeira que você quer ocupar.
              </h2>
              <p className={styles.authoritySub} data-reveal style={delay(140)}>
                Não é teoria de quem nunca prestou concurso. São dois auditores na ativa
                conduzindo a sua preparação de perto.
              </p>
            </div>

            <div className={styles.mentorRows}>
              <article className={styles.mentorRow}>
                <div className={styles.mentorPhotoCol} data-reveal="left">
                  <MentorPhoto shots={PIETRO_SHOTS} alt="Pietro Viecili, Auditor da CGU" interval={3800} />
                </div>
                <div className={styles.mentorTextCol} data-reveal="right">
                  <span className={styles.mentorRole}>Auditor Federal de Finanças e Controle · CGU</span>
                  <h3 className={styles.mentorName}>Pietro Viecili</h3>
                  <p className={styles.mentorBio}>
                    Aprovado em <strong>segundo lugar</strong> para Auditor da CGU — depois de
                    reprovar sete vezes. É ele quem conduz a aula gratuita e o grupo do
                    pré-edital, te entregando o ciclo de estudos e a leitura da banca em
                    primeira mão.
                  </p>
                  <ul className={styles.mentorFacts}>
                    <li>2º lugar na CGU</li>
                    <li>Aprovado na PF</li>
                    <li>1º lugar no TJ-RO e na DPE-RO</li>
                  </ul>
                </div>
              </article>

              <article className={`${styles.mentorRow} ${styles.mentorRowReverse}`}>
                <div className={styles.mentorPhotoCol} data-reveal="right">
                  <MentorPhoto shots={SERGIO_SHOTS} alt="Sérgio Furtado, Auditor-Fiscal" interval={4300} />
                </div>
                <div className={styles.mentorTextCol} data-reveal="left">
                  <span className={styles.mentorRole}>Auditor-Fiscal · SEFIN-RO</span>
                  <h3 className={styles.mentorName}>Sérgio Furtado</h3>
                  <p className={styles.mentorBio}>
                    Auditor-Fiscal da SEFIN-RO e responsável pelo <strong>método de revisão
                    da Esquematiza</strong> — o mesmo que colocou alunos da casa nas listas
                    dos maiores fiscos do país.
                  </p>
                  <ul className={styles.mentorFacts}>
                    <li>Método de revisão da Esquematiza</li>
                    <li>Auditor-Fiscal SEFIN-RO</li>
                    <li>Referência em flashcards no Brasil</li>
                  </ul>
                </div>
              </article>
            </div>

            <p className={styles.authorityNote} data-reveal>
              Só em 2026, nossos alunos dominaram as listas de aprovados dos quatro maiores
              fiscos que aplicaram provas: <strong>SP, MT, RN e PA</strong>.
            </p>
          </div>
        </section>

        {/* O QUE VOCÊ RECEBE NO GRUPO */}
        <section className={`${styles.section} ${styles.sectionTint}`}>
          <div className={`${styles.orb} ${styles.orbTintLeft}`} />
          <div className={styles.container}>
            <span className={styles.eyebrow} data-reveal>Dentro do grupo VIP</span>
            <h2 className={styles.sectionTitle} data-reveal style={delay(80)}>
              O que você recebe assim que entrar no grupo.
            </h2>

            <div className={styles.perkGrid}>
              {GROUP_PERKS.map(([title, desc], i) => (
                <div key={title} className={styles.perkCard} data-reveal="fade" style={delay((i % 3) * 90)}>
                  <span className={styles.perkCheck}>✓</span>
                  <div>
                    <h4 className={styles.perkTitle}>{title}</h4>
                    <p className={styles.perkDesc}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ESCASSEZ / FECHO */}
        <section className={`${styles.section} ${styles.sectionFinal}`}>
          <div className={`${styles.orb} ${styles.orbFinalLeft}`} />
          <div className={`${styles.orb} ${styles.orbFinalRight}`} />
          <div className={styles.container}>
            <div className={styles.scarcityCard} data-reveal="scale">
              <div className={styles.scarcitySeal}>
                <span className={styles.scarcityNum}>30</span>
                <span className={styles.scarcityNumLabel}>vagas</span>
              </div>
              <div className={styles.scarcityBody}>
                <span className={`${styles.eyebrow} ${styles.eyebrowHot}`}>Escassez real</span>
                <h2 className={styles.scarcityTitle}>
                  A turma de pré-edital terá apenas 30 vagas.
                </h2>
                <p className={styles.scarcityText}>
                  Acompanhamento de verdade não pode ter um número indefinido de alunos.
                  Entra no grupo pra tirar suas dúvidas sobre o cargo e o concurso, receber
                  o ciclo de estudos em Excel, acompanhar a preparação de perto e ser o
                  primeiro a saber quando as vagas abrirem.
                </p>
                <div className={styles.scarcityCta}>
                  <CtaButton variant="gradient">Entrar no grupo exclusivo do pré-edital CGU</CtaButton>
                  <p className={styles.ctaNote}>Entrada gratuita · vagas da turma limitadas.</p>
                </div>
              </div>
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
