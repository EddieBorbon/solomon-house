import { create } from 'zustand';

// Tipos para selección y transformaciones
export type TransformMode = 'translate' | 'rotate' | 'scale';

// Estado específico para selección
export interface SelectionState {
  selectedEntityId: string | null;
  transformMode: TransformMode;
}

// Acciones específicas para selección
export interface SelectionActions {
  // Acciones de selección
  selectEntity: (id: string | null) => void;
  clearSelection: () => void;
  
  // Acciones de transformación
  setTransformMode: (mode: TransformMode) => void;
  
  // Acciones de consulta
  getSelectedEntityId: () => string | null;
  getTransformMode: () => TransformMode;
  isEntitySelected: (id: string) => boolean;
}

/**
 * Store especializado para gestión de selección y transformaciones
 * Implementa Single Responsibility Principle
 */
export const useSelectionStore = create<SelectionState & SelectionActions>((set, get) => ({
  // Estado inicial
  selectedEntityId: null,
  transformMode: 'translate',

  // Acciones de selección
  selectEntity: (id: string | null) => {
    console.log(`🎯 SelectionStore: Seleccionando entidad: ${id || 'null'}`);
    
    set((state) => ({
      selectedEntityId: id,
      // Resetear el modo de transformación si no hay entidad seleccionada
      transformMode: id === null ? 'translate' : state.transformMode,
    }));

    console.log(`🎯 SelectionStore: Entidad ${id || 'null'} seleccionada`);
  },

  clearSelection: () => {
    console.log(`🧹 SelectionStore: Limpiando selección`);
    
    set({
      selectedEntityId: null,
      transformMode: 'translate',
    });

    console.log(`🧹 SelectionStore: Selección limpiada`);
  },

  // Acciones de transformación
  setTransformMode: (mode: TransformMode) => {
    console.log(`🔄 SelectionStore: Estableciendo modo de transformación: ${mode}`);
    
    set({ transformMode: mode });

    console.log(`🔄 SelectionStore: Modo de transformación establecido: ${mode}`);
  },

  // Acciones de consulta
  getSelectedEntityId: () => {
    const selectedId = get().selectedEntityId;
    console.log(`🔍 SelectionStore: ID de entidad seleccionada: ${selectedId || 'null'}`);
    return selectedId;
  },

  getTransformMode: () => {
    const mode = get().transformMode;
    console.log(`🔍 SelectionStore: Modo de transformación: ${mode}`);
    return mode;
  },

  isEntitySelected: (id: string) => {
    const isSelected = get().selectedEntityId === id;
    console.log(`🔍 SelectionStore: Entidad ${id} ${isSelected ? 'está seleccionada' : 'no está seleccionada'}`);
    return isSelected;
  }
}));