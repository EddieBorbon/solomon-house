import * as Tone from 'tone';
import { IEffectUpdater } from '../interfaces/IEffectUpdater';
import { EffectParams } from '../../managers/EffectManager';

/**
 * Updater para efectos FeedbackDelay
 * Implementa el Strategy Pattern específico para FeedbackDelay
 */
export class DelayUpdater implements IEffectUpdater<Tone.FeedbackDelay> {
  readonly effectType = 'FeedbackDelay';

  /**
   * Actualiza los parámetros de un efecto FeedbackDelay
   * @param effect Nodo FeedbackDelay a actualizar
   * @param params Parámetros a aplicar
   */
  updateParams(effect: Tone.FeedbackDelay, params: EffectParams): void {
    Object.keys(params).forEach(paramName => {
      if (params[paramName as keyof EffectParams] !== undefined) {
        const value = params[paramName as keyof EffectParams];
        if (value !== undefined) {
          if (paramName === 'feedback') {
            this.safeUpdateParam(effect, 'feedback', value as number | string);
          } else if (paramName === 'delayTime') {
            this.safeUpdateParam(effect, 'delayTime', value as number | string);
          } else {
            this.safeUpdateParam(effect, paramName, value as number | string);
          }
        }
      }
    });
    
    console.log('Delay actualizado:', {
      delayTime: effect.delayTime,
      feedback: effect.feedback
    });
  }

  /**
   * Valida si este updater puede manejar el tipo de efecto especificado
   * @param effect Nodo de efecto a validar
   * @returns true si puede manejar el efecto, false en caso contrario
   */
  canUpdate(effect: Tone.FeedbackDelay): boolean {
    return effect instanceof Tone.FeedbackDelay;
  }

  /**
   * Obtiene los parámetros actuales del efecto
   * @param effect Nodo de efecto
   * @returns Objeto con los parámetros actuales
   */
  getCurrentParams(effect: Tone.FeedbackDelay): Record<string, any> {
    return {
      delayTime: effect.delayTime || '8n',
      feedback: effect.feedback || 0.5,
      wet: effect.wet?.value || 0.5
    };
  }

  /**
   * Valida un parámetro específico
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

  /**
   * Actualiza un parámetro de manera segura
   * @param effect Nodo de efecto
   * @param paramName Nombre del parámetro
   * @param value Valor a asignar
   */
  private safeUpdateParam(effect: Tone.FeedbackDelay, paramName: string, value: number | string): boolean {
    try {
      const pathParts = paramName.split('.');
      let current: Record<string, unknown> = effect as unknown as Record<string, unknown>;
      
      // Navegar hasta el penúltimo elemento del path
      for (let i = 0; i < pathParts.length - 1; i++) {
        if (current && current[pathParts[i]]) {
          current = current[pathParts[i]] as Record<string, unknown>;
        } else {
          return false;
        }
      }
      
      const lastPart = pathParts[pathParts.length - 1];
      const target = current[lastPart];
      
      if (target !== undefined) {
        if (typeof target === 'object' && target !== null && 'rampTo' in target && typeof (target as { rampTo: unknown }).rampTo === 'function') {
          (target as { rampTo: (value: number | string, time: number) => void }).rampTo(value, 0.1);
          return true;
        } else if (typeof target === 'object' && target !== null && 'setValueAtTime' in target && typeof (target as { setValueAtTime: unknown }).setValueAtTime === 'function') {
          (target as { setValueAtTime: (value: number | string, time: number) => void }).setValueAtTime(value, effect.context.currentTime);
          return true;
        } else if (typeof target === 'number' || typeof target === 'string') {
          current[lastPart] = value;
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }
}
