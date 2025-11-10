import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./tailwind.css";
import "./neon-sliders.css";
import "./glassmorphism.css";
import "./futuristic-sliders.css";
import "./responsive.css";
import { StoreProvider } from "../components/StoreProvider";
import { LanguageProvider } from "../contexts/LanguageContext";

const nunitoSans = localFont({
  src: "../../public/fuentes/NunitoSans-VariableFont_YTLC,opsz,wdth,wght.ttf",
  variable: "--font-nunito-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Solomon's House - Collaborative 3D Musical Creation",
  description: "Collaborative 3D musical creation application built with Next.js, Three.js, and Zustand",
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className="h-full">
      <body
        className={`${nunitoSans.variable} font-sans antialiased h-full m-0 p-0 bg-black overflow-hidden`}
      >
        <LanguageProvider>
          <StoreProvider>
            <div className="w-full h-full">
              {children}
            </div>
          </StoreProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
