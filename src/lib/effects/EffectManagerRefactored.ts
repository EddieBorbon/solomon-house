import * as Tone from 'tone';
import { EffectType, EffectParams, GlobalEffect } from '../managers/EffectManager';
import { IEffectManager, IEffectManagerConfig } from './interfaces/IEffectManager';
import { EffectFactoryRegistry } from './factories/EffectFactoryRegistry';
import { EffectUpdaterRegistry } from './updaters/EffectUpdaterRegistry';
import { EffectTestManager } from './test-managers/EffectTestManager';
import { TestOscillatorFactory } from './test-managers/TestOscillatorFactory';

// Importar factories específicos
import { PhaserFactory } from './factories/PhaserFactory';
import { ReverbFactory } from './factories/ReverbFactory';
import { ChorusFactory } from './factories/ChorusFactory';
import { AutoFilterFactory } from './factories/AutoFilterFactory';
import { DistortionFactory } from './factories/DistortionFactory';
import { DelayFactory } from './factories/DelayFactory';

// Importar updaters específicos
import { PhaserUpdater } from './updaters/PhaserUpdater';
import { ReverbUpdater } from './updaters/ReverbUpdater';
import { ChorusUpdater } from './updaters/ChorusUpdater';
import { AutoFilterUpdater } from './updaters/AutoFilterUpdater';
import { DistortionUpdater } from './updaters/DistortionUpdater';
import { DelayUpdater } from './updaters/DelayUpdater';

/**
 * EffectManager refactorizado usando Factory y Strategy Patterns
 * Implementa el Facade Pattern para coordinar todos los subsistemas
 */
export class EffectManagerRefactored implements IEffectManager {
  private globalEffects: Map<string, GlobalEffect> = new Map();
  private effectZoneRadii: Map<string, number> = new Map();
  private lastEffectIntensities: Map<string, number> = new Map();
  
  private factoryRegistry: EffectFactoryRegistry;
  private updaterRegistry: EffectUpdaterRegistry;
  private testManager: EffectTestManager;

  constructor(config?: Partial<IEffectManagerConfig>) {
    // Inicializar registries
    this.factoryRegistry = new EffectFactoryRegistry();
    this.updaterRegistry = new EffectUpdaterRegistry();
    
    // Inicializar test manager
    const oscillatorFactory = new TestOscillatorFactory();
    this.testManager = new EffectTestManager(oscillatorFactory);
    
    // Registrar factories
    this.registerFactories();
    
    // Registrar updaters
    this.registerUpdaters();
    
  }

  /**
   * Registra todos los factories de efectos
   */
  private registerFactories(): void {
    this.factoryRegistry.register(new PhaserFactory());
    this.factoryRegistry.register(new ReverbFactory());
    this.factoryRegistry.register(new ChorusFactory());
    this.factoryRegistry.register(new AutoFilterFactory());
    this.factoryRegistry.register(new DistortionFactory());
    this.factoryRegistry.register(new DelayFactory());
    
    // TODO: Registrar los demás factories cuando estén creados
    // this.factoryRegistry.register(new AutoWahFactory());
    // this.factoryRegistry.register(new BitCrusherFactory());
    // ... etc
  }

  /**
   * Registra todos los updaters de efectos
   */
  private registerUpdaters(): void {
    this.updaterRegistry.register(new PhaserUpdater());
    this.updaterRegistry.register(new ReverbUpdater());
    this.updaterRegistry.register(new ChorusUpdater());
    this.updaterRegistry.register(new AutoFilterUpdater());
    this.updaterRegistry.register(new DistortionUpdater());
    this.updaterRegistry.register(new DelayUpdater());
    
    // TODO: Registrar los demás updaters cuando estén creados
    // this.updaterRegistry.register(new AutoWahUpdater());
    // this.updaterRegistry.register(new BitCrusherUpdater());
    // ... etc
  }

  /**
   * Crea un efecto global con espacialización independiente
   * @param effectId ID único del efecto
   * @param type Tipo de efecto a crear
   * @param position Posición 3D del efecto
   */
  createGlobalEffect(effectId: string, type: EffectType, position: [number, number, number]): void {
    try {
      
      // Usar factory registry para crear el efecto
      const effectNode = this.factoryRegistry.createEffect(type);
      
      if (effectNode) {
        // Crear panner 3D independiente para el efecto
        const effectPanner = new Tone.Panner3D({
          positionX: position[0],
          positionY: position[1],
          positionZ: position[2],
          panningModel: 'HRTF',
          distanceModel: 'inverse',
          refDistance: 1,
          maxDistance: 100,
          rolloffFactor: 2,
          coneInnerAngle: 360,
          coneOuterAngle: 360,
          coneOuterGain: 0,
        });
        
        // Conectar efecto -> panner -> destination
        effectNode.chain(effectPanner, Tone.Destination);
        
        // Almacenar tanto el nodo del efecto como su panner y posición
        this.globalEffects.set(effectId, { effectNode, panner: effectPanner, position: position });
        
        // Configurar radio inicial para la zona de efectos
        this.setEffectZoneRadius(effectId, 2.0);
        
        // Crear un oscilador de prueba para escuchar los efectos
        this.testManager.createTestOscillator(effectId, effectNode);
      }
    } catch (error) {
    }
  }

  /**
   * Actualiza los parámetros de un efecto global
   * @param effectId ID del efecto
   * @param params Parámetros a actualizar
   */
  updateGlobalEffect(effectId: string, params: EffectParams): void {
    const effectData = this.globalEffects.get(effectId);
    if (!effectData) {
      return;
    }

    try {
      const { effectNode } = effectData;
      
      // Usar updater registry para actualizar el efecto
      this.updaterRegistry.updateEffect(effectNode, params);
      
      // Refrescar el efecto para asegurar que los cambios se apliquen en tiempo real
      this.refreshGlobalEffect(effectId);
      
      // Log adicional para confirmar que los parámetros se aplicaron
      
    } catch (error) {
    }
  }

  /**
   * Elimina un efecto global
   * @param effectId ID del efecto
   */
  removeGlobalEffect(effectId: string): void {
    const effectData = this.globalEffects.get(effectId);
    if (effectData) {
      try {
        const { effectNode, panner } = effectData;
        
        // Limpiar el oscilador de prueba si existe
        this.testManager.removeTestOscillator(effectId);
        
        // Desconectar todas las conexiones antes de disponer
        try {
          effectNode.disconnect();
          panner.disconnect();
        } catch {
          // Manejo silencioso de errores
        }
        
        effectNode.dispose();
        panner.dispose();
        this.globalEffects.delete(effectId);
        this.effectZoneRadii.delete(effectId);
        this.lastEffectIntensities.delete(effectId);
        
      } catch (error) {
      }
    }
  }

  /**
   * Obtiene un efecto global por ID
   * @param effectId ID del efecto
   * @returns El efecto global o undefined
   */
  getGlobalEffect(effectId: string): GlobalEffect | undefined {
    return this.globalEffects.get(effectId);
  }

  /**
   * Obtiene todos los efectos globales
   * @returns Map con todos los efectos globales
   */
  getAllGlobalEffects(): Map<string, GlobalEffect> {
    return this.globalEffects;
  }

  /**
   * Refresca un efecto específico
   * @param effectId ID del efecto
   */
  refreshGlobalEffect(effectId: string): void {
    const effectData = this.globalEffects.get(effectId);
    if (!effectData) {
      return;
    }

    try {
      const { effectNode } = effectData;
      this.testManager.refreshEffect(effectId, effectNode);
    } catch (error) {
    }
  }

  /**
   * Refresca todos los efectos globales activos
   */
  refreshAllGlobalEffects(): void {
    
    this.globalEffects.forEach((effectData, effectId) => {
      try {
        this.refreshGlobalEffect(effectId);
      } catch (error) {
      }
    });
  }

  /**
   * Actualiza la posición 3D de una zona de efecto
   * @param id ID del efecto
   * @param position Nueva posición 3D
   */
  updateEffectZonePosition(id: string, position: [number, number, number]): void {
    const effectData = this.globalEffects.get(id);
    if (!effectData) {
      return;
    }

    try {
      
      // Actualizar la posición del panner del efecto
      effectData.panner.setPosition(position[0], position[1], position[2]);
      
      // Actualizar la posición almacenada en el efecto
      effectData.position = position;
      
    } catch (error) {
    }
  }

  /**
   * Configura el radio de una zona de efectos
   * @param effectId ID del efecto
   * @param radius Radio de la zona
   */
  setEffectZoneRadius(effectId: string, radius: number): void {
    this.effectZoneRadii.set(effectId, radius);
  }

  /**
   * Obtiene el radio de una zona de efectos
   * @param effectId ID del efecto
   * @returns Radio de la zona
   */
  getEffectZoneRadius(effectId: string): number {
    const radius = this.effectZoneRadii.get(effectId) || 2.0;
    return radius;
  }

  /**
   * Limpia todos los recursos del EffectManager
   */
  cleanup(): void {
    try {
      // Limpiar test manager
      this.testManager.cleanup();
      
      // Limpiar todos los efectos globales
      this.globalEffects.forEach((effectData, effectId) => {
        try {
          this.removeGlobalEffect(effectId);
        } catch {
          // Manejo silencioso de errores
        }
      });
      
      // Limpiar Maps
      this.effectZoneRadii.clear();
      this.lastEffectIntensities.clear();
      
    } catch (error) {
    }
  }
}
