import { create } from 'zustand';
import { useGridStore } from '../stores/useGridStore';
import { useEffectStore } from '../stores/useEffectStore';
import { WorldStoreFacade } from './facades/WorldStoreFacade';
import { type AudioParams, audioManager } from '../lib/AudioManager';
import { firebaseService, type GlobalWorldDoc } from '../lib/firebaseService';
import { persistenceService } from '../lib/persistenceService';

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
  particleSystems: ParticleSystemObject[];
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

// Interfaz para el sistema de partículas (007 PARTICULAS)
export interface ParticleSystemObject {
  id: string;
  type: 'particleSystem';
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  isSelected: boolean;
  particleParams: {
    shape: 'star' | 'diamond' | 'heart' | 'note' | 'lightning' | 'moon' | 'sun' | 'vortex' | 'cube' | 'sphere' | 'saturn' | 'clump' | 'tornado'; // Mantener antiguos por compatibilidad
    color: string;
    count: number;
    height?: number;
    radius?: number;
    handInteractionEnabled: boolean;
    synthesisEnabled: boolean;
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
  particleSystems: ParticleSystemObject[]; // Array para sistemas de partículas
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
  showParticlePanel: boolean; // Visibilidad del panel de partículas
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

  // Acciones para sistemas de partículas
  addParticleSystem: (position: [number, number, number], params: Partial<ParticleSystemObject['particleParams']>) => void;
  updateParticleSystem: (id: string, updates: Partial<Omit<ParticleSystemObject, 'id'>>) => void;
  removeParticleSystem: (id: string) => void;
  setShowParticlePanel: (show: boolean) => void;
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
    particleSystems: [],
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

    // Configuración visual
    showGrid: true, // Por defecto visible
    showEffectZoneWireframe: true, // Por defecto visible
    showEffectZoneColor: true, // Por defecto visible
    showHiddenZones: false, // Por defecto ocultas

    // Sistema de bloqueo de edición con admin
    isEditingLocked: false, // Por defecto desbloqueado
    isAdminAuthenticated: false, // Por defecto no autenticado
    showParticlePanel: false, // Por defecto oculto

    // Helper para verificar si la edición está permitida (solo para proyectos guardados, no global)
    canEdit: () => {
      const state = get();
      // Si está conectado al mundo global, siempre permitir edición
      if (state.globalWorldConnected) {
        return true;
      }
      // Si hay un proyecto guardado y la edición está bloqueada, verificar autenticación
      if (state.currentProjectId && state.isEditingLocked) {
        return state.isAdminAuthenticated;
      }
      // Permitir edición en todos los demás casos
      return true;
    },

    // Acción para añadir un nuevo objeto - Delegada al WorldStoreFacade
    addObject: (type: SoundObjectType, position: [number, number, number]) => {
      const state = get();

      // Verificar si la edición está permitida
      if (!get().canEdit()) {
        // Traducción debe manejarse en el componente que llama a esta función
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
      // Si hay un currentProjectId, los cambios deben ser solo locales y sincronizarse con useRealtimeSync
      if (state.globalWorldConnected && !state.currentProjectId) {
        get().addGlobalSoundObject(newObject);
      } else {
        // Cambios locales (para proyectos guardados o modo local)
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

      // Verificar si la edición está permitida
      if (!get().canEdit()) {
        // Traducción debe manejarse en el componente que llama a esta función
        alert('La edición está bloqueada. Ingresa la contraseña de administrador para editar.');
        return;
      }

      // IMPORTANTE: Solo usar acciones globales si estamos en el mundo global Y NO hay un proyecto cargado
      if (state.globalWorldConnected && !state.currentProjectId) {
        get().removeGlobalSoundObject(id);
      } else {
        // Cambios locales (para proyectos guardados o modo local)
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
            particleSystems: grid.particleSystems?.map((ps) => ({
              ...ps,
              isSelected: ps.id === id,
            })) || [],
          });
        });

        return {
          grids: newGrids,
          selectedEntityId: id,
          // Siempre resetear a 'translate' cuando se selecciona una entidad para que aparezca el gizmo de mover por defecto
          transformMode: 'translate',
        };
      });
    },

    // Acción para actualizar un objeto - Delegada al WorldStoreFacade
    updateObject: (id: string, updates: Partial<Omit<SoundObject, 'id'>>) => {
      const state = get();

      // Verificar si la edición está permitida
      if (!get().canEdit()) {
        // Traducción debe manejarse en el componente que llama a esta función
        alert('La edición está bloqueada. Ingresa la contraseña de administrador para editar.');
        return;
      }

      // IMPORTANTE: Solo usar acciones globales si estamos en el mundo global Y NO hay un proyecto cargado
      if (state.globalWorldConnected && !state.currentProjectId) {
        get().updateGlobalSoundObject(id, updates);
      } else {
        // Cambios locales (para proyectos guardados o modo local)
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

              // Si hay un proyecto cargado, sincronizar cambios con Firebase
              if (state.currentProjectId) {
                persistenceService.syncProjectChanges(state.currentProjectId);
              }

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
      // Verificar si la edición está permitida
      if (!get().canEdit()) {
        // Traducción debe manejarse en el componente que llama a esta función
        alert('La edición está bloqueada. Ingresa la contraseña de administrador para editar.');
        return;
      }

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
            effectZones: [],
            particleSystems: []
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

      // Verificar si la edición está permitida
      if (!get().canEdit()) {
        // Traducción debe manejarse en el componente que llama a esta función
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
        // Cambios locales (para proyectos guardados o modo local)
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

      // Verificar si la edición está permitida
      if (!get().canEdit()) {
        // Traducción debe manejarse en el componente que llama a esta función
        alert('La edición está bloqueada. Ingresa la contraseña de administrador para editar.');
        return;
      }

      // IMPORTANTE: Solo usar acciones globales si estamos en el mundo global Y NO hay un proyecto cargado
      if (state.globalWorldConnected && !state.currentProjectId) {
        get().updateGlobalEffectZone(id, updates);
      } else {
        // Cambios locales (para proyectos guardados o modo local)
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

              // Si hay un proyecto cargado, sincronizar cambios con Firebase
              if (state.currentProjectId) {
                persistenceService.syncProjectChanges(state.currentProjectId);
              }

              break;
            }
          }

          return { grids: newGrids };
        });
      }
    },

    removeEffectZone: (id: string) => {
      const state = get();

      // Verificar si la edición está permitida
      if (!get().canEdit()) {
        // Traducción debe manejarse en el componente que llama a esta función
        alert('La edición está bloqueada. Ingresa la contraseña de administrador para editar.');
        return;
      }

      // IMPORTANTE: Solo usar acciones globales si estamos en el mundo global Y NO hay un proyecto cargado
      if (state.globalWorldConnected && !state.currentProjectId) {
        get().removeGlobalEffectZone(id);
      } else {
        // Cambios locales (para proyectos guardados o modo local)
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

    // Implementación de acciones para sistemas de partículas
    addParticleSystem: (position: [number, number, number], params: Partial<ParticleSystemObject['particleParams']>) => {
      const state = get();

      if (!state.activeGridId) return;

      const activeGrid = state.grids.get(state.activeGridId);
      if (!activeGrid) return;

      // Generar ID único usando crypto.randomUUID (si está disponible) o timestamp
      const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `ps-${Date.now()}`;

      const newParticleSystem: ParticleSystemObject = {
        id,
        type: 'particleSystem',
        position,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        isSelected: true, // Seleccionar automáticamente al crear
        particleParams: {
          shape: params.shape || 'vortex',
          color: params.color || '#ffffff',
          count: params.count || 1000,
          height: params.height || 5,
          radius: params.radius || 2,
          handInteractionEnabled: params.handInteractionEnabled ?? true,
          synthesisEnabled: params.synthesisEnabled ?? true,
        }
      };

      // Deseleccionar otros objetos primero
      state.selectEntity(id);

      set((state) => {
        const newGrids = new Map(state.grids);
        const grid = newGrids.get(state.activeGridId!); // ! es seguro por el check anterior

        if (grid) {
          const updatedParticleSystems = [...(grid.particleSystems || []), newParticleSystem];
          newGrids.set(state.activeGridId!, {
            ...grid,
            particleSystems: updatedParticleSystems
          });
          // Sincronizar con useGridStore
          useGridStore.setState({ grids: newGrids });
        }
        return { grids: newGrids };
      });
    },

    updateParticleSystem: (id: string, updates: Partial<Omit<ParticleSystemObject, 'id'>>) => {
      set((state) => {
        const newGrids = new Map(state.grids);

        // Buscar en todas las cuadrículas
        for (const [gridId, grid] of newGrids) {
          const index = (grid.particleSystems || []).findIndex(ps => ps.id === id);
          if (index !== -1) {
            const updatedParticleSystems = [...(grid.particleSystems || [])];
            updatedParticleSystems[index] = { ...updatedParticleSystems[index], ...updates };

            newGrids.set(gridId, {
              ...grid,
              particleSystems: updatedParticleSystems
            });
            break;
          }
        }
        return { grids: newGrids };
      });
    },

    removeParticleSystem: (id: string) => {
      set((state) => {
        const newGrids = new Map(state.grids);

        for (const [gridId, grid] of newGrids) {
          const index = (grid.particleSystems || []).findIndex(ps => ps.id === id);
          if (index !== -1) {
            const updatedParticleSystems = (grid.particleSystems || []).filter(ps => ps.id !== id);
            newGrids.set(gridId, {
              ...grid,
              particleSystems: updatedParticleSystems
            });
            break;
          }
        }
        return {
          grids: newGrids,
          selectedEntityId: state.selectedEntityId === id ? null : state.selectedEntityId
        };
      });
    },

    setShowParticlePanel: (show: boolean) => {
      set({ showParticlePanel: show });
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

    // Acción para mostrar/ocultar la cuadrícula
    setShowGrid: (show: boolean) => {
      set({ showGrid: show });
    },

    // Acción para mostrar/ocultar wireframe de zonas de efectos
    setShowEffectZoneWireframe: (show: boolean) => {
      set({ showEffectZoneWireframe: show });
    },

    // Acción para mostrar/ocultar color de zonas de efectos
    setShowEffectZoneColor: (show: boolean) => {
      set({ showEffectZoneColor: show });
    },

    // Acción para mostrar/ocultar zonas ocultas
    setShowHiddenZones: (show: boolean) => {
      set({ showHiddenZones: show });
    },

    // Acción para bloquear la edición
    lockEditing: () => {
      set({ isEditingLocked: true, isAdminAuthenticated: false });
    },

    // Acción para desbloquear la edición con contraseña
    unlockEditing: (password: string) => {
      const ADMIN_PASSWORD = '%3D27eaf[}V]3]';
      if (password === ADMIN_PASSWORD) {
        set({ isEditingLocked: false, isAdminAuthenticated: true });
        return true;
      }
      return false;
    },

    // Acción para autenticar como admin con contraseña
    authenticateAdmin: (password: string) => {
      const ADMIN_PASSWORD = '%3D27eaf[}V]3]';
      if (password === ADMIN_PASSWORD) {
        set({ isAdminAuthenticated: true });
        return true;
      }
      return false;
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
        // Traducción debe manejarse en el componente que llama a esta función
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
        // Cambios locales (para proyectos guardados o modo local)
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

      // Verificar si la edición está permitida
      if (!get().canEdit()) {
        // Traducción debe manejarse en el componente que llama a esta función
        alert('La edición está bloqueada. Ingresa la contraseña de administrador para editar.');
        return;
      }

      console.log('🔄 updateMobileObject called', { id, updates, hasMobileParams: !!updates.mobileParams, movementType: updates.mobileParams?.movementType });

      // IMPORTANTE: Solo usar acciones globales si estamos en el mundo global Y NO hay un proyecto cargado
      if (state.globalWorldConnected && !state.currentProjectId) {
        get().updateGlobalMobileObject(id, updates);
      } else {
        // Cambios locales (para proyectos guardados o modo local)
        set((state) => {
          const newGrids = new Map(state.grids);

          // Buscar el objeto móvil en todas las cuadrículas y actualizarlo
          for (const [gId, grid] of newGrids) {
            const objectIndex = grid.mobileObjects.findIndex(obj => obj.id === id);
            if (objectIndex !== -1) {
              // Actualizar objeto móvil usando el facade
              worldStoreFacade.updateMobileObject(id, updates, newGrids);

              const updatedObjects = [...grid.mobileObjects];
              const currentObject = updatedObjects[objectIndex];

              // Si hay mobileParams, hacer merge profundo para mantener todos los parámetros
              if (updates.mobileParams && currentObject.mobileParams) {
                const mergedParams = {
                  ...currentObject.mobileParams,
                  ...updates.mobileParams,
                };
                console.log('✅ Merging mobileParams', {
                  currentMovementType: currentObject.mobileParams.movementType,
                  newMovementType: updates.mobileParams.movementType,
                  mergedMovementType: mergedParams.movementType
                });
                updatedObjects[objectIndex] = {
                  ...currentObject,
                  ...updates,
                  mobileParams: mergedParams,
                };
              } else {
                updatedObjects[objectIndex] = { ...currentObject, ...updates };
              }

              newGrids.set(gId, {
                ...grid,
                mobileObjects: updatedObjects
              });

              // Sincronizar con useGridStore
              useGridStore.setState({ grids: newGrids });

              // Si hay un proyecto cargado, sincronizar cambios con Firebase
              if (state.currentProjectId) {
                persistenceService.syncProjectChanges(state.currentProjectId);
              }

              break;
            }
          }

          return { grids: newGrids };
        });
      }
    },

    removeMobileObject: (id: string) => {
      const state = get();

      // Verificar si la edición está permitida
      if (!get().canEdit()) {
        // Traducción debe manejarse en el componente que llama a esta función
        alert('La edición está bloqueada. Ingresa la contraseña de administrador para editar.');
        return;
      }

      // IMPORTANTE: Solo usar acciones globales si estamos en el mundo global Y NO hay un proyecto cargado
      if (state.globalWorldConnected && !state.currentProjectId) {
        get().removeGlobalMobileObject(id);
      } else {
        // Cambios locales (para proyectos guardados o modo local)
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

      // IMPORTANTE: Solo usar acciones globales si estamos en el mundo global Y NO hay un proyecto cargado
      if (state.globalWorldConnected && !state.currentProjectId) {
        get().updateGlobalMobileObject(id, { position });
      } else {
        // Cambios locales (para proyectos guardados o modo local)
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
      // Verificar si la edición está permitida
      if (!get().canEdit()) {
        // Traducción debe manejarse en el componente que llama a esta función
        alert('La edición está bloqueada. Ingresa la contraseña de administrador para editar.');
        return;
      }

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

      // Log silenciado - sincronización activada (muy frecuente)

      // Inicializar audio para objetos que se reciben desde Firestore
      setTimeout(() => {
        // Log silenciado - inicialización de audio (muy frecuente)

        // Obtener las cuadrículas actualizadas del estado
        const currentState = useWorldStore.getState();

        // Iterar sobre todas las cuadrículas y sus objetos
        currentState.grids.forEach((grid) => {
          grid.objects.forEach(object => {
            try {
              // Log silenciado - inicialización individual de audio

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
                    // Log silenciado - inicio de audio continuo
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
          // Los objetos móviles no requieren inicialización de audio
          // Log silenciado - no hay necesidad de loggear cada objeto móvil procesado
        });

        // Log silenciado - audio inicializado
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

    /**
     * Establece el estado de conexión al mundo global
     */
    setGlobalWorldConnected: (connected: boolean) => {
      set({ globalWorldConnected: connected });
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
        globalWorldConnected: state.globalWorldConnected,
        hasAudioParams: !!updates.audioParams
      });

      // IMPORTANTE: Si viene de Firestore pero hay cambios en audioParams,
      // necesitamos actualizar el AudioManager aunque NO actualicemos el estado local
      // (porque setGlobalStateFromFirestore ya actualizó el estado)
      // Solo skip si viene de Firestore Y NO hay audioParams para actualizar
      const isFromFirestore = state.isUpdatingFromFirestore;
      const hasAudioParamsUpdate = !!updates.audioParams;

      if (isFromFirestore && !hasAudioParamsUpdate) {
        console.log('ℹ️ Ignorando updateGlobalSoundObject - update viene de Firestore y no hay audioParams');
        return;
      }

      // Si viene de Firestore pero hay audioParams, continuar para actualizar el AudioManager
      if (isFromFirestore && hasAudioParamsUpdate) {
        console.log('🎵 Update viene de Firestore con audioParams - actualizando AudioManager pero no estado local');
      }

      // Throttle para prevenir actualizaciones excesivas (solo si NO viene de Firestore con audioParams)
      // Si viene de Firestore con audioParams, necesitamos actualizar el AudioManager sin throttling
      if (!isFromFirestore || !hasAudioParamsUpdate) {
        const now = Date.now();
        const lastUpdateTime = lastUpdateTimes.get(objectId) || 0;
        if (now - lastUpdateTime < UPDATE_THROTTLE) {
          console.log('⏸️ updateGlobalSoundObject throttled - demasiado frecuente');
          return;
        }
        lastUpdateTimes.set(objectId, now);
      }

      let updatedObject: SoundObject | null = null;
      let gridId: string | null = null;

      // Si viene de Firestore, obtener el objeto del estado actual (ya actualizado por setGlobalStateFromFirestore)
      // Si NO viene de Firestore, actualizar el estado local
      if (isFromFirestore && hasAudioParamsUpdate) {
        // Obtener el objeto actualizado del estado (ya fue actualizado por setGlobalStateFromFirestore)
        for (const [gId, grid] of state.grids) {
          const object = grid.objects.find(obj => obj.id === objectId);
          if (object) {
            updatedObject = object;
            gridId = gId;
            console.log('📡 Obteniendo objeto desde estado (ya actualizado por Firestore)', { objectId, gridId });
            break;
          }
        }
      } else {
        // Actualizar el estado local inmediatamente
        const newGrids = new Map(state.grids);

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
      }

      // SIEMPRE actualizar el objeto de audio, tanto si viene de Firestore como si es local
      if (updatedObject && gridId) {
        console.log('🔧 useWorldStore: Updating audio directly', { objectId, gridId, isFromFirestore: state.isUpdatingFromFirestore });

        // Actualizar audio directamente sin pasar por useObjectStore
        // para evitar problemas de sincronización entre stores
        if (updates.position) {
          console.log('🔧 useWorldStore: Updating position', updatedObject.position);
          audioManager.updateSoundPosition(objectId, updatedObject.position);
        }
        if (updates.audioParams || (isFromFirestore && hasAudioParamsUpdate)) {
          // Si viene de Firestore, usar los audioParams completos del objeto actualizado
          // (que ya incluye todos los parámetros actualizados desde Firestore)
          // Si es una actualización local, usar los audioParams del objeto actualizado también
          const audioParamsToUpdate = updatedObject.audioParams;
          console.log('🔧 useWorldStore: Updating audio params', {
            audioParams: audioParamsToUpdate,
            source: isFromFirestore ? 'Firestore' : 'Local',
            objectId
          });
          audioManager.updateSoundParams(objectId, audioParamsToUpdate);
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

      // SIEMPRE actualizar el efecto de audio, tanto si viene de Firestore como si es local
      if (updatedZone && gridId) {
        // Actualizar audio directamente sin pasar por worldStoreFacade para movimiento fluido
        // para evitar problemas de sincronización entre stores
        if (updates.position) {
          audioManager.updateEffectZonePosition(zoneId, updatedZone.position);
        }

        // Solo llamar a worldStoreFacade.updateEffectZone si NO viene de Firestore
        // para evitar bucles de sincronización
        if (!state.isUpdatingFromFirestore) {
          worldStoreFacade.updateEffectZone(zoneId, updates, gridId);
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
          const currentObject = updatedObjects[objectIndex];

          // Si hay mobileParams, hacer merge profundo para mantener todos los parámetros
          if (updates.mobileParams && currentObject.mobileParams) {
            const mergedParams = {
              ...currentObject.mobileParams,
              ...updates.mobileParams,
            };
            console.log('✅ Global: Merging mobileParams', {
              currentMovementType: currentObject.mobileParams.movementType,
              newMovementType: updates.mobileParams.movementType,
              mergedMovementType: mergedParams.movementType
            });
            updatedObjects[objectIndex] = {
              ...currentObject,
              ...updates,
              mobileParams: mergedParams,
            };
          } else {
            updatedObjects[objectIndex] = { ...currentObject, ...updates };
          }

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

