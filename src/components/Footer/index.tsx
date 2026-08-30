import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { REDES_SOCIAIS, whatsappUrl } from '@/config';
import styles from './styles.module.css';

/**
 * Rodapé do site.
 *
 * Reescrito com o que o Sérgio pediu. Antes as colunas eram enfeite: dezessete
 * links e TODOS apontavam para "#", inclusive "Cursos", "Planos", "Contato" e
 * "Termos de Uso". Quem clicasse não saía do lugar.
 *
 * Agora cada link leva a algum lugar de verdade, e o que não tem para onde ir
 * simplesmente não é desenhado.
 */

/** só as redes com endereço preenchido em config.ts */
const REDES = [
  { nome: 'Instagram', url: REDES_SOCIAIS.instagram, icone: IconeInstagram },
  { nome: 'YouTube', url: REDES_SOCIAIS.youtube, icone: IconeYouTube },
  { nome: 'TikTok', url: REDES_SOCIAIS.tiktok, icone: IconeTikTok },
  { nome: 'Facebook', url: REDES_SOCIAIS.facebook, icone: IconeFacebook },
].filter((r) => r.url);

/**
 * Coluna de produtos, na ordem que o Sérgio escreveu.
 *
 * Os quatro do meio levam à vitrine já filtrada, pelos mesmos parâmetros que os
 * atalhos do topo usam. Assim o rodapé não é um beco: quem chegou até aqui
 * rolando encontra o caminho de volta para o catálogo.
 */
const PRODUTOS = [
  { rotulo: 'Conheça nossos produtos', href: '/vitrine' },
  { rotulo: 'Mentoria', href: '/mentoria' },
  { rotulo: 'Assinaturas', href: '/vitrine?tipo=assinatura' },
  { rotulo: 'Combos', href: '/vitrine?tipo=combo' },
  { rotulo: 'Legislação Tributária', href: '/vitrine?tipo=legislacao-tributaria' },
  { rotulo: 'Cursos isolados', href: '/vitrine?tipo=isolado' },
];

export default function Footer() {
  const anoAtual = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.logoCol}>
          {/* logotipo de verdade no lugar do nome digitado; versão branca
              porque o rodapé é escuro */}
          <Link href="/" className={styles.logo} aria-label="Esquematiza Aí, ir para o início">
            <Image
              src="/logos/logo-horizontal-branco.png"
              alt="Esquematiza Aí"
              width={200}
              height={51}
              className={styles.logoImg}
            />
          </Link>

          {REDES.length > 0 && (
            <div className={styles.social}>
              {REDES.map(({ nome, url, icone: Icone }) => (
                <a
                  key={nome}
                  href={url}
                  className={styles.socialIcon}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={nome}
                  title={nome}
                >
                  <Icone />
                </a>
              ))}
            </div>
          )}
        </div>

        <div className={styles.linksCol}>
          <h4 className={styles.colTitle}>Produtos</h4>
          <div className={styles.links}>
            {PRODUTOS.map((p) => (
              <Link key={p.href} href={p.href} className={styles.link}>
                {p.rotulo}
              </Link>
            ))}
          </div>
        </div>

        <div className={styles.linksCol}>
          <h4 className={styles.colTitle}>Suporte</h4>
          <div className={styles.links}>
            <Link href="/blog" className={styles.link}>
              Blog
            </Link>
            <Link href="/noticias" className={styles.link}>
              Notícias de concurso
            </Link>
            <a
              href={whatsappUrl('Olá! Preciso de ajuda.')}
              className={styles.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              Fale conosco
            </a>
          </div>
        </div>

        <div className={styles.linksCol}>
          <h4 className={styles.colTitle}>Legal</h4>
          <div className={styles.links}>
            <Link href="/termos-de-uso" className={styles.link}>
              Termos de uso dos materiais
            </Link>
            <Link href="/termos-de-uso-mentoria" className={styles.link}>
              Termos de uso da mentoria
            </Link>
          </div>
        </div>
      </div>

      <hr className={styles.divider} />

      <div className={styles.bottomBar}>
        {/* "Jornal do Marco" saiu a pedido do Sérgio. O CNPJ entrou no lugar
            porque termo de uso e política de reembolso citam a razão social, e
            é bom que ela apareça em algum lugar do site. */}
        <span>
          &copy; {anoAtual} Esquematiza Aí. Todos os direitos reservados. XAVIER FURTADO CURSOS PARA
          CONCURSOS LTDA, CNPJ 48.847.300/0001-37.
        </span>
      </div>
    </footer>
  );
}

/* ---------------------------------------------------------------- ícones */
/* Desenhados aqui e não trazidos de biblioteca: são quatro caminhos, e uma
   dependência inteira para isso pesaria mais do que o rodapé todo. */

function IconeInstagram() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconeYouTube() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="4" />
      <path d="M10 9.2 15.2 12 10 14.8 Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconeTikTok() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.5 3c.3 1.9 1.4 3.3 3.5 3.6v2.4c-1.3.1-2.5-.2-3.6-.9v5.6c0 3.4-2.6 5.6-5.5 5.3-2.7-.3-4.6-2.5-4.5-5.2.1-2.6 2.2-4.7 4.9-4.7.3 0 .5 0 .8.1v2.5c-.3-.1-.5-.1-.8-.1-1.4 0-2.5 1.1-2.5 2.4 0 1.4 1.1 2.5 2.5 2.5s2.5-1.1 2.5-2.5V3h2.7Z" />
    </svg>
  );
}

function IconeFacebook() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.3-.1-2.4-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.7v3h2.6V21h3.2Z" />
    </svg>
  );
}
