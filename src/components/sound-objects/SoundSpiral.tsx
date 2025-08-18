'use client';

import React, { forwardRef, useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Group } from '@react-three/drei';
import { useWorldStore } from '../../state/useWorldStore';
import { type AudioParams } from '../../lib/AudioManager';
import * as THREE from 'three';

interface SoundSpiralProps {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  isSelected: boolean;
  audioParams: AudioParams;
}

export const SoundSpiral = forwardRef<THREE.Group, SoundSpiralProps>(
  ({ id, position, rotation, scale, isSelected, audioParams }, ref) => {
    const { selectObject, triggerObjectNote } = useWorldStore();
    const groupRef = useRef<THREE.Group>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [pulseTime, setPulseTime] = useState(0);

    // Generar cajas para la espiral basadas en el número de samples disponibles
    const sampleCount = useMemo(() => {
      return audioParams.urls ? Object.keys(audioParams.urls).length : 4;
    }, [audioParams.urls]);

    // Crear posiciones para las cajas en forma de espiral
    const boxPositions = useMemo(() => {
      const positions: [number, number, number][] = [];
      const radius = 1.5;
      const height = 2;
      const turns = 2;
      
      for (let i = 0; i < sampleCount; i++) {
        const t = i / (sampleCount - 1);
        const angle = t * turns * Math.PI * 2;
        const x = Math.cos(angle) * radius * (1 - t * 0.3);
        const z = Math.sin(angle) * radius * (1 - t * 0.3);
        const y = t * height - height / 2;
        positions.push([x, y, z]);
      }
      
      return positions;
    }, [sampleCount]);

    // Manejar clic en el objeto
    const handleClick = (event: any) => {
      event.stopPropagation();
      selectObject(id);
      triggerObjectNote(id);
      
      // Efecto visual de pulso
      setIsPlaying(true);
      setPulseTime(0);
      
      // Resetear el estado después de un tiempo
      setTimeout(() => {
        setIsPlaying(false);
      }, 1000);
    };

    // Animación de rotación continua
    useFrame((state, delta) => {
      if (groupRef.current) {
        // Rotación lenta sobre el eje Y
        groupRef.current.rotation.y += delta * 0.2;
        
        // Efecto de "respiración" sutil
        const breathing = Math.sin(state.clock.elapsedTime * 2) * 0.05 + 1;
        groupRef.current.scale.setScalar(breathing);
      }
      
      // Actualizar tiempo del pulso
      if (isPlaying) {
        setPulseTime(prev => prev + delta);
      }
    });

    // Calcular colores para las cajas
    const getBoxColor = (index: number, isPulsing: boolean) => {
      if (isPulsing) {
        // Color de pulso basado en el tiempo
        const pulseIntensity = Math.sin(pulseTime * 10) * 0.5 + 0.5;
        return new THREE.Color(0.2 + pulseIntensity * 0.8, 0.8, 0.8 + pulseIntensity * 0.2);
      }
      
      // Color base con variación por índice
      const hue = (index / sampleCount) * 0.3 + 0.6; // Azul a cian
      const saturation = 0.7;
      const lightness = 0.5;
      return new THREE.Color().setHSL(hue, saturation, lightness);
    };

    // Calcular escala para las cajas
    const getBoxScale = (index: number) => {
      const baseScale = 0.3;
      const sizeVariation = Math.sin((index / sampleCount) * Math.PI) * 0.1;
      return baseScale + sizeVariation;
    };

    return (
      <group
        ref={groupRef}
        position={position}
        rotation={rotation}
        scale={scale}
        onClick={handleClick}
      >
        {/* Cajas de la espiral */}
        {boxPositions.map((pos, index) => {
          const isPulsing = isPlaying && pulseTime < 1.0;
          const color = getBoxColor(index, isPulsing);
          const boxScale = getBoxScale(index);
          
          return (
            <Box
              key={index}
              position={pos}
              args={[boxScale, boxScale, boxScale]}
              scale={[1, 1, 1]}
            >
              <meshStandardMaterial
                color={color}
                emissive={isPulsing ? color.clone().multiplyScalar(0.3) : new THREE.Color(0, 0, 0)}
                metalness={0.3}
                roughness={0.7}
                transparent
                opacity={isPulsing ? 0.9 : 0.8}
              />
            </Box>
          );
        })}

        {/* Indicador de selección */}
        {isSelected && (
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[2.5, 16, 16]} />
            <meshBasicMaterial
              color="#00ffff"
              transparent
              opacity={0.1}
              wireframe
            />
          </mesh>
        )}

        {/* Efecto de partículas cuando está tocando */}
        {isPlaying && (
          <group>
            {Array.from({ length: 8 }).map((_, index) => {
              const angle = (index / 8) * Math.PI * 2;
              const radius = 2 + pulseTime * 3;
              const x = Math.cos(angle) * radius;
              const z = Math.sin(angle) * radius;
              const y = Math.sin(pulseTime * 5 + index) * 0.5;
              
              return (
                <mesh
                  key={`particle-${index}`}
                  position={[x, y, z]}
                >
                  <sphereGeometry args={[0.05, 8, 8]} />
                  <meshBasicMaterial
                    color="#00ffff"
                    transparent
                    opacity={1 - pulseTime}
                  />
                </mesh>
              );
            })}
          </group>
        )}
      </group>
    );
  }
);

SoundSpiral.displayName = 'SoundSpiral';
