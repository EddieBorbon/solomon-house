import { create } from 'zustand';
import { useGridStore } from './useGridStore';
import { useObjectStore } from './useObjectStore';
import { useMobileStore } from './useMobileStore';
import { useEffectStore } from './useEffectStore';
import { useSelectionStore } from './useSelectionStore';
import { type WorldState, type WorldActions, type BaseEntity } from '../types/world';

// Estado adicional para el store principal
interface MainWorldState {
  currentProjectId: string | null;
  worlds: Array<{ id: string; name: string }>;
  currentWorldId: string | null;
}

export const useWorldStoreNew = create<MainWorldState & WorldActions>((set, get) => ({
  // Estado inicial
  currentProjectId: null,
  worlds: [{ id: 'default', name: 'Default World' }],
  currentWorldId: 'default',

  // Acciones de proyecto
  setCurrentProjectId: (projectId: string | null) => {
    set({ currentProjectId: projectId });
  },

  // Acciones de mundos
  createWorld: (name: string) => {
    const state = get();
    const newWorld = {
      id: `world_${Date.now()}`,
      name: name
    };
    
    set({
      worlds: [...state.worlds, newWorld],
      currentWorldId: newWorld.id
    });
    
  },

  deleteWorld: (id: string) => {
    const state = get();
    
    if (id === 'default') {
      return;
    }
    
    const updatedWorlds = state.worlds.filter(w => w.id !== id);
    const newCurrentWorldId = state.currentWorldId === id ? 'default' : state.currentWorldId;
    
    set({
      worlds: updatedWorlds,
      currentWorldId: newCurrentWorldId
    });
    
  },

  switchWorld: (id: string) => {
    const state = get();
    const world = state.worlds.find(w => w.id === id);
    
    if (world) {
      set({ currentWorldId: id });
    } else {
    }
  },

  // Delegación de acciones a stores especializados
  // Grid Actions
  getGridKey: (coordinates) => useGridStore.getState().getGridKey(coordinates),
  loadGrid: (coordinates) => useGridStore.getState().loadGrid(coordinates),
  unloadGrid: (coordinates) => useGridStore.getState().unloadGrid(coordinates),
  moveToGrid: (coordinates) => useGridStore.getState().moveToGrid(coordinates),
  getAdjacentGrids: () => useGridStore.getState().getAdjacentGrids(),
  createGrid: (position, size) => useGridStore.getState().createGrid(position, size),
  selectGrid: (gridId) => useGridStore.getState().selectGrid(gridId),
  setActiveGrid: (gridId) => useGridStore.getState().setActiveGrid(gridId),
  updateGrid: (gridId, updates) => useGridStore.getState().updateGrid(gridId, updates),
  deleteGrid: (gridId) => useGridStore.getState().deleteGrid(gridId),
  resizeGrid: (gridId, newSize) => useGridStore.getState().resizeGrid(gridId, newSize),
  moveGrid: (gridId, position) => useGridStore.getState().moveGrid(gridId, position),
  rotateGrid: (gridId, rotation) => useGridStore.getState().rotateGrid(gridId, rotation),
  scaleGrid: (gridId, scale) => useGridStore.getState().scaleGrid(gridId, scale),

  // Sound Object Actions
  addObject: (type, position) => useObjectStore.getState().addObject(type, position),
  removeObject: (id) => useObjectStore.getState().removeObject(id),
  updateObject: (id, updates) => useObjectStore.getState().updateObject(id, updates),
  toggleObjectAudio: (id, forceState) => useObjectStore.getState().toggleObjectAudio(id, forceState),
  triggerObjectNote: (id) => useObjectStore.getState().triggerObjectNote(id),
  triggerObjectPercussion: (id) => useObjectStore.getState().triggerObjectPercussion(id),
  triggerObjectAttackRelease: (id) => useObjectStore.getState().triggerObjectAttackRelease(id),
  startObjectGate: (id) => useObjectStore.getState().startObjectGate(id),
  stopObjectGate: (id) => useObjectStore.getState().stopObjectGate(id),
  clearAllObjects: () => useObjectStore.getState().clearAllObjects(),

  // Mobile Object Actions
  addMobileObject: (position) => useMobileStore.getState().addMobileObject(position),
  updateMobileObject: (id, updates) => useMobileStore.getState().updateMobileObject(id, updates),
  removeMobileObject: (id) => useMobileStore.getState().removeMobileObject(id),
  updateMobileObjectPosition: (id, position) => useMobileStore.getState().updateMobileObjectPosition(id, position),

  // Effect Zone Actions
  addEffectZone: (type, position, shape) => useEffectStore.getState().addEffectZone(type, position, shape),
  updateEffectZone: (id, updates) => useEffectStore.getState().updateEffectZone(id, updates),
  removeEffectZone: (id) => useEffectStore.getState().removeEffectZone(id),
  toggleLockEffectZone: (id) => useEffectStore.getState().toggleLockEffectZone(id),
  setEditingEffectZone: (isEditing) => useEffectStore.getState().setEditingEffectZone(isEditing),
  refreshAllEffects: () => useEffectStore.getState().refreshAllEffects(),
  debugAudioChain: (soundId) => useEffectStore.getState().debugAudioChain(soundId),

  // Selection Actions
  selectEntity: (id) => {
    // Actualizar selección en todos los stores
    useObjectStore.getState().selectEntity(id);
    useMobileStore.getState().selectEntity(id);
    useEffectStore.getState().selectEntity(id);
    useSelectionStore.getState().selectEntity(id);
  },
  setTransformMode: (mode) => useSelectionStore.getState().setTransformMode(mode),
  getSelectedEntity: () => {
    const selectedId = useSelectionStore.getState().selectedEntityId;
    if (!selectedId) return null;

    // Buscar en todos los stores
    const soundObject = useObjectStore.getState().getById(selectedId);
    if (soundObject) return soundObject;

    const mobileObject = useMobileStore.getState().getById(selectedId);
    if (mobileObject) return mobileObject;

    const effectZone = useEffectStore.getState().getById(selectedId);
    if (effectZone) return effectZone;

    return null;
  },
  getSelectedEntityType: () => {
    const selectedId = useSelectionStore.getState().selectedEntityId;
    if (!selectedId) return null;

    // Determinar el tipo de entidad seleccionada
    if (useObjectStore.getState().getById(selectedId)) return 'soundObject';
    if (useMobileStore.getState().getById(selectedId)) return 'mobileObject';
    if (useEffectStore.getState().getById(selectedId)) return 'effectZone';

    return null;
  },

  // Implementación de EntityActions para compatibilidad
  add: (entity) => {
    // Esta función necesitará ser más específica según el tipo de entidad
  },
  update: (id, updates) => {
    // Esta función necesitará ser más específica según el tipo de entidad
  },
  remove: (id) => {
    // Esta función necesitará ser más específica según el tipo de entidad
  },
  select: (id) => {
    get().selectEntity(id);
  },
  getById: (id) => {
    // Buscar en todos los stores
    const soundObject = useObjectStore.getState().getById(id);
    if (soundObject) return soundObject;

    const mobileObject = useMobileStore.getState().getById(id);
    if (mobileObject) return mobileObject;

    const effectZone = useEffectStore.getState().getById(id);
    if (effectZone) return effectZone;

    return undefined;
  },
  getAll: () => {
    // Retornar todas las entidades de todos los stores
    const soundObjects = useObjectStore.getState().getAll();
    const mobileObjects = useMobileStore.getState().getAll();
    const effectZones = useEffectStore.getState().getAll();
    
    return [...soundObjects, ...mobileObjects, ...effectZones];
  },
}));

// Hook personalizado para acceder a todos los stores combinados
export const useWorldStore = () => {
  const mainStore = useWorldStoreNew();
  const gridStore = useGridStore();
  const objectStore = useObjectStore();
  const mobileStore = useMobileStore();
  const effectStore = useEffectStore();
  const selectionStore = useSelectionStore();

  return {
    // Estado combinado
    ...mainStore,
    ...gridStore,
    ...objectStore,
    ...mobileStore,
    ...effectStore,
    ...selectionStore,
    
    // Estado específico de cada store
    grids: gridStore.grids,
    objects: objectStore.objects,
    mobileObjects: mobileStore.mobileObjects,
    effectZones: effectStore.effectZones,
    selectedEntityId: selectionStore.selectedEntityId,
    transformMode: selectionStore.transformMode,
    isEditingEffectZone: effectStore.isEditingEffectZone,
  };
};
