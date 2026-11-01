import { create } from 'zustand';
import { useWorldStore } from './useWorldStore';
import { onAdminChange, signInAsAdmin } from '../lib/adminAuth';

export interface AdminAuthState {
  isEditingLocked: boolean;
  isAdminAuthenticated: boolean;
}

export interface AdminAuthActions {
  canEdit: () => boolean;
  lockEditing: () => void;
  unlockEditing: () => Promise<boolean>;
  authenticateAdmin: () => Promise<boolean>;
}

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

  // Bloquea la edición local; la sesión de Google sigue abierta y
  // unlockEditing la reutiliza sin volver a pedir login
  lockEditing: () => {
    set({ isEditingLocked: true, isAdminAuthenticated: false });
  },

  // Login de admin con Google (Firebase Auth); ver src/lib/adminAuth.ts
  unlockEditing: async () => {
    const ok = await signInAsAdmin();
    if (ok) {
      set({ isEditingLocked: false, isAdminAuthenticated: true });
    }
    return ok;
  },

  authenticateAdmin: async () => {
    const ok = await signInAsAdmin();
    if (ok) {
      set({ isAdminAuthenticated: true });
    }
    return ok;
  },
}));

// Si la sesión de Firebase se cierra o expira, retirar los permisos de admin
if (typeof window !== 'undefined') {
  onAdminChange((isAdmin) => {
    if (!isAdmin && useAdminAuthStore.getState().isAdminAuthenticated) {
      useAdminAuthStore.setState({ isAdminAuthenticated: false });
    }
  });
}
