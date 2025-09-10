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
  objects: SoundObject[];
  effectZones: EffectZone[]; // Nuevo array para zonas de efectos
  selectedEntityId: string | null; // Renombrado de selectedObjectId para ser más genérico
  transformMode: 'translate' | 'rotate' | 'scale';
  isEditingEffectZone: boolean; // Nuevo estado para indicar cuando se está editando una zona de efectos
}

// Acciones disponibles en el store
export interface WorldActions {
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
  objects: [],
  effectZones: [],
  selectedEntityId: null,
  transformMode: 'translate',
  isEditingEffectZone: false,

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
      selectedEntityId: state.selectedEntityId === id ? null : state.selectedEntityId,
    }));
  },

  // Acción para seleccionar una entidad (objeto sonoro o zona de efecto)
  selectEntity: (id: string | null) => {
    set((state) => ({
      objects: state.objects.map((obj) => ({
        ...obj,
        isSelected: obj.id === id,
      })),
      effectZones: state.effectZones.map((zone) => ({
        ...zone,
        isSelected: zone.id === id,
      })),
      selectedEntityId: id,
      // Resetear el modo de transformación si no hay entidad seleccionada
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
          // Para todos los tipos, usar startContinuousSound para sonido continuo
          audioManager.startContinuousSound(id, updatedObject.audioParams);
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
    const object = state.objects.find(obj => obj.id === id);
    
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

  // Acción para iniciar el gate (clic sostenido)
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

  // Acción para detener el gate (liberar clic)
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

  // Acción para limpiar todos los objetos
  clearAllObjects: () => {
    set({
      objects: [],
      selectedEntityId: null,
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
    
    set((state) => ({
      effectZones: [...state.effectZones, newEffectZone],
    }));
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
    
    set((state) => ({
      effectZones: state.effectZones.map((zone) =>
        zone.id === id ? { ...zone, ...updates } : zone
      ),
    }));
  },

  removeEffectZone: (id: string) => {
    // Eliminar el efecto global del AudioManager
    try {
      audioManager.removeGlobalEffect(id);
      console.log(`✅ Efecto global eliminado para zona ${id}`);
    } catch (error) {
      console.error(`❌ Error al eliminar efecto global:`, error);
    }
    
    set((state) => ({
      effectZones: state.effectZones.filter((zone) => zone.id !== id),
      selectedEntityId: state.selectedEntityId === id ? null : state.selectedEntityId,
    }));
  },

  toggleLockEffectZone: (id: string) => {
    set((state) => ({
      effectZones: state.effectZones.map((zone) =>
        zone.id === id ? { ...zone, isLocked: !zone.isLocked } : zone
      ),
    }));
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

}));
