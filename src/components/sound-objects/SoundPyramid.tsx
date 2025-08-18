'use client';

import { forwardRef, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useWorldStore } from '../../state/useWorldStore';
import * as THREE from 'three';

interface SoundPyramidProps {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  isSelected: boolean;
  audioEnabled: boolean;
  duration?: number;
}

export const SoundPyramid = forwardRef<THREE.Group, SoundPyramidProps>(
  ({ id, position, rotation, scale, isSelected, audioEnabled, duration }, ref) => {
    const { selectObject, toggleObjectAudio } = useWorldStore();
    const meshRef = useRef<THREE.Mesh>(null);
    const wireframeRef = useRef<THREE.Mesh>(null);
    const timeRef = useRef(0);
    
    // Estado local para controlar la animación basada en la interacción del usuario
    const [isSoundPlaying, setIsSoundPlaying] = useState(false);
    
    // Determinar si es modo gate (duración finita) o continuo (duración infinita)
    const isGateMode = duration !== Infinity;

    // Animación de la envolvente del filtro
    useFrame((state, delta) => {
      timeRef.current += delta;
      
             if (meshRef.current && wireframeRef.current) {
         // Animación de la envolvente del filtro cuando el sonido está activo
        if (isSoundPlaying) {
          // Simular la acción de la filterEnvelope con expansión/contracción
          const envelopeValue = Math.sin(timeRef.current * 8) * 0.1 + 1;
          wireframeRef.current.scale.setScalar(envelopeValue);
          
          // Cambiar el color basado en la actividad
          const intensity = Math.abs(Math.sin(timeRef.current * 8));
          const material = wireframeRef.current.material as THREE.MeshBasicMaterial;
          material.color.setRGB(1, 0.5 + intensity * 0.5, 0.2 + intensity * 0.3);
        } else {
          // Resetear cuando no hay audio
          wireframeRef.current.scale.setScalar(1);
          const material = wireframeRef.current.material as THREE.MeshBasicMaterial;
          material.color.setRGB(1, 0.5, 0.2);
        }
      }
    });

         // Manejador para cuando se presiona el clic
     const handlePointerDown = (event: any) => {
       event.stopPropagation();
       
       if (isGateMode) {
         // Modo gate: activar sonido mientras se mantiene presionado
         console.log(`🔺 PointerDown en pirámide ${id} - Modo gate: Activando sonido`);
         setIsSoundPlaying(true);
         // En modo gate, solo activar el sonido (no toggle)
         if (!audioEnabled) {
           toggleObjectAudio(id);
         }
       } else {
         // Modo continuo: alternar estado del audio
         console.log(`🔺 PointerDown en pirámide ${id} - Modo continuo: Alternando audio`);
         const newState = !audioEnabled;
         setIsSoundPlaying(newState);
         toggleObjectAudio(id);
       }
     };

         // Manejador para cuando se suelta el clic
     const handlePointerUp = (event: any) => {
       event.stopPropagation();
       
       if (isGateMode) {
         // Modo gate: desactivar sonido al soltar
         console.log(`🔺 PointerUp en pirámide ${id} - Modo gate: Desactivando sonido`);
         setIsSoundPlaying(false);
         // En modo gate, desactivar el sonido
         if (audioEnabled) {
           toggleObjectAudio(id);
         }
       }
       // En modo continuo, no hacer nada al soltar
     };

         // Manejador para cuando el cursor sale del objeto
     const handlePointerLeave = (event: any) => {
       event.stopPropagation();
       
       if (isGateMode) {
         // Modo gate: desactivar sonido al salir
         console.log(`🔺 PointerLeave en pirámide ${id} - Modo gate: Desactivando sonido`);
         setIsSoundPlaying(false);
         // En modo gate, desactivar el sonido
         if (audioEnabled) {
           toggleObjectAudio(id);
         }
       }
       // En modo continuo, no hacer nada al salir
     };

    // Manejador para la selección (solo selección, no audio)
    const handleClick = (event: any) => {
      event.stopPropagation();
      selectObject(id);
    };

    return (
      <group
        ref={ref}
        position={position}
        rotation={rotation}
        scale={scale}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
      >
        {/* Pirámide principal */}
        <mesh ref={meshRef}>
          <coneGeometry args={[0.8, 1.5, 4]} />
          <meshStandardMaterial
            color={isSelected ? '#ef4444' : '#dc2626'}
            metalness={0.4}
            roughness={0.3}
            emissive={isSelected ? '#7f1d1d' : '#000000'}
            emissiveIntensity={isSelected ? 0.3 : 0}
            envMapIntensity={1.2}
          />
        </mesh>

        {/* Wireframe de envolvente del filtro */}
        <mesh ref={wireframeRef}>
          <coneGeometry args={[0.85, 1.6, 4]} />
          <meshBasicMaterial
            color="#ff8c42"
            wireframe={true}
            transparent={true}
            opacity={isSoundPlaying ? 0.8 : 0.3}
          />
        </mesh>

        {/* Indicador de selección */}
        {isSelected && (
          <mesh position={[0, 2, 0]}>
            <sphereGeometry args={[0.1, 8, 6]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
        )}

        {/* Indicador de sonido activo (basado en isSoundPlaying, no en audioEnabled) */}
        {isSoundPlaying && (
          <mesh position={[0, -1.5, 0]}>
            <ringGeometry args={[0.3, 0.4, 8]} />
            <meshBasicMaterial color="#22c55e" />
          </mesh>
        )}
      </group>
    );
  }
);

SoundPyramid.displayName = 'SoundPyramid';
