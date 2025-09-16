# Documentación: `src/lib/managers/EffectManager.ts`

## Propósito
Manager especializado para crear, configurar y gestionar efectos de audio globales con espacialización 3D independiente. Proporciona una interfaz unificada para todos los tipos de efectos de Tone.js y gestiona su aplicación espacial en tiempo real.

## Funcionalidades Principales

### 1. Gestión de Efectos Globales
- Creación y configuración de efectos de audio
- Gestión de posicionamiento 3D independiente
- Aplicación de efectos con intensidad variable

### 2. Soporte Completo de Efectos
- 16 tipos diferentes de efectos de Tone.js
- Configuración automática de parámetros iniciales
- Osciladores de prueba optimizados por tipo de efecto

### 3. Espacialización 3D
- Cada efecto tiene su propio Panner3D
- Posicionamiento independiente en el espacio 3D
- Gestión de zonas de efectos con radios configurables

## Estructura del Código

```typescript
export type EffectType = 'phaser' | 'autoFilter' | 'autoWah' | 'bitCrusher' | 
  'chebyshev' | 'chorus' | 'distortion' | 'feedbackDelay' | 'freeverb' | 
  'frequencyShifter' | 'jcReverb' | 'pingPongDelay' | 'pitchShift' | 
  'reverb' | 'stereoWidener' | 'tremolo' | 'vibrato';

export interface GlobalEffect {
  effectNode: Tone.Effect | any;
  panner: Tone.Panner3D;
  position: [number, number, number];
}

export class EffectManager {
  private globalEffects: Map<string, GlobalEffect> = new Map();
  private testOscillators: Map<string, Tone.Oscillator> = new Map();
  private effectZoneRadii: Map<string, number> = new Map();
  private lastEffectIntensities: Map<string, number> = new Map();
  
  // ... métodos de gestión de efectos
}
```

## Dependencias

### Externas
- `tone`: Biblioteca principal de audio para efectos

### Internas
- Ninguna dependencia interna específica

## Tipos de Efectos Soportados

### Efectos de Filtrado
- **Phaser**: Efecto de fase con modulación
- **AutoFilter**: Filtro automático con LFO
- **AutoWah**: Filtro wah automático
- **Chebyshev**: Distorsión armónica

### Efectos de Modulación
- **Chorus**: Efecto de coro con modulación
- **Tremolo**: Modulación de amplitud
- **Vibrato**: Modulación de frecuencia
- **FrequencyShifter**: Desplazamiento de frecuencia

### Efectos de Delay y Reverberación
- **FeedbackDelay**: Delay con retroalimentación
- **PingPongDelay**: Delay estéreo ping-pong
- **Reverb**: Reverberación algorítmica
- **Freeverb**: Reverberación libre
- **JCReverb**: Reverberación JC

### Efectos de Distorsión y Forma
- **Distortion**: Distorsión no lineal
- **BitCrusher**: Reducción de bits
- **StereoWidener**: Ensanchamiento estéreo

### Efectos de Pitch
- **PitchShift**: Cambio de tono en tiempo real

## Creación de Efectos

### Método Principal
```typescript
public createGlobalEffect(
  effectId: string, 
  type: EffectType, 
  position: [number, number, number]
): void {
  try {
    console.log(`🎛️ EffectManager: Creando efecto global ${type} con ID ${effectId}`);
    
    const effectNode = this.createEffectNode(type);
    
    if (effectNode) {
      // Crear panner 3D independiente
      const effectPanner = new Tone.Panner3D({
        positionX: position[0],
        positionY: position[1],
        positionZ: position[2],
        panningModel: 'HRTF',
        distanceModel: 'inverse',
        refDistance: 1,
        maxDistance: 100,
        rolloffFactor: 2,
        coneInnerAngle: 360,
        coneOuterAngle: 360,
        coneOuterGain: 0,
      });
      
      // Conectar efecto -> panner -> destination
      effectNode.chain(effectPanner, Tone.Destination);
      
      // Almacenar efecto
      this.globalEffects.set(effectId, { 
        effectNode, 
        panner: effectPanner, 
        position: position 
      });
      
      // Configurar radio inicial
      this.setEffectZoneRadius(effectId, 2.0);
      
      // Crear oscilador de prueba
      this.createTestOscillatorForEffect(effectId, effectNode);
    }
  } catch (error) {
    console.error(`❌ EffectManager: Error al crear efecto global:`, error);
  }
}
```

### Configuración de Panner3D
```typescript
const effectPanner = new Tone.Panner3D({
  positionX: position[0],        // Posición X en el espacio 3D
  positionY: position[1],        // Posición Y en el espacio 3D
  positionZ: position[2],        // Posición Z en el espacio 3D
  panningModel: 'HRTF',         // Modelo de panning HRTF
  distanceModel: 'inverse',     // Modelo de distancia inversa
  refDistance: 1,               // Distancia de referencia
  maxDistance: 100,             // Distancia máxima
  rolloffFactor: 2,             // Factor de rolloff
  coneInnerAngle: 360,          // Ángulo interno del cono
  coneOuterAngle: 360,          // Ángulo externo del cono
  coneOuterGain: 0,             // Ganancia externa del cono
});
```

## Configuración de Efectos Específicos

### Phaser
```typescript
private createPhaser(): Tone.Phaser {
  const effectNode = new Tone.Phaser({
    frequency: 0.5,        // Frecuencia de modulación
    octaves: 2.2,          // Número de octavas
    baseFrequency: 1000,   // Frecuencia base
  });
  return effectNode;
}
```

### AutoFilter
```typescript
private createAutoFilter(): Tone.AutoFilter {
  const effectNode = new Tone.AutoFilter({
    frequency: 0.5,        // Frecuencia del LFO
    baseFrequency: 200,    // Frecuencia base del filtro
    octaves: 2.6,          // Rango de octavas
    depth: 0.5,            // Profundidad de modulación
    filter: {
      type: 'lowpass',     // Tipo de filtro
      rolloff: -12,        // Rolloff del filtro
      Q: 1,                // Factor Q
    },
    type: 'sine',          // Tipo de onda del LFO
  });
  return effectNode;
}
```

### PingPongDelay
```typescript
private createPingPongDelay(): Tone.PingPongDelay {
  const effectNode = new Tone.PingPongDelay({
    delayTime: '4n',       // Tiempo de delay (nota musical)
    feedback: 0.2,         // Cantidad de feedback
    maxDelay: 1            // Delay máximo en segundos
  });
  return effectNode;
}
```

### Reverb
```typescript
private createReverb(): Tone.Reverb {
  const effectNode = new Tone.Reverb({
    decay: 1.5,            // Tiempo de decay
    preDelay: 0.01         // Pre-delay
  });
  return effectNode;
}
```

## Osciladores de Prueba

### Creación Automática
```typescript
private createTestOscillatorForEffect(effectId: string, effectNode: any): void {
  try {
    // Configurar parámetros según el tipo de efecto
    let frequency = 440;
    let volume = -30;
    let type: OscillatorType = 'sine';
    
    if (effectNode instanceof Tone.Phaser) {
      frequency = 440;
      volume = -25;
    } else if (effectNode instanceof Tone.BitCrusher) {
      frequency = 880;
      volume = -20;
      type = 'square';
    } else if (effectNode instanceof Tone.Reverb) {
      frequency = 330;
      volume = -20;
      type = 'sine';
    }
    // ... más configuraciones específicas
    
    // Crear oscilador optimizado
    const testOsc = new Tone.Oscillator({
      frequency,
      type,
      volume,
    });
    
    // Conectar al efecto
    testOsc.connect(effectNode);
    testOsc.start();
    
    // Almacenar para limpieza posterior
    this.testOscillators.set(effectId, testOsc);
    
  } catch (error) {
    console.error(`❌ EffectManager: Error al crear oscilador de prueba:`, error);
  }
}
```

### Configuraciones Específicas por Tipo
```typescript
// Configuraciones optimizadas para cada tipo de efecto
const effectConfigs = {
  'phaser': { frequency: 440, volume: -25, type: 'sine' },
  'bitCrusher': { frequency: 880, volume: -20, type: 'square' },
  'reverb': { frequency: 330, volume: -20, type: 'sine' },
  'chorus': { frequency: 440, volume: -25, type: 'sine' },
  'distortion': { frequency: 440, volume: -20, type: 'sawtooth' },
  'pingPongDelay': { frequency: 220, volume: -24, type: 'sine' },
  'stereoWidener': { frequency: 550, volume: -18, type: 'sine' },
  // ... más configuraciones
};
```

## Actualización de Parámetros

### Método Principal
```typescript
public updateGlobalEffect(effectId: string, params: any): void {
  const effectData = this.globalEffects.get(effectId);
  if (!effectData) {
    console.warn(`⚠️ EffectManager: No se encontró efecto global con ID ${effectId}`);
    return;
  }

  try {
    const { effectNode } = effectData;
    
    // Actualizar según el tipo de efecto
    if (effectNode instanceof Tone.Phaser) {
      this.updatePhaserParams(effectNode, params);
    } else if (effectNode instanceof Tone.PingPongDelay) {
      this.updatePingPongDelayParams(effectNode, params);
    }
    // ... más tipos de efectos
    
    // Refrescar el efecto
    this.refreshGlobalEffect(effectId);
    
    // Forzar actualización adicional
    Object.keys(params).forEach(paramName => {
      if (params[paramName] !== undefined) {
        this.forceEffectUpdate(effectId, paramName, params[paramName]);
      }
    });
    
  } catch (error) {
    console.error(`❌ EffectManager: Error al actualizar parámetros del efecto:`, error);
  }
}
```

### Actualización de Parámetros Específicos
```typescript
private updatePhaserParams(effectNode: Tone.Phaser, params: any): void {
  Object.keys(params).forEach(paramName => {
    if (params[paramName] !== undefined) {
      this.safeUpdateParam(effectNode, paramName, params[paramName]);
    }
  });
}

private updatePingPongDelayParams(effectNode: Tone.PingPongDelay, params: any): void {
  Object.keys(params).forEach(paramName => {
    if (params[paramName] !== undefined) {
      // Mapear parámetros del store a parámetros del efecto
      if (paramName === 'pingPongDelayTime' || paramName === 'delayTime') {
        this.safeUpdateParam(effectNode, 'delayTime', params[paramName]);
      } else if (paramName === 'pingPongFeedback' || paramName === 'feedback') {
        this.safeUpdateParam(effectNode, 'feedback', params[paramName]);
      } else if (paramName === 'maxDelay') {
        this.safeUpdateParam(effectNode, 'maxDelay', params[paramName]);
      }
    }
  });
}
```

## Gestión de Zonas de Efectos

### Configuración de Radio
```typescript
public setEffectZoneRadius(effectId: string, radius: number): void {
  this.effectZoneRadii.set(effectId, radius);
  console.log(`🎛️ EffectManager: Radio de zona de efecto ${effectId} configurado a ${radius} unidades`);
}

public getEffectZoneRadius(effectId: string): number {
  const radius = this.effectZoneRadii.get(effectId) || 2.0;
  console.log(`📏 EffectManager: Radio para zona de efecto ${effectId}: ${radius} unidades`);
  return radius;
}
```

### Actualización de Posición
```typescript
public updateEffectZonePosition(id: string, position: [number, number, number]): void {
  const effectData = this.globalEffects.get(id);
  if (!effectData) return;

  try {
    console.log(`📍 EffectManager: Actualizando posición de zona de efecto ${id}`);
    
    // Actualizar posición del panner
    effectData.panner.setPosition(position[0], position[1], position[2]);
    
    // Actualizar posición almacenada
    effectData.position = position;
    
  } catch (error) {
    console.error(`❌ EffectManager: Error al actualizar posición:`, error);
  }
}
```

## Refresco y Actualización de Efectos

### Refresco de Efectos
```typescript
public refreshGlobalEffect(effectId: string): void {
  const effectData = this.globalEffects.get(effectId);
  if (!effectData) return;

  try {
    const { effectNode } = effectData;
    const testOsc = this.testOscillators.get(effectId);
    
    if (testOsc) {
      // Estrategias específicas según el tipo de efecto
      if (effectNode instanceof Tone.Phaser) {
        testOsc.frequency.rampTo(880, 0.1);
        setTimeout(() => testOsc.frequency.rampTo(440, 0.1), 150);
      } else if (effectNode instanceof Tone.Reverb) {
        testOsc.frequency.rampTo(660, 0.1);
        setTimeout(() => testOsc.frequency.rampTo(330, 0.1), 200);
      }
      // ... más estrategias específicas
    }
  } catch (error) {
    console.error(`❌ EffectManager: Error al refrescar efecto:`, error);
  }
}
```

### Actualización Forzada
```typescript
public forceEffectUpdate(effectId: string, paramName: string, newValue: any): void {
  const effectData = this.globalEffects.get(effectId);
  if (!effectData) return;

  try {
    const { effectNode } = effectData;
    
    // Estrategias específicas para parámetros críticos
    if (effectNode instanceof Tone.BitCrusher && paramName === 'bits') {
      console.log(`ℹ️ EffectManager: Los bits del BitCrusher requieren recreación`);
      this.refreshGlobalEffect(effectId);
    } else {
      this.refreshGlobalEffect(effectId);
    }
    
  } catch (error) {
    console.error(`❌ EffectManager: Error al forzar actualización:`, error);
  }
}
```

## Utilidades y Helpers

### Actualización Segura de Parámetros
```typescript
private safeUpdateParam(effectNode: any, paramPath: string, newValue: any): boolean {
  try {
    const pathParts = paramPath.split('.');
    let current = effectNode;
    
    // Navegar hasta el penúltimo elemento
    for (let i = 0; i < pathParts.length - 1; i++) {
      if (current && current[pathParts[i]]) {
        current = current[pathParts[i]];
      } else {
        console.log(`ℹ️ EffectManager: Path ${paramPath} no válido`);
        return false;
      }
    }
    
    const lastPart = pathParts[pathParts.length - 1];
    const target = current[lastPart];
    
    if (target !== undefined) {
      if (typeof target.rampTo === 'function') {
        target.rampTo(newValue, 0.1);
        return true;
      } else if (typeof target.setValueAtTime === 'function') {
        target.setValueAtTime(newValue, effectNode.context.currentTime);
        return true;
      } else if (typeof target === 'number' || typeof target === 'string') {
        current[lastPart] = newValue;
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.log(`ℹ️ EffectManager: Error al actualizar ${paramPath}:`, error);
    return false;
  }
}
```

## Uso en la Aplicación

### Importación y Creación
```typescript
import { EffectManager } from '../lib/managers/EffectManager';

// Crear instancia del manager
const effectManager = new EffectManager();
```

### Crear Efectos
```typescript
// Crear efecto de reverb en posición específica
effectManager.createGlobalEffect(
  'reverb-zone-1',
  'reverb',
  [0, 0, 0]  // Posición 3D
);

// Crear efecto de delay
effectManager.createGlobalEffect(
  'delay-zone-1',
  'pingPongDelay',
  [5, 0, 0]  // Posición diferente
);
```

### Actualizar Parámetros
```typescript
// Actualizar parámetros del reverb
effectManager.updateGlobalEffect('reverb-zone-1', {
  decay: 2.0,        // Tiempo de decay más largo
  preDelay: 0.02     // Pre-delay más largo
});

// Actualizar parámetros del delay
effectManager.updateGlobalEffect('delay-zone-1', {
  pingPongDelayTime: '8n',  // Tiempo de delay más corto
  pingPongFeedback: 0.3     // Más feedback
});
```

### Gestión de Posiciones
```typescript
// Actualizar posición de zona de efecto
effectManager.updateEffectZonePosition('reverb-zone-1', [2, 1, 0]);

// Configurar radio de zona
effectManager.setEffectZoneRadius('reverb-zone-1', 3.0);

// Obtener radio actual
const radius = effectManager.getEffectZoneRadius('reverb-zone-1');
```

### Integración con React
```typescript
import { useEffect, useRef } from 'react';
import { EffectManager } from '../lib/managers/EffectManager';

function AudioEffectsProvider({ children }) {
  const effectManagerRef = useRef<EffectManager | null>(null);
  
  useEffect(() => {
    // Crear manager al montar
    effectManagerRef.current = new EffectManager();
    
    // Crear efectos iniciales
    effectManagerRef.current.createGlobalEffect(
      'main-reverb',
      'reverb',
      [0, 0, 0]
    );
    
    effectManagerRef.current.createGlobalEffect(
      'main-delay',
      'pingPongDelay',
      [3, 0, 0]
    );
    
    return () => {
      // Limpiar al desmontar
      if (effectManagerRef.current) {
        effectManagerRef.current.cleanup();
      }
    };
  }, []);
  
  return (
    <EffectManagerContext.Provider value={effectManagerRef.current}>
      {children}
    </EffectManagerContext.Provider>
  );
}
```

## Limpieza y Gestión de Recursos

### Limpieza Completa
```typescript
public cleanup(): void {
  try {
    // Limpiar osciladores de prueba
    this.testOscillators.forEach((testOsc, effectId) => {
      try {
        testOsc.stop();
        testOsc.dispose();
      } catch (error) {
        // Manejo silencioso de errores
      }
    });
    this.testOscillators.clear();
    
    // Limpiar efectos globales
    this.globalEffects.forEach((effectData, effectId) => {
      try {
        this.removeGlobalEffect(effectId);
      } catch (error) {
        // Manejo silencioso de errores
      }
    });
    
    // Limpiar Maps
    this.effectZoneRadii.clear();
    this.lastEffectIntensities.clear();
    
    console.log(`🧹 EffectManager: Limpieza completada`);
  } catch (error) {
    console.error(`❌ EffectManager: Error durante la limpieza:`, error);
  }
}
```

### Eliminación de Efectos Individuales
```typescript
public removeGlobalEffect(effectId: string): void {
  const effectData = this.globalEffects.get(effectId);
  if (effectData) {
    try {
      const { effectNode, panner } = effectData;
      
      // Limpiar oscilador de prueba
      const testOsc = this.testOscillators.get(effectId);
      if (testOsc) {
        testOsc.stop();
        testOsc.dispose();
        this.testOscillators.delete(effectId);
      }
      
      // Desconectar y disponer nodos
      effectNode.disconnect();
      panner.disconnect();
      effectNode.dispose();
      panner.dispose();
      
      // Limpiar referencias
      this.globalEffects.delete(effectId);
      this.effectZoneRadii.delete(effectId);
      this.lastEffectIntensities.delete(effectId);
      
      console.log(`🎛️ EffectManager: Efecto ${effectId} eliminado completamente`);
    } catch (error) {
      console.error(`❌ EffectManager: Error al eliminar efecto:`, error);
    }
  }
}
```

## Relaciones con Otros Archivos

### Archivos Relacionados
- `AudioManager.ts`: Usa EffectManager para gestionar efectos
- `useEffectZoneDetection.ts`: Detecta colisiones con zonas de efectos
- `EffectZone.tsx`: Componente visual de zonas de efectos

### Integración Típica
```typescript
// En AudioManager.ts
import { EffectManager } from './managers/EffectManager';

export class AudioManager {
  private effectManager: EffectManager;
  
  constructor() {
    this.effectManager = new EffectManager();
  }
  
  createEffectZone(id: string, type: EffectType, position: [number, number, number]) {
    this.effectManager.createGlobalEffect(id, type, position);
  }
  
  updateEffectZone(id: string, params: any) {
    this.effectManager.updateGlobalEffect(id, params);
  }
}
```

## Consideraciones de Rendimiento

### Optimizaciones Implementadas
1. **Osciladores Optimizados**: Configuraciones específicas por tipo de efecto
2. **Refresco Inteligente**: Estrategias específicas para cada tipo
3. **Gestión de Memoria**: Limpieza automática de recursos
4. **Conexiones Eficientes**: Cadena de audio optimizada

### Mejores Prácticas
- Crear una sola instancia por aplicación
- Limpiar efectos no utilizados
- Usar posiciones 3D apropiadas
- Configurar radios de zona según necesidades

## Configuración Avanzada

### Personalización de Efectos
```typescript
// Crear efecto con configuración personalizada
const customPhaser = new Tone.Phaser({
  frequency: 1.0,        // Frecuencia más alta
  octaves: 3.0,          // Más octavas
  baseFrequency: 500,    // Frecuencia base diferente
});

// Crear efecto personalizado
effectManager.createGlobalEffect('custom-effect', 'phaser', [0, 0, 0]);
effectManager.updateGlobalEffect('custom-effect', {
  frequency: 1.0,
  octaves: 3.0,
  baseFrequency: 500
});
```

### Configuración de Zonas
```typescript
// Configurar múltiples zonas con diferentes radios
effectManager.setEffectZoneRadius('reverb-zone-1', 5.0);  // Zona grande
effectManager.setEffectZoneRadius('delay-zone-1', 2.0);   // Zona pequeña
effectManager.setEffectZoneRadius('chorus-zone-1', 3.0);  // Zona media
```

## Troubleshooting

### Problemas Comunes
1. **Efectos no se escuchan**: Verificar que los osciladores de prueba estén activos
2. **Parámetros no se aplican**: Verificar nombres de parámetros correctos
3. **Rendimiento lento**: Reducir número de efectos activos

### Soluciones
1. Verificar logs de consola para errores de creación
2. Confirmar que los efectos estén en posiciones válidas
3. Usar `getAllGlobalEffects()` para debuggear estado

## Ejemplo de Uso Completo

```typescript
import { EffectManager } from '../lib/managers/EffectManager';

class AudioEffectsSystem {
  private effectManager: EffectManager;
  
  constructor() {
    this.effectManager = new EffectManager();
    this.setupDefaultEffects();
  }
  
  private setupDefaultEffects() {
    // Crear zonas de efectos en diferentes posiciones
    this.effectManager.createGlobalEffect('main-reverb', 'reverb', [0, 0, 0]);
    this.effectManager.createGlobalEffect('main-delay', 'pingPongDelay', [5, 0, 0]);
    this.effectManager.createGlobalEffect('main-chorus', 'chorus', [-5, 0, 0]);
    this.effectManager.createGlobalEffect('main-distortion', 'distortion', [0, 5, 0]);
    
    // Configurar radios de zonas
    this.effectManager.setEffectZoneRadius('main-reverb', 4.0);
    this.effectManager.setEffectZoneRadius('main-delay', 3.0);
    this.effectManager.setEffectZoneRadius('main-chorus', 2.5);
    this.effectManager.setEffectZoneRadius('main-distortion', 2.0);
    
    // Configurar parámetros iniciales
    this.effectManager.updateGlobalEffect('main-reverb', {
      decay: 2.0,
      preDelay: 0.02
    });
    
    this.effectManager.updateGlobalEffect('main-delay', {
      pingPongDelayTime: '4n',
      pingPongFeedback: 0.3
    });
  }
  
  updateEffectZone(id: string, params: any) {
    this.effectManager.updateGlobalEffect(id, params);
  }
  
  moveEffectZone(id: string, position: [number, number, number]) {
    this.effectManager.updateEffectZonePosition(id, position);
  }
  
  setZoneRadius(id: string, radius: number) {
    this.effectManager.setEffectZoneRadius(id, radius);
  }
  
  getAllEffects() {
    return this.effectManager.getAllGlobalEffects();
  }
  
  cleanup() {
    this.effectManager.cleanup();
  }
}

// Uso
const effectsSystem = new AudioEffectsSystem();

// Actualizar efectos dinámicamente
effectsSystem.updateEffectZone('main-reverb', { decay: 3.0 });
effectsSystem.moveEffectZone('main-delay', [10, 0, 0]);
effectsSystem.setZoneRadius('main-chorus', 4.0);

// Obtener información de efectos
const effects = effectsSystem.getAllEffects();
console.log('Efectos activos:', effects.size);
```


