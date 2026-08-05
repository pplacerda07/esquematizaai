/**
 * Extrai os depoimentos de alunos aprovados de dentro do conteúdo raspado do
 * WordPress e grava src/data/catalogo/depoimentos.json.
 *
 * Uso:  node scripts/build-depoimentos.js
 *
 * DE ONDE VEM O PROBLEMA:
 * a raspagem trouxe a página inteira do produto dentro do campo `sumario`. Junto
 * do índice do material vieram os depoimentos, a seção de benefícios e até
 * pedaços do rodapé. Na página nova isso aparecia como um paredão de texto sob o
 * título "Sumário completo", sem destacar nada.
 *
 * O QUE ESTE SCRIPT FAZ:
 *  1. lê os depoimentos e grava num arquivo próprio, para virarem cartões;
 *  2. corta `detalhes` e `sumario` no ponto em que deixam de ser o que prometem.
 *
 * ONDE OS DEPOIMENTOS ESTAVAM: em `detalhes` para 95 produtos e em `sumario`
 * para 6, por isso os dois campos são tratados. Em `detalhes` o texto útil
 * terminava em 18% do campo; os outros 82% eram cronograma repetido (já existe
 * campo próprio, preenchido nos 107), depoimentos e a seção de benefícios.
 *
 * POR QUE UM ARQUIVO SÓ, E NÃO UM POR PRODUTO:
 * são os mesmos 9 alunos em 101 dos 107 produtos, mudando só a ordem. Guardar 101
 * cópias da mesma lista seria peso morto e um problema na hora de corrigir um nome.
 */

const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const ARQUIVO_CONTEUDO = path.join(RAIZ, 'src/data/catalogo/conteudo-produto.json');
const ARQUIVO_SAIDA = path.join(RAIZ, 'src/data/catalogo/depoimentos.json');

// "Vinícíus Soares ,  Aprovado em 27º lugar ,  Auditor da SEFA-PA"
// O " , " no lugar do travessão é herança da limpeza anterior de travessões.
const LINHA_AUTOR = /^(.+?)\s*,\s*Aprovad([oa])\s+em\s*(\d+)\s*[º°]\s*lugar\s*,\s*(.+)$/i;

// onde o sumário deixa de ser sumário
const FIM_DO_SUMARIO = /(Cronograma de entrega|Depoimentos de Alunos|Veja nosso material por dentro)/i;

/**
 * Correções de nome que vieram erradas do WordPress.
 *
 * Fica aqui, e não editado na mão no JSON, porque o JSON é regerado por este
 * script: uma correção manual sumiria na próxima execução.
 *
 * "Vinícíus" não existe em português, é "Vinícius". Nome de aluno aprovado
 * escrito errado em 107 páginas é o tipo de detalhe que tira a credibilidade
 * justamente da peça que existe para dar credibilidade. Confirmar com o Sérgio.
 */
const NOMES_CORRIGIDOS = {
  'Vinícíus Soares': 'Vinícius Soares',
};

function limpar(texto) {
  return texto
    .replace(/\s*,\s*$/, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function extrairDepoimentos(texto) {
  if (!texto) return [];
  const inicio = texto.search(/Depoimentos de Alunos/i);
  if (inicio < 0) return [];

  const linhas = texto
    .slice(inicio)
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const encontrados = [];
  for (let i = 1; i < linhas.length; i++) {
    const autor = linhas[i].match(LINHA_AUTOR);
    if (!autor) continue;

    // a citação é sempre a linha imediatamente anterior, entre aspas
    const anterior = linhas[i - 1];
    if (!/^["“]/.test(anterior)) continue;

    const nomeBruto = limpar(autor[1]);

    encontrados.push({
      citacao: limpar(anterior.replace(/^["“]\s*/, '').replace(/\s*["”]$/, '')),
      nome: NOMES_CORRIGIDOS[nomeBruto] ?? nomeBruto,
      // guardado para escrever "Aprovado" ou "Aprovada" na frente do nome certo
      genero: autor[2].toLowerCase() === 'a' ? 'f' : 'm',
      colocacao: Number(autor[3]),
      cargo: limpar(autor[4]),
    });
  }
  return encontrados;
}

function main() {
  const bruto = JSON.parse(fs.readFileSync(ARQUIVO_CONTEUDO, 'utf8'));
  const mapa = bruto.conteudo || bruto;

  const pool = new Map();
  let produtosComDepoimento = 0;
  const cortes = { detalhes: 0, sumario: 0, cronograma: 0 };
  let caracteresRemovidos = 0;
  const esvaziados = [];

  for (const [id, dados] of Object.entries(mapa)) {
    const fonte = [dados.sumario, dados.sobre, dados.detalhes].filter(Boolean).join('\n');

    const lista = extrairDepoimentos(fonte);
    if (lista.length) produtosComDepoimento++;
    // chave por nome + colocação: o mesmo aluno não entra duas vezes
    lista.forEach((d) => pool.set(`${d.nome}|${d.colocacao}`, d));

    for (const campo of ['detalhes', 'sumario', 'cronograma']) {
      if (!dados[campo]) continue;
      const corte = dados[campo].search(FIM_DO_SUMARIO);
      if (corte < 0) continue;

      const antes = dados[campo].length;
      dados[campo] = dados[campo].slice(0, corte).trim();
      caracteresRemovidos += antes - dados[campo].length;
      cortes[campo]++;

      // Sobra sem nenhuma letra não é conteúdo: são os casos em que a raspagem
      // guardou só o emoji do título. Três produtos tinham o `cronograma`
      // inteiro valendo "🏆 Depoimentos de Alunos Aprovados", ou seja, a página
      // anunciava isso como prazo de entrega. Melhor não mostrar a seção.
      if (!/\p{L}/u.test(dados[campo])) {
        delete dados[campo];
        esvaziados.push(`${id} (${campo})`);
      }
    }
  }

  const depoimentos = [...pool.values()].sort((a, b) => a.colocacao - b.colocacao);

  fs.writeFileSync(ARQUIVO_SAIDA, JSON.stringify({ depoimentos }, null, 2) + '\n', 'utf8');
  fs.writeFileSync(ARQUIVO_CONTEUDO, JSON.stringify(bruto, null, 2) + '\n', 'utf8');

  console.log('produtos com depoimento no texto :', produtosComDepoimento);
  console.log('depoimentos distintos gravados   :', depoimentos.length);
  console.log('campos "detalhes" cortados       :', cortes.detalhes);
  console.log('campos "sumario" cortados        :', cortes.sumario);
  console.log('campos "cronograma" cortados     :', cortes.cronograma);
  console.log('caracteres removidos no total    :', caracteresRemovidos.toLocaleString('pt-BR'));
  if (esvaziados.length) {
    console.log('campos que ficaram vazios        :', esvaziados.length);
    esvaziados.slice(0, 5).forEach((e) => console.log('   -', e));
  }
  console.log('\ngravado em', path.relative(RAIZ, ARQUIVO_SAIDA));
  depoimentos.forEach((d) => console.log(`  ${d.colocacao}º ${d.nome} (${d.cargo})`));
}

main();
