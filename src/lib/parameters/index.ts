// Exportar tipos
export * from './types';

// Exportar factory
export { ParameterComponentFactory } from './ParameterComponentFactory';

// Exportar manager
export { ParameterManager } from './ParameterManager';

// Exportar componente principal refactorizado
export { ParameterEditorNew } from './ParameterEditorNew';

// Re-exportar el componente original para compatibilidad durante la migración
export { ParameterEditor } from '../../components/ui/ParameterEditor';