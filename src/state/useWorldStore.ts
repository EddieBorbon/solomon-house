import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { audioManager, type AudioParams } from '../lib/AudioManager';

// Tipos para los objetos de sonido
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
  triggerObjectPercussion: (id: string) => void;
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

    console.log(`➕ Creando objeto ${type} con parámetros:`, newObject.audioParams);
    console.log(`➕ Llamando a audioManager.createSoundSource para ${type}`);

    set((state) => ({
      objects: [...state.objects, newObject],
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
  toggleObjectAudio: (id: string, forceState?: boolean) => {
    console.log(`🎵 toggleObjectAudio llamado para ${id} con forceState:`, forceState);
    
    set((state) => {
      const currentObject = state.objects.find(obj => obj.id === id);
      if (!currentObject) {
        console.log(`🎵 Objeto ${id} no encontrado`);
        return state;
      }
      
      // Ignorar los tipos percusivos ya que no necesitan toggle de audio
      if (currentObject.type === 'plane' || currentObject.type === 'torus') {
        console.log(`🎵 Objeto ${id} es de tipo '${currentObject.type}', ignorando toggleObjectAudio`);
        return state;
      }
      
      // Para dodecahedronRing, usar startSound/stopSound como sonido continuo
      if (currentObject.type === 'dodecahedronRing') {
        console.log(`🔷 Objeto ${id} es de tipo 'dodecahedronRing', usando startSound/stopSound`);
      }
      
      // Determinar el nuevo estado: si forceState está definido, usarlo; si no, hacer toggle
      const newAudioEnabled = forceState !== undefined ? forceState : !currentObject.audioEnabled;
      
      const updatedObjects = state.objects.map((obj) =>
        obj.id === id ? { ...obj, audioEnabled: newAudioEnabled } : obj
      );
      
      // Encontrar el objeto actualizado
      const updatedObject = updatedObjects.find(obj => obj.id === id);
      
      console.log(`🎵 Objeto actualizado:`, updatedObject);
      console.log(`🎵 Estado de audio:`, updatedObject?.audioEnabled);
      
      // Controlar el audio en el AudioManager
      if (updatedObject) {
        if (updatedObject.audioEnabled) {
          console.log(`🎵 Activando audio para ${id}`);
          // Para todos los tipos, usar startSound para sonido continuo
          audioManager.startSound(id, updatedObject.audioParams);
        } else {
          console.log(`🎵 Desactivando audio para ${id}`);
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

  // Acción para disparar un objeto percusivo (especialmente para 'plane')
  triggerObjectPercussion: (id: string) => {
    const state = get();
    const object = state.objects.find(obj => obj.id === id);
    
    if (object) {
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
