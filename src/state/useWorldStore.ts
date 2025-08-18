import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { audioManager, type AudioParams } from '../lib/AudioManager';

// Tipos para los objetos de sonido
export type SoundObjectType = 'cube' | 'sphere' | 'cylinder' | 'cone';

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
  triggerObjectNote: (id: string) => void;
  clearAllObjects: () => void;
  setTransformMode: (mode: 'translate' | 'rotate' | 'scale') => void;
}

// Parámetros por defecto para cada tipo de objeto
const getDefaultAudioParams = (type: SoundObjectType): AudioParams => {
  switch (type) {
    case 'cube':
      return {
        frequency: 220,
        volume: 0.1, // Volumen estándar (se mostrará como 10%)
        waveform: 'sine', // Forma de onda de la portadora
        harmonicity: 1.5,
        modulationWaveform: 'square', // Forma de onda de la moduladora
        duration: 2.0, // Duración de 2 segundos para sonidos continuos
      };
    case 'sphere':
      return {
        frequency: 300,
        volume: 0.1, // Volumen estándar (se mostrará como 10%)
        waveform: 'sine',
        modulationWaveform: 'sine',
        harmonicity: 2, // Ratio de octava
        modulationIndex: 10, // Valor alto para un timbre rico y metálico
        duration: 1.5, // Duración de 1.5 segundos
      };
    case 'cylinder':
      return {
        frequency: 220,
        volume: 0.1, // Volumen estándar (se mostrará como 10%)
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
        volume: 0.1,   // Volumen estándar (se mostrará como 10%)
        waveform: 'sine',
        pitchDecay: 0.05,
        octaves: 10,
        duration: 0.5, // Duración corta para sonidos percusivos
      };
    default:
      return {
        frequency: 330,
        waveform: 'sine',
        volume: 0.1, // Volumen estándar (se mostrará como 10%)
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
          // Para todos los tipos, usar triggerObjectNote con duración configurada
          audioManager.triggerNoteAttack(id, updatedObject.audioParams);
        } else {
          // Detener el sonido si está sonando
          audioManager.stopSound(id);
        }
      }
      
      return {
        objects: updatedObjects,
      };
    });
  },

  // Acción para disparar una nota percusiva
  triggerObjectNote: (id: string) => {
    const state = get();
    const object = state.objects.find(obj => obj.id === id);
    
    if (object) {
      console.log(`🥁 Disparando nota percusiva para ${id}`);
      audioManager.triggerNoteAttack(id, object.audioParams);
    }
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
