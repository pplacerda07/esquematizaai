import CtaButton from '@/components/CtaButton';
import styles from './styles.module.css';

/**
 * Os cinco planos da mentoria.
 *
 * Substituiu a "pilha de valor" que existia aqui, aquela conta de quanto
 * custaria comprar tudo separado até chegar num preço único. A oferta deixou de
 * ser uma só: agora são dois recorrentes e três anuais, e o que muda entre eles
 * é o prazo e o que entra de material.
 *
 * A ORDEM É DO MAIS LEVE PARA O MAIS COMPLETO, e não o contrário. Quem chega
 * aqui já leu a página inteira e está medindo o tamanho do compromisso; abrir
 * pelo plano que inclui tudo faz a pessoa fechar antes de ver que existe uma
 * porta de entrada mensal, sem compromisso de longo prazo.
 *
 * DOIS CARTÕES DESTACADOS, em cores diferentes, como o Sérgio pediu: laranja no
 * Recorrente Mensal, com "Mais escolhido", e azul no Anual, com "Maior custo
 * benefício". Os dois selos dizem coisas diferentes, e é por isso que funcionam
 * juntos: um é o que a maioria escolhe, o outro é o que rende mais. Se os dois
 * dissessem "mais escolhido", um estaria mentindo.
 *
 * Nenhum dos dois é o plano mais completo, e isso também é de propósito.
 */

type Plano = {
  nome: string;
  descricao: string;
  inclui: string[];
  naoInclui?: string[];
  exige?: string;
  /** cor do selo e da moldura; sem isso o cartão fica neutro */
  destaque?: 'laranja' | 'azul';
  selo?: string;
};

/**
 * Condições da tabela que o Sérgio fechou em 01/09, SEM OS VALORES.
 *
 * O preço saiu da página por decisão do Sérgio e do Pedro em 02/09. O motivo é
 * de coerência, e o Pedro foi quem viu: a própria copy diz que as vagas são
 * limitadas e que a pessoa faz a aplicação pra confirmar disponibilidade ou
 * entrar na lista de espera. Botão de compra direta em cima disso contradizia o
 * fluxo que a página inteira define. Entre mudar a copy e tirar a oferta, eles
 * escolheram tirar a oferta: ticket alto e público qualificado passam pela
 * conversa, não pelo checkout.
 *
 * Por isso não existem aqui `preco`, `detalhePreco` nem `totalParcelado`. E, de
 * quebra, some a obrigação do art. 52 do CDC de informar o total a prazo: sem
 * preço anunciado não há parcelamento a detalhar. Se um dia o valor voltar pra
 * cá, o total do parcelado tem que voltar junto.
 *
 * O QUE NÃO ESTÁ INCLUSO CONTINUA APARECENDO. A tabela do Sérgio abre cada
 * plano dizendo o que ele não cobre, e ele tem razão: descobrir depois de pagar
 * que precisa manter outra assinatura ativa é o caminho direto para o pedido de
 * reembolso.
 */
const PLANOS: Plano[] = [
  {
    nome: 'Recorrente Mensal',
    descricao:
      'Cobrança recorrente no cartão, renovada automaticamente até o cancelamento. Sem compromisso de longo prazo.',
    inclui: ['Materiais Esquematiza Aí com 30% de desconto exclusivo'],
    naoInclui: ['Materiais Esquematiza Aí', 'Assinatura do Estratégia Concursos'],
    exige: 'É necessário possuir e manter assinatura ativa do Estratégia Concursos durante a mentoria',
    destaque: 'laranja',
    selo: 'Mais escolhido',
  },
  {
    nome: 'Recorrente Mensal + Estratégia',
    descricao:
      'Cobrança recorrente no cartão, renovada automaticamente até o cancelamento, com a teoria já resolvida.',
    inclui: [
      'Assinatura Premium do Estratégia Concursos durante a vigência da mentoria',
      'Materiais Esquematiza Aí com 50% de desconto exclusivo',
    ],
    naoInclui: ['Materiais Esquematiza Aí'],
  },
  {
    nome: 'Anual',
    descricao:
      'Contratação única de 12 meses, com as condições garantidas o ano inteiro. O caminho de quem já decidiu ir até a posse.',
    inclui: ['Materiais Esquematiza Aí com 70% de desconto exclusivo'],
    naoInclui: ['Materiais Esquematiza Aí', 'Assinatura do Estratégia Concursos'],
    exige: 'É necessário possuir e manter assinatura ativa do Estratégia Concursos durante a mentoria',
    destaque: 'azul',
    selo: 'Maior custo benefício',
  },
  {
    nome: 'Anual VIP',
    descricao:
      'Contratação única de 12 meses, sem pagar nada por fora pelo material de revisão.',
    inclui: [
      'Todos os materiais Esquematiza Aí, combos e assinaturas, durante a vigência da mentoria',
    ],
    naoInclui: ['Assinatura do Estratégia Concursos'],
    exige: 'É necessário possuir e manter assinatura ativa própria do Estratégia Concursos',
  },
  {
    nome: 'Anual Premium',
    descricao: 'Contratação única de 12 meses. Nada por fora, nem teoria nem revisão.',
    inclui: [
      'Todos os materiais Esquematiza Aí, combos e assinaturas',
      'Assinatura Premium do Estratégia Concursos',
    ],
  },
];

export default function PlanosMentoria() {
  return (
    <div className={styles.bloco}>
      <p className={styles.abertura} data-reveal>
        Todos os planos incluem o coração da mentoria: planejamento personalizado com metas
        diárias, plataforma de estudos, reunião individual inicial com o mentor, assessoria
        pedagógica, orientação estratégica na escolha de concursos e descontos exclusivos com
        parceiros. <strong>A diferença entre eles está no prazo e no que entra de material.</strong>
      </p>

      <div className={styles.grade}>
        {PLANOS.map((p, i) => (
          <article
            key={p.nome}
            className={[styles.plano, p.destaque === 'laranja' && styles.planoLaranja, p.destaque === 'azul' && styles.planoAzul].filter(Boolean).join(' ')}
            data-reveal="fade"
            style={{ ['--reveal-delay' as string]: `${i * 90}ms` }}
          >
            {p.selo && (
              <span className={p.destaque === 'azul' ? `${styles.selo} ${styles.seloAzul}` : styles.selo}>
                {p.selo}
              </span>
            )}

            <h3 className={styles.nome}>{p.nome}</h3>

            <p className={styles.descricao}>{p.descricao}</p>

            <ul className={styles.inclui}>
              {p.inclui.map((item) => (
                <li key={item}>{item}</li>
              ))}
              {p.naoInclui?.map((item) => (
                <li key={item} className={styles.naoInclui}>
                  {item}
                </li>
              ))}
            </ul>

            {/* A exigência fica no cartão, e não numa nota de rodapé: descobrir
                depois de pagar que precisa de outra assinatura é o tipo de
                surpresa que vira pedido de reembolso. */}
            {p.exige && <p className={styles.exige}>{p.exige}</p>}
          </article>
        ))}
      </div>

      <p className={styles.microcopy} data-reveal>
        O valor de cada plano e as formas de pagamento a equipe apresenta na aplicação. As
        vagas são limitadas: faça sua aplicação pra confirmar disponibilidade no plano
        desejado ou entrar na lista de espera. Reembolso integral em até 7 dias da confirmação do pagamento; condições
        completas nos{' '}
        <a href="/termos-de-uso-mentoria" className={styles.link}>
          Termos de Uso
        </a>
        .
      </p>

      <div className={styles.acao} data-reveal>
        <CtaButton variant="gradient">Quero fazer minha aplicação pra mentoria</CtaButton>
      </div>
    </div>
  );
}
