# 🎵 Sistema de Audio - Casa de Salomón

## Descripción General

El sistema de audio de la Casa de Salomón utiliza **Tone.js** para crear objetos sonoros 3D interactivos. Cada objeto puede reproducir sonidos con parámetros configurables y efectos de audio.

## 🚨 Problema del AudioContext

### ¿Por qué ocurre el error?

Los navegadores modernos (Chrome, Firefox, Safari) requieren una **interacción del usuario** antes de permitir que se inicie el contexto de audio. Esto es una medida de seguridad para evitar autoplay no deseado.

**Error típico:**
```
The AudioContext was not allowed to start. It must be resumed (or created) after a user gesture on the page.
```

### ✅ Solución Implementada

Hemos creado un sistema que maneja esto automáticamente:

1. **Hook `useAudioContext`**: Gestiona el estado del AudioContext
2. **Botón de inicialización**: Permite al usuario activar el audio
3. **Inicialización automática**: Se activa cuando se intenta reproducir sonido

## 🏗️ Arquitectura del Sistema

### Hooks Principales

#### `useAudioContext`
```typescript
const { 
  isAudioContextStarted,    // Estado del contexto
  startAudioContext,        // Función para iniciar
  checkAudioContextState,   // Verificar estado
  suspendAudioContext,      // Pausar contexto
  resumeAudioContext        // Reanudar contexto
} = useAudioContext();
```

#### `useObjectAudio`
```typescript
const { 
  isPlaying,           // Estado de reproducción
  triggerAttack,       // Iniciar sonido
  triggerRelease,      // Detener sonido
  updateParams         // Actualizar parámetros
} = useObjectAudio('cube', audioParams);
```

### Componentes

#### `AudioInitButton`
- Botón para inicializar el contexto de audio
- Muestra el estado actual del audio
- Interfaz visual clara para el usuario

#### `AudioTestPanel`
- Panel completo de prueba de audio
- Controles para todos los parámetros
- Visualización del estado en tiempo real

#### `SoundCube`
- Cubo 3D con funcionalidad de audio
- Botón de prueba integrado
- Indicadores visuales de estado

## 🎯 Cómo Usar

### 1. Inicializar Audio
```typescript
// En cualquier componente
import { useAudioContext } from '../hooks/useAudioContext';

function MyComponent() {
  const { startAudioContext, isAudioContextStarted } = useAudioContext();
  
  const handleClick = async () => {
    if (!isAudioContextStarted) {
      await startAudioContext();
    }
  };
  
  return (
    <button onClick={handleClick}>
      {isAudioContextStarted ? 'Audio Activo' : 'Iniciar Audio'}
    </button>
  );
}
```

### 2. Crear Objeto Sonoro
```typescript
import { useObjectAudio } from '../hooks/useObjectAudio';

function SoundObject() {
  const audioParams = {
    frequency: 440,
    waveform: 'sine',
    volume: 0.5,
    reverb: 0.3,
    delay: 0.1,
  };
  
  const { triggerAttack, triggerRelease, isPlaying } = useObjectAudio('cube', audioParams);
  
  return (
    <div>
      <button onClick={triggerAttack}>▶️</button>
      <button onClick={triggerRelease}>⏹️</button>
      <span>{isPlaying ? 'Sonando' : 'Silencio'}</span>
    </div>
  );
}
```

### 3. Actualizar Parámetros
```typescript
const { updateParams } = useObjectAudio('cube', audioParams);

// Actualizar frecuencia
updateParams({ frequency: 880 });

// Actualizar múltiples parámetros
updateParams({ 
  frequency: 660, 
  volume: 0.8, 
  reverb: 0.5 
});
```

## 🔧 Parámetros de Audio

### Frecuencia
- **Rango**: 20 Hz - 20,000 Hz
- **Por defecto**: 440 Hz (La4)
- **Uso**: Controla el tono del sonido

### Forma de Onda
- **Opciones**: `sine`, `square`, `sawtooth`, `triangle`
- **Por defecto**: `sine`
- **Uso**: Define el timbre del sonido

### Volumen
- **Rango**: 0.0 - 1.0
- **Por defecto**: 0.5
- **Uso**: Controla la intensidad del sonido

### Reverb
- **Rango**: 0.0 - 1.0
- **Por defecto**: 0.3
- **Uso**: Añade espacio acústico

### Delay
- **Rango**: 0.0 - 1.0
- **Por defecto**: 0.1
- **Uso**: Crea ecos y repeticiones

## 🎨 Efectos Visuales

### Indicadores de Estado
- **🟢 Verde**: Audio activo
- **🔴 Rojo**: Audio inactivo
- **🟡 Amarillo**: Seleccionado
- **🔵 Azul**: Reproduciendo sonido

### Animaciones
- **Respiración**: El cubo se expande/contrae al sonar
- **Rotación**: Giro sutil durante la reproducción
- **Hover**: Escalado al pasar el mouse
- **Selección**: Wireframe dorado cuando está seleccionado

## 🚀 Mejores Prácticas

### 1. Inicialización
- Siempre verifica `isAudioContextStarted` antes de reproducir
- Usa `startAudioContext()` en respuesta a interacciones del usuario
- Maneja errores con try-catch

### 2. Gestión de Recursos
- Los sintetizadores se limpian automáticamente
- Usa `useCallback` para funciones que se pasan como props
- Evita recrear sintetizadores innecesariamente

### 3. Interfaz de Usuario
- Proporciona feedback visual claro
- Deshabilita controles cuando el audio no está disponible
- Muestra el estado actual del sistema

## 🐛 Solución de Problemas

### Audio no funciona
1. Verifica que el usuario haya hecho clic en algo
2. Asegúrate de que `isAudioContextStarted` sea `true`
3. Revisa la consola para errores de Tone.js

### Sonido distorsionado
1. Verifica que la frecuencia esté en rango (20-20000 Hz)
2. Ajusta el volumen (0.0-1.0)
3. Reduce los efectos de reverb y delay

### Rendimiento lento
1. Usa `suspendAudioContext()` cuando no se necesite audio
2. Limita el número de objetos sonoros simultáneos
3. Optimiza los parámetros de efectos

## 🔮 Próximas Características

- [ ] **Sincronización de tempo** entre objetos
- [ ] **Patrones de secuencia** predefinidos
- [ ] **Efectos de filtro** (lowpass, highpass, bandpass)
- [ ] **Modulación de frecuencia** (FM synthesis)
- [ ] **Grabación y exportación** de sesiones
- [ ] **Colaboración en tiempo real** entre usuarios

## 📚 Recursos Adicionales

- [Documentación de Tone.js](https://tonejs.github.io/)
- [Web Audio API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- [Zustand](https://github.com/pmndrs/zustand)

---

**Nota**: Este sistema está diseñado para funcionar en navegadores modernos con soporte para Web Audio API. Para compatibilidad con navegadores antiguos, considera usar polyfills o fallbacks.
