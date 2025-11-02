'use client';

import { forwardRef, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useWorldStore } from '../../state/useWorldStore';
import * as THREE from 'three';
import { type AudioParams } from '../../lib/AudioManager';

interface SoundPyramidProps {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  isSelected: boolean;
  audioEnabled: boolean;
  audioParams?: AudioParams;
  duration?: number;
}

export const SoundPyramid = forwardRef<THREE.Group, SoundPyramidProps>(
  ({ id, position, rotation, scale, isSelected, audioEnabled, audioParams, duration }, ref) => {
    const { selectEntity, toggleObjectAudio } = useWorldStore();
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

      // Solo ejecutar animaciones cuando el audio está activo o hay sonido reproduciéndose
      if ((audioEnabled || isSoundPlaying) && audioParams) {
        // Rotación automática
        if (audioParams.autoRotate) {
          const rotationSpeed = audioParams.rotationSpeed || 1.0;
          if (meshRef.current) {
            meshRef.current.rotation.y += (rotationSpeed * 0.01);
          }
        }
        
        // Efecto de pulsación basado en pulseSpeed y pulseIntensity
        if (audioParams.pulseSpeed && audioParams.pulseSpeed > 0) {
          const pulseSpeed = audioParams.pulseSpeed || 2.0;
          const pulseIntensity = audioParams.pulseIntensity || 0.3;
          const pulseScale = 1 + Math.sin(state.clock.elapsedTime * pulseSpeed) * pulseIntensity * 0.2;
          if (meshRef.current) {
            meshRef.current.scale.setScalar(pulseScale);
          }
        }
      } else {
        // Resetear escala cuando no hay audio
        if (meshRef.current) {
          meshRef.current.scale.setScalar(1);
        }
      }
    });

         // Manejador para cuando se presiona el clic
     const handlePointerDown = (event: React.PointerEvent) => {
       event.stopPropagation();
       
       if (isGateMode) {
         // Modo gate: activar sonido mientras se mantiene presionado
         setIsSoundPlaying(true);
         // En modo gate, solo activar el sonido (no toggle)
         if (!audioEnabled) {
           toggleObjectAudio(id);
         }
       } else {
         // Modo continuo: alternar estado del audio
         const newState = !audioEnabled;
         setIsSoundPlaying(newState);
         toggleObjectAudio(id);
       }
     };

         // Manejador para cuando se suelta el clic
     const handlePointerUp = (event: React.PointerEvent) => {
       event.stopPropagation();
       
       if (isGateMode) {
         // Modo gate: desactivar sonido al soltar
         setIsSoundPlaying(false);
         // En modo gate, desactivar el sonido
         if (audioEnabled) {
           toggleObjectAudio(id);
         }
       }
       // En modo continuo, no hacer nada al soltar
     };

         // Manejador para cuando el cursor sale del objeto
     const handlePointerLeave = (event: React.PointerEvent) => {
       event.stopPropagation();
       
       if (isGateMode) {
         // Modo gate: desactivar sonido al salir
         setIsSoundPlaying(false);
         // En modo gate, desactivar el sonido
         if (audioEnabled) {
           toggleObjectAudio(id);
         }
       }
       // En modo continuo, no hacer nada al salir
     };

    // Manejador para la selección (solo selección, no audio)
    const handleClick = (event: React.MouseEvent) => {
      event.stopPropagation();
      selectEntity(id);
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
            color={audioParams?.color || "#000000"}
            metalness={audioParams?.metalness || 0.4}
            roughness={audioParams?.roughness || 0.3}
            transparent
            opacity={audioParams?.opacity || 0.9}
            emissive={audioParams?.emissiveColor || "#000000"}
            emissiveIntensity={audioParams?.emissiveIntensity || (isSelected ? 0.3 : 0)}
            blending={audioParams?.blendingMode === 'AdditiveBlending' ? THREE.AdditiveBlending : 
                     audioParams?.blendingMode === 'SubtractiveBlending' ? THREE.SubtractiveBlending :
                     audioParams?.blendingMode === 'MultiplyBlending' ? THREE.MultiplyBlending : 
                     THREE.NormalBlending}
            premultipliedAlpha={audioParams?.blendingMode === 'SubtractiveBlending' || audioParams?.blendingMode === 'MultiplyBlending'}
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

      </group>
    );
  }
);

SoundPyramid.displayName = 'SoundPyramid';
