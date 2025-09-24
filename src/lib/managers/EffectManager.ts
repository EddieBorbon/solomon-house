import * as Tone from 'tone';
import { type EffectZone } from '../../state/useWorldStore';
import { EffectManagerRefactored } from '../effects/EffectManagerRefactored';

// Tipos para efectos
export type EffectType = 'phaser' | 'autoFilter' | 'autoWah' | 'bitCrusher' | 'chebyshev' | 'chorus' | 'distortion' | 'feedbackDelay' | 'freeverb' | 'frequencyShifter' | 'jcReverb' | 'pingPongDelay' | 'pitchShift' | 'reverb' | 'stereoWidener' | 'tremolo' | 'vibrato';

// Type for effect parameters
export type EffectParams = EffectZone['effectParams'];

// Union type for all possible effect nodes
export type EffectNode = Tone.Phaser | Tone.AutoFilter | Tone.AutoWah | Tone.BitCrusher | Tone.Chebyshev | Tone.Chorus | Tone.Distortion | Tone.FeedbackDelay | Tone.Freeverb | Tone.FrequencyShifter | Tone.JCReverb | Tone.PingPongDelay | Tone.PitchShift | Tone.Reverb | Tone.StereoWidener | Tone.Tremolo | Tone.Vibrato;

// Estructura de un efecto global
export interface GlobalEffect {
  effectNode: EffectNode;
  panner: Tone.Panner3D;
  position: [number, number, number];
}

export class EffectManager {
  private globalEffects: Map<string, GlobalEffect> = new Map();
  private testOscillators: Map<string, Tone.Oscillator> = new Map();
  private effectZoneRadii: Map<string, number> = new Map();
  private lastEffectIntensities: Map<string, number> = new Map();
  
  // Instancia del manager refactorizado para migración gradual
  private refactoredManager: EffectManagerRefactored;

  constructor() {
    // Inicializar el manager refactorizado
    this.refactoredManager = new EffectManagerRefactored();
  }

  /**
   * Crea un efecto global con espacialización independiente
   * MIGRADO: Ahora delega al manager refactorizado
   */
  public createGlobalEffect(effectId: string, type: EffectType, position: [number, number, number]): void {
    
    // Delegar al manager refactorizado
    this.refactoredManager.createGlobalEffect(effectId, type, position);
    
    // Sincronizar el estado local con el manager refactorizado
    const refactoredEffect = this.refactoredManager.getGlobalEffect(effectId);
    if (refactoredEffect) {
      this.globalEffects.set(effectId, refactoredEffect);
      this.effectZoneRadii.set(effectId, this.refactoredManager.getEffectZoneRadius(effectId));
    }
  }

  /**
   * Obtiene un efecto global por ID
   */
  public getGlobalEffect(effectId: string): GlobalEffect | undefined {
    return this.globalEffects.get(effectId);
  }

  /**
   * Actualiza los parámetros de un efecto global
   * MIGRADO: Ahora delega al manager refactorizado usando Strategy Pattern
   */
  public updateGlobalEffect(effectId: string, params: EffectParams): void {
    
    // Delegar al manager refactorizado (usa Strategy Pattern internamente)
    this.refactoredManager.updateGlobalEffect(effectId, params);
    
    // Sincronizar el estado local si es necesario
    const refactoredEffect = this.refactoredManager.getGlobalEffect(effectId);
    if (refactoredEffect && !this.globalEffects.has(effectId)) {
      this.globalEffects.set(effectId, refactoredEffect);
    }
  }

  
  /**
   * Fuerza la actualización de un efecto global reiniciando su oscilador de prueba
   * MIGRADO: Ahora delega al manager refactorizado usando Strategy Pattern
   */
  public refreshGlobalEffect(effectId: string): void {
    // console.log(`🔄 EffectManager: Delegando refresco del efecto ${effectId} al manager refactorizado`);
    
    // Delegar al manager refactorizado (usa Strategy Pattern internamente)
    this.refactoredManager.refreshGlobalEffect(effectId);
  }

  /**
   * Elimina un efecto global
   * MIGRADO: Ahora delega al manager refactorizado
   */
  public removeGlobalEffect(effectId: string): void {
    // console.log(`🔄 EffectManager: Delegando eliminación del efecto ${effectId} al manager refactorizado`);
    
    // Delegar al manager refactorizado
    this.refactoredManager.removeGlobalEffect(effectId);
    
    // Limpiar el estado local
    this.globalEffects.delete(effectId);
    this.effectZoneRadii.delete(effectId);
    this.lastEffectIntensities.delete(effectId);
    
    // console.log(`✅ EffectManager: Estado local limpiado para efecto ${effectId}`);
  }

  /**
   * Fuerza la actualización de todos los efectos globales activos
   * MIGRADO: Ahora delega al manager refactorizado
   */
  public refreshAllGlobalEffects(): void {
    // console.log(`🔄 EffectManager: Delegando refresco de todos los efectos al manager refactorizado`);
    
    // Delegar al manager refactorizado
    this.refactoredManager.refreshAllGlobalEffects();
  }

  /**
   * Fuerza la actualización de un efecto específico con estrategias optimizadas
   */
  public forceEffectUpdate(effectId: string, paramName: string, newValue: number | string): void {
    const effectData = this.globalEffects.get(effectId);
    if (!effectData) {
      // console.warn(`⚠️ EffectManager: No se encontró efecto global con ID ${effectId} para forzar actualización`);
      return;
    }

    try {
      const { effectNode } = effectData;
      
      // Estrategias específicas para parámetros críticos
      if (effectNode instanceof Tone.BitCrusher && paramName === 'bits') {
        this.refreshGlobalEffect(effectId);
      } else if (effectNode instanceof Tone.Chebyshev && paramName === 'order') {
        this.refreshGlobalEffect(effectId);
      } else {
        this.refreshGlobalEffect(effectId);
      }
      
    } catch (error) {
       console.error(`❌ EffectManager: Error al forzar actualización del efecto:`, error);
    }
  }

  /**
   * Función de utilidad para actualizar parámetros de manera segura
   */
  private safeUpdateParam(effectNode: EffectNode, paramPath: string, newValue: number | string): boolean {
    try {
      const pathParts = paramPath.split('.');
      let current: Record<string, unknown> = effectNode as unknown as Record<string, unknown>;
      
      // Navegar hasta el penúltimo elemento del path
      for (let i = 0; i < pathParts.length - 1; i++) {
        if (current && current[pathParts[i]]) {
          current = current[pathParts[i]] as Record<string, unknown>;
        } else {
          // console.log(`ℹ️ EffectManager: Path ${paramPath} no válido en ${effectNode.constructor.name}`);
          return false;
        }
      }
      
      const lastPart = pathParts[pathParts.length - 1];
      const target = current[lastPart];
      
      if (target !== undefined) {
      if (typeof target === 'object' && target !== null && 'rampTo' in target && typeof (target as { rampTo: unknown }).rampTo === 'function') {
        (target as { rampTo: (value: number | string, time: number) => void }).rampTo(newValue, 0.1);
        return true;
      } else if (typeof target === 'object' && target !== null && 'setValueAtTime' in target && typeof (target as { setValueAtTime: unknown }).setValueAtTime === 'function') {
        (target as { setValueAtTime: (value: number | string, time: number) => void }).setValueAtTime(newValue, effectNode.context.currentTime);
          return true;
        } else if (typeof target === 'number' || typeof target === 'string') {
          current[lastPart] = newValue;
          return true;
        } else {
          // console.log(`ℹ️ EffectManager: Parámetro ${paramPath} no es configurable en tiempo real`);
          return false;
        }
      } else {
        // console.log(`ℹ️ EffectManager: Parámetro ${paramPath} no encontrado`);
        return false;
      }
    } catch (error) {
      // console.log(`ℹ️ EffectManager: Error al actualizar ${paramPath}:`, error);
      return false;
    }
  }

  /**
   * Configura el radio de una zona de efectos
   */
  public setEffectZoneRadius(effectId: string, radius: number): void {
    this.effectZoneRadii.set(effectId, radius);
    // console.log(`🎛️ EffectManager: Radio de zona de efecto ${effectId} configurado a ${radius} unidades`);
  }

  /**
   * Obtiene el radio de una zona de efectos
   */
  public getEffectZoneRadius(effectId: string): number {
    const radius = this.effectZoneRadii.get(effectId) || 2.0;
    // console.log(`📏 EffectManager: Radio para zona de efecto ${effectId}: ${radius} unidades`);
    return radius;
  }

  /**
   * Actualiza la posición 3D de una zona de efecto
   * MIGRADO: Ahora delega al manager refactorizado
   */
  public updateEffectZonePosition(id: string, position: [number, number, number]): void {
    // console.log(`🔄 EffectManager: Delegando actualización de posición del efecto ${id} al manager refactorizado`);
    
    // Delegar al manager refactorizado
    this.refactoredManager.updateEffectZonePosition(id, position);
    
    // Sincronizar el estado local si es necesario
    const refactoredEffect = this.refactoredManager.getGlobalEffect(id);
    if (refactoredEffect && this.globalEffects.has(id)) {
      this.globalEffects.set(id, refactoredEffect);
      // console.log(`✅ EffectManager: Estado local sincronizado para efecto ${id}`);
    }
  }

  /**
   * Obtiene todos los efectos globales
   */
  public getAllGlobalEffects(): Map<string, GlobalEffect> {
    return this.globalEffects;
  }

  /**
   * Limpia todos los recursos del EffectManager
   * MIGRADO: Ahora delega al manager refactorizado
   */
  public cleanup(): void {
    // console.log(`🔄 EffectManager: Delegando limpieza completa al manager refactorizado`);
    
    // Delegar al manager refactorizado
    this.refactoredManager.cleanup();
    
    // Limpiar el estado local
    this.globalEffects.clear();
    this.effectZoneRadii.clear();
    this.lastEffectIntensities.clear();
    
    // console.log(`✅ EffectManager: Limpieza completada y estado local limpiado`);
  }
}
