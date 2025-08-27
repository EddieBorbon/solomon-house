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

    // Color base para el Phaser (morado)
    const baseColor = '#8b5cf6';
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
