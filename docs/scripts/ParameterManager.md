# Documentación: `src/lib/managers/ParameterManager.ts`

## Propósito
Manager especializado para actualizar parámetros de sintetizadores de audio de forma segura y eficiente. Proporciona una interfaz unificada para configurar diferentes tipos de sintetizadores de Tone.js con validación, manejo de errores y optimizaciones de rendimiento.

## Funcionalidades Principales

### 1. Actualización Segura de Parámetros
- Actualización robusta de parámetros de sintetizadores
- Manejo de errores y validación de tipos
- Soporte para múltiples tipos de sintetizadores

### 2. Soporte Completo de Sintetizadores
- PolySynth, PluckSynth, DuoSynth, MembraneSynth
- MonoSynth, MetalSynth, NoiseSynth, Sampler
- AMSynth, FMSynth y otros sintetizadores

### 3. Validación y Configuración
- Validación de rangos de parámetros
- Configuración personalizable de límites
- Manejo de errores detallado

## Estructura del Código

```typescript
export interface ParameterUpdateResult {
  success: boolean;
  updatedParams: string[];
  errors: string[];
}

export interface ParameterConfig {
  volumeRange: {
    min: number;
    max: number;
    dbRange: {
      min: number;
      max: number;
    };
  };
  frequencyRange: {
    min: number;
    max: number;
  };
  rampTime: number;
}

export class ParameterManager {
  private config: ParameterConfig;
  
  // ... métodos de gestión de parámetros
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
constructor(config: ParameterConfig = {
  volumeRange: {
    min: 0,
    max: 1.0,
    dbRange: {
      min: -Infinity,
      max: 0
    }
  },
  frequencyRange: {
    min: 20,
    max: 20000
  },
  rampTime: 0.05
}) {
  this.config = config;
}
```

### Configuración por Defecto
```typescript
{
  volumeRange: {
    min: 0,              // Volumen mínimo (0 = silencio)
    max: 1.0,            // Volumen máximo (1.0 = volumen completo)
    dbRange: {
      min: -Infinity,    // dB mínimo (silencio)
      max: 0             // dB máximo (sin amplificación)
    }
  },
  frequencyRange: {
    min: 20,             // Frecuencia mínima (20Hz)
    max: 20000           // Frecuencia máxima (20kHz)
  },
  rampTime: 0.05         // Tiempo de rampa para cambios suaves (50ms)
}
```

## Método Principal de Actualización

### `updateSoundParams`
```typescript
public updateSoundParams(
  source: SoundSource, 
  params: Partial<AudioParams>
): ParameterUpdateResult {
  const result: ParameterUpdateResult = {
    success: true,
    updatedParams: [],
    errors: []
  };

  try {
    // Actualizar parámetros específicos del PolySynth
    if (source.synth instanceof Tone.PolySynth) {
      this.updatePolySynthParams(source.synth, params, result);
    }

    // Actualizar frecuencia si cambia
    if (params.frequency !== undefined && !(source.synth instanceof Tone.PolySynth)) {
      this.updateFrequency(source.synth, params.frequency, result);
    }

    // Actualizar otros parámetros según el tipo de sintetizador
    // ... más actualizaciones específicas

    // Actualizar volumen si cambia
    if (params.volume !== undefined) {
      this.updateVolume(source.synth, params.volume, result);
    }

  } catch (error) {
    result.success = false;
    result.errors.push(`Error general: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
}
```

## Actualización de Sintetizadores Específicos

### PolySynth
```typescript
private updatePolySynthParams(
  synth: Tone.PolySynth, 
  params: Partial<AudioParams>, 
  result: ParameterUpdateResult
): void {
  try {
    // Actualizar polyphony
    if (params.polyphony !== undefined) {
      synth.maxPolyphony = params.polyphony;
      result.updatedParams.push('polyphony');
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
      
      synth.set(voiceOptions);
      result.updatedParams.push('voiceOptions');
    }
  } catch (error) {
    result.errors.push(`PolySynth params: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
```

### PluckSynth
```typescript
private updatePluckSynthParams(
  synth: Tone.PluckSynth, 
  params: Partial<AudioParams>, 
  result: ParameterUpdateResult
): void {
  try {
    // Actualizar attackNoise
    if (params.attackNoise !== undefined) {
      synth.attackNoise = params.attackNoise;
      result.updatedParams.push('attackNoise');
    }
    
    // Actualizar dampening
    if (params.dampening !== undefined) {
      synth.dampening = params.dampening;
      result.updatedParams.push('dampening');
    }
    
    // Actualizar resonance
    if (params.resonance !== undefined) {
      synth.resonance = params.resonance;
      result.updatedParams.push('resonance');
    }
  } catch (error) {
    result.errors.push(`PluckSynth params: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
```

### MonoSynth
```typescript
private updateMonoSynthParams(
  synth: any, 
  params: Partial<AudioParams>, 
  result: ParameterUpdateResult
): void {
  try {
    // Actualizar envolvente de amplitud
    if (params.ampAttack !== undefined) {
      synth.envelope.attack = params.ampAttack;
      result.updatedParams.push('ampAttack');
    }
    if (params.ampDecay !== undefined) {
      synth.envelope.decay = params.ampDecay;
      result.updatedParams.push('ampDecay');
    }
    if (params.ampSustain !== undefined) {
      synth.envelope.sustain = params.ampSustain;
      result.updatedParams.push('ampSustain');
    }
    if (params.ampRelease !== undefined) {
      synth.envelope.release = params.ampRelease;
      result.updatedParams.push('ampRelease');
    }
    
    // Actualizar envolvente de filtro
    if (params.filterAttack !== undefined) {
      synth.filterEnvelope.attack = params.filterAttack;
      result.updatedParams.push('filterAttack');
    }
    if (params.filterDecay !== undefined) {
      synth.filterEnvelope.decay = params.filterDecay;
      result.updatedParams.push('filterDecay');
    }
    if (params.filterSustain !== undefined) {
      synth.filterEnvelope.sustain = params.filterSustain;
      result.updatedParams.push('filterSustain');
    }
    if (params.filterRelease !== undefined) {
      synth.filterEnvelope.release = params.filterRelease;
      result.updatedParams.push('filterRelease');
    }
    if (params.filterBaseFreq !== undefined) {
      synth.filterEnvelope.baseFrequency = params.filterBaseFreq;
      result.updatedParams.push('filterBaseFreq');
    }
    if (params.filterOctaves !== undefined) {
      synth.filterEnvelope.octaves = params.filterOctaves;
      result.updatedParams.push('filterOctaves');
    }
    
    // Actualizar parámetros del filtro
    if (params.filterQ !== undefined) {
      synth.filter.Q.value = params.filterQ;
      result.updatedParams.push('filterQ');
    }
  } catch (error) {
    result.errors.push(`MonoSynth params: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
```

## Actualización de Parámetros Específicos

### Frecuencia
```typescript
private updateFrequency(
  synth: any, 
  frequency: number, 
  result: ParameterUpdateResult
): void {
  try {
    // Asegurar que la frecuencia esté en el rango válido
    const safeFrequency = Math.max(
      this.config.frequencyRange.min, 
      Math.min(this.config.frequencyRange.max, frequency)
    );
    
    // Verificar si el sintetizador tiene la propiedad frequency
    if ('frequency' in synth && synth.frequency) {
      synth.frequency.rampTo(safeFrequency, this.config.rampTime);
      result.updatedParams.push('frequency');
    } else if (synth instanceof Tone.PluckSynth) {
      // Para PluckSynth, usar toFrequency
      synth.toFrequency(safeFrequency);
      result.updatedParams.push('frequency');
    }
  } catch (error) {
    result.errors.push(`Frequency update: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
```

### Volumen
```typescript
private updateVolume(
  synth: any, 
  volume: number, 
  result: ParameterUpdateResult
): void {
  try {
    // Clampear el volumen al rango configurado
    const clampedVolume = Math.max(
      this.config.volumeRange.min, 
      Math.min(this.config.volumeRange.max, volume)
    );

    // Para síntesis AM, el volumen debe controlar tanto la amplitud como el volumen general
    if ('modulation' in synth) {
      // Es un AMSynth - aplicar volumen a la amplitud de la portadora
      const amplitudeValue = clampedVolume;
      synth.oscillator.volume.rampTo(Tone.gainToDb(amplitudeValue), this.config.rampTime);
    }
    
    // Aplicar volumen general al sintetizador (control de salida)
    // Mapeo directo: 0 = -Infinity, 1.0 = 0dB (volumen completo)
    const dbValue = clampedVolume > 0 ? Tone.gainToDb(clampedVolume) : -Infinity;
    synth.volume.rampTo(dbValue, this.config.rampTime);
    
    result.updatedParams.push('volume');
  } catch (error) {
    result.errors.push(`Volume update: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
```

### Harmonicity y ModulationIndex
```typescript
private updateHarmonicity(
  synth: any, 
  harmonicity: number, 
  result: ParameterUpdateResult
): void {
  try {
    const harmonicityParam = synth.harmonicity;
    if (typeof harmonicityParam === 'object' && 'rampTo' in harmonicityParam) {
      harmonicityParam.rampTo(harmonicity, this.config.rampTime);
    } else {
      synth.harmonicity = harmonicity;
    }
    result.updatedParams.push('harmonicity');
  } catch (error) {
    result.errors.push(`Harmonicity update: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

private updateModulationIndex(
  synth: any, 
  modulationIndex: number, 
  result: ParameterUpdateResult
): void {
  try {
    const modulationIndexParam = synth.modulationIndex;
    if (typeof modulationIndexParam === 'object' && 'rampTo' in modulationIndexParam) {
      modulationIndexParam.rampTo(modulationIndex, this.config.rampTime);
    } else {
      synth.modulationIndex = modulationIndex;
    }
    result.updatedParams.push('modulationIndex');
  } catch (error) {
    result.errors.push(`ModulationIndex update: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
```

## Validación de Parámetros

### Método de Validación
```typescript
public validateParams(params: Partial<AudioParams>): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validar frecuencia
  if (params.frequency !== undefined) {
    if (params.frequency < this.config.frequencyRange.min) {
      errors.push(`Frecuencia ${params.frequency}Hz está por debajo del mínimo (${this.config.frequencyRange.min}Hz)`);
    } else if (params.frequency > this.config.frequencyRange.max) {
      errors.push(`Frecuencia ${params.frequency}Hz está por encima del máximo (${this.config.frequencyRange.max}Hz)`);
    }
  }

  // Validar volumen
  if (params.volume !== undefined) {
    if (params.volume < this.config.volumeRange.min) {
      warnings.push(`Volumen ${params.volume} está por debajo del mínimo recomendado (${this.config.volumeRange.min})`);
    } else if (params.volume > this.config.volumeRange.max) {
      warnings.push(`Volumen ${params.volume} está por encima del máximo recomendado (${this.config.volumeRange.max})`);
    }
  }

  // Validar parámetros de envolvente
  if (params.attack !== undefined && params.attack < 0) {
    errors.push('Attack no puede ser negativo');
  }
  if (params.decay !== undefined && params.decay < 0) {
    errors.push('Decay no puede ser negativo');
  }
  if (params.release !== undefined && params.release < 0) {
    errors.push('Release no puede ser negativo');
  }
  if (params.sustain !== undefined && (params.sustain < 0 || params.sustain > 1)) {
    errors.push('Sustain debe estar entre 0 y 1');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
```

## Configuración Dinámica

### Actualizar Configuración
```typescript
public updateConfig(config: Partial<ParameterConfig>): void {
  this.config = { ...this.config, ...config };
}

public getConfig(): ParameterConfig {
  return { ...this.config };
}
```

### Información de Debug
```typescript
public getDebugInfo(): {
  config: ParameterConfig;
  supportedSynthesizers: string[];
} {
  return {
    config: this.getConfig(),
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
```

## Uso en la Aplicación

### Importación y Creación
```typescript
import { ParameterManager } from '../lib/managers/ParameterManager';

// Crear instancia con configuración por defecto
const parameterManager = new ParameterManager();

// Crear con configuración personalizada
const parameterManager = new ParameterManager({
  volumeRange: {
    min: 0,
    max: 1.0,
    dbRange: {
      min: -60,
      max: 0
    }
  },
  frequencyRange: {
    min: 50,
    max: 15000
  },
  rampTime: 0.1
});
```

### Uso Básico
```typescript
// Actualizar parámetros de un sintetizador
const result = parameterManager.updateSoundParams(soundSource, {
  frequency: 440,
  volume: 0.7,
  attack: 0.1,
  release: 0.3
});

if (result.success) {
  console.log('Parámetros actualizados:', result.updatedParams);
} else {
  console.error('Errores:', result.errors);
}
```

### Validación Antes de Actualizar
```typescript
// Validar parámetros antes de aplicar
const validation = parameterManager.validateParams({
  frequency: 440,
  volume: 1.5,
  attack: -0.1
});

if (validation.valid) {
  const result = parameterManager.updateSoundParams(soundSource, params);
} else {
  console.error('Parámetros inválidos:', validation.errors);
  console.warn('Advertencias:', validation.warnings);
}
```

### Integración con React
```typescript
import { useEffect, useRef } from 'react';
import { ParameterManager } from '../lib/managers/ParameterManager';

function AudioParameterProvider({ children }) {
  const parameterManagerRef = useRef<ParameterManager | null>(null);
  
  useEffect(() => {
    // Crear manager al montar
    parameterManagerRef.current = new ParameterManager({
      rampTime: 0.05,  // Cambios más suaves
      volumeRange: {
        min: 0,
        max: 1.0,
        dbRange: {
          min: -40,
          max: 0
        }
      }
    });
    
    return () => {
      // Cleanup si es necesario
    };
  }, []);
  
  return (
    <ParameterManagerContext.Provider value={parameterManagerRef.current}>
      {children}
    </ParameterManagerContext.Provider>
  );
}
```

## Relaciones con Otros Archivos

### Archivos Relacionados
- `SoundSourceFactory.ts`: Proporciona tipos AudioParams y SoundSource
- `AudioManager.ts`: Usa ParameterManager para actualizar sintetizadores
- `ParameterEditor.tsx`: Interfaz de usuario para editar parámetros

### Integración Típica
```typescript
// En AudioManager.ts
import { ParameterManager } from './managers/ParameterManager';

export class AudioManager {
  private parameterManager: ParameterManager;
  
  constructor() {
    this.parameterManager = new ParameterManager();
  }
  
  updateSoundParameters(soundId: string, params: Partial<AudioParams>) {
    const soundSource = this.getSoundSource(soundId);
    if (soundSource) {
      return this.parameterManager.updateSoundParams(soundSource, params);
    }
    return { success: false, updatedParams: [], errors: ['Sound source not found'] };
  }
}
```

## Consideraciones de Rendimiento

### Optimizaciones Implementadas
1. **Validación Temprana**: Verifica tipos antes de aplicar
2. **Rampas Suaves**: Usa rampTo para transiciones sin clicks
3. **Manejo de Errores**: Evita crashes por parámetros inválidos
4. **Configuración Flexible**: Permite ajustar límites según necesidades

### Mejores Prácticas
- Validar parámetros antes de aplicar
- Usar configuraciones apropiadas para el tipo de aplicación
- Manejar errores de actualización correctamente
- Configurar rampTime según el tipo de interacción

## Configuración Avanzada

### Configuración para Aplicaciones Interactivas
```typescript
const interactiveConfig = {
  rampTime: 0.01,        // Cambios muy rápidos
  volumeRange: {
    min: 0,
    max: 1.0,
    dbRange: {
      min: -20,
      max: 0
    }
  },
  frequencyRange: {
    min: 80,             // Rango audible completo
    max: 18000
  }
};
```

### Configuración para Aplicaciones Musicales
```typescript
const musicalConfig = {
  rampTime: 0.1,         // Cambios más suaves
  volumeRange: {
    min: 0,
    max: 1.0,
    dbRange: {
      min: -60,
      max: 0
    }
  },
  frequencyRange: {
    min: 20,             // Rango completo de audio
    max: 20000
  }
};
```

## Troubleshooting

### Problemas Comunes
1. **Parámetros no se aplican**: Verificar que el sintetizador soporte el parámetro
2. **Errores de validación**: Revisar rangos de configuración
3. **Cambios abruptos**: Ajustar rampTime para transiciones más suaves

### Soluciones
1. Verificar el tipo de sintetizador y sus parámetros soportados
2. Usar `validateParams()` antes de aplicar cambios
3. Ajustar configuración según el tipo de aplicación

## Ejemplo de Uso Completo

```typescript
import { ParameterManager } from '../lib/managers/ParameterManager';
import { SoundSourceFactory } from '../lib/factories/SoundSourceFactory';

class AudioParameterController {
  private parameterManager: ParameterManager;
  private soundSourceFactory: SoundSourceFactory;
  
  constructor() {
    this.parameterManager = new ParameterManager({
      rampTime: 0.05,
      volumeRange: {
        min: 0,
        max: 1.0,
        dbRange: {
          min: -40,
          max: 0
        }
      },
      frequencyRange: {
        min: 50,
        max: 15000
      }
    });
    
    this.soundSourceFactory = new SoundSourceFactory();
  }
  
  createAndConfigureSound(soundId: string, type: string, params: any) {
    // Crear fuente de sonido
    const soundSource = this.soundSourceFactory.createSoundSource(type, params);
    
    // Validar parámetros antes de aplicar
    const validation = this.parameterManager.validateParams(params);
    if (!validation.valid) {
      console.error('Parámetros inválidos:', validation.errors);
      return null;
    }
    
    // Aplicar parámetros
    const result = this.parameterManager.updateSoundParams(soundSource, params);
    if (!result.success) {
      console.error('Error al aplicar parámetros:', result.errors);
      return null;
    }
    
    console.log('Parámetros aplicados:', result.updatedParams);
    return soundSource;
  }
  
  updateSoundParameters(soundSource: any, params: any) {
    // Validar primero
    const validation = this.parameterManager.validateParams(params);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }
    
    // Aplicar cambios
    const result = this.parameterManager.updateSoundParams(soundSource, params);
    
    // Log de resultados
    if (result.success) {
      console.log(`✅ Parámetros actualizados: ${result.updatedParams.join(', ')}`);
    } else {
      console.error(`❌ Errores en actualización: ${result.errors.join(', ')}`);
    }
    
    return result;
  }
  
  getManagerInfo() {
    return this.parameterManager.getDebugInfo();
  }
}

// Uso
const audioController = new AudioParameterController();

// Crear y configurar un sonido
const soundSource = audioController.createAndConfigureSound(
  'synth-1',
  'monoSynth',
  {
    frequency: 440,
    volume: 0.7,
    attack: 0.1,
    release: 0.3,
    waveform: 'sawtooth'
  }
);

// Actualizar parámetros dinámicamente
if (soundSource) {
  audioController.updateSoundParameters(soundSource, {
    frequency: 880,
    volume: 0.5,
    attack: 0.05
  });
}

// Obtener información del manager
const info = audioController.getManagerInfo();
console.log('Sintetizadores soportados:', info.supportedSynthesizers);
console.log('Configuración actual:', info.config);
```


