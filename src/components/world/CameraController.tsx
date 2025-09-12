'use client';

import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useWorldStore } from '../../state/useWorldStore';
import * as THREE from 'three';

export function CameraController() {
  const { camera } = useThree();
  const { currentGridCoordinates, gridSize, moveToGrid } = useWorldStore();
  const targetPosition = useRef(new THREE.Vector3());
  const isMoving = useRef(false);
  const moveSpeed = useRef(0.05);
  const lastGridCoordinates = useRef(currentGridCoordinates);

  // Calcular la posición objetivo de la cámara solo para navegación por teclado
  useEffect(() => {
    // Solo mover la cámara si las coordenadas cambiaron por teclado (no por clic manual)
    const coordinatesChanged = 
      currentGridCoordinates[0] !== lastGridCoordinates.current[0] ||
      currentGridCoordinates[1] !== lastGridCoordinates.current[1] ||
      currentGridCoordinates[2] !== lastGridCoordinates.current[2];
    
    if (coordinatesChanged) {
      const [x, y, z] = currentGridCoordinates;
      targetPosition.current.set(
        x * gridSize,
        y * gridSize + 10, // Altura fija para vista aérea
        z * gridSize + 15  // Distancia para ver la cuadrícula completa
      );
      isMoving.current = true;
      lastGridCoordinates.current = [...currentGridCoordinates];
    }
  }, [currentGridCoordinates, gridSize]);

  // Animación suave de la cámara
  useFrame(() => {
    if (isMoving.current) {
      const currentPos = camera.position;
      const target = targetPosition.current;
      
      // Interpolación suave hacia la posición objetivo
      currentPos.lerp(target, moveSpeed.current);
      
      // Mirar hacia el centro de la cuadrícula actual
      const [x, y, z] = currentGridCoordinates;
      const lookAtTarget = new THREE.Vector3(
        x * gridSize,
        y * gridSize,
        z * gridSize
      );
      camera.lookAt(lookAtTarget);
      
      // Verificar si hemos llegado cerca de la posición objetivo
      if (currentPos.distanceTo(target) < 0.1) {
        isMoving.current = false;
        camera.position.copy(target);
      }
    }
  });

  // Controles de teclado removidos para evitar conflictos con la cámara
  // La navegación entre cuadrículas ahora se hace solo con los botones del GridCreator

  return null; // Este componente no renderiza nada visual
}
