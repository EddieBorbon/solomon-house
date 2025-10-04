import * as Tone from 'tone';
import { IEffectUpdater, IEffectUpdaterRegistry } from '../interfaces/IEffectUpdater';
import { EffectParams } from '../../managers/EffectManager';

/**
 * Registry de updaters de efectos
 * Implementa el Registry Pattern para gestionar múltiples updaters
 */
export class EffectUpdaterRegistry implements IEffectUpdaterRegistry {
  private updaters = new Map<string, IEffectUpdater>();

  /**
   * Registra un updater para un tipo de efecto
   * @param updater Updater a registrar
   */
  register<T extends Tone.ToneAudioNode>(updater: IEffectUpdater<T>): void {
    this.updaters.set(updater.effectType, updater);
  }

  /**
   * Actualiza los parámetros de un efecto
   * @param effect Nodo de efecto a actualizar
   * @param params Parámetros a aplicar
   * @throws Error si no existe updater para el tipo de efecto
   */
  updateEffect(effect: Tone.ToneAudioNode, params: EffectParams): void {
    console.log('🔧 EffectUpdaterRegistry: updateEffect called', { 
      effectType: effect.constructor.name, 
      params 
    });
    
    const updater = this.getUpdater(effect);
    if (!updater) {
      console.error('❌ EffectUpdaterRegistry: No updater found', effect.constructor.name);
      console.log('🔧 EffectUpdaterRegistry: Available updaters:', Array.from(this.updaters.keys()));
      throw new Error(`No updater registered for effect type: ${effect.constructor.name}`);
    }

    try {
      console.log('🔧 EffectUpdaterRegistry: Using updater', updater.constructor.name);
      updater.updateParams(effect, params);
      console.log('✅ EffectUpdaterRegistry: Effect params updated successfully');
    } catch (error) {
      console.error('❌ EffectUpdaterRegistry: Error updating effect:', error);
      throw error;
    }
  }

  /**
   * Obtiene el updater para un tipo de efecto
   * @param effect Nodo de efecto
   * @returns El updater correspondiente o undefined
   */
  getUpdater(effect: Tone.ToneAudioNode): IEffectUpdater | undefined {
    const effectType = effect.constructor.name;
    return this.updaters.get(effectType);
  }

  /**
   * Obtiene los parámetros actuales de un efecto
   * @param effect Nodo de efecto
   * @returns Objeto con los parámetros actuales
   */
  getCurrentParams(effect: Tone.ToneAudioNode): Record<string, unknown> {
    const updater = this.getUpdater(effect);
    if (!updater) {
      return {};
    }

    try {
      return updater.getCurrentParams(effect);
    } catch {
      return {};
    }
  }

  /**
   * Obtiene todos los tipos de efectos soportados
   * @returns Array con todos los tipos soportados
   */
  getSupportedTypes(): string[] {
    return Array.from(this.updaters.keys());
  }

  /**
   * Verifica si un tipo de efecto está soportado
   * @param effect Nodo de efecto
   * @returns true si está soportado, false en caso contrario
   */
  isSupported(effect: Tone.ToneAudioNode): boolean {
    const effectType = effect.constructor.name;
    return this.updaters.has(effectType);
  }

  /**
   * Obtiene el número de updaters registrados
   * @returns Número de updaters registrados
   */
  getUpdaterCount(): number {
    return this.updaters.size;
  }

  /**
   * Limpia todos los updaters registrados
   */
  clear(): void {
    this.updaters.clear();
  }
}
