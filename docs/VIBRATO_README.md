# 🎵 Vibrato Effect - Documentación

## Descripción General

El efecto **Vibrato** es un efecto de modulación de pitch que crea una variación sutil en la frecuencia de la señal de audio. Está compuesto por un `Tone.Delay` y un `Tone.LFO` (Low Frequency Oscillator) que modula el tiempo de delay, causando que el pitch suba y baje de manera cíclica.

## Características Técnicas

### Parámetros Principales

| Parámetro | Tipo | Rango | Valor por Defecto | Descripción |
|-----------|------|-------|-------------------|-------------|
| `frequency` | `Frequency` | 0.1 - 20 Hz | 5 Hz | Velocidad de modulación del vibrato |
| `depth` | `NormalRange` | 0 - 1 | 0.1 | Intensidad de la modulación de pitch |
| `type` | `ToneOscillatorType` | sine, square, triangle, sawtooth | 'sine' | Forma de onda del LFO |
| `maxDelay` | `Seconds` | 0.001 - 0.02 s | 0.005 s | Tiempo máximo de delay |
| `wet` | `NormalRange` | 0 - 1 | 0.5 | Mezcla entre señal seca y procesada |

### Arquitectura del Efecto

```
Input → Delay (modulado por LFO) → Output
         ↑
       LFO (frecuencia variable)
```

## Implementación en el Sistema

### 1. EffectManager

El efecto Vibrato se integra completamente en el sistema de gestión de efectos:

```typescript
// Creación del efecto
private createVibrato(): Tone.Vibrato {
  const effectNode = new Tone.Vibrato({
    frequency: 5,
    depth: 0.1,
    type: 'sine',
    maxDelay: 0.005
  });
  return effectNode;
}

// Actualización de parámetros
private updateVibratoParams(effectNode: Tone.Vibrato, params: any): void {
  // Mapeo de parámetros del store a parámetros del efecto
  if (paramName === 'vibratoFrequency') {
    this.safeUpdateParam(effectNode, 'frequency', params[paramName]);
  } else if (paramName === 'vibratoDepth') {
    this.safeUpdateParam(effectNode, 'depth', params[paramName]);
  }
  // ... más parámetros
}
```

### 2. Estado Global (useWorldStore)

Los parámetros del Vibrato se almacenan en el estado global:

```typescript
// Parámetros en effectParams
vibratoFrequency?: number;    // 5 Hz por defecto
vibratoDepth?: number;        // 0.1 por defecto
vibratoType?: 'sine' | 'square' | 'triangle' | 'sawtooth';
vibratoMaxDelay?: number;     // 0.005 por defecto
```

### 3. Interfaz de Usuario

#### ControlPanel
- Botón para crear zonas de efecto Vibrato
- Posicionamiento aleatorio en el mundo 3D

#### ParameterEditor
- **Frecuencia**: Slider de 0.1 a 20 Hz
- **Profundidad**: Slider de 0 a 100%
- **Tipo de Onda**: Botones para seleccionar forma de onda
- **Max Delay**: Slider de 1 a 20 ms
- **Wet**: Slider de mezcla 0-100%

#### EffectZone
- Color naranja (`#f97316`) para identificación visual
- Formas esféricas y cúbicas disponibles

## Uso del Efecto

### Creación de Zona de Efecto

```typescript
// Desde el ControlPanel
const handleAddVibratoZone = () => {
  const x = (Math.random() - 0.5) * 10;
  const z = (Math.random() - 0.5) * 10;
  addEffectZone('vibrato', [x, 1, z], 'sphere');
};
```

### Configuración de Parámetros

```typescript
// Actualización de parámetros en tiempo real
const handleEffectParamChange = (paramName: string, value: number) => {
  updateEffectZone(selectedZoneId, {
    effectParams: {
      ...currentParams,
      [paramName]: value
    }
  });
};
```

## Casos de Uso

### 1. Efecto Sutil
- **Frecuencia**: 2-5 Hz
- **Profundidad**: 0.05-0.15
- **Tipo**: sine
- **Uso**: Agregar calidez y expresión a instrumentos

### 2. Efecto Dramático
- **Frecuencia**: 8-15 Hz
- **Profundidad**: 0.3-0.7
- **Tipo**: square o sawtooth
- **Uso**: Efectos especiales y texturas experimentales

### 3. Efecto Clásico
- **Frecuencia**: 4-7 Hz
- **Profundidad**: 0.1-0.25
- **Tipo**: sine
- **Uso**: Simular vibrato de instrumentos de cuerda

## Integración con Audio 3D

### Espacialización
- El efecto se aplica antes de la espacialización 3D
- Cada zona de efecto tiene su propio `Panner3D`
- El efecto se escucha según la posición del usuario en el espacio 3D

### Radio de Efecto
- Radio por defecto: 2.0 unidades
- El efecto se aplica gradualmente según la distancia
- Intensidad máxima en el centro de la zona

## Optimizaciones

### Rendimiento
- El LFO se inicia automáticamente al crear el efecto
- Los parámetros se actualizan de forma segura con `safeUpdateParam`
- El efecto se refresca automáticamente al cambiar parámetros

### Calidad de Audio
- Frecuencias de muestreo optimizadas para el efecto
- Rango de delay ajustado para evitar artefactos
- Mezcla wet/dry para control preciso

## Ejemplos de Código

### Creación Básica
```typescript
import { audioManager } from './lib/AudioManager';

// Crear una zona de efecto Vibrato
audioManager.createGlobalEffect('vibrato-1', 'vibrato', [0, 1, 0]);

// Actualizar parámetros
audioManager.updateGlobalEffect('vibrato-1', {
  vibratoFrequency: 6,
  vibratoDepth: 0.2,
  vibratoType: 'sine'
});
```

### Uso con Objetos de Sonido
```typescript
// Conectar un objeto de sonido a una zona de efecto
const soundObject = audioManager.createSoundObject('oscillator', [0, 0, 0]);
const effectZone = audioManager.createGlobalEffect('vibrato-zone', 'vibrato', [1, 1, 1]);

// El efecto se aplicará automáticamente cuando el objeto esté dentro del radio
```

## Troubleshooting

### Problemas Comunes

1. **Efecto no se escucha**
   - Verificar que la zona esté dentro del radio del objeto
   - Comprobar que el parámetro `wet` no esté en 0

2. **Modulación muy sutil**
   - Aumentar el parámetro `depth`
   - Verificar que la frecuencia esté en un rango audible (2-10 Hz)

3. **Artefactos de audio**
   - Reducir el `maxDelay`
   - Ajustar la frecuencia del LFO

### Debugging

```typescript
// Verificar parámetros actuales
console.log('Parámetros del Vibrato:', {
  frequency: effectNode.frequency.value,
  depth: effectNode.depth.value,
  type: effectNode.type,
  wet: effectNode.wet.value
});
```

## Referencias

- [Tone.js Vibrato Documentation](https://tonejs.github.io/docs/Vibrato)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [LFO (Low Frequency Oscillator) Concepts](https://en.wikipedia.org/wiki/Low-frequency_oscillation)

---

**Nota**: Este efecto es ideal para agregar expresión y movimiento a sonidos estáticos, especialmente útil en instrumentos virtuales y síntesis de audio.

