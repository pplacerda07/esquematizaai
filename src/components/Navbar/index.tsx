import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './styles.module.css';
import { AREAS } from './areas';

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <Link href="/" className={styles.logoLink}>
        <Image
          src="/logos/logo-horizontal-azul.png"
          alt="Esquematiza Aí"
          width={180}
          height={46}
          style={{ objectFit: 'contain' }}
          priority
        />
      </Link>

      <div className={styles.navLinks}>
        <div className={styles.dropdownWrap}>
          <button type="button" className={styles.dropdownTrigger}>
            Escolha sua área de concurso
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.chevron}>
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          <div className={styles.dropdownMenu} role="menu">
            {AREAS.map((area) => (
              <Link
                key={area.slug}
                href={`/vitrine/${area.slug}`}
                className={styles.dropdownItem}
                role="menuitem"
              >
                {area.name}
              </Link>
            ))}
          </div>
        </div>

        <Link href="/#assinaturas" className={styles.link}>Assinaturas</Link>

        <Link href="/mentoria" className={styles.link}>Mentoria</Link>

        {/* leva ao /blog, e não ao /noticias: é lá que ficam as matérias
            completas sobre editais e vagas */}
        <Link href="/blog" className={styles.link}>Notícias de concurso</Link>
      </div>

      <div className={styles.actions}>
        {/* um botão só: "Entrar" e "Cadastrar" iam para o mesmo destino, então
            o par disputava espaço sem oferecer escolha nenhuma */}
        <a href="https://esquematizaai.com/minha-conta/" className={styles.btnSignup}>
          Cadastrar
        </a>
      </div>
    </nav>
  );
}
