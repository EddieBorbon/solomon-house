'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { SceneContent } from './SceneContent';
import { useCameraControls } from '../../hooks/useCameraControls';
import { CameraControlsManager } from './CameraControlsManager';
import * as THREE from 'three';
import { useAudioListener } from '../../hooks/useAudioListener';
import { audioManager } from '../../lib/AudioManager';
import { useGlobalWorldSync } from '../../hooks/useGlobalWorldSync';
import { QuotaWarning } from '../ui/QuotaWarning';
import { useTutorialStore } from '../../stores/useTutorialStore';
import { useEntitySelector } from '../../hooks/useEntitySelector';
import { useWorldStore } from '../../state/useWorldStore';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAudioContext } from '../../hooks/useAudioContext';

// Componente interno para manejar los controles de cámara y audio espacializado
function CameraControllerInternal({ orbitControlsRef }: { orbitControlsRef: React.RefObject<OrbitControlsImpl | null> }) {
  const { } = useThree();
  const { updateCameraPosition } = useCameraControls();
  const { isActive, currentStep, addCameraPosition } = useTutorialStore();
  const { selectedEntity, selectedEntityId } = useEntitySelector();
  const { grids, activeGridId, currentGridCoordinates, gridSize } = useWorldStore();
  
  // Inicializar la espacialización de audio
  useAudioListener();

  // Vector para almacenar la dirección de la cámara (evitar recrearlo en cada frame)
  const forwardVector = useRef(new THREE.Vector3());
  const lastCameraPosition = useRef<THREE.Vector3 | null>(null);
  const targetVector = useRef(new THREE.Vector3());

  useFrame(({ camera }) => {
    if (orbitControlsRef.current) {
      // Actualizar el target de OrbitControls según la selección
      let targetPosition: THREE.Vector3;
      
      if (selectedEntity && selectedEntityId) {
        // Si hay un objeto seleccionado, usar su posición mundial
        const entityData = selectedEntity.data;
        
        // Encontrar la cuadrícula que contiene este objeto
        let worldPosition: [number, number, number] = entityData.position;
        for (const grid of grids.values()) {
          if (grid.objects.some(obj => obj.id === selectedEntityId) ||
              grid.mobileObjects.some(obj => obj.id === selectedEntityId) ||
              grid.effectZones.some(zone => zone.id === selectedEntityId)) {
            // Calcular posición mundial: posición local + posición de la cuadrícula
            worldPosition = [
              grid.position[0] + entityData.position[0],
              grid.position[1] + entityData.position[1],
              grid.position[2] + entityData.position[2]
            ];
            break;
          }
        }
        
        targetVector.current.set(worldPosition[0], worldPosition[1], worldPosition[2]);
        targetPosition = targetVector.current;
      } else {
        // Si no hay objeto seleccionado, usar el centro de la cuadrícula activa
        let centerPosition: [number, number, number];
        
        if (activeGridId && grids.has(activeGridId)) {
          const activeGrid = grids.get(activeGridId)!;
          // Usar la posición de la cuadrícula activa como centro
          centerPosition = activeGrid.position;
        } else {
          // Fallback: usar el centro de la cuadrícula actual basado en coordenadas
          const [x, y, z] = currentGridCoordinates;
          centerPosition = [
            x * gridSize,
            y * gridSize,
            z * gridSize
          ];
        }
        
        targetVector.current.set(centerPosition[0], centerPosition[1], centerPosition[2]);
        targetPosition = targetVector.current;
      }
      
      // Actualizar el target de OrbitControls suavemente
      orbitControlsRef.current.target.lerp(targetPosition, 0.1);
      orbitControlsRef.current.update();
      
      updateCameraPosition(camera, orbitControlsRef.current);
      
      // FORZAR OrbitControls SIEMPRE HABILITADO en cada frame
      if (!orbitControlsRef.current.enabled) {
        orbitControlsRef.current.enabled = true;
        console.log('🎮 CameraControllerInternal: OrbitControls re-habilitado en frame');
      }
    }

    // --- NUEVA FUNCIONALIDAD: Actualizar listener de audio en tiempo real ---
    try {
      // Obtener la posición actual de la cámara
      const position = camera.position;
      
      // Calcular el vector "hacia adelante" de la cámara
      camera.getWorldDirection(forwardVector.current);
      
      // Actualizar el listener de audio con la nueva posición y orientación
      audioManager.updateListener(position, forwardVector.current);
      
      // Rastrear posición de cámara para el tutorial (paso 7)
      if (isActive && currentStep === 6) {
        const currentPos = camera.position;
        // Solo registrar si la posición cambió significativamente (evitar spam)
        if (!lastCameraPosition.current || currentPos.distanceTo(lastCameraPosition.current) > 0.5) {
          addCameraPosition(currentPos.x, currentPos.y, currentPos.z);
          lastCameraPosition.current = currentPos.clone();
        }
      }
    } catch {
    }
  });

  return null;
}

export function Experience() {
  const orbitControlsRef = useRef<OrbitControlsImpl | null>(null);
  const { t } = useLanguage();
  const {
    startAudioContext,
    isAudioContextStarted,
    isInitializing
  } = useAudioContext();
  const hasAttemptedAudioStartRef = React.useRef(false);
  const attemptStartAudio = React.useCallback(() => {
    if (isAudioContextStarted || isInitializing) {
      return;
    }

    if (hasAttemptedAudioStartRef.current) {
      return;
    }

    hasAttemptedAudioStartRef.current = true;

    startAudioContext().catch(() => {
      hasAttemptedAudioStartRef.current = false;
    });
  }, [isAudioContextStarted, isInitializing, startAudioContext]);
  const handleCanvasPointerDown = React.useCallback(() => {
    attemptStartAudio();
  }, [attemptStartAudio]);

  React.useEffect(() => {
    if (isAudioContextStarted) {
      hasAttemptedAudioStartRef.current = false;
      return;
    }

    const audioStartEvents: Array<keyof WindowEventMap> = ['pointerdown', 'touchstart', 'keydown'];
    const handleEvent: EventListener = () => {
      attemptStartAudio();
    };

    audioStartEvents.forEach(event => {
      window.addEventListener(event, handleEvent);
    });

    return () => {
      audioStartEvents.forEach(event => {
        window.removeEventListener(event, handleEvent);
      });
    };
  }, [attemptStartAudio, isAudioContextStarted]);
  
  // Estado para mostrar advertencia de cuota
  const [showQuotaWarning, setShowQuotaWarning] = React.useState(false);
  
  // Inicializar sincronización del mundo global solo para detectar errores de cuota
  const { error } = useGlobalWorldSync();
  
  // Detectar errores de cuota
  React.useEffect(() => {
    if (error?.includes(t('quotaWarning.quotaExceeded'))) {
      setShowQuotaWarning(true);
    }
  }, [error, t]);
  

  // Función para limpiar datos de Firestore
  const handleCleanup = async () => {
    try {
      // Aquí podrías implementar la limpieza
      console.log(t('quotaWarning.cleaningData'));
      setShowQuotaWarning(false);
      // Recargar la página para reconectar
      window.location.reload();
    } catch (error) {
      console.error(t('quotaWarning.errorCleaning'), error);
    }
  };

  return (
    <div className="w-full h-screen">
      {/* Advertencia de cuota */}
      <QuotaWarning 
        isVisible={showQuotaWarning}
        onDismiss={() => setShowQuotaWarning(false)}
        onCleanup={handleCleanup}
      />
      
      
      <Canvas
        onPointerDown={handleCanvasPointerDown}
        camera={{
          position: [5, 5, 5],
          fov: 75,
          near: 0.1,
          far: 1000
        }}
        shadows
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          preserveDrawingBuffer: false,
          failIfMajorPerformanceCaveat: false
        }}
        onCreated={({ gl, camera }) => {
          // Configuración adicional del renderer
          gl.setClearColor('#f0f0f0', 1);
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = 2; // PCFSoftShadowMap
          gl.toneMapping = 2; // ACESFilmicToneMapping
          gl.toneMappingExposure = 1.2;
          gl.outputColorSpace = 'srgb';
          
          // Guardar referencia a la cámara
          if (orbitControlsRef.current) {
            orbitControlsRef.current.object = camera;
          }
        }}
      >
        {/* Controlador de cámara WASD */}
        <CameraControllerInternal orbitControlsRef={orbitControlsRef} />
        
        {/* Manager de controles de cámara */}
        <CameraControlsManager orbitControlsRef={orbitControlsRef} />
        
        {/* Controles de cámara */}
        <OrbitControls 
          ref={orbitControlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxDistance={500}
          minDistance={0.5}
          dampingFactor={0.1}
          enableDamping={true}
          autoRotate={false}
          autoRotateSpeed={0}
          screenSpacePanning={false} // Asegurar que el pan se haga en el plano perpendicular a la cámara
          // enableKeys={true} // Propiedad no existe en OrbitControls
          mouseButtons={{
            LEFT: undefined, // Desactivar botón izquierdo para rotar
            MIDDLE: THREE.MOUSE.DOLLY, // Botón medio para zoom
            RIGHT: THREE.MOUSE.ROTATE // Usar botón derecho para rotar
          }}
          touches={{
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_PAN
          }}
          onStart={() => {
            console.log('🎮 OrbitControls: Interacción iniciada');
            // Forzar habilitación inmediata
            if (orbitControlsRef.current) {
              orbitControlsRef.current.enabled = true;
            }
          }}
          onEnd={() => {
            console.log('🎮 OrbitControls: Interacción terminada');
            // Mantener habilitado después de la interacción
            if (orbitControlsRef.current) {
              orbitControlsRef.current.enabled = true;
              orbitControlsRef.current.update();
            }
          }}
          onChange={() => {
            // Forzar actualización del estado interno para prevenir congelamiento
            if (orbitControlsRef.current) {
              orbitControlsRef.current.enabled = true;
            }
          }}
        />

        {/* Iluminación básica */}
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        
        {/* Luz adicional para mejor iluminación */}
        <directionalLight
          position={[-5, 8, -5]}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />

        {/* Luz de relleno suave */}
        <hemisphereLight 
          intensity={0.2} 
          groundColor="#404040" 
          color="#ffffff" 
        />

        {/* Grid helper eliminado - las cuadrículas personalizadas ya proporcionan la referencia visual */}

        {/* Entorno - temporalmente deshabilitado para evitar errores de shader */}
        {/* <Environment preset={environmentPreset} /> */}

        {/* Contenido de la escena */}
        <SceneContent orbitControlsRef={orbitControlsRef} />
      </Canvas>
    </div>
  );
}
