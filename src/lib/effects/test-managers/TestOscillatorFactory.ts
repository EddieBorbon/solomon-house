import * as Tone from 'tone';
import { ITestOscillatorFactory } from '../interfaces/IEffectTestManager';

/**
 * Factory para crear configuraciones de osciladores de prueba
 * Implementa el Factory Pattern para diferentes tipos de osciladores
 */
export class TestOscillatorFactory implements ITestOscillatorFactory {
  /**
   * Crea un oscilador optimizado para un tipo de efecto específico
   * @param effectType Tipo de efecto
   * @returns Configuración del oscilador (frecuencia, tipo, volumen)
   */
  createOscillatorConfig(effectType: string): {
    frequency: number;
    type: OscillatorType;
    volume: number;
  } {
    switch (effectType) {
      case 'Phaser':
        return { frequency: 440, type: 'sine', volume: -25 };
      case 'AutoFilter':
        return { frequency: 440, type: 'sine', volume: -25 };
      case 'AutoWah':
        return { frequency: 220, type: 'sine', volume: -25 };
      case 'BitCrusher':
        return { frequency: 880, type: 'square', volume: -20 };
      case 'Chebyshev':
        return { frequency: 660, type: 'sawtooth', volume: -20 };
      case 'Chorus':
        return { frequency: 440, type: 'sine', volume: -25 };
      case 'Distortion':
        return { frequency: 440, type: 'sawtooth', volume: -20 };
      case 'FeedbackDelay':
        return { frequency: 220, type: 'sine', volume: -24 };
      case 'Freeverb':
        return { frequency: 440, type: 'sine', volume: -28 };
      case 'FrequencyShifter':
        return { frequency: 330, type: 'sine', volume: -24 };
      case 'JCReverb':
        return { frequency: 520, type: 'sine', volume: -28 };
      case 'PingPongDelay':
        return { frequency: 220, type: 'sine', volume: -24 };
      case 'PitchShift':
        return { frequency: 440, type: 'sine', volume: -22 };
      case 'Reverb':
        return { frequency: 330, type: 'sine', volume: -20 };
      case 'StereoWidener':
        return { frequency: 550, type: 'sine', volume: -18 };
      case 'Tremolo':
        return { frequency: 440, type: 'sine', volume: -20 };
      case 'Vibrato':
        return { frequency: 440, type: 'sine', volume: -20 };
      default:
        return { frequency: 440, type: 'sine', volume: -30 };
    }
  }

  /**
   * Obtiene la estrategia de refresco para un tipo de efecto
   * @param effectType Tipo de efecto
   * @returns Función que ejecuta la estrategia de refresco
   */
  getRefreshStrategy(effectType: string): (oscillator: Tone.Oscillator) => void {
    switch (effectType) {
      case 'Phaser':
        return (osc) => {
          osc.frequency.rampTo(880, 0.1);
          // setTimeout(() => osc.frequency.rampTo(440, 0.1), 150);
        };
      case 'AutoFilter':
        return (osc) => {
          osc.frequency.rampTo(660, 0.1);
          // setTimeout(() => osc.frequency.rampTo(440, 0.1), 150);
        };
      case 'AutoWah':
        return (osc) => {
          osc.frequency.rampTo(110, 0.1);
          // setTimeout(() => osc.frequency.rampTo(440, 0.1), 200);
        };
      case 'BitCrusher':
        return (osc) => {
          osc.frequency.rampTo(880, 0.1);
          // setTimeout(() => osc.frequency.rampTo(440, 0.1), 100);
        };
      case 'Chebyshev':
        return (osc) => {
          osc.frequency.rampTo(660, 0.1);
          // setTimeout(() => osc.frequency.rampTo(440, 0.1), 150);
        };
      case 'Chorus':
        return (osc) => {
          osc.frequency.rampTo(880, 0.1);
          // setTimeout(() => osc.frequency.rampTo(440, 0.1), 100);
        };
      case 'Distortion':
        return (osc) => {
          osc.frequency.rampTo(880, 0.05);
          // setTimeout(() => osc.frequency.rampTo(440, 0.05), 120);
        };
      case 'FeedbackDelay':
        return (osc) => {
          osc.frequency.rampTo(330, 0.05);
          // setTimeout(() => osc.frequency.rampTo(440, 0.05), 120);
        };
      case 'Freeverb':
        return (osc) => {
          osc.frequency.rampTo(550, 0.05);
          // setTimeout(() => osc.frequency.rampTo(440, 0.05), 120);
        };
      case 'FrequencyShifter':
        return (osc) => {
          osc.frequency.rampTo(330, 0.05);
          // setTimeout(() => osc.frequency.rampTo(440, 0.05), 120);
        };
      case 'JCReverb':
        return (osc) => {
          osc.frequency.rampTo(520, 0.05);
          // setTimeout(() => osc.frequency.rampTo(440, 0.05), 120);
        };
      case 'PingPongDelay':
        return (osc) => {
          osc.frequency.rampTo(330, 0.05);
          // setTimeout(() => osc.frequency.rampTo(440, 0.05), 120);
        };
      case 'PitchShift':
        return (osc) => {
          osc.frequency.rampTo(880, 0.05);
          // setTimeout(() => osc.frequency.rampTo(440, 0.05), 120);
        };
      case 'Reverb':
        return (osc) => {
          osc.frequency.rampTo(660, 0.1);
          // setTimeout(() => osc.frequency.rampTo(330, 0.1), 200);
        };
      case 'StereoWidener':
        return (osc) => {
          osc.frequency.rampTo(1100, 0.05);
          // setTimeout(() => osc.frequency.rampTo(550, 0.05), 100);
        };
      case 'Tremolo':
        return (osc) => {
          osc.frequency.rampTo(880, 0.1);
          // setTimeout(() => osc.frequency.rampTo(440, 0.1), 200);
        };
      case 'Vibrato':
        return (osc) => {
          osc.frequency.rampTo(880, 0.1);
          // setTimeout(() => osc.frequency.rampTo(440, 0.1), 200);
        };
      default:
        return (osc) => {
          const currentFreq = osc.frequency.value;
          const newFreq = currentFreq === 440 ? 880 : 440;
          osc.frequency.rampTo(newFreq, 0.1);
          // setTimeout(() => osc.frequency.rampTo(440, 0.1), 200);
        };
    }
  }
}
