import * as Tone from 'tone';

// Tipos para los parámetros de audio
export interface AudioParams {
  frequency: number;
  waveform: OscillatorType;
  volume: number;
  harmonicity?: number;
  modulationWaveform?: OscillatorType;
  modulationIndex?: number; // Nuevo parámetro para FMSynth
  // Nuevos parámetros para DuoSynth
  waveform2?: OscillatorType;
  vibratoAmount?: number;
  vibratoRate?: number;
  // Nuevos parámetros para MembraneSynth
  pitchDecay?: number;
  octaves?: number;
  // Campo de duración para todos los objetos (Infinity para duración infinita)
  duration?: number;
}

// Tipos para las fuentes de sonido
export type SoundObjectType = 'cube' | 'sphere' | 'cylinder' | 'cone';

// Estructura de una fuente de sonido
interface SoundSource {
  synth: Tone.AMSynth | Tone.FMSynth | Tone.DuoSynth | Tone.MembraneSynth;
  panner: Tone.Panner3D;
}

export class AudioManager {
  private static instance: AudioManager;
  private soundSources: Map<string, SoundSource> = new Map();
  private isContextStarted: boolean = false;
  private playingSounds: Set<string> = new Set(); // Rastrear qué sonidos están activos

  private constructor() {
    // Constructor privado para Singleton
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  /**
   * Inicia el contexto de audio de Tone.js
   */
  public async startContext(): Promise<boolean> {
    try {
      if (Tone.context.state !== 'running') {
        console.log('🎵 Iniciando AudioContext...');
        await Tone.start();
        this.isContextStarted = true;
        console.log('✅ AudioContext iniciado exitosamente');
        return true;
      }
      return true;
    } catch (error) {
      console.error('❌ Error al iniciar AudioContext:', error);
      return false;
    }
  }

  /**
   * Crea una nueva fuente de sonido
   */
  public createSoundSource(
    id: string, 
    type: SoundObjectType, 
    params: AudioParams, 
    position: [number, number, number]
  ): void {
    // Verificar si ya existe una fuente con este ID
    if (this.soundSources.has(id)) {
      console.log(`🎵 Fuente de sonido ${id} ya existe, saltando creación`);
      return;
    }

    try {
      console.log(`🎵 Creando fuente de sonido ${id} de tipo ${type}`);

      // Crear el sintetizador apropiado según el tipo
      let synth: Tone.AMSynth | Tone.FMSynth | Tone.DuoSynth | Tone.MembraneSynth;
      
      if (type === 'cube') {
        synth = new Tone.AMSynth({
          harmonicity: params.harmonicity || 1.5,
          oscillator: {
            type: params.waveform,
          },
          modulation: {
            type: params.modulationWaveform || 'square',
          },
          envelope: {
            attack: 0.1,
            decay: 0.2,
            sustain: 0.8,
            release: 0.5, // Release más largo para un fade-out suave
          },
        });
        
        // Configurar la amplitud inicial de la portadora para síntesis AM
        (synth as Tone.AMSynth).oscillator.volume.setValueAtTime(Tone.gainToDb(params.volume || 0.05), Tone.now());
      } else if (type === 'sphere') {
        // sphere - FMSynth con configuración completa
        synth = new Tone.FMSynth({
          harmonicity: params.harmonicity || 2,
          modulationIndex: params.modulationIndex || 10,
          oscillator: {
            type: params.waveform,
          },
          modulation: {
            type: params.modulationWaveform || 'sine',
          },
          envelope: {
            attack: 0.01,
            decay: 0.1,
            sustain: 0.5,
            release: 1.0,
          },
        });
      } else if (type === 'cylinder') {
        // cylinder - DuoSynth
        synth = new Tone.DuoSynth({
          harmonicity: params.harmonicity || 1.5,
          vibratoAmount: params.vibratoAmount || 0.2,
          vibratoRate: params.vibratoRate || 5,
          voice0: { 
            oscillator: { type: params.waveform || 'triangle' } 
          },
          voice1: { 
            oscillator: { type: params.waveform2 || 'sine' } 
          },
        });
      } else if (type === 'cone') {
        // cone - MembraneSynth para sonidos percusivos
        synth = new Tone.MembraneSynth({
          pitchDecay: params.pitchDecay || 0.05,
          octaves: params.octaves || 10,
          oscillator: { 
            type: params.waveform || 'sine' 
          },
          envelope: { 
            attack: 0.001, 
            decay: 0.2, 
            sustain: 0.01, 
            release: 0.3 
          },
        });
      } else {
        // Fallback por defecto
        synth = new Tone.AMSynth();
      }

      // Crear panner 3D
      const panner = new Tone.Panner3D({
        positionX: position[0],
        positionY: position[1],
        positionZ: position[2],
        rolloffFactor: 1,
        maxDistance: 100,
      });

      // Conectar la cadena de audio: synth -> panner -> destination
      synth.chain(panner, Tone.Destination);

      // Configurar parámetros iniciales - asegurar frecuencia segura
      const safeFrequency = Math.max(params.frequency, 20);
      
      // Configurar frecuencia según el tipo de sintetizador
      if (type === 'cube' || type === 'sphere') {
        (synth as Tone.AMSynth | Tone.FMSynth).oscillator.frequency.setValueAtTime(safeFrequency, Tone.now());
      } else if (type === 'cylinder') {
        // Para DuoSynth, la frecuencia se configura en el sintetizador principal
        synth.frequency.setValueAtTime(safeFrequency, Tone.now());
      } else if (type === 'cone') {
        // Para MembraneSynth, la frecuencia se configura en el sintetizador principal
        synth.frequency.setValueAtTime(safeFrequency, Tone.now());
      }

      // Almacenar en el Map
      this.soundSources.set(id, {
        synth,
        panner,
      });

      console.log(`✅ Fuente de sonido ${id} creada exitosamente`);
    } catch (error) {
      console.error(`❌ Error al crear fuente de sonido ${id}:`, error);
    }
  }

  /**
   * Elimina una fuente de sonido
   */
  public removeSoundSource(id: string): void {
    const source = this.soundSources.get(id);
    if (!source) {
      console.log(`🎵 Fuente de sonido ${id} no encontrada`);
      return;
    }

    try {
      // Detener el sonido si está sonando
      if (this.playingSounds.has(id)) {
        source.synth.triggerRelease();
      }

      // Limpiar recursos
      source.synth.dispose();
      source.panner.dispose();

      // Eliminar del Map y limpiar el estado
      this.soundSources.delete(id);
      this.playingSounds.delete(id); // Asegurarse de limpiar el estado
      console.log(`✅ Fuente de sonido ${id} eliminada exitosamente`);
    } catch (error) {
      console.error(`❌ Error al eliminar fuente de sonido ${id}:`, error);
    }
  }

  /**
   * Inicia el sonido de una fuente
   */
  public startSound(id: string, params: AudioParams): void {
    const source = this.soundSources.get(id);
    if (!source || this.playingSounds.has(id)) {
      console.log(`🎵 Fuente de sonido ${id} no encontrada o ya está sonando`);
      return;
    }

    try {
      // Aplicar TODOS los parámetros antes de iniciar
      this.updateSoundParams(id, params);
      
      // Usar triggerAttackRelease con duración configurada o triggerAttack para duración infinita
      const duration = params.duration;
      
      if (duration === Infinity) {
        // Duración infinita - usar triggerAttack para sonido continuo
        (source.synth as any).triggerAttack(params.frequency, Tone.now());
        console.log(`🎵 Sonido iniciado para ${id} con frecuencia ${params.frequency}Hz (duración infinita)`);
      } else {
        // Duración finita - usar triggerAttackRelease o fallback
        const actualDuration = duration || 2.0; // Duración por defecto de 2 segundos
        
        try {
          // Intentar usar triggerAttackRelease si está disponible
          if (typeof (source.synth as any).triggerAttackRelease === 'function') {
            (source.synth as any).triggerAttackRelease(params.frequency, actualDuration, Tone.now());
            console.log(`🎵 Sonido iniciado para ${id} con frecuencia ${params.frequency}Hz y duración ${actualDuration}s`);
          } else {
            // Fallback para sintetizadores que no soportan triggerAttackRelease
            source.synth.triggerAttack(params.frequency, Tone.now());
            console.log(`🎵 Sonido iniciado para ${id} con frecuencia ${params.frequency}Hz (duración indefinida)`);
          }
        } catch (error) {
          // Si triggerAttackRelease falla, usar el método estándar
          source.synth.triggerAttack(params.frequency, Tone.now());
          console.log(`🎵 Sonido iniciado para ${id} con frecuencia ${params.frequency}Hz (fallback)`);
        }
      }
      
      this.playingSounds.add(id); // Marcar como sonando
    } catch (error) {
      console.error(`❌ Error al iniciar sonido para ${id}:`, error);
    }
  }

  /**
   * Detiene el sonido de una fuente
   */
  public stopSound(id: string): void {
    const source = this.soundSources.get(id);
    if (!source || !this.playingSounds.has(id)) {
      console.log(`🎵 Fuente de sonido ${id} no encontrada o no está sonando`);
      return;
    }

    try {
      // triggerRelease inicia la fase de 'release' de la envolvente.
      // El sintetizador se encargará de detener el oscilador cuando la envolvente llegue a cero.
      source.synth.triggerRelease(Tone.now());
      
      this.playingSounds.delete(id); // Marcar como no sonando
      console.log(`🎵 Sonido detenido para ${id}`);
    } catch (error) {
      console.error(`❌ Error al detener sonido para ${id}:`, error);
    }
  }

  /**
   * Dispara una nota percusiva (especialmente para MembraneSynth)
   */
  public triggerNoteAttack(id: string, params: AudioParams): void {
    const source = this.soundSources.get(id);
    if (!source) {
      console.log(`🎵 Fuente de sonido ${id} no encontrada`);
      return;
    }

    try {
      // Aplicar parámetros antes de disparar
      this.updateSoundParams(id, params);
      
      // Para todos los sintetizadores, usar triggerAttackRelease con duración configurada o triggerAttack para duración infinita
      const duration = params.duration;
      
      if (duration === Infinity) {
        // Duración infinita - usar triggerAttack para sonido continuo
        (source.synth as any).triggerAttack(params.frequency, Tone.now());
        console.log(`🎵 Nota disparada para ${id} con frecuencia ${params.frequency}Hz (duración infinita)`);
      } else if ('triggerAttackRelease' in source.synth) {
        // Duración finita - usar triggerAttackRelease
        const actualDuration = duration || 0.5; // Usar duración configurada o 0.5 por defecto
        (source.synth as any).triggerAttackRelease(params.frequency, actualDuration, Tone.now());
        console.log(`🎵 Nota disparada para ${id} con frecuencia ${params.frequency}Hz y duración ${actualDuration}s`);
      } else {
        // Fallback para sintetizadores que no soportan triggerAttackRelease
        try {
          (source.synth as any).triggerAttack(params.frequency, Tone.now());
          console.log(`🎵 Nota disparada para ${id} con frecuencia ${params.frequency}Hz (duración indefinida)`);
        } catch (fallbackError) {
          console.warn(`⚠️ Fallback falló para ${id}, usando método alternativo`);
          // Último recurso: intentar con triggerAttack en el sintetizador principal
          if (typeof (source.synth as any).triggerAttack === 'function') {
            (source.synth as any).triggerAttack(params.frequency, Tone.now());
          }
        }
      }
    } catch (error) {
      console.error(`❌ Error al disparar nota para ${id}:`, error);
    }
  }

    /**
   * Actualiza los parámetros de sonido de una fuente
   */
  public updateSoundParams(id: string, params: Partial<AudioParams>): void {
    const source = this.soundSources.get(id);
    if (!source) {
      console.log(`🎵 Fuente de sonido ${id} no encontrada`);
      return;
    }

    try {
      console.log(`🔧 Actualizando parámetros para ${id}:`, params);

      // Actualizar frecuencia si cambia - usar rampTo en la señal de frecuencia del sintetizador
      if (params.frequency !== undefined) {
        // Asegurar que la frecuencia sea al menos 20Hz (límite inferior del oído humano)
        const safeFrequency = Math.max(params.frequency, 20);
        console.log(`🎵 Frecuencia: ${params.frequency}Hz -> ${safeFrequency}Hz`);
        
        // --- CAMBIO CLAVE: Usar rampTo en la señal de frecuencia del sintetizador ---
        source.synth.frequency.rampTo(safeFrequency, 0.05);
        console.log(`🎵 Frecuencia aplicada en tiempo real para ${id}`);
      }

      // Actualizar tipo de onda si cambia
      if (params.waveform !== undefined) {
        console.log(`🎵 Forma de onda: ${params.waveform}`);
        
        // Manejar según el tipo de sintetizador
        if ('oscillator' in source.synth) {
          // AMSynth, FMSynth o MembraneSynth
          (source.synth as Tone.AMSynth | Tone.FMSynth | Tone.MembraneSynth).oscillator.type = params.waveform;
        } else if ('voice0' in source.synth) {
          // DuoSynth
          (source.synth as Tone.DuoSynth).voice0.oscillator.type = params.waveform;
        }
        console.log(`🎵 Forma de onda aplicada en tiempo real para ${id}`);
      }

      // Actualizar harmonicity si cambia (para AMSynth y FMSynth)
      if (params.harmonicity !== undefined && 'harmonicity' in source.synth) {
        console.log(`🎵 Harmonicity: ${params.harmonicity}`);
        (source.synth as Tone.AMSynth | Tone.FMSynth).harmonicity.rampTo(params.harmonicity, 0.05);
        console.log(`🎵 Harmonicity aplicado en tiempo real para ${id}`);
      }

      // Actualizar modulationIndex si cambia (solo para FMSynth)
      if (params.modulationIndex !== undefined && 'modulationIndex' in source.synth) {
        console.log(`🎵 Modulation Index: ${params.modulationIndex}`);
        (source.synth as Tone.FMSynth).modulationIndex.rampTo(params.modulationIndex, 0.05);
        console.log(`🎵 Modulation Index aplicado en tiempo real para ${id}`);
      }

      // Actualizar forma de onda de modulación si cambia (para AMSynth y FMSynth)
      if (params.modulationWaveform !== undefined && 'modulation' in source.synth) {
        console.log(`🎵 Forma de onda de modulación: ${params.modulationWaveform}`);
        (source.synth as Tone.AMSynth | Tone.FMSynth).modulation.type = params.modulationWaveform;
        console.log(`🎵 Forma de onda de modulación aplicada en tiempo real para ${id}`);
      }

      // Actualizar parámetros específicos del DuoSynth
      if ('voice0' in source.synth) {
        // Es un DuoSynth
        const duoSynth = source.synth as Tone.DuoSynth;
        
        // Actualizar harmonicity
        if (params.harmonicity !== undefined) {
          console.log(`🎵 Harmonicity (DuoSynth): ${params.harmonicity}`);
          duoSynth.harmonicity.rampTo(params.harmonicity, 0.05);
        }
        
        // Actualizar vibratoAmount
        if (params.vibratoAmount !== undefined) {
          console.log(`🎵 Vibrato Amount: ${params.vibratoAmount}`);
          duoSynth.vibratoAmount.rampTo(params.vibratoAmount, 0.05);
        }
        
        // Actualizar vibratoRate
        if (params.vibratoRate !== undefined) {
          console.log(`🎵 Vibrato Rate: ${params.vibratoRate}`);
          duoSynth.vibratoRate.rampTo(params.vibratoRate, 0.05);
        }
        
        // Actualizar waveform2 (segunda voz)
        if (params.waveform2 !== undefined) {
          console.log(`🎵 Forma de onda (Voz 2): ${params.waveform2}`);
          duoSynth.voice1.oscillator.type = params.waveform2;
        }
      }

      // Actualizar parámetros específicos del MembraneSynth
      if ('pitchDecay' in source.synth) {
        // Es un MembraneSynth
        const membraneSynth = source.synth as Tone.MembraneSynth;
        
        // Actualizar pitchDecay
        if (params.pitchDecay !== undefined) {
          console.log(`🥁 Pitch Decay: ${params.pitchDecay}`);
          membraneSynth.pitchDecay = params.pitchDecay;
        }
        
        // Actualizar octaves
        if (params.octaves !== undefined) {
          console.log(`🥁 Octaves: ${params.octaves}`);
          membraneSynth.octaves = params.octaves;
        }
      }

      // Actualizar volumen si cambia
      if (params.volume !== undefined) {
        console.log(`🎵 Volumen: ${params.volume}`);
        
        // Para síntesis AM, el volumen debe controlar tanto la amplitud como el volumen general
        if ('modulation' in source.synth) {
          // Es un AMSynth - aplicar volumen a la amplitud de la portadora
          const amplitudeValue = params.volume;
          (source.synth as Tone.AMSynth).oscillator.volume.rampTo(Tone.gainToDb(amplitudeValue), 0.05);
          console.log(`🎵 Amplitud de portadora aplicada en tiempo real para ${id}: ${amplitudeValue}`);
        }
        
        // Aplicar volumen general al sintetizador (control de salida)
        // El rango 0-0.1 se mapea a -Infinity a -20dB para mejor control
        const dbValue = params.volume > 0 ? Tone.gainToDb(params.volume * 10) : -Infinity;
        source.synth.volume.rampTo(dbValue, 0.05);
        console.log(`🎵 Volumen general aplicado en tiempo real para ${id}: ${params.volume} -> ${dbValue}dB`);
      }

      console.log(`✅ Parámetros actualizados para ${id}`);
    } catch (error) {
      console.error(`❌ Error al actualizar parámetros para ${id}:`, error);
      if (error instanceof Error) {
        console.error(`❌ Stack trace:`, error.stack);
      }
    }
  }

  /**
   * Actualiza la posición 3D de una fuente de sonido
   */
  public updateSoundPosition(id: string, position: [number, number, number]): void {
    const source = this.soundSources.get(id);
    if (!source) {
      console.log(`🎵 Fuente de sonido ${id} no encontrada`);
      return;
    }

    try {
      source.panner.setPosition(position[0], position[1], position[2]);
      console.log(`✅ Posición actualizada para ${id}: [${position.join(', ')}]`);
    } catch (error) {
      console.error(`❌ Error al actualizar posición para ${id}:`, error);
    }
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
}

// Exportar una única instancia global
export const audioManager = AudioManager.getInstance();
