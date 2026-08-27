'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { DEPOIMENTOS_VIDEO_BASE } from '@/config';
import styles from './styles.module.css';

/**
 * Depoimentos em vídeo, em carrossel.
 *
 * O VÍDEO SÓ CARREGA NO PLAY. Até lá a página baixa apenas a capa, que tem uns
 * 30 KB. Sem isso, quatro vídeos somariam 22 MB de tráfego por visita, cobrados
 * do plano do Supabase mesmo para quem passou direto sem assistir. Com a capa,
 * a franquia só é gasta por quem realmente quis ver.
 *
 * O avanço automático PARA quando alguém dá play. Carrossel que troca de slide
 * no meio de um depoimento é o oposto do que a seção quer.
 *
 * TODOS SÃO 720x1280, vertical. O Sérgio entrega cada depoimento em duas
 * versões, Reels e YouTube, e aqui usamos a Reels: a maior parte de quem acessa
 * está no celular, e é o formato em que a edição foi pensada, com a tarja do
 * nome, a legenda e o logo posicionados para essa proporção.
 *
 * NÃO CONVERTA A VERSÃO YOUTUBE PARA VERTICAL. Ela já é o mesmo vídeo vertical
 * encaixado em 16:9 com fundo desfocado; encaixar de novo cria moldura dentro
 * de moldura e o rosto vira um selo no meio da tela. Testei com o Lucas e o
 * resultado foi descartado. Faltando a Reels de alguém, é melhor o cartão não
 * aparecer do que aparecer assim.
 *
 * NÃO TEM SEÇÃO NEM TÍTULO PRÓPRIOS: quem monta isso é o ProvaSocial, que
 * reúne este carrossel e o dos prints sob um título só. Separados, a página
 * trazia dois títulos grandes seguidos dizendo a mesma coisa.
 */

type Depoimento = {
  slug: string;
  nome: string;
  /** aparece abaixo do nome; vazio some da tela */
  aprovacao?: string;
};

/**
 * Nome e aprovação saíram da TARJA GRAVADA em cada vídeo, não de suposição:
 * é exatamente o que a pessoa vê escrito enquanto assiste. Foi assim que as
 * aprovações do Wagner, do Yan e do Lucas apareceram, depois de meses sem
 * ninguém saber quais eram.
 *
 * A legenda aqui embaixo é uma versão curta da tarja, com os melhores números
 * na frente. A tarja completa está no vídeo, e repetir tudo faria o cartão
 * dizer duas vezes a mesma coisa.
 *
 * "Cadu" é o mesmo aluno que aparecia como "Walyson Kadu". Conferi quadro a
 * quadro contra o vídeo antigo: mesmo carro, mesma camiseta, mesmo óculos. A
 * edição nova assina "Cadu", então o site passa a chamá-lo assim.
 *
 * A ordem é por força do resultado: primeiro lugar convence mais que aprovado.
 *
 * O Lucas continua na lista de propósito, embora ainda não tenha a versão
 * Reels no bucket. Sem os arquivos ele some sozinho, e volta a aparecer no dia
 * em que forem enviados, sem precisar mexer aqui.
 */
const DEPOIMENTOS: Depoimento[] = [
  {
    slug: 'wagner-borges',
    nome: 'Wagner Borges',
    aprovacao: 'Multi aprovado: 1º lugar na SEFAZ-PI (Analista) e 5º (Auditor)',
  },
  {
    slug: 'yan-almeida',
    nome: 'Yan Almeida',
    aprovacao: 'Multi aprovado: 2º na SEFA-PA, 5º na SEFAZ-SE e 18º na SEFAZ-SP',
  },
  {
    slug: 'iury-neiva',
    nome: 'Iury Neiva',
    aprovacao: 'Aprovado em 5º lugar, Fiscal de Rendas na SEFA-PA',
  },
  {
    slug: 'cadu',
    nome: 'Cadu',
    aprovacao: 'Aprovado como Auditor Fiscal da Receita Estadual, SEFAZ-AC',
  },
  // O Lucas saiu daqui até a Reels dele chegar ao bucket. Ele estava cadastrado
  // confiando no `onError` abaixo para sumir sozinho, e não sumiu a tempo: o
  // Sérgio viu o cartão preto com o botão de play em produção. Guarda que age
  // depois que a imagem falha é rede de segurança, não lugar de apostar.
];

const INTERVALO_MS = 6000;

export default function VideosDepoimentos() {
  const trilho = useRef<HTMLDivElement>(null);
  const [indice, setIndice] = useState(0);
  const [tocando, setTocando] = useState<string | null>(null);
  const [pausado, setPausado] = useState(false);
  /**
   * Slugs cuja capa não existe no Supabase.
   *
   * O vídeo é cadastrado aqui no código e o arquivo é enviado à mão para o
   * bucket, então existe uma janela entre uma coisa e outra. Se a capa não
   * carrega, o slide some em vez de virar um retângulo quebrado no meio da
   * prova social, que é onde a página menos pode parecer malfeita.
   */
  const [semArquivo, setSemArquivo] = useState<string[]>([]);

  const lista = DEPOIMENTOS.filter((d) => !semArquivo.includes(d.slug));

  const irPara = useCallback((i: number) => {
    const el = trilho.current;
    const slide = el?.children[i] as HTMLElement | undefined;
    if (!el || !slide) return;
    el.scrollTo({ left: slide.offsetLeft - el.offsetLeft, behavior: 'smooth' });
    setIndice(i);
  }, []);

  useEffect(() => {
    // alguém assistindo trava o carrossel, e é o comportamento certo
    if (pausado || tocando) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const t = window.setInterval(() => {
      setIndice((atual) => {
        const proximo = (atual + 1) % lista.length;
        const el = trilho.current;
        const slide = el?.children[proximo] as HTMLElement | undefined;
        if (el && slide) {
          el.scrollTo({ left: slide.offsetLeft - el.offsetLeft, behavior: 'smooth' });
        }
        return proximo;
      });
    }, INTERVALO_MS);

    return () => window.clearInterval(t);
  }, [pausado, tocando, lista.length]);

  // sumiu todo mundo (bucket fora do ar, por exemplo): melhor não deixar um
  // título "Em vídeo" em cima de um vazio
  if (lista.length === 0) return null;

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
          role="group"
          aria-label="Depoimentos em vídeo"
        >
          {lista.map((d) => {
            const capa = `${DEPOIMENTOS_VIDEO_BASE}/${d.slug}.jpg`;
            const video = `${DEPOIMENTOS_VIDEO_BASE}/${d.slug}.mp4`;
            const ativo = tocando === d.slug;

            return (
              <figure key={d.slug} className={styles.slide}>
                <div className={styles.moldura}>
                  {ativo ? (
                    /* eslint-disable-next-line jsx-a11y/media-has-caption */
                    <video
                      className={styles.video}
                      src={video}
                      poster={capa}
                      controls
                      autoPlay
                      playsInline
                      preload="metadata"
                      onEnded={() => setTocando(null)}
                    />
                  ) : (
                    <button
                      type="button"
                      className={styles.capa}
                      onClick={() => setTocando(d.slug)}
                      aria-label={`Assistir ao depoimento de ${d.nome}`}
                    >
                      <Image
                        src={capa}
                        alt=""
                        fill
                        sizes="(max-width: 900px) 78vw, 300px"
                        className={styles.imagem}
                        onError={() =>
                          setSemArquivo((atuais) =>
                            atuais.includes(d.slug) ? atuais : [...atuais, d.slug],
                          )
                        }
                      />
                      <span className={styles.play} aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5.5 L19 12 L8 18.5 Z" />
                        </svg>
                      </span>
                    </button>
                  )}
                </div>

                <figcaption className={styles.legenda}>
                  <span className={styles.nome}>{d.nome}</span>
                  {d.aprovacao && <span className={styles.aprovacao}>{d.aprovacao}</span>}
                </figcaption>
              </figure>
            );
          })}
        </div>

        <div className={styles.controles}>
          <button
            type="button"
            className={styles.seta}
            onClick={() => irPara((indice - 1 + lista.length) % lista.length)}
            aria-label="Depoimento anterior"
          >
            ‹
          </button>

          <div className={styles.bolinhas}>
            {lista.map((d, i) => (
              <button
                key={d.slug}
                type="button"
                className={`${styles.bolinha} ${i === indice ? styles.bolinhaAtiva : ''}`}
                onClick={() => irPara(i)}
                aria-label={`Ver depoimento ${i + 1} de ${lista.length}`}
                aria-current={i === indice ? 'true' : undefined}
              />
            ))}
          </div>

          <button
            type="button"
            className={styles.seta}
            onClick={() => irPara((indice + 1) % lista.length)}
            aria-label="Próximo depoimento"
          >
            ›
          </button>
        </div>
      </div>
  );
}
