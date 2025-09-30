import * as Tone from 'tone';
import { IEffectUpdater } from '../interfaces/IEffectUpdater';
import { EffectParams } from '../../managers/EffectManager';

/**
 * Updater para efectos BitCrusher
 * Implementa el Strategy Pattern específico para BitCrusher
 */
export class BitCrusherUpdater implements IEffectUpdater<Tone.BitCrusher> {
  readonly effectType = 'BitCrusher';

  /**
   * Actualiza los parámetros de un efecto BitCrusher
   * @param effect Nodo BitCrusher a actualizar
   * @param params Parámetros a aplicar
   */
  updateParams(effect: Tone.BitCrusher, params: EffectParams): void {
    Object.keys(params).forEach(paramName => {
      if (params[paramName as keyof EffectParams] !== undefined) {
        const value = params[paramName as keyof EffectParams];
        if (value !== undefined) {
          this.safeUpdateParam(effect, paramName, value as number | string);
        }
      }
    });
    
    console.log('BitCrusher actualizado:', {
      bits: effect.bits,
      wet: effect.wet?.value || 'N/A'
    });
  }

  /**
   * Valida si este updater puede manejar el tipo de efecto especificado
   * @param effect Nodo de efecto a validar
   * @returns true si puede manejar el efecto, false en caso contrario
   */
  canUpdate(effect: Tone.ToneAudioNode): boolean {
    return effect instanceof Tone.BitCrusher;
  }

  /**
   * Obtiene los parámetros actuales del efecto
   * @param effect Nodo de efecto
   * @returns Objeto con los parámetros actuales
   */
  getCurrentParams(effect: Tone.BitCrusher): Record<string, unknown> {
    return {
      bits: effect.bits,
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
      case 'bits':
        return typeof value === 'number' && value >= 1 && value <= 16;
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
  private safeUpdateParam(effect: Tone.BitCrusher, paramName: string, value: number | string): boolean {
    try {
      switch (paramName) {
        case 'bits':
          // bits es una propiedad de solo lectura, no se puede modificar después de la creación
          console.warn('BitCrusherUpdater: bits es de solo lectura, no se puede modificar');
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
      console.warn(`⚠️ BitCrusherUpdater: Error actualizando parámetro ${paramName}:`, error);
      return false;
    }
  }
}
