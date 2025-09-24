import * as Tone from 'tone';
import { AudioParams, SoundSource } from '../factories/SoundSourceFactory';
import { 
  ParameterUpdateResult, 
  ParameterConfig, 
  DEFAULT_PARAMETER_CONFIG,
  SynthesizerType 
} from './types';
import { ParameterFactory } from './ParameterFactory';

export class ParameterManagerNew {
  private config: ParameterConfig;
  private parameterFactory: ParameterFactory;

  constructor(config: ParameterConfig = DEFAULT_PARAMETER_CONFIG) {
    this.config = config;
    this.parameterFactory = new ParameterFactory(config);
  }

  /**
   * Actualiza los parámetros de un sintetizador de forma segura usando Factory Pattern
   */
  public updateSoundParams(
    source: SoundSource, 
    params: Partial<AudioParams>
  ): ParameterUpdateResult {
    const result: ParameterUpdateResult = {
      success: true,
      updatedParams: [],
      errors: []
    };

    try {
      // Determinar el tipo de sintetizador
      const synthType = this.getSynthType(source.synth);
      
      // Crear validador y actualizador usando el factory
      const validator = this.parameterFactory.createValidator(synthType);
      const updater = this.parameterFactory.createUpdater(synthType);

      // Validar parámetros
      const validationResult = validator.validate(params);
      
      if (!validationResult.isValid) {
        result.errors.push(...validationResult.errors);
        console.warn(`Parameter validation failed:`, validationResult.errors);
      }

      if (validationResult.warnings.length > 0) {
        console.warn(`Parameter validation warnings:`, validationResult.warnings);
      }

      // Usar parámetros sanitizados para la actualización
      const sanitizedParams = validationResult.sanitizedParams;

      // Actualizar parámetros usando el actualizador específico
      const updateResult = updater.update(source.synth, sanitizedParams);
      
      // Combinar resultados
      result.success = result.success && updateResult.success;
      result.updatedParams.push(...updateResult.updatedParams);
      result.errors.push(...updateResult.errors);

      console.log(`ParameterManagerNew: Updated ${result.updatedParams.length} parameters for ${synthType}`);
      
    } catch (error) {
      result.success = false;
      result.errors.push(`General error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error(`ParameterManagerNew: Error updating parameters:`, error);
    }

    return result;
  }

  /**
   * Determina el tipo de sintetizador basado en la instancia
   */
  private getSynthType(synth: SynthesizerType): string {
    if (synth instanceof Tone.PolySynth) {
      return 'PolySynth';
    } else if (synth instanceof Tone.PluckSynth) {
      return 'PluckSynth';
    } else if (synth instanceof Tone.DuoSynth) {
      return 'DuoSynth';
    } else if (synth instanceof Tone.MembraneSynth) {
      return 'MembraneSynth';
    } else if (synth instanceof Tone.MonoSynth) {
      return 'MonoSynth';
    } else if (synth instanceof Tone.MetalSynth) {
      return 'MetalSynth';
    } else if (synth instanceof Tone.NoiseSynth) {
      return 'NoiseSynth';
    } else if (synth instanceof Tone.Sampler) {
      return 'Sampler';
    } else if (synth instanceof Tone.FMSynth) {
      return 'FMSynth';
    } else if (synth instanceof Tone.AMSynth) {
      return 'AMSynth';
    } else if (synth instanceof Tone.Synth) {
      return 'Synth';
    } else {
      console.warn(`Unknown synthesizer type:`, synth.constructor.name);
      return 'Synth'; // Fallback
    }
  }

  /**
   * Obtiene información sobre un tipo de sintetizador específico
   */
  public getSynthTypeInfo(synthType: string) {
    return this.parameterFactory.getSynthTypeInfo(synthType);
  }

  /**
   * Obtiene información sobre todos los tipos de sintetizadores soportados
   */
  public getAllSynthTypesInfo() {
    return this.parameterFactory.getAllSynthTypesInfo();
  }

  /**
   * Verifica si un tipo de sintetizador es soportado
   */
  public isSynthTypeSupported(synthType: string): boolean {
    return this.parameterFactory.isSynthTypeSupported(synthType);
  }

  /**
   * Obtiene los parámetros soportados para un tipo de sintetizador
   */
  public getSupportedParams(synthType: string): string[] {
    const updater = this.parameterFactory.createUpdater(synthType);
    return updater.getSupportedParams();
  }

  /**
   * Valida parámetros sin actualizar el sintetizador
   */
  public validateParams(synthType: string, params: Partial<AudioParams>) {
    const validator = this.parameterFactory.createValidator(synthType);
    return validator.validate(params);
  }

  /**
   * Obtiene la configuración actual del manager
   */
  public getConfig(): ParameterConfig {
    return { ...this.config };
  }

  /**
   * Actualiza la configuración del manager
   */
  public updateConfig(newConfig: Partial<ParameterConfig>): void {
    this.config = { ...this.config, ...newConfig };
    // Recrear el factory con la nueva configuración
    this.parameterFactory = new ParameterFactory(this.config);
    console.log(`ParameterManagerNew: Configuration updated`);
  }

  /**
   * Obtiene estadísticas del manager
   */
  public getManagerStats(): {
    supportedSynthTypes: number;
    config: ParameterConfig;
    factoryInfo: {
      validatorTypes: string[];
      updaterTypes: string[];
    };
  } {
    const allTypes = this.parameterFactory.getSupportedSynthTypes();
    
    return {
      supportedSynthTypes: allTypes.length,
      config: this.getConfig(),
      factoryInfo: {
        validatorTypes: ['BaseParameterValidator', 'PolySynthValidator', 'PluckSynthValidator'],
        updaterTypes: [
          'BaseSynthParameterUpdater',
          'PolySynthParameterUpdater',
          'PluckSynthParameterUpdater',
          'DuoSynthParameterUpdater',
          'MembraneSynthParameterUpdater',
          'MetalSynthParameterUpdater',
          'NoiseSynthParameterUpdater',
          'SamplerParameterUpdater'
        ]
      }
    };
  }

  /**
   * Limpia recursos y resetea el manager
   */
  public reset(): void {
    this.config = { ...DEFAULT_PARAMETER_CONFIG };
    this.parameterFactory = new ParameterFactory(this.config);
    console.log(`ParameterManagerNew: Manager reset to default configuration`);
  }
}
