'use client';

import { useMemo, useRef, useState, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
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
  /** true = o link leva à página do produto, não a um checkout que já cobra */
  viaPaginaDeVendas: boolean;
  capa: { src: string; width: number; height: number } | null;
  /** marcado como destaque no painel */
  destaque: boolean;
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

// 6 = duas fileiras de 3 no desktop. Com 8, a última fileira ficava pela metade.
const POR_PAGINA = 6;

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/**
 * Legenda de cada faixa de filtro. O catálogo filtra em dois níveis (tipo de
 * material e depois área), e sem dizer isso a pessoa lê como se fossem duas
 * alternativas, não duas escolhas somadas.
 *
 * Ela pisca em ciclo: sobe, aparece, segura um tempo e some. É uma dica, não
 * um rótulo permanente, então não pode brigar por atenção com os botões nem
 * empurrar o catálogo para baixo (por isso opacidade, e não display).
 */
function PassoFiltro({ numero, children }: { numero: number; children: ReactNode }) {
  return (
    <p className={`${styles.passo} ${numero === 2 ? styles.passoAtrasado : ''}`}>
      <span className={styles.passoNumero} aria-hidden="true">
        {numero}
      </span>
      {children}
    </p>
  );
}

/** tira acento e caixa para a busca casar "tributaria" com "Tributária" */
function normalizar(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

export default function Catalogo({ itens }: { itens: ItemVitrine[] }) {
  /**
   * A busca e o tipo podem vir pela URL: /vitrine?busca=tributaria&tipo=combo
   *
   * É o que permite a caixa de busca e os botões da home levarem a pessoa
   * direto ao resultado. Sem isso, os dois só rolariam a página até aqui e ela
   * teria de repetir o filtro na mão, o que faria a busca da home ser enfeite.
   *
   * Vale só na primeira renderização: depois quem manda são os controles daqui,
   * senão mexer no filtro brigaria com o endereço.
   */
  const parametros = useSearchParams();
  const buscaInicial = parametros.get('busca') ?? '';
  const tipoInicial = parametros.get('tipo') ?? 'todos';

  const [segmento, setSegmento] = useState<string>(
    ['combo', 'isolado', 'assinatura'].includes(tipoInicial) ? tipoInicial : 'todos',
  );
  const [area, setArea] = useState<string>('todas');
  const [visiveis, setVisiveis] = useState(POR_PAGINA);
  const [buscaAberta, setBuscaAberta] = useState(buscaInicial !== '');
  const [busca, setBusca] = useState(buscaInicial);
  const inputBusca = useRef<HTMLInputElement>(null);

  const filtrados = useMemo(() => {
    const termo = normalizar(busca);
    const lista = itens.filter((item) => {
      if (segmento !== 'todos' && item.categoria !== segmento) return false;
      if (area !== 'todas' && item.area !== area) return false;
      if (termo && !normalizar(item.nome).includes(termo)) return false;
      return true;
    });
    // na visão geral (sem filtro nem busca): produtos com capa abrem a vitrine e,
    // dentro deles, os combos vêm primeiro (é o carro-chefe da loja);
    // depois: maiores descontos primeiro e, por fim, ordem alfabética
    const visaoGeral = segmento === 'todos' && area === 'todas' && !termo;
    return lista.sort((a, b) => {
      // o que o painel marcou como destaque abre a vitrine
      if (a.destaque !== b.destaque) return a.destaque ? -1 : 1;
      if (visaoGeral && !!a.capa !== !!b.capa) return a.capa ? -1 : 1;
      if (visaoGeral) {
        const comboA = a.categoria === 'combo';
        const comboB = b.categoria === 'combo';
        if (comboA !== comboB) return comboA ? -1 : 1;
      }
      const offA = a.percentualOff ?? -1;
      const offB = b.percentualOff ?? -1;
      if (offA !== offB) return offB - offA;
      return a.nome.localeCompare(b.nome, 'pt-BR');
    });
  }, [itens, segmento, area, busca]);

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

        <PassoFiltro numero={1}>Escolha seu produto</PassoFiltro>

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

          <button
            type="button"
            className={`${styles.searchToggle} ${buscaAberta ? styles.searchToggleAtivo : ''}`}
            aria-label={buscaAberta ? 'Fechar busca' : 'Buscar material pelo nome'}
            aria-expanded={buscaAberta}
            onClick={() => {
              const abrindo = !buscaAberta;
              setBuscaAberta(abrindo);
              if (abrindo) setTimeout(() => inputBusca.current?.focus(), 60);
              else { setBusca(''); setVisiveis(POR_PAGINA); }
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>

        {buscaAberta && (
          <div className={styles.searchRow}>
            <div className={styles.searchField}>
              <svg className={styles.searchIcon} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                ref={inputBusca}
                type="search"
                className={styles.searchInput}
                placeholder="Buscar material pelo nome. Ex.: legislação tributária"
                value={busca}
                onChange={(e) => { setBusca(e.target.value); setVisiveis(POR_PAGINA); }}
                onKeyDown={(e) => { if (e.key === 'Escape') { setBusca(''); setBuscaAberta(false); } }}
                aria-label="Buscar material pelo nome"
              />
              {busca && (
                <button
                  type="button"
                  className={styles.searchClear}
                  onClick={() => { setBusca(''); setVisiveis(POR_PAGINA); inputBusca.current?.focus(); }}
                  aria-label="Limpar busca"
                >
                  ✕
                </button>
              )}
            </div>
            {busca && (
              <span className={styles.searchResultado}>
                {filtrados.length} {filtrados.length === 1 ? 'resultado' : 'resultados'}
              </span>
            )}
          </div>
        )}

        <PassoFiltro numero={2}>Escolha sua área de concurso</PassoFiltro>

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
            {busca
              ? `Nada encontrado para "${busca}". Tente outro termo, como "resumo" ou "flashcards".`
              : 'Nenhum produto encontrado com esses filtros. Tente outra combinação.'}
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
                  {/* leva à página do produto, não ao checkout: o botão de compra
                      só aparece depois que a pessoa lê o que está levando */}
                  <Link
                    className={styles.btnBuy}
                    href={`/vitrine/produto/${item.id}`}
                    aria-label={`Ver detalhes de ${item.nome}`}
                  >
                    Ver produto →
                  </Link>
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
