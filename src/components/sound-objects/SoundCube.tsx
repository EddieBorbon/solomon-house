'use client';

import React, { forwardRef, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Group, MeshStandardMaterial, Color, AdditiveBlending, SubtractiveBlending, MultiplyBlending, NormalBlending } from 'three';
import { useWorldStore } from '../../state/useWorldStore';
import { type AudioParams } from '../../lib/AudioManager';
import { useAutoTrigger } from '../../hooks/useAutoTrigger';
import { useSoundObjectMovement } from '../../hooks/useSoundObjectMovement';

interface SoundCubeProps {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  isSelected: boolean;
  audioEnabled: boolean;
  audioParams: AudioParams;
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
    selectEntity, 
    triggerObjectAttackRelease, 
    startObjectGate, 
    stopObjectGate 
  } = useWorldStore();

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

  // Movimiento automático del objeto
  useSoundObjectMovement({
    groupRef: ref as React.RefObject<Group>,
    audioParams,
    initialPosition: position,
    enabled: true
  });

  // Manejador para clic corto (trigger)
  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    selectEntity(id);
    triggerObjectAttackRelease(id);
    
    // Activar la animación de clic
    energyRef.current = 1;
  };

  // Manejador para clic sostenido (gate)
  const handlePointerDown = (event: React.PointerEvent) => {
    event.stopPropagation();
    startObjectGate(id);
    
    // Activar la animación de gate
    energyRef.current = 1;
  };

  // Manejador para liberar clic sostenido
  const handlePointerUp = (event: React.PointerEvent) => {
    event.stopPropagation();
    stopObjectGate(id);
  };

  // Manejador para cuando el puntero sale del objeto
  const handlePointerLeave = (event: React.PointerEvent) => {
    event.stopPropagation();
    stopObjectGate(id);
  };

  // Animación del cubo cuando se hace clic o está sonando
  useFrame((state, delta) => {
    if (!meshRef.current || !materialRef.current || !audioParams) return;

    const time = state.clock.elapsedTime;

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
      
      // Cambiar el color basado en la energía (intensificar el color base)
      const intensity = energyRef.current;
      const baseColor = new Color(audioParams.color || '#000000');
      const intensifiedColor = baseColor.clone().multiplyScalar(1 + intensity * 0.2);
      materialRef.current.color.copy(intensifiedColor);
      
      // Emisión basada en la energía
      materialRef.current.emissiveIntensity = intensity * 0.3;
    } else {
      // Resetear a valores por defecto
      meshRef.current.scale.set(scale[0], scale[1], scale[2]);
      materialRef.current.color.setHex(parseInt(audioParams.color?.replace('#', '') || '000000', 16));
      materialRef.current.emissiveIntensity = 0;
    }

    // Determinar si las animaciones deben estar activas
    // Las animaciones se activan cuando:
    // 1. El audio continuo está activo (audioEnabled)
    // 2. Hay energía de clic/gate/trigger activa (energyRef > 0)
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
        const pulseScale = 1 + Math.sin(time * pulseSpeed) * pulseIntensity * 0.2;
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

  return (
    <group ref={ref} position={position} rotation={rotation} scale={scale}>
      {/* Cubo principal */}
      <mesh
        ref={meshRef}
        castShadow={true}
        receiveShadow={true}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          ref={materialRef}
          color={audioParams.color || "#000000"}
          transparent
          opacity={audioParams.opacity || 0.9}
          roughness={audioParams.roughness || 0.2}
          metalness={audioParams.metalness || 0.3}
          emissive={audioParams.emissiveColor || "#000000"}
          emissiveIntensity={audioParams.emissiveIntensity || 0}
          blending={audioParams.blendingMode === 'AdditiveBlending' ? AdditiveBlending : 
                   audioParams.blendingMode === 'SubtractiveBlending' ? SubtractiveBlending :
                   audioParams.blendingMode === 'MultiplyBlending' ? MultiplyBlending : 
                   NormalBlending}
          premultipliedAlpha={audioParams.blendingMode === 'SubtractiveBlending' || audioParams.blendingMode === 'MultiplyBlending'}
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

      {/* Switch de audio - ELIMINADO */}
    </group>
  );
});

SoundCube.displayName = 'SoundCube';
