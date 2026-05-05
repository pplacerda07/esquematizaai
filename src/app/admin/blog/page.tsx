'use client';
import { useState } from 'react';
import styles from './page.module.css';

type Post = {
  id: number;
  title: string;
  category: string;
  date: string;
  status: 'Publicado' | 'Rascunho';
  author: string;
};

const initialPosts: Post[] = [
  { id: 1, title: 'Como estudar para a RFB em 6 meses', category: 'Dicas', date: '02/05/2026', status: 'Publicado', author: 'Admin' },
  { id: 2, title: 'Os 10 erros mais comuns no SEFAZ', category: 'Estratégia', date: '01/05/2026', status: 'Publicado', author: 'Admin' },
  { id: 3, title: 'Mudanças na legislação tributária 2026', category: 'Legislação', date: '29/04/2026', status: 'Rascunho', author: 'Admin' },
  { id: 4, title: 'Mapa de estudo: Direito Tributário do zero', category: 'Guias', date: '25/04/2026', status: 'Publicado', author: 'Admin' },
];

type FormState = { title: string; category: string; summary: string; content: string; status: 'Publicado' | 'Rascunho'; date: string };
const emptyForm: FormState = { title: '', category: 'Dicas', summary: '', content: '', status: 'Publicado', date: '' };

const getCategoryStyle = (cat: string) => {
  const map: Record<string, { bg: string; color: string }> = {
    'Dicas':      { bg: '#d1f0d5', color: '#195350' },
    'Estratégia': { bg: '#bbe3f0', color: '#26344f' },
    'Legislação': { bg: '#fff0eb', color: '#95321F' },
    'Guias':      { bg: '#f0d5f5', color: '#5e2c7a' },
  };
  return map[cat] ?? { bg: '#f0f0f0', color: '#333' };
};

const IconUpload = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
);
const IconEdit = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IconTrash = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [success, setSuccess] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = posts.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    if (!form.title) return;
    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2,'0')}/${String(today.getMonth()+1).padStart(2,'0')}/${today.getFullYear()}`;
    const newPost: Post = {
      id: Date.now(),
      title: form.title,
      category: form.category,
      date: form.date || dateStr,
      status: form.status,
      author: 'Admin',
    };
    setPosts(prev => [newPost, ...prev]);
    setForm(emptyForm);
    setShowForm(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3500);
  };

  const handleDelete = (id: number) => {
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageTag}>Gestão de Conteúdo</p>
          <h1 className={styles.pageTitle}>Blog</h1>
          <p className={styles.pageSubtitle}>Crie e publique artigos para engajar seus alunos.</p>
        </div>
        <button className={styles.btnNew} onClick={() => { setShowForm(true); setForm(emptyForm); }}>
          + Novo Post
        </button>
      </div>

      {success && (
        <div className={styles.toast}>✅ Post publicado com sucesso!</div>
      )}

      <div className={styles.content}>
        <div className={styles.toolbar}>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Buscar por título ou categoria..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <span className={styles.count}>{filtered.length} post(s)</span>
        </div>

        <div className={`${styles.splitLayout} ${showForm ? styles.splitActive : ''}`}>
          {/* Posts list */}
          <div className={styles.listWrap}>
            {filtered.length === 0 && (
              <div className={styles.empty}>Nenhum post encontrado.</div>
            )}

            <div className={styles.postTable}>
              <div className={styles.tableHeader}>
                <span>Post</span>
                <span>Categoria</span>
                <span>Data</span>
                <span>Status</span>
                <span>Ações</span>
              </div>
              {filtered.map(p => {
                const cs = getCategoryStyle(p.category);
                return (
                  <div key={p.id} className={styles.tableRow}>
                    <div className={styles.postInfo}>
                      <div className={styles.postThumb} />
                      <span className={styles.postTitle}>{p.title}</span>
                    </div>
                    <span className={styles.catBadge} style={{ backgroundColor: cs.bg, color: cs.color }}>
                      {p.category}
                    </span>
                    <span className={styles.dateText}>{p.date}</span>
                    <span className={`${styles.statusBadge} ${p.status === 'Publicado' ? styles.published : styles.draft}`}>
                      {p.status}
                    </span>
                    <div className={styles.rowActions}>
                      <button className={styles.iconBtn} title="Editar"><IconEdit /></button>
                      <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} title="Excluir" onClick={() => handleDelete(p.id)}><IconTrash /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Panel */}
          {showForm && (
            <div className={styles.formPanel}>
              <div className={styles.formHeader}>
                <h2 className={styles.formTitle}>Novo Post</h2>
                <button className={styles.btnClose} onClick={() => setShowForm(false)}>✕</button>
              </div>

              <div className={styles.formBody}>
                {/* Cover upload */}
                <div className={styles.uploadArea}>
                  <IconUpload />
                  <span className={styles.uploadText}>Imagem de capa — <strong>clique para selecionar</strong></span>
                  <span className={styles.uploadHint}>PNG, JPG — 16:9 recomendado</span>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Título *</label>
                  <input className={styles.input} placeholder="Ex: Como gabaritar Tributário em 30 dias" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                </div>

                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label className={styles.label}>Categoria</label>
                    <select className={styles.select} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                      <option>Dicas</option>
                      <option>Estratégia</option>
                      <option>Legislação</option>
                      <option>Guias</option>
                      <option>Novidades</option>
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Data de Publicação</label>
                    <input className={styles.input} type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Resumo</label>
                  <textarea className={styles.textarea} rows={2} placeholder="Breve descrição exibida nos cards do blog..." value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Conteúdo</label>
                  <textarea className={styles.textareaLg} rows={6} placeholder="Escreva o conteúdo completo do post aqui..." value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Status</label>
                  <div className={styles.radioGroup}>
                    {(['Publicado', 'Rascunho'] as const).map(s => (
                      <label key={s} className={styles.radioLabel}>
                        <input type="radio" name="postStatus" value={s} checked={form.status === s} onChange={() => setForm(f => ({ ...f, status: s }))} />
                        <span>{s}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className={styles.formActions}>
                  <button className={styles.btnCancel} onClick={() => setShowForm(false)}>Cancelar</button>
                  <button className={styles.btnPublish} onClick={handleSave}>Publicar Post</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
