import { IEffectFactory, IEffectFactoryRegistry } from '../interfaces/IEffectFactory';
import { EffectType, EffectNode } from '../../managers/EffectManager';

/**
 * Registry de factories de efectos
 * Implementa el Registry Pattern para gestionar múltiples factories
 */
export class EffectFactoryRegistry implements IEffectFactoryRegistry {
  private factories = new Map<EffectType, IEffectFactory>();

  /**
   * Registra un factory para un tipo de efecto
   * @param factory Factory a registrar
   */
  register(factory: IEffectFactory): void {
    this.factories.set(factory.effectType, factory);
  }

  /**
   * Crea un efecto del tipo especificado
   * @param type Tipo de efecto a crear
   * @returns El nodo de efecto creado
   * @throws Error si no existe factory para el tipo
   */
  createEffect(type: EffectType): EffectNode {
    const factory = this.factories.get(type);
    if (!factory) {
      throw new Error(`No factory registered for effect type: ${type}`);
    }

    try {
      const effect = factory.createEffect();
      return effect;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene el factory para un tipo de efecto
   * @param type Tipo de efecto
   * @returns El factory correspondiente o undefined
   */
  getFactory(type: EffectType): IEffectFactory | undefined {
    return this.factories.get(type);
  }

  /**
   * Obtiene todos los tipos de efectos soportados
   * @returns Array con todos los tipos soportados
   */
  getSupportedTypes(): EffectType[] {
    return Array.from(this.factories.keys());
  }

  /**
   * Verifica si un tipo de efecto está soportado
   * @param type Tipo de efecto a verificar
   * @returns true si está soportado, false en caso contrario
   */
  isSupported(type: EffectType): boolean {
    return this.factories.has(type);
  }

  /**
   * Obtiene el número de factories registrados
   * @returns Número de factories registrados
   */
  getFactoryCount(): number {
    return this.factories.size;
  }

  /**
   * Limpia todos los factories registrados
   */
  clear(): void {
    this.factories.clear();
  }
}
