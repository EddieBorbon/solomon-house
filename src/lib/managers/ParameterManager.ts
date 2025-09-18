import * as Tone from 'tone';
import { AudioParams, SoundSource } from '../factories/SoundSourceFactory';

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

interface SynthesizerWithVoice1 {
  voice1: {
    oscillator: {
      type: string;
    };
  };
}

interface SynthesizerWithEnvelope {
  envelope: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
    curve?: string;
  };
}

interface SynthesizerWithFilterEnvelope {
  filterEnvelope: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
    baseFrequency: number;
    octaves: number;
  };
}

interface SynthesizerWithFilter {
  filter: {
    Q: {
      value: number;
    };
  };
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

interface SynthesizerWithPitchDecay {
  pitchDecay: number;
}

interface SynthesizerWithOctaves {
  octaves: number;
}

interface SynthesizerWithResonance {
  resonance: number;
}

// Tipos para gestión de parámetros
export interface ParameterUpdateResult {
  success: boolean;
  updatedParams: string[];
  errors: string[];
}

export interface ParameterConfig {
  volumeRange: {
    min: number;
    max: number;
    dbRange: {
      min: number;
      max: number;
    };
  };
  frequencyRange: {
    min: number;
    max: number;
  };
  rampTime: number;
}

export class ParameterManager {
  private config: ParameterConfig;

  constructor(config: ParameterConfig = {
    volumeRange: {
      min: 0,
      max: 1.0,
      dbRange: {
        min: -Infinity,
        max: 0
      }
    },
    frequencyRange: {
      min: 20,
      max: 20000
    },
    rampTime: 0.05
  }) {
    this.config = config;
  }

  /**
   * Actualiza los parámetros de un sintetizador de forma segura
   */
  public updateSoundParams(
    source: SoundSource, 
    params: Partial<AudioParams>
  ): ParameterUpdateResult {
    const result: ParameterUpdateResult = {
      success: true,
      updatedParams: [],
      errors: []
    };

    try {
      // Actualizar parámetros específicos del PolySynth
      if (source.synth instanceof Tone.PolySynth) {
        this.updatePolySynthParams(source.synth, params, result);
      }

      // Actualizar frecuencia si cambia
      if (params.frequency !== undefined && !(source.synth instanceof Tone.PolySynth)) {
        this.updateFrequency(source.synth, params.frequency, result);
      }

      // Actualizar parámetros específicos del PluckSynth
      if (source.synth instanceof Tone.PluckSynth) {
        this.updatePluckSynthParams(source.synth, params, result);
      }

      // Actualizar tipo de onda si cambia
      if (params.waveform !== undefined) {
        this.updateWaveform(source.synth, params.waveform, result);
      }

      // Actualizar harmonicity si cambia
      if (params.harmonicity !== undefined && 'harmonicity' in source.synth) {
        this.updateHarmonicity(source.synth, params.harmonicity, result);
      }

      // Actualizar modulationIndex si cambia
      if (params.modulationIndex !== undefined && 'modulationIndex' in source.synth) {
        this.updateModulationIndex(source.synth, params.modulationIndex, result);
      }

      // Actualizar forma de onda de modulación si cambia
      if (params.modulationWaveform !== undefined && 'modulation' in source.synth) {
        this.updateModulationWaveform(source.synth, params.modulationWaveform, result);
      }

      // Actualizar parámetros específicos del DuoSynth
      if ('voice0' in source.synth) {
        this.updateDuoSynthParams(source.synth, params, result);
      }

      // Actualizar parámetros específicos del MembraneSynth
      if ('pitchDecay' in source.synth) {
        this.updateMembraneSynthParams(source.synth, params, result);
      }

      // Actualizar parámetros específicos del MonoSynth
      if ('filterEnvelope' in source.synth) {
        this.updateMonoSynthParams(source.synth, params, result);
      }

      // Actualizar parámetros específicos del MetalSynth
      if ('resonance' in source.synth) {
        this.updateMetalSynthParams(source.synth, params, result);
      }

      // Actualizar parámetros específicos del NoiseSynth
      if (source.synth instanceof Tone.NoiseSynth) {
        this.updateNoiseSynthParams(source.synth, params, result);
      }

      // Actualizar parámetros específicos del Sampler
      if (source.synth instanceof Tone.Sampler) {
        this.updateSamplerParams(source.synth, params, result);
      }

      // Actualizar volumen si cambia
      if (params.volume !== undefined) {
        this.updateVolume(source.synth, params.volume, result);
      }

    } catch (error) {
      result.success = false;
      result.errors.push(`Error general: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  /**
   * Actualiza parámetros específicos del PolySynth
   */
  private updatePolySynthParams(
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
   * Actualiza la frecuencia de un sintetizador
   */
  private updateFrequency(
    synth: SynthesizerType, 
    frequency: number, 
    result: ParameterUpdateResult
  ): void {
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

  /**
   * Actualiza parámetros específicos del PluckSynth
   */
  private updatePluckSynthParams(
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
    } catch (error) {
      result.errors.push(`PluckSynth params: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Actualiza el tipo de onda de un sintetizador
   */
  private updateWaveform(
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
  private updateHarmonicity(
    synth: SynthesizerType, 
    harmonicity: number, 
    result: ParameterUpdateResult
  ): void {
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

  /**
   * Actualiza el modulationIndex de un sintetizador
   */
  private updateModulationIndex(
    synth: SynthesizerType, 
    modulationIndex: number, 
    result: ParameterUpdateResult
  ): void {
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

  /**
   * Actualiza la forma de onda de modulación
   */
  private updateModulationWaveform(
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
   * Actualiza parámetros específicos del DuoSynth
   */
  private updateDuoSynthParams(
    synth: SynthesizerType, 
    params: Partial<AudioParams>, 
    result: ParameterUpdateResult
  ): void {
    try {
      // Actualizar harmonicity
      if (params.harmonicity !== undefined && 'harmonicity' in synth) {
        const harmonicityParam = (synth as SynthesizerWithHarmonicity).harmonicity;
        if (typeof harmonicityParam === 'object' && 'rampTo' in harmonicityParam) {
          harmonicityParam.rampTo(params.harmonicity, this.config.rampTime);
        } else {
          (synth as { harmonicity: number }).harmonicity = params.harmonicity;
        }
        result.updatedParams.push('harmonicity');
      }
      
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
    } catch (error) {
      result.errors.push(`DuoSynth params: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Actualiza parámetros específicos del MembraneSynth
   */
  private updateMembraneSynthParams(
    synth: SynthesizerType, 
    params: Partial<AudioParams>, 
    result: ParameterUpdateResult
  ): void {
    try {
      // Actualizar pitchDecay
      if (params.pitchDecay !== undefined && 'pitchDecay' in synth) {
        (synth as SynthesizerWithPitchDecay).pitchDecay = params.pitchDecay;
        result.updatedParams.push('pitchDecay');
      }
      
      // Actualizar octaves
      if (params.octaves !== undefined && 'octaves' in synth) {
        (synth as SynthesizerWithOctaves).octaves = params.octaves;
        result.updatedParams.push('octaves');
      }
    } catch (error) {
      result.errors.push(`MembraneSynth params: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Actualiza parámetros específicos del MonoSynth
   */
  private updateMonoSynthParams(
    synth: SynthesizerType, 
    params: Partial<AudioParams>, 
    result: ParameterUpdateResult
  ): void {
    try {
      // Actualizar envolvente de amplitud
      if (params.ampAttack !== undefined && 'envelope' in synth) {
        (synth as SynthesizerWithEnvelope).envelope.attack = params.ampAttack;
        result.updatedParams.push('ampAttack');
      }
      if (params.ampDecay !== undefined && 'envelope' in synth) {
        (synth as SynthesizerWithEnvelope).envelope.decay = params.ampDecay;
        result.updatedParams.push('ampDecay');
      }
      if (params.ampSustain !== undefined && 'envelope' in synth) {
        (synth as SynthesizerWithEnvelope).envelope.sustain = params.ampSustain;
        result.updatedParams.push('ampSustain');
      }
      if (params.ampRelease !== undefined && 'envelope' in synth) {
        (synth as SynthesizerWithEnvelope).envelope.release = params.ampRelease;
        result.updatedParams.push('ampRelease');
      }
      
      // Actualizar envolvente de filtro
      if (params.filterAttack !== undefined && 'filterEnvelope' in synth) {
        (synth as SynthesizerWithFilterEnvelope).filterEnvelope.attack = params.filterAttack;
        result.updatedParams.push('filterAttack');
      }
      if (params.filterDecay !== undefined && 'filterEnvelope' in synth) {
        (synth as SynthesizerWithFilterEnvelope).filterEnvelope.decay = params.filterDecay;
        result.updatedParams.push('filterDecay');
      }
      if (params.filterSustain !== undefined && 'filterEnvelope' in synth) {
        (synth as SynthesizerWithFilterEnvelope).filterEnvelope.sustain = params.filterSustain;
        result.updatedParams.push('filterSustain');
      }
      if (params.filterRelease !== undefined && 'filterEnvelope' in synth) {
        (synth as SynthesizerWithFilterEnvelope).filterEnvelope.release = params.filterRelease;
        result.updatedParams.push('filterRelease');
      }
      if (params.filterBaseFreq !== undefined && 'filterEnvelope' in synth) {
        (synth as SynthesizerWithFilterEnvelope).filterEnvelope.baseFrequency = params.filterBaseFreq;
        result.updatedParams.push('filterBaseFreq');
      }
      if (params.filterOctaves !== undefined && 'filterEnvelope' in synth) {
        (synth as SynthesizerWithFilterEnvelope).filterEnvelope.octaves = params.filterOctaves;
        result.updatedParams.push('filterOctaves');
      }
      
      // Actualizar parámetros del filtro
      if (params.filterQ !== undefined && 'filter' in synth) {
        (synth as SynthesizerWithFilter).filter.Q.value = params.filterQ;
        result.updatedParams.push('filterQ');
      }
    } catch (error) {
      result.errors.push(`MonoSynth params: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Actualiza parámetros específicos del MetalSynth
   */
  private updateMetalSynthParams(
    synth: SynthesizerType, 
    params: Partial<AudioParams>, 
    result: ParameterUpdateResult
  ): void {
    try {
      // Actualizar resonance
      if (params.resonance !== undefined && 'resonance' in synth) {
        (synth as SynthesizerWithResonance).resonance = params.resonance;
        result.updatedParams.push('resonance');
      }
      
      // Actualizar octaves
      if (params.octaves !== undefined && 'octaves' in synth) {
        (synth as SynthesizerWithOctaves).octaves = params.octaves;
        result.updatedParams.push('octaves');
      }
    } catch (error) {
      result.errors.push(`MetalSynth params: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Actualiza parámetros específicos del NoiseSynth
   */
  private updateNoiseSynthParams(
    synth: Tone.NoiseSynth, 
    params: Partial<AudioParams>, 
    result: ParameterUpdateResult
  ): void {
    try {
      // Actualizar tipo de ruido
      if (params.noiseType !== undefined) {
        synth.noise.type = params.noiseType;
        result.updatedParams.push('noiseType');
      }
      
      // Actualizar envolvente
      if (params.attack !== undefined) {
        synth.envelope.attack = params.attack;
        result.updatedParams.push('attack');
      }
      if (params.decay !== undefined) {
        synth.envelope.decay = params.decay;
        result.updatedParams.push('decay');
      }
      if (params.sustain !== undefined) {
        synth.envelope.sustain = params.sustain;
        result.updatedParams.push('sustain');
      }
    } catch (error) {
      result.errors.push(`NoiseSynth params: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Actualiza parámetros específicos del Sampler
   */
  private updateSamplerParams(
    synth: Tone.Sampler, 
    params: Partial<AudioParams>, 
    result: ParameterUpdateResult
  ): void {
    try {
      // Actualizar attack
      if (params.attack !== undefined) {
        if ('envelope' in synth && synth.envelope) {
          (synth as SynthesizerWithEnvelope).envelope.attack = params.attack;
          result.updatedParams.push('attack');
        }
      }
      
      // Actualizar release
      if (params.release !== undefined) {
        if ('envelope' in synth && synth.envelope) {
          (synth as SynthesizerWithEnvelope).envelope.release = params.release;
          result.updatedParams.push('release');
        }
      }
      
      // Actualizar curve
      if (params.curve !== undefined) {
        if ('envelope' in synth && synth.envelope) {
          (synth as SynthesizerWithEnvelope).envelope.curve = params.curve;
          result.updatedParams.push('curve');
        }
      }
    } catch (error) {
      result.errors.push(`Sampler params: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Actualiza el volumen de un sintetizador
   */
  private updateVolume(
    synth: SynthesizerType, 
    volume: number, 
    result: ParameterUpdateResult
  ): void {
    try {
      // Clampear el volumen al rango configurado
      const clampedVolume = Math.max(
        this.config.volumeRange.min, 
        Math.min(this.config.volumeRange.max, volume)
      );

      // Para síntesis AM, el volumen debe controlar tanto la amplitud como el volumen general
      if ('modulation' in synth) {
        // Es un AMSynth - aplicar volumen a la amplitud de la portadora
        const amplitudeValue = clampedVolume;
        synth.oscillator.volume.rampTo(Tone.gainToDb(amplitudeValue), this.config.rampTime);
      }
      
      // Aplicar volumen general al sintetizador (control de salida)
      // Mapeo directo: 0 = -Infinity, 1.0 = 0dB (volumen completo)
      const dbValue = clampedVolume > 0 ? Tone.gainToDb(clampedVolume) : -Infinity;
      synth.volume.rampTo(dbValue, this.config.rampTime);
      
      result.updatedParams.push('volume');
    } catch (error) {
      result.errors.push(`Volume update: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Actualiza la configuración del manager
   */
  public updateConfig(config: Partial<ParameterConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Obtiene la configuración actual del manager
   */
  public getConfig(): ParameterConfig {
    return { ...this.config };
  }

  /**
   * Valida un conjunto de parámetros antes de aplicarlos
   */
  public validateParams(params: Partial<AudioParams>): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validar frecuencia
    if (params.frequency !== undefined) {
      if (params.frequency < this.config.frequencyRange.min) {
        errors.push(`Frecuencia ${params.frequency}Hz está por debajo del mínimo (${this.config.frequencyRange.min}Hz)`);
      } else if (params.frequency > this.config.frequencyRange.max) {
        errors.push(`Frecuencia ${params.frequency}Hz está por encima del máximo (${this.config.frequencyRange.max}Hz)`);
      }
    }

    // Validar volumen
    if (params.volume !== undefined) {
      if (params.volume < this.config.volumeRange.min) {
        warnings.push(`Volumen ${params.volume} está por debajo del mínimo recomendado (${this.config.volumeRange.min})`);
      } else if (params.volume > this.config.volumeRange.max) {
        warnings.push(`Volumen ${params.volume} está por encima del máximo recomendado (${this.config.volumeRange.max})`);
      }
    }

    // Validar parámetros de envolvente
    if (params.attack !== undefined && params.attack < 0) {
      errors.push('Attack no puede ser negativo');
    }
    if (params.decay !== undefined && params.decay < 0) {
      errors.push('Decay no puede ser negativo');
    }
    if (params.release !== undefined && params.release < 0) {
      errors.push('Release no puede ser negativo');
    }
    if (params.sustain !== undefined && (params.sustain < 0 || params.sustain > 1)) {
      errors.push('Sustain debe estar entre 0 y 1');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Obtiene información de debug del manager
   */
  public getDebugInfo(): {
    config: ParameterConfig;
    supportedSynthesizers: string[];
  } {
    return {
      config: this.getConfig(),
      supportedSynthesizers: [
        'PolySynth',
        'PluckSynth',
        'DuoSynth',
        'MembraneSynth',
        'MonoSynth',
        'MetalSynth',
        'NoiseSynth',
        'Sampler',
        'AMSynth',
        'FMSynth'
      ]
    };
  }
}
