'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { NoticiaCompleta } from '@/lib/blog';
import { salvarNoticia, excluirNoticia, alternarPublicacaoNoticia } from './actions';
import styles from './page.module.css';

type FormState = {
  id: string;
  titulo: string;
  resumo: string;
  conteudo: string;
  fonte: string;
  url_fonte: string;
  autor: string;
  status: 'publicado' | 'rascunho';
};

const vazio: FormState = {
  id: '',
  titulo: '',
  resumo: '',
  conteudo: '',
  fonte: '',
  url_fonte: '',
  autor: 'Redação Esquematiza Aí',
  status: 'rascunho',
};

function formatarData(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR');
}

export default function Gerenciador({ noticiasIniciais }: { noticiasIniciais: NoticiaCompleta[] }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(vazio);
  const [editando, setEditando] = useState(false);
  const [erro, setErro] = useState('');
  const [salvando, iniciarSalvamento] = useTransition();

  const abrirNovo = () => {
    setForm(vazio);
    setEditando(true);
    setErro('');
  };

  const abrirEdicao = (n: NoticiaCompleta) => {
    setForm({
      id: n.id,
      titulo: n.titulo,
      resumo: n.resumo ?? '',
      conteudo: n.conteudo ?? '',
      fonte: n.fonte ?? '',
      url_fonte: n.url_fonte ?? '',
      autor: n.autor,
      status: n.status === 'publicado' ? 'publicado' : 'rascunho',
    });
    setEditando(true);
    setErro('');
  };

  const salvar = () => {
    setErro('');
    const dados = new FormData();
    Object.entries(form).forEach(([k, v]) => dados.append(k, v));

    iniciarSalvamento(async () => {
      const r = await salvarNoticia(dados);
      if (!r.ok) {
        setErro(r.erro ?? 'Não foi possível salvar.');
        return;
      }
      setEditando(false);
      setForm(vazio);
      router.refresh();
    });
  };

  const remover = (n: NoticiaCompleta) => {
    if (!confirm(`Excluir "${n.titulo}"? Isso não tem volta.`)) return;
    iniciarSalvamento(async () => {
      await excluirNoticia(n.id);
      router.refresh();
    });
  };

  const alternar = (n: NoticiaCompleta) => {
    const novo = n.status === 'publicado' ? 'rascunho' : 'publicado';
    iniciarSalvamento(async () => {
      await alternarPublicacaoNoticia(n.id, novo);
      router.refresh();
    });
  };

  return (
    <div className={styles.pagina}>
      <header className={styles.cabecalho}>
        <div>
          <h1 className={styles.titulo}>Notícias</h1>
          <p className={styles.subtitulo}>
            {noticiasIniciais.length} no total. As publicadas aparecem na home e em /noticias.
          </p>
        </div>
        {!editando && (
          <button type="button" className={styles.btnPrimario} onClick={abrirNovo}>
            Nova notícia
          </button>
        )}
      </header>

      {/* Recado que evita a dúvida mais provável: "por que a matéria do robô
          não apareceu?". Quase sempre é porque veio como rascunho. */}
      <p className={styles.dica}>
        As notícias publicadas pela automação também aparecem nesta lista. Se vierem como
        rascunho, elas ficam salvas aqui sem sair no site até você publicar.
      </p>

      {editando ? (
        <div className={styles.formulario}>
          <div className={styles.linha}>
            <label className={styles.campo}>
              <span className={styles.rotulo}>Título</span>
              <input
                className={styles.input}
                value={form.titulo}
                onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
                placeholder="Concurso SEFAZ-BA: edital previsto para setembro com 187 vagas"
              />
            </label>
          </div>

          <label className={styles.campo}>
            <span className={styles.rotulo}>
              Resumo <em className={styles.ajuda}>aparece no Google e no card da home</em>
            </span>
            <textarea
              className={styles.textarea}
              rows={2}
              value={form.resumo}
              onChange={(e) => setForm((f) => ({ ...f, resumo: e.target.value }))}
            />
          </label>

          <label className={styles.campo}>
            <span className={styles.rotulo}>
              Texto da matéria{' '}
              <em className={styles.ajuda}>
                Markdown: ## para seção, :::importante para caixa de destaque
              </em>
            </span>
            <textarea
              className={styles.textareaGrande}
              rows={14}
              value={form.conteudo}
              onChange={(e) => setForm((f) => ({ ...f, conteudo: e.target.value }))}
            />
          </label>

          <div className={styles.linha}>
            <label className={styles.campo}>
              <span className={styles.rotulo}>Fonte</span>
              <input
                className={styles.input}
                value={form.fonte}
                onChange={(e) => setForm((f) => ({ ...f, fonte: e.target.value }))}
                placeholder="Estratégia Concursos"
              />
            </label>
            <label className={styles.campo}>
              <span className={styles.rotulo}>Link da fonte</span>
              <input
                className={styles.input}
                value={form.url_fonte}
                onChange={(e) => setForm((f) => ({ ...f, url_fonte: e.target.value }))}
                placeholder="https://..."
              />
            </label>
          </div>

          <div className={styles.linha}>
            <label className={styles.campo}>
              <span className={styles.rotulo}>Autor</span>
              <input
                className={styles.input}
                value={form.autor}
                onChange={(e) => setForm((f) => ({ ...f, autor: e.target.value }))}
              />
            </label>
            <label className={styles.campo}>
              <span className={styles.rotulo}>Situação</span>
              <select
                className={styles.input}
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value as FormState['status'] }))
                }
              >
                <option value="rascunho">Rascunho (não aparece no site)</option>
                <option value="publicado">Publicado</option>
              </select>
            </label>
          </div>

          {erro && <p className={styles.erro}>{erro}</p>}

          <div className={styles.acoesForm}>
            <button type="button" className={styles.btnPrimario} onClick={salvar} disabled={salvando}>
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              type="button"
              className={styles.btnSecundario}
              onClick={() => { setEditando(false); setErro(''); }}
              disabled={salvando}
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.lista}>
          {noticiasIniciais.length === 0 ? (
            <p className={styles.vazio}>Nenhuma notícia ainda.</p>
          ) : (
            noticiasIniciais.map((n) => (
              <article key={n.id} className={styles.item}>
                <div className={styles.itemTexto}>
                  <div className={styles.itemTopo}>
                    <span
                      className={`${styles.selo} ${n.status === 'publicado' ? styles.seloAtivo : styles.seloRascunho}`}
                    >
                      {n.status === 'publicado' ? 'Publicada' : 'Rascunho'}
                    </span>
                    <span className={styles.itemData}>{formatarData(n.publicado_em)}</span>
                    {n.fonte && <span className={styles.itemFonte}>Fonte: {n.fonte}</span>}
                  </div>
                  <h2 className={styles.itemTitulo}>{n.titulo}</h2>
                  {n.resumo && <p className={styles.itemResumo}>{n.resumo}</p>}
                  {!n.conteudo && (
                    <p className={styles.aviso}>
                      Sem texto de matéria. Não aparece no site enquanto estiver assim.
                    </p>
                  )}
                </div>

                <div className={styles.itemAcoes}>
                  <button type="button" className={styles.btnLinha} onClick={() => abrirEdicao(n)}>
                    Editar
                  </button>
                  <button type="button" className={styles.btnLinha} onClick={() => alternar(n)} disabled={salvando}>
                    {n.status === 'publicado' ? 'Despublicar' : 'Publicar'}
                  </button>
                  {n.slug && (
                    <a
                      className={styles.btnLinha}
                      href={`/noticias/${n.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver no site
                    </a>
                  )}
                  <button
                    type="button"
                    className={`${styles.btnLinha} ${styles.btnPerigo}`}
                    onClick={() => remover(n)}
                    disabled={salvando}
                  >
                    Excluir
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      )}
    </div>
  );
}
