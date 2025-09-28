import * as Tone from 'tone';
import { IEffectFactory } from '../interfaces/IEffectFactory';
import { EffectType, EffectNode } from '../../managers/EffectManager';

/**
 * Factory para crear efectos FrequencyShifter
 * Implementa el Factory Pattern específico para FrequencyShifter
 */
export class FrequencyShifterFactory implements IEffectFactory {
  readonly effectType: EffectType = 'frequencyShifter';

  /**
   * Crea un nuevo nodo FrequencyShifter con parámetros por defecto
   * @returns El nodo FrequencyShifter creado
   */
  createEffect(): EffectNode {
    const effectNode = new Tone.FrequencyShifter({
      frequency: 0,       // Frecuencia de desplazamiento (Hz)
      wet: 0.5          // Mezcla entre señal seca y procesada
    });

    console.log(`🎛️ FrequencyShifterFactory: FrequencyShifter creado con parámetros iniciales:`, {
      frequency: effectNode.frequency.value,
      wet: effectNode.wet?.value || 0.5,
      readyForSpatialConnection: true
    });

    return effectNode;
  }

  /**
   * Valida si este factory puede crear el tipo de efecto especificado
   * @param type Tipo de efecto a validar
   * @returns true si puede crear el efecto, false en caso contrario
   */
  canCreate(type: EffectType): boolean {
    return type === 'frequencyShifter';
  }

  /**
   * Obtiene los parámetros por defecto para FrequencyShifter
   * @returns Objeto con los parámetros por defecto
   */
  getDefaultParams(): Record<string, unknown> {
    return {
      frequency: 0,       // Frecuencia de desplazamiento (Hz)
      wet: 0.5          // Mezcla entre señal seca y procesada
    };
  }

  /**
   * Valida un parámetro específico para FrequencyShifter
   * @param paramName Nombre del parámetro
   * @param value Valor a validar
   * @returns true si el valor es válido, false en caso contrario
   */
  validateParam(paramName: string, value: unknown): boolean {
    switch (paramName) {
      case 'frequency':
        return typeof value === 'number' && value >= -1000 && value <= 1000;
      case 'wet':
        return typeof value === 'number' && value >= 0 && value <= 1;
      default:
        return false;
    }
  }
}
