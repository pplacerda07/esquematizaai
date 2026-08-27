import VideosDepoimentos from '@/components/VideosDepoimentos';
import CarrosselProva from '@/components/CarrosselProva';
import styles from './styles.module.css';

/**
 * Prova social: um título, dois carrosséis.
 *
 * Antes eram duas seções seguidas, cada uma com seu título grande em Moonlight:
 * "Alunos falando da gente" logo acima de "O Que Dizem Nossos alunos". Uma
 * embaixo da outra, dizendo a mesma coisa com palavras diferentes, o que soa
 * repetitivo e faz a página parecer maior do que precisa.
 *
 * Agora é um bloco só. As duas linhas de apoio são curtas e servem para
 * orientar, não para reanunciar: quem quer ver a pessoa falando para no
 * primeiro, quem prefere ler desce para o segundo.
 */
export default function ProvaSocial() {
  return (
    <section className={styles.secao}>
      <h2 className={styles.titulo}>
        O que dizem nossos <span className={styles.acento}>alunos</span>
      </h2>

      {/* DUAS FAIXAS, NÃO TRÊS.

          Eram três blocos empilhados: vídeo, aprovados e mensagens. Cada um
          com seu rótulo e seu carrossel, dizendo a mesma coisa de três jeitos.
          As duas de texto viraram uma só, e os 14 depoimentos passaram a
          dividir o mesmo carrossel.

          O vídeo continua separado de propósito: ele tem rosto e voz, é a
          prova mais difícil de forjar, e abre a seção porque texto convence
          mais depois de a pessoa já ter visto alguém falando. */}
      <div className={styles.bloco}>
        <p className={styles.rotulo}>Em vídeo</p>
        <VideosDepoimentos />
      </div>

      <div className={styles.bloco}>
        <p className={styles.rotulo}>Aprovados e mensagens que recebemos</p>
        <CarrosselProva />
      </div>
    </section>
  );
}
