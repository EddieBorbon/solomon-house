import * as Tone from 'tone';
import * as THREE from 'three';
import { SoundSourceFactory, AudioParams, SoundObjectType, SoundSource } from './factories/SoundSourceFactory';
import { EffectManager, EffectType, GlobalEffect } from './managers/EffectManager';
import { SpatialAudioManager, SpatialAudioConfig, ListenerState } from './managers/SpatialAudioManager';
import { AudioContextManager, AudioContextState, AudioContextConfig } from './managers/AudioContextManager';
import { SoundPlaybackManager, PlaybackState, PlaybackConfig } from './managers/SoundPlaybackManager';
import { ParameterManager, ParameterUpdateResult, ParameterConfig } from './managers/ParameterManager';
import { type EffectZone } from '../state/useWorldStore';

// Type for effect parameters
export type EffectParams = EffectZone['effectParams'];

// Re-exportar tipos para mantener compatibilidad
export type { AudioParams, SoundObjectType, SoundSource, EffectType, GlobalEffect, SpatialAudioConfig, ListenerState, AudioContextState, AudioContextConfig, PlaybackState, PlaybackConfig, ParameterUpdateResult, ParameterConfig };

export class AudioManager {
  private static instance: AudioManager;
  private soundSources: Map<string, SoundSource> = new Map();
  private lastSendAmounts: Map<string, number> = new Map(); // Para reducir logs de send amounts
  private soundSourceFactory: SoundSourceFactory;
  private effectManager: EffectManager;
  private spatialAudioManager: SpatialAudioManager;
  private audioContextManager: AudioContextManager;
  private soundPlaybackManager: SoundPlaybackManager;
  private parameterManager: ParameterManager;

  private constructor() {
    // Constructor privado para Singleton
    this.soundSourceFactory = new SoundSourceFactory();
    this.effectManager = new EffectManager();
    this.spatialAudioManager = new SpatialAudioManager();
    this.audioContextManager = new AudioContextManager();
    this.soundPlaybackManager = new SoundPlaybackManager();
    this.parameterManager = new ParameterManager();
    
    // Registrar el AudioManager como listener de limpieza del contexto
    this.audioContextManager.onCleanup(() => {
      this.cleanup();
    });
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  /**
   * Crea un efecto global con espacialización independiente
   */
  public createGlobalEffect(effectId: string, type: EffectType, position: [number, number, number]): void {
    this.effectManager.createGlobalEffect(effectId, type, position);
        
        // Crear sends para todas las fuentes de sonido existentes
    const effectData = this.effectManager.getGlobalEffect(effectId);
    if (effectData) {
        this.soundSources.forEach((source, sourceId) => {
        this.addEffectSendToSource(sourceId, effectId, effectData.effectNode.input.input);
        });
        console.log(`🎛️ AudioManager: Sends creados para ${this.soundSources.size} fuentes de sonido`);
    }
  }

    /**
   * Añade un send de efecto a una fuente de sonido existente
   */
  private addEffectSendToSource(sourceId: string, effectId: string, effectNode: AudioNode): void {
    try {
      const source = this.soundSources.get(sourceId);
      if (!source) {
        console.warn(`⚠️ AudioManager: No se encontró fuente de sonido ${sourceId} para crear send de efecto`);
        return;
      }

      // Crear el send de efecto
      const send = new Tone.Gain(0); // Inicialmente silenciado
      source.effectSends.set(effectId, send);
      
      // Conectar synth -> send -> efecto
      source.synth.connect(send);
      send.connect(effectNode);
      
      console.log(`🎛️ AudioManager: Send de efecto ${effectId} creado para fuente ${sourceId}`);
    } catch {
      console.error(`❌ AudioManager: Error al crear send de efecto`);
    }
  }



  /**
   * Obtiene un efecto global por ID
   */
  public getGlobalEffect(effectId: string): GlobalEffect | undefined {
    return this.effectManager.getGlobalEffect(effectId);
  }

  /**
   * Actualiza los parámetros de un efecto global
   */
  public updateGlobalEffect(effectId: string, params: EffectParams): void {
    this.effectManager.updateGlobalEffect(effectId, params);
  }

  /**
   * Fuerza la actualización de un efecto global reiniciando su oscilador de prueba
   */
  public refreshGlobalEffect(effectId: string): void {
    this.effectManager.refreshGlobalEffect(effectId);
  }

  /**
   * Elimina un efecto global
   */
  public removeGlobalEffect(effectId: string): void {
        // Limpiar todas las conexiones a fuentes de sonido antes de eliminar
        this.cleanupEffectSourceConnections(effectId);
        
    // Eliminar el efecto usando el EffectManager
    this.effectManager.removeGlobalEffect(effectId);
  }

  /**
   * Fuerza la actualización de todos los efectos globales activos
   */
  public refreshAllGlobalEffects(): void {
    this.effectManager.refreshAllGlobalEffects();
  }



  /**
   * Fuerza la actualización de un efecto específico con estrategias optimizadas
   */
  public forceEffectUpdate(effectId: string, paramName: string, newValue: number | string): void {
    this.effectManager.forceEffectUpdate(effectId, paramName, newValue);
  }

  /**
   * Limpia todas las conexiones de una fuente de sonido a efectos específicos
   */
  private cleanupSourceEffectConnections(soundSourceId: string): void {
    const source = this.soundSources.get(soundSourceId);
    if (!source) return;

    source.effectSends.forEach((send) => {
      try {
        send.disconnect();
      } catch {
        // Manejo silencioso de errores
      }
    });
  }

  /**
   * Limpia todas las conexiones de un efecto global a fuentes de sonido
   */
  private cleanupEffectSourceConnections(effectId: string): void {
    this.soundSources.forEach((source) => {
      try {
        const effectSend = source.effectSends.get(effectId);
        if (effectSend) {
          effectSend.disconnect();
        }
      } catch {
        // Manejo silencioso de errores
      }
    });
  }

  /**
   * Valida que el contexto de audio esté en estado válido
   */
  private isAudioContextValid(effectSend: Tone.Gain, dryGain: Tone.Gain): boolean {
    return effectSend.context && dryGain.context &&
           effectSend.context.state === 'running' && dryGain.context.state === 'running' &&
           !effectSend.disposed && !dryGain.disposed;
  }

  /**
   * Controla la cantidad de señal enviada a un efecto específico
   */
  public setEffectSendAmount(soundSourceId: string, effectId: string, amount: number): void {
    try {
      const source = this.soundSources.get(soundSourceId);
      if (!source) return;

      const effectSend = source.effectSends.get(effectId);
      if (!effectSend) return;

      if (!this.isAudioContextValid(effectSend, source.dryGain)) return;
      
      // Aplicar crossfade entre señal seca y efecto
      const effectAmount = Math.max(0, Math.min(1, amount));
      const dryAmount = Math.max(0, Math.min(1, 1 - effectAmount));
      
      effectSend.gain.setValueAtTime(effectAmount, Tone.now());
      source.dryGain.gain.setValueAtTime(dryAmount, Tone.now());
      
      // Registrar cambios significativos
      const currentSendAmount = Math.round(amount * 10) / 10;
      const key = `${soundSourceId}-${effectId}`;
      if (this.lastSendAmounts.get(key) !== currentSendAmount) {
        this.lastSendAmounts.set(key, currentSendAmount);
      }
    } catch {
      console.error(`❌ AudioManager: Error al establecer send amount`);
    }
  }

  /**
   * Limpieza de emergencia para errores críticos
   */
  public emergencyCleanup(): void {
    try {
      this.soundPlaybackManager.stopAllSounds(this.soundSources);
      this.lastSendAmounts.clear();
      this.effectManager.cleanup();
      this.soundSources.clear();
    } catch {
      console.error(`❌ AudioManager: Error en emergency cleanup`);
    }
  }

  /**
   * Limpia todas las conexiones y recursos del AudioManager
   */
  public cleanup(): void {
    try {
      // Detener todos los sonidos activos
      this.soundPlaybackManager.stopAllSounds(this.soundSources);
      
      // Limpiar todas las conexiones de fuentes de sonido
      this.soundSources.forEach((source, sourceId) => {
        this.cleanupSourceEffectConnections(sourceId);
      });
      
      // Limpiar todos los managers
      this.effectManager.cleanup();
      this.spatialAudioManager.cleanup();
      this.soundPlaybackManager.cleanup();
      
      // Limpiar el Map de send amounts
      this.lastSendAmounts.clear();
    } catch {
      console.error(`❌ AudioManager: Error en cleanup`);
    }
  }

  /**
   * Inicia el contexto de audio de Tone.js
   */
  public async startContext(): Promise<boolean> {
    return this.audioContextManager.startContext();
  }

  /**
   * Crea una nueva fuente de sonido usando la factory
   */
  public createSoundSource(
    id: string, 
    type: SoundObjectType, 
    params: AudioParams, 
    position: [number, number, number]
  ): void {
    if (this.soundSources.has(id)) return;

    try {
      const soundSource = this.soundSourceFactory.createSoundSource(
        id, 
        type, 
        params, 
        position, 
        this.effectManager.getAllGlobalEffects()
      );

      this.soundSources.set(id, soundSource);
      this.updateSoundEffectMixing(id, position);
    } catch {
      console.error(`❌ AudioManager: Error al crear fuente de sonido`);
    }
  }

  /**
   * Elimina una fuente de sonido
   */
  public removeSoundSource(id: string): void {
    const source = this.soundSources.get(id);
    if (!source) return;

    try {
      // Detener el sonido si está sonando
      if (this.soundPlaybackManager.isSoundPlaying(id)) {
        this.soundPlaybackManager.stopSound(id, source);
      }

      // Limpiar todas las conexiones
      this.cleanupSourceEffectConnections(id);
      source.panner.disconnect();
      source.dryGain.disconnect();
      source.synth.disconnect();

      // Limpiar recursos
      source.synth.dispose();
      source.panner.dispose();
      source.dryGain.dispose();
      
      // Disponer todos los sends de efectos
      source.effectSends.forEach((send) => {
        try {
          send.dispose();
        } catch {
          // Manejo silencioso de errores
        }
      });

      // Eliminar del Map y limpiar el estado
      this.soundSources.delete(id);
      this.soundPlaybackManager.removePlaybackState(id);
    } catch {
      console.error(`❌ AudioManager: Error al eliminar fuente de sonido`);
    }
  }

  /**
   * Inicia el sonido continuo de una fuente (completamente independiente de las interacciones de clic)
   */
  public startContinuousSound(id: string, params: AudioParams): void {
    const source = this.soundSources.get(id);
    if (!source) {
      return;
    }

    this.soundPlaybackManager.startContinuousSound(
      id, 
      source, 
      params, 
      this.updateSoundParams.bind(this)
    );
  }

  /**
   * Inicia el sonido de una fuente (para gate y sonidos temporales)
   */
  public startSound(id: string, params: AudioParams): void {
    const source = this.soundSources.get(id);
    if (!source) {
      return;
    }

    this.soundPlaybackManager.startSound(
      id, 
      source, 
      params, 
      this.updateSoundParams.bind(this)
    );
  }

  /**
   * Detiene el sonido de una fuente
   */
  public stopSound(id: string): void {
    const source = this.soundSources.get(id);
    if (!source) {
      return;
    }

    this.soundPlaybackManager.stopSound(id, source);
  }

  /**
   * Dispara una nota percusiva (especialmente para MembraneSynth y Sampler)
   */
  public triggerNoteAttack(id: string, params: AudioParams): void {
    const source = this.soundSources.get(id);
    if (!source) {
      return;
    }

    this.soundPlaybackManager.triggerNoteAttack(
      id, 
      source, 
      params, 
      this.updateSoundParams.bind(this)
    );
  }

  /**
   * Dispara una nota con duración específica (para interacción de clic corto)
   * Este método funciona universalmente con todos los tipos de sintetizadores
   */
  public triggerAttackRelease(id: string, params: AudioParams): void {
    const source = this.soundSources.get(id);
    if (!source) {
      return;
    }

    this.soundPlaybackManager.triggerAttackRelease(
      id, 
      source, 
      params, 
      this.updateSoundParams.bind(this)
    );
  }

  /**
   * Dispara un ataque de ruido (especialmente para NoiseSynth)
   */
  public triggerNoiseAttack(id: string, params: AudioParams): void {
    const source = this.soundSources.get(id);
    if (!source) {
      return;
    }

    this.soundPlaybackManager.triggerNoiseAttack(
      id, 
      source, 
      params, 
      this.updateSoundParams.bind(this)
    );
  }

  /**
   * Actualiza los parámetros de sonido de una fuente
   */
  public updateSoundParams(id: string, params: Partial<AudioParams>): ParameterUpdateResult {
    const source = this.soundSources.get(id);
    if (!source) {
      return {
        success: false,
        updatedParams: [],
        errors: [`No se encontró fuente de sonido con ID: ${id}`]
      };
    }

    return this.parameterManager.updateSoundParams(source, params);
  }

    /**
   * Obtiene la posición actual de una fuente de sonido desde su panner
   */
  private getSoundSourcePosition(source: SoundSource): [number, number, number] {
    return [
      source.panner.positionX.value,
      source.panner.positionY.value,
      source.panner.positionZ.value
    ];
  }

  /**
   * Actualiza la mezcla de efectos para todos los objetos sonoros
   */
  private updateAllSoundEffectMixing(): void {
    this.soundSources.forEach((source, soundId) => {
      const soundPosition = this.getSoundSourcePosition(source);
      this.updateSoundEffectMixing(soundId, soundPosition);
    });
  }

  /**
   * Actualiza la posición 3D de una zona de efecto
   */
  public updateEffectZonePosition(id: string, position: [number, number, number]): void {
    this.effectManager.updateEffectZonePosition(id, position);
    this.updateAllSoundEffectMixing();
  }

  /**
   * Actualiza la posición 3D de una fuente de sonido
   */
  public updateSoundPosition(id: string, position: [number, number, number]): void {
    const source = this.soundSources.get(id);
    if (!source) return;

    try {
      // Actualizar la posición del panner usando el SpatialAudioManager
      this.spatialAudioManager.updatePannerPosition(source.panner, position);
      
      // Actualizar la mezcla de efectos basada en la nueva posición
      this.updateSoundEffectMixing(id, position);
    } catch {
      console.error(`❌ AudioManager: Error al actualizar posición de sonido`);
    }
  }

  /**
   * Configura el radio de una zona de efectos
   */
  public setEffectZoneRadius(effectId: string, radius: number): void {
    this.effectManager.setEffectZoneRadius(effectId, radius);
    this.updateAllSoundEffectMixing();
  }

  /**
   * Obtiene el radio de una zona de efectos
   */
  public getEffectZoneRadius(effectId: string): number {
    return this.effectManager.getEffectZoneRadius(effectId);
  }

  /**
   * Actualiza la mezcla de efectos para una fuente de sonido basada en su posición
   */
  private updateSoundEffectMixing(soundId: string, soundPosition: [number, number, number]): void {
    const source = this.soundSources.get(soundId);
    if (!source) return;

    try {
      const globalEffects = this.effectManager.getAllGlobalEffects();
      
      // Calcular la mezcla para cada efecto global
      globalEffects.forEach((effectData, effectId) => {
        const send = source.effectSends.get(effectId);
        if (!send) return;

        const effectPosition = effectData.position;
        const effectRadius = this.getEffectZoneRadius(effectId);
        const effectIntensity = this.spatialAudioManager.calculateEffectIntensity(
          soundPosition, 
          effectPosition, 
          effectRadius
        );

        // Aplicar la intensidad al send del efecto
        send.gain.setValueAtTime(effectIntensity, Tone.now());
        
        // Ajustar el dry gain (seco) inversamente
        const dryIntensity = 1.0 - effectIntensity;
        source.dryGain.gain.setValueAtTime(dryIntensity, Tone.now());

        // Registrar cambios significativos
        const lastIntensity = this.lastSendAmounts.get(`${soundId}-${effectId}`) || 0;
        if (Math.abs(effectIntensity - lastIntensity) > 0.1) {
          this.lastSendAmounts.set(`${soundId}-${effectId}`, effectIntensity);
        }
      });
    } catch {
      console.error(`❌ AudioManager: Error al actualizar mezcla de efectos`);
    }
  }

  /**
   * Actualiza la posición y orientación del oyente global de Tone.js
   */
  public updateListener(position: THREE.Vector3, forward: THREE.Vector3): void {
    this.spatialAudioManager.updateListener(position, forward);
  }

  /**
   * Obtiene el estado de una fuente de sonido
   */
  public getSoundSourceState(id: string): boolean {
    const source = this.soundSources.get(id);
    if (!source) return false;
    
    // Verificar si existe la fuente
    return true;
  }

  /**
   * Verifica si una fuente de sonido está activamente sonando
   */
  public isSoundPlaying(id: string): boolean {
    return this.soundPlaybackManager.isSoundPlaying(id);
  }

  /**
   * Obtiene información de debug
   */
  public getDebugInfo(): {
    contextState: string;
    soundSourcesCount: number;
    soundSourceIds: string[];
    contextDebugInfo: object;
    playbackDebugInfo: object;
    parameterDebugInfo: object;
  } {
    return {
      contextState: Tone.context.state,
      soundSourcesCount: this.soundSources.size,
      soundSourceIds: Array.from(this.soundSources.keys()),
      contextDebugInfo: this.audioContextManager.getDebugInfo(),
      playbackDebugInfo: this.soundPlaybackManager.getDebugInfo(),
      parameterDebugInfo: this.parameterManager.getDebugInfo(),
    };
  }

  // ===== MÉTODOS DELEGADOS PARA AUDIO CONTEXT MANAGER =====

  /**
   * Suspende el contexto de audio
   */
  public async suspendContext(): Promise<boolean> {
    return this.audioContextManager.suspendContext();
  }

  /**
   * Reanuda el contexto de audio
   */
  public async resumeContext(): Promise<boolean> {
    return this.audioContextManager.resumeContext();
  }

  /**
   * Cierra el contexto de audio
   */
  public async closeContext(): Promise<boolean> {
    return this.audioContextManager.closeContext();
  }

  /**
   * Verifica si el contexto está ejecutándose
   */
  public isContextRunning(): boolean {
    return this.audioContextManager.isContextRunning();
  }

  /**
   * Verifica si el contexto está iniciado
   */
  public isContextStarted(): boolean {
    return this.audioContextManager.getContextStarted();
  }

  /**
   * Obtiene el estado actual del contexto
   */
  public getContextState(): AudioContextState {
    return this.audioContextManager.getContextState();
  }

  /**
   * Registra un listener para cambios de estado del contexto
   */
  public onContextStateChange(listener: (state: string) => void): void {
    this.audioContextManager.onStateChange(listener);
  }

  /**
   * Registra un listener para eventos de limpieza del contexto
   */
  public onContextCleanup(listener: () => void): void {
    this.audioContextManager.onCleanup(listener);
  }

  /**
   * Actualiza la configuración del contexto
   */
  public updateContextConfig(config: Partial<AudioContextConfig>): void {
    this.audioContextManager.updateConfig(config);
  }

  /**
   * Obtiene la configuración actual del contexto
   */
  public getContextConfig(): AudioContextConfig {
    return this.audioContextManager.getConfig();
  }

  /**
   * Verifica si el contexto está en un estado válido para operaciones de audio
   */
  public isContextValid(): boolean {
    return this.audioContextManager.isContextValid();
  }

  /**
   * Espera a que el contexto esté listo para operaciones de audio
   */
  public async waitForContextReady(): Promise<void> {
    return this.audioContextManager.waitForContextReady();
  }

  // ===== MÉTODOS DELEGADOS PARA SOUND PLAYBACK MANAGER =====

  /**
   * Obtiene el estado de reproducción de un sonido
   */
  public getPlaybackState(soundId: string): PlaybackState | undefined {
    return this.soundPlaybackManager.getPlaybackState(soundId);
  }

  /**
   * Obtiene todos los sonidos que están reproduciéndose
   */
  public getPlayingSounds(): Set<string> {
    return this.soundPlaybackManager.getPlayingSounds();
  }

  /**
   * Actualiza la configuración del SoundPlaybackManager
   */
  public updatePlaybackConfig(config: Partial<PlaybackConfig>): void {
    this.soundPlaybackManager.updateConfig(config);
  }

  /**
   * Obtiene la configuración actual del SoundPlaybackManager
   */
  public getPlaybackConfig(): PlaybackConfig {
    return this.soundPlaybackManager.getConfig();
  }

  // ===== MÉTODOS DELEGADOS PARA PARAMETER MANAGER =====

  /**
   * Valida un conjunto de parámetros antes de aplicarlos
   */
  public validateParams(params: Partial<AudioParams>): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    return this.parameterManager.validateParams(params);
  }

  /**
   * Actualiza la configuración del ParameterManager
   */
  public updateParameterConfig(config: Partial<ParameterConfig>): void {
    this.parameterManager.updateConfig(config);
  }

  /**
   * Obtiene la configuración actual del ParameterManager
   */
  public getParameterConfig(): ParameterConfig {
    return this.parameterManager.getConfig();
  }

  /**
   * Función de debug para verificar el estado completo de la cadena de audio
   */
  public debugAudioChain(soundId: string): void {
    const source = this.soundSources.get(soundId);
    if (!source) {
      console.log(`❌ Debug: No se encontró fuente de sonido ${soundId}`);
      return;
    }

    console.log(`🔍 DEBUG COMPLETO - Fuente de sonido ${soundId}:`);
    console.log(`📍 Posición del panner: [${source.panner.positionX.value}, ${source.panner.positionY.value}, ${source.panner.positionZ.value}]`);
    console.log(`🔊 Dry Gain: ${source.dryGain.gain.value}`);
    console.log(`🎛️ Effect Sends: ${source.effectSends.size}`);
    
    source.effectSends.forEach((send, effectId) => {
      console.log(`  └─ Send ${effectId}: Gain = ${send.gain.value}`);
    });

    // Verificar efectos globales
    const globalEffects = this.effectManager.getAllGlobalEffects();
    globalEffects.forEach((effectData, effectId) => {
      console.log(`🎛️ Efecto ${effectId}:`, {
        tipo: effectData.effectNode.constructor.name,
        posicion: effectData.position,
        radio: this.getEffectZoneRadius(effectId)
      });
    });
  }


}

// Exportar una única instancia global
export const audioManager = AudioManager.getInstance();