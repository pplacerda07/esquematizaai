import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './styles.module.css';
import { CHECKOUT_URL } from '@/config';

export default function SalesFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.logoCol}>
          {/* Mesma correção do topo: a logo ia para o WordPress antigo. */}
          <Link href="/" className={styles.logoLink} aria-label="Esquematiza Aí, ir para o início">
            <Image
              src="/logos/logo-horizontal-branco.png"
              alt="Esquematiza Aí"
              width={190}
              height={50}
              style={{ objectFit: 'contain' }}
            />
          </Link>
          <p className={styles.description}>
            Mentoria para concursos fiscais e de controle, conduzida por auditores
            aprovados. Plano individual, material de revisão da casa e acompanhamento
            direto até o dia da prova.
          </p>
        </div>

        <div className={styles.ctaCol}>
          <h4 className={styles.colTitle}>Pronto pra começar?</h4>
          <p className={styles.ctaText}>
            Faça sua aplicação pra mentoria e a equipe acerta tudo com você no WhatsApp.
          </p>
          <a
            href={CHECKOUT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.cta}
          >
            Quero fazer minha aplicação
          </a>
        </div>
      </div>

      <hr className={styles.divider} />

      <div className={styles.bottomBar}>
        <span>&copy; {new Date().getFullYear()} Esquematiza Aí. Todos os direitos reservados.</span>
        <span>Ao continuar, você concorda com os termos de uso e a política de privacidade.</span>
      </div>
    </footer>
  );
}
