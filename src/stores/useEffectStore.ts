import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { audioManager } from '../lib/AudioManager';
import { type EffectZone, type EffectType, type EffectZoneActions } from '../types/world';

interface EffectState {
  effectZones: EffectZone[];
  isEditingEffectZone: boolean;
}

export const useEffectStore = create<EffectState & EffectZoneActions>((set, get) => ({
  // Estado inicial
  effectZones: [],
  isEditingEffectZone: false,

  // Acciones para gestión de zonas de efectos
  addEffectZone: (type: EffectType, position: [number, number, number], shape: 'sphere' | 'cube' = 'sphere') => {
    // Configurar parámetros por defecto según el tipo de efecto
    let defaultParams: Record<string, unknown> = {};
    
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
      effectZones: [...state.effectZones, newEffectZone]
    }));

    console.log(`🎛️ Añadiendo zona de efecto ${type} en posición ${newEffectZone.position}`);
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
      effectZones: state.effectZones.map(zone =>
        zone.id === id ? { ...zone, ...updates } : zone
      )
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
      effectZones: state.effectZones.filter(zone => zone.id !== id)
    }));
  },

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

  // Implementación de EntityActions
  add: (entity: Omit<EffectZone, 'id'>) => {
    const newEffectZone: EffectZone = {
      id: uuidv4(),
      ...entity
    };
    
    set((state) => ({
      effectZones: [...state.effectZones, newEffectZone]
    }));
  },

  update: (id: string, updates: Partial<Omit<EffectZone, 'id'>>) => {
    get().updateEffectZone(id, updates);
  },

  remove: (id: string) => {
    get().removeEffectZone(id);
  },

  select: (id: string | null) => {
    set((state) => ({
      effectZones: state.effectZones.map((zone) => ({
        ...zone,
        isSelected: zone.id === id,
      }))
    }));
  },

  getById: (id: string) => {
    const state = get();
    return state.effectZones.find(zone => zone.id === id);
  },

  getAll: () => {
    const state = get();
    return state.effectZones;
  },
}));
