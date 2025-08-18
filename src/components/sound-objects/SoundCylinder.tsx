'use client';

import React, { forwardRef, useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { type AudioParams } from '../../lib/AudioManager';
import { useWorldStore } from '../../state/useWorldStore';

interface SoundCylinderProps {
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
    waveform2?: OscillatorType;
    harmonicity?: number;
    vibratoAmount?: number;
    vibratoRate?: number;
    duration?: number;
  };
}

export const SoundCylinder = forwardRef<THREE.Group, SoundCylinderProps>(
  ({ id, position, rotation, scale, isSelected, audioEnabled, audioParams }, ref) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.MeshStandardMaterial>(null);
    const energyRef = useRef(0); // Para la animación de clic
    const { selectObject, triggerObjectNote } = useWorldStore();
    
    // Crear geometría de cilindro con más detalle
    const cylinderGeometry = useMemo(() => {
      return new THREE.CylinderGeometry(0.5, 0.5, 1.5, 32);
    }, []);

    // Función para manejar clic y disparar nota
    const handleClick = (event: any) => {
      event.stopPropagation();
      selectObject(id);
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
        
        // Cambiar el color basado en la energía (verde intenso a verde suave)
        const intensity = energyRef.current;
        const greenColor = new THREE.Color(0.1 + intensity * 0.2, 0.7 + intensity * 0.3, 0.3 + intensity * 0.2);
        materialRef.current.color.copy(greenColor);
        
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
            } catch (error) {
              console.warn('Error al actualizar material del cilindro:', error);
            }
          }
        } else {
          // Resetear a valores por defecto cuando no hay audio
          meshRef.current.scale.setY(scale[1]);
          
          try {
            if (materialRef.current.color && materialRef.current.color.setHex) {
              materialRef.current.color.setHex(0x22c55e); // Verde por defecto
            }
            
            if (materialRef.current.emissiveIntensity !== undefined) {
              materialRef.current.emissiveIntensity = 0;
            }
          } catch (error) {
            console.warn('Error al resetear material del cilindro:', error);
          }
        }
      }
    });



    // Asegurar que el material esté completamente inicializado
    useEffect(() => {
      if (materialRef.current) {
        try {
          // Establecer valores iniciales seguros
          if (materialRef.current.color && materialRef.current.color.setHex) {
            materialRef.current.color.setHex(0x22c55e);
          }
          if (materialRef.current.emissive && materialRef.current.emissive.setHex) {
            materialRef.current.emissive.setHex(0x000000);
          }
          if (materialRef.current.emissiveIntensity !== undefined) {
            materialRef.current.emissiveIntensity = 0;
          }
        } catch (error) {
          console.warn('Error al inicializar material del cilindro:', error);
        }
      }
    }, []);

    return (
      <group ref={ref} position={position} rotation={rotation}>
        {/* Cilindro principal */}
        <mesh ref={meshRef} scale={scale} onClick={handleClick}>
          <cylinderGeometry args={[0.5, 0.5, 2, 32]} />
          <meshStandardMaterial
            ref={materialRef}
            color="#22c55e"
            metalness={0.3}
            roughness={0.4}
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
            <cylinderGeometry args={[0.55, 0.55, 2.1, 32]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.3}
            />
          </mesh>
        )}

        {/* Indicador de audio activo */}
        {audioEnabled && (
          <mesh position={[0, 1.2, 0]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial 
              color="#10b981" 
              emissive="#10b981"
              emissiveIntensity={0.5}
            />
          </mesh>
        )}
      </group>
    );
  }
);

SoundCylinder.displayName = 'SoundCylinder';
