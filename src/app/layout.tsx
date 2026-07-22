import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

// DESIGN.md reserves the heading typeface for the same family as body text
// (Inter) — there is no separate display font, so --font-heading reuses it.
const interHeading = Inter({
  subsets: ['latin'],
  variable: '--font-heading',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'tuDeclaracion — Declaraciones juradas DGI sin fricción',
  description:
    'Carga el TXT del proveedor contable, valida RUTs e importes, y genera el archivo PADI de la declaración jurada 2181 en un mismo flujo.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${interHeading.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
