import * as Tone from 'tone';
import { IEffectFactory } from '../interfaces/IEffectFactory';
import { EffectType } from '../../managers/EffectManager';

/**
 * Factory para crear efectos Reverb
 * Implementa el Factory Pattern específico para Reverb
 */
export class ReverbFactory implements IEffectFactory {
  readonly effectType: EffectType = 'reverb';

  /**
   * Crea un nuevo nodo Reverb con parámetros por defecto
   * @returns El nodo Reverb creado
   */
  createEffect(): Tone.Reverb {
    const effectNode = new Tone.Reverb({
      decay: 1.5,
      preDelay: 0.01
    });

      decay: effectNode.decay,
      preDelay: effectNode.preDelay,
      wet: effectNode.wet.value
    });

    return effectNode;
  }

  /**
   * Valida si este factory puede crear el tipo de efecto especificado
   * @param type Tipo de efecto a validar
   * @returns true si puede crear el efecto, false en caso contrario
   */
  canCreate(type: EffectType): boolean {
    return type === 'reverb';
  }

  /**
   * Obtiene los parámetros por defecto para Reverb
   * @returns Objeto con los parámetros por defecto
   */
  getDefaultParams(): Record<string, any> {
    return {
      decay: 1.5,
      preDelay: 0.01,
      wet: 0.5
    };
  }

  /**
   * Valida un parámetro específico para Reverb
   * @param paramName Nombre del parámetro
   * @param value Valor a validar
   * @returns true si el valor es válido, false en caso contrario
   */
  validateParam(paramName: string, value: any): boolean {
    switch (paramName) {
      case 'decay':
        return typeof value === 'number' && value >= 0.1 && value <= 20;
      case 'preDelay':
        return typeof value === 'number' && value >= 0 && value <= 1;
      case 'wet':
        return typeof value === 'number' && value >= 0 && value <= 1;
      default:
        return false;
    }
  }
}
