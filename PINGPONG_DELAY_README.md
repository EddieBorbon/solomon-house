# 🎛️ PingPongDelay - Efecto de Delay Estéreo

## Descripción

El **PingPongDelay** es un efecto de delay estéreo donde el eco se escucha primero en un canal y luego en el canal opuesto. En un sistema estéreo, estos son los canales derecho e izquierdo. El PingPongDelay es, en términos más simples, dos `Tone.FeedbackDelay` con valores de delay independientes. Cada delay se enruta a un canal (izquierdo o derecho), y el canal que se activa segundo siempre se activará en el mismo intervalo después del primero.

## Características

- **Delay Estéreo**: Crea un efecto de "ping-pong" entre los altavoces izquierdo y derecho
- **Feedback Controlable**: Controla la cantidad de señal que se retroalimenta
- **Tiempo de Delay Configurable**: Soporta notación musical y valores en segundos
- **Espacialización 3D**: Se integra con el sistema de espacialización del proyecto
- **Parámetros en Tiempo Real**: Todos los parámetros se pueden ajustar dinámicamente

## Parámetros

### `delayTime` (Tiempo de Delay)
- **Tipo**: `Unit.Time`
- **Valor por defecto**: `'4n'` (cuarto de nota)
- **Descripción**: El tiempo de delay entre ecos consecutivos
- **Valores soportados**: Notación musical (`'1n'`, `'2n'`, `'4n'`, `'8n'`, `'16n'`, `'32n'`) o valores en segundos

### `feedback` (Retroalimentación)
- **Tipo**: `number`
- **Rango**: 0.0 - 0.9
- **Valor por defecto**: `0.2`
- **Descripción**: La cantidad de señal procesada que se retroalimenta a través del delay

### `maxDelay` (Delay Máximo)
- **Tipo**: `number`
- **Valor por defecto**: `1.0`
- **Descripción**: El tiempo máximo de delay en segundos

### `wet` (Mezcla)
- **Tipo**: `number`
- **Rango**: 0.0 - 1.0
- **Valor por defecto**: `0.5`
- **Descripción**: Controla la mezcla entre la señal seca y la señal procesada

## Uso Básico

### 1. Crear un Efecto PingPongDelay

```typescript
import { audioManager } from './lib/AudioManager';

// Crear el efecto en una posición específica del espacio 3D
audioManager.createGlobalEffect(
  'miPingPongDelay',  // ID único del efecto
  'pingPongDelay',    // Tipo de efecto
  [0, 0, 0]          // Posición en el espacio 3D [x, y, z]
);
```

### 2. Actualizar Parámetros

```typescript
// Actualizar parámetros individuales
audioManager.updateGlobalEffect('miPingPongDelay', {
  delayTime: '8n',     // Cambiar a octavo de nota
  feedback: 0.3,       // Aumentar la retroalimentación
  wet: 0.7            // Más señal procesada
});

// Actualizar múltiples parámetros
audioManager.updateGlobalEffect('miPingPongDelay', {
  delayTime: '16n',
  feedback: 0.4,
  maxDelay: 1.5,
  wet: 0.6
});
```

### 3. Crear una Fuente de Sonido

```typescript
// Crear una fuente de sonido que se verá afectada por el PingPongDelay
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

// 1. Crear el efecto PingPongDelay
audioManager.createGlobalEffect(
  'pingPongEfecto',
  'pingPongDelay',
  [0, 0, 0]  // Centro del mundo
);

// 2. Configurar parámetros iniciales
audioManager.updateGlobalEffect('pingPongEfecto', {
  delayTime: '4n',    // Cuarto de nota
  feedback: 0.25,     // 25% de retroalimentación
  maxDelay: 1.0,      // 1 segundo máximo
  wet: 0.6           // 60% señal procesada
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

El PingPongDelay se integra completamente con el sistema de espacialización del proyecto:

- **Zona de Efecto**: El efecto se aplica a los sonidos dentro de un radio específico
- **Posicionamiento**: Puedes mover la zona de efecto en el espacio 3D
- **Intensidad Gradual**: La intensidad del efecto varía según la distancia al centro de la zona

### Configurar la Zona de Efecto

```typescript
// Cambiar el radio de la zona de efecto
audioManager.setEffectZoneRadius('miPingPongDelay', 3.0); // 3 unidades de radio

// Mover la zona de efecto
audioManager.updateEffectZonePosition('miPingPongDelay', [5, 0, 0]);
```

## Casos de Uso

### 1. Efectos Atmosféricos
- Crear ambientes espaciales con ecos que se mueven entre canales
- Simular espacios grandes con delays estéreo

### 2. Música Ambiental
- Añadir profundidad y movimiento a sonidos ambientales
- Crear texturas sonoras complejas

### 3. Efectos Especiales
- Simular sonidos que rebotan en espacios 3D
- Crear efectos de "ping-pong" para elementos interactivos

## Consejos de Uso

1. **Feedback Moderado**: Usa valores de feedback entre 0.1 y 0.4 para evitar la distorsión
2. **Tiempo de Delay**: Experimenta con diferentes valores de delayTime para encontrar el ritmo adecuado
3. **Mezcla Balanceada**: Ajusta el parámetro `wet` para equilibrar la señal seca y procesada
4. **Posicionamiento**: Coloca la zona de efecto estratégicamente para controlar cuándo se aplica el efecto

## Solución de Problemas

### El efecto no se escucha
- Verifica que el sonido esté dentro del radio de la zona de efecto
- Asegúrate de que el parámetro `wet` sea mayor que 0
- Comprueba que el contexto de audio esté iniciado

### El efecto es demasiado intenso
- Reduce el valor de `feedback`
- Ajusta el parámetro `wet` hacia valores más bajos
- Verifica que el `maxDelay` no sea demasiado alto

### El efecto no responde a los cambios
- Usa `audioManager.refreshGlobalEffect()` para forzar la actualización
- Verifica que los parámetros estén dentro de los rangos válidos

## Referencias

- [Documentación de Tone.js PingPongDelay](https://tonejs.github.io/docs/15.1.22/PingPongDelay.html)
- [Tone.js StereoXFeedbackEffect](https://tonejs.github.io/docs/15.1.22/StereoXFeedbackEffect.html)
- [Tone.js FeedbackDelay](https://tonejs.github.io/docs/15.1.22/FeedbackDelay.html)
