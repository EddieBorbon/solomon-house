import * as Tone from 'tone';
import { IEffectFactory } from '../interfaces/IEffectFactory';
import { EffectType, EffectNode } from '../../managers/EffectManager';

/**
 * Factory para crear efectos BitCrusher
 * Implementa el Factory Pattern específico para BitCrusher
 */
export class BitCrusherFactory implements IEffectFactory {
  readonly effectType: EffectType = 'bitCrusher';

  /**
   * Crea un nuevo nodo BitCrusher con parámetros por defecto
   * @returns El nodo BitCrusher creado
   */
  createEffect(): EffectNode {
    const effectNode = new Tone.BitCrusher({
      bits: 4,        // Reducir bits para efecto audible
      wet: 0.5        // Mezcla entre señal seca y procesada
    });

    console.log(`🎛️ BitCrusherFactory: BitCrusher creado con parámetros iniciales:`, {
      bits: effectNode.bits,
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
    return type === 'bitCrusher';
  }

  /**
   * Obtiene los parámetros por defecto para BitCrusher
   * @returns Objeto con los parámetros por defecto
   */
  getDefaultParams(): Record<string, unknown> {
    return {
      bits: 4,          // Número de bits (1-16)
      wet: 0.5          // Mezcla entre señal seca y procesada
    };
  }

  /**
   * Valida un parámetro específico para BitCrusher
   * @param paramName Nombre del parámetro
   * @param value Valor a validar
   * @returns true si el valor es válido, false en caso contrario
   */
  validateParam(paramName: string, value: unknown): boolean {
    switch (paramName) {
      case 'bits':
        return typeof value === 'number' && value >= 1 && value <= 16;
      case 'wet':
        return typeof value === 'number' && value >= 0 && value <= 1;
      default:
        return false;
    }
  }
}
