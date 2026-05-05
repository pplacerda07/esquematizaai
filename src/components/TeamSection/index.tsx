import React from 'react';
import styles from './styles.module.css';

const team = [
  { name: 'Prof. Marco', role: 'Auditor-Fiscal da RFB & Tributário', image: '/assets/22.png' },
  { name: 'Profa. Julia', role: 'Auditora-Fiscal & Leg. Aduaneira', image: '/assets/22.png' },
  { name: 'Prof. Carlos', role: 'Especialista em Contabilidade', image: '/assets/22.png' },
  { name: 'Profa. Ana', role: 'Analista Tributária & Dir. Admin.', image: '/assets/22.png' },
];

export default function TeamSection() {
  return (
    <section className={styles.teamSection}>
      <span className={styles.sectionTag}>Professores</span>
      <h2 className={styles.title}>
        Conheça a Nossa <span className={styles.titleAccent}>Equipe</span>
      </h2>
      
      <div className={styles.grid}>
        {team.map((member, idx) => (
          <div key={idx} className={styles.card}>
            <div className={styles.photoWrapper}>
              <div className={styles.blobBg}></div>
              <img src={member.image} alt={member.name} className={styles.photo} />
            </div>
            <h3 className={styles.name}>{member.name}</h3>
            <p className={styles.role}>{member.role}</p>
            <div className={styles.social}>
              <a href="#" className={styles.socialIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" className={styles.socialIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
