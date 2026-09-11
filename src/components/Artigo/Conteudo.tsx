import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { Children, isValidElement } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkDirective from 'remark-directive';
import remarkBlocos from './remarkBlocos';
import CtaProduto from './CtaProduto';
import { ancora } from '@/lib/artigo';
import styles from './conteudo.module.css';

/** Texto puro de uma árvore React, para gerar a âncora do título. */
function textoDe(no: ReactNode): string {
  if (typeof no === 'string' || typeof no === 'number') return String(no);
  if (Array.isArray(no)) return no.map(textoDe).join('');
  if (isValidElement<{ children?: ReactNode }>(no)) return textoDe(no.props.children);
  return '';
}

/** Rótulo padrão de cada caixa quando o autor não escreve um entre colchetes. */
const ROTULO_PADRAO: Record<string, string> = {
  importante: 'Importante',
  dica: 'Dica de prova',
  sintese: 'Em síntese',
  aprofunde: 'Aprofunde em cada concurso',
  fontes: 'Fontes',
  // a lei não tem rótulo padrão de propósito: quem escreve informa o
  // dispositivo em `:::lei[Art. 5º da LC 236]`, e sem referência a caixa perde
  // a função. Caindo aqui, o nome do bloco aparece e denuncia o esquecimento.
  lei: 'Dispositivo legal',
};

const CLASSE_DA_CAIXA: Record<string, string> = {
  importante: styles.caixaImportante,
  dica: styles.caixaDica,
  sintese: styles.caixaSintese,
  aprofunde: styles.caixaAprofunde,
  fontes: styles.caixaFontes,
  lei: styles.caixaLei,
};

/**
 * Linha onde começa o primeiro parágrafo de texto do artigo.
 *
 * O primeiro parágrafo sai em corpo maior (`lede`), como no modelo do
 * WordPress. Para saber qual é ele sem depender da ordem em que o React
 * renderiza, a linha é calculada uma vez a partir do Markdown e comparada com
 * a posição que o parser devolve em cada parágrafo.
 *
 * Título, caixa, tabela, lista, citação e imagem não contam: o lede é o
 * primeiro texto corrido de verdade.
 */
function linhaDoLede(markdown: string): number | null {
  const linhas = markdown.split('\n');
  let dentroDeCodigo = false;

  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i].trim();
    if (/^```/.test(linha)) {
      dentroDeCodigo = !dentroDeCodigo;
      continue;
    }
    if (dentroDeCodigo || !linha) continue;
    if (/^(#|:::|::|>|\||-|\*|\d+\.|!\[)/.test(linha)) continue;
    return i + 1; // o parser conta a partir de 1
  }
  return null;
}

type PropsDiv = ComponentPropsWithoutRef<'div'> & {
  'data-bloco'?: string;
  'data-rotulo'?: string;
  id?: string;
};

export default function Conteudo({ markdown }: { markdown: string }) {
  const lede = linhaDoLede(markdown);

  return (
    <div className={styles.corpo}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkDirective, remarkBlocos]}
        components={{
          div(props: PropsDiv) {
            const { 'data-bloco': bloco, 'data-rotulo': rotulo, children, ...resto } = props;

            if (!bloco) return <div {...resto}>{children}</div>;

            // ::produto{id=...} puxa preço e link do catálogo, então a oferta do
            // artigo nunca fica desatualizada em relação à loja.
            if (bloco === 'produto') {
              const id = (resto as { id?: string }).id;
              return id ? <CtaProduto id={id} /> : null;
            }

            /**
             * :::faq agrupa as perguntas frequentes.
             *
             * Existe por causa do índice: ele monta a partir de H2 e H3, então
             * sem o agrupamento cada pergunta do FAQ entraria na navegação
             * lateral misturada com os subtítulos do artigo. É também o que
             * permite gerar o schema de FAQ depois.
             */
            if (bloco === 'faq') {
              return <section className={styles.faq}>{children}</section>;
            }

            const classe = CLASSE_DA_CAIXA[bloco];
            if (!classe) return <div {...resto}>{children}</div>;

            return (
              <aside className={`${styles.caixa} ${classe}`}>
                <p className={styles.caixaRotulo}>{rotulo ?? ROTULO_PADRAO[bloco] ?? bloco}</p>
                <div className={styles.caixaCorpo}>{children}</div>
              </aside>
            );
          },

          span(props: ComponentPropsWithoutRef<'span'> & { 'data-bloco'?: string }) {
            const { 'data-bloco': bloco, children, ...resto } = props;
            /**
             * Dois marca-textos, com significados diferentes.
             *
             * Azul é número que sustenta o argumento. Salmão é valor com
             * ressalva ou dado que foi superado. Ter só um apaga essa distinção
             * em todo artigo que veio do blog antigo.
             */
            if (bloco === 'marca') return <mark className={styles.marca}>{children}</mark>;
            if (bloco === 'ressalva') return <mark className={styles.ressalva}>{children}</mark>;
            return <span {...resto}>{children}</span>;
          },

          h2({ children }) {
            const texto = textoDe(children);
            return (
              <h2 id={ancora(texto)} className={styles.h2}>
                {children}
              </h2>
            );
          },

          h3({ children }) {
            const texto = textoDe(children);
            return (
              <h3 id={ancora(texto)} className={styles.h3}>
                {children}
              </h3>
            );
          },

          // a tabela precisa rolar sozinha no celular; a página nunca rola de lado
          table({ children }) {
            return (
              <div className={styles.tabelaWrap}>
                <table className={styles.tabela}>{children}</table>
              </div>
            );
          },

          tr({ children, ...resto }) {
            // Linha de agrupamento: só a primeira célula tem conteúdo.
            // No Markdown o autor escreve `| **ESTADUAIS E FEDERAL** | | | |`.
            const celulas = Children.toArray(children).filter(isValidElement);
            const preenchidas = celulas.filter((c) =>
              textoDe((c.props as { children?: ReactNode }).children).trim(),
            );
            if (celulas.length > 1 && preenchidas.length === 1 && preenchidas[0] === celulas[0]) {
              return (
                <tr className={styles.linhaGrupo}>
                  <td colSpan={celulas.length}>
                    {(celulas[0].props as { children?: ReactNode }).children}
                  </td>
                </tr>
              );
            }
            return <tr {...resto}>{children}</tr>;
          },

          p({ children, node }) {
            // primeiro parágrafo de texto do artigo em corpo maior
            const ehLede = lede !== null && node?.position?.start.line === lede;
            return <p className={ehLede ? styles.lede : undefined}>{children}</p>;
          },

          a({ href, children, ...resto }) {
            /**
             * Voltar ao índice.
             *
             * Não precisa de diretiva nova: quem escreve já põe um link comum
             * apontando para a âncora do sumário, e o renderizador reconhece o
             * destino e troca o estilo. Assim o link fica discreto e cinza em
             * vez de azul, competindo com os links de conteúdo.
             */
            if (href === '#sumario-titulo') {
              return (
                <a href={href} className={styles.voltar} {...resto}>
                  {children}
                </a>
              );
            }

            const externo = !!href && /^https?:\/\//.test(href) && !href.includes('esquematizaai.com');
            return (
              <a
                href={href}
                className={styles.link}
                {...(externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                {...resto}
              >
                {children}
              </a>
            );
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
