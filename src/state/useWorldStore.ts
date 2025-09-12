import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { audioManager, type AudioParams } from '../lib/AudioManager';

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
    showRadiusIndicator: boolean;
    showProximityIndicator: boolean;
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
    delayTime?: number;
    chorusDepth?: number;
    feedback?: number;
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
  
  // Estado de objetos (de la cuadrícula actual)
  objects: SoundObject[];
  mobileObjects: MobileObject[]; // Array para objetos móviles
  effectZones: EffectZone[]; // Nuevo array para zonas de efectos
  selectedEntityId: string | null; // Renombrado de selectedObjectId para ser más genérico
  transformMode: 'translate' | 'rotate' | 'scale';
  isEditingEffectZone: boolean; // Nuevo estado para indicar cuando se está editando una zona de efectos
}

// Acciones disponibles en el store
export interface WorldActions {
  // Acciones para cuadrículas
  moveToGrid: (coordinates: [number, number, number]) => void;
  loadGrid: (coordinates: [number, number, number]) => void;
  unloadGrid: (coordinates: [number, number, number]) => void;
  getGridKey: (coordinates: [number, number, number]) => string;
  getAdjacentGrids: () => Array<[number, number, number]>;
  
  // Acciones para manipulación de cuadrículas
  createGrid: (position: [number, number, number], size?: number) => void;
  selectGrid: (gridId: string | null) => void;
  setActiveGrid: (gridId: string | null) => void;
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

// Parámetros por defecto para cada tipo de objeto
const getDefaultAudioParams = (type: SoundObjectType): AudioParams => {
  switch (type) {
    case 'cube':
      return {
        frequency: 220,
        volume: 0.6, // Volumen aumentado para mejor audibilidad
        waveform: 'sine', // Forma de onda de la portadora
        harmonicity: 1.5,
        modulationWaveform: 'square', // Forma de onda de la moduladora
        duration: 2.0, // Duración de 2 segundos para sonidos continuos
      };
    case 'sphere':
      return {
        frequency: 300,
        volume: 0.6, // Volumen aumentado para mejor audibilidad
        waveform: 'sine',
        modulationWaveform: 'sine',
        harmonicity: 2, // Ratio de octava
        modulationIndex: 10, // Valor alto para un timbre rico y metálico
        duration: 1.5, // Duración de 1.5 segundos
      };
    case 'cylinder':
      return {
        frequency: 220,
        volume: 0.6, // Volumen aumentado para mejor audibilidad
        waveform: 'triangle',
        waveform2: 'sine', // La segunda voz puede ser diferente
        harmonicity: 1.5,
        vibratoAmount: 0.2,
        vibratoRate: 5,
        duration: 3.0, // Duración de 3 segundos para efectos de vibrato
      };
    case 'cone':
      return {
        frequency: 50, // Frecuencia baja para un bombo
        volume: 0.6,   // Volumen aumentado para mejor audibilidad
        waveform: 'sine',
        pitchDecay: 0.05,
        octaves: 10,
        duration: 0.5, // Duración corta para sonidos percusivos
      };
    case 'pyramid':
      return {
        frequency: 110,
        volume: 0.9,
        waveform: 'sawtooth',
        // Envolvente de Amplitud (corta y percusiva)
        ampAttack: 0.01,
        ampDecay: 0.2,
        ampSustain: 0.1,
        ampRelease: 0.5,
        // Envolvente de Filtro (un "pluck" rápido)
        filterAttack: 0.005,
        filterDecay: 0.1,
        filterSustain: 0.05,
        filterRelease: 0.2,
        filterBaseFreq: 200,
        filterOctaves: 4,
        filterQ: 2,
      };
    case 'icosahedron':
      return {
        frequency: 200,
        volume: 0.8,
        waveform: 'sine',
        harmonicity: 5.1,
        modulationIndex: 32,
        resonance: 4000,
        octaves: 1.5,
        duration: 0.5, // Duración corta para sonidos percusivos metálicos
      };
    case 'plane':
      return {
        frequency: 0, // NoiseSynth no usa frecuencia
        volume: 0.7,
        waveform: 'sine', // No se usa en NoiseSynth pero es requerido por AudioParams
        noiseType: 'white',
        attack: 0.001,
        decay: 0.1,
        sustain: 0,
        duration: 0.1, // Duración del golpe
      };
    case 'torus':
      return {
        frequency: 440,
        volume: 0.9,
        waveform: 'sine', // No se usa en PluckSynth pero es requerido por AudioParams
        attackNoise: 1,
        dampening: 4000,
        resonance: 0.9,
      };
    case 'dodecahedronRing':
      return {
        frequency: 220, // Frecuencia base A3 para transponer acordes
        volume: 0.7,
        waveform: 'sine',
        polyphony: 4,
        chord: ["C4", "E4", "G4", "B4"], // Un acorde de Cmaj7
        attack: 1.5, // Ataque lento
        release: 2.0, // Liberación larga
        // Parámetros para las voces de FMSynth
        harmonicity: 1,
        modulationIndex: 2,
        modulationWaveform: 'triangle',
      };
    case 'spiral':
      return {
        volume: 0.9,
        attack: 0.1,
        release: 1.0,
        curve: 'exponential',
        notes: ["C4", "E4", "G4"], // Toca un acorde de C Mayor por defecto
        duration: 1,
        // Mapeo de samples
        urls: {
          C4: "C4.mp3",
          "D#4": "Ds4.mp3",
          "F#4": "Fs4.mp3",
          A4: "A4.mp3",
        },
        baseUrl: "/samples/piano/", // La ruta a nuestra carpeta de samples
        // Campos requeridos por AudioParams
        frequency: 0, // No se usa en Sampler
        waveform: 'sine', // No se usa en Sampler
      };
    default:
      return {
        frequency: 330,
        waveform: 'sine',
        volume: 0.6, // Volumen aumentado para mejor audibilidad
      };
  }
};

// Creación del store de Zustand
export const useWorldStore = create<WorldState & WorldActions>((set, get) => ({
  // Estado inicial
  grids: new Map([
    ['0,0,0', {
      id: '0,0,0',
      coordinates: [0, 0, 0],
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      objects: [],
      mobileObjects: [],
      effectZones: [],
      gridSize: 20,
      gridColor: '#404040',
      isLoaded: true,
      isSelected: false
    }]
  ]),
  currentGridCoordinates: [0, 0, 0],
  activeGridId: '0,0,0', // Cuadrícula principal por defecto
  gridSize: 20,
  renderDistance: 2, // Cargar 2 cuadrículas en cada dirección
  objects: [],
  mobileObjects: [],
  effectZones: [],
  selectedEntityId: null,
  transformMode: 'translate',
  isEditingEffectZone: false,

  // Acción para añadir un nuevo objeto
  addObject: (type: SoundObjectType, position: [number, number, number]) => {
    const state = get();
    const activeGridId = state.activeGridId;
    
    console.log(`🎯 addObject llamado - Cuadrícula activa: ${activeGridId}`);
    console.log(`🎯 Cuadrículas disponibles:`, Array.from(state.grids.keys()));
    
    if (!activeGridId) {
      console.warn('No hay cuadrícula activa para crear objetos');
      return;
    }

    const newObject: SoundObject = {
      id: uuidv4(),
      type,
      position,
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      audioParams: getDefaultAudioParams(type),
      isSelected: false,
      audioEnabled: false,
    };

    console.log(`➕ Creando objeto ${type} con parámetros:`, newObject.audioParams);
    console.log(`➕ Llamando a audioManager.createSoundSource para ${type}`);

    // Agregar objeto a la cuadrícula activa
    const activeGrid = state.grids.get(activeGridId);
    if (activeGrid) {
      console.log(`🎯 Cuadrícula activa encontrada:`, activeGrid);
      const updatedGrid = {
        ...activeGrid,
        objects: [...activeGrid.objects, newObject]
      };
      
      set((state) => ({
        grids: new Map(state.grids.set(activeGridId, updatedGrid)),
      }));

      // Crear la fuente de sonido en el AudioManager
      try {
        audioManager.createSoundSource(
          newObject.id,
          newObject.type,
          newObject.audioParams,
          newObject.position
        );
        console.log(`✅ createSoundSource completado para ${type}`);
      } catch (error) {
        console.error(`❌ Error en createSoundSource para ${type}:`, error);
      }

      console.log(`🎵 Añadiendo objeto ${type} en posición ${position} a la cuadrícula ${activeGridId}`);
    } else {
      console.error(`❌ Cuadrícula activa ${activeGridId} no encontrada en el mapa de cuadrículas`);
    }
  },

  // Acción para eliminar un objeto
  removeObject: (id: string) => {
    // Eliminar la fuente de sonido del AudioManager antes de eliminar el objeto
    audioManager.removeSoundSource(id);

    set((state) => {
      const newGrids = new Map(state.grids);
      
      // Buscar y eliminar el objeto de todas las cuadrículas
      for (const [gridId, grid] of newGrids) {
        const objectIndex = grid.objects.findIndex(obj => obj.id === id);
        if (objectIndex !== -1) {
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

  // Acción para seleccionar una entidad (objeto sonoro o zona de efecto)
  selectEntity: (id: string | null) => {
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
      // Resetear el modo de transformación si no hay entidad seleccionada
      transformMode: id === null ? 'translate' : state.transformMode,
      };
    });
  },

  // Acción para actualizar un objeto
  updateObject: (id: string, updates: Partial<Omit<SoundObject, 'id'>>) => {
    console.log(`🔄 Store: Actualizando objeto ${id} con:`, updates);
    
    // Buscar el objeto en todas las cuadrículas y actualizarlo
    set((state) => {
      const newGrids = new Map(state.grids);
      let updatedObject: SoundObject | null = null;
      
      // Buscar el objeto en todas las cuadrículas
      for (const [gridId, grid] of newGrids) {
        const objectIndex = grid.objects.findIndex(obj => obj.id === id);
        if (objectIndex !== -1) {
          const updatedObjects = [...grid.objects];
          updatedObjects[objectIndex] = { ...updatedObjects[objectIndex], ...updates };
          updatedObject = updatedObjects[objectIndex];
          
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

    // Obtener el objeto actualizado para comunicar cambios al AudioManager
    const state = get();
    let updatedObject: SoundObject | null = null;
    
    for (const grid of state.grids.values()) {
      const obj = grid.objects.find(obj => obj.id === id);
      if (obj) {
        updatedObject = obj;
        break;
      }
    }

    if (updatedObject) {
      // Ahora, comunica los cambios al AudioManager con el estado más reciente
      if (updates.position) {
        console.log(`📍 Store: Actualizando posición para ${id}`);
        audioManager.updateSoundPosition(id, updatedObject.position);
      }
      // Se comprueba si 'audioParams' está en el objeto 'updates' original
      // para no enviar actualizaciones innecesarias.
      if (updates.audioParams) {
        console.log(`🎵 Store: Actualizando parámetros de audio para ${id}:`, updatedObject.audioParams);
        audioManager.updateSoundParams(id, updatedObject.audioParams);
      }
    }
  },

  // Acción para activar/desactivar el audio de un objeto
  toggleObjectAudio: (id: string, forceState?: boolean) => {
    console.log(`🎵 toggleObjectAudio llamado para ${id} con forceState:`, forceState);
    
    // Buscar el objeto en todas las cuadrículas
    const state = get();
    let currentObject: SoundObject | null = null;
    let gridId: string | null = null;
    
    for (const [gId, grid] of state.grids) {
      const obj = grid.objects.find(obj => obj.id === id);
      if (obj) {
        currentObject = obj;
        gridId = gId;
        break;
      }
    }
    
    if (!currentObject || !gridId) {
        console.log(`🎵 Objeto ${id} no encontrado`);
      return;
      }
      
      // Ignorar los tipos percusivos ya que no necesitan toggle de audio
      if (currentObject.type === 'plane' || currentObject.type === 'torus') {
        console.log(`🎵 Objeto ${id} es de tipo '${currentObject.type}', ignorando toggleObjectAudio`);
      return;
      }
      
      // Para dodecahedronRing, usar startSound/stopSound como sonido continuo
      if (currentObject.type === 'dodecahedronRing') {
        console.log(`🔷 Objeto ${id} es de tipo 'dodecahedronRing', usando startSound/stopSound`);
      }
      
      // Determinar el nuevo estado: si forceState está definido, usarlo; si no, hacer toggle
      const newAudioEnabled = forceState !== undefined ? forceState : !currentObject.audioEnabled;
      
    // Actualizar el objeto en la cuadrícula correspondiente
    set((state) => {
      const newGrids = new Map(state.grids);
      const grid = newGrids.get(gridId!);
      if (grid) {
        const updatedObjects = grid.objects.map((obj) =>
        obj.id === id ? { ...obj, audioEnabled: newAudioEnabled } : obj
      );
      
        newGrids.set(gridId!, {
          ...grid,
          objects: updatedObjects
        });
      }
      
      return { grids: newGrids };
    });
      
      // Controlar el audio en el AudioManager
    if (newAudioEnabled) {
          console.log(`🎵 Activando audio para ${id}`);
          // Para todos los tipos, usar startContinuousSound para sonido continuo
      audioManager.startContinuousSound(id, currentObject.audioParams);
        } else {
          console.log(`🎵 Desactivando audio para ${id}`);
          // Detener el sonido si está sonando
          audioManager.stopSound(id);
        }
  },

  // Acción para disparar una nota percusiva
  triggerObjectNote: (id: string) => {
    const state = get();
    let object: SoundObject | null = null;
    
    // Buscar el objeto en todas las cuadrículas
    for (const grid of state.grids.values()) {
      const obj = grid.objects.find(obj => obj.id === id);
      if (obj) {
        object = obj;
        break;
      }
    }
    
    if (object) {
      // Si el objeto tiene sonido continuo activo, no disparar notas adicionales
      if (object.audioEnabled) {
        console.log(`🥁 Objeto ${id} tiene sonido continuo activo, ignorando nota percusiva`);
        return;
      }
      
      console.log(`🥁 Disparando nota percusiva para ${id}`);
      audioManager.triggerNoteAttack(id, object.audioParams);
    }
  },

  // Acción para disparar un objeto percusivo (especialmente para 'plane')
  triggerObjectPercussion: (id: string) => {
    const state = get();
    let object: SoundObject | null = null;
    
    // Buscar el objeto en todas las cuadrículas
    for (const grid of state.grids.values()) {
      const obj = grid.objects.find(obj => obj.id === id);
      if (obj) {
        object = obj;
        break;
      }
    }
    
    if (object) {
      // Si el objeto tiene sonido continuo activo, no disparar notas adicionales
      if (object.audioEnabled) {
        console.log(`🥁 Objeto ${id} tiene sonido continuo activo, ignorando objeto percusivo`);
        return;
      }
      
      console.log(`🥁 Disparando objeto percusivo para ${id}`);
      if (object.type === 'plane') {
        // Para objetos 'plane', usar triggerNoiseAttack
        audioManager.triggerNoiseAttack(id, object.audioParams);
      } else {
        // Para otros objetos percusivos, usar triggerNoteAttack
        audioManager.triggerNoteAttack(id, object.audioParams);
      }
    }
  },

  // Acción para disparar una nota con duración específica (clic corto)
  triggerObjectAttackRelease: (id: string) => {
    const state = get();
    let object: SoundObject | null = null;
    
    // Buscar el objeto en todas las cuadrículas
    for (const grid of state.grids.values()) {
      const obj = grid.objects.find(obj => obj.id === id);
      if (obj) {
        object = obj;
        break;
      }
    }
    
    if (object) {
      // Si el objeto tiene sonido continuo activo, no disparar notas adicionales
      if (object.audioEnabled) {
        console.log(`🎵 Objeto ${id} tiene sonido continuo activo, ignorando clic`);
        return;
      }
      
      console.log(`🎵 Disparando nota con duración para ${id}`);
      audioManager.triggerAttackRelease(id, object.audioParams);
    }
  },

  // Acción para iniciar el gate (clic sostenido)
  startObjectGate: (id: string) => {
    const state = get();
    let object: SoundObject | null = null;
    
    // Buscar el objeto en todas las cuadrículas
    for (const grid of state.grids.values()) {
      const obj = grid.objects.find(obj => obj.id === id);
      if (obj) {
        object = obj;
        break;
      }
    }
    
    if (object) {
      console.log(`🎵 Iniciando gate para ${id}`);
      // Solo iniciar gate si no está en modo de sonido continuo
      if (!object.audioEnabled) {
        audioManager.startSound(id, object.audioParams);
      } else {
        console.log(`🎵 Objeto ${id} tiene sonido continuo activo, ignorando gate`);
      }
    }
  },

  // Acción para detener el gate (liberar clic)
  stopObjectGate: (id: string) => {
    const state = get();
    let object: SoundObject | null = null;
    
    // Buscar el objeto en todas las cuadrículas
    for (const grid of state.grids.values()) {
      const obj = grid.objects.find(obj => obj.id === id);
      if (obj) {
        object = obj;
        break;
      }
    }
    
    if (object) {
      console.log(`🎵 Deteniendo gate para ${id}`);
      // Solo detener gate si no está en modo de sonido continuo
      if (!object.audioEnabled) {
        audioManager.stopSound(id);
      } else {
        console.log(`🎵 Objeto ${id} tiene sonido continuo activo, ignorando stop gate`);
      }
    }
  },

  // Acción para limpiar todos los objetos
  clearAllObjects: () => {
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

  // Acción para establecer el modo de transformación
  setTransformMode: (mode: 'translate' | 'rotate' | 'scale') => {
    set({ transformMode: mode });
  },

  // Nuevas acciones para zonas de efectos
  addEffectZone: (type: 'phaser' | 'autoFilter' | 'autoWah' | 'bitCrusher' | 'chebyshev' | 'chorus' | 'distortion' | 'feedbackDelay' | 'freeverb' | 'frequencyShifter' | 'jcReverb' | 'pingPongDelay' | 'pitchShift', position: [number, number, number], shape: 'sphere' | 'cube' = 'sphere') => {
    // Configurar parámetros por defecto según el tipo de efecto
    let defaultParams: any = {};
    
    if (type === 'phaser') {
      defaultParams = {
        frequency: 1000,
        octaves: 2,
        stages: 2,
        Q: 10,
      };
    } else if (type === 'autoFilter') {
      defaultParams = {
        frequency: 1,
        octaves: 2,
        baseFrequency: 200,
        depth: 0.5,
        filterType: 'lowpass',
        filterQ: 1,
        lfoType: 'sine',
      };
    } else if (type === 'autoWah') {
      defaultParams = {
        frequency: 1,
        octaves: 2,
        baseFrequency: 200,
        sensitivity: 0.5,
        rolloff: -12,
        attack: 0.1,
        release: 0.1,
      };
    } else if (type === 'bitCrusher') {
      defaultParams = {
        frequency: 1,
        octaves: 2,
        baseFrequency: 200,
        bits: 4,
        normFreq: 0.5,
      };
    } else if (type === 'chebyshev') {
      defaultParams = {
        frequency: 1,
        octaves: 2,
        baseFrequency: 200,
        order: 50,
        oversample: 'none',
      };
    } else if (type === 'chorus') {
      defaultParams = {
        frequency: 1,
        octaves: 2,
        baseFrequency: 200,
        chorusFrequency: 1.5,
        delayTime: 3.5,
        chorusDepth: 0.7,
        feedback: 0,
        spread: 180,
        chorusType: 'sine',
      };
    } else if (type === 'distortion') {
      defaultParams = {
        frequency: 1,
        octaves: 2,
        baseFrequency: 200,
        distortion: 0.4,
        oversample: 'none',
      };
    } else if (type === 'feedbackDelay') {
      defaultParams = {
        delayTime: '8n',
        feedback: 0.5,
      };
    } else if (type === 'freeverb') {
      defaultParams = {
        roomSize: 0.7,
        dampening: 3000,
      };
    } else if (type === 'frequencyShifter') {
      defaultParams = {
        frequency: 0,
      };
    } else if (type === 'jcReverb') {
      defaultParams = {
        roomSize: 0.5,
      };
    } else if (type === 'pingPongDelay') {
      defaultParams = {
        pingPongDelayTime: '4n',
        pingPongFeedback: 0.2,
        maxDelay: 1.0,
        wet: 0.5,
      };
    } else if (type === 'pitchShift') {
      defaultParams = {
        pitchShift: 0,
        windowSize: 0.1,
        delayTime: 0,
        feedback: 0,
      };
    } else if (type === 'reverb') {
      defaultParams = {
        decay: 1.5,
        preDelay: 0.01,
        wet: 0.5,
      };
    } else if (type === 'stereoWidener') {
      defaultParams = {
        width: 0.5,
        wet: 0.5,
      };
    } else if (type === 'tremolo') {
      defaultParams = {
        tremoloFrequency: 10,
        tremoloDepth: 0.5,
        wet: 0.5,
        tremoloSpread: 180,
        tremoloType: 'sine',
      };
    } else if (type === 'vibrato') {
      defaultParams = {
        vibratoFrequency: 5,
        vibratoDepth: 0.1,
        wet: 0.5,
        vibratoType: 'sine',
        vibratoMaxDelay: 0.005,
      };
    }
    
    // Agregar radio por defecto para todas las zonas de efectos
    defaultParams.radius = 2.0;

    const newEffectZone: EffectZone = {
      id: uuidv4(),
      type,
      shape,
      position,
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      isSelected: false,
      isLocked: false,
      effectParams: defaultParams,
    };

    console.log(`➕ Creando zona de efecto ${type} en posición:`, newEffectZone.position);
    
    // Crear el efecto global en el AudioManager con la posición inicial
    try {
      audioManager.createGlobalEffect(newEffectZone.id, type, newEffectZone.position);
      console.log(`✅ Efecto global creado para zona ${newEffectZone.id} en posición [${newEffectZone.position.join(', ')}]`);
    } catch (error) {
      console.error(`❌ Error al crear efecto global:`, error);
    }
    
    // Agregar zona de efecto a la cuadrícula activa
    const state = get();
    const activeGridId = state.activeGridId;
    
    if (!activeGridId) {
      console.warn('No hay cuadrícula activa para crear zonas de efectos');
      return;
    }

    const activeGrid = state.grids.get(activeGridId);
    if (activeGrid) {
      const updatedGrid = {
        ...activeGrid,
        effectZones: [...activeGrid.effectZones, newEffectZone]
      };
    
    set((state) => ({
        grids: new Map(state.grids.set(activeGridId, updatedGrid)),
    }));

      console.log(`🎛️ Añadiendo zona de efecto ${type} en posición ${newEffectZone.position} a la cuadrícula ${activeGridId}`);
    }
  },

  updateEffectZone: (id: string, updates: Partial<Omit<EffectZone, 'id'>>) => {
    console.log(`🔄 Store: Actualizando zona de efecto ${id} con:`, updates);
    
    // Si se actualiza la posición, actualizar también en el AudioManager
    if (updates.position) {
      try {
        audioManager.updateEffectZonePosition(id, updates.position);
        console.log(`✅ Posición de zona de efecto ${id} actualizada en AudioManager: [${updates.position.join(', ')}]`);
      } catch (error) {
        console.error(`❌ Error al actualizar posición de zona de efecto:`, error);
      }
    }
    
    // Si se actualizan los parámetros del efecto, actualizar también en el AudioManager
    if (updates.effectParams) {
      try {
        // Si se cambió el radio, actualizarlo en el AudioManager
        if (updates.effectParams.radius !== undefined) {
          audioManager.setEffectZoneRadius(id, updates.effectParams.radius);
          console.log(`✅ Radio de zona de efecto ${id} actualizado a ${updates.effectParams.radius}`);
        }
        
        // Actualizar otros parámetros del efecto
        audioManager.updateGlobalEffect(id, updates.effectParams);
        console.log(`✅ Parámetros del efecto global actualizados para zona ${id}`);
      } catch (error) {
        console.error(`❌ Error al actualizar efecto global:`, error);
      }
    }
    
    set((state) => {
      const newGrids = new Map(state.grids);
      
      // Buscar la zona de efecto en todas las cuadrículas y actualizarla
      for (const [gridId, grid] of newGrids) {
        const zoneIndex = grid.effectZones.findIndex(zone => zone.id === id);
        if (zoneIndex !== -1) {
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
    // Eliminar el efecto global del AudioManager
    try {
      audioManager.removeGlobalEffect(id);
      console.log(`✅ Efecto global eliminado para zona ${id}`);
    } catch (error) {
      console.error(`❌ Error al eliminar efecto global:`, error);
    }
    
    set((state) => {
      const newGrids = new Map(state.grids);
      
      // Buscar y eliminar la zona de efecto de todas las cuadrículas
      for (const [gridId, grid] of newGrids) {
        const zoneIndex = grid.effectZones.findIndex(zone => zone.id === id);
        if (zoneIndex !== -1) {
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
    set((state) => {
      const newGrids = new Map(state.grids);
      
      // Buscar la zona de efecto en todas las cuadrículas y actualizar su estado de bloqueo
      for (const [gridId, grid] of newGrids) {
        const zoneIndex = grid.effectZones.findIndex(zone => zone.id === id);
        if (zoneIndex !== -1) {
          const updatedZones = [...grid.effectZones];
          updatedZones[zoneIndex] = { ...updatedZones[zoneIndex], isLocked: !updatedZones[zoneIndex].isLocked };
          
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

  // Nuevas acciones para controlar la edición de zonas de efectos
  setEditingEffectZone: (isEditing: boolean) => {
    set({ isEditingEffectZone: isEditing });
  },

  refreshAllEffects: () => {
    console.log(`🔄 Store: Refrescando todos los efectos...`);
    try {
      audioManager.refreshAllGlobalEffects();
      console.log(`✅ Todos los efectos han sido refrescados`);
    } catch (error) {
      console.error(`❌ Error al refrescar efectos:`, error);
    }
  },

  debugAudioChain: (soundId: string) => {
    console.log(`🔍 Store: Debug de cadena de audio para sonido ${soundId}`);
    try {
      audioManager.debugAudioChain(soundId);
    } catch (error) {
      console.error(`❌ Error al hacer debug de cadena de audio:`, error);
    }
  },

  // Acciones para objetos móviles
  addMobileObject: (position: [number, number, number]) => {
    const state = get();
    const activeGridId = state.activeGridId;
    
    console.log(`🚀 addMobileObject llamado - Cuadrícula activa: ${activeGridId}`);
    console.log(`🚀 Cuadrículas disponibles:`, Array.from(state.grids.keys()));
    
    if (!activeGridId) {
      console.warn('No hay cuadrícula activa para crear objetos móviles');
      return;
    }

    const newMobileObject: MobileObject = {
      id: uuidv4(),
      type: 'mobile',
      position,
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      isSelected: false,
      mobileParams: {
        movementType: 'circular',
        radius: 2,
        speed: 1,
        proximityThreshold: 1.5,
        isActive: true,
        centerPosition: position,
        direction: [1, 0, 0],
        axis: [0, 1, 0],
        amplitude: 0.5,
        frequency: 1,
        randomSeed: Math.random() * 1000,
        showRadiusIndicator: true,
        showProximityIndicator: true,
      },
    };

    console.log(`➕ Creando objeto móvil en posición:`, newMobileObject.position);

    // Agregar objeto móvil a la cuadrícula activa
    const activeGrid = state.grids.get(activeGridId);
    if (activeGrid) {
      console.log(`🚀 Cuadrícula activa encontrada:`, activeGrid);
      const updatedGrid = {
        ...activeGrid,
        mobileObjects: [...activeGrid.mobileObjects, newMobileObject]
      };

      set((state) => {
        const newGrids = new Map(state.grids);
        newGrids.set(activeGridId, updatedGrid);
        console.log(`🚀 Actualizando grids - Cuadrícula ${activeGridId} actualizada:`, updatedGrid);
        console.log(`🚀 Total de cuadrículas después de actualizar:`, newGrids.size);
        return { grids: newGrids };
      });

      console.log(`🚀 Añadiendo objeto móvil en posición ${position} a la cuadrícula ${activeGridId}`);
    } else {
      console.error(`❌ Cuadrícula activa ${activeGridId} no encontrada en el mapa de cuadrículas`);
    }
  },

  updateMobileObject: (id: string, updates: Partial<Omit<MobileObject, 'id'>>) => {
    console.log(`🔄 Store: Actualizando objeto móvil ${id} con:`, updates);
    
    set((state) => {
      const newGrids = new Map(state.grids);
      
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

  // Acciones para cuadrículas
  getGridKey: (coordinates: [number, number, number]) => {
    return `${coordinates[0]},${coordinates[1]},${coordinates[2]}`;
  },

  loadGrid: (coordinates: [number, number, number]) => {
    const state = get();
    const gridKey = state.getGridKey(coordinates);
    
    if (state.grids.has(gridKey)) {
      return; // Ya está cargada
    }

    const newGrid: Grid = {
      id: gridKey,
      coordinates,
      position: [coordinates[0] * state.gridSize, coordinates[1] * state.gridSize, coordinates[2] * state.gridSize],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      objects: [],
      mobileObjects: [],
      effectZones: [],
      gridSize: state.gridSize,
      gridColor: '#404040',
      isLoaded: true,
      isSelected: false
    };

    set((state) => ({
      grids: new Map(state.grids.set(gridKey, newGrid)),
    }));

    console.log(`📐 Cargando cuadrícula: ${gridKey}`);
  },

  unloadGrid: (coordinates: [number, number, number]) => {
    const state = get();
    const gridKey = state.getGridKey(coordinates);
    
    if (coordinates[0] === 0 && coordinates[1] === 0 && coordinates[2] === 0) {
      console.warn('No se puede descargar la cuadrícula central');
      return;
    }

    set((state) => {
      const newGrids = new Map(state.grids);
      newGrids.delete(gridKey);
      return { grids: newGrids };
    });

    console.log(`📐 Descargando cuadrícula: ${gridKey}`);
  },

  moveToGrid: (coordinates: [number, number, number]) => {
    const state = get();
    const gridKey = state.getGridKey(coordinates);
    
    // Cargar la cuadrícula si no está cargada
    if (!state.grids.has(gridKey)) {
      state.loadGrid(coordinates);
    }

    const grid = state.grids.get(gridKey);
    if (!grid) return;

    // NO sobrescribir el estado global de objetos - solo cambiar la cuadrícula actual
    set((state) => ({
      currentGridCoordinates: coordinates,
      selectedEntityId: null, // Deseleccionar al cambiar de cuadrícula
    }));

    console.log(`🚀 Moviéndose a cuadrícula: ${gridKey}`);
  },

  getAdjacentGrids: () => {
    const state = get();
    const [x, y, z] = state.currentGridCoordinates;
    const distance = state.renderDistance;
    
    const adjacent: Array<[number, number, number]> = [];
    
    for (let dx = -distance; dx <= distance; dx++) {
      for (let dy = -distance; dy <= distance; dy++) {
        for (let dz = -distance; dz <= distance; dz++) {
          if (dx === 0 && dy === 0 && dz === 0) continue; // Saltar la cuadrícula actual
          adjacent.push([x + dx, y + dy, z + dz]);
        }
      }
    }
    
    return adjacent;
  },

  // Acciones para manipulación de cuadrículas
  createGrid: (position: [number, number, number], size: number = 20) => {
    const state = get();
    const gridId = uuidv4();
    
    // Calcular las coordenadas de la cuadrícula basadas en la posición 3D
    const coordinates: [number, number, number] = [
      Math.round(position[0] / size),
      Math.round(position[1] / size),
      Math.round(position[2] / size)
    ];
    
    const newGrid: Grid = {
      id: gridId,
      coordinates,
      position,
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      objects: [],
      mobileObjects: [],
      effectZones: [],
      gridSize: size,
      gridColor: '#404040',
      isLoaded: true,
      isSelected: false
    };

    set((state) => ({
      grids: new Map(state.grids.set(gridId, newGrid)),
    }));

    console.log(`📐 Creando nueva cuadrícula: ${gridId} en coordenadas ${coordinates}, posición 3D ${position}`);
  },

  selectGrid: (gridId: string | null) => {
    set((state) => {
      const newGrids = new Map(state.grids);
      
      // Deseleccionar todas las cuadrículas
      newGrids.forEach((grid) => {
        grid.isSelected = false;
      });
      
      // Seleccionar la cuadrícula especificada
      if (gridId && newGrids.has(gridId)) {
        const grid = newGrids.get(gridId)!;
        grid.isSelected = true;
        newGrids.set(gridId, grid);
      }
      
      return { grids: newGrids };
    });
  },

  setActiveGrid: (gridId: string | null) => {
    const state = get();
    
    if (gridId && state.grids.has(gridId)) {
      set((state) => ({
        activeGridId: gridId,
      }));
      
      console.log(`🎯 Cuadrícula activa cambiada a: ${gridId}`);
    } else {
      set((state) => ({
        activeGridId: null,
      }));
      
      console.log(`🎯 Cuadrícula activa desactivada`);
    }
  },

  updateGrid: (gridId: string, updates: Partial<Omit<Grid, 'id'>>) => {
    set((state) => {
      const newGrids = new Map(state.grids);
      const grid = newGrids.get(gridId);
      
      if (grid) {
        const updatedGrid = { ...grid, ...updates };
        newGrids.set(gridId, updatedGrid);
      }
      
      return { grids: newGrids };
    });
  },

  deleteGrid: (gridId: string) => {
    const state = get();
    
    // No permitir eliminar la cuadrícula principal
    if (gridId === '0,0,0') {
      console.warn('No se puede eliminar la cuadrícula principal');
      return;
    }

    set((state) => {
      const newGrids = new Map(state.grids);
      newGrids.delete(gridId);
      return { grids: newGrids };
    });

    console.log(`🗑️ Eliminando cuadrícula: ${gridId}`);
  },

  resizeGrid: (gridId: string, newSize: number) => {
    const state = get();
    const grid = state.grids.get(gridId);
    
    if (grid) {
      state.updateGrid(gridId, { gridSize: newSize });
      console.log(`📏 Redimensionando cuadrícula ${gridId} a tamaño ${newSize}`);
    }
  },

  moveGrid: (gridId: string, position: [number, number, number]) => {
    const state = get();
    const grid = state.grids.get(gridId);
    
    if (grid) {
      state.updateGrid(gridId, { position });
      console.log(`🚀 Moviendo cuadrícula ${gridId} a posición ${position}`);
    }
  },

  rotateGrid: (gridId: string, rotation: [number, number, number]) => {
    const state = get();
    const grid = state.grids.get(gridId);
    
    if (grid) {
      state.updateGrid(gridId, { rotation });
      console.log(`🔄 Rotando cuadrícula ${gridId} a rotación ${rotation}`);
    }
  },

  scaleGrid: (gridId: string, scale: [number, number, number]) => {
    const state = get();
    const grid = state.grids.get(gridId);
    
    if (grid) {
      state.updateGrid(gridId, { scale });
      console.log(`📐 Escalando cuadrícula ${gridId} a escala ${scale}`);
    }
  },

}));
