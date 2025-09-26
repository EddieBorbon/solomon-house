import { 
  IParameterValidator, 
  ParameterConfig,
  SynthParameterUpdater,
  ValidationResult,
  AudioParams,
  ParameterUpdateResult
} from './types';

// Tipo base para sintetizadores
type BaseSynthesizer = {
  [key: string]: unknown;
};
import { 
  BaseParameterValidator, 
  PolySynthValidator, 
  PluckSynthValidator 
} from './ParameterValidator';
import { EffectType, SoundObjectType } from '../../types/world';
import { 
  BaseSynthParameterUpdater,
  PolySynthParameterUpdater,
  PluckSynthParameterUpdater,
  DuoSynthParameterUpdater,
  MembraneSynthParameterUpdater,
  MetalSynthParameterUpdater,
  NoiseSynthParameterUpdater,
  SamplerParameterUpdater
} from './SynthParameterUpdater';

// Adaptadores para convertir validadores existentes a IParameterValidator
class BaseParameterValidatorAdapter implements IParameterValidator {
  private validator: BaseParameterValidator;

  constructor(validator: BaseParameterValidator) {
    this.validator = validator;
  }

  validate(params: Partial<AudioParams>): ValidationResult {
    return {
      isValid: true,
      errors: [],
      warnings: [],
      sanitizedParams: params
    };
  }

  validateEffectParameter(effectType: EffectType, param: string, value: unknown): ValidationResult {
    // Implementación básica para efectos
    return {
      isValid: true,
      errors: [],
      warnings: [],
      normalizedValue: value
    };
  }

  validateSoundObjectParameter(objectType: SoundObjectType, param: string, value: unknown): ValidationResult {
    // Implementación básica para objetos de sonido
    return {
      isValid: true,
      errors: [],
      warnings: [],
      normalizedValue: value
    };
  }

  validateMobileObjectParameter(param: string, value: unknown): ValidationResult {
    // Implementación básica para objetos móviles
    return {
      isValid: true,
      errors: [],
      warnings: [],
      normalizedValue: value
    };
  }
}

class PolySynthValidatorAdapter implements IParameterValidator {
  private validator: PolySynthValidator;

  constructor(validator: PolySynthValidator) {
    this.validator = validator;
  }

  validate(params: Partial<AudioParams>): ValidationResult {
    return {
      isValid: true,
      errors: [],
      warnings: [],
      sanitizedParams: params
    };
  }

  validateEffectParameter(effectType: EffectType, param: string, value: unknown): ValidationResult {
    return {
      isValid: true,
      errors: [],
      warnings: [],
      normalizedValue: value
    };
  }

  validateSoundObjectParameter(objectType: SoundObjectType, param: string, value: unknown): ValidationResult {
    return {
      isValid: true,
      errors: [],
      warnings: [],
      normalizedValue: value
    };
  }

  validateMobileObjectParameter(param: string, value: unknown): ValidationResult {
    return {
      isValid: true,
      errors: [],
      warnings: [],
      normalizedValue: value
    };
  }
}

class PluckSynthValidatorAdapter implements IParameterValidator {
  private validator: PluckSynthValidator;

  constructor(validator: PluckSynthValidator) {
    this.validator = validator;
  }

  validate(params: Partial<AudioParams>): ValidationResult {
    return {
      isValid: true,
      errors: [],
      warnings: [],
      sanitizedParams: params
    };
  }

  validateEffectParameter(effectType: EffectType, param: string, value: unknown): ValidationResult {
    return {
      isValid: true,
      errors: [],
      warnings: [],
      normalizedValue: value
    };
  }

  validateSoundObjectParameter(objectType: SoundObjectType, param: string, value: unknown): ValidationResult {
    return {
      isValid: true,
      errors: [],
      warnings: [],
      normalizedValue: value
    };
  }

  validateMobileObjectParameter(param: string, value: unknown): ValidationResult {
    return {
      isValid: true,
      errors: [],
      warnings: [],
      normalizedValue: value
    };
  }
}

// Factory para crear validadores de parámetros
export class ParameterValidatorFactoryImpl {
  private config: ParameterConfig;

  constructor(config: ParameterConfig) {
    this.config = config;
  }

  createValidator(synthType: string): IParameterValidator {
    switch (synthType) {
      case 'PolySynth':
        return new PolySynthValidatorAdapter(new PolySynthValidator(this.config));
      case 'PluckSynth':
        return new PluckSynthValidatorAdapter(new PluckSynthValidator(this.config));
      case 'DuoSynth':
      case 'MembraneSynth':
      case 'MonoSynth':
      case 'MetalSynth':
      case 'NoiseSynth':
      case 'Sampler':
      case 'FMSynth':
      case 'AMSynth':
      case 'Synth':
        return new BaseParameterValidatorAdapter(new BaseParameterValidator(this.config));
      default:
        return new BaseParameterValidatorAdapter(new BaseParameterValidator(this.config));
    }
  }

  getSupportedTypes(): string[] {
    return [
      'PolySynth',
      'PluckSynth', 
      'DuoSynth',
      'MembraneSynth',
      'MonoSynth',
      'MetalSynth',
      'NoiseSynth',
      'Sampler',
      'FMSynth',
      'AMSynth',
      'Synth'
    ];
  }
}

// Adaptadores para convertir actualizadores existentes a SynthParameterUpdater
class BaseSynthParameterUpdaterAdapter implements SynthParameterUpdater {
  private updater: BaseSynthParameterUpdater;

  constructor(updater: BaseSynthParameterUpdater) {
    this.updater = updater;
  }

  update(synth: BaseSynthesizer, params: Partial<AudioParams>): ParameterUpdateResult {
    try {
      const result = this.updater.update(synth, params);
      return result;
    } catch (error) {
      return {
        success: false,
        updatedParams: [],
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  updateParameter(synth: BaseSynthesizer, param: string, value: unknown): boolean {
    try {
      // Usar el método update del actualizador existente
      const result = this.updater.update(synth, { [param]: value });
      return result.success;
    } catch {
      return false;
    }
  }

  getSupportedParams(): string[] {
    // Retornar parámetros básicos soportados
    return ['frequency', 'volume', 'waveform', 'attack', 'release'];
  }
}

class PolySynthParameterUpdaterAdapter implements SynthParameterUpdater {
  private updater: PolySynthParameterUpdater;

  constructor(updater: PolySynthParameterUpdater) {
    this.updater = updater;
  }

  update(synth: BaseSynthesizer, params: Partial<AudioParams>): ParameterUpdateResult {
    try {
      const result = this.updater.update(synth, params);
      return result;
    } catch (error) {
      return {
        success: false,
        updatedParams: [],
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  updateParameter(synth: BaseSynthesizer, param: string, value: unknown): boolean {
    try {
      const result = this.updater.update(synth, { [param]: value });
      return result.success;
    } catch {
      return false;
    }
  }

  getSupportedParams(): string[] {
    return ['frequency', 'volume', 'waveform', 'attack', 'release', 'harmonicity', 'modulationIndex'];
  }
}

class PluckSynthParameterUpdaterAdapter implements SynthParameterUpdater {
  private updater: PluckSynthParameterUpdater;

  constructor(updater: PluckSynthParameterUpdater) {
    this.updater = updater;
  }

  update(synth: BaseSynthesizer, params: Partial<AudioParams>): ParameterUpdateResult {
    try {
      const result = this.updater.update(synth, params);
      return result;
    } catch (error) {
      return {
        success: false,
        updatedParams: [],
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  updateParameter(synth: BaseSynthesizer, param: string, value: unknown): boolean {
    try {
      const result = this.updater.update(synth, { [param]: value });
      return result.success;
    } catch {
      return false;
    }
  }

  getSupportedParams(): string[] {
    return ['frequency', 'volume', 'attack', 'release', 'resonance'];
  }
}

class DuoSynthParameterUpdaterAdapter implements SynthParameterUpdater {
  private updater: DuoSynthParameterUpdater;

  constructor(updater: DuoSynthParameterUpdater) {
    this.updater = updater;
  }

  update(synth: BaseSynthesizer, params: Partial<AudioParams>): ParameterUpdateResult {
    try {
      const result = this.updater.update(synth, params);
      return result;
    } catch (error) {
      return {
        success: false,
        updatedParams: [],
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  updateParameter(synth: BaseSynthesizer, param: string, value: unknown): boolean {
    try {
      const result = this.updater.update(synth, { [param]: value });
      return result.success;
    } catch {
      return false;
    }
  }

  getSupportedParams(): string[] {
    return ['frequency', 'volume', 'waveform', 'attack', 'release', 'harmonicity', 'modulationIndex'];
  }
}

class MembraneSynthParameterUpdaterAdapter implements SynthParameterUpdater {
  private updater: MembraneSynthParameterUpdater;

  constructor(updater: MembraneSynthParameterUpdater) {
    this.updater = updater;
  }

  update(synth: BaseSynthesizer, params: Partial<AudioParams>): ParameterUpdateResult {
    try {
      const result = this.updater.update(synth, params);
      return result;
    } catch (error) {
      return {
        success: false,
        updatedParams: [],
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  updateParameter(synth: BaseSynthesizer, param: string, value: unknown): boolean {
    try {
      const result = this.updater.update(synth, { [param]: value });
      return result.success;
    } catch {
      return false;
    }
  }

  getSupportedParams(): string[] {
    return ['frequency', 'volume', 'attack', 'release', 'pitchDecay', 'octaves'];
  }
}

class MetalSynthParameterUpdaterAdapter implements SynthParameterUpdater {
  private updater: MetalSynthParameterUpdater;

  constructor(updater: MetalSynthParameterUpdater) {
    this.updater = updater;
  }

  update(synth: BaseSynthesizer, params: Partial<AudioParams>): ParameterUpdateResult {
    try {
      const result = this.updater.update(synth, params);
      return result;
    } catch (error) {
      return {
        success: false,
        updatedParams: [],
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  updateParameter(synth: BaseSynthesizer, param: string, value: unknown): boolean {
    try {
      const result = this.updater.update(synth, { [param]: value });
      return result.success;
    } catch {
      return false;
    }
  }

  getSupportedParams(): string[] {
    return ['frequency', 'volume', 'attack', 'release', 'harmonicity', 'modulationIndex', 'resonance'];
  }
}

class NoiseSynthParameterUpdaterAdapter implements SynthParameterUpdater {
  private updater: NoiseSynthParameterUpdater;

  constructor(updater: NoiseSynthParameterUpdater) {
    this.updater = updater;
  }

  update(synth: BaseSynthesizer, params: Partial<AudioParams>): ParameterUpdateResult {
    try {
      const result = this.updater.update(synth, params);
      return result;
    } catch (error) {
      return {
        success: false,
        updatedParams: [],
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  updateParameter(synth: BaseSynthesizer, param: string, value: unknown): boolean {
    try {
      const result = this.updater.update(synth, { [param]: value });
      return result.success;
    } catch {
      return false;
    }
  }

  getSupportedParams(): string[] {
    return ['volume', 'attack', 'release', 'noiseType'];
  }
}

class SamplerParameterUpdaterAdapter implements SynthParameterUpdater {
  private updater: SamplerParameterUpdater;

  constructor(updater: SamplerParameterUpdater) {
    this.updater = updater;
  }

  update(synth: BaseSynthesizer, params: Partial<AudioParams>): ParameterUpdateResult {
    try {
      const result = this.updater.update(synth, params);
      return result;
    } catch (error) {
      return {
        success: false,
        updatedParams: [],
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  updateParameter(synth: BaseSynthesizer, param: string, value: unknown): boolean {
    try {
      const result = this.updater.update(synth, { [param]: value });
      return result.success;
    } catch {
      return false;
    }
  }

  getSupportedParams(): string[] {
    return ['volume', 'attack', 'release', 'pitch'];
  }
}

// Factory para crear actualizadores de sintetizadores
export class SynthUpdaterFactoryImpl {
  private config: ParameterConfig;

  constructor(config: ParameterConfig) {
    this.config = config;
  }

  createUpdater(synthType: string): SynthParameterUpdater {
    switch (synthType) {
      case 'PolySynth':
        return new PolySynthParameterUpdaterAdapter(new PolySynthParameterUpdater(this.config));
      case 'PluckSynth':
        return new PluckSynthParameterUpdaterAdapter(new PluckSynthParameterUpdater(this.config));
      case 'DuoSynth':
        return new DuoSynthParameterUpdaterAdapter(new DuoSynthParameterUpdater(this.config));
      case 'MembraneSynth':
        return new MembraneSynthParameterUpdaterAdapter(new MembraneSynthParameterUpdater(this.config));
      case 'MetalSynth':
        return new MetalSynthParameterUpdaterAdapter(new MetalSynthParameterUpdater(this.config));
      case 'NoiseSynth':
        return new NoiseSynthParameterUpdaterAdapter(new NoiseSynthParameterUpdater(this.config));
      case 'Sampler':
        return new SamplerParameterUpdaterAdapter(new SamplerParameterUpdater(this.config));
      case 'MonoSynth':
      case 'FMSynth':
      case 'AMSynth':
      case 'Synth':
        return new BaseSynthParameterUpdaterAdapter(new BaseSynthParameterUpdater(this.config));
      default:
        return new BaseSynthParameterUpdaterAdapter(new BaseSynthParameterUpdater(this.config));
    }
  }

  getSupportedTypes(): string[] {
    return [
      'PolySynth',
      'PluckSynth',
      'DuoSynth',
      'MembraneSynth',
      'MonoSynth',
      'MetalSynth',
      'NoiseSynth',
      'Sampler',
      'FMSynth',
      'AMSynth',
      'Synth'
    ];
  }
}

// Factory principal que combina ambos factories
export class ParameterFactory {
  private validatorFactory: ParameterValidatorFactoryImpl;
  private updaterFactory: SynthUpdaterFactoryImpl;

  constructor(config: ParameterConfig) {
    this.validatorFactory = new ParameterValidatorFactoryImpl(config);
    this.updaterFactory = new SynthUpdaterFactoryImpl(config);
  }

  /**
   * Crea un validador para el tipo de sintetizador especificado
   */
  public createValidator(synthType: string): IParameterValidator {
    return this.validatorFactory.createValidator(synthType);
  }

  /**
   * Crea un actualizador para el tipo de sintetizador especificado
   */
  public createUpdater(synthType: string): SynthParameterUpdater {
    return this.updaterFactory.createUpdater(synthType);
  }

  /**
   * Obtiene los tipos de sintetizadores soportados
   */
  public getSupportedSynthTypes(): string[] {
    return this.updaterFactory.getSupportedTypes();
  }

  /**
   * Verifica si un tipo de sintetizador es soportado
   */
  public isSynthTypeSupported(synthType: string): boolean {
    return this.updaterFactory.getSupportedTypes().includes(synthType);
  }

  /**
   * Obtiene información sobre un tipo de sintetizador específico
   */
  public getSynthTypeInfo(synthType: string): {
    type: string;
    supported: boolean;
    validator: string;
    updater: string;
    supportedParams: string[];
  } {
    const supported = this.isSynthTypeSupported(synthType);
    const validator = this.createValidator(synthType);
    const updater = this.createUpdater(synthType);

    return {
      type: synthType,
      supported,
      validator: validator.constructor.name,
      updater: updater.constructor.name,
      supportedParams: updater.getSupportedParams()
    };
  }

  /**
   * Obtiene información sobre todos los tipos de sintetizadores
   */
  public getAllSynthTypesInfo(): Array<{
    type: string;
    supported: boolean;
    validator: string;
    updater: string;
    supportedParams: string[];
  }> {
    return this.getSupportedSynthTypes().map(type => this.getSynthTypeInfo(type));
  }
}
