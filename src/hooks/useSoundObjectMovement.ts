'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { type AudioParams } from '../lib/factories/SoundSourceFactory';
import { type Group, type Object3D } from 'three';

export type MovementType = 'circular' | 'polar' | 'random' | 'figure8' | 'spiral';

interface UseSoundObjectMovementParams {
  groupRef: React.RefObject<Group | Object3D | null>;
  audioParams: AudioParams;
  initialPosition: [number, number, number];
  enabled?: boolean;
  objectId?: string;
  onPositionUpdate?: (position: [number, number, number]) => void;
}

/**
 * Hook para manejar el movimiento automático de objetos sonoros
 * Similar al comportamiento de MobileObject pero integrado en los objetos sonoros
 */
export function useSoundObjectMovement({
  groupRef,
  audioParams,
  initialPosition,
  enabled = true,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  objectId: _objectId,
  onPositionUpdate
}: UseSoundObjectMovementParams) {
  const timeRef = useRef(0);
  const originalPositionRef = useRef<[number, number, number]>(initialPosition);
  const isManualDragRef = useRef(false);
  const lastUpdateTimeRef = useRef(0);
  const UPDATE_THROTTLE = 100; // Actualizar el store cada 100ms como máximo

  // Actualizar posición original cuando cambia desde fuera (arrastre manual o actualización desde el store)
  useEffect(() => {
    // Verificar que el ref existe antes de acceder
    if (!groupRef) {
      originalPositionRef.current = initialPosition;
      return;
    }

    // Si el ref.current no está disponible todavía, usar la posición inicial
    if (!groupRef.current) {
      originalPositionRef.current = initialPosition;
      return;
    }

    // Sincronizar la posición original con la posición actual del objeto
    originalPositionRef.current = [
      groupRef.current.position.x,
      groupRef.current.position.y,
      groupRef.current.position.z
    ] as [number, number, number];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPosition, audioParams.movementEnabled]);

  // Resetear tiempo cuando se desactiva/activa el movimiento
  useEffect(() => {
    if (!audioParams.movementEnabled) {
      timeRef.current = 0;
    }
  }, [audioParams.movementEnabled]);

  // Función para calcular la nueva posición según el tipo de movimiento
  const calculateMovement = (
    time: number,
    origin: [number, number, number]
  ): [number, number, number] => {
    const {
      movementType = 'circular',
      movementRadius = 2,
      movementSpeed = 1,
      movementAmplitude = 0.5,
      movementFrequency = 1,
      movementRandomSeed = 0,
      movementHeight = 0,
      movementHeightSpeed = 0.5
    } = audioParams;

    switch (movementType) {
      case 'circular': {
        const angle = time * movementSpeed;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const yOffset = movementHeight * Math.sin(time * movementHeightSpeed);
        return [
          origin[0] + movementRadius * cos,
          origin[1] + yOffset,
          origin[2] + movementRadius * sin
        ];
      }

      case 'polar': {
        const angle = time * movementSpeed;
        const r = movementRadius + movementAmplitude * Math.sin(movementFrequency * angle);
        const yOffset = movementHeight * Math.sin(time * movementHeightSpeed);
        return [
          origin[0] + r * Math.cos(angle),
          origin[1] + yOffset,
          origin[2] + r * Math.sin(angle)
        ];
      }

      case 'random': {
        const seed = movementRandomSeed + time * 0.1;
        const x = origin[0] + (Math.sin(seed) * movementRadius);
        const z = origin[2] + (Math.cos(seed * 1.3) * movementRadius);
        const y = origin[1] + (Math.sin(seed * 0.7) * movementHeight);
        return [x, y, z];
      }

      case 'figure8': {
        const angle = time * movementSpeed;
        const x = origin[0] + movementRadius * Math.sin(angle);
        const z = origin[2] + movementRadius * Math.sin(2 * angle) * 0.5;
        const yOffset = movementHeight * Math.sin(time * movementHeightSpeed);
        return [x, origin[1] + yOffset, z];
      }

      case 'spiral': {
        const angle = time * movementSpeed;
        // Radio creciente limitado para evitar que crezca infinitamente
        const spiralTime = Math.min(time, 10); // Limitar a 10 segundos de crecimiento
        const r = movementRadius * (1 + spiralTime * 0.1);
        const yOffset = movementHeight * Math.sin(time * movementHeightSpeed);
        return [
          origin[0] + r * Math.cos(angle),
          origin[1] + yOffset,
          origin[2] + r * Math.sin(angle)
        ];
      }

      default:
        return origin;
    }
  };

  // Aplicar movimiento en cada frame
  useFrame((state, delta) => {
    // Verificar que el ref y su current existan antes de acceder
    if (!groupRef || !groupRef.current || !audioParams.movementEnabled || !enabled) {
      return;
    }

    // No aplicar movimiento si el objeto está siendo arrastrado manualmente
    if (isManualDragRef.current) {
      return;
    }

    timeRef.current += delta;
    
    const newPosition = calculateMovement(
      timeRef.current,
      originalPositionRef.current
    );

    // Aplicar la nueva posición (ya verificamos que groupRef.current existe)
    groupRef.current.position.set(...newPosition);
    
    // Actualizar el store periódicamente (con throttling para evitar demasiadas actualizaciones)
    if (onPositionUpdate) {
      const now = Date.now();
      if (now - lastUpdateTimeRef.current > UPDATE_THROTTLE) {
        onPositionUpdate(newPosition);
        lastUpdateTimeRef.current = now;
      }
    }
  });

  // Retornar función para pausar movimiento durante arrastre
  return {
    pauseMovement: () => {
      isManualDragRef.current = true;
    },
    resumeMovement: () => {
      isManualDragRef.current = false;
      // Actualizar posición original cuando se suelta
      if (groupRef && groupRef.current) {
        originalPositionRef.current = [
          groupRef.current.position.x,
          groupRef.current.position.y,
          groupRef.current.position.z
        ] as [number, number, number];
      }
    }
  };
}
