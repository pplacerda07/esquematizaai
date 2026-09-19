import {
  MODELO_ATUAL,
  TIPOS,
  AREAS,
  FERRAMENTAS,
  FORMATOS,
  casarComLista,
  lerPreco,
  paraEndereco,
} from './script-vocabulario';

/**
 * Lê o script colado e diz o que ele vira, ou por que não vira nada.
 *
 * PURO DE PROPÓSITO: sem React, sem banco, sem catálogo. Isso permite rodar o
 * mesmo código na conferência e de novo na gravação, a partir do MESMO texto,
 * em vez de confiar no objeto que o navegador mandou de volta. A colisão de
 * link, que precisa de banco, fica fora daqui e roda depois.
 *
 * DEVOLVE TODOS OS ERROS DE UMA VEZ, com o número da linha. Quem cola isto vai
 * levar o erro de volta para um chat, e "conserte estas quatro coisas" gasta
 * uma viagem onde "conserte esta, agora esta outra" gastaria quatro.
 */

export type CampoLido = {
  nome: string;
  tipo: string;
  preco: number;
  precoDe: number | null;
  checkout: string | null;
  paginaDeVendas: string | null;
  area: string | null;
  ferramenta: string | null;
  formato: string | null;
  descricao: string | null;
  endereco: string;
  /** true quando o endereço saiu do nome, e não veio escrito no script */
  enderecoVeioDoNome: boolean;
};

export type Leitura =
  | { ok: true; campos: CampoLido; avisos: string[] }
  | { ok: false; erros: string[]; avisos: string[] };

const CAMPOS_CONHECIDOS = new Set([
  'modelo',
  'nome',
  'tipo',
  'preco',
  'preco_de',
  'checkout',
  'pagina_de_vendas',
  'area',
  'ferramenta',
  'formato',
  'descricao',
  'endereco',
]);

const LIMITE_DE_TEXTO = 100_000;
const LIMITE_DO_NOME = 200;
const LIMITE_DA_DESCRICAO = 20_000;

/** Faixa de preço que a loja pratica hoje, para avisar quem sair muito fora. */
const PRECO_MINIMO_USUAL = 47;
const PRECO_MAXIMO_USUAL = 1997;

function comLink(v: string): string {
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

function linkValido(v: string): boolean {
  try {
    const u = new URL(comLink(v));
    return Boolean(u.hostname) && u.hostname.includes('.');
  } catch {
    return false;
  }
}

export function lerScript(bruto: string): Leitura {
  const erros: string[] = [];
  const avisos: string[] = [];

  const texto = bruto.trim();
  if (!texto) return { ok: false, erros: ['A caixa está vazia. Cole o script do produto.'], avisos };

  if (texto.length > LIMITE_DE_TEXTO) {
    return {
      ok: false,
      erros: [
        `O texto tem ${Math.round(texto.length / 1024)} KB e o limite é ${LIMITE_DE_TEXTO / 1024} KB. Cole só o bloco de um produto.`,
      ],
      avisos,
    };
  }

  /**
   * O arquivo de consulta com a loja toda não volta para dentro do painel.
   *
   * Ele vai ser colado aqui, é questão de tempo: o Sérgio exporta, manda para o
   * Claude dele, e o Claude devolve o arquivo inteiro "corrigido". Melhor uma
   * frase clara do que quinhentos erros de leitura.
   */
  if (/^\s*produtos\s*:/m.test(texto) || texto.includes('EXPORTAÇÃO DE CONSULTA')) {
    return {
      ok: false,
      erros: [
        'Este é o arquivo de consulta com a loja toda, e ele não volta para dentro do painel. Copie o bloco do produto que você quer cadastrar e cole só ele.',
      ],
      avisos,
    };
  }

  // Um produto por vez. Não é preferência: é o que impede o cadastro em massa
  // de entrar sem ninguém conferir preço por preço.
  const linhas = texto.split(/\r?\n/);
  const quantosNomes = linhas.filter((l) => /^\s*nome\s*:/i.test(l) && !l.trim().startsWith('#')).length;
  if (quantosNomes > 1) {
    return {
      ok: false,
      erros: [
        `Vieram ${quantosNomes} produtos neste texto. A caixa recebe um de cada vez, para você conferir cada um antes de gravar. Copie o bloco de um produto e cole só ele.`,
      ],
      avisos,
    };
  }

  /**
   * Lê linha a linha. `descricao` é o único campo que continua nas linhas
   * seguintes, porque texto de venda tem parágrafo; os outros acabam na linha.
   */
  const valores = new Map<string, { valor: string; linha: number }>();
  const desconhecidos: string[] = [];
  let lendoDescricao = false;
  const descricao: string[] = [];

  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];
    const semComentario = linha.replace(/^\s*#.*$/, '');
    if (!semComentario.trim() && !lendoDescricao) continue;

    const casou = /^\s*([a-z_]+)\s*:(.*)$/i.exec(semComentario);
    if (casou && CAMPOS_CONHECIDOS.has(casou[1].toLowerCase())) {
      lendoDescricao = false;
      const chave = casou[1].toLowerCase();
      // comentário no fim da linha sai, menos na descrição, onde # é título
      const valor =
        chave === 'descricao' ? casou[2].trim() : casou[2].replace(/\s+#.*$/, '').trim();
      if (chave === 'descricao') {
        lendoDescricao = true;
        if (valor) descricao.push(valor);
        valores.set(chave, { valor: '', linha: i + 1 });
      } else {
        valores.set(chave, { valor, linha: i + 1 });
      }
      continue;
    }

    if (casou && !CAMPOS_CONHECIDOS.has(casou[1].toLowerCase())) {
      lendoDescricao = false;
      desconhecidos.push(casou[1].toLowerCase());
      continue;
    }

    if (lendoDescricao) descricao.push(linha);
  }

  if (valores.size === 0) {
    return {
      ok: false,
      erros: ['Não reconheci nenhum campo neste texto. Exporte o modelo e peça ao seu Claude para preencher.'],
      avisos,
    };
  }

  const pegar = (chave: string) => valores.get(chave);
  const erro = (chave: string, msg: string) => {
    const l = valores.get(chave)?.linha;
    erros.push(l ? `linha ${l}, ${chave}: ${msg}` : `${chave}: ${msg}`);
  };

  // ---------- modelo ----------
  const modelo = pegar('modelo');
  if (!modelo?.valor) {
    erros.push('falta a linha "modelo: 1". Exporte o modelo de novo e peça ao seu Claude para refazer.');
  } else if (Number(modelo.valor) > MODELO_ATUAL) {
    erro('modelo', `esse script é do modelo ${modelo.valor} e o painel está no ${MODELO_ATUAL}. Exporte o modelo novo.`);
  } else if (Number(modelo.valor) < MODELO_ATUAL) {
    avisos.push('script de um modelo anterior, li assim mesmo.');
  }

  // ---------- nome ----------
  const nome = pegar('nome')?.valor ?? '';
  if (!nome) erro('nome', 'falta o nome do material.');
  else if (nome.length > LIMITE_DO_NOME) {
    erro('nome', `tem ${nome.length} caracteres e o limite é ${LIMITE_DO_NOME}.`);
  }

  // ---------- tipo ----------
  const tipoBruto = pegar('tipo')?.valor ?? '';
  const tipo = tipoBruto ? casarComLista(tipoBruto, TIPOS) : null;
  if (!tipoBruto) erro('tipo', `falta. Os aceitos são ${TIPOS.join(', ')}.`);
  else if (!tipo) erro('tipo', `veio "${tipoBruto}". Os aceitos são ${TIPOS.join(', ')}.`);

  // ---------- preço ----------
  const precoBruto = pegar('preco')?.valor ?? '';
  let preco = 0;
  if (!precoBruto) erro('preco', 'falta o preço. Escreva só o número, por exemplo 597.');
  else {
    const lido = lerPreco(precoBruto);
    if (!lido.ok) erro('preco', lido.erro + '.');
    else preco = lido.valor;
  }

  const deBruto = pegar('preco_de')?.valor ?? '';
  let precoDe: number | null = null;
  if (deBruto) {
    const lido = lerPreco(deBruto);
    if (!lido.ok) erro('preco_de', lido.erro + '.');
    else if (preco && lido.valor <= preco) {
      erro(
        'preco_de',
        `veio ${lido.valor} e o preço de venda é ${preco}. O "de" precisa ser maior, senão o site anuncia um desconto que não existe.`,
      );
    } else precoDe = lido.valor;
  }

  if (preco && (preco < PRECO_MINIMO_USUAL || preco > PRECO_MAXIMO_USUAL)) {
    avisos.push(
      `o preço ${preco} está fora da faixa da loja hoje, que vai de ${PRECO_MINIMO_USUAL} a ${PRECO_MAXIMO_USUAL}. Confira antes de gravar.`,
    );
  }

  // ---------- caminho de compra ----------
  const checkoutBruto = pegar('checkout')?.valor ?? '';
  const paginaBruto = pegar('pagina_de_vendas')?.valor ?? '';
  if (!checkoutBruto && !paginaBruto) {
    erros.push(
      'caminho de compra: falta o link do checkout e o link da página de vendas. Sem um dos dois, o botão de comprar não tem para onde ir.',
    );
  }
  if (checkoutBruto && !linkValido(checkoutBruto)) erro('checkout', `"${checkoutBruto}" não parece um link.`);
  if (paginaBruto && !linkValido(paginaBruto)) erro('pagina_de_vendas', `"${paginaBruto}" não parece um link.`);

  // ---------- listas fechadas ----------
  const casarOuErrar = (chave: string, lista: readonly string[]) => {
    const v = pegar(chave)?.valor ?? '';
    if (!v) return null;
    const casado = casarComLista(v, lista);
    if (!casado) erro(chave, `veio "${v}". Os aceitos são ${lista.join(', ')}. Ou apague a linha.`);
    return casado;
  };
  const area = casarOuErrar('area', AREAS);
  const ferramenta = casarOuErrar('ferramenta', FERRAMENTAS);
  const formato = casarOuErrar('formato', FORMATOS);

  // ---------- descrição ----------
  const textoDescricao = descricao.join('\n').trim();
  if (textoDescricao.length > LIMITE_DA_DESCRICAO) {
    erro('descricao', `tem ${textoDescricao.length} caracteres e o limite é ${LIMITE_DA_DESCRICAO}.`);
  }
  const tagHtml = /<\s*(b|i|u|strong|em|p|div|span|br|img|a|script|style|h[1-6])\b/i.exec(textoDescricao);
  if (tagHtml) {
    erro(
      'descricao',
      `tem código HTML (${tagHtml[0]}>). O site não lê HTML, essas tags apareceriam escritas na página. Use **negrito**, ## título ou - lista.`,
    );
  }

  // ---------- endereço ----------
  const enderecoBruto = pegar('endereco')?.valor ?? '';
  const enderecoVeioDoNome = !enderecoBruto;
  const endereco = paraEndereco(enderecoBruto || nome);
  if (!endereco) {
    erros.push('endereço: o nome precisa ter letras ou números para virar endereço de página.');
  }

  // ---------- avisos do que ficou faltando ----------
  if (!textoDescricao) avisos.push('sem descrição: a página do produto fica só com nome e preço.');
  if (!area) avisos.push('sem área: o material não aparece nos filtros de área da vitrine.');
  avisos.push('sem capa: escolha a imagem depois de gravar, pelo botão de capa.');
  if (desconhecidos.length) {
    avisos.push(
      `ignorei ${desconhecidos.length === 1 ? 'o campo' : 'os campos'} ${desconhecidos.map((d) => `"${d}"`).join(', ')}. ${desconhecidos.length === 1 ? 'Ele não existe' : 'Eles não existem'} no cadastro.`,
    );
  }

  if (erros.length) return { ok: false, erros, avisos };

  return {
    ok: true,
    avisos,
    campos: {
      nome,
      tipo: tipo!,
      preco,
      precoDe,
      checkout: checkoutBruto ? comLink(checkoutBruto) : null,
      paginaDeVendas: paginaBruto ? comLink(paginaBruto) : null,
      area,
      ferramenta,
      formato,
      descricao: textoDescricao || null,
      endereco,
      enderecoVeioDoNome,
    },
  };
}
