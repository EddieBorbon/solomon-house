'use client';

import React, { useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { SceneContent } from './SceneContent';
import { useCameraControls } from '../../hooks/useCameraControls';
import * as THREE from 'three';
import { useAudioListener } from '../../hooks/useAudioListener';
import { audioManager } from '../../lib/AudioManager';
import { RealtimeSyncStatus } from '../ui/RealtimeSyncStatus';
import { useWorldStore } from '../../state/useWorldStore';

type EnvironmentPreset = 'forest' | 'sunset' | 'dawn' | 'night' | 'warehouse' | 'apartment' | 'studio' | 'city' | 'park' | 'lobby';

// Componente interno para manejar los controles de cámara y audio espacializado
function CameraControllerInternal({ orbitControlsRef }: { orbitControlsRef: React.RefObject<unknown> }) {
  const { camera } = useThree();
  const { updateCameraPosition } = useCameraControls(camera, orbitControlsRef.current);
  
  // Inicializar la espacialización de audio
  useAudioListener();

  // Vector para almacenar la dirección de la cámara (evitar recrearlo en cada frame)
  const forwardVector = useRef(new THREE.Vector3());

  useFrame(({ camera }) => {
    if (orbitControlsRef.current) {
      updateCameraPosition(camera, orbitControlsRef.current);
    }

    // --- NUEVA FUNCIONALIDAD: Actualizar listener de audio en tiempo real ---
    try {
      // Obtener la posición actual de la cámara
      const position = camera.position;
      
      // Calcular el vector "hacia adelante" de la cámara
      camera.getWorldDirection(forwardVector.current);
      
      // Actualizar el listener de audio con la nueva posición y orientación
      audioManager.updateListener(position, forwardVector.current);
    } catch (error) {
      console.error('❌ Error al actualizar listener de audio:', error);
    }
  });

  return null;
}

export function Experience() {
  const orbitControlsRef = useRef<unknown>(null);
  const { currentProjectId } = useWorldStore();
  
  console.log('🎬 Experience component rendering...');

  return (
    <div className="w-full h-screen">
      {/* Estado de sincronización en tiempo real */}
      <RealtimeSyncStatus projectId={currentProjectId} />
      
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
            orbitControlsRef.current.camera = camera;
          }
        }}
      >
        {/* Controlador de cámara WASD */}
        <CameraControllerInternal orbitControlsRef={orbitControlsRef} />
        
        {/* Controles de cámara */}
        <OrbitControls 
          ref={orbitControlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxDistance={500}
          minDistance={0.5}
          dampingFactor={0.05}
          enableDamping={true}
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
