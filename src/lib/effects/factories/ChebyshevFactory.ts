import * as Tone from 'tone';
import { IEffectFactory } from '../interfaces/IEffectFactory';
import { EffectType, EffectNode } from '../../managers/EffectManager';

/**
 * Factory para crear efectos Chebyshev
 * Implementa el Factory Pattern específico para Chebyshev
 */
export class ChebyshevFactory implements IEffectFactory {
  readonly effectType: EffectType = 'chebyshev';

  /**
   * Crea un nuevo nodo Chebyshev con parámetros por defecto
   * @returns El nodo Chebyshev creado
   */
  createEffect(): EffectNode {
    const effectNode = new Tone.Chebyshev({
      order: 50,       // Orden del polinomio para distorsión audible
      oversample: '2x', // Oversampling para mejor calidad
      wet: 0.5         // Mezcla entre señal seca y procesada
    });

    console.log(`🎛️ ChebyshevFactory: Chebyshev creado con parámetros iniciales:`, {
      order: effectNode.order,
      oversample: effectNode.oversample,
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
    return type === 'chebyshev';
  }

  /**
   * Obtiene los parámetros por defecto para Chebyshev
   * @returns Objeto con los parámetros por defecto
   */
  getDefaultParams(): Record<string, unknown> {
    return {
      order: 50,         // Orden del polinomio (1-100)
      oversample: '2x',  // Oversampling ('none', '2x', '4x')
      wet: 0.5           // Mezcla entre señal seca y procesada
    };
  }

  /**
   * Valida un parámetro específico para Chebyshev
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
}
