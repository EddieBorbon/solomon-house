// Exportar tipos
export * from './types';

// Exportar factories y managers
export { EffectFactory } from './EffectFactory';
export { EffectUpdaterFactory } from './EffectUpdater';
export { SpatialEffectManager } from './SpatialEffectManager';
export { TestOscillatorManager } from './TestOscillatorManager';

// Exportar el manager principal refactorizado
export { EffectManagerNew } from './EffectManagerNew';

// Re-exportar el manager original para compatibilidad durante la migración
export { EffectManager } from '../managers/EffectManager';
