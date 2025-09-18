import * as Tone from 'tone';
import { AudioParams, SoundSource } from '../factories/SoundSourceFactory';

// Union type for all possible synthesizer types
type SynthesizerType = Tone.Synth | Tone.FMSynth | Tone.AMSynth | Tone.DuoSynth | Tone.MonoSynth;

// Tipos para reproducción de sonidos
export interface PlaybackState {
  isPlaying: boolean;
  startTime: number;
  duration?: number;
  params: AudioParams;
}

export interface PlaybackConfig {
  defaultDuration: number;
  uniqueTimeOffset: number;
  chordDelay: number;
}

export class SoundPlaybackManager {
  private playingSounds: Set<string> = new Set();
  private playbackStates: Map<string, PlaybackState> = new Map();
  private config: PlaybackConfig;

  constructor(config: PlaybackConfig = {
    defaultDuration: 0.5,
    uniqueTimeOffset: 0.001,
    chordDelay: 0.1
  }) {
    this.config = config;
  }

  /**
   * Inicia el sonido continuo de una fuente (completamente independiente de las interacciones de clic)
   */
  public startContinuousSound(
    soundId: string, 
    source: SoundSource, 
    params: AudioParams,
    updateParamsCallback: (id: string, params: AudioParams) => void
  ): void {
    if (this.playingSounds.has(soundId)) {
      return;
    }

    try {
      // Aplicar TODOS los parámetros antes de iniciar
      updateParamsCallback(soundId, params);
      
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
        this.playingSounds.add(soundId);
        this.updatePlaybackState(soundId, { isPlaying: true, startTime: Tone.now(), params });
        return;
      }
      
      // Para todos los demás sintetizadores, usar triggerAttack para sonido continuo
      // NO usar triggerAttackRelease aquí, solo triggerAttack para mantener el sonido
      try {
        (source.synth as SynthesizerType).triggerAttack(params.frequency, this.getUniqueStartTime());
        this.playingSounds.add(soundId);
        this.updatePlaybackState(soundId, { isPlaying: true, startTime: Tone.now(), params });
      } catch {
        // Fallback: intentar con triggerAttackRelease si está disponible
        if ('triggerAttackRelease' in source.synth) {
          try {
            const fallbackDuration = this.config.defaultDuration;
            (source.synth as SynthesizerType).triggerAttackRelease(params.frequency, fallbackDuration, this.getUniqueStartTime());
            this.playingSounds.add(soundId);
            this.updatePlaybackState(soundId, { isPlaying: true, startTime: Tone.now(), duration: fallbackDuration, params });
          } catch {
            // Manejo silencioso de errores
          }
        }
      }
    } catch {
      // Manejo silencioso de errores
    }
  }

  /**
   * Inicia el sonido de una fuente (para gate y sonidos temporales)
   */
  public startSound(
    soundId: string, 
    source: SoundSource, 
    params: AudioParams,
    updateParamsCallback: (id: string, params: AudioParams) => void
  ): void {
    if (this.playingSounds.has(soundId)) {
      return;
    }

    try {
      // Aplicar TODOS los parámetros antes de iniciar
      updateParamsCallback(soundId, params);
      
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
        this.playingSounds.add(soundId);
        this.updatePlaybackState(soundId, { isPlaying: true, startTime: Tone.now(), params });
        return;
      }
      
      // Para MonoSynth y otros sintetizadores, usar triggerAttack para sonido continuo
      // El triggerRelease se llamará cuando se detenga el sonido
      try {
        (source.synth as SynthesizerType).triggerAttack(params.frequency, Tone.now());
        this.playingSounds.add(soundId);
        this.updatePlaybackState(soundId, { isPlaying: true, startTime: Tone.now(), params });
      } catch {
        // Fallback: intentar con triggerAttackRelease si está disponible
        if ('triggerAttackRelease' in source.synth) {
          try {
            const fallbackDuration = this.config.defaultDuration;
            (source.synth as SynthesizerType).triggerAttackRelease(params.frequency, fallbackDuration, Tone.now());
            this.playingSounds.add(soundId);
            this.updatePlaybackState(soundId, { isPlaying: true, startTime: Tone.now(), duration: fallbackDuration, params });
          } catch {
            // Manejo silencioso de errores
          }
        }
      }
    } catch {
      // Manejo silencioso de errores
    }
  }

  /**
   * Detiene el sonido de una fuente
   */
  public stopSound(soundId: string, source: SoundSource): void {
    if (!source) {
      return;
    }

    // No verificar si está sonando, siempre intentar detener
    try {
      // Para PolySynth, usar releaseAll para detener todas las voces
      if (source.synth instanceof Tone.PolySynth) {
        source.synth.releaseAll(Tone.now());
        this.playingSounds.delete(soundId);
        this.removePlaybackState(soundId);
        return;
      }
      
      // triggerRelease inicia la fase de 'release' de la envolvente.
      // El sintetizador se encargará de detener el oscilador cuando la envolvente llegue a cero.
      source.synth.triggerRelease(Tone.now());
      
      this.playingSounds.delete(soundId);
      this.removePlaybackState(soundId);
    } catch {
      // Aún así, marcar como no sonando
      this.playingSounds.delete(soundId);
      this.removePlaybackState(soundId);
    }
  }

  /**
   * Dispara una nota percusiva (especialmente para MembraneSynth y Sampler)
   */
  public triggerNoteAttack(
    soundId: string, 
    source: SoundSource, 
    params: AudioParams,
    updateParamsCallback: (id: string, params: AudioParams) => void
  ): void {
    if (!source) {
      return;
    }

    try {
      // Aplicar parámetros antes de disparar
      updateParamsCallback(soundId, params);
      
      // Para Sampler, usar triggerAttackRelease con notas y duración
      if (source.synth instanceof Tone.Sampler) {
        try {
          const notes = params.notes || ["C4"];
          const duration = params.duration || 1.0;
          source.synth.triggerAttackRelease(notes, duration, Tone.now());
          this.updatePlaybackState(soundId, { isPlaying: true, startTime: Tone.now(), duration, params });
          return;
        } catch {
          // Si el Sampler falla, usar el fallback como un sintetizador normal
          const duration = params.duration || this.config.defaultDuration;
          const frequency = this.getNoteFrequency(params.notes?.[0] || "C4");
          (source.synth as unknown as SynthesizerType).triggerAttackRelease(frequency, duration, Tone.now());
          this.updatePlaybackState(soundId, { isPlaying: true, startTime: Tone.now(), duration, params });
          return;
        }
      }
      
      // Para sintetizadores de fallback (cuando el Sampler no pudo cargar)
      if ((source.synth as { _isFallback?: boolean })._isFallback) {
        const notes = Array.isArray(params.notes) ? params.notes : [params.notes || "C4"];
        const duration = params.duration || this.config.defaultDuration;
        
        // Reproducir cada nota del acorde
        notes.forEach((note: string, index: number) => {
          const frequency = this.getNoteFrequency(note);
          const delay = index * this.config.chordDelay;
          setTimeout(() => {
            try {
              (source.synth as SynthesizerType).triggerAttackRelease(frequency, duration, Tone.now());
            } catch {
              // Manejo silencioso de errores
            }
          }, delay * 1000);
        });
        this.updatePlaybackState(soundId, { isPlaying: true, startTime: Tone.now(), duration, params });
        return;
      }
      
      // Para PluckSynth, usar triggerAttack sin triggerRelease ya que decae naturalmente
      if (source.synth instanceof Tone.PluckSynth) {
        source.synth.triggerAttack(params.frequency, Tone.now());
        this.updatePlaybackState(soundId, { isPlaying: true, startTime: Tone.now(), params });
        return;
      }
      
      // Para todos los demás sintetizadores, usar triggerAttackRelease con duración configurada o triggerAttack para duración infinita
      const duration = params.duration;
      
      if (duration === Infinity) {
        // Duración infinita - usar triggerAttack para sonido continuo
        (source.synth as SynthesizerType).triggerAttack(params.frequency, Tone.now());
        this.updatePlaybackState(soundId, { isPlaying: true, startTime: Tone.now(), params });
      } else if ('triggerAttackRelease' in source.synth) {
        // Duración finita - usar triggerAttackRelease
        const actualDuration = duration || this.config.defaultDuration;
        (source.synth as SynthesizerType).triggerAttackRelease(params.frequency, actualDuration, Tone.now());
        this.updatePlaybackState(soundId, { isPlaying: true, startTime: Tone.now(), duration: actualDuration, params });
      } else {
        // Fallback para sintetizadores que no soportan triggerAttackRelease
        try {
          (source.synth as SynthesizerType).triggerAttack(params.frequency, Tone.now());
          this.updatePlaybackState(soundId, { isPlaying: true, startTime: Tone.now(), params });
        } catch {
          // Último recurso: intentar con triggerAttack en el sintetizador principal
          if (typeof (source.synth as SynthesizerType).triggerAttack === 'function') {
            (source.synth as SynthesizerType).triggerAttack(params.frequency, Tone.now());
            this.updatePlaybackState(soundId, { isPlaying: true, startTime: Tone.now(), params });
          }
        }
      }
    } catch {
      // Manejo silencioso de errores
    }
  }

  /**
   * Dispara una nota con duración específica (para interacción de clic corto)
   * Este método funciona universalmente con todos los tipos de sintetizadores
   */
  public triggerAttackRelease(
    soundId: string, 
    source: SoundSource, 
    params: AudioParams,
    updateParamsCallback: (id: string, params: AudioParams) => void
  ): void {
    if (!source) {
      return;
    }

    try {
      // Aplicar parámetros antes de disparar
      updateParamsCallback(soundId, params);
      
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
        this.updatePlaybackState(soundId, { isPlaying: true, startTime: Tone.now(), duration: this.parseDuration(duration), params });
        return;
      }
      
      // Para Sampler, usar triggerAttackRelease con notas
      if (source.synth instanceof Tone.Sampler) {
        const notes = params.notes || ["C4"];
        const duration = params.duration || '8n';
        source.synth.triggerAttackRelease(notes, duration, Tone.now());
        this.updatePlaybackState(soundId, { isPlaying: true, startTime: Tone.now(), duration: this.parseDuration(duration), params });
        return;
      }
      
      // Para sintetizadores de fallback
      if ((source.synth as { _isFallback?: boolean })._isFallback) {
        const notes = Array.isArray(params.notes) ? params.notes : [params.notes || "C4"];
        const duration = params.duration || '8n';
        
        notes.forEach((note: string, index: number) => {
          const frequency = this.getNoteFrequency(note);
          const delay = index * this.config.chordDelay;
          setTimeout(() => {
            try {
              (source.synth as SynthesizerType).triggerAttackRelease(frequency, duration, Tone.now());
            } catch {
              // Manejo silencioso de errores
            }
          }, delay * 1000);
        });
        this.updatePlaybackState(soundId, { isPlaying: true, startTime: Tone.now(), duration: this.parseDuration(duration), params });
        return;
      }
      
      // Para todos los demás sintetizadores, usar triggerAttackRelease universal
      if ('triggerAttackRelease' in source.synth) {
        const frequency = params.frequency;
        const duration = params.duration || '8n';
        
        (source.synth as SynthesizerType).triggerAttackRelease(frequency, duration, Tone.now());
        this.updatePlaybackState(soundId, { isPlaying: true, startTime: Tone.now(), duration: this.parseDuration(duration), params });
      } else {
        // Fallback: usar triggerAttack con duración manual
        const frequency = params.frequency;
        const duration = params.duration || this.config.defaultDuration;
        
        (source.synth as SynthesizerType).triggerAttack(frequency, Tone.now());
        setTimeout(() => {
          try {
            (source.synth as SynthesizerType).triggerRelease(Tone.now());
          } catch {
            // Manejo silencioso de errores
          }
        }, duration * 1000);
        this.updatePlaybackState(soundId, { isPlaying: true, startTime: Tone.now(), duration, params });
      }
    } catch {
      // Manejo silencioso de errores
    }
  }

  /**
   * Dispara un ataque de ruido (especialmente para NoiseSynth)
   */
  public triggerNoiseAttack(
    soundId: string, 
    source: SoundSource, 
    params: AudioParams,
    updateParamsCallback: (id: string, params: AudioParams) => void
  ): void {
    if (!source) {
      return;
    }

    try {
      // Aplicar parámetros antes de disparar
      updateParamsCallback(soundId, params);
      
      // Para NoiseSynth, usar triggerAttackRelease con duración
      if (source.synth instanceof Tone.NoiseSynth) {
        const duration = params.duration || 0.1; // Duración por defecto para ruido
        source.synth.triggerAttackRelease(duration, Tone.now());
        this.updatePlaybackState(soundId, { isPlaying: true, startTime: Tone.now(), duration, params });
      }
    } catch {
      // Manejo silencioso de errores
    }
  }

  /**
   * Verifica si una fuente de sonido está activamente sonando
   */
  public isSoundPlaying(soundId: string): boolean {
    return this.playingSounds.has(soundId);
  }

  /**
   * Obtiene el estado de reproducción de un sonido
   */
  public getPlaybackState(soundId: string): PlaybackState | undefined {
    return this.playbackStates.get(soundId);
  }

  /**
   * Obtiene todos los sonidos que están reproduciéndose
   */
  public getPlayingSounds(): Set<string> {
    return new Set(this.playingSounds);
  }

  /**
   * Detiene todos los sonidos activos
   */
  public stopAllSounds(soundSources: Map<string, SoundSource>): void {
    this.playingSounds.forEach(soundId => {
      try {
        const source = soundSources.get(soundId);
        if (source) {
          this.stopSound(soundId, source);
        }
      } catch {
        // Manejo silencioso de errores
      }
    });
  }

  /**
   * Limpia el estado de reproducción de un sonido
   */
  public removePlaybackState(soundId: string): void {
    this.playbackStates.delete(soundId);
  }

  /**
   * Actualiza el estado de reproducción de un sonido
   */
  private updatePlaybackState(soundId: string, state: PlaybackState): void {
    this.playbackStates.set(soundId, state);
  }

  /**
   * Helper para convertir nota a frecuencia (ejemplo: "A4" -> 440Hz)
   */
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

  /**
   * Helper para convertir frecuencia a nota (ejemplo: 440Hz -> "A4")
   */
  private frequencyToNote(frequency: number): string {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(Math.log2(frequency / 440) / 12) + 4; // 440Hz es A4
    const noteIndex = Math.round(12 * Math.log2(frequency / 440)) % 12;
    return notes[noteIndex] + octave;
  }

  /**
   * Helper para generar acordes basados en una nota base
   */
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

  /**
   * Helper para obtener un tiempo único para el triggerAttack de sonidos continuos
   */
  private getUniqueStartTime(): number {
    return Tone.now() + this.config.uniqueTimeOffset;
  }

  /**
   * Helper para convertir duración musical a segundos
   */
  private parseDuration(duration: string | number): number {
    if (typeof duration === 'number') {
      return duration;
    }
    
    // Convertir notación musical a segundos
    const tempo = Tone.Transport.bpm.value;
    // const timeSignature = Tone.Transport.timeSignature; // Not used currently
    
    // Simplificar: asumir 4/4 y convertir notación básica
    const noteValues: { [key: string]: number } = {
      '1n': 4, '2n': 2, '4n': 1, '8n': 0.5, '16n': 0.25, '32n': 0.125
    };
    
    const noteValue = noteValues[duration] || 1;
    return (noteValue * 60) / tempo;
  }

  /**
   * Actualiza la configuración del manager
   */
  public updateConfig(config: Partial<PlaybackConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Obtiene la configuración actual del manager
   */
  public getConfig(): PlaybackConfig {
    return { ...this.config };
  }

  /**
   * Obtiene información de debug del manager
   */
  public getDebugInfo(): {
    playingSoundsCount: number;
    playingSoundsIds: string[];
    config: PlaybackConfig;
  } {
    return {
      playingSoundsCount: this.playingSounds.size,
      playingSoundsIds: Array.from(this.playingSounds),
      config: this.getConfig(),
    };
  }

  /**
   * Limpia todos los recursos del SoundPlaybackManager
   */
  public cleanup(): void {
    try {
      this.playingSounds.clear();
      this.playbackStates.clear();
      console.log(`🧹 SoundPlaybackManager: Limpieza completada`);
    } catch (error) {
      console.error(`❌ SoundPlaybackManager: Error durante la limpieza:`, error);
    }
  }
}
