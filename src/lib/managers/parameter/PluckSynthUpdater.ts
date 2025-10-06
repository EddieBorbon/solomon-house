import * as Tone from 'tone';
import { AudioParams } from '../../factories/SoundSourceFactory';
import { BaseSynthesizerUpdater, ParameterUpdateResult } from './BaseSynthesizerUpdater';
import { ParameterConfigManager } from './ParameterConfigManager';

/**
 * Clase especializada en la actualización de PluckSynth
 * Responsabilidad única: Manejar parámetros específicos de PluckSynth
 */
export class PluckSynthUpdater extends BaseSynthesizerUpdater {
  constructor(configManager?: ParameterConfigManager) {
    super(configManager || new ParameterConfigManager());
  }

  /**
   * Actualiza parámetros específicos del PluckSynth
   */
  public updateSynthesizer(
    synth: Tone.PluckSynth, 
    params: Partial<AudioParams>, 
    result: ParameterUpdateResult
  ): void {
    try {
      console.log('PluckSynthUpdater: Actualizando parámetros', params);
      console.log('PluckSynthUpdater: Sintetizador recibido:', synth);
      console.log('PluckSynthUpdater: Tipo de sintetizador:', synth.constructor.name);

      // Actualizar attackNoise (rango válido: 0.1 - 20)
      if (params.attackNoise !== undefined) {
        console.log('PluckSynthUpdater: Actualizando attackNoise de', synth.attackNoise, 'a', params.attackNoise);
        synth.attackNoise = params.attackNoise;
        console.log('PluckSynthUpdater: attackNoise después del cambio:', synth.attackNoise);
        result.updatedParams.push('attackNoise');
      }
      
      // Actualizar dampening (rango válido: 0 - 7000 Hz)
      if (params.dampening !== undefined) {
        console.log('PluckSynthUpdater: Actualizando dampening de', synth.dampening, 'a', params.dampening);
        synth.dampening = params.dampening;
        console.log('PluckSynthUpdater: dampening después del cambio:', synth.dampening);
        result.updatedParams.push('dampening');
      }
      
      // Actualizar resonance (rango válido: 0 - 1)
      if (params.resonance !== undefined) {
        console.log('PluckSynthUpdater: Actualizando resonance de', synth.resonance, 'a', params.resonance);
        synth.resonance = params.resonance;
        console.log('PluckSynthUpdater: resonance después del cambio:', synth.resonance);
        result.updatedParams.push('resonance');
      }

      // Actualizar release (rango válido: cualquier valor de tiempo)
      if (params.release !== undefined) {
        console.log('PluckSynthUpdater: Actualizando release de', synth.release, 'a', params.release);
        synth.release = params.release;
        console.log('PluckSynthUpdater: release después del cambio:', synth.release);
        result.updatedParams.push('release');
      }

      // Parámetros comunes
      if (params.volume !== undefined) {
        this.updateVolume(synth, params.volume, result);
      }

      // PluckSynth no tiene frecuencia directa, se maneja en triggerAttack
      // if (params.frequency !== undefined) {
      //   // La frecuencia se maneja en triggerAttack, no es una propiedad directa
      // }

    } catch (error) {
      result.errors.push(`PluckSynth params: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Verifica si el sintetizador es compatible con este updater
   */
  public static isCompatible(synth: unknown): synth is Tone.PluckSynth {
    return synth instanceof Tone.PluckSynth;
  }

  /**
   * Retorna los parámetros soportados por este updater
   */
  public getSupportedParams(): string[] {
    return [
      'volume',
      'attackNoise',
      'dampening', 
      'resonance',
      'release'
    ];
  }
}
