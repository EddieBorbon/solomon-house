# 🎮 Sistema de Interacción Universal - Solomon House

## 📋 Resumen

Este documento describe el sistema de interacción universal implementado en Solomon House, que permite que todos los objetos sonoros soporten tres tipos de interacción por defecto:

1. **Clic corto (trigger)** - Reproduce una nota con duración configurable
2. **Clic sostenido (gate)** - Mantiene el sonido mientras se presiona
3. **Sonido continuo (toggle)** - Activa/desactiva el sonido permanente desde la UI

## 🏗️ Arquitectura del Sistema

### Componentes Principales

#### 1. AudioManager.ts
- **Método `triggerAttackRelease(id, params)`**: Para interacción de clic corto
- **Método `startSound(id, params)`**: Para clic sostenido y sonido continuo
- **Método `stopSound(id)`**: Para detener sonidos
- **Soporte universal**: Funciona con todos los tipos de sintetizadores de Tone.js

#### 2. useWorldStore.ts
- **`triggerObjectAttackRelease(id)`**: Dispara nota con duración específica
- **`startObjectGate(id)`**: Inicia el gate (clic sostenido)
- **`stopObjectGate(id)`**: Detiene el gate
- **`toggleObjectAudio(id)`**: Gestiona el sonido continuo

#### 3. Componentes de Objeto
- **Manejadores de eventos universales**: `onClick`, `onPointerDown`, `onPointerUp`, `onPointerLeave`
- **Animación reactiva**: Basada en el estado de audio y la interacción del usuario
- **Indicadores visuales**: Para selección y estado de audio

#### 4. ParameterEditor.tsx
- **Control de duración**: Slider para configurar la duración de las notas
- **Botón de audio**: Para activar/desactivar el sonido continuo
- **Información de interacción**: Explica los diferentes modos de uso

## 🎯 Tipos de Interacción

### 1. Clic Corto (Trigger)
```typescript
onClick={handleClick}
```
- **Comportamiento**: Reproduce una nota con la duración configurada en `audioParams.duration`
- **Uso**: Para notas percusivas y melodías
- **Duración**: Configurable desde 0.1s hasta ∞ (infinito)

### 2. Clic Sostenido (Gate)
```typescript
onPointerDown={handlePointerDown}
onPointerUp={handlePointerUp}
onPointerLeave={handlePointerLeave}
```
- **Comportamiento**: Mantiene el sonido mientras se presiona el botón
- **Uso**: Para efectos de sustain y control de duración manual
- **Condición**: Solo funciona si `audioEnabled === false`

### 3. Sonido Continuo (Toggle)
```typescript
// Controlado desde la UI
toggleObjectAudio(id)
```
- **Comportamiento**: Activa/desactiva el sonido permanente del objeto
- **Uso**: Para drones, pads y sonidos ambientales
- **Indicador**: Esfera verde sobre el objeto cuando está activo

## 🔧 Implementación en Componentes

### Estructura Básica
```typescript
import { useWorldStore } from '../../state/useWorldStore';

export const SoundObject = forwardRef<Group, SoundObjectProps>(({
  id, position, isSelected, audioEnabled, audioParams
}, ref) => {
  const { 
    selectObject, 
    triggerObjectAttackRelease, 
    startObjectGate, 
    stopObjectGate 
  } = useWorldStore();

  // Manejadores de eventos
  const handleClick = (event: any) => {
    event.stopPropagation();
    selectObject(id);
    triggerObjectAttackRelease(id);
  };

  const handlePointerDown = (event: any) => {
    event.stopPropagation();
    startObjectGate(id);
  };

  const handlePointerUp = (event: any) => {
    event.stopPropagation();
    stopObjectGate(id);
  };

  const handlePointerLeave = (event: any) => {
    event.stopPropagation();
    stopObjectGate(id);
  };

  return (
    <mesh
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
    >
      {/* Geometría del objeto */}
    </mesh>
  );
});
```

### Hooks Personalizados (Opcional)
Para facilitar la implementación, se proporcionan hooks personalizados:

```typescript
import { useUniversalInteraction, useReactiveAnimation } from './UniversalInteractionExample';

export const SoundObject = forwardRef<Group, SoundObjectProps>((props, ref) => {
  const interactionHandlers = useUniversalInteraction(id);
  const { triggerAnimation } = useReactiveAnimation(meshRef, materialRef, audioParams, audioEnabled);

  const handleClick = (event: any) => {
    interactionHandlers.handleClick(event);
    triggerAnimation();
  };

  // ... resto del componente
});
```

## 🎨 Animación Reactiva

### Sistema de Energía
```typescript
const energyRef = useRef(0);

useFrame((state, delta) => {
  if (energyRef.current > 0) {
    // Decaer la energía basada en la duración del sonido
    const duration = audioParams?.duration;
    let decayRate = 0.9;
    
    if (duration && duration !== Infinity) {
      decayRate = Math.pow(0.1, delta / duration);
    }
    
    energyRef.current *= decayRate;
    
    // Aplicar efectos visuales
    const pulseScale = 1 + energyRef.current * 0.2;
    meshRef.current.scale.setScalar(pulseScale);
    
    // Cambiar color y emisión
    materialRef.current.emissiveIntensity = energyRef.current * 0.3;
  }
});
```

### Efectos Visuales
- **Escala pulsante**: El objeto crece y decrece según la energía
- **Cambio de color**: Intensificación del color base durante la interacción
- **Emisión**: Brillo que varía con la intensidad del sonido
- **Efectos de audio**: Animaciones adicionales cuando `audioEnabled === true`

## 📱 Interfaz de Usuario

### ParameterEditor
- **Slider de duración**: Controla la duración de las notas de clic corto
- **Botón de audio**: Activa/desactiva el sonido continuo
- **Información de interacción**: Explica los tres modos de uso
- **Controles específicos**: Parámetros únicos para cada tipo de sintetizador

### Indicadores Visuales
- **Selección**: Borde amarillo alrededor del objeto seleccionado
- **Audio activo**: Esfera verde sobre el objeto
- **Estado de interacción**: Cambios de color y escala en tiempo real

## 🚀 Uso del Sistema

### Para Usuarios
1. **Clic corto**: Haz clic en cualquier objeto para tocar una nota
2. **Clic sostenido**: Mantén presionado para sonido continuo
3. **Sonido permanente**: Usa el botón en la UI para activar/desactivar
4. **Configuración**: Ajusta la duración y otros parámetros en el editor

### Para Desarrolladores
1. **Implementar manejadores**: Añade los 4 manejadores de eventos a tu mesh
2. **Usar acciones del store**: Importa y usa las acciones del `useWorldStore`
3. **Animación reactiva**: Implementa `useFrame` para efectos visuales
4. **Indicadores**: Añade indicadores de selección y estado de audio

## 🔍 Compatibilidad

### Sintetizadores Soportados
- ✅ AMSynth (cubo)
- ✅ FMSynth (esfera)
- ✅ DuoSynth (cilindro)
- ✅ MembraneSynth (cono)
- ✅ MonoSynth (pirámide)
- ✅ MetalSynth (icosaedro)
- ✅ NoiseSynth (plano)
- ✅ PluckSynth (toro)
- ✅ PolySynth (anillo de dodecaedros)
- ✅ Sampler (espiral)

### Navegadores
- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge

## 🐛 Solución de Problemas

### Problemas Comunes
1. **Sonido no se reproduce**: Verifica que el AudioContext esté iniciado
2. **Gate no funciona**: Asegúrate de que `audioEnabled === false`
3. **Animación no responde**: Verifica que `energyRef.current` se esté actualizando
4. **Parámetros no se aplican**: Confirma que `updateSoundParams` se esté llamando

### Debug
```typescript
// En la consola del navegador
console.log('Estado del objeto:', selectedObject);
console.log('Parámetros de audio:', selectedObject.audioParams);
console.log('Estado de audio:', selectedObject.audioEnabled);
```

## 📚 Referencias

- [Tone.js Documentation](https://tonejs.github.io/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Three.js](https://threejs.org/docs/)

## 🤝 Contribución

Para contribuir al sistema de interacción universal:

1. **Implementa en nuevos objetos**: Usa los hooks y patrones establecidos
2. **Mejora la animación**: Propón nuevos efectos visuales
3. **Optimiza el rendimiento**: Mejora la eficiencia de `useFrame`
4. **Documenta cambios**: Actualiza este README con nuevas funcionalidades

---

**Desarrollado con ❤️ para Solomon House**
