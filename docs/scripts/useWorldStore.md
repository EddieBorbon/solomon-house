# Documentación: `src/state/useWorldStore.ts`

## Propósito
Store global de estado que gestiona toda la información del mundo 3D, incluyendo cuadrículas, objetos sonoros, objetos móviles, zonas de efectos y configuraciones de audio, implementando el patrón Store con Zustand.

## Funcionalidades Principales

### 1. **Gestión de Cuadrículas**
- Sistema de cuadrículas 3D para organizar el mundo
- Navegación entre cuadrículas
- Carga dinámica de contenido

### 2. **Gestión de Objetos Sonoros**
- 10 tipos diferentes de objetos sonoros
- Parámetros de audio configurables
- Transformaciones 3D (posición, rotación, escala)

### 3. **Gestión de Objetos Móviles**
- 6 tipos de movimiento diferentes
- Detección de proximidad
- Patrones de movimiento programáticos

### 4. **Gestión de Zonas de Efectos**
- 16 tipos de efectos de audio
- Formas esféricas y cúbicas
- Parámetros específicos por tipo de efecto

### 5. **Sincronización con Audio**
- Integración con AudioManager
- Actualización en tiempo real
- Gestión de parámetros de audio

## Estructura del Código

### Interfaces Principales

```typescript
// Cuadrícula del mundo
export interface Grid {
  id: string;
  coordinates: [number, number, number];
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  objects: SoundObject[];
  mobileObjects: MobileObject[];
  effectZones: EffectZone[];
  gridSize: number;
  gridColor: string;
  isLoaded: boolean;
  isSelected: boolean;
}

// Objeto sonoro
export interface SoundObject {
  id: string;
  type: SoundObjectType;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  audioParams: AudioParams;
  isSelected: boolean;
  audioEnabled: boolean;
}

// Objeto móvil
export interface MobileObject {
  id: string;
  type: 'mobile';
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  isSelected: boolean;
  mobileParams: {
    movementType: MovementType;
    radius: number;
    speed: number;
    proximityThreshold: number;
    isActive: boolean;
    centerPosition: [number, number, number];
    direction: [number, number, number];
    axis: [number, number, number];
    amplitude: number;
    frequency: number;
    randomSeed: number;
    showRadiusIndicator: boolean;
    showProximityIndicator: boolean;
  };
}

// Zona de efecto
export interface EffectZone {
  id: string;
  type: EffectType;
  shape: 'sphere' | 'cube';
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  isSelected: boolean;
  isLocked: boolean;
  effectParams: {
    // Parámetros específicos por tipo de efecto
    frequency?: number;
    octaves?: number;
    stages?: number;
    Q?: number;
    // ... más parámetros
  };
}
```

### Tipos de Objetos Sonoros

```typescript
export type SoundObjectType = 
  | 'cube' | 'sphere' | 'cylinder' | 'cone' 
  | 'pyramid' | 'icosahedron' | 'plane' 
  | 'torus' | 'dodecahedronRing' | 'spiral';
```

### Tipos de Movimiento

```typescript
export type MovementType = 
  | 'linear' | 'circular' | 'polar' 
  | 'random' | 'figure8' | 'spiral';
```

## Estado del Store

### Estructura Principal
```typescript
interface WorldState {
  // Cuadrículas
  grids: Map<string, Grid>;
  currentGridCoordinates: [number, number, number];
  activeGridId: string | null;
  
  // Objetos
  objects: SoundObject[];
  mobileObjects: MobileObject[];
  effectZones: EffectZone[];
  
  // Selección y transformación
  selectedEntityId: string | null;
  transformMode: 'translate' | 'rotate' | 'scale';
  isEditingEffectZone: boolean;
  
  // Configuración
  gridSize: number;
  gridColor: string;
  isAudioEnabled: boolean;
}
```

## Métodos Principales

### 1. **Gestión de Cuadrículas**

#### `createGrid(coordinates, position, rotation, scale)`
```typescript
createGrid: (coordinates: [number, number, number], position: [number, number, number], rotation: [number, number, number], scale: [number, number, number]) => {
  const gridId = uuidv4();
  const newGrid: Grid = {
    id: gridId,
    coordinates,
    position,
    rotation,
    scale,
    objects: [],
    mobileObjects: [],
    effectZones: [],
    gridSize: 10,
    gridColor: '#00ff00',
    isLoaded: true,
    isSelected: false,
  };
  
  set((state) => ({
    grids: new Map(state.grids).set(gridId, newGrid),
    activeGridId: gridId,
  }));
}
```

#### `moveToGrid(coordinates)`
```typescript
moveToGrid: (coordinates: [number, number, number]) => {
  const gridId = `${coordinates[0]},${coordinates[1]},${coordinates[2]}`;
  set((state) => ({
    currentGridCoordinates: coordinates,
    activeGridId: gridId,
  }));
}
```

### 2. **Gestión de Objetos Sonoros**

#### `addObject(type, position, gridId)`
```typescript
addObject: (type: SoundObjectType, position: [number, number, number], gridId?: string) => {
  const objectId = uuidv4();
  const targetGridId = gridId || get().activeGridId;
  
  if (!targetGridId) return;
  
  const newObject: SoundObject = {
    id: objectId,
    type,
    position,
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    audioParams: getDefaultAudioParams(type),
    isSelected: false,
    audioEnabled: true,
  };
  
  // Crear fuente de sonido en AudioManager
  audioManager.createSoundSource(objectId, type, newObject.audioParams, position, new Map());
  
  // Añadir a la cuadrícula
  set((state) => {
    const newGrids = new Map(state.grids);
    const grid = newGrids.get(targetGridId);
    if (grid) {
      grid.objects.push(newObject);
      newGrids.set(targetGridId, grid);
    }
    return { grids: newGrids };
  });
}
```

#### `removeObject(objectId)`
```typescript
removeObject: (objectId: string) => {
  // Eliminar del AudioManager
  audioManager.removeSoundSource(objectId);
  
  // Eliminar de todas las cuadrículas
  set((state) => {
    const newGrids = new Map(state.grids);
    newGrids.forEach((grid) => {
      grid.objects = grid.objects.filter(obj => obj.id !== objectId);
    });
    return { grids: newGrids };
  });
}
```

#### `updateObject(objectId, updates)`
```typescript
updateObject: (objectId: string, updates: Partial<SoundObject>) => {
  set((state) => {
    const newGrids = new Map(state.grids);
    newGrids.forEach((grid) => {
      const objectIndex = grid.objects.findIndex(obj => obj.id === objectId);
      if (objectIndex !== -1) {
        grid.objects[objectIndex] = { ...grid.objects[objectIndex], ...updates };
        
        // Actualizar en AudioManager
        if (updates.audioParams) {
          audioManager.updateSoundParams(objectId, updates.audioParams);
        }
        if (updates.position) {
          audioManager.updateSoundPosition(objectId, updates.position);
        }
      }
    });
    return { grids: newGrids };
  });
}
```

### 3. **Gestión de Objetos Móviles**

#### `addMobileObject(position, gridId)`
```typescript
addMobileObject: (position: [number, number, number], gridId?: string) => {
  const objectId = uuidv4();
  const targetGridId = gridId || get().activeGridId;
  
  if (!targetGridId) return;
  
  const newMobileObject: MobileObject = {
    id: objectId,
    type: 'mobile',
    position,
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    isSelected: false,
    mobileParams: {
      movementType: 'linear',
      radius: 2,
      speed: 1,
      proximityThreshold: 1,
      isActive: true,
      centerPosition: position,
      direction: [1, 0, 0],
      axis: [0, 1, 0],
      amplitude: 1,
      frequency: 1,
      randomSeed: Math.random(),
      showRadiusIndicator: true,
      showProximityIndicator: true,
    },
  };
  
  // Añadir a la cuadrícula
  set((state) => {
    const newGrids = new Map(state.grids);
    const grid = newGrids.get(targetGridId);
    if (grid) {
      grid.mobileObjects.push(newMobileObject);
      newGrids.set(targetGridId, grid);
    }
    return { grids: newGrids };
  });
}
```

### 4. **Gestión de Zonas de Efectos**

#### `addEffectZone(type, shape, position, gridId)`
```typescript
addEffectZone: (type: EffectType, shape: 'sphere' | 'cube', position: [number, number, number], gridId?: string) => {
  const zoneId = uuidv4();
  const targetGridId = gridId || get().activeGridId;
  
  if (!targetGridId) return;
  
  const newEffectZone: EffectZone = {
    id: zoneId,
    type,
    shape,
    position,
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    isSelected: false,
    isLocked: false,
    effectParams: getDefaultEffectParams(type),
  };
  
  // Crear efecto global en AudioManager
  audioManager.createGlobalEffect(zoneId, type, position);
  
  // Añadir a la cuadrícula
  set((state) => {
    const newGrids = new Map(state.grids);
    const grid = newGrids.get(targetGridId);
    if (grid) {
      grid.effectZones.push(newEffectZone);
      newGrids.set(targetGridId, grid);
    }
    return { grids: newGrids };
  });
}
```

### 5. **Gestión de Selección y Transformación**

#### `selectEntity(entityId)`
```typescript
selectEntity: (entityId: string | null) => {
  set((state) => {
    // Deseleccionar todas las entidades
    const newGrids = new Map(state.grids);
    newGrids.forEach((grid) => {
      grid.objects.forEach(obj => obj.isSelected = false);
      grid.mobileObjects.forEach(obj => obj.isSelected = false);
      grid.effectZones.forEach(zone => zone.isSelected = false);
    });
    
    // Seleccionar nueva entidad
    if (entityId) {
      newGrids.forEach((grid) => {
        const object = grid.objects.find(obj => obj.id === entityId);
        if (object) object.isSelected = true;
        
        const mobileObject = grid.mobileObjects.find(obj => obj.id === entityId);
        if (mobileObject) mobileObject.isSelected = true;
        
        const effectZone = grid.effectZones.find(zone => zone.id === entityId);
        if (effectZone) effectZone.isSelected = true;
      });
    }
    
    return { 
      grids: newGrids, 
      selectedEntityId: entityId,
      transformMode: 'translate' 
    };
  });
}
```

#### `setTransformMode(mode)`
```typescript
setTransformMode: (mode: 'translate' | 'rotate' | 'scale') => {
  set({ transformMode: mode });
}
```

### 6. **Acciones de Audio**

#### `toggleObjectAudio(objectId)`
```typescript
toggleObjectAudio: (objectId: string) => {
  set((state) => {
    const newGrids = new Map(state.grids);
    newGrids.forEach((grid) => {
      const object = grid.objects.find(obj => obj.id === objectId);
      if (object) {
        object.audioEnabled = !object.audioEnabled;
        
        if (object.audioEnabled) {
          audioManager.startContinuousSound(objectId);
        } else {
          audioManager.stopSound(objectId);
        }
      }
    });
    return { grids: newGrids };
  });
}
```

#### `triggerObjectNote(objectId, note, duration)`
```typescript
triggerObjectNote: (objectId: string, note: string, duration: string) => {
  audioManager.triggerNoteAttack(objectId, note, duration);
}
```

## Funciones de Utilidad

### `getDefaultAudioParams(type)`
```typescript
const getDefaultAudioParams = (type: SoundObjectType): AudioParams => {
  const baseParams: AudioParams = {
    frequency: 440,
    waveform: 'sine',
    volume: 0.5,
  };
  
  switch (type) {
    case 'cube': // AMSynth
      return { ...baseParams, harmonicity: 1.5, modulationWaveform: 'sine' };
    case 'sphere': // FMSynth
      return { ...baseParams, harmonicity: 1.5, modulationIndex: 2 };
    case 'cylinder': // DuoSynth
      return { ...baseParams, waveform2: 'sine', vibratoAmount: 0.1, vibratoRate: 5 };
    // ... más casos
  }
};
```

### `getDefaultEffectParams(type)`
```typescript
const getDefaultEffectParams = (type: EffectType): any => {
  switch (type) {
    case 'phaser':
      return { frequency: 0.5, octaves: 3, stages: 4, Q: 10 };
    case 'reverb':
      return { roomSize: 0.5, dampening: 0.3, wet: 0.5 };
    case 'delay':
      return { delayTime: '8n', feedback: 0.3, wet: 0.5 };
    // ... más casos
  }
};
```

## Dependencias

### Librerías Externas
- `zustand`: Gestión de estado
- `uuid`: Generación de IDs únicos

### Archivos Internos
- `../lib/AudioManager`: Gestión de audio

## Relaciones con Otros Archivos

### Archivos que lo Usan
- Todos los componentes de UI
- Todos los hooks personalizados
- Componentes de objetos sonoros

### Archivos que Usa
- `src/lib/AudioManager.ts`: Acciones de audio

## Consideraciones de Rendimiento

### 1. **Gestión de Estado**
- Zustand para rendimiento optimizado
- Actualizaciones inmutables
- Reducción de re-renders

### 2. **Sincronización con Audio**
- Actualizaciones en tiempo real
- Gestión eficiente de parámetros
- Prevención de operaciones duplicadas

### 3. **Gestión de Memoria**
- Limpieza automática de objetos
- Prevención de memory leaks
- Optimización de búsquedas

## Uso en la Aplicación

### Acceso al Store
```typescript
const { 
  grids, 
  addObject, 
  removeObject, 
  selectEntity,
  transformMode 
} = useWorldStore();
```

### Acciones Comunes
```typescript
// Añadir objeto
addObject('cube', [0, 0, 0]);

// Seleccionar entidad
selectEntity('object-id');

// Cambiar modo de transformación
setTransformMode('rotate');

// Actualizar objeto
updateObject('object-id', { 
  position: [1, 0, 0] 
});
```

## Notas para Desarrollo

### 1. **Inmutabilidad**
- Siempre crear nuevos objetos/arrays
- Usar spread operator para actualizaciones
- Prevenir mutaciones directas

### 2. **Sincronización**
- Mantener sincronización con AudioManager
- Actualizar parámetros en tiempo real
- Prevenir desfases

### 3. **Testing**
- Probar todas las acciones del store
- Verificar sincronización con audio
- Validar transformaciones 3D

## Mejoras Futuras

1. **Persistencia**: Guardado automático en localStorage
2. **Undo/Redo**: Sistema de historial
3. **Colaboración**: Sincronización en tiempo real
4. **Métricas**: Monitoreo de rendimiento
5. **Configuración**: Parámetros personalizables

