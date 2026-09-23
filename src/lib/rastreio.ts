/**
 * O que o site conta para o Google Tag Manager, e como a campanha chega ao
 * checkout.
 *
 * Pedido da TAOS em 23/09, quando o tráfego pago começou: sem isto o Meta não
 * sabe quem viu produto nem quem clicou em comprar, e ninguém consegue dizer
 * qual anúncio trouxe a venda.
 *
 * TUDO AQUI RODA NO NAVEGADOR. Não é preciosismo de arquitetura: a página do
 * produto é gerada uma vez e servida pronta por 60 segundos para todo mundo
 * (revalidate na página). O endereço com utm é de quem clicou no anúncio, não
 * da página guardada, então ler a campanha no servidor devolveria a campanha de
 * outra pessoa, ou nenhuma.
 */

/**
 * Os seis que a TAOS pediu.
 *
 * gclid, do Google Ads, ficou de fora porque hoje só existe campanha no Meta.
 * Entra aqui no dia em que existir: é uma linha.
 */
const PARAMETROS_DE_CAMPANHA = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'fbclid',
] as const;

const CHAVE = 'esq:campanha';

export type ItemMedido = {
  /** o slug do produto, que é o id no catálogo */
  id: string;
  nome: string;
  /** preço à vista, em reais */
  preco: number;
};

type Campanha = Record<string, string>;

/**
 * sessionStorage, e não uma variável em memória.
 *
 * QUEM CHEGA DE ANÚNCIO QUASE NUNCA CAI NA PÁGINA DO PRODUTO: cai na home ou na
 * vitrine, e só depois escolhe o material. A utm está no endereço da primeira
 * página e some na segunda. Sem guardar, a campanha se perderia justamente no
 * caminho mais comum, e o relatório diria que a venda veio do nada.
 *
 * Aguenta a aba inteira e morre quando ela fecha, que é a mesma vida útil de
 * uma visita. localStorage duraria meses e grudaria a campanha antiga numa
 * visita nova.
 */
function lerGuardado(): Campanha {
  try {
    const bruto = sessionStorage.getItem(CHAVE);
    return bruto ? (JSON.parse(bruto) as Campanha) : {};
  } catch {
    // aba anônima do Safari e navegador com dados de site bloqueados jogam aqui.
    // Campanha perdida é relatório pior, não site quebrado.
    return {};
  }
}

/** Lê a campanha do endereço atual. Vazio quando a pessoa não veio de anúncio. */
function lerDoEndereco(): Campanha {
  if (typeof window === 'undefined') return {};

  const busca = new URLSearchParams(window.location.search);
  const achados: Campanha = {};
  for (const nome of PARAMETROS_DE_CAMPANHA) {
    const valor = busca.get(nome);
    if (valor) achados[nome] = valor;
  }
  return achados;
}

/**
 * Guarda a campanha da visita, se houver.
 *
 * Chamado a cada navegação. Endereço sem utm NÃO apaga o que já estava
 * guardado: a pessoa veio do anúncio, navegou para a vitrine e o endereço da
 * vitrine está limpo. Apagar ali seria esquecer a campanha no primeiro clique.
 *
 * CAMPANHA NOVA SUBSTITUI A ANTIGA INTEIRA, em vez de se misturar com ela. Os
 * parâmetros chegam como um conjunto, de um anúncio só. Ao juntar, quem clicou
 * no anúncio A e depois no B levava para o checkout o utm_campaign de B com o
 * utm_medium de A, um anúncio que nunca existiu. Vi acontecer testando: a
 * segunda visita nasceu com utm_medium e utm_term da primeira.
 */
export function guardarCampanha(): void {
  const doEndereco = lerDoEndereco();
  if (Object.keys(doEndereco).length === 0) return;

  try {
    sessionStorage.setItem(CHAVE, JSON.stringify(doEndereco));
  } catch {
    // mesmo caso do lerGuardado: sem espaço para guardar, seguimos sem campanha
  }
}

/**
 * A campanha que vale agora.
 *
 * Tem utm no endereço? É ela, inteira, e nada do que estava guardado entra
 * junto, pelo mesmo motivo do guardarCampanha. Endereço limpo usa o guardado,
 * que é o caso de quem já navegou para dentro do site.
 */
export function campanhaAtual(): Campanha {
  const doEndereco = lerDoEndereco();
  return Object.keys(doEndereco).length > 0 ? doEndereco : lerGuardado();
}

/**
 * Cola a campanha no endereço do checkout.
 *
 * Monta com URL e URLSearchParams em vez de juntar texto com "?" e "&": o link
 * de checkout já pode vir com parâmetro próprio (a Eduzz usa, e o link de
 * desconto do painel também), e concatenar na mão transformaria isso num
 * endereço quebrado no dia em que acontecesse.
 *
 * Parâmetro que o checkout já traz NÃO é sobrescrito: aquele foi escolhido por
 * quem montou o link.
 */
export function comCampanha(endereco: string): string {
  const campanha = campanhaAtual();
  if (Object.keys(campanha).length === 0) return endereco;

  try {
    const url = new URL(endereco, window.location.origin);
    for (const [nome, valor] of Object.entries(campanha)) {
      if (!url.searchParams.has(nome)) url.searchParams.set(nome, valor);
    }
    return url.toString();
  } catch {
    // endereço que o URL não entende: melhor mandar a pessoa para o checkout
    // sem campanha do que não mandar
    return endereco;
  }
}

type Evento = 'view_item' | 'begin_checkout';

/**
 * Avisa o GTM que alguém viu um produto ou clicou em comprar.
 *
 * O `ecommerce: null` antes do evento é exigência do próprio GTM: o dataLayer
 * é uma pilha que só cresce, e sem limpar, o evento novo herda os itens do
 * anterior. Quem navega entre dois produtos mandaria os dois juntos.
 *
 * O formato é o GA4 Ecommerce, que é o que a TAOS pediu e o que o pixel do Meta
 * lê do outro lado, configurado por eles dentro do GTM.
 */
export function avisarGtm(evento: Evento, item: ItemMedido): void {
  if (typeof window === 'undefined') return;

  const camada = (window as unknown as { dataLayer?: unknown[] }).dataLayer ?? [];
  (window as unknown as { dataLayer: unknown[] }).dataLayer = camada;

  camada.push({ ecommerce: null });
  camada.push({
    event: evento,
    ecommerce: {
      currency: 'BRL',
      value: item.preco,
      items: [
        {
          item_id: item.id,
          item_name: item.nome,
          price: item.preco,
          quantity: 1,
        },
      ],
    },
  });
}
