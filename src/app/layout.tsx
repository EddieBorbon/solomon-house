import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./tailwind.css";
import "./neon-sliders.css";
import "./glassmorphism.css";
import "./futuristic-sliders.css";
import "./responsive.css";
import { StoreProvider } from "../components/StoreProvider";
import { LanguageProvider } from "../contexts/LanguageContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Casa de Salomon - Creación Musical 3D Colaborativa",
  description: "Aplicación de creación musical 3D colaborativa usando Next.js, Three.js y Zustand",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full m-0 p-0 bg-black overflow-hidden`}
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
