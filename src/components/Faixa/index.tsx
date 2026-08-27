import type { ReactNode } from 'react';
import styles from './styles.module.css';

/**
 * Faixa que desliza sozinha, sem parar e sem voltar.
 *
 * É o efeito que o Pedro pediu, do Mapas da Lulu. Lá a trilha é duplicada e
 * animada de translateX(0) até translateX(-50%), em linear e infinito: quando a
 * cópia chega onde o original começou, a animação reinicia e ninguém vê a
 * emenda. Nossos carrosséis eram do tipo passo a passo, que para em cada cartão
 * e depois rebobina; a diferença no celular é grande, porque o movimento
 * contínuo mostra que tem mais coisa ali sem exigir que a pessoa arraste.
 *
 * TRÊS CUIDADOS QUE O ORIGINAL NÃO TEM:
 *
 * 1. Para quando a pessoa encosta. São depoimentos, feitos para ler, e texto
 *    que anda embaixo do olho é texto que ninguém termina. Passar o mouse,
 *    segurar o dedo ou chegar de teclado congela a faixa.
 * 2. Some nas pontas em degradê, para o cartão não ser cortado no seco.
 * 3. Respeita quem pediu menos movimento no sistema: aí não anda sozinha e
 *    volta a ser uma lista que se arrasta com o dedo.
 *
 * A cópia leva aria-hidden e o original fica com o rótulo, senão o leitor de
 * tela anuncia cada depoimento duas vezes.
 */
type Props = {
  itens: ReactNode[];
  /**
   * Segundos que cada item leva para atravessar. Multiplica pela quantidade
   * para a faixa correr na mesma velocidade tendo 4 ou 12 cartões.
   */
  segundosPorItem?: number;
  ariaLabel: string;
};

export default function Faixa({ itens, segundosPorItem = 7, ariaLabel }: Props) {
  if (itens.length === 0) return null;

  const duracao = itens.length * segundosPorItem;

  return (
    <div className={styles.janela}>
      <ul
        className={styles.trilho}
        style={{ ['--duracao' as string]: `${duracao}s` }}
        role="group"
        aria-label={ariaLabel}
      >
        {itens.map((item, i) => (
          <li key={`item-${i}`} className={styles.item}>
            {item}
          </li>
        ))}

        {/* a segunda volta: é o que fecha o laço sem salto */}
        {itens.map((item, i) => (
          <li key={`copia-${i}`} className={styles.item} aria-hidden="true">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
