import { criarSupabaseServer } from './server';

/**
 * Os papéis do painel.
 *
 * `produtos` cobre o que descreve material à venda: materiais, sumários e
 * cursos. `blog` cobre publicação editorial: posts e notícias.
 *
 * O corte é esse e não outro porque foi o que o Sérgio pediu em 18/09, ao
 * querer dar acesso a três pessoas da equipe sendo que uma delas só mexe em
 * produto. Papel mais fino, do tipo "pode editar mas não apagar", fica para
 * quando alguém precisar: inventar permissão que ninguém pediu só aumenta o
 * número de jeitos de travar quem está trabalhando.
 *
 * `dono` é de outra natureza: não abre uma área de conteúdo, abre a lista de
 * quem entra no painel. Quem tem esse papel cria acesso, tira acesso e troca o
 * papel dos outros, então é o único que consegue alterar o próprio alcance de
 * todo mundo. Hoje são duas pessoas, o Pedro e o Sérgio.
 */
export type Funcao = 'produtos' | 'blog' | 'dono';

const RPC_DA_FUNCAO: Record<Funcao, string> = {
  produtos: 'pode_produtos',
  blog: 'pode_blog',
  dono: 'eh_dono',
};

const NOME_DA_FUNCAO: Record<Funcao, string> = {
  produtos: 'materiais e cursos',
  blog: 'blog e notícias',
  // frase genérica de propósito: a mensagem vira "não tem acesso a esta parte
  // do painel", e quem não é dono não precisa saber que existe uma lista de
  // acessos para ficar tentando chegar nela
  dono: 'esta parte do painel',
};

/**
 * Confere se quem está chamando pode fazer aquilo.
 *
 * POR QUE ESTAR LOGADO NÃO BASTA:
 * o cadastro do Supabase aceita qualquer pessoa, e a chave anônima vai no HTML
 * de todas as páginas do site. Então "ter sessão" é algo que qualquer um na
 * internet consegue em dois minutos. Quem pode o quê é decidido pela tabela
 * `administradores`, na coluna `funcoes`, e quem lê essa coluna é o banco.
 *
 * A CHECAGEM DE VERDADE MORA NAS POLÍTICAS DO BANCO: mesmo que alguém chame uma
 * Server Action direto, sem passar pelo painel, o banco recusa a escrita, porque
 * cada tabela pergunta por `pode_produtos()` ou `pode_blog()`. Esta função
 * existe para dar uma resposta clara em vez de um erro cru do Postgres, e para
 * o painel não abrir uma tela que a pessoa não vai conseguir usar.
 *
 * Sem `funcao`, pergunta só se a pessoa está no painel. É o caso do envio de
 * imagem, que serve aos dois papéis: subir um arquivo para o bucket não estraga
 * nada sozinho, e a linha que aponta para ele já é barrada pelo papel certo.
 */
export async function exigirAdmin(
  funcao?: Funcao,
): Promise<{ ok: true; email: string | null } | { ok: false; erro: string }> {
  const supabase = await criarSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, erro: 'Sessão expirada. Faça login de novo.' };

  const rpc = funcao ? RPC_DA_FUNCAO[funcao] : 'eh_admin';
  const { data: pode, error } = await supabase.rpc(rpc);

  if (error) return { ok: false, erro: 'Não foi possível confirmar sua permissão. Tente de novo.' };

  if (!pode) {
    return {
      ok: false,
      erro: funcao
        ? `Sua conta não tem acesso a ${NOME_DA_FUNCAO[funcao]}. Fale com o Sérgio para liberar.`
        : 'Sua conta não tem permissão para alterar o site.',
    };
  }

  // devolvido para registrar quem alterou o quê (coluna atualizado_por)
  return { ok: true, email: user.email ?? null };
}

/** Os papéis de quem está logado, para o painel esconder o que ela não usa. */
export async function funcoesDeQuemEstaLogado(): Promise<Funcao[]> {
  const supabase = await criarSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('administradores')
    .select('funcoes')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !data) return [];
  return (data.funcoes ?? []) as Funcao[];
}
