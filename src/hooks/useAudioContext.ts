import { useEffect, useState, useCallback } from 'react';
import * as Tone from 'tone';

export const useAudioContext = () => {
  const [isAudioContextStarted, setIsAudioContextStarted] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  // Función para inicializar el contexto de audio
  const startAudioContext = useCallback(async () => {
    if (isAudioContextStarted || isInitializing) return;

    setIsInitializing(true);
    
    try {
      // Verificar si el contexto ya está iniciado
      if (Tone.context.state === 'running') {
        setIsAudioContextStarted(true);
        setIsInitializing(false);
        return;
      }

      // Iniciar el contexto de audio
      await Tone.start();
      
      // Configurar el contexto para mejor rendimiento
      Tone.context.latencyHint = 'interactive';
      
      setIsAudioContextStarted(true);
      console.log('🎵 AudioContext iniciado correctamente');
    } catch (error) {
      console.error('❌ Error al iniciar AudioContext:', error);
    } finally {
      setIsInitializing(false);
    }
  }, [isAudioContextStarted, isInitializing]);

  // Función para verificar el estado del contexto
  const checkAudioContextState = useCallback(() => {
    const state = Tone.context.state;
    console.log(`🎵 Estado del AudioContext: ${state}`);
    return state;
  }, []);

  // Función para pausar el contexto (útil para ahorrar batería)
  const suspendAudioContext = useCallback(async () => {
    try {
      // Solo actualizamos el estado interno ya que suspend/resume no están disponibles
      setIsAudioContextStarted(false);
      console.log('🎵 AudioContext marcado como inactivo');
    } catch (error) {
      console.error('❌ Error al pausar AudioContext:', error);
    }
  }, []);

  // Función para reanudar el contexto
  const resumeAudioContext = useCallback(async () => {
    try {
      // Reutilizamos startAudioContext para reanudar
      await startAudioContext();
      console.log('🎵 AudioContext reanudado');
    } catch (error) {
      console.error('❌ Error al reanudar AudioContext:', error);
    }
  }, [startAudioContext]);

  // Efecto para manejar cambios en el estado del contexto
  useEffect(() => {
    const handleStateChange = () => {
      const state = Tone.context.state;
      setIsAudioContextStarted(state === 'running');
      console.log(`🎵 AudioContext cambió a estado: ${state}`);
    };

    // Suscribirse a cambios de estado
    Tone.context.on('statechange', handleStateChange);

    // Verificar estado inicial
    handleStateChange();

    return () => {
      Tone.context.off('statechange', handleStateChange);
    };
  }, []);

  return {
    isAudioContextStarted,
    isInitializing,
    startAudioContext,
    checkAudioContextState,
    suspendAudioContext,
    resumeAudioContext,
  };
};
