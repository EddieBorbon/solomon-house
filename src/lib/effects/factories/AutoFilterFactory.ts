import * as Tone from 'tone';
import { IEffectFactory } from '../interfaces/IEffectFactory';
import { EffectType, EffectNode } from '../../managers/EffectManager';

/**
 * Factory para crear efectos AutoFilter
 * Implementa el Factory Pattern específico para AutoFilter
 */
export class AutoFilterFactory implements IEffectFactory {
  readonly effectType: EffectType = 'autoFilter';

  /**
   * Crea un nuevo nodo AutoFilter con parámetros por defecto
   * @returns El nodo AutoFilter creado
   */
  createEffect(): EffectNode {
    const effectNode = new Tone.AutoFilter({
      frequency: "4n",  // Frecuencia del LFO en notación musical (más audible)
      baseFrequency: 200,
      octaves: 2.6,
      depth: 0.8,  // Mayor profundidad para efecto más notable
      filter: {
        type: 'lowpass',
        rolloff: -12,
        Q: 1,
      },
      type: 'sine',
    });

    // CRÍTICO: Iniciar el AutoFilter para que el LFO comience a modular el filtro
    // Según la documentación de Tone.js, el AutoFilter debe ser iniciado con .start()
    effectNode.start();

    console.log(`🎛️ AutoFilterFactory: AutoFilter creado e iniciado con parámetros iniciales:`, {
      frequency: effectNode.frequency.value,
      baseFrequency: effectNode.baseFrequency,
      octaves: effectNode.octaves,
      depth: effectNode.depth.value,
      filterType: effectNode.filter.type,
      filterQ: effectNode.filter.Q.value,
      lfoStarted: true
    });

    return effectNode;
  }

  /**
   * Valida si este factory puede crear el tipo de efecto especificado
   * @param type Tipo de efecto a validar
   * @returns true si puede crear el efecto, false en caso contrario
   */
  canCreate(type: EffectType): boolean {
    return type === 'autoFilter';
  }

  /**
   * Obtiene los parámetros por defecto para AutoFilter
   * @returns Objeto con los parámetros por defecto
   */
  getDefaultParams(): Record<string, unknown> {
    return {
      frequency: "4n",     // Frecuencia del LFO en notación musical
      baseFrequency: 200,  // Frecuencia base del filtro (Hz)
      octaves: 2.6,        // Número de octavas del filtro
      depth: 0.8,          // Profundidad de modulación (0-1)
      filterType: 'lowpass', // Tipo de filtro
      filterQ: 1,          // Factor Q del filtro
      lfoType: 'sine',     // Tipo de onda del LFO
      wet: 0.5             // Mezcla entre señal seca y procesada
    };
  }

  /**
   * Valida un parámetro específico para AutoFilter
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
}
