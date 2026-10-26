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

      // Para NoiseSynth, usar triggerAttack sin frecuencia (sonido continuo)
      if (source.synth instanceof Tone.NoiseSynth) {
        source.synth.triggerAttack(this.getUniqueStartTime());
        this.playingSounds.add(soundId);
        this.updatePlaybackState(soundId, { isPlaying: true, startTime: Tone.now(), params });
        return;
      }

      // Para PolySynth, usar triggerAttack con acordes (sonido continuo)
      if (source.synth instanceof Tone.PolySynth) {
        // Aplicar parámetros antes de disparar
        updateParamsCallback(soundId, params);

        // Generar acorde basado en la frecuencia base si está disponible
        let chord: number[];

        // Si hay frecuencia base, transponer el acorde
        if (params.frequency && params.frequency > 0) {
          // Convertir frecuencia base a nota
          const baseNote = this.frequencyToNote(params.frequency);
          // Generar acorde a partir de la nota base
          const chordNotes = this.generateChordFromNote(baseNote, params.chord || ["C4", "E4", "G4", "B4"]);
          // Convertir notas a frecuencias
          chord = chordNotes.map(note => this.noteToFrequency(note));
        } else {
          // Convertir acorde de notas a frecuencias
          chord = this.convertChordToFrequencies(params.chord || ["C4", "E4", "G4", "B4"]);
        }

        // Validar y filtrar frecuencias inválidas
        const validChord = chord.filter(freq => !isNaN(freq) && freq > 0 && freq < 20000);

        console.log('🎵 PolySynth startContinuousSound:');
        console.log('  - Acorde original:', chord.length, 'notas');
        console.log('  - Acorde válido:', validChord.length, 'notas');
        console.log('  - Polyphony:', source.synth.maxPolyphony);
        console.log('  - Voces activas antes:', source.synth.activeVoices);

        if (validChord.length === 0) {
          console.error('❌ PolySynth: No hay frecuencias válidas en el acorde');
          return;
        }

        // Ajustar el polyphony automáticamente para que coincida con el número de notas del acorde
        if (validChord.length !== source.synth.maxPolyphony) {
          console.log(`🔧 PolySynth: Ajustando polyphony de ${source.synth.maxPolyphony} a ${validChord.length} voces`);
          source.synth.maxPolyphony = Math.max(validChord.length, source.synth.maxPolyphony);
        }

        source.synth.triggerAttack(validChord, this.getUniqueStartTime());

        // Log después del trigger
        setTimeout(() => {
          console.log('🎵 PolySynth después del trigger:');
          console.log('  - Voces activas después:', (source.synth as Tone.PolySynth).activeVoices);
          console.log('  - Polyphony después:', (source.synth as Tone.PolySynth).maxPolyphony);
        }, 100);

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
        let chord: number[];

        // Si hay frecuencia base, transponer el acorde
        if (params.frequency && params.frequency > 0) {
          // Convertir frecuencia base a nota
          const baseNote = this.frequencyToNote(params.frequency);
          // Generar acorde a partir de la nota base
          const chordNotes = this.generateChordFromNote(baseNote, params.chord || ["C4", "E4", "G4", "B4"]);
          // Convertir notas a frecuencias
          chord = chordNotes.map(note => this.noteToFrequency(note));
        } else {
          // Convertir acorde de notas a frecuencias
          chord = this.convertChordToFrequencies(params.chord || ["C4", "E4", "G4", "B4"]);
        }

        // Validar y filtrar frecuencias inválidas
        const validChord = chord.filter(freq => !isNaN(freq) && freq > 0 && freq < 20000);

        if (validChord.length === 0) {
          console.error('❌ PolySynth triggerNoteAttack: No hay frecuencias válidas');
          return;
        }

        source.synth.triggerAttack(validChord, Tone.now());
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

      // Para NoiseSynth, usar triggerAttackRelease con duración
      if (source.synth instanceof Tone.NoiseSynth) {
        const duration = params.duration || '8n';
        source.synth.triggerAttackRelease(duration, Tone.now());
        this.updatePlaybackState(soundId, { isPlaying: true, startTime: Tone.now(), duration: this.parseDuration(duration), params });
        return;
      }

      // Para PolySynth, usar triggerAttackRelease con acordes
      if (source.synth instanceof Tone.PolySynth) {
        let chord: number[];

        // Si hay frecuencia base, transponer el acorde
        if (params.frequency && params.frequency > 0) {
          chord = this.generateChordFrequencies(params.frequency, params.chord || ["C4", "E4", "G4", "B4"]);
        } else {
          chord = this.convertChordToFrequencies(params.chord || ["C4", "E4", "G4", "B4"]);
        }

        // Validar y filtrar frecuencias inválidas
        const validChord = chord.filter(freq => !isNaN(freq) && freq > 0 && freq < 20000);

        console.log('🎵 PolySynth triggerAttackRelease:');
        console.log('  - Acorde original:', chord.length, 'notas');
        console.log('  - Acorde válido:', validChord.length, 'notas');
        console.log('  - Polyphony actual:', source.synth.maxPolyphony);
        console.log('  - Primeras 5 frecuencias:', validChord.slice(0, 5));

        if (validChord.length === 0) {
          console.error('❌ PolySynth: No hay frecuencias válidas en el acorde');
          return;
        }

        // Ajustar el polyphony automáticamente para que coincida con el número de notas del acorde
        if (validChord.length !== source.synth.maxPolyphony) {
          console.log(`🔧 PolySynth: Ajustando polyphony de ${source.synth.maxPolyphony} a ${validChord.length} voces`);
          source.synth.maxPolyphony = Math.max(validChord.length, source.synth.maxPolyphony);
        }

        const duration = params.duration || '8n';
        source.synth.triggerAttackRelease(validChord, duration, Tone.now());
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
   * Modula temporalmente un sonido continuo para simular interacción (ej. proximidad dinámica)
   */
  public triggerDroneInteraction(soundId: string, source: SoundSource): void {
    console.log(`[SoundPlaybackManager] triggerDroneInteraction llamado para ${soundId}`);

    if (!source) {
      console.log(`[SoundPlaybackManager] Error: No hay source para ${soundId}`);
      return;
    }

    if (!this.playingSounds.has(soundId)) {
      console.log(`[SoundPlaybackManager] Error: El sonido ${soundId} no está en playingSounds (¿Está pausado/silenciado?)`);
      // Relaxed constraint: Intentar modular aunque no esté estrictamente en playingSounds temporalmente
      // return; 
    }

    try {
      const now = Tone.now();

      console.log(`[SoundPlaybackManager] Synth constructor: ${source.synth?.constructor?.name}`);

      // Efecto específico según el tipo de sintetizador
      if (source.synth instanceof Tone.FMSynth || source.synth?.constructor?.name === 'FMSynth') {
        console.log(`[SoundPlaybackManager] Modulando FMSynth Index`);
        const fmSynth = source.synth as Tone.FMSynth;
        // En síntesis FM, modular temporalmente el índice de modulación
        const currentIndex = fmSynth.modulationIndex.value || 10;
        fmSynth.modulationIndex.rampTo(currentIndex + 30, 0.1, now);
        fmSynth.modulationIndex.rampTo(currentIndex, 1.0, now + 0.1);
      } else if (source.synth instanceof Tone.AMSynth || source.synth?.constructor?.name === 'AMSynth') {
        console.log(`[SoundPlaybackManager] Modulando AMSynth harmonicity`);
        const amSynth = source.synth as Tone.AMSynth;
        // En síntesis AM, aumentar armonicidad
        const currentHarm = amSynth.harmonicity.value || 1;
        amSynth.harmonicity.rampTo(currentHarm * 2, 0.1, now);
        amSynth.harmonicity.rampTo(currentHarm, 1.0, now + 0.1);
      } else if (source.synth instanceof Tone.MetalSynth || source.synth?.constructor?.name === 'MetalSynth') {
        console.log(`[SoundPlaybackManager] Modulando MetalSynth harmonicity y modulationIndex`);
        const metalSynth = source.synth as Tone.MetalSynth;

        // En MetalSynth, harmonicity y modulationIndex son números, no Signals
        // Modificar armonicidad
        const currentHarm = metalSynth.harmonicity || 5.1;
        metalSynth.harmonicity = Math.max(0.1, currentHarm * 0.5); // Limitar a un valor válido

        // Modificar índice de modulación
        const currentMod = metalSynth.modulationIndex || 32;
        metalSynth.modulationIndex = currentMod + 50;

        // Restaurar valores después de 150ms
        setTimeout(() => {
          try {
            if (metalSynth && !metalSynth.disposed) {
              metalSynth.harmonicity = currentHarm;
              metalSynth.modulationIndex = currentMod;
            }
          } catch {
            // Ignorar errores si el synth fue destruido
          }
        }, 150);
      } else {
        console.log(`[SoundPlaybackManager] Modulando Volumen genérico / Wobble`);
        // Para osciladores normales o genéricos, subir el volumen (Wobble) y bajar levemente
        const synth = source.synth as any;
        if (synth.volume) {
          const currentVol = synth.volume.value;
          synth.volume.rampTo(currentVol + 6, 0.1, now);
          synth.volume.rampTo(currentVol, 1.0, now + 0.1);
        }
      }
    } catch (error) {
      console.error(`[SoundPlaybackManager] Error simulando interacción: `, error);
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
    // A4 = 440Hz (nota índice 9 en el array)
    const noteIndexFromA4 = Math.round(12 * Math.log2(frequency / 440));
    const noteIndex = (9 + noteIndexFromA4 + 12) % 12;
    const octave = Math.floor((9 + noteIndexFromA4) / 12) + 4;
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
    if (typeof window === 'undefined') {
      return 0;
    }
    return Tone.now() + this.config.uniqueTimeOffset;
  }

  /**
   * Helper para convertir duración musical a segundos
   */
  private parseDuration(duration: string | number): number {
    if (typeof duration === 'number') {
      return duration;
    }

    // Solo ejecutar en el cliente (navegador), no durante SSR
    if (typeof window === 'undefined' || !Tone || !Tone.getTransport()) {
      // Valor por defecto en caso de SSR
      return 1;
    }

    // Convertir notación musical a segundos
    const tempo = Tone.getTransport().bpm.value;
    // const timeSignature = Tone.getTransport().timeSignature; // Not used currently

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
   * Helper para convertir nota a frecuencia (ejemplo: "A4" -> 440Hz)
   */
  private noteToFrequency(note: string): number {
    return Tone.Frequency(note).toFrequency();
  }

  /**
   * Helper para generar acordes basados en una frecuencia base (devuelve frecuencias)
   */
  private generateChordFrequencies(baseFrequency: number, chord: string[]): number[] {
    const baseNote = this.frequencyToNote(baseFrequency);
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const baseNoteName = baseNote.replace(/[0-9]/g, '');
    const baseNoteIndex = notes.indexOf(baseNoteName);
    const baseOctave = parseInt(baseNote.replace(/[A-G#]/g, '')) || 4;

    const chordFrequencies = chord.map((note) => {
      const noteName = note.replace(/[0-9]/g, '');
      const noteIndex = notes.indexOf(noteName);

      if (noteIndex === -1) {
        // Si no se encuentra la nota, usar la frecuencia base
        return baseFrequency;
      }

      // Calcular la diferencia en semitonos
      const semitoneDiff = noteIndex - baseNoteIndex;
      // Calcular el octave correcto, considerando que puede exceder de 0-8
      const noteOctave = parseInt(note.replace(/[A-G#]/g, '')) || baseOctave;

      // Generar la nota correcta
      const newNoteName = notes[(semitoneDiff + 12) % 12];
      const newOctave = noteOctave;
      const newNote = newNoteName + newOctave;

      return this.noteToFrequency(newNote);
    });

    return chordFrequencies;
  }

  /**
   * Helper para convertir acorde de notas a frecuencias
   */
  private convertChordToFrequencies(chord: string[]): number[] {
    return chord.map(note => {
      // Si la nota ya tiene un octave especificado, usarlo directamente
      const frequency = this.noteToFrequency(note);
      if (isNaN(frequency) || frequency <= 0) {
        console.warn(`⚠️ Frecuencia inválida para nota: ${note}`);
        return 440; // Fallback a A4
      }
      return frequency;
    });
  }

  /**
   * Helper para generar acordes basados en una nota base (devuelve notas)
   */
  private generateChordFromNote(baseNote: string, chord: string[]): string[] {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const baseNoteIndex = notes.indexOf(baseNote.replace(/[0-9]/g, ''));
    const baseOctave = parseInt(baseNote.replace(/[A-G#]/g, ''));

    const chordNotes = chord.map(note => {
      const noteName = note.replace(/[0-9]/g, '');
      const noteIndex = notes.indexOf(noteName);
      const semitoneDiff = noteIndex - baseNoteIndex;
      const newNoteName = notes[(semitoneDiff + 12) % 12];
      const newOctave = baseOctave + Math.floor((semitoneDiff + 12) / 12);
      return newNoteName + newOctave;
    });

    return chordNotes;
  }

  /**
   * Limpia todos los recursos del SoundPlaybackManager
   */
  public cleanup(): void {
    try {
      this.playingSounds.clear();
      this.playbackStates.clear();
    } catch {
    }
  }
}
