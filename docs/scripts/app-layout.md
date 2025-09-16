# Documentación: `src/app/layout.tsx`

## Propósito
Layout raíz de la aplicación Next.js que configura la estructura base, fuentes, estilos y providers necesarios para toda la aplicación.

## Funcionalidades Principales

### 1. Configuración de Fuentes
- **Geist Sans**: Fuente principal para texto general
- **Geist Mono**: Fuente monoespaciada para código y elementos técnicos
- Variables CSS personalizadas para uso en toda la aplicación

### 2. Importación de Estilos
- `tailwind.css`: Estilos base de Tailwind CSS
- `neon-sliders.css`: Estilos personalizados para sliders con efecto neón
- `glassmorphism.css`: Efectos de glassmorphism para elementos de UI

### 3. Metadatos de la Aplicación
- **Título**: "Casa de Salomon - Creación Musical 3D Colaborativa"
- **Descripción**: Descripción SEO de la aplicación
- **Idioma**: Español (es)

### 4. Provider de Estado Global
- Envuelve toda la aplicación con `StoreProvider`
- Garantiza que el estado de Zustand esté disponible en toda la app

## Estructura del Código

```typescript
// Configuración de fuentes
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadatos
export const metadata: Metadata = {
  title: "Casa de Salomon - Creación Musical 3D Colaborativa",
  description: "Aplicación de creación musical 3D colaborativa usando Next.js, Three.js y Zustand",
};

// Layout principal
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
```

## Dependencias

### Internas
- `StoreProvider`: Provider de estado global de Zustand

### Externas
- `next/font/google`: Optimización de fuentes de Google
- `next`: Framework de React para SSR/SSG

## Características Técnicas

### 1. Optimización de Fuentes
- Uso de `next/font` para optimización automática
- Variables CSS para acceso global a las fuentes
- Subconjuntos de caracteres optimizados

### 2. Prevención de Hidratación
- `suppressHydrationWarning`: Evita warnings de hidratación
- Configuración para aplicaciones con estado complejo

### 3. Antialiasing
- Clase `antialiased` para mejor renderizado de fuentes
- Mejora la calidad visual del texto

## Relaciones con Otros Archivos

### Dependencias Directas
- `../components/StoreProvider`: Provider de estado
- `./tailwind.css`: Estilos base
- `./neon-sliders.css`: Estilos de sliders
- `./glassmorphism.css`: Efectos de glassmorphism

### Archivos que lo Usan
- Todas las páginas de la aplicación (heredan este layout)
- Componentes que necesitan acceso al estado global

## Consideraciones de Rendimiento

1. **Fuentes Optimizadas**: Next.js optimiza automáticamente las fuentes
2. **CSS Modular**: Estilos separados por funcionalidad
3. **Provider Único**: Un solo provider para todo el estado
4. **Hidratación Controlada**: Prevención de problemas de SSR

## Uso en la Aplicación

Este layout es el punto de entrada de toda la aplicación y proporciona:
- Configuración base de fuentes y estilos
- Acceso global al estado de la aplicación
- Metadatos para SEO y configuración del navegador
- Estructura HTML base para todas las páginas

## Notas para Desarrollo

- Las fuentes se cargan de forma optimizada por Next.js
- Los estilos CSS se importan en el orden correcto
- El `StoreProvider` debe estar en el nivel más alto para funcionar correctamente
- Los metadatos se pueden extender en páginas específicas

