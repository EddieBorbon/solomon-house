'use client';

import React, { forwardRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useWorldStore } from '../../state/useWorldStore';
import { EffectZone as EffectZoneType } from '../../state/useWorldStore';
import * as THREE from 'three';

interface EffectZoneProps {
  zone: EffectZoneType;
  onSelect: (id: string) => void;
}

export const EffectZone = forwardRef<THREE.Group, EffectZoneProps>(
  ({ zone, onSelect }, ref) => {
    const { updateEffectZone } = useWorldStore();

    // Eliminamos la rotación automática para que el gizmo no se gire

    const handleClick = (event: any) => {
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
        ref={ref}
        position={zone.position}
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
