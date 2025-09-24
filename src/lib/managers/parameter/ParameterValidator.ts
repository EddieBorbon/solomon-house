import { AudioParams, ParameterConfig } from '../ParameterManager';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Clase especializada en la validación de parámetros de audio
 * Responsabilidad única: Validar parámetros antes de aplicarlos
 */
export class ParameterValidator {
  private config: ParameterConfig;

  constructor(config: ParameterConfig) {
    this.config = config;
  }

  /**
   * Valida un conjunto de parámetros antes de aplicarlos
   */
  public validateParams(params: Partial<AudioParams>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validar frecuencia
    if (params.frequency !== undefined) {
      this.validateFrequency(params.frequency, errors);
    }

    // Validar volumen
    if (params.volume !== undefined) {
      this.validateVolume(params.volume, warnings);
    }

    // Validar parámetros de envolvente
    this.validateEnvelopeParams(params, errors);

    // Validar parámetros específicos de sintetizadores
    this.validateSynthesizerSpecificParams(params, errors, warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Valida la frecuencia
   */
  private validateFrequency(frequency: number, errors: string[]): void {
    if (frequency < this.config.frequencyRange.min) {
      errors.push(`Frecuencia ${frequency}Hz está por debajo del mínimo (${this.config.frequencyRange.min}Hz)`);
    } else if (frequency > this.config.frequencyRange.max) {
      errors.push(`Frecuencia ${frequency}Hz está por encima del máximo (${this.config.frequencyRange.max}Hz)`);
    }
  }

  /**
   * Valida el volumen
   */
  private validateVolume(volume: number, warnings: string[]): void {
    if (volume < this.config.volumeRange.min) {
      warnings.push(`Volumen ${volume} está por debajo del mínimo recomendado (${this.config.volumeRange.min})`);
    } else if (volume > this.config.volumeRange.max) {
      warnings.push(`Volumen ${volume} está por encima del máximo recomendado (${this.config.volumeRange.max})`);
    }
  }

  /**
   * Valida parámetros de envolvente
   */
  private validateEnvelopeParams(params: Partial<AudioParams>, errors: string[]): void {
    if (params.attack !== undefined && params.attack < 0) {
      errors.push('Attack no puede ser negativo');
    }
    if (params.decay !== undefined && params.decay < 0) {
      errors.push('Decay no puede ser negativo');
    }
    if (params.release !== undefined && params.release < 0) {
      errors.push('Release no puede ser negativo');
    }
    if (params.sustain !== undefined && (params.sustain < 0 || params.sustain > 1)) {
      errors.push('Sustain debe estar entre 0 y 1');
    }
  }

  /**
   * Valida parámetros específicos de sintetizadores
   */
  private validateSynthesizerSpecificParams(
    params: Partial<AudioParams>, 
    errors: string[], 
    warnings: string[]
  ): void {
    // Validar harmonicity
    if (params.harmonicity !== undefined && (params.harmonicity < 0 || params.harmonicity > 10)) {
      warnings.push('Harmonicity fuera del rango recomendado (0-10)');
    }

    // Validar modulationIndex
    if (params.modulationIndex !== undefined && (params.modulationIndex < 0 || params.modulationIndex > 100)) {
      warnings.push('ModulationIndex fuera del rango recomendado (0-100)');
    }

    // Validar resonance
    if (params.resonance !== undefined && (params.resonance < 0 || params.resonance > 1)) {
      errors.push('Resonance debe estar entre 0 y 1');
    }

    // Validar dampening
    if (params.dampening !== undefined && (params.dampening < 0 || params.dampening > 1)) {
      errors.push('Dampening debe estar entre 0 y 1');
    }
  }

  /**
   * Actualiza la configuración del validador
   */
  public updateConfig(config: Partial<ParameterConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
