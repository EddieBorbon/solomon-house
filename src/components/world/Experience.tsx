'use client';

import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { SceneContent } from './SceneContent';
import { Suspense } from 'react';
import { useCameraControls } from '../../hooks/useCameraControls';
import * as THREE from 'three';

type EnvironmentPreset = 'forest' | 'sunset' | 'dawn' | 'night' | 'warehouse' | 'apartment' | 'studio' | 'city' | 'park' | 'lobby';

// Componente interno para manejar los controles de cámara
function CameraController({ orbitControlsRef }: { orbitControlsRef: React.RefObject<any> }) {
  const { updateCameraPosition } = useCameraControls(null, orbitControlsRef.current);

  useFrame(({ camera }) => {
    if (orbitControlsRef.current) {
      updateCameraPosition(camera, orbitControlsRef.current);
    }
  });

  return null;
}

export function Experience() {
  const orbitControlsRef = useRef<any>(null);
  const [environmentPreset] = useState<EnvironmentPreset>('forest');

  return (
    <div className="w-full h-screen">
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
        <CameraController orbitControlsRef={orbitControlsRef} />
        
        {/* Controles de cámara */}
        <OrbitControls 
          ref={orbitControlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxDistance={50}
          minDistance={1}
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

        {/* Grid helper para referencia visual */}
        <gridHelper args={[20, 20, '#888888', '#cccccc']} />

        {/* Entorno */}
        <Environment preset={environmentPreset} />

        {/* Contenido de la escena */}
        <SceneContent orbitControlsRef={orbitControlsRef} />
      </Canvas>
    </div>
  );
}
