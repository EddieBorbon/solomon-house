/**
 * Clase especializada en la gestión de configuración de parámetros
 * Responsabilidad única: Manejar configuración de parámetros de audio
 */
export interface ParameterConfig {
  volumeRange: {
    min: number;
    max: number;
    dbRange: {
      min: number;
      max: number;
    };
  };
  frequencyRange: {
    min: number;
    max: number;
  };
  rampTime: number;
}

export class ParameterConfigManager {
  private config: ParameterConfig;

  constructor(config: ParameterConfig = {
    volumeRange: {
      min: 0,
      max: 1.0,
      dbRange: {
        min: -Infinity,
        max: 0
      }
    },
    frequencyRange: {
      min: 20,
      max: 20000
    },
    rampTime: 0.05
  }) {
    this.config = config;
  }

  /**
   * Obtiene la configuración actual
   */
  public getConfig(): ParameterConfig {
    return { ...this.config };
  }

  /**
   * Actualiza la configuración con validación
   */
  public updateConfig(newConfig: Partial<ParameterConfig>): void {
    this.validateConfig(newConfig);
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Valida una configuración antes de aplicarla
   */
  private validateConfig(config: Partial<ParameterConfig>): void {
    // Validar volumeRange
    if (config.volumeRange) {
      if (config.volumeRange.min < 0 || config.volumeRange.min > config.volumeRange.max) {
        throw new Error('volumeRange.min debe ser >= 0 y <= volumeRange.max');
      }
      if (config.volumeRange.max > 1) {
        throw new Error('volumeRange.max no debe exceder 1.0');
      }
      if (config.volumeRange.dbRange.min > config.volumeRange.dbRange.max) {
        throw new Error('dbRange.min debe ser <= dbRange.max');
      }
    }

    // Validar frequencyRange
    if (config.frequencyRange) {
      if (config.frequencyRange.min <= 0 || config.frequencyRange.min > config.frequencyRange.max) {
        throw new Error('frequencyRange.min debe ser > 0 y <= frequencyRange.max');
      }
      if (config.frequencyRange.max > 22000) {
        throw new Error('frequencyRange.max no debe exceder 22000Hz (límite audible humano)');
      }
    }

    // Validar rampTime
    if (config.rampTime !== undefined) {
      if (config.rampTime < 0) {
        throw new Error('rampTime no puede ser negativo');
      }
      if (config.rampTime > 10) {
        throw new Error('rampTime no debe exceder 10 segundos');
      }
    }
  }

  /**
   * Obtiene el rango de volumen configurado
   */
  public getVolumeRange(): { min: number; max: number; dbRange: { min: number; max: number } } {
    return { ...this.config.volumeRange };
  }

  /**
   * Obtiene el rango de frecuencia configurado
   */
  public getFrequencyRange(): { min: number; max: number } {
    return { ...this.config.frequencyRange };
  }

  /**
   * Obtiene el tiempo de rampa configurado
   */
  public getRampTime(): number {
    return this.config.rampTime;
  }

  /**
   * Verifica si un valor de volumen está dentro del rango configurado
   */
  public isVolumeInRange(volume: number): boolean {
    return volume >= this.config.volumeRange.min && volume <= this.config.volumeRange.max;
  }

  /**
   * Verifica si un valor de frecuencia está dentro del rango configurado
   */
  public isFrequencyInRange(frequency: number): boolean {
    return frequency >= this.config.frequencyRange.min && frequency <= this.config.frequencyRange.max;
  }

  /**
   * Clampea un valor de volumen al rango configurado
   */
  public clampVolume(volume: number): number {
    return Math.max(
      this.config.volumeRange.min,
      Math.min(this.config.volumeRange.max, volume)
    );
  }

  /**
   * Clampea un valor de frecuencia al rango configurado
   */
  public clampFrequency(frequency: number): number {
    return Math.max(
      this.config.frequencyRange.min,
      Math.min(this.config.frequencyRange.max, frequency)
    );
  }

  /**
   * Resetea la configuración a valores por defecto
   */
  public resetToDefaults(): void {
    this.config = {
      volumeRange: {
        min: 0,
        max: 1.0,
        dbRange: {
          min: -Infinity,
          max: 0
        }
      },
      frequencyRange: {
        min: 20,
        max: 20000
      },
      rampTime: 0.05
    };
  }

  /**
   * Obtiene información de debug de la configuración
   */
  public getDebugInfo(): {
    config: ParameterConfig;
    isValid: boolean;
    validationErrors: string[];
  } {
    const validationErrors: string[] = [];
    
    try {
      this.validateConfig(this.config);
    } catch (error) {
      validationErrors.push(error instanceof Error ? error.message : 'Unknown validation error');
    }

    return {
      config: this.getConfig(),
      isValid: validationErrors.length === 0,
      validationErrors
    };
  }
}
