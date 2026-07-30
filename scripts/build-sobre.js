/**
 * Puxa a descrição rica ("Sobre o produto") das páginas de venda do WordPress
 * e converte para o Markdown que a página do produto renderiza.
 *
 * Uso:  node scripts/build-sobre.js [--teste]
 *       --teste  processa só 3 produtos e imprime o resultado, sem gravar
 *
 * POR QUE BUSCAR EM VEZ DE PEDIR NUMA PLANILHA:
 * o catálogo já tem a URL da página de venda dos 107 produtos (`urlSite`), e a
 * descrição está sempre no mesmo lugar do HTML. Copiar isso à mão para uma
 * planilha seria 107 vezes o mesmo trabalho, com chance de erro em cada uma.
 *
 * POR QUE CONVERTER EM VEZ DE COPIAR O HTML:
 * o texto do WordPress traz cor fixa no meio da frase (style="color: #FF7345").
 * Carregar isso para cá amarraria o texto ao tema antigo e encheria a página de
 * cor solta, que é justamente o que o cliente reclamou no blog. Aqui a marcação
 * diz o QUE é destaque; quem decide a cor é o CSS do site.
 */
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'src', 'data', 'catalogo');
const SAIDA = path.join(DIR, 'sobre.json');
const SO_TESTE = process.argv.includes('--teste');

const produtos = require(path.join(DIR, 'produtos.json')).produtos;

const decodar = (s) =>
  s
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&#8217;|&#8216;/g, "'")
    .replace(/&#8211;|&#8212;/g, ', ') // o cliente não usa travessão
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));

/** Recorta o bloco de descrição que vem logo depois do título "Sobre o produto". */
function extrairBloco(html) {
  const marca = html.indexOf('Sobre o produto');
  if (marca === -1) return null;

  // o texto "Sobre o produto" já está DENTRO do container do título, então o
  // próximo container que aparece é o da descrição
  const chave = 'elementor-widget-container';
  const i = html.indexOf(chave, marca);
  if (i === -1) return null;

  const ini = html.indexOf('>', i) + 1;
  // fecha no próximo bloco do Elementor, seja widget, coluna ou seção:
  // páginas diferentes usam nomes diferentes, e prender num só deixava
  // vazar markup do tema para dentro da descrição
  const limites = ['elementor-element', 'elementor-column', 'elementor-section', 'elementor-widget']
    .map((c) => html.indexOf(c, ini))
    .filter((x) => x > ini);
  const fim = limites.length ? Math.min(...limites) : ini + 8000;
  // volta até o início da tag que abre esse bloco, para não cortar no meio
  const abre = html.lastIndexOf('<', fim);
  return html.slice(ini, abre > ini ? abre : fim);
}

/** HTML do WordPress -> Markdown com a marcação que o site já entende. */
function paraMarkdown(bloco) {
  let t = bloco;

  // links viram markdown antes de qualquer limpeza de tag
  t = t.replace(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, txt) => {
    const limpo = txt.replace(/<[^>]+>/g, '').trim();
    return `[${limpo}](${href})`;
  });

  // negrito e sublinhado viram ênfase; a COR fica por conta do CSS do site
  t = t.replace(/<\/?(b|strong)[^>]*>/gi, '**');
  t = t.replace(/<\/?u[^>]*>/gi, '**');
  t = t.replace(/<\/?(em|i)[^>]*>/gi, '*');

  // quebras
  t = t.replace(/<br\s*\/?>/gi, '\n');
  t = t.replace(/<\/p>/gi, '\n\n');
  t = t.replace(/<[^>]+>/g, ''); // resto das tags fora

  t = decodar(t);

  // Nem toda página põe <br> antes do marcador; sem isto o "▸ mais leve"
  // gruda no fim da frase anterior e a lista some.
  // Alternação e não classe de caracteres: ⭐️ e ⚙️ terminam em seletor de
  // variação (U+FE0F), e dentro de [] o seletor virava um caractere solto,
  // partindo o emoji em duas linhas.
  t = t.replace(/\s*(➥|➞|→|▸|▹|⭐️?|💡|📖|⚙️?)/gu, '\n$1');

  const linhas = t.split('\n').map((l) => l.trim());
  const saida = [];
  let dentroDeDica = false;

  for (const linha of linhas) {
    if (!linha) {
      if (dentroDeDica) { saida.push(':::'); dentroDeDica = false; }
      saida.push('');
      continue;
    }

    // 💡 vira caixa de destaque
    if (/^💡/.test(linha)) {
      if (!dentroDeDica) { saida.push(''); saida.push(':::destaque'); dentroDeDica = true; }
      saida.push(linha.replace(/^💡\s*/, ''));
      continue;
    }
    if (dentroDeDica) { saida.push(':::'); dentroDeDica = false; saida.push(''); }

    // ➥ e ⭐ viram item de lista; ▸ vira subitem
    if (/^[➥➞→]/.test(linha)) { saida.push('- ' + linha.replace(/^[➥➞→]\s*/, '')); continue; }
    if (/^⭐/.test(linha)) { saida.push('- ' + linha.replace(/^⭐️?\s*/, '')); continue; }
    if (/^[▸▹]/.test(linha)) { saida.push('  - ' + linha.replace(/^[▸▹]\s*/, '')); continue; }
    if (/^[↓⬇]/.test(linha)) continue; // "adicione outros produtos" é da loja antiga

    saida.push(linha);
  }
  if (dentroDeDica) saida.push(':::');

  return saida
    .map(equilibrarNegrito)
    .map(limparNegrito)
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Ajeita os marcadores de negrito de UMA linha.
 *
 * Dois defeitos vindos do editor do WordPress:
 *  - "****": par de <b></b> vazio, que sairia literal na tela;
 *  - "** TEXTO**": espaço encostado por dentro do marcador, que impede o
 *    Markdown de grifar e também sairia literal.
 *
 * Roda em laço porque limpar um caso costuma revelar o outro. Só linha, nunca
 * o texto inteiro: atravessar quebra de linha fazia o negrito engolir o "- "
 * do item de lista.
 */
function limparNegrito(linha) {
  const partes = linha.split('**');
  if (partes.length < 3) return linha;

  // partes alternam fora/dentro/fora/dentro...; equilibrarNegrito já garantiu
  // número par de marcadores, então os índices ímpares são o miolo de cada par
  let saida = partes[0];
  for (let i = 1; i < partes.length; i += 2) {
    const dentro = partes[i] ?? '';
    const depois = partes[i + 1] ?? '';

    if (!dentro.trim()) {
      // par vazio (<b></b> do editor): some com os marcadores e mantém o espaço
      saida += dentro + depois;
      continue;
    }

    // espaço encostado por dentro sai para fora, senão o Markdown não grifa
    const esquerda = dentro.match(/^[ \t]*/)[0];
    const direita = dentro.match(/[ \t]*$/)[0];
    saida += `${esquerda}**${dentro.trim()}**${direita}${depois}`;
  }
  return saida;
}

/**
 * No WordPress o <b> às vezes atravessa vários <br>, e ao virar linha separada
 * cada pedaço fica com um ** sobrando. Marcador ímpar faz o Markdown grifar o
 * texto errado, então o solitário é removido.
 */
function equilibrarNegrito(linha) {
  const marcas = (linha.match(/\*\*/g) || []).length;
  if (marcas % 2 === 0) return linha;
  // tira o último marcador, que é o órfão
  const ultimo = linha.lastIndexOf('**');
  return linha.slice(0, ultimo) + linha.slice(ultimo + 2);
}

(async () => {
  const alvo = produtos.filter((p) => p.urlSite);
  const lista = SO_TESTE ? alvo.slice(0, 3) : alvo;
  const sobre = {};
  const falhas = [];

  for (const [n, p] of lista.entries()) {
    try {
      const res = await fetch(p.urlSite, { headers: { 'User-Agent': 'EsquematizaBuild/1.0' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const bloco = extrairBloco(await res.text());
      if (!bloco) throw new Error('bloco "Sobre o produto" não encontrado');

      const md = paraMarkdown(bloco);
      if (md.length < 60) throw new Error(`descrição curta demais (${md.length} chars)`);

      sobre[p.id] = md;
      if (SO_TESTE) {
        console.log('\n===========================', p.nome, '===========================');
        console.log(md);
      } else if ((n + 1) % 20 === 0) {
        console.log(`  ${n + 1}/${lista.length}...`);
      }
    } catch (e) {
      falhas.push({ id: p.id, nome: p.nome, motivo: e.message });
    }
    await new Promise((r) => setTimeout(r, 120)); // gentil com o servidor do cliente
  }

  if (SO_TESTE) {
    console.log(`\nteste: ${Object.keys(sobre).length} ok, ${falhas.length} falhas`);
    falhas.forEach((f) => console.log('  FALHOU', f.nome, '|', f.motivo));
    return;
  }

  fs.writeFileSync(
    SAIDA,
    JSON.stringify({ geradoEm: new Date().toISOString().slice(0, 10), fonte: 'páginas de venda do WordPress', sobre }, null, 1),
    'utf8',
  );

  const tamanhos = Object.values(sobre).map((s) => s.length).sort((a, b) => a - b);
  console.log(`\ndescrições capturadas: ${Object.keys(sobre).length}/${lista.length}`);
  console.log(`tamanho min/mediana/max: ${tamanhos[0]} / ${tamanhos[Math.floor(tamanhos.length / 2)]} / ${tamanhos[tamanhos.length - 1]} caracteres`);
  console.log(`índice: ${SAIDA}`);
  if (falhas.length) {
    console.log(`\nsem descrição (${falhas.length}) - seguem com o texto curto da planilha:`);
    falhas.forEach((f) => console.log('  ', f.nome.slice(0, 52), '|', f.motivo));
  }
})();
