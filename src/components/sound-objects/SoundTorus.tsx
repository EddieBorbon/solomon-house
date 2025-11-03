'use client';

import React, { forwardRef, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useWorldStore } from '../../state/useWorldStore';
import { type AudioParams } from '../../lib/AudioManager';
import * as THREE from 'three';
import { useAutoTrigger } from '../../hooks/useAutoTrigger';

interface SoundTorusProps {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  isSelected: boolean;
  audioEnabled: boolean;
  audioParams: AudioParams;
}

export const SoundTorus = forwardRef<THREE.Group, SoundTorusProps>(
  ({ id, position, rotation, scale, isSelected, audioEnabled, audioParams }, ref) => {
    const { selectEntity, triggerObjectNote } = useWorldStore();

    // Auto-activación
    useAutoTrigger({ objectId: id, audioParams, enabled: !audioEnabled });
    
    // Referencias para la animación
    const meshRef = useRef<THREE.Mesh>(null);
    const energyRef = useRef(0);
    const lastTriggerTimeRef = useRef(0);
    
    // Material con efecto de selección
    const material = useMemo(() => {
      const blendingMode = audioParams.blendingMode === 'AdditiveBlending' ? THREE.AdditiveBlending : 
                          audioParams.blendingMode === 'SubtractiveBlending' ? THREE.SubtractiveBlending :
                          audioParams.blendingMode === 'MultiplyBlending' ? THREE.MultiplyBlending : 
                          THREE.NormalBlending;
      
      return new THREE.MeshStandardMaterial({
        color: audioParams.color || '#000000',
        metalness: audioParams.metalness || 0.3,
        roughness: audioParams.roughness || 0.4,
        transparent: true,
        opacity: audioParams.opacity || 0.9,
        emissive: audioParams.emissiveColor || '#000000',
        emissiveIntensity: audioParams.emissiveIntensity || (isSelected ? 0.3 : 0),
        blending: blendingMode,
        premultipliedAlpha: blendingMode === THREE.SubtractiveBlending || blendingMode === THREE.MultiplyBlending,
      });
    }, [isSelected, audioParams.color, audioParams.metalness, audioParams.roughness, audioParams.opacity, audioParams.blendingMode, audioParams.emissiveColor, audioParams.emissiveIntensity]);

    // Función para manejar el clic
    const handleClick = (event: React.MouseEvent) => {
      event.stopPropagation();
      selectEntity(id);
      triggerObjectNote(id);
      
      // Activar la animación de vibración
      energyRef.current = 1.0;
      lastTriggerTimeRef.current = Date.now();
    };

    // Animación de vibración y efectos visuales
    useFrame((state) => {
      if (meshRef.current) {
        const time = state.clock.elapsedTime;
        
        // Animación de pulsación cuando hay energía
        if (energyRef.current > 0) {
          // Decrementar la energía con el tiempo
          energyRef.current *= 0.95;
          
          // Solo cambiar el color/emisión sin deformar la geometría
          if (meshRef.current.material) {
            const mat = meshRef.current.material as THREE.MeshStandardMaterial;
            const intensity = energyRef.current * 0.5;
            mat.emissiveIntensity = intensity;
          }
          
          // Detener la animación cuando la energía sea muy baja
          if (energyRef.current < 0.01) {
            energyRef.current = 0;
            // Restaurar el estado original del material
            if (meshRef.current.material) {
              const mat = meshRef.current.material as THREE.MeshStandardMaterial;
              mat.emissiveIntensity = 0;
            }
          }
        }
        
        // Solo ejecutar animaciones cuando el audio está activo o hay energía de clic
        if (audioEnabled || energyRef.current > 0) {
          // Rotación automática
          if (audioParams.autoRotate) {
            const rotationSpeed = audioParams.rotationSpeed || 1.0;
            meshRef.current.rotation.y += (rotationSpeed * 0.01);
          }
          
          // Efecto de pulsación basado en pulseSpeed y pulseIntensity
          if (audioParams.pulseSpeed && audioParams.pulseSpeed > 0) {
            const pulseSpeed = audioParams.pulseSpeed || 2.0;
            const pulseIntensity = audioParams.pulseIntensity || 0.3;
            const pulseScale = 1 + Math.sin(time * pulseSpeed) * pulseIntensity * 0.2;
            meshRef.current.scale.setScalar(pulseScale);
          }
        } else {
          // Resetear escala cuando no hay audio
          meshRef.current.scale.setScalar(1);
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
        <mesh 
          ref={meshRef} 
          material={material}
        >
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
