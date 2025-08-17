import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { type AudioParams } from '../hooks/useObjectAudio';

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
}

// Estado del mundo 3D
export interface WorldState {
  objects: SoundObject[];
  selectedObjectId: string | null;
}

// Acciones disponibles en el store
export interface WorldActions {
  addObject: (type: SoundObjectType, position: [number, number, number]) => void;
  removeObject: (id: string) => void;
  selectObject: (id: string | null) => void;
  updateObject: (id: string, updates: Partial<Omit<SoundObject, 'id'>>) => void;
  clearAllObjects: () => void;
}

// Parámetros por defecto para cada tipo de objeto
const getDefaultAudioParams = (type: SoundObjectType): AudioParams => {
  switch (type) {
    case 'cube':
      return {
        frequency: 220,
        waveform: 'sine',
        volume: 0.5,
        reverb: 0.3,
        delay: 0.1,
      };
    case 'sphere':
      return {
        frequency: 440,
        waveform: 'triangle',
        volume: 0.7,
        reverb: 0.5,
        delay: 0.2,
      };
    default:
      return {
        frequency: 330,
        waveform: 'sine',
        volume: 0.6,
        reverb: 0.4,
        delay: 0.15,
      };
  }
};

// Creación del store de Zustand
export const useWorldStore = create<WorldState & WorldActions>((set, get) => ({
  // Estado inicial
  objects: [],
  selectedObjectId: null,

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
    };

    set((state) => ({
      objects: [...state.objects, newObject],
    }));
  },

  // Acción para eliminar un objeto
  removeObject: (id: string) => {
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
    }));
  },

  // Acción para actualizar un objeto
  updateObject: (id: string, updates: Partial<Omit<SoundObject, 'id'>>) => {
    set((state) => ({
      objects: state.objects.map((obj) =>
        obj.id === id ? { ...obj, ...updates } : obj
      ),
    }));
  },

  // Acción para limpiar todos los objetos
  clearAllObjects: () => {
    set({
      objects: [],
      selectedObjectId: null,
    });
  },
}));
