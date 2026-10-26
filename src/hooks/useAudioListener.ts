import { useEffect } from 'react';
import * as Tone from 'tone';

export function useAudioListener() {
  // Configurar la espacialización 3D inicial de Tone.js
  
  useEffect(() => {
    // Solo ejecutar en el cliente (navegador), no durante SSR
    if (typeof window === 'undefined' || !Tone || !Tone.getContext()) {
      return;
    }

    try {
      // Verificar que el contexto de audio esté funcionando
      if (Tone.getContext().state !== 'running') {
        return;
      }

      // Configurar el listener global de Tone.js para espacialización 3D
      
      // Configurar parámetros del listener global (solo propiedades disponibles)
      Tone.getListener().set({
        forwardX: 0,
        forwardY: 0,
        forwardZ: -1, // Mirar hacia adelante por defecto
        upX: 0,
        upY: 1,
        upZ: 0, // Vector "arriba" en Y positivo
      });

      console.log('Audio Context Info:', {
        contextState: Tone.getContext().state,
        sampleRate: Tone.getContext().sampleRate,
        latencyHint: Tone.getContext().latencyHint,
        listenerConfig: {
          forward: [Tone.getListener().forwardX.value, Tone.getListener().forwardY.value, Tone.getListener().forwardZ.value],
          up: [Tone.getListener().upX.value, Tone.getListener().upY.value, Tone.getListener().upZ.value]
        }
      });

    } catch {
    }
  }, []);

  return null;
}
