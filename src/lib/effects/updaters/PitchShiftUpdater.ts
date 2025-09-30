import * as Tone from 'tone';
import { IEffectUpdater } from '../interfaces/IEffectUpdater';
import { EffectParams } from '../../managers/EffectManager';

/**
 * Updater para efectos PitchShift
 * Implementa el Strategy Pattern específico para PitchShift
 */
export class PitchShiftUpdater implements IEffectUpdater<Tone.PitchShift> {
  readonly effectType = 'PitchShift';

  /**
   * Actualiza los parámetros de un efecto PitchShift
   * @param effect Nodo PitchShift a actualizar
   * @param params Parámetros a aplicar
   */
  updateParams(effect: Tone.PitchShift, params: EffectParams): void {
    Object.keys(params).forEach(paramName => {
      if (params[paramName as keyof EffectParams] !== undefined) {
        const value = params[paramName as keyof EffectParams];
        if (value !== undefined) {
          this.safeUpdateParam(effect, paramName, value as number | string);
        }
      }
    });
    
    console.log('PitchShift actualizado:', {
      pitch: effect.pitch,
      windowSize: effect.windowSize,
      wet: effect.wet?.value || 'N/A'
    });
  }

  /**
   * Valida si este updater puede manejar el tipo de efecto especificado
   * @param effect Nodo de efecto a validar
   * @returns true si puede manejar el efecto, false en caso contrario
   */
  canUpdate(effect: Tone.ToneAudioNode): boolean {
    return effect instanceof Tone.PitchShift;
  }

  /**
   * Obtiene los parámetros actuales del efecto
   * @param effect Nodo de efecto
   * @returns Objeto con los parámetros actuales
   */
  getCurrentParams(effect: Tone.PitchShift): Record<string, unknown> {
    return {
      pitch: effect.pitch,
      windowSize: effect.windowSize,
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
      case 'pitch':
        return typeof value === 'number' && value >= -24 && value <= 24;
      case 'windowSize':
        return typeof value === 'number' && value >= 0.01 && value <= 1;
      case 'overlap':
        return typeof value === 'number' && value >= 0.01 && value <= 1;
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
  private safeUpdateParam(effect: Tone.PitchShift, paramName: string, value: number | string): boolean {
    try {
      switch (paramName) {
        case 'pitch':
          effect.pitch = value as number;
          break;
        case 'windowSize':
          effect.windowSize = value as number;
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
      console.warn(`⚠️ PitchShiftUpdater: Error actualizando parámetro ${paramName}:`, error);
      return false;
    }
  }
}
