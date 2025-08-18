import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./tailwind.css";
import { StoreProvider } from "../components/StoreProvider";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
