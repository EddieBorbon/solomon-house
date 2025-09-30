import * as Tone from 'tone';
import { IEffectUpdater } from '../interfaces/IEffectUpdater';
import { EffectParams } from '../../managers/EffectManager';

/**
 * Updater para efectos AutoWah
 * Implementa el Strategy Pattern específico para AutoWah
 */
export class AutoWahUpdater implements IEffectUpdater<Tone.AutoWah> {
  readonly effectType = 'AutoWah';

  /**
   * Actualiza los parámetros de un efecto AutoWah
   * @param effect Nodo AutoWah a actualizar
   * @param params Parámetros a aplicar
   */
  updateParams(effect: Tone.AutoWah, params: EffectParams): void {
    Object.keys(params).forEach(paramName => {
      if (params[paramName as keyof EffectParams] !== undefined) {
        const value = params[paramName as keyof EffectParams];
        if (value !== undefined) {
          this.safeUpdateParam(effect, paramName, value as number | string);
        }
      }
    });
    
    console.log('🎛️ AutoWahUpdater: Parámetros actualizados:', {
      baseFrequency: effect.baseFrequency,
      octaves: effect.octaves,
      sensitivity: effect.sensitivity,
      qValue: effect.Q?.value,
      wet: effect.wet?.value
    });
  }

  /**
   * Valida si este updater puede manejar el tipo de efecto especificado
   * @param effect Nodo de efecto a validar
   * @returns true si puede manejar el efecto, false en caso contrario
   */
  canUpdate(effect: Tone.ToneAudioNode): boolean {
    return effect instanceof Tone.AutoWah;
  }

  /**
   * Valida un parámetro específico para AutoWah
   * @param paramName Nombre del parámetro
   * @param value Valor a validar
   * @returns true si el valor es válido, false en caso contrario
   */
  validateParam(paramName: string, value: unknown): boolean {
    switch (paramName) {
      case 'baseFrequency':
        return typeof value === 'number' && value >= 20 && value <= 20000;
      case 'octaves':
        return typeof value === 'number' && value >= 0 && value <= 10;
      case 'sensitivity':
        return typeof value === 'number' && value >= -40 && value <= 0;
      case 'qValue':
        return typeof value === 'number' && value >= 0.1 && value <= 30;
      case 'wet':
        return typeof value === 'number' && value >= 0 && value <= 1;
      default:
        return false;
    }
  }

  /**
   * Obtiene los parámetros actuales del efecto AutoWah
   * @param effect Nodo AutoWah
   * @returns Objeto con los parámetros actuales
   */
  getCurrentParams(effect: Tone.AutoWah): Record<string, unknown> {
    return {
      baseFrequency: effect.baseFrequency || 50,
      octaves: effect.octaves || 6,
      sensitivity: effect.sensitivity || -30,
      qValue: effect.Q?.value || 6,
      wet: effect.wet?.value || 0.5
    };
  }

  /**
   * Actualiza un parámetro de manera segura
   * @param effect Nodo de efecto
   * @param paramName Nombre del parámetro
   * @param value Valor a asignar
   */
  private safeUpdateParam(effect: Tone.AutoWah, paramName: string, value: number | string): void {
    try {
      // Manejar parámetros específicos del AutoWah
      switch (paramName) {
        case 'baseFrequency':
          if (effect.baseFrequency !== undefined) {
            effect.baseFrequency = value as number;
          }
          break;
        case 'octaves':
          if (effect.octaves !== undefined) {
            effect.octaves = value as number;
          }
          break;
        case 'sensitivity':
          if (effect.sensitivity !== undefined) {
            effect.sensitivity = value as number;
          }
          break;
        case 'qValue':
          if (effect.Q && 'value' in effect.Q) {
            (effect.Q as { value: number }).value = value as number;
          }
          break;
        case 'wet':
          if (effect.wet && 'value' in effect.wet) {
            (effect.wet as { value: number }).value = value as number;
          }
          break;
        default:
          // Intentar acceso genérico
          const typedEffect = effect as unknown as Record<string, unknown>;
          const param = typedEffect[paramName];
          if (param && typeof param === 'object' && 'value' in param) {
            (param as { value: number | string }).value = value;
          } else if (param !== undefined) {
            (typedEffect as Record<string, number | string>)[paramName] = value;
          }
          break;
      }
    } catch (error) {
      console.warn(`⚠️ AutoWahUpdater: Error actualizando parámetro ${paramName}:`, error);
    }
  }
}
