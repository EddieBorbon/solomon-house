import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

interface CameraControls {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  fast: boolean;
}

export function useCameraControls() {
  const controls = useRef<CameraControls>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
    fast: false,
  });

  const moveSpeed = useRef(0.1);
  const fastMoveSpeed = useRef(0.3);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Solo procesar si no estamos escribiendo en un input
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case 'w':
          controls.current.forward = true;
          break;
        case 's':
          controls.current.backward = true;
          break;
        case 'a':
          controls.current.left = true;
          break;
        case 'd':
          controls.current.right = true;
          break;
        case 'q':
          controls.current.down = true;
          break;
        case 'e':
          controls.current.up = true;
          break;
        case 'shift':
          controls.current.fast = true;
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case 'w':
          controls.current.forward = false;
          break;
        case 's':
          controls.current.backward = false;
          break;
        case 'a':
          controls.current.left = false;
          break;
        case 'd':
          controls.current.right = false;
          break;
        case 'q':
          controls.current.down = false;
          break;
        case 'e':
          controls.current.up = false;
          break;
        case 'shift':
          controls.current.fast = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Función para actualizar la posición de la cámara
  const updateCameraPosition = (camera: THREE.Camera, orbitControls: OrbitControlsImpl | null) => {
    if (!camera || !orbitControls) return;
    
    // Debug: verificar si hay controles activos
    const hasActiveControls = Object.values(controls.current).some(Boolean);
    if (hasActiveControls) {
      console.log('🎮 Controles de cámara activos:', controls.current);
    }

    const currentSpeed = controls.current.fast ? fastMoveSpeed.current : moveSpeed.current;
    
    // Obtener la dirección de la cámara
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    
    // Vector hacia arriba de la cámara
    const cameraUp = new THREE.Vector3(0, 1, 0);
    
    // Vector hacia la derecha de la cámara (perpendicular a dirección y arriba)
    const cameraRight = new THREE.Vector3();
    cameraRight.crossVectors(cameraDirection, cameraUp).normalize();

    // Movimiento hacia adelante/atrás
    if (controls.current.forward) {
      camera.position.addScaledVector(cameraDirection, currentSpeed);
      if (orbitControls.target) {
        orbitControls.target.addScaledVector(cameraDirection, currentSpeed);
      }
    }
    if (controls.current.backward) {
      camera.position.addScaledVector(cameraDirection, -currentSpeed);
      if (orbitControls.target) {
        orbitControls.target.addScaledVector(cameraDirection, -currentSpeed);
      }
    }

    // Movimiento lateral izquierda/derecha
    if (controls.current.left) {
      camera.position.addScaledVector(cameraRight, -currentSpeed);
      if (orbitControls.target) {
        orbitControls.target.addScaledVector(cameraRight, -currentSpeed);
      }
    }
    if (controls.current.right) {
      camera.position.addScaledVector(cameraRight, currentSpeed);
      if (orbitControls.target) {
        orbitControls.target.addScaledVector(cameraRight, currentSpeed);
      }
    }

    // Movimiento vertical arriba/abajo
    if (controls.current.up) {
      camera.position.addScaledVector(cameraUp, currentSpeed);
      if (orbitControls.target) {
        orbitControls.target.addScaledVector(cameraUp, currentSpeed);
      }
    }
    if (controls.current.down) {
      camera.position.addScaledVector(cameraUp, -currentSpeed);
      if (orbitControls.target) {
        orbitControls.target.addScaledVector(cameraUp, -currentSpeed);
      }
    }

    // Actualizar los controles de órbita
    if (orbitControls.update) {
      orbitControls.update();
    }
  };

  return { updateCameraPosition };
}
