import * as Tone from 'tone';
import { IEffectFactory } from '../interfaces/IEffectFactory';
import { EffectType, EffectNode } from '../../managers/EffectManager';

/**
 * Factory para crear efectos AutoWah
 * Implementa el Factory Pattern específico para AutoWah
 */
export class AutoWahFactory implements IEffectFactory {
  readonly effectType: EffectType = 'autoWah';

  /**
   * Crea un nuevo nodo AutoWah con parámetros por defecto
   * @returns El nodo AutoWah creado
   */
  createEffect(): EffectNode {
    const effectNode = new Tone.AutoWah({
      baseFrequency: 50,    // Frecuencia base del filtro (Hz) - como en la documentación
      octaves: 6,          // Número de octavas del barrido - como en la documentación
      sensitivity: -30,    // Sensibilidad en dB (rango -40 a 0) - como en la documentación
    });

    // Configurar Q para mayor efecto (como en el ejemplo de la documentación)
    effectNode.Q.value = 6;

    // NOTA: No conectamos directamente al destino aquí porque el EffectManager
    // se encarga de la conexión espacial con el panner 3D
    // El EffectManager hará: effectNode.chain(effectPanner, Tone.Destination)

    console.log(`🎛️ AutoWahFactory: AutoWah creado con parámetros optimizados:`, {
      baseFrequency: effectNode.baseFrequency,
      octaves: effectNode.octaves,
      sensitivity: effectNode.sensitivity,
      qValue: effectNode.Q.value,
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
    return type === 'autoWah';
  }

  /**
   * Obtiene los parámetros por defecto para AutoWah
   * @returns Objeto con los parámetros por defecto
   */
  getDefaultParams(): Record<string, unknown> {
    return {
      baseFrequency: 50,    // Frecuencia base del filtro (Hz)
      octaves: 6,          // Número de octavas del barrido
      sensitivity: -30,    // Sensibilidad en dB (rango -40 a 0)
      qValue: 6,           // Factor Q del filtro
      wet: 0.5             // Mezcla entre señal seca y procesada
    };
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
}
