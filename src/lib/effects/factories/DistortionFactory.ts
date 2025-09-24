import * as Tone from 'tone';
import { IEffectFactory } from '../interfaces/IEffectFactory';
import { EffectType, EffectNode } from '../../managers/EffectManager';

/**
 * Factory para crear efectos Distortion
 * Implementa el Factory Pattern específico para Distortion
 */
export class DistortionFactory implements IEffectFactory {
  readonly effectType: EffectType = 'distortion';

  /**
   * Crea un nuevo nodo Distortion con parámetros por defecto
   * @returns El nodo Distortion creado
   */
  createEffect(): EffectNode {
    const effectNode = new Tone.Distortion(0.4);
    try {
      effectNode.oversample = 'none';
    } catch {
      // Ignorar si no se puede configurar
    }

    console.log(`🎛️ DistortionFactory: Distortion creado con parámetros iniciales:`, {
      distortion: effectNode.distortion,
      oversample: effectNode.oversample
    });

    return effectNode;
  }

  /**
   * Valida si este factory puede crear el tipo de efecto especificado
   * @param type Tipo de efecto a validar
   * @returns true si puede crear el efecto, false en caso contrario
   */
  canCreate(type: EffectType): boolean {
    return type === 'distortion';
  }

  /**
   * Obtiene los parámetros por defecto para Distortion
   * @returns Objeto con los parámetros por defecto
   */
  getDefaultParams(): Record<string, any> {
    return {
      distortion: 0.4,
      oversample: 'none',
      wet: 0.5
    };
  }

  /**
   * Valida un parámetro específico para Distortion
   * @param paramName Nombre del parámetro
   * @param value Valor a validar
   * @returns true si el valor es válido, false en caso contrario
   */
  validateParam(paramName: string, value: any): boolean {
    switch (paramName) {
      case 'distortion':
        return typeof value === 'number' && value >= 0 && value <= 1;
      case 'oversample':
        return typeof value === 'string' && ['none', '2x', '4x'].includes(value);
      case 'wet':
        return typeof value === 'number' && value >= 0 && value <= 1;
      default:
        return false;
    }
  }
}
