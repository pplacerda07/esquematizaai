/**
 * Converte os artigos do WordPress antigo para o Markdown do blog novo.
 *
 * O blog novo NAO guarda HTML: guarda Markdown com as diretivas do site
 * (:::importante, :::dica, ::produto{id=...}, :marca[...]). Jogar o HTML cru
 * la dentro faria o texto aparecer literal e perderia as caixas da marca, as
 * ancoras dos titulos, a tabela que rola no celular e o CTA que puxa preco do
 * catalogo ao vivo.
 *
 * Felizmente o HTML antigo e regular e usa as mesmas caixas conceituais, entao
 * o mapa e quase um pra um.
 */
const fs = require('fs');
const { parse } = require('node-html-parser');

const posts = require('./dados/wp-posts.json');
const catalogo = require('../src/data/catalogo/produtos.json');

// ---------------------------------------------------------------- utilidades

const ENTIDADES = {
  '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"',
  '&#039;': "'", '&#39;': "'", '&apos;': "'", '&middot;': '·', '&hellip;': '…',
  '&mdash;': '—', '&ndash;': '–', '&rsquo;': '’', '&lsquo;': '‘',
  '&ldquo;': '“', '&rdquo;': '”', '&aacute;': 'á', '&eacute;': 'é',
  '&iacute;': 'í', '&oacute;': 'ó', '&uacute;': 'ú', '&atilde;': 'ã',
  '&otilde;': 'õ', '&ccedil;': 'ç', '&ecirc;': 'ê', '&acirc;': 'â',
  '&ocirc;': 'ô', '&agrave;': 'à', '&ordm;': 'º', '&ordf;': 'ª',
  '&uarr;': '↑', '&darr;': '↓', '&rarr;': '→', '&larr;': '←', '&times;': '×',
  '&#8593;': '↑', '&#128279;': '🔗', '&#8211;': '–', '&#8212;': '—',
  '&#8216;': '‘', '&#8217;': '’', '&#8220;': '“', '&#8221;': '”',
  '&#8230;': '…', '&#183;': '·',
};

function entidades(t) {
  return t
    .replace(/&#(\d+);/g, (m, n) => (ENTIDADES[m] ?? String.fromCharCode(+n)))
    .replace(/&#x([0-9a-f]+);/gi, (m, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&[a-z]+;/gi, (m) => ENTIDADES[m] ?? m);
}

/** Escapa o que o Markdown leria como marcacao. */
function escapar(t) {
  return t.replace(/([\\`*_[\]])/g, '\\$1');
}

const limpar = (t) => t.replace(/\s+/g, ' ').trim();
const temClasse = (no, c) => (no.classList?.contains?.(c)) ?? false;

// ------------------------------------------------------- catalogo -> produto

/** Mesma normalizacao do preserva-slugs.js: compara endereco, nunca nome. */
function comparavel(link) {
  return String(link || '').trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '').replace(/^www\./i, '').toLowerCase();
}

const PRODUTO_POR_LINK = new Map();
for (const p of catalogo.produtos) {
  const links = [p.urlSite, p.checkouts?.normal, p.checkouts?.black, ...(p.checkouts?.outros ?? [])];
  for (const v of links) {
    if (typeof v === 'string' && v) PRODUTO_POR_LINK.set(comparavel(v), p.id);
  }
}

/**
 * Fallback por nome. Os links de checkout dos artigos sao de campanhas antigas
 * e muitos nao existem mais no catalogo, mas o produto existe: "Combo Resumos +
 * Flashcards Fiscal Regular" esta la, so com outro endereco de checkout.
 */
function normalizarNome(t) {
  return String(t || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const PRODUTO_POR_NOME = new Map();
for (const p of catalogo.produtos) {
  for (const n of [p.nome, ...(p.nomesAlternativos ?? [])]) {
    const k = normalizarNome(n);
    if (k && !PRODUTO_POR_NOME.has(k)) PRODUTO_POR_NOME.set(k, p.id);
  }
}

/**
 * Os CTAs que nao casam nem por link nem por nome, resolvidos a mao.
 *
 * O link de checkout do artigo e de campanha antiga e nao existe mais no
 * catalogo, e o nome mudou de convencao ("Combo LT SEFAZ-AL" virou "Combo
 * Legislacao Tributaria SEFAZ-AL"). Conferi um por um no catalogo: casar por
 * aproximacao aqui seria pior que nao casar, porque CTA no produto errado
 * mostra preco errado na cara do leitor.
 *
 * O "Direito Tributario Decifrado" NAO esta no catalogo com nenhum nome. Os
 * cinco artigos do ISS Guarulhos que o citam ficam com a caixa de convite e o
 * link original, ate o Sergio dizer se o produto saiu de linha ou so falta na
 * planilha.
 */
const CTA_A_MAO = {
  'https://sun.eduzz.com/E05N12OG9X': 'combo-sefaz-al-legislacao-tributaria',
  'https://sun.eduzz.com/Q9N27GVZ01': 'combo-iss-manaus-legislacao-tributaria',
  'https://chk.eduzz.com/R9JX71EY0X': 'combo-legislacao-tributaria-sefaz-ba',
  'https://chk.eduzz.com/mzdpsrk2': 'flashcards-isolado-legislacao-tributaria-sefaz-rs',
  'https://chk.eduzz.com/24e44wuw': 'assinatura-resumos-regular-flashcards-regular',
  'https://chk.eduzz.com/XPGBTHRG': 'combo-legislacao-tributaria-estadual-sefaz-ce',
};

function idDoProduto(href, titulo) {
  const aMao = CTA_A_MAO[href];
  if (aMao) return { id: aMao, como: 'mapa manual' };

  const porLink = PRODUTO_POR_LINK.get(comparavel(href));
  if (porLink) return { id: porLink, como: 'link' };

  // o titulo do CTA as vezes traz um subtitulo depois de ":"
  for (const cand of [titulo, String(titulo || '').split(':')[0]]) {
    const k = normalizarNome(cand);
    if (k && PRODUTO_POR_NOME.has(k)) return { id: PRODUTO_POR_NOME.get(k), como: 'nome' };
  }
  return null;
}

/**
 * Links internos entre artigos apontavam para o WordPress. Quem clicasse saía
 * do site novo no meio da leitura, e no dia em que o site antigo sair do ar
 * viram link quebrado. Passam a apontar para /blog/<slug> daqui.
 */
const SLUGS_IMPORTADOS = new Set(posts.map((p) => p.slug));

function reescreverLinksInternos(md, ctx) {
  return md.replace(/\]\((https?:\/\/(?:www\.)?esquematizaai\.com\/([^)\s]*))\)/g, (todo, url, resto) => {
    const caminho = resto.replace(/[?#].*$/, '').replace(/\/+$/, '');
    // /produto/... continua no WordPress: e o caminho de compra, e o Pedro ja
    // definiu que levar para la e o funcionamento normal do site
    if (caminho.startsWith('produto/')) return todo;
    const slug = caminho.split('/').pop();
    if (slug && SLUGS_IMPORTADOS.has(slug)) {
      ctx.linksReescritos.push(slug);
      return `](/blog/${slug})`;
    }
    return todo;
  });
}

// --------------------------------------------------------------- conversao

const avisos = [];
function avisar(slug, msg) { avisos.push(`${slug}: ${msg}`); }

/** Converte os filhos de um no em Markdown inline (negrito, link, grifo). */
function inline(no, ctx) {
  if (no.nodeType === 3) return escapar(entidades(no.rawText));
  if (no.nodeType !== 1) return '';

  const tag = no.tagName?.toLowerCase();
  const filhos = () => no.childNodes.map((f) => inline(f, ctx)).join('');

  switch (tag) {
    case 'strong': case 'b': {
      const t = filhos().trim();
      return t ? `**${t}**` : '';
    }
    case 'em': case 'i': {
      const t = filhos().trim();
      return t ? `*${t}*` : '';
    }
    case 'mark': {
      const t = filhos().trim();
      return t ? `:marca[${t}]` : '';
    }
    case 'a': {
      const href = entidades(no.getAttribute('href') || '');
      const t = filhos().trim();
      if (!href) return t;
      return `[${t}](${href})`;
    }
    case 'br': return '  \n';
    case 'span': {
      // .mk e o grifo de marca-texto do modelo antigo
      if (temClasse(no, 'mk')) {
        const t = filhos().trim();
        return t ? `:marca[${t}]` : '';
      }
      return filhos();
    }
    case 'code': return '`' + limpar(entidades(no.text)) + '`';
    case 'img': {
      const src = entidades(no.getAttribute('src') || '');
      const alt = entidades(no.getAttribute('alt') || '');
      ctx.imagens.push(src);
      return src ? `![${alt}](${src})` : '';
    }
    default: return filhos();
  }
}

const inlineDe = (no, ctx) => limpar(no.childNodes.map((f) => inline(f, ctx)).join('')).replace(/ +([,.;:!?])/g, '$1');

/** Lista <ul>/<ol> em Markdown, com recuo para as aninhadas. */
function lista(no, ctx, nivel = 0) {
  const ordenada = no.tagName?.toLowerCase() === 'ol';
  const recuo = '  '.repeat(nivel);
  const linhas = [];
  let i = 0;
  for (const li of no.childNodes.filter((f) => f.tagName?.toLowerCase() === 'li')) {
    i += 1;
    const sublistas = li.childNodes.filter((f) => ['ul', 'ol'].includes(f.tagName?.toLowerCase()));
    const proprios = li.childNodes.filter((f) => !['ul', 'ol'].includes(f.tagName?.toLowerCase()));
    const texto = limpar(proprios.map((f) => inline(f, ctx)).join(''));
    linhas.push(`${recuo}${ordenada ? i + '.' : '-'} ${texto}`);
    for (const sub of sublistas) linhas.push(lista(sub, ctx, nivel + 1));
  }
  return linhas.join('\n');
}

/** Tabela GFM. Colunas marcadas com .n saem alinhadas a direita. */
function tabela(tab, ctx, slug) {
  const linhas = tab.querySelectorAll('tr');
  if (!linhas.length) return '';

  const celulasDe = (tr) => tr.childNodes.filter((f) => ['td', 'th'].includes(f.tagName?.toLowerCase()));
  const thead = tab.querySelector('thead');
  const temCabecalho = !!thead && !!thead.querySelector('th');

  let cabecalho;
  let corpo;
  if (temCabecalho) {
    const trCab = thead.querySelector('tr');
    cabecalho = celulasDe(trCab);
    corpo = linhas.filter((tr) => tr !== trCab);
  } else if (celulasDe(linhas[0]).length >= 3) {
    // Tabela larga sem <thead>: a primeira linha E o cabecalho, so foi escrita
    // com <td> no modelo antigo. Descobri isso na tabela de 8 colunas do
    // concurso-sefaz-ba, onde "Area | AC | Negros (30%) | ..." estava virando
    // linha de dados embaixo de um cabecalho vazio.
    cabecalho = celulasDe(linhas[0]);
    corpo = linhas.slice(1);
  } else {
    // Ficha de chave/valor (.quadro). O GFM exige linha de cabecalho, e
    // inventar titulo de assunto seria escrever conteudo que o Sergio nao
    // escreveu; entao rotulo generico e neutro.
    cabecalho = null;
    corpo = linhas;
    ctx.quadrosSemCabecalho += 1;
  }

  const alinhamento = (celulas) => celulas.map((c) => (temClasse(c, 'n') ? '---:' : '---'));

  // Largura da tabela, contando colspan. As linhas de agrupamento do modelo
  // antigo sao um <td colspan="4"> com o nome do grupo; o site novo sabe
  // renderiza-las (o componente Conteudo procura a linha em que so a primeira
  // celula tem texto), mas so se as colunas vazias estiverem escritas. Sem o
  // preenchimento a linha sai com uma celula so e o GFM desalinha a tabela.
  const largura = (celulas) => celulas.reduce((s, c) => s + (parseInt(c.getAttribute('colspan') || '1', 10) || 1), 0);
  const nColunas = Math.max(...linhas.map((tr) => largura(celulasDe(tr))));

  const linhaMd = (celulas) => {
    const textos = [];
    for (const c of celulas) {
      textos.push(inlineDe(c, ctx).replace(/\|/g, '\\|') || ' ');
      const span = (parseInt(c.getAttribute('colspan') || '1', 10) || 1) - 1;
      for (let i = 0; i < span; i += 1) textos.push(' ');
    }
    while (textos.length < nColunas) textos.push(' ');
    return '| ' + textos.slice(0, nColunas).join(' | ') + ' |';
  };

  const saida = [];
  if (cabecalho) {
    saida.push(linhaMd(cabecalho));
    saida.push('| ' + alinhamento(cabecalho).join(' | ') + ' |');
  } else {
    const nCols = celulasDe(corpo[0]).length;
    saida.push('| ' + (nCols === 2 ? 'Informação | Detalhe' : Array(nCols).fill(' ').join(' | ')) + ' |');
    saida.push('| ' + Array(nCols).fill('---').join(' | ') + ' |');
  }
  for (const tr of corpo) {
    const c = celulasDe(tr);
    if (c.length) saida.push(linhaMd(c));
  }
  return saida.join('\n');
}

/** Caixa :::nome[rotulo] ... ::: */
function caixa(nome, rotulo, corpo) {
  const dentro = corpo.trim();
  if (!dentro) return '';
  const abre = rotulo ? `:::${nome}[${rotulo}]` : `:::${nome}`;
  return `${abre}\n${dentro}\n:::`;
}

/** O CTA de produto do modelo antigo vira ::produto{id=...} do site novo. */
function cta(no, ctx, slug) {
  const botao = no.querySelector('.btn') || no.querySelector('a');
  const href = botao ? entidades(botao.getAttribute('href') || '') : '';
  const titulo = limpar(entidades(no.querySelector('.ctitle')?.text || ''));
  const achado = idDoProduto(href, titulo);

  if (achado) {
    ctx.produtosCasados.push(`${titulo || '(sem titulo)'} -> ${achado.id} (por ${achado.como})`);
    return `::produto{id=${achado.id}}`;
  }

  // Sem casar com o catalogo, preservo o convite como texto e link em vez de
  // inventar um id que quebraria o bloco.
  ctx.produtosSemCasar.push({ titulo, href });
  avisar(slug, `CTA sem produto no catalogo: "${titulo}" (${href || 'sem link'})`);
  const desc = no.querySelectorAll('p').map((p) => inlineDe(p, ctx)).filter(Boolean).join('\n\n');
  const itens = no.querySelector('.cta-list');
  const partes = [titulo ? `**${titulo}**` : '', desc, itens ? lista(itens, ctx) : ''].filter(Boolean);
  if (href) partes.push(`[Ver o material](${href})`);
  return caixa('dica', limpar(entidades(no.querySelector('.tag')?.text || '')) || 'Material recomendado', partes.join('\n\n'));
}

/** Converte um no de bloco. Devolve '' para o que deve sumir. */
function bloco(no, ctx, slug) {
  if (no.nodeType === 3) {
    const t = limpar(entidades(no.rawText));
    return t ? escapar(t) : '';
  }
  if (no.nodeType !== 1) return '';

  const tag = no.tagName.toLowerCase();

  // --- o que nao vai para o corpo -----------------------------------------
  if (tag === 'style' || tag === 'script') return '';
  if (temClasse(no, 'eqz-kicker')) return '';          // sobrenome do titulo, ja e a categoria
  if (temClasse(no, 'eqz-byline')) return '';          // autor e data vem das colunas do banco
  if (temClasse(no, 'eqz-avatar')) return '';
  if (temClasse(no, 'eqz-toc')) return '';             // o site novo gera o indice sozinho
  if (temClasse(no, 'voltar')) return '';              // "Voltar ao indice", idem
  if (temClasse(no, 'lede')) return '';                // vira o campo resumo
  if (tag === 'h1') return '';                         // vira o campo titulo
  if (tag === 'hr' || temClasse(no, 'sep')) return '---';

  // --- caixas da marca ------------------------------------------------------
  const ROTULO = (n) => {
    const r = n.querySelector('.rot') || n.querySelector('.ref');
    return r ? limpar(entidades(r.text)) : '';
  };
  const SEM_ROTULO = (n) => n.childNodes.filter((f) => !(f.nodeType === 1 && (temClasse(f, 'rot') || temClasse(f, 'ref'))));

  /**
   * Dentro das caixas o modelo antigo escreve texto solto, sem <p>: o negrito e
   * o link sao irmaos do texto. Tratar cada filho como bloco separado quebrava
   * a frase em varios paragrafos ("Isso e o que o" / "Combo Resumos..." /
   * "cobre disciplina por disciplina"). Aqui os pedacos de texto corrido se
   * juntam num paragrafo so, e so o que e bloco de verdade se separa.
   */
  const EH_INLINE = new Set(['a', 'strong', 'b', 'em', 'i', 'span', 'mark', 'code', 'br', 'sup', 'sub', 'small']);
  const corpoDe = (n) => {
    const partes = [];
    let corrido = [];
    const fecharCorrido = () => {
      if (!corrido.length) return;
      const t = limpar(corrido.join('')).replace(/ +([,.;:!?)])/g, '$1').replace(/\( +/g, '(');
      if (t) partes.push(t);
      corrido = [];
    };
    for (const f of SEM_ROTULO(n)) {
      const tagF = f.nodeType === 1 ? f.tagName.toLowerCase() : null;
      if (f.nodeType === 3 || (tagF && EH_INLINE.has(tagF))) {
        corrido.push(inline(f, ctx));
      } else {
        fecharCorrido();
        const b = bloco(f, ctx, slug);
        if (b) partes.push(b);
      }
    }
    fecharCorrido();
    return partes.join('\n\n');
  };

  if (temClasse(no, 'importante')) return caixa('importante', ROTULO(no), corpoDe(no));
  if (temClasse(no, 'dica')) return caixa('dica', ROTULO(no), corpoDe(no));
  if (temClasse(no, 'fontes')) return caixa('fontes', ROTULO(no), corpoDe(no));
  if (temClasse(no, 'leia')) return caixa('aprofunde', ROTULO(no), corpoDe(no));
  if (temClasse(no, 'lei')) return caixa('importante', ROTULO(no) || 'Na lei', corpoDe(no));

  if (temClasse(no, 'sintese')) {
    // os <span class="star"> sao itens de lista, nao texto corrido
    const estrelas = no.querySelectorAll('.star');
    if (estrelas.length) {
      const itens = estrelas.map((e) => `- ${inlineDe(e, ctx)}`).join('\n');
      const resto = no.childNodes
        .filter((f) => f.nodeType === 1 && !temClasse(f, 'rot') && !temClasse(f, 'star'))
        .map((f) => bloco(f, ctx, slug)).filter(Boolean).join('\n\n');
      return caixa('sintese', ROTULO(no), [itens, resto].filter(Boolean).join('\n\n'));
    }
    return caixa('sintese', ROTULO(no), corpoDe(no));
  }

  if (temClasse(no, 'cta')) return cta(no, ctx, slug);

  // --- estrutura ------------------------------------------------------------
  if (tag === 'table') return tabela(no, ctx, slug);
  if (temClasse(no, 'tab') || temClasse(no, 'quadro')) {
    const t = no.querySelector('table');
    return t ? tabela(t, ctx, slug) : corpoDe(no);
  }

  if (tag === 'h2') return `## ${inlineDe(no, ctx)}`;
  if (tag === 'h3') return `### ${inlineDe(no, ctx)}`;
  if (tag === 'h4') return `#### ${inlineDe(no, ctx)}`;
  if (tag === 'ul' || tag === 'ol') return lista(no, ctx);
  if (tag === 'blockquote') {
    return no.childNodes.map((f) => bloco(f, ctx, slug)).filter(Boolean).join('\n\n')
      .split('\n').map((l) => `> ${l}`).join('\n');
  }
  if (tag === 'p') {
    const t = inlineDe(no, ctx);
    return t || '';
  }
  if (tag === 'img') return inlineDe(no.parentNode ?? no, ctx);

  // div/section/nav/figure e afins: desce nos filhos
  return no.childNodes.map((f) => bloco(f, ctx, slug)).filter(Boolean).join('\n\n');
}

// ---------------------------------------------------------------- categorias

/**
 * No WordPress so existem duas categorias, "Blog" e "Depoimentos", e "Blog" nao
 * diz nada a quem esta filtrando a listagem. O blog novo ja usa categoria de
 * assunto ("Area Fiscal", "Estrategia", "Guias", "Dicas"), entao classifico por
 * assunto aqui.
 *
 * Escrito slug a slug de proposito, e nao por regex: sao 38 linhas que o Sergio
 * consegue ler e discordar de qualquer uma no painel, em vez de uma regra
 * esperta que erra em silencio.
 */
const CATEGORIA = {
  // notícia de concurso específico
  'concurso-iss-aracati': 'Concursos',
  'concurso-sefaz-al': 'Concursos',
  'concurso-sefaz-sc': 'Concursos',
  'concurso-iss-manaus': 'Concursos',
  'concurso-iss-curitiba': 'Concursos',
  'concurso-sefaz-ba': 'Concursos',
  'concurso-sefaz-rs': 'Concursos',
  'concurso-sefaz-to-200-vagas-auditor-fiscal': 'Concursos',
  'concurso-receita-federal-2026': 'Concursos',
  'concurso-iss-guarulhos': 'Concursos',
  'concurso-sefaz-ce': 'Concursos',
  'concurso-sefaz-df': 'Concursos',

  // panorama e guias de área
  'concursos-fiscais-2026-panorama-vagas-estaduais-federais-municipais': 'Área Fiscal',
  'concurso-area-fiscal': 'Guias',
  'concurso-area-policial': 'Guias',
  'concurso-area-controle-gestao': 'Guias',
  'concurso-area-tribunais': 'Guias',
  'assinatura-resumos-flashcards-concursos': 'Guias',

  // legislação e reforma tributária
  'reforma-tributaria-2026-transicao': 'Legislação Tributária',
  'reforma-tributaria-concursos-ibs-cbs-imposto-seletivo': 'Legislação Tributária',
  'reforma-tributaria-concursos': 'Legislação Tributária',
  'como-estudar-legislacao-tributaria-estadual': 'Legislação Tributária',
  'legislacao-administracao-tributaria-iss-guarulhos-ibam': 'Legislação Tributária',
  'tributo-especies-competencia-iss-guarulhos-ibam': 'Legislação Tributária',
  'obrigacao-tributaria-iss-guarulhos-ibam': 'Legislação Tributária',
  'credito-tributario-iss-guarulhos-ibam': 'Legislação Tributária',
  'direito-tributario-iss-guarulhos-banca-ibam': 'Legislação Tributária',

  // método de estudo
  'recordacao-ativa-revisao-espacada': 'Dicas',
  'revisao-espacada-concursos-flashcards': 'Dicas',
};

function categoriaDe(post, categoriaWp) {
  if (categoriaWp.includes('Depoimentos')) return 'Depoimentos';
  return CATEGORIA[post.slug] ?? 'Blog';
}

// ------------------------------------------------------------------ por post

function converter(post) {
  const slug = post.slug;
  const ctx = { imagens: [], produtosCasados: [], produtosSemCasar: [], quadrosSemCabecalho: 0, linksReescritos: [] };

  const bruto = post.content.rendered;
  const raiz = parse(bruto, { blockTextElements: { script: true, style: true } });

  // resumo = o paragrafo de abertura (.lede)
  const lede = raiz.querySelector('.lede');
  let resumo = lede ? limpar(entidades(lede.text)) : '';

  // o artigo mora dentro de .eqz-art; fora disso e casca do Elementor
  const corpo = raiz.querySelector('.eqz-art') || raiz;
  let markdown = corpo.childNodes
    .map((f) => bloco(f, ctx, slug))
    .filter((t) => t && t.trim())
    .join('\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  markdown = reescreverLinksInternos(markdown, ctx);

  // Quando a frase ja terminava em dois-pontos, o grifo colava nela e virava
  // "::marca[". Dois-pontos duplo e a sintaxe de bloco, nao a de grifo, entao o
  // parser desistia e imprimia ":marca[25 questoes]" literal no meio do artigo.
  // Aconteceu em concurso-sefaz-ba e concurso-sefaz-to. Um espaco resolve, e ele
  // reproduz o espaco que existia no HTML original.
  markdown = markdown.replace(/:(?=:marca\[)/g, ': ');

  // Dez artigos (os nove depoimentos e um do ISS Guarulhos) nao tem .lede.
  // Uso o primeiro paragrafo de texto corrido como resumo em vez de deixar o
  // campo vazio: a listagem do blog mostra o resumo embaixo do titulo, e sem
  // ele o cartao fica so com o titulo solto.
  if (!resumo) {
    const primeiro = markdown
      .split('\n\n')
      .find((b) => b.trim() && !/^[#|:>\-!]/.test(b.trim()) && b.length > 60);
    if (primeiro) {
      resumo = limpar(primeiro.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[*_`\\]/g, ''));
      if (resumo.length > 300) resumo = resumo.slice(0, 297).replace(/\s+\S*$/, '') + '…';
      ctx.resumoDeReserva = true;
    }
  }

  // FAQ em JSON-LD, para nao perder o dado estruturado de SEO
  const faq = [];
  for (const s of raiz.querySelectorAll('script')) {
    const t = s.text.trim();
    if (!t.startsWith('{')) continue;
    try {
      const j = JSON.parse(t);
      if (j['@type'] === 'FAQPage' && Array.isArray(j.mainEntity)) {
        for (const q of j.mainEntity) {
          faq.push({ pergunta: q.name, resposta: q.acceptedAnswer?.text ?? '' });
        }
      }
    } catch { avisar(slug, 'JSON-LD nao pode ser lido'); }
  }

  const capa = post._embedded?.['wp:featuredmedia']?.[0];
  const categoriaWp = (post._embedded?.['wp:term']?.[0] ?? []).map((t) => t.name);

  return {
    slug,
    titulo: entidades(post.title.rendered).replace(/<[^>]+>/g, ''),
    resumo,
    conteudo: markdown,
    categoria_wp: categoriaWp.join('/'),
    categoria: categoriaDe(post, categoriaWp),
    autor: 'Prof. Sérgio Furtado',
    publicado_em: post.date_gmt + 'Z',
    atualizado_em: post.modified_gmt + 'Z',
    capa_origem: capa?.source_url ?? null,
    capa_alt: capa?.alt_text ?? '',
    faq,
    link_antigo: post.link,
    _ctx: ctx,
  };
}

// ------------------------------------------------------------------- execucao

const convertidos = posts.map(converter);
fs.writeFileSync(require('path').join(__dirname,'dados','artigos-convertidos.json'), JSON.stringify(convertidos, null, 2), 'utf8');

const somaC = convertidos.reduce((a, c) => a + c._ctx.produtosCasados.length, 0);
const somaS = convertidos.reduce((a, c) => a + c._ctx.produtosSemCasar.length, 0);

console.log('artigos convertidos :', convertidos.length);
console.log('sem resumo (.lede)  :', convertidos.filter((c) => !c.resumo).length);
console.log('sem conteudo        :', convertidos.filter((c) => c.conteudo.length < 200).length);
console.log('com capa            :', convertidos.filter((c) => c.capa_origem).length);
console.log('com FAQ estruturado :', convertidos.filter((c) => c.faq.length).length, '(' + convertidos.reduce((a, c) => a + c.faq.length, 0) + ' perguntas)');
console.log('CTA casado c/ catalogo:', somaC, '| sem casar:', somaS);
console.log('imagens no corpo    :', convertidos.reduce((a, c) => a + c._ctx.imagens.length, 0));
console.log('links internos p/ o blog novo:', convertidos.reduce((a, c) => a + c._ctx.linksReescritos.length, 0));
console.log('resumo de reserva   :', convertidos.filter((c) => c._ctx.resumoDeReserva).length);
console.log('tabelas sem cabecalho:', convertidos.reduce((a, c) => a + c._ctx.quadrosSemCabecalho, 0));
console.log('');
console.log('tamanho markdown: min', Math.min(...convertidos.map((c) => c.conteudo.length)),
  '| max', Math.max(...convertidos.map((c) => c.conteudo.length)));
console.log('');
if (avisos.length) {
  console.log('=== avisos (' + avisos.length + ') ===');
  avisos.slice(0, 25).forEach((a) => console.log('  ' + a));
  if (avisos.length > 25) console.log('  ... e mais ' + (avisos.length - 25));
}
