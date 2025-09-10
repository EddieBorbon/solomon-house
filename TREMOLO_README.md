# 🌊 Tremolo - Efecto de Modulación de Amplitud

## Descripción

El **Tremolo** es un efecto de modulación de amplitud que utiliza un LFO (Low Frequency Oscillator) para crear variaciones rítmicas en el volumen de la señal de audio. Es un efecto estéreo donde la fase de modulación se invierte en cada canal, creando un efecto de balanceo característico.

## 🎵 Características Técnicas

### Parámetros Principales

1. **Frequency (Frecuencia)**
   - **Rango**: 0.1 - 20 Hz
   - **Valor por defecto**: 10 Hz
   - **Descripción**: Velocidad de modulación del tremolo
   - **Uso**: Valores bajos (0.1-2 Hz) para efectos lentos y suaves, valores altos (5-20 Hz) para efectos rápidos y vibrantes

2. **Depth (Profundidad)**
   - **Rango**: 0 - 1 (0% - 100%)
   - **Valor por defecto**: 0.5 (50%)
   - **Descripción**: Intensidad de la modulación de amplitud
   - **Uso**: 0 = sin efecto, 1 = modulación completa entre 0 y 100% de amplitud

3. **Spread (Separación)**
   - **Rango**: 0° - 180°
   - **Valor por defecto**: 180°
   - **Descripción**: Separación estéreo entre canales LFO
   - **Uso**: 0° = LFOs centrados, 180° = LFOs en canales opuestos

4. **Type (Tipo de Onda)**
   - **Opciones**: sine, square, triangle, sawtooth
   - **Valor por defecto**: sine
   - **Descripción**: Forma de onda del LFO
   - **Uso**: 
     - `sine`: Modulación suave y natural
     - `square`: Modulación abrupta tipo on/off
     - `triangle`: Modulación lineal
     - `sawtooth`: Modulación asimétrica

5. **Wet (Mezcla)**
   - **Rango**: 0 - 1 (0% - 100%)
   - **Valor por defecto**: 0.5 (50%)
   - **Descripción**: Mezcla entre señal seca y procesada
   - **Uso**: Controla la intensidad del efecto en la señal final

## 🎛️ Implementación Técnica

### Creación del Efecto
```typescript
const tremolo = new Tone.Tremolo({
  frequency: 10,        // Hz
  depth: 0.5,          // 0-1
  type: 'sine',        // Tipo de onda
  spread: 180          // Grados
});
```

### Conexión en la Cadena de Audio
```typescript
// Conectar efecto -> panner -> destination
tremolo.chain(effectPanner, Tone.Destination);
```

### Actualización de Parámetros
```typescript
// Actualizar frecuencia
tremolo.frequency.rampTo(5, 0.1);

// Actualizar profundidad
tremolo.depth.rampTo(0.8, 0.1);

// Cambiar tipo de onda
tremolo.type = 'square';

// Ajustar separación estéreo
tremolo.spread = 90;
```

## 🎨 Uso Creativo

### Efectos Musicales

1. **Tremolo Clásico**
   - **Frecuencia**: 4-8 Hz
   - **Profundidad**: 0.3-0.6
   - **Tipo**: sine
   - **Uso**: Guitarra eléctrica, órgano

2. **Vibrato Rápido**
   - **Frecuencia**: 8-15 Hz
   - **Profundidad**: 0.2-0.4
   - **Tipo**: sine
   - **Uso**: Efectos de tensión, suspense

3. **Pulsación Rítmica**
   - **Frecuencia**: 1-4 Hz
   - **Profundidad**: 0.6-0.8
   - **Tipo**: square
   - **Uso**: Efectos de bombeo, ritmo

4. **Modulación Estéreo**
   - **Frecuencia**: 2-6 Hz
   - **Profundidad**: 0.4-0.7
   - **Spread**: 90-180°
   - **Uso**: Efectos espaciales, movimiento

### Aplicaciones por Género

- **Rock/Blues**: Tremolo clásico en guitarra
- **Electronic**: Modulación rítmica en sintetizadores
- **Ambient**: Efectos de movimiento lento
- **Jazz**: Vibrato sutil en instrumentos
- **Pop**: Efectos de bombeo en voces

## 🔧 Configuración en el Sistema

### Parámetros por Defecto
```typescript
{
  tremoloFrequency: 10,    // Hz
  tremoloDepth: 0.5,       // 50%
  wet: 0.5,                // 50%
  tremoloSpread: 180,      // 180°
  tremoloType: 'sine'      // Onda senoidal
}
```

### Mapeo de Parámetros
- `tremoloFrequency` → `frequency`
- `tremoloDepth` → `depth`
- `tremoloSpread` → `spread`
- `tremoloType` → `type`
- `wet` → `wet`

## 🎯 Casos de Uso

### 1. Efecto de Guitarra Clásica
```typescript
// Configuración para tremolo de guitarra
tremolo.frequency.rampTo(6, 0.1);
tremolo.depth.rampTo(0.4, 0.1);
tremolo.type = 'sine';
tremolo.spread = 180;
```

### 2. Efecto de Bombeo Rítmico
```typescript
// Configuración para bombeo
tremolo.frequency.rampTo(2, 0.1);
tremolo.depth.rampTo(0.7, 0.1);
tremolo.type = 'square';
tremolo.spread = 0;
```

### 3. Modulación Estéreo
```typescript
// Configuración para movimiento estéreo
tremolo.frequency.rampTo(4, 0.1);
tremolo.depth.rampTo(0.5, 0.1);
tremolo.type = 'triangle';
tremolo.spread = 90;
```

## 🎵 Ejemplos de Uso

### Ejemplo Básico
```typescript
// Crear tremolo
const tremolo = new Tone.Tremolo(8, 0.5).toDestination().start();

// Conectar oscilador
const osc = new Tone.Oscillator(440, 'sine').connect(tremolo).start();
```

### Ejemplo con Control de Parámetros
```typescript
// Crear tremolo con parámetros personalizados
const tremolo = new Tone.Tremolo({
  frequency: 6,
  depth: 0.6,
  type: 'sine',
  spread: 180
}).toDestination().start();

// Controlar parámetros en tiempo real
tremolo.frequency.rampTo(12, 2); // Acelerar gradualmente
tremolo.depth.rampTo(0.8, 1);    // Aumentar profundidad
```

### Ejemplo con Sincronización
```typescript
// Sincronizar con el transport
tremolo.sync();
tremolo.frequency.value = '1/4'; // Sincronizar con negras
```

## 🎨 Presets Recomendados

### 1. Tremolo Clásico
- **Frecuencia**: 6 Hz
- **Profundidad**: 0.4
- **Tipo**: sine
- **Spread**: 180°
- **Wet**: 0.6

### 2. Vibrato Sutil
- **Frecuencia**: 8 Hz
- **Profundidad**: 0.2
- **Tipo**: sine
- **Spread**: 180°
- **Wet**: 0.3

### 3. Bombeo Rítmico
- **Frecuencia**: 2 Hz
- **Profundidad**: 0.7
- **Tipo**: square
- **Spread**: 0°
- **Wet**: 0.8

### 4. Modulación Estéreo
- **Frecuencia**: 4 Hz
- **Profundidad**: 0.5
- **Tipo**: triangle
- **Spread**: 90°
- **Wet**: 0.5

## 🔍 Troubleshooting

### Problemas Comunes

1. **Efecto muy sutil**
   - Aumentar `depth` a 0.6-0.8
   - Verificar que `wet` esté en 0.5-1.0

2. **Efecto muy agresivo**
   - Reducir `depth` a 0.2-0.4
   - Reducir `wet` a 0.3-0.5

3. **Frecuencia muy lenta/rápida**
   - Ajustar `frequency` entre 2-8 Hz para efectos musicales
   - Usar valores más altos (10-20 Hz) para efectos especiales

4. **Falta de separación estéreo**
   - Aumentar `spread` a 90-180°
   - Verificar que el audio de entrada sea estéreo

## 📚 Referencias

- [Tone.js Tremolo Documentation](https://tonejs.github.io/docs/Tremolo)
- [Tremolo Effect Wikipedia](https://en.wikipedia.org/wiki/Tremolo)
- [LFO (Low Frequency Oscillator) Concepts](https://en.wikipedia.org/wiki/Low-frequency_oscillation)

## 🎵 Notas Musicales

El tremolo es uno de los efectos más antiguos y versátiles en la música. Desde su uso clásico en la guitarra eléctrica hasta aplicaciones modernas en música electrónica, el tremolo puede crear desde efectos sutiles de vibrato hasta modulaciones rítmicas intensas que definen el carácter de una pieza musical.

---

**Desarrollado para Solomon House - Sistema de Audio Espacial 3D** 🎵✨

