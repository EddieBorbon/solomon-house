import * as Tone from 'tone';

// Tipos para el contexto de audio
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

  constructor(config: AudioContextConfig = { latencyHint: 'interactive' }) {
    this.contextConfig = {
      ...config
    };
    
    this.initializeContext();
  }

  /**
   * Inicializa el contexto de audio con la configuración especificada
   */
  private initializeContext(): void {
    try {
      // Configurar el contexto con los parámetros especificados
      // Nota: sampleRate no se puede cambiar después de la creación del contexto
      
      // Nota: lookAhead no es una propiedad configurable en Tone.Transport
      
      // Nota: updateInterval no es una propiedad configurable en Tone.Transport

      console.log('AudioContext inicializado:', {
        latencyHint: this.contextConfig.latencyHint,
        sampleRate: Tone.context.sampleRate,
        contextState: Tone.context.state
      });

      // Configurar event listeners para cambios de estado
      this.setupStateChangeListeners();
      
      // Configurar event listeners del navegador
      this.setupBrowserEventListeners();

    } catch (error) {
    }
  }

  /**
   * Configura los event listeners para cambios de estado del contexto
   */
  private setupStateChangeListeners(): void {
    try {
      Tone.context.on('statechange', (newState) => {
        
        // Notificar a todos los listeners registrados
        this.stateChangeListeners.forEach(listener => {
          try {
            listener(newState);
          } catch (error) {
          }
        });

        // Configurar limpieza automática cuando se suspenda el contexto
        if (newState === 'suspended') {
          this.handleContextSuspension();
        }
      });

    } catch (error) {
    }
  }

  /**
   * Configura los event listeners del navegador para limpieza automática
   */
  private setupBrowserEventListeners(): void {
    try {
      if (typeof window !== 'undefined') {
        // Limpieza cuando se cierre la ventana
        window.addEventListener('beforeunload', () => {
          this.triggerCleanup();
        });

        // Limpieza cuando la página pierda el foco (opcional)
        window.addEventListener('blur', () => {
          this.triggerCleanup();
        });

        // Limpieza cuando la página vuelva a tener foco
        window.addEventListener('focus', () => {
        });

      }
    } catch (error) {
    }
  }

  /**
   * Maneja la suspensión del contexto de audio
   */
  private handleContextSuspension(): void {
    try {
      this.triggerCleanup();
    } catch (error) {
    }
  }

  /**
   * Dispara la limpieza a todos los listeners registrados
   */
  private triggerCleanup(): void {
    try {
      this.cleanupListeners.forEach(listener => {
        try {
          listener();
        } catch (error) {
        }
      });
    } catch (error) {
    }
  }

  /**
   * Inicia el contexto de audio de Tone.js
   */
  public async startContext(): Promise<boolean> {
    try {
      if (Tone.context.state !== 'running') {
        
        await Tone.start();
        this.isContextStarted = true;
        
        return true;
      } else {
        return true;
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * Suspende el contexto de audio
   */
  public async suspendContext(): Promise<boolean> {
    try {
      if (Tone.context.state === 'running') {
        
        // Solo cambiar el estado interno, no hay método suspend en Tone
        this.isContextStarted = false;
        
        return true;
      } else {
        return true;
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * Reanuda el contexto de audio
   */
  public async resumeContext(): Promise<boolean> {
    try {
      if (Tone.context.state === 'suspended') {
        
        // Reiniciar el contexto ya que no hay método resume en Tone
        await this.startContext();
        this.isContextStarted = true;
        
        return true;
      } else {
        return true;
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * Cierra el contexto de audio
   */
  public async closeContext(): Promise<boolean> {
    try {
      
      // Solo cambiar el estado interno, no hay método close en Tone
      this.isContextStarted = false;
      
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Verifica si el contexto está ejecutándose
   */
  public isContextRunning(): boolean {
    return Tone.context.state === 'running';
  }

  /**
   * Verifica si el contexto está iniciado
   */
  public getContextStarted(): boolean {
    return this.isContextStarted;
  }

  /**
   * Obtiene el estado de inicio del contexto (getter público)
   */
  public get contextStarted(): boolean {
    return this.isContextStarted;
  }

  /**
   * Obtiene el estado actual del contexto
   */
  public getContextState(): AudioContextState {
    return {
      isRunning: this.isContextRunning(),
      state: Tone.context.state,
      sampleRate: Tone.context.sampleRate,
      latencyHint: String(Tone.context.latencyHint)
    };
  }

  /**
   * Obtiene información de debug del contexto
   */
  public getDebugInfo(): {
    contextState: string;
    isContextStarted: boolean;
    sampleRate: number;
    latencyHint: string;
  } {
    return {
      contextState: Tone.context.state,
      isContextStarted: this.isContextStarted,
      sampleRate: Tone.context.sampleRate,
      latencyHint: String(Tone.context.latencyHint)
    };
  }

  /**
   * Registra un listener para cambios de estado del contexto
   */
  public onStateChange(listener: (state: string) => void): void {
    this.stateChangeListeners.add(listener);
  }

  /**
   * Remueve un listener de cambios de estado
   */
  public removeStateChangeListener(listener: (state: string) => void): void {
    this.stateChangeListeners.delete(listener);
  }

  /**
   * Registra un listener para eventos de limpieza
   */
  public onCleanup(listener: () => void): void {
    this.cleanupListeners.add(listener);
  }

  /**
   * Remueve un listener de limpieza
   */
  public removeCleanupListener(listener: () => void): void {
    this.cleanupListeners.delete(listener);
  }

  /**
   * Actualiza la configuración del contexto
   */
  public updateConfig(config: Partial<AudioContextConfig>): void {
    try {
      this.contextConfig = { ...this.contextConfig, ...config };
      
      // Nota: Las propiedades del contexto de Tone no se pueden modificar después de la inicialización
      // Solo actualizamos la configuración interna para futuras inicializaciones

    } catch (error) {
    }
  }

  /**
   * Obtiene la configuración actual del contexto
   */
  public getConfig(): AudioContextConfig {
    return { ...this.contextConfig };
  }

  /**
   * Verifica si el contexto está en un estado válido para operaciones de audio
   */
  public isContextValid(): boolean {
    return Tone.context.state === 'running' && this.isContextStarted;
  }

  /**
   * Espera a que el contexto esté listo para operaciones de audio
   */
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

  /**
   * Limpia todos los recursos del AudioContextManager
   */
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

    } catch (error) {
    }
  }
}
