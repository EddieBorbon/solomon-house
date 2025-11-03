'use client';

import { forwardRef, useRef, useEffect, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useWorldStore } from '../../state/useWorldStore';
import { type AudioParams } from '../../lib/AudioManager';
import { useAutoTrigger } from '../../hooks/useAutoTrigger';

interface SoundConeProps {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  isSelected: boolean;
  audioEnabled: boolean;
  audioParams: AudioParams;
}

interface SoundConeRef extends THREE.Group {
  handleTouch?: () => void;
}

export const SoundCone = forwardRef<SoundConeRef, SoundConeProps>(
  ({ id, position, rotation, scale, isSelected, audioEnabled, audioParams }, ref) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.MeshStandardMaterial>(null);
    const energyRef = useRef(0); // Para la animación de golpe percusivo
    
    const { triggerObjectNote, selectEntity, triggerObjectAttackRelease } = useWorldStore();

    // Auto-activación con callback para activar animaciones
    useAutoTrigger({ 
      objectId: id, 
      audioParams, 
      enabled: !audioEnabled,
      onTrigger: () => {
        // Activar animaciones cuando se dispara el auto-trigger
        energyRef.current = 1;
      }
    });

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
        
        // Cambiar el color basado en la energía (intensificar el color base)
        const intensity = energyRef.current;
        const baseColor = new THREE.Color(audioParams.color || '#ff6b35');
        const intensifiedColor = baseColor.clone().multiplyScalar(1 + intensity * 0.3);
        materialRef.current.color.copy(intensifiedColor);
        
        // Emisión basada en la energía
        materialRef.current.emissiveIntensity = intensity * 0.5;
      } else {
        // Resetear a valores por defecto
        meshRef.current.scale.set(scale[0], scale[1], scale[2]);
        const colorHex = parseInt((audioParams.color || '#ff6b35').replace('#', ''), 16);
        materialRef.current.color.setHex(colorHex); // Usar color del audioParams
        materialRef.current.emissiveIntensity = 0;
      }

      // Determinar si las animaciones deben estar activas
      const shouldAnimate = audioEnabled || energyRef.current > 0;

      // Solo ejecutar animaciones cuando corresponde
      if (shouldAnimate) {
        // Rotación automática
        if (audioParams.autoRotate) {
          const rotationSpeed = audioParams.rotationSpeed || 1.0;
          meshRef.current.rotation.y += (rotationSpeed * 0.01);
        }
        
        // Efecto de pulsación basado en pulseSpeed y pulseIntensity
        // Solo aplicar si no estamos en medio de un pulso de clic (para evitar conflictos)
        if (audioParams.pulseSpeed && audioParams.pulseSpeed > 0 && energyRef.current < 0.3) {
          const pulseSpeed = audioParams.pulseSpeed || 2.0;
          const pulseIntensity = audioParams.pulseIntensity || 0.3;
          const pulseScale = 1 + Math.sin(state.clock.elapsedTime * pulseSpeed) * pulseIntensity * 0.2;
          // Aplicar el pulso sobre la escala base, pero respetar el pulso del trigger si es fuerte
          if (energyRef.current < 0.5) {
            meshRef.current.scale.setScalar(pulseScale);
          }
        }
      } else {
        // Resetear escala cuando no hay audio ni triggers
        meshRef.current.scale.setScalar(1);
      }
    });

    // Función para manejar el clic y disparar la nota percusiva
    const handleClick = useCallback((event: React.MouseEvent) => {
      event.stopPropagation();
      selectEntity(id);
      triggerObjectNote(id);
      
      // Activar la animación de golpe
      energyRef.current = 1;
    }, [id, selectEntity, triggerObjectNote]);
    
    // Función para disparar sonido cuando el objeto móvil toca el cono
    const handleMobileObjectTouch = useCallback(() => {
      // Disparar sonido de ataque/release
      triggerObjectAttackRelease(id);
      
      // Activar la animación de golpe
      energyRef.current = 1;
    }, [id, triggerObjectAttackRelease]);



    // Asegurar que el material esté completamente inicializado
    useEffect(() => {
      if (materialRef.current) {
        try {
          const colorHex = parseInt((audioParams.color || '#ff6b35').replace('#', ''), 16);
          materialRef.current.color.setHex(colorHex); // Usar color del audioParams
          materialRef.current.emissive.setHex(0x000000);
          materialRef.current.emissiveIntensity = 0;
        } catch {
        }
      }
    }, [audioParams.color]);

    // Exponer la función de touch al objeto móvil usando useEffect
    useEffect(() => {
      if (ref && 'current' in ref && ref.current) {
        ref.current.handleTouch = handleMobileObjectTouch;
      }
    }, [ref, handleMobileObjectTouch]);

    return (
      <group ref={ref} position={position} rotation={rotation}>
        {/* Cono principal */}
        <mesh ref={meshRef} scale={scale} onClick={handleClick}>
          <coneGeometry args={[0.7, 1.5, 32]} />
          <meshStandardMaterial
            ref={materialRef}
            color={audioParams.color || "#000000"}
            metalness={audioParams.metalness || 0.3}
            roughness={audioParams.roughness || 0.35}
            transparent
            opacity={audioParams.opacity || 0.95}
            emissive={audioParams.emissiveColor || "#000000"}
            emissiveIntensity={audioParams.emissiveIntensity || 0}
            blending={audioParams.blendingMode === 'AdditiveBlending' ? THREE.AdditiveBlending : 
                     audioParams.blendingMode === 'SubtractiveBlending' ? THREE.SubtractiveBlending :
                     audioParams.blendingMode === 'MultiplyBlending' ? THREE.MultiplyBlending : 
                     THREE.NormalBlending}
            premultipliedAlpha={audioParams.blendingMode === 'SubtractiveBlending' || audioParams.blendingMode === 'MultiplyBlending'}
            envMapIntensity={1.0}
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

      </group>
    );
  }
);

SoundCone.displayName = 'SoundCone';
