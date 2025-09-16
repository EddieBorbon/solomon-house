'use client';

import React, { forwardRef, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useWorldStore } from '../../state/useWorldStore';
import * as THREE from 'three';

interface SoundTorusProps {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  isSelected: boolean;
  audioParams: {
    frequency?: number;
    volume?: number;
    waveform?: OscillatorType;
    duration?: number;
  };
}

export const SoundTorus = forwardRef<THREE.Group, SoundTorusProps>(
  ({ id, position, rotation, scale, isSelected }, ref) => {
    const { selectEntity, triggerObjectNote } = useWorldStore();
    
    // Referencias para la animación
    const meshRef = useRef<THREE.Mesh>(null);
    const energyRef = useRef(0);
    const lastTriggerTimeRef = useRef(0);
    
    // Material con efecto de selección
    const material = useMemo(() => {
      return new THREE.MeshStandardMaterial({
        color: isSelected ? '#00ffff' : '#4a9eff',
        metalness: 0.3,
        roughness: 0.4,
        emissive: isSelected ? '#00ffff' : '#000000',
        emissiveIntensity: isSelected ? 0.3 : 0,
      });
    }, [isSelected]);

    // Función para manejar el clic
    const handleClick = (event: React.MouseEvent) => {
      event.stopPropagation();
      selectEntity(id);
      triggerObjectNote(id);
      
      // Activar la animación de vibración
      energyRef.current = 1.0;
      lastTriggerTimeRef.current = Date.now();
    };

    // Animación de vibración
    useFrame((state) => {
      if (meshRef.current && energyRef.current > 0) {
        // Decrementar la energía con el tiempo
        energyRef.current *= 0.95;
        
        // Aplicar deformación sutil basada en la energía
        const geometry = meshRef.current.geometry as THREE.TorusGeometry;
        const positions = geometry.attributes.position;
        const time = state.clock.elapsedTime;
        
        // Crear una deformación ondulante
        for (let i = 0; i < positions.count; i++) {
          const x = positions.getX(i);
          const y = positions.getY(i);
          const z = positions.getZ(i);
          
          // Aplicar deformación sinusoidal
          const deformation = Math.sin(time * 10 + i * 0.1) * energyRef.current * 0.1;
          positions.setXYZ(
            i,
            x + deformation * 0.1,
            y + deformation * 0.05,
            z + deformation * 0.1
          );
        }
        
        positions.needsUpdate = true;
        
        // Rotación rápida que se va frenando
        const rotationSpeed = energyRef.current * 0.5;
        meshRef.current.rotation.x += rotationSpeed;
        meshRef.current.rotation.y += rotationSpeed * 0.7;
        
        // Detener la animación cuando la energía sea muy baja
        if (energyRef.current < 0.01) {
          energyRef.current = 0;
        }
      }
    });

    return (
      <group
        ref={ref}
        position={position}
        rotation={rotation}
        scale={scale}
        onClick={handleClick}
      >
        <mesh ref={meshRef} material={material}>
          <torusGeometry args={[0.7, 0.2, 16, 100]} />
        </mesh>
        
        {/* Indicador de selección */}
        {isSelected && (
          <mesh position={[0, 0, 0]}>
            <ringGeometry args={[1.2, 1.4, 32]} />
            <meshBasicMaterial
              color="#00ffff"
              transparent
              opacity={0.6}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
      </group>
    );
  }
);

SoundTorus.displayName = 'SoundTorus';
