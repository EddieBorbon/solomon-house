import * as Tone from 'tone';
import { AudioParams, SoundSource } from '../../factories/SoundSourceFactory';
import { ParameterConfigManager } from './ParameterConfigManager';
import { BaseSynthesizerUpdater, ParameterUpdateResult } from './BaseSynthesizerUpdater';
import { PolySynthUpdater } from './PolySynthUpdater';
import { PluckSynthUpdater } from './PluckSynthUpdater';
import { DuoSynthUpdater } from './DuoSynthUpdater';

// Union type for all possible synthesizer types
type SynthesizerType = Tone.Synth | Tone.FMSynth | Tone.AMSynth | Tone.DuoSynth | Tone.MonoSynth | Tone.MetalSynth | Tone.NoiseSynth | Tone.PluckSynth | Tone.MembraneSynth | Tone.PolySynth | Tone.Sampler;

/**
 * Facade para coordinar todos los updaters específicos de sintetizadores
 * Responsabilidad única: Coordinar y delegar actualizaciones a updaters específicos
 */
export class SynthesizerUpdaterFacade {
  private configManager: ParameterConfigManager;
  private updaters: Map<string, BaseSynthesizerUpdater>;

  constructor(configManager: ParameterConfigManager) {
    this.configManager = configManager;
    this.updaters = new Map();
    this.initializeUpdaters();
  }

  /**
   * Inicializa todos los updaters específicos
   */
  private initializeUpdaters(): void {
    this.updaters.set('PolySynth', new PolySynthUpdater(this.configManager));
    this.updaters.set('PluckSynth', new PluckSynthUpdater(this.configManager));
    this.updaters.set('DuoSynth', new DuoSynthUpdater(this.configManager));
    // TODO: Agregar más updaters específicos cuando se creen
  }

  /**
   * Actualiza los parámetros de un sintetizador usando el updater apropiado
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
      // Determinar el tipo de sintetizador y usar el updater apropiado
      const synthType = this.getSynthesizerType(source.synth);
      const updater = this.updaters.get(synthType);

      if (updater) {
        // Usar updater específico
        updater.updateSynthesizer(source.synth, params, result);
      } else {
        // Usar lógica genérica para sintetizadores no específicos
        this.updateGenericSynthesizer(source.synth, params, result);
      }

      // Actualizar parámetros comunes (volumen, frecuencia, etc.)
      this.updateCommonParams(source.synth, params, result);

    } catch (error) {
      result.success = false;
      result.errors.push(`Error general: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  /**
   * Determina el tipo de sintetizador
   */
  private getSynthesizerType(synth: SynthesizerType): string {
    if (synth instanceof Tone.PolySynth) return 'PolySynth';
    if (synth instanceof Tone.PluckSynth) return 'PluckSynth';
    if ('voice0' in synth && 'voice1' in synth) return 'DuoSynth';
    if ('pitchDecay' in synth) return 'MembraneSynth';
    if ('filterEnvelope' in synth) return 'MonoSynth';
    if ('resonance' in synth) return 'MetalSynth';
    if (synth instanceof Tone.NoiseSynth) return 'NoiseSynth';
    if (synth instanceof Tone.Sampler) return 'Sampler';
    return 'Generic';
  }

  /**
   * Actualiza parámetros comunes a todos los sintetizadores
   */
  private updateCommonParams(
    synth: SynthesizerType, 
    params: Partial<AudioParams>, 
    result: ParameterUpdateResult
  ): void {
    // Actualizar volumen si cambia
    if (params.volume !== undefined) {
      this.updateVolume(synth, params.volume, result);
    }

    // Actualizar frecuencia si cambia (solo para sintetizadores no específicos)
    if (params.frequency !== undefined && !this.isSpecificSynthesizer(synth)) {
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
  }

  /**
   * Actualiza sintetizadores genéricos (no específicos)
   */
  private updateGenericSynthesizer(
    synth: SynthesizerType, 
    params: Partial<AudioParams>, 
    result: ParameterUpdateResult
  ): void {
    // Implementar lógica genérica para sintetizadores no específicos
    // Por ahora, solo log
    console.log('Updating generic synthesizer:', synth.constructor.name);
  }

  /**
   * Verifica si es un sintetizador con updater específico
   */
  private isSpecificSynthesizer(synth: SynthesizerType): boolean {
    return synth instanceof Tone.PolySynth || 
           synth instanceof Tone.PluckSynth ||
           ('voice0' in synth && 'voice1' in synth);
  }

  // Métodos de actualización comunes (copiados de BaseSynthesizerUpdater)
  private updateFrequency(synth: SynthesizerType, frequency: number, result: ParameterUpdateResult): void {
    try {
      const safeFrequency = this.configManager.clampFrequency(frequency);
      if ('frequency' in synth && synth.frequency) {
        synth.frequency.rampTo(safeFrequency, this.configManager.getRampTime());
        result.updatedParams.push('frequency');
      }
    } catch (error) {
      result.errors.push(`Frequency update: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private updateWaveform(synth: SynthesizerType, waveform: string, result: ParameterUpdateResult): void {
    try {
      if ('oscillator' in synth) {
        (synth as any).oscillator.type = waveform;
        result.updatedParams.push('waveform');
      }
    } catch (error) {
      result.errors.push(`Waveform update: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private updateHarmonicity(synth: SynthesizerType, harmonicity: number, result: ParameterUpdateResult): void {
    try {
      if ('harmonicity' in synth) {
        const harmonicityParam = (synth as any).harmonicity;
        if (typeof harmonicityParam === 'object' && 'rampTo' in harmonicityParam) {
          harmonicityParam.rampTo(harmonicity, this.configManager.getRampTime());
        } else {
          (synth as any).harmonicity = harmonicity;
        }
        result.updatedParams.push('harmonicity');
      }
    } catch (error) {
      result.errors.push(`Harmonicity update: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private updateModulationIndex(synth: SynthesizerType, modulationIndex: number, result: ParameterUpdateResult): void {
    try {
      if ('modulationIndex' in synth) {
        const modulationIndexParam = (synth as any).modulationIndex;
        if (typeof modulationIndexParam === 'object' && 'rampTo' in modulationIndexParam) {
          modulationIndexParam.rampTo(modulationIndex, this.configManager.getRampTime());
        } else {
          (synth as any).modulationIndex = modulationIndex;
        }
        result.updatedParams.push('modulationIndex');
      }
    } catch (error) {
      result.errors.push(`ModulationIndex update: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private updateModulationWaveform(synth: SynthesizerType, modulationWaveform: string, result: ParameterUpdateResult): void {
    try {
      if ('modulation' in synth) {
        (synth as any).modulation.type = modulationWaveform;
        result.updatedParams.push('modulationWaveform');
      }
    } catch (error) {
      result.errors.push(`ModulationWaveform update: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private updateVolume(synth: SynthesizerType, volume: number, result: ParameterUpdateResult): void {
    try {
      const clampedVolume = this.configManager.clampVolume(volume);
      
      if ('modulation' in synth) {
        const amplitudeValue = clampedVolume;
        synth.oscillator.volume.rampTo(Tone.gainToDb(amplitudeValue), this.configManager.getRampTime());
      }
      
      const dbValue = clampedVolume > 0 ? Tone.gainToDb(clampedVolume) : -Infinity;
      synth.volume.rampTo(dbValue, this.configManager.getRampTime());
      
      result.updatedParams.push('volume');
    } catch (error) {
      result.errors.push(`Volume update: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Obtiene información de debug sobre los updaters disponibles
   */
  public getDebugInfo(): {
    availableUpdaters: string[];
    supportedSynthesizers: string[];
  } {
    return {
      availableUpdaters: Array.from(this.updaters.keys()),
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
