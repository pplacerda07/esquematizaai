# Catálogo de produtos (banco de dados do ecommerce)

Esta pasta é a **fonte única de verdade** dos produtos do Esquematiza Aí dentro do site.
Foi gerada em **02/07/2026** processando a planilha `Produtos (1).xlsx` (18 abas) da equipe.
O objetivo: as próximas etapas (vitrine, páginas de produto, checkout) só precisam **importar daqui**.

## Arquivos

| Arquivo | O que tem | Veio de (abas da planilha) |
|---|---|---|
| `produtos.json` | **145 produtos únicos** com preços, links de checkout, conteúdo e textos de venda | `assinaturas`, `combo-regular`, `leg-tributaria`, `outros-produtos` + abas antigas (`Combos Regulares`, `Legislação Tributária`, `Produtos Isolados`, `Assinatura`, `outros-produtos (15.12.25)`, aba de conflito) |
| `cupons.json` | 12 cupons de desconto (código, %, público, mensagem do atendimento) | `Cupom` |
| `ofertas-personalizadas.json` | 34 links de checkout por valor (R$ 157 a R$ 1.997), usados pelo comercial para fechar ofertas sob medida | `Ofertas personalizadas` |
| `links-desconto.json` | Escadas de desconto por produto: cada degrau é um checkout Eduzz **com cupom já aplicado** | `link produtos desconto` |
| `sumarios.json` | Conteúdo programático: 37 resumos (3.200 páginas), 81 baralhos de flashcards, 144 módulos por área | `sumario_resumos_regulares`, `sumario_flashcards_regulares`, `modulos_resumos-regulares_por-a` |
| `copy.json` | Frases prontas de oferta + produtos destacados pelo comercial | `copy` |
| `capas.json` | Índice das capas de produto (69 capas em `/public/capas/*.webp`, ~15 KB cada) | pasta `capas_dos_produtos` (raiz do workspace), via `scripts/build-capas.js` |
| `index.ts` | **Importe daqui.** Tipos TypeScript + funções de acesso | (gerado nesta pasta) |
| `PENDENCIAS.md` | Inconsistências da planilha que precisam de decisão humana | (gerado nesta pasta) |

## Como usar no código

```ts
import { produtos, produtosPorCategoria, produtosVendaveis, checkoutPrincipal } from '@/data/catalogo';

const combos = produtosPorCategoria('combo');
const naVitrine = produtosVendaveis(); // ativos e com link de compra
const linkDeCompra = checkoutPrincipal(combos[0]); // https://chk.eduzz.com/...
```

## O modelo de produto (resumo)

- **`categoria`**: `assinatura` (10) · `combo` (34) · `isolado` (96) · `treinamento` (1) · `oferta-personalizada` (4).
- **`area`**: Fiscal, Controle, Policial, Tribunais, Bancária, Legislativo, Geral (mesmas áreas da vitrine).
- **`ferramenta`**: Resumo, Flashcards, `R + F + Q + V` (Resumo+Flashcards+Questões+Vade Mecum), Assinatura, Questões Inéditas, Vademecum.
- **`formato`**: `Regular` (conteúdo permanente) ou `Específico` (para um edital, ex.: SEFAZ-GO).
- **`precos`**: `cheio`, `promocional` (~30% off) e `black` (Black Friday). `null` = a planilha não informa.
- **`checkouts`**: `normal` e `black` (links Eduzz) + `outros` (cupom 20%/30%, upgrades, variantes).
  **Estes links são o coração da venda**: 71 produtos têm pelo menos um.
- **`sobre` / `disciplinas` / `cronograma`**: textos longos prontos para a página de produto.
- **`fontes` / `avisos`**: rastreabilidade: de quais abas/linhas o registro veio e o que estava inconsistente.

## Regras usadas na geração (importante para confiar nos dados)

1. A planilha repete o mesmo produto em várias abas. A união foi feita pelo **ID da Eduzz**
   (e por nome, quando a linha não tem ID).
2. Quando abas discordam de preço ou link, vale o valor **mais frequente entre as abas**
   (votação). Toda divergência fica registrada no campo `avisos` do produto e em `PENDENCIAS.md`.
3. `R$ 0,00` na planilha foi tratado como "preço não definido" (`null`), não como grátis.
4. Célula em que o texto mostra um link mas o clique leva a outro: vale o **texto**;
   a divergência vira aviso.
5. Linhas `[VL]` (oferta paralela) e `[blackfriday]` foram preservadas: viram links em
   `checkouts.outros` ou produtos com `campanha: "blackfriday"`.
6. A aba `Página6_conflict...` (resíduo de conflito de sincronização) só foi usada para
   preencher lacunas, nunca para sobrescrever.
7. Os links da aba antiga "Legislação Tributária" **nunca** ocupam os campos principais de
   checkout (as linhas dela estão desalinhadas); ficam em `checkouts.outros` rotulados como
   "aba antiga", aguardando conferência.

## Como atualizar quando a planilha mudar

O gerador está em `site/scripts/build-catalogo.js`. Passos:

```bash
cd site
npm install --save-dev xlsx   # só na primeira vez
node scripts/build-catalogo.js "C:\caminho\para\Produtos.xlsx"
```

Ele reescreve os `.json` desta pasta e imprime as estatísticas e os conflitos encontrados.

## Capas dos produtos

As capas vivem em `public/capas/<produtoId>.webp` e são geradas por
`node scripts/build-capas.js` a partir da pasta `capas_dos_produtos` (raiz do workspace).
**Atenção:** o mapa produto→arquivo dentro do script foi montado por inspeção visual;
muitos nomes de arquivo da pasta original NÃO correspondem ao conteúdo real (exports de
Canva com nomes trocados). Para dar capa a um produto novo: confira a imagem de olho,
adicione a linha no `MAPA` do script e rode-o de novo. No código, use `capaDe(produto)`
de `@/data/catalogo`; produto sem capa recebe o fallback desenhado da vitrine.
