import * as Tone from 'tone';
import { IEffectUpdater } from '../interfaces/IEffectUpdater';
import { EffectParams } from '../../managers/EffectManager';

/**
 * Updater para efectos Chebyshev
 * Implementa el Strategy Pattern específico para Chebyshev
 */
export class ChebyshevUpdater implements IEffectUpdater<Tone.Chebyshev> {
  readonly effectType = 'Chebyshev';

  /**
   * Actualiza los parámetros de un efecto Chebyshev
   * @param effect Nodo Chebyshev a actualizar
   * @param params Parámetros a aplicar
   */
  updateParams(effect: Tone.Chebyshev, params: EffectParams): void {
    Object.keys(params).forEach(paramName => {
      if (params[paramName as keyof EffectParams] !== undefined) {
        const value = params[paramName as keyof EffectParams];
        if (value !== undefined) {
          this.safeUpdateParam(effect, paramName, value as number | string);
        }
      }
    });
    
    console.log('Chebyshev actualizado:', {
      order: effect.order,
      oversample: effect.oversample,
      wet: effect.wet?.value || 'N/A'
    });
  }

  /**
   * Valida si este updater puede manejar el tipo de efecto especificado
   * @param effect Nodo de efecto a validar
   * @returns true si puede manejar el efecto, false en caso contrario
   */
  canUpdate(effect: Tone.ToneAudioNode): boolean {
    return effect instanceof Tone.Chebyshev;
  }

  /**
   * Obtiene los parámetros actuales del efecto
   * @param effect Nodo de efecto
   * @returns Objeto con los parámetros actuales
   */
  getCurrentParams(effect: Tone.Chebyshev): Record<string, unknown> {
    return {
      order: effect.order,
      oversample: effect.oversample,
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
      case 'order':
        return typeof value === 'number' && value >= 1 && value <= 100;
      case 'oversample':
        return typeof value === 'string' && ['none', '2x', '4x'].includes(value);
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
  private safeUpdateParam(effect: Tone.Chebyshev, paramName: string, value: number | string): boolean {
    try {
      switch (paramName) {
        case 'order':
          effect.order = value as number;
          break;
        case 'oversample':
          effect.oversample = value as 'none' | '2x' | '4x';
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
      console.warn(`⚠️ ChebyshevUpdater: Error actualizando parámetro ${paramName}:`, error);
      return false;
    }
  }
}
