import { EffectType, EffectParams, GlobalEffect } from '../../managers/EffectManager';
import { IEffectFactoryRegistry } from './IEffectFactory';
import { IEffectUpdaterRegistry } from './IEffectUpdater';
import { IEffectTestManager } from './IEffectTestManager';

/**
 * Interface principal para el EffectManager refactorizado
 * Implementa el Facade Pattern para coordinar todos los subsistemas
 */
export interface IEffectManager {
  /**
   * Crea un efecto global con espacialización independiente
   * @param effectId ID único del efecto
   * @param type Tipo de efecto a crear
   * @param position Posición 3D del efecto
   */
  createGlobalEffect(effectId: string, type: EffectType, position: [number, number, number]): void;
  
  /**
   * Actualiza los parámetros de un efecto global
   * @param effectId ID del efecto
   * @param params Parámetros a actualizar
   */
  updateGlobalEffect(effectId: string, params: EffectParams): void;
  
  /**
   * Elimina un efecto global
   * @param effectId ID del efecto
   */
  removeGlobalEffect(effectId: string): void;
  
  /**
   * Obtiene un efecto global por ID
   * @param effectId ID del efecto
   * @returns El efecto global o undefined
   */
  getGlobalEffect(effectId: string): GlobalEffect | undefined;
  
  /**
   * Obtiene todos los efectos globales
   * @returns Map con todos los efectos globales
   */
  getAllGlobalEffects(): Map<string, GlobalEffect>;
  
  /**
   * Refresca un efecto específico
   * @param effectId ID del efecto
   */
  refreshGlobalEffect(effectId: string): void;
  
  /**
   * Refresca todos los efectos globales activos
   */
  refreshAllGlobalEffects(): void;
  
  /**
   * Actualiza la posición 3D de una zona de efecto
   * @param id ID del efecto
   * @param position Nueva posición 3D
   */
  updateEffectZonePosition(id: string, position: [number, number, number]): void;
  
  /**
   * Configura el radio de una zona de efectos
   * @param effectId ID del efecto
   * @param radius Radio de la zona
   */
  setEffectZoneRadius(effectId: string, radius: number): void;
  
  /**
   * Obtiene el radio de una zona de efectos
   * @param effectId ID del efecto
   * @returns Radio de la zona
   */
  getEffectZoneRadius(effectId: string): number;
  
  /**
   * Limpia todos los recursos del EffectManager
   */
  cleanup(): void;
}

/**
 * Interface para configuración del EffectManager
 */
export interface IEffectManagerConfig {
  /**
   * Registry de factories de efectos
   */
  factoryRegistry: IEffectFactoryRegistry;
  
  /**
   * Registry de updaters de efectos
   */
  updaterRegistry: IEffectUpdaterRegistry;
  
  /**
   * Manager de osciladores de prueba
   */
  testManager: IEffectTestManager;
  
  /**
   * Configuración por defecto para efectos
   */
  defaultConfig?: {
    radius: number;
    position: [number, number, number];
  };
}
