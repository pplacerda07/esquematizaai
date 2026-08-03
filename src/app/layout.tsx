import type { Metadata } from "next";
import "./globals.css";
import WhatsAppButton from "@/components/WhatsAppButton";
import Analytics from "@/components/Analytics";
import { SITE_URL } from "@/config";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Esquematiza Aí | Plataforma de Educação Online",
  description: "Plataforma de Educação Online - Esquematiza Aí / Jornal do Marco",
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
