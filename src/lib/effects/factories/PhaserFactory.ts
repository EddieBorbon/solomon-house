import * as Tone from 'tone';
import { IEffectFactory } from '../interfaces/IEffectFactory';
import { EffectType, EffectNode } from '../../managers/EffectManager';

/**
 * Factory para crear efectos Phaser
 * Implementa el Factory Pattern específico para Phaser
 */
export class PhaserFactory implements IEffectFactory {
  readonly effectType: EffectType = 'phaser';

  /**
   * Crea un nuevo nodo Phaser con parámetros por defecto
   * @returns El nodo Phaser creado
   */
  createEffect(): EffectNode {
    const effectNode = new Tone.Phaser({
      frequency: 0.5,
      octaves: 2.2,
      baseFrequency: 1000,
    });

    console.log(`🎛️ PhaserFactory: Phaser creado con parámetros iniciales:`, {
      frequency: effectNode.frequency.value,
      octaves: effectNode.octaves,
      baseFrequency: effectNode.baseFrequency
    });

    return effectNode;
  }

  /**
   * Valida si este factory puede crear el tipo de efecto especificado
   * @param type Tipo de efecto a validar
   * @returns true si puede crear el efecto, false en caso contrario
   */
  canCreate(type: EffectType): boolean {
    return type === 'phaser';
  }

  /**
   * Obtiene los parámetros por defecto para Phaser
   * @returns Objeto con los parámetros por defecto
   */
  getDefaultParams(): Record<string, any> {
    return {
      frequency: 0.5,
      octaves: 2.2,
      baseFrequency: 1000,
      wet: 0.5
    };
  }

  /**
   * Valida un parámetro específico para Phaser
   * @param paramName Nombre del parámetro
   * @param value Valor a validar
   * @returns true si el valor es válido, false en caso contrario
   */
  validateParam(paramName: string, value: any): boolean {
    switch (paramName) {
      case 'frequency':
        return typeof value === 'number' && value >= 0 && value <= 20;
      case 'octaves':
        return typeof value === 'number' && value >= 0 && value <= 10;
      case 'baseFrequency':
        return typeof value === 'number' && value >= 20 && value <= 20000;
      case 'wet':
        return typeof value === 'number' && value >= 0 && value <= 1;
      default:
        return false;
    }
  }
}
