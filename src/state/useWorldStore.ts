import { create } from 'zustand';
import { useGridStore } from '../stores/useGridStore';
import { useEffectStore } from '../stores/useEffectStore';
import { WorldStoreFacade } from './facades/WorldStoreFacade';
import { type AudioParams } from '../lib/AudioManager';

// Tipos para los objetos de sonido
export type SoundObjectType = 'cube' | 'sphere' | 'cylinder' | 'cone' | 'pyramid' | 'icosahedron' | 'plane' | 'torus' | 'dodecahedronRing' | 'spiral';

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
  // Nuevas acciones para zonas de efectos
  addEffectZone: (type: 'phaser' | 'autoFilter' | 'autoWah' | 'bitCrusher' | 'chebyshev' | 'chorus' | 'distortion' | 'feedbackDelay' | 'freeverb' | 'frequencyShifter' | 'jcReverb' | 'pingPongDelay' | 'pitchShift' | 'reverb' | 'stereoWidener' | 'tremolo' | 'vibrato', position: [number, number, number], shape?: 'sphere' | 'cube') => void;
  updateEffectZone: (id: string, updates: Partial<Omit<EffectZone, 'id'>>) => void;
  removeEffectZone: (id: string) => void;
  toggleLockEffectZone: (id: string) => void;
  // Nuevas acciones para controlar la edición de zonas de efectos
  setEditingEffectZone: (isEditing: boolean) => void;
  refreshAllEffects: () => void;
  debugAudioChain: (soundId: string) => void;
  
  // Acciones para objetos móviles
  addMobileObject: (position: [number, number, number]) => void;
  updateMobileObject: (id: string, updates: Partial<Omit<MobileObject, 'id'>>) => void;
  removeMobileObject: (id: string) => void;
  updateMobileObjectPosition: (id: string, position: [number, number, number]) => void;
}

// Función helper para obtener parámetros por defecto usando el provider
// const getDefaultAudioParams = (type: SoundObjectType): AudioParams => {
//   return DefaultParamsProvider.getDefaultAudioParams(type);
// };

// Instancia del facade que coordina todos los componentes
const worldStoreFacade = new WorldStoreFacade();

// Creación del store de Zustand
export const useWorldStore = create<WorldState & WorldActions>((set, get) => ({
  // Estado inicial - Delegado al useGridStore
  get grids() {
    return useGridStore.getState().grids;
  },
  get currentGridCoordinates() {
    return useGridStore.getState().currentGridCoordinates;
  },
  get activeGridId() {
    return useGridStore.getState().activeGridId;
  },
  currentProjectId: null, // No hay proyecto cargado inicialmente
  gridSize: 20,
  renderDistance: 2,
  objects: [],
  mobileObjects: [],
  effectZones: [],
  selectedEntityId: null,
  transformMode: 'translate',
  isEditingEffectZone: false,
  
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

    console.log('useWorldStore.addObject: Creando objeto', { type, position, activeGridId });

    // Crear objeto usando el facade
    const newObject = worldStoreFacade.createObject(type, position, activeGridId);
    
    console.log('useWorldStore.addObject: Objeto creado', newObject);
    
    // Actualizar la cuadrícula para reflejar el nuevo objeto
    const activeGrid = state.grids.get(activeGridId);
    if (activeGrid) {
      const updatedGrid = {
        ...activeGrid,
        objects: [...activeGrid.objects, newObject]
      };
      
      set((state) => ({
        grids: new Map(state.grids.set(activeGridId, updatedGrid)),
      }));
    }
  },

  // Acción para eliminar un objeto - Delegada al WorldStoreFacade
  removeObject: (id: string) => {
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
    
    // Agregar zona de efecto a la cuadrícula activa
    const activeGrid = state.grids.get(activeGridId);
    if (activeGrid) {
      const updatedGrid = {
        ...activeGrid,
        effectZones: [...activeGrid.effectZones, newEffectZone]
      };
    
      set((state) => ({
        grids: new Map(state.grids.set(activeGridId, updatedGrid)),
      }));
    }
  },

  updateEffectZone: (id: string, updates: Partial<Omit<EffectZone, 'id'>>) => {
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
  },

  removeEffectZone: (id: string) => {
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

    // Agregar objeto móvil a la cuadrícula activa
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
  },

  updateMobileObject: (id: string, updates: Partial<Omit<MobileObject, 'id'>>) => {
    set((state) => {
      const newGrids = new Map(state.grids);
      
      // Actualizar objeto móvil usando el facade
      worldStoreFacade.updateMobileObject(id, updates, newGrids);
      
      // Buscar el objeto móvil en todas las cuadrículas y actualizarlo
      for (const [gridId, grid] of newGrids) {
        const objectIndex = grid.mobileObjects.findIndex(obj => obj.id === id);
        if (objectIndex !== -1) {
          const updatedObjects = [...grid.mobileObjects];
          updatedObjects[objectIndex] = { ...updatedObjects[objectIndex], ...updates };
          
          newGrids.set(gridId, {
            ...grid,
            mobileObjects: updatedObjects
          });
          break;
        }
      }
      
      return { grids: newGrids };
    });
  },

  removeMobileObject: (id: string) => {
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
  },

  updateMobileObjectPosition: (id: string, position: [number, number, number]) => {
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
    set(() => ({
      grids: new Map(gridStoreState.grids),
      activeGridId: gridStoreState.activeGridId
    }));
  },

  setActiveGrid: (gridId: string | null) => {
    useGridStore.getState().setActiveGrid(gridId);
    set(() => ({
      activeGridId: gridId,
    }));
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

}));
