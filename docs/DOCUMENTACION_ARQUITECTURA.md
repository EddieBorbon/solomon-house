# Documentación de Arquitectura - Casa de Salomón
## Sistema de Creación Musical 3D Colaborativa

### Resumen Ejecutivo

**Casa de Salomón** es una aplicación web de creación musical 3D colaborativa desarrollada como parte de una investigación doctoral. El sistema combina tecnologías de audio espacial, gráficos 3D en tiempo real y colaboración en tiempo real para crear un entorno inmersivo donde los usuarios pueden crear, manipular y experimentar con objetos sonoros tridimensionales.

### Arquitectura General del Sistema

#### 1. Arquitectura de Alto Nivel

El sistema está construido sobre una arquitectura de microservicios modulares que se comunica a través de un patrón de eventos y un sistema de estado centralizado. La arquitectura se divide en las siguientes capas principales:

```
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE PRESENTACIÓN                    │
│  Next.js + React + Three.js + React Three Fiber          │
├─────────────────────────────────────────────────────────────┤
│                    CAPA DE LÓGICA DE NEGOCIO               │
│  Zustand Store + Hooks + Componentes de UI                │
├─────────────────────────────────────────────────────────────┤
│                    CAPA DE AUDIO                           │
│  Tone.js + AudioManager + SpatialAudioManager             │
├─────────────────────────────────────────────────────────────┤
│                    CAPA DE PERSISTENCIA                    │
│  Firebase Firestore + Firebase Auth                       │
├─────────────────────────────────────────────────────────────┤
│                    CAPA DE COLABORACIÓN                    │
│  Firebase Realtime + WebRTC (Futuro)                      │
└─────────────────────────────────────────────────────────────┘
```

#### 2. Patrones de Diseño Implementados

**Singleton Pattern**: 
- `AudioManager`: Gestión centralizada del contexto de audio
- `EffectManager`: Manejo de efectos globales
- `SpatialAudioManager`: Control de audio espacial

**Factory Pattern**:
- `SoundSourceFactory`: Creación de diferentes tipos de sintetizadores
- `EffectFactory`: Creación de efectos de audio

**Observer Pattern**:
- Sistema de eventos de Zustand para reactividad
- Hooks personalizados para escuchar cambios de estado

**Command Pattern**:
- Acciones del store para manipulación de objetos
- Sistema de transformaciones 3D

**Strategy Pattern**:
- Diferentes tipos de movimiento para objetos móviles
- Múltiples modos de interacción (clic, gate, continuo)

#### 3. Tecnologías Principales

**Frontend**:
- **Next.js 15.4.6**: Framework React con SSR/SSG
- **React 19.1.0**: Biblioteca de interfaz de usuario
- **Three.js 0.179.1**: Motor de gráficos 3D
- **React Three Fiber**: Integración de Three.js con React
- **Zustand 5.0.7**: Gestión de estado global
- **Tone.js 15.1.22**: Framework de audio web

**Backend y Servicios**:
- **Firebase Firestore**: Base de datos NoSQL
- **Firebase Auth**: Autenticación de usuarios
- **Firebase Analytics**: Métricas de uso

**Herramientas de Desarrollo**:
- **TypeScript 5**: Tipado estático
- **Tailwind CSS 3.4.17**: Framework de estilos
- **ESLint**: Linting de código

### Arquitectura de Audio

#### 1. Sistema de Audio Espacial

El sistema implementa un sistema de audio espacial completo basado en Web Audio API y Tone.js:

```
┌─────────────────────────────────────────────────────────────┐
│                    AUDIO SPATIAL SYSTEM                    │
├─────────────────────────────────────────────────────────────┤
│  Listener (Cámara) ←→ Panner3D ←→ SoundSource             │
│       ↓                    ↓           ↓                   │
│  Position/Orientation  Spatial     Synthesizer            │
│  Updates              Processing   (AM/FM/Duo/etc)        │
│       ↓                    ↓           ↓                   │
│  HRTF Processing    Distance Model   Effect Chain         │
│       ↓                    ↓           ↓                   │
│  Stereo Output      Attenuation    Send/Return            │
└─────────────────────────────────────────────────────────────┘
```

**Características del Audio Espacial**:
- **HRTF (Head-Related Transfer Function)**: Simulación de audición binaural
- **Modelo de Distancia**: Atenuación basada en distancia (inverse, linear, exponential)
- **Panner3D**: Posicionamiento 3D de fuentes de sonido
- **Listener Tracking**: Seguimiento automático de la posición de la cámara

#### 2. Sistema de Efectos Send/Return

Implementación de arquitectura profesional de efectos:

```
SoundSource → Panner3D → DryGain → Destination
     ↓
EffectSends → GlobalEffects → Destination
```

**Ventajas**:
- Efectos independientes por zona espacial
- Mezcla paralela de señal seca y procesada
- Control granular de intensidad de efectos
- Escalabilidad para múltiples efectos simultáneos

#### 3. Tipos de Sintetizadores

El sistema soporta 10 tipos diferentes de sintetizadores:

1. **AMSynth** (Cubo): Modulación de amplitud
2. **FMSynth** (Esfera): Modulación de frecuencia
3. **DuoSynth** (Cilindro): Dos voces con vibrato
4. **MembraneSynth** (Cono): Sintetizador de membranas
5. **MonoSynth** (Pirámide): Monofónico con filtros
6. **MetalSynth** (Icosaedro): Sonidos metálicos
7. **NoiseSynth** (Plano): Ruido procesado
8. **PluckSynth** (Toroide): Simulación de cuerda
9. **PolySynth** (Anillo de Dodecaedros): Polifónico
10. **Sampler** (Espiral): Reproducción de samples

### Arquitectura de Gráficos 3D

#### 1. Sistema de Renderizado

```
┌─────────────────────────────────────────────────────────────┐
│                    THREE.JS RENDERING                      │
├─────────────────────────────────────────────────────────────┤
│  Scene ←→ Camera ←→ OrbitControls                          │
│    ↓         ↓           ↓                                 │
│  Objects   Lighting   Interaction                         │
│    ↓         ↓           ↓                                 │
│  Materials  Shadows   TransformControls                   │
│    ↓         ↓           ↓                                 │
│  Geometry  PostFX     Event Handling                      │
└─────────────────────────────────────────────────────────────┘
```

**Características**:
- **Renderizado en tiempo real**: 60 FPS objetivo
- **Iluminación física**: PBR (Physically Based Rendering)
- **Sombras dinámicas**: Shadow mapping
- **Post-procesamiento**: Tone mapping, antialiasing

#### 2. Sistema de Cuadrículas

Implementación de un sistema de mundo infinito basado en cuadrículas:

```
┌─────────────────────────────────────────────────────────────┐
│                    GRID SYSTEM                             │
├─────────────────────────────────────────────────────────────┤
│  GridManager ←→ GridRenderer ←→ GridObjects                │
│       ↓              ↓              ↓                      │
│  Load/Unload    Visual Grid    Sound Objects              │
│  Adjacent       Reference      Mobile Objects              │
│  Grids          Lines          Effect Zones                │
└─────────────────────────────────────────────────────────────┘
```

**Características**:
- **Carga dinámica**: Solo renderiza cuadrículas cercanas
- **Persistencia**: Cada cuadrícula mantiene su estado
- **Navegación fluida**: Transiciones suaves entre cuadrículas
- **Escalabilidad**: Soporte para mundos infinitos

### Arquitectura de Estado

#### 1. Gestión de Estado con Zustand

```
┌─────────────────────────────────────────────────────────────┐
│                    ZUSTAND STORE                           │
├─────────────────────────────────────────────────────────────┤
│  WorldState ←→ WorldActions ←→ AudioManager                │
│       ↓              ↓              ↓                      │
│  Grids Map      Object CRUD    Sound Sources              │
│  Objects[]      Transform      Effect Zones               │
│  MobileObjects  Selection      Spatial Audio              │
│  EffectZones    UI State      Real-time Updates          │
└─────────────────────────────────────────────────────────────┘
```

**Características del Estado**:
- **Inmutabilidad**: Estado inmutable con actualizaciones funcionales
- **Reactividad**: Actualizaciones automáticas de la UI
- **Persistencia**: Sincronización con Firebase
- **Debugging**: Herramientas de desarrollo integradas

#### 2. Flujo de Datos

```
User Interaction → Component → Store Action → AudioManager → Web Audio API
       ↓              ↓            ↓             ↓              ↓
   UI Update    State Change   Audio Update   Sound Output   Speakers
```

### Arquitectura de Colaboración

#### 1. Sistema de Sincronización en Tiempo Real

```
┌─────────────────────────────────────────────────────────────┐
│                REAL-TIME COLLABORATION                     │
├─────────────────────────────────────────────────────────────┤
│  Local State ←→ Firebase Realtime ←→ Remote Users          │
│       ↓              ↓                    ↓                │
│  Conflict        Event Queue         State Merge          │
│  Resolution      Ordering           Conflict Resolution   │
│       ↓              ↓                    ↓                │
│  UI Update      Network Sync        Audio Sync            │
└─────────────────────────────────────────────────────────────┘
```

**Características**:
- **Operational Transform**: Resolución de conflictos
- **Event Ordering**: Garantía de orden de eventos
- **Optimistic Updates**: UI responsiva con sincronización posterior
- **Conflict Resolution**: Algoritmos de resolución automática

### Arquitectura de Persistencia

#### 1. Estrategia de Almacenamiento

```
┌─────────────────────────────────────────────────────────────┐
│                    PERSISTENCE LAYER                       │
├─────────────────────────────────────────────────────────────┤
│  Local Storage ←→ Firebase Firestore ←→ Cloud Storage      │
│       ↓              ↓                    ↓                │
│  Cache/Offline    Document Store      File Storage         │
│  State Backup     Real-time Sync      Audio Samples        │
│  User Prefs       Collections         Project Files        │
└─────────────────────────────────────────────────────────────┘
```

**Estructura de Datos**:
- **Projects**: Metadatos de proyectos
- **Grids**: Estado de cuadrículas
- **Objects**: Objetos sonoros y sus parámetros
- **Users**: Información de usuarios y permisos
- **Sessions**: Datos de sesiones colaborativas

### Arquitectura de Seguridad

#### 1. Autenticación y Autorización

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYER                          │
├─────────────────────────────────────────────────────────────┤
│  Firebase Auth ←→ Role-Based Access ←→ Data Validation     │
│       ↓              ↓                    ↓                │
│  User Identity    Permission Check    Input Sanitization   │
│  Session Mgmt     Resource Access     Type Safety          │
│  Token Refresh    Action Logging     Rate Limiting         │
└─────────────────────────────────────────────────────────────┘
```

**Características de Seguridad**:
- **Autenticación JWT**: Tokens seguros con Firebase
- **Autorización granular**: Control de acceso por recurso
- **Validación de entrada**: Sanitización de datos del usuario
- **Rate limiting**: Protección contra abuso

### Arquitectura de Rendimiento

#### 1. Optimizaciones Implementadas

**Audio**:
- **Audio Context pooling**: Reutilización de contextos
- **Lazy loading**: Carga bajo demanda de samples
- **Effect batching**: Agrupación de actualizaciones de efectos
- **Spatial culling**: Solo procesa audio de objetos cercanos

**Gráficos**:
- **Frustum culling**: Solo renderiza objetos visibles
- **Level of Detail**: Reducción de geometría a distancia
- **Instanced rendering**: Renderizado eficiente de objetos repetidos
- **Texture atlasing**: Optimización de texturas

**Red**:
- **Delta updates**: Solo envía cambios de estado
- **Compression**: Compresión de datos de red
- **Batching**: Agrupación de operaciones de red
- **Caching**: Almacenamiento local de datos frecuentes

### Arquitectura de Testing

#### 1. Estrategia de Pruebas

```
┌─────────────────────────────────────────────────────────────┐
│                    TESTING ARCHITECTURE                    │
├─────────────────────────────────────────────────────────────┤
│  Unit Tests ←→ Integration Tests ←→ E2E Tests              │
│       ↓              ↓                    ↓                │
│  Component      Audio Pipeline        User Workflows       │
│  Logic          State Management      Collaboration         │
│  Utilities      API Integration       Performance          │
└─────────────────────────────────────────────────────────────┘
```

**Tipos de Pruebas**:
- **Unit Tests**: Componentes individuales y utilidades
- **Integration Tests**: Flujos de audio y estado
- **E2E Tests**: Casos de uso completos
- **Performance Tests**: Métricas de rendimiento
- **Audio Tests**: Calidad y latencia de audio

### Consideraciones de Escalabilidad

#### 1. Escalabilidad Horizontal

- **Microservicios**: Separación de responsabilidades
- **Load balancing**: Distribución de carga
- **CDN**: Distribución de contenido estático
- **Database sharding**: Particionamiento de datos

#### 2. Escalabilidad Vertical

- **Web Workers**: Procesamiento en background
- **WebAssembly**: Cálculos intensivos
- **GPU acceleration**: Renderizado acelerado
- **Memory management**: Gestión eficiente de memoria

### Conclusiones de Arquitectura

La arquitectura de Casa de Salomón está diseñada para ser:

1. **Modular**: Componentes independientes y reutilizables
2. **Escalable**: Soporte para crecimiento horizontal y vertical
3. **Mantenible**: Código limpio y bien documentado
4. **Extensible**: Fácil adición de nuevas funcionalidades
5. **Robusta**: Manejo de errores y recuperación
6. **Performante**: Optimizada para tiempo real
7. **Colaborativa**: Sincronización en tiempo real
8. **Accesible**: Interfaz intuitiva y responsive

Esta arquitectura proporciona una base sólida para la investigación doctoral y permite la exploración de nuevas técnicas de interacción musical 3D y colaboración en tiempo real.
