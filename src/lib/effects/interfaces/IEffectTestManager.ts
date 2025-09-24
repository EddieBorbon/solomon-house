import * as Tone from 'tone';
import { EffectNode } from '../../managers/EffectManager';

/**
 * Interface para gestión de osciladores de prueba
 * Maneja la creación y gestión de osciladores para probar efectos
 */
export interface IEffectTestManager {
  /**
   * Crea un oscilador de prueba optimizado para un efecto específico
   * @param effectId ID del efecto
   * @param effect Nodo de efecto
   * @returns El oscilador de prueba creado
   */
  createTestOscillator(effectId: string, effect: EffectNode): Tone.Oscillator;
  
  /**
   * Refresca un efecto específico usando su oscilador de prueba
   * @param effectId ID del efecto
   * @param effect Nodo de efecto
   */
  refreshEffect(effectId: string, effect: EffectNode): void;
  
  /**
   * Elimina un oscilador de prueba
   * @param effectId ID del efecto
   */
  removeTestOscillator(effectId: string): void;
  
  /**
   * Limpia todos los osciladores de prueba
   */
  cleanup(): void;
  
  /**
   * Obtiene el oscilador de prueba para un efecto
   * @param effectId ID del efecto
   * @returns El oscilador de prueba o undefined
   */
  getTestOscillator(effectId: string): Tone.Oscillator | undefined;
  
  /**
   * Verifica si existe un oscilador de prueba para un efecto
   * @param effectId ID del efecto
   * @returns true si existe, false en caso contrario
   */
  hasTestOscillator(effectId: string): boolean;
}

/**
 * Interface para factory de osciladores de prueba
 * Crea osciladores optimizados según el tipo de efecto
 */
export interface ITestOscillatorFactory {
  /**
   * Crea un oscilador optimizado para un tipo de efecto específico
   * @param effectType Tipo de efecto
   * @returns Configuración del oscilador (frecuencia, tipo, volumen)
   */
  createOscillatorConfig(effectType: string): {
    frequency: number;
    type: OscillatorType;
    volume: number;
  };
  
  /**
   * Obtiene la estrategia de refresco para un tipo de efecto
   * @param effectType Tipo de efecto
   * @returns Función que ejecuta la estrategia de refresco
   */
  getRefreshStrategy(effectType: string): (oscillator: Tone.Oscillator) => void;
}
