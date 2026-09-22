# Cadastrar um material novo no site

Guia para a equipe colocar um curso, combo ou assinatura no ar sem depender de
ninguém mexer no código.

---

## Antes de começar

| | |
|---|---|
| Endereço do painel | `https://esquematizaai.com/admin/login` |
| Tela | **Materiais**, no menu da esquerda |
| Acesso | Peça ao Pedro ou ao Sérgio |

O catálogo do site nasce da planilha do Sérgio. Esta tela serve para **duas
coisas**: cadastrar algo que ainda não está na planilha, e ajustar o que já está
sem precisar mexer nela.

Quando a planilha for atualizada e passar a trazer o material, o cadastro feito
aqui sai de cena sozinho. Você não precisa apagar nada depois.

**O botão redondo laranja com um `+`**, no canto de baixo à direita, é por onde
se começa qualquer coisa. Ele abre as opções do que dá para criar, e mostra só o
que a sua conta pode: quem cuida de material não vê "post do blog".

---

## Dois caminhos para cadastrar

| Caminho | Quando usar |
|---|---|
| **Por script** | Você já tem as informações num chat, ou vai pedir ao Claude para montar |
| **Pelo formulário** | Você tem os dados na mão e prefere digitar |

Os dois fazem exatamente a mesma coisa. Escolha o que for mais rápido no
momento.

---

## Caminho 1: por script

**1. Abra Materiais e clique em "Trabalhar por script".**

**2. Clique em "Copiar modelo de um produto".**

**3. Cole no seu Claude e peça para preencher.** O modelo já explica sozinho o
que cada campo aceita, então não precisa escrever instrução junto.

**4. Traga o texto preenchido de volta e cole na caixa.** Pode colar com a
conversa em volta, do jeito que veio: o painel acha o script no meio do texto.

**5. Clique em "Conferir".**

Se tiver problema, ele lista **todos de uma vez**, com o número da linha. Tem um
botão "Copiar os erros para o chat": leve de volta ao Claude e peça para
corrigir.

Se estiver certo, aparece **"O produto vai ficar assim"**, campo a campo.
Confira o preço e o endereço da página, que é o que não muda depois.

**6. Escolha a capa ali mesmo**, logo abaixo da conferência.

**7. Clique em "Gravar este material".**

O material entra no ar em até um minuto.

### O que o script recusa, e por quê

| Recusa | Motivo |
|---|---|
| `preco: 1.299` | Pode ser mil duzentos e noventa e nove ou um real e trinta. Escreva `1299` |
| Preço "de" menor que o de venda | O site anunciaria um desconto que não existe |
| Link de compra que já é de outro material | Os dois brigariam e um sumiria da vitrine sem aviso |
| Dois materiais no mesmo texto | Um de cada vez, para você conferir cada preço |
| HTML na descrição | O site não lê HTML; as tags apareceriam escritas na página |

### Consultar o que já está na loja

O botão **"Baixar a loja inteira"** gera um arquivo com todos os materiais à
venda hoje, com preço e endereço. Anexe no chat quando quiser perguntar alguma
coisa sobre o catálogo.

**Esse arquivo só serve para consultar.** Ele não volta para dentro do painel, e
se você colar na caixa de script o painel avisa. Isso é de propósito: não existe
"importar tudo de uma vez", para ninguém trocar cem preços sem conferir um.

---

## Caminho 2: pelo formulário

**1. Nome do material.**
Escreva o nome final, do jeito que o aluno vai ler. Ele também vira o endereço da
página, então evite trocar depois: quem tiver o link antigo cai em página não
encontrada.

**2. Tipo.**
Três opções: **Material isolado**, **Combo** ou **Assinatura**. É por aqui que o
filtro do catálogo separa as coisas.

**3. Área.**
Fiscal, Controle, Policial, Tribunais, Bancária, Legislativo ou **Geral**. É o
segundo filtro da vitrine. Use Geral para matéria que serve qualquer concurso,
como Português ou Raciocínio Lógico.

**4. Ferramenta.**
Resumo, Flashcards, Vademecum, Questões Inéditas e por aí. É o que o aluno vê no
cartão.

**5. Preço de venda.**
Só o número, sem "R$" e sem ponto de milhar. Um material de mil e noventa e sete
reais se escreve `1097`.

**6. Preço "de", se houver.**
O valor riscado, que aparece ao lado do preço atual. **Só preencha se for
verdade.** Preço "de" inventado é propaganda enganosa, e a loja responde por isso.
Se não existe desconto real, deixe vazio.

**7. Caminho de compra. Este é obrigatório.**

Serve qualquer um dos dois, e você só precisa de um:

- **Link do checkout**, quando a compra é direta. Serve qualquer plataforma:
  Eduzz, Tutory, a que for.
- **Link da página de vendas**, quando o aluno passa pela loja antes.

Sem um dos dois o material não vai para o ar, porque um cartão sem botão de
comprar não serve para nada.

**8. Descrição, se quiser.**

Aceita formatação: `**negrito**`, `## título`, `- item de lista`,
`[texto](endereço)` e as caixas coloridas do blog, como `:::importante` e
`:::dica`.

**Não aceita HTML**, e isso é de propósito. As tags apareceriam escritas na
página.

**9. Capa.**
Escolha a imagem pelo botão. JPG, PNG ou WebP, até 5 MB, no formato retrato.

**10. Salve.**

---

## Depois de cadastrar

Os materiais criados aqui aparecem numa seção própria, **"Cadastrados aqui no
painel"**, no topo da lista. Cada um tem três botões:

| Botão | O que faz |
|---|---|
| **Trocar capa** | Escolhe outra imagem |
| **Ver no site** | Abre a página do material numa aba nova |
| **Apagar** | Tira de vez. O endereço da página deixa de existir |

---

## Ajustando o que já existe

A mesma tela edita o que veio da planilha. Isso é útil quando o preço mudou e a
planilha ainda não foi atualizada, ou quando um concurso passou e o material
precisa sair da vitrine hoje.

| O que você quer | O que fazer |
|---|---|
| Mudar o preço | Escreva o novo em **Preço de venda** |
| **Trocar para onde o botão de comprar leva** | Escreva o link novo em **Link de compra** |
| Trocar a descrição | Escreva em **Descrição** |
| Tirar da vitrine sem apagar | Mude a **Exibição** para oculto |
| Colocar no topo | Escreva um número em **Posição na vitrine** |
| Voltar ao que a planilha diz | Apague o que você escreveu e deixe o campo vazio |

O ajuste fica por cima da planilha, não no lugar dela. Apagar o que você digitou
devolve o valor original.

**O "Link de compra" é o campo que troca a plataforma de pagamento de um
material.** O site não cobra nem entrega nada: ele mostra o material e manda a
pessoa para onde a compra acontece. Trocar esse link é tudo que o site precisa
saber para um material passar a vender por outra plataforma. Materiais com o link
trocado ganham o selo **"Link trocado"** no cartão.

---

## Cuidado com estas

- **Preço "de" só quando existir de verdade.** É o item mais sensível desta tela.
- **Trocar o nome de um material que já está no ar muda o endereço dele.** Links
  compartilhados e resultados do Google param de funcionar.
- **Ocultar não é apagar.** Para tirar do ar por um tempo, use a Exibição. O
  histórico e os ajustes continuam guardados.
- **Não invente link de compra.** Se não tiver o link em mãos, deixe o material
  oculto até conseguir.
- **Apagar material do painel não tem desfazer.** A confirmação mostra o endereço
  que vai deixar de existir; leia antes de confirmar.

---

## Ordem sugerida

1. Tenha em mãos o nome final, o preço, o link de compra e a imagem da capa
2. Cadastre, por script ou pelo formulário
3. Clique em **Ver no site** e confira como ficou o cartão e a página
4. Se algo estiver errado, ajuste ou apague e faça de novo

---

## Se algo não funcionar

| Sintoma | O que é |
|---|---|
| Cadastrei e não apareceu | O site se refaz a cada minuto. Espere e recarregue antes de cadastrar de novo |
| Sumiu o menu do Blog | Sua conta não tem essa permissão. Não é defeito |
| "Esse link já é de X" | Dois materiais não podem dividir o mesmo link de compra |
| Esqueci a senha | O site ainda não envia e-mail de recuperação. Peça ao Pedro ou ao Sérgio: eles trocam a sua senha na tela **Acessos**, em segundos |
