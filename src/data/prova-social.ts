import depoimentos from '@/data/catalogo/depoimentos.json';

/**
 * Prova social em texto, numa lista só.
 *
 * Antes eram duas seções seguidas, "Alunos aprovados" e "Mensagens que
 * recebemos", cada uma com seu rótulo e seu carrossel. Somando o bloco de
 * vídeo, davam três divisões empilhadas dizendo a mesma coisa, e o Pedro estava
 * certo: fica pesado. As duas viraram uma lista de 14 itens num carrossel só.
 *
 * O TIPO CONTINUA MARCADO porque as duas provas convencem de jeitos
 * diferentes. A colocação num concurso é resultado, e é o que a pessoa quer
 * para si. O print do WhatsApp é opinião sobre o material, e vale por ser
 * espontâneo. Perder essa distinção seria transformar as duas numa coisa só e
 * mais fraca, então o cartão continua mostrando de qual se trata.
 *
 * A ORDEM É INTERCALADA, e não aprovados primeiro e prints depois. Nove
 * citações parecidas em sequência viram ruído; alternando, cada cartão parece
 * diferente do anterior.
 */

export type ItemProva =
  | {
      tipo: 'aprovacao';
      /** colocação no concurso, o argumento mais forte do cartão */
      colocacao: number;
      citacao: string;
      nome: string;
      cargo: string;
      genero: string;
    }
  | {
      tipo: 'mensagem';
      /** print da conversa, que é a evidência */
      src: string;
      alt: string;
      /** transcrição fiel, com a pontuação do aluno */
      texto: string;
      /** contexto curto, quando a mensagem sozinha não se explica */
      contexto?: string;
    };

const APROVADOS: ItemProva[] = depoimentos.depoimentos.map((d) => ({
  tipo: 'aprovacao' as const,
  colocacao: d.colocacao,
  citacao: d.citacao,
  nome: d.nome,
  cargo: d.cargo,
  genero: d.genero,
}));

/**
 * Transcrições fiéis ao que está escrito na imagem, com a pontuação e as
 * abreviações do aluno. Corrigir o português deles seria reescrever
 * depoimento, e aí deixa de ser depoimento.
 */
const MENSAGENS: ItemProva[] = [
  {
    tipo: 'mensagem',
    src: '/reviews/review-3.webp',
    alt: 'Print de conversa em que uma aluna conta que foi aprovada em 19º lugar para procuradora no ES e diz que o material do Esquematiza Aí é o melhor entre os flashcards que testou',
    contexto: 'Aprovada em 19º lugar para procuradora, ES',
    // Cortado o miolo, que era tutorial de Anki: como baixar, que é de graça, o
    // canal do YouTube. O [...] marca o corte, e a frase final fica porque é o
    // único ponto da mensagem em que ela fala do nosso material.
    texto:
      'Boa tarde. Passando para dar minha contribuição. Anki na minha vida foi coisa de Deus, pois de aprovada nos concursos nas posições bem afastadas, baixei para a posição 19 para procuradora aqui do ES (dentro da faixa de corte que é 20 primeiros colocados). Eu descobri o Anki por acaso no YouTube. [...] Comprei também o material do esquematiza aí que é o melhor de todos os flashcards que já baixei pra testar.',
  },
  {
    tipo: 'mensagem',
    src: '/reviews/review-2.webp',
    alt: 'Print de conversa em que um aluno elogia a qualidade dos resumos e a jurisprudência relacionada ao assunto',
    texto:
      'Cara, a qualidade dos resumos está muito foda!! Ter a jurisprudência relacionada no assunto tb ajuda mt. Confesso que estou ansioso pela liberação do resumo de constitucional. Rsrsrs',
  },
  {
    tipo: 'mensagem',
    src: '/reviews/review-4.webp',
    alt: 'Print de conversa em que um aluno diz que a seção saiba mais é o diferencial e que os layouts são impecáveis',
    texto:
      'Esse saiba mais é o pulo do gato! É o diferencial do diferencial se vocês! Além da organização, layouts impecáveis claro. Uma leitura muito agradável. Até agora, já teste vários fornecedores. Não tem nada igual no mercado...',
  },
  {
    tipo: 'mensagem',
    src: '/reviews/review-1.webp',
    alt: 'Print de conversa em que um aluno parabeniza pela rapidez na entrega dos resumos do combo fiscal',
    texto:
      'Boa tarde mestre. Pow, parabéns pela celeridade na entrega dos resumos do combo fiscal. Superou minhas expectativas',
  },
  {
    tipo: 'mensagem',
    src: '/reviews/review-5.webp',
    alt: 'Print de conversa em que um aluno diz que confia no trabalho do Esquematiza Aí e pede material de Direito do Trabalho',
    contexto: 'Respondendo se já achou material parecido em outro lugar',
    texto:
      'Nada! Faz para Trabalho e Processo do Trabalho... Ainda não achei nenhum... Confio super no trabalho de vocês,. Mas a galera tá bem aí pra DT.. rsss',
  },
];

/**
 * Intercala as duas listas, começando pelos aprovados e distribuindo as
 * mensagens no meio. Com 9 e 5, sai uma mensagem a cada dois aprovados.
 */
function intercalar(a: ItemProva[], b: ItemProva[]): ItemProva[] {
  const saida: ItemProva[] = [];
  const passo = Math.max(1, Math.round(a.length / (b.length + 1)));
  let iB = 0;

  a.forEach((item, i) => {
    saida.push(item);
    if ((i + 1) % passo === 0 && iB < b.length) saida.push(b[iB++]);
  });
  while (iB < b.length) saida.push(b[iB++]);

  return saida;
}

export const ITENS_PROVA: ItemProva[] = intercalar(APROVADOS, MENSAGENS);
