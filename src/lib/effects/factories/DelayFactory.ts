import * as Tone from 'tone';
import { IEffectFactory } from '../interfaces/IEffectFactory';
import { EffectType } from '../../managers/EffectManager';

/**
 * Factory para crear efectos FeedbackDelay
 * Implementa el Factory Pattern específico para FeedbackDelay
 */
export class DelayFactory implements IEffectFactory {
  readonly effectType: EffectType = 'feedbackDelay';

  /**
   * Crea un nuevo nodo FeedbackDelay con parámetros por defecto
   * @returns El nodo FeedbackDelay creado
   */
  createEffect(): Tone.FeedbackDelay {
    const effectNode = new Tone.FeedbackDelay('8n', 0.5);

      delayTime: effectNode.delayTime,
      feedback: effectNode.feedback
    });

    return effectNode;
  }

  /**
   * Valida si este factory puede crear el tipo de efecto especificado
   * @param type Tipo de efecto a validar
   * @returns true si puede crear el efecto, false en caso contrario
   */
  canCreate(type: EffectType): boolean {
    return type === 'feedbackDelay';
  }

  /**
   * Obtiene los parámetros por defecto para FeedbackDelay
   * @returns Objeto con los parámetros por defecto
   */
  getDefaultParams(): Record<string, any> {
    return {
      delayTime: '8n',
      feedback: 0.5,
      wet: 0.5
    };
  }

  /**
   * Valida un parámetro específico para FeedbackDelay
   * @param paramName Nombre del parámetro
   * @param value Valor a validar
   * @returns true si el valor es válido, false en caso contrario
   */
  validateParam(paramName: string, value: any): boolean {
    switch (paramName) {
      case 'delayTime':
        return typeof value === 'string' || (typeof value === 'number' && value >= 0 && value <= 10);
      case 'feedback':
        return typeof value === 'number' && value >= 0 && value <= 0.95;
      case 'wet':
        return typeof value === 'number' && value >= 0 && value <= 1;
      default:
        return false;
    }
  }
}
