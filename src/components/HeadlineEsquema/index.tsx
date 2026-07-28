import Seta from './Seta';
import styles from './styles.module.css';

/**
 * Headline esquematizada: a promessa numa janelinha, a seta, e a entrega noutra.
 *
 * É o device que o Sérgio usa na área de membros (membros.esquematizaai.com).
 * Feito em HTML e CSS, e não como imagem, por três motivos práticos:
 *  - o Google e os motores de IA leem o texto (é a principal declaração de valor do site);
 *  - no celular a frase quebra e continua legível, em vez de virar um borrão;
 *  - trocar uma palavra é editar uma linha, não abrir o Canva.
 *
 * `titulo` sai como <h2> por padrão porque o device costuma abrir uma seção;
 * numa página onde ele for o topo, passe `como="h1"`.
 */
const ENTREGAS = ['Resumos Esquematizados', 'Flashcards', 'Vade Mecum', 'Questões Inéditas'];

export default function HeadlineEsquema({ como = 'h2' }: { como?: 'h1' | 'h2' }) {
  const Titulo = como;

  return (
    <div className={styles.esquema}>
      <div className={styles.janelas}>
        {/* janela 1: o que o aluno ganha */}
        <div className={`${styles.janela} ${styles.janelaPromessa}`} data-janela="promessa">
          <span className={`${styles.barra} ${styles.barraLaranja}`} aria-hidden="true">
            <span className={styles.bolinhas}>
              <i /> <i /> <i />
            </span>
            <span className={styles.mais}>+</span>
          </span>
          <div className={styles.janelaCorpo}>
            <Titulo className={styles.titulo}>
              Tudo o que você precisa para <span className={styles.destaqueFrio}>REVISAR</span> de
              forma <span className={styles.destaqueQuente}>leve</span>,{' '}
              <span className={styles.destaqueQuente}>fluida</span> e{' '}
              <span className={styles.destaqueQuente}>sem pausas</span>!
            </Titulo>
          </div>
        </div>

        <Seta className={styles.seta} />

        {/* janela 2: em que isso se traduz */}
        <div className={`${styles.janela} ${styles.janelaEntrega}`}>
          <span className={`${styles.barra} ${styles.barraVerde}`} aria-hidden="true">
            <span className={styles.bolinhas}>
              <i /> <i /> <i />
            </span>
            <span className={styles.mais}>+</span>
          </span>
          <div className={styles.janelaCorpo}>
            <ul className={styles.entregas}>
              {ENTREGAS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <p className={styles.metodologia}>
        Metodologia baseada no <span className={styles.script}>histórico de cobrança</span> em
        provas
      </p>
    </div>
  );
}
