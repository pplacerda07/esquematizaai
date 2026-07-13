/**
 * Gera as capas otimizadas dos produtos (WebP) e o índice capas.json.
 *
 * Fonte:  capas_dos_produtos/ESQUEATIA AI (raiz do workspace)
 * Saída:  public/capas/<produtoId>.webp  +  src/data/catalogo/capas.json
 *
 * Uso:  node scripts/build-capas.js
 *
 * O MAPA abaixo foi montado por INSPEÇÃO VISUAL de todas as imagens
 * (muitos nomes de arquivo não correspondem ao conteúdo real — não confiar neles).
 */
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const SRC = path.join(__dirname, '..', '..', 'capas_dos_produtos', 'ESQUEATIA AI');
const OUT_IMG = path.join(__dirname, '..', 'public', 'capas');
const OUT_JSON = path.join(__dirname, '..', 'src', 'data', 'catalogo', 'capas.json');

// produtoId (slug do catálogo) -> arquivo de origem (nome exato)
const MAPA = {
  // combos Resumo+Flashcards por área (família verde)
  'combo-resumos-flashcards-controle-regular': 'MOCK-GESTAO-E-CONTROLE.png',
  'combo-resumos-flashcards-tribunal-regular': 'mockup_super-combo-3.png',
  'combo-resumos-flashcards-policial-regular': 'mockup_super-combo-4.png',

  // combos de resumos por área
  'combo-resumo-fiscal-regular': 'mockup_resumo-reg-fiscal_2.0 (1).png',
  'combo-resumo-gestao-e-controle-regular': 'mockup_controle-2.0 (1).png',
  'combo-resumo-tribunais-regular': 'mockup-site-reduzido_combo-resumos-tribunais-1.png',
  'combo-resumos-policial-regular': 'mockup-site_combo-resumos-policial.png',

  // combos de flashcards por área
  'combo-flashcards-policial-regular': 'mockup-combo-poa-1 (1).png',

  // Câmara dos Deputados
  'combo-flashcards-reta-final-camara-dos-deputados': 'mockup-site_combo-reta-final_flashcards-cd.png',
  'combo-regimento-interno-regimento-comum-e-codigo-de-etica-camara-dos-deputados': 'Capas-em-PDF-1080-x-1440-px-9-pdf.jpg',
  'combo-flashcards-camara-dos-deputados': 'mockup-site_combo-regimentos-cd.png',
  'combo-flashcards-regimentos-camara-dos-deputados': 'mockup-site_combo-regimentos-cd-1.png',

  // Reforma Tributária
  'combo-reforma-tributaria-resumo-flashcards-vade-mecum-questoes-ineditas-literais': 'combo-mockup-reforma (1).png',
  'flashcards-reforma-tributaria': 'capa-cards-reforma (1).png',
  'resumo-isolada-reforma-tributaria': 'mockup_resumo-reforma-tributaria.png',

  // Pacote Legislação Tributária (7 SEFAZ)
  'pacote-resumos-e-flashcards-legislacao-tributaria': 'Capas-em-PDF-1080-x-1440-px-3.png',

  // SEFAZ combos
  'combo-legislacao-tributaria-estadual-sefaz-go-pos-edital': 'MOCKUP-GO (1).png',
  'combo-legislacao-tributaria-estadual-sefaz-sp-pre-pos-edital': 'capa-wordpress_combo-lte-sp.png',
  'combo-de-legislacao-tributaria-estadual-sefaz-rn-pre-pos-edital': 'combo_sefaz-rn_vertical-1.png',

  // SEFAZ isolados (V = vendáveis hoje)
  'flashcards-isolado-legislacao-tributaria-sefaz-sp': 'Capas-em-PDF-1080-x-1440-px.png',
  'resumo-isolado-legislacao-tributaria-sefaz-sp': 'capa-wordpress_resumo-lte-sp.png',
  'flashcards-isolado-legislacao-tributaria-sefaz-al': 'Capas-em-PDF-1080-x-1440-px-4-pdf.jpg',
  'resumo-isolado-legislacao-tributaria-sefaz-al': 'Capas-em-PDF-1080-x-1440-px-5-pdf.jpg',
  'flashcards-isolado-legislacao-tributaria-sefaz-ba': 'Capas-em-PDF-1080-x-1440-px-3-pdf.jpg',
  'resumo-isolado-legislacao-tributaria-sefaz-ba': 'Capas-em-PDF-1080-x-1440-px-2-pdf.jpg',
  'flashcards-isolado-legislacao-tributaria-sefaz-mt': 'Capas-em-PDF-1080-x-1440-px-2.png',
  'flashcards-isolado-legislacao-tributaria-sefaz-rn': 'mock-up_resumo_sefaz-rn-1.png',
  'resumo-isolado-legislacao-tributaria-sefaz-rn': 'resumo_sefaz-rn_vertical.png',
  'flashcards-isolado-legislacao-tributaria-sefaz-go': 'Capas-em-PDF-16-pdf.jpg',
  'resumo-isolado-legislacao-tributaria-sefaz-go': 'Capas-em-PDF-13-pdf.jpg',
  'combo-flashcards-tj-sp-pos-edital': 'Capas-em-PDF-20-pdf.jpg',

  // SEFAZ não vendáveis ainda (capa pronta para quando ganharem checkout)
  'vade-mecum-legislacao-tributaria-sefaz-go-pos-edital': 'Capas-em-PDF-15-2-pdf.jpg',
  'questoes-ineditas-legislacao-tributaria-sefaz-go-pos-edital': 'Capas-em-PDF-26-pdf.jpg',
  'flashcards-legislacao-tributaria-sefaz-pi-pos-edital': 'RJ-Q (4).png',
  'resumo-legislacao-tributaria-sefaz-pi-pos-edital': 'RJ-Q-4-1 (1).png',
  'combo-legislacao-tributaria-estadual-sefaz-ce': 'Capas-em-PDF-1080-x-1440-px-13-pdf.jpg',

  // isolados regulares: resumos
  'resumo-administracao-geral': 'resumo-adm-geral.png',
  'resumo-auditoria-fiscal-eletronica': 'resumo-auditoria-fiscal-eletronica.png',
  'resumo-isolada-legislacao-tributaria-estadual-geral': 'RJ-Q-9 (1).png',
  'resumo-de-economia': 'mockup_super-combo-1 (1).png',
  'resumo-de-lei-de-responsabilidade-fiscal-lrf': 'LC-101-1-1 (1).png',
  'resumo-de-licitacoes-e-contratos-lei-14-133-2021': 'mockup_super-combo-2 (1)(1).png',
  'resumo-isolada-contabilidade-publica-casp': 'mockup-casp.png',
  'resumo-isolada-direito-administrativo': 'RJ-Q-1-4.png',
  'resumo-isolada-direito-constitucional': 'RJ-Q-8.png',
  'resumo-isolada-estatistica': 'RJ-Q-7 (1).png',
  'resumo-isolada-matematica-financeira': 'RJ-Q-1-3.png',
  'resumo-isoladas-direito-penal': 'MOCKUP-PENAL.png',
  'resumo-isoladas-lingua-portuguesa': 'Capas-em-PDF-24-pdf.jpg',
  'resumo-isolada-auditoria-governamental': 'Mockup-resumo-audgov (1).png',
  'resumo-isoladas-administracao-financeira-e-orcamentaria-afo': 'MOCKUP-AFO.png',

  // isolados regulares: flashcards
  'flashcards-economia-micro-macro-e-financas-publicas': 'mock-economia.png',
  'flashcards-economia-e-financas-publicas': 'MOCKUP-ECO-E-FINPU.png',
  'flashcards-isoladas-auditoria-governamental': 'Capas-em-PDF-18-pdf.jpg',
  'flashcards-isolada-direitos-humanos': 'N-MOCK-5.png',
  'flashcards-isoladas-contabilidade-publica-casp': 'RJ-Q-2-13.png',
  'flashcards-isoladas-administracao-publica': 'RJ-Q-2-14.png',
  'flashcards-isoladas-informatica': 'RJ-Q-2-15.png',
  'flashcards-isoladas-raciocinio-logico': 'RJ-Q-2-10 (1).png',
  'flashcards-isoladas-matematica-financeira': 'RJ-Q-2-11 (1).png',
  'flashcards-isoladas-portugues': 'RJ-Q-2-12 (1).png',
  'flashcards-adm-financeira-e-orcamentaria-afo': 'RJ-Q-2-8.png',
  'flashcards-isoladas-financas-publicas': 'RJ-Q-2-9.png',
  'flashcards-isolada-simples-nacional': 'RJ-Q-3 (3)(1).png',
  'flashcards-isoladas-legislacao-tributaria-estadual-geral': 'RJ-Q-2-6 (1).png',
  'flashcards-isoladas-legislacao-tributaria-municipal-geral': 'RJ-Q-2-7.png',
  'flashcards-isoladas-banco-de-dados-relacional-ti': 'RJ-Q-2-4 (3)(1).png',
  'flashcards-tecnologia-da-informacao': 'RJ-Q-2-16.png',

  // Super Combo (aguardando checkout)
  'super-combo-resumo-flashcards-regular': 'mockup_super-combo (2).png',
};

const ALTURA = 640; // ~2x a altura exibida no card
const QUALIDADE = 80;

(async () => {
  fs.mkdirSync(OUT_IMG, { recursive: true });
  const indice = {};
  let total = 0, falhas = 0, bytes = 0;

  for (const [id, arquivo] of Object.entries(MAPA)) {
    const origem = path.join(SRC, arquivo);
    const destino = path.join(OUT_IMG, `${id}.webp`);
    try {
      const info = await sharp(origem)
        .flatten({ background: '#ffffff' })
        .resize({ height: ALTURA, withoutEnlargement: true })
        .webp({ quality: QUALIDADE })
        .toFile(destino);
      indice[id] = { src: `/capas/${id}.webp`, width: info.width, height: info.height };
      bytes += info.size;
      total++;
    } catch (e) {
      falhas++;
      console.error(`FALHA ${id} <- ${arquivo}: ${e.message.slice(0, 80)}`);
    }
  }

  fs.writeFileSync(
    OUT_JSON,
    JSON.stringify({ geradoEm: new Date().toISOString().slice(0, 10), capas: indice }, null, 1),
    'utf8'
  );
  console.log(`capas geradas: ${total} | falhas: ${falhas} | peso total: ${Math.round(bytes / 1024)} KB | média: ${Math.round(bytes / 1024 / Math.max(total, 1))} KB`);
  console.log('índice:', OUT_JSON);
})();
