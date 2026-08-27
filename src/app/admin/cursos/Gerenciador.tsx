'use client';

import { useMemo, useState, useTransition } from 'react';
import { salvarDisciplinasDoCurso, limparDisciplinasDoCurso } from './actions';
import styles from '../sumarios/page.module.css';

export interface OpcaoDisciplina {
  id: string;
  nome: string;
  formato: 'Resumo' | 'Flashcards';
  area: string | null;
  adotada: boolean;
}

export interface CursoAdmin {
  id: string;
  nome: string;
  categoria: string;
  area: string | null;
  /** null = ainda segue a regra automática */
  escolhidas: string[] | null;
  /** o que a regra automática escolhe hoje, para servir de ponto de partida */
  automaticas: string[];
}

function semAcento(t: string) {
  return t
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

export default function Gerenciador({
  cursos,
  disciplinas,
}: {
  cursos: CursoAdmin[];
  disciplinas: OpcaoDisciplina[];
}) {
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<'todos' | 'automatico' | 'manual'>('todos');
  const [abertoId, setAbertoId] = useState<string | null>(null);
  const [marcadas, setMarcadas] = useState<Set<string>>(new Set());
  const [buscaDisciplina, setBuscaDisciplina] = useState('');
  const [aviso, setAviso] = useState<{ id: string; texto: string; erro: boolean } | null>(null);
  const [salvando, iniciar] = useTransition();

  const visiveis = useMemo(() => {
    const termo = semAcento(busca).trim();
    return cursos.filter((c) => {
      if (filtro === 'manual' && !c.escolhidas) return false;
      if (filtro === 'automatico' && c.escolhidas) return false;
      if (!termo) return true;
      return semAcento(c.nome).includes(termo);
    });
  }, [cursos, busca, filtro]);

  const contagem = useMemo(
    () => ({ total: cursos.length, manuais: cursos.filter((c) => c.escolhidas).length }),
    [cursos],
  );

  const opcoesVisiveis = useMemo(() => {
    const termo = semAcento(buscaDisciplina).trim();
    if (!termo) return disciplinas;
    return disciplinas.filter((d) => semAcento(d.nome).includes(termo));
  }, [disciplinas, buscaDisciplina]);

  function abrir(c: CursoAdmin) {
    if (abertoId === c.id) {
      setAbertoId(null);
      return;
    }
    setAbertoId(c.id);
    setBuscaDisciplina('');
    setAviso(null);
    // parte do que já está valendo: as escolhidas à mão, ou o que a regra
    // automática entrega hoje. Lista em branco obrigaria a remontar tudo.
    setMarcadas(new Set(c.escolhidas ?? c.automaticas));
  }

  function alternar(id: string) {
    setMarcadas((atual) => {
      const nova = new Set(atual);
      if (nova.has(id)) nova.delete(id);
      else nova.add(id);
      return nova;
    });
  }

  function salvar(c: CursoAdmin) {
    const fd = new FormData();
    fd.set('produto_id', c.id);
    for (const id of marcadas) fd.append('disciplina', id);

    setAviso(null);
    iniciar(async () => {
      const r = await salvarDisciplinasDoCurso(fd);
      setAviso({
        id: c.id,
        texto: r.ok
          ? `Salvo: ${marcadas.size} disciplinas neste curso. A página atualiza em até 1 minuto.`
          : (r.erro ?? 'Falhou.'),
        erro: !r.ok,
      });
    });
  }

  function voltarAoAutomatico(c: CursoAdmin) {
    const fd = new FormData();
    fd.set('produto_id', c.id);
    setAviso(null);
    iniciar(async () => {
      const r = await limparDisciplinasDoCurso(fd);
      setAviso({
        id: c.id,
        texto: r.ok ? 'Este curso voltou a seguir a regra automática.' : (r.erro ?? 'Falhou.'),
        erro: !r.ok,
      });
      if (r.ok) setMarcadas(new Set(c.automaticas));
    });
  }

  return (
    <div className={styles.pagina}>
      <header className={styles.cabecalho}>
        <div>
          <h1 className={styles.titulo}>Disciplinas de cada curso</h1>
          <p className={styles.subtitulo}>
            {contagem.total} cursos. {contagem.manuais} com disciplinas escolhidas à mão.
          </p>
        </div>
      </header>

      {/* Não há "novo curso" aqui de propósito: curso é produto, e produto
          nasce na planilha do Sérgio. Sem dizer isso, a tela parece ter perdido
          um botão. */}
      <p className={styles.explicacao}>
        Os cursos vêm da planilha de produtos, então não se cadastra curso por aqui, só se escolhe
        as disciplinas de cada um. Para criar uma disciplina que não existe, use a tela de Sumários.
      </p>

      <p className={styles.explicacao}>
        Enquanto um curso não for salvo aqui, ele segue a regra automática: assinatura leva a linha
        inteira do formato, combo por área leva as disciplinas daquela área, e material isolado leva
        a disciplina do próprio nome. Ao salvar, passa a valer exatamente o que você marcar. O curso
        aponta para a disciplina, então mexer no sumário dela atualiza todos os cursos que a contêm.
      </p>

      <div className={styles.controles}>
        <input
          type="search"
          className={styles.busca}
          placeholder="Buscar curso"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <div className={styles.filtros}>
          {(
            [
              ['todos', `Todos (${contagem.total})`],
              ['automatico', `Automáticos (${contagem.total - contagem.manuais})`],
              ['manual', `Escolhidos à mão (${contagem.manuais})`],
            ] as const
          ).map(([valor, rotulo]) => (
            <button
              key={valor}
              type="button"
              className={`${styles.filtro} ${filtro === valor ? styles.filtroAtivo : ''}`}
              onClick={() => setFiltro(valor)}
              aria-pressed={filtro === valor}
            >
              {rotulo}
            </button>
          ))}
        </div>
      </div>

      <ul className={styles.lista}>
        {visiveis.map((c) => {
          const aberto = abertoId === c.id;
          const quantas = c.escolhidas ? c.escolhidas.length : c.automaticas.length;

          return (
            <li key={c.id} className={styles.item}>
              <button type="button" className={styles.abrir} onClick={() => abrir(c)} aria-expanded={aberto}>
                <span className={styles.nome}>{c.nome}</span>
                <span className={`${styles.marca} ${styles.marcaFlash}`}>{c.categoria}</span>
                <span className={styles.medida}>{quantas} disciplinas</span>
                <span className={`${styles.origem} ${c.escolhidas ? styles.origemPainel : ''}`}>
                  {c.escolhidas ? 'escolhidas à mão' : 'automático'}
                </span>
                <span className={styles.area}>{c.area ?? 'sem área'}</span>
                <span className={styles.seta} aria-hidden="true">
                  {aberto ? '▴' : '▾'}
                </span>
              </button>

              {aberto && (
                <div className={styles.editor}>
                  <input
                    type="search"
                    className={styles.busca}
                    placeholder="Filtrar disciplinas"
                    value={buscaDisciplina}
                    onChange={(e) => setBuscaDisciplina(e.target.value)}
                  />

                  <p className={styles.rodape}>
                    {marcadas.size} marcadas de {disciplinas.length} disponíveis
                  </p>

                  <div className={styles.grade}>
                    {opcoesVisiveis.map((d) => (
                      <label key={d.id} className={styles.opcao}>
                        <input
                          type="checkbox"
                          checked={marcadas.has(d.id)}
                          onChange={() => alternar(d.id)}
                        />
                        <span className={styles.opcaoNome}>{d.nome}</span>
                        <span
                          className={`${styles.marca} ${d.formato === 'Resumo' ? styles.marcaResumo : styles.marcaFlash}`}
                        >
                          {d.formato}
                        </span>
                      </label>
                    ))}
                  </div>

                  <div className={styles.acoes}>
                    <button
                      type="button"
                      className={styles.salvar}
                      disabled={salvando}
                      onClick={() => salvar(c)}
                    >
                      {salvando ? 'Salvando...' : 'Salvar disciplinas deste curso'}
                    </button>

                    {c.escolhidas && (
                      <button
                        type="button"
                        className={styles.desfazer}
                        disabled={salvando}
                        onClick={() => voltarAoAutomatico(c)}
                      >
                        Voltar para a regra automática
                      </button>
                    )}
                  </div>

                  {aviso?.id === c.id && (
                    <p className={aviso.erro ? styles.erro : styles.sucesso}>{aviso.texto}</p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {visiveis.length === 0 && <p className={styles.vazio}>Nenhum curso com esse filtro.</p>}
    </div>
  );
}
