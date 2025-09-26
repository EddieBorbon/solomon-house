import { AudioParams } from '../../factories/SoundSourceFactory';
import { BaseSynthesizerUpdater, ParameterUpdateResult } from './BaseSynthesizerUpdater';

// Type definitions for DuoSynth properties
interface SynthesizerWithVoice0 {
  voice0: {
    oscillator: {
      type: string;
    };
  };
}

interface SynthesizerWithVoice1 {
  voice1: {
    oscillator: {
      type: string;
    };
  };
}

interface SynthesizerWithHarmonicity {
  harmonicity: {
    rampTo: (value: number, time: number) => void;
  } | number;
}

interface SynthesizerWithVibratoAmount {
  vibratoAmount: {
    rampTo: (value: number, time: number) => void;
  };
}

interface SynthesizerWithVibratoRate {
  vibratoRate: {
    rampTo: (value: number, time: number) => void;
  };
}

/**
 * Clase especializada en la actualización de DuoSynth
 * Responsabilidad única: Manejar parámetros específicos de DuoSynth
 */
export class DuoSynthUpdater extends BaseSynthesizerUpdater {
  /**
   * Actualiza parámetros específicos del DuoSynth
   */
  public updateSynthesizer(
    synth: unknown, // DuoSynth type
    params: Partial<AudioParams>, 
    result: ParameterUpdateResult
  ): void {
    try {
      // Actualizar harmonicity
      if (params.harmonicity !== undefined && 'harmonicity' in synth) {
        const harmonicityParam = (synth as SynthesizerWithHarmonicity).harmonicity;
        if (typeof harmonicityParam === 'object' && 'rampTo' in harmonicityParam) {
          harmonicityParam.rampTo(params.harmonicity, this.configManager.getRampTime());
        } else {
          (synth as { harmonicity: number }).harmonicity = params.harmonicity;
        }
        result.updatedParams.push('harmonicity');
      }
      
      // Actualizar vibratoAmount
      if (params.vibratoAmount !== undefined && 'vibratoAmount' in synth) {
        (synth as SynthesizerWithVibratoAmount).vibratoAmount.rampTo(params.vibratoAmount, this.configManager.getRampTime());
        result.updatedParams.push('vibratoAmount');
      }
      
      // Actualizar vibratoRate
      if (params.vibratoRate !== undefined && 'vibratoRate' in synth) {
        (synth as SynthesizerWithVibratoRate).vibratoRate.rampTo(params.vibratoRate, this.configManager.getRampTime());
        result.updatedParams.push('vibratoRate');
      }
      
      // Actualizar waveform2 (segunda voz)
      if (params.waveform2 !== undefined && 'voice1' in synth) {
        (synth as SynthesizerWithVoice1).voice1.oscillator.type = params.waveform2;
        result.updatedParams.push('waveform2');
      }

      // Actualizar waveform (primera voz)
      if (params.waveform !== undefined && 'voice0' in synth) {
        (synth as SynthesizerWithVoice0).voice0.oscillator.type = params.waveform;
        result.updatedParams.push('waveform');
      }
    } catch (error) {
      result.errors.push(`DuoSynth params: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Verifica si el sintetizador es compatible con este updater
   */
  public static isCompatible(synth: unknown): boolean {
    return 'voice0' in synth && 'voice1' in synth;
  }

  /**
   * Obtiene los parámetros soportados por DuoSynth
   */
  public static getSupportedParams(): string[] {
    return [
      'harmonicity',
      'vibratoAmount',
      'vibratoRate',
      'waveform',
      'waveform2'
    ];
  }
}
