'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats, Environment } from '@react-three/drei';
import { SceneContent } from './SceneContent';
import { Suspense } from 'react';

export function Experience() {
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
        onCreated={({ gl }) => {
          // Configuración adicional del renderer
          gl.setClearColor('#f0f0f0', 1);
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = 2; // PCFSoftShadowMap
        }}
      >
        {/* Controles de cámara */}
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxDistance={50}
          minDistance={1}
          dampingFactor={0.05}
          enableDamping={true}
        />

        {/* Estadísticas de rendimiento */}
        <Stats />

        {/* Iluminación básica */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />

        {/* Grid helper para referencia visual */}
        <gridHelper args={[20, 20, '#888888', '#cccccc']} />

        {/* Ambiente de iluminación */}
        <Suspense fallback={null}>
          <Environment preset="sunset" />
        </Suspense>

        {/* Contenido principal de la escena */}
        <SceneContent />
      </Canvas>
    </div>
  );
}
