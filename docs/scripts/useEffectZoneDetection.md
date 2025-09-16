# Documentación: `src/hooks/useEffectZoneDetection.ts`

## Propósito
Hook personalizado para detectar colisiones entre objetos sonoros y zonas de efectos en tiempo real. Gestiona la aplicación dinámica de efectos de audio basada en la proximidad espacial de los objetos en el espacio 3D.

## Funcionalidades Principales

### 1. Detección de Colisiones en Tiempo Real
- Detecta cuando objetos sonoros entran/salen de zonas de efectos
- Funciona con formas esféricas y cúbicas
- Cálculo de proximidad basado en distancia 3D

### 2. Aplicación Dinámica de Efectos
- Aplica efectos de audio con intensidad variable según proximidad
- Transiciones suaves entre estados de efecto
- Desconexión automática cuando los objetos salen de las zonas

### 3. Optimización de Rendimiento
- Debugging limitado a cada 2 segundos para evitar spam de consola
- Procesamiento eficiente usando `useFrame` de React Three Fiber
- Cálculos optimizados de distancia y colisión

## Estructura del Código

```typescript
export function useEffectZoneDetection() {
  const { grids } = useWorldStore();
  let lastDebugTime = 0;
  
  // Obtener todos los objetos y zonas de efectos
  const allObjects = Array.from(grids.values()).flatMap(grid => grid.objects);
  const allEffectZones = Array.from(grids.values()).flatMap(grid => grid.effectZones);

  useFrame(() => {
    // Solo procesar si hay zonas de efectos
    if (allEffectZones.length === 0) return;

    // Iterar sobre cada objeto sonoro
    allObjects.forEach((soundObject) => {
      let isInsideAnyZone = false;
      
      // Iterar sobre cada zona de efecto
      allEffectZones.forEach((effectZone) => {
        // Detección de colisión mejorada
        // Aplicación de efectos con amount variable
      });
    });
  });
}
```

## Dependencias

### Externas
- `@react-three/fiber`: Para `useFrame`
- `three`: Para cálculos 3D y geometrías
- `react`: Para hooks

### Internas
- `useWorldStore`: Para acceso a objetos y zonas de efectos
- `audioManager`: Para aplicar efectos de audio

## Tipos de Zonas de Efectos

### Zonas Esféricas
```typescript
if (effectZone.shape === 'sphere') {
  const zoneRadius = effectZone.scale[0];
  const zoneCenter = new THREE.Vector3(...effectZone.position);
  const objectPoint = new THREE.Vector3(...soundObject.position);
  
  const distance = zoneCenter.distanceTo(objectPoint);
  const isInside = distance <= zoneRadius;
  
  // Cálculo de amount variable para transiciones suaves
  if (isInside) {
    effectAmount = Math.max(0, Math.min(1, 1 - (distance / zoneRadius)));
  }
}
```

### Zonas Cúbicas
```typescript
if (effectZone.shape === 'cube') {
  const zoneSize = effectZone.scale[0];
  const zoneBox = new THREE.Box3();
  
  zoneBox.setFromCenterAndSize(
    new THREE.Vector3(...effectZone.position),
    new THREE.Vector3(zoneSize, zoneSize, zoneSize)
  );
  
  // Aplicar rotación si es necesaria
  if (effectZone.rotation && (effectZone.rotation[0] !== 0 || 
      effectZone.rotation[1] !== 0 || effectZone.rotation[2] !== 0)) {
    const rotationMatrix = new THREE.Matrix4();
    rotationMatrix.makeRotationFromEuler(new THREE.Euler(...effectZone.rotation));
    zoneBox.applyMatrix4(rotationMatrix);
  }
  
  const objectPoint = new THREE.Vector3(...soundObject.position);
  const isInside = zoneBox.containsPoint(objectPoint);
}
```

## Cálculo de Intensidad de Efectos

### Amount Variable
```typescript
// Para zonas esféricas
if (isInside) {
  // El amount varía de 1 (centro) a 0 (borde)
  effectAmount = Math.max(0, Math.min(1, 1 - (distance / zoneRadius)));
}

// Para zonas cúbicas
if (isInside) {
  const zoneCenter = new THREE.Vector3(...effectZone.position);
  const distance = zoneCenter.distanceTo(objectPoint);
  const maxDistance = zoneSize * 0.5; // Radio desde el centro al borde
  effectAmount = Math.max(0, Math.min(1, 1 - (distance / maxDistance)));
}
```

### Aplicación de Efectos
```typescript
if (isInside) {
  // Objeto está dentro de la zona - aplicar efecto con amount variable
  audioManager.setEffectSendAmount(soundObject.id, effectZone.id, effectAmount);
} else {
  // Objeto está fuera de la zona - remover efecto completamente
  audioManager.setEffectSendAmount(soundObject.id, effectZone.id, 0.0);
}
```

## Optimización de Rendimiento

### Debugging Limitado
```typescript
// Solo debuggear cada 2 segundos para no saturar la consola
const now = Date.now();
const shouldDebug = now - lastDebugTime > 2000;

if (shouldDebug) {
  console.log(`🎛️ Debug zona ${zoneType}: ${effectZone.id} | 
               Objeto: ${soundObject.id} | 
               Distancia: ${distance.toFixed(2)} | 
               Radio: ${zoneRadius} | 
               Dentro: ${isInside} | 
               Amount: ${effectAmount.toFixed(2)}`);
}
```

### Procesamiento Condicional
```typescript
// Solo procesar si hay zonas de efectos
if (allEffectZones.length === 0) return;

// Verificar si hay objetos antes de procesar
if (allObjects.length === 0) return;
```

## Gestión de Estados

### Rastreo de Objetos en Zonas
```typescript
// Rastrear si el objeto está dentro de alguna zona
let isInsideAnyZone = false;

// Marcar cuando está dentro de al menos una zona
if (isInside) {
  isInsideAnyZone = true;
}

// IMPORTANTE: Si el objeto no está dentro de ninguna zona, 
// asegurar que todos los efectos estén desconectados
if (!isInsideAnyZone && allEffectZones.length > 0) {
  allEffectZones.forEach((effectZone) => {
    audioManager.setEffectSendAmount(soundObject.id, effectZone.id, 0.0);
  });
}
```

### Limpieza de Efectos
- Desconecta todos los efectos cuando el objeto sale de todas las zonas
- Evita efectos fantasma o residuales
- Mantiene sincronización entre estado visual y audio

## Información de Debug

### Logging Detallado
```typescript
console.log(`🎛️ Debug zona ${zoneType}: ${effectZone.id} | 
             Objeto: ${soundObject.id} | 
             Distancia: ${distance.toFixed(2)} | 
             Radio: ${zoneRadius} | 
             Dentro: ${isInside} | 
             Amount: ${effectAmount.toFixed(2)}`);
```

### Información Incluida
- Tipo de zona (sphere/cube)
- ID de la zona de efecto
- ID del objeto sonoro
- Distancia calculada
- Radio/tamaño de la zona
- Estado de colisión (dentro/fuera)
- Intensidad del efecto (amount)

## Uso en la Aplicación

### Importación
```typescript
import { useEffectZoneDetection } from '../hooks/useEffectZoneDetection';
```

### Implementación
```typescript
function AudioScene() {
  // Activar detección de zonas de efectos
  useEffectZoneDetection();
  
  return (
    <div>
      {/* Componentes de audio 3D */}
      <SoundObjects />
      <EffectZones />
    </div>
  );
}
```

### Integración con React Three Fiber
```typescript
function Experience() {
  // Hook debe estar en el componente que usa useFrame
  useEffectZoneDetection();
  
  return (
    <Canvas>
      <Scene />
      <SoundObjects />
      <EffectZones />
    </Canvas>
  );
}
```

## Relaciones con Otros Archivos

### Dependencias Directas
- `useWorldStore`: Acceso a grids, objects y effectZones
- `audioManager`: Para aplicar efectos de audio
- `useFrame`: Para procesamiento en tiempo real

### Archivos Relacionados
- `EffectZone.tsx`: Componente visual de zonas de efectos
- `SoundCube.tsx`: Objetos sonoros que interactúan con zonas
- `AudioManager.ts`: Gestión de efectos de audio

## Consideraciones de Rendimiento

### Optimizaciones Implementadas
1. **Debugging Limitado**: Solo cada 2 segundos
2. **Validación Temprana**: Retorna si no hay zonas
3. **Cálculos Eficientes**: Usa métodos optimizados de Three.js
4. **Procesamiento Condicional**: Solo cuando es necesario

### Mejores Prácticas
- Usar en componentes que ya tienen `useFrame`
- Evitar múltiples instancias del hook
- Mantener zonas de efectos en número razonable

## Configuración Avanzada

### Personalización de Debug
```typescript
// Modificar intervalo de debug
const debugInterval = 5000; // 5 segundos en lugar de 2

// Habilitar/deshabilitar debug
const enableDebug = process.env.NODE_ENV === 'development';
```

### Tipos de Zona Personalizados
```typescript
// Agregar soporte para nuevas formas
if (effectZone.shape === 'cylinder') {
  // Implementar detección de cilindro
}

if (effectZone.shape === 'plane') {
  // Implementar detección de plano
}
```

## Troubleshooting

### Problemas Comunes
1. **Efectos no se aplican**: Verificar que `audioManager` esté configurado
2. **Detección incorrecta**: Verificar posiciones de objetos y zonas
3. **Rendimiento lento**: Reducir número de objetos o zonas

### Soluciones
1. Confirmar que `useWorldStore` tenga datos válidos
2. Verificar logs de debug para confirmar detección
3. Optimizar número de objetos en escena

## Ejemplo de Uso Completo

```typescript
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { useEffectZoneDetection } from '../hooks/useEffectZoneDetection';
import { StoreProvider } from '../components/StoreProvider';
import { SoundCube } from '../components/sound-objects/SoundCube';
import { EffectZone } from '../components/world/EffectZone';

function AudioExperience() {
  return (
    <StoreProvider>
      <Canvas>
        <AudioScene />
      </Canvas>
    </StoreProvider>
  );
}

function AudioScene() {
  // Activar detección de zonas de efectos
  useEffectZoneDetection();
  
  return (
    <>
      {/* Objetos sonoros */}
      <SoundCube position={[0, 0, 0]} />
      <SoundCube position={[2, 0, 0]} />
      
      {/* Zonas de efectos */}
      <EffectZone 
        position={[0, 0, 0]} 
        scale={[2, 2, 2]} 
        shape="sphere"
        effectType="reverb"
      />
      <EffectZone 
        position={[3, 0, 0]} 
        scale={[1, 1, 1]} 
        shape="cube"
        effectType="delay"
      />
    </>
  );
}
```

## Notas de Desarrollo

### Limitaciones Actuales
- Solo soporta formas esféricas y cúbicas
- Debugging fijo a 2 segundos
- No maneja rotaciones complejas para todas las formas

### Futuras Mejoras
- Soporte para más formas geométricas
- Configuración dinámica de intervalos de debug
- Optimizaciones adicionales de rendimiento
- Mejor manejo de rotaciones para formas complejas
