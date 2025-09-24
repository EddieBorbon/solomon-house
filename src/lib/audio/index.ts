// Exportar tipos
export * from './types';

// Exportar comandos
export { 
  BaseAudioCommand,
  CreateSoundSourceCommand, 
  RemoveSoundSourceCommand, 
  CreateGlobalEffectCommand 
} from './AudioCommand';

// Exportar componentes refactorizados
export { AudioOrchestrator } from './AudioOrchestrator';
export { AudioStateManager } from './AudioStateManager';

// Exportar el manager principal refactorizado
export { AudioManagerNew } from './AudioManagerNew';

// Re-exportar el manager original para compatibilidad durante la migración
export { AudioManager } from '../AudioManager';
