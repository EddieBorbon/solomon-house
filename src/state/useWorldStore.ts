import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { audioManager, type AudioParams } from '../lib/AudioManager';

// Tipos para los objetos de sonido
export type SoundObjectType = 'cube' | 'sphere';

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

// Estado del mundo 3D
export interface WorldState {
  objects: SoundObject[];
  selectedObjectId: string | null;
  transformMode: 'translate' | 'rotate' | 'scale';
}

// Acciones disponibles en el store
export interface WorldActions {
  addObject: (type: SoundObjectType, position: [number, number, number]) => void;
  removeObject: (id: string) => void;
  selectObject: (id: string | null) => void;
  updateObject: (id: string, updates: Partial<Omit<SoundObject, 'id'>>) => void;
  toggleObjectAudio: (id: string) => void;
  clearAllObjects: () => void;
  setTransformMode: (mode: 'translate' | 'rotate' | 'scale') => void;
}

// Parámetros por defecto para cada tipo de objeto
const getDefaultAudioParams = (type: SoundObjectType): AudioParams => {
  switch (type) {
    case 'cube':
      return {
        frequency: 220,
        waveform: 'sine',
        volume: 0.5,
      };
    case 'sphere':
      return {
        frequency: 440,
        waveform: 'triangle',
        volume: 0.7,
      };
    default:
      return {
        frequency: 330,
        waveform: 'sine',
        volume: 0.6,
      };
  }
};

// Creación del store de Zustand
export const useWorldStore = create<WorldState & WorldActions>((set, get) => ({
  // Estado inicial
  objects: [],
  selectedObjectId: null,
  transformMode: 'translate',

  // Acción para añadir un nuevo objeto
  addObject: (type: SoundObjectType, position: [number, number, number]) => {
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

    set((state) => ({
      objects: [...state.objects, newObject],
    }));

    // Crear la fuente de sonido en el AudioManager
    audioManager.createSoundSource(
      newObject.id,
      newObject.type,
      newObject.audioParams,
      newObject.position
    );
  },

  // Acción para eliminar un objeto
  removeObject: (id: string) => {
    // Eliminar la fuente de sonido del AudioManager antes de eliminar el objeto
    audioManager.removeSoundSource(id);

    set((state) => ({
      objects: state.objects.filter((obj) => obj.id !== id),
      selectedObjectId: state.selectedObjectId === id ? null : state.selectedObjectId,
    }));
  },

  // Acción para seleccionar un objeto
  selectObject: (id: string | null) => {
    set((state) => ({
      objects: state.objects.map((obj) => ({
        ...obj,
        isSelected: obj.id === id,
      })),
      selectedObjectId: id,
      // Resetear el modo de transformación si no hay objeto seleccionado
      transformMode: id === null ? 'translate' : state.transformMode,
    }));
  },

  // Acción para actualizar un objeto
  updateObject: (id: string, updates: Partial<Omit<SoundObject, 'id'>>) => {
    console.log(`🔄 Store: Actualizando objeto ${id} con:`, updates);
    
    // Primero, actualiza el estado de Zustand
    set((state) => ({
      objects: state.objects.map((obj) =>
        obj.id === id ? { ...obj, ...updates } : obj
      ),
    }));

    // --- CAMBIO CLAVE: Usar get() para leer el estado DESPUÉS de la actualización ---
    const updatedObjects = get().objects;
    const updatedObject = updatedObjects.find(obj => obj.id === id);

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
  toggleObjectAudio: (id: string) => {
    set((state) => {
      const updatedObjects = state.objects.map((obj) =>
        obj.id === id ? { ...obj, audioEnabled: !obj.audioEnabled } : obj
      );
      
      // Encontrar el objeto actualizado
      const updatedObject = updatedObjects.find(obj => obj.id === id);
      
      // Controlar el audio en el AudioManager
      if (updatedObject) {
        if (updatedObject.audioEnabled) {
          audioManager.startSound(id, updatedObject.audioParams);
        } else {
          audioManager.stopSound(id);
        }
      }
      
      return {
        objects: updatedObjects,
      };
    });
  },

  // Acción para limpiar todos los objetos
  clearAllObjects: () => {
    set({
      objects: [],
      selectedObjectId: null,
    });
  },

  // Acción para establecer el modo de transformación
  setTransformMode: (mode: 'translate' | 'rotate' | 'scale') => {
    set({ transformMode: mode });
  },
}));
