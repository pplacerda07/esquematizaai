import VideosDepoimentos from '@/components/VideosDepoimentos';
import Testimonials from '@/components/Testimonials';
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

      <div className={styles.bloco}>
        <p className={styles.rotulo}>Em vídeo</p>
        <VideosDepoimentos />
      </div>

      <div className={styles.bloco}>
        <p className={styles.rotulo}>Mensagens que recebemos</p>
        <Testimonials />
      </div>
    </section>
  );
}
