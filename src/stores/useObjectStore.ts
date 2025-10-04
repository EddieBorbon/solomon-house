import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { audioManager, type AudioParams } from '../lib/AudioManager';

// Tipos para objetos de sonido
export type SoundObjectType = 'cube' | 'sphere' | 'cylinder' | 'cone' | 'pyramid' | 'icosahedron' | 'plane' | 'torus' | 'dodecahedronRing' | 'spiral';

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

// Estado específico para objetos
export interface ObjectState {
  objects: SoundObject[];
  objectsByGrid: Map<string, SoundObject[]>; // Objetos organizados por cuadrícula
}

// Acciones específicas para objetos
export interface ObjectActions {
  // Acciones básicas de objetos
  addObject: (type: SoundObjectType, position: [number, number, number], gridId: string) => SoundObject;
  removeObject: (id: string, gridId: string) => void;
  updateObject: (id: string, updates: Partial<Omit<SoundObject, 'id'>>, gridId: string) => void;
  
  // Acciones de audio
  toggleObjectAudio: (id: string, forceState?: boolean, gridId?: string) => void;
  triggerObjectNote: (id: string, gridId?: string) => void;
  triggerObjectPercussion: (id: string, gridId?: string) => void;
  triggerObjectAttackRelease: (id: string, gridId?: string) => void;
  startObjectGate: (id: string, gridId?: string) => void;
  stopObjectGate: (id: string, gridId?: string) => void;
  
  // Acciones de gestión
  clearAllObjects: (gridId?: string) => void;
  getObjectById: (id: string, gridId?: string) => SoundObject | null;
  getAllObjects: (gridId?: string) => SoundObject[];
}

// Parámetros por defecto para cada tipo de objeto
const getDefaultAudioParams = (type: SoundObjectType): AudioParams => {
  switch (type) {
    case 'cube':
      return {
        frequency: 220,
        volume: 0.6,
        waveform: 'sine',
        harmonicity: 1.5,
        modulationWaveform: 'square',
        duration: 2.0,
      };
    case 'sphere':
      return {
        frequency: 300,
        volume: 0.6,
        waveform: 'sine',
        modulationWaveform: 'sine',
        harmonicity: 2,
        modulationIndex: 10,
        duration: 1.5,
      };
    case 'cylinder':
      return {
        frequency: 220,
        volume: 0.6,
        waveform: 'triangle',
        waveform2: 'sine',
        harmonicity: 1.5,
        vibratoAmount: 0.2,
        vibratoRate: 5,
        duration: 3.0,
      };
    case 'cone':
      return {
        frequency: 50,
        volume: 0.6,
        waveform: 'sine',
        pitchDecay: 0.05,
        octaves: 10,
        duration: 0.5,
      };
    case 'pyramid':
      return {
        frequency: 110,
        volume: 0.9,
        waveform: 'sawtooth',
        ampAttack: 0.01,
        ampDecay: 0.2,
        ampSustain: 0.1,
        ampRelease: 0.5,
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
        duration: 0.5,
      };
    case 'plane':
      return {
        frequency: 0,
        volume: 0.7,
        waveform: 'sine',
        noiseType: 'white',
        attack: 0.001,
        decay: 0.1,
        sustain: 0,
        duration: 0.1,
      };
    case 'torus':
      return {
        frequency: 440,
        volume: 0.9,
        waveform: 'sine',
        attackNoise: 1,
        dampening: 4000,
        resonance: 0.9,
      };
    case 'dodecahedronRing':
      return {
        frequency: 220,
        volume: 0.7,
        waveform: 'sine',
        polyphony: 4,
        chord: ["C4", "E4", "G4", "B4"],
        attack: 1.5,
        release: 2.0,
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
        notes: ["C4", "E4", "G4"],
        duration: 1,
        urls: {
          C4: "C4.mp3",
          "D#4": "Ds4.mp3",
          "F#4": "Fs4.mp3",
          A4: "A4.mp3",
        },
        baseUrl: "/samples/piano/",
        frequency: 0,
        waveform: 'sine',
      };
    default:
      return {
        frequency: 330,
        waveform: 'sine',
        volume: 0.6,
      };
  }
};

/**
 * Store especializado para gestión de objetos de sonido
 * Implementa Single Responsibility Principle
 */
export const useObjectStore = create<ObjectState & ObjectActions>((set, get) => ({
  // Estado inicial
  objects: [],
  objectsByGrid: new Map(),

  // Acciones básicas de objetos
  addObject: (type: SoundObjectType, position: [number, number, number], gridId: string) => {

    // Determinar si el objeto debe tener audio habilitado por defecto
    // Los objetos percusivos (icosahedron, torus, spiral, pyramid) no deberían tener audio continuo
    // El plane (NoiseSynth) puede tener sonido continuo
    const isPercussiveObject = ['icosahedron', 'torus', 'spiral', 'pyramid'].includes(type);
    const defaultAudioEnabled = !isPercussiveObject;

    const newObject: SoundObject = {
      id: uuidv4(),
      type,
      position,
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      audioParams: getDefaultAudioParams(type),
      isSelected: false,
      audioEnabled: defaultAudioEnabled,
    };


    // Crear la fuente de sonido en el AudioManager
    try {
      audioManager.createSoundSource(
        newObject.id,
        newObject.type,
        newObject.audioParams,
        newObject.position
      );
      
      // Solo iniciar el sonido continuo si no es un objeto percusivo
      if (defaultAudioEnabled) {
        audioManager.startContinuousSound(newObject.id, newObject.audioParams);
      }
    } catch (error) {
      throw error;
    }

    // Agregar objeto al estado local
    set((state) => {
      const newObjects = [...state.objects, newObject];
      const newObjectsByGrid = new Map(state.objectsByGrid);
      
      // Obtener objetos existentes de la cuadrícula o crear array vacío
      const gridObjects = newObjectsByGrid.get(gridId) || [];
      newObjectsByGrid.set(gridId, [...gridObjects, newObject]);
      
      return {
        objects: newObjects,
        objectsByGrid: newObjectsByGrid
      };
    });

    return newObject;
  },

  removeObject: (id: string, gridId: string) => {
    console.log('🎵 useObjectStore: removeObject called', { id, gridId });

    // Eliminar la fuente de sonido del AudioManager
    try {
      console.log('🔧 useObjectStore: Calling audioManager.removeSoundSource', id);
      audioManager.removeSoundSource(id);
      console.log('✅ useObjectStore: audioManager.removeSoundSource called successfully');
    } catch (error) {
      console.error('❌ useObjectStore: Error removing sound source:', error);
    }

    // Eliminar objeto del estado local
    set((state) => {
      const newObjects = state.objects.filter(obj => obj.id !== id);
      const newObjectsByGrid = new Map(state.objectsByGrid);
      
      // Eliminar objeto de la cuadrícula específica
      const gridObjects = newObjectsByGrid.get(gridId) || [];
      newObjectsByGrid.set(gridId, gridObjects.filter(obj => obj.id !== id));
      
      return {
        objects: newObjects,
        objectsByGrid: newObjectsByGrid
      };
    });

    console.log('✅ useObjectStore: Object removed from local state');

  },

  updateObject: (id: string, updates: Partial<Omit<SoundObject, 'id'>>, gridId: string) => {
    console.log('🎵 useObjectStore: updateObject called', { id, updates, gridId });

    // Obtener el objeto actual antes de la actualización
    const currentObject = get().objects.find(obj => obj.id === id);
    if (!currentObject) {
      console.warn('⚠️ useObjectStore: Object not found before update', id);
      return;
    }

    // Crear el objeto actualizado
    const updatedObject = { ...currentObject, ...updates };

    // Actualizar objeto en el estado local
    set((state) => {
      const newObjects = state.objects.map(obj => 
        obj.id === id ? updatedObject : obj
      );
      const newObjectsByGrid = new Map(state.objectsByGrid);
      
      // Actualizar objeto en la cuadrícula específica
      const gridObjects = newObjectsByGrid.get(gridId) || [];
      newObjectsByGrid.set(gridId, gridObjects.map(obj => 
        obj.id === id ? updatedObject : obj
      ));
      
      return {
        objects: newObjects,
        objectsByGrid: newObjectsByGrid
      };
    });

    console.log('✅ useObjectStore: Local state updated');

    // Comunicar cambios al AudioManager usando el objeto actualizado
    console.log('🎵 useObjectStore: Updating audio with object', updatedObject);
    
    if (updates.position) {
      console.log('🔧 useObjectStore: Updating position', updatedObject.position);
      audioManager.updateSoundPosition(id, updatedObject.position);
    }
    if (updates.audioParams) {
      console.log('🔧 useObjectStore: Updating audio params', updatedObject.audioParams);
      audioManager.updateSoundParams(id, updatedObject.audioParams);
      console.log('✅ useObjectStore: audioManager.updateSoundParams called');
    }

  },

  // Acciones de audio
  toggleObjectAudio: (id: string, forceState?: boolean) => {

    const currentObject = get().objects.find(obj => obj.id === id);
    if (!currentObject) {
      return;
    }

    console.log('toggleObjectAudio:', { id, type: currentObject.type, currentAudioEnabled: currentObject.audioEnabled, forceState });

    // Ignorar los tipos percusivos ya que no necesitan toggle de audio
    if (currentObject.type === 'icosahedron' || currentObject.type === 'torus') {
      console.log('toggleObjectAudio: Ignorando objeto percusivo:', currentObject.type);
      return;
    }

    // Determinar el nuevo estado
    const newAudioEnabled = forceState !== undefined ? forceState : !currentObject.audioEnabled;
    
    console.log('toggleObjectAudio: Cambiando audio de', currentObject.audioEnabled, 'a', newAudioEnabled);

    // Actualizar el objeto
    set((state) => ({
      objects: state.objects.map(obj =>
        obj.id === id ? { ...obj, audioEnabled: newAudioEnabled } : obj
      )
    }));

    // Controlar el audio en el AudioManager
    if (newAudioEnabled) {
      console.log('toggleObjectAudio: Iniciando sonido continuo para', id);
      audioManager.startContinuousSound(id, currentObject.audioParams);
    } else {
      console.log('toggleObjectAudio: Deteniendo sonido para', id);
      audioManager.stopSound(id);
    }
  },

  triggerObjectNote: (id: string) => {
    const object = get().objects.find(obj => obj.id === id);
    if (!object) {
      return;
    }

    // Para objetos percusivos (icosahedron, torus, spiral, pyramid, dodecahedronRing), siempre disparar la nota
    const isPercussiveObject = ['icosahedron', 'torus', 'spiral', 'pyramid', 'dodecahedronRing'].includes(object.type);
    
    if (isPercussiveObject) {
      audioManager.triggerNoteAttack(id, object.audioParams);
    } else {
      // Para objetos continuos, solo disparar si no tienen audio continuo activo
      if (!object.audioEnabled) {
        audioManager.triggerNoteAttack(id, object.audioParams);
      }
    }
  },

  triggerObjectPercussion: (id: string) => {
    const object = get().objects.find(obj => obj.id === id);
    if (!object) {
      return;
    }

    // Para objetos percusivos (icosahedron, torus, spiral, pyramid, dodecahedronRing), siempre disparar
    const isPercussiveObject = ['icosahedron', 'torus', 'spiral', 'pyramid', 'dodecahedronRing'].includes(object.type);
    
    if (isPercussiveObject) {
      if (object.type === 'plane') {
        audioManager.triggerNoiseAttack(id, object.audioParams);
      } else {
        audioManager.triggerNoteAttack(id, object.audioParams);
      }
    } else {
      // Para objetos continuos, solo disparar si no tienen audio continuo activo
      if (!object.audioEnabled) {
        if (object.type === 'plane') {
          audioManager.triggerNoiseAttack(id, object.audioParams);
        } else {
          audioManager.triggerNoteAttack(id, object.audioParams);
        }
      }
    }
  },

  triggerObjectAttackRelease: (id: string) => {
    const object = get().objects.find(obj => obj.id === id);
    if (!object) {
      return;
    }

    // Para objetos percusivos (icosahedron, torus, spiral, pyramid), siempre disparar
    const isPercussiveObject = ['icosahedron', 'torus', 'spiral', 'pyramid'].includes(object.type);
    
    if (isPercussiveObject) {
      audioManager.triggerAttackRelease(id, object.audioParams);
    } else {
      // Para objetos continuos, solo disparar si no tienen audio continuo activo
      if (!object.audioEnabled) {
        audioManager.triggerAttackRelease(id, object.audioParams);
      }
    }
  },

  startObjectGate: (id: string) => {
    const object = get().objects.find(obj => obj.id === id);
    if (!object) {
      return;
    }

    // Solo iniciar gate si no está en modo de sonido continuo
    if (!object.audioEnabled) {
      audioManager.startSound(id, object.audioParams);
    } else {
    }
  },

  stopObjectGate: (id: string) => {
    const object = get().objects.find(obj => obj.id === id);
    if (!object) {
      return;
    }

    // Solo detener gate si no está en modo de sonido continuo
    if (!object.audioEnabled) {
      audioManager.stopSound(id);
    } else {
    }
  },

  // Acciones de gestión
  clearAllObjects: (gridId?: string) => {
    
    if (gridId) {
      // Limpiar solo objetos de una cuadrícula específica
      const gridObjects = get().objectsByGrid.get(gridId) || [];
      gridObjects.forEach(obj => {
        try {
          audioManager.removeSoundSource(obj.id);
        } catch {
        }
      });

      set((state) => {
        const newObjects = state.objects.filter(obj => !gridObjects.some(gridObj => gridObj.id === obj.id));
        const newObjectsByGrid = new Map(state.objectsByGrid);
        newObjectsByGrid.set(gridId, []);
        
        return {
          objects: newObjects,
          objectsByGrid: newObjectsByGrid
        };
      });

    } else {
      // Limpiar todos los objetos
      const objects = get().objects;
      objects.forEach(obj => {
        try {
          audioManager.removeSoundSource(obj.id);
        } catch {
        }
      });

      set({ 
        objects: [],
        objectsByGrid: new Map()
      });

    }
  },

  getObjectById: (id: string) => {
    const object = get().objects.find(obj => obj.id === id);
    return object || null;
  },

  getAllObjects: (gridId?: string) => {
    if (gridId) {
      const gridObjects = get().objectsByGrid.get(gridId) || [];
      return gridObjects;
    } else {
      const objects = get().objects;
      return objects;
    }
  }
}));