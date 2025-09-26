import { AudioParams, SoundSource } from '../../factories/SoundSourceFactory';
import { ParameterValidator } from './ParameterValidator';
import { ParameterConfigManager, ParameterConfig } from './ParameterConfigManager';
import { ParameterDebugManager } from './ParameterDebugManager';
import { SynthesizerUpdaterFacade } from './SynthesizerUpdaterFacade';

// Re-export ParameterConfig para compatibilidad
export type { ParameterConfig } from './ParameterConfigManager';

export interface ParameterUpdateResult {
  success: boolean;
  updatedParams: string[];
  errors: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Facade principal para la gestión de parámetros de sintetizadores
 * Responsabilidad única: Coordinar todos los componentes especializados y proporcionar API unificada
 */
export class ParameterManagerFacade {
  private configManager: ParameterConfigManager;
  private validator: ParameterValidator;
  private debugManager: ParameterDebugManager;
  private synthesizerUpdater: SynthesizerUpdaterFacade;

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
    this.configManager = new ParameterConfigManager(config);
    this.validator = new ParameterValidator(config);
    this.debugManager = new ParameterDebugManager();
    this.synthesizerUpdater = new SynthesizerUpdaterFacade(this.configManager);
  }

  /**
   * Actualiza los parámetros de un sintetizador de forma segura
   * Este es el método principal de la API pública
   */
  public updateSoundParams(
    source: SoundSource, 
    params: Partial<AudioParams>
  ): ParameterUpdateResult {
    const startTime = Date.now();
    const result: ParameterUpdateResult = {
      success: true,
      updatedParams: [],
      errors: []
    };

    try {
      this.debugManager.log('debug', 'Starting parameter update', { 
        synthType: source.synth.constructor.name,
        params: Object.keys(params)
      });

      // Validar parámetros antes de aplicar
      const validation = this.validator.validateParams(params);
      if (!validation.valid) {
        result.success = false;
        result.errors.push(...validation.errors);
        this.debugManager.log('warn', 'Parameter validation failed', { errors: validation.errors });
        return result;
      }

      // Log warnings si las hay
      if (validation.warnings.length > 0) {
        this.debugManager.log('warn', 'Parameter validation warnings', { warnings: validation.warnings });
      }

      // Usar el facade de updaters para manejar la actualización
      const updateResult = this.synthesizerUpdater.updateSoundParams(source, params);
      
      // Combinar resultados
      result.success = updateResult.success;
      result.updatedParams.push(...updateResult.updatedParams);
      result.errors.push(...updateResult.errors);

    } catch (error) {
      result.success = false;
      result.errors.push(`Error general: ${error instanceof Error ? error.message : 'Unknown error'}`);
      this.debugManager.log('error', 'Unexpected error in parameter update', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }

    // Log de la operación completada
    const duration = Date.now() - startTime;
    this.debugManager.logOperation(
      'updateSoundParams',
      result.success,
      duration,
      result.errors.length > 0 ? result.errors : undefined
    );

    return result;
  }

  /**
   * Valida un conjunto de parámetros antes de aplicarlos
   */
  public validateParams(params: Partial<AudioParams>): ValidationResult {
    return this.validator.validateParams(params);
  }

  /**
   * Actualiza la configuración del manager
   */
  public updateConfig(config: Partial<ParameterConfig>): void {
    try {
      this.configManager.updateConfig(config);
      this.validator.updateConfig(this.configManager.getConfig());
      this.debugManager.log('info', 'Configuration updated', { config });
    } catch (error) {
      this.debugManager.log('error', 'Failed to update configuration', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }

  /**
   * Obtiene la configuración actual del manager
   */
  public getConfig(): ParameterConfig {
    return this.configManager.getConfig();
  }

  /**
   * Obtiene información de debug del manager
   */
  public getDebugInfo() {
    return this.debugManager.getDebugInfo(this.configManager.getConfig());
  }

  /**
   * Obtiene métricas de rendimiento
   */
  public getPerformanceMetrics() {
    return this.debugManager.getPerformanceMetrics();
  }

  /**
   * Obtiene estadísticas de errores
   */
  public getErrorStatistics() {
    return this.debugManager.getErrorStatistics();
  }

  /**
   * Obtiene el historial de operaciones
   */
  public getOperationHistory() {
    return this.debugManager.getOperationHistory();
  }

  /**
   * Obtiene los logs
   */
  public getLogs() {
    return this.debugManager.getLogs();
  }

  /**
   * Exporta datos de debug
   */
  public exportDebugData(): string {
    return this.debugManager.exportDebugData(this.configManager.getConfig());
  }

  /**
   * Verifica problemas de rendimiento
   */
  public checkPerformanceIssues() {
    return this.debugManager.checkPerformanceIssues();
  }

  /**
   * Obtiene información sobre los updaters disponibles
   */
  public getUpdaterInfo() {
    return this.synthesizerUpdater.getDebugInfo();
  }

  /**
   * Limpia el historial de operaciones
   */
  public clearOperationHistory(): void {
    this.debugManager.clearOperationHistory();
  }

  /**
   * Limpia los logs
   */
  public clearLogs(): void {
    this.debugManager.clearLogs();
  }

  /**
   * Resetea todas las métricas
   */
  public resetMetrics(): void {
    this.debugManager.resetMetrics();
  }

  /**
   * Resetea la configuración a valores por defecto
   */
  public resetConfig(): void {
    this.configManager.resetToDefaults();
    this.validator.updateConfig(this.configManager.getConfig());
    this.debugManager.log('info', 'Configuration reset to defaults');
  }

  /**
   * Verifica el estado de salud del sistema
   */
  public getHealthStatus(): {
    isHealthy: boolean;
    issues: string[];
    recommendations: string[];
    componentStatus: {
      configManager: boolean;
      validator: boolean;
      debugManager: boolean;
      synthesizerUpdater: boolean;
    };
  } {
    const performanceIssues = this.checkPerformanceIssues();
    const configDebug = this.configManager.getDebugInfo();
    
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Verificar configuración
    if (!configDebug.isValid) {
      issues.push('Configuración inválida');
      recommendations.push('Revisar configuración de parámetros');
    }

    // Verificar problemas de rendimiento
    if (performanceIssues.hasIssues) {
      issues.push(...performanceIssues.issues);
      recommendations.push(...performanceIssues.recommendations);
    }

    // Verificar componentes
    const componentStatus = {
      configManager: configDebug.isValid,
      validator: true, // El validador siempre está disponible
      debugManager: true, // El debug manager siempre está disponible
      synthesizerUpdater: true // El updater siempre está disponible
    };

    return {
      isHealthy: issues.length === 0,
      issues,
      recommendations,
      componentStatus
    };
  }

  /**
   * Obtiene un resumen completo del estado del sistema
   */
  public getSystemSummary(): {
    config: ParameterConfig;
    performance: ReturnType<ParameterManagerFacade['getPerformanceMetrics']>;
    errors: ReturnType<ParameterManagerFacade['getErrorStatistics']>;
    health: ReturnType<ParameterManagerFacade['getHealthStatus']>;
    updaters: ReturnType<ParameterManagerFacade['getUpdaterInfo']>;
  } {
    return {
      config: this.getConfig(),
      performance: this.getPerformanceMetrics(),
      errors: this.getErrorStatistics(),
      health: this.getHealthStatus(),
      updaters: this.getUpdaterInfo()
    };
  }
}
