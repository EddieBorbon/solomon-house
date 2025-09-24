import * as Tone from 'tone';
import { AudioParams } from '../../factories/SoundSourceFactory';
import { BaseSynthesizerUpdater, ParameterUpdateResult } from './BaseSynthesizerUpdater';

/**
 * Clase especializada en la actualización de PolySynth
 * Responsabilidad única: Manejar parámetros específicos de PolySynth
 */
export class PolySynthUpdater extends BaseSynthesizerUpdater {
  /**
   * Actualiza parámetros específicos del PolySynth
   */
  public updateSynthesizer(
    synth: Tone.PolySynth, 
    params: Partial<AudioParams>, 
    result: ParameterUpdateResult
  ): void {
    try {
      // Actualizar polyphony si cambia
      if (params.polyphony !== undefined) {
        synth.maxPolyphony = params.polyphony;
        result.updatedParams.push('polyphony');
      }
      
      // Actualizar frecuencia si cambia
      if (params.frequency !== undefined) {
        (synth as any).frequency.value = params.frequency;
        result.updatedParams.push('frequency');
      }
      
      // Actualizar waveform si cambia
      if (params.waveform !== undefined) {
        (synth as any).oscillator.type = params.waveform;
        result.updatedParams.push('waveform');
      }
      
      // Actualizar chord si cambia
      if (params.chord !== undefined) {
        // El PolySynth maneja acordes automáticamente
        result.updatedParams.push('chord');
      }
      
      // Actualizar curve si cambia
      if (params.curve !== undefined) {
        (synth as any).envelope.curve = params.curve;
        result.updatedParams.push('curve');
      }
      
      // Actualizar parámetros de las voces FMSynth
      if (params.harmonicity !== undefined || params.modulationIndex !== undefined || 
          params.attack !== undefined || params.release !== undefined) {
        const voiceOptions: Record<string, unknown> = {};
        
        if (params.harmonicity !== undefined) {
          voiceOptions.harmonicity = params.harmonicity;
        }
        if (params.modulationIndex !== undefined) {
          voiceOptions.modulationIndex = params.modulationIndex;
        }
        if (params.attack !== undefined || params.release !== undefined) {
          voiceOptions.envelope = {};
          if (params.attack !== undefined) {
            (voiceOptions.envelope as { attack: number }).attack = params.attack;
          }
          if (params.release !== undefined) {
            (voiceOptions.envelope as { release: number }).release = params.release;
          }
        }
        
        synth.set(voiceOptions);
        result.updatedParams.push('voiceOptions');
      }
    } catch (error) {
      result.errors.push(`PolySynth params: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Verifica si el sintetizador es compatible con este updater
   */
  public static isCompatible(synth: any): synth is Tone.PolySynth {
    return synth instanceof Tone.PolySynth;
  }

  /**
   * Obtiene los parámetros soportados por PolySynth
   */
  public static getSupportedParams(): string[] {
    return [
      'polyphony',
      'frequency',
      'waveform',
      'chord',
      'curve',
      'harmonicity',
      'modulationIndex',
      'attack',
      'release'
    ];
  }
}
