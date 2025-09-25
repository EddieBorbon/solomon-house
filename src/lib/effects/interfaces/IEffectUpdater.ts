import * as Tone from 'tone';
import { EffectParams } from '../../managers/EffectManager';

/**
 * Interface para updaters de efectos
 * Implementa el Strategy Pattern para actualizar parámetros de efectos
 */
export interface IEffectUpdater<T extends Tone.ToneAudioNode = Tone.ToneAudioNode> {
  /**
   * Tipo de efecto que maneja este updater
   */
  readonly effectType: string;
  
  /**
   * Actualiza los parámetros de un efecto
   * @param effect Nodo de efecto a actualizar
   * @param params Parámetros a aplicar
   */
  updateParams(effect: T, params: EffectParams): void;
  
  /**
   * Valida si este updater puede manejar el tipo de efecto especificado
   * @param effect Nodo de efecto a validar
   * @returns true si puede manejar el efecto, false en caso contrario
   */
  canUpdate(effect: T): boolean;
  
  /**
   * Obtiene los parámetros actuales del efecto
   * @param effect Nodo de efecto
   * @returns Objeto con los parámetros actuales
   */
  getCurrentParams(effect: T): Record<string, unknown>;
  
  /**
   * Valida un parámetro específico
   * @param paramName Nombre del parámetro
   * @param value Valor a validar
   * @returns true si el valor es válido, false en caso contrario
   */
  validateParam(paramName: string, value: unknown): boolean;
}

/**
 * Interface para el registry de updaters
 * Implementa el Registry Pattern para gestionar múltiples updaters
 */
export interface IEffectUpdaterRegistry {
  /**
   * Registra un updater para un tipo de efecto
   * @param updater Updater a registrar
   */
  register<T extends Tone.ToneAudioNode>(updater: IEffectUpdater<T>): void;
  
  /**
   * Actualiza los parámetros de un efecto
   * @param effect Nodo de efecto a actualizar
   * @param params Parámetros a aplicar
   * @throws Error si no existe updater para el tipo de efecto
   */
  updateEffect(effect: Tone.ToneAudioNode, params: EffectParams): void;
  
  /**
   * Obtiene el updater para un tipo de efecto
   * @param effect Nodo de efecto
   * @returns El updater correspondiente o undefined
   */
  getUpdater(effect: Tone.ToneAudioNode): IEffectUpdater | undefined;
  
  /**
   * Obtiene los parámetros actuales de un efecto
   * @param effect Nodo de efecto
   * @returns Objeto con los parámetros actuales
   */
  getCurrentParams(effect: Tone.ToneAudioNode): Record<string, unknown>;
}
