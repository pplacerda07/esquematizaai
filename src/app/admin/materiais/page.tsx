'use client';
import { useState } from 'react';
import styles from './page.module.css';

type Material = {
  id: number;
  name: string;
  category: string;
  price: string;
  oldPrice: string;
  type: string;
  status: 'Publicado' | 'Rascunho';
  featured: boolean;
};

const initialMaterials: Material[] = [
  { id: 1, name: 'Mapa Mental — Tributário Completo', category: 'Tributário', price: '79,90', oldPrice: '119,90', type: 'Mapa Mental', status: 'Publicado', featured: true },
  { id: 2, name: 'Resumo Visual — Receita Federal', category: 'Receita Federal', price: '59,90', oldPrice: '89,90', type: 'Resumo Visual', status: 'Publicado', featured: false },
  { id: 3, name: 'Questões Comentadas SEFAZ-SP', category: 'SEFAZ', price: '89,90', oldPrice: '129,90', type: 'Questões', status: 'Rascunho', featured: false },
  { id: 4, name: 'Esquema Visual — ICMS e IPI', category: 'Tributário', price: '49,90', oldPrice: '79,90', type: 'Esquema', status: 'Publicado', featured: false },
];

type FormState = { name: string; category: string; price: string; oldPrice: string; type: string; status: 'Publicado' | 'Rascunho'; featured: boolean; description: string };
const emptyForm: FormState = { name: '', category: 'Tributário', price: '', oldPrice: '', type: 'Mapa Mental', status: 'Publicado', featured: false, description: '' };

const IconUpload = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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

const colorMap: Record<string, string> = {
  'Tributário':     '#bbe3f0',
  'Receita Federal':'#d1f0d5',
  'SEFAZ':          '#fff0eb',
  'Auditoria':      '#f0d5f5',
};

export default function MateriaisPage() {
  const [materials, setMaterials] = useState<Material[]>(initialMaterials);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [success, setSuccess] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = materials.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    if (!form.name || !form.price) return;
    const newMat: Material = {
      id: Date.now(),
      name: form.name,
      category: form.category,
      price: form.price,
      oldPrice: form.oldPrice,
      type: form.type,
      status: form.status,
      featured: form.featured,
    };
    setMaterials(prev => [newMat, ...prev]);
    setForm(emptyForm);
    setShowForm(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3500);
  };

  const handleDelete = (id: number) => {
    setMaterials(prev => prev.filter(m => m.id !== id));
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageTag}>Gestão de Conteúdo</p>
          <h1 className={styles.pageTitle}>Materiais</h1>
          <p className={styles.pageSubtitle}>Cadastre e gerencie os materiais disponíveis para venda.</p>
        </div>
        <button className={styles.btnNew} onClick={() => { setShowForm(true); setForm(emptyForm); }}>
          + Novo Material
        </button>
      </div>

      {/* Success toast */}
      {success && (
        <div className={styles.toast}>
          ✅ Material publicado com sucesso!
        </div>
      )}

      <div className={styles.content}>
        {/* Search bar */}
        <div className={styles.toolbar}>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Buscar por nome ou categoria..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <span className={styles.count}>{filtered.length} material(is)</span>
        </div>

        {/* Split layout */}
        <div className={`${styles.splitLayout} ${showForm ? styles.splitActive : ''}`}>
          {/* Materials Grid */}
          <div className={styles.gridWrap}>
            {filtered.length === 0 && (
              <div className={styles.empty}>Nenhum material encontrado.</div>
            )}
            <div className={styles.grid}>
              {filtered.map(m => (
                <div key={m.id} className={styles.card}>
                  <div className={styles.cardThumb} style={{ backgroundColor: colorMap[m.category] || '#bbe3f0' }}>
                    {m.featured && <span className={styles.featuredBadge}>★ Destaque</span>}
                  </div>
                  <div className={styles.cardBody}>
                    <span className={styles.typeBadge}>{m.type}</span>
                    <p className={styles.cardName}>{m.name}</p>
                    <div className={styles.priceRow}>
                      <span className={styles.oldPrice}>R$ {m.oldPrice}</span>
                      <span className={styles.price}>R$ {m.price}</span>
                    </div>
                    <div className={styles.cardFooter}>
                      <span className={`${styles.statusBadge} ${m.status === 'Publicado' ? styles.published : styles.draft}`}>
                        {m.status}
                      </span>
                      <div className={styles.actions}>
                        <button className={styles.iconBtn} title="Editar"><IconEdit /></button>
                        <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} title="Excluir" onClick={() => handleDelete(m.id)}><IconTrash /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Panel */}
          {showForm && (
            <div className={styles.formPanel}>
              <div className={styles.formHeader}>
                <h2 className={styles.formTitle}>Novo Material</h2>
                <button className={styles.btnClose} onClick={() => setShowForm(false)}>✕</button>
              </div>

              <div className={styles.formBody}>
                {/* Photo upload */}
                <div className={styles.uploadArea}>
                  <IconUpload />
                  <span className={styles.uploadText}>Arraste a foto aqui ou <strong>clique para selecionar</strong></span>
                  <span className={styles.uploadHint}>PNG, JPG — máx. 5MB</span>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Nome do Material *</label>
                  <input className={styles.input} placeholder="Ex: Mapa Mental — Tributário" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Descrição</label>
                  <textarea className={styles.textarea} rows={3} placeholder="Descreva brevemente o conteúdo do material..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>

                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label className={styles.label}>Categoria</label>
                    <select className={styles.select} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                      <option>Tributário</option>
                      <option>Receita Federal</option>
                      <option>SEFAZ</option>
                      <option>Auditoria</option>
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Tipo</label>
                    <select className={styles.select} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                      <option>Mapa Mental</option>
                      <option>Resumo Visual</option>
                      <option>Questões Comentadas</option>
                      <option>Esquema</option>
                    </select>
                  </div>
                </div>

                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label className={styles.label}>Preço (R$) *</label>
                    <input className={styles.input} placeholder="79,90" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Preço Original (R$)</label>
                    <input className={styles.input} placeholder="119,90" value={form.oldPrice} onChange={e => setForm(f => ({ ...f, oldPrice: e.target.value }))} />
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Status</label>
                  <div className={styles.radioGroup}>
                    {(['Publicado', 'Rascunho'] as const).map(s => (
                      <label key={s} className={styles.radioLabel}>
                        <input type="radio" name="status" value={s} checked={form.status === s} onChange={() => setForm(f => ({ ...f, status: s }))} />
                        <span>{s}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <label className={styles.checkLabel}>
                  <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} />
                  <span>Marcar como destaque</span>
                </label>

                <div className={styles.formActions}>
                  <button className={styles.btnCancel} onClick={() => setShowForm(false)}>Cancelar</button>
                  <button className={styles.btnPublish} onClick={handleSave}>Publicar Material</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
