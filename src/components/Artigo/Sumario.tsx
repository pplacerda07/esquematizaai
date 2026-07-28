import type { ItemSumario } from '@/lib/artigo';
import styles from './artigo.module.css';

/**
 * "Neste guia": índice do artigo, montado a partir dos títulos do próprio texto.
 * Some quando o artigo é curto demais para justificar índice.
 */
export default function Sumario({ itens }: { itens: ItemSumario[] }) {
  const secoes = itens.filter((i) => i.nivel === 2);
  if (secoes.length < 2) return null;

  return (
    <nav className={styles.sumario} aria-labelledby="sumario-titulo">
      <p className={styles.sumarioTitulo} id="sumario-titulo">
        Neste guia
      </p>
      <ol className={styles.sumarioLista}>
        {secoes.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`} className={styles.sumarioLink}>
              {item.texto}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
