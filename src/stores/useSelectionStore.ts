import { create } from 'zustand';
import { type SelectionActions, type BaseEntity } from '../types/world';

interface SelectionState {
  selectedEntityId: string | null;
  transformMode: 'translate' | 'rotate' | 'scale';
}

export const useSelectionStore = create<SelectionState & SelectionActions>((set, get) => ({
  // Estado inicial
  selectedEntityId: null,
  transformMode: 'translate',

  // Acciones para gestión de selección
  selectEntity: (id: string | null) => {
    set({ selectedEntityId: id });
    console.log(`🎯 Entidad seleccionada: ${id || 'ninguna'}`);
  },

  setTransformMode: (mode: 'translate' | 'rotate' | 'scale') => {
    set({ transformMode: mode });
    console.log(`🔄 Modo de transformación cambiado a: ${mode}`);
  },

  getSelectedEntity: () => {
    const state = get();
    // Esta función necesitará acceso a los otros stores para obtener la entidad completa
    // Por ahora retornamos null, se implementará en el store principal
    return null;
  },

  getSelectedEntityType: () => {
    const state = get();
    // Esta función necesitará acceso a los otros stores para determinar el tipo
    // Por ahora retornamos null, se implementará en el store principal
    return null;
  },
}));
