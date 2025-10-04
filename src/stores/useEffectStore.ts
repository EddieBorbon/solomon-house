import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { audioManager } from '../lib/AudioManager';

// Tipos para zonas de efectos
export type EffectType = 'phaser' | 'autoFilter' | 'autoWah' | 'bitCrusher' | 'chebyshev' | 'chorus' | 'distortion' | 'feedbackDelay' | 'freeverb' | 'frequencyShifter' | 'jcReverb' | 'pingPongDelay' | 'pitchShift' | 'reverb' | 'stereoWidener' | 'tremolo' | 'vibrato';

// Interfaz para una zona de efecto
export interface EffectZone {
  id: string;
  type: EffectType;
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
}

// Estado específico para efectos
export interface EffectState {
  effectZones: EffectZone[];
  isEditingEffectZone: boolean;
}

// Acciones específicas para efectos
export interface EffectActions {
  // Acciones básicas de efectos
  addEffectZone: (type: EffectType, position: [number, number, number], shape?: 'sphere' | 'cube', gridId?: string) => EffectZone;
  removeEffectZone: (id: string, gridId?: string) => void;
  updateEffectZone: (id: string, updates: Partial<Omit<EffectZone, 'id'>>, gridId?: string) => void;
  
  // Acciones de gestión de efectos
  toggleLockEffectZone: (id: string, gridId?: string) => void;
  setEditingEffectZone: (isEditing: boolean) => void;
  refreshAllEffects: () => void;
  debugAudioChain: (soundId: string) => void;
  
  // Acciones de consulta
  getEffectZoneById: (id: string, gridId?: string) => EffectZone | null;
  getAllEffectZones: (gridId?: string) => EffectZone[];
  clearAllEffectZones: (gridId?: string) => void;
}

// Parámetros por defecto para cada tipo de efecto
const getDefaultEffectParams = (type: EffectType): Record<string, unknown> => {
  switch (type) {
    case 'phaser':
      return {
        frequency: 1000,
        octaves: 2,
        stages: 2,
        Q: 10,
      };
    case 'autoFilter':
      return {
        frequency: 1,
        octaves: 2,
        baseFrequency: 200,
        depth: 0.5,
        filterType: 'lowpass',
        filterQ: 1,
        lfoType: 'sine',
      };
    case 'autoWah':
      return {
        frequency: 1,
        octaves: 2,
        baseFrequency: 200,
        sensitivity: 0.5,
        rolloff: -12,
        attack: 0.1,
        release: 0.1,
      };
    case 'bitCrusher':
      return {
        frequency: 1,
        octaves: 2,
        baseFrequency: 200,
        bits: 4,
        normFreq: 0.5,
      };
    case 'chebyshev':
      return {
        frequency: 1,
        octaves: 2,
        baseFrequency: 200,
        order: 50,
        oversample: 'none',
      };
    case 'chorus':
      return {
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
    case 'distortion':
      return {
        frequency: 1,
        octaves: 2,
        baseFrequency: 200,
        distortion: 0.4,
        oversample: 'none',
      };
    case 'feedbackDelay':
      return {
        delayTime: '8n',
        feedback: 0.5,
      };
    case 'freeverb':
      return {
        roomSize: 0.7,
        dampening: 3000,
      };
    case 'frequencyShifter':
      return {
        frequency: 0,
      };
    case 'jcReverb':
      return {
        roomSize: 0.5,
      };
    case 'pingPongDelay':
      return {
        pingPongDelayTime: '4n',
        pingPongFeedback: 0.2,
        maxDelay: 1.0,
        wet: 0.5,
      };
    case 'pitchShift':
      return {
        pitchShift: 0,
        windowSize: 0.1,
        delayTime: 0,
        feedback: 0,
      };
    case 'reverb':
      return {
        decay: 1.5,
        preDelay: 0.01,
        wet: 0.5,
      };
    case 'stereoWidener':
      return {
        width: 0.5,
        wet: 0.5,
      };
    case 'tremolo':
      return {
        tremoloFrequency: 10,
        tremoloDepth: 0.5,
        wet: 0.5,
        tremoloSpread: 180,
        tremoloType: 'sine',
      };
    case 'vibrato':
      return {
        vibratoFrequency: 5,
        vibratoDepth: 0.1,
        wet: 0.5,
        vibratoType: 'sine',
        vibratoMaxDelay: 0.005,
      };
    default:
      return {};
  }
};

/**
 * Store especializado para gestión de zonas de efectos
 * Implementa Single Responsibility Principle
 */
export const useEffectStore = create<EffectState & EffectActions>((set, get) => ({
  // Estado inicial
  effectZones: [],
  isEditingEffectZone: false,

  // Acciones básicas de efectos
  addEffectZone: (type: EffectType, position: [number, number, number], shape: 'sphere' | 'cube' = 'sphere') => {

    // Obtener parámetros por defecto
    const defaultParams = getDefaultEffectParams(type);
    
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


    // Crear el efecto global en el AudioManager
    try {
      audioManager.createGlobalEffect(newEffectZone.id, type, newEffectZone.position);
    } catch (error) {
      throw error;
    }

    // Agregar zona de efecto al estado local
    set((state) => ({
      effectZones: [...state.effectZones, newEffectZone]
    }));

    return newEffectZone;
  },

  removeEffectZone: (id: string) => {

    // Eliminar el efecto global del AudioManager
    try {
      audioManager.removeGlobalEffect(id);
    } catch {
    }

    // Eliminar zona de efecto del estado local
    set((state) => ({
      effectZones: state.effectZones.filter(zone => zone.id !== id)
    }));

  },

  updateEffectZone: (id: string, updates: Partial<Omit<EffectZone, 'id'>>) => {
    console.log('🔧 useEffectStore: updateEffectZone called', { id, updates });

    // Si se actualiza la posición, actualizar también en el AudioManager
    if (updates.position) {
      try {
        console.log('🔧 useEffectStore: Updating position', updates.position);
        audioManager.updateEffectZonePosition(id, updates.position);
      } catch (error) {
        console.error('❌ useEffectStore: Error updating position:', error);
      }
    }

    // Si se actualizan los parámetros del efecto, actualizar también en el AudioManager
    if (updates.effectParams) {
      try {
        console.log('🔧 useEffectStore: Updating effect params', updates.effectParams);
        
        // Si se cambió el radio, actualizarlo en el AudioManager
        if (updates.effectParams.radius !== undefined) {
          audioManager.setEffectZoneRadius(id, updates.effectParams.radius);
        }
        
        // Actualizar otros parámetros del efecto
        audioManager.updateGlobalEffect(id, updates.effectParams);
        console.log('✅ useEffectStore: Effect params updated successfully');
      } catch (error) {
        console.error('❌ useEffectStore: Error updating effect params:', error);
      }
    }

    // Actualizar zona de efecto en el estado local
    set((state) => ({
      effectZones: state.effectZones.map(zone => 
        zone.id === id ? { ...zone, ...updates } : zone
      )
    }));

  },

  // Acciones de gestión de efectos
  toggleLockEffectZone: (id: string) => {

    set((state) => ({
      effectZones: state.effectZones.map(zone =>
        zone.id === id ? { ...zone, isLocked: !zone.isLocked } : zone
      )
    }));

  },

  setEditingEffectZone: (isEditing: boolean) => {
    set({ isEditingEffectZone: isEditing });
  },

  refreshAllEffects: () => {
    try {
      audioManager.refreshAllGlobalEffects();
    } catch {
    }
  },

  debugAudioChain: (soundId: string) => {
    try {
      audioManager.debugAudioChain(soundId);
    } catch {
    }
  },

  // Acciones de consulta
  getEffectZoneById: (id: string) => {
    const zone = get().effectZones.find(zone => zone.id === id);
    return zone || null;
  },

  getAllEffectZones: () => {
    const zones = get().effectZones;
    return zones;
  },

  clearAllEffectZones: () => {
    
    // Eliminar todas las zonas de efectos del AudioManager
    const zones = get().effectZones;
    zones.forEach(zone => {
      try {
        audioManager.removeGlobalEffect(zone.id);
      } catch {
      }
    });

    // Limpiar zonas de efectos del estado local
    set({ effectZones: [] });

  }
}));