# Documentación: `src/hooks/useCameraControls.ts`

## Propósito
Hook personalizado para gestionar controles de cámara 3D mediante teclado. Permite el movimiento libre de la cámara en un espacio 3D usando las teclas WASD y controles adicionales para movimiento vertical y rápido.

## Funcionalidades Principales

### 1. Controles de Movimiento Básicos
- **W**: Movimiento hacia adelante
- **S**: Movimiento hacia atrás
- **A**: Movimiento hacia la izquierda
- **D**: Movimiento hacia la derecha
- **Q**: Movimiento hacia abajo
- **E**: Movimiento hacia arriba
- **Shift**: Modificador de velocidad rápida

### 2. Gestión de Estado de Controles
- Rastrea el estado de cada tecla (presionada/suelta)
- Maneja eventos de teclado de forma eficiente
- Evita conflictos con campos de entrada de texto

### 3. Cálculo de Movimiento 3D
- Calcula vectores de dirección basados en la orientación de la cámara
- Aplica movimiento relativo a la cámara y al target
- Sincroniza movimiento de cámara y controles de órbita

## Estructura del Código

```typescript
interface CameraControls {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  fast: boolean;
}

export function useCameraControls(camera: THREE.Camera | null, orbitControls: any) {
  const controls = useRef<CameraControls>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
    fast: false,
  });

  const moveSpeed = useRef(0.1);
  const fastMoveSpeed = useRef(0.3);

  // ... lógica de eventos de teclado y movimiento
}
```

## Dependencias

### Externas
- `react`: Para hooks y manejo de estado
- `three`: Para tipos de cámara y vectores 3D

### Internas
- Ninguna dependencia interna específica

## Parámetros de Entrada

### `camera: THREE.Camera | null`
- Cámara de Three.js a controlar
- Puede ser PerspectiveCamera, OrthographicCamera, etc.
- Se valida antes de aplicar movimiento

### `orbitControls: any`
- Controles de órbita de Three.js (OrbitControls)
- Usado para sincronizar el target con el movimiento de la cámara
- Puede ser null si no se usan controles de órbita

## Configuración de Velocidades

### Velocidades Base
```typescript
const moveSpeed = useRef(0.1);        // Velocidad normal
const fastMoveSpeed = useRef(0.3);    // Velocidad con Shift
```

### Factores de Velocidad
- **Normal**: 0.1 unidades por frame
- **Rápido**: 0.3 unidades por frame (3x más rápido)
- Configurables mediante refs para ajuste dinámico

## Mapeo de Teclas

### Teclas de Movimiento
| Tecla | Función | Vector Aplicado |
|-------|---------|-----------------|
| W | Adelante | `cameraDirection` |
| S | Atrás | `-cameraDirection` |
| A | Izquierda | `-cameraRight` |
| D | Derecha | `cameraRight` |
| Q | Abajo | `-cameraUp` |
| E | Arriba | `cameraUp` |
| Shift | Velocidad rápida | Multiplicador de velocidad |

### Excepciones de Input
- No procesa eventos cuando el foco está en `<input>` o `<textarea>`
- Evita interferir con la entrada de texto del usuario

## Cálculo de Vectores de Movimiento

### Vectores Base
```typescript
// Dirección de la cámara
const cameraDirection = new THREE.Vector3();
camera.getWorldDirection(cameraDirection);

// Vector hacia arriba
const cameraUp = new THREE.Vector3(0, 1, 0);

// Vector hacia la derecha (perpendicular)
const cameraRight = new THREE.Vector3();
cameraRight.crossVectors(cameraDirection, cameraUp).normalize();
```

### Aplicación de Movimiento
```typescript
// Movimiento hacia adelante
if (controls.current.forward) {
  camera.position.addScaledVector(cameraDirection, currentSpeed);
  if (orbitControls.target) {
    orbitControls.target.addScaledVector(cameraDirection, currentSpeed);
  }
}
```

## Gestión de Eventos

### Event Listeners
```typescript
useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    // Verificar si no está en input/textarea
    if (event.target instanceof HTMLInputElement || 
        event.target instanceof HTMLTextAreaElement) {
      return;
    }
    
    // Actualizar estado de controles
    switch (event.key.toLowerCase()) {
      case 'w': controls.current.forward = true; break;
      // ... otros casos
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  return () => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
  };
}, []);
```

### Limpieza de Eventos
- Remueve event listeners al desmontar
- Previene memory leaks
- Limpia referencias correctamente

## Función de Actualización de Posición

### `updateCameraPosition`
```typescript
const updateCameraPosition = (camera: THREE.Camera, orbitControls: any) => {
  if (!camera || !orbitControls) return;
  
  const currentSpeed = controls.current.fast ? fastMoveSpeed.current : moveSpeed.current;
  
  // Aplicar movimiento según controles activos
  // Actualizar tanto cámara como target de órbita
  // Llamar orbitControls.update() para aplicar cambios
};
```

### Características
- Valida entrada antes de procesar
- Calcula velocidad dinámicamente
- Sincroniza cámara y controles de órbita
- Actualiza controles al final

## Debug y Logging

### Información de Debug
```typescript
const hasActiveControls = Object.values(controls.current).some(Boolean);
if (hasActiveControls) {
  console.log('🎮 Controles de cámara activos:', controls.current);
}
```

### Logging Condicional
- Solo muestra logs cuando hay controles activos
- Incluye estado completo de controles
- Ayuda a debuggear problemas de movimiento

## Uso en la Aplicación

### Importación
```typescript
import { useCameraControls } from '../hooks/useCameraControls';
```

### Implementación Básica
```typescript
function CameraController({ camera, orbitControls }) {
  const { updateCameraPosition } = useCameraControls(camera, orbitControls);
  
  useFrame(() => {
    updateCameraPosition(camera, orbitControls);
  });
  
  return null;
}
```

### Integración con React Three Fiber
```typescript
function Scene() {
  const cameraRef = useRef();
  const orbitControlsRef = useRef();
  const { updateCameraPosition } = useCameraControls(cameraRef.current, orbitControlsRef.current);
  
  useFrame(() => {
    if (cameraRef.current && orbitControlsRef.current) {
      updateCameraPosition(cameraRef.current, orbitControlsRef.current);
    }
  });
  
  return (
    <>
      <PerspectiveCamera ref={cameraRef} />
      <OrbitControls ref={orbitControlsRef} camera={cameraRef.current} />
    </>
  );
}
```

## Consideraciones de Rendimiento

### Optimizaciones
1. **useRef para Estado**: Evita re-renderizados innecesarios
2. **Event Listeners Globales**: Eficientes para input de teclado
3. **Validación Temprana**: Retorna temprano si no hay cámara
4. **Cálculo Condicional**: Solo calcula cuando hay controles activos

### Mejores Prácticas
- Llamar `updateCameraPosition` en `useFrame` de React Three Fiber
- Validar referencias antes de usar
- Limpiar event listeners correctamente

## Relaciones con Otros Archivos

### Archivos Relacionados
- `CameraController.tsx`: Componente que usa este hook
- `Experience.tsx`: Escena principal que integra controles
- `OrbitControls`: Controles de órbita de Three.js

### Dependencias
- Requiere cámara de Three.js válida
- Opcionalmente requiere OrbitControls
- Compatible con React Three Fiber

## Configuración Avanzada

### Personalización de Velocidades
```typescript
// Modificar velocidades dinámicamente
moveSpeed.current = 0.2;        // Velocidad normal más rápida
fastMoveSpeed.current = 0.5;    // Velocidad rápida más rápida
```

### Agregar Nuevos Controles
```typescript
// Extender interface CameraControls
interface CameraControls {
  // ... controles existentes
  customAction: boolean;
}

// Agregar en handleKeyDown
case 'space': controls.current.customAction = true; break;
```

## Troubleshooting

### Problemas Comunes
1. **Cámara no se mueve**: Verificar que `updateCameraPosition` se llame en `useFrame`
2. **Movimiento muy lento/rápido**: Ajustar `moveSpeed` y `fastMoveSpeed`
3. **Conflicto con inputs**: Verificar que la validación de input funcione

### Soluciones
1. Asegurar que la cámara y orbitControls sean válidos
2. Verificar que los event listeners se registren correctamente
3. Comprobar los logs de debug para confirmar controles activos

## Ejemplo de Uso Completo

```typescript
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useCameraControls } from '../hooks/useCameraControls';

function CameraSystem() {
  const cameraRef = useRef();
  const orbitControlsRef = useRef();
  const { updateCameraPosition } = useCameraControls(
    cameraRef.current, 
    orbitControlsRef.current
  );
  
  useFrame(() => {
    if (cameraRef.current && orbitControlsRef.current) {
      updateCameraPosition(cameraRef.current, orbitControlsRef.current);
    }
  });
  
  return (
    <>
      <PerspectiveCamera 
        ref={cameraRef}
        position={[0, 0, 5]}
        fov={75}
      />
      <OrbitControls 
        ref={orbitControlsRef}
        camera={cameraRef.current}
        enableDamping={true}
        dampingFactor={0.05}
      />
    </>
  );
}
```
