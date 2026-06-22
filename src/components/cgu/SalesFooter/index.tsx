import React from 'react';
import Image from 'next/image';
import styles from './styles.module.css';
import { GRUPO_VIP_URL, SITE_URL } from '@/config';

export default function SalesFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.logoCol}>
          <a href={SITE_URL} className={styles.logoLink} aria-label="Esquematiza Aí">
            <Image
              src="/logos/logo-horizontal-branco.png"
              alt="Esquematiza Aí"
              width={190}
              height={50}
              style={{ objectFit: 'contain' }}
            />
          </a>
          <p className={styles.description}>
            Pré-edital da CGU conduzido por auditores aprovados. Aula gratuita, ciclo de
            estudos e acompanhamento de perto para você largar na frente antes do edital sair.
          </p>
        </div>

        <div className={styles.ctaCol}>
          <h4 className={styles.colTitle}>Não fique de fora</h4>
          <p className={styles.ctaText}>
            As vagas da turma de pré-edital são limitadas. Entre no grupo VIP e seja o
            primeiro a saber quando abrirem.
          </p>
          <a
            href={GRUPO_VIP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.cta}
          >
            Entrar no grupo VIP
          </a>
        </div>
      </div>

      <hr className={styles.divider} />

      <div className={styles.bottomBar}>
        <span>&copy; {new Date().getFullYear()} Esquematiza Aí. Todos os direitos reservados.</span>
        <span>Conteúdo informativo. Não garantimos aprovação. O resultado depende da sua dedicação.</span>
      </div>
    </footer>
  );
}
