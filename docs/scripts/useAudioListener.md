# Documentación: `src/hooks/useAudioListener.ts`

## Propósito
Hook personalizado para configurar y gestionar el listener de audio 3D global de Tone.js. Establece la espacialización 3D automática y configura los parámetros del listener para que funcione correctamente en toda la aplicación.

## Funcionalidades Principales

### 1. Configuración Automática del Listener 3D
- Configura automáticamente el listener global de Tone.js
- Establece vectores de dirección (forward) y orientación (up)
- Asegura que la espacialización 3D funcione desde el inicio

### 2. Verificación del Contexto de Audio
- Verifica que el contexto de audio esté en estado 'running'
- Espera a que el contexto esté listo antes de configurar
- Maneja estados de contexto suspendido o no iniciado

### 3. Configuración de Vectores Espaciales
- **Forward Vector**: [0, 0, -1] - Dirección hacia adelante
- **Up Vector**: [0, 1, 0] - Dirección hacia arriba
- Configuración estándar para espacialización 3D

## Estructura del Código

```typescript
export function useAudioListener() {
  useEffect(() => {
    try {
      // Verificar estado del contexto
      if (Tone.context.state !== 'running') {
        console.log('🎧 Esperando que el contexto de audio esté listo...');
        return;
      }

      // Configurar listener global
      Tone.Listener.set({
        forwardX: 0,
        forwardY: 0,
        forwardZ: -1,
        upX: 0,
        upY: 1,
        upZ: 0,
      });

      // Log de confirmación
      console.log('🎧 Espacialización 3D configurada automáticamente');
    } catch (error) {
      console.error('❌ Error al configurar espacialización de audio:', error);
    }
  }, []);

  return null;
}
```

## Dependencias

### Externas
- `tone`: Biblioteca de audio para Web Audio API
- `react`: Para el hook useEffect

### Internas
- Ninguna dependencia interna

## Parámetros de Configuración

### Vectores de Orientación
```typescript
Tone.Listener.set({
  forwardX: 0,    // Componente X del vector hacia adelante
  forwardY: 0,    // Componente Y del vector hacia adelante  
  forwardZ: -1,   // Componente Z del vector hacia adelante (hacia la cámara)
  upX: 0,         // Componente X del vector hacia arriba
  upY: 1,         // Componente Y del vector hacia arriba
  upZ: 0,         // Componente Z del vector hacia arriba
});
```

### Estados del Contexto Monitoreados
- `running`: Contexto activo y funcionando
- `suspended`: Contexto pausado
- `closed`: Contexto cerrado

## Características Técnicas

### 1. Configuración Automática
- Se ejecuta automáticamente al montar el componente
- No requiere parámetros de entrada
- Configuración única por sesión

### 2. Manejo de Errores
- Try-catch para capturar errores de configuración
- Logging detallado para debugging
- Fallback silencioso en caso de error

### 3. Verificación de Estado
- Verifica el estado del contexto antes de configurar
- Retorna temprano si el contexto no está listo
- Logging informativo del estado actual

## Información de Debug

El hook proporciona logging detallado que incluye:

```typescript
console.log('🎧 Estado del contexto de audio:', {
  contextState: Tone.context.state,
  sampleRate: Tone.context.sampleRate,
  latencyHint: Tone.context.latencyHint,
  listenerConfig: {
    forward: [Tone.Listener.forwardX.value, Tone.Listener.forwardY.value, Tone.Listener.forwardZ.value],
    up: [Tone.Listener.upX.value, Tone.Listener.upY.value, Tone.Listener.upZ.value]
  }
});
```

## Uso en la Aplicación

### Importación
```typescript
import { useAudioListener } from '../hooks/useAudioListener';
```

### Implementación
```typescript
function AudioComponent() {
  useAudioListener(); // Configura automáticamente el listener 3D
  
  return <div>Componente con audio espacializado</div>;
}
```

### Ubicación Recomendada
- En el componente raíz de la aplicación
- Antes de cualquier componente que use audio espacializado
- En componentes que manejan la cámara 3D

## Relaciones con Otros Archivos

### Archivos que lo Usan
- Componentes que requieren audio espacializado
- Sistemas de audio 3D
- Componentes de cámara 3D

### Archivos Relacionados
- `SpatialAudioManager.ts`: Gestiona la espacialización de fuentes
- `AudioManager.ts`: Gestiona las fuentes de audio
- `useCameraControls.ts`: Controla la posición de la cámara

## Consideraciones de Rendimiento

1. **Ejecución Única**: Se ejecuta solo una vez al montar
2. **Verificación Eficiente**: Verifica el estado del contexto antes de configurar
3. **Sin Re-renderizado**: No causa re-renderizados innecesarios
4. **Configuración Ligera**: Configuración mínima del listener

## Estados del Contexto de Audio

### Estados Posibles
- **`running`**: Contexto activo, listo para procesar audio
- **`suspended`**: Contexto pausado por política del navegador
- **`closed`**: Contexto cerrado o no inicializado

### Manejo de Estados
```typescript
if (Tone.context.state !== 'running') {
  // Esperar a que el contexto esté listo
  return;
}
// Proceder con la configuración
```

## Notas para Desarrollo

### Configuración Estándar
- La configuración actual es estándar para aplicaciones 3D
- Los vectores están alineados con el sistema de coordenadas de Three.js
- No requiere modificación en la mayoría de casos

### Debugging
- Usar los logs de consola para verificar la configuración
- Verificar que el contexto esté en estado 'running'
- Comprobar que los vectores se configuraron correctamente

### Extensibilidad
- Se puede extender para configurar más parámetros del listener
- Permite agregar listeners de eventos del contexto
- Puede incluir configuración dinámica de vectores

## Ejemplo de Uso Completo

```typescript
import React from 'react';
import { useAudioListener } from '../hooks/useAudioListener';

function AudioScene() {
  // Configurar listener 3D automáticamente
  useAudioListener();

  return (
    <div>
      {/* Componentes con audio espacializado */}
      <SpatialAudioSource />
      <Camera3D />
    </div>
  );
}
```

## Troubleshooting

### Problemas Comunes
1. **Contexto no iniciado**: Verificar que `Tone.start()` se haya llamado
2. **Vectores incorrectos**: Verificar la configuración de forward/up
3. **Espacialización no funciona**: Confirmar que el listener esté configurado

### Soluciones
1. Llamar `Tone.start()` antes de usar el hook
2. Verificar los logs de consola para errores
3. Confirmar que el contexto esté en estado 'running'
