import { AudioStateManager as IAudioStateManager, AudioSystemState } from './types';

export class AudioStateManager implements IAudioStateManager {
  private state: AudioSystemState;
  private subscribers: Array<(state: AudioSystemState) => void> = [];
  private stateHistory: AudioSystemState[] = [];
  private maxHistorySize: number = 20;

  constructor(initialState?: Partial<AudioSystemState>) {
    this.state = {
      soundSources: new Map(),
      globalEffects: new Map(),
      listenerPosition: [0, 0, 0],
      listenerOrientation: [0, 0, 0],
      contextState: 'suspended',
      isInitialized: false,
      ...initialState
    };
  }

  /**
   * Obtiene el estado actual del sistema
   */
  getState(): AudioSystemState {
    return {
      soundSources: new Map(this.state.soundSources),
      globalEffects: new Map(this.state.globalEffects),
      listenerPosition: [...this.state.listenerPosition],
      listenerOrientation: [...this.state.listenerOrientation],
      contextState: this.state.contextState,
      isInitialized: this.state.isInitialized
    };
  }

  /**
   * Actualiza el estado del sistema
   */
  updateState(updates: Partial<AudioSystemState>): void {
    // Guardar estado anterior en el historial
    this.addToHistory(this.state);

    // Aplicar actualizaciones
    const newState: AudioSystemState = {
      ...this.state,
      ...updates,
      // Asegurar que los mapas y arrays sean copias profundas
      soundSources: updates.soundSources ? new Map(updates.soundSources) : this.state.soundSources,
      globalEffects: updates.globalEffects ? new Map(updates.globalEffects) : this.state.globalEffects,
      listenerPosition: updates.listenerPosition ? [...updates.listenerPosition] : this.state.listenerPosition,
      listenerOrientation: updates.listenerOrientation ? [...updates.listenerOrientation] : this.state.listenerOrientation,
    };

    this.state = newState;

    // Notificar a los suscriptores
    this.notifySubscribers();

    console.log(`📊 AudioStateManager: Estado actualizado - Fuentes: ${this.state.soundSources.size}, Efectos: ${this.state.globalEffects.size}`);
  }

  /**
   * Suscribe un callback para recibir notificaciones de cambios de estado
   */
  subscribe(callback: (state: AudioSystemState) => void): () => void {
    this.subscribers.push(callback);

    // Retornar función de desuscripción
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  /**
   * Resetea el estado a los valores iniciales
   */
  reset(): void {
    console.log(`🔄 AudioStateManager: Reseteando estado del sistema`);
    
    this.addToHistory(this.state);
    
    this.state = {
      soundSources: new Map(),
      globalEffects: new Map(),
      listenerPosition: [0, 0, 0],
      listenerOrientation: [0, 0, 0],
      contextState: 'suspended',
      isInitialized: false
    };

    this.notifySubscribers();
  }

  /**
   * Obtiene el historial de estados
   */
  getStateHistory(): AudioSystemState[] {
    return [...this.stateHistory];
  }

  /**
   * Restaura el estado desde el historial
   */
  restoreFromHistory(index: number): boolean {
    if (index < 0 || index >= this.stateHistory.length) {
      console.warn(`⚠️ AudioStateManager: Índice de historial inválido: ${index}`);
      return false;
    }

    const previousState = this.stateHistory[index];
    this.updateState(previousState);
    
    console.log(`🔄 AudioStateManager: Estado restaurado desde historial índice ${index}`);
    return true;
  }

  /**
   * Obtiene estadísticas del estado actual
   */
  getStateStats(): {
    soundSourcesCount: number;
    globalEffectsCount: number;
    listenerPosition: [number, number, number];
    listenerOrientation: [number, number, number];
    contextState: string;
    isInitialized: boolean;
    historySize: number;
    subscribersCount: number;
  } {
    return {
      soundSourcesCount: this.state.soundSources.size,
      globalEffectsCount: this.state.globalEffects.size,
      listenerPosition: [...this.state.listenerPosition],
      listenerOrientation: [...this.state.listenerOrientation],
      contextState: this.state.contextState,
      isInitialized: this.state.isInitialized,
      historySize: this.stateHistory.length,
      subscribersCount: this.subscribers.length
    };
  }

  /**
   * Obtiene un snapshot del estado en un momento específico
   */
  getStateSnapshot(): {
    timestamp: number;
    state: AudioSystemState;
    stats: ReturnType<AudioStateManager['getStateStats']>;
  } {
    return {
      timestamp: Date.now(),
      state: this.getState(),
      stats: this.getStateStats()
    };
  }

  /**
   * Limpia el historial de estados
   */
  clearHistory(): void {
    this.stateHistory = [];
    console.log(`🧹 AudioStateManager: Historial de estados limpiado`);
  }

  /**
   * Valida la integridad del estado actual
   */
  validateState(): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validar posición del listener
    if (this.state.listenerPosition.some(coord => !isFinite(coord))) {
      errors.push('Listener position contains invalid coordinates');
    }

    // Validar orientación del listener
    if (this.state.listenerOrientation.some(coord => !isFinite(coord))) {
      errors.push('Listener orientation contains invalid coordinates');
    }

    // Validar estado del contexto
    if (!['suspended', 'running', 'closed'].includes(this.state.contextState)) {
      errors.push('Invalid context state');
    }

    // Validar mapas
    if (!(this.state.soundSources instanceof Map)) {
      errors.push('Sound sources is not a Map');
    }

    if (!(this.state.globalEffects instanceof Map)) {
      errors.push('Global effects is not a Map');
    }

    // Warnings
    if (this.state.soundSources.size > 50) {
      warnings.push('Large number of sound sources may impact performance');
    }

    if (this.state.globalEffects.size > 20) {
      warnings.push('Large number of global effects may impact performance');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Notifica a todos los suscriptores sobre cambios de estado
   */
  private notifySubscribers(): void {
    const currentState = this.getState();
    this.subscribers.forEach(callback => {
      try {
        callback(currentState);
      } catch (error) {
        console.error(`❌ AudioStateManager: Error notificando suscriptor:`, error);
      }
    });
  }

  /**
   * Agrega un estado al historial
   */
  private addToHistory(state: AudioSystemState): void {
    // Crear una copia profunda del estado
    const stateCopy: AudioSystemState = {
      soundSources: new Map(state.soundSources),
      globalEffects: new Map(state.globalEffects),
      listenerPosition: [...state.listenerPosition],
      listenerOrientation: [...state.listenerOrientation],
      contextState: state.contextState,
      isInitialized: state.isInitialized
    };

    this.stateHistory.push(stateCopy);

    // Limitar el tamaño del historial
    if (this.stateHistory.length > this.maxHistorySize) {
      this.stateHistory.shift();
    }
  }

  /**
   * Obtiene información de debugging del estado
   */
  getDebugInfo(): {
    currentState: AudioSystemState;
    history: AudioSystemState[];
    subscribers: number;
    validation: ReturnType<AudioStateManager['validateState']>;
  } {
    return {
      currentState: this.getState(),
      history: this.getStateHistory(),
      subscribers: this.subscribers.length,
      validation: this.validateState()
    };
  }
}
