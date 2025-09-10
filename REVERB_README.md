# 🎛️ Reverb - Efecto de Reverberación por Convolución

## Descripción

El **Reverb** simula la reverberación natural de un espacio acústico utilizando convolución con ruido en decaimiento. Genera una respuesta de impulso (IR) con `Tone.Offline` y la alimenta a un `ConvolverNode`. La generación de la respuesta de impulso es asíncrona, por lo que debes esperar hasta que `ready` se resuelva antes de que produzca sonido.

## Características

- **Convolución Realista**: Utiliza convolución con ruido en decaimiento para simular espacios acústicos
- **Generación Asíncrona**: La respuesta de impulso se genera de forma asíncrona para optimizar el rendimiento
- **Espacios Simulados**: Simula diferentes tipos de espacios acústicos (habitaciones, salones, catedrales, etc.)
- **Control de Tiempo**: Parámetros para controlar la duración y el pre-delay de la reverberación
- **Espacialización 3D**: Se integra con el sistema de espacialización del proyecto

## Parámetros

### `decay` (Decaimiento)
- **Tipo**: `number`
- **Rango**: 0.1 - 10 segundos
- **Valor por defecto**: `1.5`
- **Descripción**: La duración de la reverberación
- **Efecto**:
  - **Valores más bajos**: Espacios más pequeños (habitaciones, cámaras)
  - **Valores más altos**: Espacios más grandes (catedrales, salones grandes)

### `preDelay` (Pre-delay)
- **Tipo**: `number`
- **Rango**: 0 - 0.1 segundos
- **Valor por defecto**: `0.01`
- **Descripción**: La cantidad de tiempo antes de que la reverberación se active completamente
- **Efecto**:
  - **Valores más bajos**: Paredes más cercanas
  - **Valores más altos**: Paredes más lejanas

### `wet` (Mezcla)
- **Tipo**: `number`
- **Rango**: 0.0 - 1.0
- **Valor por defecto**: `0.5`
- **Descripción**: Controla la mezcla entre la señal seca y la señal procesada
- **Efecto**:
  - **0.0**: Solo señal seca (sin reverberación)
  - **1.0**: Solo señal procesada (solo reverberación)
  - **0.5**: Mezcla equilibrada

## Uso Básico

### 1. Crear un Efecto Reverb

```typescript
import { audioManager } from './lib/AudioManager';

// Crear el efecto en una posición específica del espacio 3D
audioManager.createGlobalEffect(
  'miReverb',     // ID único del efecto
  'reverb',       // Tipo de efecto
  [0, 0, 0]      // Posición en el espacio 3D [x, y, z]
);
```

### 2. Esperar a que esté listo

```typescript
// El Reverb es asíncrono, necesitas esperar a que esté listo
const reverbEffect = audioManager.getGlobalEffect('miReverb');
if (reverbEffect) {
  await reverbEffect.effectNode.ready;
  console.log('Reverb listo para usar');
}
```

### 3. Actualizar Parámetros

```typescript
// Simular una habitación pequeña
audioManager.updateGlobalEffect('miReverb', {
  decay: 0.5,
  preDelay: 0.01
});

// Simular una catedral
audioManager.updateGlobalEffect('miReverb', {
  decay: 5.0,
  preDelay: 0.05
});

// Ajustar la mezcla
audioManager.updateGlobalEffect('miReverb', {
  wet: 0.7  // 70% señal procesada, 30% señal seca
});
```

### 4. Crear una Fuente de Sonido

```typescript
// Crear una fuente de sonido que se verá afectada por el Reverb
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

// 1. Crear el efecto Reverb
audioManager.createGlobalEffect(
  'reverbEfecto',
  'reverb',
  [0, 0, 0]  // Centro del mundo
);

// 2. Esperar a que esté listo
const reverbEffect = audioManager.getGlobalEffect('reverbEfecto');
if (reverbEffect) {
  await reverbEffect.effectNode.ready;
  console.log('Reverb listo');
}

// 3. Configurar parámetros iniciales
audioManager.updateGlobalEffect('reverbEfecto', {
  decay: 2.0,      // Salón mediano
  preDelay: 0.02,  // Pre-delay moderado
  wet: 0.6         // 60% señal procesada
});

// 4. Crear y reproducir un sonido
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

El Reverb se integra completamente con el sistema de espacialización del proyecto:

- **Zona de Efecto**: El efecto se aplica a los sonidos dentro de un radio específico
- **Posicionamiento**: Puedes mover la zona de efecto en el espacio 3D
- **Intensidad Gradual**: La intensidad del efecto varía según la distancia al centro de la zona

### Configurar la Zona de Efecto

```typescript
// Cambiar el radio de la zona de efecto
audioManager.setEffectZoneRadius('miReverb', 3.0); // 3 unidades de radio

// Mover la zona de efecto
audioManager.updateEffectZonePosition('miReverb', [5, 0, 0]);
```

## Presets de Espacios

### Espacios Pequeños
```typescript
// Habitación pequeña
decay: 0.5, preDelay: 0.01

// Cámara de grabación
decay: 1.0, preDelay: 0.01

// Baño
decay: 0.8, preDelay: 0.01
```

### Espacios Medianos
```typescript
// Salón de conferencias
decay: 1.5, preDelay: 0.02

// Teatro pequeño
decay: 2.0, preDelay: 0.02

// Iglesia pequeña
decay: 2.5, preDelay: 0.03
```

### Espacios Grandes
```typescript
// Catedral
decay: 5.0, preDelay: 0.05

// Auditorio grande
decay: 3.0, preDelay: 0.03

// Salón de conciertos
decay: 4.0, preDelay: 0.04
```

### Espacios Especiales
```typescript
// Placa de reverberación
decay: 2.5, preDelay: 0.01

// Resorte
decay: 0.8, preDelay: 0.01

// Cueva
decay: 3.5, preDelay: 0.04
```

## Casos de Uso

### 1. Simulación de Espacios
- Crear ambientes acústicos realistas
- Simular diferentes tipos de salas
- Añadir profundidad espacial a los sonidos

### 2. Producción Musical
- Mezclar instrumentos con reverberación
- Crear ambientes musicales
- Añadir cohesión a las grabaciones

### 3. Efectos Especiales
- Simular espacios imposibles
- Crear efectos de eco
- Añadir atmósfera a los sonidos

### 4. Audio Espacial
- Integrar con sistemas de audio 3D
- Crear experiencias inmersivas
- Simular acústica de espacios virtuales

## Consejos de Uso

1. **Decay Apropiado**: Usa valores de decay apropiados para el tipo de espacio que quieres simular
2. **PreDelay Realista**: Ajusta el preDelay según la distancia a las paredes del espacio
3. **Wet Balanceado**: Usa valores de wet entre 0.3 y 0.7 para la mayoría de aplicaciones
4. **Generación Asíncrona**: Siempre espera a que `ready` se resuelva antes de usar el efecto

## Solución de Problemas

### El efecto no produce sonido
- Verifica que hayas esperado a que `ready` se resuelva
- Asegúrate de que el `wet` no esté en 0
- Verifica que la fuente de sonido esté dentro del radio de la zona de efecto

### El efecto suena distorsionado
- Reduce el valor de `wet`
- Verifica que los parámetros estén dentro de los rangos válidos
- Asegúrate de que el contexto de audio esté inicializado

### El efecto no responde a los cambios
- Usa `audioManager.refreshGlobalEffect()` para forzar la actualización
- Verifica que los parámetros estén dentro de los rangos válidos
- Asegúrate de que el efecto esté completamente inicializado

## Referencias

- [Documentación de Tone.js Reverb](https://tonejs.github.io/docs/15.1.22/Reverb.html)
- [Tone.js Effect](https://tonejs.github.io/docs/15.1.22/Effect.html)
- [ReverbGen - Inspiración del algoritmo](https://github.com/adelespinasse/reverbGen)
- [ConvolverNode MDN](https://developer.mozilla.org/en-US/docs/Web/API/ConvolverNode)
- [Tone.Offline MDN](https://tonejs.github.io/docs/15.1.22/OfflineContext.html)

