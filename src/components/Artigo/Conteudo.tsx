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
};

const CLASSE_DA_CAIXA: Record<string, string> = {
  importante: styles.caixaImportante,
  dica: styles.caixaDica,
  sintese: styles.caixaSintese,
  aprofunde: styles.caixaAprofunde,
  fontes: styles.caixaFontes,
};

type PropsDiv = ComponentPropsWithoutRef<'div'> & {
  'data-bloco'?: string;
  'data-rotulo'?: string;
  id?: string;
};

export default function Conteudo({ markdown }: { markdown: string }) {
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
            // grifo de marca-texto, o mesmo do modelo do WordPress
            if (bloco === 'marca') return <mark className={styles.marca}>{children}</mark>;
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

          a({ href, children, ...resto }) {
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
