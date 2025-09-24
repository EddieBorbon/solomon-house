import { 
  ParameterValidator, 
  SynthParameterUpdater, 
  ParameterValidatorFactory, 
  SynthUpdaterFactory,
  ParameterConfig,
  SynthType
} from './types';
import { 
  BaseParameterValidator, 
  PolySynthValidator, 
  PluckSynthValidator 
} from './ParameterValidator';
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

// Factory para crear validadores de parámetros
export class ParameterValidatorFactory implements ParameterValidatorFactory {
  private config: ParameterConfig;

  constructor(config: ParameterConfig) {
    this.config = config;
  }

  createValidator(synthType: string): ParameterValidator {
    switch (synthType) {
      case 'PolySynth':
        return new PolySynthValidator(this.config);
      case 'PluckSynth':
        return new PluckSynthValidator(this.config);
      case 'DuoSynth':
      case 'MembraneSynth':
      case 'MonoSynth':
      case 'MetalSynth':
      case 'NoiseSynth':
      case 'Sampler':
      case 'FMSynth':
      case 'AMSynth':
      case 'Synth':
        return new BaseParameterValidator(this.config);
      default:
        console.warn(`Unknown synth type: ${synthType}, using base validator`);
        return new BaseParameterValidator(this.config);
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

// Factory para crear actualizadores de sintetizadores
export class SynthUpdaterFactory implements SynthUpdaterFactory {
  private config: ParameterConfig;

  constructor(config: ParameterConfig) {
    this.config = config;
  }

  createUpdater(synthType: string): SynthParameterUpdater {
    switch (synthType) {
      case 'PolySynth':
        return new PolySynthParameterUpdater(this.config);
      case 'PluckSynth':
        return new PluckSynthParameterUpdater(this.config);
      case 'DuoSynth':
        return new DuoSynthParameterUpdater(this.config);
      case 'MembraneSynth':
        return new MembraneSynthParameterUpdater(this.config);
      case 'MetalSynth':
        return new MetalSynthParameterUpdater(this.config);
      case 'NoiseSynth':
        return new NoiseSynthParameterUpdater(this.config);
      case 'Sampler':
        return new SamplerParameterUpdater(this.config);
      case 'MonoSynth':
      case 'FMSynth':
      case 'AMSynth':
      case 'Synth':
        return new BaseSynthParameterUpdater(this.config);
      default:
        console.warn(`Unknown synth type: ${synthType}, using base updater`);
        return new BaseSynthParameterUpdater(this.config);
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
  private validatorFactory: ParameterValidatorFactory;
  private updaterFactory: SynthUpdaterFactory;

  constructor(config: ParameterConfig) {
    this.validatorFactory = new ParameterValidatorFactory(config);
    this.updaterFactory = new SynthUpdaterFactory(config);
  }

  /**
   * Crea un validador para el tipo de sintetizador especificado
   */
  public createValidator(synthType: string): ParameterValidator {
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
