'use client';

import React, { forwardRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { EffectZone as EffectZoneType } from '../../state/useWorldStore';
import * as THREE from 'three';

interface EffectZoneProps {
  zone: EffectZoneType;
  onSelect: (id: string) => void;
}

export const EffectZone = forwardRef<THREE.Group, EffectZoneProps>(
  ({ zone, onSelect }, ref) => {
    const groupRef = React.useRef<THREE.Group | null>(null);
    const isDraggingRef = React.useRef(false);
    const lastControlledPositionRef = React.useRef<[number, number, number] | null>(null);
    
    // Actualizar posición solo cuando NO está siendo arrastrado
    React.useEffect(() => {
      if (!groupRef.current) return;
      
      // Verificar si hay un ref externo controlando este grupo (TransformControls)
      const externalRef = ref && typeof ref !== 'function' && (ref as React.MutableRefObject<THREE.Group | null>).current;
      const isControlledExternally = externalRef && externalRef === groupRef.current;
      
      // Si está siendo controlado externamente (durante arrastre), guardar la posición y no hacer nada
      if (isControlledExternally) {
        const pos = groupRef.current.position;
        lastControlledPositionRef.current = [pos.x, pos.y, pos.z] as [number, number, number];
        isDraggingRef.current = true;
        return; // No actualizar desde props durante el arrastre
      }
      
      // Si ya terminó el arrastre, verificar si necesitamos sincronizar
      if (isDraggingRef.current && lastControlledPositionRef.current) {
        const [lastX, lastY, lastZ] = lastControlledPositionRef.current;
        const [storeX, storeY, storeZ] = zone.position;
        const [currentX, currentY, currentZ] = [
          groupRef.current.position.x,
          groupRef.current.position.y,
          groupRef.current.position.z
        ];
        
        // Comparar la posición actual del grupo con la posición del store
        const threshold = 0.01; // Umbral muy pequeño para detección precisa
        const positionMatches = (
          Math.abs(currentX - storeX) < threshold &&
          Math.abs(currentY - storeY) < threshold &&
          Math.abs(currentZ - storeZ) < threshold
        );
        
        // Si la posición actual ya coincide con el store, solo resetear flags
        if (positionMatches) {
          isDraggingRef.current = false;
          lastControlledPositionRef.current = null;
          return;
        }
        
        // Si el store fue actualizado y la posición actual es diferente, sincronizar
        const storeMatchesLastControlled = (
          Math.abs(lastX - storeX) < threshold &&
          Math.abs(lastY - storeY) < threshold &&
          Math.abs(lastZ - storeZ) < threshold
        );
        
        if (storeMatchesLastControlled) {
          // El store ya refleja la última posición controlada, sincronizar y resetear
          groupRef.current.position.set(...zone.position);
          isDraggingRef.current = false;
          lastControlledPositionRef.current = null;
          return;
        }
      }
      
      // Si no está siendo arrastrado, verificar si necesitamos actualizar
      if (!isDraggingRef.current) {
        const [currentX, currentY, currentZ] = [
          groupRef.current.position.x,
          groupRef.current.position.y,
          groupRef.current.position.z
        ];
        const [storeX, storeY, storeZ] = zone.position;
        
        // Solo actualizar si hay una diferencia significativa
        const threshold = 0.01;
        if (
          Math.abs(currentX - storeX) > threshold ||
          Math.abs(currentY - storeY) > threshold ||
          Math.abs(currentZ - storeZ) > threshold
        ) {
          groupRef.current.position.set(...zone.position);
        }
      }
    }, [zone.position, ref]);

    const handleClick = (event: React.MouseEvent) => {
      event.stopPropagation();
      onSelect(zone.id);
    };

    // Colores según el tipo de efecto
    const getBaseColor = () => {
      switch (zone.type) {
        case 'phaser':
          return '#8b5cf6'; // Morado para Phaser
        case 'autoFilter':
          return '#10b981'; // Verde para AutoFilter
              case 'autoWah':
        return '#f59e0b'; // Naranja para AutoWah
      case 'bitCrusher':
        return '#ef4444'; // Rojo para BitCrusher
      case 'chebyshev':
        return '#6366f1'; // Índigo para Chebyshev
      case 'chorus':
        return '#14b8a6'; // Teal para Chorus
      case 'distortion':
        return '#ec4899'; // Rosa para Distortion
      case 'feedbackDelay':
        return '#f59e0b'; // Ámbar para FeedbackDelay
      case 'freeverb':
        return '#0ea5e9'; // Azul cielo para Freeverb
      case 'frequencyShifter':
        return '#65a30d'; // Verde lima para FrequencyShifter
      case 'jcReverb':
        return '#1e3a8a'; // Azul marino para JCReverb
      case 'pingPongDelay':
        return '#7c3aed'; // Violeta para PingPongDelay
      case 'pitchShift':
        return '#10b981'; // Verde esmeralda para PitchShift
      case 'reverb':
        return '#f59e0b'; // Ámbar para Reverb
      case 'stereoWidener':
        return '#06b6d4'; // Cian para StereoWidener
      case 'tremolo':
        return '#ef4444'; // Rojo para Tremolo
      case 'vibrato':
        return '#f97316'; // Naranja para Vibrato
      default:
        return '#8b5cf6'; // Morado por defecto
      }
    };
    
    const baseColor = getBaseColor();
    const lockedColor = '#ef4444'; // Rojo para zonas bloqueadas

    // Función para renderizar la geometría según la forma
    const renderGeometry = () => {
      const material = (
        <meshStandardMaterial
          color={zone.isLocked ? lockedColor : baseColor}
          wireframe
          transparent
          opacity={0.8}
          emissive={zone.isLocked ? lockedColor : baseColor}
          emissiveIntensity={0.3}
        />
      );

      switch (zone.shape) {
        case 'cube':
          return (
            <mesh>
              <boxGeometry args={[2, 2, 2]} />
              {material}
            </mesh>
          );
        case 'sphere':
        default:
          return (
            <mesh>
              <sphereGeometry args={[1, 32, 32]} />
              {material}
            </mesh>
          );
      }
    };

    return (
      <group
        ref={(node) => {
          groupRef.current = node;
          
          // Manejar tanto el ref interno como el ref externo
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            (ref as React.MutableRefObject<THREE.Group | null>).current = node;
          }
          
          // Inicializar posición solo en el montaje
          if (node && !isDraggingRef.current) {
            node.position.set(...zone.position);
          }
        }}
        rotation={zone.rotation}
        scale={zone.scale}
        onClick={handleClick}
      >
        {/* Geometría principal de la zona de efecto (solo wireframe) */}
        {renderGeometry()}

        {/* Campo de fuerza/jaula cuando está bloqueada */}
        {zone.isLocked && (
          <mesh>
            {zone.shape === 'cube' ? (
              <boxGeometry args={[2.2, 2.2, 2.2]} />
            ) : (
              <sphereGeometry args={[1.1, 16, 16]} />
            )}
            <meshStandardMaterial
              color={lockedColor}
              wireframe
              transparent
              opacity={0.8}
              emissive={lockedColor}
              emissiveIntensity={0.3}
            />
          </mesh>
        )}

        {/* Indicador de selección */}
        {zone.isSelected && (
          <mesh>
            {zone.shape === 'cube' ? (
              <boxGeometry args={[2.4, 2.4, 2.4]} />
            ) : (
              <sphereGeometry args={[1.2, 32, 32]} />
            )}
            <meshStandardMaterial
              color="#ffffff"
              wireframe
              transparent
              opacity={0.6}
              emissive="#ffffff"
              emissiveIntensity={0.5}
            />
          </mesh>
        )}
      </group>
    );
  }
);

EffectZone.displayName = 'EffectZone';
