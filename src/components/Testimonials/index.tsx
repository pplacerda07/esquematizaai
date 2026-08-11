import Image from 'next/image';
import styles from './styles.module.css';

/**
 * Depoimentos de alunos, em prints do WhatsApp.
 *
 * POR QUE PRINT E TRANSCRIÇÃO JUNTOS:
 * antes a seção era uma esteira de prints passando, e ninguém lê texto pequeno
 * dentro de imagem que anda. Cada cartão traz a janelinha com o print de um
 * lado e a transcrição do outro, para ler com calma.
 *
 * SEM SELO DE "É REAL":
 * havia aqui uma linha dizendo que os prints eram reais e um rodapé repetindo
 * "print real, recebido no WhatsApp" em cada cartão. Insistir que é verdade
 * produz o efeito contrário, cara de página que precisa se defender. O print
 * mostra o WhatsApp sozinho; não precisa de legenda jurando.
 *
 * As transcrições são fiéis ao que está escrito na imagem, com a pontuação e
 * as abreviações do aluno. Corrigir o português deles seria reescrever
 * depoimento, e aí deixa de ser depoimento.
 */

type Depoimento = {
  src: string;
  alt: string;
  /** o que está escrito no print, palavra por palavra */
  texto: string;
  /** contexto curto, quando a mensagem sozinha não se explica */
  contexto?: string;
  destaque?: boolean;
};

const DEPOIMENTOS: Depoimento[] = [
  {
    src: '/reviews/review-3.webp',
    alt: 'Print de conversa em que uma aluna conta que foi aprovada em 19º lugar para procuradora no ES e diz que o material do Esquematiza Aí é o melhor entre os flashcards que testou',
    contexto: 'Aprovada em 19º lugar para procuradora, ES',
    // Cortado o miolo, que era tutorial de Anki: como baixar, que é de graça, o
    // canal do YouTube. O [...] marca o corte, e a frase final fica porque é o
    // único ponto da mensagem em que ela fala do nosso material.
    texto:
      'Boa tarde. Passando para dar minha contribuição. Anki na minha vida foi coisa de Deus, pois de aprovada nos concursos nas posições bem afastadas, baixei para a posição 19 para procuradora aqui do ES (dentro da faixa de corte que é 20 primeiros colocados). Eu descobri o Anki por acaso no YouTube. [...] Comprei também o material do esquematiza aí que é o melhor de todos os flashcards que já baixei pra testar.',
    destaque: true,
  },
  {
    src: '/reviews/review-2.webp',
    alt: 'Print de conversa em que um aluno elogia a qualidade dos resumos e a jurisprudência relacionada ao assunto',
    texto:
      'Cara, a qualidade dos resumos está muito foda!! Ter a jurisprudência relacionada no assunto tb ajuda mt. Confesso que estou ansioso pela liberação do resumo de constitucional. Rsrsrs',
  },
  {
    src: '/reviews/review-4.webp',
    alt: 'Print de conversa em que um aluno diz que a seção saiba mais é o diferencial e que os layouts são impecáveis',
    texto:
      'Esse saiba mais é o pulo do gato! É o diferencial do diferencial se vocês! Além da organização, layouts impecáveis claro. Uma leitura muito agradável. Até agora, já teste vários fornecedores. Não tem nada igual no mercado...',
  },
  {
    src: '/reviews/review-1.webp',
    alt: 'Print de conversa em que um aluno parabeniza pela rapidez na entrega dos resumos do combo fiscal',
    texto:
      'Boa tarde mestre. Pow, parabéns pela celeridade na entrega dos resumos do combo fiscal. Superou minhas expectativas',
  },
  {
    src: '/reviews/review-5.webp',
    alt: 'Print de conversa em que um aluno diz que confia no trabalho do Esquematiza Aí e pede material de Direito do Trabalho',
    contexto: 'Respondendo se já achou material parecido em outro lugar',
    texto:
      'Nada! Faz para Trabalho e Processo do Trabalho... Ainda não achei nenhum... Confio super no trabalho de vocês,. Mas a galera tá bem aí pra DT.. rsss',
  },
];

export default function Testimonials() {
  return (
    <section className={styles.secao}>
      <h2 className={styles.title}>
        O Que Dizem Nossos <span className={styles.titleAccent}>alunos</span>
      </h2>

      <div className={styles.grade}>
        {DEPOIMENTOS.map((d) => (
          <figure
            key={d.src}
            className={`${styles.cartao} ${d.destaque ? styles.cartaoDestaque : ''}`}
          >
            {/* Janela do print: recorte fixo, como uma telinha. Mostra o
                suficiente para provar que a mensagem existe sem tomar o cartão. */}
            <div className={styles.janela}>
              <Image
                src={d.src}
                alt={d.alt}
                width={720}
                height={560}
                sizes="(max-width: 640px) 90vw, 150px"
                className={styles.print}
              />
            </div>

            <div className={styles.conteudo}>
              {d.contexto && <p className={styles.contexto}>{d.contexto}</p>}

              <blockquote className={styles.texto}>{d.texto}</blockquote>
            </div>
          </figure>
        ))}
      </div>
    </section>
  );
}
