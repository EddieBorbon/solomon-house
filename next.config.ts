import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['@react-three/fiber', '@react-three/drei', 'three'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Configuración para evitar problemas de hidratación
  reactStrictMode: true,
  // Configuración de assets
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  // Configuración para manejar errores 404
  trailingSlash: false,
  // Configuración de headers
  async headers() {
    return [
      {
        source: '/favicon.svg',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
