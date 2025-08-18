'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { useWorldStore } from '../../state/useWorldStore';

interface SoundCubeProps {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  isSelected: boolean;
  audioEnabled: boolean;
}

export function SoundCube({
  id,
  position,
  rotation,
  scale,
  isSelected,
  audioEnabled,
}: SoundCubeProps) {
  const meshRef = useRef<Mesh>(null);

  // Animación del cubo cuando está reproduciendo sonido
  useFrame((state) => {
    if (meshRef.current && audioEnabled) {
      // Hacer que el cubo "respire" cuando está sonando
      const time = state.clock.elapsedTime;
      const breathingScale = 1 + Math.sin(time * 4) * 0.1;
      meshRef.current.scale.setScalar(breathingScale);
      
      // Rotación sutil cuando está sonando
      meshRef.current.rotation.y += 0.01;
    }
  });

  const handleClick = () => {
    useWorldStore.getState().selectObject(id);
  };

  const handlePointerEnter = () => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(1.1);
    }
  };

  const handlePointerLeave = () => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(1);
    }
  };

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Cubo principal */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={isSelected ? '#ff6b6b' : '#4ecdc4'}
          transparent
          opacity={0.8}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Wireframe cuando está seleccionado */}
      {isSelected && (
        <mesh>
          <boxGeometry args={[1.05, 1.05, 1.05]} />
          <meshBasicMaterial
            color="#ffd93d"
            wireframe
            transparent
            opacity={0.8}
          />
        </mesh>
      )}

      {/* Indicador de estado de audio */}
      {audioEnabled && (
        <mesh position={[0, 1.5, 0]}>
          <sphereGeometry args={[0.15, 8, 6]} />
          <meshStandardMaterial
            color="#00ff88"
            emissive="#00ff88"
            emissiveIntensity={0.8}
          />
        </mesh>
      )}

      {/* Etiqueta del objeto */}
      <group position={[0, -1.2, 0]}>
        <mesh>
          <planeGeometry args={[2, 0.5]} />
          <meshBasicMaterial
            color="#000000"
            transparent
            opacity={0.7}
          />
        </mesh>
      </group>

      {/* Botón de prueba de audio */}
      <group position={[0, -2.5, 0]}>
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            // Toggle del estado de audio usando la acción del store
            useWorldStore.getState().toggleObjectAudio(id);
          }}
        >
          <boxGeometry args={[1.5, 0.3, 0.1]} />
          <meshBasicMaterial
            color={audioEnabled ? '#ff4757' : '#2ed573'}
            transparent
            opacity={0.9}
          />
        </mesh>
      </group>
    </group>
  );
}
