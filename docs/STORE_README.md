# Casa de Salomon - Store de Estado Global

## Descripción
Este proyecto implementa un store de estado global usando Zustand para una aplicación de creación musical 3D colaborativa llamada "Casa de Salomon".

## Estructura del Proyecto

```
src/
├── state/
│   └── useWorldStore.ts      # Store principal de Zustand
├── examples/
│   └── storeUsage.ts         # Ejemplos de uso del store
└── app/                      # App Router de Next.js
```

## Dependencias Instaladas

- **Next.js 14** con App Router
- **TypeScript** para tipado estático
- **Tailwind CSS** para estilos
- **Three.js** para gráficos 3D
- **@react-three/fiber** para React + Three.js
- **@react-three/drei** para utilidades 3D
- **Tone.js** para audio
- **Zustand** para manejo de estado
- **UUID** para identificadores únicos

## Store de Estado Global

### Tipos Principales

#### `SoundObjectType`
```typescript
type SoundObjectType = 'cube' | 'sphere';
```

#### `SoundObject`
```typescript
interface SoundObject {
  id: string;
  type: SoundObjectType;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  audioParams: Record<string, any>;
  isSelected: boolean;
}
```

#### `WorldState`
```typescript
interface WorldState {
  objects: SoundObject[];
  selectedObjectId: string | null;
}
```

### Acciones Disponibles

#### `addObject(type, position)`
Añade un nuevo objeto de sonido al mundo 3D.

```typescript
const { addObject } = useWorldStore();

// Añadir un cubo en el origen
addObject('cube', [0, 0, 0]);

// Añadir una esfera en posición específica
addObject('sphere', [2, 1, -1]);
```

#### `removeObject(id)`
Elimina un objeto del mundo por su ID.

```typescript
const { removeObject } = useWorldStore();
removeObject('uuid-del-objeto');
```

#### `selectObject(id)`
Selecciona un objeto (o deselecciona si se pasa `null`).

```typescript
const { selectObject } = useWorldStore();

// Seleccionar objeto
selectObject('uuid-del-objeto');

// Deseleccionar
selectObject(null);
```

#### `updateObject(id, updates)`
Actualiza las propiedades de un objeto existente.

```typescript
const { updateObject } = useWorldStore();

// Actualizar posición
updateObject('uuid-del-objeto', {
  position: [1, 2, 3]
});

// Actualizar parámetros de audio
updateObject('uuid-del-objeto', {
  audioParams: {
    frequency: 440,
    volume: 0.8
  }
});
```

## Uso del Store en Componentes

### Hook Básico
```typescript
import { useWorldStore } from '@/state/useWorldStore';

function MiComponente() {
  const { objects, addObject } = useWorldStore();
  
  return (
    <div>
      <p>Total de objetos: {objects.length}</p>
      <button onClick={() => addObject('cube', [0, 0, 0])}>
        Añadir Cubo
      </button>
    </div>
  );
}
```

### Acceso Selectivo al Estado
```typescript
// Solo objetos seleccionados
const selectedObjects = useWorldStore(state => 
  state.objects.filter(obj => obj.isSelected)
);

// Solo el ID del objeto seleccionado
const selectedId = useWorldStore(state => state.selectedObjectId);
```

## Parámetros de Audio por Defecto

### Cubo
- Frecuencia: 220 Hz
- Forma de onda: Sine
- Volumen: 0.5
- Reverb: 0.3
- Delay: 0.1

### Esfera
- Frecuencia: 440 Hz
- Forma de onda: Triangle
- Volumen: 0.7
- Reverb: 0.5
- Delay: 0.2

## Ejemplos de Uso

Revisa el archivo `src/examples/storeUsage.ts` para ver ejemplos completos de:

1. **ObjectCreator**: Componente para añadir nuevos objetos
2. **ObjectList**: Lista de todos los objetos con opciones de selección y eliminación
3. **SelectedObjectInfo**: Panel de propiedades del objeto seleccionado

## Próximos Pasos

1. Integrar el store con Three.js para renderizado 3D
2. Implementar sincronización en tiempo real para colaboración
3. Añadir más tipos de objetos de sonido
4. Implementar efectos de audio avanzados con Tone.js
5. Crear interfaz de usuario para manipulación 3D

## Comandos Útiles

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Ejecutar tests
npm run test
```

## Contribución

Este proyecto está diseñado para ser extensible. Puedes:
- Añadir nuevos tipos de objetos de sonido
- Implementar nuevas acciones en el store
- Crear componentes de interfaz adicionales
- Mejorar la sincronización de estado
