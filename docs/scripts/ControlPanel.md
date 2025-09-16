# Documentación: `src/components/ui/ControlPanel.tsx`

## Propósito
Panel de control principal que proporciona la interfaz de usuario para crear y gestionar objetos sonoros, zonas de efectos y objetos móviles en el mundo 3D, con navegación por scroll horizontal y secciones expandibles.

## Funcionalidades Principales

### 1. **Creación de Objetos Sonoros**
- 10 tipos diferentes de objetos sonoros
- Posicionamiento aleatorio en la cuadrícula activa
- Integración con el sistema de audio

### 2. **Creación de Zonas de Efectos**
- 16 tipos diferentes de efectos de audio
- Formas esféricas y cúbicas
- Posicionamiento espacial automático

### 3. **Creación de Objetos Móviles**
- Objetos con patrones de movimiento
- Detección de proximidad
- Configuración de parámetros de movimiento

### 4. **Navegación por Scroll**
- Scroll horizontal para menús largos
- Controles de navegación personalizados
- Interfaz responsive

### 5. **Secciones Expandibles**
- Controles de cámara y teclado
- Información del sistema
- Navegación por pestañas

## Estructura del Código

### Estado del Componente
```typescript
const [isAddMenuExpanded, setIsAddMenuExpanded] = useState(false);
const [isControlsExpanded, setIsControlsExpanded] = useState(false);
const [isEffectsExpanded, setIsEffectsExpanded] = useState(false);
const [isMobileObjectExpanded, setIsMobileObjectExpanded] = useState(false);
```

### Hooks y Referencias
```typescript
const { addObject, addEffectZone, addMobileObject, activeGridId, grids } = useWorldStore();
const scrollContainerRef = useRef<HTMLDivElement>(null);
const effectsScrollContainerRef = useRef<HTMLDivElement>(null);
```

## Tipos de Objetos Sonoros

### 1. **Cubo (AMSynth)**
- **Función**: `handleAddCube()`
- **Sintetizador**: Modulación de amplitud
- **Características**: Sonidos suaves y orgánicos

### 2. **Esfera (FMSynth)**
- **Función**: `handleAddSphere()`
- **Sintetizador**: Modulación de frecuencia
- **Características**: Sonidos complejos y ricos

### 3. **Cilindro (DuoSynth)**
- **Función**: `handleAddCylinder()`
- **Sintetizador**: Dos voces con vibrato
- **Características**: Sonidos gruesos y cálidos

### 4. **Cono (MembraneSynth)**
- **Función**: `handleAddCone()`
- **Sintetizador**: Simulación de membranas
- **Características**: Sonidos percusivos

### 5. **Pirámide (MonoSynth)**
- **Función**: `handleAddPyramid()`
- **Sintetizador**: Monofónico con filtros
- **Características**: Sonidos melódicos

### 6. **Icosaedro (MetalSynth)**
- **Función**: `handleAddIcosahedron()`
- **Sintetizador**: Sonidos metálicos
- **Características**: Timbres brillantes

### 7. **Plano (NoiseSynth)**
- **Función**: `handleAddPlane()`
- **Sintetizador**: Ruido procesado
- **Características**: Sonidos de textura

### 8. **Toroide (PluckSynth)**
- **Función**: `handleAddTorus()`
- **Sintetizador**: Simulación de cuerda
- **Características**: Sonidos de cuerda pulsada

### 9. **Anillo de Dodecaedros (PolySynth)**
- **Función**: `handleAddDodecahedronRing()`
- **Sintetizador**: Polifónico
- **Características**: Múltiples voces

### 10. **Espiral (Sampler)**
- **Función**: `handleAddSpiral()`
- **Sintetizador**: Reproducción de samples
- **Características**: Sonidos realistas

## Tipos de Efectos de Audio

### Efectos de Modulación
- **Phaser**: `handleAddPhaserZone()`
- **AutoFilter**: `handleAddAutoFilterZone()`
- **AutoWah**: `handleAddAutoWahZone()`
- **Chorus**: `handleAddChorusZone()`
- **Tremolo**: `handleAddTremoloZone()`
- **Vibrato**: `handleAddVibratoZone()`

### Efectos de Distorsión
- **BitCrusher**: `handleAddBitCrusherZone()`
- **Chebyshev**: `handleAddChebyshevZone()`
- **Distortion**: `handleAddDistortionZone()`

### Efectos de Delay
- **FeedbackDelay**: `handleAddFeedbackDelayZone()`
- **PingPongDelay**: `handleAddPingPongDelayZone()`

### Efectos de Reverb
- **Freeverb**: `handleAddFreeverbZone()`
- **JCReverb**: `handleAddJCReverbZone()`
- **Reverb**: `handleAddReverbZone()`

### Efectos de Pitch
- **FrequencyShifter**: `handleAddFrequencyShifterZone()`
- **PitchShift**: `handleAddPitchShiftZone()`

### Efectos de Espacio
- **StereoWidener**: `handleAddStereoWidenerZone()`

## Funciones Helper

### `createObjectInActiveGrid(type)`
```typescript
const createObjectInActiveGrid = (type: string) => {
  if (!activeGrid) {
    console.warn('No hay cuadrícula activa para crear objetos');
    return;
  }
  
  // Calcular posición relativa a la cuadrícula activa
  const x = (Math.random() - 0.5) * 10;
  const z = (Math.random() - 0.5) * 10;
  addObject(type as any, [x, 0.5, z]);
};
```

### `createEffectZoneInActiveGrid(type)`
```typescript
const createEffectZoneInActiveGrid = (type: string) => {
  if (!activeGrid) {
    console.warn('No hay cuadrícula activa para crear zonas de efecto');
    return;
  }
  
  // Calcular posición relativa a la cuadrícula activa
  const x = (Math.random() - 0.5) * 10;
  const z = (Math.random() - 0.5) * 10;
  addEffectZone(type as any, [x, 1, z], 'sphere');
};
```

### `createMobileObjectInActiveGrid()`
```typescript
const createMobileObjectInActiveGrid = () => {
  if (!activeGrid) {
    console.warn('No hay cuadrícula activa para crear objetos móviles');
    return;
  }
  
  // Calcular posición relativa a la cuadrícula activa
  const x = (Math.random() - 0.5) * 10;
  const z = (Math.random() - 0.5) * 10;
  const finalPosition: [number, number, number] = [x, 0.5, z];
  
  addMobileObject(finalPosition);
};
```

## Navegación por Scroll

### Controles de Scroll
```typescript
const scrollLeft = () => {
  if (scrollContainerRef.current) {
    scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
  }
};

const scrollRight = () => {
  if (scrollContainerRef.current) {
    scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
  }
};
```

### Scroll de Efectos
```typescript
const scrollEffectsLeft = () => {
  if (effectsScrollContainerRef.current) {
    effectsScrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
  }
};

const scrollEffectsRight = () => {
  if (effectsScrollContainerRef.current) {
    effectsScrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
  }
};
```

## Secciones del Panel

### 1. **Controles de Cámara y Teclado**
- Información sobre controles WASD
- Atajos de teclado disponibles
- Instrucciones de navegación

### 2. **Objetos Sonoros**
- Botones para cada tipo de objeto
- Scroll horizontal para navegación
- Información de tipos disponibles

### 3. **Zonas de Efectos**
- Botones para cada tipo de efecto
- Scroll horizontal para navegación
- Información de efectos disponibles

### 4. **Objetos Móviles**
- Botón para crear objetos móviles
- Información sobre patrones de movimiento
- Configuración de parámetros

### 5. **Información del Sistema**
- Estado de la cuadrícula activa
- Número de objetos en el mundo
- Información de debug

## Características de UI

### 1. **Diseño Responsive**
- Adaptación a diferentes tamaños de pantalla
- Scroll horizontal para contenido largo
- Botones optimizados para touch

### 2. **Feedback Visual**
- Estados de hover y active
- Indicadores de selección
- Animaciones suaves

### 3. **Accesibilidad**
- Controles de teclado
- Navegación por tab
- Texto descriptivo

### 4. **Glassmorphism**
- Efectos de transparencia
- Desenfoque de fondo
- Bordes sutiles

## Dependencias

### Hooks Internos
- `useState`: Estado del componente
- `useRef`: Referencias a elementos DOM

### Store Global
- `useWorldStore`: Estado global del mundo

### Componentes
- `PersistencePanel`: Panel de persistencia

## Relaciones con Otros Archivos

### Archivos que lo Usan
- `src/app/page.tsx`: Renderizado en la página principal

### Archivos que Usa
- `src/state/useWorldStore.ts`: Acciones del store
- `src/components/ui/PersistencePanel.tsx`: Panel de persistencia

## Consideraciones de Rendimiento

### 1. **Renderizado Optimizado**
- Componentes memoizados
- Reducción de re-renders
- Lazy loading de secciones

### 2. **Gestión de Estado**
- Estado local para UI
- Estado global para datos
- Sincronización eficiente

### 3. **Scroll Suave**
- `behavior: 'smooth'` para animaciones
- Referencias a elementos DOM
- Optimización de eventos

## Uso en la Aplicación

### Renderizado
```typescript
<ControlPanel />
```

### Integración
- Se renderiza en la página principal
- Superpuesto sobre la escena 3D
- Interactúa con el store global

## Notas para Desarrollo

### 1. **Extensibilidad**
- Fácil adición de nuevos tipos de objetos
- Sistema modular de botones
- Configuración centralizada

### 2. **Testing**
- Probar cada función de creación
- Verificar scroll horizontal
- Validar estados expandibles

### 3. **Debugging**
- Logs descriptivos para operaciones
- Validación de cuadrícula activa
- Manejo de errores

## Mejoras Futuras

1. **Drag & Drop**: Arrastrar objetos desde el panel
2. **Presets**: Configuraciones predefinidas
3. **Búsqueda**: Filtrado de tipos de objetos
4. **Favoritos**: Objetos más usados
5. **Métricas**: Estadísticas de uso



