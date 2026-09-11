# Publicar no blog do Esquematiza Aí

Guia para a equipe subir artigos no site novo. Do login até o post no ar, com a
lista do que dá pra formatar e o que ainda não existe.

---

## Antes de começar

O blog do site novo **não é o WordPress**. É um painel próprio, com login
próprio. O WordPress continua existindo e continua vendendo, mas os artigos
novos entram por aqui.

| | |
|---|---|
| Endereço do painel | `https://esquematizaai.com/admin/login` |
| Acesso | Peça ao Pedro. Cada pessoa da equipe deve ter o seu, não compartilhem um só. |

---

## Publicando um post

**1. Entre no painel e abra o Blog.**
Depois do login, clique em **Blog** no menu. Você vai ver a lista de tudo que já
existe, com título, categoria, data e status.

**2. Clique em + Novo Post.**
O botão fica no canto superior direito. Abre um painel de escrita ao lado da
lista.

**3. Escreva o título.**
É o único campo obrigatório. Ele também vira o endereço do post, então escreva o
título final aqui, não um provisório.

**4. Escolha a categoria.**
São cinco, e não dá pra criar outras pelo painel: Dicas, Estratégia, Legislação,
Guias, Novidades.

**5. Confira o autor.**
Vem preenchido como "Equipe Esquematiza Aí". Só troque se o artigo for assinado
por alguém.

**6. Escreva o resumo.**
Uma ou duas frases. Esse texto aparece no card do blog **e no Google**, então é
ele que faz a pessoa clicar. Não deixe em branco.

**7. Descrição para o Google, se quiser.**
Campo opcional, de no máximo 155 caracteres. É o texto que aparece embaixo do
título na busca e no cartão do WhatsApp.

Deixando vazio, o site usa o seu resumo, cortado automaticamente numa quebra de
palavra. Preencha quando quiser caprichar num post específico: uma frase que
funcione sozinha, sem depender de ler o resto.

**8. Cole o artigo no Conteúdo.**
É um campo de texto simples. Formatação se faz com os símbolos da tabela mais
abaixo. Colar de Word ou Google Docs perde negrito e títulos, então revise
depois de colar.

**9. Coloque a capa.**
O painel pede um endereço de imagem, não um arquivo. O jeito de conseguir esse
endereço está na seção "A capa do post".

**10. Escolha o produto em destaque.**
Uma lista com tudo que está à venda. O que você escolher vira um bloco de oferta
no fim do artigo, com nome, preço e botão. Deixe em "Nenhum" se o post não for
vender nada.

O preço e o link vêm do catálogo na hora de mostrar a página. Isso quer dizer que
um artigo de seis meses atrás nunca anuncia um preço que a loja deixou de cobrar,
e produto que sai do catálogo some do post sozinho.

**11. Escolha o status e salve.**
"Salvar como rascunho" guarda sem ninguém ver. "Publicar agora" põe no ar. Na
dúvida, salve como rascunho, confira no site e publique depois.

O post entra no ar em até um minuto. Se não aparecer de cara, espere e recarregue
antes de mexer de novo.

---

---

## Nada de HTML

O editor entende Markdown, que são os símbolos da tabela abaixo. **Ele não
entende HTML.** Se você colar algo como `<p>`, `<b>` ou `<br>`, a tag aparece
escrita na tela, no meio do artigo, e fica feio para o leitor.

Isso não é defeito, é proteção: o que impede alguém de colar um código malicioso
no painel e ele rodar no site é justamente o blog não executar HTML.

O editor avisa. Se houver tag no texto, aparece um alerta laranja antes de você
publicar. Quando ele aparecer, troque pelos símbolos da tabela.

Se você escreve no Word ou no Google Docs, cole primeiro num bloco de notas para
limpar a formatação, e depois no painel.

---

## Formatação que funciona

Escreva no campo Conteúdo. O que está à esquerda vira o que está à direita.

| Você escreve | Sai assim |
|---|---|
| `## Subtítulo da seção` | Um subtítulo grande, que também entra no índice |
| `**palavra**` | **palavra** em negrito |
| `*palavra*` | *palavra* em itálico |
| `- primeiro item` | Lista com bolinhas |
| `1. primeiro passo` | Lista numerada |
| `> uma citação` | Bloco de citação recuado |
| `[texto do link](https://...)` | Link clicável |
| `:marca[1.000 vagas]` | Grifo azul, para número que sustenta o argumento |
| `:ressalva[R$ 4.200]` | Grifo salmão, para valor com ressalva ou dado já superado |
| `[Voltar ao índice](#sumario-titulo)` | Link cinza discreto, para o fim de seção longa |

> Todo `##` que você escrever entra automaticamente no índice que aparece do lado
> do artigo. Por isso vale quebrar o texto em seções: o índice se monta sozinho e
> o leitor navega.

---

## As caixas de destaque

São blocos coloridos no meio do texto. Abrem com três dois-pontos e o nome, e
fecham com três dois-pontos sozinhos.

```
:::importante
As 848 vagas somam apenas os cinco fiscos estaduais.
:::
```

Dá pra trocar o rótulo, colocando entre colchetes:

```
:::dica[DICA DE PROVA]
Não espere o edital para começar.
:::
```

### As caixas disponíveis

| Você escreve | Rótulo que aparece | Quando usar |
|---|---|---|
| `:::importante` | Importante | Aviso que não pode passar batido |
| `:::lei[CTN, art. 138]` | O que você escrever nos colchetes | **Citação de lei.** Sempre com a referência |
| `:::dica` | Dica de prova | Recado de estudo, à parte do texto |
| `:::sintese` | Em síntese | Fechamento, com lista de estrelas |
| `:::aprofunde` | Aprofunde em cada concurso | Links para outros conteúdos |
| `:::faq` | nenhum | Agrupa as perguntas frequentes |
| `:::fontes` | Fontes | Rodapé com as fontes |

Dentro da caixa o texto continua aceitando negrito, link e lista normalmente.

**Lei e Importante não são a mesma coisa.** Citação de dispositivo vai em
`:::lei`, com a referência entre colchetes. Observação sua sobre a prova vai em
`:::importante`. Usar a mesma caixa para as duas deixa o artigo de legislação
todo no mesmo tom, e o leitor perde o que é texto da lei e o que é comentário.

```
:::lei[CTN, art. 138 · redação dada pela LC 236/2026]
A responsabilidade é excluída pela denúncia espontânea da infração.
:::
```

**O FAQ precisa do `:::faq` em volta.** Sem ele, cada pergunta entra no índice
lateral do artigo misturada com os subtítulos de verdade.

```
:::faq
### A LC 236 já está valendo?
Sim, desde a publicação.

### Cai na prova deste ano?
Depende do edital.
:::
```

---

## Chamar um produto no meio do artigo

Escreva numa linha sozinha, com o código do produto:

```
::produto{id=combo-resumos-flashcards-fiscal-regular}
```

Isso monta o bloco de oferta com nome, preço e botão. **O preço vem do catálogo
na hora**, então nunca fica desatualizado em relação à loja, mesmo que o artigo
seja de meses atrás.

**Como achar o código:** abra o produto na vitrine do site. O endereço termina
com o código.

```
esquematizaai.com/vitrine/produto/combo-resumos-flashcards-fiscal-regular
                                  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                  esse pedaço é o código
```

---

## A capa do post

O painel do blog ainda **não tem upload de imagem**. Ele pede um endereço já
hospedado. Para conseguir esse endereço, use a biblioteca de mídia do WordPress,
que a equipe já conhece:

1. Entre em `loja.esquematizaai.com/wp-admin`
2. Vá em **Mídia** e depois em **Adicionar nova**
3. Suba a imagem e clique nela
4. Copie o endereço que aparece em **URL do arquivo**
5. Cole no campo **URL da capa** do painel do blog

> **Atenção.** Só funciona com endereço que comece com `loja.esquematizaai.com`.
> Imagem de banco de imagens, do Google ou de outro site **não carrega** e deixa
> o post sem capa. Sempre suba primeiro no WordPress.

Se ficar sem capa, o post continua funcionando. O card só aparece sem foto.

---

## Mexendo em post que já existe

| O que fazer | Como |
|---|---|
| Editar | Ícone de lápis na linha do post |
| Tirar do ar sem apagar | Clique no selo **Publicado** na coluna Status. Vira Rascunho na hora e some do site. Clique de novo pra voltar |
| Achar um post | A busca no topo procura por título e por categoria |

### Cuidado com estas

- O ícone de lixeira **apaga de vez**. Não vai pra lixeira, não tem desfazer. Se
  a ideia é só tirar do ar, use o selo de status.
- Mudar o título de um post já publicado **muda o endereço dele**. Quem tinha o
  link antigo cai em página não encontrada.
- Dois posts não podem ter o mesmo título. Se aparecer erro ao salvar,
  provavelmente já existe um artigo com esse nome. Mude uma palavra e salve de
  novo.
- Não cole HTML no campo Conteúdo. Ele não é interpretado e aparece como texto na
  tela.

---

## Ordem sugerida pra equipe

Pra não ter retrabalho, vale seguir sempre nesta ordem:

1. Suba a imagem no WordPress e deixe o endereço copiado
2. Crie o post e salve como **rascunho**
3. Abra o site e confira como ficou: índice, caixas, link do produto, capa
4. Só então volte no painel e mude para **Publicado**
