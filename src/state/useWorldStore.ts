import { create } from 'zustand';
import { useGridStore } from '../stores/useGridStore';
import { useEffectStore } from '../stores/useEffectStore';
import { WorldStoreFacade } from './facades/WorldStoreFacade';
import { type AudioParams, audioManager } from '../lib/AudioManager';
import { firebaseService, type GlobalWorldDoc } from '../lib/firebaseService';

// Tipos para los objetos de sonido
export type SoundObjectType = 'cube' | 'sphere' | 'cylinder' | 'cone' | 'pyramid' | 'icosahedron' | 'plane' | 'torus' | 'dodecahedronRing' | 'spiral';

// Importar Grid desde useGridStore
import type { Grid } from '../stores/useGridStore';

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
  _pendingUpdate?: boolean; // Bandera para actualizaciones optimistas
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
  _pendingUpdate?: boolean; // Bandera para actualizaciones optimistas
}

// Estado del mundo 3D
export interface WorldState {
  // Proyecto actual para sincronización
  currentProjectId: string | null;
  
  // Estado de objetos (de la cuadrícula actual)
  objects: SoundObject[];
  mobileObjects: MobileObject[]; // Array para objetos móviles
  effectZones: EffectZone[]; // Nuevo array para zonas de efectos
  selectedEntityId: string | null; // Renombrado de selectedObjectId para ser más genérico
  transformMode: 'translate' | 'rotate' | 'scale';
  isEditingEffectZone: boolean; // Nuevo estado para indicar cuando se está editando una zona de efectos
  
  // Estado para bloquear sincronización durante transformaciones
  isSyncLocked: boolean;
  
  // World management (placeholder implementation)
  worlds: Array<{ id: string; name: string }>;
  currentWorldId: string | null;
}

// Acciones disponibles en el store
export interface WorldActions {
  
  // Acciones para proyecto actual
  setCurrentProjectId: (projectId: string | null) => void;
  setActiveGrid: (gridId: string | null) => void;
  
  // Acciones para gestión de mundos
  createWorld: (name: string) => void;
  deleteWorld: (id: string) => void;
  switchWorld: (id: string) => void;
  
  // Acciones para objetos
  addObject: (type: SoundObjectType, position: [number, number, number]) => void;
  removeObject: (id: string) => Promise<void>;
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
  removeEffectZone: (id: string) => Promise<void>;
  toggleLockEffectZone: (id: string) => void;
  // Nuevas acciones para controlar la edición de zonas de efectos
  setEditingEffectZone: (isEditing: boolean) => void;
  refreshAllEffects: () => void;
  debugAudioChain: (soundId: string) => void;
  
  // Acciones para objetos móviles
  addMobileObject: (position: [number, number, number]) => void;
  updateMobileObject: (id: string, updates: Partial<Omit<MobileObject, 'id'>>) => void;
  removeMobileObject: (id: string) => Promise<void>;
  updateMobileObjectPosition: (id: string, position: [number, number, number]) => void;
  
  // Acciones para el mundo global colaborativo
  setGlobalStateFromFirestore: (state: GlobalWorldDoc) => void;
  addGlobalSoundObject: (object: SoundObject) => Promise<void>;
  updateGlobalSoundObject: (objectId: string, updates: Partial<Omit<SoundObject, 'id'>>) => Promise<void>;
  removeGlobalSoundObject: (objectId: string) => Promise<void>;
  toggleGlobalObjectAudio: (objectId: string, forceState?: boolean) => Promise<void>;
  addGlobalMobileObject: (mobileObject: MobileObject) => Promise<void>;
  updateGlobalMobileObject: (objectId: string, updates: Partial<Omit<MobileObject, 'id'>>) => Promise<void>;
  removeGlobalMobileObject: (objectId: string) => Promise<void>;
  addGlobalEffectZone: (effectZone: EffectZone) => Promise<void>;
  updateGlobalEffectZone: (zoneId: string, updates: Partial<Omit<EffectZone, 'id'>>) => Promise<void>;
  removeGlobalEffectZone: (zoneId: string) => Promise<void>;
  
  // Acciones para controlar bloqueo de sincronización
  setSyncLock: (locked: boolean) => void;
}

// Función helper para obtener parámetros por defecto usando el provider
// const getDefaultAudioParams = (type: SoundObjectType): AudioParams => {
//   return DefaultParamsProvider.getDefaultAudioParams(type);
// };

// Instancia del facade que coordina todos los componentes
const worldStoreFacade = new WorldStoreFacade();

// Creación del store de Zustand
export const useWorldStore = create<WorldState & WorldActions>((set, get) => ({
  // Estado inicial
  currentProjectId: null, // No hay proyecto cargado inicialmente
  objects: [],
  mobileObjects: [],
  effectZones: [],
  selectedEntityId: null,
  transformMode: 'translate',
  isEditingEffectZone: false,
  
  // Estado para bloquear sincronización durante transformaciones
  isSyncLocked: false,
  
  // World management state
  worlds: [{ id: 'default', name: 'Default World' }],
  currentWorldId: 'default',

  // Acción para añadir un nuevo objeto - Delegada al WorldStoreFacade
  addObject: (type: SoundObjectType, position: [number, number, number]) => {
    const activeGridId = useGridStore.getState().activeGridId;
    
    console.log('🎛️ useWorldStore.addObject: INICIANDO', { type, position, activeGridId });
    
    if (!activeGridId) {
      console.log('🎛️ useWorldStore.addObject: ERROR - No hay activeGridId');
      return;
    }

    console.log('🎛️ useWorldStore.addObject: Creando objeto', { type, position, activeGridId });

    // Crear objeto usando el facade
    const newObject = worldStoreFacade.createObject(type, position, activeGridId);
    
    console.log('🎛️ useWorldStore.addObject: Objeto creado', newObject);
    
    // Actualizar la cuadrícula para reflejar el nuevo objeto
    const activeGrid = useGridStore.getState().grids.get(activeGridId);
    if (activeGrid) {
      const updatedGrid = {
        ...activeGrid,
        objects: [...activeGrid.objects, newObject]
      };
      
      useGridStore.getState().updateGrid(activeGridId, updatedGrid);
      console.log('🎛️ useWorldStore.addObject: Cuadrícula actualizada', { gridId: activeGridId, objectsCount: updatedGrid.objects.length });
    } else {
      console.log('🎛️ useWorldStore.addObject: ERROR - No se encontró la cuadrícula activa', activeGridId);
    }
  },

  // Acción para eliminar un objeto - Delegada al WorldStoreFacade
  removeObject: async (id: string) => {
    const grids = useGridStore.getState().grids;
    const activeGridId = useGridStore.getState().activeGridId;
    
    // Verificar si estamos en modo global
    const isGlobalMode = activeGridId === 'global-world';
    
    // Buscar y eliminar el objeto de todas las cuadrículas
    for (const [gridId, grid] of grids) {
      const objectIndex = grid.objects.findIndex(obj => obj.id === id);
      if (objectIndex !== -1) {
        // Eliminar la fuente de sonido del AudioManager
        try {
          audioManager.removeSoundSource(id);
        } catch (error) {
          console.warn('Error al eliminar fuente de sonido:', error);
        }
        
        const updatedObjects = grid.objects.filter(obj => obj.id !== id);
        
        useGridStore.getState().updateGrid(gridId, {
          ...grid,
          objects: updatedObjects
        });
        
        // Si estamos en modo global, también eliminar de Firebase
        if (isGlobalMode) {
          try {
            await firebaseService.removeGlobalSoundObject(id);
            console.log('Objeto eliminado de Firebase:', id);
          } catch (error) {
            console.error('Error al eliminar objeto de Firebase:', error);
          }
        }
        
        break;
      }
    }
    
    set((state) => ({
      selectedEntityId: state.selectedEntityId === id ? null : state.selectedEntityId,
    }));
  },

  // Acción para seleccionar una entidad - Delegada al WorldStoreFacade
  selectEntity: (id: string | null) => {
    // Delegar al facade
    worldStoreFacade.selectEntity(id);
    
    const grids = useGridStore.getState().grids;
    
    // Actualizar la selección en todas las cuadrículas
    grids.forEach((grid, gridId) => {
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
      
      useGridStore.getState().updateGrid(gridId, {
        ...grid,
        objects: updatedObjects,
        mobileObjects: updatedMobileObjects,
        effectZones: updatedEffectZones,
      });
    });
    
    set((state) => ({
      selectedEntityId: id,
      transformMode: id === null ? 'translate' : state.transformMode,
    }));
  },

  // Acción para actualizar un objeto - Delegada al WorldStoreFacade
  updateObject: (id: string, updates: Partial<Omit<SoundObject, 'id'>>) => {
    console.log('🎛️ useWorldStore.updateObject llamado', { id, updates });
    const grids = useGridStore.getState().grids;
    
    // Buscar el objeto en todas las cuadrículas y actualizarlo
    for (const [gridId, grid] of grids) {
      const objectIndex = grid.objects.findIndex(obj => obj.id === id);
      if (objectIndex !== -1) {
        console.log('🎛️ useWorldStore.updateObject: Objeto encontrado en grid', gridId);
        // Actualizar objeto usando el facade (esto ya maneja toda la lógica)
        worldStoreFacade.updateObject(id, updates, gridId);
        break;
      }
    }
  },

  // Acción para activar/desactivar el audio de un objeto - Delegada al WorldStoreFacade
  toggleObjectAudio: (id: string, forceState?: boolean) => {
    const grids = useGridStore.getState().grids;
    const { gridId } = worldStoreFacade.findObjectById(id, grids);
    
    if (gridId) {
      // Delegar al facade
      worldStoreFacade.toggleObjectAudio(id, forceState, gridId);
      
      // Actualizar el estado local
      const grid = grids.get(gridId);
      if (grid) {
        const updatedObjects = grid.objects.map((obj) =>
          obj.id === id ? { ...obj, audioEnabled: forceState !== undefined ? forceState : !obj.audioEnabled } : obj
        );
        
        useGridStore.getState().updateGrid(gridId, {
          ...grid,
          objects: updatedObjects
        });
      }
    }
  },

  // Acción para disparar una nota percusiva - Delegada al WorldStoreFacade
  triggerObjectNote: (id: string) => {
    const grids = useGridStore.getState().grids;
    const { gridId } = worldStoreFacade.findObjectById(id, grids);
    
    if (gridId) {
      worldStoreFacade.triggerObjectNote(id, gridId);
    }
  },

  // Acción para disparar un objeto percusivo - Delegada al WorldStoreFacade
  triggerObjectPercussion: (id: string) => {
    const grids = useGridStore.getState().grids;
    const { gridId } = worldStoreFacade.findObjectById(id, grids);
    
    if (gridId) {
      worldStoreFacade.triggerObjectPercussion(id, gridId);
    }
  },

  // Acción para disparar una nota con duración específica - Delegada al WorldStoreFacade
  triggerObjectAttackRelease: (id: string) => {
    const grids = useGridStore.getState().grids;
    const { gridId } = worldStoreFacade.findObjectById(id, grids);
    
    if (gridId) {
      worldStoreFacade.triggerObjectAttackRelease(id, gridId);
    }
  },

  // Acción para iniciar el gate - Delegada al WorldStoreFacade
  startObjectGate: (id: string) => {
    const grids = useGridStore.getState().grids;
    const { gridId } = worldStoreFacade.findObjectById(id, grids);
    
    if (gridId) {
      worldStoreFacade.startObjectGate(id, gridId);
    }
  },

  // Acción para detener el gate - Delegada al WorldStoreFacade
  stopObjectGate: (id: string) => {
    const grids = useGridStore.getState().grids;
    const { gridId } = worldStoreFacade.findObjectById(id, grids);
    
    if (gridId) {
      worldStoreFacade.stopObjectGate(id, gridId);
    }
  },

  // Acción para limpiar todos los objetos - Delegada al WorldStoreFacade
  clearAllObjects: () => {
    // Limpiar objetos usando el facade
    worldStoreFacade.clearAllObjects();
    
    const grids = useGridStore.getState().grids;
    
    // Limpiar objetos de todas las cuadrículas
    grids.forEach((grid, gridId) => {
      useGridStore.getState().updateGrid(gridId, {
        ...grid,
        objects: [],
        mobileObjects: [],
        effectZones: []
      });
    });
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    set((_) => ({
      selectedEntityId: null,
    }));
  },

  // Acción para establecer el modo de transformación - Delegada al WorldStoreFacade
  setTransformMode: (mode: 'translate' | 'rotate' | 'scale') => {
    worldStoreFacade.setTransformMode(mode);
    set({ transformMode: mode });
  },

  // Nuevas acciones para zonas de efectos - Delegadas al WorldStoreFacade
  addEffectZone: (type: 'phaser' | 'autoFilter' | 'autoWah' | 'bitCrusher' | 'chebyshev' | 'chorus' | 'distortion' | 'feedbackDelay' | 'freeverb' | 'frequencyShifter' | 'jcReverb' | 'pingPongDelay' | 'pitchShift' | 'reverb' | 'stereoWidener' | 'tremolo' | 'vibrato', position: [number, number, number], shape: 'sphere' | 'cube' = 'sphere') => {
    const activeGridId = useGridStore.getState().activeGridId;
    
    if (!activeGridId) {
      return;
    }

    // Crear zona de efecto usando el facade
    const newEffectZone = worldStoreFacade.createEffectZone(type, position, shape, activeGridId);
    
    // Agregar zona de efecto a la cuadrícula activa
    const activeGrid = useGridStore.getState().grids.get(activeGridId);
    if (activeGrid) {
      const updatedGrid = {
        ...activeGrid,
        effectZones: [...activeGrid.effectZones, newEffectZone]
      };
    
      useGridStore.getState().updateGrid(activeGridId, updatedGrid);
    }
  },

  updateEffectZone: (id: string, updates: Partial<Omit<EffectZone, 'id'>>) => {
    const grids = useGridStore.getState().grids;
    
    // Buscar la zona de efecto en todas las cuadrículas y actualizarla
    for (const [gridId, grid] of grids) {
      const zoneIndex = grid.effectZones.findIndex(zone => zone.id === id);
      if (zoneIndex !== -1) {
        // Actualizar zona de efecto usando el facade
        worldStoreFacade.updateEffectZone(id, updates, gridId);
        
        const updatedZones = [...grid.effectZones];
        updatedZones[zoneIndex] = { ...updatedZones[zoneIndex], ...updates };
        
        useGridStore.getState().updateGrid(gridId, {
          ...grid,
          effectZones: updatedZones
        });
        break;
      }
    }
  },

  removeEffectZone: async (id: string) => {
    const grids = useGridStore.getState().grids;
    const activeGridId = useGridStore.getState().activeGridId;
    
    // Verificar si estamos en modo global
    const isGlobalMode = activeGridId === 'global-world';
    
    // Buscar y eliminar la zona de efecto de todas las cuadrículas
    for (const [gridId, grid] of grids) {
      const zoneIndex = grid.effectZones.findIndex(zone => zone.id === id);
      if (zoneIndex !== -1) {
        // Las zonas de efecto no tienen fuentes de sonido que eliminar
        
        const updatedZones = grid.effectZones.filter(zone => zone.id !== id);
        
        useGridStore.getState().updateGrid(gridId, {
          ...grid,
          effectZones: updatedZones
        });
        
        // Si estamos en modo global, también eliminar de Firebase
        if (isGlobalMode) {
          try {
            await firebaseService.removeGlobalEffectZone(id);
            console.log('Zona de efecto eliminada de Firebase:', id);
          } catch (error) {
            console.error('Error al eliminar zona de efecto de Firebase:', error);
          }
        }
        
        break;
      }
    }
    
    set((state) => ({
      selectedEntityId: state.selectedEntityId === id ? null : state.selectedEntityId,
    }));
  },

  toggleLockEffectZone: (id: string) => {
    const grids = useGridStore.getState().grids;
    let gridId: string | null = null;
    
    // Buscar la zona de efecto en todas las cuadrículas para obtener el gridId
    for (const [gId, grid] of grids) {
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
      const grid = grids.get(gridId);
      if (grid) {
        const zoneIndex = grid.effectZones.findIndex(zone => zone.id === id);
        if (zoneIndex !== -1) {
          const updatedZones = [...grid.effectZones];
          updatedZones[zoneIndex] = { ...updatedZones[zoneIndex], isLocked: !updatedZones[zoneIndex].isLocked };
          
          useGridStore.getState().updateGrid(gridId, {
            ...grid,
            effectZones: updatedZones
          });
        }
      }
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
    const activeGridId = useGridStore.getState().activeGridId;
    
    if (!activeGridId) {
      return;
    }

    // Crear objeto móvil usando el facade
    const newMobileObject = worldStoreFacade.createMobileObject(position);

    // Agregar objeto móvil a la cuadrícula activa
    const activeGrid = useGridStore.getState().grids.get(activeGridId);
    if (activeGrid) {
      const updatedGrid = {
        ...activeGrid,
        mobileObjects: [...activeGrid.mobileObjects, newMobileObject]
      };

      useGridStore.getState().updateGrid(activeGridId, updatedGrid);
    }
  },

  updateMobileObject: (id: string, updates: Partial<Omit<MobileObject, 'id'>>) => {
    const grids = useGridStore.getState().grids;
    
    // Actualizar objeto móvil usando el facade
    worldStoreFacade.updateMobileObject(id, updates, grids);
    
    // Buscar el objeto móvil en todas las cuadrículas y actualizarlo
    for (const [gridId, grid] of grids) {
      const objectIndex = grid.mobileObjects.findIndex(obj => obj.id === id);
      if (objectIndex !== -1) {
        const updatedObjects = [...grid.mobileObjects];
        updatedObjects[objectIndex] = { ...updatedObjects[objectIndex], ...updates };
        
        useGridStore.getState().updateGrid(gridId, {
          ...grid,
          mobileObjects: updatedObjects
        });
        break;
      }
    }
  },

  removeMobileObject: async (id: string) => {
    const grids = useGridStore.getState().grids;
    const activeGridId = useGridStore.getState().activeGridId;
    
    // Verificar si estamos en modo global
    const isGlobalMode = activeGridId === 'global-world';
    
    // Eliminar la fuente de sonido del AudioManager si existe
    try {
      audioManager.removeSoundSource(id);
    } catch (error) {
      console.warn('Error al eliminar fuente de sonido móvil:', error);
    }
    
    // Buscar y eliminar el objeto móvil de todas las cuadrículas
    for (const [gridId, grid] of grids) {
      const objectIndex = grid.mobileObjects.findIndex(obj => obj.id === id);
      if (objectIndex !== -1) {
        const updatedObjects = grid.mobileObjects.filter(obj => obj.id !== id);
        
        useGridStore.getState().updateGrid(gridId, {
          ...grid,
          mobileObjects: updatedObjects
        });
        
        // Si estamos en modo global, también eliminar de Firebase
        if (isGlobalMode) {
          try {
            await firebaseService.removeGlobalMobileObject(id);
            console.log('Objeto móvil eliminado de Firebase:', id);
          } catch (error) {
            console.error('Error al eliminar objeto móvil de Firebase:', error);
          }
        }
        
        break;
      }
    }
    
    set((state) => ({
      selectedEntityId: state.selectedEntityId === id ? null : state.selectedEntityId,
    }));
  },

  updateMobileObjectPosition: (id: string, position: [number, number, number]) => {
    const grids = useGridStore.getState().grids;
    
    // Actualizar posición usando el facade
    worldStoreFacade.updateMobileObjectPosition(id, position, grids);
    
    // Buscar el objeto móvil en todas las cuadrículas y actualizar su posición
    for (const [gridId, grid] of grids) {
      const objectIndex = grid.mobileObjects.findIndex(obj => obj.id === id);
      if (objectIndex !== -1) {
        const updatedObjects = [...grid.mobileObjects];
        updatedObjects[objectIndex] = { ...updatedObjects[objectIndex], position };
        
        useGridStore.getState().updateGrid(gridId, {
          ...grid,
          mobileObjects: updatedObjects
        });
        break;
      }
    }
  },


  setActiveGrid: (gridId: string | null) => {
    useGridStore.getState().setActiveGrid(gridId);
  },

  selectGrid: (gridId: string | null) => {
    useGridStore.getState().selectGrid(gridId);
  },

  // Acción para establecer el proyecto actual
  setCurrentProjectId: (projectId: string | null) => {
    set({ currentProjectId: projectId });
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

  // ===== ACCIONES PARA EL MUNDO GLOBAL COLABORATIVO =====

  // Establecer el estado global desde Firestore
  setGlobalStateFromFirestore: (globalState: GlobalWorldDoc) => {
    // Permitir actualizaciones de Firebase incluso si hay bloqueo de sincronización local
    // Esto asegura que otros usuarios puedan ver los cambios en tiempo real
    console.log('🌐 Procesando actualización de Firestore para el mundo global');
    
    // console.log('🌐 useWorldStore.setGlobalStateFromFirestore: Recibiendo estado de Firebase', globalState);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    set((_) => {
      // Limpiar todas las fuentes de sonido existentes del AudioManager
      try {
        // Obtener todos los IDs de objetos existentes
        const existingObjectIds = new Set<string>();
        const grids = useGridStore.getState().grids;
        grids.forEach((grid: Grid) => {
          grid.objects.forEach((obj: SoundObject) => existingObjectIds.add(obj.id));
          grid.mobileObjects.forEach((obj: MobileObject) => existingObjectIds.add(obj.id));
        });

        // Eliminar fuentes de sonido que ya no existen en el nuevo estado
        const newObjectIds = new Set<string>();
        (globalState.objects || []).forEach(obj => newObjectIds.add(obj.id));
        (globalState.mobileObjects || []).forEach(obj => newObjectIds.add(obj.id));

        existingObjectIds.forEach(id => {
          if (!newObjectIds.has(id)) {
            try {
              audioManager.removeSoundSource(id);
            } catch (error) {
              console.warn('Error al limpiar fuente de sonido:', error);
            }
          }
        });

        // Crear fuentes de sonido para objetos nuevos y actualizar parámetros de objetos existentes
        (globalState.objects || []).forEach(obj => {
          try {
            // Verificar si el objeto ya existe en el AudioManager
            const existingSource = audioManager.getSoundSourceState(obj.id);
            
            if (existingSource) {
              // Objeto existe - actualizar parámetros de audio
              // console.log('🎵 Actualizando parámetros de audio para objeto existente:', obj.id, obj.audioParams);
              audioManager.updateSoundParams(obj.id, obj.audioParams);
              
              // Actualizar posición si cambió
              audioManager.updateSoundPosition(obj.id, obj.position);
              
              // VERIFICAR SI HAY UNA ACTUALIZACIÓN OPTIMISTA PENDIENTE
              const currentLocalObject = get().objects.find(localObj => localObj.id === obj.id);
              if (currentLocalObject && currentLocalObject._pendingUpdate) {
                console.log('🎵 Procesando actualización de Firestore para objeto con cambio pendiente:', obj.id);
                // Procesar la actualización de Firebase incluso si hay cambios pendientes
                // Esto permite que otros usuarios vean los cambios en tiempo real
              }
              
              // Manejar estado de audio (habilitado/deshabilitado)
              const isPercussiveObject = ['icosahedron', 'torus', 'spiral', 'pyramid', 'cone'].includes(obj.type);
              
              // Solo activar audio si no es percusivo y está habilitado
              if (obj.audioEnabled && !isPercussiveObject) {
                // Verificar si el audio ya está activo para evitar reactivación innecesaria
                const sourceExists = audioManager.getSoundSourceState(obj.id);
                if (!sourceExists) {
                  console.log('🎵 Activando audio continuo desde Firestore para:', obj.id);
                  audioManager.startContinuousSound(obj.id, obj.audioParams);
                }
              } else {
                // Si el audio está deshabilitado o es percusivo, detener el sonido
                console.log('🎵 Desactivando audio desde Firestore para:', obj.id);
                audioManager.stopSound(obj.id);
              }
            } else {
              // Objeto nuevo - crear fuente de sonido
              // console.log('🎵 Creando nueva fuente de sonido:', obj.id, obj.audioParams);
              audioManager.createSoundSource(
                obj.id,
                obj.type,
                obj.audioParams,
                obj.position
              );
              
              // Iniciar sonido continuo si está habilitado y no es percusivo
              const isPercussiveObject = ['icosahedron', 'torus', 'spiral', 'pyramid', 'cone'].includes(obj.type);
              if (obj.audioEnabled && !isPercussiveObject) {
                console.log('🎵 Activando audio continuo para objeto nuevo:', obj.id);
                audioManager.startContinuousSound(obj.id, obj.audioParams);
              }
            }
          } catch (error) {
            console.warn('Error al sincronizar fuente de sonido:', error);
          }
        });
      } catch (error) {
        console.warn('Error al sincronizar AudioManager:', error);
      }

      // Crear una cuadrícula global con los objetos del mundo global
      const globalGridId = 'global-world';
      const globalGrid = {
        id: globalGridId,
        coordinates: [0, 0, 0] as [number, number, number],
        position: [0, 0, 0] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number],
        scale: [1, 1, 1] as [number, number, number],
        objects: globalState.objects || [],
        mobileObjects: globalState.mobileObjects || [],
        effectZones: globalState.effectZones || [],
        gridSize: 20,
        gridColor: '#404040',
        isLoaded: true,
        isSelected: false
      };

      // Actualizar solo la cuadrícula global sin limpiar las demás
      // console.log('🌐 useWorldStore.setGlobalStateFromFirestore: Actualizando cuadrícula global', globalGrid);
      useGridStore.getState().updateGrid(globalGridId, globalGrid);
      
      // Solo cambiar a la cuadrícula global si no hay una activa o si estamos en modo global
      const currentActiveGridId = useGridStore.getState().activeGridId;
      if (!currentActiveGridId || currentActiveGridId === globalGridId) {
        // console.log('🌐 useWorldStore.setGlobalStateFromFirestore: Cambiando a cuadrícula global');
        useGridStore.getState().setActiveGrid(globalGridId);
      }

      return {
        objects: globalState.objects || [],
        mobileObjects: globalState.mobileObjects || [],
        effectZones: globalState.effectZones || []
      };
    });
  },

  // Agregar un objeto sonoro al mundo global
  addGlobalSoundObject: async (object: SoundObject) => {
    try {
      // Agregar al estado local primero
      const globalGridId = 'global-world';
      const globalGrid = useGridStore.getState().grids.get(globalGridId);
      
      if (globalGrid) {
        const updatedGrid = {
          ...globalGrid,
          objects: [...globalGrid.objects, object]
        };
        
        useGridStore.getState().updateGrid(globalGridId, updatedGrid);
      }
      
      set((state) => ({
        objects: [...state.objects, object]
      }));

      // Sincronizar con Firestore
      await firebaseService.addGlobalSoundObject(object);
    } catch (error) {
      console.error('Error al agregar objeto global:', error);
      throw error;
    }
  },

  // Actualizar un objeto sonoro en el mundo global
  updateGlobalSoundObject: async (objectId: string, updates: Partial<Omit<SoundObject, 'id'>>) => {
    console.log('🎛️ useWorldStore.updateGlobalSoundObject llamado', { objectId, updates });
    try {
      // ACTUALIZACIÓN OPTIMISTA: Actualizar estado local INMEDIATAMENTE
      const globalGridId = 'global-world';
      const globalGrid = useGridStore.getState().grids.get(globalGridId);
      
      if (globalGrid) {
        console.log('🎛️ useWorldStore.updateGlobalSoundObject: Cuadrícula global encontrada');
        const updatedObjects = globalGrid.objects.map(obj => 
          obj.id === objectId ? { ...obj, ...updates, _pendingUpdate: true } : obj
        );
        
        const updatedGrid = {
          ...globalGrid,
          objects: updatedObjects
        };
        
        useGridStore.getState().updateGrid(globalGridId, updatedGrid);
      }
      
      set((state) => ({
        objects: state.objects.map(obj => 
          obj.id === objectId ? { ...obj, ...updates, _pendingUpdate: true } : obj
        )
      }));

      // Actualizar parámetros en el AudioManager
      try {
        if (updates.position) {
          console.log('🎛️ useWorldStore.updateGlobalSoundObject: Actualizando posición en AudioManager');
          audioManager.updateSoundPosition(objectId, updates.position);
        }
        if (updates.audioParams) {
          console.log('🎛️ useWorldStore.updateGlobalSoundObject: Actualizando parámetros de audio en AudioManager', updates.audioParams);
          audioManager.updateSoundParams(objectId, updates.audioParams);
        }
        if (updates.audioEnabled !== undefined) {
          if (updates.audioEnabled) {
            // Obtener el objeto actualizado para obtener los parámetros de audio
            const globalGrid = useGridStore.getState().grids.get('global-world');
            const updatedObject = globalGrid?.objects.find(obj => obj.id === objectId);
            if (updatedObject) {
              audioManager.startContinuousSound(objectId, updatedObject.audioParams);
            }
          } else {
            audioManager.stopSound(objectId);
          }
        }
      } catch (audioError) {
        console.error('Error al actualizar AudioManager:', audioError);
        // No lanzar el error para no interrumpir la sincronización con Firestore
      }

      // Sincronizar con Firestore (sin esperar respuesta)
      console.log('🎛️ Sincronizando con Firestore (optimistic) - Transformaciones:', updates);
      firebaseService.updateGlobalSoundObject(objectId, updates)
        .then(() => {
          console.log('🎛️ Firestore confirmó el cambio para:', objectId);
          // Marcar como sincronizado
          const globalGridForConfirm = useGridStore.getState().grids.get(globalGridId);
          if (globalGridForConfirm) {
            const confirmedObjects = globalGridForConfirm.objects.map(obj => 
              obj.id === objectId ? { ...obj, _pendingUpdate: false } : obj
            );
            
            const confirmedGrid = {
              ...globalGridForConfirm,
              objects: confirmedObjects
            };
            
            useGridStore.getState().updateGrid(globalGridId, confirmedGrid);
          }
        })
        .catch((error) => {
          console.error('Error al sincronizar con Firestore:', error);
          // Revertir cambio si falla
          const globalGridForRevert = useGridStore.getState().grids.get(globalGridId);
          if (globalGridForRevert) {
            const originalObject = globalGridForRevert.objects.find(obj => obj.id === objectId);
            if (originalObject) {
              const revertedObjects = globalGridForRevert.objects.map(obj => 
                obj.id === objectId ? { ...originalObject, _pendingUpdate: false } : obj
              );
              
              const revertedGrid = {
                ...globalGridForRevert,
                objects: revertedObjects
              };
              
              useGridStore.getState().updateGrid(globalGridId, revertedGrid);
            }
          }
        });
    } catch (error) {
      console.error('Error al actualizar objeto global:', error);
      throw error;
    }
  },

  // Activar/desactivar audio de un objeto en el mundo global
  toggleGlobalObjectAudio: async (objectId: string, forceState?: boolean) => {
    try {
      console.log('🎵 toggleGlobalObjectAudio iniciado para:', objectId, 'forceState:', forceState);
      
      // Obtener el objeto actual para determinar el nuevo estado
      const globalGrid = useGridStore.getState().grids.get('global-world');
      const currentObject = globalGrid?.objects.find(obj => obj.id === objectId);
      
      if (!currentObject) {
        console.error('Objeto no encontrado:', objectId);
        return;
      }

      // Determinar el nuevo estado del audio
      const newAudioEnabled = forceState !== undefined ? forceState : !currentObject.audioEnabled;
      console.log('🎵 Cambiando audio de', currentObject.audioEnabled, 'a', newAudioEnabled);

      // ACTUALIZACIÓN OPTIMISTA: Actualizar estado local INMEDIATAMENTE
      const globalGridId = 'global-world';
      const globalGridForUpdate = useGridStore.getState().grids.get(globalGridId);
      
      if (globalGridForUpdate) {
        const updatedObjects = globalGridForUpdate.objects.map(obj => 
          obj.id === objectId ? { ...obj, audioEnabled: newAudioEnabled, _pendingUpdate: true } : obj
        );
        
        const updatedGrid = {
          ...globalGridForUpdate,
          objects: updatedObjects
        };
        
        useGridStore.getState().updateGrid(globalGridId, updatedGrid);
      }
      
      set((state) => ({
        objects: state.objects.map(obj => 
          obj.id === objectId ? { ...obj, audioEnabled: newAudioEnabled, _pendingUpdate: true } : obj
        )
      }));

      // Actualizar en el AudioManager
      try {
        if (newAudioEnabled) {
          // Activar audio continuo
          console.log('🎵 Activando audio continuo en AudioManager');
          audioManager.startContinuousSound(objectId, currentObject.audioParams);
        } else {
          // Desactivar audio continuo
          console.log('🎵 Desactivando audio continuo en AudioManager');
          audioManager.stopSound(objectId);
        }
      } catch (audioError) {
        console.error('Error al actualizar AudioManager:', audioError);
      }

      // Sincronizar con Firestore (sin esperar respuesta)
      console.log('🎵 Sincronizando con Firestore (optimistic)');
      firebaseService.updateGlobalSoundObject(objectId, { audioEnabled: newAudioEnabled })
        .then(() => {
          console.log('🎵 Firestore confirmó el cambio para:', objectId);
          // Marcar como sincronizado
          const globalGridForConfirm = useGridStore.getState().grids.get(globalGridId);
          if (globalGridForConfirm) {
            const confirmedObjects = globalGridForConfirm.objects.map(obj => 
              obj.id === objectId ? { ...obj, _pendingUpdate: false } : obj
            );
            
            const confirmedGrid = {
              ...globalGridForConfirm,
              objects: confirmedObjects
            };
            
            useGridStore.getState().updateGrid(globalGridId, confirmedGrid);
          }
        })
        .catch((error) => {
          console.error('Error al sincronizar con Firestore:', error);
          // Revertir cambio si falla
          const globalGridForRevert = useGridStore.getState().grids.get(globalGridId);
          if (globalGridForRevert) {
            const revertedObjects = globalGridForRevert.objects.map(obj => 
              obj.id === objectId ? { ...obj, audioEnabled: currentObject.audioEnabled, _pendingUpdate: false } : obj
            );
            
            const revertedGrid = {
              ...globalGridForRevert,
              objects: revertedObjects
            };
            
            useGridStore.getState().updateGrid(globalGridId, revertedGrid);
          }
        });

      console.log('🎵 toggleGlobalObjectAudio completado exitosamente');
    } catch (error) {
      console.error('Error al cambiar estado de audio global:', error);
      throw error;
    }
  },

  // Eliminar un objeto sonoro del mundo global
  removeGlobalSoundObject: async (objectId: string) => {
    try {
      // Eliminar del AudioManager primero
      try {
        audioManager.removeSoundSource(objectId);
      } catch (audioError) {
        console.warn('Error al eliminar fuente de sonido del AudioManager:', audioError);
      }

      // Eliminar del estado local
      const globalGridId = 'global-world';
      const globalGrid = useGridStore.getState().grids.get(globalGridId);
      
      if (globalGrid) {
        const updatedObjects = globalGrid.objects.filter(obj => obj.id !== objectId);
        
        const updatedGrid = {
          ...globalGrid,
          objects: updatedObjects
        };
        
        useGridStore.getState().updateGrid(globalGridId, updatedGrid);
      }
      
      set((state) => ({
        objects: state.objects.filter(obj => obj.id !== objectId),
        selectedEntityId: state.selectedEntityId === objectId ? null : state.selectedEntityId
      }));

      // Sincronizar con Firestore
      await firebaseService.removeGlobalSoundObject(objectId);
    } catch (error) {
      console.error('Error al eliminar objeto global:', error);
      throw error;
    }
  },

  // Agregar un objeto móvil al mundo global
  addGlobalMobileObject: async (mobileObject: MobileObject) => {
    try {
      const globalGridId = 'global-world';
      const globalGrid = useGridStore.getState().grids.get(globalGridId);
      
      if (globalGrid) {
        const updatedGrid = {
          ...globalGrid,
          mobileObjects: [...globalGrid.mobileObjects, mobileObject]
        };
        
        useGridStore.getState().updateGrid(globalGridId, updatedGrid);
      }
      
      set((state) => ({
        mobileObjects: [...state.mobileObjects, mobileObject]
      }));

      await firebaseService.addGlobalMobileObject(mobileObject);
    } catch (error) {
      console.error('Error al agregar objeto móvil global:', error);
      throw error;
    }
  },

  // Actualizar un objeto móvil en el mundo global
  updateGlobalMobileObject: async (objectId: string, updates: Partial<Omit<MobileObject, 'id'>>) => {
    try {
      const globalGridId = 'global-world';
      const globalGrid = useGridStore.getState().grids.get(globalGridId);
      
      if (globalGrid) {
        const updatedObjects = globalGrid.mobileObjects.map((obj: MobileObject) => 
          obj.id === objectId ? { ...obj, ...updates } : obj
        );
        
        const updatedGrid = {
          ...globalGrid,
          mobileObjects: updatedObjects
        };
        
        useGridStore.getState().updateGrid(globalGridId, updatedGrid);
      }
      
      set((state) => ({
        mobileObjects: state.mobileObjects.map(obj => 
          obj.id === objectId ? { ...obj, ...updates } : obj
        )
      }));

      await firebaseService.updateGlobalMobileObject(objectId, updates);
    } catch (error) {
      console.error('Error al actualizar objeto móvil global:', error);
      throw error;
    }
  },

  // Eliminar un objeto móvil del mundo global
  removeGlobalMobileObject: async (objectId: string) => {
    try {
      // Eliminar del AudioManager si es necesario
      try {
        audioManager.removeSoundSource(objectId);
      } catch (audioError) {
        console.warn('Error al eliminar fuente de sonido del AudioManager:', audioError);
      }

      const globalGridId = 'global-world';
      const globalGrid = useGridStore.getState().grids.get(globalGridId);
      
      if (globalGrid) {
        const updatedObjects = globalGrid.mobileObjects.filter((obj: MobileObject) => obj.id !== objectId);
        
        const updatedGrid = {
          ...globalGrid,
          mobileObjects: updatedObjects
        };
        
        useGridStore.getState().updateGrid(globalGridId, updatedGrid);
      }
      
      set((state) => ({
        mobileObjects: state.mobileObjects.filter(obj => obj.id !== objectId),
        selectedEntityId: state.selectedEntityId === objectId ? null : state.selectedEntityId
      }));

      await firebaseService.removeGlobalMobileObject(objectId);
    } catch (error) {
      console.error('Error al eliminar objeto móvil global:', error);
      throw error;
    }
  },

  // Agregar una zona de efecto al mundo global
  addGlobalEffectZone: async (effectZone: EffectZone) => {
    try {
      const globalGridId = 'global-world';
      const globalGrid = useGridStore.getState().grids.get(globalGridId);
      
      if (globalGrid) {
        const updatedGrid = {
          ...globalGrid,
          effectZones: [...globalGrid.effectZones, effectZone]
        };
        
        useGridStore.getState().updateGrid(globalGridId, updatedGrid);
      }
      
      set((state) => ({
        effectZones: [...state.effectZones, effectZone]
      }));

      await firebaseService.addGlobalEffectZone(effectZone);
    } catch (error) {
      console.error('Error al agregar zona de efecto global:', error);
      throw error;
    }
  },

  // Actualizar una zona de efecto en el mundo global
  updateGlobalEffectZone: async (zoneId: string, updates: Partial<Omit<EffectZone, 'id'>>) => {
    try {
      console.log('🎛️ useWorldStore.updateGlobalEffectZone llamado', { zoneId, updates });
      
      // ACTUALIZACIÓN OPTIMISTA: Actualizar estado local INMEDIATAMENTE
      const globalGridId = 'global-world';
      const globalGrid = useGridStore.getState().grids.get(globalGridId);
      
      if (globalGrid) {
        const updatedZones = globalGrid.effectZones.map((zone: EffectZone) => 
          zone.id === zoneId ? { ...zone, ...updates, _pendingUpdate: true } : zone
        );
        
        const updatedGrid = {
          ...globalGrid,
          effectZones: updatedZones
        };
        
        useGridStore.getState().updateGrid(globalGridId, updatedGrid);
      }
      
      set((state) => ({
        effectZones: state.effectZones.map(zone => 
          zone.id === zoneId ? { ...zone, ...updates, _pendingUpdate: true } : zone
        )
      }));

      // Sincronizar con Firestore (sin esperar respuesta)
      console.log('🎛️ Sincronizando zona de efecto con Firestore (optimistic)');
      firebaseService.updateGlobalEffectZone(zoneId, updates)
        .then(() => {
          console.log('🎛️ Firestore confirmó el cambio de zona de efecto para:', zoneId);
          // Marcar como sincronizado
          const globalGridForConfirm = useGridStore.getState().grids.get(globalGridId);
          if (globalGridForConfirm) {
            const confirmedZones = globalGridForConfirm.effectZones.map((zone: EffectZone) => 
              zone.id === zoneId ? { ...zone, _pendingUpdate: false } : zone
            );
            
            const confirmedGrid = {
              ...globalGridForConfirm,
              effectZones: confirmedZones
            };
            
            useGridStore.getState().updateGrid(globalGridId, confirmedGrid);
          }
        })
        .catch((error) => {
          console.error('Error al sincronizar zona de efecto con Firestore:', error);
          // Revertir cambio si falla
          const globalGridForRevert = useGridStore.getState().grids.get(globalGridId);
          if (globalGridForRevert) {
            const originalZone = globalGridForRevert.effectZones.find((zone: EffectZone) => zone.id === zoneId);
            if (originalZone) {
              const revertedZones = globalGridForRevert.effectZones.map((zone: EffectZone) => 
                zone.id === zoneId ? { ...originalZone, _pendingUpdate: false } : zone
              );
              
              const revertedGrid = {
                ...globalGridForRevert,
                effectZones: revertedZones
              };
              
              useGridStore.getState().updateGrid(globalGridId, revertedGrid);
            }
          }
        });
    } catch (error) {
      console.error('Error al actualizar zona de efecto global:', error);
      throw error;
    }
  },

  // Eliminar una zona de efecto del mundo global
  removeGlobalEffectZone: async (zoneId: string) => {
    try {
      // Eliminar del EffectManager si es necesario
      try {
        // Usar el facade para eliminar la zona de efecto
        worldStoreFacade.removeEffectZone(zoneId, 'global-world');
      } catch (effectError) {
        console.warn('Error al eliminar zona de efecto del EffectManager:', effectError);
      }

      const globalGridId = 'global-world';
      const globalGrid = useGridStore.getState().grids.get(globalGridId);
      
      if (globalGrid) {
        const updatedZones = globalGrid.effectZones.filter((zone: EffectZone) => zone.id !== zoneId);
        
        const updatedGrid = {
          ...globalGrid,
          effectZones: updatedZones
        };
        
        useGridStore.getState().updateGrid(globalGridId, updatedGrid);
      }
      
      set((state) => ({
        effectZones: state.effectZones.filter(zone => zone.id !== zoneId),
        selectedEntityId: state.selectedEntityId === zoneId ? null : state.selectedEntityId
      }));

      await firebaseService.removeGlobalEffectZone(zoneId);
    } catch (error) {
      console.error('Error al eliminar zona de efecto global:', error);
      throw error;
    }
  },

  // Acción para controlar bloqueo de sincronización
  setSyncLock: (locked: boolean) => {
    console.log('🔒 Cambiando estado de bloqueo de sincronización:', locked);
    set({ isSyncLocked: locked });
  },

}));
