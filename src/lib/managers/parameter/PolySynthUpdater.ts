import * as Tone from 'tone';
import { AudioParams } from '../../factories/SoundSourceFactory';
import { BaseSynthesizerUpdater, ParameterUpdateResult } from './BaseSynthesizerUpdater';
import { ParameterConfigManager } from './ParameterConfigManager';

/**
 * Clase especializada en la actualización de PolySynth
 * Responsabilidad única: Manejar parámetros específicos de PolySynth
 */
export class PolySynthUpdater extends BaseSynthesizerUpdater {
  constructor(configManager?: ParameterConfigManager) {
    super(configManager);
  }

  /**
   * Actualiza parámetros específicos del PolySynth
   */
  public updateSynthesizer(
    synth: Tone.PolySynth, 
    params: Partial<AudioParams>, 
    result: ParameterUpdateResult
  ): void {
    try {
      // Solo loggear parámetros significativos
      const significantParams = Object.keys(params).filter(key => 
        params[key as keyof AudioParams] !== undefined && 
        params[key as keyof AudioParams] !== null
      );
      
      if (significantParams.length > 0) {
        console.log('PolySynthUpdater: Actualizando parámetros:', significantParams);
      }

      // Actualizar polyphony si cambia
      if (params.polyphony !== undefined) {
        synth.maxPolyphony = params.polyphony;
        result.updatedParams.push('polyphony');
      }

      // Actualizar parámetros de las voces usando el método set()
      const voiceOptions: Record<string, unknown> = {};
      let hasVoiceOptions = false;

      // Parámetros del oscilador
      if (params.waveform !== undefined) {
        voiceOptions.oscillator = { type: params.waveform };
        hasVoiceOptions = true;
      }

      // Parámetros de modulación
      if (params.modulationWaveform !== undefined) {
        voiceOptions.modulation = { type: params.modulationWaveform };
        hasVoiceOptions = true;
      }

      // Parámetros de FMSynth
      if (params.harmonicity !== undefined) {
        voiceOptions.harmonicity = params.harmonicity;
        hasVoiceOptions = true;
      }

      if (params.modulationIndex !== undefined) {
        voiceOptions.modulationIndex = params.modulationIndex;
        hasVoiceOptions = true;
      }

      // Parámetros del envelope
      if (params.attack !== undefined || params.decay !== undefined || 
          params.sustain !== undefined || params.release !== undefined) {
        voiceOptions.envelope = {};
        if (params.attack !== undefined) {
          (voiceOptions.envelope as { attack: number }).attack = params.attack;
        }
        if (params.decay !== undefined) {
          (voiceOptions.envelope as { decay: number }).decay = params.decay;
        }
        if (params.sustain !== undefined) {
          (voiceOptions.envelope as { sustain: number }).sustain = params.sustain;
        }
        if (params.release !== undefined) {
          (voiceOptions.envelope as { release: number }).release = params.release;
        }
        hasVoiceOptions = true;
      }

      // Aplicar cambios a todas las voces
      if (hasVoiceOptions) {
        synth.set(voiceOptions);
        result.updatedParams.push('voiceOptions');
      }

      // Actualizar chord si cambia (se maneja en el trigger, no en el synth)
      if (params.chord !== undefined) {
        result.updatedParams.push('chord');
      }

      // Actualizar curve si cambia - incluir en voiceOptions
      if (params.curve !== undefined) {
        if (!voiceOptions.envelope) {
          voiceOptions.envelope = {};
        }
        (voiceOptions.envelope as { curve: Tone.EnvelopeCurve }).curve = params.curve as Tone.EnvelopeCurve;
        hasVoiceOptions = true;
      }

      // Parámetros comunes
      if (params.volume !== undefined) {
        this.updateVolume(synth, params.volume, result);
      }

      // Manejo especial para frecuencia en PolySynth
      if (params.frequency !== undefined) {
        result.updatedParams.push('frequency');
        // La frecuencia se maneja en el nivel superior para regenerar el acorde
        console.log('PolySynthUpdater: Frecuencia actualizada, se requiere regeneración de acorde');
      }

    } catch (error) {
      result.errors.push(`PolySynth params: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Verifica si el sintetizador es compatible con este updater
   */
  public static isCompatible(synth: unknown): synth is Tone.PolySynth {
    return synth instanceof Tone.PolySynth;
  }

  /**
   * Retorna los parámetros soportados por este updater
   */
  public getSupportedParams(): string[] {
    return [
      'volume',
      'polyphony',
      'waveform',
      'modulationWaveform',
      'harmonicity',
      'modulationIndex',
      'attack',
      'decay',
      'sustain',
      'release',
      'chord',
      'curve'
    ];
  }
}
