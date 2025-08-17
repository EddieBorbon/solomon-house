import { useMemo, useEffect, useState, useCallback } from 'react';
import * as Tone from 'tone';
import { useAudioContext } from './useAudioContext';

export type AudioParams = {
  frequency: number;
  waveform: OscillatorType;
  volume: number;
  reverb: number;
  delay: number;
};

export const useObjectAudio = (type: 'cube' | 'sphere', initialParams: AudioParams) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const { isAudioContextStarted, startAudioContext } = useAudioContext();

  // Crear el sintetizador usando useMemo para evitar recreaciones innecesarias
  const synth = useMemo(() => {
    // Crear un sintetizador AM (Amplitude Modulation) para efectos más interesantes
    const newSynth = new Tone.AMSynth({
      oscillator: {
        type: initialParams.waveform,
      },
      envelope: {
        attack: 0.1,
        decay: 0.2,
        sustain: 0.6,
        release: 0.8,
      },
    });

    // Configurar el volumen inicial
    newSynth.volume.value = Tone.gainToDb(initialParams.volume);

    // Crear efectos de reverb y delay
    const reverb = new Tone.Reverb({
      decay: initialParams.reverb * 10,
      wet: initialParams.reverb,
    });

    const delay = new Tone.FeedbackDelay({
      delayTime: initialParams.delay,
      feedback: 0.3,
      wet: initialParams.delay,
    });

    // Conectar la cadena de audio: synth -> delay -> reverb -> salida
    newSynth.chain(delay, reverb, Tone.Destination);

    return { synth: newSynth, reverb, delay };
  }, [type]); // Solo recrear si cambia el tipo

  // Función para iniciar el sonido
  const triggerAttack = useCallback(async (note?: string) => {
    if (!synth.synth) return;
    
    try {
      // Verificar si el AudioContext está iniciado
      if (!isAudioContextStarted) {
        console.log('🎵 Iniciando AudioContext antes de reproducir sonido...');
        await startAudioContext();
      }
      
      const frequency = note ? Tone.Frequency(note).toFrequency() : initialParams.frequency;
      synth.synth.triggerAttack(frequency);
      setIsPlaying(true);
      console.log(`🎵 Sonido iniciado con frecuencia: ${frequency}Hz`);
    } catch (error) {
      console.error('Error al iniciar el sonido:', error);
    }
  }, [synth.synth, isAudioContextStarted, startAudioContext, initialParams.frequency]);

  // Función para detener el sonido
  const triggerRelease = useCallback(() => {
    if (!synth.synth) return;
    
    try {
      synth.synth.triggerRelease();
      setIsPlaying(false);
      console.log('🎵 Sonido detenido');
    } catch (error) {
      console.error('Error al detener el sonido:', error);
    }
  }, [synth.synth]);

  // Función para actualizar los parámetros del sintetizador
  const updateParams = useCallback((newParams: Partial<AudioParams>) => {
    if (!synth.synth) return;

    try {
      // Actualizar frecuencia si cambia
      if (newParams.frequency !== undefined) {
        // Para AMSynth, necesitamos actualizar la frecuencia del oscilador
        synth.synth.oscillator.frequency.value = newParams.frequency;
      }

      // Actualizar tipo de onda si cambia
      if (newParams.waveform !== undefined) {
        synth.synth.oscillator.type = newParams.waveform;
      }

      // Actualizar volumen si cambia
      if (newParams.volume !== undefined) {
        synth.synth.volume.value = Tone.gainToDb(newParams.volume);
      }

      // Actualizar reverb si cambia
      if (newParams.reverb !== undefined) {
        synth.reverb.set({
          decay: newParams.reverb * 10,
          wet: newParams.reverb,
        });
      }

      // Actualizar delay si cambia
      if (newParams.delay !== undefined) {
        synth.delay.set({
          delayTime: newParams.delay,
          wet: newParams.delay,
        });
      }
    } catch (error) {
      console.error('Error al actualizar parámetros:', error);
    }
  }, [synth]);

  // Limpiar recursos cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (synth.synth) {
        synth.synth.dispose();
      }
      if (synth.reverb) {
        synth.reverb.dispose();
      }
      if (synth.delay) {
        synth.delay.dispose();
      }
    };
  }, [synth]);

  return {
    isPlaying,
    triggerAttack,
    triggerRelease,
    updateParams,
  };
};
