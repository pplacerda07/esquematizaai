/**
 * Mantém o que a planilha nova deixou de dizer, mas continua sendo verdade.
 *
 * Duas coisas: o ENDEREÇO do produto, quando a planilha só mudou o nome dele,
 * e a ÁREA, quando a planilha nova veio com a coluna em branco.
 *
 * Uso:  node scripts/preserva-slugs.js <catalogo-de-referencia.json>
 *
 * Rodar SEMPRE logo depois de build-catalogo.js, antes de qualquer outra coisa.
 *
 * O PROBLEMA QUE ISSO RESOLVE: o id do produto é gerado a partir do nome, e o
 * Sérgio renomeia produto com frequência. "Combo ISS-Guarulhos Legislação
 * Tributária" virou "Combo Legislação Tributária Municipal ISS-Guarulhos" na
 * planilha nova, e só isso já mudaria o endereço da página de
 * /vitrine/produto/combo-iss-guarulhos-legislacao-tributaria para outro.
 *
 * Três coisas quebram junto:
 *  - o link que alguém salvou ou compartilhou passa a dar 404;
 *  - o texto raspado da página de vendas é guardado POR ID, então o produto
 *    perde descrição, cronograma e FAQ e volta a ser um cartão sem conteúdo;
 *  - o que foi ajustado no painel também é guardado por id, e some junto.
 *
 * Na importação de Produtos (3).xlsx isso atingiria 22 produtos, todos com
 * texto raspado.
 *
 * COMO IDENTIFICA QUE É O MESMO PRODUTO: pelo link de checkout ou pela página
 * de vendas, que são o que aponta para o produto de verdade na Eduzz e no
 * WordPress. O nome é rótulo e muda; esses dois não mudam sem o produto mudar.
 */

const fs = require('fs');
const path = require('path');

const ARQUIVO = path.join(__dirname, '..', 'src/data/catalogo/produtos.json');
const REFERENCIA = process.argv[2];

if (!REFERENCIA) {
  console.error('falta o catálogo de referência.');
  console.error('exemplo: git show HEAD:src/data/catalogo/produtos.json > antes.json');
  console.error('         node scripts/preserva-slugs.js antes.json');
  process.exit(1);
}

const chaves = (p) => {
  const saida = [];
  const c = p.checkouts || {};
  if (c.normal) saida.push('chk:' + c.normal);
  if (c.black) saida.push('chk:' + c.black);
  if (p.urlSite) saida.push('url:' + p.urlSite);
  return saida;
};

function main() {
  const antes = JSON.parse(fs.readFileSync(REFERENCIA, 'utf8')).produtos;
  const bruto = JSON.parse(fs.readFileSync(ARQUIVO, 'utf8'));
  const agora = bruto.produtos;

  // de cada chave estável para o id antigo
  const idAntigo = new Map();
  for (const p of antes) for (const k of chaves(p)) if (!idAntigo.has(k)) idAntigo.set(k, p.id);

  const idsNovos = new Set(agora.map((p) => p.id));
  const jaUsados = new Set();
  let mantidos = 0;

  for (const p of agora) {
    let alvo = null;
    for (const k of chaves(p)) {
      const candidato = idAntigo.get(k);
      if (candidato && candidato !== p.id) {
        alvo = candidato;
        break;
      }
    }

    if (!alvo) continue;
    // dois produtos novos apontando para o mesmo id antigo: o primeiro fica com
    // ele, o segundo mantém o seu, para não criar id repetido
    if (jaUsados.has(alvo) || (idsNovos.has(alvo) && agora.find((x) => x.id === alvo && x !== p))) {
      console.log('  conflito, mantido como está: ' + p.id);
      continue;
    }

    console.log('  ' + alvo.padEnd(50) + ' <- era ' + p.id);
    if (!p.nomesAlternativos) p.nomesAlternativos = [];
    p.id = alvo;
    jaUsados.add(alvo);
    mantidos++;
  }

  /**
   * Área herdada.
   *
   * Em Produtos (3).xlsx a coluna de área veio em branco para 105 produtos,
   * contra 13 na planilha anterior. Sem isso os filtros da vitrine ficariam
   * quase vazios, e um produto que sempre foi Fiscal continua sendo Fiscal:
   * a planilha ter deixado a célula em branco não é o mesmo que dizer que o
   * produto perdeu a área.
   *
   * Só herda quem já existia. Produto novo sem área fica sem, e aparece no
   * relatório para o Sérgio classificar.
   */
  const anteriorPorId = new Map(antes.map((p) => [p.id, p]));
  let areasHerdadas = 0;
  for (const p of agora) {
    if (p.area) continue;
    const q = anteriorPorId.get(p.id);
    if (q?.area) {
      p.area = q.area;
      areasHerdadas++;
    }
  }

  fs.writeFileSync(ARQUIVO, JSON.stringify(bruto, null, 2) + '\n', 'utf8');
  console.log('\n  endereços preservados: ' + mantidos);
  console.log('  áreas herdadas       : ' + areasHerdadas);
  console.log('  ainda sem área       : ' + agora.filter((p) => !p.area).length);
  console.log('  total no catálogo    : ' + agora.length);

  const contagem = {};
  for (const p of agora) contagem[p.id] = (contagem[p.id] ?? 0) + 1;
  const repetidos = Object.entries(contagem).filter(([, n]) => n > 1);
  if (repetidos.length) {
    console.log('\n  ATENÇÃO, ids repetidos: ' + repetidos.map(([id, n]) => id + ' x' + n).join(', '));
    process.exitCode = 1;
  }
}

main();
