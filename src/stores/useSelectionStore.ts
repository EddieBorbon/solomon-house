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
    
    set((state) => ({
      selectedEntityId: id,
      // Resetear el modo de transformación si no hay entidad seleccionada
      transformMode: id === null ? 'translate' : state.transformMode,
    }));

  },

  clearSelection: () => {
    
    set({
      selectedEntityId: null,
      transformMode: 'translate',
    });

  },

  // Acciones de transformación
  setTransformMode: (mode: TransformMode) => {
    
    set({ transformMode: mode });

  },

  // Acciones de consulta
  getSelectedEntityId: () => {
    const selectedId = get().selectedEntityId;
    return selectedId;
  },

  getTransformMode: () => {
    const mode = get().transformMode;
    return mode;
  },

  isEntitySelected: (id: string) => {
    const isSelected = get().selectedEntityId === id;
    return isSelected;
  }
}));