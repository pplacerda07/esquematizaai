'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { rotuloDeFerramenta } from '@/data/catalogo/rotulos';
import styles from './styles.module.css';

export interface ItemVitrine {
  id: string;
  nome: string;
  categoria: string;
  area: string | null;
  ferramenta: string | null;
  preco: number;
  precoAntigo: number | null;
  percentualOff: number | null;
  checkout: string;
  capa: { src: string; width: number; height: number } | null;
}

// fallback desenhado quando o produto ainda não tem capa
const AREA_CAPA_CLASSE: Record<string, string> = {
  'Fiscal': 'capaFallbackFiscal',
  'Controle': 'capaFallbackControle',
  'Policial': 'capaFallbackPolicial',
  'Tribunais': 'capaFallbackTribunais',
  'Bancária': 'capaFallbackBancaria',
  'Legislativo': 'capaFallbackLegislativo',
};

const SEGMENTOS = [
  { valor: 'todos', rotulo: 'Tudo' },
  { valor: 'combo', rotulo: 'Combos' },
  { valor: 'isolado', rotulo: 'Isolados' },
  { valor: 'assinatura', rotulo: 'Assinaturas' },
] as const;

const AREAS = ['Fiscal', 'Controle', 'Policial', 'Tribunais', 'Bancária', 'Legislativo'] as const;

const POR_PAGINA = 8;

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Catalogo({ itens }: { itens: ItemVitrine[] }) {
  const [segmento, setSegmento] = useState<string>('todos');
  const [area, setArea] = useState<string>('todas');
  const [visiveis, setVisiveis] = useState(POR_PAGINA);

  const filtrados = useMemo(() => {
    const lista = itens.filter((item) => {
      if (segmento !== 'todos' && item.categoria !== segmento) return false;
      if (area !== 'todas' && item.area !== area) return false;
      return true;
    });
    // na visão geral (sem filtro), produtos com capa abrem a vitrine;
    // dentro de cada grupo: maiores descontos primeiro, depois ordem alfabética
    const visaoGeral = segmento === 'todos' && area === 'todas';
    return lista.sort((a, b) => {
      if (visaoGeral && !!a.capa !== !!b.capa) return a.capa ? -1 : 1;
      const offA = a.percentualOff ?? -1;
      const offB = b.percentualOff ?? -1;
      if (offA !== offB) return offB - offA;
      return a.nome.localeCompare(b.nome, 'pt-BR');
    });
  }, [itens, segmento, area]);

  const contagemSegmento = useMemo(() => {
    const mapa: Record<string, number> = { todos: 0 };
    for (const item of itens) {
      mapa.todos += 1;
      mapa[item.categoria] = (mapa[item.categoria] ?? 0) + 1;
    }
    return mapa;
  }, [itens]);

  const trocarSegmento = (valor: string) => {
    setSegmento(valor);
    setVisiveis(POR_PAGINA);
  };

  const trocarArea = (valor: string) => {
    setArea(valor);
    setVisiveis(POR_PAGINA);
  };

  const emTela = filtrados.slice(0, visiveis);

  return (
    <section className={styles.vitrineSection} id="vitrine">
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            Catálogo <span className={styles.titleAccent}>Completo</span>
          </h2>
          <p className={styles.subtitle}>
            Combos, materiais isolados e assinaturas para concursos das áreas Fiscal, Controle,
            Policial, Tribunais, Bancária e Legislativa. Compra direta no checkout da Eduzz.
          </p>
        </div>

        <div className={styles.filters} role="group" aria-label="Filtrar por tipo de produto">
          {SEGMENTOS.map((s) => (
            <button
              key={s.valor}
              type="button"
              className={`${styles.filterBtn} ${segmento === s.valor ? styles.filterBtnActive : ''}`}
              aria-pressed={segmento === s.valor}
              onClick={() => trocarSegmento(s.valor)}
            >
              {s.rotulo}
              <span className={styles.filterCount}>{contagemSegmento[s.valor] ?? 0}</span>
            </button>
          ))}
        </div>

        <div className={styles.areaFilters} role="group" aria-label="Filtrar por área de concurso">
          <button
            type="button"
            className={`${styles.areaBtn} ${area === 'todas' ? styles.areaBtnActive : ''}`}
            aria-pressed={area === 'todas'}
            onClick={() => trocarArea('todas')}
          >
            Todas as áreas
          </button>
          {AREAS.map((a) => (
            <button
              key={a}
              type="button"
              className={`${styles.areaBtn} ${area === a ? styles.areaBtnActive : ''}`}
              aria-pressed={area === a}
              onClick={() => trocarArea(a)}
            >
              {a}
            </button>
          ))}
        </div>

        {emTela.length === 0 ? (
          <p className={styles.emptyState}>
            Nenhum produto encontrado com esses filtros. Tente outra combinação.
          </p>
        ) : (
          <div className={styles.grid}>
            {emTela.map((item) => (
              <article key={item.id} className={styles.card}>
                <Link
                  href={`/vitrine/produto/${item.id}`}
                  className={styles.capaWrap}
                  aria-label={`Ver detalhes de ${item.nome}`}
                  tabIndex={-1}
                >
                  {item.capa ? (
                    <Image
                      src={item.capa.src}
                      alt={`Capa de ${item.nome}`}
                      width={item.capa.width}
                      height={item.capa.height}
                      className={styles.capaImg}
                    />
                  ) : (
                    <span
                      className={`${styles.capaFallback} ${styles[AREA_CAPA_CLASSE[item.area ?? ''] ?? 'capaFallbackFiscal']}`}
                      aria-hidden="true"
                    >
                      {rotuloDeFerramenta(item.ferramenta, item.categoria)}
                    </span>
                  )}
                </Link>
                <div className={styles.cardHeader}>
                  <span className={styles.badge}>{rotuloDeFerramenta(item.ferramenta, item.categoria)}</span>
                  {item.area && <span className={styles.badgeArea}>{item.area}</span>}
                  {item.percentualOff !== null && (
                    <span className={styles.offPill}>-{item.percentualOff}%</span>
                  )}
                </div>

                <div className={styles.cardBody}>
                  <h3 className={styles.productTitle}>
                    <Link href={`/vitrine/produto/${item.id}`} className={styles.productTitleLink}>
                      {item.nome}
                    </Link>
                  </h3>
                  <div className={styles.priceContainer}>
                    {item.precoAntigo !== null && (
                      <span className={styles.oldPrice}>de {brl.format(item.precoAntigo)}</span>
                    )}
                    <span className={styles.currentPrice}>{brl.format(item.preco)}</span>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <a
                    className={styles.btnBuy}
                    href={item.checkout}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Comprar ${item.nome} por ${brl.format(item.preco)}`}
                  >
                    Comprar agora →
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className={styles.gridActions}>
          {visiveis < filtrados.length && (
            <button
              type="button"
              className={styles.btnShowMore}
              onClick={() => setVisiveis((v) => v + POR_PAGINA)}
            >
              Mostrar mais ({filtrados.length - visiveis} restantes)
            </button>
          )}
          <a className={styles.vitrineLink} href="/vitrine">
            Ver a vitrine completa por área →
          </a>
        </div>
      </div>
    </section>
  );
}
