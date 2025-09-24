import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { audioManager, type AudioParams } from '../lib/AudioManager';
import { type SoundObject, type SoundObjectType, type SoundObjectActions } from '../types/world';

interface ObjectState {
  objects: SoundObject[];
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

export const useObjectStore = create<ObjectState & SoundObjectActions>((set, get) => ({
  // Estado inicial
  objects: [],

  // Acciones para gestión de objetos sonoros
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

    set((state) => ({
      objects: [...state.objects, newObject]
    }));

    console.log(`🎵 Añadiendo objeto ${type} en posición ${position}`);
  },

  removeObject: (id: string) => {
    // Eliminar la fuente de sonido del AudioManager antes de eliminar el objeto
    audioManager.removeSoundSource(id);

    set((state) => ({
      objects: state.objects.filter(obj => obj.id !== id)
    }));
  },

  selectEntity: (id: string | null) => {
    set((state) => ({
      objects: state.objects.map((obj) => ({
        ...obj,
        isSelected: obj.id === id,
      }))
    }));
  },

  updateObject: (id: string, updates: Partial<Omit<SoundObject, 'id'>>) => {
    console.log(`🔄 Store: Actualizando objeto ${id} con:`, updates);
    
    set((state) => ({
      objects: state.objects.map(obj => 
        obj.id === id ? { ...obj, ...updates } : obj
      )
    }));

    // Obtener el objeto actualizado para comunicar cambios al AudioManager
    const state = get();
    const updatedObject = state.objects.find(obj => obj.id === id);

    if (updatedObject) {
      // Comunicar los cambios al AudioManager
      if (updates.position) {
        console.log(`📍 Store: Actualizando posición para ${id}`);
        audioManager.updateSoundPosition(id, updatedObject.position);
      }
      if (updates.audioParams) {
        console.log(`🎵 Store: Actualizando parámetros de audio para ${id}:`, updatedObject.audioParams);
        audioManager.updateSoundParams(id, updatedObject.audioParams);
      }
    }
  },

  toggleObjectAudio: (id: string, forceState?: boolean) => {
    console.log(`🎵 toggleObjectAudio llamado para ${id} con forceState:`, forceState);
    
    const state = get();
    const currentObject = state.objects.find(obj => obj.id === id);
    
    if (!currentObject) {
      console.log(`🎵 Objeto ${id} no encontrado`);
      return;
    }
      
    // Ignorar los tipos percusivos ya que no necesitan toggle de audio
    if (currentObject.type === 'plane' || currentObject.type === 'torus') {
      console.log(`🎵 Objeto ${id} es de tipo '${currentObject.type}', ignorando toggleObjectAudio`);
      return;
    }
      
    // Determinar el nuevo estado: si forceState está definido, usarlo; si no, hacer toggle
    const newAudioEnabled = forceState !== undefined ? forceState : !currentObject.audioEnabled;
    
    set((state) => ({
      objects: state.objects.map(obj =>
        obj.id === id ? { ...obj, audioEnabled: newAudioEnabled } : obj
      )
    }));
      
    // Controlar el audio en el AudioManager
    if (newAudioEnabled) {
      console.log(`🎵 Activando audio para ${id}`);
      audioManager.startContinuousSound(id, currentObject.audioParams);
    } else {
      console.log(`🎵 Desactivando audio para ${id}`);
      audioManager.stopSound(id);
    }
  },

  triggerObjectNote: (id: string) => {
    const state = get();
    const object = state.objects.find(obj => obj.id === id);
    
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

  triggerObjectPercussion: (id: string) => {
    const state = get();
    const object = state.objects.find(obj => obj.id === id);
    
    if (object) {
      // Si el objeto tiene sonido continuo activo, no disparar notas adicionales
      if (object.audioEnabled) {
        console.log(`🥁 Objeto ${id} tiene sonido continuo activo, ignorando objeto percusivo`);
        return;
      }
      
      console.log(`🥁 Disparando objeto percusivo para ${id}`);
      if (object.type === 'plane') {
        audioManager.triggerNoiseAttack(id, object.audioParams);
      } else {
        audioManager.triggerNoteAttack(id, object.audioParams);
      }
    }
  },

  triggerObjectAttackRelease: (id: string) => {
    const state = get();
    const object = state.objects.find(obj => obj.id === id);
    
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

  startObjectGate: (id: string) => {
    const state = get();
    const object = state.objects.find(obj => obj.id === id);
    
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

  stopObjectGate: (id: string) => {
    const state = get();
    const object = state.objects.find(obj => obj.id === id);
    
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

  clearAllObjects: () => {
    set({ objects: [] });
  },

  // Implementación de EntityActions
  add: (entity: Omit<SoundObject, 'id'>) => {
    const newObject: SoundObject = {
      id: uuidv4(),
      ...entity
    };
    
    set((state) => ({
      objects: [...state.objects, newObject]
    }));
  },

  update: (id: string, updates: Partial<Omit<SoundObject, 'id'>>) => {
    get().updateObject(id, updates);
  },

  remove: (id: string) => {
    get().removeObject(id);
  },

  select: (id: string | null) => {
    get().selectEntity(id);
  },

  getById: (id: string) => {
    const state = get();
    return state.objects.find(obj => obj.id === id);
  },

  getAll: () => {
    const state = get();
    return state.objects;
  },
}));
