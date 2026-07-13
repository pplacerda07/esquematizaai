# Pendências do catálogo (para o time revisar)

A planilha tem inconsistências reais. O gerador resolveu cada uma com uma regra clara
(ver README.md), mas as decisões abaixo são de negócio e merecem confirmação humana.
Todo produto afetado carrega o detalhe no campo `avisos` do `produtos.json`.

## 1. Produtos sem link de checkout (74 de 145)

A maior lacuna. Dois grupos:

- **Isolados regulares** (a grande maioria): resumos e flashcards de disciplina única,
  com preço na planilha antiga (R$ 47 a R$ 127) mas **sem checkout**. Hoje eles não são
  compráveis avulsos. A própria aba `Tarefa` da planilha diz: *"inserir links de checkout
  nas abas assinaturas; combo regular, leg. trib; outros produtos"*. Quando a equipe gerar
  esses links na Eduzz, é atualizar a planilha e rodar o gerador de novo.
- **Produtos inativos ou em transição** (ex.: Combo SEFAZ-SE pós-edital, Super Combo):
  sem preço e sem link mesmo. Provavelmente ficam fora da vitrine.

**Decisão sugerida**: a vitrine inicial usa `produtosVendaveis()` (71 produtos com link).

## 2. Preços divergentes entre abas (27 produtos)

O mesmo produto aparece com preços diferentes em abas diferentes. O gerador adotou o valor
mais frequente. Os casos com dinheiro relevante em jogo:

| Produto | Adotado | Divergente | Onde diverge |
|---|---|---|---|
| Combo R+F Controle Regular | black R$ 687 | R$ 597 | bloco de ofertas de 2 abas |
| Combo R+F Policial Regular | black R$ 547 | R$ 397 | bloco de ofertas de 2 abas |
| Combo R+F Tribunal Regular | black R$ 547 | R$ 397 | bloco de ofertas de 2 abas |
| Treinamento Revisão Esquematizada | cheio R$ 1.597 / black R$ 997 | R$ 1.997 / R$ 1.597 | aba `assinaturas` |
| Assinatura Flashcards Regular | cheio R$ 697 | R$ 797 | aba `assinaturas` |
| Assinatura Resumos Regular | cheio R$ 797 | R$ 897 | aba `assinaturas` |
| Combo Flashcards Câmara dos Deputados | cheio R$ 397 | R$ 197 | aba `outros-produtos` |
| Combo LT SEFAZ-GO (pós-edital) | black R$ 257 | R$ 417,90 | abas `leg-tributaria` e antiga |

**Decisão necessária**: confirmar a tabela de preços oficial antes de expor no site.

## 3. Links com destino trocado (10 células)

Células onde o texto mostra um link mas o hyperlink embutido leva a outro checkout.
Pior caso, porque afeta venda hoje:

- **Combo R+F Controle Regular** e **Combo R+F Policial Regular**: em 3 abas cada, a célula
  do checkout normal mostra o link normal mas o clique leva ao **checkout da Black Friday**
  (`cvl5zk24` x `s72runkm`; `g43vpnvq` x `22v7p2jm`). O gerador adotou o texto (link normal).
  **Conferir na Eduzz qual dos dois deve valer e corrigir a planilha.**

## 4. Aba antiga "Legislação Tributária" com linhas desalinhadas

Nessa aba, vários checkouts e IDs estão deslocados uma linha (o checkout do resumo SEFA-PA
aparece na linha do SEFAZ-AL, e assim por diante). Por isso o gerador **não deixa** os links
dessa aba ocuparem os campos principais de checkout: eles ficam guardados em
`checkouts.outros` com o rótulo "aba antiga", para conferência.

Consequências para o time revisar:

- Cerca de 10 produtos (isolados de Legislação Tributária e o Combo LT SEFAZ-SP pós-edital,
  `idEduzz 2918620`) tinham checkout **somente** nessa aba e, portanto, ficaram **sem venda
  direta** no site até a equipe confirmar o link certo na Eduzz e atualizar a planilha.
- Os links de **upgrade #1 (R$ 245) / upgrade #2 (R$ 157)** vieram só dessa aba antiga;
  podem estar defasados.

## 5. Textos de venda copiados de outro produto

Vários produtos têm "Sobre o produto" e "Disciplinas" visivelmente colados de outro produto
na planilha. Exemplos:

- Combos da **área Bancária** com texto "COMBO RESUMOS ÁREA POLICIAL".
- Isolados de LT **SEFAZ-AL / BA / PA / RN / SP / DF** com disciplinas do **CTE de GOIÁS**.
- URLs de página de vendas apontando para o produto errado (ex.: Combo Bancária apontando
  para a página do combo Policial).

**Impacto**: dá para montar a vitrine (nome, preço, link), mas as **páginas de produto**
desses itens precisam de texto revisado antes de ir ao ar.

## 6. Cadastros incompletos por natureza

- `Oferta personalizada` (4 produtos guarda-chuva da Eduzz): não são produtos de vitrine,
  são a ferramenta do comercial. Já ficam de fora de `produtosVendaveis()` se não tiverem
  status/checkout, mas atenção para não listá-los por engano.
- **2901046 x 2901047**: dois produtos Eduzz com o mesmo nome ("Assinatura Resumos Regular +
  Flashcards Regular (2 anos)"). Um veio da campanha Black Friday, o outro é o normal.
  Confirmar se os dois seguem ativos ou se um deve ser aposentado. Na vitrine da home
  aparece só um card por nome (o de melhor desconto).
- **Assinaturas com o mesmo link em "normal" e "black"** (ex.: `G92EX64OWE`, `D0RAD1YA9Y`,
  `39VE7G37WR`): a planilha usa o mesmo checkout para o preço cheio e o preço Black.
  Confirmar na Eduzz qual valor esses checkouts estão cobrando hoje.
- **Combo Flashcards Área Bancária Regular** está cadastrado com ferramenta "Resumo" na
  planilha (provável erro de preenchimento).

## 7. Cupons sem escopo claro

Os cupons `BLACK30`, `BLACKVL30` e os 4 de SOCIAL SELLER não têm lista de produtos elegíveis
na planilha. Antes de expor cupom no site, confirmar onde cada um vale.
