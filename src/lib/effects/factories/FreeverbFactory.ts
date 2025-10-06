import * as Tone from 'tone';
import { IEffectFactory } from '../interfaces/IEffectFactory';
import { EffectType, EffectNode } from '../../managers/EffectManager';

/**
 * Factory para crear efectos Freeverb
 * Implementa el Factory Pattern específico para Freeverb
 */
export class FreeverbFactory implements IEffectFactory {
  readonly effectType: EffectType = 'freeverb';

  /**
   * Crea un nuevo nodo Freeverb con parámetros por defecto
   * @returns El nodo Freeverb creado
   */
  createEffect(): EffectNode {
    const effectNode = new Tone.Freeverb({
      roomSize: 0.7,     // Tamaño de la habitación
      dampening: 3000,    // Frecuencia de amortiguación
      wet: 0.5           // Mezcla entre señal seca y procesada
    });

    console.log(`🎛️ FreeverbFactory: Freeverb creado con parámetros iniciales:`, {
      roomSize: effectNode.roomSize.value,
      dampening: effectNode.dampening,
      wet: effectNode.wet?.value || 0.5,
      readyForSpatialConnection: true
    });

    return effectNode;
  }

  /**
   * Valida si este factory puede crear el tipo de efecto especificado
   * @param type Tipo de efecto a validar
   * @returns true si puede crear el efecto, false en caso contrario
   */
  canCreate(type: EffectType): boolean {
    return type === 'freeverb';
  }

  /**
   * Obtiene los parámetros por defecto para Freeverb
   * @returns Objeto con los parámetros por defecto
   */
  getDefaultParams(): Record<string, unknown> {
    return {
      roomSize: 0.7,      // Tamaño de la habitación (0-1)
      dampening: 3000,    // Frecuencia de amortiguación (Hz)
      wet: 0.5           // Mezcla entre señal seca y procesada
    };
  }

  /**
   * Valida un parámetro específico para Freeverb
   * @param paramName Nombre del parámetro
   * @param value Valor a validar
   * @returns true si el valor es válido, false en caso contrario
   */
  validateParam(paramName: string, value: unknown): boolean {
    switch (paramName) {
      case 'roomSize':
        return typeof value === 'number' && value >= 0 && value <= 1;
      case 'dampening':
        return typeof value === 'number' && value >= 0 && value <= 20000;
      case 'wet':
        return typeof value === 'number' && value >= 0 && value <= 1;
      default:
        return false;
    }
  }
}
