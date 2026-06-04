import { create } from 'zustand';

export interface WorldSettingsState {
  showGrid: boolean;
  showEffectZoneWireframe: boolean;
  showEffectZoneColor: boolean;
  showHiddenZones: boolean;
}

export interface WorldSettingsActions {
  setShowGrid: (show: boolean) => void;
  setShowEffectZoneWireframe: (show: boolean) => void;
  setShowEffectZoneColor: (show: boolean) => void;
  setShowHiddenZones: (show: boolean) => void;
}

export const useWorldSettingsStore = create<WorldSettingsState & WorldSettingsActions>((set) => ({
  // Estado inicial
  showGrid: true,
  showEffectZoneWireframe: true,
  showEffectZoneColor: true,
  showHiddenZones: false,

  // Acciones
  setShowGrid: (show) => set({ showGrid: show }),
  setShowEffectZoneWireframe: (show) => set({ showEffectZoneWireframe: show }),
  setShowEffectZoneColor: (show) => set({ showEffectZoneColor: show }),
  setShowHiddenZones: (show) => set({ showHiddenZones: show }),
}));
