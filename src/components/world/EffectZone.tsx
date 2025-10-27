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
    const hasBeenControlledRef = React.useRef(false);
    
    // Ref para mantener la última posición controlada externamente
    const controlledPositionRef = React.useRef<[number, number, number] | null>(null);
    
    // Actualizar posición solo cuando cambia y NO está siendo controlada externamente
    React.useEffect(() => {
      if (!groupRef.current) return;
      
      // Verificar si hay un ref externo controlando este grupo
      const externalRef = ref && typeof ref !== 'function' && (ref as React.MutableRefObject<THREE.Group | null>).current;
      const isControlled = externalRef && externalRef === groupRef.current;
      
      // Si está siendo controlado externamente, guardar la posición controlada
      if (isControlled) {
        hasBeenControlledRef.current = true;
        const pos = groupRef.current.position;
        controlledPositionRef.current = [pos.x, pos.y, pos.z] as [number, number, number];
        return; // No actualizar desde props
      }
      
      // Si nunca ha sido controlado externamente, actualizar desde props
      if (!hasBeenControlledRef.current) {
        groupRef.current.position.set(...zone.position);
      }
      // Si fue controlado externamente, verificar si el usuario dejó de arrastrar
      else {
        // Si la posición controlada es similar a la posición actual, resetear el flag
        if (controlledPositionRef.current) {
          const [cx, cy, cz] = controlledPositionRef.current;
          const [px, py, pz] = zone.position;
          
          if (
            Math.abs(cx - px) < 0.1 &&
            Math.abs(cy - py) < 0.1 &&
            Math.abs(cz - pz) < 0.1
          ) {
            // El usuario ya terminó de arrastrar, podemos usar props de nuevo
            hasBeenControlledRef.current = false;
            controlledPositionRef.current = null;
            groupRef.current.position.set(...zone.position);
          }
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
          if (node) {
            // Solo establecer posición inicial si no ha sido controlada externamente
            if (!hasBeenControlledRef.current && !controlledPositionRef.current) {
              node.position.set(...zone.position);
              console.log('🎬 EFFECTZONE: Component mounted', {
                zoneId: zone.id,
                initialPosition: zone.position,
                willUseProps: true
              });
            } else {
              console.log('🎬 EFFECTZONE: Component mounted (preserving position)', {
                zoneId: zone.id,
                preservedPosition: controlledPositionRef.current || zone.position
              });
            }
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
