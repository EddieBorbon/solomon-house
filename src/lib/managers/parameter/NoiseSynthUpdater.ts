import * as Tone from 'tone';
import { AudioParams } from '../../factories/SoundSourceFactory';
import { BaseSynthesizerUpdater, ParameterUpdateResult } from './BaseSynthesizerUpdater';
import { ParameterConfigManager } from './ParameterConfigManager';

/**
 * Clase especializada en la actualización de NoiseSynth
 * Responsabilidad única: Manejar parámetros específicos de NoiseSynth
 */
export class NoiseSynthUpdater extends BaseSynthesizerUpdater {
  constructor(configManager?: ParameterConfigManager) {
    super(configManager);
  }
  /**
   * Actualiza parámetros específicos del NoiseSynth
   */
  public updateSynthesizer(
    synth: Tone.NoiseSynth,
    params: Partial<AudioParams>,
    result: ParameterUpdateResult
  ): void {
    try {
      console.log('NoiseSynthUpdater: Actualizando parámetros', params);
      console.log('NoiseSynthUpdater: Sintetizador recibido:', synth);
      console.log('NoiseSynthUpdater: Tipo de sintetizador:', synth.constructor.name);

      // Actualizar tipo de ruido
      if (params.noiseType !== undefined) {
        console.log('NoiseSynthUpdater: Actualizando noiseType de', synth.noise.type, 'a', params.noiseType);
        synth.noise.type = params.noiseType;
        console.log('NoiseSynthUpdater: noiseType después del cambio:', synth.noise.type);
        result.updatedParams.push('noiseType');
      }

      // Actualizar parámetros del envelope
      if (params.attack !== undefined) {
        console.log('NoiseSynthUpdater: Actualizando attack de', synth.envelope.attack, 'a', params.attack);
        synth.envelope.attack = params.attack;
        console.log('NoiseSynthUpdater: attack después del cambio:', synth.envelope.attack);
        result.updatedParams.push('attack');
      }

      if (params.decay !== undefined) {
        console.log('NoiseSynthUpdater: Actualizando decay de', synth.envelope.decay, 'a', params.decay);
        synth.envelope.decay = params.decay;
        console.log('NoiseSynthUpdater: decay después del cambio:', synth.envelope.decay);
        result.updatedParams.push('decay');
      }

      if (params.sustain !== undefined) {
        console.log('NoiseSynthUpdater: Actualizando sustain de', synth.envelope.sustain, 'a', params.sustain);
        synth.envelope.sustain = params.sustain;
        console.log('NoiseSynthUpdater: sustain después del cambio:', synth.envelope.sustain);
        result.updatedParams.push('sustain');
      }

      if (params.release !== undefined) {
        console.log('NoiseSynthUpdater: Actualizando release de', synth.envelope.release, 'a', params.release);
        synth.envelope.release = params.release;
        console.log('NoiseSynthUpdater: release después del cambio:', synth.envelope.release);
        result.updatedParams.push('release');
      }

      // Actualizar duración (mapear a envelope)
      if (params.duration !== undefined) {
        console.log('NoiseSynthUpdater: Actualizando duration a', params.duration);
        // Para NoiseSynth, la duración se maneja en triggerAttackRelease
        // No hay una propiedad directa de duración, se controla por el envelope
        result.updatedParams.push('duration');
      }

      // Parámetros comunes
      if (params.volume !== undefined) {
        this.updateVolume(synth, params.volume, result);
      }

      // NoiseSynth no tiene frecuencia, es ruido
      // if (params.frequency !== undefined) {
      //   // NoiseSynth no tiene frecuencia
      // }

    } catch (error) {
      result.errors.push(`NoiseSynth params: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Verifica si el sintetizador es compatible con este updater
   */
  public static isCompatible(synth: unknown): boolean {
    return synth instanceof Tone.NoiseSynth;
  }

  /**
   * Retorna los parámetros soportados por este updater
   */
  public getSupportedParams(): string[] {
    return [
      'volume',
      'noiseType',
      'attack',
      'decay',
      'sustain',
      'release',
      'duration'
    ];
  }
}
