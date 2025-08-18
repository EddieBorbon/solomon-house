'use client';

import { forwardRef, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useWorldStore } from '../../state/useWorldStore';

interface SoundConeProps {
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
    pitchDecay?: number;
    octaves?: number;
    duration?: number;
  };
}

export const SoundCone = forwardRef<THREE.Group, SoundConeProps>(
  ({ id, position, rotation, scale, isSelected, audioEnabled, audioParams }, ref) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.MeshStandardMaterial>(null);
    const energyRef = useRef(0); // Para la animación de golpe percusivo
    
    const { triggerObjectNote, selectObject } = useWorldStore();

    // Animación del golpe percusivo
    useFrame((state, delta) => {
      if (!meshRef.current || !materialRef.current || !audioParams) return;

      // Decaer la energía del golpe
      if (energyRef.current > 0) {
        // Calcular la velocidad de decaimiento basada en la duración del sonido
        const duration = audioParams?.duration;
        let decayRate = 0.9; // Decaimiento por defecto
        
        if (duration && duration !== Infinity) {
          // Ajustar la velocidad de decaimiento para que coincida con la duración del sonido
          // Un decaimiento más lento para sonidos más largos
          decayRate = Math.pow(0.1, delta / duration);
        }
        
        energyRef.current *= decayRate;
        
        // Aplicar la energía como escala pulsante
        const pulseScale = 1 + energyRef.current * 0.3;
        meshRef.current.scale.set(pulseScale, pulseScale, pulseScale);
        
        // Cambiar el color basado en la energía (naranja intenso a naranja suave)
        const intensity = energyRef.current;
        const orangeColor = new THREE.Color(1, 0.5 - intensity * 0.3, 0);
        materialRef.current.color.copy(orangeColor);
        
        // Emisión basada en la energía
        materialRef.current.emissiveIntensity = intensity * 0.5;
      } else {
        // Resetear a valores por defecto
        meshRef.current.scale.set(scale[0], scale[1], scale[2]);
        materialRef.current.color.setHex(0xff6b35); // Naranja por defecto
        materialRef.current.emissiveIntensity = 0;
      }
    });

    // Función para manejar el clic y disparar la nota percusiva
    const handleClick = (event: any) => {
      event.stopPropagation();
      selectObject(id);
      triggerObjectNote(id);
      
      // Activar la animación de golpe
      energyRef.current = 1;
    };



    // Asegurar que el material esté completamente inicializado
    useEffect(() => {
      if (materialRef.current) {
        try {
          materialRef.current.color.setHex(0xff6b35); // Naranja por defecto
          materialRef.current.emissive.setHex(0x000000);
          materialRef.current.emissiveIntensity = 0;
        } catch (error) {
          console.warn('Error al inicializar material del cono:', error);
        }
      }
    }, []);

    return (
      <group ref={ref} position={position} rotation={rotation}>
        {/* Cono principal */}
        <mesh ref={meshRef} scale={scale} onClick={handleClick}>
          <coneGeometry args={[0.7, 1.5, 32]} />
          <meshStandardMaterial
            ref={materialRef}
            color="#ff6b35"
            metalness={0.2}
            roughness={0.6}
            transparent
            opacity={0.9}
            emissive="#000000"
            emissiveIntensity={0}
            toneMapped={false}
          />
        </mesh>

        {/* Indicador de selección sin wireframe */}
        {isSelected && (
          <mesh>
            <coneGeometry args={[0.75, 1.6, 32]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.3}
            />
          </mesh>
        )}

        {/* Indicador de instrumento percusivo */}
        <mesh position={[0, 0.9, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial 
            color="#ff8c42" 
            emissive="#ff8c42"
            emissiveIntensity={0.3}
          />
        </mesh>
      </group>
    );
  }
);

SoundCone.displayName = 'SoundCone';
