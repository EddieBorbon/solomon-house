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
  // Nuevos parámetros para MonoSynth (pyramid)
  ampAttack?: number;
  ampDecay?: number;
  ampSustain?: number;
  ampRelease?: number;
  filterAttack?: number;
  filterDecay?: number;
  filterSustain?: number;
  filterRelease?: number;
  filterBaseFreq?: number;
  filterOctaves?: number;
  filterQ?: number;
  // Nuevos parámetros para MetalSynth (icosahedron)
  resonance?: number;
  // Nuevos parámetros para NoiseSynth (plane)
  noiseType?: 'white' | 'pink' | 'brown';
  attack?: number;
  decay?: number;
  sustain?: number;
  // Nuevos parámetros para PluckSynth (torus)
  attackNoise?: number;
  dampening?: number;
  // Campo de duración para todos los objetos (Infinity para duración infinita)
  duration?: number;
  // Nuevos parámetros para PolySynth (dodecahedronRing)
  polyphony?: number;
  chord?: string[];
  release?: number;
}

// Tipos para las fuentes de sonido
export type SoundObjectType = 'cube' | 'sphere' | 'cylinder' | 'cone' | 'pyramid' | 'icosahedron' | 'plane' | 'torus' | 'dodecahedronRing';

// Estructura de una fuente de sonido
interface SoundSource {
  synth: Tone.AMSynth | Tone.FMSynth | Tone.DuoSynth | Tone.MembraneSynth | Tone.MonoSynth | Tone.MetalSynth | Tone.NoiseSynth | Tone.PluckSynth | Tone.PolySynth;
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
    console.log(`🎵 AudioManager.createSoundSource llamado con:`, { id, type, params, position });
    
    // Verificar si ya existe una fuente con este ID
    if (this.soundSources.has(id)) {
      console.log(`🎵 Fuente de sonido ${id} ya existe, saltando creación`);
      return;
    }

    try {
      console.log(`🎵 Creando fuente de sonido ${id} de tipo ${type}`);

      // Crear el sintetizador apropiado según el tipo
      let synth: Tone.AMSynth | Tone.FMSynth | Tone.DuoSynth | Tone.MembraneSynth | Tone.MonoSynth | Tone.MetalSynth | Tone.NoiseSynth | Tone.PluckSynth | Tone.PolySynth;
      
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
      } else if (type === 'pyramid') {
        // pyramid - MonoSynth para sonidos de bajo clásicos
        console.log('🔺 Creando MonoSynth para pirámide con parámetros:', params);
        synth = new Tone.MonoSynth({
          oscillator: { 
            type: params.waveform || 'sawtooth' 
          },
          envelope: { 
            attack: params.ampAttack || 0.01, 
            decay: params.ampDecay || 0.2, 
            sustain: params.ampSustain || 0.1, 
            release: params.ampRelease || 0.5 
          },
          filterEnvelope: { 
            attack: params.filterAttack || 0.005, 
            decay: params.filterDecay || 0.1, 
            sustain: params.filterSustain || 0.05, 
            release: params.filterRelease || 0.2, 
            baseFrequency: params.filterBaseFreq || 200, 
            octaves: params.filterOctaves || 4 
          },
          filter: { 
            Q: params.filterQ || 2, 
            type: 'lowpass' 
          },
        });
        console.log('✅ MonoSynth creado exitosamente para pirámide');
      } else if (type === 'icosahedron') {
        // icosahedron - MetalSynth para sonidos metálicos y percusivos
        console.log('🔶 Creando MetalSynth para icosaedro con parámetros:', params);
        synth = new Tone.MetalSynth({
          envelope: {
            attack: 0.001,
            decay: 1.4,
            release: 0.2,
          },
          harmonicity: params.harmonicity || 5.1,
          modulationIndex: params.modulationIndex || 32,
          resonance: params.resonance || 4000,
          octaves: params.octaves || 1.5,
        });
        console.log('✅ MetalSynth creado exitosamente para icosaedro');
      } else if (type === 'plane') {
        // plane - NoiseSynth para sonidos de ruido percusivos
        console.log('🟦 Creando NoiseSynth para plano con parámetros:', params);
        synth = new Tone.NoiseSynth({
          noise: { 
            type: params.noiseType || 'white' 
          },
          envelope: { 
            attack: params.attack || 0.001, 
            decay: params.decay || 0.1, 
            sustain: params.sustain || 0, 
            release: 0.1 
          },
        });
        console.log('✅ NoiseSynth creado exitosamente para plano');
      } else if (type === 'torus') {
        // torus - PluckSynth para sonidos de cuerdas
        console.log('🔄 Creando PluckSynth para toroide con parámetros:', params);
        synth = new Tone.PluckSynth({
          attackNoise: params.attackNoise || 1,
          dampening: params.dampening || 4000,
          resonance: params.resonance || 0.9,
        });
        console.log('✅ PluckSynth creado exitosamente para toroide');
      } else if (type === 'dodecahedronRing') {
        // dodecahedronRing - PolySynth para acordes polifónicos
        console.log('🔷 Creando PolySynth para anillo de dodecaedros con parámetros:', params);
        synth = new Tone.PolySynth({
          maxPolyphony: params.polyphony || 4,
          voice: Tone.FMSynth,
          options: {
            harmonicity: params.harmonicity || 1,
            modulationIndex: params.modulationIndex || 2,
            oscillator: {
              type: params.waveform || 'sine',
            },
            modulation: {
              type: params.modulationWaveform || 'triangle',
            },
            envelope: {
              attack: params.attack || 1.5,
              decay: 0.1,
              sustain: 1.0,
              release: params.release || 2.0,
            },
          },
        });
        
        console.log('✅ PolySynth creado exitosamente para anillo de dodecaedros');
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
        (synth as Tone.DuoSynth).frequency.setValueAtTime(safeFrequency, Tone.now());
      } else if (type === 'cone') {
        // Para MembraneSynth, la frecuencia se configura en el sintetizador principal
        (synth as Tone.MembraneSynth).frequency.setValueAtTime(safeFrequency, Tone.now());
      } else if (type === 'pyramid') {
        // Para MonoSynth, la frecuencia se configura en el sintetizador principal
        (synth as Tone.MonoSynth).frequency.setValueAtTime(safeFrequency, Tone.now());
      } else if (type === 'icosahedron') {
        // Para MetalSynth, la frecuencia se configura en el sintetizador principal
        (synth as Tone.MetalSynth).frequency.setValueAtTime(safeFrequency, Tone.now());
      } else if (type === 'plane') {
        // Para NoiseSynth, no se configura frecuencia ya que genera ruido
        console.log('🟦 NoiseSynth no requiere configuración de frecuencia');
      } else if (type === 'torus') {
        // Para PluckSynth, la frecuencia se configura en el sintetizador principal
        (synth as Tone.PluckSynth).toFrequency(safeFrequency);
      } else if (type === 'dodecahedronRing') {
        // Para PolySynth, no se configura frecuencia individual ya que usa acordes
        console.log('🔷 PolySynth no requiere configuración de frecuencia individual');
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
        source.synth.triggerRelease(Tone.now());
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
      console.log(`🎵 startSound llamado para ${id} con frecuencia ${params.frequency}Hz`);
      
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
          console.log(`🔷 Transponiendo acorde de ${params.chord || ["C4", "E4", "G4"]} a ${chord} basado en frecuencia ${params.frequency}Hz (nota base: ${baseNote})`);
        }
        
        console.log(`🔷 Disparando acorde para PolySynth:`, chord);
        source.synth.triggerAttack(chord, Tone.now());
        console.log(`🎵 Acorde iniciado para ${id}:`, chord);
        this.playingSounds.add(id);
        return;
      }
      
      // Para MonoSynth y otros sintetizadores, usar triggerAttack para sonido continuo
      // El triggerRelease se llamará cuando se detenga el sonido
      try {
        (source.synth as any).triggerAttack(params.frequency, Tone.now());
        console.log(`🎵 Sonido iniciado para ${id} con frecuencia ${params.frequency}Hz (gate ON)`);
        this.playingSounds.add(id); // Marcar como sonando
      } catch (error) {
        console.error(`❌ Error al llamar triggerAttack para ${id}:`, error);
        // Fallback: intentar con triggerAttackRelease si está disponible
        if ('triggerAttackRelease' in source.synth) {
          try {
            const fallbackDuration = 0.5; // Duración corta como fallback
            (source.synth as any).triggerAttackRelease(params.frequency, fallbackDuration, Tone.now());
            console.log(`🎵 Sonido iniciado para ${id} con fallback triggerAttackRelease`);
            this.playingSounds.add(id);
          } catch (fallbackError) {
            console.error(`❌ Fallback también falló para ${id}:`, fallbackError);
          }
        }
      }
    } catch (error) {
      console.error(`❌ Error al iniciar sonido para ${id}:`, error);
    }
  }

  /**
   * Detiene el sonido de una fuente
   */
  public stopSound(id: string): void {
    const source = this.soundSources.get(id);
    if (!source) {
      console.log(`🎵 Fuente de sonido ${id} no encontrada`);
      return;
    }

    // No verificar si está sonando, siempre intentar detener
    try {
      console.log(`🎵 stopSound llamado para ${id} - Deteniendo sonido`);
      
      // Para PolySynth, usar releaseAll para detener todas las voces
      if (source.synth instanceof Tone.PolySynth) {
        console.log(`🔷 Deteniendo todas las voces del PolySynth`);
        source.synth.releaseAll(Tone.now());
        this.playingSounds.delete(id);
        console.log(`🎵 Todas las voces detenidas para ${id}`);
        return;
      }
      
      // triggerRelease inicia la fase de 'release' de la envolvente.
      // El sintetizador se encargará de detener el oscilador cuando la envolvente llegue a cero.
      source.synth.triggerRelease(Tone.now());
      
      this.playingSounds.delete(id); // Marcar como no sonando
      console.log(`🎵 Sonido detenido para ${id} (gate OFF)`);
    } catch (error) {
      console.error(`❌ Error al detener sonido para ${id}:`, error);
      // Aún así, marcar como no sonando
      this.playingSounds.delete(id);
    }
  }

  /**
   * Dispara una nota percusiva (especialmente para MembraneSynth)
   */
  public triggerNoteAttack(id: string, params: AudioParams): void {
    console.log(`🎵 triggerNoteAttack llamado para ${id}`);
    
    const source = this.soundSources.get(id);
    if (!source) {
      console.log(`🎵 Fuente de sonido ${id} no encontrada`);
      return;
    }

    try {
      console.log(`🎵 Disparando nota para ${id} con parámetros:`, params);
      console.log(`🎵 Tipo de sintetizador:`, source.synth.constructor.name);
      console.log(`🎵 Métodos disponibles:`, Object.getOwnPropertyNames(Object.getPrototypeOf(source.synth)));
      
      // Aplicar parámetros antes de disparar
      this.updateSoundParams(id, params);
      
      // Para PluckSynth, usar triggerAttack sin triggerRelease ya que decae naturalmente
      if (source.synth instanceof Tone.PluckSynth) {
        console.log(`🔄 Usando triggerAttack para PluckSynth (torus)`);
        source.synth.triggerAttack(params.frequency, Tone.now());
        console.log(`🎵 Nota disparada para ${id} con frecuencia ${params.frequency}Hz (decae naturalmente)`);
        return;
      }
      
      // Para todos los demás sintetizadores, usar triggerAttackRelease con duración configurada o triggerAttack para duración infinita
      const duration = params.duration;
      
      if (duration === Infinity) {
        // Duración infinita - usar triggerAttack para sonido continuo
        console.log(`🎵 Usando triggerAttack con duración infinita`);
        (source.synth as any).triggerAttack(params.frequency, Tone.now());
        console.log(`🎵 Nota disparada para ${id} con frecuencia ${params.frequency}Hz (duración infinita)`);
      } else if ('triggerAttackRelease' in source.synth) {
        // Duración finita - usar triggerAttackRelease
        const actualDuration = duration || 0.5; // Usar duración configurada o 0.5 por defecto
        console.log(`🎵 Usando triggerAttackRelease con duración ${actualDuration}s`);
        (source.synth as any).triggerAttackRelease(params.frequency, actualDuration, Tone.now());
        console.log(`🎵 Nota disparada para ${id} con frecuencia ${params.frequency}Hz y duración ${actualDuration}s`);
      } else {
        // Fallback para sintetizadores que no soportan triggerAttackRelease
        console.log(`🎵 triggerAttackRelease no disponible, usando fallback`);
        try {
          console.log(`🎵 Intentando triggerAttack directo`);
          (source.synth as any).triggerAttack(params.frequency, Tone.now());
          console.log(`🎵 Nota disparada para ${id} con frecuencia ${params.frequency}Hz (duración indefinida)`);
        } catch (fallbackError) {
          console.warn(`⚠️ Fallback falló para ${id}:`, fallbackError);
          // Último recurso: intentar con triggerAttack en el sintetizador principal
          if (typeof (source.synth as any).triggerAttack === 'function') {
            console.log(`🎵 Último recurso: triggerAttack en sintetizador principal`);
            (source.synth as any).triggerAttack(params.frequency, Tone.now());
          }
        }
      }
    } catch (error) {
      console.error(`❌ Error al disparar nota para ${id}:`, error);
      console.error(`❌ Stack trace:`, error instanceof Error ? error.stack : 'No disponible');
    }
  }

  /**
   * Dispara un ataque de ruido (especialmente para NoiseSynth)
   */
  public triggerNoiseAttack(id: string, params: AudioParams): void {
    console.log(`🎵 triggerNoiseAttack llamado para ${id}`);
    
    const source = this.soundSources.get(id);
    if (!source) {
      console.log(`🎵 Fuente de sonido ${id} no encontrada`);
      return;
    }

    try {
      console.log(`🎵 Disparando ruido para ${id} con parámetros:`, params);
      console.log(`🎵 Tipo de sintetizador:`, source.synth.constructor.name);
      
      // Aplicar parámetros antes de disparar
      this.updateSoundParams(id, params);
      
      // Para NoiseSynth, usar triggerAttackRelease con duración
      if (source.synth instanceof Tone.NoiseSynth) {
        const duration = params.duration || 0.1; // Duración por defecto para ruido
        console.log(`🎵 Usando triggerAttackRelease para NoiseSynth con duración ${duration}s`);
        source.synth.triggerAttackRelease(duration, Tone.now());
        console.log(`🎵 Ruido disparado para ${id} con duración ${duration}s`);
      } else {
        console.warn(`⚠️ triggerNoiseAttack llamado en sintetizador que no es NoiseSynth:`, source.synth.constructor.name);
      }
    } catch (error) {
      console.error(`❌ Error al disparar ruido para ${id}:`, error);
      console.error(`❌ Stack trace:`, error instanceof Error ? error.stack : 'No disponible');
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

      // Actualizar parámetros específicos del PolySynth
      if (source.synth instanceof Tone.PolySynth) {
        console.log(`🔷 Actualizando parámetros del PolySynth`);
        
        // Actualizar polyphony si cambia
        if (params.polyphony !== undefined) {
          console.log(`🔷 Polyphony: ${params.polyphony}`);
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
          
          console.log(`🔷 Aplicando opciones de voz:`, voiceOptions);
          source.synth.set(voiceOptions);
        }
        
        // Para PolySynth, no necesitamos configurar frecuencia individual
        console.log(`🔷 Parámetros del PolySynth actualizados`);
      }

      // Actualizar frecuencia si cambia - usar rampTo en la señal de frecuencia del sintetizador
      if (params.frequency !== undefined && !(source.synth instanceof Tone.PolySynth)) {
        // Asegurar que la frecuencia sea al menos 20Hz (límite inferior del oído humano)
        const safeFrequency = Math.max(params.frequency, 20);
        console.log(`🎵 Frecuencia: ${params.frequency}Hz -> ${safeFrequency}Hz`);
        
        // Verificar si el sintetizador tiene la propiedad frequency (NoiseSynth no la tiene)
        if ('frequency' in source.synth && source.synth.frequency) {
          // --- CAMBIO CLAVE: Usar rampTo en la señal de frecuencia del sintetizador ---
          source.synth.frequency.rampTo(safeFrequency, 0.05);
          console.log(`🎵 Frecuencia aplicada en tiempo real para ${id}`);
        } else if (source.synth instanceof Tone.PluckSynth) {
          // Para PluckSynth, usar toFrequency
          (source.synth as Tone.PluckSynth).toFrequency(safeFrequency);
          console.log(`🎵 Frecuencia aplicada en tiempo real para ${id} (PluckSynth)`);
        } else {
          console.log(`🎵 Sintetizador ${source.synth.constructor.name} no tiene propiedad frequency`);
        }
      }

      // Actualizar parámetros específicos del PluckSynth (torus)
      if (source.synth instanceof Tone.PluckSynth) {
        // Es un PluckSynth
        const pluckSynth = source.synth as Tone.PluckSynth;
        
        // Actualizar attackNoise
        if (params.attackNoise !== undefined) {
          console.log(`🔄 Attack Noise: ${params.attackNoise}`);
          pluckSynth.attackNoise = params.attackNoise;
        }
        
        // Actualizar dampening
        if (params.dampening !== undefined) {
          console.log(`🔄 Dampening: ${params.dampening}`);
          pluckSynth.dampening = params.dampening;
        }
        
        // Actualizar resonance
        if (params.resonance !== undefined) {
          console.log(`🔄 Resonance: ${params.resonance}`);
          pluckSynth.resonance = params.resonance;
        }
      }

      // Actualizar tipo de onda si cambia
      if (params.waveform !== undefined) {
        console.log(`🎵 Forma de onda: ${params.waveform}`);
        
        // Manejar según el tipo de sintetizador
        if ('oscillator' in source.synth) {
          // AMSynth, FMSynth, MembraneSynth o MonoSynth
          (source.synth as Tone.AMSynth | Tone.FMSynth | Tone.MembraneSynth | Tone.MonoSynth).oscillator.type = params.waveform;
        } else if ('voice0' in source.synth) {
          // DuoSynth
          (source.synth as Tone.DuoSynth).voice0.oscillator.type = params.waveform;
        }
        console.log(`🎵 Forma de onda aplicada en tiempo real para ${id}`);
      }

      // Actualizar harmonicity si cambia (para AMSynth, FMSynth y MetalSynth)
      if (params.harmonicity !== undefined && 'harmonicity' in source.synth) {
        console.log(`🎵 Harmonicity: ${params.harmonicity}`);
        try {
          const harmonicity = (source.synth as Tone.AMSynth | Tone.FMSynth | Tone.MetalSynth).harmonicity;
          if (typeof harmonicity === 'object' && 'rampTo' in harmonicity) {
            harmonicity.rampTo(params.harmonicity, 0.05);
          } else {
            (source.synth as any).harmonicity = params.harmonicity;
          }
        } catch (error) {
          console.log(`🎵 Harmonicity rampTo no disponible, usando valor directo`);
          // Para MetalSynth, algunas propiedades pueden ser de solo lectura
        }
        console.log(`🎵 Harmonicity aplicado en tiempo real para ${id}`);
      }

      // Actualizar modulationIndex si cambia (para FMSynth y MetalSynth)
      if (params.modulationIndex !== undefined && 'modulationIndex' in source.synth) {
        console.log(`🎵 Modulation Index: ${params.modulationIndex}`);
        try {
          const modulationIndex = (source.synth as Tone.FMSynth | Tone.MetalSynth).modulationIndex;
          if (typeof modulationIndex === 'object' && 'rampTo' in modulationIndex) {
            modulationIndex.rampTo(params.modulationIndex, 0.05);
          } else {
            (source.synth as any).modulationIndex = params.modulationIndex;
          }
        } catch (error) {
          console.log(`🎵 Modulation Index rampTo no disponible, usando valor directo`);
          // Para MetalSynth, algunas propiedades pueden ser de solo lectura
        }
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

      // Actualizar parámetros específicos del MonoSynth
      if ('filterEnvelope' in source.synth) {
        // Es un MonoSynth
        const monoSynth = source.synth as Tone.MonoSynth;
        
        // Actualizar envolvente de amplitud
        if (params.ampAttack !== undefined) {
          console.log(`🔺 Amp Attack: ${params.ampAttack}`);
          monoSynth.envelope.attack = params.ampAttack;
        }
        if (params.ampDecay !== undefined) {
          console.log(`🔺 Amp Decay: ${params.ampDecay}`);
          monoSynth.envelope.decay = params.ampDecay;
        }
        if (params.ampSustain !== undefined) {
          console.log(`🔺 Amp Sustain: ${params.ampSustain}`);
          monoSynth.envelope.sustain = params.ampSustain;
        }
        if (params.ampRelease !== undefined) {
          console.log(`🔺 Amp Release: ${params.ampRelease}`);
          monoSynth.envelope.release = params.ampRelease;
        }
        
        // Actualizar envolvente de filtro
        if (params.filterAttack !== undefined) {
          console.log(`🔺 Filter Attack: ${params.filterAttack}`);
          monoSynth.filterEnvelope.attack = params.filterAttack;
        }
        if (params.filterDecay !== undefined) {
          console.log(`🔺 Filter Decay: ${params.filterDecay}`);
          monoSynth.filterEnvelope.decay = params.filterDecay;
        }
        if (params.filterSustain !== undefined) {
          console.log(`🔺 Filter Sustain: ${params.filterSustain}`);
          monoSynth.filterEnvelope.sustain = params.filterSustain;
        }
        if (params.filterRelease !== undefined) {
          console.log(`🔺 Filter Release: ${params.filterRelease}`);
          monoSynth.filterEnvelope.release = params.filterRelease;
        }
        if (params.filterBaseFreq !== undefined) {
          console.log(`🔺 Filter Base Frequency: ${params.filterBaseFreq}`);
          monoSynth.filterEnvelope.baseFrequency = params.filterBaseFreq;
        }
        if (params.filterOctaves !== undefined) {
          console.log(`🔺 Filter Octaves: ${params.filterOctaves}`);
          monoSynth.filterEnvelope.octaves = params.filterOctaves;
        }
        
        // Actualizar parámetros del filtro
        if (params.filterQ !== undefined) {
          console.log(`🔺 Filter Q: ${params.filterQ}`);
          monoSynth.filter.Q.value = params.filterQ;
        }
      }

                      // Actualizar parámetros específicos del MetalSynth
        if ('resonance' in source.synth) {
          // Es un MetalSynth
          const metalSynth = source.synth as Tone.MetalSynth;
          
          // Actualizar resonance
          if (params.resonance !== undefined) {
            console.log(`🔶 Resonance: ${params.resonance}`);
            metalSynth.resonance = params.resonance;
          }
          
          // Actualizar octaves
          if (params.octaves !== undefined) {
            console.log(`🔶 Octaves: ${params.octaves}`);
            metalSynth.octaves = params.octaves;
          }
        }

        // Actualizar parámetros específicos del NoiseSynth
        if (source.synth instanceof Tone.NoiseSynth) {
          // Es un NoiseSynth
          const noiseSynth = source.synth as Tone.NoiseSynth;
          
          // Actualizar tipo de ruido
          if (params.noiseType !== undefined) {
            console.log(`🟦 Tipo de ruido: ${params.noiseType}`);
            noiseSynth.noise.type = params.noiseType;
          }
          
          // Actualizar envolvente
          if (params.attack !== undefined) {
            console.log(`🟦 Attack: ${params.attack}`);
            noiseSynth.envelope.attack = params.attack;
          }
          if (params.decay !== undefined) {
            console.log(`🟦 Decay: ${params.decay}`);
            noiseSynth.envelope.decay = params.decay;
          }
          if (params.sustain !== undefined) {
            console.log(`🟦 Sustain: ${params.sustain}`);
            noiseSynth.envelope.sustain = params.sustain;
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
}

// Exportar una única instancia global
export const audioManager = AudioManager.getInstance();
console.log('🎵 AudioManager instanciado:', audioManager);
