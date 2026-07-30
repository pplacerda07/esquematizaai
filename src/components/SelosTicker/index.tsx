import styles from './styles.module.css';

/**
 * Letreiro de selos de confiança, para rodar abaixo do botão de compra.
 *
 * A técnica do marquee neste projeto já tem duas armadilhas conhecidas:
 *  1) poucas cópias fazem o conteúdo ser mais estreito que a tela e abrir um
 *     buraco no fim do ciclo (o "não é infinito" que o cliente já apontou);
 *  2) `gap` no flex quebra o alinhamento do translateX(-50%), porque o vão
 *     final não entra na conta. O espaçamento vai no `margin-right` do item.
 *
 * Por isso o conteúdo é duplicado até passar de duas telas antes de repetir.
 */
export default function SelosTicker({ selos }: { selos: string[] }) {
  if (selos.length === 0) return null;

  // repete até ter volume suficiente para cobrir telas largas sem buraco
  const minimo = 12;
  const vezes = Math.max(2, Math.ceil(minimo / selos.length));
  const umaMetade = Array.from({ length: vezes }).flatMap(() => selos);
  // duas metades idênticas: o -50% da animação cai exatamente na emenda
  const itens = [...umaMetade, ...umaMetade];

  return (
    <div className={styles.faixa} role="complementary" aria-label="O que está incluído">
      <div className={styles.trilho}>
        {itens.map((selo, i) => (
          <span
            key={i}
            className={styles.item}
            /* só a primeira metade é lida em voz alta; o resto é cópia visual */
            aria-hidden={i >= umaMetade.length ? 'true' : undefined}
          >
            <span className={styles.marca} aria-hidden="true" />
            {selo}
          </span>
        ))}
      </div>
    </div>
  );
}
