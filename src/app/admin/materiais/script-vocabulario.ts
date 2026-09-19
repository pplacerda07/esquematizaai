/**
 * As palavras que o script de produto entende, num lugar só.
 *
 * Fica fora do `actions.ts` e fora do componente de propósito: não importa
 * catálogo, não importa banco e não importa React, então serve ao servidor que
 * valida, à tela que mostra a conferência e ao texto do modelo que o Sérgio
 * exporta. Três cópias da mesma lista divergiriam na primeira vez que alguém
 * acrescentasse uma área.
 */

export const MODELO_ATUAL = 1;

/** Só estes três, porque é o que a constraint do banco aceita. */
export const TIPOS = ['isolado', 'combo', 'assinatura'] as const;

/**
 * Áreas tiradas dos valores REAIS de produtos.json, não inventadas.
 * "Geral" existe e é usada por 7 produtos, e faltava na lista do formulário.
 */
export const AREAS = [
  'Geral',
  'Fiscal',
  'Controle',
  'Policial',
  'Tribunais',
  'Bancária',
  'Legislativo',
] as const;

/** "Vademecum" é a grafia do catálogo. O formulário escrevia "Vade Mecum". */
export const FERRAMENTAS = [
  'Resumo',
  'Flashcards',
  'Vademecum',
  'Questões Inéditas',
  'R + F + Q + V',
  'Assinatura',
  'Combo',
] as const;

export const FORMATOS = ['Regular', 'Específico'] as const;

/**
 * Deixa a comparação frouxa sem deixar a gravação frouxa.
 *
 * "bancaria", "BANCÁRIA" e " Bancária " são a mesma coisa para quem escreve, e
 * o Claude do Sérgio vai variar entre elas. O que vai para o banco é sempre a
 * grafia da lista acima, para a vitrine não acabar com três áreas que são uma.
 */
function achatado(v: string): string {
  return v
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function casarComLista<T extends string>(valor: string, lista: readonly T[]): T | null {
  const alvo = achatado(valor);
  return lista.find((v) => achatado(v) === alvo) ?? null;
}

/**
 * Lê preço escrito por gente e por máquina, e RECUSA o que for ambíguo.
 *
 * Aceita: 597, 597,00, 1.500,00, R$ 597, 1297.
 * Recusa: "1.299" sem centavos.
 *
 * Esta recusa é a regra que paga o resto do trabalho. Um Claude brasileiro
 * escrevendo mil duzentos e noventa e nove como "1.299" produziria um real e
 * trinta centavos, e o produto entraria no ar quase de graça. "1.500,00" e
 * "1.29" continuam passando, porque não têm como ser lidos de dois jeitos.
 */
export type LeituraDePreco = { ok: true; valor: number } | { ok: false; erro: string };

export function lerPreco(bruto: string): LeituraDePreco {
  const texto = bruto.replace(/^R\$\s*/i, '').trim();
  if (!texto) return { ok: false, erro: 'está vazio' };
  if (!/^[\d.,]+$/.test(texto)) {
    return { ok: false, erro: `veio "${bruto}". Escreva só o número, por exemplo 597` };
  }

  // ponto com exatamente três dígitos e nenhuma vírgula: pode ser milhar ou
  // decimal, e as duas leituras diferem por mil vezes
  if (/^\d{1,3}\.\d{3}$/.test(texto)) {
    const comoMilhar = texto.replace('.', '');
    return {
      ok: false,
      erro: `"${bruto}" pode ser ${comoMilhar} ou ${texto.replace('.', ',')}. Se são ${comoMilhar} reais, escreva ${comoMilhar}`,
    };
  }

  const numero = Number(texto.replace(/\./g, '').replace(',', '.'));
  if (Number.isNaN(numero)) {
    return { ok: false, erro: `veio "${bruto}". Escreva só o número, por exemplo 597` };
  }
  if (Math.round(numero * 100) !== numero * 100) {
    return { ok: false, erro: `"${bruto}" tem mais de dois centavos` };
  }
  if (numero <= 0) return { ok: false, erro: 'o preço precisa ser maior que zero' };

  return { ok: true, valor: numero };
}

/** O endereço da página, a partir do nome ou do que o script mandar. */
export function paraEndereco(bruto: string): string {
  return bruto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    // de novo depois do corte: cortar em 80 pode deixar o hífen solto no fim
    .replace(/-+$/, '');
}
