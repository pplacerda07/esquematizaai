import type { Metadata } from "next";
import "./globals.css";
import WhatsAppButton from "@/components/WhatsAppButton";
import Analytics from "@/components/Analytics";
import { SITE_URL } from "@/config";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Esquematiza Aí | Plataforma de Educação Online",
  // "Jornal do Marco" saiu daqui junto com o do rodapé, a pedido do Sérgio.
  // Esta descrição é a que aparece no Google e ao compartilhar o link, então
  // ganhou uma frase que diz o que o site vende.
  description:
    'Resumos e flashcards para concursos públicos, feitos a partir do histórico de cobrança das bancas. Áreas fiscal, controle, policial, tribunais e legislativa.',
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
