import React from 'react';
import styles from './styles.module.css';
import Countdown from './Countdown';
import UrgencyBar from './UrgencyBar';
import BuscaEAtalhos from '@/components/BuscaEAtalhos';
import CarrosselDestaque, { MOSTRAR_CARROSSEL_DESTAQUE } from '@/components/CarrosselDestaque';
import LiveTicker from './LiveTicker';
import OfferCarousel, { type OfertaHero } from './OfferCarousel';
import { produtoPor, ofertaAtual } from '@/data/catalogo';

// Ofertas reais que giram no card do hero: o combo completo de cada área + a
// assinatura mais completa. Se um produto perder preço ou destino de compra no
// catálogo, sai do carrossel sozinho.
// Por slug e não por ID da Eduzz: depois da planilha de jul/2026 só 31 dos 107
// produtos têm ID Eduzz, então o slug é a chave estável.
/**
 * Liga e desliga o bloco de oferta do hero (cronômetro + carrossel de produtos).
 *
 * Desligado hoje: com a barra do cupom ESQ10 no topo, seriam dois cronômetros
 * correndo na mesma tela, e isso dá cara de página cheia de gatilho. O código
 * fica de pé para voltar num lançamento ou masterclass.
 */
const MOSTRAR_OFERTA_NO_HERO = false;

const HERO_OFERTA_IDS = [
  'combo-resumos-flashcards-fiscal-regular',
  'combo-resumos-flashcards-controle-regular',
  'combo-resumos-flashcards-policial-regular',
  'combo-resumos-flashcards-tribunais-regular',
  'assinatura-resumos-regular-flashcards-regular',
];

/**
 * Marcador da lista de benefícios: UMA camada do símbolo do Esquematiza.
 * Lidas de cima para baixo (azul, laranja, verde), as três remontam o logo.
 */
const CamadaDaMarca = ({ className }: { className: string }) => (
  <svg className={className} width="24" height="18" viewBox="0 0 24 18" aria-hidden="true">
    <path d="M4.6 3.2 L22 2.2 L21.1 7.6 L11.6 8.2 L9.6 14.4 L2 15.4 Z" />
  </svg>
);

export default function HeroSection() {
  const ofertas: OfertaHero[] = HERO_OFERTA_IDS.flatMap((id) => {
    const p = produtoPor(id);
    const o = p ? ofertaAtual(p) : null;
    return p && o
      ? [{
          id: p.id,
          nome: p.nome,
          area: p.area,
          preco: o.preco,
          precoAntigo: o.precoAntigo,
          percentualOff: o.percentualOff,
          checkout: o.checkout,
        }]
      : [];
  });

  return (
    <>
      <UrgencyBar />

      <section className={styles.hero}>
        <div className={`${styles.decoration} ${styles.decorationTopLeft}`}></div>
        <div className={`${styles.decoration} ${styles.decorationBottomRight}`}></div>

        {/* Ordem pedida pelo Sérgio: cupom, busca, atalhos por tipo, e só então
            a chamada. Quem chega sabendo o que quer resolve nas duas primeiras
            linhas, sem ler o hero inteiro para achar o caminho.

            Fica DENTRO do hero de propósito. Como seção separada, a mancha
            desfocada do canto superior esquerdo era cortada a seco na borda do
            hero e criava um risco visível bem embaixo da busca. Sem fronteira
            entre os dois, o desfoque passa por trás e some sozinho. */}
        <BuscaEAtalhos />

        <div className={styles.container}>
          <div className={styles.columnLeft}>
            <h1 className={styles.title}>
              Cansado de estudar conteúdos{' '}
              <span className={styles.titleHighlight}>desnecessários</span>?
            </h1>

            {/* Destaque em "metodologia" e "histórico de cobrança", que é o que
                diferencia a casa. Peso e opacidade cheia, não Moonlight: ela é
                fonte de display, e duas frases em script dentro de um parágrafo
                de 18px atrapalham a leitura. No site ela é acento de título. */}
            <p className={styles.subtitle}>
              Aqui no Esquematiza Aí utilizamos uma{' '}
              <strong className={styles.subtitleDestaque}>metodologia</strong> baseada no{' '}
              <strong className={styles.subtitleDestaque}>histórico de cobrança</strong> em
              provas para direcionar seus estudos e encurtar o tempo até a aprovação!
            </p>

            <div className={styles.benefitList}>
              <div className={styles.benefitItem}>
                <CamadaDaMarca className={`${styles.benefitMark} ${styles.markAzul}`} />
                Material elaborado a partir de questões de concursos
              </div>
              <div className={styles.benefitItem}>
                <CamadaDaMarca className={`${styles.benefitMark} ${styles.markLaranja}`} />
                Utilizado por mais de 30 mil alunos
              </div>
              <div className={styles.benefitItem}>
                <CamadaDaMarca className={`${styles.benefitMark} ${styles.markVerde}`} />
                Feito para você revisar de forma leve, fluida e sem pausas
              </div>
            </div>

            <div className={styles.actionButtons}>
              <a href="/vitrine" className={styles.btnMain}>
                CONHEÇA NOSSOS MATERIAIS
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </a>
            </div>

            <LiveTicker />

            {/* saíram os avatares genéricos: a nota real ancora o bloco melhor
                do que três bolinhas coloridas sem rosto nenhum atrás */}
            <div className={styles.socialProof}>
              <span className={styles.proofScore}>
                4,9<span className={styles.proofScoreMax}>/5</span>
              </span>
              <div className={styles.proofText}>
                <div className={styles.stars}>★★★★★</div>
                <span>
                  Materiais elaborados de forma <strong>artesanal</strong> e avaliados com
                  excelência pelos alunos
                </span>
              </div>
            </div>
          </div>

          {/* A coluna da direita tem dois moradores possíveis, os dois
              desligados hoje:

              1. Oferta com cronômetro. Sai porque o cupom no topo já tem um, e
                 dois cronômetros na mesma tela dão cara de página de gatilho.
              2. Carrossel de destaque, para lançamento e masterclass. Sai
                 porque ainda não existe banner: ligar com a lista vazia
                 deixaria um retângulo cinza ocupando meia tela.

              Ligar qualquer um é trocar a constante correspondente. */}
          {(MOSTRAR_OFERTA_NO_HERO || MOSTRAR_CARROSSEL_DESTAQUE) && (
            <div className={styles.columnRight}>
              <div className={styles.blobBackground}></div>

              {MOSTRAR_CARROSSEL_DESTAQUE && <CarrosselDestaque />}

              {MOSTRAR_OFERTA_NO_HERO && (
                <div className={styles.offerStack}>
                  <Countdown />
                  <OfferCarousel ofertas={ofertas} />
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
