import { useEffect } from 'react';
import * as Tone from 'tone';

export function useAudioListener() {
  // Configurar la espacialización 3D inicial de Tone.js
  
  useEffect(() => {
    try {
      // Verificar que el contexto de audio esté funcionando
      if (Tone.context.state !== 'running') {
        console.log('🎧 Esperando que el contexto de audio esté listo...');
        return;
      }

      // Configurar el listener global de Tone.js para espacialización 3D
      console.log('🎧 Configurando espacialización 3D global...');
      
      // Configurar parámetros del listener global (solo propiedades disponibles)
      Tone.Listener.set({
        forwardX: 0,
        forwardY: 0,
        forwardZ: -1, // Mirar hacia adelante por defecto
        upX: 0,
        upY: 1,
        upZ: 0, // Vector "arriba" en Y positivo
      });

      console.log('🎧 Espacialización 3D configurada automáticamente');
      console.log('🎧 Estado del contexto de audio:', {
        contextState: Tone.context.state,
        sampleRate: Tone.context.sampleRate,
        latencyHint: Tone.context.latencyHint,
        listenerConfig: {
          forward: [Tone.Listener.forwardX.value, Tone.Listener.forwardY.value, Tone.Listener.forwardZ.value],
          up: [Tone.Listener.upX.value, Tone.Listener.upY.value, Tone.Listener.upZ.value]
        }
      });

    } catch (error) {
      console.error('❌ Error al configurar espacialización de audio:', error);
    }
  }, []);

  return null;
}
