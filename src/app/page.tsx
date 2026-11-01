'use client';

import { useState } from 'react';
import { Experience } from '../components/world/Experience';
import { ControlPanel } from '../components/ui/ControlPanel';
import { ParameterEditor } from '../components/ui/ParameterEditor';
import { TransformToolbar } from '../components/ui/TransformToolbar';
import { LoadingScreen } from '../components/ui/LoadingScreen';
import { LatencyMonitor } from '../components/ui/LatencyMonitor';
import { SessionResearchPanel } from '../components/ui/SessionResearchPanel';
import { ExpandedScorePanel } from '../components/ui/ExpandedScorePanel';
import { VisualSonicCoherencePanel } from '../components/ui/VisualSonicCoherencePanel';
import { CommunityInteroperabilityPanel } from '../components/ui/CommunityInteroperabilityPanel';
import { FutureProjectionPanel } from '../components/ui/FutureProjectionPanel';
import { AcousticCalibrator } from '../components/ui/AcousticCalibrator';
import { HrtfProfileManager } from '../components/ui/HrtfProfileManager';
import { MappingEditor } from '../components/ui/MappingEditor';
import { TutorDashboard } from '../components/ui/TutorDashboard';
import { GalleryPublisher } from '../components/ui/GalleryPublisher';
import { AudioExamPanel } from '../components/ui/AudioExamPanel';
import { CurriculumGuide } from '../components/ui/CurriculumGuide';
import { HeadTrackingToggle } from '../components/ui/HeadTrackingToggle';
import { SonicGardenerToggle } from '../components/ui/SonicGardenerToggle';
import { SampleDropZone } from '../components/ui/SampleDropZone';
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

        {/* Monitor de latencia de red (RTT) */}
        <LatencyMonitor />

        {/* Modales integrados gobernados desde ControlPanel (useUIPanelStore) */}
        <SessionResearchPanel />
        <ExpandedScorePanel />
        <VisualSonicCoherencePanel />
        <CommunityInteroperabilityPanel />
        <FutureProjectionPanel />
        <AcousticCalibrator />
        <HrtfProfileManager />
        <MappingEditor />
        <TutorDashboard />
        <GalleryPublisher />
        <AudioExamPanel />
        <CurriculumGuide />
        <SonicGardenerToggle />

        {/* Seguimiento de cabeza en móviles */}
        <HeadTrackingToggle />

        {/* Carga de samples por arrastrar y soltar (N4) */}
        <SampleDropZone />

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
