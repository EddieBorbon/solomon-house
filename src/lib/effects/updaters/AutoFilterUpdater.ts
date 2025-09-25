import * as Tone from 'tone';
import { IEffectUpdater } from '../interfaces/IEffectUpdater';
import { EffectParams } from '../../managers/EffectManager';

/**
 * Updater para efectos AutoFilter
 * Implementa el Strategy Pattern específico para AutoFilter
 */
export class AutoFilterUpdater implements IEffectUpdater<Tone.AutoFilter> {
  readonly effectType = 'AutoFilter';

  /**
   * Actualiza los parámetros de un efecto AutoFilter
   * @param effect Nodo AutoFilter a actualizar
   * @param params Parámetros a aplicar
   */
  updateParams(effect: Tone.AutoFilter, params: EffectParams): void {
    Object.keys(params).forEach(paramName => {
      if (params[paramName as keyof EffectParams] !== undefined) {
        const value = params[paramName as keyof EffectParams];
        if (value !== undefined) {
          if (paramName === 'filterType' && effect.filter) {
            this.safeUpdateParam(effect, 'filter.type', value as number | string);
          } else if (paramName === 'filterQ' && effect.filter) {
            this.safeUpdateParam(effect, 'filter.Q', value as number | string);
          } else {
            this.safeUpdateParam(effect, paramName, value as number | string);
          }
        }
      }
    });
    
    console.log('AutoFilter actualizado:', {
      frequency: effect.frequency?.value || 'N/A',
      baseFrequency: effect.baseFrequency || 'N/A',
      octaves: effect.octaves || 'N/A',
      depth: effect.depth?.value || 'N/A',
      filterType: effect.filter?.type || 'N/A',
      filterQ: effect.filter?.Q?.value || 'N/A',
      lfoType: effect.type || 'N/A'
    });
  }

  /**
   * Valida si este updater puede manejar el tipo de efecto especificado
   * @param effect Nodo de efecto a validar
   * @returns true si puede manejar el efecto, false en caso contrario
   */
  canUpdate(effect: Tone.AutoFilter): boolean {
    return effect instanceof Tone.AutoFilter;
  }

  /**
   * Obtiene los parámetros actuales del efecto
   * @param effect Nodo de efecto
   * @returns Objeto con los parámetros actuales
   */
  getCurrentParams(effect: Tone.AutoFilter): Record<string, unknown> {
    return {
      frequency: effect.frequency?.value || 0.5,
      baseFrequency: effect.baseFrequency || 200,
      octaves: effect.octaves || 2.6,
      depth: effect.depth?.value || 0.5,
      filterType: effect.filter?.type || 'lowpass',
      filterQ: effect.filter?.Q?.value || 1,
      lfoType: effect.type || 'sine',
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

  /**
   * Actualiza un parámetro de manera segura
   * @param effect Nodo de efecto
   * @param paramName Nombre del parámetro
   * @param value Valor a asignar
   */
  private safeUpdateParam(effect: Tone.AutoFilter, paramName: string, value: number | string): boolean {
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
    } catch {
      return false;
    }
  }
}
