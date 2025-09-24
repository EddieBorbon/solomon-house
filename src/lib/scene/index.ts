// Exportar tipos
export * from './types';

// Exportar factory
export { SceneObjectFactory } from './SceneObjectFactory';

// Exportar renderer
export { SceneRenderer } from './SceneRenderer';

// Exportar componente principal refactorizado
export { SceneContentNew } from './SceneContentNew';

// Re-exportar el componente original para compatibilidad durante la migración
export { SceneContent } from '../../components/world/SceneContent';
