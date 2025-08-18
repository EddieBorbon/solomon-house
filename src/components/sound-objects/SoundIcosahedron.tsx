'use client';

import React, { forwardRef, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useWorldStore } from '../../state/useWorldStore';

interface SoundIcosahedronProps {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  isSelected: boolean;
  audioParams: any;
}

export const SoundIcosahedron = forwardRef<THREE.Group, SoundIcosahedronProps>(
  ({ id, position, rotation, scale, isSelected, audioParams }, ref) => {
    const { selectObject, triggerObjectNote } = useWorldStore();
    
    // Referencias para la animación
    const meshRef = useRef<THREE.Mesh>(null);
    const animationRef = useRef<{ energy: number; lastHit: number }>({
      energy: 0,
      lastHit: 0,
    });

    // Escala de selección
    const selectionScale = isSelected ? 1.2 : 1.0;

    // Animación de vibración cuando se toca
    const handleClick = (event: any) => {
      event.stopPropagation();
      selectObject(id);
      triggerObjectNote(id);
      
      // Activar la animación de vibración
      animationRef.current.energy = 1.0;
      animationRef.current.lastHit = Date.now();
    };

    // Animación en cada frame
    useFrame((state, delta) => {
      if (meshRef.current && animationRef.current.energy > 0) {
        // Decaer la energía de la vibración
        animationRef.current.energy *= 0.95;
        
        // Aplicar rotación caótica basada en la energía
        const time = state.clock.elapsedTime;
        const energy = animationRef.current.energy;
        
        meshRef.current.rotation.x += Math.sin(time * 50) * energy * 0.1;
        meshRef.current.rotation.y += Math.cos(time * 30) * energy * 0.1;
        meshRef.current.rotation.z += Math.sin(time * 40) * energy * 0.1;
        
        // Detener la animación cuando la energía sea muy baja
        if (animationRef.current.energy < 0.01) {
          animationRef.current.energy = 0;
        }
      }
    });

    return (
      <group ref={ref} position={position} rotation={rotation}>
        {/* Indicador de selección */}
        {isSelected && (
          <mesh position={[0, 1.2, 0]}>
            <ringGeometry args={[0.8, 1.0, 32]} />
            <meshBasicMaterial color="#60a5fa" transparent opacity={0.8} />
          </mesh>
        )}
        
        {/* Icosaedro principal */}
        <mesh
          ref={meshRef}
          scale={[scale[0] * selectionScale, scale[1] * selectionScale, scale[2] * selectionScale]}
          onClick={handleClick}
          onPointerOver={(e) => {
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={(e) => {
            document.body.style.cursor = 'default';
          }}
        >
          <icosahedronGeometry args={[0.8, 0]} />
          <meshStandardMaterial
            color={isSelected ? "#818cf8" : "#6366f1"}
            metalness={0.9}
            roughness={0.1}
            emissive={isSelected ? "#4338ca" : "#1e1b4b"}
            emissiveIntensity={isSelected ? 0.3 : 0.1}
          />
        </mesh>
        
        {/* Efecto de brillo metálico */}
        <mesh position={[0, 0, 0.85]}>
          <planeGeometry args={[0.1, 0.1]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.6}
            side={2}
          />
        </mesh>
      </group>
    );
  }
);

SoundIcosahedron.displayName = 'SoundIcosahedron';
