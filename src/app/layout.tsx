import type { Metadata } from "next";
import { Roboto, Roboto_Mono } from "next/font/google";
import "./tailwind.css";
import "./neon-sliders.css";
import "./glassmorphism.css";
import "./futuristic-sliders.css";
import { StoreProvider } from "../components/StoreProvider";
import { LanguageProvider } from "../contexts/LanguageContext";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ['300', '400', '500', '700'],
  display: 'swap',
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  weight: ['300', '400', '500', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Casa de Salomon - Creación Musical 3D Colaborativa",
  description: "Aplicación de creación musical 3D colaborativa usando Next.js, Three.js y Zustand",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className="h-full">
      <body
        className={`${roboto.variable} ${robotoMono.variable} antialiased h-full m-0 p-0 bg-black overflow-hidden`}
      >
        <LanguageProvider>
          <StoreProvider>
            {children}
          </StoreProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
