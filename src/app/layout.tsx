import type { Metadata } from "next";
import "./globals.css";
import WhatsAppButton from "@/components/WhatsAppButton";
import Analytics from "@/components/Analytics";
import { SITE_URL } from "@/config";

const DESCRICAO =
  'Resumos e flashcards para concursos públicos, feitos a partir do histórico de cobrança das bancas. Áreas fiscal, controle, policial, tribunais e legislativa.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Esquematiza Aí | Plataforma de Educação Online",
  // "Jornal do Marco" saiu daqui junto com o do rodapé, a pedido do Sérgio.
  // Esta descrição é a que aparece no Google e ao compartilhar o link, então
  // ganhou uma frase que diz o que o site vende.
  description: DESCRICAO,

  /**
   * Cartão de compartilhamento.
   *
   * Sem isto o site não tinha nenhuma tag og: o link colado no WhatsApp virava
   * um retângulo cinza, sem imagem, sem título e sem descrição. As páginas de
   * post já montavam o cartão delas; era a home e todo o resto que ficava sem.
   *
   * A imagem não é declarada aqui de propósito: o arquivo opengraph-image.png
   * ao lado deste layout é a convenção do Next, e ele emite sozinho o endereço,
   * o tipo e as dimensões. Declarar à mão sairia sem width e height, que é o
   * que faz o WhatsApp decidir entre miniatura grande e ícone pequeno.
   *
   * Quem define openGraph próprio (o post do blog, por exemplo) continua
   * mandando na sua página: isto aqui é o padrão de quem não define.
   */
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: SITE_URL,
    siteName: 'Esquematiza Aí',
    title: 'Esquematiza Aí | Resumos e flashcards para concursos públicos',
    description: DESCRICAO,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Esquematiza Aí | Resumos e flashcards para concursos públicos',
    description: DESCRICAO,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <WhatsAppButton />
        <Analytics />
      </body>
    </html>
  );
}
