# Documentación: `src/lib/managers/SpatialAudioManager.ts`

## Propósito
Gestor especializado para la configuración y manejo de audio espacial 3D, implementando el patrón Manager para la gestión centralizada de espacialización, listener global y cálculos de distancia.

## Funcionalidades Principales

### 1. **Gestión del Listener Global**
- Configuración de posición y orientación del oyente
- Sincronización con la cámara 3D
- Actualización en tiempo real

### 2. **Configuración Espacial**
- Modelos de panning (HRTF, equalpower)
- Modelos de distancia (linear, inverse, exponential)
- Parámetros de atenuación y rolloff

### 3. **Cálculos de Distancia**
- Cálculo de distancia euclidiana 3D
- Atenuación basada en distancia
- Intensidad de efectos por proximidad

### 4. **Creación de Panners 3D**
- Panners configurados con parámetros espaciales
- Integración con sistema de efectos
- Optimización de rendimiento

## Estructura del Código

### Interfaces Principales

```typescript
// Configuración de audio espacial
export interface SpatialAudioConfig {
  panningModel: 'HRTF' | 'equalpower';
  distanceModel: 'linear' | 'inverse' | 'exponential';
  refDistance: number;
  maxDistance: number;
  rolloffFactor: number;
  coneInnerAngle: number;
  coneOuterAngle: number;
  coneOuterGain: number;
}

// Estado del listener
export interface ListenerState {
  position: THREE.Vector3;
  forward: THREE.Vector3;
  up: THREE.Vector3;
}
```

### Clase Principal

```typescript
export class SpatialAudioManager {
  private listenerState: ListenerState;
  private lastListenerPosition: string;
  private spatialConfig: SpatialAudioConfig;
}
```

## Configuración Espacial

### Configuración por Defecto
```typescript
this.spatialConfig = {
  panningModel: 'HRTF',        // Audición binaural
  distanceModel: 'inverse',    // Modelo de distancia inversa
  refDistance: 1,              // Distancia de referencia (1 unidad)
  maxDistance: 100,            // Distancia máxima (100 unidades)
  rolloffFactor: 2,            // Factor de atenuación
  coneInnerAngle: 360,         // Ángulo interno del cono
  coneOuterAngle: 360,         // Ángulo externo del cono
  coneOuterGain: 0,            // Ganancia externa del cono
};
```

### Modelos de Panning

#### **HRTF (Head-Related Transfer Function)**
- **Características**: Audición binaural realista
- **Uso**: Mejor para auriculares
- **Rendimiento**: Más intensivo computacionalmente

#### **Equal Power**
- **Características**: Panning estéreo simple
- **Uso**: Mejor para altavoces
- **Rendimiento**: Más eficiente

### Modelos de Distancia

#### **Linear**
- **Fórmula**: `1 - (distance / maxDistance)`
- **Características**: Atenuación lineal
- **Uso**: Simulaciones simples

#### **Inverse**
- **Fórmula**: `refDistance / (refDistance + rolloffFactor * (distance - refDistance))`
- **Características**: Atenuación realista
- **Uso**: Simulaciones acústicas realistas

#### **Exponential**
- **Fórmula**: `refDistance / distance^rolloffFactor`
- **Características**: Atenuación exponencial
- **Uso**: Simulaciones de campo lejano

## Métodos Principales

### `updateListener(position, forward)`

```typescript
public updateListener(position: THREE.Vector3, forward: THREE.Vector3): void {
  // Actualizar posición del oyente
  Tone.Listener.positionX.value = position.x;
  Tone.Listener.positionY.value = position.y;
  Tone.Listener.positionZ.value = position.z;
  
  // Actualizar orientación del oyente
  Tone.Listener.forwardX.value = forward.x;
  Tone.Listener.forwardY.value = forward.y;
  Tone.Listener.forwardZ.value = forward.z;
  
  // Configurar vector "arriba"
  Tone.Listener.upX.value = 0;
  Tone.Listener.upY.value = 1;
  Tone.Listener.upZ.value = 0;
  
  // Actualizar estado interno
  this.listenerState.position.copy(position);
  this.listenerState.forward.copy(forward);
}
```

### `createPanner3D(position)`

```typescript
public createPanner3D(position: [number, number, number]): Tone.Panner3D {
  return new Tone.Panner3D({
    positionX: position[0],
    positionY: position[1],
    positionZ: position[2],
    panningModel: this.spatialConfig.panningModel,
    distanceModel: this.spatialConfig.distanceModel,
    refDistance: this.spatialConfig.refDistance,
    maxDistance: this.spatialConfig.maxDistance,
    rolloffFactor: this.spatialConfig.rolloffFactor,
    coneInnerAngle: this.spatialConfig.coneInnerAngle,
    coneOuterAngle: this.spatialConfig.coneOuterAngle,
    coneOuterGain: this.spatialConfig.coneOuterGain,
  });
}
```

### `calculateDistance(pos1, pos2)`

```typescript
public calculateDistance(pos1: [number, number, number], pos2: [number, number, number]): number {
  const dx = pos1[0] - pos2[0];
  const dy = pos1[1] - pos2[1];
  const dz = pos1[2] - pos2[2];
  
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
```

### `calculateDistanceAttenuation(distance)`

```typescript
public calculateDistanceAttenuation(distance: number): number {
  const { refDistance, maxDistance, rolloffFactor } = this.spatialConfig;
  
  if (distance >= maxDistance) {
    return 0;
  }
  
  if (distance <= refDistance) {
    return 1;
  }
  
  // Fórmula de atenuación inversa
  return refDistance / (refDistance + rolloffFactor * (distance - refDistance));
}
```

### `calculateEffectIntensity(effectPos, sourcePos, radius)`

```typescript
public calculateEffectIntensity(
  effectPos: [number, number, number], 
  sourcePos: [number, number, number], 
  radius: number
): number {
  const distance = this.calculateDistance(effectPos, sourcePos);
  
  if (distance >= radius) {
    return 0;
  }
  
  // Intensidad basada en distancia (1.0 en el centro, 0.0 en el borde)
  return Math.max(0, 1 - (distance / radius));
}
```

## Gestión del Listener

### Inicialización
```typescript
private initializeListener(): void {
  this.updateListener(this.listenerState.position, this.listenerState.forward);
  console.log(`🎧 SpatialAudioManager: Listener inicializado`);
}
```

### Estado del Listener
```typescript
// Estado inicial
this.listenerState = {
  position: new THREE.Vector3(0, 0, 0),
  forward: new THREE.Vector3(0, 0, -1),
  up: new THREE.Vector3(0, 1, 0),
};
```

### Actualización en Tiempo Real
- Sincronización con movimiento de cámara
- Actualización de posición y orientación
- Optimización de logs para evitar spam

## Cálculos Espaciales

### Distancia Euclidiana 3D
```typescript
distance = √((x₁-x₂)² + (y₁-y₂)² + (z₁-z₂)²)
```

### Atenuación por Distancia
```typescript
// Modelo inverso
attenuation = refDistance / (refDistance + rolloffFactor * (distance - refDistance))
```

### Intensidad de Efectos
```typescript
// Intensidad basada en proximidad
intensity = max(0, 1 - (distance / radius))
```

## Optimizaciones de Rendimiento

### 1. **Reducción de Logs**
```typescript
// Solo loggear cambios significativos (cada 0.5 unidades)
const currentPos = `${Math.round(position.x * 2) / 2},${Math.round(position.y * 2) / 2},${Math.round(position.z * 2) / 2}`;
if (this.lastListenerPosition !== currentPos) {
  this.lastListenerPosition = currentPos;
  console.log(`🎧 SpatialAudioManager: Listener actualizado...`);
}
```

### 2. **Cálculos Eficientes**
- Caché de distancias calculadas
- Reducción de recálculos innecesarios
- Optimización de operaciones matemáticas

### 3. **Gestión de Memoria**
- Reutilización de objetos Vector3
- Limpieza automática de recursos
- Prevención de memory leaks

## Dependencias

### Librerías Externas
- `tone`: Framework de audio para Panner3D y Listener
- `three`: Matemáticas 3D y vectores

### Tipos Internos
- `SpatialAudioConfig`: Configuración espacial
- `ListenerState`: Estado del listener

## Relaciones con Otros Archivos

### Archivos que lo Usan
- `src/lib/AudioManager.ts`: Gestión centralizada de audio
- `src/hooks/useAudioListener.ts`: Sincronización con cámara
- `src/lib/managers/EffectManager.ts`: Cálculos de intensidad

### Archivos que Usa
- Ninguno (manager independiente)

## Consideraciones de Rendimiento

### 1. **Actualizaciones Frecuentes**
- Listener se actualiza con cada movimiento de cámara
- Optimización de logs para evitar spam
- Cálculos eficientes de distancia

### 2. **Precisión vs Rendimiento**
- Balance entre precisión y rendimiento
- Redondeo para reducir cálculos
- Caché de valores calculados

### 3. **Memoria**
- Reutilización de objetos Vector3
- Limpieza automática de recursos
- Prevención de memory leaks

## Uso en la Aplicación

### Inicialización
```typescript
const spatialManager = new SpatialAudioManager();
```

### Actualización del Listener
```typescript
spatialManager.updateListener(cameraPosition, cameraForward);
```

### Creación de Panner
```typescript
const panner = spatialManager.createPanner3D([1, 0, 0]);
```

### Cálculo de Intensidad
```typescript
const intensity = spatialManager.calculateEffectIntensity(
  effectPosition, 
  sourcePosition, 
  radius
);
```

## Notas para Desarrollo

### 1. **Sincronización**
- Listener debe sincronizarse con la cámara
- Actualizaciones en tiempo real
- Prevención de desfases

### 2. **Testing**
- Probar cálculos de distancia
- Verificar atenuación por distancia
- Validar intensidad de efectos

### 3. **Debugging**
- Logs descriptivos para operaciones
- Visualización de posiciones
- Métricas de rendimiento

## Mejoras Futuras

1. **Occlusión**: Simulación de obstáculos
2. **Reverb Zones**: Zonas de reverberación
3. **Doppler Effect**: Efecto Doppler
4. **Métricas**: Monitoreo de rendimiento
5. **Configuración**: Parámetros personalizables











