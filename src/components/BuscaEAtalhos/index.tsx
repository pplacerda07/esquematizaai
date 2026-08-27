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
 * SÃO CINCO, e não três, a pedido do Sérgio. Os quatro primeiros levam à
 * vitrine já filtrada; a Mentoria é o único que sai do catálogo, porque não é
 * material, é serviço, e tem página própria.
 *
 * "Legislação Tributária" entra aqui apesar de não ser categoria: é uma linha
 * que atravessa assinatura, combo e isolado, e quem procura a legislação do seu
 * estado procura pelo assunto, não pelo tipo de embalagem.
 *
 * Os números de hoje: 10 assinaturas, 41 combos, 91 isolados e 73 materiais de
 * legislação tributária.
 */
const ATALHOS = [
  { rotulo: 'Assinaturas', href: '/vitrine?tipo=assinatura' },
  { rotulo: 'Combos', href: '/vitrine?tipo=combo' },
  { rotulo: 'Cursos isolados', href: '/vitrine?tipo=isolado' },
  { rotulo: 'Legislação Tributária', href: '/vitrine?tipo=legislacao-tributaria' },
  { rotulo: 'Mentoria', href: '/mentoria' },
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
            <Link key={a.href} href={a.href} className={styles.atalho}>
              {a.rotulo}
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
