import type { DisciplinaSumario } from '@/lib/sumario-produto';
import styles from './styles.module.css';

/**
 * Sumário das disciplinas, em sanfona, como o Sérgio pediu.
 *
 * POR QUE SANFONA E NÃO LISTA CORRIDA:
 * uma assinatura leva 80 disciplinas, cada uma com dezenas de tópicos. Impresso
 * de uma vez, isso são milhares de linhas e a página de venda vira um catálogo
 * telefônico. Fechado, a pessoa bate o olho na lista de matérias e abre só a que
 * interessa.
 *
 * É <details>/<summary> nativo: abre e fecha sem JavaScript, funciona com o
 * teclado, e o buscador enxerga o conteúdo mesmo fechado.
 *
 * Produto cuja disciplina não está na planilha não recebe a seção. Preferi
 * mostrar nada a inventar tópico.
 */
type Props = {
  disciplinas: DisciplinaSumario[];
};

/**
 * Uma linha que anuncia um módulo, e não um assunto.
 *
 * O Sérgio escreve o sumário dos materiais em módulos, no painel, misturando as
 * duas coisas na mesma lista de linhas:
 *
 *   Módulo 1 ✅ acesso imediato (9 cards)
 *   1. Regra de Três, Proporções e Porcentagens: 9 cards
 *   Módulo 2 ⏳ liberado após 8 dias (93 cards)
 *   2. Juros e Descontos (Simples e Compostos): 14 cards
 *
 * Desenhadas todas iguais, o cabeçalho virava mais um assunto no meio da lista
 * e a divisão que ele criou sumia. O 📝 é o bloco do que ainda está em
 * produção, com data de entrega.
 */
const LINHA_DE_MODULO = /^\s*(?:\*\*)?\s*(?:M[óo]dulo\b|📝)/i;

/**
 * 2276 vira "2.276".
 *
 * Enquanto as disciplinas tinham centenas de cards isso não aparecia. Com o
 * SEFAZ-AL, que tem disciplina de 2.276 cards, "2276 cards" fica difícil de ler
 * de relance, e o resto do site já escreve milhar com ponto.
 */
function milhar(n: number): string {
  return n.toLocaleString('pt-BR');
}

type BlocoDeTopicos = { rotulo: string; linhas: string[] };

/**
 * Agrupa as linhas pelos cabeçalhos de módulo.
 *
 * Sumário sem nenhum cabeçalho continua saindo como saía: um bloco só, sem
 * rótulo. São 118 disciplinas da planilha nesse caso, e nenhuma delas pode
 * mudar de aparência por causa desta funcionalidade.
 */
function emModulos(topicos: string[]): BlocoDeTopicos[] {
  const blocos: BlocoDeTopicos[] = [];
  let atual: BlocoDeTopicos | null = null;

  for (const linha of topicos) {
    if (LINHA_DE_MODULO.test(linha)) {
      atual = { rotulo: linha.replace(/\*\*/g, '').trim(), linhas: [] };
      blocos.push(atual);
      continue;
    }
    if (!atual) {
      atual = { rotulo: '', linhas: [] };
      blocos.push(atual);
    }
    atual.linhas.push(linha);
  }

  // cabeçalho que ficou sem nenhuma linha embaixo não vira bloco vazio na tela
  return blocos.filter((b) => b.linhas.length > 0 || b.rotulo);
}

export default function SumarioDisciplinas({ disciplinas }: Props) {
  if (disciplinas.length === 0) return null;

  const resumos = disciplinas.filter((d) => d.formato === 'Resumo');
  const flashcards = disciplinas.filter((d) => d.formato === 'Flashcards');

  const blocos = [
    resumos.length > 0 && { titulo: 'Resumos', itens: resumos },
    flashcards.length > 0 && { titulo: 'Flashcards', itens: flashcards },
  ].filter(Boolean) as { titulo: string; itens: DisciplinaSumario[] }[];

  // com um formato só, o subtítulo por formato vira ruído
  const mostrarSubtitulos = blocos.length > 1;

  return (
    <section className={styles.secao} aria-labelledby="sumario-titulo">
      <h2 className={styles.titulo} id="sumario-titulo">
        Sumário das <span className={styles.acento}>disciplinas</span>
      </h2>

      <p className={styles.nota}>
        {disciplinas.length === 1
          ? 'Toque para ver os assuntos cobertos.'
          : `${disciplinas.length} disciplinas. Toque em uma para ver os assuntos cobertos.`}
      </p>

      {blocos.map((bloco) => (
        <div key={bloco.titulo} className={styles.bloco}>
          {mostrarSubtitulos && <h3 className={styles.subtitulo}>{bloco.titulo}</h3>}

          <ul className={styles.lista}>
            {bloco.itens.map((d) => (
              <li key={`${d.formato}-${d.disciplina}`}>
                <details className={styles.sanfona}>
                  <summary className={styles.barra}>
                    <span className={styles.nomeDisciplina}>{d.disciplina}</span>
                    <span className={styles.medida}>
                      {d.paginas ? `${milhar(d.paginas)} págs` : null}
                      {d.cards ? `${milhar(d.cards)} cards` : null}
                    </span>
                    <span className={styles.seta} aria-hidden="true">
                      ↓
                    </span>
                  </summary>

                  {/* Sem numeração do navegador: as linhas da planilha já vêm
                      numeradas ("01.", "02.01."), e a lista ordenada punha um
                      segundo número ao lado, criando duas colunas de contagem
                      que não batiam entre si. */}
                  <div className={styles.corpo}>
                    {emModulos(d.topicos).map((bloco, i) => (
                      <div key={`${bloco.rotulo}-${i}`}>
                        {bloco.rotulo && <p className={styles.moduloRotulo}>{bloco.rotulo}</p>}
                        <ul className={styles.topicos}>
                          {bloco.linhas.map((t, j) => (
                            <li key={`${t}-${j}`}>{t}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </details>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
