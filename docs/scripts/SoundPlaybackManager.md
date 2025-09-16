# Documentación: `src/lib/managers/SoundPlaybackManager.ts`

## Propósito
Manager especializado para gestionar la reproducción de sonidos con diferentes tipos de sintetizadores. Proporciona métodos específicos para iniciar, detener y controlar la reproducción de audio con soporte para sonidos continuos, percusivos y con duración específica.

## Funcionalidades Principales

### 1. Gestión de Reproducción
- Control de sonidos continuos y temporales
- Gestión de estados de reproducción
- Soporte para múltiples tipos de sintetizadores

### 2. Tipos de Reproducción
- Sonidos continuos (gate/trigger)
- Sonidos percusivos (attack-release)
- Sonidos con duración específica
- Sonidos de ruido (NoiseSynth)

### 3. Optimización de Rendimiento
- Gestión eficiente de múltiples sonidos simultáneos
- Tiempos únicos para evitar colisiones
- Configuración de delays para acordes

## Estructura del Código

```typescript
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
  
  // ... métodos de reproducción
}
```

## Dependencias

### Externas
- `tone`: Biblioteca principal de audio para sintetizadores

### Internas
- `SoundSourceFactory`: Para tipos AudioParams y SoundSource

## Configuración Inicial

### Constructor
```typescript
constructor(config: PlaybackConfig = {
  defaultDuration: 0.5,      // Duración por defecto en segundos
  uniqueTimeOffset: 0.001,   // Offset para evitar colisiones
  chordDelay: 0.1            // Delay entre notas de acordes
}) {
  this.config = config;
}
```

### Configuración por Defecto
```typescript
{
  defaultDuration: 0.5,      // 500ms de duración por defecto
  uniqueTimeOffset: 0.001,   // 1ms de offset único
  chordDelay: 0.1            // 100ms entre notas de acorde
}
```

## Métodos de Reproducción

### 1. Sonido Continuo
```typescript
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
    
    // Para PolySynth, usar triggerAttack con acordes
    if (source.synth instanceof Tone.PolySynth) {
      let chord = params.chord || ["C4", "E4", "G4"];
      
      // Si hay frecuencia base, transponer el acorde
      if (params.frequency && params.frequency > 0) {
        const baseNote = this.frequencyToNote(params.frequency);
        chord = this.generateChordFromBase(baseNote, chord);
      }
      
      source.synth.triggerAttack(chord, this.getUniqueStartTime());
      this.playingSounds.add(soundId);
      this.updatePlaybackState(soundId, { isPlaying: true, startTime: Tone.now(), params });
      return;
    }
    
    // Para otros sintetizadores, usar triggerAttack para sonido continuo
    try {
      (source.synth as any).triggerAttack(params.frequency, this.getUniqueStartTime());
      this.playingSounds.add(soundId);
      this.updatePlaybackState(soundId, { isPlaying: true, startTime: Tone.now(), params });
    } catch (error) {
      // Fallback: intentar con triggerAttackRelease
      if ('triggerAttackRelease' in source.synth) {
        const fallbackDuration = this.config.defaultDuration;
        (source.synth as any).triggerAttackRelease(params.frequency, fallbackDuration, this.getUniqueStartTime());
        this.playingSounds.add(soundId);
        this.updatePlaybackState(soundId, { isPlaying: true, startTime: Tone.now(), duration: fallbackDuration, params });
      }
    }
  } catch (error) {
    // Manejo silencioso de errores
  }
}
```

### 2. Sonido con Gate
```typescript
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
    updateParamsCallback(soundId, params);
    
    // Para PolySynth, usar triggerAttack con acordes
    if (source.synth instanceof Tone.PolySynth) {
      let chord = params.chord || ["C4", "E4", "G4"];
      
      if (params.frequency && params.frequency > 0) {
        const baseNote = this.frequencyToNote(params.frequency);
        chord = this.generateChordFromBase(baseNote, chord);
      }
      
      source.synth.triggerAttack(chord, Tone.now());
      this.playingSounds.add(soundId);
      this.updatePlaybackState(soundId, { isPlaying: true, startTime: Tone.now(), params });
      return;
    }
    
    // Para MonoSynth y otros, usar triggerAttack para sonido continuo
    try {
      (source.synth as any).triggerAttack(params.frequency, Tone.now());
      this.playingSounds.add(soundId);
      this.updatePlaybackState(soundId, { isPlaying: true, startTime: Tone.now(), params });
    } catch (error) {
      // Fallback con triggerAttackRelease
      if ('triggerAttackRelease' in source.synth) {
        const fallbackDuration = this.config.defaultDuration;
        (source.synth as any).triggerAttackRelease(params.frequency, fallbackDuration, Tone.now());
        this.playingSounds.add(soundId);
        this.updatePlaybackState(soundId, { isPlaying: true, startTime: Tone.now(), duration: fallbackDuration, params });
      }
    }
  } catch (error) {
    // Manejo silencioso de errores
  }
}
```

### 3. Sonido con Duración Específica
```typescript
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
    updateParamsCallback(soundId, params);
    
    // Para PolySynth, usar triggerAttackRelease con acordes
    if (source.synth instanceof Tone.PolySynth) {
      let chord = params.chord || ["C4", "E4", "G4"];
      
      if (params.frequency && params.frequency > 0) {
        const baseNote = this.frequencyToNote(params.frequency);
        chord = this.generateChordFromBase(baseNote, chord);
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
    if ((source.synth as any)._isFallback) {
      const notes = Array.isArray(params.notes) ? params.notes : [params.notes || "C4"];
      const duration = params.duration || '8n';
      
      notes.forEach((note: string, index: number) => {
        const frequency = this.getNoteFrequency(note);
        const delay = index * this.config.chordDelay;
        setTimeout(() => {
          try {
            (source.synth as any).triggerAttackRelease(frequency, duration, Tone.now());
          } catch (error) {
            // Manejo silencioso de errores
          }
        }, delay * 1000);
      });
      this.updatePlaybackState(soundId, { isPlaying: true, startTime: Tone.now(), duration: this.parseDuration(duration), params });
      return;
    }
    
    // Para todos los demás sintetizadores
    if ('triggerAttackRelease' in source.synth) {
      const frequency = params.frequency;
      const duration = params.duration || '8n';
      
      (source.synth as any).triggerAttackRelease(frequency, duration, Tone.now());
      this.updatePlaybackState(soundId, { isPlaying: true, startTime: Tone.now(), duration: this.parseDuration(duration), params });
    } else {
      // Fallback: usar triggerAttack con duración manual
      const frequency = params.frequency;
      const duration = params.duration || this.config.defaultDuration;
      
      (source.synth as any).triggerAttack(frequency, Tone.now());
      setTimeout(() => {
        try {
          (source.synth as any).triggerRelease(Tone.now());
        } catch (error) {
          // Manejo silencioso de errores
        }
      }, duration * 1000);
      this.updatePlaybackState(soundId, { isPlaying: true, startTime: Tone.now(), duration, params });
    }
  } catch (error) {
    // Manejo silencioso de errores
  }
}
```

### 4. Sonidos Percusivos
```typescript
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
    updateParamsCallback(soundId, params);
    
    // Para Sampler, usar triggerAttackRelease con notas y duración
    if (source.synth instanceof Tone.Sampler) {
      try {
        const notes = params.notes || ["C4"];
        const duration = params.duration || 1.0;
        source.synth.triggerAttackRelease(notes, duration, Tone.now());
        this.updatePlaybackState(soundId, { isPlaying: true, startTime: Tone.now(), duration, params });
        return;
      } catch (samplerError) {
        // Fallback como sintetizador normal
        const duration = params.duration || this.config.defaultDuration;
        const frequency = this.getNoteFrequency(params.notes?.[0] || "C4");
        (source.synth as any).triggerAttackRelease(frequency, duration, Tone.now());
        this.updatePlaybackState(soundId, { isPlaying: true, startTime: Tone.now(), duration, params });
        return;
      }
    }
    
    // Para PluckSynth, usar triggerAttack sin triggerRelease
    if (source.synth instanceof Tone.PluckSynth) {
      source.synth.triggerAttack(params.frequency, Tone.now());
      this.updatePlaybackState(soundId, { isPlaying: true, startTime: Tone.now(), params });
      return;
    }
    
    // Para otros sintetizadores
    const duration = params.duration;
    
    if (duration === Infinity) {
      // Duración infinita - usar triggerAttack
      (source.synth as any).triggerAttack(params.frequency, Tone.now());
      this.updatePlaybackState(soundId, { isPlaying: true, startTime: Tone.now(), params });
    } else if ('triggerAttackRelease' in source.synth) {
      // Duración finita - usar triggerAttackRelease
      const actualDuration = duration || this.config.defaultDuration;
      (source.synth as any).triggerAttackRelease(params.frequency, actualDuration, Tone.now());
      this.updatePlaybackState(soundId, { isPlaying: true, startTime: Tone.now(), duration: actualDuration, params });
    } else {
      // Fallback para sintetizadores sin triggerAttackRelease
      try {
        (source.synth as any).triggerAttack(params.frequency, Tone.now());
        this.updatePlaybackState(soundId, { isPlaying: true, startTime: Tone.now(), params });
      } catch (fallbackError) {
        // Último recurso
        if (typeof (source.synth as any).triggerAttack === 'function') {
          (source.synth as any).triggerAttack(params.frequency, Tone.now());
          this.updatePlaybackState(soundId, { isPlaying: true, startTime: Tone.now(), params });
        }
      }
    }
  } catch (error) {
    // Manejo silencioso de errores
  }
}
```

### 5. Sonidos de Ruido
```typescript
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
    updateParamsCallback(soundId, params);
    
    // Para NoiseSynth, usar triggerAttackRelease con duración
    if (source.synth instanceof Tone.NoiseSynth) {
      const duration = params.duration || 0.1; // Duración por defecto para ruido
      source.synth.triggerAttackRelease(duration, Tone.now());
      this.updatePlaybackState(soundId, { isPlaying: true, startTime: Tone.now(), duration, params });
    }
  } catch (error) {
    // Manejo silencioso de errores
  }
}
```

## Detención de Sonidos

### Detener Sonido
```typescript
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
    
    // triggerRelease inicia la fase de 'release' de la envolvente
    source.synth.triggerRelease(Tone.now());
    
    this.playingSounds.delete(soundId);
    this.removePlaybackState(soundId);
  } catch (error) {
    // Aún así, marcar como no sonando
    this.playingSounds.delete(soundId);
    this.removePlaybackState(soundId);
  }
}
```

### Detener Todos los Sonidos
```typescript
public stopAllSounds(soundSources: Map<string, SoundSource>): void {
  this.playingSounds.forEach(soundId => {
    try {
      const source = soundSources.get(soundId);
      if (source) {
        this.stopSound(soundId, source);
      }
    } catch (error) {
      // Manejo silencioso de errores
    }
  });
}
```

## Utilidades y Helpers

### Conversión de Notas
```typescript
// Convertir nota a frecuencia (ejemplo: "A4" -> 440Hz)
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

// Convertir frecuencia a nota (ejemplo: 440Hz -> "A4")
private frequencyToNote(frequency: number): string {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(Math.log2(frequency / 440) / 12) + 4; // 440Hz es A4
  const noteIndex = Math.round(12 * Math.log2(frequency / 440)) % 12;
  return notes[noteIndex] + octave;
}
```

### Generación de Acordes
```typescript
// Generar acordes basados en una nota base
private generateChordFromBase(baseNote: string, chord: string[]): string[] {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const baseNoteIndex = notes.indexOf(baseNote.replace(/[0-9]/g, ''));
  const chordNotes = chord.map(note => {
    const noteName = note.replace(/[0-9]/g, '');
    const noteIndex = notes.indexOf(noteName);
    const semitoneDiff = noteIndex - baseNoteIndex;
    return notes[(semitoneDiff + 12) % 12] + (parseInt(note[note.length - 1]) + 1);
  });
  return chordNotes;
}
```

### Conversión de Duración
```typescript
// Convertir duración musical a segundos
private parseDuration(duration: string | number): number {
  if (typeof duration === 'number') {
    return duration;
  }
  
  // Convertir notación musical a segundos
  const tempo = Tone.Transport.bpm.value;
  const timeSignature = Tone.Transport.timeSignature;
  
  // Simplificar: asumir 4/4 y convertir notación básica
  const noteValues: { [key: string]: number } = {
    '1n': 4, '2n': 2, '4n': 1, '8n': 0.5, '16n': 0.25, '32n': 0.125
  };
  
  const noteValue = noteValues[duration] || 1;
  return (noteValue * 60) / tempo;
}
```

### Tiempo Único
```typescript
// Obtener tiempo único para evitar colisiones
private getUniqueStartTime(): number {
  return Tone.now() + this.config.uniqueTimeOffset;
}
```

## Gestión de Estado

### Verificar Estado de Reproducción
```typescript
// Verificar si una fuente está sonando
public isSoundPlaying(soundId: string): boolean {
  return this.playingSounds.has(soundId);
}

// Obtener estado de reproducción
public getPlaybackState(soundId: string): PlaybackState | undefined {
  return this.playbackStates.get(soundId);
}

// Obtener todos los sonidos que están reproduciéndose
public getPlayingSounds(): Set<string> {
  return new Set(this.playingSounds);
}
```

### Actualizar Estado
```typescript
// Actualizar estado de reproducción
private updatePlaybackState(soundId: string, state: PlaybackState): void {
  this.playbackStates.set(soundId, state);
}

// Limpiar estado de reproducción
public removePlaybackState(soundId: string): void {
  this.playbackStates.delete(soundId);
}
```

## Uso en la Aplicación

### Importación y Creación
```typescript
import { SoundPlaybackManager } from '../lib/managers/SoundPlaybackManager';

// Crear instancia con configuración por defecto
const playbackManager = new SoundPlaybackManager();

// Crear con configuración personalizada
const playbackManager = new SoundPlaybackManager({
  defaultDuration: 1.0,      // 1 segundo por defecto
  uniqueTimeOffset: 0.005,   // 5ms de offset
  chordDelay: 0.05           // 50ms entre notas
});
```

### Uso Básico
```typescript
// Iniciar sonido continuo
playbackManager.startContinuousSound(
  'synth-1',
  soundSource,
  { frequency: 440, volume: 0.7 },
  updateParamsCallback
);

// Detener sonido
playbackManager.stopSound('synth-1', soundSource);

// Reproducir sonido con duración
playbackManager.triggerAttackRelease(
  'synth-2',
  soundSource,
  { frequency: 880, duration: '4n', volume: 0.5 },
  updateParamsCallback
);

// Reproducir sonido percusivo
playbackManager.triggerNoteAttack(
  'drum-1',
  drumSource,
  { notes: ['C4'], duration: 0.2 },
  updateParamsCallback
);
```

### Integración con React
```typescript
import { useEffect, useRef } from 'react';
import { SoundPlaybackManager } from '../lib/managers/SoundPlaybackManager';

function AudioPlaybackProvider({ children }) {
  const playbackManagerRef = useRef<SoundPlaybackManager | null>(null);
  
  useEffect(() => {
    // Crear manager al montar
    playbackManagerRef.current = new SoundPlaybackManager({
      defaultDuration: 0.5,
      uniqueTimeOffset: 0.001,
      chordDelay: 0.1
    });
    
    return () => {
      // Limpiar al desmontar
      if (playbackManagerRef.current) {
        playbackManagerRef.current.cleanup();
      }
    };
  }, []);
  
  return (
    <PlaybackManagerContext.Provider value={playbackManagerRef.current}>
      {children}
    </PlaybackManagerContext.Provider>
  );
}
```

## Relaciones con Otros Archivos

### Archivos Relacionados
- `SoundSourceFactory.ts`: Proporciona tipos AudioParams y SoundSource
- `AudioManager.ts`: Usa SoundPlaybackManager para controlar reproducción
- `ParameterManager.ts`: Actualiza parámetros antes de reproducir

### Integración Típica
```typescript
// En AudioManager.ts
import { SoundPlaybackManager } from './managers/SoundPlaybackManager';

export class AudioManager {
  private playbackManager: SoundPlaybackManager;
  
  constructor() {
    this.playbackManager = new SoundPlaybackManager();
  }
  
  playSound(soundId: string, params: AudioParams) {
    const soundSource = this.getSoundSource(soundId);
    if (soundSource) {
      this.playbackManager.startContinuousSound(
        soundId,
        soundSource,
        params,
        this.updateSoundParams.bind(this)
      );
    }
  }
}
```

## Consideraciones de Rendimiento

### Optimizaciones Implementadas
1. **Tiempos Únicos**: Evita colisiones de triggers
2. **Gestión de Estado**: Rastrea sonidos activos eficientemente
3. **Fallbacks Inteligentes**: Maneja diferentes tipos de sintetizadores
4. **Delays de Acordes**: Reproduce acordes con timing natural

### Mejores Prácticas
- Usar el método apropiado según el tipo de sonido
- Limpiar estados de sonidos no utilizados
- Configurar delays apropiados para acordes
- Manejar errores de reproducción correctamente

## Configuración Avanzada

### Configuración para Aplicaciones Musicales
```typescript
const musicalConfig = {
  defaultDuration: 1.0,      // Notas más largas
  uniqueTimeOffset: 0.01,    // Mayor offset para precisión
  chordDelay: 0.05           // Acordes más rápidos
};
```

### Configuración para Aplicaciones Interactivas
```typescript
const interactiveConfig = {
  defaultDuration: 0.2,      // Sonidos más cortos
  uniqueTimeOffset: 0.001,   // Offset mínimo
  chordDelay: 0.1            // Acordes más espaciados
};
```

## Troubleshooting

### Problemas Comunes
1. **Sonidos no se reproducen**: Verificar que el sintetizador esté inicializado
2. **Colisiones de audio**: Ajustar uniqueTimeOffset
3. **Acordes desincronizados**: Ajustar chordDelay

### Soluciones
1. Verificar que soundSource sea válido antes de reproducir
2. Usar diferentes métodos según el tipo de sintetizador
3. Configurar parámetros apropiados para cada tipo de sonido

## Ejemplo de Uso Completo

```typescript
import { SoundPlaybackManager } from '../lib/managers/SoundPlaybackManager';
import { SoundSourceFactory } from '../lib/factories/SoundSourceFactory';

class AudioPlaybackController {
  private playbackManager: SoundPlaybackManager;
  private soundSourceFactory: SoundSourceFactory;
  private soundSources: Map<string, any> = new Map();
  
  constructor() {
    this.playbackManager = new SoundPlaybackManager({
      defaultDuration: 0.5,
      uniqueTimeOffset: 0.001,
      chordDelay: 0.1
    });
    
    this.soundSourceFactory = new SoundSourceFactory();
    this.setupDefaultSounds();
  }
  
  private setupDefaultSounds() {
    // Crear fuentes de sonido
    const synthSource = this.soundSourceFactory.createSoundSource('monoSynth', {
      frequency: 440,
      volume: 0.7
    });
    
    const drumSource = this.soundSourceFactory.createSoundSource('sampler', {
      notes: ['C4'],
      volume: 0.8
    });
    
    const chordSource = this.soundSourceFactory.createSoundSource('polySynth', {
      chord: ['C4', 'E4', 'G4'],
      volume: 0.6
    });
    
    // Almacenar fuentes
    this.soundSources.set('synth', synthSource);
    this.soundSources.set('drum', drumSource);
    this.soundSources.set('chord', chordSource);
  }
  
  playContinuousSound(soundId: string, params: any) {
    const soundSource = this.soundSources.get(soundId);
    if (soundSource) {
      this.playbackManager.startContinuousSound(
        soundId,
        soundSource,
        params,
        this.updateParams.bind(this)
      );
    }
  }
  
  stopSound(soundId: string) {
    const soundSource = this.soundSources.get(soundId);
    if (soundSource) {
      this.playbackManager.stopSound(soundId, soundSource);
    }
  }
  
  playShortSound(soundId: string, params: any) {
    const soundSource = this.soundSources.get(soundId);
    if (soundSource) {
      this.playbackManager.triggerAttackRelease(
        soundId,
        soundSource,
        params,
        this.updateParams.bind(this)
      );
    }
  }
  
  playPercussiveSound(soundId: string, params: any) {
    const soundSource = this.soundSources.get(soundId);
    if (soundSource) {
      this.playbackManager.triggerNoteAttack(
        soundId,
        soundSource,
        params,
        this.updateParams.bind(this)
      );
    }
  }
  
  private updateParams(id: string, params: any) {
    const soundSource = this.soundSources.get(id);
    if (soundSource) {
      // Aplicar parámetros usando ParameterManager
      // ... lógica de actualización de parámetros
    }
  }
  
  getPlayingSounds() {
    return this.playbackManager.getPlayingSounds();
  }
  
  isSoundPlaying(soundId: string) {
    return this.playbackManager.isSoundPlaying(soundId);
  }
  
  stopAllSounds() {
    this.playbackManager.stopAllSounds(this.soundSources);
  }
  
  cleanup() {
    this.playbackManager.cleanup();
  }
}

// Uso
const audioController = new AudioPlaybackController();

// Reproducir diferentes tipos de sonidos
audioController.playContinuousSound('synth', { frequency: 440, volume: 0.7 });
audioController.playShortSound('drum', { notes: ['C4'], duration: 0.2 });
audioController.playPercussiveSound('chord', { chord: ['C4', 'E4', 'G4'], duration: 1.0 });

// Controlar reproducción
setTimeout(() => {
  audioController.stopSound('synth');
}, 2000);

// Verificar estado
console.log('Sonidos reproduciéndose:', audioController.getPlayingSounds());
console.log('Synth sonando:', audioController.isSoundPlaying('synth'));

// Detener todo
audioController.stopAllSounds();
```


