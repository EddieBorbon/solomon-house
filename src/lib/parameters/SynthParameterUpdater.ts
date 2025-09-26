import * as Tone from 'tone';
import { 
  SynthesizerType, 
  SynthParameterUpdater, 
  ParameterUpdateResult, 
  ParameterConfig
} from './types';

// Tipo flexible para parámetros de sintetizador
type SynthParams = Record<string, unknown>;

// Actualizador base con funcionalidad común
export class BaseSynthParameterUpdater implements SynthParameterUpdater {
  protected config: ParameterConfig;

  constructor(config: ParameterConfig) {
    this.config = config;
  }

  update(synth: SynthesizerType, params: Partial<SynthParams>): ParameterUpdateResult {
    const result: ParameterUpdateResult = {
      success: true,
      updatedParams: [],
      errors: []
    };

    try {
      // Actualizar frecuencia si cambia
      if (params.frequency !== undefined && !(synth instanceof Tone.PolySynth)) {
        this.updateFrequency(synth, params.frequency as number, result);
      }

      // Actualizar tipo de onda si cambia
      if (params.waveform !== undefined) {
        this.updateWaveform(synth, params.waveform as string, result);
      }

      // Actualizar harmonicity si cambia
      if (params.harmonicity !== undefined && 'harmonicity' in synth) {
        this.updateHarmonicity(synth, params.harmonicity as number, result);
      }

      // Actualizar modulationIndex si cambia
      if (params.modulationIndex !== undefined && 'modulationIndex' in synth) {
        this.updateModulationIndex(synth, params.modulationIndex as number, result);
      }

      // Actualizar forma de onda de modulación si cambia
      if (params.modulationWaveform !== undefined && 'modulation' in synth) {
        this.updateModulationWaveform(synth, params.modulationWaveform as string, result);
      }

      // Actualizar volumen si cambia
      if (params.volume !== undefined) {
        this.updateVolume(synth, params.volume as number, result);
      }

    } catch (error) {
      result.success = false;
      result.errors.push(`Base update error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  // Implementar método faltante de la interfaz
  updateParameter(synth: SynthesizerType, paramName: string, value: unknown): boolean {
    const params: Partial<SynthParams> = { [paramName]: value };
    const result = this.update(synth, params);
    return result.success;
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
        const freqParam = synth.frequency as { rampTo?: (value: number, time: number) => void };
        if (freqParam.rampTo) {
          freqParam.rampTo(safeFrequency, 0.1); // Usar tiempo fijo por ahora
        }
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
        const oscillator = (synth as Record<string, unknown>).oscillator as Record<string, unknown>;
        if (oscillator && typeof oscillator === 'object') {
          oscillator.type = waveform;
        }
        result.updatedParams.push('waveform');
      } else if ('voice0' in synth) {
        // DuoSynth
        const voice0 = (synth as Record<string, unknown>).voice0 as Record<string, unknown>;
        if (voice0 && typeof voice0 === 'object' && 'oscillator' in voice0) {
          const oscillator = voice0.oscillator as Record<string, unknown>;
          if (oscillator && typeof oscillator === 'object') {
            oscillator.type = waveform;
          }
        }
        result.updatedParams.push('waveform');
      }
    } catch (error) {
      result.errors.push(`Waveform update: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  protected updateHarmonicity(synth: SynthesizerType, harmonicity: number, result: ParameterUpdateResult): void {
    try {
      if ('harmonicity' in synth) {
        const harmonicityParam = (synth as Record<string, unknown>).harmonicity;
        if (typeof harmonicityParam === 'object' && harmonicityParam !== null && 'rampTo' in harmonicityParam) {
          (harmonicityParam as { rampTo: (value: number, time: number) => void }).rampTo(harmonicity, 0.1);
        } else {
          (synth as Record<string, unknown>).harmonicity = harmonicity;
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
        const modulationIndexParam = (synth as Record<string, unknown>).modulationIndex;
        if (typeof modulationIndexParam === 'object' && modulationIndexParam !== null && 'rampTo' in modulationIndexParam) {
          (modulationIndexParam as { rampTo: (value: number, time: number) => void }).rampTo(modulationIndex, 0.1);
        } else {
          (synth as Record<string, unknown>).modulationIndex = modulationIndex;
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
        const modulation = (synth as Record<string, unknown>).modulation as Record<string, unknown>;
        if (modulation && typeof modulation === 'object') {
          modulation.type = modulationWaveform;
        }
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
        this.config.volumeRange.min,
        Math.min(this.config.volumeRange.max, dbVolume)
      );
      
      if ('volume' in synth && synth.volume) {
        const volumeParam = synth.volume as { rampTo?: (value: number, time: number) => void };
        if (volumeParam.rampTo) {
          volumeParam.rampTo(safeDbVolume, 0.1);
        }
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
  update(synth: SynthesizerType, params: Partial<SynthParams>): ParameterUpdateResult {
    const result = super.update(synth, params);

    try {
      if (synth instanceof Tone.PolySynth) {
        // Actualizar polyphony si cambia
        if (params.polyphony !== undefined) {
          synth.maxPolyphony = params.polyphony as number;
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
              (voiceOptions.envelope as { attack: number }).attack = params.attack as number;
            }
            if (params.release !== undefined) {
              (voiceOptions.envelope as { release: number }).release = params.release as number;
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
  update(synth: SynthesizerType, params: Partial<SynthParams>): ParameterUpdateResult {
    const result = super.update(synth, params);

    try {
      if (synth instanceof Tone.PluckSynth) {
        // Actualizar attackNoise
        if (params.attackNoise !== undefined) {
          synth.attackNoise = params.attackNoise as number;
          result.updatedParams.push('attackNoise');
        }
        
        // Actualizar dampening
        if (params.dampening !== undefined) {
          synth.dampening = params.dampening as number;
          result.updatedParams.push('dampening');
        }
        
        // Actualizar resonance
        if (params.resonance !== undefined) {
          synth.resonance = params.resonance as number;
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
  update(synth: SynthesizerType, params: Partial<SynthParams>): ParameterUpdateResult {
    const result = super.update(synth, params);

    try {
      if ('voice0' in synth) {
        // Actualizar vibratoAmount
        if (params.vibratoAmount !== undefined && 'vibratoAmount' in synth) {
          const vibratoAmountParam = (synth as Record<string, unknown>).vibratoAmount as { rampTo?: (value: number, time: number) => void };
          if (vibratoAmountParam.rampTo) {
            vibratoAmountParam.rampTo(params.vibratoAmount as number, 0.1);
          }
          result.updatedParams.push('vibratoAmount');
        }
        
        // Actualizar vibratoRate
        if (params.vibratoRate !== undefined && 'vibratoRate' in synth) {
          const vibratoRateParam = (synth as Record<string, unknown>).vibratoRate as { rampTo?: (value: number, time: number) => void };
          if (vibratoRateParam.rampTo) {
            vibratoRateParam.rampTo(params.vibratoRate as number, 0.1);
          }
          result.updatedParams.push('vibratoRate');
        }
        
        // Actualizar waveform2 (segunda voz)
        if (params.waveform2 !== undefined && 'voice1' in synth) {
          const voice1 = (synth as Record<string, unknown>).voice1 as Record<string, unknown>;
          if (voice1 && typeof voice1 === 'object' && 'oscillator' in voice1) {
            const oscillator = voice1.oscillator as Record<string, unknown>;
            if (oscillator && typeof oscillator === 'object') {
              oscillator.type = params.waveform2;
            }
          }
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
  update(synth: SynthesizerType, params: Partial<SynthParams>): ParameterUpdateResult {
    const result = super.update(synth, params);

    try {
      if ('pitchDecay' in synth) {
        // Actualizar pitchDecay
        if (params.pitchDecay !== undefined) {
          (synth as Record<string, unknown>).pitchDecay = params.pitchDecay;
          result.updatedParams.push('pitchDecay');
        }
        
        // Actualizar octaves
        if (params.octaves !== undefined) {
          (synth as Record<string, unknown>).octaves = params.octaves;
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
  update(synth: SynthesizerType, params: Partial<SynthParams>): ParameterUpdateResult {
    const result = super.update(synth, params);

    try {
      if ('resonance' in synth) {
        // Actualizar resonance
        if (params.resonance !== undefined) {
          (synth as Record<string, unknown>).resonance = params.resonance;
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
  update(synth: SynthesizerType, params: Partial<SynthParams>): ParameterUpdateResult {
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
  update(synth: SynthesizerType, params: Partial<SynthParams>): ParameterUpdateResult {
    const result = super.update(synth, params);

    try {
      if (synth instanceof Tone.Sampler) {
        // Actualizar attack
        if (params.attack !== undefined) {
          synth.attack = params.attack as number;
          result.updatedParams.push('attack');
        }
        
        // Actualizar release
        if (params.release !== undefined) {
          synth.release = params.release as number;
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
