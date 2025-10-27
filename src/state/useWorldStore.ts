import { create } from 'zustand';
import { useGridStore } from '../stores/useGridStore';
import { useEffectStore } from '../stores/useEffectStore';
import { WorldStoreFacade } from './facades/WorldStoreFacade';
import { type AudioParams, audioManager } from '../lib/AudioManager';
import { firebaseService, type GlobalWorldDoc } from '../lib/firebaseService';

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
export type MovementType = 'linear' | 'circular' | 'polar' | 'random' | 'figure8' | 'spiral';

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

// Variables para debounce/throttle
const updateDebounceTimers = new Map<string, NodeJS.Timeout>();
const DEBOUNCE_DELAY = 200; // ms - Aumentado para mayor estabilidad
const lastUpdateTimes = new Map<string, number>();
const UPDATE_THROTTLE = 50; // ms - Throttle mínimo entre actualizaciones

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
    isUpdatingFromFirestore: false,
    globalWorldConnected: false,
    locallyDeletedObjects: new Set<string>(),
    
    // World management state
    worlds: [{ id: 'default', name: 'Default World' }],
    currentWorldId: 'default',

  // Acción para añadir un nuevo objeto - Delegada al WorldStoreFacade
  addObject: (type: SoundObjectType, position: [number, number, number]) => {
    const state = get();
    const activeGridId = state.activeGridId;
    
    if (!activeGridId) {
      return;
    }

    // Crear objeto usando el facade
    const newObject = worldStoreFacade.createObject(type, position, activeGridId);
    
    // REACTIVADO - La cuota se ha liberado
    // Usar la acción global para sincronizar con Firestore
    if (state.globalWorldConnected) {
      get().addGlobalSoundObject(newObject);
    } else {
      // Fallback local si no hay conexión global
    const activeGrid = state.grids.get(activeGridId);
    if (activeGrid) {
      const updatedGrid = {
        ...activeGrid,
        objects: [...activeGrid.objects, newObject]
      };
      
      set((state) => {
        const newGrids = new Map(state.grids);
        newGrids.set(activeGridId, updatedGrid);
        // Sincronizar con useGridStore DE FORMA ATOMICA
        useGridStore.setState({ grids: newGrids });
        return { grids: newGrids };
      });
      }
    }
  },

  // Acción para eliminar un objeto - Delegada al WorldStoreFacade
  removeObject: (id: string) => {
    const state = get();
    
    // REACTIVADO - La cuota se ha liberado
    // Usar la acción global para sincronizar con Firestore
    if (state.globalWorldConnected) {
      get().removeGlobalSoundObject(id);
    } else {
      // Fallback local si no hay conexión global
    set((state) => {
      const newGrids = new Map(state.grids);
      
      // Buscar y eliminar el objeto de todas las cuadrículas
      for (const [gridId, grid] of newGrids) {
        const objectIndex = grid.objects.findIndex(obj => obj.id === id);
        if (objectIndex !== -1) {
          // Eliminar objeto usando el facade
          worldStoreFacade.removeObject(id, gridId);
          
          const updatedObjects = grid.objects.filter(obj => obj.id !== id);
          
          newGrids.set(gridId, {
            ...grid,
            objects: updatedObjects
          });
          break;
        }
      }
      
      return {
        grids: newGrids,
        selectedEntityId: state.selectedEntityId === id ? null : state.selectedEntityId,
      };
    });
    }
  },

  // Acción para seleccionar una entidad - Delegada al WorldStoreFacade
  selectEntity: (id: string | null) => {
    // Delegar al facade
    worldStoreFacade.selectEntity(id);
    
    set((state) => {
      const newGrids = new Map(state.grids);
      
      // Actualizar la selección en todas las cuadrículas
      newGrids.forEach((grid, gridId) => {
        const updatedObjects = grid.objects.map((obj) => ({
          ...obj,
          isSelected: obj.id === id,
        }));
        
        const updatedMobileObjects = grid.mobileObjects.map((obj) => ({
          ...obj,
          isSelected: obj.id === id,
        }));
        
        const updatedEffectZones = grid.effectZones.map((zone) => ({
          ...zone,
          isSelected: zone.id === id,
        }));
        
        newGrids.set(gridId, {
          ...grid,
          objects: updatedObjects,
          mobileObjects: updatedMobileObjects,
          effectZones: updatedEffectZones,
        });
      });
      
      return {
        grids: newGrids,
        selectedEntityId: id,
        transformMode: id === null ? 'translate' : state.transformMode,
      };
    });
  },

  // Acción para actualizar un objeto - Delegada al WorldStoreFacade
  updateObject: (id: string, updates: Partial<Omit<SoundObject, 'id'>>) => {
    const state = get();
    
    // REACTIVADO - La cuota se ha liberado
    // Usar la acción global para sincronizar con Firestore
    if (state.globalWorldConnected) {
      get().updateGlobalSoundObject(id, updates);
    } else {
      // Fallback local si no hay conexión global
    set((state) => {
      const newGrids = new Map(state.grids);
      
      // Buscar el objeto en todas las cuadrículas y actualizarlo
      for (const [gridId, grid] of newGrids) {
        const objectIndex = grid.objects.findIndex(obj => obj.id === id);
        if (objectIndex !== -1) {
          // Actualizar objeto usando el facade
          worldStoreFacade.updateObject(id, updates, gridId);
          
          const updatedObjects = [...grid.objects];
          updatedObjects[objectIndex] = { ...updatedObjects[objectIndex], ...updates };
          
          // Actualizar la cuadrícula
          newGrids.set(gridId, {
            ...grid,
            objects: updatedObjects
          });
          break;
        }
      }
      
      return { grids: newGrids };
    });
    }
  },

  // Acción para activar/desactivar el audio de un objeto - Delegada al WorldStoreFacade
  toggleObjectAudio: (id: string, forceState?: boolean) => {
    const state = get();
    const { gridId } = worldStoreFacade.findObjectById(id, state.grids);
    
    if (gridId) {
      // Delegar al facade
      worldStoreFacade.toggleObjectAudio(id, forceState, gridId);
      
      // Actualizar el estado local
      set((state) => {
        const newGrids = new Map(state.grids);
        const grid = newGrids.get(gridId);
        if (grid) {
          const updatedObjects = grid.objects.map((obj) =>
            obj.id === id ? { ...obj, audioEnabled: forceState !== undefined ? forceState : !obj.audioEnabled } : obj
          );
          
          newGrids.set(gridId, {
            ...grid,
            objects: updatedObjects
          });
        }
        
        return { grids: newGrids };
      });
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
    // Limpiar objetos usando el facade
    worldStoreFacade.clearAllObjects();
    
    set((state) => {
      const newGrids = new Map(state.grids);
      
      // Limpiar objetos de todas las cuadrículas
      newGrids.forEach((grid, gridId) => {
        newGrids.set(gridId, {
          ...grid,
          objects: [],
          mobileObjects: [],
          effectZones: []
        });
      });
      
      return {
        grids: newGrids,
        selectedEntityId: null,
      };
    });
  },

  // Acción para establecer el modo de transformación - Delegada al WorldStoreFacade
  setTransformMode: (mode: 'translate' | 'rotate' | 'scale') => {
    worldStoreFacade.setTransformMode(mode);
    set({ transformMode: mode });
  },

  // Nuevas acciones para zonas de efectos - Delegadas al WorldStoreFacade
  addEffectZone: (type: 'phaser' | 'autoFilter' | 'autoWah' | 'bitCrusher' | 'chebyshev' | 'chorus' | 'distortion' | 'feedbackDelay' | 'freeverb' | 'frequencyShifter' | 'jcReverb' | 'pingPongDelay' | 'pitchShift' | 'reverb' | 'stereoWidener' | 'tremolo' | 'vibrato', position: [number, number, number], shape: 'sphere' | 'cube' = 'sphere') => {
    const state = get();
    const activeGridId = state.activeGridId;
    
    if (!activeGridId) {
      return;
    }

    // Crear zona de efecto usando el facade
    const newEffectZone = worldStoreFacade.createEffectZone(type, position, shape, activeGridId);
    
    // Usar la acción global para sincronizar con Firestore
    if (state.globalWorldConnected) {
      get().addGlobalEffectZone(newEffectZone);
    } else {
      // Fallback local si no hay conexión global
    const activeGrid = state.grids.get(activeGridId);
    if (activeGrid) {
      const updatedGrid = {
        ...activeGrid,
        effectZones: [...activeGrid.effectZones, newEffectZone]
      };
    
      set((state) => {
        const newGrids = new Map(state.grids);
        newGrids.set(activeGridId, updatedGrid);
        // Sincronizar con useGridStore DE FORMA ATOMICA
        useGridStore.setState({ grids: newGrids });
        return { grids: newGrids };
      });
      }
    }
  },

  updateEffectZone: (id: string, updates: Partial<Omit<EffectZone, 'id'>>) => {
    const state = get();
    
    // Usar la acción global para sincronizar con Firestore
    if (state.globalWorldConnected) {
      get().updateGlobalEffectZone(id, updates);
    } else {
      // Fallback local si no hay conexión global
    set((state) => {
      const newGrids = new Map(state.grids);
      
      // Buscar la zona de efecto en todas las cuadrículas y actualizarla
      for (const [gridId, grid] of newGrids) {
        const zoneIndex = grid.effectZones.findIndex(zone => zone.id === id);
        if (zoneIndex !== -1) {
          // Actualizar zona de efecto usando el facade
          worldStoreFacade.updateEffectZone(id, updates, gridId);
          
          const updatedZones = [...grid.effectZones];
          updatedZones[zoneIndex] = { ...updatedZones[zoneIndex], ...updates };
          
          newGrids.set(gridId, {
            ...grid,
            effectZones: updatedZones
          });
          break;
        }
      }
      
      return { grids: newGrids };
    });
    }
  },

  removeEffectZone: (id: string) => {
    const state = get();
    
    // Usar la acción global para sincronizar con Firestore
    if (state.globalWorldConnected) {
      get().removeGlobalEffectZone(id);
    } else {
      // Fallback local si no hay conexión global
    set((state) => {
      const newGrids = new Map(state.grids);
      
      // Buscar y eliminar la zona de efecto de todas las cuadrículas
      for (const [gridId, grid] of newGrids) {
        const zoneIndex = grid.effectZones.findIndex(zone => zone.id === id);
        if (zoneIndex !== -1) {
          // Eliminar zona de efecto usando el facade
          worldStoreFacade.removeEffectZone(id, gridId);
          
          const updatedZones = grid.effectZones.filter(zone => zone.id !== id);
          
          newGrids.set(gridId, {
            ...grid,
            effectZones: updatedZones
          });
          break;
        }
      }
      
      return {
        grids: newGrids,
        selectedEntityId: state.selectedEntityId === id ? null : state.selectedEntityId,
      };
    });
    }
  },

  toggleLockEffectZone: (id: string) => {
    const state = get();
    let gridId: string | null = null;
    
    // Buscar la zona de efecto en todas las cuadrículas para obtener el gridId
    for (const [gId, grid] of state.grids) {
      const zone = grid.effectZones.find(zone => zone.id === id);
      if (zone) {
        gridId = gId;
        break;
      }
    }
    
    if (gridId) {
      // Delegar al facade
      worldStoreFacade.toggleLockEffectZone(id, gridId);
      
      // Actualizar el estado local
      set((state) => {
        const newGrids = new Map(state.grids);
        
        for (const [gId, grid] of newGrids) {
          const zoneIndex = grid.effectZones.findIndex(zone => zone.id === id);
          if (zoneIndex !== -1) {
            const updatedZones = [...grid.effectZones];
            updatedZones[zoneIndex] = { ...updatedZones[zoneIndex], isLocked: !updatedZones[zoneIndex].isLocked };
            
            newGrids.set(gId, {
              ...grid,
              effectZones: updatedZones
            });
            break;
          }
        }
        
        return { grids: newGrids };
      });
    }
  },

  // Nuevas acciones para controlar la edición de zonas de efectos - Delegadas al WorldStoreFacade
  setEditingEffectZone: (isEditing: boolean) => {
    useEffectStore.getState().setEditingEffectZone(isEditing);
    set({ isEditingEffectZone: isEditing });
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
    const activeGridId = state.activeGridId;
    
    if (!activeGridId) {
      return;
    }

    // Crear objeto móvil usando el facade
    const newMobileObject = worldStoreFacade.createMobileObject(position);

    // Usar la acción global para sincronizar con Firestore
    if (state.globalWorldConnected) {
      get().addGlobalMobileObject(newMobileObject);
    } else {
      // Fallback local si no hay conexión global
    const activeGrid = state.grids.get(activeGridId);
    if (activeGrid) {
      const updatedGrid = {
        ...activeGrid,
        mobileObjects: [...activeGrid.mobileObjects, newMobileObject]
      };

      set((state) => {
        const newGrids = new Map(state.grids);
        newGrids.set(activeGridId, updatedGrid);
        return { grids: newGrids };
      });
      }
    }
  },

  updateMobileObject: (id: string, updates: Partial<Omit<MobileObject, 'id'>>) => {
    const state = get();
    
    // Usar la acción global para sincronizar con Firestore
    if (state.globalWorldConnected) {
      get().updateGlobalMobileObject(id, updates);
    } else {
      // Fallback local si no hay conexión global
    set((state) => {
      const newGrids = new Map(state.grids);
      
      // Buscar el objeto móvil en todas las cuadrículas y actualizarlo
      for (const [gId, grid] of newGrids) {
        const objectIndex = grid.mobileObjects.findIndex(obj => obj.id === id);
        if (objectIndex !== -1) {
          // Actualizar objeto móvil usando el facade
          worldStoreFacade.updateMobileObject(id, updates, newGrids);
          
          const updatedObjects = [...grid.mobileObjects];
          updatedObjects[objectIndex] = { ...updatedObjects[objectIndex], ...updates };
          
          newGrids.set(gId, {
            ...grid,
            mobileObjects: updatedObjects
          });
          break;
        }
      }
      
      return { grids: newGrids };
    });
    }
  },

  removeMobileObject: (id: string) => {
    const state = get();
    
    // Usar la acción global para sincronizar con Firestore
    if (state.globalWorldConnected) {
      get().removeGlobalMobileObject(id);
    } else {
      // Fallback local si no hay conexión global
    set((state) => {
      const newGrids = new Map(state.grids);
      
      // Eliminar objeto móvil usando el facade
      worldStoreFacade.removeMobileObject(id, newGrids);
      
      // Buscar y eliminar el objeto móvil de todas las cuadrículas
      for (const [gridId, grid] of newGrids) {
        const objectIndex = grid.mobileObjects.findIndex(obj => obj.id === id);
        if (objectIndex !== -1) {
          const updatedObjects = grid.mobileObjects.filter(obj => obj.id !== id);
          
          newGrids.set(gridId, {
            ...grid,
            mobileObjects: updatedObjects
          });
          break;
        }
      }
      
      return {
        grids: newGrids,
      selectedEntityId: state.selectedEntityId === id ? null : state.selectedEntityId,
      };
    });
    }
  },

  updateMobileObjectPosition: (id: string, position: [number, number, number]) => {
    const state = get();
    
    // Usar la acción global para sincronizar con Firestore
    if (state.globalWorldConnected) {
      get().updateGlobalMobileObject(id, { position });
    } else {
      // Fallback local si no hay conexión global
    set((state) => {
      const newGrids = new Map(state.grids);
      
      // Actualizar posición usando el facade
      worldStoreFacade.updateMobileObjectPosition(id, position, newGrids);
      
      // Buscar el objeto móvil en todas las cuadrículas y actualizar su posición
      for (const [gridId, grid] of newGrids) {
        const objectIndex = grid.mobileObjects.findIndex(obj => obj.id === id);
        if (objectIndex !== -1) {
          const updatedObjects = [...grid.mobileObjects];
          updatedObjects[objectIndex] = { ...updatedObjects[objectIndex], position };
          
          newGrids.set(gridId, {
            ...grid,
            mobileObjects: updatedObjects
          });
          break;
        }
      }
      
      return { grids: newGrids };
    });
    }
  },

  // Acciones para cuadrículas - Delegadas al useGridStore
  getGridKey: (coordinates: [number, number, number]) => {
    return useGridStore.getState().getGridKey(coordinates);
  },

  loadGrid: (coordinates: [number, number, number]) => {
    useGridStore.getState().loadGrid(coordinates);
    
    // Sincronizar el estado local
    const gridStoreState = useGridStore.getState();
    set(() => ({
      grids: new Map(gridStoreState.grids)
    }));
  },

  unloadGrid: (coordinates: [number, number, number]) => {
    useGridStore.getState().unloadGrid(coordinates);
  },

  moveToGrid: (coordinates: [number, number, number]) => {
    useGridStore.getState().moveToGrid(coordinates);
    
    // Sincronizar el estado local
    const gridStoreState = useGridStore.getState();
    set(() => ({
      grids: new Map(gridStoreState.grids),
      currentGridCoordinates: gridStoreState.currentGridCoordinates,
      activeGridId: gridStoreState.activeGridId
    }));
    // Deseleccionar al cambiar de cuadrícula
    set(() => ({
      selectedEntityId: null,
    }));
  },

  getAdjacentGrids: () => {
    return useGridStore.getState().getAdjacentGrids();
  },

  // Acciones para manipulación de cuadrículas - Delegadas al useGridStore
  createGrid: (position: [number, number, number], size: number = 20) => {
    useGridStore.getState().createGrid(position, size);
    
    // Sincronizar el estado local con el useGridStore
    const gridStoreState = useGridStore.getState();
    set(() => ({
      grids: new Map(gridStoreState.grids),
      currentGridCoordinates: gridStoreState.currentGridCoordinates,
      activeGridId: gridStoreState.activeGridId,
      gridSize: gridStoreState.gridSize
    }));
    
  },

  selectGrid: (gridId: string | null) => {
    useGridStore.getState().selectGrid(gridId);
    
    // Sincronizar el estado local
    const gridStoreState = useGridStore.getState();
    const state = get();
    
    // Actualizar el estado con los valores actuales de useGridStore
    // Esto fuerza a que los componentes que usan estos valores se re-rendericen
    set({
      ...state,
      grids: new Map(gridStoreState.grids),
      activeGridId: gridStoreState.activeGridId,
      currentGridCoordinates: gridStoreState.currentGridCoordinates
    });
  },

  setActiveGrid: (gridId: string | null) => {
    useGridStore.getState().setActiveGrid(gridId);
    
    // Forzar actualización del estado para que los componentes se re-rendericen
    const gridStoreState = useGridStore.getState();
    const state = get();
    
    set({
      ...state,
      activeGridId: gridId,
      grids: new Map(gridStoreState.grids)
    });
  },

  updateGrid: (gridId: string, updates: Partial<Omit<Grid, 'id'>>) => {
    useGridStore.getState().updateGrid(gridId, updates);
  },

  deleteGrid: (gridId: string) => {
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
    set({ currentProjectId: projectId });
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
    set({ isUpdatingFromFirestore: true });
    
    // NO reemplazar completamente - hacer merge con las cuadrículas existentes
    set((currentState) => {
      const newGrids = new Map(currentState.grids);
      
      // Procesar cuadrículas desde Firestore - solo actualizar existentes, no reemplazar todas
      if (state.grids && state.grids.length > 0) {
        state.grids.forEach(grid => {
          // Si la cuadrícula ya existe, hacer merge preservando elementos locales recientes
          const existingGrid = newGrids.get(grid.id);
          if (existingGrid) {
            // Merge inteligente: combinar objetos locales y remotos preservando cambios recientes
            const mergedObjects = existingGrid.objects.map(localObj => {
              const remoteObj = grid.objects.find(ro => ro.id === localObj.id);
              
              if (!remoteObj) {
                // El objeto solo existe localmente - preservarlo
                return localObj;
              }
              
              // El objeto existe en ambos - verificar si hay cambios locales recientes
              const lastUpdateTime = lastUpdateTimes.get(localObj.id) || 0;
              const timeSinceLocalUpdate = Date.now() - lastUpdateTime;
              
              // Si el objeto fue actualizado hace menos de 3 segundos, preservar versión local
              if (timeSinceLocalUpdate < 3000) {
                console.log(`ℹ️ Preservando posición local para ${localObj.id} (cambio reciente de ${timeSinceLocalUpdate}ms)`);
                return localObj;
              }
              
              // Usar versión de Firestore si no hay cambios recientes
              return remoteObj;
            });
            
            // Agregar objetos nuevos de Firestore que no existen localmente
            // IMPORTANTE: Excluir objetos que fueron eliminados localmente
            const newObjects = grid.objects.filter(remoteObj => {
              const existsLocally = existingGrid.objects.find(localObj => localObj.id === remoteObj.id);
              const wasDeletedLocally = currentState.locallyDeletedObjects.has(remoteObj.id);
              return !existsLocally && !wasDeletedLocally;
            });
            
            // Verificar si hay zonas de efectos locales que fueron agregadas recientemente
            const localEffectZones = existingGrid.effectZones.filter(localZone => {
              const remoteZone = grid.effectZones.find(rz => rz.id === localZone.id);
              const wasDeletedLocally = currentState.locallyDeletedObjects.has(localZone.id);
              if (!remoteZone && !wasDeletedLocally) {
                // La zona solo existe localmente y no fue eliminada - preservarla
                return true;
              }
              return false;
            });
            
            // Verificar si hay objetos móviles locales que fueron agregados recientemente
            const localMobileObjects = existingGrid.mobileObjects.filter(localObj => {
              const remoteObj = grid.mobileObjects.find(ro => ro.id === localObj.id);
              const wasDeletedLocally = currentState.locallyDeletedObjects.has(localObj.id);
              if (!remoteObj && !wasDeletedLocally) {
                // El objeto móvil solo existe localmente y no fue eliminado - preservarlo
                return true;
              }
              return false;
            });
            
            // Merge final: objetos fusionados, zonas de efectos y objetos móviles
            newGrids.set(grid.id, {
              ...grid, // Usar los datos de Firestore como base para otras propiedades
              // Usar objetos fusionados (con preservación de cambios recientes)
              objects: [...mergedObjects, ...newObjects],
              effectZones: [...grid.effectZones, ...localEffectZones],
              mobileObjects: [...grid.mobileObjects, ...localMobileObjects],
            });
          } else {
            // Cuadrícula nueva desde Firestore - agregarla
            newGrids.set(grid.id, grid);
          }
        });
      }
      
      const updatedState = {
        grids: newGrids,
        activeGridId: currentState.activeGridId || newGrids.keys().next().value || null,
        globalWorldConnected: true
      };
      
      // Sincronizar con useGridStore para mantener consistencia
      useGridStore.setState({ grids: newGrids });
      
      return updatedState;
    });
    
    console.log('🌐 Estado global conectado - Sincronización activada');
    
    // Inicializar audio para objetos que se reciben desde Firestore
    setTimeout(() => {
      console.log('🎵 Inicializando audio para objetos sincronizados...');
      
      // Obtener las cuadrículas actualizadas del estado
      const currentState = useWorldStore.getState();
      
      // Iterar sobre todas las cuadrículas y sus objetos
      currentState.grids.forEach((grid) => {
        grid.objects.forEach(object => {
          try {
            console.log(`🎵 Inicializando audio para objeto ${object.id} de tipo ${object.type}`);
            
            // Inicializar solo el audio, no crear el objeto (ya existe en el estado)
            // Importar AudioManager dinámicamente para evitar problemas de dependencias circulares
            import('../lib/AudioManager').then(({ audioManager }) => {
              // Crear la fuente de sonido en el AudioManager si no existe
              if (!audioManager.getSoundSourceState(object.id)) {
                audioManager.createSoundSource(
                  object.id,
                  object.type,
                  object.audioParams,
                  object.position
                );
                
                // Si el objeto tiene audio habilitado, iniciar el sonido continuo
                if (object.audioEnabled) {
                  console.log(`🎵 Iniciando audio continuo para objeto ${object.id}`);
                  audioManager.startContinuousSound(object.id, object.audioParams);
                }
              }
            }).catch(error => {
              console.error(`❌ Error importando AudioManager para objeto ${object.id}:`, error);
            });
            
          } catch (error) {
            console.error(`❌ Error inicializando audio para objeto ${object.id}:`, error);
          }
        });
        
        // También inicializar objetos móviles (sin audio por ahora)
        grid.mobileObjects.forEach(mobileObject => {
          try {
            console.log(`🎵 Objeto móvil ${mobileObject.id} detectado - sin inicialización de audio`);
            // Los objetos móviles no tienen audio por ahora
          } catch (error) {
            console.error(`❌ Error procesando objeto móvil ${mobileObject.id}:`, error);
          }
        });
      });
      
      console.log('✅ Audio inicializado para todos los objetos sincronizados');
    }, 100); // Pequeño delay para asegurar que el estado se haya actualizado
    
    // Resetear la bandera después de un breve delay
    setTimeout(() => {
      set({ isUpdatingFromFirestore: false });
    }, 50);
  },

  /**
   * Establece la bandera de actualización desde Firestore
   */
  setIsUpdatingFromFirestore: (isUpdating: boolean) => {
    set({ isUpdatingFromFirestore: isUpdating });
  },

  // ========== ACCIONES GLOBALES PARA OBJETOS SONOROS ==========

  /**
   * Añade un objeto sonoro al mundo global
   */
  addGlobalSoundObject: (object: SoundObject) => {
    const state = get();
    
    console.log('🎵 addGlobalSoundObject called', { objectId: object.id, isUpdatingFromFirestore: state.isUpdatingFromFirestore });
    
    // Actualizar el estado local inmediatamente (SIEMPRE)
    set((state) => {
      const newGrids = new Map(state.grids);
      const activeGridId = state.activeGridId;
      
      // Buscar si el objeto ya existe en alguna cuadrícula para evitar duplicados
      let objectExists = false;
      for (const grid of newGrids.values()) {
        if (grid.objects.some(obj => obj.id === object.id)) {
          objectExists = true;
          console.log(`ℹ️ Objeto ${object.id} ya existe en una cuadrícula, no agregando duplicado`);
          break;
        }
      }
      
      if (!objectExists) {
        // Si viene de Firestore, agregar solo a la primera cuadrícula cargada
        if (state.isUpdatingFromFirestore) {
          const firstGridId = newGrids.keys().next().value;
          if (firstGridId) {
            const firstGrid = newGrids.get(firstGridId);
            if (firstGrid) {
              const updatedGrid = {
                ...firstGrid,
                objects: [...firstGrid.objects, object]
              };
              
              newGrids.set(firstGridId, updatedGrid);
              // Sincronizar con useGridStore DE FORMA ATOMICA
              useGridStore.setState({ grids: newGrids });
              console.log('✅ Local state updated with new object (from Firestore, agregado a primera cuadrícula)');
            }
          }
        } else {
          // Si es una acción local, agregar a la cuadrícula activa
    if (activeGridId) {
            const activeGrid = newGrids.get(activeGridId);
      if (activeGrid) {
        const updatedGrid = {
          ...activeGrid,
          objects: [...activeGrid.objects, object]
        };
        
          newGrids.set(activeGridId, updatedGrid);
          // Sincronizar con useGridStore DE FORMA ATOMICA
          useGridStore.setState({ grids: newGrids });
              console.log('✅ Local state updated with new object (local action)');
            }
          }
        }
      }
      
      return { grids: newGrids };
    });
    
    // Inicializar audio para el nuevo objeto
    setTimeout(() => {
      try {
        console.log(`🎵 Inicializando audio para nuevo objeto ${object.id} de tipo ${object.type}`);
        
        import('../lib/AudioManager').then(({ audioManager }) => {
          // Crear la fuente de sonido en el AudioManager si no existe
          if (!audioManager.getSoundSourceState(object.id)) {
            audioManager.createSoundSource(
              object.id,
              object.type,
              object.audioParams,
              object.position
            );
            
            // Si el objeto tiene audio habilitado, iniciar el sonido continuo
            if (object.audioEnabled) {
              console.log(`🎵 Iniciando audio continuo para nuevo objeto ${object.id}`);
              audioManager.startContinuousSound(object.id, object.audioParams);
            }
          }
        }).catch(error => {
          console.error(`❌ Error importando AudioManager para objeto ${object.id}:`, error);
        });
        
      } catch (error) {
        console.error(`❌ Error inicializando audio para nuevo objeto ${object.id}:`, error);
      }
    }, 50);
    
    // Prevenir bucles bidireccionales - Solo sincronizar con Firestore si NO viene de Firestore
    if (state.isUpdatingFromFirestore) {
      console.log('ℹ️ Skipping Firestore sync - object came from Firestore');
      return;
    }
    
    // IMPORTANTE: Sincronizar con Firestore
    // Primero agregar el objeto al array plano, luego sincronizar todas las cuadrículas
    firebaseService.addGlobalSoundObject(object).then(async () => {
      // Después de agregar el objeto, sincronizar TODAS las cuadrículas actualizadas
      const currentState = get();
      const allGrids = Array.from(currentState.grids.values());
      await firebaseService.updateGlobalGrids(allGrids);
      console.log('✅ Cuadrículas sincronizadas después de agregar objeto');
    }).catch(error => {
      console.error('Error syncing to Firestore:', error);
      if (error.message?.includes('Quota exceeded')) {
        console.warn('Firestore quota exceeded, continuing in local mode');
      }
    });
  },

  /**
   * Actualiza un objeto sonoro en el mundo global con debounce
   */
  updateGlobalSoundObject: (objectId: string, updates: Partial<Omit<SoundObject, 'id'>>) => {
    const state = get();
    
    console.log('🎵 useWorldStore: updateGlobalSoundObject called', { 
      objectId, 
      updates, 
      isUpdatingFromFirestore: state.isUpdatingFromFirestore,
      globalWorldConnected: state.globalWorldConnected
    });
    
    // IMPORTANTE: NO actualizar si viene de Firestore
    // setGlobalStateFromFirestore ya actualiza el estado desde Firestore
    if (state.isUpdatingFromFirestore) {
      console.log('ℹ️ Ignorando updateGlobalSoundObject - update ya viene de Firestore');
      return;
    }
    
    // Throttle para prevenir actualizaciones excesivas
    const now = Date.now();
    const lastUpdateTime = lastUpdateTimes.get(objectId) || 0;
    if (now - lastUpdateTime < UPDATE_THROTTLE) {
      console.log('⏸️ updateGlobalSoundObject throttled - demasiado frecuente');
      return;
    }
    lastUpdateTimes.set(objectId, now);
    
    // Actualizar el estado local inmediatamente
    const newGrids = new Map(state.grids);
    let updatedObject: SoundObject | null = null;
    let gridId: string | null = null;
    
    // Buscar y actualizar el objeto en todas las cuadrículas
    for (const [gId, grid] of newGrids) {
      const objectIndex = grid.objects.findIndex(obj => obj.id === objectId);
      if (objectIndex !== -1) {
        const updatedObjects = [...grid.objects];
        updatedObjects[objectIndex] = { ...updatedObjects[objectIndex], ...updates };
        updatedObject = updatedObjects[objectIndex];
        gridId = gId;
        
        newGrids.set(gId, {
          ...grid,
          objects: updatedObjects
        });
        break;
      }
    }
    
    set({ grids: newGrids });
    
    // Sincronizar con useGridStore
    useGridStore.setState({ grids: newGrids });
    
    console.log('✅ useWorldStore: Local state updated');
    
    // SIEMPRE actualizar el objeto de audio, tanto si viene de Firestore como si es local
    if (updatedObject && gridId) {
      console.log('🔧 useWorldStore: Updating audio directly', { objectId, gridId, isFromFirestore: state.isUpdatingFromFirestore });
      
      // Actualizar audio directamente sin pasar por useObjectStore
      // para evitar problemas de sincronización entre stores
      if (updates.position) {
        console.log('🔧 useWorldStore: Updating position', updatedObject.position);
        audioManager.updateSoundPosition(objectId, updatedObject.position);
      }
      if (updates.audioParams) {
        console.log('🔧 useWorldStore: Updating audio params', updatedObject.audioParams);
        audioManager.updateSoundParams(objectId, updatedObject.audioParams);
        console.log('✅ useWorldStore: audioManager.updateSoundParams called');
      }
      
      // Solo llamar a worldStoreFacade.updateObject si NO viene de Firestore
      // para evitar bucles de sincronización
      if (!state.isUpdatingFromFirestore) {
        console.log('🔧 useWorldStore: Calling worldStoreFacade.updateObject for local update');
        worldStoreFacade.updateObject(objectId, updates, gridId);
        console.log('✅ useWorldStore: worldStoreFacade.updateObject called');
      }
    } else {
      console.warn('⚠️ useWorldStore: Could not find object or gridId', { objectId, gridId });
    }
    
    // Solo sincronizar con Firestore si NO viene de Firestore (prevenir bucles bidireccionales)
    if (state.isUpdatingFromFirestore) {
      console.log('ℹ️ useWorldStore: Skipping Firestore sync - update came from Firestore');
      return;
    }
    
    // Debounce para Firestore
    const timerKey = `updateObject_${objectId}`;
    const existingTimer = updateDebounceTimers.get(timerKey);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    const timer = setTimeout(async () => {
      try {
        // Obtener el objeto actualizado del estado local
        const currentState = useWorldStore.getState();
        const updatedObject = currentState.grids.get(currentState.activeGridId || '')?.objects.find(obj => obj.id === objectId);
        
        if (updatedObject) {
          // Sincronizar el objeto individual
          await firebaseService.updateGlobalSoundObject(objectId, updatedObject);
          
          // IMPORTANTE: Sincronizar TODAS las cuadrículas para mantener consistencia
          const allGrids = Array.from(currentState.grids.values());
          await firebaseService.updateGlobalGrids(allGrids);
          console.log('✅ Cuadrículas sincronizadas después de actualizar objeto');
        }
      } catch (error) {
        console.error('Error updating global sound object:', error);
      } finally {
        updateDebounceTimers.delete(timerKey);
        lastUpdateTimes.delete(objectId);
      }
    }, DEBOUNCE_DELAY);
    
    updateDebounceTimers.set(timerKey, timer);
  },

  /**
   * Elimina un objeto sonoro del mundo global
   */
  removeGlobalSoundObject: (objectId: string) => {
    const state = get();
    
    console.log('🎵 useWorldStore: removeGlobalSoundObject called', { objectId, isFromFirestore: state.isUpdatingFromFirestore });
    
    // Agregar el objeto a la lista de objetos eliminados localmente
    const newDeletedObjects = new Set(state.locallyDeletedObjects);
    newDeletedObjects.add(objectId);
    
    // Actualizar el estado local inmediatamente
    const newGrids = new Map(state.grids);
    let gridId: string | null = null;
    
    // Buscar y eliminar el objeto de todas las cuadrículas
    for (const [gId, grid] of newGrids) {
      const objectIndex = grid.objects.findIndex(obj => obj.id === objectId);
      if (objectIndex !== -1) {
        const updatedObjects = grid.objects.filter(obj => obj.id !== objectId);
        gridId = gId;
        
        newGrids.set(gId, {
          ...grid,
          objects: updatedObjects
        });
        break;
      }
    }
    
    set({
      grids: newGrids,
      selectedEntityId: state.selectedEntityId === objectId ? null : state.selectedEntityId,
      locallyDeletedObjects: newDeletedObjects,
    });
    
    console.log('✅ useWorldStore: Local state updated');
    
    // Limpiar el ID del Set después de 5 segundos
    setTimeout(() => {
      const currentState = get();
      const updatedDeletedObjects = new Set(currentState.locallyDeletedObjects);
      updatedDeletedObjects.delete(objectId);
      set({ locallyDeletedObjects: updatedDeletedObjects });
      console.log(`🧹 Limpiando ${objectId} de la lista de objetos eliminados`);
    }, 5000);
    
    // SIEMPRE limpiar el audio, tanto si viene de Firestore como si es local
    console.log('🔧 useWorldStore: Cleaning up audio for removed object', objectId);
    try {
      audioManager.removeSoundSource(objectId);
      console.log('✅ useWorldStore: Audio cleaned up successfully');
    } catch (error) {
      console.error('❌ useWorldStore: Error cleaning up audio:', error);
    }
    
    // Solo llamar a worldStoreFacade.removeObject si NO viene de Firestore
    // para evitar bucles de sincronización
    if (!state.isUpdatingFromFirestore && gridId) {
      console.log('🔧 useWorldStore: Calling worldStoreFacade.removeObject for local removal', { objectId, gridId });
      worldStoreFacade.removeObject(objectId, gridId);
      console.log('✅ useWorldStore: worldStoreFacade.removeObject called');
    }
    
    // Solo sincronizar con Firestore si NO viene de Firestore (prevenir bucles bidireccionales)
    if (!state.isUpdatingFromFirestore) {
      // Primero eliminar el objeto del array plano
      firebaseService.removeGlobalSoundObject(objectId).then(async () => {
        // IMPORTANTE: Después de eliminar el objeto, sincronizar TODAS las cuadrículas actualizadas
        const currentState = get();
        const allGrids = Array.from(currentState.grids.values());
        await firebaseService.updateGlobalGrids(allGrids);
        console.log('✅ Cuadrículas sincronizadas después de eliminar objeto');
      }).catch(error => {
        console.error('Error removing object from Firestore:', error);
      });
    } else {
      console.log('ℹ️ useWorldStore: Skipping Firestore sync - removal came from Firestore');
    }
  },

  // ========== ACCIONES GLOBALES PARA ZONAS DE EFECTOS ==========

  /**
   * Añade una zona de efecto al mundo global
   */
  addGlobalEffectZone: (effectZone: EffectZone) => {
    const state = get();
    
    console.log('🎵 addGlobalEffectZone called', { zoneId: effectZone.id, isUpdatingFromFirestore: state.isUpdatingFromFirestore });
    
    // Actualizar el estado local inmediatamente (SIEMPRE)
    set((state) => {
      const newGrids = new Map(state.grids);
    const activeGridId = state.activeGridId;
      
      // Buscar si la zona ya existe en alguna cuadrícula para evitar duplicados
      let zoneExists = false;
      for (const grid of newGrids.values()) {
        if (grid.effectZones.some(zone => zone.id === effectZone.id)) {
          zoneExists = true;
          console.log(`ℹ️ Zona de efecto ${effectZone.id} ya existe en una cuadrícula, no agregando duplicado`);
          break;
        }
      }
      
      if (!zoneExists) {
        // Si viene de Firestore, agregar solo a la primera cuadrícula cargada
        if (state.isUpdatingFromFirestore) {
          const firstGridId = newGrids.keys().next().value;
          if (firstGridId) {
            const firstGrid = newGrids.get(firstGridId);
            if (firstGrid) {
              const updatedGrid = {
                ...firstGrid,
                effectZones: [...firstGrid.effectZones, effectZone]
              };
              
              newGrids.set(firstGridId, updatedGrid);
              // Sincronizar con useGridStore DE FORMA ATOMICA
              useGridStore.setState({ grids: newGrids });
              console.log('✅ Local state updated with new effect zone (from Firestore, agregado a primera cuadrícula)');
            }
          }
        } else {
          // Si es una acción local, agregar a la cuadrícula activa
    if (activeGridId) {
            const activeGrid = newGrids.get(activeGridId);
      if (activeGrid) {
        const updatedGrid = {
          ...activeGrid,
          effectZones: [...activeGrid.effectZones, effectZone]
        };
        
          newGrids.set(activeGridId, updatedGrid);
          // Sincronizar con useGridStore DE FORMA ATOMICA
          useGridStore.setState({ grids: newGrids });
              console.log('✅ Local state updated with new effect zone (local action)');
            }
          }
        }
      }
      
          return { grids: newGrids };
        });
    
    // Prevenir bucles bidireccionales - Solo sincronizar con Firestore si NO viene de Firestore
    if (state.isUpdatingFromFirestore) {
      console.log('ℹ️ Skipping Firestore sync - zone came from Firestore');
      return;
    }
    
    // Sincronizar con Firestore (solo si es una acción local)
    firebaseService.addGlobalEffectZone(effectZone).then(async () => {
      // IMPORTANTE: Después de agregar la zona, sincronizar TODAS las cuadrículas actualizadas
      const currentState = get();
      const allGrids = Array.from(currentState.grids.values());
      await firebaseService.updateGlobalGrids(allGrids);
      console.log('✅ Cuadrículas sincronizadas después de agregar zona de efecto');
    }).catch(error => {
      console.error('Error adding effect zone to Firestore:', error);
    });
  },

  /**
   * Actualiza una zona de efecto en el mundo global con debounce
   */
  updateGlobalEffectZone: (zoneId: string, updates: Partial<Omit<EffectZone, 'id'>>) => {
    const state = get();
    
    console.log('🎵 useWorldStore: updateGlobalEffectZone called', { zoneId, updates, isUpdatingFromFirestore: state.isUpdatingFromFirestore });
    
    // IMPORTANTE: NO actualizar si viene de Firestore
    // setGlobalStateFromFirestore ya actualiza el estado desde Firestore
    if (state.isUpdatingFromFirestore) {
      console.log('ℹ️ Ignorando updateGlobalEffectZone - update ya viene de Firestore');
      return;
    }
    
    // Throttle para prevenir actualizaciones excesivas
    const now = Date.now();
    const lastUpdateTime = lastUpdateTimes.get(zoneId) || 0;
    if (now - lastUpdateTime < UPDATE_THROTTLE) {
      console.log('⏸️ updateGlobalEffectZone throttled - demasiado frecuente');
      return;
    }
    lastUpdateTimes.set(zoneId, now);
    
    // Actualizar el estado local inmediatamente
    const newGrids = new Map(state.grids);
    let updatedZone: EffectZone | null = null;
    let gridId: string | null = null;
    
    // Buscar y actualizar la zona en todas las cuadrículas
    for (const [gId, grid] of newGrids) {
      const zoneIndex = grid.effectZones.findIndex(zone => zone.id === zoneId);
      if (zoneIndex !== -1) {
        const updatedZones = [...grid.effectZones];
        updatedZones[zoneIndex] = { ...updatedZones[zoneIndex], ...updates };
        updatedZone = updatedZones[zoneIndex];
        gridId = gId;
        
        newGrids.set(gId, {
          ...grid,
          effectZones: updatedZones
        });
        break;
      }
    }
    
    set({ grids: newGrids });
    
    // Sincronizar con useGridStore
    useGridStore.setState({ grids: newGrids });
    
    console.log('✅ useWorldStore: Local state updated for effect zone', {
      zoneId,
      updates,
      isFromFirestore: state.isUpdatingFromFirestore,
      updatedPosition: updatedZone?.position
    });
    
    // SIEMPRE actualizar el efecto de audio, tanto si viene de Firestore como si es local
    if (updatedZone && gridId) {
      console.log('🔧 useWorldStore: Updating audio directly', { zoneId, gridId, isFromFirestore: state.isUpdatingFromFirestore });
      
      // Actualizar audio directamente sin pasar por worldStoreFacade para movimiento fluido
      // para evitar problemas de sincronización entre stores
      if (updates.position) {
        console.log('🔧 useWorldStore: Updating position', updatedZone.position);
        audioManager.updateEffectZonePosition(zoneId, updatedZone.position);
      }
      
      // Solo llamar a worldStoreFacade.updateEffectZone si NO viene de Firestore
      // para evitar bucles de sincronización
      if (!state.isUpdatingFromFirestore) {
        console.log('🔧 useWorldStore: Calling worldStoreFacade.updateEffectZone for local update');
        worldStoreFacade.updateEffectZone(zoneId, updates, gridId);
        console.log('✅ useWorldStore: worldStoreFacade.updateEffectZone called');
      }
    } else {
      console.warn('⚠️ useWorldStore: Could not find effect zone or gridId', { zoneId, gridId });
    }
    
    // Solo sincronizar con Firestore si NO viene de Firestore (prevenir bucles bidireccionales)
    if (state.isUpdatingFromFirestore) {
      console.log('ℹ️ useWorldStore: Skipping Firestore sync for effect zone - update came from Firestore');
      return;
    }
    
    // Debounce para Firestore
    const timerKey = `updateEffectZone_${zoneId}`;
    const existingTimer = updateDebounceTimers.get(timerKey);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    const timer = setTimeout(async () => {
      try {
        // Obtener la zona actualizada del estado local
        const currentState = useWorldStore.getState();
        const updatedZone = currentState.grids.get(currentState.activeGridId || '')?.effectZones.find(zone => zone.id === zoneId);
        
        if (updatedZone) {
          // Sincronizar la zona individual
          await firebaseService.updateGlobalEffectZone(zoneId, updatedZone);
          
          // IMPORTANTE: Sincronizar TODAS las cuadrículas para mantener consistencia
          const allGrids = Array.from(currentState.grids.values());
          await firebaseService.updateGlobalGrids(allGrids);
          console.log('✅ Cuadrículas sincronizadas después de actualizar zona de efecto');
        }
      } catch (error) {
        console.error('Error updating global effect zone:', error);
      } finally {
        updateDebounceTimers.delete(timerKey);
        lastUpdateTimes.delete(zoneId);
      }
    }, DEBOUNCE_DELAY);
    
    updateDebounceTimers.set(timerKey, timer);
  },

  /**
   * Elimina una zona de efecto del mundo global
   */
  removeGlobalEffectZone: (zoneId: string) => {
    const state = get();
    
    // Prevenir bucles bidireccionales
    if (state.isUpdatingFromFirestore) {
      return;
    }
    
    // Agregar la zona a la lista de objetos eliminados localmente
    const newDeletedObjects = new Set(state.locallyDeletedObjects);
    newDeletedObjects.add(zoneId);
    
    // Actualizar el estado local inmediatamente
    const newGrids = new Map(state.grids);
    
    // Buscar y eliminar la zona de todas las cuadrículas
    for (const [gridId, grid] of newGrids) {
      const zoneIndex = grid.effectZones.findIndex(zone => zone.id === zoneId);
      if (zoneIndex !== -1) {
        const updatedZones = grid.effectZones.filter(zone => zone.id !== zoneId);
        
        newGrids.set(gridId, {
          ...grid,
          effectZones: updatedZones
        });
        break;
      }
    }
    
    set({
      grids: newGrids,
      selectedEntityId: state.selectedEntityId === zoneId ? null : state.selectedEntityId,
      locallyDeletedObjects: newDeletedObjects,
    });
    
    // Limpiar el ID del Set después de 5 segundos
    setTimeout(() => {
      const currentState = get();
      const updatedDeletedObjects = new Set(currentState.locallyDeletedObjects);
      updatedDeletedObjects.delete(zoneId);
      set({ locallyDeletedObjects: updatedDeletedObjects });
      console.log(`🧹 Limpiando ${zoneId} de la lista de objetos eliminados`);
    }, 5000);
    
    // Sincronizar con Firestore
    firebaseService.removeGlobalEffectZone(zoneId).then(async () => {
      // IMPORTANTE: Después de eliminar la zona, sincronizar TODAS las cuadrículas actualizadas
      const currentState = get();
      const allGrids = Array.from(currentState.grids.values());
      await firebaseService.updateGlobalGrids(allGrids);
      console.log('✅ Cuadrículas sincronizadas después de eliminar zona de efecto');
    }).catch(error => {
      console.error('Error removing effect zone from Firestore:', error);
    });
  },

  // ========== ACCIONES GLOBALES PARA OBJETOS MÓVILES ==========

  /**
   * Añade un objeto móvil al mundo global
   */
  addGlobalMobileObject: (mobileObject: MobileObject) => {
    const state = get();
    
    console.log('🎵 addGlobalMobileObject called', { objectId: mobileObject.id, isUpdatingFromFirestore: state.isUpdatingFromFirestore });
    
    // Actualizar el estado local inmediatamente (SIEMPRE)
    set((state) => {
      const newGrids = new Map(state.grids);
      const activeGridId = state.activeGridId;
      
      // Buscar si el objeto ya existe en alguna cuadrícula para evitar duplicados
      let objectExists = false;
      for (const grid of newGrids.values()) {
        if (grid.mobileObjects.some(obj => obj.id === mobileObject.id)) {
          objectExists = true;
          console.log(`ℹ️ Objeto móvil ${mobileObject.id} ya existe en una cuadrícula, no agregando duplicado`);
          break;
        }
      }
      
      if (!objectExists) {
        // Si viene de Firestore, agregar solo a la primera cuadrícula cargada
        if (state.isUpdatingFromFirestore) {
          const firstGridId = newGrids.keys().next().value;
          if (firstGridId) {
            const firstGrid = newGrids.get(firstGridId);
            if (firstGrid) {
              const updatedGrid = {
                ...firstGrid,
                mobileObjects: [...firstGrid.mobileObjects, mobileObject]
              };
              
              newGrids.set(firstGridId, updatedGrid);
              // Sincronizar con useGridStore DE FORMA ATOMICA
              useGridStore.setState({ grids: newGrids });
              console.log('✅ Local state updated with new mobile object (from Firestore, agregado a primera cuadrícula)');
            }
          }
        } else {
          // Si es una acción local, agregar a la cuadrícula activa
    if (activeGridId) {
            const activeGrid = newGrids.get(activeGridId);
      if (activeGrid) {
        const updatedGrid = {
          ...activeGrid,
          mobileObjects: [...activeGrid.mobileObjects, mobileObject]
        };
        
          newGrids.set(activeGridId, updatedGrid);
          // Sincronizar con useGridStore DE FORMA ATOMICA
          useGridStore.setState({ grids: newGrids });
              console.log('✅ Local state updated with new mobile object (local action)');
            }
          }
        }
      }
      
      return { grids: newGrids };
    });
    
    // Los objetos móviles no tienen audio por ahora
    console.log(`🎵 Nuevo objeto móvil ${mobileObject.id} creado - sin inicialización de audio`);
    
    // Prevenir bucles bidireccionales - Solo sincronizar con Firestore si NO viene de Firestore
    if (state.isUpdatingFromFirestore) {
      console.log('ℹ️ Skipping Firestore sync - object came from Firestore');
      return;
    }
    
    // Sincronizar con Firestore (solo si es una acción local)
    firebaseService.addGlobalMobileObject(mobileObject).catch(error => {
      console.error('Error adding global mobile object:', error);
    });
  },

  /**
   * Actualiza un objeto móvil en el mundo global con debounce
   */
  updateGlobalMobileObject: (objectId: string, updates: Partial<Omit<MobileObject, 'id'>>) => {
    const state = get();
    
    console.log('🎵 useWorldStore: updateGlobalMobileObject called', { objectId, updates, isUpdatingFromFirestore: state.isUpdatingFromFirestore });
    
    // Actualizar el estado local inmediatamente
    const newGrids = new Map(state.grids);
    let updatedObject: MobileObject | null = null;
    let gridId: string | null = null;
    
    // Buscar y actualizar el objeto en todas las cuadrículas
    for (const [gId, grid] of newGrids) {
      const objectIndex = grid.mobileObjects.findIndex(obj => obj.id === objectId);
      if (objectIndex !== -1) {
        const updatedObjects = [...grid.mobileObjects];
        updatedObjects[objectIndex] = { ...updatedObjects[objectIndex], ...updates };
        updatedObject = updatedObjects[objectIndex];
        gridId = gId;
        
        newGrids.set(gId, {
          ...grid,
          mobileObjects: updatedObjects
        });
        break;
      }
    }
    
    set({ grids: newGrids });
    
    // Sincronizar con useGridStore
    useGridStore.setState({ grids: newGrids });
    
    console.log('✅ useWorldStore: Local state updated for mobile object');
    
    // SIEMPRE actualizar el objeto de audio, tanto si viene de Firestore como si es local
    if (updatedObject && gridId) {
      console.log('🔧 useWorldStore: Calling worldStoreFacade.updateMobileObject', { objectId, gridId, isFromFirestore: state.isUpdatingFromFirestore });
      worldStoreFacade.updateMobileObject(objectId, updates, newGrids);
      console.log('✅ useWorldStore: worldStoreFacade.updateMobileObject called');
    } else {
      console.warn('⚠️ useWorldStore: Could not find mobile object or gridId', { objectId, gridId });
    }
    
    // Solo sincronizar con Firestore si NO viene de Firestore (prevenir bucles bidireccionales)
    if (state.isUpdatingFromFirestore) {
      console.log('ℹ️ useWorldStore: Skipping Firestore sync for mobile object - update came from Firestore');
      return;
    }
    
    // Debounce para Firestore
    const timerKey = `updateMobileObject_${objectId}`;
    const existingTimer = updateDebounceTimers.get(timerKey);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    const timer = setTimeout(async () => {
      try {
        // Obtener el objeto actualizado del estado local
        const currentState = useWorldStore.getState();
        const updatedObject = currentState.grids.get(currentState.activeGridId || '')?.mobileObjects.find(obj => obj.id === objectId);
        
        if (updatedObject) {
          await firebaseService.updateGlobalMobileObject(objectId, updatedObject);
        }
      } catch (error) {
        console.error('Error updating global mobile object:', error);
      } finally {
        updateDebounceTimers.delete(timerKey);
      }
    }, DEBOUNCE_DELAY);
    
    updateDebounceTimers.set(timerKey, timer);
  },

  /**
   * Elimina un objeto móvil del mundo global
   */
  removeGlobalMobileObject: (objectId: string) => {
    const state = get();
    
    // Prevenir bucles bidireccionales
    if (state.isUpdatingFromFirestore) {
      return;
    }
    
    // Agregar el objeto a la lista de objetos eliminados localmente
    const newDeletedObjects = new Set(state.locallyDeletedObjects);
    newDeletedObjects.add(objectId);
    
    // Actualizar el estado local inmediatamente
    const newGrids = new Map(state.grids);
    
    // Buscar y eliminar el objeto de todas las cuadrículas
    for (const [gridId, grid] of newGrids) {
      const objectIndex = grid.mobileObjects.findIndex(obj => obj.id === objectId);
      if (objectIndex !== -1) {
        const updatedObjects = grid.mobileObjects.filter(obj => obj.id !== objectId);
        
        newGrids.set(gridId, {
          ...grid,
          mobileObjects: updatedObjects
        });
        break;
      }
    }
    
    set({
      grids: newGrids,
      selectedEntityId: state.selectedEntityId === objectId ? null : state.selectedEntityId,
      locallyDeletedObjects: newDeletedObjects,
    });
    
    // Limpiar el ID del Set después de 5 segundos
    setTimeout(() => {
      const currentState = get();
      const updatedDeletedObjects = new Set(currentState.locallyDeletedObjects);
      updatedDeletedObjects.delete(objectId);
      set({ locallyDeletedObjects: updatedDeletedObjects });
      console.log(`🧹 Limpiando ${objectId} de la lista de objetos eliminados`);
    }, 5000);
    
    // Sincronizar con Firestore
    firebaseService.removeGlobalMobileObject(objectId).then(async () => {
      // IMPORTANTE: Después de eliminar el objeto móvil, sincronizar TODAS las cuadrículas actualizadas
      const currentState = get();
      const allGrids = Array.from(currentState.grids.values());
      await firebaseService.updateGlobalGrids(allGrids);
      console.log('✅ Cuadrículas sincronizadas después de eliminar objeto móvil');
    }).catch(error => {
      console.error('Error removing mobile object from Firestore:', error);
    });
  }
  } as WorldState & WorldActions
});

