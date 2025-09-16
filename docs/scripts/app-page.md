# Documentación: `src/app/page.tsx`

## Propósito
Página principal de la aplicación que actúa como el punto de entrada de la interfaz de usuario, coordinando todos los componentes principales del sistema de creación musical 3D.

## Funcionalidades Principales

### 1. Coordinación de Componentes
- Orquesta todos los componentes de UI principales
- Maneja la disposición y superposición de elementos
- Integra la escena 3D con los controles de interfaz

### 2. Gestión de Carga Asíncrona
- Usa `Suspense` para cargar la escena 3D de forma asíncrona
- Proporciona feedback visual durante la carga
- Maneja estados de carga y error

### 3. Integración de Atajos de Teclado
- Inicializa el sistema de atajos de teclado global
- Permite interacción rápida con la aplicación

## Estructura del Código

```typescript
'use client';

import { Suspense } from 'react';
// Componentes principales
import { Experience } from '../components/world/Experience';
import { ControlPanel } from '../components/ui/ControlPanel';
import { ParameterEditor } from '../components/ui/ParameterEditor';
import { AudioInitializer } from '../components/ui/AudioInitializer';
import { TransformToolbar } from '../components/ui/TransformToolbar';
import { SpatializationDebug } from '../components/ui/SpatializationDebug';
import { GridCreator } from '../components/ui/GridCreator';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

export default function Home() {
  // Hook para atajos de teclado
  useKeyboardShortcuts();

  return (
    <div className="w-full h-screen relative">
      {/* Componentes de UI superpuestos */}
      <TransformToolbar />
      <ParameterEditor />
      <ControlPanel />
      <AudioInitializer />
      <SpatializationDebug />
      <GridCreator />
      
      {/* Escena 3D con Suspense */}
      <Suspense fallback={<LoadingComponent />}>
        <Experience />
      </Suspense>
    </div>
  );
}
```

## Componentes Integrados

### 1. **TransformToolbar**
- Barra de herramientas para transformaciones 3D
- Controles de traslación, rotación y escala

### 2. **ParameterEditor**
- Editor de parámetros de entidades seleccionadas
- Interfaz para modificar propiedades de audio y efectos

### 3. **ControlPanel**
- Panel principal de control
- Creación de objetos sonoros y zonas de efectos

### 4. **AudioInitializer**
- Inicializador del sistema de audio
- Manejo de permisos y contexto de audio

### 5. **SpatializationDebug**
- Herramientas de debug para audio espacial
- Visualización de posiciones y configuraciones

### 6. **GridCreator**
- Creador de nuevas cuadrículas
- Gestión del sistema de cuadrículas 3D

### 7. **Experience** (Escena 3D)
- Escena principal de Three.js
- Renderizado de objetos 3D y audio espacial

## Hooks Utilizados

### `useKeyboardShortcuts()`
- Registra atajos de teclado globales
- Permite interacción rápida con la aplicación
- Incluye controles de transformación y navegación

## Características Técnicas

### 1. **Client-Side Rendering**
- Directiva `'use client'` para renderizado del lado del cliente
- Necesario para hooks y componentes interactivos

### 2. **Suspense para Carga Asíncrona**
- Carga diferida de la escena 3D
- Mejora el rendimiento inicial de la aplicación
- Feedback visual durante la carga

### 3. **Layout Responsive**
- `w-full h-screen`: Ocupa toda la pantalla
- `relative`: Posicionamiento relativo para elementos superpuestos

### 4. **Componente de Carga Personalizado**
```typescript
<div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
  <div className="text-center">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
    <p className="text-xl">Cargando mundo 3D...</p>
  </div>
</div>
```

## Flujo de Renderizado

1. **Inicialización**: Se ejecuta `useKeyboardShortcuts()`
2. **Renderizado de UI**: Se renderizan todos los componentes de interfaz
3. **Carga de Escena 3D**: `Experience` se carga de forma asíncrona
4. **Feedback de Carga**: Se muestra el componente de carga mientras se carga la escena
5. **Integración Completa**: Todos los componentes se integran y funcionan juntos

## Dependencias

### Componentes Importados
- `Experience`: Escena 3D principal
- `ControlPanel`: Panel de control principal
- `ParameterEditor`: Editor de parámetros
- `AudioInitializer`: Inicializador de audio
- `TransformToolbar`: Barra de herramientas
- `SpatializationDebug`: Debug de espacialización
- `GridCreator`: Creador de cuadrículas

### Hooks Importados
- `useKeyboardShortcuts`: Atajos de teclado

## Consideraciones de Rendimiento

1. **Carga Asíncrona**: La escena 3D se carga de forma diferida
2. **Suspense**: Mejora la experiencia de usuario durante la carga
3. **Client-Side**: Renderizado del lado del cliente para interactividad
4. **Componentes Superpuestos**: UI superpuesta sobre la escena 3D

## Relaciones con Otros Archivos

### Dependencias Directas
- Todos los componentes de UI en `../components/ui/`
- Componente de escena 3D en `../components/world/Experience`
- Hook de atajos en `../hooks/useKeyboardShortcuts`

### Archivos que lo Usan
- `src/app/layout.tsx`: Lo incluye como children
- Navegación de Next.js

## Uso en la Aplicación

Esta página es el corazón de la aplicación y proporciona:
- Punto de entrada principal para los usuarios
- Coordinación de todos los sistemas principales
- Interfaz unificada para la creación musical 3D
- Gestión de estados de carga y error

## Notas para Desarrollo

- Los componentes se renderizan en un orden específico para la superposición correcta
- El `Suspense` es crucial para el rendimiento de la escena 3D
- Los atajos de teclado se inicializan una sola vez al cargar la página
- La estructura de layout permite fácil adición de nuevos componentes de UI

