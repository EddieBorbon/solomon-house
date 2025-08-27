'use client';

import React, { forwardRef, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Group, MeshStandardMaterial, Color } from 'three';
import { useWorldStore } from '../../state/useWorldStore';

interface SoundCubeProps {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  isSelected: boolean;
  audioEnabled: boolean;
  audioParams: {
    frequency: number;
    volume: number;
    waveform: OscillatorType;
    harmonicity?: number;
    modulationWaveform?: OscillatorType;
    duration?: number;
  };
}

export const SoundCube = forwardRef<Group, SoundCubeProps>(({
  id,
  position,
  rotation,
  scale,
  isSelected,
  audioEnabled,
  audioParams,
}, ref) => {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<MeshStandardMaterial>(null);
  const energyRef = useRef(0); // Para la animación de clic
  const { 
    triggerObjectNote, 
    selectEntity, 
    triggerObjectAttackRelease, 
    startObjectGate, 
    stopObjectGate 
  } = useWorldStore();

  // Manejador para clic corto (trigger)
  const handleClick = (event: any) => {
    event.stopPropagation();
    selectEntity(id);
    triggerObjectAttackRelease(id);
    
    // Activar la animación de clic
    energyRef.current = 1;
  };

  // Manejador para clic sostenido (gate)
  const handlePointerDown = (event: any) => {
    event.stopPropagation();
    startObjectGate(id);
    
    // Activar la animación de gate
    energyRef.current = 1;
  };

  // Manejador para liberar clic sostenido
  const handlePointerUp = (event: any) => {
    event.stopPropagation();
    stopObjectGate(id);
  };

  // Manejador para cuando el puntero sale del objeto
  const handlePointerLeave = (event: any) => {
    event.stopPropagation();
    stopObjectGate(id);
  };

  // Animación del cubo cuando se hace clic o está sonando
  useFrame((state, delta) => {
    if (!meshRef.current || !materialRef.current || !audioParams) return;

    // Decaer la energía del clic/gate
    if (energyRef.current > 0) {
      // Calcular la velocidad de decaimiento basada en la duración del sonido
      const duration = audioParams?.duration;
      let decayRate = 0.9; // Decaimiento por defecto
      
      if (duration && duration !== Infinity) {
        // Ajustar la velocidad de decaimiento para que coincida con la duración del sonido
        decayRate = Math.pow(0.1, delta / duration);
      }
      
      energyRef.current *= decayRate;
      
      // Aplicar la energía como escala pulsante
      const pulseScale = 1 + energyRef.current * 0.2;
      meshRef.current.scale.set(pulseScale, pulseScale, pulseScale);
      
      // Cambiar el color basado en la energía (azul intenso a azul suave)
      const intensity = energyRef.current;
      const blueColor = new Color(0.3, 0.8 + intensity * 0.2, 0.8 + intensity * 0.2);
      materialRef.current.color.copy(blueColor);
      
      // Emisión basada en la energía
      materialRef.current.emissiveIntensity = intensity * 0.3;
    } else {
      // Resetear a valores por defecto
      meshRef.current.scale.set(scale[0], scale[1], scale[2]);
      materialRef.current.color.setHex(0x4ecdc4); // Azul por defecto
      materialRef.current.emissiveIntensity = 0;
    }
  });

  return (
    <group ref={ref} position={position} rotation={rotation} scale={scale}>
      {/* Cubo principal */}
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          ref={materialRef}
          color="#4ecdc4"
          transparent
          opacity={0.9}
          roughness={0.2}
          metalness={0.3}
          emissive="#000000"
          emissiveIntensity={0}
          envMapIntensity={1.0}
        />
      </mesh>

      {/* Indicador de selección sin wireframe */}
      {isSelected && (
        <mesh>
          <boxGeometry args={[1.05, 1.05, 1.05]} />
          <meshBasicMaterial
            color="#ffd93d"
            transparent
            opacity={0.3}
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

      {/* Switch de audio - ELIMINADO */}
    </group>
  );
});

SoundCube.displayName = 'SoundCube';
