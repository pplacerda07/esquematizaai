import styles from './artigo.module.css';

/**
 * Botões de compartilhamento. São links de intenção (share URLs oficiais de cada
 * rede), sem SDK e sem script de terceiros: nenhum pixel de rastreio entra no site
 * e a página não fica mais pesada por causa disso.
 */
export default function Compartilhar({ url, titulo }: { url: string; titulo: string }) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(titulo);

  const redes = [
    { nome: 'WhatsApp', href: `https://api.whatsapp.com/send?text=${t}%20${u}`, classe: styles.redeWhats },
    { nome: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, classe: styles.redeFace },
    { nome: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, classe: styles.redeIn },
    { nome: 'Telegram', href: `https://t.me/share/url?url=${u}&text=${t}`, classe: styles.redeTelegram },
  ];

  return (
    <section className={styles.compartilhar}>
      <p className={styles.compartilharTitulo}>Gostou do conteúdo? Compartilhe</p>
      <div className={styles.compartilharBotoes}>
        {redes.map((r) => (
          <a
            key={r.nome}
            href={r.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.rede} ${r.classe}`}
            aria-label={`Compartilhar no ${r.nome}`}
          >
            {r.nome}
          </a>
        ))}
      </div>
    </section>
  );
}
