import { AudioCommand, AudioOperationResult, AudioOperationType, AudioOrchestrator as IAudioOrchestrator, AudioSystemState } from './types';
import { SoundSourceFactory } from '../factories/SoundSourceFactory';
import { EffectManager } from '../managers/EffectManager';
import { SpatialAudioManager } from '../managers/SpatialAudioManager';
import { AudioContextManager } from '../managers/AudioContextManager';
import { SoundPlaybackManager } from '../managers/SoundPlaybackManager';
import { ParameterManager } from '../managers/ParameterManager';
import { SoundSource } from '../factories/SoundSourceFactory';
import { GlobalEffect } from '../managers/EffectManager';

export class AudioOrchestrator implements IAudioOrchestrator {
  private soundSources: Map<string, SoundSource> = new Map();
  private globalEffects: Map<string, GlobalEffect> = new Map();
  private listenerPosition: [number, number, number] = [0, 0, 0];
  private listenerOrientation: [number, number, number] = [0, 0, 0];
  private contextState: 'suspended' | 'running' | 'closed' = 'suspended';
  private isInitialized: boolean = false;

  // Sub-managers
  private soundSourceFactory: SoundSourceFactory;
  private effectManager: EffectManager;
  private spatialAudioManager: SpatialAudioManager;
  private audioContextManager: AudioContextManager;
  private soundPlaybackManager: SoundPlaybackManager;
  private parameterManager: ParameterManager;

  // Historial de comandos
  private commandHistory: AudioCommand[] = [];
  private maxHistorySize: number = 100;

  // Cola de comandos para operaciones en lote
  private commandQueue: AudioCommand[] = [];
  private isProcessingQueue: boolean = false;

  constructor() {
    this.soundSourceFactory = new SoundSourceFactory();
    this.effectManager = new EffectManager();
    this.spatialAudioManager = new SpatialAudioManager();
    this.audioContextManager = new AudioContextManager();
    this.soundPlaybackManager = new SoundPlaybackManager();
    this.parameterManager = new ParameterManager();
  }

  /**
   * Ejecuta un comando individual
   */
  async executeCommand(command: AudioCommand): Promise<AudioOperationResult> {
    try {
      
      const success = await command.execute();
      
      if (success) {
        // Agregar al historial
        this.addToHistory(command);
        
        // Actualizar estado del sistema
        this.updateSystemState();
        
        return {
          success: true,
          operationId: command.getId(),
          operationType: command.getType() as AudioOperationType,
          message: `Comando ${command.getType()} ejecutado exitosamente`,
          data: { 
            commandId: command.getId(),
            timestamp: Date.now()
          }
        };
      } else {
        return {
          success: false,
          operationId: command.getId(),
          operationType: command.getType() as AudioOperationType,
          message: `Comando ${command.getType()} falló`,
          error: `Error ejecutando comando ${command.getId()}`
        };
      }
    } catch (error) {
      return {
        success: false,
        operationId: command.getId(),
        operationType: command.getType() as AudioOperationType,
        message: `Error ejecutando comando ${command.getType()}`,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Ejecuta múltiples comandos en secuencia
   */
  async executeCommandBatch(commands: AudioCommand[]): Promise<AudioOperationResult[]> {
    
    const results: AudioOperationResult[] = [];
    
    for (const command of commands) {
      const result = await this.executeCommand(command);
      results.push(result);
      
      // Si un comando falla, continuar con los demás pero registrar el error
      if (!result.success) {
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    
    return results;
  }

  /**
   * Agrega comandos a la cola para procesamiento posterior
   */
  queueCommand(command: AudioCommand): void {
    this.commandQueue.push(command);
  }

  /**
   * Procesa todos los comandos en la cola
   */
  async processCommandQueue(): Promise<AudioOperationResult[]> {
    if (this.isProcessingQueue) {
      return [];
    }

    if (this.commandQueue.length === 0) {
      return [];
    }

    this.isProcessingQueue = true;

    try {
      const commands = [...this.commandQueue];
      this.commandQueue = [];
      
      const results = await this.executeCommandBatch(commands);
      
      return results;
    } finally {
      this.isProcessingQueue = false;
    }
  }

  /**
   * Obtiene el estado actual del sistema de audio
   */
  getSystemState(): AudioSystemState {
    return {
      soundSources: new Map(this.soundSources),
      globalEffects: new Map(this.globalEffects),
      listenerPosition: [...this.listenerPosition],
      listenerOrientation: [...this.listenerOrientation],
      contextState: this.contextState,
      isInitialized: this.isInitialized
    };
  }

  /**
   * Inicializa el sistema de audio
   */
  async initialize(): Promise<boolean> {
    try {
      
      // Iniciar contexto de audio
      const contextStarted = await this.audioContextManager.startContext();
      if (!contextStarted) {
        return false;
      }

      // Configurar listener inicial
      this.spatialAudioManager.updateListenerPosition([0, 0, 0]);
      this.spatialAudioManager.updateListenerOrientation([0, 0, 0]);

      this.isInitialized = true;
      this.contextState = 'running';
      
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Limpia todos los recursos del sistema
   */
  async cleanup(): Promise<boolean> {
    try {
      
      // Detener todos los sonidos
      this.soundPlaybackManager.stopAllSounds(this.soundSources);
      
      // Limpiar todos los managers
      this.effectManager.cleanup();
      this.spatialAudioManager.cleanup();
      this.soundPlaybackManager.cleanup();
      
      // Limpiar mapas
      this.soundSources.clear();
      this.globalEffects.clear();
      
      // Limpiar historial y cola
      this.commandHistory = [];
      this.commandQueue = [];
      
      this.isInitialized = false;
      this.contextState = 'closed';
      
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Deshace el último comando ejecutado
   */
  async undoLastCommand(): Promise<boolean> {
    if (this.commandHistory.length === 0) {
      return false;
    }

    const lastCommand = this.commandHistory.pop();
    if (!lastCommand) {
      return false;
    }

    try {
      const success = await lastCommand.undo();
      if (success) {
        this.updateSystemState();
      } else {
      }
      return success;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtiene estadísticas del orquestador
   */
  getOrchestratorStats(): {
    soundSources: number;
    globalEffects: number;
    commandHistory: number;
    queuedCommands: number;
    isInitialized: boolean;
    contextState: string;
  } {
    return {
      soundSources: this.soundSources.size,
      globalEffects: this.globalEffects.size,
      commandHistory: this.commandHistory.length,
      queuedCommands: this.commandQueue.length,
      isInitialized: this.isInitialized,
      contextState: this.contextState
    };
  }

  /**
   * Agrega un comando al historial
   */
  private addToHistory(command: AudioCommand): void {
    this.commandHistory.push(command);
    
    // Limitar el tamaño del historial
    if (this.commandHistory.length > this.maxHistorySize) {
      this.commandHistory.shift();
    }
  }

  /**
   * Actualiza el estado del sistema después de ejecutar comandos
   */
  private updateSystemState(): void {
    // Actualizar mapas desde los managers
    this.globalEffects = this.effectManager.getAllGlobalEffects();
    
    // Actualizar posición del listener
    const listenerState = this.spatialAudioManager.getListenerState();
    this.listenerPosition = listenerState.position;
    this.listenerOrientation = listenerState.orientation;
    
    // Actualizar estado del contexto
    const contextState = this.audioContextManager.getContextState();
    this.contextState = contextState.state;
  }

  /**
   * Obtiene acceso a los sub-managers (para comandos que los necesiten)
   */
  getSubManagers(): {
    soundSourceFactory: SoundSourceFactory;
    effectManager: EffectManager;
    spatialAudioManager: SpatialAudioManager;
    audioContextManager: AudioContextManager;
    soundPlaybackManager: SoundPlaybackManager;
    parameterManager: ParameterManager;
  } {
    return {
      soundSourceFactory: this.soundSourceFactory,
      effectManager: this.effectManager,
      spatialAudioManager: this.spatialAudioManager,
      audioContextManager: this.audioContextManager,
      soundPlaybackManager: this.soundPlaybackManager,
      parameterManager: this.parameterManager
    };
  }

  /**
   * Obtiene acceso al mapa de fuentes de sonido (para comandos que lo necesiten)
   */
  getSoundSources(): Map<string, SoundSource> {
    return this.soundSources;
  }

  /**
   * Establece el mapa de fuentes de sonido (para comandos que lo modifiquen)
   */
  setSoundSources(soundSources: Map<string, SoundSource>): void {
    this.soundSources = soundSources;
  }
}
