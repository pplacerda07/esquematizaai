/**
 * Gera o SQL que cadastra as disciplinas da planilha no banco.
 *
 * Uso:  node scripts/semeia-sumarios.js > semente.sql
 *
 * SÓ AS DISCIPLINAS, SEM OS TÓPICOS, e isso é de propósito.
 *
 * O banco é camada POR CIMA da planilha, igual ao produtos_ajustes. Tópico que
 * ninguém editou continua vindo do sumarios.json; copiá-lo para o banco criaria
 * uma segunda cópia da mesma informação, e duas cópias divergem. Os 2347
 * tópicos entram um a um, no dia em que alguém editar aquela disciplina no
 * painel, e aí a disciplina fica "adotada" e a planilha para de mandar nela.
 *
 * As linhas existem mesmo assim porque a tela de vincular disciplina a curso
 * precisa de uma lista para escolher, e porque `curso_disciplinas` aponta para
 * o id daqui.
 *
 * Pode rodar de novo a cada planilha nova: atualiza quem ainda vem da planilha
 * e não encosta em quem já foi adotado no painel.
 */

const path = require('path');
const sumarios = require(path.join(__dirname, '..', 'src/data/catalogo/sumarios.json'));

const txt = (v) => (v == null ? 'null' : `'${String(v).replace(/'/g, "''")}'`);
const num = (v) => (v == null || Number.isNaN(Number(v)) ? 'null' : String(Number(v)));

/** área de cada disciplina, do mapa de módulos por área da planilha */
const AREA = new Map();
for (const m of sumarios.modulosPorArea || []) {
  // disciplina que serve a várias áreas fica com a primeira; taguear direito
  // é justamente uma das telas que o Sérgio pediu
  if (!AREA.has(m.disciplina)) AREA.set(m.disciplina, m.area);
}

const linhas = [
  ...sumarios.resumosRegulares.disciplinas
    .filter((d) => d.sumario)
    .map((d) => [d.disciplina, 'Resumo', AREA.get(d.disciplina) ?? null, d.paginas, null]),
  ...sumarios.flashcardsRegulares
    .filter((d) => d.arvoreAssuntos)
    .map((d) => [d.disciplina, 'Flashcards', AREA.get(d.disciplina) ?? null, null, d.cards]),
];

const valores = linhas
  .map(([nome, formato, area, paginas, cards]) =>
    `  (${txt(nome)}, ${txt(formato)}, ${txt(area)}, ${num(paginas)}, ${num(cards)})`,
  )
  .join(',\n');

process.stdout.write(`-- gerado por scripts/semeia-sumarios.js
-- ${linhas.length} disciplinas da planilha; os tópicos continuam no sumarios.json
insert into public.disciplinas (nome, formato, area, paginas, cards, atualizado_por)
select v.nome, v.formato, v.area, v.paginas, v.cards, 'planilha'
from (values
${valores}
) as v(nome, formato, area, paginas, cards)
on conflict (nome, formato) do update set
  -- disciplina adotada no painel nao e mais tocada pela planilha
  area = case when public.disciplinas.adotada_em is null then excluded.area else public.disciplinas.area end,
  paginas = case when public.disciplinas.adotada_em is null then excluded.paginas else public.disciplinas.paginas end,
  cards = case when public.disciplinas.adotada_em is null then excluded.cards else public.disciplinas.cards end;
`);
