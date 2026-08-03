import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { timingSafeEqual } from 'node:crypto';

/**
 * Publicação de notícia por automação.
 *
 * É por aqui que o Claude do Sérgio publica. A documentação para ele está em
 * docs/publicar-noticia.md, na raiz do projeto.
 *
 * POR QUE UMA ROTA E NÃO ACESSO DIRETO AO BANCO:
 * dar a chave do Supabase para uma automação externa é dar poder de apagar
 * qualquer tabela. Aqui a automação só consegue fazer uma coisa: criar
 * notícia. E toda entrada passa por validação antes de virar página no ar.
 */

export const runtime = 'nodejs';

const TOKEN = process.env.NOTICIAS_API_TOKEN;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** "Concurso SEFAZ-BA: 187 vagas" -> "concurso-sefaz-ba-187-vagas" */
function gerarSlug(titulo: string): string {
  return titulo
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function erro(mensagem: string, status: number, ajuda?: string) {
  return NextResponse.json({ ok: false, erro: mensagem, ajuda }, { status });
}

/**
 * Compara o token em tempo constante.
 *
 * `a !== b` para de comparar no primeiro caractere diferente, e o tempo de
 * resposta muda conforme quantos caracteres iniciais estavam certos. Com
 * medições suficientes dá para descobrir o token caractere por caractere.
 * O hash antes da comparação garante o mesmo comprimento nos dois lados.
 */
function tokenConfere(enviado: string, esperado: string): boolean {
  if (!enviado || !esperado) return false;
  const a = Buffer.from(enviado.padEnd(128).slice(0, 128));
  const b = Buffer.from(esperado.padEnd(128).slice(0, 128));
  return timingSafeEqual(a, b) && enviado.length === esperado.length;
}

/**
 * Limite de chamadas por janela de tempo, em memória.
 *
 * Sem isso, um script pode tentar milhares de tokens por minuto, ou encher o
 * banco de matérias. Guardar em memória basta aqui: cada instância limita a si
 * mesma, e o volume esperado é de algumas notícias por dia. Se um dia precisar
 * ser exato entre instâncias, troca-se por Redis sem mudar o resto.
 */
const CHAMADAS = new Map<string, { contagem: number; ate: number }>();
const JANELA_MS = 60_000;
const MAXIMO_POR_JANELA = 20;

function excedeuLimite(chave: string): boolean {
  const agora = Date.now();
  const atual = CHAMADAS.get(chave);

  if (!atual || agora > atual.ate) {
    CHAMADAS.set(chave, { contagem: 1, ate: agora + JANELA_MS });
    // limpeza preguiçosa: sem isso o Map cresce para sempre
    if (CHAMADAS.size > 500) {
      for (const [k, v] of CHAMADAS) if (agora > v.ate) CHAMADAS.delete(k);
    }
    return false;
  }

  atual.contagem += 1;
  return atual.contagem > MAXIMO_POR_JANELA;
}

function identificar(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'desconhecido'
  );
}

export async function POST(req: Request) {
  if (!TOKEN || !SUPABASE_URL || !SERVICE_KEY) {
    return erro(
      'Servidor sem configuração de publicação.',
      500,
      'Faltam variáveis de ambiente: NOTICIAS_API_TOKEN e SUPABASE_SERVICE_ROLE_KEY.',
    );
  }

  if (excedeuLimite(identificar(req))) {
    return erro(
      'Muitas requisições. Espere um minuto e tente de novo.',
      429,
      `O limite é de ${MAXIMO_POR_JANELA} chamadas por minuto.`,
    );
  }

  const autorizacao = req.headers.get('authorization') ?? '';
  const enviado = autorizacao.replace(/^Bearer\s+/i, '').trim();
  if (!tokenConfere(enviado, TOKEN)) {
    return erro('Token inválido ou ausente.', 401, 'Envie o cabeçalho: Authorization: Bearer SEU_TOKEN');
  }

  let corpo: Record<string, unknown>;
  try {
    corpo = await req.json();
  } catch {
    return erro('Corpo da requisição não é um JSON válido.', 400);
  }

  const titulo = typeof corpo.titulo === 'string' ? corpo.titulo.trim() : '';
  const conteudo = typeof corpo.conteudo === 'string' ? corpo.conteudo.trim() : '';
  const resumo = typeof corpo.resumo === 'string' ? corpo.resumo.trim() : '';

  // As três validações abaixo existem porque cada uma já custou caro no site:
  // matéria sem texto vira página vazia indexada; título curto demais não diz
  // nada na listagem; resumo é o que aparece no Google e no card da home.
  if (titulo.length < 15) {
    return erro('O campo "titulo" é obrigatório e precisa ter pelo menos 15 caracteres.', 400);
  }
  if (conteudo.length < 200) {
    return erro(
      'O campo "conteudo" é obrigatório e precisa ter pelo menos 200 caracteres.',
      400,
      'Notícia sem texto vira uma página vazia indexada pelo Google. Escreva a matéria completa.',
    );
  }
  if (resumo.length < 40) {
    return erro(
      'O campo "resumo" é obrigatório e precisa ter pelo menos 40 caracteres.',
      400,
      'O resumo é o que aparece no Google e no card da home.',
    );
  }

  const status = corpo.status === 'rascunho' ? 'rascunho' : 'publicado';
  const slug = typeof corpo.slug === 'string' && corpo.slug.trim()
    ? gerarSlug(corpo.slug)
    : gerarSlug(titulo);

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
  });

  // slug repetido derrubaria a página existente; melhor avisar do que sobrescrever
  const { data: existente } = await supabase
    .from('noticias')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  if (existente) {
    return erro(
      `Já existe uma notícia com o endereço "${slug}".`,
      409,
      'Mude o título ou envie um campo "slug" diferente.',
    );
  }

  const { data, error } = await supabase
    .from('noticias')
    .insert({
      titulo,
      resumo,
      conteudo,
      slug,
      status,
      fonte: typeof corpo.fonte === 'string' ? corpo.fonte.trim() || null : null,
      url_fonte: typeof corpo.url_fonte === 'string' ? corpo.url_fonte.trim() || null : null,
      autor: typeof corpo.autor === 'string' && corpo.autor.trim()
        ? corpo.autor.trim()
        : 'Redação Esquematiza Aí',
    })
    .select('id, slug, titulo, status')
    .single();

  if (error) {
    return erro(`Não foi possível salvar: ${error.message}`, 500);
  }

  return NextResponse.json({
    ok: true,
    id: data.id,
    slug: data.slug,
    status: data.status,
    url: `/noticias/${data.slug}`,
    aviso: data.status === 'rascunho'
      ? 'Salva como rascunho. Ela só aparece no site depois de publicada no painel.'
      : 'Publicada. Aparece no site em até 1 minuto.',
  });
}

/** GET serve de teste de vida: a automação confere se o token funciona. */
export async function GET(req: Request) {
  if (excedeuLimite(identificar(req))) {
    return NextResponse.json({ ok: false, erro: 'Muitas requisições.' }, { status: 429 });
  }

  const autorizacao = req.headers.get('authorization') ?? '';
  const enviado = autorizacao.replace(/^Bearer\s+/i, '').trim();
  const autorizado = Boolean(TOKEN) && tokenConfere(enviado, TOKEN!);

  return NextResponse.json(
    {
      ok: autorizado,
      servico: 'publicação de notícias do Esquematiza Aí',
      mensagem: autorizado
        ? 'Token válido. Pode publicar com POST.'
        : 'Token inválido ou ausente.',
    },
    { status: autorizado ? 200 : 401 },
  );
}
