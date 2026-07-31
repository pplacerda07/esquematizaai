import styles from './styles.module.css';

/**
 * Base científica do método, na página do produto.
 *
 * DECISÕES QUE VALEM SER LEMBRADAS:
 *
 * 1. As fontes são REAIS e verificáveis, escritas por extenso para qualquer um
 *    conferir. Não foram copiadas do concorrente que serviu de referência: a
 *    bibliografia dele é sobre MAPAS CONCEITUAIS, que é o produto dele. Citar
 *    estudo sobre outra coisa é fácil de desmontar e queima a autoridade em
 *    vez de construir.
 *
 * 2. O argumento MUDA por tipo de material, porque a evidência é diferente.
 *    Para flashcard existe prova forte e direta (prática de recuperação e
 *    repetição espaçada). Para resumo a evidência é de outra natureza (codificação
 *    dupla, e o achado de que reler é pouco eficiente). Usar o argumento do
 *    flashcard para vender resumo seria esticar o que a pesquisa diz.
 *
 * 3. Nada aqui promete aprovação. As afirmações são sobre RETENÇÃO, que é o
 *    que os estudos mediram.
 */

type Evidencia = { destaque: string; texto: string };

const FLASHCARDS: Evidencia[] = [
  {
    destaque: 'Tentar lembrar ensina mais do que reler',
    texto:
      'Em 2006, Roediger e Karpicke compararam alunos que releram um texto com alunos que tentaram recuperá-lo de memória. Uma semana depois, quem tinha praticado a recuperação lembrava bem mais, mesmo tendo passado menos tempo com o material na frente.',
  },
  {
    destaque: 'Revisar espaçado rende mais que revisar tudo de uma vez',
    texto:
      'Uma revisão de 254 experimentos conduzida por Cepeda e colegas concluiu que distribuir as revisões ao longo do tempo produz retenção maior do que concentrar o mesmo tempo de estudo num bloco só. É o princípio que o Anki automatiza.',
  },
  {
    destaque: 'O esquecimento é rápido, e previsível',
    texto:
      'A curva do esquecimento descrita por Hermann Ebbinghaus em 1885 mostrou que a maior parte do que se aprende se perde nos primeiros dias, e que cada revisão bem posicionada torna a queda mais lenta.',
  },
];

const RESUMOS: Evidencia[] = [
  {
    destaque: 'Grifar e reler estão entre as técnicas menos eficientes',
    texto:
      'Uma revisão publicada em 2013 por Dunlosky e colegas avaliou dez técnicas de estudo pelo que a pesquisa sustenta. Grifar e reler ficaram na categoria de baixa utilidade. O que aparece no topo é praticar recuperação e distribuir as revisões.',
  },
  {
    destaque: 'Texto e imagem são guardados por vias diferentes',
    texto:
      'A teoria da codificação dupla, de Allan Paivio, descreve que informação verbal e visual são processadas por sistemas distintos. Material que combina os dois cria mais de um caminho de acesso à mesma informação na hora de lembrar.',
  },
  {
    destaque: 'Menos volume permite mais repetição',
    texto:
      'A vantagem prática de um resumo não está em ler uma vez, e sim em caber numa revisão curta que você consegue repetir muitas vezes. É a repetição que a pesquisa premia, e ela só acontece se o material for revisável.',
  },
];

const FONTES = [
  'Ebbinghaus, H. (1885). Über das Gedächtnis. Leipzig: Duncker & Humblot.',
  'Roediger, H. L., & Karpicke, J. D. (2006). Test-enhanced learning: Taking memory tests improves long-term retention. Psychological Science, 17(3), 249-255.',
  'Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis. Psychological Bulletin, 132(3), 354-380.',
  'Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J., & Willingham, D. T. (2013). Improving students’ learning with effective learning techniques. Psychological Science in the Public Interest, 14(1), 4-58.',
  'Paivio, A. (1986). Mental representations: A dual coding approach. Oxford University Press.',
];

export default function AutoridadeCientifica({ ehFlashcards }: { ehFlashcards: boolean }) {
  const evidencias = ehFlashcards ? FLASHCARDS : RESUMOS;

  return (
    <section className={styles.secao} aria-labelledby="ciencia-titulo">
      <h2 className={styles.titulo} id="ciencia-titulo">
        Por que esse método <span className={styles.acento}>funciona</span>
      </h2>
      <p className={styles.abertura}>
        {ehFlashcards
          ? 'Flashcards no Anki não são preferência nossa. São a forma prática de aplicar dois achados que a psicologia cognitiva vem repetindo há décadas.'
          : 'O formato dos nossos resumos não é escolha estética. Ele responde ao que a pesquisa sobre estudo mostra que dá certo, e ao que mostra que não dá.'}
      </p>

      <ol className={styles.lista}>
        {evidencias.map((e, i) => (
          <li key={e.destaque} className={styles.item}>
            <span className={styles.numero} aria-hidden="true">{i + 1}</span>
            <div>
              <p className={styles.destaque}>{e.destaque}</p>
              <p className={styles.texto}>{e.texto}</p>
            </div>
          </li>
        ))}
      </ol>

      <details className={styles.fontes}>
        <summary className={styles.fontesTitulo}>Ver as fontes citadas</summary>
        <ul className={styles.fontesLista}>
          {FONTES.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
        <p className={styles.fontesNota}>
          Os estudos acima descrevem efeitos sobre retenção de informação. Nenhum
          deles trata de aprovação em concurso, que depende de muitos outros fatores.
        </p>
      </details>
    </section>
  );
}
