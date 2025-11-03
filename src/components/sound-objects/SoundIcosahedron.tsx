'use client';

import React, { forwardRef, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useWorldStore } from '../../state/useWorldStore';
import { type AudioParams } from '../../lib/AudioManager';
import { useAutoTrigger } from '../../hooks/useAutoTrigger';

interface SoundIcosahedronProps {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  isSelected: boolean;
  audioEnabled: boolean;
  audioParams: AudioParams;
}

export const SoundIcosahedron = forwardRef<THREE.Group, SoundIcosahedronProps>(
  ({ id, position, rotation, scale, isSelected, audioEnabled, audioParams }, ref) => {
    const { selectEntity, triggerObjectNote } = useWorldStore();

    // Auto-activación
    useAutoTrigger({ objectId: id, audioParams, enabled: !audioEnabled });
    
    // Referencias para la animación
    const meshRef = useRef<THREE.Mesh>(null);
    const animationRef = useRef<{ energy: number; lastHit: number }>({
      energy: 0,
      lastHit: 0,
    });

    // Escala de selección
    const selectionScale = isSelected ? 1.2 : 1.0;

    // Animación de vibración cuando se toca
    const handleClick = (event: React.MouseEvent) => {
      event.stopPropagation();
      selectEntity(id);
      triggerObjectNote(id);
      
      // Activar la animación de vibración
      animationRef.current.energy = 1.0;
      animationRef.current.lastHit = Date.now();
    };

    // Animación en cada frame
    useFrame((state) => {
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

      // Solo ejecutar animaciones cuando el audio está activo o hay energía de clic
      if (audioEnabled || animationRef.current.energy > 0) {
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

    return (
      <group ref={ref} position={position} rotation={rotation}>

        
        {/* Icosaedro principal */}
        <mesh
          ref={meshRef}
          scale={[scale[0] * selectionScale, scale[1] * selectionScale, scale[2] * selectionScale]}
          onClick={handleClick}
          onPointerOver={() => {
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'default';
          }}
        >
          <icosahedronGeometry args={[0.8, 0]} />
          <meshStandardMaterial
            color={audioParams.color || "#000000"}
            metalness={audioParams.metalness || 0.9}
            roughness={audioParams.roughness || 0.05}
            transparent
            opacity={audioParams.opacity || 0.95}
            emissive={audioParams.emissiveColor || "#000000"}
            emissiveIntensity={audioParams.emissiveIntensity || (isSelected ? 0.3 : 0.1)}
            blending={audioParams.blendingMode === 'AdditiveBlending' ? THREE.AdditiveBlending : 
                     audioParams.blendingMode === 'SubtractiveBlending' ? THREE.SubtractiveBlending :
                     audioParams.blendingMode === 'MultiplyBlending' ? THREE.MultiplyBlending : 
                     THREE.NormalBlending}
            premultipliedAlpha={audioParams.blendingMode === 'SubtractiveBlending' || audioParams.blendingMode === 'MultiplyBlending'}
            envMapIntensity={1.5}
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
