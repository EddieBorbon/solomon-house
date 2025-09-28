import * as Tone from 'tone';
import { AudioParams, SoundSource } from '../../factories/SoundSourceFactory';
import { ParameterConfigManager } from './ParameterConfigManager';
import { BaseSynthesizerUpdater, ParameterUpdateResult } from './BaseSynthesizerUpdater';
import { PolySynthUpdater } from './PolySynthUpdater';
import { PluckSynthUpdater } from './PluckSynthUpdater';
import { DuoSynthUpdater } from './DuoSynthUpdater';
import { MembraneSynthUpdater } from './MembraneSynthUpdater';
import { MetalSynthUpdater } from './MetalSynthUpdater';
import { MonoSynthUpdater } from './MonoSynthUpdater';
import { FMSynthUpdater } from './FMSynthUpdater';
import { NoiseSynthUpdater } from './NoiseSynthUpdater';

// Union type for all possible synthesizer types
type SynthesizerType = Tone.Synth | Tone.FMSynth | Tone.AMSynth | Tone.DuoSynth | Tone.MonoSynth | Tone.MetalSynth | Tone.NoiseSynth | Tone.PluckSynth | Tone.MembraneSynth | Tone.PolySynth | Tone.Sampler;

/**
 * Facade para coordinar todos los updaters específicos de sintetizadores
 * Responsabilidad única: Coordinar y delegar actualizaciones a updaters específicos
 */
export class SynthesizerUpdaterFacade {
  private configManager: ParameterConfigManager;
  private updaters: Map<string, BaseSynthesizerUpdater>;

  constructor(configManager: ParameterConfigManager) {
    this.configManager = configManager;
    this.updaters = new Map();
    this.initializeUpdaters();
  }

  /**
   * Inicializa todos los updaters específicos
   */
  private initializeUpdaters(): void {
    this.updaters.set('PolySynth', new PolySynthUpdater(this.configManager));
    this.updaters.set('PluckSynth', new PluckSynthUpdater(this.configManager));
    this.updaters.set('DuoSynth', new DuoSynthUpdater(this.configManager));
    this.updaters.set('MembraneSynth', new MembraneSynthUpdater(this.configManager));
    this.updaters.set('MetalSynth', new MetalSynthUpdater(this.configManager));
    this.updaters.set('MonoSynth', new MonoSynthUpdater(this.configManager));
    this.updaters.set('FMSynth', new FMSynthUpdater(this.configManager));
    this.updaters.set('NoiseSynth', new NoiseSynthUpdater(this.configManager));
    // TODO: Agregar más updaters específicos cuando se creen
  }

  /**
   * Actualiza los parámetros de un sintetizador usando el updater apropiado
   */
  public updateSoundParams(
    source: SoundSource, 
    params: Partial<AudioParams>
  ): ParameterUpdateResult {
    // Solo loggear si hay parámetros significativos
    const significantParams = Object.keys(params).filter(key => 
      params[key as keyof AudioParams] !== undefined && 
      params[key as keyof AudioParams] !== null
    );
    
    if (significantParams.length > 0) {
      console.log('🔧 SynthesizerUpdaterFacade: Actualizando parámetros:', significantParams);
    }
    
    const result: ParameterUpdateResult = {
      success: true,
      updatedParams: [],
      errors: []
    };

    try {
      // Determinar el tipo de sintetizador y usar el updater apropiado
      const synthType = this.getSynthesizerType(source.synth);
      console.log(`SynthesizerUpdaterFacade: Tipo de sintetizador detectado: ${synthType}`);
      console.log(`SynthesizerUpdaterFacade: Sintetizador:`, source.synth);
      console.log(`SynthesizerUpdaterFacade: Parámetros recibidos:`, params);
      
      const updater = this.updaters.get(synthType);
      console.log(`SynthesizerUpdaterFacade: Updater encontrado:`, updater ? 'Sí' : 'No');

      if (updater) {
        // Usar updater específico
        console.log(`SynthesizerUpdaterFacade: Usando updater específico para ${synthType}`);
        updater.updateSynthesizer(source.synth, params, result);
      } else {
        // Usar lógica genérica para sintetizadores no específicos
        console.log(`SynthesizerUpdaterFacade: No se encontró updater específico para ${synthType}, usando genérico`);
        // this.updateGenericSynthesizer(source.synth, params, result);
      }

      // Actualizar parámetros comunes (volumen, frecuencia, etc.)
      this.updateCommonParams(source.synth, params, result);

      // Manejo especial para PolySynth: si se actualiza la frecuencia, regenerar el acorde
      if (source.synth instanceof Tone.PolySynth && params.frequency !== undefined) {
        this.handlePolySynthFrequencyUpdate(source.synth, params, result);
      }

    } catch (error) {
      result.success = false;
      result.errors.push(`Error general: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  /**
   * Determina el tipo de sintetizador
   */
  private getSynthesizerType(synth: SynthesizerType): string {
    console.log('🔍 getSynthesizerType: Analizando sintetizador:', synth);
    console.log('🔍 getSynthesizerType: Constructor name:', synth.constructor.name);
    console.log('🔍 getSynthesizerType: Propiedades:', Object.keys(synth));
    
    if (synth instanceof Tone.PolySynth) {
      console.log('🔍 getSynthesizerType: Detectado PolySynth');
      return 'PolySynth';
    }
    if (synth instanceof Tone.PluckSynth) {
      console.log('🔍 getSynthesizerType: Detectado PluckSynth');
      return 'PluckSynth';
    }
    if ('voice0' in synth && 'voice1' in synth) {
      console.log('🔍 getSynthesizerType: Detectado DuoSynth');
      return 'DuoSynth';
    }
    if ('pitchDecay' in synth && 'octaves' in synth) {
      console.log('🔍 getSynthesizerType: Detectado MembraneSynth');
      return 'MembraneSynth';
    }
    if ('filterEnvelope' in synth) {
      console.log('🔍 getSynthesizerType: Detectado MonoSynth');
      return 'MonoSynth';
    }
    if ('resonance' in synth) {
      console.log('🔍 getSynthesizerType: Detectado MetalSynth');
      return 'MetalSynth';
    }
    if (synth instanceof Tone.FMSynth) {
      console.log('🔍 getSynthesizerType: Detectado FMSynth');
      return 'FMSynth';
    }
    if (synth instanceof Tone.NoiseSynth) {
      console.log('🔍 getSynthesizerType: Detectado NoiseSynth');
      return 'NoiseSynth';
    }
    if (synth instanceof Tone.Sampler) {
      console.log('🔍 getSynthesizerType: Detectado Sampler');
      return 'Sampler';
    }
    
    console.log('🔍 getSynthesizerType: No se pudo detectar el tipo, usando genérico');
    return 'Generic';
  }

  /**
   * Actualiza parámetros comunes a todos los sintetizadores
   */
  private updateCommonParams(
    synth: SynthesizerType, 
    params: Partial<AudioParams>, 
    result: ParameterUpdateResult
  ): void {
    // Actualizar volumen si cambia
    if (params.volume !== undefined) {
      this.updateVolume(synth, params.volume, result);
    }

    // Actualizar frecuencia si cambia (solo para sintetizadores no específicos)
    if (params.frequency !== undefined && !this.isSpecificSynthesizer(synth)) {
      this.updateFrequency(synth, params.frequency, result);
    }

    // Actualizar tipo de onda si cambia
    if (params.waveform !== undefined) {
      this.updateWaveform(synth, params.waveform, result);
    }

    // Actualizar harmonicity si cambia
    if (params.harmonicity !== undefined && 'harmonicity' in synth) {
      this.updateHarmonicity(synth, params.harmonicity, result);
    }

    // Actualizar modulationIndex si cambia
    if (params.modulationIndex !== undefined && 'modulationIndex' in synth) {
      this.updateModulationIndex(synth, params.modulationIndex, result);
    }

    // Actualizar forma de onda de modulación si cambia
    if (params.modulationWaveform !== undefined && 'modulation' in synth) {
      this.updateModulationWaveform(synth, params.modulationWaveform, result);
    }
  }

  /**
   * Actualiza sintetizadores genéricos (no específicos)
   */
  private updateGenericSynthesizer(
    // synth: SynthesizerType, 
    // params: Partial<AudioParams>, 
    // result: ParameterUpdateResult
  ): void {
    // Implementar lógica genérica para sintetizadores no específicos
    // Por ahora, solo log
  }

  /**
   * Verifica si es un sintetizador con updater específico
   */
  private isSpecificSynthesizer(synth: SynthesizerType): boolean {
    return synth instanceof Tone.PolySynth || 
           synth instanceof Tone.PluckSynth ||
           ('voice0' in synth && 'voice1' in synth) ||
           ('pitchDecay' in synth && 'octaves' in synth);
  }

  // Métodos de actualización comunes (copiados de BaseSynthesizerUpdater)
  private updateFrequency(synth: SynthesizerType, frequency: number, result: ParameterUpdateResult): void {
    try {
      const safeFrequency = this.configManager.clampFrequency(frequency);
      if ('frequency' in synth && synth.frequency) {
        synth.frequency.rampTo(safeFrequency, this.configManager.getRampTime());
        result.updatedParams.push('frequency');
      }
    } catch (error) {
      result.errors.push(`Frequency update: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private updateWaveform(synth: SynthesizerType, waveform: string, result: ParameterUpdateResult): void {
    try {
      if ('oscillator' in synth) {
        (synth as unknown as { oscillator: { type: string } }).oscillator.type = waveform;
        result.updatedParams.push('waveform');
      }
    } catch (error) {
      result.errors.push(`Waveform update: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private updateHarmonicity(synth: SynthesizerType, harmonicity: number, result: ParameterUpdateResult): void {
    try {
      if ('harmonicity' in synth) {
        const harmonicityParam = (synth as unknown as { harmonicity: unknown }).harmonicity;
        if (harmonicityParam && typeof harmonicityParam === 'object' && 'rampTo' in harmonicityParam) {
          (harmonicityParam as { rampTo: (value: number, time: number) => void }).rampTo(harmonicity, this.configManager.getRampTime());
        } else {
          (synth as unknown as { harmonicity: number }).harmonicity = harmonicity;
        }
        result.updatedParams.push('harmonicity');
      }
    } catch (error) {
      result.errors.push(`Harmonicity update: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private updateModulationIndex(synth: SynthesizerType, modulationIndex: number, result: ParameterUpdateResult): void {
    try {
      if ('modulationIndex' in synth) {
        const modulationIndexParam = (synth as unknown as { modulationIndex: unknown }).modulationIndex;
        if (modulationIndexParam && typeof modulationIndexParam === 'object' && 'rampTo' in modulationIndexParam) {
          (modulationIndexParam as { rampTo: (value: number, time: number) => void }).rampTo(modulationIndex, this.configManager.getRampTime());
        } else {
          (synth as unknown as { modulationIndex: number }).modulationIndex = modulationIndex;
        }
        result.updatedParams.push('modulationIndex');
      }
    } catch (error) {
      result.errors.push(`ModulationIndex update: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private updateModulationWaveform(synth: SynthesizerType, modulationWaveform: string, result: ParameterUpdateResult): void {
    try {
      if ('modulation' in synth) {
        (synth as unknown as { modulation: { type: string } }).modulation.type = modulationWaveform;
        result.updatedParams.push('modulationWaveform');
      }
    } catch (error) {
      result.errors.push(`ModulationWaveform update: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private updateVolume(synth: SynthesizerType, volume: number, result: ParameterUpdateResult): void {
    try {
      const clampedVolume = this.configManager.clampVolume(volume);
      
      if ('modulation' in synth) {
        const amplitudeValue = clampedVolume;
        synth.oscillator.volume.rampTo(Tone.gainToDb(amplitudeValue), this.configManager.getRampTime());
      }
      
      const dbValue = clampedVolume > 0 ? Tone.gainToDb(clampedVolume) : -Infinity;
      synth.volume.rampTo(dbValue, this.configManager.getRampTime());
      
      result.updatedParams.push('volume');
    } catch (error) {
      result.errors.push(`Volume update: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Obtiene información de debug sobre los updaters disponibles
   */
  public getDebugInfo(): {
    availableUpdaters: string[];
    supportedSynthesizers: string[];
  } {
    return {
      availableUpdaters: Array.from(this.updaters.keys()),
      supportedSynthesizers: [
        'PolySynth',
        'PluckSynth',
        'DuoSynth',
        'MembraneSynth',
        'MonoSynth',
        'MetalSynth',
        'NoiseSynth',
        'Sampler',
        'AMSynth',
        'FMSynth'
      ]
    };
  }

  /**
   * Maneja la actualización de frecuencia en PolySynth regenerando el acorde
   */
  private handlePolySynthFrequencyUpdate(
    synth: Tone.PolySynth, 
    params: Partial<AudioParams>, 
    result: ParameterUpdateResult
  ): void {
    try {
      console.log('🎵 handlePolySynthFrequencyUpdate: Regenerando acorde para PolySynth');
      console.log('🎵 handlePolySynthFrequencyUpdate: Frecuencia recibida:', params.frequency);
      console.log('🎵 handlePolySynthFrequencyUpdate: Acorde recibido:', params.chord);
      
      // Detener el acorde actual si está sonando
      if (synth.activeVoices > 0) {
        console.log('🎵 handlePolySynthFrequencyUpdate: Deteniendo acorde actual');
        synth.releaseAll();
      }

      // Generar nuevo acorde basado en la frecuencia base
      if (params.frequency && params.frequency > 0) {
        // Convertir frecuencia base a nota
        const baseNote = this.frequencyToNote(params.frequency);
        console.log('🎵 handlePolySynthFrequencyUpdate: Frecuencia base:', params.frequency, '-> Nota base:', baseNote);
        
        // Generar acorde a partir de la nota base
        const chordNotes = this.generateChordFromNote(baseNote, params.chord || ["C4", "E4", "G4", "B4"]);
        console.log('🎵 handlePolySynthFrequencyUpdate: Acorde generado (notas):', chordNotes);
        
        // Convertir notas a frecuencias
        const chordFrequencies = chordNotes.map(note => this.noteToFrequency(note));
        
        console.log('🎵 handlePolySynthFrequencyUpdate: Nuevo acorde generado (frecuencias):', chordFrequencies);
        console.log('🎵 handlePolySynthFrequencyUpdate: Tipo de datos:', typeof chordFrequencies[0]);
        
        // Asegurar que el polyphony sea suficiente para el acorde ANTES de iniciarlo
        if (chordFrequencies.length > synth.maxPolyphony) {
          console.warn(`PolySynth: Acorde tiene ${chordFrequencies.length} notas pero polyphony es ${synth.maxPolyphony}. Ajustando polyphony.`);
          synth.maxPolyphony = chordFrequencies.length;
        }
        
        // Iniciar el nuevo acorde inmediatamente (sin setTimeout)
        console.log('🎵 handlePolySynthFrequencyUpdate: Iniciando acorde inmediatamente');
        synth.triggerAttack(chordFrequencies, Tone.now());
        result.updatedParams.push('chordRegenerated');
        
        console.log('🎵 handlePolySynthFrequencyUpdate: Nuevo acorde iniciado con frecuencias');
        console.log('🎵 handlePolySynthFrequencyUpdate: Voces activas después:', synth.activeVoices);
      }
    } catch (error) {
      result.errors.push(`PolySynth frequency update: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
   * Helper para convertir nota a frecuencia (ejemplo: "A4" -> 440Hz)
   */
  private noteToFrequency(note: string): number {
    return Tone.Frequency(note).toFrequency();
  }

  /**
   * Helper para generar acordes basados en una frecuencia base
   */
  private generateChordFromBase(baseFrequency: number, chord: string[]): number[] {
    const baseNote = this.frequencyToNote(baseFrequency);
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const baseNoteIndex = notes.indexOf(baseNote.replace(/[0-9]/g, ''));
    const baseOctave = parseInt(baseNote.replace(/[A-G#]/g, ''));
    
    const chordFrequencies = chord.map(note => {
      const noteName = note.replace(/[0-9]/g, '');
      const noteIndex = notes.indexOf(noteName);
      const semitoneDiff = noteIndex - baseNoteIndex;
      const newNoteName = notes[(semitoneDiff + 12) % 12];
      const newOctave = baseOctave + Math.floor((semitoneDiff + 12) / 12);
      const newNote = newNoteName + newOctave;
      return this.noteToFrequency(newNote);
    });
    
    return chordFrequencies;
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
}
