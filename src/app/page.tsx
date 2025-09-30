'use client';

import { useState } from 'react';
import { Experience } from '../components/world/Experience';
import { GlobalControlPanel } from '../components/ui/GlobalControlPanel';
import { GridSelector } from '../components/ui/GridSelector';
import { ParameterEditor } from '../components/ui/ParameterEditor';
import { TransformToolbar } from '../components/ui/TransformToolbar';
import { LoadingScreen } from '../components/ui/LoadingScreen';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true);
  
  // Hook para atajos de teclado
  useKeyboardShortcuts();

  const handleStartExperience = () => {
    setShowWelcome(false);
  };

  return (
    <div className="w-full h-screen relative">
      {/* Aplicación principal - siempre visible */}
      <div className="w-full h-full">
        {/* Barra de herramientas de transformación */}
        <TransformToolbar />
        
        {/* Editor de parámetros (incluye transformación) */}
        <ParameterEditor />
        
        {/* Información del mundo */}
        
        {/* Panel de control global */}
        <GlobalControlPanel />
        
        {/* Selector de cuadrículas */}
        <GridSelector />
        
        {/* Escena 3D */}
        <Experience />
      </div>

      {/* Modal de bienvenida - superpuesto sobre la aplicación */}
      {showWelcome && (
        <LoadingScreen variant="initial" onStart={handleStartExperience} />
      )}

    </div>
  );
}
