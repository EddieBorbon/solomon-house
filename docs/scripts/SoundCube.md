# Documentación: `src/components/sound-objects/SoundCube.tsx`

## Propósito
Componente React Three Fiber que representa un objeto sonoro cúbico con sintetizador AMSynth, proporcionando interacción táctil, feedback visual y sincronización con el sistema de audio.

## Funcionalidades Principales

### 1. **Renderizado 3D**
- Geometría de cubo con material PBR
- Animaciones de pulso y color
- Indicadores visuales de estado

### 2. **Interacción de Audio**
- Clic corto: Trigger de nota (attack-release)
- Clic sostenido: Gate (sostenido)
- Liberación: Stop del gate

### 3. **Feedback Visual**
- Animación de pulso al hacer clic
- Cambio de color basado en energía
- Indicador de selección
- Indicador de audio activo

### 4. **Sintetizador AMSynth**
- Modulación de amplitud
- Parámetros configurables
- Sincronización con AudioManager

## Estructura del Código

### Interface de Props
```typescript
interface SoundCubeProps {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  isSelected: boolean;
  audioEnabled: boolean;
  audioParams: {
    frequency: number;
    volume: number;
    waveform: OscillatorType;
    harmonicity?: number;
    modulationWaveform?: OscillatorType;
    duration?: number;
  };
}
```

### Componente Principal
```typescript
export const SoundCube = forwardRef<Group, SoundCubeProps>(({
  id,
  position,
  rotation,
  scale,
  isSelected,
  audioEnabled,
  audioParams,
}, ref) => {
  // Lógica del componente
});
```

## Referencias y Estado

### Referencias
```typescript
const meshRef = useRef<Mesh>(null);
const materialRef = useRef<MeshStandardMaterial>(null);
const energyRef = useRef(0); // Para animación de clic
```

### Hooks del Store
```typescript
const { 
  triggerObjectNote, 
  selectEntity, 
  triggerObjectAttackRelease, 
  startObjectGate, 
  stopObjectGate 
} = useWorldStore();
```

## Manejadores de Eventos

### 1. **Clic Corto (Trigger)**
```typescript
const handleClick = (event: any) => {
  event.stopPropagation();
  selectEntity(id);
  triggerObjectAttackRelease(id);
  
  // Activar animación de clic
  energyRef.current = 1;
};
```

### 2. **Clic Sostenido (Gate)**
```typescript
const handlePointerDown = (event: any) => {
  event.stopPropagation();
  startObjectGate(id);
  
  // Activar animación de gate
  energyRef.current = 1;
};
```

### 3. **Liberación de Clic**
```typescript
const handlePointerUp = (event: any) => {
  event.stopPropagation();
  stopObjectGate(id);
};
```

### 4. **Salida del Puntero**
```typescript
const handlePointerLeave = (event: any) => {
  event.stopPropagation();
  stopObjectGate(id);
};
```

## Animaciones y Efectos Visuales

### Animación de Pulso
```typescript
useFrame((state, delta) => {
  if (!meshRef.current || !materialRef.current || !audioParams) return;

  // Decaer la energía del clic/gate
  if (energyRef.current > 0) {
    // Calcular velocidad de decaimiento basada en duración del sonido
    const duration = audioParams?.duration;
    let decayRate = 0.9; // Decaimiento por defecto
    
    if (duration && duration !== Infinity) {
      // Ajustar velocidad de decaimiento para coincidir con duración del sonido
      decayRate = Math.pow(0.1, delta / duration);
    }
    
    energyRef.current *= decayRate;
    
    // Aplicar energía como escala pulsante
    const pulseScale = 1 + energyRef.current * 0.2;
    meshRef.current.scale.set(pulseScale, pulseScale, pulseScale);
    
    // Cambiar color basado en energía
    const intensity = energyRef.current;
    const blueColor = new Color(0.3, 0.8 + intensity * 0.2, 0.8 + intensity * 0.2);
    materialRef.current.color.copy(blueColor);
  }
});
```

### Indicadores Visuales
```typescript
// Color base basado en estado
const baseColor = isSelected ? '#ff6b6b' : '#4ecdc4';
const audioColor = audioEnabled ? '#4ecdc4' : '#666666';
const finalColor = isSelected ? '#ff6b6b' : audioColor;
```

## Renderizado 3D

### Geometría y Material
```typescript
<group ref={ref} position={position} rotation={rotation} scale={scale}>
  <mesh
    ref={meshRef}
    onClick={handleClick}
    onPointerDown={handlePointerDown}
    onPointerUp={handlePointerUp}
    onPointerLeave={handlePointerLeave}
  >
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial
      ref={materialRef}
      color={finalColor}
      metalness={0.3}
      roughness={0.4}
      emissive={isSelected ? '#ff6b6b' : '#000000'}
      emissiveIntensity={isSelected ? 0.3 : 0}
    />
  </mesh>
</group>
```

### Características del Material
- **Color**: Azul base, rojo cuando seleccionado
- **Metalness**: 0.3 para apariencia metálica
- **Roughness**: 0.4 para superficie semi-pulida
- **Emissive**: Brillo cuando está seleccionado
- **EmissiveIntensity**: Intensidad del brillo

## Sintetizador AMSynth

### Características
- **Tipo**: Modulación de amplitud
- **Oscilador**: Seno, cuadrada, sierra, triangular
- **Modulación**: Oscilador independiente
- **Parámetros**: Frecuencia, volumen, harmonicity

### Parámetros de Audio
```typescript
audioParams: {
  frequency: number;           // Frecuencia base
  volume: number;             // Nivel de volumen
  waveform: OscillatorType;   // Forma de onda
  harmonicity?: number;       // Relación de modulación
  modulationWaveform?: OscillatorType; // Forma de onda de modulación
  duration?: number;          // Duración del sonido
}
```

## Integración con AudioManager

### Acciones de Audio
- `triggerObjectAttackRelease(id)`: Disparar nota con attack-release
- `startObjectGate(id)`: Iniciar sonido sostenido
- `stopObjectGate(id)`: Detener sonido sostenido
- `selectEntity(id)`: Seleccionar objeto

### Sincronización
- Parámetros de audio se sincronizan automáticamente
- Posición 3D se actualiza en tiempo real
- Estado de audio se refleja visualmente

## Dependencias

### React Three Fiber
- `useFrame`: Loop de animación
- `forwardRef`: Referencia al grupo
- `Mesh`, `Group`: Objetos 3D

### Three.js
- `MeshStandardMaterial`: Material PBR
- `Color`: Gestión de colores

### Store Global
- `useWorldStore`: Estado y acciones

## Relaciones con Otros Archivos

### Archivos que lo Usan
- `src/components/world/SceneContent.tsx`: Renderizado en escena

### Archivos que Usa
- `src/state/useWorldStore.ts`: Estado y acciones

### Componentes Relacionados
- Otros objetos sonoros (SoundSphere, SoundCylinder, etc.)
- TransformControls para manipulación

## Consideraciones de Rendimiento

### 1. **Animaciones Eficientes**
- `useFrame` para animaciones suaves
- Decaimiento exponencial para energía
- Reducción de cálculos innecesarios

### 2. **Gestión de Memoria**
- Referencias para evitar recreaciones
- Limpieza automática de recursos
- Prevención de memory leaks

### 3. **Renderizado Optimizado**
- Material reutilizable
- Geometría estática
- Actualizaciones condicionales

## Uso en la Aplicación

### Renderizado
```typescript
<SoundCube
  id={object.id}
  position={object.position}
  rotation={object.rotation}
  scale={object.scale}
  isSelected={object.isSelected}
  audioEnabled={object.audioEnabled}
  audioParams={object.audioParams}
/>
```

### Integración
- Se renderiza en SceneContent
- Interactúa con TransformControls
- Sincroniza con AudioManager

## Notas para Desarrollo

### 1. **Interacción**
- Eventos de puntero para diferentes tipos de clic
- Prevención de propagación de eventos
- Feedback visual inmediato

### 2. **Animaciones**
- Decaimiento exponencial para suavidad
- Sincronización con duración del sonido
- Colores dinámicos basados en estado

### 3. **Testing**
- Probar interacciones de clic
- Verificar sincronización de audio
- Validar animaciones

## Mejoras Futuras

1. **Partículas**: Efectos de partículas al hacer clic
2. **Sombras**: Sombras dinámicas
3. **Texturas**: Texturas personalizables
4. **Métricas**: Monitoreo de interacciones
5. **Accesibilidad**: Indicadores para usuarios con discapacidades

## Casos de Uso

### Flujo de Interacción Típico
1. **Hover**: Objeto se ilumina
2. **Clic corto**: Dispara nota, animación de pulso
3. **Clic sostenido**: Sonido sostenido, pulso continuo
4. **Liberación**: Para sonido, decaimiento de animación
5. **Selección**: Cambio de color a rojo

### Estados Visuales
- **Normal**: Azul base, sin brillo
- **Seleccionado**: Rojo, con brillo
- **Audio activo**: Azul, con pulso
- **Audio inactivo**: Gris, sin pulso







