import { AudioParams, ParameterValidator, ParameterValidationResult, ParameterConfig } from './types';

export class BaseParameterValidator implements ParameterValidator {
  protected config: ParameterConfig;

  constructor(config: ParameterConfig) {
    this.config = config;
  }

  validate(params: Partial<AudioParams>): ParameterValidationResult {
    const result: ParameterValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      sanitizedParams: { ...params }
    };

    // Validar frecuencia
    if (params.frequency !== undefined) {
      const frequencyResult = this.validateFrequency(params.frequency);
      if (!frequencyResult.isValid) {
        result.isValid = false;
        result.errors.push(...frequencyResult.errors);
      }
      result.sanitizedParams.frequency = frequencyResult.value;
    }

    // Validar volumen
    if (params.volume !== undefined) {
      const volumeResult = this.validateVolume(params.volume);
      if (!volumeResult.isValid) {
        result.isValid = false;
        result.errors.push(...volumeResult.errors);
      }
      result.sanitizedParams.volume = volumeResult.value;
    }

    // Validar harmonicity
    if (params.harmonicity !== undefined) {
      const harmonicityResult = this.validateHarmonicity(params.harmonicity);
      if (!harmonicityResult.isValid) {
        result.warnings.push(...harmonicityResult.warnings);
      }
      result.sanitizedParams.harmonicity = harmonicityResult.value;
    }

    // Validar modulationIndex
    if (params.modulationIndex !== undefined) {
      const modulationResult = this.validateModulationIndex(params.modulationIndex);
      if (!modulationResult.isValid) {
        result.warnings.push(...modulationResult.warnings);
      }
      result.sanitizedParams.modulationIndex = modulationResult.value;
    }

    // Validar parámetros de envelope
    if (params.attack !== undefined) {
      const attackResult = this.validateAttack(params.attack);
      if (!attackResult.isValid) {
        result.warnings.push(...attackResult.warnings);
      }
      result.sanitizedParams.attack = attackResult.value;
    }

    if (params.release !== undefined) {
      const releaseResult = this.validateRelease(params.release);
      if (!releaseResult.isValid) {
        result.warnings.push(...releaseResult.warnings);
      }
      result.sanitizedParams.release = releaseResult.value;
    }

    return result;
  }

  private validateFrequency(frequency: number): { isValid: boolean; value: number; errors: string[] } {
    const errors: string[] = [];
    let value = frequency;

    if (typeof frequency !== 'number' || isNaN(frequency)) {
      errors.push('Frequency must be a valid number');
      value = 440; // Valor por defecto
    } else if (frequency < this.config.frequencyRange.min) {
      errors.push(`Frequency ${frequency} is below minimum ${this.config.frequencyRange.min}`);
      value = this.config.frequencyRange.min;
    } else if (frequency > this.config.frequencyRange.max) {
      errors.push(`Frequency ${frequency} is above maximum ${this.config.frequencyRange.max}`);
      value = this.config.frequencyRange.max;
    }

    return {
      isValid: errors.length === 0,
      value,
      errors
    };
  }

  private validateVolume(volume: number): { isValid: boolean; value: number; errors: string[] } {
    const errors: string[] = [];
    let value = volume;

    if (typeof volume !== 'number' || isNaN(volume)) {
      errors.push('Volume must be a valid number');
      value = 0.5; // Valor por defecto
    } else if (volume < this.config.volumeRange.min) {
      errors.push(`Volume ${volume} is below minimum ${this.config.volumeRange.min}`);
      value = this.config.volumeRange.min;
    } else if (volume > this.config.volumeRange.max) {
      errors.push(`Volume ${volume} is above maximum ${this.config.volumeRange.max}`);
      value = this.config.volumeRange.max;
    }

    return {
      isValid: errors.length === 0,
      value,
      errors
    };
  }

  private validateHarmonicity(harmonicity: number): { isValid: boolean; value: number; warnings: string[] } {
    const warnings: string[] = [];
    let value = harmonicity;

    if (typeof harmonicity !== 'number' || isNaN(harmonicity)) {
      warnings.push('Harmonicity must be a valid number, using default value');
      value = 1.5;
    } else if (harmonicity < 0) {
      warnings.push('Harmonicity should be positive, clamping to 0');
      value = 0;
    } else if (harmonicity > 10) {
      warnings.push('Harmonicity is very high, consider values between 0-5');
    }

    return {
      isValid: warnings.length === 0,
      value,
      warnings
    };
  }

  private validateModulationIndex(modulationIndex: number): { isValid: boolean; value: number; warnings: string[] } {
    const warnings: string[] = [];
    let value = modulationIndex;

    if (typeof modulationIndex !== 'number' || isNaN(modulationIndex)) {
      warnings.push('ModulationIndex must be a valid number, using default value');
      value = 2;
    } else if (modulationIndex < 0) {
      warnings.push('ModulationIndex should be positive, clamping to 0');
      value = 0;
    } else if (modulationIndex > 100) {
      warnings.push('ModulationIndex is very high, consider values between 0-50');
    }

    return {
      isValid: warnings.length === 0,
      value,
      warnings
    };
  }

  private validateAttack(attack: number): { isValid: boolean; value: number; warnings: string[] } {
    const warnings: string[] = [];
    let value = attack;

    if (typeof attack !== 'number' || isNaN(attack)) {
      warnings.push('Attack must be a valid number, using default value');
      value = 0.1;
    } else if (attack < 0) {
      warnings.push('Attack should be positive, clamping to 0');
      value = 0;
    } else if (attack > 10) {
      warnings.push('Attack is very long, consider values between 0-2 seconds');
    }

    return {
      isValid: warnings.length === 0,
      value,
      warnings
    };
  }

  private validateRelease(release: number): { isValid: boolean; value: number; warnings: string[] } {
    const warnings: string[] = [];
    let value = release;

    if (typeof release !== 'number' || isNaN(release)) {
      warnings.push('Release must be a valid number, using default value');
      value = 0.5;
    } else if (release < 0) {
      warnings.push('Release should be positive, clamping to 0');
      value = 0;
    } else if (release > 10) {
      warnings.push('Release is very long, consider values between 0-3 seconds');
    }

    return {
      isValid: warnings.length === 0,
      value,
      warnings
    };
  }
}

// Validadores específicos para diferentes tipos de sintetizadores
export class PolySynthValidator extends BaseParameterValidator {
  validate(params: Partial<AudioParams>): ParameterValidationResult {
    const result = super.validate(params);

    // Validaciones específicas del PolySynth
    if (params.polyphony !== undefined) {
      const polyphonyResult = this.validatePolyphony(params.polyphony);
      if (!polyphonyResult.isValid) {
        result.warnings.push(...polyphonyResult.warnings);
      }
      result.sanitizedParams.polyphony = polyphonyResult.value;
    }

    return result;
  }

  private validatePolyphony(polyphony: number): { isValid: boolean; value: number; warnings: string[] } {
    const warnings: string[] = [];
    let value = polyphony;

    if (typeof polyphony !== 'number' || isNaN(polyphony)) {
      warnings.push('Polyphony must be a valid number, using default value');
      value = 4;
    } else if (polyphony < 1) {
      warnings.push('Polyphony should be at least 1, clamping to 1');
      value = 1;
    } else if (polyphony > 32) {
      warnings.push('Polyphony is very high, consider values between 1-16');
    }

    return {
      isValid: warnings.length === 0,
      value,
      warnings
    };
  }
}

export class PluckSynthValidator extends BaseParameterValidator {
  validate(params: Partial<AudioParams>): ParameterValidationResult {
    const result = super.validate(params);

    // Validaciones específicas del PluckSynth
    if (params.attackNoise !== undefined) {
      const attackNoiseResult = this.validateAttackNoise(params.attackNoise);
      if (!attackNoiseResult.isValid) {
        result.warnings.push(...attackNoiseResult.warnings);
      }
      result.sanitizedParams.attackNoise = attackNoiseResult.value;
    }

    if (params.dampening !== undefined) {
      const dampeningResult = this.validateDampening(params.dampening);
      if (!dampeningResult.isValid) {
        result.warnings.push(...dampeningResult.warnings);
      }
      result.sanitizedParams.dampening = dampeningResult.value;
    }

    return result;
  }

  private validateAttackNoise(attackNoise: number): { isValid: boolean; value: number; warnings: string[] } {
    const warnings: string[] = [];
    let value = attackNoise;

    if (typeof attackNoise !== 'number' || isNaN(attackNoise)) {
      warnings.push('AttackNoise must be a valid number, using default value');
      value = 1;
    } else if (attackNoise < 0) {
      warnings.push('AttackNoise should be positive, clamping to 0');
      value = 0;
    } else if (attackNoise > 10) {
      warnings.push('AttackNoise is very high, consider values between 0-5');
    }

    return {
      isValid: warnings.length === 0,
      value,
      warnings
    };
  }

  private validateDampening(dampening: number): { isValid: boolean; value: number; warnings: string[] } {
    const warnings: string[] = [];
    let value = dampening;

    if (typeof dampening !== 'number' || isNaN(dampening)) {
      warnings.push('Dampening must be a valid number, using default value');
      value = 4000;
    } else if (dampening < 0) {
      warnings.push('Dampening should be positive, clamping to 0');
      value = 0;
    } else if (dampening > 20000) {
      warnings.push('Dampening is very high, consider values between 0-10000');
    }

    return {
      isValid: warnings.length === 0,
      value,
      warnings
    };
  }
}
