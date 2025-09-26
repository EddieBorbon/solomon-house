import { ParameterConfig } from './ParameterConfigManager';

export interface DebugInfo {
  config: ParameterConfig;
  supportedSynthesizers: string[];
  lastOperation?: {
    timestamp: number;
    operation: string;
    success: boolean;
    duration: number;
  };
  operationHistory: Array<{
    timestamp: number;
    operation: string;
    success: boolean;
    duration: number;
    errors?: string[];
  }>;
  performanceMetrics: {
    totalOperations: number;
    successfulOperations: number;
    failedOperations: number;
    averageOperationTime: number;
  };
}

export interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: number;
  context?: Record<string, unknown>;
}

/**
 * Clase especializada en debugging y logging de parámetros
 * Responsabilidad única: Manejar debugging, logging y métricas de rendimiento
 */
export class ParameterDebugManager {
  private operationHistory: DebugInfo['operationHistory'] = [];
  private logEntries: LogEntry[] = [];
  private maxHistorySize: number = 100;
  private maxLogSize: number = 200;
  private performanceMetrics: DebugInfo['performanceMetrics'] = {
    totalOperations: 0,
    successfulOperations: 0,
    failedOperations: 0,
    averageOperationTime: 0
  };

  constructor(maxHistorySize: number = 100, maxLogSize: number = 200) {
    this.maxHistorySize = maxHistorySize;
    this.maxLogSize = maxLogSize;
  }

  /**
   * Registra una operación para debugging
   */
  public logOperation(
    operation: string, 
    success: boolean, 
    duration: number, 
    errors?: string[]
  ): void {
    const timestamp = Date.now();
    const operationRecord = {
      timestamp,
      operation,
      success,
      duration,
      errors
    };

    // Agregar a historial
    this.operationHistory.unshift(operationRecord);
    
    // Mantener tamaño máximo del historial
    if (this.operationHistory.length > this.maxHistorySize) {
      this.operationHistory = this.operationHistory.slice(0, this.maxHistorySize);
    }

    // Actualizar métricas
    this.updatePerformanceMetrics(success, duration);

    // Log automático
    const level = success ? 'info' : 'error';
    this.log(level, `Operation: ${operation}`, {
      success,
      duration,
      errors
    });
  }

  /**
   * Registra un log entry
   */
  public log(level: LogEntry['level'], message: string, context?: Record<string, unknown>): void {
    const logEntry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      context
    };

    this.logEntries.unshift(logEntry);

    // Mantener tamaño máximo de logs
    if (this.logEntries.length > this.maxLogSize) {
      this.logEntries = this.logEntries.slice(0, this.maxLogSize);
    }

    // Log a consola en desarrollo
    if (process.env.NODE_ENV === 'development') {
      const _contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
    }
  }

  /**
   * Obtiene información completa de debug
   */
  public getDebugInfo(config: ParameterConfig): DebugInfo {
    const lastOperation = this.operationHistory[0];
    
    return {
      config,
      supportedSynthesizers: [
        'PolySynth',
        'PluckSynth',
        'DuoSynth',
        'MembraneSynth',
        'MonoSynth',
        'MetalSynth',
        'NoiseSynth',
        'Sampler',
        'AMSynth',
        'FMSynth'
      ],
      lastOperation,
      operationHistory: [...this.operationHistory],
      performanceMetrics: { ...this.performanceMetrics }
    };
  }

  /**
   * Obtiene el historial de operaciones
   */
  public getOperationHistory(): DebugInfo['operationHistory'] {
    return [...this.operationHistory];
  }

  /**
   * Obtiene los logs
   */
  public getLogs(): LogEntry[] {
    return [...this.logEntries];
  }

  /**
   * Obtiene métricas de rendimiento
   */
  public getPerformanceMetrics(): DebugInfo['performanceMetrics'] {
    return { ...this.performanceMetrics };
  }

  /**
   * Obtiene estadísticas de errores
   */
  public getErrorStatistics(): {
    totalErrors: number;
    errorFrequency: Record<string, number>;
    recentErrors: Array<{
      timestamp: number;
      operation: string;
      errors: string[];
    }>;
  } {
    const errorFrequency: Record<string, number> = {};
    const recentErrors: Array<{
      timestamp: number;
      operation: string;
      errors: string[];
    }> = [];

    this.operationHistory.forEach(operation => {
      if (!operation.success && operation.errors) {
        operation.errors.forEach(error => {
          errorFrequency[error] = (errorFrequency[error] || 0) + 1;
        });
        
        recentErrors.push({
          timestamp: operation.timestamp,
          operation: operation.operation,
          errors: operation.errors
        });
      }
    });

    return {
      totalErrors: Object.values(errorFrequency).reduce((sum, count) => sum + count, 0),
      errorFrequency,
      recentErrors: recentErrors.slice(0, 10) // Últimos 10 errores
    };
  }

  /**
   * Limpia el historial de operaciones
   */
  public clearOperationHistory(): void {
    this.operationHistory = [];
    this.log('info', 'Operation history cleared');
  }

  /**
   * Limpia los logs
   */
  public clearLogs(): void {
    this.logEntries = [];
    this.log('info', 'Logs cleared');
  }

  /**
   * Resetea todas las métricas
   */
  public resetMetrics(): void {
    this.performanceMetrics = {
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      averageOperationTime: 0
    };
    this.log('info', 'Performance metrics reset');
  }

  /**
   * Exporta datos de debug para análisis externo
   */
  public exportDebugData(config: ParameterConfig): string {
    const debugData = {
      timestamp: Date.now(),
      debugInfo: this.getDebugInfo(config),
      errorStatistics: this.getErrorStatistics(),
      logs: this.getLogs()
    };

    return JSON.stringify(debugData, null, 2);
  }

  /**
   * Actualiza las métricas de rendimiento
   */
  private updatePerformanceMetrics(success: boolean, duration: number): void {
    this.performanceMetrics.totalOperations++;
    
    if (success) {
      this.performanceMetrics.successfulOperations++;
    } else {
      this.performanceMetrics.failedOperations++;
    }

    // Calcular tiempo promedio
    const totalTime = this.performanceMetrics.averageOperationTime * 
                     (this.performanceMetrics.totalOperations - 1) + duration;
    this.performanceMetrics.averageOperationTime = totalTime / this.performanceMetrics.totalOperations;
  }

  /**
   * Verifica si hay problemas de rendimiento
   */
  public checkPerformanceIssues(): {
    hasIssues: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Verificar tiempo promedio de operaciones
    if (this.performanceMetrics.averageOperationTime > 100) {
      issues.push('Tiempo promedio de operaciones alto (>100ms)');
      recommendations.push('Considerar optimizar operaciones de sintetizadores');
    }

    // Verificar tasa de errores
    const errorRate = this.performanceMetrics.failedOperations / this.performanceMetrics.totalOperations;
    if (errorRate > 0.1) {
      issues.push(`Tasa de errores alta (${(errorRate * 100).toFixed(1)}%)`);
      recommendations.push('Revisar validación de parámetros y manejo de errores');
    }

    // Verificar historial de operaciones
    if (this.operationHistory.length > this.maxHistorySize * 0.9) {
      issues.push('Historial de operaciones cerca del límite');
      recommendations.push('Considerar limpiar historial o aumentar límite');
    }

    return {
      hasIssues: issues.length > 0,
      issues,
      recommendations
    };
  }
}
