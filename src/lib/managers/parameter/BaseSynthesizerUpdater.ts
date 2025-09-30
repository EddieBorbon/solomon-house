import * as Tone from 'tone';
import { AudioParams } from '../../factories/SoundSourceFactory';
import { ParameterConfigManager } from './ParameterConfigManager';

// Union type for all possible synthesizer types
type SynthesizerType = Tone.Synth | Tone.FMSynth | Tone.AMSynth | Tone.DuoSynth | Tone.MonoSynth | Tone.MetalSynth | Tone.NoiseSynth | Tone.PluckSynth | Tone.MembraneSynth | Tone.PolySynth | Tone.Sampler;

// Type definitions for synthesizer properties
interface SynthesizerWithOscillator {
  oscillator: {
    type: string;
  };
}

interface SynthesizerWithVoice0 {
  voice0: {
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

interface SynthesizerWithModulationIndex {
  modulationIndex: {
    rampTo: (value: number, time: number) => void;
  } | number;
}

interface SynthesizerWithModulation {
  modulation: {
    type: string;
  };
}

// interface _SynthesizerWithVoice1 {
//   voice1: {
//     oscillator: {
//       type: string;
//     };
//   };
// }

// interface _SynthesizerWithEnvelope {
//   envelope: {
//     attack: number;
//     decay: number;
//     sustain: number;
//     release: number;
//     curve?: string;
//   };
// }

// interface _SynthesizerWithFilterEnvelope {
//   filterEnvelope: {
//     attack: number;
//     decay: number;
//     sustain: number;
//     release: number;
//     baseFrequency: number;
//     octaves: number;
//   };
// }

// interface _SynthesizerWithFilter {
//   filter: {
//     Q: {
//       value: number;
//     };
//   };
// }

// interface _SynthesizerWithVibratoAmount {
//   vibratoAmount: {
//     rampTo: (value: number, time: number) => void;
//   };
// }

// interface _SynthesizerWithVibratoRate {
//   vibratoRate: {
//     rampTo: (value: number, time: number) => void;
//   };
// }

// interface _SynthesizerWithPitchDecay {
//   pitchDecay: number;
// }

// interface _SynthesizerWithOctaves {
//   octaves: number;
// }

// interface _SynthesizerWithResonance {
//   resonance: number;
// }

export interface ParameterUpdateResult {
  success: boolean;
  updatedParams: string[];
  errors: string[];
}

/**
 * Clase base para actualización de sintetizadores
 * Responsabilidad única: Manejar operaciones comunes de todos los sintetizadores
 */
export abstract class BaseSynthesizerUpdater {
  protected configManager?: ParameterConfigManager;

  constructor(configManager?: ParameterConfigManager) {
    this.configManager = configManager;
  }

  /**
   * Actualiza la frecuencia de un sintetizador
   */
  protected updateFrequency(
    synth: SynthesizerType, 
    frequency: number, 
    result: ParameterUpdateResult
  ): void {
    try {
      // Asegurar que la frecuencia esté en el rango válido
      const safeFrequency = this.configManager?.clampFrequency(frequency) ?? frequency;
      
      // Verificar si el sintetizador tiene la propiedad frequency
      if ('frequency' in synth && synth.frequency) {
        synth.frequency.rampTo(safeFrequency, this.configManager?.getRampTime() ?? 0);
        result.updatedParams.push('frequency');
      } else if (synth instanceof Tone.PluckSynth) {
        // Para PluckSynth, usar toFrequency
        synth.toFrequency(safeFrequency);
        result.updatedParams.push('frequency');
      }
    } catch (error) {
      result.errors.push(`Frequency update: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Actualiza el tipo de onda de un sintetizador
   */
  protected updateWaveform(
    synth: SynthesizerType, 
    waveform: string, 
    result: ParameterUpdateResult
  ): void {
    try {
      // Manejar según el tipo de sintetizador
      if ('oscillator' in synth) {
        // AMSynth, FMSynth, MembraneSynth o MonoSynth
        (synth as SynthesizerWithOscillator).oscillator.type = waveform;
        result.updatedParams.push('waveform');
      } else if ('voice0' in synth) {
        // DuoSynth
        (synth as SynthesizerWithVoice0).voice0.oscillator.type = waveform;
        result.updatedParams.push('waveform');
      }
    } catch (error) {
      result.errors.push(`Waveform update: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Actualiza la harmonicity de un sintetizador
   */
  protected updateHarmonicity(
    synth: SynthesizerType, 
    harmonicity: number, 
    result: ParameterUpdateResult
  ): void {
    try {
      if ('harmonicity' in synth) {
        const harmonicityParam = (synth as SynthesizerWithHarmonicity).harmonicity;
        if (typeof harmonicityParam === 'object' && 'rampTo' in harmonicityParam) {
          harmonicityParam.rampTo(harmonicity, this.configManager?.getRampTime() ?? 0);
        } else {
          (synth as SynthesizerWithHarmonicity).harmonicity = harmonicity;
        }
        result.updatedParams.push('harmonicity');
      }
    } catch (error) {
      result.errors.push(`Harmonicity update: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Actualiza el modulationIndex de un sintetizador
   */
  protected updateModulationIndex(
    synth: SynthesizerType, 
    modulationIndex: number, 
    result: ParameterUpdateResult
  ): void {
    try {
      if ('modulationIndex' in synth) {
        const modulationIndexParam = (synth as SynthesizerWithModulationIndex).modulationIndex;
        if (typeof modulationIndexParam === 'object' && 'rampTo' in modulationIndexParam) {
          modulationIndexParam.rampTo(modulationIndex, this.configManager?.getRampTime() ?? 0);
        } else {
          (synth as SynthesizerWithModulationIndex).modulationIndex = modulationIndex;
        }
        result.updatedParams.push('modulationIndex');
      }
    } catch (error) {
      result.errors.push(`ModulationIndex update: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Actualiza la forma de onda de modulación
   */
  protected updateModulationWaveform(
    synth: SynthesizerType, 
    modulationWaveform: string, 
    result: ParameterUpdateResult
  ): void {
    try {
      if ('modulation' in synth) {
        (synth as SynthesizerWithModulation).modulation.type = modulationWaveform;
        result.updatedParams.push('modulationWaveform');
      }
    } catch (error) {
      result.errors.push(`ModulationWaveform update: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Actualiza el volumen de un sintetizador
   */
  protected updateVolume(
    synth: SynthesizerType, 
    volume: number, 
    result: ParameterUpdateResult
  ): void {
    try {
      // Clampear el volumen al rango configurado
      const clampedVolume = this.configManager?.clampVolume(volume) ?? volume;

      // Para síntesis AM, el volumen debe controlar tanto la amplitud como el volumen general
      if ('modulation' in synth) {
        // Es un AMSynth - aplicar volumen a la amplitud de la portadora
        const amplitudeValue = clampedVolume;
        synth.oscillator.volume.rampTo(Tone.gainToDb(amplitudeValue), this.configManager?.getRampTime() ?? 0);
      }
      
      // Aplicar volumen general al sintetizador (control de salida)
      // Mapeo directo: 0 = -Infinity, 1.0 = 0dB (volumen completo)
      const dbValue = clampedVolume > 0 ? Tone.gainToDb(clampedVolume) : -Infinity;
      synth.volume.rampTo(dbValue, this.configManager?.getRampTime() ?? 0);
      
      result.updatedParams.push('volume');
    } catch (error) {
      result.errors.push(`Volume update: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Método abstracto que debe ser implementado por cada updater específico
   */
  public abstract updateSynthesizer(
    synth: SynthesizerType, 
    params: Partial<AudioParams>, 
    result: ParameterUpdateResult
  ): void;
}
