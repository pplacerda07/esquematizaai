import dados from '@/data/catalogo/depoimentos.json';
import styles from './styles.module.css';

/**
 * Depoimentos de alunos aprovados, em cartões.
 *
 * Estes textos existiam antes soltos no meio do campo "detalhes" de cada
 * produto, herdados da raspagem do WordPress: apareciam como parágrafos comuns
 * sob o título "Detalhes do produto", sem nada que os distinguisse do resto.
 * Prova social que não parece prova social não serve para nada.
 *
 * São os mesmos 9 alunos em todos os produtos, que é como o site antigo já
 * fazia. Por isso a lista é única (depoimentos.json) em vez de uma cópia por
 * produto.
 *
 * A colocação vem em destaque porque é o dado mais forte da peça: "1º lugar"
 * convence mais do que qualquer adjetivo na citação.
 *
 * A rolagem é horizontal e nativa, com scroll-snap. Sem JavaScript, sem
 * autoplay: carrossel que anda sozinho embaixo de texto para ler é o tipo de
 * coisa que faz a pessoa perder a linha no meio da frase.
 */
export default function Depoimentos() {
  const depoimentos = dados.depoimentos;
  if (!depoimentos.length) return null;

  return (
    <div className={styles.wrap}>
      <ul
        className={styles.trilho}
        tabIndex={0}
        role="group"
        aria-label="Depoimentos de alunos aprovados, role para o lado para ver todos"
      >
        {depoimentos.map((d) => (
          <li key={`${d.nome}-${d.colocacao}`} className={styles.cartao}>
            <span className={styles.colocacao} aria-hidden="true">
              {d.colocacao}º
            </span>

            <blockquote className={styles.citacao}>{d.citacao}</blockquote>

            <footer className={styles.autor}>
              <cite className={styles.nome}>{d.nome}</cite>
              <span className={styles.cargo}>
                {d.genero === 'f' ? 'Aprovada' : 'Aprovado'} em {d.colocacao}º lugar
                <span className={styles.separador} aria-hidden="true">
                  ·
                </span>
                {d.cargo}
              </span>
            </footer>
          </li>
        ))}
      </ul>

      <p className={styles.dica} aria-hidden="true">
        role para o lado para ver os {depoimentos.length} depoimentos
      </p>
    </div>
  );
}
