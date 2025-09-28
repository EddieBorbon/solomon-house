import * as Tone from 'tone';
import { IEffectUpdater } from '../interfaces/IEffectUpdater';
import { EffectParams } from '../../managers/EffectManager';

/**
 * Updater para efectos PingPongDelay
 * Implementa el Strategy Pattern específico para PingPongDelay
 */
export class PingPongDelayUpdater implements IEffectUpdater<Tone.PingPongDelay> {
  readonly effectType = 'PingPongDelay';

  /**
   * Actualiza los parámetros de un efecto PingPongDelay
   * @param effect Nodo PingPongDelay a actualizar
   * @param params Parámetros a aplicar
   */
  updateParams(effect: Tone.PingPongDelay, params: EffectParams): void {
    Object.keys(params).forEach(paramName => {
      if (params[paramName as keyof EffectParams] !== undefined) {
        const value = params[paramName as keyof EffectParams];
        if (value !== undefined) {
          this.safeUpdateParam(effect, paramName, value as number | string);
        }
      }
    });
    
    console.log('PingPongDelay actualizado:', {
      delayTime: effect.delayTime.value,
      feedback: effect.feedback.value,
      wet: effect.wet?.value || 'N/A'
    });
  }

  /**
   * Valida si este updater puede manejar el tipo de efecto especificado
   * @param effect Nodo de efecto a validar
   * @returns true si puede manejar el efecto, false en caso contrario
   */
  canUpdate(effect: Tone.ToneAudioNode): boolean {
    return effect instanceof Tone.PingPongDelay;
  }

  /**
   * Obtiene los parámetros actuales del efecto
   * @param effect Nodo de efecto
   * @returns Objeto con los parámetros actuales
   */
  getCurrentParams(effect: Tone.PingPongDelay): Record<string, unknown> {
    return {
      delayTime: effect.delayTime.value,
      feedback: effect.feedback.value,
      wet: effect.wet?.value || 0.5
    };
  }

  /**
   * Valida un parámetro específico
   * @param paramName Nombre del parámetro
   * @param value Valor a validar
   * @returns true si el valor es válido, false en caso contrario
   */
  validateParam(paramName: string, value: unknown): boolean {
    switch (paramName) {
      case 'delayTime':
        return typeof value === 'string' || (typeof value === 'number' && value >= 0);
      case 'feedback':
        return typeof value === 'number' && value >= 0 && value <= 1;
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
  private safeUpdateParam(effect: Tone.PingPongDelay, paramName: string, value: number | string): boolean {
    try {
      switch (paramName) {
        case 'delayTime':
          effect.delayTime.value = value as string | number;
          break;
        case 'feedback':
          effect.feedback.value = value as number;
          break;
        case 'wet':
          if (effect.wet) {
            effect.wet.value = value as number;
          }
          break;
        default:
          return false;
      }
      return true;
    } catch (error) {
      console.warn(`⚠️ PingPongDelayUpdater: Error actualizando parámetro ${paramName}:`, error);
      return false;
    }
  }
}
