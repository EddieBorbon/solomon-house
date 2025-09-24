import * as Tone from 'tone';
import { AudioParams } from '../../factories/SoundSourceFactory';
import { BaseSynthesizerUpdater, ParameterUpdateResult } from './BaseSynthesizerUpdater';

/**
 * Clase especializada en la actualización de PluckSynth
 * Responsabilidad única: Manejar parámetros específicos de PluckSynth
 */
export class PluckSynthUpdater extends BaseSynthesizerUpdater {
  /**
   * Actualiza parámetros específicos del PluckSynth
   */
  public updateSynthesizer(
    synth: Tone.PluckSynth, 
    params: Partial<AudioParams>, 
    result: ParameterUpdateResult
  ): void {
    try {
      // Actualizar attackNoise
      if (params.attackNoise !== undefined) {
        synth.attackNoise = params.attackNoise;
        result.updatedParams.push('attackNoise');
      }
      
      // Actualizar dampening
      if (params.dampening !== undefined) {
        synth.dampening = params.dampening;
        result.updatedParams.push('dampening');
      }
      
      // Actualizar resonance
      if (params.resonance !== undefined) {
        synth.resonance = params.resonance;
        result.updatedParams.push('resonance');
      }

      // Actualizar frecuencia usando el método específico de PluckSynth
      if (params.frequency !== undefined) {
        const safeFrequency = this.configManager.clampFrequency(params.frequency);
        synth.toFrequency(safeFrequency);
        result.updatedParams.push('frequency');
      }
    } catch (error) {
      result.errors.push(`PluckSynth params: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Verifica si el sintetizador es compatible con este updater
   */
  public static isCompatible(synth: any): synth is Tone.PluckSynth {
    return synth instanceof Tone.PluckSynth;
  }

  /**
   * Obtiene los parámetros soportados por PluckSynth
   */
  public static getSupportedParams(): string[] {
    return [
      'attackNoise',
      'dampening',
      'resonance',
      'frequency'
    ];
  }
}
