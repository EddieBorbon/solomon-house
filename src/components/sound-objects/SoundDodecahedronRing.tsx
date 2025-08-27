'use client';

import React, { forwardRef, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Dodecahedron } from '@react-three/drei';
import * as THREE from 'three';
import { type AudioParams } from '../../lib/AudioManager';
import { useWorldStore } from '../../state/useWorldStore';

interface SoundDodecahedronRingProps {
  id: string;
  position: [number, number, number];
  isSelected: boolean;
  audioEnabled: boolean;
  audioParams: AudioParams;
}

export const SoundDodecahedronRing = forwardRef<THREE.Group, SoundDodecahedronRingProps>(
  ({ id, position, isSelected, audioEnabled, audioParams }, ref) => {
    const groupRef = useRef<THREE.Group>(null);
    const materialRefs = useRef<THREE.MeshStandardMaterial[]>([]);
    const energyRef = useRef(0); // Para la animación de clic
    const { selectEntity, triggerObjectNote } = useWorldStore();
    
    // Obtener la polifonía del objeto (número de dodecaedros)
    const polyphony = audioParams?.polyphony || 4;
    
    // Crear geometría de dodecaedro con más detalle
    const dodecahedronGeometry = useMemo(() => {
      return new THREE.DodecahedronGeometry(0.3, 0);
    }, []);

    // Función para manejar clic y disparar nota
    const handleClick = (event: any) => {
      event.stopPropagation();
      selectEntity(id);
      triggerObjectNote(id);
      
      // Activar la animación de clic
      energyRef.current = 1;
    };

    // Animación del clic y efectos de audio
    useFrame((state, delta) => {
      if (!groupRef.current || !audioParams) return;

      // Decaer la energía del clic
      if (energyRef.current > 0) {
        // Calcular la velocidad de decaimiento basada en la duración del sonido
        const duration = audioParams?.duration;
        let decayRate = 0.9; // Decaimiento por defecto
        
        if (duration && duration !== Infinity) {
          // Ajustar la velocidad de decaimiento para que coincida con la duración del sonido
          decayRate = Math.pow(0.1, delta / duration);
        }
        
        energyRef.current *= decayRate;
        
        // Aplicar la energía como escala pulsante al grupo completo
        const pulseScale = 1 + energyRef.current * 0.2;
        groupRef.current.scale.setScalar(pulseScale);
        
        // Cambiar el color de todos los dodecaedros basado en la energía
        const intensity = energyRef.current;
        const pinkColor = new THREE.Color(0.9 + intensity * 0.1, 0.3 + intensity * 0.2, 0.7 + intensity * 0.3);
        
        materialRefs.current.forEach(material => {
          if (material) {
            material.color.copy(pinkColor);
            material.emissiveIntensity = intensity * 0.8;
          }
        });
      } else {
        // Resetear a valores por defecto
        groupRef.current.scale.setScalar(1);
        
        // Efectos de audio cuando no hay clic
        if (audioEnabled) {
          const time = state.clock.elapsedTime;
          
          // Rotación lenta del anillo completo
          groupRef.current.rotation.y = time * 0.3;
          
          // Efectos individuales en cada dodecaedro
          materialRefs.current.forEach((material, index) => {
            if (material) {
              // Efecto de pulso basado en modulationIndex
              const pulseIntensity = (audioParams?.modulationIndex || 2) / 10;
              const pulseScale = 1 + Math.sin(time * 2 + index * 0.5) * pulseIntensity * 0.1;
              
              // Efecto de brillo basado en harmonicity
              const harmonicityEffect = (audioParams?.harmonicity || 1) / 5;
              material.emissiveIntensity = 0.2 + harmonicityEffect * 0.3;
              
              // Cambio sutil de color basado en modulationIndex
              const modulationEffect = (audioParams?.modulationIndex || 2) / 10;
              material.emissive.setHSL(
                0.8 + modulationEffect * 0.1, // Tono rosa-magenta
                0.6,
                0.2 + modulationEffect * 0.3
              );
            }
          });
        } else {
          // Resetear emisión cuando no hay audio
          materialRefs.current.forEach(material => {
            if (material) {
              material.emissiveIntensity = 0;
            }
          });
        }
      }
    });

    // Crear array de dodecaedros distribuidos en círculo
    const dodecahedrons = useMemo(() => {
      const radius = 1.2; // Radio del anillo
      const angleStep = (2 * Math.PI) / polyphony;
      
      return Array.from({ length: polyphony }, (_, index) => {
        const angle = index * angleStep;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        return (
          <mesh
            key={index}
            position={[x, 0, z]}
            geometry={dodecahedronGeometry}
            onClick={handleClick}
          >
            <meshStandardMaterial
              ref={(el) => {
                if (el) materialRefs.current[index] = el;
              }}
              color="#ec4899" // Color rosa base
              metalness={0.3}
              roughness={0.1}
              transparent
              opacity={0.9}
              emissive="#be185d"
              emissiveIntensity={audioEnabled ? 0.2 : 0}
              envMapIntensity={1.5}
            />
          </mesh>
        );
      });
    }, [polyphony, dodecahedronGeometry, audioEnabled, handleClick]);

    return (
      <group ref={ref} position={position}>
        {/* Grupo principal que contiene el anillo de dodecaedros */}
        <group ref={groupRef}>
          {dodecahedrons}
        </group>

        {/* Indicador de selección */}
        {isSelected && (
          <group>
            {/* Anillo exterior de selección */}
            <mesh>
              <ringGeometry args={[1.4, 1.6, 32]} />
              <meshBasicMaterial
                color="#fbbf24"
                transparent
                opacity={0.4}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        )}

        {/* Indicador de audio activo */}
        {audioEnabled && (
          <group>
            {/* Anillo interior de audio activo */}
            <mesh>
              <ringGeometry args={[1.0, 1.2, 32]} />
              <meshBasicMaterial
                color="#10b981"
                transparent
                opacity={0.5}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        )}
      </group>
    );
  }
);

SoundDodecahedronRing.displayName = 'SoundDodecahedronRing';
