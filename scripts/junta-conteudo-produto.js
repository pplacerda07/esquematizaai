/**
 * Junta a captura nova do conteúdo dos produtos com a que já estava no ar,
 * campo a campo, ficando com a melhor versão de cada um.
 *
 * POR QUE NÃO TROCAR TUDO. A rodada de 08/09 trouxe o que o Sérgio pediu: o
 * cronograma do SEFAZ-AL saiu de "EM ELABORAÇÃO, 07/09/2026" para "Material
 * finalizado", e 84 produtos ganharam a informação de que estão prontos. Mas
 * ela também veio com um defeito: em 119 dos 131 produtos o FAQ capturou HTML
 * do acordeão junto com a resposta, e em 13 o mesmo aconteceu no bloco de
 * disciplinas. Publicar assim colocaria `<div class="elementor-...">` visível
 * no meio da página de venda.
 *
 * A captura anterior não tinha esse defeito em nenhum campo. Então:
 *   sobre, sumario, cronograma  -> sempre a nova (limpas, e são o que mudou)
 *   detalhes                    -> a nova, menos quando veio com HTML
 *   faq                         -> sempre a antiga, que está limpa
 *
 * Se um dia o recorte do FAQ for corrigido no build-conteudo-produto.js, este
 * script deixa de ser necessário.
 */
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'src', 'data', 'catalogo');
const ATUAL = path.join(DIR, 'conteudo-produto.json');
const NOVO = path.join(DIR, 'conteudo-produto.novo.json');

const velho = JSON.parse(fs.readFileSync(ATUAL, 'utf8')).conteudo;
const novo = JSON.parse(fs.readFileSync(NOVO, 'utf8')).conteudo;

/** Sobrou marcação do Elementor no texto? */
const temHtml = (t) => /<div|<span|<p |class="elementor/.test(String(t ?? ''));

const juntado = {};
const contagem = { sobre: 0, detalhes: 0, sumario: 0, cronograma: 0, detalhesRecusado: 0, faqAntigo: 0 };

for (const id of new Set([...Object.keys(velho), ...Object.keys(novo)])) {
  const a = velho[id] ?? {};
  const b = novo[id] ?? {};
  const item = { ...a };

  for (const campo of ['sobre', 'sumario', 'cronograma']) {
    if (b[campo] && b[campo] !== a[campo]) { item[campo] = b[campo]; contagem[campo] += 1; }
  }

  if (b.detalhes && b.detalhes !== a.detalhes) {
    if (temHtml(b.detalhes)) {
      contagem.detalhesRecusado += 1;              // fica com a versão antiga
    } else {
      item.detalhes = b.detalhes;
      if (b.detalhesTitulo) item.detalhesTitulo = b.detalhesTitulo;
      contagem.detalhes += 1;
    }
  }

  // FAQ: sempre o antigo. O novo veio com HTML em 119 dos 131.
  if (a.faq) { item.faq = a.faq; contagem.faqAntigo += 1; }

  juntado[id] = item;
}

fs.writeFileSync(
  ATUAL,
  JSON.stringify(
    { geradoEm: new Date().toISOString().slice(0, 10), fonte: 'páginas de venda do WordPress', conteudo: juntado },
    null,
    1,
  ),
  'utf8',
);

console.log(`produtos: ${Object.keys(juntado).length}`);
console.log('');
console.log(`  cronograma atualizado : ${contagem.cronograma}`);
console.log(`  disciplinas atualizadas: ${contagem.detalhes}`);
console.log(`  sobre atualizado      : ${contagem.sobre}`);
console.log(`  sumário atualizado    : ${contagem.sumario}`);
console.log('');
console.log(`  disciplinas recusadas por HTML: ${contagem.detalhesRecusado}  (ficaram com a versão anterior)`);
console.log(`  FAQ mantido da captura antiga : ${contagem.faqAntigo}`);

const sujos = Object.entries(juntado).filter(([, v]) =>
  ['sobre', 'detalhes', 'sumario', 'cronograma'].some((c) => temHtml(v[c])) ||
  (v.faq ?? []).some((f) => temHtml(f.resposta) || temHtml(f.pergunta)),
);
console.log('');
console.log(`  ainda com HTML no resultado final: ${sujos.length}`, sujos.length ? sujos.slice(0, 5).map(([k]) => k).join(', ') : '(nenhum)');
