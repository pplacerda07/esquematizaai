'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './styles.module.css';

/**
 * Caixa de busca e atalhos por tipo de material, logo abaixo da barra do cupom.
 *
 * Os dois levam para a vitrine já filtrada, por parâmetro na URL
 * (/vitrine?busca=... e /vitrine?tipo=...). A vitrine lê esses parâmetros na
 * primeira renderização. Sem isso, a caixa seria enfeite: rolaria a página e a
 * pessoa teria de repetir a busca na mão lá embaixo.
 *
 * Os três atalhos usam as categorias que já existem no catálogo, com os números
 * de hoje: 4 assinaturas, 23 combos e 80 isolados.
 */
const ATALHOS = [
  { rotulo: 'Assinaturas', tipo: 'assinatura' },
  { rotulo: 'Combos', tipo: 'combo' },
  { rotulo: 'Cursos isolados', tipo: 'isolado' },
];

export default function BuscaEAtalhos() {
  const router = useRouter();
  const [termo, setTermo] = useState('');

  const buscar = (e: React.FormEvent) => {
    e.preventDefault();
    const limpo = termo.trim();
    router.push(limpo ? `/vitrine?busca=${encodeURIComponent(limpo)}` : '/vitrine');
  };

  return (
    <section className={styles.faixa} aria-label="Buscar material">
      <div className={styles.container}>
        <form className={styles.form} onSubmit={buscar} role="search">
          <label className={styles.rotuloOculto} htmlFor="busca-home">
            Qual material você está procurando?
          </label>
          <input
            id="busca-home"
            type="search"
            className={styles.campo}
            placeholder="Qual material você está procurando?"
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
          />
          <button type="submit" className={styles.lupa} aria-label="Buscar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" />
            </svg>
          </button>
        </form>

        <nav className={styles.atalhos} aria-label="Tipos de material">
          {ATALHOS.map((a) => (
            <Link key={a.tipo} href={`/vitrine?tipo=${a.tipo}`} className={styles.atalho}>
              {a.rotulo}
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
