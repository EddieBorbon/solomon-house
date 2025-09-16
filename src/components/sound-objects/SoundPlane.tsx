'use client';

import React, { forwardRef, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useWorldStore } from '../../state/useWorldStore';
import * as THREE from 'three';

interface SoundPlaneProps {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  isSelected: boolean;
  audioParams: {
    frequency?: number;
    volume?: number;
    waveform?: OscillatorType;
    duration?: number;
  };
}

export const SoundPlane = forwardRef<THREE.Group, SoundPlaneProps>(
  ({ id, position, rotation, scale, isSelected }, ref) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const groupRef = useRef<THREE.Group>(null);
    const { selectEntity, triggerObjectPercussion } = useWorldStore();
    
    // Estado para la animación de ondulación
    const [isAnimating, setIsAnimating] = useState(false);
    const [animationTime, setAnimationTime] = useState(0);
    
    // Referencia para el material
    const materialRef = useRef<THREE.MeshStandardMaterial>(null);

    // Función para manejar el clic
    const handleClick = (event: React.MouseEvent) => {
      event.stopPropagation();
      selectEntity(id);
      triggerObjectPercussion(id);
      
      // Activar animación de ondulación
      setIsAnimating(true);
      setAnimationTime(0);
    };

    // Animación de ondulación
    useFrame((state, delta) => {
      if (isAnimating && meshRef.current && materialRef.current) {
        setAnimationTime(prev => prev + delta);
        
        // Crear efecto de ondulación
        const time = animationTime;
        const vertices = meshRef.current.geometry.attributes.position;
        const count = vertices.count;
        
        for (let i = 0; i < count; i++) {
          const x = vertices.getX(i);
          const y = vertices.getY(i);
          
          // Efecto de ondulación que decae con el tiempo
          const wave = Math.sin(x * 10 + time * 20) * Math.sin(y * 10 + time * 15) * 0.1;
          const decay = Math.exp(-time * 5); // Decaimiento exponencial
          
          vertices.setZ(i, z + wave * decay);
        }
        
        vertices.needsUpdate = true;
        
                  // Cambiar opacidad durante la animación
          const opacity = 0.8 + (0.2 * Math.exp(-time * 3));
          materialRef.current.opacity = opacity;
        
        // Detener animación después de un tiempo
        if (time > 0.5) {
          setIsAnimating(false);
          // Restaurar posición original
          for (let i = 0; i < count; i++) {
            vertices.setZ(i, 0);
          }
          vertices.needsUpdate = true;
          materialRef.current.opacity = 0.8;
        }
      }
    });

    // Efecto para limpiar la animación cuando se desmonta
    useEffect(() => {
      return () => {
        setIsAnimating(false);
      };
    }, []);

    return (
      <group
        ref={ref || groupRef}
        position={position}
        rotation={rotation}
        scale={scale}
        onClick={handleClick}
      >
        <mesh ref={meshRef}>
          <planeGeometry args={[2.5, 2.5, 32, 32]} />
          <meshStandardMaterial
            ref={materialRef}
            color={isSelected ? "#60a5fa" : "#3b82f6"}
            transparent
            opacity={0.9}
            side={THREE.DoubleSide}
            metalness={0.4}
            roughness={0.25}
            emissive={isSelected ? "#1e40af" : "#1e3a8a"}
            emissiveIntensity={isSelected ? 0.5 : 0.2}
            envMapIntensity={1.1}
          />
        </mesh>
        
        {/* Borde del plano para mejor visibilidad */}
        <mesh position={[0, 0, 0.001]}>
          <ringGeometry args={[1.2, 1.25, 32]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
        
        {/* Indicador de selección - CÍRCULOS ELIMINADOS */}
        {/* Los anillos azules transparentes han sido removidos */}
      </group>
    );
  }
);

SoundPlane.displayName = 'SoundPlane';
