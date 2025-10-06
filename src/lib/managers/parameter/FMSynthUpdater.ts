import * as Tone from 'tone';
import { AudioParams } from '../../factories/SoundSourceFactory';
import { BaseSynthesizerUpdater, ParameterUpdateResult } from './BaseSynthesizerUpdater';

type OscillatorType = 'sine' | 'square' | 'triangle' | 'sawtooth';

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
        synth.oscillator.type = params.waveform as Tone.ToneOscillatorType;
        result.updatedParams.push('waveform');
      }

      // Actualizar parámetros del oscilador modulator
      if (params.modWaveform !== undefined) {
        console.log('FMSynthUpdater: Actualizando modWaveform de', synth.modulation.type, 'a', params.modWaveform);
        synth.modulation.type = params.modWaveform as Tone.ToneOscillatorType;
        result.updatedParams.push('modWaveform');
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
      if (params.modAttack !== undefined) {
        console.log('FMSynthUpdater: Actualizando modAttack de', synth.modulationEnvelope.attack, 'a', params.modAttack);
        synth.modulationEnvelope.attack = params.modAttack;
        result.updatedParams.push('modAttack');
      }

      if (params.modDecay !== undefined) {
        console.log('FMSynthUpdater: Actualizando modDecay de', synth.modulationEnvelope.decay, 'a', params.modDecay);
        synth.modulationEnvelope.decay = params.modDecay;
        result.updatedParams.push('modDecay');
      }

      if (params.modSustain !== undefined) {
        console.log('FMSynthUpdater: Actualizando modSustain de', synth.modulationEnvelope.sustain, 'a', params.modSustain);
        synth.modulationEnvelope.sustain = params.modSustain;
        result.updatedParams.push('modSustain');
      }

      if (params.modRelease !== undefined) {
        console.log('FMSynthUpdater: Actualizando modRelease de', synth.modulationEnvelope.release, 'a', params.modRelease);
        synth.modulationEnvelope.release = params.modRelease;
        result.updatedParams.push('modRelease');
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

      // FMSynth no tiene filtros por defecto, por lo que se omiten los parámetros de filtro

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
        waveform: synth.oscillator.type as OscillatorType,
        modWaveform: synth.modulation.type as OscillatorType,
        ampAttack: Number(synth.envelope.attack),
        ampDecay: Number(synth.envelope.decay),
        ampSustain: Number(synth.envelope.sustain),
        ampRelease: Number(synth.envelope.release),
        modAttack: Number(synth.modulationEnvelope.attack),
        modDecay: Number(synth.modulationEnvelope.decay),
        modSustain: Number(synth.modulationEnvelope.sustain),
        modRelease: Number(synth.modulationEnvelope.release),
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
