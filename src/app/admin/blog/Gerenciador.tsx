'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { PostResumo } from '@/lib/blog';
import { salvarPost, excluirPost, alternarPublicacao } from './actions';
import styles from './page.module.css';

type FormState = {
  id: string;
  titulo: string;
  categoria: string;
  autor: string;
  resumo: string;
  conteudo: string;
  capa_url: string;
  status: 'publicado' | 'rascunho';
};

const vazio: FormState = {
  id: '',
  titulo: '',
  categoria: 'Dicas',
  autor: 'Equipe Esquematiza Aí',
  resumo: '',
  conteudo: '',
  capa_url: '',
  status: 'rascunho',
};

const CATEGORIAS = ['Dicas', 'Estratégia', 'Legislação', 'Guias', 'Novidades'];

const getCategoryStyle = (cat: string) => {
  const map: Record<string, { bg: string; color: string }> = {
    Dicas: { bg: '#d1f0d5', color: '#195350' },
    Estratégia: { bg: '#bbe3f0', color: '#26344f' },
    Legislação: { bg: '#fff0eb', color: '#95321F' },
    Guias: { bg: '#f0d5f5', color: '#5e2c7a' },
    Novidades: { bg: '#bbe3f0', color: '#26344f' },
  };
  return map[cat] ?? { bg: '#f0f0f0', color: '#333' };
};

const IconEdit = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const IconTrash = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
);

function formatarData(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR');
}

export default function Gerenciador({ postsIniciais }: { postsIniciais: PostResumo[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(vazio);
  const [busca, setBusca] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, startTransition] = useTransition();

  const filtrados = postsIniciais.filter(
    (p) =>
      p.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      p.categoria.toLowerCase().includes(busca.toLowerCase()),
  );

  const avisar = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const novoPost = () => {
    setForm(vazio);
    setErro(null);
    setShowForm(true);
  };

  const editarPost = async (id: string) => {
    setErro(null);
    // busca o post completo (com conteúdo) via endpoint interno
    const res = await fetch(`/admin/blog/${id}/dados`);
    if (!res.ok) {
      avisar('Não consegui abrir esse post.');
      return;
    }
    const p = await res.json();
    setForm({
      id: p.id,
      titulo: p.titulo ?? '',
      categoria: p.categoria ?? 'Dicas',
      autor: p.autor ?? 'Equipe Esquematiza Aí',
      resumo: p.resumo ?? '',
      conteudo: p.conteudo ?? '',
      capa_url: p.capa_url ?? '',
      status: p.status ?? 'rascunho',
    });
    setShowForm(true);
  };

  const salvar = () => {
    setErro(null);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    startTransition(async () => {
      const r = await salvarPost(fd);
      if (!r.ok) {
        setErro(r.erro ?? 'Não consegui salvar.');
        return;
      }
      setShowForm(false);
      setForm(vazio);
      avisar(form.id ? 'Post atualizado!' : 'Post criado!');
      router.refresh();
    });
  };

  const remover = (id: string, titulo: string) => {
    if (!confirm(`Excluir "${titulo}"? Isso não pode ser desfeito.`)) return;
    startTransition(async () => {
      const r = await excluirPost(id);
      if (!r.ok) { avisar('Erro ao excluir.'); return; }
      avisar('Post excluído.');
      router.refresh();
    });
  };

  const publicarAlternar = (p: PostResumo) => {
    const novo = p.status === 'publicado' ? 'rascunho' : 'publicado';
    startTransition(async () => {
      const r = await alternarPublicacao(p.id, novo);
      if (!r.ok) { avisar('Erro ao mudar o status.'); return; }
      avisar(novo === 'publicado' ? 'Post publicado!' : 'Post virou rascunho.');
      router.refresh();
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageTag}>Gestão de Conteúdo</p>
          <h1 className={styles.pageTitle}>Blog</h1>
          <p className={styles.pageSubtitle}>Escreva e publique artigos para o blog do site.</p>
        </div>
        <button className={styles.btnNew} onClick={novoPost}>+ Novo Post</button>
      </div>

      {toast && <div className={styles.toast}>✅ {toast}</div>}

      <div className={styles.content}>
        <div className={styles.toolbar}>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Buscar por título ou categoria..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <span className={styles.count}>{filtrados.length} post(s)</span>
        </div>

        <div className={`${styles.splitLayout} ${showForm ? styles.splitActive : ''}`}>
          <div className={styles.listWrap}>
            {filtrados.length === 0 && <div className={styles.empty}>Nenhum post ainda. Crie o primeiro!</div>}

            {filtrados.length > 0 && (
              <div className={styles.postTable}>
                <div className={styles.tableHeader}>
                  <span>Post</span><span>Categoria</span><span>Data</span><span>Status</span><span>Ações</span>
                </div>
                {filtrados.map((p) => {
                  const cs = getCategoryStyle(p.categoria);
                  return (
                    <div key={p.id} className={styles.tableRow}>
                      <div className={styles.postInfo}>
                        <div className={styles.postThumb} />
                        <span className={styles.postTitle}>{p.titulo}</span>
                      </div>
                      <span className={styles.catBadge} style={{ backgroundColor: cs.bg, color: cs.color }}>{p.categoria}</span>
                      <span className={styles.dateText}>{formatarData(p.publicado_em ?? p.atualizado_em)}</span>
                      <button
                        className={`${styles.statusBadge} ${p.status === 'publicado' ? styles.published : styles.draft}`}
                        onClick={() => publicarAlternar(p)}
                        disabled={pendente}
                        title="Clique para alternar publicado/rascunho"
                        style={{ cursor: 'pointer', border: 'none' }}
                      >
                        {p.status === 'publicado' ? 'Publicado' : 'Rascunho'}
                      </button>
                      <div className={styles.rowActions}>
                        <button className={styles.iconBtn} title="Editar" onClick={() => editarPost(p.id)}><IconEdit /></button>
                        <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} title="Excluir" onClick={() => remover(p.id, p.titulo)}><IconTrash /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {showForm && (
            <div className={styles.formPanel}>
              <div className={styles.formHeader}>
                <h2 className={styles.formTitle}>{form.id ? 'Editar post' : 'Novo post'}</h2>
                <button className={styles.btnClose} onClick={() => setShowForm(false)}>✕</button>
              </div>

              <div className={styles.formBody}>
                <div className={styles.field}>
                  <label className={styles.label}>Título *</label>
                  <input className={styles.input} placeholder="Ex: Como gabaritar Tributário em 30 dias" value={form.titulo} onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))} />
                </div>

                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label className={styles.label}>Categoria</label>
                    <select className={styles.select} value={form.categoria} onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}>
                      {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Autor</label>
                    <input className={styles.input} value={form.autor} onChange={(e) => setForm((f) => ({ ...f, autor: e.target.value }))} />
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Resumo <span style={{ fontWeight: 400, color: '#888' }}>(aparece nos cards e no Google)</span></label>
                  <textarea className={styles.textarea} rows={2} placeholder="Uma frase que resume o artigo..." value={form.resumo} onChange={(e) => setForm((f) => ({ ...f, resumo: e.target.value }))} />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Conteúdo</label>
                  <textarea className={styles.textareaLg} rows={10} placeholder="Escreva o artigo aqui..." value={form.conteudo} onChange={(e) => setForm((f) => ({ ...f, conteudo: e.target.value }))} />
                  <span style={{ fontSize: '0.78rem', color: '#888', marginTop: '0.4rem', display: 'block' }}>
                    Dicas de formatação: <code>## Subtítulo</code> · <code>**negrito**</code> · <code>- item de lista</code> · <code>&gt; citação</code>
                  </span>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>URL da capa <span style={{ fontWeight: 400, color: '#888' }}>(opcional por enquanto)</span></label>
                  <input className={styles.input} placeholder="https://..." value={form.capa_url} onChange={(e) => setForm((f) => ({ ...f, capa_url: e.target.value }))} />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Status</label>
                  <div className={styles.radioGroup}>
                    {(['publicado', 'rascunho'] as const).map((s) => (
                      <label key={s} className={styles.radioLabel}>
                        <input type="radio" name="postStatus" checked={form.status === s} onChange={() => setForm((f) => ({ ...f, status: s }))} />
                        <span>{s === 'publicado' ? 'Publicar agora' : 'Salvar como rascunho'}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {erro && <p style={{ color: '#95321F', background: 'rgba(255,115,69,0.1)', padding: '0.6rem 0.8rem', borderRadius: '0.5rem', fontSize: '0.9rem' }}>{erro}</p>}

                <div className={styles.formActions}>
                  <button className={styles.btnCancel} onClick={() => setShowForm(false)} disabled={pendente}>Cancelar</button>
                  <button className={styles.btnPublish} onClick={salvar} disabled={pendente}>
                    {pendente ? 'Salvando...' : form.id ? 'Salvar alterações' : 'Salvar post'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
