import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Bricolage_Grotesque, Caveat, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({ variable: "--font-display", subsets: ["latin"], weight: ["700", "800"] });
const body = Atkinson_Hyperlegible({ variable: "--font-body", subsets: ["latin"], weight: ["400", "700"], style: ["normal", "italic"] });
const note = Caveat({ variable: "--font-note", subsets: ["latin"], weight: ["700"] });
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["400"] });

export const metadata: Metadata = {
  title: "Defiéndelo",
  description: "Tareas que se pueden hacer con IA, pero que solo aprueba quien entiende lo que entregó.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${display.variable} ${body.variable} ${note.variable} ${mono.variable}`}>
        <a href="#contenido" className="skip-link">
          Saltar al contenido
        </a>
        {children}
      </body>
    </html>
  );
}
