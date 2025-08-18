'use client';

import { forwardRef, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

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
  };
}

export const SoundCylinder = forwardRef<THREE.Group, SoundCylinderProps>(
  ({ id, position, rotation, scale, isSelected, audioEnabled, audioParams }, ref) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const wireframeRef = useRef<THREE.LineSegments>(null);
    const materialRef = useRef<THREE.MeshStandardMaterial>(null);
    
    // Animación del vibrato visual
    const timeRef = useRef(0);
    const lastMaterialUpdateRef = useRef(0);
    const lastColorRef = useRef<number>(0x22c55e);
    const lastEmissiveIntensityRef = useRef<number>(0);

    useFrame((state, delta) => {
      if (!meshRef.current || !materialRef.current) return;

      timeRef.current += delta;
      
      // Simular el vibrato del DuoSynth con animación visual
      if (audioEnabled) {
        const vibratoAmount = audioParams.vibratoAmount || 0.2;
        const vibratoRate = audioParams.vibratoRate || 5;
        
        // Crear un efecto de vibrato visual en la altura del cilindro
        const vibratoEffect = Math.sin(timeRef.current * vibratoRate * Math.PI * 2) * vibratoAmount * 0.3;
        const newScaleY = scale[1] * (1 + vibratoEffect);
        
        meshRef.current.scale.setY(newScaleY);
        
        // Cambiar el color del material basado en la frecuencia de forma más segura
        // Solo actualizar el material cada 100ms para evitar problemas de rendimiento
        if (timeRef.current - lastMaterialUpdateRef.current > 0.1) {
          try {
            const frequencyRatio = audioParams.frequency / 2000;
            const volumeRatio = audioParams.volume;
            
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
    });

    // Actualizar wireframe cuando cambia la selección
    useEffect(() => {
      if (wireframeRef.current) {
        wireframeRef.current.visible = isSelected;
      }
    }, [isSelected]);

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
        <mesh ref={meshRef} scale={scale}>
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

        {/* Wireframe para indicar selección */}
        {isSelected && (
          <lineSegments ref={wireframeRef}>
            <edgesGeometry args={[new THREE.CylinderGeometry(0.5, 0.5, 2, 32)]} />
            <lineBasicMaterial color="#ffffff" linewidth={2} />
          </lineSegments>
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
