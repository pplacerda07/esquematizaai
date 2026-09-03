/**
 * Passa os artigos convertidos pelo MESMO parser que o site usa para renderizar
 * o blog (remark + gfm + directive) e confere se cada peça virou o nó que o
 * componente Conteudo espera.
 *
 * Sem isso, um erro de sintaxe numa diretiva não aparece como erro: aparece
 * como ":::importante" impresso literalmente no meio do artigo publicado.
 */
import fs from 'node:fs';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkDirective from 'remark-directive';

const CAMINHO = process.argv[2];
if (!CAMINHO) {
  console.error('uso: node scripts/valida-markdown-importado.mjs <artigos-convertidos.json>');
  process.exit(1);
}

const artigos = JSON.parse(fs.readFileSync(CAMINHO, 'utf8'));
const processador = unified().use(remarkParse).use(remarkGfm).use(remarkDirective);

const CAIXAS_VALIDAS = new Set(['importante', 'dica', 'sintese', 'aprofunde', 'fontes', 'produto', 'marca']);

function percorrer(no, visitar) {
  visitar(no);
  for (const f of no.children ?? []) percorrer(f, visitar);
}

const total = { diretivas: {}, tabelas: 0, links: 0, titulos: 0, listas: 0 };
const problemas = [];

for (const a of artigos) {
  const arvore = processador.parse(a.conteudo);
  processador.runSync(arvore);

  let temDiretivaSolta = false;

  percorrer(arvore, (no) => {
    if (no.type === 'containerDirective' || no.type === 'leafDirective' || no.type === 'textDirective') {
      total.diretivas[no.name] = (total.diretivas[no.name] ?? 0) + 1;
      if (!CAIXAS_VALIDAS.has(no.name)) {
        problemas.push(`${a.slug}: diretiva desconhecida ":::${no.name}" (o site renderiza como div sem estilo)`);
      }
      if (no.name === 'produto' && !no.attributes?.id) {
        problemas.push(`${a.slug}: ::produto sem id`);
      }
    }
    if (no.type === 'table') total.tabelas += 1;
    if (no.type === 'link') total.links += 1;
    if (no.type === 'heading') total.titulos += 1;
    if (no.type === 'list') total.listas += 1;

    // diretiva que não foi reconhecida sobra como texto literal
    if (no.type === 'text' && /^:{2,3}[a-z]/.test(no.value ?? '')) {
      temDiretivaSolta = true;
    }
  });

  if (temDiretivaSolta) problemas.push(`${a.slug}: ":::" sobrou como texto literal`);

  // tabela malformada: linhas com contagem de células diferente do cabeçalho
  percorrer(arvore, (no) => {
    if (no.type !== 'table') return;
    const larguras = new Set((no.children ?? []).map((l) => (l.children ?? []).length));
    if (larguras.size > 1) {
      problemas.push(`${a.slug}: tabela com linhas de larguras diferentes (${[...larguras].join(', ')})`);
    }
  });

  if (!a.titulo?.trim()) problemas.push(`${a.slug}: sem título`);
  if (!a.resumo?.trim()) problemas.push(`${a.slug}: sem resumo`);
  if ((a.conteudo ?? '').length < 300) problemas.push(`${a.slug}: conteúdo muito curto (${a.conteudo.length})`);
}

console.log('artigos analisados :', artigos.length);
console.log('títulos (h2/h3)    :', total.titulos);
console.log('tabelas            :', total.tabelas);
console.log('listas             :', total.listas);
console.log('links              :', total.links);
console.log('diretivas          :', Object.entries(total.diretivas).map(([n, q]) => `${n}=${q}`).join(' ') || 'nenhuma');
console.log('');

if (problemas.length) {
  console.log(`=== PROBLEMAS (${problemas.length}) ===`);
  problemas.slice(0, 40).forEach((p) => console.log('  ' + p));
  if (problemas.length > 40) console.log(`  ... e mais ${problemas.length - 40}`);
  process.exit(1);
}
console.log('Nenhum problema: todo o Markdown é lido pelo parser do site.');
