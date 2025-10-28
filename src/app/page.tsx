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
import { useWorldStore } from '../state/useWorldStore';

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true);
  const { startTutorial, isActive } = useTutorialStore();
  const { createGrid, setGlobalWorldConnected, deleteGrid } = useWorldStore();
  
  // Hook para atajos de teclado
  useKeyboardShortcuts();

  const handleStartTutorial = async () => {
    try {
      // Primero desactivar la conexión global para evitar que se cargue contenido
      setGlobalWorldConnected(false);
      
      // Limpiar todas las cuadrículas existentes
      const { grids } = useWorldStore.getState();
      grids.forEach((_, gridId) => {
        deleteGrid(gridId);
      });
      
      // Esperar un momento para que se complete la limpieza
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Crear un mundo vacío para el tutorial
      createGrid([0, 0, 0], 20);
      
      setShowWelcome(false);
      // Iniciar el tutorial
      startTutorial();
    } catch (error) {
      console.error('Error al inicializar el tutorial:', error);
      setShowWelcome(false);
      startTutorial();
    }
  };

  const handleSkipTutorial = async () => {
    try {
      // Conectar con el mundo global existente
      setGlobalWorldConnected(true);
      
      setShowWelcome(false);
      // Entrar sin tutorial
    } catch (error) {
      console.error('Error al conectar con el mundo global:', error);
      setShowWelcome(false);
    }
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
      {!showWelcome && isActive && (
        <TutorialOverlay />
      )}

    </div>
  );
}
