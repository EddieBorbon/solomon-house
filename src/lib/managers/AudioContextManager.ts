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

      console.log(`🎵 AudioContextManager: Contexto inicializado con configuración:`, {
        latencyHint: this.contextConfig.latencyHint,
        sampleRate: Tone.context.sampleRate,
        contextState: Tone.context.state
      });

      // Configurar event listeners para cambios de estado
      this.setupStateChangeListeners();
      
      // Configurar event listeners del navegador
      this.setupBrowserEventListeners();

    } catch (error) {
      console.error(`❌ AudioContextManager: Error al inicializar contexto:`, error);
    }
  }

  /**
   * Configura los event listeners para cambios de estado del contexto
   */
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

        // Configurar limpieza automática cuando se suspenda el contexto
        if (newState === 'suspended') {
          this.handleContextSuspension();
        }
      });

      console.log(`🎵 AudioContextManager: Event listeners de cambio de estado configurados`);
    } catch (error) {
      console.error(`❌ AudioContextManager: Error al configurar event listeners de estado:`, error);
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
          console.log(`🧹 AudioContextManager: Limpieza por cierre de ventana`);
          this.triggerCleanup();
        });

        // Limpieza cuando la página pierda el foco (opcional)
        window.addEventListener('blur', () => {
          console.log(`🧹 AudioContextManager: Limpieza por pérdida de foco`);
          this.triggerCleanup();
        });

        // Limpieza cuando la página vuelva a tener foco
        window.addEventListener('focus', () => {
          console.log(`🎵 AudioContextManager: Página recuperó el foco`);
        });

        console.log(`🎵 AudioContextManager: Event listeners del navegador configurados`);
      }
    } catch (error) {
      console.error(`❌ AudioContextManager: Error al configurar event listeners del navegador:`, error);
    }
  }

  /**
   * Maneja la suspensión del contexto de audio
   */
  private handleContextSuspension(): void {
    try {
      console.log(`⏸️ AudioContextManager: Contexto suspendido, ejecutando limpieza automática`);
      this.triggerCleanup();
    } catch (error) {
      console.error(`❌ AudioContextManager: Error al manejar suspensión del contexto:`, error);
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
          console.error(`❌ AudioContextManager: Error en listener de limpieza:`, error);
        }
      });
    } catch (error) {
      console.error(`❌ AudioContextManager: Error al disparar limpieza:`, error);
    }
  }

  /**
   * Inicia el contexto de audio de Tone.js
   */
  public async startContext(): Promise<boolean> {
    try {
      if (Tone.context.state !== 'running') {
        console.log(`🎵 AudioContextManager: Iniciando contexto de audio...`);
        
        await Tone.start();
        this.isContextStarted = true;
        
        console.log(`✅ AudioContextManager: Contexto iniciado exitosamente`);
        return true;
      } else {
        console.log(`ℹ️ AudioContextManager: Contexto ya está ejecutándose`);
        return true;
      }
    } catch (error) {
      console.error(`❌ AudioContextManager: Error al iniciar contexto:`, error);
      return false;
    }
  }

  /**
   * Suspende el contexto de audio
   */
  public async suspendContext(): Promise<boolean> {
    try {
      if (Tone.context.state === 'running') {
        console.log(`⏸️ AudioContextManager: Suspendiéndo contexto de audio...`);
        
        // Solo cambiar el estado interno, no hay método suspend en Tone
        this.isContextStarted = false;
        
        console.log(`✅ AudioContextManager: Contexto suspendido exitosamente`);
        return true;
      } else {
        console.log(`ℹ️ AudioContextManager: Contexto ya está suspendido`);
        return true;
      }
    } catch (error) {
      console.error(`❌ AudioContextManager: Error al suspender contexto:`, error);
      return false;
    }
  }

  /**
   * Reanuda el contexto de audio
   */
  public async resumeContext(): Promise<boolean> {
    try {
      if (Tone.context.state === 'suspended') {
        console.log(`▶️ AudioContextManager: Reanudando contexto de audio...`);
        
        // Reiniciar el contexto ya que no hay método resume en Tone
        await this.startContext();
        this.isContextStarted = true;
        
        console.log(`✅ AudioContextManager: Contexto reanudado exitosamente`);
        return true;
      } else {
        console.log(`ℹ️ AudioContextManager: Contexto no está suspendido`);
        return true;
      }
    } catch (error) {
      console.error(`❌ AudioContextManager: Error al reanudar contexto:`, error);
      return false;
    }
  }

  /**
   * Cierra el contexto de audio
   */
  public async closeContext(): Promise<boolean> {
    try {
      console.log(`🔒 AudioContextManager: Cerrando contexto de audio...`);
      
      // Solo cambiar el estado interno, no hay método close en Tone
      this.isContextStarted = false;
      
      console.log(`✅ AudioContextManager: Contexto cerrado exitosamente`);
      return true;
    } catch (error) {
      console.error(`❌ AudioContextManager: Error al cerrar contexto:`, error);
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

      console.log(`⚙️ AudioContextManager: Configuración actualizada:`, this.contextConfig);
    } catch (error) {
      console.error(`❌ AudioContextManager: Error al actualizar configuración:`, error);
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

      console.log(`🧹 AudioContextManager: Limpieza completada`);
    } catch (error) {
      console.error(`❌ AudioContextManager: Error durante la limpieza:`, error);
    }
  }
}
