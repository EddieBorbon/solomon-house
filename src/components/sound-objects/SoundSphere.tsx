'use client';

import React, { forwardRef, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { type AudioParams } from '../../lib/AudioManager';
import { useWorldStore } from '../../state/useWorldStore';

interface SoundSphereProps {
  id: string;
  position: [number, number, number];
  isSelected: boolean;
  audioEnabled: boolean;
  audioParams: AudioParams;
}

export const SoundSphere = forwardRef<THREE.Group, SoundSphereProps>(
  ({ id, position, isSelected, audioEnabled, audioParams }, ref) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.MeshStandardMaterial>(null);
    const energyRef = useRef(0); // Para la animación de clic
    const { 
      selectObject, 
      triggerObjectAttackRelease, 
      startObjectGate, 
      stopObjectGate 
    } = useWorldStore();
    
    // Crear geometría de esfera con más detalle
    const sphereGeometry = useMemo(() => {
      return new THREE.SphereGeometry(0.7, 32, 32);
    }, []);

    // Manejador para clic corto (trigger)
    const handleClick = (event: any) => {
      event.stopPropagation();
      selectObject(id);
      triggerObjectAttackRelease(id);
      
      // Activar la animación de clic
      energyRef.current = 1;
    };

    // Manejador para clic sostenido (gate)
    const handlePointerDown = (event: any) => {
      event.stopPropagation();
      startObjectGate(id);
      
      // Activar la animación de gate
      energyRef.current = 1;
    };

    // Manejador para liberar clic sostenido
    const handlePointerUp = (event: any) => {
      event.stopPropagation();
      stopObjectGate(id);
    };

    // Manejador para cuando el puntero sale del objeto
    const handlePointerLeave = (event: any) => {
      event.stopPropagation();
      stopObjectGate(id);
    };

    // Animación del clic/gate y efectos de audio
    useFrame((state, delta) => {
      if (!meshRef.current || !materialRef.current || !audioParams) return;

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
        const pulseScale = 1 + energyRef.current * 0.3;
        meshRef.current.scale.setScalar(pulseScale);
        
        // Cambiar el color basado en la energía (morado intenso a morado suave)
        const intensity = energyRef.current;
        const purpleColor = new THREE.Color(0.5 + intensity * 0.3, 0.3 + intensity * 0.2, 0.9 + intensity * 0.1);
        materialRef.current.color.copy(purpleColor);
        
        // Emisión intensa durante el clic
        materialRef.current.emissiveIntensity = intensity * 0.8;
      } else {
        // Resetear a valores por defecto
        meshRef.current.scale.setScalar(1);
        materialRef.current.color.setHex(0x8b5cf6); // Morado por defecto
        
        // Efectos de audio cuando no hay clic
        if (audioEnabled) {
          const time = state.clock.elapsedTime;
          
          // Efecto de pulso basado en modulationIndex
          const pulseIntensity = (audioParams?.modulationIndex || 10) / 40;
          const pulseScale = 1 + Math.sin(time * 3) * pulseIntensity * 0.1;
          meshRef.current.scale.setScalar(pulseScale);

          // Efecto de brillo basado en harmonicity
          const harmonicityEffect = (audioParams?.harmonicity || 2) / 8;
          materialRef.current.emissiveIntensity = 0.3 + harmonicityEffect * 0.4;
          
          // Cambio sutil de color basado en modulationIndex
          const modulationEffect = (audioParams?.modulationIndex || 10) / 40;
          materialRef.current.emissive.setHSL(
            0.6 + modulationEffect * 0.1, // Tono azul-morado
            0.7,
            0.3 + modulationEffect * 0.2
          );
        } else {
          materialRef.current.emissiveIntensity = 0;
        }
      }
    });

    return (
      <group ref={ref} position={position}>
        {/* Esfera principal */}
        <mesh 
          ref={meshRef} 
          geometry={sphereGeometry} 
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
        >
          <meshStandardMaterial
            ref={materialRef}
            color="#8b5cf6" // Color morado base
            metalness={0.2}
            roughness={0.15}
            transparent
            opacity={0.95}
            emissive="#4c1d95"
            emissiveIntensity={audioEnabled ? 0.3 : 0}
            envMapIntensity={1.2}
          />
        </mesh>

        {/* Indicador de selección sin wireframe */}
        {isSelected && (
          <Sphere args={[0.75, 16, 16]}>
            <meshBasicMaterial
              color="#fbbf24"
              transparent
              opacity={0.3}
            />
          </Sphere>
        )}

        {/* Indicador de audio activo sin wireframe */}
        {audioEnabled && (
          <Sphere args={[0.8, 8, 8]}>
            <meshBasicMaterial
              color="#10b981"
              transparent
              opacity={0.4}
            />
          </Sphere>
        )}
      </group>
    );
  }
);

SoundSphere.displayName = 'SoundSphere';
