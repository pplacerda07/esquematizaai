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
                      {d.paginas ? `${d.paginas} págs` : null}
                      {d.cards ? `${d.cards} cards` : null}
                    </span>
                    <span className={styles.seta} aria-hidden="true">
                      ↓
                    </span>
                  </summary>

                  {/* Sem numeração do navegador: as linhas da planilha já vêm
                      numeradas ("01.", "02.01."), e a lista ordenada punha um
                      segundo número ao lado, criando duas colunas de contagem
                      que não batiam entre si. */}
                  <ul className={styles.topicos}>
                    {d.topicos.map((t, i) => (
                      <li key={`${t}-${i}`}>{t}</li>
                    ))}
                  </ul>
                </details>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
