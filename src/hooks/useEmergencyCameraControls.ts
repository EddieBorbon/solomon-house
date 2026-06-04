import { useState, useEffect, useCallback } from 'react';

/**
 * Hook personalizado para manejar la recuperación y desbloqueo de la cámara
 * en caso de que OrbitControls se bloquee o pierda el foco de captura.
 * Escucha las teclas 'C' (restaurar rotación) y 'F' (forzar activación).
 */
export function useEmergencyCameraControls(orbitControlsRef: React.RefObject<any>) {
  const [showCameraBlockedIndicator, setShowCameraBlockedIndicator] = useState(false);

  // Liberar capturas de puntero para evitar que el canvas secuestre el mouse
  const releasePointerCaptures = useCallback((element?: HTMLElement | null) => {
    if (!element || typeof element.releasePointerCapture !== 'function') {
      return;
    }

    const canCheckCapture = typeof element.hasPointerCapture === 'function';

    for (let pointerId = 0; pointerId < 10; pointerId++) {
      try {
        if (!canCheckCapture || element.hasPointerCapture(pointerId)) {
          element.releasePointerCapture(pointerId);
        }
      } catch {
        // Ignorar errores silenciosamente
      }
    }
  }, []);

  // Handler de teclado de emergencia
  const handleEmergencyCameraUnlock = useCallback((event: KeyboardEvent) => {
    const target = event.target as HTMLElement;
    // Ignorar clics dentro de inputs o áreas de texto
    if (target?.tagName?.match(/INPUT|TEXTAREA/)) {
      return;
    }

    // Tecla 'C' para resetear controles y restaurar clic derecho de rotación
    if (event.key.toLowerCase() === 'c') {
      event.preventDefault();
      event.stopPropagation();

      console.log('🔑 Tecla C presionada - Restaurando controles de rotación...');

      if (orbitControlsRef.current) {
        try {
          const controls = orbitControlsRef.current as {
            enabled: boolean;
            _domElement?: HTMLElement;
            domElement?: HTMLElement;
            _state?: Record<string, number>;
            [key: string]: unknown;
          };

          const domElement = controls._domElement || controls.domElement || document.querySelector('canvas');

          releasePointerCaptures(domElement);

          // Ciclar enabled para forzar desvinculación completa de eventos
          controls.enabled = false;

          try {
            if (controls._state && typeof controls._state === 'object') {
              const state = controls._state;
              if (typeof state.MOUSEDOWN === 'number') state.MOUSEDOWN = -1;
              if (typeof state.POINTER_DOWN === 'number') state.POINTER_DOWN = -1;
              if (typeof state.TOUCH_DOWN === 'number') state.TOUCH_DOWN = -1;

              if (typeof state.ROTATE_START === 'number') state.ROTATE_START = -1;
              if (typeof state.PAN_START === 'number') state.PAN_START = -1;
              if (typeof state.DOLLY_START === 'number') state.DOLLY_START = -1;
            }

            const stateProps = ['_touchStart', '_panStart', '_rotateStart', '_dollyStart'];
            stateProps.forEach(prop => {
              if (controls[prop] !== undefined) {
                try {
                  const propValue = controls[prop];
                  if (typeof propValue === 'object' && propValue !== null) {
                    Object.keys(propValue).forEach(key => {
                      const keyValue = (propValue as Record<string, unknown>)[key];
                      if (typeof keyValue === 'number') {
                        (propValue as Record<string, number>)[key] = -1;
                      }
                    });
                  }
                } catch {
                  // Ignorar errores silenciosamente
                }
              }
            });
          } catch {
            // Ignorar errores silenciosamente
          }

          setTimeout(() => {
            if (orbitControlsRef.current) {
              const controls = orbitControlsRef.current as {
                enabled: boolean;
                enableRotate?: boolean;
                update: () => void;
              };

              controls.enabled = true;

              if (typeof controls.enableRotate !== 'undefined') {
                controls.enableRotate = true;
              }

              controls.update();
              console.log('✅ useEmergencyCameraControls: OrbitControls reactivado correctamente');
            }
          }, 10);

        } catch (error) {
          console.error('❌ useEmergencyCameraControls: Error al restaurar rotación:', error);
          if (orbitControlsRef.current) {
            orbitControlsRef.current.enabled = true;
            const controlsFallback = orbitControlsRef.current as { enabled: boolean; enableRotate?: boolean; update: () => void };
            if (typeof controlsFallback.enableRotate !== 'undefined') {
              controlsFallback.enableRotate = true;
            }
            orbitControlsRef.current.update();
          }
        }
      }
    }

    // Tecla 'F' para forzar habilitación inmediata
    if (event.key.toLowerCase() === 'f') {
      if (orbitControlsRef.current) {
        try {
          orbitControlsRef.current.enabled = true;
          orbitControlsRef.current.update();
          console.log('⚡ useEmergencyCameraControls: OrbitControls forzado como habilitado con tecla F');
        } catch (error) {
          console.warn('⚠️ useEmergencyCameraControls: Error al forzar habilitación:', error);
        }
      }
    }
  }, [orbitControlsRef, releasePointerCaptures]);

  // Registrar listener global de teclado (con captura para máxima prioridad)
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      handleEmergencyCameraUnlock(event);
    };

    window.addEventListener('keydown', handler, { capture: true });
    return () => {
      window.removeEventListener('keydown', handler, { capture: true });
    };
  }, [handleEmergencyCameraUnlock]);

  // Listener para liberar captura del puntero cuando el mouse sale del canvas
  useEffect(() => {
    if (!orbitControlsRef.current) return;

    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const handleMouseLeave = () => {
      if (orbitControlsRef.current) {
        try {
          const controls = orbitControlsRef.current as {
            _domElement?: HTMLElement;
            domElement?: HTMLElement;
            _state?: Record<string, number>;
            update: () => void;
          };

          const domElement = controls._domElement || controls.domElement || canvas;
          releasePointerCaptures(domElement);

          if (controls._state) {
            const state = controls._state;
            if (typeof state.MOUSEDOWN === 'number') state.MOUSEDOWN = -1;
            if (typeof state.POINTER_DOWN === 'number') state.POINTER_DOWN = -1;
          }

          controls.update();
        } catch {
          // Ignorar errores silenciosamente
        }
      }
    };

    canvas.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [orbitControlsRef, releasePointerCaptures]);

  // Intervalo periódico para comprobar el estado de bloqueo de la cámara
  useEffect(() => {
    const interval = setInterval(() => {
      if (orbitControlsRef.current && !orbitControlsRef.current.enabled) {
        setShowCameraBlockedIndicator(true);
      } else {
        setShowCameraBlockedIndicator(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [orbitControlsRef]);

  return { showCameraBlockedIndicator };
}
