import * as Tone from 'tone';
import { IEffectFactory } from '../interfaces/IEffectFactory';
import { EffectType } from '../../managers/EffectManager';

/**
 * Factory para crear efectos Chorus
 * Implementa el Factory Pattern específico para Chorus
 */
export class ChorusFactory implements IEffectFactory {
  readonly effectType: EffectType = 'chorus';

  /**
   * Crea un nuevo nodo Chorus con parámetros por defecto
   * @returns El nodo Chorus creado
   */
  createEffect(): Tone.Chorus {
    const effectNode = new Tone.Chorus(1.5, 3.5, 0.7);
    
    try {
      effectNode.feedback.setValueAtTime(0, effectNode.context.currentTime);
      effectNode.spread = 180;
      effectNode.type = 'sine';
    } catch (error) {
    }
    
    effectNode.start();

      frequency: effectNode.frequency.value,
      delayTime: effectNode.delayTime,
      depth: effectNode.depth,
      feedback: effectNode.feedback.value,
      spread: effectNode.spread,
      type: effectNode.type
    });

    return effectNode;
  }

  /**
   * Valida si este factory puede crear el tipo de efecto especificado
   * @param type Tipo de efecto a validar
   * @returns true si puede crear el efecto, false en caso contrario
   */
  canCreate(type: EffectType): boolean {
    return type === 'chorus';
  }

  /**
   * Obtiene los parámetros por defecto para Chorus
   * @returns Objeto con los parámetros por defecto
   */
  getDefaultParams(): Record<string, any> {
    return {
      frequency: 1.5,
      delayTime: 3.5,
      depth: 0.7,
      feedback: 0,
      spread: 180,
      type: 'sine',
      wet: 0.5
    };
  }

  /**
   * Valida un parámetro específico para Chorus
   * @param paramName Nombre del parámetro
   * @param value Valor a validar
   * @returns true si el valor es válido, false en caso contrario
   */
  validateParam(paramName: string, value: any): boolean {
    switch (paramName) {
      case 'frequency':
      case 'chorusFrequency':
        return typeof value === 'number' && value >= 0.1 && value <= 20;
      case 'delayTime':
        return typeof value === 'number' && value >= 0.1 && value <= 10;
      case 'depth':
      case 'chorusDepth':
        return typeof value === 'number' && value >= 0 && value <= 1;
      case 'feedback':
        return typeof value === 'number' && value >= 0 && value <= 0.95;
      case 'spread':
        return typeof value === 'number' && value >= 0 && value <= 360;
      case 'type':
      case 'chorusType':
        return typeof value === 'string' && ['sine', 'square', 'triangle', 'sawtooth'].includes(value);
      case 'wet':
        return typeof value === 'number' && value >= 0 && value <= 1;
      default:
        return false;
    }
  }
}
