import * as Tone from 'tone';
import { AudioParams } from '../../factories/SoundSourceFactory';
import { BaseSynthesizerUpdater, ParameterUpdateResult } from './BaseSynthesizerUpdater';

/**
 * Clase especializada en la actualización de MetalSynth
 * Responsabilidad única: Manejar parámetros específicos de MetalSynth
 */
export class MetalSynthUpdater extends BaseSynthesizerUpdater {
  /**
   * Actualiza parámetros específicos del MetalSynth
   */
  public updateSynthesizer(
    synth: Tone.MetalSynth, 
    params: Partial<AudioParams>, 
    result: ParameterUpdateResult
  ): void {
    try {
      console.log('MetalSynthUpdater: Actualizando parámetros', params);
      console.log('MetalSynthUpdater: Sintetizador recibido:', synth);
      console.log('MetalSynthUpdater: Tipo de sintetizador:', synth.constructor.name);
      
      // Actualizar harmonicity - propiedad directa según la documentación
      if (params.harmonicity !== undefined) {
        console.log('MetalSynthUpdater: Actualizando harmonicity de', synth.harmonicity, 'a', params.harmonicity);
        synth.harmonicity = params.harmonicity;
        console.log('MetalSynthUpdater: harmonicity después del cambio:', synth.harmonicity);
        result.updatedParams.push('harmonicity');
      }
      
      // Actualizar modulationIndex - propiedad directa según la documentación
      if (params.modulationIndex !== undefined) {
        console.log('MetalSynthUpdater: Actualizando modulationIndex de', synth.modulationIndex, 'a', params.modulationIndex);
        synth.modulationIndex = params.modulationIndex;
        console.log('MetalSynthUpdater: modulationIndex después del cambio:', synth.modulationIndex);
        result.updatedParams.push('modulationIndex');
      }
      
      // Actualizar resonance - propiedad Frequency directa según la documentación
      if (params.resonance !== undefined) {
        console.log('MetalSynthUpdater: Actualizando resonance de', synth.resonance, 'a', params.resonance);
        synth.resonance = params.resonance;
        console.log('MetalSynthUpdater: resonance después del cambio:', synth.resonance);
        result.updatedParams.push('resonance');
      }
      
      // Actualizar octaves - propiedad numérica directa según la documentación
      if (params.octaves !== undefined) {
        console.log('MetalSynthUpdater: Actualizando octaves de', synth.octaves, 'a', params.octaves);
        synth.octaves = params.octaves;
        console.log('MetalSynthUpdater: octaves después del cambio:', synth.octaves);
        result.updatedParams.push('octaves');
      }
      
      // Actualizar envelope parameters
      if (params.modulationEnvelope !== undefined) {
        console.log('MetalSynthUpdater: Actualizando modulationEnvelope a', params.modulationEnvelope);
        // Mapear modulationEnvelope a los parámetros del envelope
        synth.envelope.attack = params.modulationEnvelope;
        synth.envelope.decay = params.modulationEnvelope * 1.4; // Mantener proporción similar a los defaults
        synth.envelope.release = params.modulationEnvelope * 0.2;
        result.updatedParams.push('modulationEnvelope');
      }
      
      // Actualizar duration si está presente (mapear a envelope)
      if (params.duration !== undefined) {
        console.log('MetalSynthUpdater: Actualizando duration a', params.duration);
        synth.envelope.attack = 0.001; // Attack muy rápido
        synth.envelope.decay = params.duration * 0.7; // La mayor parte del tiempo en decay
        synth.envelope.release = params.duration * 0.3; // Release proporcional
        result.updatedParams.push('duration');
      }
      
      // Los parámetros waveform y modulationWaveform son fijos en MetalSynth
      // según la documentación de Tone.js, por lo que no se procesan
      
      // Actualizar frecuencia usando el método base
      if (params.frequency !== undefined) {
        this.updateFrequency(synth, params.frequency, result);
      }
      
      // Actualizar volumen usando el método base
      if (params.volume !== undefined) {
        this.updateVolume(synth, params.volume, result);
      }
      
    } catch (error) {
      result.errors.push(`MetalSynth params: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Verifica si el sintetizador es compatible con este updater
   */
  public static isCompatible(synth: unknown): boolean {
    return synth instanceof Tone.MetalSynth;
  }

  /**
   * Retorna los parámetros soportados por este updater
   */
  public getSupportedParams(): string[] {
    return [
      'frequency',
      'volume',
      'harmonicity',
      'modulationIndex',
      'resonance',
      'octaves',
      'modulationEnvelope',
      'duration'
    ];
  }
}
