import dados from '@/data/catalogo/depoimentos.json';
import Faixa from '@/components/Faixa';
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
 * A faixa desliza sozinha, sem parar, no efeito que o Pedro pediu do Mapas da
 * Lulu. O risco de carrossel automático embaixo de texto sempre foi a pessoa
 * perder a linha no meio da frase, e é por isso que a Faixa congela quando
 * alguém encosta: o movimento serve para chamar, não para atrapalhar a leitura.
 */
export default function Depoimentos() {
  const depoimentos = dados.depoimentos;
  if (!depoimentos.length) return null;

  const cartoes = depoimentos.map((d) => (
    <article key={`${d.nome}-${d.colocacao}`} className={styles.cartao}>
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
    </article>
  ));

  return (
    <div className={styles.wrap}>
      <Faixa itens={cartoes} ariaLabel={`${depoimentos.length} depoimentos de alunos aprovados`} />
    </div>
  );
}
