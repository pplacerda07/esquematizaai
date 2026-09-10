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

**7. Cole o artigo no Conteúdo.**
É um campo de texto simples. Formatação se faz com os símbolos da tabela mais
abaixo. Colar de Word ou Google Docs perde negrito e títulos, então revise
depois de colar.

**8. Coloque a capa.**
O painel pede um endereço de imagem, não um arquivo. O jeito de conseguir esse
endereço está na seção "A capa do post".

**9. Escolha o status e salve.**
"Salvar como rascunho" guarda sem ninguém ver. "Publicar agora" põe no ar. Na
dúvida, salve como rascunho, confira no site e publique depois.

O post entra no ar em até um minuto. Se não aparecer de cara, espere e recarregue
antes de mexer de novo.

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
| `:marca[1.000 vagas]` | Grifo amarelo no meio da frase |

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

### As cinco caixas disponíveis

| Você escreve | Rótulo que aparece |
|---|---|
| `:::importante` | Importante |
| `:::dica` | Dica de prova |
| `:::sintese` | Em síntese |
| `:::aprofunde` | Aprofunde em cada concurso |
| `:::fontes` | Fontes |

Dentro da caixa o texto continua aceitando negrito, link e lista normalmente.

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
