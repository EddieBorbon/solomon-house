import { AudioParams } from '../../factories/SoundSourceFactory';
import { BaseSynthesizerUpdater, ParameterUpdateResult } from './BaseSynthesizerUpdater';

// Type definitions for MembraneSynth properties
interface SynthesizerWithPitchDecay {
  pitchDecay: number;
}

interface SynthesizerWithOctaves {
  octaves: number;
}

interface SynthesizerWithAmpAttack {
  ampAttack: number;
}

interface SynthesizerWithAmpDecay {
  ampDecay: number;
}

interface SynthesizerWithAmpSustain {
  ampSustain: number;
}

interface SynthesizerWithAmpRelease {
  ampRelease: number;
}

/**
 * Clase especializada en la actualización de MembraneSynth
 * Responsabilidad única: Manejar parámetros específicos de MembraneSynth
 */
export class MembraneSynthUpdater extends BaseSynthesizerUpdater {
  /**
   * Actualiza parámetros específicos del MembraneSynth
   */
  public updateSynthesizer(
    synth: unknown, // MembraneSynth type
    params: Partial<AudioParams>, 
    result: ParameterUpdateResult
  ): void {
    try {
      // Actualizar pitchDecay
      if (params.pitchDecay !== undefined && 'pitchDecay' in (synth as any)) {
        (synth as SynthesizerWithPitchDecay).pitchDecay = params.pitchDecay;
        result.updatedParams.push('pitchDecay');
      }
      
      // Actualizar octaves
      if (params.octaves !== undefined && 'octaves' in (synth as any)) {
        (synth as SynthesizerWithOctaves).octaves = params.octaves;
        result.updatedParams.push('octaves');
      }
      
      // Actualizar ampAttack
      if (params.ampAttack !== undefined && 'ampAttack' in (synth as any)) {
        (synth as SynthesizerWithAmpAttack).ampAttack = params.ampAttack;
        result.updatedParams.push('ampAttack');
      }
      
      // Actualizar ampDecay
      if (params.ampDecay !== undefined && 'ampDecay' in (synth as any)) {
        (synth as SynthesizerWithAmpDecay).ampDecay = params.ampDecay;
        result.updatedParams.push('ampDecay');
      }
      
      // Actualizar ampSustain
      if (params.ampSustain !== undefined && 'ampSustain' in (synth as any)) {
        (synth as SynthesizerWithAmpSustain).ampSustain = params.ampSustain;
        result.updatedParams.push('ampSustain');
      }
      
      // Actualizar ampRelease
      if (params.ampRelease !== undefined && 'ampRelease' in (synth as any)) {
        (synth as SynthesizerWithAmpRelease).ampRelease = params.ampRelease;
        result.updatedParams.push('ampRelease');
      }

      // Actualizar frecuencia usando el método base
      if (params.frequency !== undefined) {
        this.updateFrequency(synth as any, params.frequency, result);
      }

      // Actualizar volumen usando el método base
      if (params.volume !== undefined) {
        this.updateVolume(synth as any, params.volume, result);
      }
    } catch (error) {
      result.errors.push(`MembraneSynth params: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Verifica si el sintetizador es compatible con este updater
   */
  public static isCompatible(synth: unknown): boolean {
    return 'pitchDecay' in (synth as any) && 'octaves' in (synth as any);
  }

  /**
   * Obtiene los parámetros soportados por MembraneSynth
   */
  public static getSupportedParams(): string[] {
    return [
      'pitchDecay',
      'octaves',
      'ampAttack',
      'ampDecay',
      'ampSustain',
      'ampRelease',
      'frequency',
      'volume'
    ];
  }
}
