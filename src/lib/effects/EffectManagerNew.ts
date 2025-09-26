import { EffectType, EffectParams, GlobalEffect } from './types';
import { EffectFactory } from './EffectFactory';
import { EffectUpdaterFactory } from './EffectUpdater';
import { SpatialEffectManager } from './SpatialEffectManager';
import { TestOscillatorManager } from './TestOscillatorManager';

export class EffectManagerNew {
  private effectFactory: EffectFactory;
  private effectUpdaterFactory: EffectUpdaterFactory;
  private spatialEffectManager: SpatialEffectManager;
  private testOscillatorManager: TestOscillatorManager;

  constructor() {
    this.effectFactory = new EffectFactory();
    this.effectUpdaterFactory = new EffectUpdaterFactory();
    this.spatialEffectManager = new SpatialEffectManager();
    this.testOscillatorManager = new TestOscillatorManager();
  }

  /**
   * Crea un efecto global con espacialización independiente
   */
  public createGlobalEffect(
    effectId: string, 
    type: EffectType, 
    position: [number, number, number]
  ): void {
    try {
      
      // Crear el nodo del efecto usando el factory
      const effectNode = this.effectFactory.createEffect(type);
      
      // Crear el efecto espacial
      this.spatialEffectManager.createSpatialEffect(effectId, effectNode, position);
      
      // Crear oscilador de prueba
      const testConfig = this.effectFactory.getTestOscillatorConfig(type);
      this.testOscillatorManager.createTestOscillatorForEffect(effectId, effectNode, testConfig);
      
      
    } catch {
    }
  }

  /**
   * Actualiza los parámetros de un efecto global
   */
  public updateGlobalEffect(effectId: string, params: EffectParams): void {
    const effectData = this.spatialEffectManager.getGlobalEffect(effectId);
    if (!effectData) {
      return;
    }

    try {
      const { effectNode } = effectData;
      
      // Determinar el tipo de efecto para usar el actualizador correcto
      const effectType = this.getEffectTypeFromNode(effectNode);
      
      // Actualizar parámetros usando el factory de actualizadores
      this.effectUpdaterFactory.updateEffect(effectNode, effectType, params);
      
      // Refrescar el efecto para asegurar que los cambios se apliquen
      this.refreshGlobalEffect(effectId);
      
      
    } catch {
    }
  }

  /**
   * Actualiza la posición de un efecto global
   */
  public updateEffectZonePosition(effectId: string, position: [number, number, number]): void {
    this.spatialEffectManager.updateEffectPosition(effectId, position);
  }

  /**
   * Establece el radio de la zona de efecto
   */
  public setEffectZoneRadius(effectId: string, radius: number): void {
    this.spatialEffectManager.setEffectZoneRadius(effectId, radius);
  }

  /**
   * Obtiene un efecto global por ID
   */
  public getGlobalEffect(effectId: string): GlobalEffect | undefined {
    return this.spatialEffectManager.getGlobalEffect(effectId);
  }

  /**
   * Elimina un efecto global
   */
  public removeGlobalEffect(effectId: string): void {
    try {
      // Eliminar oscilador de prueba
      this.testOscillatorManager.removeTestOscillator(effectId);
      
      // Eliminar efecto espacial
      this.spatialEffectManager.removeSpatialEffect(effectId);
      
      
    } catch {
    }
  }

  /**
   * Refresca un efecto global específico
   */
  public refreshGlobalEffect(effectId: string): void {
    const effectData = this.spatialEffectManager.getGlobalEffect(effectId);
    if (effectData) {
      try {
        // Forzar actualización del panner
        effectData.panner.positionX.value = effectData.panner.positionX.value;
        effectData.panner.positionY.value = effectData.panner.positionY.value;
        effectData.panner.positionZ.value = effectData.panner.positionZ.value;
        
      } catch {
      }
    }
  }

  /**
   * Refresca todos los efectos globales
   */
  public refreshAllGlobalEffects(): void {
    this.spatialEffectManager.refreshAllGlobalEffects();
  }

  /**
   * Actualiza la intensidad de todos los efectos basada en la posición del listener
   */
  public updateAllEffectIntensities(listenerPosition: [number, number, number]): void {
    this.spatialEffectManager.updateAllEffectIntensities(listenerPosition);
  }

  /**
   * Obtiene todos los efectos globales
   */
  public getAllGlobalEffects(): Map<string, GlobalEffect> {
    return this.spatialEffectManager.getAllGlobalEffects();
  }

  /**
   * Obtiene los tipos de efectos soportados
   */
  public getSupportedEffectTypes(): EffectType[] {
    return this.effectFactory.getSupportedTypes();
  }

  /**
   * Obtiene información de un oscilador de prueba
   */
  public getTestOscillatorInfo(effectId: string) {
    return this.testOscillatorManager.getTestOscillatorInfo(effectId);
  }

  /**
   * Obtiene estadísticas de los osciladores de prueba
   */
  public getTestOscillatorStats() {
    return this.testOscillatorManager.getTestOscillatorStats();
  }

  /**
   * Detiene todos los osciladores de prueba
   */
  public stopAllTestOscillators(): void {
    this.testOscillatorManager.stopAllTestOscillators();
  }

  /**
   * Limpia todos los efectos y osciladores de prueba
   */
  public clearAllEffects(): void {
    this.testOscillatorManager.clearAllTestOscillators();
    this.spatialEffectManager.clearAllSpatialEffects();
  }

  /**
   * Determina el tipo de efecto basado en el nodo
   */
  private getEffectTypeFromNode(effectNode: unknown): string {
    const constructorName = (effectNode as { constructor?: { name?: string } }).constructor?.name;
    
    // Mapear nombres de constructores a tipos de efecto
    const typeMap: Record<string, string> = {
      'Phaser': 'phaser',
      'AutoFilter': 'autoFilter',
      'AutoWah': 'autoWah',
      'BitCrusher': 'bitCrusher',
      'Chebyshev': 'chebyshev',
      'Chorus': 'chorus',
      'Distortion': 'distortion',
      'FeedbackDelay': 'feedbackDelay',
      'Freeverb': 'freeverb',
      'FrequencyShifter': 'frequencyShifter',
      'JCReverb': 'jcReverb',
      'PingPongDelay': 'pingPongDelay',
      'PitchShift': 'pitchShift',
      'Reverb': 'reverb',
      'StereoWidener': 'stereoWidener',
      'Tremolo': 'tremolo',
      'Vibrato': 'vibrato'
    };

    return typeMap[constructorName || ''] || 'generic';
  }

  /**
   * Obtiene estadísticas generales del manager
   */
  public getManagerStats(): {
    totalEffects: number;
    testOscillators: {
      total: number;
      playing: number;
      stopped: number;
    };
    supportedTypes: number;
  } {
    const testStats = this.testOscillatorManager.getTestOscillatorStats();
    
    return {
      totalEffects: this.spatialEffectManager.getAllGlobalEffects().size,
      testOscillators: {
        total: testStats.totalOscillators,
        playing: testStats.playingOscillators,
        stopped: testStats.stoppedOscillators
      },
      supportedTypes: this.effectFactory.getSupportedTypes().length
    };
  }
}
