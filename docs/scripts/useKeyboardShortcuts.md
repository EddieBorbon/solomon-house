# Documentación: `src/hooks/useKeyboardShortcuts.ts`

## Propósito
Hook personalizado que gestiona los atajos de teclado globales de la aplicación, proporcionando acceso rápido a funciones de transformación, selección y eliminación de entidades.

## Funcionalidades Principales

### 1. **Controles de Transformación**
- `G`: Modo de traslación (translate)
- `R`: Modo de rotación (rotate)
- `S`: Modo de escala (scale)

### 2. **Gestión de Selección**
- `ESC`: Deseleccionar entidad y resetear modo
- `DEL/BACKSPACE`: Eliminar entidad seleccionada

### 3. **Controles de Cámara**
- `WASD`: Movimiento de cámara (delegado a useCameraControls)
- `Q/E`: Movimiento vertical
- `Shift`: Movimiento rápido
- `Espacio`: Funciones adicionales

### 4. **Filtrado de Inputs**
- Ignora teclas cuando se está escribiendo en inputs
- Prevención de conflictos con formularios

## Estructura del Código

### Hook Principal
```typescript
export function useKeyboardShortcuts() {
  const { 
    setTransformMode, 
    selectEntity, 
    removeObject, 
    removeEffectZone, 
    selectedEntityId,
    objects,
    effectZones 
  } = useWorldStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Lógica de manejo de teclas
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [dependencies]);
}
```

### Manejo de Eventos
```typescript
const handleKeyDown = (event: KeyboardEvent) => {
  // Solo procesar si no estamos escribiendo en un input
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
    return;
  }

  switch (event.key.toLowerCase()) {
    // Casos de teclas
  }
};
```

## Atajos Implementados

### 1. **Controles de Transformación**

#### `G` - Modo de Traslación
```typescript
case 'g':
  event.preventDefault();
  setTransformMode('translate');
  break;
```

#### `R` - Modo de Rotación
```typescript
case 'r':
  event.preventDefault();
  setTransformMode('rotate');
  break;
```

#### `S` - Modo de Escala
```typescript
case 's':
  event.preventDefault();
  setTransformMode('scale');
  break;
```

### 2. **Gestión de Selección**

#### `ESC` - Deseleccionar
```typescript
case 'escape':
  event.preventDefault();
  selectEntity(null);
  setTransformMode('translate');
  break;
```

#### `DEL/BACKSPACE` - Eliminar Entidad
```typescript
case 'delete':
case 'backspace':
  event.preventDefault();
  if (selectedEntityId) {
    // Buscar si es un objeto sonoro
    const soundObject = objects.find(obj => obj.id === selectedEntityId);
    if (soundObject) {
      removeObject(selectedEntityId);
      console.log(`🗑️ Objeto sonoro eliminado: ${selectedEntityId}`);
    } else {
      // Buscar si es una zona de efecto
      const effectZone = effectZones.find(zone => zone.id === selectedEntityId);
      if (effectZone) {
        removeEffectZone(selectedEntityId);
        console.log(`🗑️ Zona de efecto eliminada: ${selectedEntityId}`);
      }
    }
  }
  break;
```

### 3. **Controles de Cámara (Delegados)**

#### `WASD` - Movimiento de Cámara
```typescript
case 'w':
case 'a':
case 's':
case 'd':
case 'q':
case 'e':
case 'shift':
case ' ':
  // No hacer preventDefault para permitir que useCameraControls los maneje
  break;
```

## Filtrado de Inputs

### Prevención de Conflictos
```typescript
// Solo procesar si no estamos escribiendo en un input
if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
  return;
}
```

### Tipos de Elementos Filtrados
- `HTMLInputElement`: Campos de entrada
- `HTMLTextAreaElement`: Áreas de texto
- Otros elementos de formulario

## Gestión de Estado

### Dependencias del Hook
```typescript
const { 
  setTransformMode,     // Cambiar modo de transformación
  selectEntity,         // Seleccionar/deseleccionar entidad
  removeObject,         // Eliminar objeto sonoro
  removeEffectZone,     // Eliminar zona de efecto
  selectedEntityId,     // ID de entidad seleccionada
  objects,              // Lista de objetos sonoros
  effectZones           // Lista de zonas de efectos
} = useWorldStore();
```

### Dependencias del useEffect
```typescript
useEffect(() => {
  // Lógica del hook
}, [setTransformMode, selectEntity, removeObject, removeEffectZone, selectedEntityId, objects, effectZones]);
```

## Lógica de Eliminación

### Búsqueda de Entidad
```typescript
if (selectedEntityId) {
  // Buscar si es un objeto sonoro
  const soundObject = objects.find(obj => obj.id === selectedEntityId);
  if (soundObject) {
    removeObject(selectedEntityId);
  } else {
    // Buscar si es una zona de efecto
    const effectZone = effectZones.find(zone => zone.id === selectedEntityId);
    if (effectZone) {
      removeEffectZone(selectedEntityId);
    }
  }
}
```

### Tipos de Entidades Soportadas
- **Objetos Sonoros**: Eliminados con `removeObject()`
- **Zonas de Efectos**: Eliminadas con `removeEffectZone()`
- **Objetos Móviles**: No implementado aún

## Prevención de Eventos

### preventDefault()
```typescript
event.preventDefault();
```

### Teclas que Prevenen Default
- `G`, `R`, `S`: Controles de transformación
- `ESC`: Deseleccionar
- `DEL`, `BACKSPACE`: Eliminar

### Teclas que NO Prevenen Default
- `WASD`: Controles de cámara
- `Q`, `E`: Movimiento vertical
- `Shift`, `Espacio`: Controles adicionales

## Gestión de Eventos

### Registro de Eventos
```typescript
window.addEventListener('keydown', handleKeyDown);
```

### Limpieza de Eventos
```typescript
return () => {
  window.removeEventListener('keydown', handleKeyDown);
};
```

### Alcance Global
- Eventos registrados en `window`
- Disponibles en toda la aplicación
- Limpieza automática al desmontar

## Dependencias

### Store Global
- `useWorldStore`: Estado y acciones del mundo

### Hooks Internos
- `useEffect`: Gestión del ciclo de vida
- `useState`: No se usa directamente

## Relaciones con Otros Archivos

### Archivos que lo Usan
- `src/app/page.tsx`: Inicialización en la página principal

### Archivos que Usa
- `src/state/useWorldStore.ts`: Estado y acciones

### Hooks Relacionados
- `useCameraControls`: Controles de cámara WASD
- `useAudioListener`: Listener de audio

## Consideraciones de Rendimiento

### 1. **Eventos Eficientes**
- Un solo listener global
- Filtrado temprano de inputs
- Prevención de eventos innecesarios

### 2. **Gestión de Memoria**
- Limpieza automática de listeners
- Dependencias optimizadas
- Prevención de memory leaks

### 3. **Responsividad**
- Eventos de teclado inmediatos
- Sin delays o throttling
- Respuesta instantánea

## Uso en la Aplicación

### Inicialización
```typescript
// En src/app/page.tsx
export default function Home() {
  useKeyboardShortcuts();
  
  return (
    // JSX de la aplicación
  );
}
```

### Funcionamiento
- Se inicializa una vez en la página principal
- Disponible globalmente
- No requiere props o configuración

## Notas para Desarrollo

### 1. **Extensibilidad**
- Fácil adición de nuevos atajos
- Sistema modular de teclas
- Configuración centralizada

### 2. **Testing**
- Probar cada atajo individualmente
- Verificar filtrado de inputs
- Validar prevención de eventos

### 3. **Debugging**
- Logs descriptivos para eliminación
- Verificación de entidades seleccionadas
- Manejo de errores

## Mejoras Futuras

1. **Configuración**: Atajos personalizables
2. **Contexto**: Atajos específicos por modo
3. **Visualización**: Indicadores de atajos disponibles
4. **Métricas**: Estadísticas de uso
5. **Accesibilidad**: Soporte para lectores de pantalla

## Casos de Uso

### Flujo de Trabajo Típico
1. **Seleccionar entidad**: Clic en objeto
2. **Cambiar modo**: `G` para traslación
3. **Transformar**: Usar controles 3D
4. **Cambiar modo**: `R` para rotación
5. **Deseleccionar**: `ESC` o clic en vacío

### Eliminación Rápida
1. **Seleccionar entidad**: Clic en objeto
2. **Eliminar**: `DEL` o `BACKSPACE`
3. **Confirmación**: Log en consola








