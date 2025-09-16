# Documentación de Relaciones entre Componentes
## Casa de Salomón - Sistema de Creación Musical 3D Colaborativa

### Índice
1. [Diagramas de Relaciones](#diagramas-de-relaciones)
2. [Flujo de Datos](#flujo-de-datos)
3. [Dependencias entre Módulos](#dependencias-entre-módulos)
4. [Comunicación entre Componentes](#comunicación-entre-componentes)
5. [Patrones de Interacción](#patrones-de-interacción)
6. [Sincronización de Estado](#sincronización-de-estado)
7. [Gestión de Eventos](#gestión-de-eventos)
8. [Arquitectura de Audio](#arquitectura-de-audio)
9. [Arquitectura de Gráficos](#arquitectura-de-gráficos)
10. [Sistema de Colaboración](#sistema-de-colaboración)

---

## Diagramas de Relaciones

### 1. Arquitectura General del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE PRESENTACIÓN                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Next.js   │  │    React    │  │  Three.js   │        │
│  │   App       │  │ Components  │  │   R3F       │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
├─────────────────────────────────────────────────────────────┤
│                    CAPA DE LÓGICA                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Zustand   │  │    Hooks    │  │  Services   │        │
│  │   Store     │  │  Personal.  │  │  Firebase   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
├─────────────────────────────────────────────────────────────┤
│                    CAPA DE AUDIO                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Tone.js   │  │ AudioManager│  │  Spatial    │        │
│  │   Engine    │  │   Singleton │  │  Audio      │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
├─────────────────────────────────────────────────────────────┤
│                    CAPA DE PERSISTENCIA                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Firestore  │  │    Auth     │  │  Analytics  │        │
│  │  Database   │  │  Firebase   │  │  Firebase   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### 2. Relaciones Principales de Componentes

```
                    ┌─────────────────┐
                    │   App Layout    │
                    │   (layout.tsx)  │
                    └─────────┬───────┘
                              │
                    ┌─────────▼───────┐
                    │   Main Page     │
                    │   (page.tsx)    │
                    └─────────┬───────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼────────┐    ┌───────▼────────┐    ┌───────▼────────┐
│   Experience   │    │ Control Panel  │    │  UI Components │
│   (3D Scene)   │    │   (UI Layer)   │    │   (Overlays)   │
└───────┬────────┘    └───────┬────────┘    └───────┬────────┘
        │                     │                     │
        │                     │                     │
┌───────▼────────┐    ┌───────▼────────┐    ┌───────▼────────┐
│  SceneContent  │    │  World Store   │    │  Audio Manager │
│  (3D Objects)  │    │  (Zustand)     │    │   (Singleton)  │
└───────┬────────┘    └───────┬────────┘    └───────┬────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                    ┌─────────▼───────┐
                    │  Sound Objects  │
                    │  (3D + Audio)   │
                    └─────────────────┘
```

---

## Flujo de Datos

### 1. Flujo Principal de Interacción

```
Usuario → UI Component → Store Action → Audio Manager → Web Audio API
   ↓           ↓             ↓             ↓              ↓
UI Update  State Change  Audio Update  Sound Output   Speakers
```

### 2. Flujo de Creación de Objetos

```
1. Usuario hace clic en "Añadir Cubo"
   ↓
2. ControlPanel.handleAddCube()
   ↓
3. useWorldStore.addObject()
   ↓
4. Store actualiza estado
   ↓
5. AudioManager.createSoundSource()
   ↓
6. SoundSourceFactory.createSoundSource()
   ↓
7. SceneContent renderiza nuevo objeto
   ↓
8. SoundCube se monta con audio
```

### 3. Flujo de Actualización de Parámetros

```
1. Usuario mueve slider de frecuencia
   ↓
2. ParameterEditor actualiza valor
   ↓
3. useWorldStore.updateObject()
   ↓
4. Store actualiza estado del objeto
   ↓
5. AudioManager.updateSoundParams()
   ↓
6. ParameterManager aplica cambios
   ↓
7. Sintetizador actualiza parámetros
   ↓
8. Sonido cambia en tiempo real
```

### 4. Flujo de Audio Espacial

```
1. Cámara se mueve (OrbitControls)
   ↓
2. useCameraControls detecta movimiento
   ↓
3. useAudioListener actualiza listener
   ↓
4. SpatialAudioManager.updateListener()
   ↓
5. Tone.Listener se actualiza
   ↓
6. Panner3D de cada objeto recalcula
   ↓
7. Audio se espacializa automáticamente
```

---

## Dependencias entre Módulos

### 1. Jerarquía de Dependencias

```
src/app/
├── layout.tsx
│   └── StoreProvider
│       └── useWorldStore
├── page.tsx
│   ├── Experience
│   │   ├── SceneContent
│   │   │   ├── SoundObjectContainer
│   │   │   │   └── SoundCube, SoundSphere, etc.
│   │   │   ├── MobileObject
│   │   │   └── EffectZone
│   │   └── GridRenderer
│   ├── ControlPanel
│   ├── ParameterEditor
│   ├── AudioInitializer
│   ├── TransformToolbar
│   ├── SpatializationDebug
│   └── GridCreator
```

### 2. Dependencias de Audio

```
AudioManager (Singleton)
├── SoundSourceFactory
├── EffectManager
├── SpatialAudioManager
├── AudioContextManager
├── SoundPlaybackManager
└── ParameterManager
```

### 3. Dependencias de Estado

```
useWorldStore
├── AudioManager
├── FirebaseService
├── PersistenceService
└── RealtimeSyncManager
```

---

## Comunicación entre Componentes

### 1. Patrón Observer (Zustand)

```typescript
// Componente escucha cambios de estado
const { objects, selectedEntityId } = useWorldStore();

// Store notifica cambios automáticamente
const addObject = (type, position) => {
  set(state => ({
    objects: [...state.objects, newObject]
  }));
};
```

### 2. Patrón Callback

```typescript
// Componente padre pasa callback
<SoundCube 
  onSelect={handleEntitySelect}
  onUpdate={handleObjectUpdate}
/>

// Componente hijo ejecuta callback
const handleClick = () => {
  onSelect(id);
  onUpdate(newParams);
};
```

### 3. Patrón Event Bus

```typescript
// Emisión de eventos
audioManager.on('soundCreated', (soundId) => {
  console.log('Sound created:', soundId);
});

// Escucha de eventos
audioManager.emit('soundCreated', newSoundId);
```

### 4. Patrón Props Drilling

```typescript
// Paso de props a través de la jerarquía
<SceneContent 
  orbitControlsRef={orbitControlsRef}
  onEntitySelect={handleEntitySelect}
  onTransformChange={handleTransformChange}
/>
```

---

## Patrones de Interacción

### 1. Interacción de Objetos Sonoros

```
Click Corto:
Usuario → SoundCube.handleClick() → triggerObjectAttackRelease() → AudioManager.triggerAttackRelease()

Click Sostenido:
Usuario → SoundCube.handlePointerDown() → startObjectGate() → AudioManager.startSound()
Usuario → SoundCube.handlePointerUp() → stopObjectGate() → AudioManager.stopSound()

Toggle Audio:
Usuario → SoundCube.handleClick() → toggleObjectAudio() → AudioManager.startContinuousSound()
```

### 2. Interacción de Transformación

```
Selección:
Usuario → Click en objeto → selectEntity() → Store actualiza selectedEntityId

Transformación:
Usuario → Drag TransformControls → handleTransformChange() → updateObject() → Store + AudioManager

Modo de Transformación:
Usuario → Tecla G/R/S → setTransformMode() → Store actualiza transformMode
```

### 3. Interacción de Zonas de Efectos

```
Creación:
Usuario → ControlPanel → addEffectZone() → Store + AudioManager.createGlobalEffect()

Detección:
useEffectZoneDetection → calcula distancias → AudioManager.setEffectSendAmount()

Actualización:
Usuario → ParameterEditor → updateEffectZone() → Store + AudioManager.updateGlobalEffect()
```

---

## Sincronización de Estado

### 1. Estado Local vs Global

```
Estado Local (Componente):
- UI temporal (modales, tooltips)
- Estado de animación
- Referencias a elementos DOM

Estado Global (Store):
- Objetos sonoros
- Zonas de efectos
- Configuración de audio
- Estado de colaboración
```

### 2. Sincronización con Audio

```typescript
// Store → AudioManager
const addObject = (type, position) => {
  // 1. Actualizar store
  set(state => ({ objects: [...state.objects, newObject] }));
  
  // 2. Sincronizar con audio
  audioManager.createSoundSource(id, type, params, position);
};
```

### 3. Sincronización con Firebase

```typescript
// Store → Firebase
const updateObject = (id, updates) => {
  // 1. Actualizar store local
  set(state => ({ /* actualización local */ }));
  
  // 2. Sincronizar con Firebase
  firebaseService.updateObject(id, updates);
};
```

---

## Gestión de Eventos

### 1. Eventos de Audio

```typescript
// Eventos de creación
audioManager.on('soundCreated', handleSoundCreated);
audioManager.on('effectCreated', handleEffectCreated);

// Eventos de reproducción
audioManager.on('soundStarted', handleSoundStarted);
audioManager.on('soundStopped', handleSoundStopped);

// Eventos de error
audioManager.on('audioError', handleAudioError);
```

### 2. Eventos de UI

```typescript
// Eventos de teclado
useKeyboardShortcuts() → handleKeyDown → Store actions

// Eventos de mouse
onClick → handleClick → Store actions
onPointerDown → handlePointerDown → Audio actions
onPointerUp → handlePointerUp → Audio actions
```

### 3. Eventos de Colaboración

```typescript
// Eventos de sincronización
realtimeSync.on('stateChanged', handleStateChanged);
realtimeSync.on('userJoined', handleUserJoined);
realtimeSync.on('conflictDetected', handleConflict);
```

---

## Arquitectura de Audio

### 1. Cadena de Audio Principal

```
Sintetizador → Panner3D → DryGain → Destination
     ↓
EffectSends → GlobalEffects → Destination
```

### 2. Gestión de Efectos

```
Objeto Sonoro → EffectSend → GlobalEffect → Panner3D → Destination
     ↓              ↓            ↓
  Intensidad    Parámetros    Posición
  (0-1)         (Tiempo Real) (3D)
```

### 3. Audio Espacial

```
Listener (Cámara) ←→ Panner3D (Objeto) ←→ Sintetizador
     ↓                    ↓                    ↓
  Posición/Orientación  Posición 3D        Parámetros
  HRTF Processing       Distance Model      Audio Params
```

---

## Arquitectura de Gráficos

### 1. Jerarquía de Renderizado

```
Scene
├── Camera (OrbitControls)
├── Lighting
│   ├── AmbientLight
│   ├── DirectionalLight
│   └── HemisphereLight
├── Grids
│   ├── GridRenderer
│   └── GridObjects
└── Objects
    ├── SoundObjects
    ├── MobileObjects
    └── EffectZones
```

### 2. Sistema de Transformaciones

```
TransformControls
├── Translate Mode
├── Rotate Mode
└── Scale Mode
    ↓
handleTransformChange()
    ↓
updateObject() / updateMobileObject() / updateEffectZone()
    ↓
Store + AudioManager
```

### 3. Sistema de Selección

```
Click en Objeto
    ↓
handleEntitySelect()
    ↓
selectEntity()
    ↓
Store actualiza selectedEntityId
    ↓
TransformControls se activa
    ↓
UI muestra parámetros del objeto
```

---

## Sistema de Colaboración

### 1. Sincronización de Estado

```
Usuario A → Acción → Store Local → Firebase → Usuario B
    ↓           ↓         ↓           ↓         ↓
  UI Update  State    Realtime    Conflict   UI Update
             Change   Sync        Resolution
```

### 2. Resolución de Conflictos

```
Conflicto Detectado
    ↓
Operational Transform
    ↓
Merge de Cambios
    ↓
Notificación a Usuarios
    ↓
Actualización de UI
```

### 3. Gestión de Usuarios

```
Usuario Conecta
    ↓
Firebase Auth
    ↓
RealtimeSyncManager
    ↓
Notificación a Otros Usuarios
    ↓
Actualización de Lista de Usuarios
```

---

## Patrones de Comunicación

### 1. Unidireccional (React)

```
Props Down → Events Up
Parent Component → Child Component
Store → Component
```

### 2. Bidireccional (Zustand)

```
Component ↔ Store
Store ↔ AudioManager
Store ↔ Firebase
```

### 3. Event-Driven

```
AudioManager → Events → Components
Firebase → Events → Store
User Actions → Events → Multiple Components
```

---

## Consideraciones de Rendimiento

### 1. Optimización de Re-renders

```typescript
// Memoización de componentes
const SoundCube = React.memo(({ id, position, audioParams }) => {
  // Componente solo se re-renderiza si props cambian
});

// Memoización de callbacks
const handleClick = useCallback(() => {
  // Callback estable para evitar re-renders
}, [dependencies]);
```

### 2. Optimización de Audio

```typescript
// Batching de actualizaciones
const updateMultipleParams = (params) => {
  // Actualizar múltiples parámetros en una sola operación
  audioManager.updateSoundParams(id, params);
};

// Debouncing de eventos
const debouncedUpdate = useMemo(
  () => debounce(updateParams, 100),
  []
);
```

### 3. Optimización de Gráficos

```typescript
// Frustum culling
const isVisible = camera.frustum.containsPoint(objectPosition);
if (!isVisible) return null;

// Level of Detail
const lodLevel = calculateLOD(distance);
const geometry = getGeometryForLOD(lodLevel);
```

---

## Patrones de Error Handling

### 1. Try-Catch en Operaciones Críticas

```typescript
try {
  audioManager.createSoundSource(id, type, params, position);
} catch (error) {
  console.error('Error creating sound source:', error);
  // Fallback o notificación al usuario
}
```

### 2. Error Boundaries

```typescript
<ErrorBoundary fallback={<ErrorFallback />}>
  <SoundCube {...props} />
</ErrorBoundary>
```

### 3. Validación de Datos

```typescript
const validateAudioParams = (params) => {
  if (params.frequency < 20 || params.frequency > 20000) {
    throw new Error('Invalid frequency range');
  }
  // Más validaciones...
};
```

---

## Consideraciones de Mantenibilidad

### 1. Separación de Responsabilidades

- **UI Components**: Solo presentación
- **Hooks**: Lógica reutilizable
- **Services**: Lógica de negocio
- **Managers**: Gestión de recursos

### 2. Inyección de Dependencias

```typescript
// En lugar de importar directamente
import { audioManager } from '../lib/AudioManager';

// Usar inyección
const MyComponent = ({ audioManager }) => {
  // Componente más testeable
};
```

### 3. Configuración Centralizada

```typescript
// Configuración en un solo lugar
const AUDIO_CONFIG = {
  sampleRate: 44100,
  bufferSize: 2048,
  maxPolyphony: 32
};
```

Esta documentación de relaciones proporciona una visión completa de cómo los diferentes componentes del sistema Casa de Salomón interactúan entre sí, facilitando la comprensión del flujo de datos, las dependencias y los patrones de comunicación para fines de investigación doctoral.
