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
 * Escolhe o conjunto pelo tipo do material: mostrar página de resumo em
 * produto de flashcard mostraria a coisa errada.
 */
export default function GaleriaMaterial({ ehFlashcards }: { ehFlashcards: boolean }) {
  const itens = ehFlashcards ? amostras.flashcards : amostras.resumos;
  if (itens.length === 0) return null;

  return (
    <section className={styles.secao} aria-labelledby="galeria-titulo">
      <h2 className={styles.titulo} id="galeria-titulo">
        Como é <span className={styles.acento}>por dentro</span>
      </h2>
      <p className={styles.nota}>
        {ehFlashcards
          ? 'Exemplos do formato dos nossos cartões no Anki. O conteúdo varia conforme a disciplina.'
          : 'Exemplos do formato dos nossos resumos. O conteúdo varia conforme a disciplina.'}
      </p>

      <div className={styles.trilho}>
        {itens.map((item, i) => (
          <figure key={item.src} className={styles.quadro}>
            <Image
              src={item.src}
              alt={
                ehFlashcards
                  ? `Exemplo de cartão de flashcard do Esquematiza Aí (${i + 1} de ${itens.length})`
                  : `Exemplo de página de resumo esquematizado (${i + 1} de ${itens.length})`
              }
              width={item.width}
              height={item.height}
              className={styles.imagem}
              sizes="(max-width: 640px) 76vw, 280px"
            />
          </figure>
        ))}
      </div>
    </section>
  );
}
