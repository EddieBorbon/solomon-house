'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useWorldStore } from '../state/useWorldStore';
import { type AudioParams } from '../lib/factories/SoundSourceFactory';

interface UseAutoTriggerParams {
  objectId: string;
  audioParams: AudioParams;
  enabled?: boolean; // Permitir desactivar desde fuera si es necesario
  onTrigger?: () => void; // Callback cuando se activa el trigger
}

/**
 * Hook para manejar la auto-activación de objetos sonoros
 * Soporta tres modos:
 * - 'fixed': Sonido cada X segundos
 * - 'random': Sonido aleatorio entre min y max segundos
 * - 'pattern': Patrón rítmico basado en un array de tiempos
 */
export function useAutoTrigger({ 
  objectId, 
  audioParams, 
  enabled = true,
  onTrigger
}: UseAutoTriggerParams) {
  const { triggerObjectAttackRelease } = useWorldStore();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const patternIndexRef = useRef<number>(0);
  const patternStartTimeRef = useRef<number>(0);

  // Limpiar timeout cuando el componente se desmonte o cambien los parámetros
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  // Calcular el próximo tiempo de activación según el modo
  const getNextTriggerTime = useCallback((): number => {
    const { autoTriggerMode, autoTriggerInterval, autoTriggerMin, autoTriggerMax, autoTriggerPattern } = audioParams;

    switch (autoTriggerMode) {
      case 'fixed':
        return (autoTriggerInterval || 1.0) * 1000; // Convertir a milisegundos

      case 'random':
        const min = (autoTriggerMin || 0.5) * 1000;
        const max = (autoTriggerMax || 2.0) * 1000;
        return Math.random() * (max - min) + min;

      case 'pattern':
        if (!autoTriggerPattern || autoTriggerPattern.length === 0) {
          return 1000; // Fallback
        }
        
        // Verificar si debemos detener (patrón sin loop completado)
        if (!audioParams.autoTriggerPatternLoop && patternIndexRef.current >= autoTriggerPattern.length) {
          return -1; // Indicador para detener
        }
        
        // Obtener el tiempo del patrón actual usando módulo para loop
        const currentIndex = patternIndexRef.current % autoTriggerPattern.length;
        const patternTime = autoTriggerPattern[currentIndex] * 1000;
        
        // Avanzar al siguiente índice
        patternIndexRef.current = patternIndexRef.current + 1;
        
        return patternTime;

      default:
        return 1000; // Fallback
    }
  }, [audioParams]);

  // Programar la próxima activación
  const scheduleNextTrigger = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const delay = getNextTriggerTime();
    
    // Si delay es negativo, significa que debemos detener (patrón sin loop completado)
    if (delay < 0) {
      timeoutRef.current = null;
      return;
    }
    
    timeoutRef.current = setTimeout(() => {
      triggerObjectAttackRelease(objectId);
      // Activar callback si existe (para animaciones)
      if (onTrigger) {
        onTrigger();
      }
      scheduleNextTrigger(); // Programar la siguiente activación
    }, delay);
  }, [objectId, getNextTriggerTime, triggerObjectAttackRelease, onTrigger]);

  // Efecto principal que controla la auto-activación
  useEffect(() => {
    // Solo activar si autoTrigger está habilitado y enabled es true
    if (!audioParams.autoTrigger || !enabled) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    // Reiniciar el patrón si está en modo pattern
    if (audioParams.autoTriggerMode === 'pattern') {
      patternIndexRef.current = 0;
      patternStartTimeRef.current = Date.now();
    }

    // Programar la primera activación
    scheduleNextTrigger();

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [
    audioParams.autoTrigger, 
    audioParams.autoTriggerMode,
    audioParams.autoTriggerInterval,
    audioParams.autoTriggerMin,
    audioParams.autoTriggerMax,
    audioParams.autoTriggerPattern,
    audioParams.autoTriggerPatternLoop,
    enabled,
    scheduleNextTrigger
  ]);

  // No retornar nada para mantener compatibilidad con componentes existentes
  // El callback onTrigger se ejecuta automáticamente cuando se dispara el trigger
}

