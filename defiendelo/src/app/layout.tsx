import type { Metadata } from "next";
import { Atkinson_Hyperlegible_Mono, Atkinson_Hyperlegible_Next, Bricolage_Grotesque, Caveat } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({ variable: "--font-display", subsets: ["latin"], weight: ["700", "800"] });
// Atkinson Hyperlegible Next (Braille Institute, 2025): letters that never get confused (I l 1, O 0), for tired eyes on a phone.
const body = Atkinson_Hyperlegible_Next({ variable: "--font-body", subsets: ["latin"], weight: ["400", "700"], style: ["normal", "italic"] });
const note = Caveat({ variable: "--font-note", subsets: ["latin"], weight: ["700"] });
// Same family for codes and grades: in ALUM-4X9P2R a 0 never looks like an O.
const mono = Atkinson_Hyperlegible_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["400", "700"] });

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
