import * as Tone from 'tone';
import { IEffectFactory } from '../interfaces/IEffectFactory';
import { EffectType, EffectNode } from '../../managers/EffectManager';

/**
 * Factory para crear efectos JCReverb
 * Implementa el Factory Pattern específico para JCReverb
 */
export class JCReverbFactory implements IEffectFactory {
  readonly effectType: EffectType = 'jcReverb';

  /**
   * Crea un nuevo nodo JCReverb con parámetros por defecto
   * @returns El nodo JCReverb creado
   */
  createEffect(): EffectNode {
    const effectNode = new Tone.JCReverb({
      roomSize: 0.5,     // Tamaño de la habitación
      wet: 0.5          // Mezcla entre señal seca y procesada
    });

    console.log(`🎛️ JCReverbFactory: JCReverb creado con parámetros iniciales:`, {
      roomSize: effectNode.roomSize.value,
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
    return type === 'jcReverb';
  }

  /**
   * Obtiene los parámetros por defecto para JCReverb
   * @returns Objeto con los parámetros por defecto
   */
  getDefaultParams(): Record<string, unknown> {
    return {
      roomSize: 0.5,      // Tamaño de la habitación (0-1)
      wet: 0.5           // Mezcla entre señal seca y procesada
    };
  }

  /**
   * Valida un parámetro específico para JCReverb
   * @param paramName Nombre del parámetro
   * @param value Valor a validar
   * @returns true si el valor es válido, false en caso contrario
   */
  validateParam(paramName: string, value: unknown): boolean {
    switch (paramName) {
      case 'roomSize':
        return typeof value === 'number' && value >= 0 && value <= 1;
      case 'wet':
        return typeof value === 'number' && value >= 0 && value <= 1;
      default:
        return false;
    }
  }
}
