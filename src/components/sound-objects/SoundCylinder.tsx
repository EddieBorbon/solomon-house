'use client';

import React, { forwardRef, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useWorldStore } from '../../state/useWorldStore';
import { type AudioParams } from '../../lib/AudioManager';
import { useAutoTrigger } from '../../hooks/useAutoTrigger';

interface SoundCylinderProps {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  isSelected: boolean;
  audioEnabled: boolean;
  audioParams: AudioParams;
}

export const SoundCylinder = forwardRef<THREE.Group, SoundCylinderProps>(
  ({ id, position, rotation, scale, isSelected, audioEnabled, audioParams }, ref) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.MeshStandardMaterial>(null);
    const energyRef = useRef(0); // Para la animación de clic
    const { selectEntity, triggerObjectNote } = useWorldStore();

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
    
    // Crear geometría de cilindro con más detalle

    // Función para manejar clic y disparar nota
    const handleClick = (event: React.MouseEvent) => {
      event.stopPropagation();
      selectEntity(id);
      triggerObjectNote(id);
      
      // Activar la animación de clic
      energyRef.current = 1;
    };
    
    // Animación del vibrato visual
    const timeRef = useRef(0);
    const lastMaterialUpdateRef = useRef(0);
    const lastColorRef = useRef<number>(0x22c55e);
    const lastEmissiveIntensityRef = useRef<number>(0);

    useFrame((state, delta) => {
      if (!meshRef.current || !materialRef.current || !audioParams) return;

      timeRef.current += delta;
      
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
        
        // Aplicar la energía como escala pulsante
        const pulseScale = 1 + energyRef.current * 0.2;
        meshRef.current.scale.set(pulseScale, pulseScale, pulseScale);
        
        // Cambiar el color basado en la energía (intensificar el color base)
        const intensity = energyRef.current;
        const baseColor = new THREE.Color(audioParams.color || '#22c55e');
        const intensifiedColor = baseColor.clone().multiplyScalar(1 + intensity * 0.3);
        materialRef.current.color.copy(intensifiedColor);
        
        // Emisión intensa durante el clic
        materialRef.current.emissiveIntensity = intensity * 0.6;
      } else {
        // Resetear a valores por defecto
        meshRef.current.scale.set(scale[0], scale[1], scale[2]);
        
        // Simular el vibrato del DuoSynth con animación visual
        if (audioEnabled) {
          const vibratoAmount = audioParams?.vibratoAmount || 0.2;
          const vibratoRate = audioParams?.vibratoRate || 5;
          
          // Crear un efecto de vibrato visual en la altura del cilindro
          const vibratoEffect = Math.sin(timeRef.current * vibratoRate * Math.PI * 2) * vibratoAmount * 0.3;
          const newScaleY = scale[1] * (1 + vibratoEffect);
          
          meshRef.current.scale.setY(newScaleY);
          
          // Cambiar el color del material basado en la frecuencia de forma más segura
          // Solo actualizar el material cada 100ms para evitar problemas de rendimiento
          if (timeRef.current - lastMaterialUpdateRef.current > 0.1) {
            try {
              const frequencyRatio = audioParams?.frequency / 2000;
              const volumeRatio = audioParams?.volume;
              
              // Mapear frecuencia a color (verde a azul)
              const greenComponent = Math.floor(34 * (1 - frequencyRatio));
              const blueComponent = Math.floor(85 + (170 * frequencyRatio));
              const color = (greenComponent << 16) | (blueComponent << 8);
              
              // Solo actualizar si el color realmente cambió
              if (color !== lastColorRef.current && materialRef.current.color && materialRef.current.color.setHex) {
                materialRef.current.color.setHex(color);
                lastColorRef.current = color;
              }
              
              // Solo actualizar si la emisión realmente cambió
              const emissiveIntensity = volumeRatio * 0.3;
              if (Math.abs(emissiveIntensity - lastEmissiveIntensityRef.current) > 0.01 && 
                  materialRef.current.emissive && materialRef.current.emissiveIntensity !== undefined) {
                materialRef.current.emissiveIntensity = emissiveIntensity;
                lastEmissiveIntensityRef.current = emissiveIntensity;
              }
              
              lastMaterialUpdateRef.current = timeRef.current;
    } catch {
    }
          }
        } else {
          // Resetear a valores por defecto cuando no hay audio
          meshRef.current.scale.setY(scale[1]);
          
          try {
            if (materialRef.current.color && materialRef.current.color.setHex) {
              const colorHex = parseInt((audioParams.color || '#22c55e').replace('#', ''), 16);
              materialRef.current.color.setHex(colorHex); // Usar color del audioParams
            }
            
            if (materialRef.current.emissiveIntensity !== undefined) {
              materialRef.current.emissiveIntensity = 0;
            }
    } catch {
    }
        }
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
          const pulseScale = 1 + Math.sin(timeRef.current * pulseSpeed) * pulseIntensity * 0.2;
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



    // Asegurar que el material esté completamente inicializado
    useEffect(() => {
      if (materialRef.current) {
        try {
          // Establecer valores iniciales seguros
          if (materialRef.current.color && materialRef.current.color.setHex) {
            const colorHex = parseInt((audioParams.color || '#22c55e').replace('#', ''), 16);
            materialRef.current.color.setHex(colorHex);
          }
          if (materialRef.current.emissive && materialRef.current.emissive.setHex) {
            materialRef.current.emissive.setHex(0x000000);
          }
          if (materialRef.current.emissiveIntensity !== undefined) {
            materialRef.current.emissiveIntensity = 0;
          }
        } catch {
        }
      }
    }, [audioParams.color]);

    return (
      <group ref={ref} position={position} rotation={rotation}>
        {/* Cilindro principal */}
        <mesh ref={meshRef} scale={scale} onClick={handleClick}>
          <cylinderGeometry args={[0.5, 0.5, 2, 32]} />
          <meshStandardMaterial
            ref={materialRef}
            color={audioParams.color || "#000000"}
            metalness={audioParams.metalness || 0.4}
            roughness={audioParams.roughness || 0.25}
            transparent
            opacity={audioParams.opacity || 0.95}
            emissive={audioParams.emissiveColor || "#000000"}
            emissiveIntensity={audioParams.emissiveIntensity || 0}
            blending={audioParams.blendingMode === 'AdditiveBlending' ? THREE.AdditiveBlending : 
                     audioParams.blendingMode === 'SubtractiveBlending' ? THREE.SubtractiveBlending :
                     audioParams.blendingMode === 'MultiplyBlending' ? THREE.MultiplyBlending : 
                     THREE.NormalBlending}
            premultipliedAlpha={audioParams.blendingMode === 'SubtractiveBlending' || audioParams.blendingMode === 'MultiplyBlending'}
            envMapIntensity={1.1}
          />
        </mesh>

        {/* Indicador de selección sin wireframe */}
        {isSelected && (
          <mesh>
            <cylinderGeometry args={[0.55, 0.55, 2.1, 32]} />
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

SoundCylinder.displayName = 'SoundCylinder';
