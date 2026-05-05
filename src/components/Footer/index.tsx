import React from 'react';
import styles from './styles.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.logoCol}>
          <a href="#" className={styles.logo}><span className={styles.logoAccent}>E</span>squematiza Aí</a>
          <p className={styles.description}>
            A plataforma definitiva para quem busca aprovação de forma rápida e esquematizada.
          </p>
          <div className={styles.social}>
            <a href="#" className={styles.socialIcon}>IG</a>
            <a href="#" className={styles.socialIcon}>FB</a>
            <a href="#" className={styles.socialIcon}>YT</a>
          </div>
        </div>
        
        <div className={styles.linksCol}>
          <h4 className={styles.colTitle}>Plataforma</h4>
          <div className={styles.links}>
            <a href="#" className={styles.link}>Cursos</a>
            <a href="#" className={styles.link}>Planos</a>
            <a href="#" className={styles.link}>Aulas ao Vivo</a>
            <a href="#" className={styles.link}>Depoimentos</a>
          </div>
        </div>
        
        <div className={styles.linksCol}>
          <h4 className={styles.colTitle}>Suporte</h4>
          <div className={styles.links}>
            <a href="#" className={styles.link}>Central de Ajuda</a>
            <a href="#" className={styles.link}>Contato</a>
            <a href="#" className={styles.link}>FAQ</a>
            <a href="#" className={styles.link}>Blog</a>
          </div>
        </div>
        
        <div className={styles.linksCol}>
          <h4 className={styles.colTitle}>Legal</h4>
          <div className={styles.links}>
            <a href="#" className={styles.link}>Termos de Uso</a>
            <a href="#" className={styles.link}>Política de Privacidade</a>
          </div>
        </div>
      </div>
      
      <hr className={styles.divider} />
      
      <div className={styles.bottomBar}>
        <span>&copy; {new Date().getFullYear()} Esquematiza Aí / Jornal do Marco. Todos os direitos reservados.</span>
        <span>Desenvolvido com excelência.</span>
      </div>
    </footer>
  );
}
