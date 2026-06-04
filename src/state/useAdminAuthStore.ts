import { create } from 'zustand';
import { useWorldStore } from './useWorldStore';

export interface AdminAuthState {
  isEditingLocked: boolean;
  isAdminAuthenticated: boolean;
}

export interface AdminAuthActions {
  canEdit: () => boolean;
  lockEditing: () => void;
  unlockEditing: (password: string) => boolean;
  authenticateAdmin: (password: string) => boolean;
}

const ADMIN_PASSWORD = '%3D27eaf[}V]3]';

export const useAdminAuthStore = create<AdminAuthState & AdminAuthActions>((set, get) => ({
  // Estado inicial
  isEditingLocked: false,
  isAdminAuthenticated: false,

  // Acciones
  canEdit: () => {
    // Obtener valores dinámicamente de useWorldStore para evitar acoplamiento estático circular
    const worldState = useWorldStore.getState();

    // Si está conectado al mundo global, siempre permitir edición
    if (worldState.globalWorldConnected) {
      return true;
    }
    // Si hay un proyecto guardado y la edición está bloqueada, verificar autenticación
    if (worldState.currentProjectId && get().isEditingLocked) {
      return get().isAdminAuthenticated;
    }
    // Permitir edición en todos los demás casos
    return true;
  },

  lockEditing: () => {
    set({ isEditingLocked: true, isAdminAuthenticated: false });
  },

  unlockEditing: (password: string) => {
    if (password === ADMIN_PASSWORD) {
      set({ isEditingLocked: false, isAdminAuthenticated: true });
      return true;
    }
    return false;
  },

  authenticateAdmin: (password: string) => {
    if (password === ADMIN_PASSWORD) {
      set({ isAdminAuthenticated: true });
      return true;
    }
    return false;
  },
}));
