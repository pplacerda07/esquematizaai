# Publicar notícia no Esquematiza Aí

Este documento é o manual de instruções para a automação. Cole ele no Claude
que vai publicar as notícias e ele vai saber o que fazer.

---

## O que você precisa ter em mãos

| Item | Onde conseguir |
|---|---|
| Endereço | `https://esquematizaai.vercel.app/api/noticias` |
| Token | Com o Pedro. É uma senha: não cole em conversa pública nem em arquivo compartilhado. |

> **Atenção ao endereço.** Hoje o site novo responde em `esquematizaai.vercel.app`.
> O domínio `esquematizaai.com` ainda aponta para o WordPress antigo, e chamar
> a rota por lá dá erro de conexão. Quando o domínio for apontado para o site
> novo, troque o endereço aqui e nos comandos abaixo.

## Passo 1: teste antes de escrever qualquer matéria

Este teste responde duas perguntas de uma vez: se você consegue acessar a
internet e se o token está certo. Faça uma requisição GET para
`https://esquematizaai.vercel.app/api/noticias`, com o cabeçalho
`Authorization: Bearer SEU_TOKEN`, e diga ao Sérgio o que voltou.

```bash
curl https://esquematizaai.vercel.app/api/noticias \
  -H "Authorization: Bearer SEU_TOKEN"
```

| Resposta | O que significa |
|---|---|
| `"ok": true` | Está tudo pronto. Pode publicar. |
| `401` | Chegou no servidor, mas o token está errado. Peça o token de novo ao Pedro. |
| Não consegue acessar a internet | Você não tem permissão de saída de rede. Neste caso escreva a matéria normalmente e entregue o texto pronto ao Sérgio: ele publica pelo painel. |

Só siga para o resto do documento depois deste teste.

---

## Como publicar

Uma requisição `POST` com o texto da matéria em JSON.

```bash
curl -X POST https://esquematizaai.vercel.app/api/noticias \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Concurso SEFAZ-BA: edital previsto para setembro com 187 vagas",
    "resumo": "A comissão foi formada e o edital deve sair em setembro. Veja as vagas, a remuneração inicial e como se preparar.",
    "conteudo": "## O que já está definido\n\nA Secretaria da Fazenda da Bahia...",
    "fonte": "Estratégia Concursos",
    "url_fonte": "https://www.estrategiaconcursos.com.br/blog/concurso-sefaz-ba/"
  }'
```

A resposta traz o endereço da matéria no site:

```json
{
  "ok": true,
  "slug": "concurso-sefaz-ba-edital-previsto-para-setembro-com-187-vagas",
  "url": "/noticias/concurso-sefaz-ba-edital-previsto-para-setembro-com-187-vagas",
  "aviso": "Publicada. Aparece no site em até 1 minuto."
}
```

---

## Os campos

### Obrigatórios

| Campo | Regra | Para que serve |
|---|---|---|
| `titulo` | mínimo 15 caracteres | Vira o `<h1>` da página e o título no Google |
| `resumo` | mínimo 40 caracteres | Aparece no Google, no card da home e como linha de apoio da matéria |
| `conteudo` | mínimo 200 caracteres | O texto da matéria, em Markdown |

### Opcionais

| Campo | Padrão | Observação |
|---|---|---|
| `fonte` | vazio | Nome do veículo, quando a informação veio de fora |
| `url_fonte` | vazio | Link da fonte. Vira o crédito no rodapé da matéria |
| `autor` | `Redação Esquematiza Aí` | |
| `slug` | gerado do título | Só envie se quiser um endereço específico |
| `status` | `publicado` | Use `rascunho` para revisar antes de publicar |

---

## Como escrever o `conteudo`

O texto vai em **Markdown**. Além do básico, o site entende blocos próprios que
deixam a matéria com a cara das outras.

### Básico

```markdown
## Título de seção

Um parágrafo normal, com **negrito** e [link](https://exemplo.com).

- item de lista
- outro item
```

Cada `##` vira uma seção com barra escura, e o índice "Neste guia" no topo da
matéria é montado sozinho a partir deles. Não escreva o índice na mão.

### Tabela

```markdown
| Concurso | Vagas | Situação |
| --- | --- | --- |
| **Estaduais** | | |
| SEFAZ-BA | 187 | Edital em setembro |
| SEFAZ-DF | 265 | Banca definida |
```

A linha em que só a primeira célula tem conteúdo vira uma faixa de agrupamento.

### Caixas de destaque

```markdown
:::importante
As 848 vagas somam apenas os fiscos estaduais e a Receita Federal.
:::

:::dica[DICA DE PROVA]
O núcleo se repete em todos os fiscos. Deixe a legislação específica
para o pós-edital.
:::

:::sintese
- Primeiro ponto
- Segundo ponto
:::

:::aprofunde
- [Concurso SEFAZ-BA: 187 vagas](/noticias/concurso-sefaz-ba)
- [Concurso SEFAZ-DF: 265 vagas](/noticias/concurso-sefaz-df)
:::

:::fontes
Estratégia Concursos · Gran Cursos · Diário Oficial da Bahia
:::
```

### Grifo

```markdown
O total passa de :marca[1.000 vagas] somando os municípios.
```

### Oferta de material

```markdown
::produto{id=combo-resumos-flashcards-fiscal-regular}
```

**Nunca escreva preço na matéria.** Informe só o id do produto: o site busca
nome, preço e link no catálogo na hora de exibir. Assim a matéria nunca fica
anunciando um preço que a loja não cobra mais.

Ids mais usados:

| Produto | id |
|---|---|
| Combo Resumos + Flashcards Fiscal | `combo-resumos-flashcards-fiscal-regular` |
| Combo Resumos + Flashcards Controle | `combo-resumos-flashcards-controle-regular` |
| Combo Resumo Fiscal | `combo-resumo-fiscal-regular` |
| Assinatura Resumos + Flashcards | `assinatura-resumos-regular-flashcards-regular` |

A lista completa está no painel, em Materiais.

---

## Regras de escrita da casa

Estas não são preferência, são regra do cliente. Vale conferir antes de enviar.

1. **Nada de travessão.** Nem `—` nem `–`. Use vírgula, ponto ou dois pontos.
2. **Nunca copie o texto da fonte.** Escreva a matéria com suas palavras e
   credite pelo campo `url_fonte`. Copiar derruba o site no Google por
   conteúdo duplicado, além do problema de direito autoral.
3. **Não invente número, data nem nome de banca.** Se a informação não estiver
   confirmada, escreva que ainda não foi confirmada.
4. **Um `##` a cada 3 ou 4 parágrafos.** Matéria sem seção vira paredão e
   ninguém termina de ler no celular.

---

## Quando der erro

A resposta sempre diz o que aconteceu e o que fazer.

| Código | Significado | O que fazer |
|---|---|---|
| 401 | Token errado ou ausente | Confira o cabeçalho `Authorization` |
| 400 | Faltou campo ou está curto demais | A resposta diz qual campo e qual o mínimo |
| 409 | Já existe matéria com esse endereço | Mude o título ou envie um `slug` diferente |
| 500 | Problema no servidor | Avise o Pedro |

Exemplo de erro:

```json
{
  "ok": false,
  "erro": "O campo \"conteudo\" é obrigatório e precisa ter pelo menos 200 caracteres.",
  "ajuda": "Notícia sem texto vira uma página vazia indexada pelo Google. Escreva a matéria completa."
}
```

---

## Publicando pelo Claude, em conversa

Depois de colar este documento, basta pedir em português:

> Publique uma notícia sobre o edital da SEFAZ-BA que saiu hoje. Fonte:
> Estratégia Concursos, link tal. Use a caixa `:::importante` para destacar o
> número de vagas e feche com a oferta do Combo Resumos + Flashcards Fiscal.

O Claude escreve a matéria seguindo as regras acima e chama o endereço.

**Dica:** peça `"status": "rascunho"` nas primeiras vezes. A matéria fica
salva sem aparecer no site, e você revisa no painel em `/admin/noticias`
antes de publicar.

---

## O que a automação NÃO consegue fazer

Por segurança, o token só publica notícia. Ele não apaga, não edita matéria
existente, não mexe em produto nem em nenhuma outra tabela. Editar e excluir
só pelo painel, com login.
