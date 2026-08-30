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
 * A ORDEM É DO MAIS BARATO PARA O MAIS COMPLETO, e não o contrário. Quem chega
 * aqui já leu a página inteira e está decidindo se cabe no bolso; abrir pelo
 * plano de sete mil faz a pessoa fechar antes de ver que existe um de
 * quatrocentos e noventa e sete.
 *
 * O DESTAQUE VAI NO ANUAL, e não no mais caro. É o plano que o Sérgio chama de
 * "caminho de quem já decidiu ir até a posse", e destacar o mais caro de todos
 * soa como empurrar, não como recomendar.
 */

type Plano = {
  nome: string;
  preco: string;
  detalhePreco?: string;
  descricao: string;
  inclui: string[];
  exige?: string;
  destaque?: boolean;
  selo?: string;
};

const PLANOS: Plano[] = [
  {
    nome: 'Recorrente Mensal',
    preco: 'R$ 497',
    detalhePreco: '/mês',
    descricao: 'Renovação automática mês a mês, sem compromisso de longo prazo.',
    inclui: ['Materiais Esquematiza Aí com 30% de desconto exclusivo'],
    exige: 'Requer assinatura ativa do Estratégia Concursos',
  },
  {
    nome: 'Recorrente + Estratégia',
    preco: 'R$ 597',
    detalhePreco: '/mês',
    descricao: 'Tudo do plano mensal, com a teoria já resolvida.',
    inclui: [
      'Assinatura Premium do Estratégia Concursos inclusa durante a mentoria',
      'Materiais Esquematiza Aí com 50% de desconto exclusivo',
    ],
  },
  {
    nome: 'Anual',
    preco: '12x R$ 516,80',
    detalhePreco: 'ou R$ 4.997 à vista',
    descricao:
      'Doze meses de mentoria com condições garantidas o ano inteiro. O caminho de quem já decidiu ir até a posse.',
    inclui: ['Materiais Esquematiza Aí com 70% de desconto exclusivo'],
    exige: 'Requer assinatura ativa do Estratégia Concursos',
    destaque: true,
    selo: 'Mais escolhido',
  },
  {
    nome: 'Anual VIP',
    preco: '12x R$ 620,23',
    detalhePreco: 'ou R$ 5.997 à vista',
    descricao: 'Doze meses de mentoria sem pagar nada por fora pelo material de revisão.',
    inclui: [
      'Todos os materiais Esquematiza Aí inclusos, combos e assinaturas, pré e pós-edital',
    ],
    exige: 'Requer assinatura ativa do Estratégia Concursos',
  },
  {
    nome: 'Anual Premium',
    preco: '12x R$ 723,65',
    detalhePreco: 'ou R$ 6.997 à vista',
    descricao: 'A experiência completa: nada por fora, nem teoria nem revisão.',
    inclui: [
      'Todos os materiais Esquematiza Aí inclusos',
      'Assinatura Premium do Estratégia Concursos inclusa',
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
            className={`${styles.plano} ${p.destaque ? styles.planoDestaque : ''}`}
            data-reveal="fade"
            style={{ ['--reveal-delay' as string]: `${i * 90}ms` }}
          >
            {p.selo && <span className={styles.selo}>{p.selo}</span>}

            <h3 className={styles.nome}>{p.nome}</h3>

            <p className={styles.preco}>
              <span className={styles.precoValor}>{p.preco}</span>
              {p.detalhePreco && <span className={styles.precoDetalhe}>{p.detalhePreco}</span>}
            </p>

            <p className={styles.descricao}>{p.descricao}</p>

            <ul className={styles.inclui}>
              {p.inclui.map((item) => (
                <li key={item}>{item}</li>
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
        À vista em cartão, boleto ou pix. Parcelamento no cartão de crédito. As vagas de cada
        plano são limitadas: faça sua aplicação pra confirmar disponibilidade ou entrar na lista
        de espera. Reembolso integral em até 7 dias da confirmação do pagamento; condições
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
