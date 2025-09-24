import * as Tone from 'tone';
import { IEffectTestManager, ITestOscillatorFactory } from '../interfaces/IEffectTestManager';
import { EffectNode } from '../../managers/EffectManager';

/**
 * Manager para osciladores de prueba de efectos
 * Implementa el Strategy Pattern para diferentes estrategias de prueba
 */
export class EffectTestManager implements IEffectTestManager {
  private testOscillators = new Map<string, Tone.Oscillator>();
  private oscillatorFactory: ITestOscillatorFactory;

  constructor(oscillatorFactory: ITestOscillatorFactory) {
    this.oscillatorFactory = oscillatorFactory;
  }

  /**
   * Crea un oscilador de prueba optimizado para un efecto específico
   * @param effectId ID del efecto
   * @param effect Nodo de efecto
   * @returns El oscilador de prueba creado
   */
  createTestOscillator(effectId: string, effect: EffectNode): Tone.Oscillator {
    try {
      const effectType = effect.constructor.name;
      const config = this.oscillatorFactory.createOscillatorConfig(effectType);
      
      // Crear un oscilador de prueba optimizado para el tipo de efecto
      const testOsc = new Tone.Oscillator({
        frequency: config.frequency,
        type: config.type,
        volume: config.volume,
      });
      
      // Conectar el oscilador directamente al efecto
      testOsc.connect(effect);
      
      // Iniciar el oscilador
      testOsc.start();
      
      
      // Almacenar el oscilador para poder limpiarlo después
      this.testOscillators.set(effectId, testOsc);
      
      return testOsc;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Refresca un efecto específico usando su oscilador de prueba
   * @param effectId ID del efecto
   * @param effect Nodo de efecto
   */
  refreshEffect(effectId: string, effect: EffectNode): void {
    const testOsc = this.testOscillators.get(effectId);
    if (!testOsc) {
      return;
    }

    try {
      const effectType = effect.constructor.name;
      const refreshStrategy = this.oscillatorFactory.getRefreshStrategy(effectType);
      
      refreshStrategy(testOsc);
      
    } catch (error) {
    }
  }

  /**
   * Elimina un oscilador de prueba
   * @param effectId ID del efecto
   */
  removeTestOscillator(effectId: string): void {
    const testOsc = this.testOscillators.get(effectId);
    if (testOsc) {
      try {
        testOsc.stop();
        testOsc.dispose();
        this.testOscillators.delete(effectId);
      } catch (error) {
      }
    }
  }

  /**
   * Limpia todos los osciladores de prueba
   */
  cleanup(): void {
    this.testOscillators.forEach((testOsc, effectId) => {
      try {
        testOsc.stop();
        testOsc.dispose();
      } catch (error) {
      }
    });
    this.testOscillators.clear();
  }

  /**
   * Obtiene el oscilador de prueba para un efecto
   * @param effectId ID del efecto
   * @returns El oscilador de prueba o undefined
   */
  getTestOscillator(effectId: string): Tone.Oscillator | undefined {
    return this.testOscillators.get(effectId);
  }

  /**
   * Verifica si existe un oscilador de prueba para un efecto
   * @param effectId ID del efecto
   * @returns true si existe, false en caso contrario
   */
  hasTestOscillator(effectId: string): boolean {
    return this.testOscillators.has(effectId);
  }

  /**
   * Obtiene el número de osciladores de prueba activos
   * @returns Número de osciladores activos
   */
  getActiveOscillatorCount(): number {
    return this.testOscillators.size;
  }
}
