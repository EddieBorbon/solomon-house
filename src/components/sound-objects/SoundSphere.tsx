'use client';

import React, { forwardRef, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { type AudioParams } from '../../lib/AudioManager';

interface SoundSphereProps {
  id: string;
  position: [number, number, number];
  isSelected: boolean;
  audioEnabled: boolean;
  audioParams: AudioParams;
}

export const SoundSphere = forwardRef<THREE.Group, SoundSphereProps>(
  ({ id, position, isSelected, audioEnabled, audioParams }, ref) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.MeshStandardMaterial>(null);
    
    // Crear geometría de esfera con más detalle
    const sphereGeometry = useMemo(() => {
      return new THREE.SphereGeometry(0.7, 32, 32);
    }, []);

    // Animación basada en los parámetros de audio
    useFrame((state) => {
      if (!meshRef.current || !materialRef.current) return;

      const time = state.clock.elapsedTime;
      
      // Animación de rotación suave
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.x += 0.005;

      // Efecto de pulso basado en modulationIndex
      const pulseIntensity = audioEnabled ? (audioParams.modulationIndex || 10) / 40 : 0;
      const pulseScale = 1 + Math.sin(time * 3) * pulseIntensity * 0.1;
      meshRef.current.scale.setScalar(pulseScale);

      // Efecto de brillo basado en harmonicity
      if (materialRef.current) {
        const harmonicityEffect = audioEnabled ? (audioParams.harmonicity || 2) / 8 : 0;
        materialRef.current.emissiveIntensity = audioEnabled ? 0.3 + harmonicityEffect * 0.4 : 0;
        
        // Cambio sutil de color basado en modulationIndex
        const modulationEffect = audioEnabled ? (audioParams.modulationIndex || 10) / 40 : 0;
        materialRef.current.emissive.setHSL(
          0.6 + modulationEffect * 0.1, // Tono azul-morado
          0.7,
          0.3 + modulationEffect * 0.2
        );
      }
    });

    return (
      <group ref={ref} position={position}>
        {/* Esfera principal */}
        <mesh ref={meshRef} geometry={sphereGeometry}>
          <meshStandardMaterial
            ref={materialRef}
            color="#8b5cf6" // Color morado base
            metalness={0.1}
            roughness={0.2}
            transparent
            opacity={0.9}
            emissive="#4c1d95"
            emissiveIntensity={audioEnabled ? 0.3 : 0}
          />
        </mesh>

        {/* Wireframe cuando está seleccionado */}
        {isSelected && (
          <Sphere args={[0.75, 16, 16]}>
            <meshBasicMaterial
              color="#fbbf24"
              wireframe
              transparent
              opacity={0.8}
            />
          </Sphere>
        )}

        {/* Indicador de audio activo */}
        {audioEnabled && (
          <Sphere args={[0.8, 8, 8]}>
            <meshBasicMaterial
              color="#10b981"
              wireframe
              transparent
              opacity={0.6}
            />
          </Sphere>
        )}
      </group>
    );
  }
);

SoundSphere.displayName = 'SoundSphere';
