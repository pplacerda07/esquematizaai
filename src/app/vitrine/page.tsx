'use client';
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './styles.module.css';

const allProducts = [
  { 
    id: 1, category: 'Mapas Mentais', 
    title: 'Direito Tributário Esquematizado', 
    description: 'Os conceitos complexos mastigados para a Área Fiscal.',
    price: 'R$ 47,00' 
  },
  { 
    id: 2, category: 'E-books', 
    title: 'Auditoria Fiscal na Prática', 
    description: 'Guia definitivo para dominar Auditoria na RFB e SEFAZ.',
    price: 'R$ 39,90' 
  },
  { 
    id: 3, category: 'Resumos', 
    title: 'Contabilidade Pública e Geral', 
    description: 'Resumos cirúrgicos das normas contábeis.',
    price: 'R$ 59,00' 
  },
  { 
    id: 4, category: 'Combos', 
    title: 'Pacote Aprovação Receita Federal', 
    description: 'O combo supremo: legislação aduaneira, tributário, auditoria e contabilidade.',
    price: 'R$ 147,00' 
  },
  { 
    id: 5, category: 'Mapas Mentais', 
    title: 'Legislação Aduaneira Essencial', 
    description: 'Mapas focados 100% na prova da Receita Federal.',
    price: 'R$ 45,00' 
  },
  { 
    id: 6, category: 'E-books', 
    title: 'Direito Administrativo para Fiscos', 
    description: 'Doutrina e jurisprudência esquematizadas para concursos fiscais.',
    price: 'R$ 49,90' 
  },
  { 
    id: 7, category: 'Questões', 
    title: '1000 Questões de Direito Constitucional', 
    description: 'Questões comentadas com foco nas bancas FCC, FGV e CEBRASPE.',
    price: 'R$ 67,00' 
  },
  { 
    id: 8, category: 'Combos', 
    title: 'Pacote Básico SEFAZ', 
    description: 'Matérias básicas essenciais para fiscos estaduais com mapas e resumos.',
    price: 'R$ 127,00' 
  },
];

const categories = ['Todos', 'Mapas Mentais', 'E-books', 'Resumos', 'Questões', 'Combos'];

export default function VitrinePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');

  const filteredProducts = allProducts.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'Todos' || product.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className={styles.main}>
      <Navbar />
      
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <span className={styles.tag}>Loja Oficial</span>
          <h1 className={styles.title}>Vitrine <span className={styles.titleAccent}>Fiscal</span></h1>
          <p className={styles.subtitle}>Encontre os materiais esquematizados ideais para a sua aprovação na Receita Federal e Fiscos Estaduais.</p>
        </div>
      </div>

      <div className={styles.container}>
        <aside className={styles.sidebar}>
          <div className={styles.searchBox}>
            <input 
              type="text" 
              placeholder="Buscar materiais..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.searchIcon}>
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>

          <div className={styles.filterSection}>
            <h3 className={styles.filterTitle}>Categorias</h3>
            <ul className={styles.categoryList}>
              {categories.map(cat => (
                <li key={cat}>
                  <button 
                    className={`${styles.categoryBtn} ${activeCategory === cat ? styles.active : ''}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <section className={styles.productGrid}>
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <div key={product.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.badge}>{product.category}</span>
                </div>
                <div className={styles.cardBody}>
                  <h3 className={styles.productTitle}>{product.title}</h3>
                  <p className={styles.productDescription}>{product.description}</p>
                  <div className={styles.price}>{product.price}</div>
                </div>
                <div className={styles.cardFooter}>
                  <button className={styles.btnBuy}>Adicionar ao Carrinho</button>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <p>Nenhum material encontrado com esses filtros.</p>
              <button onClick={() => {setSearchTerm(''); setActiveCategory('Todos');}} className={styles.btnReset}>Limpar Filtros</button>
            </div>
          )}
        </section>
      </div>

      <Footer />
    </main>
  );
}
