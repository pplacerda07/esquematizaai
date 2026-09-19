import { MODELO_ATUAL, TIPOS, AREAS, FERRAMENTAS, FORMATOS } from './script-vocabulario';

/**
 * O texto que o Sérgio copia e manda para o Claude dele preencher.
 *
 * É MONTADO A PARTIR DO VOCABULÁRIO, não escrito à mão. Se um dia entrar uma
 * área nova, ela aparece aqui sozinha; um modelo com lista desatualizada faz o
 * Claude dele escrever um valor que o painel recusa, e a culpa parece do
 * painel.
 *
 * O formato é uma linha por campo em vez de JSON. Quando JSON quebra, a
 * mensagem que sobra é "Unexpected token at position 412", que ele não consegue
 * consertar nem repassar. Linha solta não tem aninhamento para amassar no
 * caminho de volta do chat.
 *
 * As regras estão escritas dentro do arquivo, e não num manual à parte, porque
 * quem lê isto é uma máquina que recebe só este texto.
 */
export function textoDoModelo(): string {
  return `# MODELO DE SCRIPT DE PRODUTO, ESQUEMATIZA AÍ, modelo ${MODELO_ATUAL}
#
# Claude: preencha depois dos dois pontos e devolva SÓ este texto, sem
# comentário seu em volta. Uma linha por campo. UM produto por script.
#
# REGRAS QUE NÃO PODEM SER QUEBRADAS
# 1. NUNCA invente preço nem preço "de". Se você não tem o número na mão,
#    pare e pergunte. Valor riscado que nunca existiu é propaganda enganosa.
# 2. preco e preco_de são só número. Certo: 597, 597,00, 1297.
#    ERRADO: 1.299. Se são mil duzentos e noventa e nove, escreva 1299.
# 3. preco_de, quando existir, precisa ser MAIOR que preco.
# 4. Pelo menos um entre checkout e pagina_de_vendas.
# 5. Não use travessão em nenhum texto.
# 6. Campo que você não sabe: apague a linha inteira. Não deixe vazio.

modelo: ${MODELO_ATUAL}

# OBRIGATÓRIOS
nome:
tipo:              # ${TIPOS.join(', ')}
preco:             # só número, exemplo 597

# CAMINHO DE COMPRA, pelo menos um dos dois
checkout:          # link do checkout onde a pessoa paga
pagina_de_vendas:  # link da página do produto na loja

# OPCIONAIS, apague a linha que não for usar
preco_de:          # preço antigo, para aparecer riscado. Maior que preco
area:              # ${AREAS.join(', ')}
ferramenta:        # ${FERRAMENTAS.join(', ')}
formato:           # ${FORMATOS.join(', ')}
endereco:          # o final do link: /vitrine/produto/<endereco>
                   # Se apagar esta linha, sai do nome
descricao:         # aceita Markdown: **negrito**, ## título, - lista,
                   # [texto](endereço) e as caixas :::importante e :::dica.
                   # NÃO aceita HTML: as tags apareceriam escritas na página.

# O QUE NÃO ENTRA AQUI, DE PROPÓSITO
# capa: a imagem se escolhe no painel, na tela de conferência, depois de colar.
# destaque: quem sobe ao topo da vitrine é decisão da loja inteira,
#           não propriedade do produto.
# esconder: cadastre normal e use "Ajustar" na lista de materiais.
# datas e quem cadastrou: o site preenche sozinho.
`;
}
