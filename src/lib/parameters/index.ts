// Exportar tipos
export * from './types';

// Exportar validadores
export { 
  BaseParameterValidator, 
  PolySynthValidator, 
  PluckSynthValidator 
} from './ParameterValidator';

// Exportar actualizadores
export { 
  BaseSynthParameterUpdater,
  PolySynthParameterUpdater,
  PluckSynthParameterUpdater,
  DuoSynthParameterUpdater,
  MembraneSynthParameterUpdater,
  MetalSynthParameterUpdater,
  NoiseSynthParameterUpdater,
  SamplerParameterUpdater
} from './SynthParameterUpdater';

// Exportar factories
export { 
  ParameterValidatorFactory, 
  SynthUpdaterFactory, 
  ParameterFactory 
} from './ParameterFactory';

// Exportar el manager principal refactorizado
export { ParameterManagerNew } from './ParameterManagerNew';

// Re-exportar el manager original para compatibilidad durante la migración
export { ParameterManager } from '../managers/ParameterManager';
