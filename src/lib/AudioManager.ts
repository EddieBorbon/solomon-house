import * as Tone from 'tone';
import * as THREE from 'three';
import { SoundSourceFactory, AudioParams, SoundObjectType, SoundSource } from './factories/SoundSourceFactory';
import { EffectManager, EffectType, GlobalEffect } from './managers/EffectManager';
import { SpatialAudioManager, SpatialAudioConfig, ListenerState } from './managers/SpatialAudioManager';

// Re-exportar tipos para mantener compatibilidad
export type { AudioParams, SoundObjectType, SoundSource, EffectType, GlobalEffect, SpatialAudioConfig, ListenerState };

export class AudioManager {
  private static instance: AudioManager;
  private soundSources: Map<string, SoundSource> = new Map();
  private isContextStarted: boolean = false;
  private playingSounds: Set<string> = new Set(); // Rastrear qué sonidos están activos
  private lastListenerPosition: string = ''; // Para reducir logs del listener
  private lastSendAmounts: Map<string, number> = new Map(); // Para reducir logs de send amounts
  private soundSourceFactory: SoundSourceFactory;
  private effectManager: EffectManager;
  private spatialAudioManager: SpatialAudioManager;

  private constructor() {
    // Constructor privado para Singleton
    this.soundSourceFactory = new SoundSourceFactory();
    this.effectManager = new EffectManager();
    this.spatialAudioManager = new SpatialAudioManager();
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  /**
   * Crea un efecto global con espacialización independiente
   */
  public createGlobalEffect(effectId: string, type: EffectType, position: [number, number, number]): void {
    this.effectManager.createGlobalEffect(effectId, type, position);
    
    // Crear sends para todas las fuentes de sonido existentes
    const effectData = this.effectManager.getGlobalEffect(effectId);
    if (effectData) {
      this.soundSources.forEach((source, sourceId) => {
        this.addEffectSendToSource(sourceId, effectId, effectData.effectNode);
      });
      console.log(`🎛️ AudioManager: Sends creados para ${this.soundSources.size} fuentes de sonido`);
    }
  }

  /**
   * Añade un send de efecto a una fuente de sonido existente
   */
  private addEffectSendToSource(sourceId: string, effectId: string, effectNode: any): void {
    try {
      const source = this.soundSources.get(sourceId);
      if (!source) {
        console.warn(`⚠️ AudioManager: No se encontró fuente de sonido ${sourceId} para crear send de efecto`);
        return;
      }

      // Crear el send de efecto
      const send = new Tone.Gain(0); // Inicialmente silenciado
      source.effectSends.set(effectId, send);
      
      // Conectar synth -> send -> efecto
      source.synth.connect(send);
      send.connect(effectNode);
      
      console.log(`🎛️ AudioManager: Send de efecto ${effectId} creado para fuente ${sourceId} con gain inicial: ${send.gain.value}`);
      
      // Verificar que el send se creó correctamente
      console.log(`🔍 AudioManager: Verificando send - ID: ${effectId}, Gain: ${send.gain.value}`);
      
      // Verificar las conexiones del send
      console.log(`🔍 AudioManager: Conexiones del send ${effectId}:`, {
        input: send.numberOfInputs,
        output: send.numberOfOutputs,
        gainValue: send.gain.value
      });
    } catch (error) {
      console.error(`❌ AudioManager: Error al crear send de efecto:`, error);
    }
  }



  /**
   * Obtiene un efecto global por ID
   */
  public getGlobalEffect(effectId: string): GlobalEffect | undefined {
    return this.effectManager.getGlobalEffect(effectId);
  }

  /**
   * Actualiza los parámetros de un efecto global
   */
  public updateGlobalEffect(effectId: string, params: any): void {
    this.effectManager.updateGlobalEffect(effectId, params);
  }

  /**
   * Fuerza la actualización de un efecto global reiniciando su oscilador de prueba
   */
  public refreshGlobalEffect(effectId: string): void {
    this.effectManager.refreshGlobalEffect(effectId);
  }

  /**
   * Elimina un efecto global
   */
  public removeGlobalEffect(effectId: string): void {
    // Limpiar todas las conexiones a fuentes de sonido antes de eliminar
    this.cleanupEffectSourceConnections(effectId);
    
    // Eliminar el efecto usando el EffectManager
    this.effectManager.removeGlobalEffect(effectId);
  }

  /**
   * Fuerza la actualización de todos los efectos globales activos
   */
  public refreshAllGlobalEffects(): void {
    this.effectManager.refreshAllGlobalEffects();
  }



  /**
   * Fuerza la actualización de un efecto específico con estrategias optimizadas
   */
  public forceEffectUpdate(effectId: string, paramName: string, newValue: any): void {
    this.effectManager.forceEffectUpdate(effectId, paramName, newValue);
  }

  /**
   * Limpia todas las conexiones de una fuente de sonido a efectos específicos
   */
  private cleanupSourceEffectConnections(soundSourceId: string): void {
    try {
      const source = this.soundSources.get(soundSourceId);
      if (!source) return;

      // Limpiar todos los sends de efectos
      source.effectSends.forEach((send, effectId) => {
        try {
          send.disconnect();
        } catch (error) {
          // Manejo silencioso de errores
        }
      });
    } catch (error) {
      // Manejo silencioso de errores
    }
  }

  /**
   * Limpia todas las conexiones de un efecto global a fuentes de sonido
   */
  private cleanupEffectSourceConnections(effectId: string): void {
    try {
      // Limpiar todas las conexiones desde fuentes de sonido a este efecto
      this.soundSources.forEach((source, sourceId) => {
        try {
          const effectSend = source.effectSends.get(effectId);
          if (effectSend) {
            effectSend.disconnect();
          }
        } catch (error) {
          // Manejo silencioso de errores
        }
      });
    } catch (error) {
      // Manejo silencioso de errores
    }
  }

  /**
   * Controla la cantidad de señal enviada a un efecto específico (REFACTORIZADO para Crossfade)
   */
  public setEffectSendAmount(soundSourceId: string, effectId: string, amount: number): void {
    try {
      const source = this.soundSources.get(soundSourceId);
      if (!source) {
        return;
      }

      const effectData = this.effectManager.getGlobalEffect(effectId);
      if (!effectData) {
        return;
      }

      // Buscar el send de efecto específico
      const effectSend = source.effectSends.get(effectId);
      if (!effectSend) {
        return;
      }

      // VERIFICACIÓN ROBUSTA DEL CONTEXTO DE AUDIO
      if (!effectSend.context || !source.dryGain.context) {
        return;
      }
      
      // Verificar que el contexto esté en estado 'running'
      if (effectSend.context.state !== 'running' || source.dryGain.context.state !== 'running') {
        return;
      }
      
      // Verificar que los nodos no estén dispuestos
      if (effectSend.disposed || source.dryGain.disposed) {
        return;
      }
      
      try {
        // IMPLEMENTAR CROSSFADE INTUITIVO: 
        // - Fuera de la zona: solo señal seca (dryGain = 1, effectSend = 0)
        // - Dentro de la zona: solo señal del efecto (dryGain = 0, effectSend = 1)
        const effectAmount = Math.max(0, Math.min(1, amount)); // Clampear entre 0 y 1
        
        // SOLUCIÓN ROBUSTA: Usar setValueAtTime en lugar de rampTo para cambios inmediatos
        const dryAmount = Math.max(0, Math.min(1, 1 - effectAmount));
        
        // Ajustar el nivel del efecto (señal mojada) - CAMBIO INMEDIATO
        effectSend.gain.setValueAtTime(effectAmount, Tone.now());
        
        // Ajustar el nivel de la señal seca (complementario al efecto) - CAMBIO INMEDIATO
        source.dryGain.gain.setValueAtTime(dryAmount, Tone.now());
        
        // Solo loggear cambios significativos en el send amount (cada 0.1 unidades)
        const currentSendAmount = Math.round(amount * 10) / 10;
        const key = `${soundSourceId}-${effectId}`;
        if (this.lastSendAmounts.get(key) !== currentSendAmount) {
          this.lastSendAmounts.set(key, currentSendAmount);
        }
      } catch (rampError) {
        // Intentar limpieza de emergencia si hay error crítico
        if (rampError instanceof Error && rampError.message.includes('InvalidAccessError')) {
          this.emergencyCleanup();
        }
      }
    } catch (error) {
      // Ejecutar limpieza de emergencia para errores críticos
      this.emergencyCleanup();
    }
  }

  /**
   * Limpieza de emergencia para errores críticos
   */
  public emergencyCleanup(): void {
    try {
      // Limpiar inmediatamente sin verificaciones adicionales
      this.playingSounds.clear();
      this.lastSendAmounts.clear();
      
      // Limpiar efectos usando el EffectManager
      this.effectManager.cleanup();
      
      // Forzar limpieza de conexiones
      this.soundSources.clear();
    } catch (error) {
      // Manejo silencioso de errores
    }
  }

  /**
   * Limpia todas las conexiones y recursos del AudioManager
   */
  public cleanup(): void {
    try {
      // Detener todos los sonidos activos
      this.playingSounds.forEach(soundId => {
        try {
          const source = this.soundSources.get(soundId);
          if (source) {
            source.synth.triggerRelease(Tone.now());
          }
        } catch (error) {
          // Manejo silencioso de errores
        }
      });
      this.playingSounds.clear();
      
      // Limpiar todas las conexiones de fuentes de sonido
      this.soundSources.forEach((source, sourceId) => {
        try {
          this.cleanupSourceEffectConnections(sourceId);
        } catch (error) {
          // Manejo silencioso de errores
        }
      });
      
      // Limpiar todos los efectos usando el EffectManager
      this.effectManager.cleanup();
      
      // Limpiar el Map de send amounts
      this.lastSendAmounts.clear();
    } catch (error) {
      // Manejo silencioso de errores
    }
  }

  /**
   * Inicia el contexto de audio de Tone.js
   */
  public async startContext(): Promise<boolean> {
    try {
      if (Tone.context.state !== 'running') {
        await Tone.start();
        this.isContextStarted = true;
        
        // Configurar limpieza automática cuando se suspenda el contexto
        Tone.context.on('statechange', (newState) => {
          if (newState === 'suspended') {
            this.cleanup();
          }
        });

        // Configurar limpieza automática cuando se cierre la ventana
        if (typeof window !== 'undefined') {
          window.addEventListener('beforeunload', () => {
            this.cleanup();
          });

          // Limpieza cuando la página pierde el foco (opcional)
          window.addEventListener('blur', () => {
            this.cleanup();
          });
        }
        
        return true;
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Crea una nueva fuente de sonido usando la factory
   */
  public createSoundSource(
    id: string, 
    type: SoundObjectType, 
    params: AudioParams, 
    position: [number, number, number]
  ): void {
    // Verificar si ya existe una fuente con este ID
    if (this.soundSources.has(id)) {
      return;
    }

    try {
      // Usar la factory para crear la fuente de sonido
      const soundSource = this.soundSourceFactory.createSoundSource(
        id, 
        type, 
        params, 
        position, 
        this.effectManager.getAllGlobalEffects()
      );

      // Almacenar en el Map
      this.soundSources.set(id, soundSource);
      
      // Configurar la mezcla inicial de efectos basada en la posición
      console.log(`🎵 AudioManager: Configurando mezcla inicial de efectos para sonido ${id}`);
      this.updateSoundEffectMixing(id, position);
    } catch (error) {
      console.error(`❌ AudioManager: Error al crear fuente de sonido:`, error);
    }
  }

  /**
   * Elimina una fuente de sonido
   */
  public removeSoundSource(id: string): void {
    const source = this.soundSources.get(id);
    if (!source) {
      return;
    }

    try {
      // Detener el sonido si está sonando
      if (this.playingSounds.has(id)) {
        source.synth.triggerRelease(Tone.now());
      }

      // Limpiar todas las conexiones a efectos antes de eliminar
      this.cleanupSourceEffectConnections(id);

      // Desconectar todas las conexiones antes de disponer
      try {
        // Desconectar del panner
        source.panner.disconnect();
        // Desconectar del dryGain
        source.dryGain.disconnect();
        // Desconectar del synth
        source.synth.disconnect();
        
        // Desconectar todos los sends de efectos
        source.effectSends.forEach((send) => {
          try {
            send.disconnect();
          } catch (sendError) {
            // Manejo silencioso de errores
          }
        });
      } catch (disconnectError) {
        // Manejo silencioso de errores
      }

      // Limpiar recursos
      source.synth.dispose();
      source.panner.dispose();
      source.dryGain.dispose(); // Disponer el control de volumen seco
      
      // Disponer todos los sends de efectos
      source.effectSends.forEach((send) => {
        try {
          send.dispose();
        } catch (sendError) {
          // Manejo silencioso de errores
        }
      });

      // Eliminar del Map y limpiar el estado
      this.soundSources.delete(id);
      this.playingSounds.delete(id); // Asegurarse de limpiar el estado
    } catch (error) {
      // Manejo silencioso de errores
    }
  }

  /**
   * Inicia el sonido continuo de una fuente (completamente independiente de las interacciones de clic)
   */
  public startContinuousSound(id: string, params: AudioParams): void {
    const source = this.soundSources.get(id);
    if (!source || this.playingSounds.has(id)) {
      return;
    }

    try {
      // Aplicar TODOS los parámetros antes de iniciar
      this.updateSoundParams(id, params);
      
      // Para PolySynth, usar triggerAttack con acordes (sonido continuo)
      if (source.synth instanceof Tone.PolySynth) {
        // Generar acorde basado en la frecuencia base si está disponible
        let chord = params.chord || ["C4", "E4", "G4"];
        
        // Si hay frecuencia base, transponer el acorde
        if (params.frequency && params.frequency > 0) {
          // Convertir frecuencia a nota más cercana
          const baseNote = this.frequencyToNote(params.frequency);
          chord = this.generateChordFromBase(baseNote, params.chord || ["C4", "E4", "G4"]);
        }
        
        source.synth.triggerAttack(chord, this.getUniqueStartTime());
        this.playingSounds.add(id);
        return;
      }
      
      // Para todos los demás sintetizadores, usar triggerAttack para sonido continuo
      // NO usar triggerAttackRelease aquí, solo triggerAttack para mantener el sonido
      try {
        (source.synth as any).triggerAttack(params.frequency, this.getUniqueStartTime());
        this.playingSounds.add(id); // Marcar como sonando
      } catch (error) {
        // Fallback: intentar con triggerAttackRelease si está disponible
        if ('triggerAttackRelease' in source.synth) {
          try {
            const fallbackDuration = 0.5; // Duración corta como fallback
            (source.synth as any).triggerAttackRelease(params.frequency, fallbackDuration, this.getUniqueStartTime());
            this.playingSounds.add(id);
          } catch (fallbackError) {
            // Manejo silencioso de errores
          }
        }
      }
    } catch (error) {
      // Manejo silencioso de errores
    }
  }

  /**
   * Inicia el sonido de una fuente (para gate y sonidos temporales)
   */
  public startSound(id: string, params: AudioParams): void {
    const source = this.soundSources.get(id);
    if (!source || this.playingSounds.has(id)) {
      return;
    }

    try {
      // Aplicar TODOS los parámetros antes de iniciar
      this.updateSoundParams(id, params);
      
      // Para PolySynth, usar triggerAttack con acordes
      if (source.synth instanceof Tone.PolySynth) {
        // Generar acorde basado en la frecuencia base si está disponible
        let chord = params.chord || ["C4", "E4", "G4"];
        
        // Si hay frecuencia base, transponer el acorde
        if (params.frequency && params.frequency > 0) {
          // Convertir frecuencia a nota más cercana
          const baseNote = this.frequencyToNote(params.frequency);
          chord = this.generateChordFromBase(baseNote, params.chord || ["C4", "E4", "G4"]);
        }
        
        source.synth.triggerAttack(chord, Tone.now());
        this.playingSounds.add(id);
        return;
      }
      
      // Para MonoSynth y otros sintetizadores, usar triggerAttack para sonido continuo
      // El triggerRelease se llamará cuando se detenga el sonido
      try {
        (source.synth as any).triggerAttack(params.frequency, Tone.now());
        this.playingSounds.add(id); // Marcar como sonando
      } catch (error) {
        // Fallback: intentar con triggerAttackRelease si está disponible
        if ('triggerAttackRelease' in source.synth) {
          try {
            const fallbackDuration = 0.5; // Duración corta como fallback
            (source.synth as any).triggerAttackRelease(params.frequency, fallbackDuration, Tone.now());
            this.playingSounds.add(id);
          } catch (fallbackError) {
            // Manejo silencioso de errores
          }
        }
      }
    } catch (error) {
      // Manejo silencioso de errores
    }
  }

  /**
   * Detiene el sonido de una fuente
   */
  public stopSound(id: string): void {
    const source = this.soundSources.get(id);
    if (!source) {
      return;
    }

    // No verificar si está sonando, siempre intentar detener
    try {
      // Para PolySynth, usar releaseAll para detener todas las voces
      if (source.synth instanceof Tone.PolySynth) {
        source.synth.releaseAll(Tone.now());
        this.playingSounds.delete(id);
        return;
      }
      
      // triggerRelease inicia la fase de 'release' de la envolvente.
      // El sintetizador se encargará de detener el oscilador cuando la envolvente llegue a cero.
      source.synth.triggerRelease(Tone.now());
      
      this.playingSounds.delete(id); // Marcar como no sonando
    } catch (error) {
      // Aún así, marcar como no sonando
      this.playingSounds.delete(id);
    }
  }

  /**
   * Dispara una nota percusiva (especialmente para MembraneSynth y Sampler)
   */
  public triggerNoteAttack(id: string, params: AudioParams): void {
    const source = this.soundSources.get(id);
    if (!source) {
      return;
    }

    try {
      // Aplicar parámetros antes de disparar
      this.updateSoundParams(id, params);
      
      // Para Sampler, usar triggerAttackRelease con notas y duración
      if (source.synth instanceof Tone.Sampler) {
        try {
          const notes = params.notes || ["C4"];
          const duration = params.duration || 1.0;
          source.synth.triggerAttackRelease(notes, duration, Tone.now());
          return;
        } catch (samplerError) {
          // Si el Sampler falla, usar el fallback como un sintetizador normal
          const duration = params.duration || 0.5;
          const frequency = this.getNoteFrequency(params.notes?.[0] || "C4");
          (source.synth as any).triggerAttackRelease(frequency, duration, Tone.now());
          return;
        }
      }
      
      // Para sintetizadores de fallback (cuando el Sampler no pudo cargar)
      if ((source.synth as any)._isFallback) {
        const notes = Array.isArray(params.notes) ? params.notes : [params.notes || "C4"];
        const duration = params.duration || 0.5;
        
        // Reproducir cada nota del acorde
        notes.forEach((note: string, index: number) => {
          const frequency = this.getNoteFrequency(note);
          const delay = index * 0.1; // Pequeño delay entre notas para efecto de acorde
          setTimeout(() => {
            try {
              (source.synth as any).triggerAttackRelease(frequency, duration, Tone.now());
            } catch (error) {
              // Manejo silencioso de errores
            }
          }, delay * 1000);
        });
        return;
      }
      
      // Para PluckSynth, usar triggerAttack sin triggerRelease ya que decae naturalmente
      if (source.synth instanceof Tone.PluckSynth) {
        source.synth.triggerAttack(params.frequency, Tone.now());
        return;
      }
      
      // Para todos los demás sintetizadores, usar triggerAttackRelease con duración configurada o triggerAttack para duración infinita
      const duration = params.duration;
      
      if (duration === Infinity) {
        // Duración infinita - usar triggerAttack para sonido continuo
        (source.synth as any).triggerAttack(params.frequency, Tone.now());
      } else if ('triggerAttackRelease' in source.synth) {
        // Duración finita - usar triggerAttackRelease
        const actualDuration = duration || 0.5; // Usar duración configurada o 0.5 por defecto
        (source.synth as any).triggerAttackRelease(params.frequency, actualDuration, Tone.now());
      } else {
        // Fallback para sintetizadores que no soportan triggerAttackRelease
        try {
          (source.synth as any).triggerAttack(params.frequency, Tone.now());
        } catch (fallbackError) {
          // Último recurso: intentar con triggerAttack en el sintetizador principal
          if (typeof (source.synth as any).triggerAttack === 'function') {
            (source.synth as any).triggerAttack(params.frequency, Tone.now());
          }
        }
      }
    } catch (error) {
      // Manejo silencioso de errores
    }
  }

  /**
   * Dispara una nota con duración específica (para interacción de clic corto)
   * Este método funciona universalmente con todos los tipos de sintetizadores
   */
  public triggerAttackRelease(id: string, params: AudioParams): void {
    const source = this.soundSources.get(id);
    if (!source) {
      return;
    }

    try {
      // Aplicar parámetros antes de disparar
      this.updateSoundParams(id, params);
      
      // Para PolySynth, usar triggerAttackRelease con acordes
      if (source.synth instanceof Tone.PolySynth) {
        let chord = params.chord || ["C4", "E4", "G4"];
        
        // Si hay frecuencia base, transponer el acorde
        if (params.frequency && params.frequency > 0) {
          const baseNote = this.frequencyToNote(params.frequency);
          chord = this.generateChordFromBase(baseNote, params.chord || ["C4", "E4", "G4"]);
        }
        
        const duration = params.duration || '8n';
        source.synth.triggerAttackRelease(chord, duration, Tone.now());
        return;
      }
      
      // Para Sampler, usar triggerAttackRelease con notas
      if (source.synth instanceof Tone.Sampler) {
        const notes = params.notes || ["C4"];
        const duration = params.duration || '8n';
        source.synth.triggerAttackRelease(notes, duration, Tone.now());
        return;
      }
      
      // Para sintetizadores de fallback
      if ((source.synth as any)._isFallback) {
        const notes = Array.isArray(params.notes) ? params.notes : [params.notes || "C4"];
        const duration = params.duration || '8n';
        
        notes.forEach((note: string, index: number) => {
          const frequency = this.getNoteFrequency(note);
          const delay = index * 0.1;
          setTimeout(() => {
            try {
              (source.synth as any).triggerAttackRelease(frequency, duration, Tone.now());
            } catch (error) {
              // Manejo silencioso de errores
            }
          }, delay * 1000);
        });
        return;
      }
      
      // Para todos los demás sintetizadores, usar triggerAttackRelease universal
      if ('triggerAttackRelease' in source.synth) {
        const frequency = params.frequency;
        const duration = params.duration || '8n';
        
        (source.synth as any).triggerAttackRelease(frequency, duration, Tone.now());
      } else {
        // Fallback: usar triggerAttack con duración manual
        const frequency = params.frequency;
        const duration = params.duration || 0.5;
        
        (source.synth as any).triggerAttack(frequency, Tone.now());
        setTimeout(() => {
          try {
            (source.synth as any).triggerRelease(Tone.now());
          } catch (error) {
            // Manejo silencioso de errores
          }
        }, duration * 1000);
      }
    } catch (error) {
      // Manejo silencioso de errores
    }
  }

  /**
   * Dispara un ataque de ruido (especialmente para NoiseSynth)
   */
  public triggerNoiseAttack(id: string, params: AudioParams): void {
    const source = this.soundSources.get(id);
    if (!source) {
      return;
    }

    try {
      // Aplicar parámetros antes de disparar
      this.updateSoundParams(id, params);
      
      // Para NoiseSynth, usar triggerAttackRelease con duración
      if (source.synth instanceof Tone.NoiseSynth) {
        const duration = params.duration || 0.1; // Duración por defecto para ruido
        source.synth.triggerAttackRelease(duration, Tone.now());
      }
    } catch (error) {
      // Manejo silencioso de errores
    }
  }

  /**
   * Actualiza los parámetros de sonido de una fuente
   */
  public updateSoundParams(id: string, params: Partial<AudioParams>): void {
    const source = this.soundSources.get(id);
    if (!source) {
      return;
    }

    try {
      // Actualizar parámetros específicos del PolySynth
      if (source.synth instanceof Tone.PolySynth) {
        // Actualizar polyphony si cambia
        if (params.polyphony !== undefined) {
          source.synth.maxPolyphony = params.polyphony;
        }
        
        // Actualizar parámetros de las voces FMSynth
        if (params.harmonicity !== undefined || params.modulationIndex !== undefined || 
            params.attack !== undefined || params.release !== undefined) {
          const voiceOptions: any = {};
          
          if (params.harmonicity !== undefined) {
            voiceOptions.harmonicity = params.harmonicity;
          }
          if (params.modulationIndex !== undefined) {
            voiceOptions.modulationIndex = params.modulationIndex;
          }
          if (params.attack !== undefined || params.release !== undefined) {
            voiceOptions.envelope = {};
            if (params.attack !== undefined) {
              voiceOptions.envelope.attack = params.attack;
            }
            if (params.release !== undefined) {
              voiceOptions.envelope.release = params.release;
            }
          }
          
          source.synth.set(voiceOptions);
        }
      }

      // Actualizar frecuencia si cambia - usar rampTo en la señal de frecuencia del sintetizador
      if (params.frequency !== undefined && !(source.synth instanceof Tone.PolySynth)) {
        // Asegurar que la frecuencia sea al menos 20Hz (límite inferior del oído humano)
        const safeFrequency = Math.max(params.frequency, 20);
        
        // Verificar si el sintetizador tiene la propiedad frequency (NoiseSynth no la tiene)
        if ('frequency' in source.synth && source.synth.frequency) {
          // --- CAMBIO CLAVE: Usar rampTo en la señal de frecuencia del sintetizador ---
          source.synth.frequency.rampTo(safeFrequency, 0.05);
        } else if (source.synth instanceof Tone.PluckSynth) {
          // Para PluckSynth, usar toFrequency
          // Para PluckSynth, usar toFrequency
          (source.synth as Tone.PluckSynth).toFrequency(safeFrequency);
        }
      }

      // Actualizar parámetros específicos del PluckSynth (torus)
      if (source.synth instanceof Tone.PluckSynth) {
        // Es un PluckSynth
        const pluckSynth = source.synth as Tone.PluckSynth;
        
        // Actualizar attackNoise
        if (params.attackNoise !== undefined) {
          pluckSynth.attackNoise = params.attackNoise;
        }
        
        // Actualizar dampening
        if (params.dampening !== undefined) {
          pluckSynth.dampening = params.dampening;
        }
        
        // Actualizar resonance
        if (params.resonance !== undefined) {
          pluckSynth.resonance = params.resonance;
        }
      }

      // Actualizar tipo de onda si cambia
      if (params.waveform !== undefined) {
        // Manejar según el tipo de sintetizador
        if ('oscillator' in source.synth) {
          // AMSynth, FMSynth, MembraneSynth o MonoSynth
          (source.synth as Tone.AMSynth | Tone.FMSynth | Tone.MembraneSynth | Tone.MonoSynth).oscillator.type = params.waveform;
        } else if ('voice0' in source.synth) {
          // DuoSynth
          (source.synth as Tone.DuoSynth).voice0.oscillator.type = params.waveform;
        }
      }

      // Actualizar harmonicity si cambia (para AMSynth, FMSynth y MetalSynth)
      if (params.harmonicity !== undefined && 'harmonicity' in source.synth) {
        try {
          const harmonicity = (source.synth as Tone.AMSynth | Tone.FMSynth | Tone.MetalSynth).harmonicity;
          if (typeof harmonicity === 'object' && 'rampTo' in harmonicity) {
            harmonicity.rampTo(params.harmonicity, 0.05);
          } else {
            (source.synth as any).harmonicity = params.harmonicity;
          }
        } catch (error) {
          // Para MetalSynth, algunas propiedades pueden ser de solo lectura
        }
      }

      // Actualizar modulationIndex si cambia (para FMSynth y MetalSynth)
      if (params.modulationIndex !== undefined && 'modulationIndex' in source.synth) {
        try {
          const modulationIndex = (source.synth as Tone.FMSynth | Tone.MetalSynth).modulationIndex;
          if (typeof modulationIndex === 'object' && 'rampTo' in modulationIndex) {
            modulationIndex.rampTo(params.modulationIndex, 0.05);
          } else {
            (source.synth as any).modulationIndex = params.modulationIndex;
          }
        } catch (error) {
          // Para MetalSynth, algunas propiedades pueden ser de solo lectura
        }
      }

      // Actualizar forma de onda de modulación si cambia (para AMSynth y FMSynth)
      if (params.modulationWaveform !== undefined && 'modulation' in source.synth) {
        (source.synth as Tone.AMSynth | Tone.FMSynth).modulation.type = params.modulationWaveform;
      }

      // Actualizar parámetros específicos del DuoSynth
      if ('voice0' in source.synth) {
        // Es un DuoSynth
        const duoSynth = source.synth as Tone.DuoSynth;
        
        // Actualizar harmonicity
        if (params.harmonicity !== undefined) {
          duoSynth.harmonicity.rampTo(params.harmonicity, 0.05);
        }
        
        // Actualizar vibratoAmount
        if (params.vibratoAmount !== undefined) {
          duoSynth.vibratoAmount.rampTo(params.vibratoAmount, 0.05);
        }
        
        // Actualizar vibratoRate
        if (params.vibratoRate !== undefined) {
          duoSynth.vibratoRate.rampTo(params.vibratoRate, 0.05);
        }
        
        // Actualizar waveform2 (segunda voz)
        if (params.waveform2 !== undefined) {
          duoSynth.voice1.oscillator.type = params.waveform2;
        }
      }

      // Actualizar parámetros específicos del MembraneSynth
      if ('pitchDecay' in source.synth) {
        // Es un MembraneSynth
        const membraneSynth = source.synth as Tone.MembraneSynth;
        
        // Actualizar pitchDecay
        if (params.pitchDecay !== undefined) {
          membraneSynth.pitchDecay = params.pitchDecay;
        }
        
        // Actualizar octaves
        if (params.octaves !== undefined) {
          membraneSynth.octaves = params.octaves;
        }
      }

      // Actualizar parámetros específicos del MonoSynth
      if ('filterEnvelope' in source.synth) {
        // Es un MonoSynth
        const monoSynth = source.synth as Tone.MonoSynth;
        
        // Actualizar envolvente de amplitud
        if (params.ampAttack !== undefined) {
          monoSynth.envelope.attack = params.ampAttack;
        }
        if (params.ampDecay !== undefined) {
          monoSynth.envelope.decay = params.ampDecay;
        }
        if (params.ampSustain !== undefined) {
          monoSynth.envelope.sustain = params.ampSustain;
        }
        if (params.ampRelease !== undefined) {
          monoSynth.envelope.release = params.ampRelease;
        }
        
        // Actualizar envolvente de filtro
        if (params.filterAttack !== undefined) {
          monoSynth.filterEnvelope.attack = params.filterAttack;
        }
        if (params.filterDecay !== undefined) {
          monoSynth.filterEnvelope.decay = params.filterDecay;
        }
        if (params.filterSustain !== undefined) {
          monoSynth.filterEnvelope.sustain = params.filterSustain;
        }
        if (params.filterRelease !== undefined) {
          monoSynth.filterEnvelope.release = params.filterRelease;
        }
        if (params.filterBaseFreq !== undefined) {
          monoSynth.filterEnvelope.baseFrequency = params.filterBaseFreq;
        }
        if (params.filterOctaves !== undefined) {
          monoSynth.filterEnvelope.octaves = params.filterOctaves;
        }
        
        // Actualizar parámetros del filtro
        if (params.filterQ !== undefined) {
          monoSynth.filter.Q.value = params.filterQ;
        }
      }

      // Actualizar parámetros específicos del MetalSynth
      if ('resonance' in source.synth) {
        // Es un MetalSynth
        const metalSynth = source.synth as Tone.MetalSynth;
        
        // Actualizar resonance
        if (params.resonance !== undefined) {
          metalSynth.resonance = params.resonance;
        }
        
        // Actualizar octaves
        if (params.octaves !== undefined) {
          metalSynth.octaves = params.octaves;
        }
      }

      // Actualizar parámetros específicos del NoiseSynth
      if (source.synth instanceof Tone.NoiseSynth) {
        // Es un NoiseSynth
        const noiseSynth = source.synth as Tone.NoiseSynth;
        
        // Actualizar tipo de ruido
        if (params.noiseType !== undefined) {
          noiseSynth.noise.type = params.noiseType;
        }
        
        // Actualizar envolvente
        if (params.attack !== undefined) {
          noiseSynth.envelope.attack = params.attack;
        }
        if (params.decay !== undefined) {
          noiseSynth.envelope.decay = params.decay;
        }
        if (params.sustain !== undefined) {
          noiseSynth.envelope.sustain = params.sustain;
        }
      }

      // Actualizar parámetros específicos del Sampler
      if (source.synth instanceof Tone.Sampler) {
        // Es un Sampler
        const sampler = source.synth as Tone.Sampler;
        
        // Actualizar attack
        if (params.attack !== undefined) {
          // El Sampler hereda de Synth, por lo que tiene envelope
          if ('envelope' in sampler && sampler.envelope) {
            (sampler as any).envelope.attack = params.attack;
          }
        }
        
        // Actualizar release
        if (params.release !== undefined) {
          if ('envelope' in sampler && sampler.envelope) {
            (sampler as any).envelope.release = params.release;
          }
        }
        
        // Actualizar curve
        if (params.curve !== undefined) {
          if ('envelope' in sampler && sampler.envelope) {
            (sampler as any).envelope.curve = params.curve;
          }
        }
      }

      // Actualizar volumen si cambia
      if (params.volume !== undefined) {
        // Para síntesis AM, el volumen debe controlar tanto la amplitud como el volumen general
        if ('modulation' in source.synth) {
          // Es un AMSynth - aplicar volumen a la amplitud de la portadora
          const amplitudeValue = params.volume;
          (source.synth as Tone.AMSynth).oscillator.volume.rampTo(Tone.gainToDb(amplitudeValue), 0.05);
        }
        
        // Aplicar volumen general al sintetizador (control de salida)
        // El rango 0-0.1 se mapea a -Infinity a -20dB para mejor control
        const dbValue = params.volume > 0 ? Tone.gainToDb(params.volume * 10) : -Infinity;
        source.synth.volume.rampTo(dbValue, 0.05);
      }
    } catch (error) {
      // Manejo silencioso de errores
    }
  }

  /**
   * Actualiza la posición 3D de una zona de efecto
   */
  public updateEffectZonePosition(id: string, position: [number, number, number]): void {
    this.effectManager.updateEffectZonePosition(id, position);
    
    // Actualizar la mezcla de efectos para todos los objetos sonoros
    console.log(`🔄 AudioManager: Actualizando mezcla para ${this.soundSources.size} objetos sonoros después de mover zona de efecto`);
    this.soundSources.forEach((source, soundId) => {
      // Obtener la posición actual del objeto sonoro desde su panner
      const soundPosition: [number, number, number] = [
        source.panner.positionX.value,
        source.panner.positionY.value,
        source.panner.positionZ.value
      ];
      
      console.log(`🔄 AudioManager: Actualizando mezcla para sonido ${soundId} en posición [${soundPosition.join(', ')}]`);
      // Actualizar la mezcla para este objeto sonoro
      this.updateSoundEffectMixing(soundId, soundPosition);
    });
  }

  /**
   * Actualiza la posición 3D de una fuente de sonido
   */
  public updateSoundPosition(id: string, position: [number, number, number]): void {
    const source = this.soundSources.get(id);
    if (!source) {
      console.log(`⚠️ AudioManager: No se encontró fuente de sonido ${id} para actualizar posición`);
      return;
    }

    try {
      console.log(`📍 AudioManager: Actualizando posición de sonido ${id} a [${position.join(', ')}]`);
      
      // Actualizar la posición del panner usando el SpatialAudioManager
      this.spatialAudioManager.updatePannerPosition(source.panner, position);
      
      // Actualizar la mezcla de efectos basada en la nueva posición
      console.log(`🔄 AudioManager: Llamando a updateSoundEffectMixing para sonido ${id}`);
      this.updateSoundEffectMixing(id, position);
    } catch (error) {
      console.error(`❌ AudioManager: Error al actualizar posición de sonido:`, error);
    }
  }

  /**
   * Configura el radio de una zona de efectos
   */
  public setEffectZoneRadius(effectId: string, radius: number): void {
    this.effectManager.setEffectZoneRadius(effectId, radius);
    
    // Actualizar la mezcla de efectos para todos los objetos sonoros
    console.log(`🔄 AudioManager: Actualizando mezcla para ${this.soundSources.size} objetos sonoros después de cambiar radio`);
    this.soundSources.forEach((source, soundId) => {
      const soundPosition: [number, number, number] = [
        source.panner.positionX.value,
        source.panner.positionY.value,
        source.panner.positionZ.value
      ];
      console.log(`🔄 AudioManager: Actualizando mezcla para sonido ${soundId} en posición [${soundPosition.join(', ')}]`);
      this.updateSoundEffectMixing(soundId, soundPosition);
    });
  }

  /**
   * Obtiene el radio de una zona de efectos
   */
  public getEffectZoneRadius(effectId: string): number {
    return this.effectManager.getEffectZoneRadius(effectId);
  }

  /**
   * Actualiza la mezcla de efectos para una fuente de sonido basada en su posición
   */
  private updateSoundEffectMixing(soundId: string, soundPosition: [number, number, number]): void {
    const source = this.soundSources.get(soundId);
    if (!source) {
      console.log(`⚠️ AudioManager: No se encontró fuente de sonido ${soundId} para mezcla de efectos`);
      return;
    }

    try {
      console.log(`🔍 AudioManager: Actualizando mezcla de efectos para sonido ${soundId} en posición [${soundPosition.join(', ')}]`);
      const globalEffects = this.effectManager.getAllGlobalEffects();
      console.log(`🔍 AudioManager: Efectos globales disponibles:`, Array.from(globalEffects.keys()));
      console.log(`🔍 AudioManager: Total de objetos sonoros: ${this.soundSources.size}`);
      
      // Verificar el estado actual de la fuente de sonido
      console.log(`🔍 AudioManager: Estado de la fuente ${soundId}:`, {
        dryGainValue: source.dryGain.gain.value,
        effectSendsCount: source.effectSends.size,
        effectSendsKeys: Array.from(source.effectSends.keys())
      });
      
      // Calcular la mezcla para cada efecto global
      globalEffects.forEach((effectData, effectId) => {
        const send = source.effectSends.get(effectId);
        if (!send) {
          console.log(`⚠️ AudioManager: No se encontró send para efecto ${effectId} en sonido ${soundId}`);
          return;
        }

        // Obtener la posición real del efecto (no del panner)
        const effectPosition = effectData.position;

        console.log(`🔍 AudioManager: Posición REAL del efecto ${effectId}: [${effectPosition.join(', ')}]`);
        console.log(`🔍 AudioManager: Posición del sonido ${soundId}: [${soundPosition.join(', ')}]`);

        console.log(`🔍 AudioManager: Posición del efecto ${effectId}: [${effectPosition.join(', ')}]`);

        // Calcular intensidad del efecto usando el SpatialAudioManager
        const effectRadius = this.getEffectZoneRadius(effectId);
        const effectIntensity = this.spatialAudioManager.calculateEffectIntensity(
          soundPosition, 
          effectPosition, 
          effectRadius
        );
        
        console.log(`🔍 AudioManager: Distancia: ${this.spatialAudioManager.calculateDistance(soundPosition, effectPosition).toFixed(2)}, Radio: ${effectRadius}, Sonido ${soundId} -> Efecto ${effectId}`);
        
        // Log del estado basado en la intensidad calculada
        if (effectIntensity === 1.0) {
          console.log(`✅ AudioManager: Sonido ${soundId} DENTRO de zona de efecto ${effectId}`);
        } else if (effectIntensity > 0) {
          console.log(`🔄 AudioManager: Sonido ${soundId} en TRANSICIÓN de zona de efecto ${effectId}`);
        } else {
          console.log(`❌ AudioManager: Sonido ${soundId} FUERA de zona de efecto ${effectId}`);
        }

        // Aplicar la intensidad al send del efecto
        send.gain.setValueAtTime(effectIntensity, Tone.now());
        
        // Ajustar el dry gain (seco) inversamente
        const dryIntensity = 1.0 - effectIntensity;
        source.dryGain.gain.setValueAtTime(dryIntensity, Tone.now());

        console.log(`🎛️ AudioManager: Aplicando mezcla - Wet: ${effectIntensity.toFixed(2)}, Dry: ${dryIntensity.toFixed(2)}`);
        
        // Verificar que los valores se aplicaron correctamente
        console.log(`🔍 AudioManager: Verificación - Send gain: ${send.gain.value}, Dry gain: ${source.dryGain.gain.value}`);

        // Log para debug (solo cuando hay cambios significativos)
        const lastIntensity = this.lastSendAmounts.get(`${soundId}-${effectId}`) || 0;
        if (Math.abs(effectIntensity - lastIntensity) > 0.1) {
          const distance = this.spatialAudioManager.calculateDistance(soundPosition, effectPosition);
          console.log(`🎛️ AudioManager: Sonido ${soundId} en efecto ${effectId}:`, {
            distance: distance.toFixed(2),
            effectIntensity: effectIntensity.toFixed(2),
            dryIntensity: dryIntensity.toFixed(2),
            position: soundPosition,
            effectPosition: effectPosition,
            effectRadius: effectRadius,
            isInside: effectIntensity === 1.0,
            isInTransition: effectIntensity > 0 && effectIntensity < 1.0
          });
          
          // Actualizar el registro de intensidades
          this.lastSendAmounts.set(`${soundId}-${effectId}`, effectIntensity);
        }
        
        // Log resumen del estado actual
        const distance = this.spatialAudioManager.calculateDistance(soundPosition, effectPosition);
        console.log(`📊 AudioManager: RESUMEN - Sonido ${soundId}:`, {
          distancia: `${distance.toFixed(2)} unidades`,
          radio: `${effectRadius} unidades`,
          estado: effectIntensity === 1.0 ? 'DENTRO' : effectIntensity > 0 ? 'TRANSICIÓN' : 'FUERA',
          mezcla: `Wet: ${effectIntensity.toFixed(2)}, Dry: ${dryIntensity.toFixed(2)}`
        });
      });
    } catch (error) {
      console.error(`❌ AudioManager: Error al actualizar mezcla de efectos:`, error);
    }
  }

  /**
   * Actualiza la posición y orientación del oyente global de Tone.js
   */
  public updateListener(position: THREE.Vector3, forward: THREE.Vector3): void {
    this.spatialAudioManager.updateListener(position, forward);
  }

  /**
   * Obtiene el estado de una fuente de sonido
   */
  public getSoundSourceState(id: string): boolean {
    const source = this.soundSources.get(id);
    if (!source) return false;
    
    // Verificar si existe la fuente
    return true;
  }

  /**
   * Verifica si una fuente de sonido está activamente sonando
   */
  public isSoundPlaying(id: string): boolean {
    return this.playingSounds.has(id);
  }

  /**
   * Obtiene información de debug
   */
  public getDebugInfo(): {
    contextState: string;
    soundSourcesCount: number;
    soundSourceIds: string[];
  } {
    return {
      contextState: Tone.context.state,
      soundSourcesCount: this.soundSources.size,
      soundSourceIds: Array.from(this.soundSources.keys()),
    };
  }

  /**
   * Función de debug para verificar el estado completo de la cadena de audio
   */
  public debugAudioChain(soundId: string): void {
    const source = this.soundSources.get(soundId);
    if (!source) {
      console.log(`❌ Debug: No se encontró fuente de sonido ${soundId}`);
      return;
    }

    console.log(`🔍 DEBUG COMPLETO - Fuente de sonido ${soundId}:`);
    console.log(`📍 Posición del panner: [${source.panner.positionX.value}, ${source.panner.positionY.value}, ${source.panner.positionZ.value}]`);
    console.log(`🔊 Dry Gain: ${source.dryGain.gain.value}`);
    console.log(`🎛️ Effect Sends: ${source.effectSends.size}`);
    
    source.effectSends.forEach((send, effectId) => {
      console.log(`  └─ Send ${effectId}: Gain = ${send.gain.value}`);
    });

    // Verificar efectos globales
    const globalEffects = this.effectManager.getAllGlobalEffects();
    globalEffects.forEach((effectData, effectId) => {
      console.log(`🎛️ Efecto ${effectId}:`, {
        tipo: effectData.effectNode.constructor.name,
        posicion: effectData.position,
        radio: this.getEffectZoneRadius(effectId)
      });
    });
  }

  // Helper para convertir nota a frecuencia (ejemplo: "A4" -> 440Hz)
  private getNoteFrequency(note: string): number {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const noteName = note.replace(/[0-9]/g, '');
    const octave = parseInt(note[note.length - 1]) || 4;
    const noteIndex = notes.indexOf(noteName);
    
    if (noteIndex === -1) {
      return 261.63; // C4
    }
    
    // Calcular frecuencia usando la fórmula A4 = 440Hz como referencia
    const semitonesFromA4 = (octave - 4) * 12 + (noteIndex - 9); // A es el índice 9
    return 440 * Math.pow(2, semitonesFromA4 / 12);
  }

  // Helper para convertir frecuencia a nota (ejemplo: 440Hz -> "A4")
  private frequencyToNote(frequency: number): string {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(Math.log2(frequency / 440) / 12) + 4; // 440Hz es A4
    const noteIndex = Math.round(12 * Math.log2(frequency / 440)) % 12;
    return notes[noteIndex] + octave;
  }

  // Helper para generar acordes basados en una nota base
  private generateChordFromBase(baseNote: string, chord: string[]): string[] {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const baseNoteIndex = notes.indexOf(baseNote.replace(/[0-9]/g, ''));
    const chordNotes = chord.map(note => {
      const noteName = note.replace(/[0-9]/g, '');
      const noteIndex = notes.indexOf(noteName);
      const semitoneDiff = noteIndex - baseNoteIndex;
      return notes[(semitoneDiff + 12) % 12] + (parseInt(note[note.length - 1]) + 1); // Asegurar octava correcta
    });
    return chordNotes;
  }

  // Helper para obtener un tiempo único para el triggerAttack de sonidos continuos
  private getUniqueStartTime(): number {
    return Tone.now() + 0.001; // Añadir un pequeño offset para evitar conflictos
  }
}

// Exportar una única instancia global
export const audioManager = AudioManager.getInstance();