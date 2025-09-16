# 🎛️ PitchShift - Efecto de Cambio de Tono en Tiempo Real

## Descripción

El **PitchShift** realiza cambios de tono en tiempo real a la señal entrante. El efecto se logra acelerando o desacelerando el `delayTime` de un `DelayNode` usando una onda diente de sierra. Este algoritmo está basado en técnicas de procesamiento de señal digital y es especialmente útil para crear armonías, efectos vocales, y transformaciones musicales.

## Características

- **Cambio de Tono en Tiempo Real**: Transpone la señal hasta 2 octavas arriba o abajo
- **Algoritmo Avanzado**: Utiliza dos DelayNodes con LFOs para cubrir los saltos en la onda diente de sierra
- **Control de Suavidad**: Parámetro `windowSize` para controlar la calidad del pitch shifting
- **Espacialización 3D**: Se integra con el sistema de espacialización del proyecto
- **Parámetros en Tiempo Real**: Todos los parámetros se pueden ajustar dinámicamente

## Parámetros

### `pitch` (Pitch)
- **Tipo**: `number`
- **Rango**: -24 a +24 semi-tonos
- **Valor por defecto**: `0`
- **Descripción**: El intervalo de transposición en semi-tonos
- **Valores especiales**:
  - `-12`: Una octava abajo
  - `+12`: Una octava arriba
  - `-7`: Quinta abajo
  - `+7`: Quinta arriba
  - `-3`: Tercera menor abajo
  - `+3`: Tercera menor arriba

### `windowSize` (Tamaño de Ventana)
- **Tipo**: `number`
- **Rango**: 0.03 - 0.1 segundos
- **Valor por defecto**: `0.1`
- **Descripción**: El tamaño de ventana corresponde aproximadamente a la longitud de muestra en un sampler en bucle
- **Efecto**:
  - **Valores más pequeños**: Menos delay notable, pero menos suave para intervalos grandes
  - **Valores más grandes**: Más suave para intervalos grandes, pero más delay notable

### `delayTime` (Tiempo de Delay)
- **Tipo**: `number`
- **Rango**: 0 - 1 segundos
- **Valor por defecto**: `0`
- **Descripción**: La cantidad de delay en la señal de entrada

### `feedback` (Retroalimentación)
- **Tipo**: `number`
- **Rango**: 0.0 - 0.9
- **Valor por defecto**: `0`
- **Descripción**: La cantidad de señal que se retroalimenta desde la salida hacia la entrada

### `wet` (Mezcla)
- **Tipo**: `number`
- **Rango**: 0.0 - 1.0
- **Valor por defecto**: `0.5`
- **Descripción**: Controla la mezcla entre la señal seca y la señal procesada

## Uso Básico

### 1. Crear un Efecto PitchShift

```typescript
import { audioManager } from './lib/AudioManager';

// Crear el efecto en una posición específica del espacio 3D
audioManager.createGlobalEffect(
  'miPitchShift',  // ID único del efecto
  'pitchShift',    // Tipo de efecto
  [0, 0, 0]       // Posición en el espacio 3D [x, y, z]
);
```

### 2. Actualizar Parámetros

```typescript
// Transponer una octava arriba
audioManager.updateGlobalEffect('miPitchShift', {
  pitchShift: 12
});

// Transponer una quinta abajo
audioManager.updateGlobalEffect('miPitchShift', {
  pitchShift: -7
});

// Ajustar la suavidad del efecto
audioManager.updateGlobalEffect('miPitchShift', {
  windowSize: 0.05  // Más suave para intervalos grandes
});

// Añadir retroalimentación para efectos especiales
audioManager.updateGlobalEffect('miPitchShift', {
  feedback: 0.3
});
```

### 3. Crear una Fuente de Sonido

```typescript
// Crear una fuente de sonido que se verá afectada por el PitchShift
audioManager.createSoundSource(
  'miSonido',         // ID único del sonido
  'sphere',           // Tipo de objeto sonoro
  {
    frequency: 440,   // Frecuencia en Hz
    volume: 0.3,      // Volumen (0.0 - 1.0)
    attack: 0.1,      // Tiempo de ataque
    decay: 0.2,       // Tiempo de decaimiento
    sustain: 0.5,     // Nivel de sostenimiento
    release: 0.8      // Tiempo de liberación
  },
  [2, 0, 0]          // Posición en el espacio 3D
);

// Iniciar el sonido
audioManager.startContinuousSound('miSonido', {
  frequency: 440,
  volume: 0.3,
  attack: 0.1,
  decay: 0.2,
  sustain: 0.5,
  release: 0.8
});
```

## Ejemplo Completo

```typescript
import { audioManager } from './lib/AudioManager';

// 1. Crear el efecto PitchShift
audioManager.createGlobalEffect(
  'pitchShiftEfecto',
  'pitchShift',
  [0, 0, 0]  // Centro del mundo
);

// 2. Configurar parámetros iniciales
audioManager.updateGlobalEffect('pitchShiftEfecto', {
  pitchShift: 7,      // Quinta arriba
  windowSize: 0.08,   // Suavidad media
  delayTime: 0.1,     // Pequeño delay
  feedback: 0.2       // Retroalimentación ligera
});

// 3. Crear y reproducir un sonido
audioManager.createSoundSource(
  'testSound',
  'sphere',
  {
    frequency: 440,
    volume: 0.4,
    attack: 0.1,
    decay: 0.2,
    sustain: 0.6,
    release: 1.0
  },
  [1, 0, 0]  // Cerca del efecto
);

audioManager.startContinuousSound('testSound', {
  frequency: 440,
  volume: 0.4,
  attack: 0.1,
  decay: 0.2,
  sustain: 0.6,
  release: 1.0
});
```

## Espacialización 3D

El PitchShift se integra completamente con el sistema de espacialización del proyecto:

- **Zona de Efecto**: El efecto se aplica a los sonidos dentro de un radio específico
- **Posicionamiento**: Puedes mover la zona de efecto en el espacio 3D
- **Intensidad Gradual**: La intensidad del efecto varía según la distancia al centro de la zona

### Configurar la Zona de Efecto

```typescript
// Cambiar el radio de la zona de efecto
audioManager.setEffectZoneRadius('miPitchShift', 3.0); // 3 unidades de radio

// Mover la zona de efecto
audioManager.updateEffectZonePosition('miPitchShift', [5, 0, 0]);
```

## Casos de Uso

### 1. Armonización Automática
- Crear armonías automáticas con intervalos musicales específicos
- Generar acordes a partir de una sola nota

### 2. Efectos Vocales
- Cambiar el tono de voces para efectos especiales
- Crear coros artificiales

### 3. Transformaciones Musicales
- Transponer melodías a diferentes tonalidades
- Crear variaciones de temas musicales

### 4. Efectos Especiales
- Simular instrumentos en diferentes registros
- Crear efectos de "chipmunk" o "demonio"

## Presets Útiles

### Intervalos Musicales Comunes
```typescript
// Octavas
pitchShift: 12   // +1 octava
pitchShift: -12  // -1 octava
pitchShift: 24   // +2 octavas
pitchShift: -24  // -2 octavas

// Quintas
pitchShift: 7    // +5ta (quinta arriba)
pitchShift: -7   // -5ta (quinta abajo)

// Terceras
pitchShift: 4    // +3ra mayor
pitchShift: 3    // +3ra menor
pitchShift: -4   // -3ra mayor
pitchShift: -3   // -3ra menor

// Segundas
pitchShift: 2    // +2da mayor
pitchShift: 1    // +2da menor
pitchShift: -2   // -2da mayor
pitchShift: -1   // -2da menor
```

### Configuraciones de WindowSize
```typescript
// Para intervalos pequeños (1-3 semitonos)
windowSize: 0.03  // Mínimo delay, menos suave

// Para intervalos medianos (4-7 semitonos)
windowSize: 0.05  // Balance entre delay y suavidad

// Para intervalos grandes (8+ semitonos)
windowSize: 0.08  // Más suave, más delay

// Para máxima suavidad
windowSize: 0.1   // Máximo delay, máxima suavidad
```

## Consejos de Uso

1. **Intervalos Pequeños**: Usa `windowSize` más pequeño para intervalos de 1-3 semitonos
2. **Intervalos Grandes**: Usa `windowSize` más grande para intervalos de 8+ semitonos
3. **Feedback Moderado**: Usa valores de feedback entre 0.1 y 0.3 para efectos sutiles
4. **Delay Time**: Ajusta según el contexto musical (0 para tiempo real, valores más altos para efectos)

## Solución de Problemas

### El efecto suena distorsionado
- Reduce el valor de `feedback`
- Ajusta el `windowSize` para el intervalo específico
- Verifica que el `delayTime` no sea demasiado alto

### El efecto no responde a los cambios
- Usa `audioManager.refreshGlobalEffect()` para forzar la actualización
- Verifica que los parámetros estén dentro de los rangos válidos

### El efecto tiene demasiado delay
- Reduce el `windowSize`
- Ajusta el `delayTime` hacia valores más bajos

## Referencias

- [Documentación de Tone.js PitchShift](https://tonejs.github.io/docs/15.1.22/PitchShift.html)
- [Tone.js FeedbackEffect](https://tonejs.github.io/docs/15.1.22/FeedbackEffect.html)
- [Algoritmo de Pitch Shifting](http://dsp-book.narod.ru/soundproc.pdf)
- [Referencia de Miller Puckette](http://msp.ucsd.edu/techniques/v0.11/book-html/node115.html)

