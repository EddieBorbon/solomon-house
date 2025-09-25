import * as Tone from 'tone';
import { IEffectUpdater } from '../interfaces/IEffectUpdater';
import { EffectParams } from '../../managers/EffectManager';

/**
 * Updater para efectos Chorus
 * Implementa el Strategy Pattern específico para Chorus
 */
export class ChorusUpdater implements IEffectUpdater<Tone.Chorus> {
  readonly effectType = 'Chorus';

  /**
   * Actualiza los parámetros de un efecto Chorus
   * @param effect Nodo Chorus a actualizar
   * @param params Parámetros a aplicar
   */
  updateParams(effect: Tone.Chorus, params: EffectParams): void {
    Object.keys(params).forEach(paramName => {
      if (params[paramName as keyof EffectParams] !== undefined) {
        const value = params[paramName as keyof EffectParams];
        if (value !== undefined) {
          if (paramName === 'chorusFrequency') {
            this.safeUpdateParam(effect, 'frequency', value as number | string);
          } else if (paramName === 'chorusDepth') {
            this.safeUpdateParam(effect, 'depth', value as number | string);
          } else if (paramName === 'chorusType') {
            this.safeUpdateParam(effect, 'type', value as number | string);
          } else {
            this.safeUpdateParam(effect, paramName, value as number | string);
          }
        }
      }
    });
    
    console.log('Chorus actualizado:', {
      frequency: effect.frequency?.value || 'N/A',
      delayTime: effect.delayTime || 'N/A',
      depth: effect.depth || 'N/A',
      feedback: effect.feedback?.value || 'N/A',
      spread: effect.spread || 'N/A',
      type: effect.type || 'N/A'
    });
  }

  /**
   * Valida si este updater puede manejar el tipo de efecto especificado
   * @param effect Nodo de efecto a validar
   * @returns true si puede manejar el efecto, false en caso contrario
   */
  canUpdate(effect: Tone.Chorus): boolean {
    return effect instanceof Tone.Chorus;
  }

  /**
   * Obtiene los parámetros actuales del efecto
   * @param effect Nodo de efecto
   * @returns Objeto con los parámetros actuales
   */
  getCurrentParams(effect: Tone.Chorus): Record<string, any> {
    return {
      frequency: effect.frequency?.value || 1.5,
      delayTime: effect.delayTime || 3.5,
      depth: effect.depth || 0.7,
      feedback: effect.feedback?.value || 0,
      spread: effect.spread || 180,
      type: effect.type || 'sine',
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

  /**
   * Actualiza un parámetro de manera segura
   * @param effect Nodo de efecto
   * @param paramName Nombre del parámetro
   * @param value Valor a asignar
   */
  private safeUpdateParam(effect: Tone.Chorus, paramName: string, value: number | string): boolean {
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
