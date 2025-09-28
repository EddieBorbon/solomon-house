import * as Tone from 'tone';
import { IEffectFactory } from '../interfaces/IEffectFactory';
import { EffectType, EffectNode } from '../../managers/EffectManager';

/**
 * Factory para crear efectos StereoWidener
 * Implementa el Factory Pattern específico para StereoWidener
 */
export class StereoWidenerFactory implements IEffectFactory {
  readonly effectType: EffectType = 'stereoWidener';

  /**
   * Crea un nuevo nodo StereoWidener con parámetros por defecto
   * @returns El nodo StereoWidener creado
   */
  createEffect(): EffectNode {
    const effectNode = new Tone.StereoWidener({
      width: 0.5,       // Ancho estéreo (0-1)
      wet: 0.5          // Mezcla entre señal seca y procesada
    });

    console.log(`🎛️ StereoWidenerFactory: StereoWidener creado con parámetros iniciales:`, {
      width: effectNode.width.value,
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
    return type === 'stereoWidener';
  }

  /**
   * Obtiene los parámetros por defecto para StereoWidener
   * @returns Objeto con los parámetros por defecto
   */
  getDefaultParams(): Record<string, unknown> {
    return {
      width: 0.5,        // Ancho estéreo (0-1)
      wet: 0.5          // Mezcla entre señal seca y procesada
    };
  }

  /**
   * Valida un parámetro específico para StereoWidener
   * @param paramName Nombre del parámetro
   * @param value Valor a validar
   * @returns true si el valor es válido, false en caso contrario
   */
  validateParam(paramName: string, value: unknown): boolean {
    switch (paramName) {
      case 'width':
        return typeof value === 'number' && value >= 0 && value <= 1;
      case 'wet':
        return typeof value === 'number' && value >= 0 && value <= 1;
      default:
        return false;
    }
  }
}
