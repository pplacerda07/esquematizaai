import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
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
      </body>
    </html>
  );
}
