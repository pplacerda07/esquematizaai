'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { criarSupabaseServer } from '@/lib/supabase/server';
import { exigirAdmin, type Funcao } from '@/lib/supabase/admin-guard';

export type Resultado = { ok: true; aviso?: string } | { ok: false; erro: string };

/**
 * Quem entra no painel.
 *
 * ATÉ AQUI ISSO ERA TRABALHO MEU: cada pessoa nova da equipe virava uma conta
 * criada à mão no Supabase e uma linha escrita à mão na tabela. Agora o Pedro e
 * o Sérgio fazem sozinhos, que é o que o Sérgio pediu ao querer liberar três
 * pessoas de uma vez.
 *
 * QUEM DECIDE É O BANCO, NÃO ESTA TELA. Cada ação daqui pergunta de novo por
 * eh_dono(), e as políticas da tabela `administradores` perguntam outra vez, na
 * hora de escrever. Não é redundância desnecessária: Server Action é um
 * endereço HTTP como outro qualquer, e quem souber montar a requisição chega
 * aqui sem passar pela tela. O que segura de verdade é a política do banco.
 *
 * AS TRÊS TRAVAS QUE MORAM NO BANCO, e não aqui:
 *  - ninguém tira o próprio acesso (a pessoa se trancaria para fora)
 *  - o painel nunca fica sem nenhum dono (ninguém mais conseguiria liberar)
 *  - quem não é dono não escreve nada nesta tabela, nem para si mesmo
 *
 * Testei as três com identidade real, dentro de transação desfeita, antes de
 * escrever esta tela. A de "sem nenhum dono" é um gatilho adiado, porque a
 * pergunta só faz sentido depois que a alteração inteira terminou.
 */

const FUNCOES_VALIDAS: Funcao[] = ['produtos', 'blog', 'dono'];

const SENHA_MINIMA = 10;

/**
 * Cliente com a chave de serviço, que ignora todas as políticas do banco.
 *
 * Existe por um motivo só: criar conta e trocar senha são coisas do Auth do
 * Supabase, e não há política de tabela que autorize isso. TUDO O MAIS passa
 * pelo cliente da sessão, de propósito, para o banco continuar mandando.
 *
 * A chave vive só no ambiente do servidor. Este arquivo é 'use server': nada
 * daqui é enviado ao navegador.
 */
function clienteDeServico() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !chave) return null;

  return createClient(url, chave, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function lerEmail(formData: FormData): string | null {
  const bruto = String(formData.get('email') ?? '').trim().toLowerCase();
  // conferência de formato, não de existência: quem valida e-mail de verdade é
  // a pessoa conseguindo entrar com ele
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(bruto)) return null;
  return bruto;
}

function lerFuncoes(formData: FormData): Funcao[] {
  const escolhidas = formData
    .getAll('funcoes')
    .map((f) => String(f))
    .filter((f): f is Funcao => (FUNCOES_VALIDAS as string[]).includes(f));

  // sem repetido: o banco guarda array, e duplicata não muda nada mas suja a
  // leitura de quem for conferir a linha depois
  return [...new Set(escolhidas)];
}

function problemaDaSenha(senha: string, email: string): string | null {
  if (senha.length < SENHA_MINIMA) {
    return `A senha precisa de pelo menos ${SENHA_MINIMA} caracteres.`;
  }
  if (senha !== senha.trim()) {
    return 'A senha começa ou termina com espaço. Quase sempre é um erro de cópia, e a pessoa não conseguiria entrar.';
  }
  if (senha.toLowerCase().includes(email.split('@')[0])) {
    return 'A senha não pode conter o começo do e-mail.';
  }
  return null;
}

/** A mensagem do gatilho que impede o painel de ficar sem dono já é para ler. */
function mensagemDoBanco(bruta: string, padrao: string): string {
  return bruta.includes('sem nenhum dono') ? bruta : padrao;
}

/**
 * Cria o acesso: conta no Auth e linha na tabela.
 *
 * A SENHA É DIGITADA AQUI PORQUE NÃO EXISTE ENVIO DE E-MAIL AINDA. O caminho
 * normal seria o convite por e-mail, com a pessoa escolhendo a própria senha e
 * ninguém mais sabendo dela. Enquanto isso não existe, quem cria escolhe uma
 * senha e passa para a pessoa por fora. Ela deve ser trocada depois, e a tela
 * diz isso.
 *
 * A senha não é gravada em lugar nenhum daqui: vai direto para o Auth, que
 * guarda só o hash. Não aparece em log nem volta para a tela.
 */
export async function criarAcesso(formData: FormData): Promise<Resultado> {
  const guarda = await exigirAdmin('dono');
  if (!guarda.ok) return { ok: false, erro: guarda.erro };

  const email = lerEmail(formData);
  if (!email) return { ok: false, erro: 'E-mail inválido.' };

  const funcoes = lerFuncoes(formData);
  if (funcoes.length === 0) {
    return { ok: false, erro: 'Marque pelo menos uma coisa que essa pessoa pode fazer.' };
  }

  const senha = String(formData.get('senha') ?? '');
  const supabase = await criarSupabaseServer();

  /**
   * O e-mail pode já ter conta no site.
   *
   * Nesse caso NÃO trocamos a senha dela. Ela é dona daquela conta, pode estar
   * usando para outra coisa, e quem cria o acesso não tem por que assumir a
   * senha de ninguém. Liberamos o painel e avisamos. Se a pessoa não lembrar a
   * senha, o botão "Trocar senha" da linha resolve, e aí é uma decisão
   * consciente de quem clicou, não um efeito colateral escondido.
   */
  const { data: contaExistente, error: erroBusca } = await supabase.rpc('conta_do_email', {
    p_email: email,
  });

  if (erroBusca) {
    return { ok: false, erro: 'Não foi possível conferir se esse e-mail já tem conta. Tente de novo.' };
  }

  if (contaExistente) {
    const { error } = await supabase
      .from('administradores')
      .insert({ user_id: contaExistente as string, email, funcoes });

    if (error) {
      const jaEstava = error.code === '23505';
      return {
        ok: false,
        erro: jaEstava
          ? 'Esse e-mail já está na lista. Para mudar o que ele pode fazer, use a própria linha dele.'
          : mensagemDoBanco(error.message, 'O banco recusou a gravação. Confira se você ainda está logado.'),
      };
    }

    revalidatePath('/admin/acessos');
    return {
      ok: true,
      aviso:
        'Essa pessoa já tinha conta no site, então a senha continua sendo a que ela já usava. A senha que você digitou aqui foi descartada. Se ela não lembrar, use "Trocar senha" na linha dela.',
    };
  }

  const problema = problemaDaSenha(senha, email);
  if (problema) return { ok: false, erro: problema };

  const servico = clienteDeServico();
  if (!servico) {
    return { ok: false, erro: 'Falta a chave de serviço no servidor. Avise o Pedro.' };
  }

  /**
   * email_confirm: true porque não há envio de e-mail.
   *
   * Sem isso o Supabase deixa a conta esperando uma confirmação que nunca
   * chega, e a pessoa recebe "e-mail não confirmado" ao tentar entrar. Quem
   * está confirmando o e-mail, na prática, é o dono que digitou.
   */
  const { data: criada, error: erroAuth } = await servico.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
  });

  if (erroAuth || !criada?.user) {
    return {
      ok: false,
      erro: erroAuth?.message ?? 'Não foi possível criar a conta. Tente de novo.',
    };
  }

  /**
   * A linha da tabela entra pelo cliente da SESSÃO, não pelo de serviço.
   *
   * Assim a política do banco confere outra vez se quem está criando é dono. É
   * a diferença entre uma tela que pede licença e uma tela que se autoriza
   * sozinha.
   */
  const { error: erroTabela } = await supabase
    .from('administradores')
    .insert({ user_id: criada.user.id, email, funcoes });

  if (erroTabela) {
    // a conta acabou de nascer e não serve para nada sem a linha. Deixá-la
    // solta cria um e-mail que existe no Auth, não aparece em lista nenhuma e
    // impede recriar o acesso depois, com uma mensagem que ninguém entende.
    await servico.auth.admin.deleteUser(criada.user.id);
    return {
      ok: false,
      erro: mensagemDoBanco(
        erroTabela.message,
        'A conta foi criada mas o banco recusou dar o acesso, então ela foi desfeita. Tente de novo.',
      ),
    };
  }

  revalidatePath('/admin/acessos');
  return { ok: true };
}

/** Muda o que uma pessoa pode fazer. */
export async function mudarFuncoes(formData: FormData): Promise<Resultado> {
  const guarda = await exigirAdmin('dono');
  if (!guarda.ok) return { ok: false, erro: guarda.erro };

  const userId = String(formData.get('user_id') ?? '');
  if (!userId) return { ok: false, erro: 'Faltou dizer de quem.' };

  const funcoes = lerFuncoes(formData);
  if (funcoes.length === 0) {
    return { ok: false, erro: 'Marque pelo menos uma coisa, ou tire o acesso dessa pessoa.' };
  }

  const supabase = await criarSupabaseServer();
  const { data, error } = await supabase
    .from('administradores')
    .update({ funcoes })
    .eq('user_id', userId)
    .select('user_id');

  if (error) {
    return {
      ok: false,
      erro: mensagemDoBanco(error.message, 'O banco recusou a alteração.'),
    };
  }

  // nenhuma linha alterada e nenhum erro é o jeito do RLS dizer não: a linha
  // existe, mas a política não deixou tocar nela
  if (!data || data.length === 0) {
    return { ok: false, erro: 'O banco não deixou alterar esse acesso. Confira se você ainda é dono.' };
  }

  revalidatePath('/admin/acessos');
  return { ok: true };
}

/**
 * Tira alguém do painel.
 *
 * APAGA A LINHA DA LISTA, NÃO A CONTA. Sem a linha, a conta entra em lugar
 * nenhum: o proxy confere eh_admin() a cada página e devolve para o login. Mas
 * apagar a conta do Auth é definitivo, leva junto o histórico de quem alterou o
 * quê, e não tem desfazer se for engano. Tirar acesso é uma decisão de rotina;
 * apagar conta não é, e por isso não mora num botão de rotina.
 */
export async function tirarAcesso(formData: FormData): Promise<Resultado> {
  const guarda = await exigirAdmin('dono');
  if (!guarda.ok) return { ok: false, erro: guarda.erro };

  const userId = String(formData.get('user_id') ?? '');
  if (!userId) return { ok: false, erro: 'Faltou dizer de quem.' };

  const supabase = await criarSupabaseServer();
  const { data, error } = await supabase
    .from('administradores')
    .delete()
    .eq('user_id', userId)
    .select('user_id');

  if (error) {
    return { ok: false, erro: mensagemDoBanco(error.message, 'O banco recusou tirar esse acesso.') };
  }

  if (!data || data.length === 0) {
    return {
      ok: false,
      erro: 'O banco não deixou tirar esse acesso. Ninguém tira o próprio, para não se trancar para fora do painel.',
    };
  }

  revalidatePath('/admin/acessos');
  return { ok: true };
}

/**
 * Troca a senha de alguém da lista.
 *
 * Existe porque não há recuperação por e-mail: quem esquece a senha hoje fica
 * de fora até alguém trocar por ela. O alvo precisa estar na lista, conferido
 * pelo cliente da sessão, cujo RLS só enxerga administradores. Sem essa
 * conferência, a chave de serviço trocaria a senha de qualquer conta do site.
 */
export async function trocarSenha(formData: FormData): Promise<Resultado> {
  const guarda = await exigirAdmin('dono');
  if (!guarda.ok) return { ok: false, erro: guarda.erro };

  const userId = String(formData.get('user_id') ?? '');
  const senha = String(formData.get('senha') ?? '');
  if (!userId) return { ok: false, erro: 'Faltou dizer de quem.' };

  const supabase = await criarSupabaseServer();
  const { data: alvo, error: erroAlvo } = await supabase
    .from('administradores')
    .select('email')
    .eq('user_id', userId)
    .maybeSingle();

  if (erroAlvo || !alvo) {
    return { ok: false, erro: 'Esse acesso não está na lista.' };
  }

  const problema = problemaDaSenha(senha, alvo.email as string);
  if (problema) return { ok: false, erro: problema };

  const servico = clienteDeServico();
  if (!servico) {
    return { ok: false, erro: 'Falta a chave de serviço no servidor. Avise o Pedro.' };
  }

  const { error } = await servico.auth.admin.updateUserById(userId, { password: senha });
  if (error) return { ok: false, erro: error.message };

  return { ok: true };
}
