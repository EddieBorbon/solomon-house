import * as Tone from 'tone';
import { AudioParams } from '../../factories/SoundSourceFactory';
import { BaseSynthesizerUpdater, ParameterUpdateResult } from './BaseSynthesizerUpdater';

export class FMSynthUpdater extends BaseSynthesizerUpdater {
  public updateSynthesizer(
    synth: Tone.FMSynth,
    params: Partial<AudioParams>,
    result: ParameterUpdateResult
  ): void {
    try {
      console.log('FMSynthUpdater: Actualizando parámetros', params);

      // Actualizar parámetros del oscilador carrier
      if (params.waveform !== undefined) {
        console.log('FMSynthUpdater: Actualizando waveform de', synth.oscillator.type, 'a', params.waveform);
        synth.oscillator.type = params.waveform as 'sine' | 'square' | 'triangle' | 'sawtooth';
        result.updatedParams.push('waveform');
      }

      // Actualizar parámetros del oscilador modulator
      if (params.modulationWaveform !== undefined) {
        console.log('FMSynthUpdater: Actualizando modulationWaveform de', synth.modulation.type, 'a', params.modulationWaveform);
        synth.modulation.type = params.modulationWaveform as 'sine' | 'square' | 'triangle' | 'sawtooth';
        result.updatedParams.push('modulationWaveform');
      }

      // Actualizar parámetros del envelope de amplitud
      if (params.ampAttack !== undefined) {
        console.log('FMSynthUpdater: Actualizando ampAttack de', synth.envelope.attack, 'a', params.ampAttack);
        synth.envelope.attack = params.ampAttack;
        result.updatedParams.push('ampAttack');
      }

      if (params.ampDecay !== undefined) {
        console.log('FMSynthUpdater: Actualizando ampDecay de', synth.envelope.decay, 'a', params.ampDecay);
        synth.envelope.decay = params.ampDecay;
        result.updatedParams.push('ampDecay');
      }

      if (params.ampSustain !== undefined) {
        console.log('FMSynthUpdater: Actualizando ampSustain de', synth.envelope.sustain, 'a', params.ampSustain);
        synth.envelope.sustain = params.ampSustain;
        result.updatedParams.push('ampSustain');
      }

      if (params.ampRelease !== undefined) {
        console.log('FMSynthUpdater: Actualizando ampRelease de', synth.envelope.release, 'a', params.ampRelease);
        synth.envelope.release = params.ampRelease;
        result.updatedParams.push('ampRelease');
      }

      // Actualizar parámetros del envelope de modulación
      if (params.attack !== undefined) {
        console.log('FMSynthUpdater: Actualizando attack de', synth.modulationEnvelope.attack, 'a', params.attack);
        synth.modulationEnvelope.attack = params.attack;
        result.updatedParams.push('attack');
      }

      if (params.decay !== undefined) {
        console.log('FMSynthUpdater: Actualizando decay de', synth.modulationEnvelope.decay, 'a', params.decay);
        synth.modulationEnvelope.decay = params.decay;
        result.updatedParams.push('decay');
      }

      if (params.sustain !== undefined) {
        console.log('FMSynthUpdater: Actualizando sustain de', synth.modulationEnvelope.sustain, 'a', params.sustain);
        synth.modulationEnvelope.sustain = params.sustain;
        result.updatedParams.push('sustain');
      }

      if (params.release !== undefined) {
        console.log('FMSynthUpdater: Actualizando release de', synth.modulationEnvelope.release, 'a', params.release);
        synth.modulationEnvelope.release = params.release;
        result.updatedParams.push('release');
      }

      // Actualizar parámetros específicos del FM
      if (params.harmonicity !== undefined) {
        console.log('FMSynthUpdater: Actualizando harmonicity de', synth.harmonicity.value, 'a', params.harmonicity);
        synth.harmonicity.value = params.harmonicity;
        result.updatedParams.push('harmonicity');
      }

      if (params.modulationIndex !== undefined) {
        console.log('FMSynthUpdater: Actualizando modulationIndex de', synth.modulationIndex.value, 'a', params.modulationIndex);
        synth.modulationIndex.value = params.modulationIndex;
        result.updatedParams.push('modulationIndex');
      }

      // Nota: FMSynth no tiene filtro integrado, estos parámetros no se aplican
      // Los parámetros de filtro se manejan a nivel de efectos externos

      // Nota: FMSynth no tiene filterEnvelope integrado, estos parámetros no se aplican
      // Los parámetros de filtro se manejan a nivel de efectos externos

      // Actualizar parámetros de volumen
      if (params.volume !== undefined) {
        console.log('FMSynthUpdater: Actualizando volume de', synth.volume.value, 'a', params.volume);
        synth.volume.value = params.volume;
        result.updatedParams.push('volume');
      }

      console.log('FMSynthUpdater: Parámetros actualizados:', result.updatedParams);
    } catch (error) {
      console.error('FMSynthUpdater: Error actualizando parámetros:', error);
      result.errors.push(`Error actualizando FMSynth: ${error}`);
    }
  }

  public getCurrentParams(synth: Tone.FMSynth): Partial<AudioParams> {
    try {
      return {
        waveform: synth.oscillator.type as 'sine' | 'square' | 'triangle' | 'sawtooth',
        modulationWaveform: synth.modulation.type as 'sine' | 'square' | 'triangle' | 'sawtooth',
        ampAttack: Number(synth.envelope.attack),
        ampDecay: Number(synth.envelope.decay),
        ampSustain: Number(synth.envelope.sustain),
        ampRelease: Number(synth.envelope.release),
        attack: Number(synth.modulationEnvelope.attack),
        decay: Number(synth.modulationEnvelope.decay),
        sustain: Number(synth.modulationEnvelope.sustain),
        release: Number(synth.modulationEnvelope.release),
        harmonicity: synth.harmonicity.value,
        modulationIndex: synth.modulationIndex.value,
        volume: synth.volume.value
      };
    } catch (error) {
      console.error('FMSynthUpdater: Error obteniendo parámetros actuales:', error);
      return {};
    }
  }
}
