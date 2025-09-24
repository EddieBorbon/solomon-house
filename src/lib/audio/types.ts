import * as Tone from 'tone';
import { AudioParams, SoundObjectType, SoundSource } from '../factories/SoundSourceFactory';
import { EffectType, GlobalEffect } from '../managers/EffectManager';
import { type EffectZone } from '../../state/useWorldStore';

// Re-exportar tipos existentes para mantener compatibilidad
export type { AudioParams, SoundObjectType, SoundSource, EffectType, GlobalEffect };

// Type for effect parameters
export type EffectParams = EffectZone['effectParams'];

// Tipos para comandos de audio
export interface AudioCommand {
  execute(): Promise<boolean>;
  undo(): Promise<boolean>;
  getType(): string;
  getId(): string;
}

// Tipos para operaciones de audio
export type AudioOperationType = 
  | 'createSoundSource'
  | 'removeSoundSource'
  | 'updateSoundParams'
  | 'updateSoundPosition'
  | 'createGlobalEffect'
  | 'removeGlobalEffect'
  | 'updateGlobalEffect'
  | 'setEffectSendAmount'
  | 'startContinuousSound'
  | 'stopSound'
  | 'triggerNoteAttack'
  | 'triggerAttackRelease'
  | 'updateListenerPosition';

// Interfaz para el estado del sistema de audio
export interface AudioSystemState {
  soundSources: Map<string, SoundSource>;
  globalEffects: Map<string, GlobalEffect>;
  listenerPosition: [number, number, number];
  listenerOrientation: [number, number, number];
  contextState: 'suspended' | 'running' | 'closed';
  isInitialized: boolean;
}

// Interfaz para configuración del sistema de audio
export interface AudioSystemConfig {
  maxSoundSources: number;
  maxGlobalEffects: number;
  defaultVolume: number;
  defaultRampTime: number;
  enableLogging: boolean;
}

// Interfaz para resultados de operaciones
export interface AudioOperationResult {
  success: boolean;
  operationId: string;
  operationType: AudioOperationType;
  message: string;
  data?: any;
  error?: string;
}

// Interfaz para el orquestador de audio
export interface AudioOrchestrator {
  executeCommand(command: AudioCommand): Promise<AudioOperationResult>;
  getSystemState(): AudioSystemState;
  initialize(): Promise<boolean>;
  cleanup(): Promise<boolean>;
}

// Interfaz para el gestor de estado de audio
export interface AudioStateManager {
  getState(): AudioSystemState;
  updateState(updates: Partial<AudioSystemState>): void;
  subscribe(callback: (state: AudioSystemState) => void): () => void;
  reset(): void;
}

// Configuración por defecto
export const DEFAULT_AUDIO_CONFIG: AudioSystemConfig = {
  maxSoundSources: 50,
  maxGlobalEffects: 20,
  defaultVolume: 0.5,
  defaultRampTime: 0.05,
  enableLogging: true
};
