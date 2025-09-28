'use client';

import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

export function CameraControlsManager() {
  const { controls } = useThree();
  const orbitControls = controls as OrbitControlsImpl;

  // Escuchar eventos de control de cámara
  useEffect(() => {
    if (!orbitControls) {
      console.warn('CameraControlsManager: OrbitControls no encontrado.');
      return;
    }

    // Función para despachar el estado actual de la cámara
    const dispatchCameraState = () => {
      const event = new CustomEvent('camera-state-change', {
        detail: { enabled: orbitControls.enabled }
      });
      window.dispatchEvent(event);
    };

    const handleCameraToggle = (event: CustomEvent) => {
      if (orbitControls) {
        orbitControls.enabled = event.detail.enabled;
        dispatchCameraState(); // Confirmar el nuevo estado
      }
    };

    const handleCameraDebug = () => {
      if (orbitControls) {
        const debugEvent = new CustomEvent('camera-debug', {
          detail: {
            enabled: orbitControls.enabled,
            autoRotate: orbitControls.autoRotate,
            enablePan: orbitControls.enablePan,
            enableZoom: orbitControls.enableZoom,
            enableRotate: orbitControls.enableRotate,
            object: orbitControls.object?.type,
            target: orbitControls.target.toArray()
          }
        });
        window.dispatchEvent(debugEvent);
      }
    };

    window.addEventListener('camera-toggle', handleCameraToggle as EventListener);
    window.addEventListener('camera-debug-request', handleCameraDebug as EventListener);

    // Despachar el estado inicial
    dispatchCameraState();

    return () => {
      window.removeEventListener('camera-toggle', handleCameraToggle as EventListener);
      window.removeEventListener('camera-debug-request', handleCameraDebug as EventListener);
    };
  }, [orbitControls]); // Dependencia de orbitControls

  return null; // Este componente no renderiza nada visual
}
