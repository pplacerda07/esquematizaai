import Image from 'next/image';
import amostras from '@/data/amostras-visuais.json';
import styles from './styles.module.css';

/**
 * Prints do material, para a pessoa ver por dentro antes de comprar.
 *
 * As imagens são EXEMPLOS DO FORMATO, não páginas do produto específico: temos
 * 8 páginas de resumo e 4 cartões de Anki, não um jogo por produto. Por isso o
 * texto diz "exemplos do formato" com todas as letras. Deixar implícito faria
 * a pessoa achar que está vendo o conteúdo daquele material, e descobrir o
 * contrário depois de pagar é o tipo de frustração que vira reembolso.
 *
 * O QUE MOSTRAR VEM DO PRODUTO, e o componente aceita os dois ao mesmo tempo:
 * combo de Resumos + Flashcards precisa mostrar os dois formatos, e antes disso
 * o site mostrava só um. Quem chegava na assinatura de Flashcards via página de
 * resumo, que foi o erro que o Sérgio apontou.
 */
type Props = {
  temResumos: boolean;
  temFlashcards: boolean;
};

export default function GaleriaMaterial({ temResumos, temFlashcards }: Props) {
  const blocos = [
    temResumos && {
      chave: 'resumos',
      itens: amostras.resumos,
      nota: 'Exemplos do formato dos nossos resumos. O conteúdo varia conforme a disciplina.',
      alt: (i: number, total: number) =>
        `Exemplo de página de resumo esquematizado (${i + 1} de ${total})`,
    },
    temFlashcards && {
      chave: 'flashcards',
      itens: amostras.flashcards,
      nota: 'Exemplos do formato dos nossos cartões no Anki. O conteúdo varia conforme a disciplina.',
      alt: (i: number, total: number) =>
        `Exemplo de cartão de flashcard do Esquematiza Aí (${i + 1} de ${total})`,
    },
  ].filter(Boolean) as {
    chave: string;
    itens: typeof amostras.resumos;
    nota: string;
    alt: (i: number, total: number) => string;
  }[];

  const comItens = blocos.filter((b) => b.itens.length > 0);
  if (comItens.length === 0) return null;

  return (
    <section className={styles.secao} aria-labelledby="galeria-titulo">
      <h2 className={styles.titulo} id="galeria-titulo">
        Como é <span className={styles.acento}>por dentro</span>
      </h2>

      {comItens.map((bloco) => (
        <div key={bloco.chave}>
          <p className={styles.nota}>{bloco.nota}</p>

          <div className={styles.trilho}>
            {bloco.itens.map((item, i) => (
              <figure key={item.src} className={styles.quadro}>
                <Image
                  src={item.src}
                  alt={bloco.alt(i, bloco.itens.length)}
                  width={item.width}
                  height={item.height}
                  className={styles.imagem}
                  sizes="(max-width: 640px) 76vw, 280px"
                />
              </figure>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
