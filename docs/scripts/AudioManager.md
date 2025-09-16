# Documentación: `src/lib/AudioManager.ts`

## Propósito
Gestor central del sistema de audio que actúa como orquestador principal, coordinando todos los subsistemas de audio (síntesis, efectos, espacialización, contexto y reproducción) mediante el patrón Singleton.

## Funcionalidades Principales

### 1. **Gestión Centralizada de Audio**
- Coordina todos los subsistemas de audio
- Mantiene un registro de todas las fuentes de sonido
- Gestiona efectos globales y espacialización

### 2. **Patrón Singleton**
- Garantiza una única instancia del AudioManager
- Acceso global desde cualquier parte de la aplicación
- Constructor privado para control de instanciación

### 3. **Arquitectura Send/Return**
- Implementa sistema de envío de audio a efectos
- Cada fuente de sonido puede enviar a múltiples efectos
- Control independiente de niveles de envío

### 4. **Integración de Subsistemas**
- **SoundSourceFactory**: Creación de sintetizadores
- **EffectManager**: Gestión de efectos globales
- **SpatialAudioManager**: Audio espacial 3D
- **AudioContextManager**: Contexto de audio
- **SoundPlaybackManager**: Reproducción de sonidos
- **ParameterManager**: Gestión de parámetros

## Estructura del Código

```typescript
export class AudioManager {
  private static instance: AudioManager;
  private soundSources: Map<string, SoundSource> = new Map();
  private lastSendAmounts: Map<string, number> = new Map();
  
  // Subsistemas especializados
  private soundSourceFactory: SoundSourceFactory;
  private effectManager: EffectManager;
  private spatialAudioManager: SpatialAudioManager;
  private audioContextManager: AudioContextManager;
  private soundPlaybackManager: SoundPlaybackManager;
  private parameterManager: ParameterManager;

  private constructor() {
    // Inicialización de subsistemas
    this.soundSourceFactory = new SoundSourceFactory();
    this.effectManager = new EffectManager();
    this.spatialAudioManager = new SpatialAudioManager();
    this.audioContextManager = new AudioContextManager();
    this.soundPlaybackManager = new SoundPlaybackManager();
    this.parameterManager = new ParameterManager();
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }
}
```

## Métodos Principales

### 1. **Gestión de Fuentes de Sonido**

#### `createSoundSource(id, type, params, position, globalEffects)`
- Crea una nueva fuente de sonido
- Configura la cadena de audio completa
- Establece conexiones con efectos globales

#### `removeSoundSource(id)`
- Elimina una fuente de sonido
- Limpia todas las conexiones
- Libera recursos de audio

#### `updateSoundParams(id, params)`
- Actualiza parámetros de una fuente
- Sincroniza con el ParameterManager
- Aplica cambios en tiempo real

### 2. **Gestión de Efectos Globales**

#### `createGlobalEffect(effectId, type, position)`
- Crea un efecto global espacializado
- Añade sends a todas las fuentes existentes
- Configura posicionamiento 3D

#### `updateGlobalEffect(effectId, params)`
- Actualiza parámetros de efecto
- Mantiene sincronización con fuentes
- Aplica cambios en tiempo real

#### `removeGlobalEffect(effectId)`
- Elimina efecto global
- Limpia sends de todas las fuentes
- Libera recursos

### 3. **Control de Reproducción**

#### `startContinuousSound(id)`
- Inicia reproducción continua
- Mantiene el sonido hasta que se detenga
- Útil para sonidos ambientales

#### `triggerNoteAttack(id, note, duration)`
- Dispara una nota específica
- Control de duración
- Ideal para sonidos percusivos

#### `triggerAttackRelease(id, note, duration)`
- Ciclo completo de ataque y liberación
- Control preciso de envolvente
- Para sonidos musicales

### 4. **Audio Espacial**

#### `updateListener(position, forward, up)`
- Actualiza posición del oyente
- Sincroniza con cámara 3D
- Afecta a todas las fuentes

#### `updateSoundPosition(id, position)`
- Actualiza posición de fuente específica
- Recalcula espacialización
- Mantiene sincronización con 3D

## Arquitectura Send/Return

### Flujo de Audio
```
Synth → Panner3D → DryGain → Destination
  ↓
EffectSends → GlobalEffects → Destination
```

### Implementación
```typescript
// Crear send de efecto
const send = new Tone.Gain(0); // Inicialmente silenciado
source.effectSends.set(effectId, send);

// Conectar cadena de audio
source.synth.connect(send);
send.connect(effectNode);
```

## Gestión de Estado

### Mapas de Estado
- `soundSources`: Fuentes de sonido activas
- `lastSendAmounts`: Niveles de envío para optimización

### Sincronización
- Estado centralizado en el AudioManager
- Sincronización con subsistemas especializados
- Actualizaciones en tiempo real

## Manejo de Errores

### 1. **Validación de Fuentes**
```typescript
const source = this.soundSources.get(sourceId);
if (!source) {
  console.warn(`⚠️ AudioManager: No se encontró fuente ${sourceId}`);
  return;
}
```

### 2. **Try-Catch en Operaciones Críticas**
```typescript
try {
  // Operación de audio
} catch (error) {
  console.error(`❌ AudioManager: Error:`, error);
}
```

### 3. **Limpieza de Recursos**
```typescript
public cleanup(): void {
  this.soundSources.forEach(source => {
    source.synth.dispose();
    source.panner.dispose();
    // ... limpiar todos los recursos
  });
}
```

## Optimizaciones de Rendimiento

### 1. **Reducción de Logs**
- `lastSendAmounts` para evitar logs repetitivos
- Logging condicional para operaciones frecuentes

### 2. **Gestión de Memoria**
- Limpieza automática de recursos
- Disposal de objetos Tone.js
- Registro de limpieza con AudioContextManager

### 3. **Batching de Operaciones**
- Agrupación de actualizaciones
- Reducción de recálculos innecesarios

## Dependencias

### Subsistemas Internos
- `SoundSourceFactory`: Creación de sintetizadores
- `EffectManager`: Gestión de efectos
- `SpatialAudioManager`: Audio espacial
- `AudioContextManager`: Contexto de audio
- `SoundPlaybackManager`: Reproducción
- `ParameterManager`: Parámetros

### Librerías Externas
- `tone`: Framework de audio
- `three`: Matemáticas 3D

## Relaciones con Otros Archivos

### Archivos que lo Usan
- `src/state/useWorldStore.ts`: Acciones de audio
- `src/components/sound-objects/*`: Objetos sonoros
- `src/hooks/useAudioListener.ts`: Sincronización de listener

### Archivos que Usa
- `src/lib/factories/SoundSourceFactory.ts`
- `src/lib/managers/EffectManager.ts`
- `src/lib/managers/SpatialAudioManager.ts`
- `src/lib/managers/AudioContextManager.ts`
- `src/lib/managers/SoundPlaybackManager.ts`
- `src/lib/managers/ParameterManager.ts`

## Consideraciones de Rendimiento

### 1. **Singleton Pattern**
- Una sola instancia para toda la aplicación
- Reducción de overhead de memoria
- Acceso rápido y consistente

### 2. **Gestión de Recursos**
- Limpieza automática de objetos Tone.js
- Prevención de memory leaks
- Gestión del ciclo de vida

### 3. **Sincronización**
- Actualizaciones eficientes de parámetros
- Reducción de recálculos
- Batching de operaciones

## Uso en la Aplicación

### Inicialización
```typescript
const audioManager = AudioManager.getInstance();
```

### Creación de Fuente
```typescript
audioManager.createSoundSource(
  'source1',
  'cube',
  { frequency: 440, volume: 0.5 },
  [0, 0, 0],
  new Map()
);
```

### Reproducción
```typescript
audioManager.triggerNoteAttack('source1', 'C4', '4n');
```

## Notas para Desarrollo

### 1. **Singleton Thread-Safe**
- Constructor privado previene instanciación múltiple
- getInstance() garantiza una sola instancia

### 2. **Gestión de Memoria**
- Siempre limpiar recursos al eliminar fuentes
- Registrar callbacks de limpieza
- Monitorear uso de memoria

### 3. **Debugging**
- Usar logs descriptivos con emojis
- Incluir IDs en todos los logs
- Verificar estado de conexiones

### 4. **Testing**
- Mockear subsistemas para pruebas unitarias
- Probar casos de error y limpieza
- Verificar sincronización entre subsistemas

## Mejoras Futuras

1. **Pooling de Objetos**: Reutilizar objetos Tone.js
2. **Lazy Loading**: Cargar efectos bajo demanda
3. **Compresión**: Optimizar datos de audio
4. **Métricas**: Monitoreo de rendimiento
5. **Configuración**: Parámetros personalizables

