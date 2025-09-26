import { AudioParams } from '../../factories/SoundSourceFactory';
import { BaseSynthesizerUpdater, ParameterUpdateResult } from './BaseSynthesizerUpdater';

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
      // Verificación de seguridad inicial
      if (!synth || typeof synth !== 'object') {
        result.errors.push('DuoSynth: Invalid synthesizer object');
        return;
      }

      const typedSynth = synth as Record<string, unknown>;
      
      // Actualizar harmonicity
      if (params.harmonicity !== undefined && 'harmonicity' in typedSynth) {
        const harmonicityParam = typedSynth.harmonicity;
        if (typeof harmonicityParam === 'object' && harmonicityParam !== null && 'rampTo' in harmonicityParam) {
          (harmonicityParam as { rampTo: (value: number, time: number) => void }).rampTo(params.harmonicity, this.configManager.getRampTime());
        } else if (typeof harmonicityParam === 'number') {
          (typedSynth as { harmonicity: number }).harmonicity = params.harmonicity;
        }
        result.updatedParams.push('harmonicity');
      }
      
      // Actualizar vibratoAmount
      if (params.vibratoAmount !== undefined && 'vibratoAmount' in typedSynth) {
        const vibratoAmountParam = typedSynth.vibratoAmount;
        if (typeof vibratoAmountParam === 'object' && vibratoAmountParam !== null && 'rampTo' in vibratoAmountParam) {
          (vibratoAmountParam as { rampTo: (value: number, time: number) => void }).rampTo(params.vibratoAmount, this.configManager.getRampTime());
        }
        result.updatedParams.push('vibratoAmount');
      }
      
      // Actualizar vibratoRate
      if (params.vibratoRate !== undefined && 'vibratoRate' in typedSynth) {
        const vibratoRateParam = typedSynth.vibratoRate;
        if (typeof vibratoRateParam === 'object' && vibratoRateParam !== null && 'rampTo' in vibratoRateParam) {
          (vibratoRateParam as { rampTo: (value: number, time: number) => void }).rampTo(params.vibratoRate, this.configManager.getRampTime());
        }
        result.updatedParams.push('vibratoRate');
      }
      
      // Actualizar waveform2 (segunda voz)
      if (params.waveform2 !== undefined && 'voice1' in typedSynth) {
        const voice1 = typedSynth.voice1 as Record<string, unknown>;
        if (voice1 && typeof voice1 === 'object' && 'oscillator' in voice1) {
          const oscillator = voice1.oscillator as Record<string, unknown>;
          if (oscillator && typeof oscillator === 'object') {
            oscillator.type = params.waveform2;
          }
        }
        result.updatedParams.push('waveform2');
      }

      // Actualizar waveform (primera voz)
      if (params.waveform !== undefined && 'voice0' in typedSynth) {
        const voice0 = typedSynth.voice0 as Record<string, unknown>;
        if (voice0 && typeof voice0 === 'object' && 'oscillator' in voice0) {
          const oscillator = voice0.oscillator as Record<string, unknown>;
          if (oscillator && typeof oscillator === 'object') {
            oscillator.type = params.waveform;
          }
        }
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
    if (!synth || typeof synth !== 'object') {
      return false;
    }
    
    const typedSynth = synth as Record<string, unknown>;
    return 'voice0' in typedSynth && 'voice1' in typedSynth;
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
