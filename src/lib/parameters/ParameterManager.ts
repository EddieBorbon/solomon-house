import { 
  EffectType, 
  SoundObjectType, 
  EffectZoneEntity, 
  SoundObjectEntity, 
  MobileObjectEntity,
  IParameterManager,
  IParameterValidator,
  ParameterInfo,
  ValidationResult,
  ParameterOperationResult,
  ParameterStats,
  EntityState
} from './types';

/**
 * Manager para la gestión de parámetros usando Strategy Pattern
 * Maneja validación, actualización y estado de parámetros
 */
export class ParameterManager implements IParameterManager, IParameterValidator {
  private static instance: ParameterManager;
  private parameterInfo: Map<string, ParameterInfo> = new Map();
  private entityStates: Map<string, EntityState> = new Map();
  private subscribers: Array<(entityId: string, state: EntityState) => void> = [];
  private stats: ParameterStats = {
    totalParameters: 0,
    activeEntities: 0,
    updateCount: 0,
    errorCount: 0,
    validationCount: 0
  };

  private constructor() {
    this.initializeParameterInfo();
  }

  public static getInstance(): ParameterManager {
    if (!ParameterManager.instance) {
      ParameterManager.instance = new ParameterManager();
    }
    return ParameterManager.instance;
  }

  /**
   * Actualiza un parámetro de una entidad
   */
  public updateParameter(entityId: string, param: string, value: any): void {
    try {
      console.log(`🎛️ ParameterManager: Actualizando parámetro ${param} de entidad ${entityId}`);
      
      // Validar el parámetro
      const validation = this.validateParameter('unknown', param, value);
      if (!validation.isValid) {
        console.warn(`⚠️ ParameterManager: Parámetro ${param} no válido:`, validation.errors);
        this.stats.errorCount++;
        return;
      }

      // Actualizar estadísticas
      this.stats.updateCount++;
      this.stats.validationCount++;

      // Actualizar estado de la entidad
      this.updateEntityState(entityId, {
        isUpdating: true,
        lastUpdatedParam: param
      });

      // Simular actualización (en una implementación real, esto llamaría al store)
      setTimeout(() => {
        this.updateEntityState(entityId, {
          isUpdating: false,
          lastUpdatedParam: null
        });
      }, 1000);

      console.log(`✅ ParameterManager: Parámetro ${param} actualizado exitosamente`);
    } catch (error) {
      console.error(`❌ ParameterManager: Error actualizando parámetro ${param}:`, error);
      this.stats.errorCount++;
    }
  }

  /**
   * Valida un parámetro
   */
  public validateParameter(entityType: string, param: string, value: any): boolean {
    const validation = this.validateParameterGeneric(param, value);
    return validation.isValid;
  }

  /**
   * Obtiene información de un parámetro
   */
  public getParameterInfo(entityType: string, param: string): ParameterInfo | null {
    const key = `${entityType}.${param}`;
    return this.parameterInfo.get(key) || null;
  }

  /**
   * Valida parámetros de efectos
   */
  public validateEffectParameter(effectType: EffectType, param: string, value: any): ValidationResult {
    const key = `effect.${effectType}.${param}`;
    const info = this.parameterInfo.get(key);
    
    if (!info) {
      return {
        isValid: false,
        errors: [`Parámetro ${param} no encontrado para efecto ${effectType}`],
        warnings: []
      };
    }

    return this.validateParameterWithInfo(param, value, info);
  }

  /**
   * Valida parámetros de objetos de sonido
   */
  public validateSoundObjectParameter(objectType: SoundObjectType, param: string, value: any): ValidationResult {
    const key = `soundObject.${objectType}.${param}`;
    const info = this.parameterInfo.get(key);
    
    if (!info) {
      return {
        isValid: false,
        errors: [`Parámetro ${param} no encontrado para objeto ${objectType}`],
        warnings: []
      };
    }

    return this.validateParameterWithInfo(param, value, info);
  }

  /**
   * Valida parámetros de objetos móviles
   */
  public validateMobileObjectParameter(param: string, value: any): ValidationResult {
    const key = `mobileObject.${param}`;
    const info = this.parameterInfo.get(key);
    
    if (!info) {
      return {
        isValid: false,
        errors: [`Parámetro ${param} no encontrado para objeto móvil`],
        warnings: []
      };
    }

    return this.validateParameterWithInfo(param, value, info);
  }

  /**
   * Obtiene el estado de una entidad
   */
  public getEntityState(entityId: string): EntityState | null {
    return this.entityStates.get(entityId) || null;
  }

  /**
   * Actualiza el estado de una entidad
   */
  public updateEntityState(entityId: string, updates: Partial<EntityState>): void {
    const currentState = this.entityStates.get(entityId) || {
      isUpdating: false,
      lastUpdatedParam: null,
      isRefreshing: false,
      isExpanded: false
    };

    const newState = { ...currentState, ...updates };
    this.entityStates.set(entityId, newState);

    // Notificar a los suscriptores
    this.notifySubscribers(entityId, newState);
  }

  /**
   * Suscribe a cambios de estado de entidades
   */
  public subscribeToChanges(callback: (entityId: string, state: EntityState) => void): () => void {
    this.subscribers.push(callback);

    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  /**
   * Obtiene estadísticas del manager
   */
  public getStats(): ParameterStats {
    return { ...this.stats };
  }

  /**
   * Resetea las estadísticas
   */
  public resetStats(): void {
    this.stats = {
      totalParameters: this.parameterInfo.size,
      activeEntities: this.entityStates.size,
      updateCount: 0,
      errorCount: 0,
      validationCount: 0
    };
  }

  /**
   * Obtiene información de debugging
   */
  public getDebugInfo(): {
    stats: ParameterStats;
    parameterCount: number;
    entityCount: number;
    subscribersCount: number;
  } {
    return {
      stats: this.getStats(),
      parameterCount: this.parameterInfo.size,
      entityCount: this.entityStates.size,
      subscribersCount: this.subscribers.length
    };
  }

  /**
   * Inicializa la información de parámetros
   */
  private initializeParameterInfo(): void {
    // Parámetros de efectos comunes
    this.addParameterInfo('effect.reverb.roomSize', {
      name: 'Room Size',
      type: 'number',
      min: 0,
      max: 1,
      step: 0.01,
      defaultValue: 0.5,
      description: 'Size of the reverb room',
      category: 'Reverb'
    });

    this.addParameterInfo('effect.reverb.damping', {
      name: 'Damping',
      type: 'number',
      min: 0,
      max: 1,
      step: 0.01,
      defaultValue: 0.5,
      description: 'Damping factor of the reverb',
      category: 'Reverb'
    });

    this.addParameterInfo('effect.reverb.wet', {
      name: 'Wet',
      type: 'number',
      min: 0,
      max: 1,
      step: 0.01,
      defaultValue: 0.3,
      description: 'Wet signal amount',
      category: 'Reverb'
    });

    // Parámetros de objetos de sonido comunes
    this.addParameterInfo('soundObject.cube.frequency', {
      name: 'Frequency',
      type: 'number',
      min: 20,
      max: 20000,
      step: 1,
      defaultValue: 440,
      description: 'Frequency of the sound',
      category: 'Audio'
    });

    this.addParameterInfo('soundObject.cube.volume', {
      name: 'Volume',
      type: 'number',
      min: 0,
      max: 1,
      step: 0.01,
      defaultValue: 0.5,
      description: 'Volume of the sound',
      category: 'Audio'
    });

    this.addParameterInfo('soundObject.cube.waveform', {
      name: 'Waveform',
      type: 'string',
      defaultValue: 'sine',
      description: 'Waveform type',
      category: 'Audio'
    });

    // Parámetros de objetos móviles
    this.addParameterInfo('mobileObject.speed', {
      name: 'Speed',
      type: 'number',
      min: 0,
      max: 10,
      step: 0.1,
      defaultValue: 1,
      description: 'Movement speed',
      category: 'Movement'
    });

    this.addParameterInfo('mobileObject.radius', {
      name: 'Radius',
      type: 'number',
      min: 0.1,
      max: 10,
      step: 0.1,
      defaultValue: 2,
      description: 'Movement radius',
      category: 'Movement'
    });

    this.stats.totalParameters = this.parameterInfo.size;
  }

  /**
   * Agrega información de un parámetro
   */
  private addParameterInfo(key: string, info: ParameterInfo): void {
    this.parameterInfo.set(key, info);
  }

  /**
   * Valida un parámetro genérico
   */
  private validateParameterGeneric(param: string, value: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validaciones básicas
    if (value === null || value === undefined) {
      errors.push(`Parámetro ${param} no puede ser null o undefined`);
    }

    if (typeof value === 'number' && !isFinite(value)) {
      errors.push(`Parámetro ${param} debe ser un número finito`);
    }

    if (typeof value === 'string' && value.trim() === '') {
      warnings.push(`Parámetro ${param} es una cadena vacía`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Valida un parámetro con información específica
   */
  private validateParameterWithInfo(param: string, value: any, info: ParameterInfo): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validar tipo
    if (info.type === 'number' && typeof value !== 'number') {
      errors.push(`Parámetro ${param} debe ser un número`);
    } else if (info.type === 'string' && typeof value !== 'string') {
      errors.push(`Parámetro ${param} debe ser una cadena`);
    } else if (info.type === 'boolean' && typeof value !== 'boolean') {
      errors.push(`Parámetro ${param} debe ser un booleano`);
    }

    // Validar rango para números
    if (info.type === 'number' && typeof value === 'number') {
      if (info.min !== undefined && value < info.min) {
        errors.push(`Parámetro ${param} debe ser mayor o igual a ${info.min}`);
      }
      if (info.max !== undefined && value > info.max) {
        errors.push(`Parámetro ${param} debe ser menor o igual a ${info.max}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      normalizedValue: value
    };
  }

  /**
   * Notifica a los suscriptores sobre cambios de estado
   */
  private notifySubscribers(entityId: string, state: EntityState): void {
    this.subscribers.forEach(callback => {
      try {
        callback(entityId, state);
      } catch (error) {
        console.error(`❌ ParameterManager: Error notificando suscriptor:`, error);
      }
    });
  }
}
