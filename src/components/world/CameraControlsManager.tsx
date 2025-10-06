'use client';

import { useEffect, useState } from 'react';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

interface CameraControlsManagerProps {
  orbitControlsRef: React.RefObject<OrbitControlsImpl | null>;
}

export function CameraControlsManager({ orbitControlsRef }: CameraControlsManagerProps) {
  const [controlsReady, setControlsReady] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Efecto para detectar cuando la referencia cambia
  useEffect(() => {
    if (orbitControlsRef.current) {
      console.log('🎯 CameraControlsManager: Referencia de controles detectada', {
        enabled: orbitControlsRef.current.enabled,
        type: orbitControlsRef.current.constructor.name
      });
      setControlsReady(true);
      setRetryCount(0);
    } else {
      console.log('❌ CameraControlsManager: Referencia de controles perdida');
      setControlsReady(false);
    }
  }, [orbitControlsRef]);

  // Esperar a que los controles estén disponibles con reintentos
  useEffect(() => {
    const checkControls = () => {
      console.log('CameraControlsManager: Verificando controles...', { 
        hasRef: !!orbitControlsRef.current,
        hasEnabled: orbitControlsRef.current ? typeof orbitControlsRef.current.enabled !== 'undefined' : false,
        retryCount 
      });
      
      if (orbitControlsRef.current && typeof orbitControlsRef.current.enabled !== 'undefined') {
        console.log('✅ CameraControlsManager: OrbitControls encontrado y listo', { 
          enabled: orbitControlsRef.current.enabled,
          retryCount,
          controlsType: orbitControlsRef.current.constructor.name
        });
        setControlsReady(true);
        setRetryCount(0);
      } else {
        console.log('⏳ CameraControlsManager: Esperando OrbitControls...', { 
          retryCount,
          hasRef: !!orbitControlsRef.current,
          refValue: orbitControlsRef.current
        });
        setControlsReady(false);
        
        // Reintentar después de un delay si no se encuentran los controles
        if (retryCount < 10) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 1000);
        } else {
          console.warn('⚠️ CameraControlsManager: Máximo de reintentos alcanzado, continuando sin controles');
        }
      }
    };

    checkControls();
  }, [orbitControlsRef, retryCount]);

  // Escuchar eventos de control de cámara
  useEffect(() => {
    if (!orbitControlsRef.current || !controlsReady) {
      console.warn('CameraControlsManager: OrbitControls no encontrado o no listo.');
      return;
    }

    // Función para despachar el estado actual de la cámara
    const dispatchCameraState = () => {
      const event = new CustomEvent('camera-state-change', {
        detail: { enabled: orbitControlsRef.current?.enabled }
      });
      window.dispatchEvent(event);
    };

    const handleCameraToggle = () => {
      if (orbitControlsRef.current) {
        // FORZAR OrbitControls SIEMPRE HABILITADO - NUNCA BLOQUEAR LA CÁMARA
        orbitControlsRef.current.enabled = true;
        console.log('✅ CameraControlsManager: OrbitControls forzado como habilitado (ignorando toggle)');
        dispatchCameraState(); // Confirmar el nuevo estado
      }
    };

    const handleCameraDebug = () => {
      if (orbitControlsRef.current) {
        const debugEvent = new CustomEvent('camera-debug', {
          detail: {
            enabled: orbitControlsRef.current.enabled,
            autoRotate: orbitControlsRef.current.autoRotate,
            enablePan: orbitControlsRef.current.enablePan,
            enableZoom: orbitControlsRef.current.enableZoom,
            enableRotate: orbitControlsRef.current.enableRotate,
            object: orbitControlsRef.current.object?.type,
            target: orbitControlsRef.current.target.toArray()
          }
        });
        window.dispatchEvent(debugEvent);
      }
    };

    window.addEventListener('camera-toggle', handleCameraToggle as EventListener);
    window.addEventListener('camera-debug-request', handleCameraDebug as EventListener);

    // FORZAR OrbitControls SIEMPRE HABILITADO
    if (orbitControlsRef.current) {
      orbitControlsRef.current.enabled = true;
      console.log('✅ CameraControlsManager: OrbitControls forzado como habilitado en inicialización');
    }

    // Despachar el estado inicial
    dispatchCameraState();

    return () => {
      window.removeEventListener('camera-toggle', handleCameraToggle as EventListener);
      window.removeEventListener('camera-debug-request', handleCameraDebug as EventListener);
    };
  }, [orbitControlsRef, controlsReady]); // Dependencias de orbitControlsRef y controlsReady

  // Efecto adicional para asegurar que OrbitControls esté SIEMPRE habilitado y responsivo
  useEffect(() => {
    if (orbitControlsRef.current && controlsReady) {
      let lastInteractionTime = Date.now();
      let isFrozen = false;
      let consecutiveFailures = 0;
      
      // Verificar y forzar habilitación cada 500ms (más frecuente)
      const interval = setInterval(() => {
        const now = Date.now();
        
        try {
          // Verificar si los controles están habilitados
          if (orbitControlsRef.current && !orbitControlsRef.current.enabled) {
            orbitControlsRef.current.enabled = true;
            console.log('✅ CameraControlsManager: OrbitControls re-habilitado por verificación periódica');
            consecutiveFailures = 0;
          }
          
          // Detectar si los controles están "congelados" (sin interacción por más de 3 segundos)
          if (now - lastInteractionTime > 3000) {
            // Intentar "descongelar" los controles
            if (orbitControlsRef.current) {
              orbitControlsRef.current.update();
              orbitControlsRef.current.enabled = true;
              
              if (!isFrozen) {
                console.log('🔄 CameraControlsManager: OrbitControls actualizados para prevenir congelamiento');
                isFrozen = true;
              }
              consecutiveFailures = 0;
            }
          }
        } catch (error) {
          consecutiveFailures++;
          console.warn('⚠️ CameraControlsManager: Error al actualizar OrbitControls:', error, { consecutiveFailures });
          
          // Si hay muchos errores consecutivos, intentar reset completo
          if (consecutiveFailures > 3 && orbitControlsRef.current) {
            try {
              console.log('🚨 CameraControlsManager: Intentando reset completo de OrbitControls');
              orbitControlsRef.current.reset();
              orbitControlsRef.current.enabled = true;
              orbitControlsRef.current.update();
              consecutiveFailures = 0;
            } catch (resetError) {
              console.error('💥 CameraControlsManager: Error en reset completo:', resetError);
            }
          }
        }
      }, 500); // Verificar cada 500ms

      // Función para detectar interacciones
      const handleInteraction = () => {
        lastInteractionTime = Date.now();
        isFrozen = false;
        consecutiveFailures = 0;
        
        // Forzar actualización inmediata en cada interacción
        try {
          if (orbitControlsRef.current) {
            orbitControlsRef.current.enabled = true;
            orbitControlsRef.current.update();
          }
        } catch (error) {
          console.warn('⚠️ CameraControlsManager: Error en actualización por interacción:', error);
        }
      };

      // Escuchar eventos de interacción más específicos
      const canvas = document.querySelector('canvas');
      if (canvas) {
        canvas.addEventListener('mousedown', handleInteraction);
        canvas.addEventListener('mousemove', handleInteraction);
        canvas.addEventListener('wheel', handleInteraction);
        canvas.addEventListener('touchstart', handleInteraction);
        canvas.addEventListener('touchmove', handleInteraction);
        canvas.addEventListener('contextmenu', (e) => e.preventDefault()); // Prevenir menú contextual
      }

      // También escuchar eventos globales como fallback
      window.addEventListener('mousedown', handleInteraction);
      window.addEventListener('wheel', handleInteraction);

      return () => {
        clearInterval(interval);
        if (canvas) {
          canvas.removeEventListener('mousedown', handleInteraction);
          canvas.removeEventListener('mousemove', handleInteraction);
          canvas.removeEventListener('wheel', handleInteraction);
          canvas.removeEventListener('touchstart', handleInteraction);
          canvas.removeEventListener('touchmove', handleInteraction);
        }
        window.removeEventListener('mousedown', handleInteraction);
        window.removeEventListener('wheel', handleInteraction);
      };
    }
  }, [orbitControlsRef, controlsReady]);

  return null; // Este componente no renderiza nada visual
}
