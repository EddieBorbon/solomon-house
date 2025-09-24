import * as Tone from 'tone';
import { IEffectFactory } from '../interfaces/IEffectFactory';
import { EffectType } from '../../managers/EffectManager';

/**
 * Factory para crear efectos AutoFilter
 * Implementa el Factory Pattern específico para AutoFilter
 */
export class AutoFilterFactory implements IEffectFactory {
  readonly effectType: EffectType = 'autoFilter';

  /**
   * Crea un nuevo nodo AutoFilter con parámetros por defecto
   * @returns El nodo AutoFilter creado
   */
  createEffect(): Tone.AutoFilter {
    const effectNode = new Tone.AutoFilter({
      frequency: 0.5,
      baseFrequency: 200,
      octaves: 2.6,
      depth: 0.5,
      filter: {
        type: 'lowpass',
        rolloff: -12,
        Q: 1,
      },
      type: 'sine',
    });

      frequency: effectNode.frequency.value,
      baseFrequency: effectNode.baseFrequency,
      octaves: effectNode.octaves,
      depth: effectNode.depth.value,
      filterType: effectNode.filter.type,
      filterQ: effectNode.filter.Q.value
    });

    return effectNode;
  }

  /**
   * Valida si este factory puede crear el tipo de efecto especificado
   * @param type Tipo de efecto a validar
   * @returns true si puede crear el efecto, false en caso contrario
   */
  canCreate(type: EffectType): boolean {
    return type === 'autoFilter';
  }

  /**
   * Obtiene los parámetros por defecto para AutoFilter
   * @returns Objeto con los parámetros por defecto
   */
  getDefaultParams(): Record<string, any> {
    return {
      frequency: 0.5,
      baseFrequency: 200,
      octaves: 2.6,
      depth: 0.5,
      filterType: 'lowpass',
      filterQ: 1,
      lfoType: 'sine',
      wet: 0.5
    };
  }

  /**
   * Valida un parámetro específico para AutoFilter
   * @param paramName Nombre del parámetro
   * @param value Valor a validar
   * @returns true si el valor es válido, false en caso contrario
   */
  validateParam(paramName: string, value: any): boolean {
    switch (paramName) {
      case 'frequency':
        return typeof value === 'number' && value >= 0 && value <= 20;
      case 'baseFrequency':
        return typeof value === 'number' && value >= 20 && value <= 20000;
      case 'octaves':
        return typeof value === 'number' && value >= 0 && value <= 10;
      case 'depth':
        return typeof value === 'number' && value >= 0 && value <= 1;
      case 'filterType':
        return typeof value === 'string' && ['lowpass', 'highpass', 'bandpass', 'notch'].includes(value);
      case 'filterQ':
        return typeof value === 'number' && value >= 0.1 && value <= 30;
      case 'lfoType':
        return typeof value === 'string' && ['sine', 'square', 'triangle', 'sawtooth'].includes(value);
      case 'wet':
        return typeof value === 'number' && value >= 0 && value <= 1;
      default:
        return false;
    }
  }
}
