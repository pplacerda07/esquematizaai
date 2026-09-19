import { catalogoParaVitrine } from '@/lib/catalogo-ajustes';

/**
 * A loja inteira num texto, para o Sérgio mandar ao Claude dele ler.
 *
 * SÓ SAI, NUNCA VOLTA. Este arquivo não é o modelo de cadastro e não pode ser
 * colado de volta no painel: o leitor de import o reconhece pela chave
 * `produtos:` e recusa com uma frase explicando. A decisão é do Pedro e o medo
 * é justo, porque reimportar a loja toda de uma vez trocaria 100 preços sem
 * ninguém conferir um.
 *
 * O QUE ENTRA: o produto como ele APARECE hoje na vitrine, com o preço que o
 * painel já aplicou por cima da planilha. Exportar as três camadas separadas
 * seria mais fiel e completamente inútil para quem quer perguntar "quanto custa
 * o combo fiscal": a resposta certa é a que o aluno vê.
 *
 * O QUE NÃO ENTRA: link de checkout e observação interna. Este texto vai parar
 * numa conversa de chat, e link de pagamento e recado interno não têm por que
 * viajar junto. Quem precisa do link abre o painel.
 */
export async function textoDaLojaInteira(hoje: string): Promise<string> {
  const catalogo = await catalogoParaVitrine();

  const linhas = catalogo
    .map((a) => ({
      nome: a.produto.nome,
      tipo: a.produto.categoria,
      area: a.produto.area ?? '',
      ferramenta: a.produto.ferramenta ?? '',
      preco: a.oferta.preco,
      endereco: a.produto.id,
    }))
    .sort((x, y) => x.nome.localeCompare(y.nome, 'pt-BR'));

  const corpo = linhas
    .map(
      (l) =>
        `  - nome: ${l.nome}\n    tipo: ${l.tipo}\n    area: ${l.area}\n    ferramenta: ${l.ferramenta}\n    preco: ${l.preco}\n    endereco: ${l.endereco}`,
    )
    .join('\n');

  return `# EXPORTAÇÃO DE CONSULTA, ESQUEMATIZA AÍ
# Gerado em ${hoje}. ${linhas.length} materiais à venda no site hoje.
#
# ISTO SERVE PARA CONSULTAR, NÃO PARA CADASTRAR.
#
# Claude: este arquivo é só leitura. Ele NÃO volta para dentro do painel, e o
# painel recusa se alguém colar. Não ofereça "é só reimportar corrigido": não
# existe importar tudo, de propósito, para ninguém trocar cem preços de uma vez
# sem conferir um.
#
# Para cadastrar UM material, peça o modelo de script no painel e preencha só
# ele. Para mudar um material que já existe, o caminho é o botão Ajustar.
#
# O preço abaixo é o que o aluno vê hoje, já com o ajuste do painel aplicado
# por cima da planilha. Link de pagamento não sai daqui.

produtos:
${corpo}
`;
}
