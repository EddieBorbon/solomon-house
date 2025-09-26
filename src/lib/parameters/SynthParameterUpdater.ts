import * as Tone from 'tone';
import { 
  SynthesizerType, 
  SynthParameterUpdater, 
  ParameterUpdateResult, 
  ParameterConfig,
  SynthesizerWithOscillator,
  SynthesizerWithVoice0,
  SynthesizerWithHarmonicity,
  SynthesizerWithModulationIndex,
  SynthesizerWithModulation,
  SynthesizerWithVoice1,
  SynthesizerWithVibratoAmount,
  SynthesizerWithVibratoRate,
  SynthesizerWithPitchDecay,
  SynthesizerWithOctaves,
  SynthesizerWithResonance
} from './types';

// Actualizador base con funcionalidad común
export class BaseSynthParameterUpdater implements SynthParameterUpdater {
  protected config: ParameterConfig;

  constructor(config: ParameterConfig) {
    this.config = config;
  }

  update(synth: SynthesizerType, params: Partial<unknown>): ParameterUpdateResult {
    const result: ParameterUpdateResult = {
      success: true,
      updatedParams: [],
      errors: []
    };

    try {
      // Actualizar frecuencia si cambia
      if (params.frequency !== undefined && !(synth instanceof Tone.PolySynth)) {
        this.updateFrequency(synth, params.frequency, result);
      }

      // Actualizar tipo de onda si cambia
      if (params.waveform !== undefined) {
        this.updateWaveform(synth, params.waveform, result);
      }

      // Actualizar harmonicity si cambia
      if (params.harmonicity !== undefined && 'harmonicity' in synth) {
        this.updateHarmonicity(synth, params.harmonicity, result);
      }

      // Actualizar modulationIndex si cambia
      if (params.modulationIndex !== undefined && 'modulationIndex' in synth) {
        this.updateModulationIndex(synth, params.modulationIndex, result);
      }

      // Actualizar forma de onda de modulación si cambia
      if (params.modulationWaveform !== undefined && 'modulation' in synth) {
        this.updateModulationWaveform(synth, params.modulationWaveform, result);
      }

      // Actualizar volumen si cambia
      if (params.volume !== undefined) {
        this.updateVolume(synth, params.volume, result);
      }

    } catch (error) {
      result.success = false;
      result.errors.push(`Base update error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  getSupportedParams(): string[] {
    return ['frequency', 'waveform', 'harmonicity', 'modulationIndex', 'modulationWaveform', 'volume'];
  }

  protected updateFrequency(synth: SynthesizerType, frequency: number, result: ParameterUpdateResult): void {
    try {
      // Asegurar que la frecuencia esté en el rango válido
      const safeFrequency = Math.max(
        this.config.frequencyRange.min, 
        Math.min(this.config.frequencyRange.max, frequency)
      );
      
      // Verificar si el sintetizador tiene la propiedad frequency
      if ('frequency' in synth && synth.frequency) {
        synth.frequency.rampTo(safeFrequency, this.config.rampTime);
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

  protected updateWaveform(synth: SynthesizerType, waveform: string, result: ParameterUpdateResult): void {
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

  protected updateHarmonicity(synth: SynthesizerType, harmonicity: number, result: ParameterUpdateResult): void {
    try {
      if ('harmonicity' in synth) {
        const harmonicityParam = (synth as SynthesizerWithHarmonicity).harmonicity;
        if (typeof harmonicityParam === 'object' && 'rampTo' in harmonicityParam) {
          harmonicityParam.rampTo(harmonicity, this.config.rampTime);
        } else {
          (synth as SynthesizerWithHarmonicity).harmonicity = harmonicity;
        }
        result.updatedParams.push('harmonicity');
      }
    } catch (error) {
      result.errors.push(`Harmonicity update: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  protected updateModulationIndex(synth: SynthesizerType, modulationIndex: number, result: ParameterUpdateResult): void {
    try {
      if ('modulationIndex' in synth) {
        const modulationIndexParam = (synth as SynthesizerWithModulationIndex).modulationIndex;
        if (typeof modulationIndexParam === 'object' && 'rampTo' in modulationIndexParam) {
          modulationIndexParam.rampTo(modulationIndex, this.config.rampTime);
        } else {
          (synth as SynthesizerWithModulationIndex).modulationIndex = modulationIndex;
        }
        result.updatedParams.push('modulationIndex');
      }
    } catch (error) {
      result.errors.push(`ModulationIndex update: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  protected updateModulationWaveform(synth: SynthesizerType, modulationWaveform: string, result: ParameterUpdateResult): void {
    try {
      if ('modulation' in synth) {
        (synth as SynthesizerWithModulation).modulation.type = modulationWaveform;
        result.updatedParams.push('modulationWaveform');
      }
    } catch (error) {
      result.errors.push(`ModulationWaveform update: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  protected updateVolume(synth: SynthesizerType, volume: number, result: ParameterUpdateResult): void {
    try {
      // Convertir volumen lineal a dB
      const dbVolume = this.linearToDb(volume);
      
      // Asegurar que el volumen esté en el rango válido
      const safeDbVolume = Math.max(
        this.config.volumeRange.dbRange.min,
        Math.min(this.config.volumeRange.dbRange.max, dbVolume)
      );
      
      if ('volume' in synth && synth.volume) {
        synth.volume.rampTo(safeDbVolume, this.config.rampTime);
        result.updatedParams.push('volume');
      }
    } catch (error) {
      result.errors.push(`Volume update: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  protected linearToDb(linear: number): number {
    return linear > 0 ? 20 * Math.log10(linear) : -Infinity;
  }
}

// Actualizador específico para PolySynth
export class PolySynthParameterUpdater extends BaseSynthParameterUpdater {
  update(synth: SynthesizerType, params: Partial<unknown>): ParameterUpdateResult {
    const result = super.update(synth, params);

    try {
      if (synth instanceof Tone.PolySynth) {
        // Actualizar polyphony si cambia
        if (params.polyphony !== undefined) {
          synth.maxPolyphony = params.polyphony;
          result.updatedParams.push('polyphony');
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
      }
    } catch (error) {
      result.errors.push(`PolySynth params: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  getSupportedParams(): string[] {
    return [...super.getSupportedParams(), 'polyphony', 'voiceOptions'];
  }
}

// Actualizador específico para PluckSynth
export class PluckSynthParameterUpdater extends BaseSynthParameterUpdater {
  update(synth: SynthesizerType, params: Partial<unknown>): ParameterUpdateResult {
    const result = super.update(synth, params);

    try {
      if (synth instanceof Tone.PluckSynth) {
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
      }
    } catch (error) {
      result.errors.push(`PluckSynth params: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  getSupportedParams(): string[] {
    return [...super.getSupportedParams(), 'attackNoise', 'dampening', 'resonance'];
  }
}

// Actualizador específico para DuoSynth
export class DuoSynthParameterUpdater extends BaseSynthParameterUpdater {
  update(synth: SynthesizerType, params: Partial<unknown>): ParameterUpdateResult {
    const result = super.update(synth, params);

    try {
      if ('voice0' in synth) {
        // Actualizar vibratoAmount
        if (params.vibratoAmount !== undefined && 'vibratoAmount' in synth) {
          (synth as SynthesizerWithVibratoAmount).vibratoAmount.rampTo(params.vibratoAmount, this.config.rampTime);
          result.updatedParams.push('vibratoAmount');
        }
        
        // Actualizar vibratoRate
        if (params.vibratoRate !== undefined && 'vibratoRate' in synth) {
          (synth as SynthesizerWithVibratoRate).vibratoRate.rampTo(params.vibratoRate, this.config.rampTime);
          result.updatedParams.push('vibratoRate');
        }
        
        // Actualizar waveform2 (segunda voz)
        if (params.waveform2 !== undefined && 'voice1' in synth) {
          (synth as SynthesizerWithVoice1).voice1.oscillator.type = params.waveform2;
          result.updatedParams.push('waveform2');
        }
      }
    } catch (error) {
      result.errors.push(`DuoSynth params: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  getSupportedParams(): string[] {
    return [...super.getSupportedParams(), 'vibratoAmount', 'vibratoRate', 'waveform2'];
  }
}

// Actualizador específico para MembraneSynth
export class MembraneSynthParameterUpdater extends BaseSynthParameterUpdater {
  update(synth: SynthesizerType, params: Partial<unknown>): ParameterUpdateResult {
    const result = super.update(synth, params);

    try {
      if ('pitchDecay' in synth) {
        // Actualizar pitchDecay
        if (params.pitchDecay !== undefined) {
          (synth as SynthesizerWithPitchDecay).pitchDecay = params.pitchDecay;
          result.updatedParams.push('pitchDecay');
        }
        
        // Actualizar octaves
        if (params.octaves !== undefined) {
          (synth as SynthesizerWithOctaves).octaves = params.octaves;
          result.updatedParams.push('octaves');
        }
      }
    } catch (error) {
      result.errors.push(`MembraneSynth params: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  getSupportedParams(): string[] {
    return [...super.getSupportedParams(), 'pitchDecay', 'octaves'];
  }
}

// Actualizador específico para MetalSynth
export class MetalSynthParameterUpdater extends BaseSynthParameterUpdater {
  update(synth: SynthesizerType, params: Partial<unknown>): ParameterUpdateResult {
    const result = super.update(synth, params);

    try {
      if ('resonance' in synth) {
        // Actualizar resonance
        if (params.resonance !== undefined) {
          (synth as SynthesizerWithResonance).resonance = params.resonance;
          result.updatedParams.push('resonance');
        }
      }
    } catch (error) {
      result.errors.push(`MetalSynth params: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  getSupportedParams(): string[] {
    return [...super.getSupportedParams(), 'resonance'];
  }
}

// Actualizador específico para NoiseSynth
export class NoiseSynthParameterUpdater extends BaseSynthParameterUpdater {
  update(synth: SynthesizerType, params: Partial<unknown>): ParameterUpdateResult {
    const result = super.update(synth, params);

    try {
      if (synth instanceof Tone.NoiseSynth) {
        // Actualizar noiseType
        if (params.noiseType !== undefined) {
          synth.noiseType = params.noiseType as 'white' | 'pink' | 'brown';
          result.updatedParams.push('noiseType');
        }
      }
    } catch (error) {
      result.errors.push(`NoiseSynth params: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  getSupportedParams(): string[] {
    return [...super.getSupportedParams(), 'noiseType'];
  }
}

// Actualizador específico para Sampler
export class SamplerParameterUpdater extends BaseSynthParameterUpdater {
  update(synth: SynthesizerType, params: Partial<unknown>): ParameterUpdateResult {
    const result = super.update(synth, params);

    try {
      if (synth instanceof Tone.Sampler) {
        // Actualizar attack
        if (params.attack !== undefined) {
          synth.attack = params.attack;
          result.updatedParams.push('attack');
        }
        
        // Actualizar release
        if (params.release !== undefined) {
          synth.release = params.release;
          result.updatedParams.push('release');
        }
      }
    } catch (error) {
      result.errors.push(`Sampler params: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  getSupportedParams(): string[] {
    return [...super.getSupportedParams(), 'attack', 'release'];
  }
}
