import Conteudo from '@/components/Artigo/Conteudo';
import { whatsappUrl } from '@/config';
import type { PerguntaFrequente } from '@/data/catalogo';
import styles from './styles.module.css';

/**
 * Principais dúvidas do produto, com o bloco de suporte no fim.
 *
 * Usa <details>/<summary> nativo em vez de acordeão em JavaScript: abre e
 * fecha sem script nenhum, funciona com teclado e leitor de tela de graça, e
 * o texto da resposta já vem no HTML, o que o Google consegue ler.
 *
 * NÃO tem captura de e-mail aqui de propósito. Esta seção fica logo acima da
 * decisão de compra, e pedir e-mail nesse ponto disputa o clique com o botão
 * que interessa. A newsletter continua na home.
 */
export default function FaqProduto({
  perguntas,
  nomeDoProduto,
}: {
  perguntas: PerguntaFrequente[];
  nomeDoProduto: string;
}) {
  if (perguntas.length === 0) return null;

  const zap = whatsappUrl(`Olá! Tenho uma dúvida sobre o ${nomeDoProduto}.`);

  return (
    <section className={styles.secao} aria-labelledby="faq-titulo">
      <h2 className={styles.titulo} id="faq-titulo">
        Principais <span className={styles.acento}>dúvidas</span>
      </h2>

      <div className={styles.lista}>
        {perguntas.map((q) => (
          <details key={q.pergunta} className={styles.item}>
            <summary className={styles.pergunta}>
              {q.pergunta}
              <span className={styles.sinal} aria-hidden="true" />
            </summary>
            <div className={styles.resposta}>
              <Conteudo markdown={q.resposta} />
            </div>
          </details>
        ))}
      </div>

      <div className={styles.suporte}>
        <p className={styles.suporteTitulo}>Ainda com alguma dúvida?</p>
        <p className={styles.suporteTexto}>
          Fale com a gente antes de comprar. Respondemos pelo WhatsApp.
        </p>
        <a className={styles.suporteBotao} href={zap} target="_blank" rel="noopener noreferrer">
          Quero falar com o suporte
        </a>
      </div>
    </section>
  );
}
