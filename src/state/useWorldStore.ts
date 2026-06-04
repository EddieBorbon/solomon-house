import { create } from 'zustand';
import { useGridStore } from '../stores/useGridStore';
import { useEffectStore } from '../stores/useEffectStore';
import { useObjectStore } from '../stores/useObjectStore';
import { useMobileStore } from '../stores/useMobileStore';
import { WorldStoreFacade } from './facades/WorldStoreFacade';
import { type AudioParams } from '../lib/AudioManager';
import { type GlobalWorldDoc } from '../lib/firebaseService';
import { persistenceService } from '../lib/persistenceService';
import { useWorldSettingsStore } from './useWorldSettingsStore';
import { useSelectionStore } from '../stores/useSelectionStore';
import { useAdminAuthStore } from './useAdminAuthStore';
import { useRealtimeSyncStore } from './useRealtimeSyncStore';

// Tipos para los objetos de sonido
export type SoundObjectType = 'cube' | 'sphere' | 'cylinder' | 'cone' | 'pyramid' | 'icosahedron' | 'plane' | 'torus' | 'dodecahedronRing' | 'spiral' | 'custom';

// Interfaz para una cuadrícula
export interface Grid {
  id: string;
  coordinates: [number, number, number]; // X, Y, Z de la cuadrícula
  position: [number, number, number]; // Posición 3D en el mundo
  rotation: [number, number, number]; // Rotación 3D
  scale: [number, number, number]; // Escala 3D
  objects: SoundObject[];
  mobileObjects: MobileObject[];
  effectZones: EffectZone[];
  gridSize: number;
  gridColor: string;
  isLoaded: boolean; // Si la cuadrícula está cargada en memoria
  isSelected: boolean; // Si la cuadrícula está seleccionada
  [key: string]: unknown; // Firma de índice para acceso dinámico
}

// Tipos de movimiento para objetos móviles
export type MovementType = 'circular' | 'polar' | 'random' | 'figure8' | 'spiral';

// Interfaz para un objeto de sonido
export interface SoundObject {
  id: string;
  type: SoundObjectType;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  audioParams: AudioParams;
  isSelected: boolean;
  audioEnabled: boolean;
  customShapeCode?: string; // Código Three.js para la forma personalizada
  customSynthesisCode?: string; // Código Tone.js para la síntesis personalizada
}

// Interfaz para un objeto móvil
export interface MobileObject {
  id: string;
  type: 'mobile';
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  isSelected: boolean;
  mobileParams: {
    movementType: MovementType;
    radius: number;
    speed: number;
    proximityThreshold: number;
    isActive: boolean;
    centerPosition: [number, number, number];
    direction: [number, number, number];
    axis: [number, number, number];
    amplitude: number;
    frequency: number;
    randomSeed: number;
    height: number;
    heightSpeed: number;
    showRadiusIndicator?: boolean;
    showProximityIndicator?: boolean;
    // Propiedades para la esfera móvil pequeña
    spherePosition?: [number, number, number]; // Posición inicial/offset de la esfera
    sphereRotation?: [number, number, number]; // Rotación de la esfera
    sphereScale?: [number, number, number]; // Escala de la esfera
    showSphere?: boolean; // Mostrar la esfera
  };
}

// Interfaz para una zona de efecto
export interface EffectZone {
  id: string;
  type: 'phaser' | 'autoFilter' | 'autoWah' | 'bitCrusher' | 'chebyshev' | 'chorus' | 'distortion' | 'feedbackDelay' | 'freeverb' | 'frequencyShifter' | 'jcReverb' | 'pingPongDelay' | 'pitchShift' | 'reverb' | 'stereoWidener' | 'tremolo' | 'vibrato';
  shape: 'sphere' | 'cube';
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  isSelected: boolean;
  isLocked: boolean;
  showWireframe?: boolean; // Control individual para mostrar/ocultar wireframe (por defecto true)
  showColor?: boolean; // Control individual para mostrar/ocultar color (por defecto true)
  // Parámetros específicos del efecto
  effectParams: {
    // Parámetros del Phaser
    frequency?: number;
    octaves?: number;
    stages?: number;
    Q?: number;
    // Parámetros del AutoFilter
    depth?: number;
    filterType?: 'lowpass' | 'highpass' | 'bandpass' | 'notch';
    filterQ?: number;
    lfoType?: 'sine' | 'square' | 'triangle' | 'sawtooth';
    // Parámetros adicionales para AutoWah
    sensitivity?: number;
    rolloff?: number;
    attack?: number;
    release?: number;
    // Parámetros del BitCrusher
    bits?: number;
    normFreq?: number;
    // Parámetros del Chebyshev
    order?: number;
    oversample?: 'none' | '2x' | '4x';
    // Parámetros del Distortion
    distortion?: number;
    distortionOversample?: 'none' | '2x' | '4x';
    // Parámetros del Chorus
    chorusFrequency?: number;
    chorusDelayTime?: number;
    chorusDepth?: number;
    chorusFeedback?: number;
    spread?: number;
    chorusType?: 'sine' | 'square' | 'triangle' | 'sawtooth';
    // Parámetros del FeedbackDelay
    delayTime?: number | string;
    feedback?: number;
    // Parámetros del PingPongDelay
    pingPongDelayTime?: number | string;
    pingPongFeedback?: number;
    maxDelay?: number;
    wet?: number;
    // Parámetros del PitchShift
    pitchShift?: number;
    windowSize?: number;
    // Parámetros del Reverb
    decay?: number;
    preDelay?: number;
    roomSize?: number;
    dampening?: number;
    // Parámetros del StereoWidener
    width?: number;
    // Parámetros del Tremolo
    tremoloFrequency?: number;
    tremoloDepth?: number;
    tremoloSpread?: number;
    tremoloType?: 'sine' | 'square' | 'triangle' | 'sawtooth';
    // Parámetros del Vibrato
    vibratoFrequency?: number;
    vibratoDepth?: number;
    vibratoType?: 'sine' | 'square' | 'triangle' | 'sawtooth';
    vibratoMaxDelay?: number;
    // Parámetros generales de zona de efectos
    radius?: number;
  };
}

// Estado del mundo 3D
export interface WorldState {
  // Sistema de cuadrículas contiguas
  grids: Map<string, Grid>; // Mapa de cuadrículas por coordenadas
  currentGridCoordinates: [number, number, number]; // Cuadrícula actual
  activeGridId: string | null; // ID de la cuadrícula activa para crear objetos
  gridSize: number; // Tamaño de cada cuadrícula
  renderDistance: number; // Distancia de renderizado (cuántas cuadrículas cargar)
  
  // Proyecto actual para sincronización
  currentProjectId: string | null;
  
  // Estado de objetos (de la cuadrícula actual)
  objects: SoundObject[];
  mobileObjects: MobileObject[]; // Array para objetos móviles
  effectZones: EffectZone[]; // Nuevo array para zonas de efectos
  selectedEntityId: string | null; // Renombrado de selectedObjectId para ser más genérico
  transformMode: 'translate' | 'rotate' | 'scale';
  isEditingEffectZone: boolean; // Nuevo estado para indicar cuando se está editando una zona de efectos
  
  // Estado de sincronización global
  isUpdatingFromFirestore: boolean; // Bandera para prevenir bucles bidireccionales
  globalWorldConnected: boolean; // Estado de conexión al mundo global
  locallyDeletedObjects: Set<string>; // IDs de objetos eliminados localmente
  
  // World management (placeholder implementation)
  worlds: Array<{ id: string; name: string }>;
  currentWorldId: string | null;
  
  // Configuración visual
  showGrid: boolean; // Control para mostrar/ocultar la cuadrícula
  showEffectZoneWireframe: boolean; // Control para mostrar/ocultar wireframe de zonas de efectos
  showEffectZoneColor: boolean; // Control para mostrar/ocultar color/visualización de zonas de efectos
  showHiddenZones: boolean; // Control para mostrar zonas ocultas (con wireframe y color desactivados)
  
  // Sistema de bloqueo de edición con admin (solo para proyectos guardados)
  isEditingLocked: boolean; // Si la edición está bloqueada
  isAdminAuthenticated: boolean; // Si el admin está autenticado
}

// Acciones disponibles en el store
export interface WorldActions {
  // Acciones para cuadrículas - Delegadas al useGridStore
  moveToGrid: (coordinates: [number, number, number]) => void;
  loadGrid: (coordinates: [number, number, number]) => void;
  unloadGrid: (coordinates: [number, number, number]) => void;
  getGridKey: (coordinates: [number, number, number]) => string;
  getAdjacentGrids: () => Array<[number, number, number]>;
  
  // Acciones para manipulación de cuadrículas - Delegadas al useGridStore
  createGrid: (position: [number, number, number], size?: number) => void;
  selectGrid: (gridId: string | null) => void;
  
  // Acciones para proyecto actual
  setCurrentProjectId: (projectId: string | null) => void;
  setActiveGrid: (gridId: string | null) => void;
  
  // Acciones para sincronización global
  setGlobalStateFromFirestore: (state: GlobalWorldDoc) => void;
  setIsUpdatingFromFirestore: (isUpdating: boolean) => void;
  setGlobalWorldConnected: (connected: boolean) => void;
  
  // Acciones para gestión de mundos
  createWorld: (name: string) => void;
  deleteWorld: (id: string) => void;
  switchWorld: (id: string) => void;
  updateGrid: (gridId: string, updates: Partial<Omit<Grid, 'id'>>) => void;
  deleteGrid: (gridId: string) => void;
  resizeGrid: (gridId: string, newSize: number) => void;
  moveGrid: (gridId: string, position: [number, number, number]) => void;
  rotateGrid: (gridId: string, rotation: [number, number, number]) => void;
  scaleGrid: (gridId: string, scale: [number, number, number]) => void;
  
  // Acciones para objetos
  addObject: (type: SoundObjectType, position: [number, number, number]) => void;
  removeObject: (id: string) => void;
  selectEntity: (id: string | null) => void; // Renombrado de selectObject para ser más genérico
  updateObject: (id: string, updates: Partial<Omit<SoundObject, 'id'>>) => void;
  toggleObjectAudio: (id: string) => void;
  triggerObjectNote: (id: string) => void;
  triggerObjectPercussion: (id: string) => void;
  // Nuevas acciones para interacción universal
  triggerObjectAttackRelease: (id: string) => void;
  startObjectGate: (id: string) => void;
  stopObjectGate: (id: string) => void;
  clearAllObjects: () => void;
  setTransformMode: (mode: 'translate' | 'rotate' | 'scale') => void;
  
  // Acciones globales para objetos sonoros
  addGlobalSoundObject: (object: SoundObject) => void;
  updateGlobalSoundObject: (objectId: string, updates: Partial<Omit<SoundObject, 'id'>>) => void;
  removeGlobalSoundObject: (objectId: string) => void;
  // Nuevas acciones para zonas de efectos
  addEffectZone: (type: 'phaser' | 'autoFilter' | 'autoWah' | 'bitCrusher' | 'chebyshev' | 'chorus' | 'distortion' | 'feedbackDelay' | 'freeverb' | 'frequencyShifter' | 'jcReverb' | 'pingPongDelay' | 'pitchShift' | 'reverb' | 'stereoWidener' | 'tremolo' | 'vibrato', position: [number, number, number], shape?: 'sphere' | 'cube') => void;
  updateEffectZone: (id: string, updates: Partial<Omit<EffectZone, 'id'>>) => void;
  removeEffectZone: (id: string) => void;
  toggleLockEffectZone: (id: string) => void;
  // Nuevas acciones para controlar la edición de zonas de efectos
  setEditingEffectZone: (isEditing: boolean) => void;
  refreshAllEffects: () => void;
  debugAudioChain: (soundId: string) => void;
  
  // Acciones globales para zonas de efectos
  addGlobalEffectZone: (effectZone: EffectZone) => void;
  updateGlobalEffectZone: (zoneId: string, updates: Partial<Omit<EffectZone, 'id'>>) => void;
  removeGlobalEffectZone: (zoneId: string) => void;
  
  // Acciones para configuración visual
  setShowGrid: (show: boolean) => void;
  setShowEffectZoneWireframe: (show: boolean) => void;
  setShowEffectZoneColor: (show: boolean) => void;
  setShowHiddenZones: (show: boolean) => void;
  
  // Acciones para bloqueo de edición con admin
  canEdit: () => boolean; // Verificar si la edición está permitida
  lockEditing: () => void;
  unlockEditing: (password: string) => boolean; // Retorna true si la contraseña es correcta
  authenticateAdmin: (password: string) => boolean; // Retorna true si la contraseña es correcta
  
  // Acciones para objetos móviles
  addMobileObject: (position: [number, number, number]) => void;
  updateMobileObject: (id: string, updates: Partial<Omit<MobileObject, 'id'>>) => void;
  removeMobileObject: (id: string) => void;
  updateMobileObjectPosition: (id: string, position: [number, number, number]) => void;
  
  // Acciones globales para objetos móviles
  addGlobalMobileObject: (mobileObject: MobileObject) => void;
  updateGlobalMobileObject: (objectId: string, updates: Partial<Omit<MobileObject, 'id'>>) => void;
  removeGlobalMobileObject: (objectId: string) => void;
}

// Función helper para obtener parámetros por defecto usando el provider
// const getDefaultAudioParams = (type: SoundObjectType): AudioParams => {
//   return DefaultParamsProvider.getDefaultAudioParams(type);
// };

// Instancia del facade que coordina todos los componentes
const worldStoreFacade = new WorldStoreFacade();

// Creación del store de Zustand
export const useWorldStore = create<WorldState & WorldActions>((set, get) => {
  // Obtener el estado inicial de useGridStore
  const initialGridState = useGridStore.getState();
  
  return {
    // Estado inicial - Sincronizado con useGridStore
    grids: new Map(initialGridState.grids),
    currentGridCoordinates: initialGridState.currentGridCoordinates,
    activeGridId: initialGridState.activeGridId,
    gridSize: initialGridState.gridSize,
    renderDistance: initialGridState.renderDistance,
    
    // Proyecto actual
    currentProjectId: null,
    
    // Estado de objetos (de la cuadrícula actual)
    objects: [],
    mobileObjects: [],
    effectZones: [],
    selectedEntityId: null,
    transformMode: 'translate' as const,
    isEditingEffectZone: false,
    
    // Estado de sincronización global
    isUpdatingFromFirestore: useRealtimeSyncStore.getState().isUpdatingFromFirestore,
    globalWorldConnected: useRealtimeSyncStore.getState().globalWorldConnected,
    locallyDeletedObjects: useRealtimeSyncStore.getState().locallyDeletedObjects,
    
    // World management state
    worlds: [{ id: 'default', name: 'Default World' }],
    currentWorldId: 'default',
    
    // Configuración visual
    showGrid: useWorldSettingsStore.getState().showGrid,
    showEffectZoneWireframe: useWorldSettingsStore.getState().showEffectZoneWireframe,
    showEffectZoneColor: useWorldSettingsStore.getState().showEffectZoneColor,
    showHiddenZones: useWorldSettingsStore.getState().showHiddenZones,
    
    // Sistema de bloqueo de edición con admin
    isEditingLocked: useAdminAuthStore.getState().isEditingLocked,
    isAdminAuthenticated: useAdminAuthStore.getState().isAdminAuthenticated,

  // Helper para verificar si la edición está permitida (solo para proyectos guardados, no global)
  canEdit: () => {
    return useAdminAuthStore.getState().canEdit();
  },

  // Acción para añadir un nuevo objeto - Delegada al WorldStoreFacade
  addObject: (type: SoundObjectType, position: [number, number, number]) => {
    const state = get();
    
    // Verificar si la edición está permitida
    if (!get().canEdit()) {
      alert('La edición está bloqueada. Ingresa la contraseña de administrador para editar.');
      return;
    }
    
    const activeGridId = state.activeGridId;
    if (!activeGridId) {
      return;
    }

    // Crear objeto usando el facade
    const newObject = worldStoreFacade.createObject(type, position, activeGridId);
    
    // IMPORTANTE: Solo usar acciones globales si estamos en el mundo global Y NO hay un proyecto cargado
    if (state.globalWorldConnected && !state.currentProjectId) {
      get().addGlobalSoundObject(newObject);
    } else {
      // Si hay un proyecto cargado, sincronizar cambios locales
      if (state.currentProjectId) {
        persistenceService.syncProjectChanges(state.currentProjectId);
      }
    }
  },

  // Acción para eliminar un objeto - Delegada al WorldStoreFacade
  removeObject: (id: string) => {
    const state = get();
    
    // Verificar si la edición está permitida
    if (!get().canEdit()) {
      alert('La edición está bloqueada. Ingresa la contraseña de administrador para editar.');
      return;
    }
    
    // IMPORTANTE: Solo usar acciones globales si estamos en el mundo global Y NO hay un proyecto cargado
    if (state.globalWorldConnected && !state.currentProjectId) {
      get().removeGlobalSoundObject(id);
    } else {
      const { gridId } = worldStoreFacade.findObjectById(id, state.grids);
      if (gridId) {
        // Eliminar objeto usando el facade
        worldStoreFacade.removeObject(id, gridId);
        
        set({
          selectedEntityId: state.selectedEntityId === id ? null : state.selectedEntityId,
        });

        if (state.currentProjectId) {
          persistenceService.syncProjectChanges(state.currentProjectId);
        }
      }
    }
  },

  // Acción para seleccionar una entidad - Delegada al WorldStoreFacade
  selectEntity: (id: string | null) => {
    worldStoreFacade.selectEntity(id);
  },

  // Acción para actualizar un objeto - Delegada al WorldStoreFacade
  updateObject: (id: string, updates: Partial<Omit<SoundObject, 'id'>>) => {
    const state = get();
    
    // Verificar si la edición está permitida
    if (!get().canEdit()) {
      alert('La edición está bloqueada. Ingresa la contraseña de administrador para editar.');
      return;
    }
    
    // IMPORTANTE: Solo usar acciones globales si estamos en el mundo global Y NO hay un proyecto cargado
    if (state.globalWorldConnected && !state.currentProjectId) {
      get().updateGlobalSoundObject(id, updates);
    } else {
      const { gridId } = worldStoreFacade.findObjectById(id, state.grids);
      if (gridId) {
        // Actualizar objeto usando el facade
        worldStoreFacade.updateObject(id, updates, gridId);
        
        // Si hay un proyecto cargado, sincronizar cambios con Firebase
        if (state.currentProjectId) {
          persistenceService.syncProjectChanges(state.currentProjectId);
        }
      }
    }
  },

  // Acción para activar/desactivar el audio de un objeto - Delegada al WorldStoreFacade
  toggleObjectAudio: (id: string, forceState?: boolean) => {
    const state = get();
    const { gridId } = worldStoreFacade.findObjectById(id, state.grids);
    
    if (gridId) {
      // Delegar al facade
      worldStoreFacade.toggleObjectAudio(id, forceState, gridId);
    }
  },

  // Acción para disparar una nota percusiva - Delegada al WorldStoreFacade
  triggerObjectNote: (id: string) => {
    const state = get();
    const { gridId } = worldStoreFacade.findObjectById(id, state.grids);
    
    if (gridId) {
      worldStoreFacade.triggerObjectNote(id, gridId);
    }
  },

  // Acción para disparar un objeto percusivo - Delegada al WorldStoreFacade
  triggerObjectPercussion: (id: string) => {
    const state = get();
    const { gridId } = worldStoreFacade.findObjectById(id, state.grids);
    
    if (gridId) {
      worldStoreFacade.triggerObjectPercussion(id, gridId);
    }
  },

  // Acción para disparar una nota con duración específica - Delegada al WorldStoreFacade
  triggerObjectAttackRelease: (id: string) => {
    const state = get();
    const { gridId } = worldStoreFacade.findObjectById(id, state.grids);
    
    if (gridId) {
      worldStoreFacade.triggerObjectAttackRelease(id, gridId);
    }
  },

  // Acción para iniciar el gate - Delegada al WorldStoreFacade
  startObjectGate: (id: string) => {
    const state = get();
    const { gridId } = worldStoreFacade.findObjectById(id, state.grids);
    
    if (gridId) {
      worldStoreFacade.startObjectGate(id, gridId);
    }
  },

  // Acción para detener el gate - Delegada al WorldStoreFacade
  stopObjectGate: (id: string) => {
    const state = get();
    const { gridId } = worldStoreFacade.findObjectById(id, state.grids);
    
    if (gridId) {
      worldStoreFacade.stopObjectGate(id, gridId);
    }
  },

  // Acción para limpiar todos los objetos - Delegada al WorldStoreFacade
  clearAllObjects: () => {
    // Verificar si la edición está permitida
    if (!get().canEdit()) {
      alert('La edición está bloqueada. Ingresa la contraseña de administrador para editar.');
      return;
    }
    
    // Limpiar objetos usando el facade
    worldStoreFacade.clearAllObjects();
    useMobileStore.getState().mobileObjects.forEach(obj => useMobileStore.getState().removeMobileObject(obj.id));
    useEffectStore.getState().effectZones.forEach(zone => useEffectStore.getState().removeEffectZone(zone.id));
    set({ selectedEntityId: null });
  },

  // Acción para establecer el modo de transformación - Delegada al WorldStoreFacade
  setTransformMode: (mode: 'translate' | 'rotate' | 'scale') => {
    worldStoreFacade.setTransformMode(mode);
  },

  // Nuevas acciones para zonas de efectos - Delegadas al WorldStoreFacade
  addEffectZone: (type: 'phaser' | 'autoFilter' | 'autoWah' | 'bitCrusher' | 'chebyshev' | 'chorus' | 'distortion' | 'feedbackDelay' | 'freeverb' | 'frequencyShifter' | 'jcReverb' | 'pingPongDelay' | 'pitchShift' | 'reverb' | 'stereoWidener' | 'tremolo' | 'vibrato', position: [number, number, number], shape: 'sphere' | 'cube' = 'sphere') => {
    const state = get();
    
    // Verificar si la edición está permitida
    if (!get().canEdit()) {
      alert('La edición está bloqueada. Ingresa la contraseña de administrador para editar.');
      return;
    }
    
    const activeGridId = state.activeGridId;
    if (!activeGridId) {
      return;
    }

    // Crear zona de efecto usando el facade
    const newEffectZone = worldStoreFacade.createEffectZone(type, position, shape, activeGridId);
    
    // IMPORTANTE: Solo usar acciones globales si estamos en el mundo global Y NO hay un proyecto cargado
    if (state.globalWorldConnected && !state.currentProjectId) {
      get().addGlobalEffectZone(newEffectZone);
    } else {
      if (state.currentProjectId) {
        persistenceService.syncProjectChanges(state.currentProjectId);
      }
    }
  },

  updateEffectZone: (id: string, updates: Partial<Omit<EffectZone, 'id'>>) => {
    const state = get();
    
    // Verificar si la edición está permitida
    if (!get().canEdit()) {
      alert('La edición está bloqueada. Ingresa la contraseña de administrador para editar.');
      return;
    }
    
    // IMPORTANTE: Solo usar acciones globales si estamos en el mundo global Y NO hay un proyecto cargado
    if (state.globalWorldConnected && !state.currentProjectId) {
      get().updateGlobalEffectZone(id, updates);
    } else {
      const zone = useEffectStore.getState().getEffectZoneById(id);
      if (zone) {
        // Actualizar usando el facade
        worldStoreFacade.updateEffectZone(id, updates);
        
        if (state.currentProjectId) {
          persistenceService.syncProjectChanges(state.currentProjectId);
        }
      }
    }
  },

  removeEffectZone: (id: string) => {
    const state = get();
    
    // Verificar si la edición está permitida
    if (!get().canEdit()) {
      alert('La edición está bloqueada. Ingresa la contraseña de administrador para editar.');
      return;
    }
    
    // IMPORTANTE: Solo usar acciones globales si estamos en el mundo global Y NO hay un proyecto cargado
    if (state.globalWorldConnected && !state.currentProjectId) {
      get().removeGlobalEffectZone(id);
    } else {
      const zone = useEffectStore.getState().getEffectZoneById(id);
      if (zone) {
        // Eliminar usando el facade
        worldStoreFacade.removeEffectZone(id);
        
        set({
          selectedEntityId: state.selectedEntityId === id ? null : state.selectedEntityId,
        });

        if (state.currentProjectId) {
          persistenceService.syncProjectChanges(state.currentProjectId);
        }
      }
    }
  },

  toggleLockEffectZone: (id: string) => {
    const zone = useEffectStore.getState().getEffectZoneById(id);
    if (zone) {
      worldStoreFacade.toggleLockEffectZone(id);
    }
  },

  // Nuevas acciones para controlar la edición de zonas de efectos - Delegadas al WorldStoreFacade
  setEditingEffectZone: (isEditing: boolean) => {
    useEffectStore.getState().setEditingEffectZone(isEditing);
    set({ isEditingEffectZone: isEditing });
  },
  
  // Acción para mostrar/ocultar la cuadrícula
  setShowGrid: (show: boolean) => {
    useWorldSettingsStore.getState().setShowGrid(show);
  },
  
  // Acción para mostrar/ocultar wireframe de zonas de efectos
  setShowEffectZoneWireframe: (show: boolean) => {
    useWorldSettingsStore.getState().setShowEffectZoneWireframe(show);
  },
  
  // Acción para mostrar/ocultar color de zonas de efectos
  setShowEffectZoneColor: (show: boolean) => {
    useWorldSettingsStore.getState().setShowEffectZoneColor(show);
  },
  
  // Acción para mostrar/ocultar zonas ocultas
  setShowHiddenZones: (show: boolean) => {
    useWorldSettingsStore.getState().setShowHiddenZones(show);
  },
  
  // Acción para bloquear la edición
  lockEditing: () => {
    useAdminAuthStore.getState().lockEditing();
  },
  
  // Acción para desbloquear la edición con contraseña
  unlockEditing: (password: string) => {
    return useAdminAuthStore.getState().unlockEditing(password);
  },
  
  // Acción para autenticar como admin con contraseña
  authenticateAdmin: (password: string) => {
    return useAdminAuthStore.getState().authenticateAdmin(password);
  },

  refreshAllEffects: () => {
    useEffectStore.getState().refreshAllEffects();
  },

  debugAudioChain: (soundId: string) => {
    useEffectStore.getState().debugAudioChain(soundId);
  },

  // Acciones para objetos móviles - Delegadas al WorldStoreFacade
  addMobileObject: (position: [number, number, number]) => {
    const state = get();
    
    // Verificar si la edición está permitida
    if (!get().canEdit()) {
      alert('La edición está bloqueada. Ingresa la contraseña de administrador para editar.');
      return;
    }
    
    const activeGridId = state.activeGridId;
    if (!activeGridId) {
      return;
    }

    // Crear objeto móvil usando el facade
    const newMobileObject = worldStoreFacade.createMobileObject(position);

    // IMPORTANTE: Solo usar acciones globales si estamos en el mundo global Y NO hay un proyecto cargado
    if (state.globalWorldConnected && !state.currentProjectId) {
      get().addGlobalMobileObject(newMobileObject);
    } else {
      if (state.currentProjectId) {
        persistenceService.syncProjectChanges(state.currentProjectId);
      }
    }
  },

  updateMobileObject: (id: string, updates: Partial<Omit<MobileObject, 'id'>>) => {
    const state = get();
    
    // Verificar si la edición está permitida
    if (!get().canEdit()) {
      alert('La edición está bloqueada. Ingresa la contraseña de administrador para editar.');
      return;
    }
    
    // IMPORTANTE: Solo usar acciones globales si estamos en el mundo global Y NO hay un proyecto cargado
    if (state.globalWorldConnected && !state.currentProjectId) {
      get().updateGlobalMobileObject(id, updates);
    } else {
      const obj = useMobileStore.getState().getById(id);
      if (obj) {
        // Actualizar objeto móvil usando el facade
        worldStoreFacade.updateMobileObject(id, updates, state.grids);
        
        // Si hay un proyecto cargado, sincronizar cambios con Firebase
        if (state.currentProjectId) {
          persistenceService.syncProjectChanges(state.currentProjectId);
        }
      }
    }
  },

  removeMobileObject: (id: string) => {
    const state = get();
    
    // Verificar si la edición está permitida
    if (!get().canEdit()) {
      alert('La edición está bloqueada. Ingresa la contraseña de administrador para editar.');
      return;
    }
    
    // IMPORTANTE: Solo usar acciones globales si estamos en el mundo global Y NO hay un proyecto cargado
    if (state.globalWorldConnected && !state.currentProjectId) {
      get().removeGlobalMobileObject(id);
    } else {
      const obj = useMobileStore.getState().getById(id);
      if (obj) {
        // Eliminar objeto móvil usando el facade
        worldStoreFacade.removeMobileObject(id, state.grids);
        
        set({
          selectedEntityId: state.selectedEntityId === id ? null : state.selectedEntityId,
        });

        if (state.currentProjectId) {
          persistenceService.syncProjectChanges(state.currentProjectId);
        }
      }
    }
  },

  updateMobileObjectPosition: (id: string, position: [number, number, number]) => {
    const state = get();
    
    // IMPORTANTE: Solo usar acciones globales si estamos en el mundo global Y NO hay un proyecto cargado
    if (state.globalWorldConnected && !state.currentProjectId) {
      get().updateGlobalMobileObject(id, { position });
    } else {
      const obj = useMobileStore.getState().getById(id);
      if (obj) {
        // Actualizar posición usando el facade
        worldStoreFacade.updateMobileObjectPosition(id, position, state.grids);
      }
    }
  },

  // Acciones para cuadrículas - Delegadas al useGridStore
  getGridKey: (coordinates: [number, number, number]) => {
    return useGridStore.getState().getGridKey(coordinates);
  },

  loadGrid: (coordinates: [number, number, number]) => {
    useGridStore.getState().loadGrid(coordinates);
  },

  unloadGrid: (coordinates: [number, number, number]) => {
    useGridStore.getState().unloadGrid(coordinates);
  },

  moveToGrid: (coordinates: [number, number, number]) => {
    useGridStore.getState().moveToGrid(coordinates);
    set({ selectedEntityId: null });
  },

  getAdjacentGrids: () => {
    return useGridStore.getState().getAdjacentGrids();
  },

  // Acciones para manipulación de cuadrículas - Delegadas al useGridStore
  createGrid: (position: [number, number, number], size: number = 20) => {
    if (!get().canEdit()) {
      alert('La edición está bloqueada. Ingresa la contraseña de administrador para editar.');
      return;
    }
    useGridStore.getState().createGrid(position, size);
  },

  selectGrid: (gridId: string | null) => {
    useGridStore.getState().selectGrid(gridId);
  },

  setActiveGrid: (gridId: string | null) => {
    useGridStore.getState().setActiveGrid(gridId);
  },

  updateGrid: (gridId: string, updates: Partial<Omit<Grid, 'id'>>) => {
    useGridStore.getState().updateGrid(gridId, updates);
  },

  deleteGrid: (gridId: string) => {
    // Verificar si la edición está permitida
    if (!get().canEdit()) {
      // Traducción debe manejarse en el componente que llama a esta función
      alert('La edición está bloqueada. Ingresa la contraseña de administrador para editar.');
      return;
    }
    
    useGridStore.getState().deleteGrid(gridId);
  },

  resizeGrid: (gridId: string, newSize: number) => {
    useGridStore.getState().resizeGrid(gridId, newSize);
  },

  moveGrid: (gridId: string, position: [number, number, number]) => {
    useGridStore.getState().moveGrid(gridId, position);
  },

  // Acción para establecer el proyecto actual
  setCurrentProjectId: (projectId: string | null) => {
    set({ 
      currentProjectId: projectId,
      // Resetear el estado de bloqueo cuando se cambia de proyecto
      isEditingLocked: false,
      isAdminAuthenticated: false
    });
  },

  rotateGrid: (gridId: string, rotation: [number, number, number]) => {
    useGridStore.getState().rotateGrid(gridId, rotation);
  },

  scaleGrid: (gridId: string, scale: [number, number, number]) => {
    useGridStore.getState().scaleGrid(gridId, scale);
  },

  // World management functions - Delegadas al WorldStoreFacade
  createWorld: (name: string) => {
    worldStoreFacade.createWorld(name);
    
    set({
      worlds: worldStoreFacade.getAllWorlds(),
      currentWorldId: worldStoreFacade.getCurrentWorld()?.id || null
    });
  },

  deleteWorld: (id: string) => {
    const success = worldStoreFacade.deleteWorld(id);
    
    if (success) {
    set({
        worlds: worldStoreFacade.getAllWorlds(),
        currentWorldId: worldStoreFacade.getCurrentWorld()?.id || null
    });
    }
  },

  switchWorld: (id: string) => {
    const success = worldStoreFacade.switchWorld(id);
    
    if (success) {
      set({ currentWorldId: worldStoreFacade.getCurrentWorld()?.id || null });
    }
  },

  // ========== ACCIONES DE SINCRONIZACIÓN GLOBAL ==========
  
  /**
   * Establece el estado desde Firestore (para prevenir bucles bidireccionales)
   */
  setGlobalStateFromFirestore: (state: GlobalWorldDoc) => {
    useRealtimeSyncStore.getState().setGlobalStateFromFirestore(state);
  },

  /**
   * Establece la bandera de actualización desde Firestore
   */
  setIsUpdatingFromFirestore: (isUpdating: boolean) => {
    useRealtimeSyncStore.getState().setIsUpdatingFromFirestore(isUpdating);
  },

  /**
   * Establece el estado de conexión al mundo global
   */
  setGlobalWorldConnected: (connected: boolean) => {
    useRealtimeSyncStore.getState().setGlobalWorldConnected(connected);
  },

  // ========== ACCIONES GLOBALES PARA OBJETOS SONOROS ==========

  /**
   * Añade un objeto sonoro al mundo global
   */
  addGlobalSoundObject: (object: SoundObject) => {
    useRealtimeSyncStore.getState().addGlobalSoundObject(object);
  },

  /**
   * Actualiza un objeto sonoro en el mundo global con debounce
   */
  updateGlobalSoundObject: (objectId: string, updates: Partial<Omit<SoundObject, 'id'>>) => {
    useRealtimeSyncStore.getState().updateGlobalSoundObject(objectId, updates);
  },

  /**
   * Elimina un objeto sonoro del mundo global
   */
  removeGlobalSoundObject: (objectId: string) => {
    useRealtimeSyncStore.getState().removeGlobalSoundObject(objectId);
  },

  // ========== ACCIONES GLOBALES PARA ZONAS DE EFECTOS ==========

  /**
   * Añade una zona de efecto al mundo global
   */
  addGlobalEffectZone: (effectZone: EffectZone) => {
    useRealtimeSyncStore.getState().addGlobalEffectZone(effectZone);
  },

  /**
   * Actualiza una zona de efecto en el mundo global con debounce
   */
  updateGlobalEffectZone: (zoneId: string, updates: Partial<Omit<EffectZone, 'id'>>) => {
    useRealtimeSyncStore.getState().updateGlobalEffectZone(zoneId, updates);
  },

  /**
   * Elimina una zona de efecto del mundo global
   */
  removeGlobalEffectZone: (zoneId: string) => {
    useRealtimeSyncStore.getState().removeGlobalEffectZone(zoneId);
  },

  // ========== ACCIONES GLOBALES PARA OBJETOS MÓVILES ==========

  /**
   * Añade un objeto móvil al mundo global
   */
  addGlobalMobileObject: (mobileObject: MobileObject) => {
    useRealtimeSyncStore.getState().addGlobalMobileObject(mobileObject);
  },

  /**
   * Actualiza un objeto móvil en el mundo global con debounce
   */
  updateGlobalMobileObject: (objectId: string, updates: Partial<Omit<MobileObject, 'id'>>) => {
    useRealtimeSyncStore.getState().updateGlobalMobileObject(objectId, updates);
  },

  /**
   * Elimina un objeto móvil del mundo global
   */
  removeGlobalMobileObject: (objectId: string) => {
    useRealtimeSyncStore.getState().removeGlobalMobileObject(objectId);
  }

  } as WorldState & WorldActions
});

// Suscribirse a useWorldSettingsStore para mantener el facade useWorldStore sincronizado
useWorldSettingsStore.subscribe((settingsState) => {
  useWorldStore.setState({
    showGrid: settingsState.showGrid,
    showEffectZoneWireframe: settingsState.showEffectZoneWireframe,
    showEffectZoneColor: settingsState.showEffectZoneColor,
    showHiddenZones: settingsState.showHiddenZones,
  });
});

// Suscribirse a useAdminAuthStore para mantener el facade useWorldStore sincronizado
useAdminAuthStore.subscribe((authState) => {
  useWorldStore.setState({
    isEditingLocked: authState.isEditingLocked,
    isAdminAuthenticated: authState.isAdminAuthenticated,
  });
});

// Función de sincronización para mantener useWorldStore.grids y listas planas actualizadas
const syncSubStoresToWorldStore = () => {
  const currentWorldStoreState = useWorldStore.getState();
  
  // Prevenir bucles de actualización infinita si viene de Firestore o se está sincronizando
  if (currentWorldStoreState.isUpdatingFromFirestore) {
    return;
  }
  
  const newGrids = new Map(currentWorldStoreState.grids);
  let changed = false;

  const objectsState = useObjectStore.getState();
  const mobileState = useMobileStore.getState();
  const effectState = useEffectStore.getState();

  const gridSize = currentWorldStoreState.gridSize || 20;

  // Agrupar mobileObjects por cuadrícula basados en su posición
  const mobileObjectsByGrid = new Map<string, MobileObject[]>();
  mobileState.mobileObjects.forEach((obj) => {
    const gx = Math.floor(obj.position[0] / gridSize);
    const gy = Math.floor(obj.position[1] / gridSize);
    const gz = Math.floor(obj.position[2] / gridSize);
    const gridKey = `${gx},${gy},${gz}`;
    if (!mobileObjectsByGrid.has(gridKey)) {
      mobileObjectsByGrid.set(gridKey, []);
    }
    mobileObjectsByGrid.get(gridKey)!.push(obj);
  });

  // Agrupar effectZones por cuadrícula basados en su posición
  const effectZonesByGrid = new Map<string, EffectZone[]>();
  effectState.effectZones.forEach((zone) => {
    const gx = Math.floor(zone.position[0] / gridSize);
    const gy = Math.floor(zone.position[1] / gridSize);
    const gz = Math.floor(zone.position[2] / gridSize);
    const gridKey = `${gx},${gy},${gz}`;
    if (!effectZonesByGrid.has(gridKey)) {
      effectZonesByGrid.set(gridKey, []);
    }
    effectZonesByGrid.get(gridKey)!.push(zone);
  });

  // Actualizar grids en el Map
  for (const [gridId, grid] of newGrids) {
    const gridObjects = objectsState.objectsByGrid.get(gridId) || [];
    const gridMobileObjects = mobileObjectsByGrid.get(gridId) || [];
    const gridEffectZones = effectZonesByGrid.get(gridId) || [];

    // Comprobar si hay cambios
    const objectsChanged = grid.objects !== gridObjects;
    const mobilesChanged = grid.mobileObjects !== gridMobileObjects;
    const effectsChanged = grid.effectZones !== gridEffectZones;

    if (objectsChanged || mobilesChanged || effectsChanged) {
      newGrids.set(gridId, {
        ...grid,
        objects: gridObjects,
        mobileObjects: gridMobileObjects,
        effectZones: gridEffectZones,
      });
      changed = true;
    }
  }

  // Si hay cambios en el Map o en los arrays planos, actualizar useWorldStore
  const currentObjects = objectsState.objects;
  const currentMobileObjects = mobileState.mobileObjects;
  const currentEffectZones = effectState.effectZones;

  const flatObjectsChanged = currentWorldStoreState.objects !== currentObjects;
  const flatMobilesChanged = currentWorldStoreState.mobileObjects !== currentMobileObjects;
  const flatEffectsChanged = currentWorldStoreState.effectZones !== currentEffectZones;

  if (changed || flatObjectsChanged || flatMobilesChanged || flatEffectsChanged) {
    useWorldStore.setState({
      grids: newGrids,
      objects: currentObjects,
      mobileObjects: currentMobileObjects,
      effectZones: currentEffectZones,
    });
    
    // Mantener sincronizado useGridStore
    useGridStore.setState({ grids: newGrids });
  }
};

// Suscribirse a los sub-stores
useObjectStore.subscribe(() => syncSubStoresToWorldStore());
useMobileStore.subscribe(() => syncSubStoresToWorldStore());
useEffectStore.subscribe(() => syncSubStoresToWorldStore());

// Suscribirse a useRealtimeSyncStore para mantener el facade useWorldStore sincronizado
useRealtimeSyncStore.subscribe((syncState) => {
  useWorldStore.setState({
    isUpdatingFromFirestore: syncState.isUpdatingFromFirestore,
    globalWorldConnected: syncState.globalWorldConnected,
    locallyDeletedObjects: syncState.locallyDeletedObjects,
  });
});



// Suscribirse a useGridStore para mantener el facade useWorldStore sincronizado
useGridStore.subscribe((gridState) => {
  useWorldStore.setState({
    grids: new Map(gridState.grids),
    currentGridCoordinates: gridState.currentGridCoordinates,
    activeGridId: gridState.activeGridId,
    gridSize: gridState.gridSize,
    renderDistance: gridState.renderDistance,
  });
});

// Suscribirse a useSelectionStore para mantener el facade useWorldStore sincronizado y actualizar el estado de selección en grids
useSelectionStore.subscribe((selectionState) => {
  const currentSelectedId = selectionState.selectedEntityId;
  const currentTransformMode = selectionState.transformMode;
  
  const currentState = useWorldStore.getState();
  const newGrids = new Map(currentState.grids);
  let changed = false;

  newGrids.forEach((grid, gridId) => {
    const updatedObjects = grid.objects.map((obj) => ({
      ...obj,
      isSelected: obj.id === currentSelectedId,
    }));
    const updatedMobileObjects = grid.mobileObjects.map((obj) => ({
      ...obj,
      isSelected: obj.id === currentSelectedId,
    }));
    const updatedEffectZones = grid.effectZones.map((zone) => ({
      ...zone,
      isSelected: zone.id === currentSelectedId,
    }));

    const objectsChanged = JSON.stringify(grid.objects) !== JSON.stringify(updatedObjects);
    const mobilesChanged = JSON.stringify(grid.mobileObjects) !== JSON.stringify(updatedMobileObjects);
    const effectsChanged = JSON.stringify(grid.effectZones) !== JSON.stringify(updatedEffectZones);

    if (objectsChanged || mobilesChanged || effectsChanged) {
      newGrids.set(gridId, {
        ...grid,
        objects: updatedObjects,
        mobileObjects: updatedMobileObjects,
        effectZones: updatedEffectZones,
      });
      changed = true;
    }
  });

  const nextState: any = {
    selectedEntityId: currentSelectedId,
    transformMode: currentTransformMode,
  };

  if (changed) {
    nextState.grids = newGrids;
    useGridStore.setState({ grids: newGrids });
  }

  useWorldStore.setState(nextState);
});
