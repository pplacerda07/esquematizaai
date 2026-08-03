/**
 * Serializa dados estruturados para dentro de uma tag <script>.
 *
 * POR QUE NÃO USAR JSON.stringify DIRETO:
 * ele não escapa "<". Se qualquer campo contiver a sequência que fecha uma tag
 * script, o navegador encerra o bloco ali e passa a ler o resto como HTML. Um
 * título terminado em "</script><script>alert(document.cookie)</script>"
 * viraria código executando no site.
 *
 * Isso deixou de ser hipotético quando abrimos /api/noticias: título e texto
 * passaram a vir de uma automação, ou seja, de fora. Basta a IA repetir um
 * trecho de uma página que leu.
 *
 * Trocar os caracteres pelo escape unicode resolve: o JSON continua idêntico
 * para quem lê (Google, ChatGPT), e nenhuma tag consegue fechar antes da hora.
 */

// U+2028 e U+2029 são quebras de linha para o JavaScript, mas caracteres
// válidos dentro de uma string JSON: passam despercebidos e quebram o script.
// Construídos por código de propósito: escrever esses caracteres literalmente
// aqui quebraria este próprio arquivo, o que já aconteceu uma vez.
const SEPARADOR_LINHA = new RegExp(String.fromCharCode(0x2028), 'g');
const SEPARADOR_PARAGRAFO = new RegExp(String.fromCharCode(0x2029), 'g');

export function jsonLdSeguro(dados: unknown): string {
  return JSON.stringify(dados)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(SEPARADOR_LINHA, '\\u2028')
    .replace(SEPARADOR_PARAGRAFO, '\\u2029');
}
