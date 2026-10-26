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
    // Solo ejecutar en el cliente (navegador), no durante SSR
    if (typeof window === 'undefined') {
      return;
    }

    try {
      // Aplicar la configuración de baja latencia al contexto real (roadmap 2.8).
      // El latencyHint solo puede fijarse al crear el contexto, por lo que se
      // crea un contexto propio de Tone y se establece como contexto global
      // antes de que se construya cualquier nodo de audio.
      if (Tone.getContext().state !== 'running') {
        const lowLatencyContext = new Tone.Context({
          latencyHint: this.contextConfig.latencyHint,
          lookAhead: this.contextConfig.lookAhead ?? 0.05,
          updateInterval: this.contextConfig.updateInterval ?? 0.025
        });
        Tone.setContext(lowLatencyContext);
      }

      console.log('AudioContext inicializado:', {
        latencyHint: this.contextConfig.latencyHint,
        sampleRate: Tone.getContext().sampleRate,
        contextState: Tone.getContext().state
      });

      // Configurar el contexto para evitar suspensión automática
      this.configureContextForPersistence();

      // Configurar event listeners para cambios de estado
      this.setupStateChangeListeners();
      
      // Configurar event listeners del navegador
      this.setupBrowserEventListeners();

    } catch {
    }
  }

  /**
   * Configura el contexto de audio para mantenerlo activo
   */
  private configureContextForPersistence(): void {
    // Solo ejecutar en el cliente (navegador), no durante SSR
    if (typeof window === 'undefined') {
      return;
    }

    try {
      // Verificar que Tone está disponible antes de usarlo
      if (!Tone || !Tone.getContext() || !Tone.getTransport()) {
        console.warn('🎵 AudioContextManager: Tone.js no está disponible');
        return;
      }

      // Configurar el contexto para que no se suspenda automáticamente
      if (Tone.getContext().state === 'suspended') {
        console.log('🎵 AudioContextManager: Contexto suspendido, intentando reanudar...');
        Tone.start();
      }

      // Configurar el Transport para mantener el tiempo activo
      if (Tone.getTransport().state !== 'started') {
        Tone.getTransport().start();
      }

      console.log('🎵 AudioContextManager: Contexto configurado para persistencia:', {
        contextState: Tone.getContext().state,
        transportState: Tone.getTransport().state,
        sampleRate: Tone.getContext().sampleRate
      });

    } catch (error) {
      console.warn('🎵 AudioContextManager: Error configurando persistencia del contexto:', error);
    }
  }

  /**
   * Configura los event listeners para cambios de estado del contexto
   */
  private setupStateChangeListeners(): void {
    // Solo ejecutar en el cliente (navegador), no durante SSR
    if (typeof window === 'undefined') {
      return;
    }

    try {
      Tone.getContext().on('statechange', (newState) => {
        
        // Notificar a todos los listeners registrados
        this.stateChangeListeners.forEach(listener => {
          try {
            listener(newState);
          } catch {
          }
        });

        // Configurar limpieza automática cuando se suspenda el contexto
        if (newState === 'suspended') {
          this.handleContextSuspension();
        }
      });

    } catch {
    }
  }

  /**
   * Configura los event listeners del navegador para limpieza automática
   */
  private setupBrowserEventListeners(): void {
    try {
      if (typeof window !== 'undefined') {
        // Limpieza SOLO cuando se cierre la ventana/pestaña
        window.addEventListener('beforeunload', () => {
          this.triggerCleanup();
        });

        // REMOVIDO: No limpiar cuando la página pierda el foco
        // Esto permite que el audio siga sonando cuando el usuario hace clic fuera
        // window.addEventListener('blur', () => {
        //   this.triggerCleanup();
        // });

        // Event listener para cuando la página vuelva a tener foco (sin limpieza)
        window.addEventListener('focus', () => {
          // Opcional: podríamos reanudar el contexto si está suspendido
          if (typeof Tone !== 'undefined' && Tone.getContext() && Tone.getContext().state === 'suspended') {
            console.log('🎵 AudioContextManager: Página recuperó el foco, reanudando contexto de audio');
            this.resumeContext();
          }
        });

        // Manejar cambio de visibilidad de la página (cambio de pestaña)
        document.addEventListener('visibilitychange', () => {
          if (document.hidden) {
            // Página oculta (cambio de pestaña) - mantener audio funcionando
            console.log('🎵 AudioContextManager: Página oculta, manteniendo audio activo');
          } else {
            // Página visible de nuevo
            console.log('🎵 AudioContextManager: Página visible de nuevo');
            if (typeof Tone !== 'undefined' && Tone.getContext() && Tone.getContext().state === 'suspended') {
              this.resumeContext();
            }
          }
        });

      }
    } catch {
    }
  }

  /**
   * Maneja la suspensión del contexto de audio
   */
  private handleContextSuspension(): void {
    try {
      this.triggerCleanup();
    } catch {
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
        } catch {
        }
      });
    } catch {
    }
  }

  /**
   * Inicia el contexto de audio de Tone.js
   */
  public async startContext(): Promise<boolean> {
    // Solo ejecutar en el cliente (navegador), no durante SSR
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      if (Tone.getContext().state !== 'running') {
        
        await Tone.start();
        this.isContextStarted = true;
        
        return true;
      } else {
        return true;
      }
    } catch {
      return false;
    }
  }

  /**
   * Suspende el contexto de audio
   */
  public async suspendContext(): Promise<boolean> {
    // Solo ejecutar en el cliente (navegador), no durante SSR
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      if (Tone.getContext().state === 'running') {
        // Suspender el contexto nativo subyacente para liberar el hilo de audio
        const raw = Tone.getContext().rawContext as AudioContext;
        if (typeof raw.suspend === 'function') {
          await raw.suspend();
        }
        this.isContextStarted = false;

        return true;
      } else {
        return true;
      }
    } catch {
      return false;
    }
  }

  /**
   * Reanuda el contexto de audio
   */
  public async resumeContext(): Promise<boolean> {
    // Solo ejecutar en el cliente (navegador), no durante SSR
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      if (Tone.getContext().state === 'suspended') {
        
        // Reiniciar el contexto ya que no hay método resume en Tone
        await this.startContext();
        this.isContextStarted = true;
        
        return true;
      } else {
        return true;
      }
    } catch {
      return false;
    }
  }

  /**
   * Cierra el contexto de audio
   */
  public async closeContext(): Promise<boolean> {
    // Solo ejecutar en el cliente (navegador), no durante SSR
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      // Liberación explícita de recursos (roadmap 2.5): notificar a los
      // listeners para que desconecten sus grafos y cerrar el contexto
      // nativo, liberando el hilo de audio del sistema operativo.
      this.triggerCleanup();

      if (Tone.getContext().state !== 'closed') {
        const raw = Tone.getContext().rawContext as AudioContext;
        if (typeof raw.close === 'function') {
          await raw.close();
        }
      }

      this.isContextStarted = false;

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Verifica si el contexto está ejecutándose
   */
  public isContextRunning(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }
    return Tone.getContext().state === 'running';
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
    if (typeof window === 'undefined') {
      return {
        isRunning: false,
        state: 'suspended',
        sampleRate: 44100,
        latencyHint: 'interactive'
      };
    }
    return {
      isRunning: this.isContextRunning(),
      state: Tone.getContext().state,
      sampleRate: Tone.getContext().sampleRate,
      latencyHint: String(Tone.getContext().latencyHint)
    };
  }

  /**
   * Mide la latencia real del hardware de audio del cliente (roadmap 2.8).
   * baseLatency: latencia de procesamiento del contexto (buffer interno).
   * outputLatency: latencia estimada hasta la salida física (DAC/altavoces).
   * Ambos valores se expresan en segundos.
   */
  public getMeasuredLatency(): { baseLatency: number | null; outputLatency: number | null } {
    if (typeof window === 'undefined') {
      return { baseLatency: null, outputLatency: null };
    }
    try {
      const raw = Tone.getContext().rawContext as AudioContext;
      return {
        baseLatency: typeof raw.baseLatency === 'number' ? raw.baseLatency : null,
        outputLatency: typeof raw.outputLatency === 'number' ? raw.outputLatency : null
      };
    } catch {
      return { baseLatency: null, outputLatency: null };
    }
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
    if (typeof window === 'undefined') {
      return {
        contextState: 'suspended',
        isContextStarted: false,
        sampleRate: 44100,
        latencyHint: 'interactive'
      };
    }
    return {
      contextState: Tone.getContext().state,
      isContextStarted: this.isContextStarted,
      sampleRate: Tone.getContext().sampleRate,
      latencyHint: String(Tone.getContext().latencyHint)
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

    } catch {
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
    if (typeof window === 'undefined') {
      return false;
    }
    return Tone.getContext().state === 'running' && this.isContextStarted;
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
        // Removido: no hay listener de blur para remover
        window.removeEventListener('focus', () => {});
        document.removeEventListener('visibilitychange', () => {});
      }

    } catch {
    }
  }
}
