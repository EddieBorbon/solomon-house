# Documentación: `src/components/world/Experience.tsx`

## Propósito
Componente principal de la escena 3D que configura el Canvas de Three.js, maneja la cámara, iluminación, controles y sincronización con audio espacial, actuando como el punto de entrada del mundo 3D.

## Funcionalidades Principales

### 1. **Configuración del Canvas 3D**
- Canvas de Three.js con React Three Fiber
- Configuración de renderizado optimizada
- Sombras y efectos visuales

### 2. **Gestión de Cámara**
- Controles de órbita (OrbitControls)
- Controles WASD personalizados
- Sincronización con audio espacial

### 3. **Audio Espacial**
- Sincronización del listener con la cámara
- Actualización en tiempo real de posición
- Integración con AudioManager

### 4. **Iluminación y Ambiente**
- Configuración de luces
- Presets de ambiente
- Renderizado optimizado

### 5. **Contenido de Escena**
- Renderizado de objetos 3D
- Gestión de entidades
- Transformaciones interactivas

## Estructura del Código

### Componente Principal
```typescript
export function Experience() {
  const orbitControlsRef = useRef<any>(null);
  const [environmentPreset] = useState<EnvironmentPreset>('forest');
  const { currentProjectId } = useWorldStore();
  
  return (
    <div className="w-full h-screen">
      <RealtimeSyncStatus projectId={currentProjectId} />
      
      <Canvas
        camera={{ position: [5, 5, 5], fov: 75, near: 0.1, far: 1000 }}
        shadows
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        onCreated={({ gl, camera }) => {
          // Configuración del renderer
        }}
      >
        <CameraControllerInternal orbitControlsRef={orbitControlsRef} />
        <OrbitControls ref={orbitControlsRef} />
        <Environment preset={environmentPreset} />
        <SceneContent />
      </Canvas>
    </div>
  );
}
```

### Componente Interno de Cámara
```typescript
function CameraControllerInternal({ orbitControlsRef }: { orbitControlsRef: React.RefObject<any> }) {
  const { camera } = useThree();
  const { updateCameraPosition } = useCameraControls(camera, orbitControlsRef.current);
  
  // Inicializar espacialización de audio
  useAudioListener();
  
  const forwardVector = useRef(new THREE.Vector3());
  
  useFrame(({ camera }) => {
    // Actualizar posición de cámara
    if (orbitControlsRef.current) {
      updateCameraPosition(camera, orbitControlsRef.current);
    }
    
    // Actualizar listener de audio
    const position = camera.position;
    camera.getWorldDirection(forwardVector.current);
    audioManager.updateListener(position, forwardVector.current);
  });
  
  return null;
}
```

## Configuración del Canvas

### Configuración de Cámara
```typescript
camera={{
  position: [5, 5, 5],  // Posición inicial
  fov: 75,              // Campo de visión
  near: 0.1,            // Plano cercano
  far: 1000             // Plano lejano
}}
```

### Configuración de Renderizado
```typescript
gl={{
  antialias: true,                    // Antialiasing
  alpha: false,                       // Transparencia
  powerPreference: "high-performance", // Preferencia de rendimiento
  preserveDrawingBuffer: false,       // Buffer de dibujo
  failIfMajorPerformanceCaveat: false // Fallar si hay problemas de rendimiento
}}
```

### Configuración de Sombras
```typescript
shadows  // Habilitar sombras
```

## Configuración del Renderer

### Configuración Inicial
```typescript
onCreated={({ gl, camera }) => {
  // Color de fondo
  gl.setClearColor('#f0f0f0', 1);
  
  // Configuración de sombras
  gl.shadowMap.enabled = true;
  gl.shadowMap.type = 2; // PCFSoftShadowMap
  
  // Tone mapping
  gl.toneMapping = 2; // ACESFilmicToneMapping
  gl.toneMappingExposure = 1.2;
  
  // Color space
  gl.outputColorSpace = 'srgb';
  
  // Guardar referencia a la cámara
  if (orbitControlsRef.current) {
    orbitControlsRef.current.camera = camera;
  }
}}
```

## Controles de Cámara

### OrbitControls
```typescript
<OrbitControls 
  ref={orbitControlsRef}
  enablePan={true}
  enableZoom={true}
  enableRotate={true}
  enableDamping={true}
  dampingFactor={0.05}
  screenSpacePanning={false}
  minDistance={1}
  maxDistance={100}
  maxPolarAngle={Math.PI}
  minPolarAngle={0}
  maxAzimuthAngle={Infinity}
  minAzimuthAngle={-Infinity}
  enableKeys={true}
  keys={{
    LEFT: 'ArrowLeft',
    UP: 'ArrowUp',
    RIGHT: 'ArrowRight',
    BOTTOM: 'ArrowDown'
  }}
  mouseButtons={{
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.PAN
  }}
  touches={{
    ONE: THREE.TOUCH.ROTATE,
    TWO: THREE.TOUCH.DOLLY_PAN
  }}
/>
```

### Controles WASD Personalizados
- Integración con `useCameraControls`
- Movimiento libre en 3D
- Sincronización con audio

## Audio Espacial

### Sincronización del Listener
```typescript
useFrame(({ camera }) => {
  // Obtener posición actual de la cámara
  const position = camera.position;
  
  // Calcular vector "hacia adelante"
  camera.getWorldDirection(forwardVector.current);
  
  // Actualizar listener de audio
  audioManager.updateListener(position, forwardVector.current);
});
```

### Hooks de Audio
- `useAudioListener()`: Inicialización del listener
- `useCameraControls()`: Controles de cámara
- Integración con `AudioManager`

## Iluminación y Ambiente

### Environment
```typescript
<Environment preset={environmentPreset} />
```

### Presets Disponibles
- `forest`: Bosque
- `sunset`: Atardecer
- `dawn`: Amanecer
- `night`: Noche
- `warehouse`: Almacén
- `apartment`: Apartamento
- `studio`: Estudio
- `city`: Ciudad
- `park`: Parque
- `lobby`: Vestíbulo

## Contenido de Escena

### SceneContent
```typescript
<SceneContent />
```

- Renderizado de objetos sonoros
- Objetos móviles
- Zonas de efectos
- Transformaciones interactivas

## Sincronización en Tiempo Real

### RealtimeSyncStatus
```typescript
<RealtimeSyncStatus projectId={currentProjectId} />
```

- Estado de conexión
- Sincronización con Firebase
- Indicadores de estado

## Dependencias

### React Three Fiber
- `Canvas`: Canvas principal
- `useFrame`: Loop de renderizado
- `useThree`: Acceso al contexto 3D

### React Three Drei
- `OrbitControls`: Controles de cámara
- `Environment`: Iluminación ambiental

### Hooks Personalizados
- `useCameraControls`: Controles WASD
- `useAudioListener`: Listener de audio

### Store Global
- `useWorldStore`: Estado del mundo

## Relaciones con Otros Archivos

### Archivos que lo Usan
- `src/app/page.tsx`: Renderizado en la página principal

### Archivos que Usa
- `src/components/world/SceneContent.tsx`: Contenido de escena
- `src/hooks/useCameraControls.ts`: Controles de cámara
- `src/hooks/useAudioListener.ts`: Listener de audio
- `src/lib/AudioManager.ts`: Gestión de audio
- `src/state/useWorldStore.ts`: Estado global

## Consideraciones de Rendimiento

### 1. **Renderizado Optimizado**
- `useFrame` para actualizaciones eficientes
- Referencias para evitar recreaciones
- Configuración de renderer optimizada

### 2. **Gestión de Memoria**
- Limpieza automática de recursos
- Prevención de memory leaks
- Optimización de objetos 3D

### 3. **Audio en Tiempo Real**
- Actualización eficiente del listener
- Sincronización con movimiento de cámara
- Optimización de cálculos espaciales

## Uso en la Aplicación

### Renderizado
```typescript
<Experience />
```

### Integración
- Se renderiza en la página principal
- Ocupa toda la pantalla
- Superpuesto con UI

## Notas para Desarrollo

### 1. **Configuración de Renderer**
- Ajustar parámetros según necesidades
- Optimizar para diferentes dispositivos
- Balance entre calidad y rendimiento

### 2. **Audio Espacial**
- Sincronización crítica con cámara
- Actualización en tiempo real
- Prevención de desfases

### 3. **Testing**
- Probar en diferentes dispositivos
- Verificar rendimiento
- Validar sincronización de audio

## Mejoras Futuras

1. **LOD System**: Level of Detail para objetos
2. **Frustum Culling**: Culling de objetos fuera de vista
3. **Instanced Rendering**: Renderizado instanciado
4. **Métricas**: Monitoreo de rendimiento
5. **Configuración**: Parámetros personalizables






