import * as Tone from 'tone';
import { IEffectFactory } from '../interfaces/IEffectFactory';
import { EffectType, EffectNode } from '../../managers/EffectManager';

/**
 * Factory para crear efectos PitchShift
 * Implementa el Factory Pattern específico para PitchShift
 */
export class PitchShiftFactory implements IEffectFactory {
  readonly effectType: EffectType = 'pitchShift';

  /**
   * Crea un nuevo nodo PitchShift con parámetros por defecto
   * @returns El nodo PitchShift creado
   */
  createEffect(): EffectNode {
    const effectNode = new Tone.PitchShift({
      pitch: 0,         // Desplazamiento de pitch en semitonos
      windowSize: 0.1   // Tamaño de ventana para análisis
    });
    
    // Configurar wet después de la creación
    effectNode.wet.value = 0.5;

    console.log(`🎛️ PitchShiftFactory: PitchShift creado con parámetros iniciales:`, {
      pitch: effectNode.pitch,
      windowSize: effectNode.windowSize,
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
    return type === 'pitchShift';
  }

  /**
   * Obtiene los parámetros por defecto para PitchShift
   * @returns Objeto con los parámetros por defecto
   */
  getDefaultParams(): Record<string, unknown> {
    return {
      pitch: 0,          // Desplazamiento de pitch en semitonos (-24 a 24)
      windowSize: 0.1,  // Tamaño de ventana (0.01 a 1)
      overlap: 0.1,     // Solapamiento (0.01 a 1)
      wet: 0.5         // Mezcla entre señal seca y procesada
    };
  }

  /**
   * Valida un parámetro específico para PitchShift
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
}
