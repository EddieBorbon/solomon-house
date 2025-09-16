# Documentación: `src/lib/factories/SoundSourceFactory.ts`

## Propósito
Factory especializado para crear diferentes tipos de sintetizadores de Tone.js y configurar sus cadenas de audio correspondientes, implementando el patrón Factory para la creación de fuentes de sonido con arquitectura Send/Return.

## Funcionalidades Principales

### 1. **Creación de Sintetizadores**
- Factory para 10 tipos diferentes de sintetizadores
- Configuración automática según el tipo de objeto 3D
- Parámetros específicos para cada tipo de sintetizador

### 2. **Arquitectura Send/Return**
- Implementa sistema de envío de audio a efectos
- Cada fuente tiene un send independiente para cada efecto
- Control granular de niveles de envío

### 3. **Configuración de Cadenas de Audio**
- Panner3D para espacialización
- DryGain para señal seca
- EffectSends para señal con efectos
- Conexiones automáticas entre nodos

### 4. **Gestión de Parámetros**
- Interfaz unificada para todos los tipos
- Parámetros específicos por tipo de sintetizador
- Configuración inicial automática

## Estructura del Código

### Interfaces Principales

```typescript
// Parámetros de audio unificados
export interface AudioParams {
  frequency: number;
  waveform: OscillatorType;
  volume: number;
  // Parámetros específicos por tipo
  harmonicity?: number;
  modulationWaveform?: OscillatorType;
  modulationIndex?: number;
  // ... más parámetros
}

// Tipos de objetos sonoros
export type SoundObjectType = 
  | 'cube' | 'sphere' | 'cylinder' | 'cone' 
  | 'pyramid' | 'icosahedron' | 'plane' 
  | 'torus' | 'dodecahedronRing' | 'spiral';

// Estructura de fuente de sonido
export interface SoundSource {
  synth: Tone.Synth; // Cualquier tipo de sintetizador
  panner: Tone.Panner3D;
  dryGain: Tone.Gain;
  effectSends: Map<string, Tone.Gain>;
}
```

## Tipos de Sintetizadores

### 1. **AMSynth (Cubo)**
- **Tipo**: Modulación de amplitud
- **Características**: Sonidos suaves y orgánicos
- **Parámetros**: frequency, harmonicity, modulationWaveform

### 2. **FMSynth (Esfera)**
- **Tipo**: Modulación de frecuencia
- **Características**: Sonidos complejos y ricos en armónicos
- **Parámetros**: frequency, harmonicity, modulationIndex

### 3. **DuoSynth (Cilindro)**
- **Tipo**: Dos voces con vibrato
- **Características**: Sonidos gruesos y cálidos
- **Parámetros**: frequency, waveform, waveform2, vibratoAmount

### 4. **MembraneSynth (Cono)**
- **Tipo**: Simulación de membranas
- **Características**: Sonidos percusivos y resonantes
- **Parámetros**: frequency, pitchDecay, octaves, ampAttack

### 5. **MonoSynth (Pirámide)**
- **Tipo**: Monofónico con filtros
- **Características**: Sonidos melódicos y controlados
- **Parámetros**: frequency, filterAttack, filterDecay, filterQ

### 6. **MetalSynth (Icosaedro)**
- **Tipo**: Sonidos metálicos
- **Características**: Timbres brillantes y resonantes
- **Parámetros**: frequency, resonance, attack, decay

### 7. **NoiseSynth (Plano)**
- **Tipo**: Ruido procesado
- **Características**: Sonidos de textura y ambiente
- **Parámetros**: noiseType, attack, decay, sustain

### 8. **PluckSynth (Toroide)**
- **Tipo**: Simulación de cuerda
- **Características**: Sonidos de cuerda pulsada
- **Parámetros**: frequency, attackNoise, dampening, duration

### 9. **PolySynth (Anillo de Dodecaedros)**
- **Tipo**: Polifónico
- **Características**: Múltiples voces simultáneas
- **Parámetros**: frequency, polyphony, chord, release

### 10. **Sampler (Espiral)**
- **Tipo**: Reproducción de samples
- **Características**: Sonidos realistas y complejos
- **Parámetros**: urls, baseUrl, curve, notes

## Métodos Principales

### `createSoundSource(id, type, params, position, globalEffects)`

```typescript
public createSoundSource(
  id: string, 
  type: SoundObjectType, 
  params: AudioParams, 
  position: [number, number, number],
  globalEffects: Map<string, GlobalEffect>
): SoundSource {
  // 1. Crear sintetizador
  const synth = this.createSynthesizer(type, params);
  
  // 2. Crear cadena de audio
  const { panner, dryGain, effectSends } = this.createAudioChain(synth, position, globalEffects);
  
  // 3. Configurar parámetros
  this.configureInitialParameters(synth, type, params);
  
  return { synth, panner, dryGain, effectSends };
}
```

### `createSynthesizer(type, params)`

```typescript
private createSynthesizer(type: SoundObjectType, params: AudioParams): any {
  switch (type) {
    case 'cube': return this.createAMSynth(params);
    case 'sphere': return this.createFMSynth(params);
    case 'cylinder': return this.createDuoSynth(params);
    // ... más casos
  }
}
```

### `createAudioChain(synth, position, globalEffects)`

```typescript
private createAudioChain(synth: any, position: [number, number, number], globalEffects: Map<string, GlobalEffect>) {
  // Crear Panner3D
  const panner = new Tone.Panner3D();
  panner.positionX.value = position[0];
  panner.positionY.value = position[1];
  panner.positionZ.value = position[2];
  
  // Crear DryGain
  const dryGain = new Tone.Gain(0.7);
  
  // Crear EffectSends
  const effectSends = new Map<string, Tone.Gain>();
  globalEffects.forEach((effect, effectId) => {
    const send = new Tone.Gain(0);
    effectSends.set(effectId, send);
  });
  
  // Conectar cadena
  synth.connect(panner);
  panner.connect(dryGain);
  dryGain.toDestination();
  
  // Conectar sends
  effectSends.forEach((send, effectId) => {
    synth.connect(send);
    const effect = globalEffects.get(effectId);
    if (effect) {
      send.connect(effect.effectNode);
    }
  });
  
  return { panner, dryGain, effectSends };
}
```

## Arquitectura Send/Return

### Flujo de Audio
```
Synth → Panner3D → DryGain → Destination
  ↓
EffectSends → GlobalEffects → Destination
```

### Implementación
1. **Señal Seca**: Synth → Panner3D → DryGain → Destination
2. **Señal con Efectos**: Synth → EffectSend → GlobalEffect → Destination
3. **Control Independiente**: Cada send tiene su propio nivel de ganancia

## Configuración de Parámetros

### Parámetros Comunes
- `frequency`: Frecuencia base del oscilador
- `volume`: Nivel de volumen
- `waveform`: Forma de onda del oscilador

### Parámetros Específicos por Tipo
- **AMSynth**: `harmonicity`, `modulationWaveform`
- **FMSynth**: `harmonicity`, `modulationIndex`
- **DuoSynth**: `waveform2`, `vibratoAmount`, `vibratoRate`
- **MembraneSynth**: `pitchDecay`, `octaves`, `ampAttack`
- **MonoSynth**: `filterAttack`, `filterDecay`, `filterQ`
- **MetalSynth**: `resonance`, `attack`, `decay`
- **NoiseSynth**: `noiseType`, `attack`, `decay`
- **PluckSynth**: `attackNoise`, `dampening`, `duration`
- **PolySynth**: `polyphony`, `chord`, `release`
- **Sampler**: `urls`, `baseUrl`, `curve`

## Manejo de Errores

### 1. **Validación de Parámetros**
```typescript
if (!params.frequency || params.frequency <= 0) {
  throw new Error('Frecuencia inválida');
}
```

### 2. **Fallback para Sampler**
```typescript
try {
  return new Tone.Sampler(params.urls).toDestination();
} catch (error) {
  console.warn('Error cargando samples, usando oscilador de fallback');
  return new Tone.Oscillator(params.frequency, 'sine').toDestination();
}
```

### 3. **Logging Descriptivo**
```typescript
console.log(`🎵 SoundSourceFactory: Creando fuente ${id} de tipo ${type}`);
console.error(`❌ SoundSourceFactory: Error al crear fuente:`, error);
```

## Dependencias

### Librerías Externas
- `tone`: Framework de audio para sintetizadores

### Tipos Internos
- `AudioParams`: Parámetros de audio
- `SoundObjectType`: Tipos de objetos sonoros
- `SoundSource`: Estructura de fuente de sonido

## Relaciones con Otros Archivos

### Archivos que lo Usan
- `src/lib/AudioManager.ts`: Creación de fuentes de sonido
- `src/state/useWorldStore.ts`: Integración con estado global

### Archivos que Usa
- Ninguno (factory independiente)

## Consideraciones de Rendimiento

### 1. **Creación Eficiente**
- Factory pattern para reutilización
- Configuración optimizada por tipo
- Conexiones mínimas necesarias

### 2. **Gestión de Memoria**
- Disposal automático de objetos Tone.js
- Limpieza de conexiones
- Prevención de memory leaks

### 3. **Configuración Lazy**
- Parámetros se configuran solo cuando es necesario
- Conexiones se establecen bajo demanda

## Uso en la Aplicación

### Creación de Fuente
```typescript
const factory = new SoundSourceFactory();
const source = factory.createSoundSource(
  'source1',
  'cube',
  { frequency: 440, volume: 0.5 },
  [0, 0, 0],
  new Map()
);
```

### Configuración de Parámetros
```typescript
// Parámetros específicos para AMSynth
const params: AudioParams = {
  frequency: 440,
  volume: 0.7,
  harmonicity: 1.5,
  modulationWaveform: 'sine'
};
```

## Notas para Desarrollo

### 1. **Extensibilidad**
- Fácil adición de nuevos tipos de sintetizadores
- Parámetros se pueden extender sin romper compatibilidad
- Factory pattern permite escalabilidad

### 2. **Testing**
- Mockear Tone.js para pruebas unitarias
- Probar cada tipo de sintetizador
- Verificar configuración de parámetros

### 3. **Debugging**
- Logs descriptivos para cada operación
- Validación de parámetros de entrada
- Manejo de errores específicos por tipo

## Mejoras Futuras

1. **Pooling de Objetos**: Reutilizar sintetizadores
2. **Configuración Dinámica**: Cambiar tipo sin recrear
3. **Presets**: Configuraciones predefinidas
4. **Validación Avanzada**: Validación de rangos de parámetros
5. **Métricas**: Monitoreo de rendimiento por tipo

