import { catalogoParaVitrine } from '@/lib/catalogo-ajustes';

/**
 * A loja inteira num arquivo, para o Sérgio anexar num chat e consultar.
 *
 * É ARQUIVO, NÃO COLAGEM. A primeira versão copiava para a área de
 * transferência, como o modelo de um produto faz, e o Pedro apontou o óbvio:
 * ninguém cola 148 produtos num chat. Modelo de um produto tem 2 KB e vai
 * colado mesmo; a loja toda vai anexada.
 *
 * SÓ SAI, NUNCA VOLTA. O leitor de import reconhece este arquivo pelo
 * cabeçalho e recusa, porque reimportar a loja toda de uma vez trocaria 148
 * preços sem ninguém conferir um.
 *
 * FORMATO DE TABELA, uma linha por produto, em vez de seis linhas por produto
 * como no modelo de cadastro. São 148 linhas em vez de 888, e quem lê isto é
 * uma máquina respondendo "quanto custa o combo fiscal", não alguém preenchendo
 * campo.
 *
 * O QUE ENTRA: o produto como ele APARECE hoje na vitrine, com o preço que o
 * painel já aplicou por cima da planilha. É a resposta certa para "quanto
 * custa", porque é o que o aluno vê.
 *
 * O QUE NÃO ENTRA: link de checkout e observação interna. Este arquivo vai
 * parar numa conversa de chat.
 */

/**
 * A barra vertical separa as colunas, então não pode aparecer dentro de um
 * nome. Hoje só dois produtos têm barra no nome e os dois são oferta
 * personalizada, que nem entra aqui, mas trocar é uma linha e evita a tabela
 * desalinhar sozinha no dia em que alguém batizar um produto assim.
 */
function semBarra(v: string): string {
  return v.replace(/\|/g, '/').replace(/\s+/g, ' ').trim();
}

/**
 * Devolve o texto e a contagem juntos, porque a tela precisa dos dois e contar
 * linha do texto depois daria o número errado no dia em que o cabeçalho mudar.
 */
export async function exportacaoDaLoja(hoje: string): Promise<{ texto: string; quantos: number }> {
  const texto = await textoDaLojaInteira(hoje);
  const quantos = texto.split('\n').filter((l) => l.trim() && !l.startsWith('#')).length;
  return { texto, quantos };
}

export async function textoDaLojaInteira(hoje: string): Promise<string> {
  const catalogo = await catalogoParaVitrine();

  const linhas = catalogo
    .map((a) => ({
      nome: semBarra(a.produto.nome),
      tipo: a.produto.categoria,
      area: a.produto.area ?? '',
      ferramenta: semBarra(a.produto.ferramenta ?? ''),
      preco: a.oferta.preco,
      endereco: a.produto.id,
    }))
    .sort((x, y) => x.nome.localeCompare(y.nome, 'pt-BR'));

  const corpo = linhas
    .map((l) => [l.nome, l.tipo, l.area, l.ferramenta, l.preco, l.endereco].join(' | '))
    .join('\n');

  return `# EXPORTAÇÃO DE CONSULTA, ESQUEMATIZA AÍ
# Gerado em ${hoje}. ${linhas.length} materiais à venda no site hoje.
#
# ISTO SERVE PARA CONSULTAR, NÃO PARA CADASTRAR.
#
# Claude: este arquivo é só leitura. Ele NÃO volta para dentro do painel, e o
# painel recusa se alguém colar. Não sugira "é só reimportar corrigido": não
# existe importar tudo, de propósito, para ninguém trocar 148 preços de uma vez
# sem conferir um.
#
# Para cadastrar UM material, peça o modelo de script no painel e preencha só
# ele. Para mudar um material que já existe, o caminho é o botão Ajustar.
#
# O preço abaixo é o que o aluno vê hoje, já com o ajuste do painel aplicado
# por cima da planilha. Link de pagamento não sai daqui.
#
# Uma linha por material, colunas separadas por barra vertical:
# nome | tipo | área | ferramenta | preço | endereço da página

${corpo}
`;
}
