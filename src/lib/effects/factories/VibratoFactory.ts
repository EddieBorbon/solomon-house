import * as Tone from 'tone';
import { IEffectFactory } from '../interfaces/IEffectFactory';
import { EffectType, EffectNode } from '../../managers/EffectManager';

/**
 * Factory para crear efectos Vibrato
 * Implementa el Factory Pattern específico para Vibrato
 */
export class VibratoFactory implements IEffectFactory {
  readonly effectType: EffectType = 'vibrato';

  /**
   * Crea un nuevo nodo Vibrato con parámetros por defecto
   * @returns El nodo Vibrato creado
   */
  createEffect(): EffectNode {
    const effectNode = new Tone.Vibrato({
      frequency: 5,      // Frecuencia del vibrato (Hz)
      depth: 0.1,       // Profundidad del efecto (0-1)
      wet: 0.5         // Mezcla entre señal seca y procesada
    });

    // El vibrato se inicia automáticamente

    console.log(`🎛️ VibratoFactory: Vibrato creado con parámetros iniciales:`, {
      frequency: effectNode.frequency.value,
      depth: effectNode.depth.value,
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
    return type === 'vibrato';
  }

  /**
   * Obtiene los parámetros por defecto para Vibrato
   * @returns Objeto con los parámetros por defecto
   */
  getDefaultParams(): Record<string, unknown> {
    return {
      frequency: 5,      // Frecuencia del vibrato (Hz)
      depth: 0.1,       // Profundidad del efecto (0-1)
      wet: 0.5         // Mezcla entre señal seca y procesada
    };
  }

  /**
   * Valida un parámetro específico para Vibrato
   * @param paramName Nombre del parámetro
   * @param value Valor a validar
   * @returns true si el valor es válido, false en caso contrario
   */
  validateParam(paramName: string, value: unknown): boolean {
    switch (paramName) {
      case 'frequency':
        return typeof value === 'number' && value >= 0 && value <= 20;
      case 'depth':
        return typeof value === 'number' && value >= 0 && value <= 1;
      case 'wet':
        return typeof value === 'number' && value >= 0 && value <= 1;
      default:
        return false;
    }
  }
}
