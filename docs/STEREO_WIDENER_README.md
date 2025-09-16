# 🎛️ StereoWidener - Efecto de Ampliación Estéreo

## Descripción

El **StereoWidener** aplica un factor de ancho a la separación mid/side. 0 es todo mid (mono) y 1 es todo side (estéreo máximo). Utiliza el algoritmo encontrado en los foros de kvraudio:

```
Mid *= 2*(1-width)
Side *= 2*width
```

## Características

- **Control de Ancho Estéreo**: Ajusta el campo estéreo de 0 (mono) a 1 (estéreo máximo)
- **Algoritmo Mid/Side**: Procesa la señal usando separación mid/side para control preciso
- **Sin Cambio en 0.5**: El valor 0.5 no modifica la señal original
- **Espacialización 3D**: Se integra con el sistema de espacialización del proyecto
- **Parámetros en Tiempo Real**: Todos los parámetros se pueden ajustar dinámicamente

## Parámetros

### `width` (Ancho)
- **Tipo**: `number`
- **Rango**: 0.0 - 1.0
- **Valor por defecto**: `0.5`
- **Descripción**: Controla el ancho del campo estéreo
- **Valores especiales**:
  - `0.0`: Mono (100% mid)
  - `0.5`: Sin cambio (señal original)
  - `1.0`: Estéreo máximo (100% side)

### `wet` (Mezcla)
- **Tipo**: `number`
- **Rango**: 0.0 - 1.0
- **Valor por defecto**: `0.5`
- **Descripción**: Controla la mezcla entre la señal seca y la señal procesada
- **Efecto**:
  - **0.0**: Solo señal seca (sin procesamiento)
  - **1.0**: Solo señal procesada (solo efecto)
  - **0.5**: Mezcla equilibrada

## Uso Básico

### 1. Crear un Efecto StereoWidener

```typescript
import { audioManager } from './lib/AudioManager';

// Crear el efecto en una posición específica del espacio 3D
audioManager.createGlobalEffect(
  'miStereoWidener',  // ID único del efecto
  'stereoWidener',    // Tipo de efecto
  [0, 0, 0]          // Posición en el espacio 3D [x, y, z]
);
```

### 2. Actualizar Parámetros

```typescript
// Convertir a mono
audioManager.updateGlobalEffect('miStereoWidener', {
  width: 0
});

// Ampliar el campo estéreo
audioManager.updateGlobalEffect('miStereoWidener', {
  width: 0.8
});

// Estéreo máximo
audioManager.updateGlobalEffect('miStereoWidener', {
  width: 1.0
});

// Ajustar la mezcla
audioManager.updateGlobalEffect('miStereoWidener', {
  wet: 0.7  // 70% señal procesada, 30% señal seca
});
```

### 3. Crear una Fuente de Sonido

```typescript
// Crear una fuente de sonido que se verá afectada por el StereoWidener
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

// 1. Crear el efecto StereoWidener
audioManager.createGlobalEffect(
  'stereoWidenerEfecto',
  'stereoWidener',
  [0, 0, 0]  // Centro del mundo
);

// 2. Configurar parámetros iniciales
audioManager.updateGlobalEffect('stereoWidenerEfecto', {
  width: 0.7,  // Campo estéreo amplio
  wet: 0.6     // 60% señal procesada
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

El StereoWidener se integra completamente con el sistema de espacialización del proyecto:

- **Zona de Efecto**: El efecto se aplica a los sonidos dentro de un radio específico
- **Posicionamiento**: Puedes mover la zona de efecto en el espacio 3D
- **Intensidad Gradual**: La intensidad del efecto varía según la distancia al centro de la zona

### Configurar la Zona de Efecto

```typescript
// Cambiar el radio de la zona de efecto
audioManager.setEffectZoneRadius('miStereoWidener', 3.0); // 3 unidades de radio

// Mover la zona de efecto
audioManager.updateEffectZonePosition('miStereoWidener', [5, 0, 0]);
```

## Presets de Ancho Estéreo

### Configuraciones Comunes
```typescript
// Mono
width: 0.0    // 100% mid, 0% side

// Estrecho
width: 0.25   // 75% mid, 25% side

// Normal
width: 0.5    // 50% mid, 50% side (sin cambio)

// Ancho
width: 0.75   // 25% mid, 75% side

// Ultra Ancho
width: 1.0    // 0% mid, 100% side
```

### Configuraciones de Wet
```typescript
// Solo señal seca
wet: 0.0      // Sin efecto

// Mezcla sutil
wet: 0.3      // 30% efecto, 70% señal seca

// Mezcla equilibrada
wet: 0.5      // 50% efecto, 50% señal seca

// Efecto prominente
wet: 0.7      // 70% efecto, 30% señal seca

// Solo efecto
wet: 1.0      // 100% efecto
```

## Casos de Uso

### 1. Producción Musical
- Añadir amplitud estéreo a instrumentos monofónicos
- Mejorar la espacialidad de grabaciones
- Crear efectos de inmersión

### 2. Post-producción
- Mejorar el campo estéreo en mezclas
- Añadir profundidad espacial
- Balancear la imagen estéreo

### 3. Audio Espacial
- Integrar con sistemas de audio 3D
- Crear experiencias inmersivas
- Simular espacios acústicos

### 4. Efectos Especiales
- Crear efectos de "chorus" estéreo
- Simular múltiples fuentes de sonido
- Añadir movimiento espacial

## Algoritmo Técnico

El StereoWidener utiliza el algoritmo mid/side:

```
Mid *= 2*(1-width)
Side *= 2*width
```

Donde:
- **Mid**: Componente central (mono)
- **Side**: Componente lateral (estéreo)
- **Width**: Factor de ancho (0-1)

### Ejemplos del Algoritmo

```typescript
// Width = 0.0 (Mono)
Mid *= 2*(1-0) = 2
Side *= 2*0 = 0

// Width = 0.5 (Sin cambio)
Mid *= 2*(1-0.5) = 1
Side *= 2*0.5 = 1

// Width = 1.0 (Estéreo máximo)
Mid *= 2*(1-1) = 0
Side *= 2*1 = 2
```

## Consejos de Uso

1. **Valores Moderados**: Usa valores entre 0.3 y 0.8 para la mayoría de aplicaciones
2. **Wet Balanceado**: Usa valores de wet entre 0.3 y 0.7 para efectos sutiles
3. **Auriculares**: El efecto se percibe mejor con auriculares
4. **Monitoreo**: Escucha en diferentes sistemas para verificar el resultado

## Solución de Problemas

### El efecto no se percibe
- Verifica que el `wet` no esté en 0
- Asegúrate de que la fuente de sonido esté dentro del radio de la zona de efecto
- Usa auriculares para mejor percepción del efecto estéreo

### El efecto suena distorsionado
- Reduce el valor de `width`
- Verifica que los parámetros estén dentro de los rangos válidos
- Ajusta el `wet` hacia valores más bajos

### El efecto no responde a los cambios
- Usa `audioManager.refreshGlobalEffect()` para forzar la actualización
- Verifica que los parámetros estén dentro de los rangos válidos
- Asegúrate de que el efecto esté completamente inicializado

## Referencias

- [Documentación de Tone.js StereoWidener](https://tonejs.github.io/docs/15.1.22/StereoWidener.html)
- [Tone.js MidSideEffect](https://tonejs.github.io/docs/15.1.22/MidSideEffect.html)
- [Algoritmo en kvraudio forums](http://www.kvraudio.com/forum/viewtopic.php?t=212587)
- [Procesamiento Mid/Side](https://en.wikipedia.org/wiki/Mid-side_stereo_processing)

