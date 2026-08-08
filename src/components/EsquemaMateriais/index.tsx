import styles from './styles.module.css';

/**
 * Esquema dos materiais, no lugar da foto de banco de imagens.
 *
 * POR QUE NÃO É UMA IMAGEM:
 * é HTML e CSS. O texto é texto de verdade: dá para selecionar, o Google lê,
 * leitor de tela anuncia, e a peça fica nítida em qualquer tela sem exportar
 * arquivo em três tamanhos. Trocar um material daqui é editar uma linha.
 *
 * A linguagem é a das artes do Instagram: fundo quadriculado, janelas de
 * navegador com a barra colorida, e uma seta desenhada à mão ligando uma coisa
 * na outra. Laranja em cima e verde embaixo, nunca laranja com azul no mesmo
 * elemento pequeno, que é regra do Brand Guide.
 *
 * Os quatro materiais listados existem no catálogo: 46 resumos, 51 flashcards,
 * mais vade mecum e questões inéditas. A peça não promete o que não se vende.
 */
const MATERIAIS = [
  'Resumos Esquematizados',
  'Flashcards',
  'Vade Mecum',
  'Questões Inéditas',
];

/** Barra de janela: os três pontos e o "+", como nas artes do perfil. */
function BarraDaJanela({ tom }: { tom: 'laranja' | 'verde' }) {
  return (
    <div className={`${styles.barra} ${tom === 'laranja' ? styles.barraLaranja : styles.barraVerde}`}>
      <span className={styles.pontos} aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span className={styles.mais} aria-hidden="true">
        +
      </span>
    </div>
  );
}

export default function EsquemaMateriais() {
  return (
    <div className={styles.painel}>
      <div className={styles.janela}>
        <BarraDaJanela tom="laranja" />
        <p className={styles.chamada}>
          Tudo o que você precisa para <strong className={styles.grifoAzul}>REVISAR</strong> de
          forma <strong className={styles.grifoLaranja}>leve</strong>,{' '}
          <strong className={styles.grifoLaranja}>fluida</strong>,{' '}
          <strong className={styles.grifoLaranja}>sem pausas</strong>.
        </p>
      </div>

      {/* seta à mão ligando a promessa à lista; decorativa, o texto já se liga sozinho */}
      <svg className={styles.seta} viewBox="0 0 80 72" fill="none" aria-hidden="true">
        <path
          d="M14 6 C 50 4, 70 22, 52 44 C 46 52, 46 54, 48 60"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M40 52 L 48 62 L 57 53"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <div className={styles.janela}>
        <BarraDaJanela tom="verde" />
        <ul className={styles.lista}>
          {MATERIAIS.map((item) => (
            <li key={item} className={styles.item}>
              <span className={styles.setinha} aria-hidden="true">
                ➜
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
