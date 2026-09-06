/**
 * Alinha o catálogo do site novo com o site antigo, que é a fonte de verdade,
 * como o Sérgio definiu em 05/09.
 *
 * Grava em `produtos_ajustes`, que é a camada de ajuste do painel: a planilha
 * continua intacta e o Sérgio consegue ver e desfazer qualquer linha destas na
 * tela de Materiais. Nenhum dado original é sobrescrito.
 *
 * Faz duas coisas:
 *   1. corrige o preço de quem está diferente do site antigo
 *   2. oculta o que não está mais à venda lá
 *
 *   node scripts/alinha-catalogo.mjs            # mostra o plano
 *   node scripts/alinha-catalogo.mjs --gravar   # aplica
 */
import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';

for (const l of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
}

const CHAVE = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!CHAVE) { console.error('SUPABASE_SERVICE_ROLE_KEY vazia no .env.local'); process.exit(1); }

const GRAVAR = process.argv.includes('--gravar');
const AUTOR = 'conferencia-site-antigo';

/**
 * Preço que o site antigo cobra hoje, conferido página por página em 05/09.
 * Escrito à mão e não gerado, porque preço errado no ar é dinheiro perdido:
 * cada linha destas foi lida na página do produto no WordPress.
 */
const PRECOS = [
  ['combo-legislacao-tributaria-estadual-sefaz-go-pos-edital', 397],
  ['combo-iss-guarulhos-legislacao-tributaria', 297],
  ['combo-resumos-flashcards-controle-regular', 997],
  ['combo-resumos-flashcards-fiscal-regular', 997],
  ['combo-resumos-flashcards-policial-regular', 797],
  ['resumo-isolado-legislacao-tributaria-sefaz-ba-3048267', 197],
  ['resumo-isolado-legislacao-tributaria-sefaz-al', 257],
  ['assinatura-resumos-regular', 897],
  ['assinatura-legislacao-tributaria', 1597],
  ['assinatura-flashcards-regular', 897],
];

/**
 * Produtos que saíram do ar no site antigo e não têm como ser comprados: os
 * pós-edital de concursos que já aconteceram e as assinaturas de 2 anos, que
 * o Sérgio explicou existirem só para condição excepcional.
 */
const OCULTAR = [
  'combo-legislacao-tributaria-estadual-sefa-mt-pos-edital',
  'combo-legislacao-tributaria-estadual-sefa-pa-pos-edital',
  'combo-legislacao-tributaria-estadual-sefaz-ce',
  'combo-legislacao-tributaria-estadual-sefaz-sp-pos-edital',
  'flashcards-isolado-legislacao-tributaria-sefaz-ce',
  'flashcards-legislacao-tributaria-sefaz-pi-pos-edital',
  'questoes-ineditas-isolado-legislacao-tributaria-sefaz-rn',
  'questoes-ineditas-lte-sefaz-mt',
  'questoes-ineditas-legislacao-tributaria-sefaz-ce',
  'resumo-isolado-legislacao-tributaria-sefaz-ce',
  'vade-mecum-isolado-legislacao-tributaria-sefaz-rn',
  'vade-mecum-legislacao-tributaria-sefaz-ce',
  'assinatura-flashcards-regular-2-anos',
  'assinatura-resumos-regular-2-anos',
  'assinatura-resumos-regular-flashcards-regular-2-anos',
  'assinatura-resumos-regular-flashcards-regular-2-anos-2901047',
];

const catalogo = JSON.parse(fs.readFileSync('src/data/catalogo/produtos.json', 'utf8')).produtos;
const existe = new Set(catalogo.map((p) => p.id));

const precosValidos = PRECOS.filter(([id]) => existe.has(id));
const ocultarValidos = OCULTAR.filter((id) => existe.has(id));

const somemPreco = PRECOS.filter(([id]) => !existe.has(id)).map(([id]) => id);
const somemOcultar = OCULTAR.filter((id) => !existe.has(id));

console.log(`corrigir preço : ${precosValidos.length} de ${PRECOS.length}`);
console.log(`ocultar        : ${ocultarValidos.length} de ${OCULTAR.length}`);
if (somemPreco.length) console.log('  id de preço que não existe no catálogo:', somemPreco.join(', '));
if (somemOcultar.length) console.log('  id de ocultar que não existe no catálogo:', somemOcultar.join(', '));

console.log('\n--- preços ---');
for (const [id, novo] of precosValidos) {
  const p = catalogo.find((x) => x.id === id);
  console.log(`  ${p.nome.slice(0, 50).padEnd(50)} planilha R$ ${String(p.precos.cheio).padStart(6)} -> loja R$ ${String(novo).padStart(6)}`);
}

if (!GRAVAR) { console.log('\n(simulação; rode com --gravar para aplicar)'); process.exit(0); }

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, CHAVE, { auth: { persistSession: false } });

// `oculto` e `destaque` não aceitam nulo na tabela, então vão explícitos em
// toda linha: quem só corrige preço continua visível e sem destaque.
const linhas = [
  ...precosValidos.map(([id, preco]) => ({
    produto_id: id,
    preco,
    oculto: false,
    destaque: false,
    observacao: 'Preço alinhado com o site antigo, conferido na página do produto em 05/09.',
    atualizado_por: AUTOR,
  })),
  ...ocultarValidos.map((id) => ({
    produto_id: id,
    oculto: true,
    destaque: false,
    observacao: 'Fora do ar no site antigo e sem caminho de compra: concurso encerrado ou oferta de condição excepcional.',
    atualizado_por: AUTOR,
  })),
];

const { error } = await supabase.from('produtos_ajustes').upsert(linhas, { onConflict: 'produto_id' });
if (error) { console.error('erro ao gravar:', error.message); process.exit(1); }

const { data: conf } = await supabase.from('produtos_ajustes').select('produto_id, preco, oculto');
console.log(`\ngravados: ${linhas.length}`);
console.log(`no banco : ${conf?.length ?? 0} ajustes  (${conf?.filter((c) => c.oculto).length ?? 0} ocultos, ${conf?.filter((c) => c.preco != null).length ?? 0} com preço)`);
