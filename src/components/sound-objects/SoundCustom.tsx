'use client';

import React, { forwardRef, useRef, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useWorldStore } from '../../state/useWorldStore';
import { type AudioParams } from '../../lib/AudioManager';

interface SoundCustomProps {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  isSelected: boolean;
  audioEnabled: boolean;
  audioParams: AudioParams;
  customShapeCode?: string;
}

export const SoundCustom = forwardRef<THREE.Group, SoundCustomProps>(
  ({ id, position, rotation, scale, isSelected, audioEnabled, audioParams, customShapeCode }, ref) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const { triggerObjectNote, toggleObjectAudio, grids } = useWorldStore();

    // Obtener el código personalizado del objeto
    const customCode = useMemo(() => {
      if (!customShapeCode) return null;
      
      // Buscar el objeto en las cuadrículas
      for (const grid of grids.values()) {
        const obj = grid.objects.find(o => o.id === id);
        if (obj?.customShapeCode) {
          return obj.customShapeCode;
        }
      }
      return customShapeCode;
    }, [customShapeCode, id, grids]);

    // Función para evaluar el código personalizado de forma segura
    const evaluateCustomCode = useCallback((code: string): THREE.Mesh | null => {
      try {
        // Función wrapper que ejecuta el código del usuario
        // El código del usuario tiene acceso a THREE automáticamente
        const func = new Function('THREE', code);
        
        // Ejecutar el código y obtener el resultado
        const result = func(THREE);
        
        // Si devuelve un mesh, usarlo
        if (result instanceof THREE.Mesh) {
          return result;
        }
        
        return null;
      } catch (error) {
        console.error('Error al evaluar código personalizado:', error);
        console.error('Código que falló:', code);
        return null;
      }
    }, []);

    // Renderizar geometría personalizada
    const customMesh = useMemo(() => {
      if (!customCode) return null;
      return evaluateCustomCode(customCode);
    }, [customCode, evaluateCustomCode]);

    // Animación sutil de rotación
    useFrame((state, delta) => {
      if (meshRef.current) {
        meshRef.current.rotation.y += delta * 0.5;
      }
    });

    const handleClick = (event: React.MouseEvent) => {
      event.stopPropagation();
      console.log('🎵 SoundCustom clicked:', id);

      // Alternar estado de audio
      toggleObjectAudio(id);

      // Si el audio está habilitado, emitir nota
      if (!audioEnabled) {
        triggerObjectNote(id);
      }
    };

  const handlePointerDown = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  const handlePointerUp = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  const handlePointerLeave = () => {
    // No action needed
  };

    const wireframeColor = isSelected ? '#fbbf24' : '#8b5cf6';
    const lineWidth = isSelected ? 3 : 2;

    // Si hay código personalizado, renderizarlo
    if (customMesh) {
      return (
        <group ref={ref} position={position} rotation={rotation} scale={scale}>
          <primitive 
            object={customMesh}
            onClick={handleClick}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerLeave}
          />
          
          {/* Indicador de selección */}
          {isSelected && (
            <mesh>
              <boxGeometry args={[1.15, 1.15, 1.15]} />
              <meshBasicMaterial
                color="#fbbf24"
                transparent
                opacity={0.2}
                wireframe
              />
            </mesh>
          )}

          {/* Indicador de audio activo */}
          {audioEnabled && (
            <mesh position={[0, 1.3, 0]}>
              <sphereGeometry args={[0.2, 8, 6]} />
              <meshStandardMaterial
                color="#8b5cf6"
                emissive="#8b5cf6"
                emissiveIntensity={0.8}
              />
            </mesh>
          )}
        </group>
      );
    }

    // Renderizar cubo wireframe por defecto
    return (
      <group ref={ref} position={position} rotation={rotation} scale={scale}>
        {/* Cubo wireframe principal */}
        <mesh
          ref={meshRef}
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color={audioParams.color || "#8b5cf6"}
            transparent
            opacity={0.1}
            wireframe
          />
        </mesh>

        {/* Bordes del wireframe */}
        <lineSegments>
          <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry(1, 1, 1)]} />
          <lineBasicMaterial color={wireframeColor} linewidth={lineWidth} />
        </lineSegments>

        {/* Indicador de selección */}
        {isSelected && (
          <mesh>
            <boxGeometry args={[1.15, 1.15, 1.15]} />
            <meshBasicMaterial
              color="#fbbf24"
              transparent
              opacity={0.2}
              wireframe
            />
          </mesh>
        )}

        {/* Indicador de audio activo */}
        {audioEnabled && (
          <mesh position={[0, 1.3, 0]}>
            <sphereGeometry args={[0.2, 8, 6]} />
            <meshStandardMaterial
              color="#8b5cf6"
              emissive="#8b5cf6"
              emissiveIntensity={0.8}
            />
          </mesh>
        )}
      </group>
    );
  }
);

SoundCustom.displayName = 'SoundCustom';
