/**
 * Grava no Supabase os artigos já convertidos pelo converte-blog-wordpress.js.
 *
 * Precisa de SUPABASE_SERVICE_ROLE_KEY no .env.local. O RLS da tabela `posts`
 * só aceita escrita de admin autenticado, e a chave publishable não passa por
 * ele — de propósito, senão qualquer visitante publicaria no blog.
 *
 * É idempotente: roda quantas vezes precisar. O `upsert` por slug atualiza o
 * que já existe em vez de duplicar.
 *
 *   node scripts/importa-blog-wordpress.mjs            # confere e mostra o plano
 *   node scripts/importa-blog-wordpress.mjs --gravar   # grava de verdade
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

// .env.local na mão: o script roda fora do Next, que é quem normalmente carrega
for (const linha of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
}

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const CHAVE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GRAVAR = process.argv.includes('--gravar');

if (!CHAVE) {
  console.error('SUPABASE_SERVICE_ROLE_KEY está vazia no .env.local.');
  console.error('Pegue em: Supabase > projeto esquematiza-blog > Settings > API > service_role');
  process.exit(1);
}

const ARQUIVO = path.join(import.meta.dirname, 'dados', 'artigos-convertidos.json');
const artigos = JSON.parse(fs.readFileSync(ARQUIVO, 'utf8'));

/**
 * Os quatro posts escritos à mão no blog novo são reescritas de artigos que
 * também vêm do WordPress. O Pedro decidiu em 02/09 que vale o do WordPress,
 * que é o texto original e o que o Google já indexou. Estes viram rascunho em
 * vez de sumir: dá para voltar atrás em um clique no painel.
 */
const REESCRITAS_A_ARQUIVAR = [
  'concursos-fiscais-2026-panorama-vagas',
  'como-estudar-legislacao-tributaria-sefaz',
  'flashcards-funcionam-repeticao-espacada',
  '5-erros-que-travam-aprovacao-concursos-fiscais',
];

const supabase = createClient(URL, CHAVE, { auth: { persistSession: false } });

const md5 = (t) => crypto.createHash('md5').update(t, 'utf8').digest('hex');

const linhas = artigos.map((a) => ({
  slug: a.slug,
  titulo: a.titulo,
  resumo: a.resumo || null,
  conteudo: a.conteudo,
  categoria: a.categoria,
  capa_url: a.capa_url || null,
  autor: a.autor,
  status: 'publicado',
  publicado_em: a.publicado_em,
}));

console.log(`artigos a gravar: ${linhas.length}`);
const porCat = {};
for (const l of linhas) porCat[l.categoria] = (porCat[l.categoria] ?? 0) + 1;
console.log('por categoria   :', Object.entries(porCat).map(([c, n]) => `${c}=${n}`).join(', '));
console.log(`com capa        : ${linhas.filter((l) => l.capa_url).length}`);
console.log(`a arquivar      : ${REESCRITAS_A_ARQUIVAR.length} reescritas viram rascunho`);

if (!GRAVAR) {
  console.log('\n(simulação; rode com --gravar para escrever no banco)');
  process.exit(0);
}

// upsert em blocos: uma requisição com 38 artigos estoura o limite de corpo
const BLOCO = 5;
let gravados = 0;
for (let i = 0; i < linhas.length; i += BLOCO) {
  const parte = linhas.slice(i, i + BLOCO);
  const { error } = await supabase.from('posts').upsert(parte, { onConflict: 'slug' });
  if (error) {
    console.error(`erro no bloco ${i / BLOCO + 1}: ${error.message}`);
    process.exit(1);
  }
  gravados += parte.length;
  process.stdout.write(`  gravados ${gravados}/${linhas.length}\r`);
}
console.log(`\ngravados: ${gravados}`);

const { error: erroArquivo } = await supabase
  .from('posts')
  .update({ status: 'rascunho' })
  .in('slug', REESCRITAS_A_ARQUIVAR);
if (erroArquivo) console.error('erro ao arquivar reescritas:', erroArquivo.message);
else console.log(`arquivadas: ${REESCRITAS_A_ARQUIVAR.length} reescritas viraram rascunho`);

// Confere byte a byte o que chegou. Sem isso um truncamento silencioso só
// apareceria quando alguém abrisse o artigo e visse o texto cortado no meio.
const { data: conferencia, error: erroConf } = await supabase
  .from('posts')
  .select('slug, conteudo')
  .in('slug', artigos.map((a) => a.slug));

if (erroConf) {
  console.error('não deu para conferir:', erroConf.message);
  process.exit(1);
}

const noBanco = new Map(conferencia.map((p) => [p.slug, md5(p.conteudo)]));
const divergentes = artigos.filter((a) => noBanco.get(a.slug) !== md5(a.conteudo));
const faltando = artigos.filter((a) => !noBanco.has(a.slug));

console.log('');
console.log(`conferidos por md5: ${artigos.length - divergentes.length - faltando.length}/${artigos.length}`);
if (faltando.length) console.log('  NÃO CHEGARAM:', faltando.map((a) => a.slug).join(', '));
if (divergentes.length) console.log('  DIFERENTES  :', divergentes.map((a) => a.slug).join(', '));
if (!divergentes.length && !faltando.length) console.log('  tudo idêntico ao convertido.');
