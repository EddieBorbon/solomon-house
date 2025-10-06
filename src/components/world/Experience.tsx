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
import { RealtimeSyncStatus } from '../ui/RealtimeSyncStatus';
import { useWorldStore } from '../../state/useWorldStore';
import { useGlobalWorldSync } from '../../hooks/useGlobalWorldSync';
import { QuotaWarning } from '../ui/QuotaWarning';

// Componente interno para manejar los controles de cámara y audio espacializado
function CameraControllerInternal({ orbitControlsRef }: { orbitControlsRef: React.RefObject<OrbitControlsImpl | null> }) {
  const { } = useThree();
  const { updateCameraPosition } = useCameraControls();
  
  // Inicializar la espacialización de audio
  useAudioListener();

  // Vector para almacenar la dirección de la cámara (evitar recrearlo en cada frame)
  const forwardVector = useRef(new THREE.Vector3());

  useFrame(({ camera }) => {
    if (orbitControlsRef.current) {
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
    } catch {
    }
  });

  return null;
}

export function Experience() {
  const orbitControlsRef = useRef<OrbitControlsImpl | null>(null);
  const { currentProjectId } = useWorldStore();
  
  // Inicializar sincronización del mundo global
  const {
    isConnected,
    error,
    isInitializing,
    reconnect,
    clearError
  } = useGlobalWorldSync();
  
  // Estado para mostrar advertencia de cuota
  const [showQuotaWarning, setShowQuotaWarning] = React.useState(false);
  
  // Detectar errores de cuota
  React.useEffect(() => {
    if (error?.includes('Cuota de Firestore excedida')) {
      setShowQuotaWarning(true);
    }
  }, [error]);
  

  // Función para limpiar datos de Firestore
  const handleCleanup = async () => {
    try {
      // Aquí podrías implementar la limpieza
      console.log('Limpiando datos de Firestore...');
      setShowQuotaWarning(false);
      clearError();
      // Recargar la página para reconectar
      window.location.reload();
    } catch (error) {
      console.error('Error durante la limpieza:', error);
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
      
      {/* Estado de sincronización en tiempo real */}
      <RealtimeSyncStatus projectId={currentProjectId} />
      
      {/* Estado de conexión del mundo global */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-black/80 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
            <span>
              {isInitializing ? 'Inicializando...' : 
               isConnected ? 'Mundo Global Conectado' : 
               'Mundo Global Desconectado'}
            </span>
          </div>
          
          {error && (
            <div className="mt-2 text-red-300 text-xs">
              <div className="flex items-center gap-2">
                <span>Error: {error}</span>
                <button 
                  onClick={clearError}
                  className="text-red-400 hover:text-red-300"
                >
                  ✕
                </button>
              </div>
              <button 
                onClick={reconnect}
                className="mt-1 text-blue-300 hover:text-blue-200 underline"
              >
                Reintentar conexión
              </button>
            </div>
          )}
        </div>
      </div>
      
      <Canvas
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
