import { useState, useCallback, useEffect } from 'react';
import { audioManager, AudioParams } from '../lib/AudioManager';

// Importar el tipo personalizado de OscillatorType
type OscillatorType = 'sine' | 'square' | 'triangle' | 'sawtooth';

interface UseObjectAudioParams {
  frequency?: number;
  waveform?: OscillatorType;
  volume?: number;
  reverb?: number;
  delay?: number;
  [key: string]: number | string | undefined;
}

export function useObjectAudio(objectId: string, params: UseObjectAudioParams) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentParams, setCurrentParams] = useState<UseObjectAudioParams>(params);

  // Update current params when params change
  useEffect(() => {
    setCurrentParams(params);
  }, [params]);

  const triggerAttack = useCallback(async () => {
    try {
      if (!audioManager.isContextValid()) {
        await audioManager.startContext();
      }

      // Convert params to AudioParams format
      const audioParams: AudioParams = {
        frequency: params.frequency || 440,
        volume: params.volume || 0.5,
        waveform: params.waveform || 'sine',
        // Add other parameters as needed
      };

      // Create sound source if it doesn't exist
      if (!audioManager.getSoundSourceState(objectId)) {
        audioManager.createSoundSource(
          objectId,
          'cube', // Default type, could be made configurable
          audioParams,
          [0, 0, 0] // Default position, could be made configurable
        );
      }

      // Start the sound
      audioManager.startSound(objectId, audioParams);
      setIsPlaying(true);

      // Set up auto-stop after a reasonable duration
      setTimeout(() => {
        setIsPlaying(false);
      }, 2000); // 2 seconds default duration

    } catch {
    }
  }, [objectId, params]);

  const triggerRelease = useCallback(() => {
    try {
      audioManager.stopSound(objectId);
      setIsPlaying(false);
    } catch {
    }
  }, [objectId]);

  const updateParams = useCallback((newParams: UseObjectAudioParams) => {
    try {
      setCurrentParams(newParams);
      
      // Convert to AudioParams format
      const audioParams: Partial<AudioParams> = {
        frequency: newParams.frequency,
        volume: newParams.volume,
        waveform: newParams.waveform,
      };

      // Update the sound source parameters
      audioManager.updateSoundParams(objectId, audioParams);
    } catch {
    }
  }, [objectId]);

  const startContinuousSound = useCallback(async () => {
    try {
      if (!audioManager.isContextValid()) {
        await audioManager.startContext();
      }

      // Create sound source if it doesn't exist
      if (!audioManager.getSoundSourceState(objectId)) {
        const audioParams: AudioParams = {
          frequency: params.frequency || 440,
          volume: params.volume || 0.5,
          waveform: params.waveform || 'sine',
        };

        audioManager.createSoundSource(
          objectId,
          'cube',
          audioParams,
          [0, 0, 0]
        );
      }

      // Start continuous sound
      const audioParams: AudioParams = {
        frequency: params.frequency || 440,
        volume: params.volume || 0.5,
        waveform: params.waveform || 'sine',
      };

      audioManager.startContinuousSound(objectId, audioParams);
      setIsPlaying(true);
    } catch {
    }
  }, [objectId, params]);

  const stopContinuousSound = useCallback(() => {
    try {
      audioManager.stopSound(objectId);
      setIsPlaying(false);
    } catch {
    }
  }, [objectId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        audioManager.removeSoundSource(objectId);
      } catch {
      }
    };
  }, [objectId]);

  return {
    isPlaying,
    triggerAttack,
    triggerRelease,
    updateParams,
    startContinuousSound,
    stopContinuousSound,
    currentParams
  };
}
