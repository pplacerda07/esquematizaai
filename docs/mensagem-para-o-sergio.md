# Mensagem para o Sérgio

Copie daqui para baixo. O token vai numa mensagem separada, veja a nota no fim.

---

Sérgio, tá pronto. Você agora tem duas formas de colocar notícia no ar.

**1. O painel**

Endereço: https://esquematizaai.vercel.app/admin/login
Login: sergio@esquematizaai.com
Senha: esquematizaai2026!

Troca essa senha assim que entrar, ela é provisória e passou por mensagem.

Lá dentro tem três áreas. Em **Notícias** você cria e edita as matérias. Em
**Blog** ficam os artigos. Em **Materiais** estão os 107 produtos do catálogo,
onde dá pra corrigir preço, mudar descrição, esconder um produto ou marcar como
destaque. O que você mexer nos Materiais fica por cima da planilha: se a gente
reimportar a planilha depois, não apaga o que você editou, e sempre dá pra
voltar ao valor original com um clique.

**2. Publicar direto pelo seu Claude**

Esse é o caminho que interessa pro volume. Te mandei um arquivo chamado
`publicar-noticia.md`. Cola ele inteiro no Claude e depois é só pedir em
português, tipo:

> Publique uma notícia sobre o edital da SEFAZ-BA que saiu hoje. Fonte:
> Estratégia Concursos, link tal. Destaque o número de vagas e fecha com a
> oferta do Combo Resumos + Flashcards Fiscal.

Ele escreve a matéria já no padrão do site (as seções, as caixas de destaque, o
índice no topo, o bloco de oferta do produto) e sobe sozinho. A matéria aparece
no site em até um minuto.

**Antes de fazer isso, um teste de trinta segundos.** O arquivo começa com ele.
Pede pro Claude fazer o teste e te dizer o que voltou. Se responder `ok: true`,
tá tudo certo. Se ele disser que não consegue acessar a internet, sem problema:
ele escreve a matéria mesmo assim e você cola no painel.

**Uma dica que vale muito nas primeiras vezes:** peça pra ele publicar como
rascunho. A matéria fica salva sem aparecer no site, você abre o painel, lê, e
publica se tiver boa. Depois que confiar no resultado, tira o rascunho.

**Duas regras que já deixei configuradas e o Claude vai seguir:** ele nunca
escreve preço na matéria (o site busca o preço do catálogo na hora, então nunca
fica anunciando valor desatualizado) e nunca copia o texto da fonte, porque isso
derruba a gente no Google por conteúdo duplicado.

O que ele consegue fazer é só criar notícia. Não apaga, não edita matéria que já
existe e não mexe em produto. Essas coisas só pelo painel.

---

## Nota para o Pedro, não mande isso

**O token vai em mensagem separada.** É uma senha. Manda por WhatsApp mesmo, mas
numa mensagem só dele, não junto com o texto acima, e pede pra ele não colar em
grupo nem em documento compartilhado.

**Onde pegar o token:** abre o arquivo `site/.env.local` no projeto e copia o
valor da linha `NOTICIAS_API_TOKEN=`. É tudo que vem depois do sinal de igual.

Se preferir pegar pela Vercel: painel do projeto, aba Settings, item
Environment Variables, procura `NOTICIAS_API_TOKEN` e clica no olho para revelar.

**Sobre o endereço:** enquanto `esquematizaai.com` continuar apontando para o
WordPress, tudo tem que usar `esquematizaai.vercel.app`. Quando o domínio mudar
para o site novo, me avisa que eu troco os endereços no manual dele.
