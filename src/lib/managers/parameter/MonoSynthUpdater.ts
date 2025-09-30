import * as Tone from 'tone';
import { AudioParams } from '../../factories/SoundSourceFactory';
import { BaseSynthesizerUpdater, ParameterUpdateResult } from './BaseSynthesizerUpdater';

export class MonoSynthUpdater extends BaseSynthesizerUpdater {
  public updateSynthesizer(
    synth: Tone.MonoSynth,
    params: Partial<AudioParams>,
    result: ParameterUpdateResult
  ): void {
    try {
      console.log('MonoSynthUpdater: Actualizando parámetros', params);

      // Actualizar parámetros del oscilador
      if (params.waveform !== undefined) {
        console.log('MonoSynthUpdater: Actualizando waveform de', synth.oscillator.type, 'a', params.waveform);
        synth.oscillator.type = params.waveform as Tone.ToneOscillatorType;
        result.updatedParams.push('waveform');
      }

      // Actualizar parámetros del envelope de amplitud
      if (params.ampAttack !== undefined) {
        console.log('MonoSynthUpdater: Actualizando ampAttack de', synth.envelope.attack, 'a', params.ampAttack);
        synth.envelope.attack = params.ampAttack;
        result.updatedParams.push('ampAttack');
      }

      if (params.ampDecay !== undefined) {
        console.log('MonoSynthUpdater: Actualizando ampDecay de', synth.envelope.decay, 'a', params.ampDecay);
        synth.envelope.decay = params.ampDecay;
        result.updatedParams.push('ampDecay');
      }

      if (params.ampSustain !== undefined) {
        console.log('MonoSynthUpdater: Actualizando ampSustain de', synth.envelope.sustain, 'a', params.ampSustain);
        synth.envelope.sustain = params.ampSustain;
        result.updatedParams.push('ampSustain');
      }

      if (params.ampRelease !== undefined) {
        console.log('MonoSynthUpdater: Actualizando ampRelease de', synth.envelope.release, 'a', params.ampRelease);
        synth.envelope.release = params.ampRelease;
        result.updatedParams.push('ampRelease');
      }

      // Actualizar parámetros del envelope del filtro
      if (params.filterAttack !== undefined) {
        console.log('MonoSynthUpdater: Actualizando filterAttack de', synth.filterEnvelope.attack, 'a', params.filterAttack);
        synth.filterEnvelope.attack = params.filterAttack;
        result.updatedParams.push('filterAttack');
      }

      if (params.filterDecay !== undefined) {
        console.log('MonoSynthUpdater: Actualizando filterDecay de', synth.filterEnvelope.decay, 'a', params.filterDecay);
        synth.filterEnvelope.decay = params.filterDecay;
        result.updatedParams.push('filterDecay');
      }

      if (params.filterSustain !== undefined) {
        console.log('MonoSynthUpdater: Actualizando filterSustain de', synth.filterEnvelope.sustain, 'a', params.filterSustain);
        synth.filterEnvelope.sustain = params.filterSustain;
        result.updatedParams.push('filterSustain');
      }

      if (params.filterRelease !== undefined) {
        console.log('MonoSynthUpdater: Actualizando filterRelease de', synth.filterEnvelope.release, 'a', params.filterRelease);
        synth.filterEnvelope.release = params.filterRelease;
        result.updatedParams.push('filterRelease');
      }

      if (params.filterBaseFreq !== undefined) {
        console.log('MonoSynthUpdater: Actualizando filterBaseFreq de', synth.filterEnvelope.baseFrequency, 'a', params.filterBaseFreq);
        synth.filterEnvelope.baseFrequency = params.filterBaseFreq;
        result.updatedParams.push('filterBaseFreq');
      }

      if (params.filterOctaves !== undefined) {
        console.log('MonoSynthUpdater: Actualizando filterOctaves de', synth.filterEnvelope.octaves, 'a', params.filterOctaves);
        synth.filterEnvelope.octaves = params.filterOctaves;
        result.updatedParams.push('filterOctaves');
      }

      // Actualizar parámetros del filtro
      if (params.filterQ !== undefined) {
        console.log('MonoSynthUpdater: Actualizando filterQ de', synth.filter.Q, 'a', params.filterQ);
        synth.filter.Q = params.filterQ;
        result.updatedParams.push('filterQ');
      }

      // Actualizar parámetros comunes
      if (params.frequency !== undefined) {
        this.updateFrequency(synth, params.frequency, result);
      }

      if (params.volume !== undefined) {
        this.updateVolume(synth, params.volume, result);
      }

    } catch (error) {
      result.errors.push(`MonoSynth params: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public static isCompatible(synth: unknown): boolean {
    return synth instanceof Tone.MonoSynth;
  }

  public getSupportedParams(): string[] {
    return [
      'frequency',
      'volume',
      'waveform',
      'ampAttack',
      'ampDecay',
      'ampSustain',
      'ampRelease',
      'filterAttack',
      'filterDecay',
      'filterSustain',
      'filterRelease',
      'filterBaseFreq',
      'filterOctaves',
      'filterQ'
    ];
  }
}
