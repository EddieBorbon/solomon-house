'use client';

import { useState } from 'react';
import { Experience } from '../components/world/Experience';
import { ControlPanel } from '../components/ui/ControlPanel';
import { ParameterEditor } from '../components/ui/ParameterEditor';
import { TransformToolbar } from '../components/ui/TransformToolbar';
import { LoadingScreen } from '../components/ui/LoadingScreen';
import { TutorialOverlay } from '../components/tutorial/TutorialOverlay';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useTutorialStore } from '../stores/useTutorialStore';

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true);
  const { startTutorial, isActive } = useTutorialStore();
  
  // Hook para atajos de teclado
  useKeyboardShortcuts();

  const handleStartTutorial = () => {
    setShowWelcome(false);
    // Iniciar el tutorial
    startTutorial();
  };

  const handleSkipTutorial = () => {
    setShowWelcome(false);
    // Entrar sin tutorial
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
        
        {/* Panel de control */}
        <ControlPanel />
        
        {/* Escena 3D */}
        <Experience />
      </div>

      {/* Modal de bienvenida - superpuesto sobre la aplicación */}
      {showWelcome && (
        <LoadingScreen 
          variant="initial" 
          onStart={handleStartTutorial}
          onSkipTutorial={handleSkipTutorial}
        />
      )}

      {/* Tutorial Overlay */}
      {!showWelcome && isActive ? (
        <TutorialOverlay />
      ) : (
        !showWelcome && console.log('🔴 Tutorial no activo:', { isActive, showWelcome })
      )}

    </div>
  );
}
