import { EffectType, EffectNode } from '../../managers/EffectManager';

/**
 * Interface para factories de efectos
 * Implementa el Factory Pattern para crear nodos de efectos
 */
export interface IEffectFactory {
  /**
   * Tipo de efecto que maneja este factory
   */
  readonly effectType: EffectType;
  
  /**
   * Crea un nuevo nodo de efecto con parámetros por defecto
   * @returns El nodo de efecto creado
   */
  createEffect(): EffectNode;
  
  /**
   * Valida si este factory puede crear el tipo de efecto especificado
   * @param type Tipo de efecto a validar
   * @returns true si puede crear el efecto, false en caso contrario
   */
  canCreate(type: EffectType): boolean;
  
  /**
   * Obtiene los parámetros por defecto para este tipo de efecto
   * @returns Objeto con los parámetros por defecto
   */
  getDefaultParams(): Record<string, unknown>;
}

/**
 * Interface para el registry de factories
 * Implementa el Registry Pattern para gestionar múltiples factories
 */
export interface IEffectFactoryRegistry {
  /**
   * Registra un factory para un tipo de efecto
   * @param factory Factory a registrar
   */
  register(factory: IEffectFactory): void;
  
  /**
   * Crea un efecto del tipo especificado
   * @param type Tipo de efecto a crear
   * @returns El nodo de efecto creado
   * @throws Error si no existe factory para el tipo
   */
  createEffect(type: EffectType): EffectNode;
  
  /**
   * Obtiene el factory para un tipo de efecto
   * @param type Tipo de efecto
   * @returns El factory correspondiente o undefined
   */
  getFactory(type: EffectType): IEffectFactory | undefined;
  
  /**
   * Obtiene todos los tipos de efectos soportados
   * @returns Array con todos los tipos soportados
   */
  getSupportedTypes(): EffectType[];
  
  /**
   * Verifica si un tipo de efecto está soportado
   * @param type Tipo de efecto a verificar
   * @returns true si está soportado, false en caso contrario
   */
  isSupported(type: EffectType): boolean;
}
