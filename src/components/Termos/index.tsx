import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './styles.module.css';

/**
 * Página de termos de uso.
 *
 * Uma peça só para os dois documentos, materiais e mentoria, porque os dois têm
 * a mesma forma: título, identificação da empresa, seções numeradas e cláusulas.
 *
 * O TEXTO NÃO É REESCRITO. É documento do jurídico, e mudar uma palavra muda o
 * que a empresa se obriga a cumprir. O que existe aqui é só a apresentação:
 * hierarquia, numeração à margem e largura de leitura confortável.
 *
 * O ÍNDICE NO TOPO existe porque o da mentoria tem 21 seções e 129 cláusulas.
 * Quem chega aqui geralmente veio atrás de UMA coisa, quase sempre reembolso ou
 * cancelamento, e rolar 129 parágrafos até achar é o caminho para desistir e
 * abrir o WhatsApp reclamando.
 */

export type ItemTermo = { numero: string | null; texto: string };
export type BlocoTermo = { titulo: string; itens: ItemTermo[] };
export type SecaoTermo = { titulo: string; itens: ItemTermo[]; blocos?: BlocoTermo[] };

export interface DocumentoTermos {
  titulo: string;
  subtitulo: string | null;
  secoes: SecaoTermo[];
}

/** "1. ACEITAÇÃO DOS TERMOS" -> "aceitacao-dos-termos" */
function ancora(titulo: string): string {
  return titulo
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/^\d+\.\s*/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function Paragrafo({ item }: { item: ItemTermo }) {
  return (
    <p className={styles.clausula}>
      {item.numero && <span className={styles.numero}>{item.numero}</span>}
      <span className={styles.texto}>{item.texto}</span>
    </p>
  );
}

export default function Termos({
  documento,
  atualizadoEm,
}: {
  documento: DocumentoTermos;
  /** data que substitui o [DATA DA PUBLICAÇÃO] do documento */
  atualizadoEm: string;
}) {
  return (
    <>
      <Navbar />

      <main className={styles.pagina}>
        <header className={styles.cabecalho}>
          <h1 className={styles.titulo}>{documento.titulo}</h1>
          {documento.subtitulo && <p className={styles.subtitulo}>{documento.subtitulo}</p>}
          <p className={styles.data}>Atualizado em {atualizadoEm}</p>
        </header>

        <nav className={styles.indice} aria-label="Seções deste documento">
          <p className={styles.indiceTitulo}>Neste documento</p>
          <ol className={styles.indiceLista}>
            {documento.secoes.map((s) => (
              <li key={s.titulo}>
                <a href={`#${ancora(s.titulo)}`}>{s.titulo}</a>
              </li>
            ))}
          </ol>
        </nav>

        {documento.secoes.map((secao) => (
          <section key={secao.titulo} id={ancora(secao.titulo)} className={styles.secao}>
            <h2 className={styles.secaoTitulo}>{secao.titulo}</h2>

            {secao.itens.map((item, i) => (
              <Paragrafo key={`${item.numero ?? i}`} item={item} />
            ))}

            {/* o quadro-resumo da mentoria: blocos rotulados em vez de
                cláusulas numeradas, e o documento diz que ele é informativo */}
            {secao.blocos?.map((bloco) => (
              <div key={bloco.titulo} className={styles.bloco}>
                <h3 className={styles.blocoTitulo}>{bloco.titulo}</h3>
                {bloco.itens.map((item, i) => (
                  <Paragrafo key={`${bloco.titulo}-${i}`} item={item} />
                ))}
              </div>
            ))}
          </section>
        ))}

        <p className={styles.rodape}>
          Dúvidas sobre estes termos podem ser enviadas para{' '}
          <a href="mailto:contato@esquematizaai.com">contato@esquematizaai.com</a>.
        </p>
      </main>

      <Footer />
    </>
  );
}
