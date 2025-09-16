# Documentación: `src/lib/managers/AudioContextManager.ts`

## Propósito
Manager especializado para gestionar el contexto de audio de Tone.js. Proporciona una interfaz centralizada para inicializar, configurar, controlar y limpiar el contexto de audio, incluyendo manejo de estados, eventos y configuración avanzada.

## Funcionalidades Principales

### 1. Gestión del Contexto de Audio
- Inicialización y configuración del contexto de Tone.js
- Control de estados (running, suspended, closed)
- Configuración de parámetros como sampleRate, latencyHint, etc.

### 2. Manejo de Eventos y Listeners
- Event listeners para cambios de estado del contexto
- Sistema de cleanup automático
- Listeners para eventos del navegador (beforeunload, blur, focus)

### 3. Configuración Avanzada
- Configuración de Transport (lookAhead, updateInterval)
- Parámetros de rendimiento personalizables
- Validación y manejo de errores robusto

## Estructura del Código

```typescript
export interface AudioContextState {
  isRunning: boolean;
  state: string;
  sampleRate: number;
  latencyHint: string;
}

export interface AudioContextConfig {
  latencyHint: 'interactive' | 'balanced' | 'playback';
  sampleRate?: number;
  lookAhead?: number;
  updateInterval?: number;
}

export class AudioContextManager {
  private isContextStarted: boolean = false;
  private contextConfig: AudioContextConfig;
  private stateChangeListeners: Set<(state: string) => void> = new Set();
  private cleanupListeners: Set<() => void> = new Set();
  
  // ... métodos de gestión del contexto
}
```

## Dependencias

### Externas
- `tone`: Biblioteca principal de audio para Web Audio API

### Internas
- Ninguna dependencia interna específica

## Configuración Inicial

### Constructor
```typescript
constructor(config: AudioContextConfig = { latencyHint: 'interactive' }) {
  this.contextConfig = {
    latencyHint: 'interactive',
    ...config
  };
  
  this.initializeContext();
}
```

### Configuración por Defecto
```typescript
{
  latencyHint: 'interactive',  // Latencia optimizada para interacción
  sampleRate: undefined,       // Usar sampleRate del sistema
  lookAhead: undefined,        // Usar lookAhead por defecto
  updateInterval: undefined    // Usar updateInterval por defecto
}
```

## Métodos Principales

### 1. Inicialización del Contexto
```typescript
private initializeContext(): void {
  try {
    // Configurar sampleRate si se especifica
    if (this.contextConfig.sampleRate) {
      Tone.context.sampleRate = this.contextConfig.sampleRate;
    }
    
    // Configurar Transport parameters
    if (this.contextConfig.lookAhead) {
      Tone.Transport.lookAhead = this.contextConfig.lookAhead;
    }
    
    if (this.contextConfig.updateInterval) {
      Tone.Transport.updateInterval = this.contextConfig.updateInterval;
    }

    // Configurar event listeners
    this.setupStateChangeListeners();
    this.setupBrowserEventListeners();
    
  } catch (error) {
    console.error(`❌ AudioContextManager: Error al inicializar contexto:`, error);
  }
}
```

### 2. Control de Estados
```typescript
// Iniciar contexto
public async startContext(): Promise<boolean> {
  try {
    if (Tone.context.state !== 'running') {
      await Tone.start();
      this.isContextStarted = true;
      return true;
    }
    return true;
  } catch (error) {
    console.error(`❌ AudioContextManager: Error al iniciar contexto:`, error);
    return false;
  }
}

// Suspender contexto
public async suspendContext(): Promise<boolean> {
  try {
    if (Tone.context.state === 'running') {
      await Tone.context.suspend();
      this.isContextStarted = false;
      return true;
    }
    return true;
  } catch (error) {
    console.error(`❌ AudioContextManager: Error al suspender contexto:`, error);
    return false;
  }
}

// Reanudar contexto
public async resumeContext(): Promise<boolean> {
  try {
    if (Tone.context.state === 'suspended') {
      await Tone.context.resume();
      this.isContextStarted = true;
      return true;
    }
    return true;
  } catch (error) {
    console.error(`❌ AudioContextManager: Error al reanudar contexto:`, error);
    return false;
  }
}
```

### 3. Gestión de Listeners
```typescript
private setupStateChangeListeners(): void {
  try {
    Tone.context.on('statechange', (newState) => {
      console.log(`🔄 AudioContextManager: Estado del contexto cambiado a: ${newState}`);
      
      // Notificar a todos los listeners registrados
      this.stateChangeListeners.forEach(listener => {
        try {
          listener(newState);
        } catch (error) {
          console.error(`❌ AudioContextManager: Error en listener de cambio de estado:`, error);
        }
      });

      // Configurar limpieza automática cuando se suspenda
      if (newState === 'suspended') {
        this.handleContextSuspension();
      }
    });
  } catch (error) {
    console.error(`❌ AudioContextManager: Error al configurar event listeners de estado:`, error);
  }
}
```

## Sistema de Event Listeners

### Listeners de Estado
```typescript
// Registrar listener para cambios de estado
public onStateChange(listener: (state: string) => void): void {
  this.stateChangeListeners.add(listener);
}

// Remover listener de cambios de estado
public removeStateChangeListener(listener: (state: string) => void): void {
  this.stateChangeListeners.delete(listener);
}
```

### Listeners de Cleanup
```typescript
// Registrar listener para eventos de limpieza
public onCleanup(listener: () => void): void {
  this.cleanupListeners.add(listener);
}

// Remover listener de limpieza
public removeCleanupListener(listener: () => void): void {
  this.cleanupListeners.delete(listener);
}
```

### Listeners del Navegador
```typescript
private setupBrowserEventListeners(): void {
  if (typeof window !== 'undefined') {
    // Limpieza cuando se cierre la ventana
    window.addEventListener('beforeunload', () => {
      console.log(`🧹 AudioContextManager: Limpieza por cierre de ventana`);
      this.triggerCleanup();
    });

    // Limpieza cuando la página pierda el foco
    window.addEventListener('blur', () => {
      console.log(`🧹 AudioContextManager: Limpieza por pérdida de foco`);
      this.triggerCleanup();
    });

    // Limpieza cuando la página vuelva a tener foco
    window.addEventListener('focus', () => {
      console.log(`🎵 AudioContextManager: Página recuperó el foco`);
    });
  }
}
```

## Información de Estado y Debug

### Obtener Estado del Contexto
```typescript
public getContextState(): AudioContextState {
  return {
    isRunning: this.isContextRunning(),
    state: Tone.context.state,
    sampleRate: Tone.context.sampleRate,
    latencyHint: Tone.context.latencyHint
  };
}
```

### Información de Debug
```typescript
public getDebugInfo(): {
  contextState: string;
  isContextStarted: boolean;
  sampleRate: number;
  latencyHint: string;
  lookAhead: number;
  updateInterval: number;
} {
  return {
    contextState: Tone.context.state,
    isContextStarted: this.isContextStarted,
    sampleRate: Tone.context.sampleRate,
    latencyHint: Tone.context.latencyHint,
    lookAhead: Tone.Transport.lookAhead,
    updateInterval: Tone.Transport.updateInterval
  };
}
```

### Validaciones
```typescript
// Verificar si el contexto está ejecutándose
public isContextRunning(): boolean {
  return Tone.context.state === 'running';
}

// Verificar si el contexto está iniciado
public isContextStarted(): boolean {
  return this.isContextStarted;
}

// Verificar si el contexto es válido para operaciones
public isContextValid(): boolean {
  return Tone.context.state === 'running' && this.isContextStarted;
}
```

## Configuración Dinámica

### Actualizar Configuración
```typescript
public updateConfig(config: Partial<AudioContextConfig>): void {
  try {
    this.contextConfig = { ...this.contextConfig, ...config };
    
    // Aplicar cambios si el contexto ya está inicializado
    if (config.sampleRate && Tone.context.state !== 'closed') {
      Tone.context.sampleRate = config.sampleRate;
    }
    
    if (config.lookAhead) {
      Tone.Transport.lookAhead = config.lookAhead;
    }
    
    if (config.updateInterval) {
      Tone.Transport.updateInterval = config.updateInterval;
    }

    console.log(`⚙️ AudioContextManager: Configuración actualizada:`, this.contextConfig);
  } catch (error) {
    console.error(`❌ AudioContextManager: Error al actualizar configuración:`, error);
  }
}
```

### Esperar Contexto Listo
```typescript
public async waitForContextReady(): Promise<void> {
  return new Promise((resolve) => {
    if (this.isContextValid()) {
      resolve();
      return;
    }

    const checkState = () => {
      if (this.isContextValid()) {
        resolve();
      } else {
        setTimeout(checkState, 100);
      }
    };

    checkState();
  });
}
```

## Uso en la Aplicación

### Importación y Creación
```typescript
import { AudioContextManager } from '../lib/managers/AudioContextManager';

// Crear instancia con configuración por defecto
const audioContextManager = new AudioContextManager();

// Crear con configuración personalizada
const audioContextManager = new AudioContextManager({
  latencyHint: 'interactive',
  sampleRate: 44100,
  lookAhead: 0.1,
  updateInterval: 25
});
```

### Uso Básico
```typescript
// Iniciar contexto
const success = await audioContextManager.startContext();
if (success) {
  console.log('Contexto de audio iniciado');
}

// Verificar estado
const isRunning = audioContextManager.isContextRunning();
const contextState = audioContextManager.getContextState();

// Configurar listeners
audioContextManager.onStateChange((newState) => {
  console.log('Estado del contexto cambió a:', newState);
});

audioContextManager.onCleanup(() => {
  console.log('Limpiando recursos de audio');
});
```

### Integración con React
```typescript
import { useEffect, useRef } from 'react';
import { AudioContextManager } from '../lib/managers/AudioContextManager';

function AudioProvider({ children }) {
  const audioContextManagerRef = useRef<AudioContextManager | null>(null);
  
  useEffect(() => {
    // Crear manager al montar
    audioContextManagerRef.current = new AudioContextManager();
    
    // Iniciar contexto
    audioContextManagerRef.current.startContext();
    
    // Configurar listeners
    audioContextManagerRef.current.onStateChange((state) => {
      console.log('Estado del contexto:', state);
    });
    
    return () => {
      // Limpiar al desmontar
      if (audioContextManagerRef.current) {
        audioContextManagerRef.current.cleanup();
      }
    };
  }, []);
  
  return (
    <AudioContext.Provider value={audioContextManagerRef.current}>
      {children}
    </AudioContext.Provider>
  );
}
```

## Limpieza y Gestión de Recursos

### Limpieza Completa
```typescript
public cleanup(): void {
  try {
    // Limpiar todos los listeners
    this.stateChangeListeners.clear();
    this.cleanupListeners.clear();

    // Remover event listeners del navegador
    if (typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', this.triggerCleanup);
      window.removeEventListener('blur', this.triggerCleanup);
      window.removeEventListener('focus', () => {});
    }

    console.log(`🧹 AudioContextManager: Limpieza completada`);
  } catch (error) {
    console.error(`❌ AudioContextManager: Error durante la limpieza:`, error);
  }
}
```

### Trigger de Limpieza
```typescript
private triggerCleanup(): void {
  try {
    this.cleanupListeners.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.error(`❌ AudioContextManager: Error en listener de limpieza:`, error);
      }
    });
  } catch (error) {
    console.error(`❌ AudioContextManager: Error al disparar limpieza:`, error);
  }
}
```

## Relaciones con Otros Archivos

### Archivos Relacionados
- `AudioManager.ts`: Usa AudioContextManager para gestionar el contexto
- `SpatialAudioManager.ts`: Depende del contexto de audio
- `EffectManager.ts`: Requiere contexto activo para funcionar

### Integración Típica
```typescript
// En AudioManager.ts
import { AudioContextManager } from './managers/AudioContextManager';

export class AudioManager {
  private contextManager: AudioContextManager;
  
  constructor() {
    this.contextManager = new AudioContextManager();
  }
  
  async initialize() {
    const success = await this.contextManager.startContext();
    if (!success) {
      throw new Error('No se pudo iniciar el contexto de audio');
    }
  }
}
```

## Consideraciones de Rendimiento

### Optimizaciones Implementadas
1. **Configuración Lazy**: Solo configura cuando es necesario
2. **Event Listeners Eficientes**: Usa Sets para O(1) lookup
3. **Validación Temprana**: Verifica estados antes de operaciones
4. **Cleanup Automático**: Gestiona recursos automáticamente

### Mejores Prácticas
- Crear una sola instancia por aplicación
- Usar listeners para reaccionar a cambios de estado
- Limpiar recursos correctamente al desmontar
- Configurar parámetros de rendimiento según necesidades

## Configuración Avanzada

### Parámetros de Rendimiento
```typescript
// Configuración para aplicaciones interactivas
const interactiveConfig = {
  latencyHint: 'interactive',
  lookAhead: 0.025,      // 25ms de lookahead
  updateInterval: 25     // 25ms de intervalo de actualización
};

// Configuración para reproducción de audio
const playbackConfig = {
  latencyHint: 'playback',
  lookAhead: 0.1,        // 100ms de lookahead
  updateInterval: 100    // 100ms de intervalo de actualización
};
```

### Manejo de Errores Personalizado
```typescript
// Configurar manejo de errores personalizado
audioContextManager.onStateChange((state) => {
  if (state === 'suspended') {
    // Manejar suspensión del contexto
    showNotification('Audio suspendido', 'warning');
  } else if (state === 'running') {
    // Manejar reanudación
    showNotification('Audio reanudado', 'success');
  }
});
```

## Troubleshooting

### Problemas Comunes
1. **Contexto no inicia**: Verificar permisos del navegador
2. **Estados inconsistentes**: Verificar llamadas correctas a start/suspend
3. **Memory leaks**: Asegurar cleanup correcto

### Soluciones
1. Llamar `startContext()` después de interacción del usuario
2. Verificar logs de consola para errores específicos
3. Usar `getDebugInfo()` para diagnosticar problemas

## Ejemplo de Uso Completo

```typescript
import { AudioContextManager } from '../lib/managers/AudioContextManager';

class AudioSystem {
  private contextManager: AudioContextManager;
  
  constructor() {
    this.contextManager = new AudioContextManager({
      latencyHint: 'interactive',
      sampleRate: 44100,
      lookAhead: 0.025,
      updateInterval: 25
    });
    
    this.setupEventListeners();
  }
  
  private setupEventListeners() {
    // Listener para cambios de estado
    this.contextManager.onStateChange((state) => {
      console.log(`Estado del contexto: ${state}`);
      
      switch (state) {
        case 'running':
          this.onContextRunning();
          break;
        case 'suspended':
          this.onContextSuspended();
          break;
        case 'closed':
          this.onContextClosed();
          break;
      }
    });
    
    // Listener para limpieza
    this.contextManager.onCleanup(() => {
      this.cleanupAudioResources();
    });
  }
  
  async initialize() {
    console.log('Iniciando sistema de audio...');
    
    const success = await this.contextManager.startContext();
    if (!success) {
      throw new Error('No se pudo iniciar el contexto de audio');
    }
    
    // Esperar a que el contexto esté completamente listo
    await this.contextManager.waitForContextReady();
    
    console.log('Sistema de audio inicializado');
    console.log('Info del contexto:', this.contextManager.getDebugInfo());
  }
  
  private onContextRunning() {
    console.log('✅ Contexto de audio ejecutándose');
  }
  
  private onContextSuspended() {
    console.log('⏸️ Contexto de audio suspendido');
  }
  
  private onContextClosed() {
    console.log('🔒 Contexto de audio cerrado');
  }
  
  private cleanupAudioResources() {
    console.log('🧹 Limpiando recursos de audio...');
    // Limpiar recursos específicos de la aplicación
  }
  
  async shutdown() {
    console.log('Cerrando sistema de audio...');
    
    await this.contextManager.closeContext();
    this.contextManager.cleanup();
    
    console.log('Sistema de audio cerrado');
  }
  
  getContextState() {
    return this.contextManager.getContextState();
  }
  
  isContextValid() {
    return this.contextManager.isContextValid();
  }
}

// Uso
const audioSystem = new AudioSystem();
await audioSystem.initialize();

// Verificar estado
const state = audioSystem.getContextState();
console.log('Estado actual:', state);
```


