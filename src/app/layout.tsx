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

const siteUrl = "https://casasolomon.vercel.app";
const ogImage = "/logos/logo.png";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Solomon's House - Collaborative 3D Musical Creation",
  description:
    "Collaborative 3D musical creation application built with Next.js, Three.js, and Zustand",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "Solomon's House - Collaborative 3D Musical Creation",
    description:
      "Explora una plataforma colaborativa de creación musical 3D con tecnologías web inmersivas.",
    url: siteUrl,
    siteName: "Solomon's House",
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "Solomon's House - Collaborative 3D Musical Creation",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Solomon's House - Collaborative 3D Musical Creation",
    description:
      "Explora una plataforma colaborativa de creación musical 3D con tecnologías web inmersivas.",
    images: [ogImage],
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
