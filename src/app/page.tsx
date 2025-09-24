'use client';

import { Suspense } from 'react';
import { Experience } from '../components/world/Experience';
import { ControlPanel } from '../components/ui/ControlPanel';
import { ParameterEditor } from '../components/ui/ParameterEditor';
import { AudioInitializer } from '../components/ui/AudioInitializer';
import { TransformToolbar } from '../components/ui/TransformToolbar';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

export default function Home() {
  // Hook para atajos de teclado
  useKeyboardShortcuts();

  return (
    <div className="w-full h-screen relative">
      {/* Barra de herramientas de transformación */}
      <TransformToolbar />
      
      {/* Editor de parámetros (incluye transformación) */}
      <ParameterEditor />
      
      {/* Información del mundo */}
      
      {/* Panel de control */}
      <ControlPanel />
      
      {/* Inicializador de Audio */}
      <AudioInitializer />
      
      
      
      
      {/* Escena 3D */}
      <Suspense fallback={
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-xl">Cargando mundo 3D...</p>
          </div>
        </div>
      }>
        <Experience />
      </Suspense>
    </div>
  );
}
