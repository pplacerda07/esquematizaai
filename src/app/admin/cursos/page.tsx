import { criarSupabaseServer } from '@/lib/supabase/server';
import { produtos } from '@/data/catalogo';
import { sumarioDoProduto } from '@/lib/sumario-produto';
import { lerSobreposicaoSumario } from '@/lib/sumarios-painel';
import Gerenciador, { type CursoAdmin, type OpcaoDisciplina } from './Gerenciador';

export const dynamic = 'force-dynamic';

/**
 * Quais disciplinas entram em cada curso.
 *
 * Pedido do Sérgio: "eu selecionaria o curso Assinatura Resumo Regular e depois
 * selecionaria as disciplinas que iriam entrar nele".
 *
 * O EFEITO REFLEXO QUE ELE PEDIU SAI DE GRAÇA porque o curso guarda um PONTEIRO
 * para a disciplina, não uma cópia dos tópicos. Mudou o sumário da disciplina,
 * mudou em todo curso que a contém, sem ninguém precisar refazer nada.
 *
 * Enquanto um curso não for tocado aqui, valem as regras automáticas de sempre:
 * assinatura leva a linha inteira do formato, combo da linha regular leva a
 * área, isolado casa pelo nome. A tela mostra o que a regra automática está
 * escolhendo hoje, para dar de onde partir em vez de uma lista em branco.
 */

const COM_SUMARIO = ['assinatura', 'combo', 'isolado'];

export default async function CursosAdminPage() {
  const supabase = await criarSupabaseServer();

  const [{ data: disciplinas }, { data: vinculos }] = await Promise.all([
    supabase.from('disciplinas').select('id, nome, formato, area, adotada_em').order('formato').order('nome'),
    supabase.from('curso_disciplinas').select('produto_id, disciplina_id, ordem').order('ordem'),
  ]);

  const opcoes: OpcaoDisciplina[] = (disciplinas ?? []).map((d) => ({
    id: d.id as string,
    nome: d.nome as string,
    formato: d.formato as 'Resumo' | 'Flashcards',
    area: (d.area as string | null) ?? null,
    adotada: Boolean(d.adotada_em),
  }));

  const porNomeFormato = new Map(opcoes.map((o) => [`${o.formato}::${o.nome}`, o.id]));

  const escolhidasPorCurso = new Map<string, string[]>();
  for (const v of vinculos ?? []) {
    const lista = escolhidasPorCurso.get(v.produto_id as string);
    if (lista) lista.push(v.disciplina_id as string);
    else escolhidasPorCurso.set(v.produto_id as string, [v.disciplina_id as string]);
  }

  // a sobreposição é lida uma vez e reaproveitada: são 100 e poucos produtos,
  // e uma consulta por produto seria uma consulta por produto
  const sobreposicao = await lerSobreposicaoSumario();

  const cursos: CursoAdmin[] = produtos
    .filter((p) => COM_SUMARIO.includes(p.categoria) && p.status !== 'inativo')
    .map((p) => {
      const ferramenta = String(p.ferramenta ?? '');
      const temResumos = /resumo|R \+ F/i.test(ferramenta) || /resumo/i.test(p.nome);
      const temFlashcards = /flashcard|R \+ F/i.test(ferramenta) || /flashcard/i.test(p.nome);

      // o que a regra automática escolhe hoje, sem nenhum vínculo manual
      const automatico = sumarioDoProduto(p, temResumos, temFlashcards, {
        ...sobreposicao,
        cursos: new Map(),
      })
        .map((d) => porNomeFormato.get(`${d.formato}::${d.disciplina}`))
        .filter((x): x is string => Boolean(x));

      return {
        id: p.id,
        nome: p.nome,
        categoria: p.categoria,
        area: p.area,
        escolhidas: escolhidasPorCurso.get(p.id) ?? null,
        automaticas: automatico,
      };
    });

  return <Gerenciador cursos={cursos} disciplinas={opcoes} />;
}
