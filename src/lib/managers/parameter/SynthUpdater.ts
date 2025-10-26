import * as Tone from 'tone';
import { AudioParams } from '../../factories/SoundSourceFactory';
import { BaseSynthesizerUpdater, ParameterUpdateResult } from './BaseSynthesizerUpdater';
import { ParameterConfigManager } from './ParameterConfigManager';

export class SynthUpdater extends BaseSynthesizerUpdater {
  constructor(configManager?: ParameterConfigManager) {
    super(configManager || new ParameterConfigManager());
  }

  /**
   * Actualiza parámetros específicos del Synth
   */
  public updateSynthesizer(
    synth: Tone.Synth, 
    params: Partial<AudioParams>, 
    result: ParameterUpdateResult
  ): void {
    try {
      console.log('SynthUpdater: Actualizando parámetros', params);

      // Actualizar tipo de onda del oscilador
      if (params.waveform !== undefined) {
        console.log('SynthUpdater: Actualizando waveform de', synth.oscillator.type, 'a', params.waveform);
        synth.oscillator.type = params.waveform as Tone.ToneOscillatorType;
        result.updatedParams.push('waveform');
      }

      // Actualizar parámetros del envelope
      if (params.attack !== undefined) {
        console.log('SynthUpdater: Actualizando attack de', synth.envelope.attack, 'a', params.attack);
        synth.envelope.attack = params.attack;
        result.updatedParams.push('attack');
      }

      if (params.decay !== undefined) {
        console.log('SynthUpdater: Actualizando decay de', synth.envelope.decay, 'a', params.decay);
        synth.envelope.decay = params.decay;
        result.updatedParams.push('decay');
      }

      if (params.sustain !== undefined) {
        console.log('SynthUpdater: Actualizando sustain de', synth.envelope.sustain, 'a', params.sustain);
        synth.envelope.sustain = params.sustain;
        result.updatedParams.push('sustain');
      }

      if (params.release !== undefined) {
        console.log('SynthUpdater: Actualizando release de', synth.envelope.release, 'a', params.release);
        synth.envelope.release = params.release;
        result.updatedParams.push('release');
      }

      // Actualizar frecuencia
      if (params.frequency !== undefined) {
        const safeFrequency = this.configManager.clampFrequency(params.frequency);
        synth.oscillator.frequency.rampTo(safeFrequency, this.configManager.getRampTime());
        result.updatedParams.push('frequency');
      }

      // Actualizar volumen
      if (params.volume !== undefined) {
        this.updateVolume(synth, params.volume, result);
      }

    } catch (error) {
      result.success = false;
      result.errors.push(`Synth update error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('SynthUpdater: Error actualizando parámetros', error);
    }
  }
}

