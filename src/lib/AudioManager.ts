import * as Tone from 'tone';
import * as THREE from 'three';
import { SoundSourceFactory, AudioParams, SoundObjectType, SoundSource } from './factories/SoundSourceFactory';
import { EffectManager, EffectType, GlobalEffect } from './managers/EffectManager';
import { SpatialAudioManager, SpatialAudioConfig, ListenerState } from './managers/SpatialAudioManager';
import { AudioContextManager, AudioContextState, AudioContextConfig } from './managers/AudioContextManager';
import { SoundPlaybackManager, PlaybackState, PlaybackConfig } from './managers/SoundPlaybackManager';
import { ParameterManager, ParameterUpdateResult, ParameterConfig } from './managers/ParameterManager';
import { VoiceAllocator } from './managers/VoiceAllocator';
import { SofaSpatializer } from './audio/sofa/SofaSpatializer';
import { type HrirSet } from './audio/sofa/sofaLoader';
import { NativeVoice, audioParamsToNative, type NativeWaveform } from './audio/native/NativeVoice';
import { runEngineComparison } from './audio/native/engineBenchmark';
import { csoundEngine } from './audio/csound/CsoundEngine';
import { type EffectZone } from '../state/useWorldStore';

/**
 * Motor de audio nativo opt-in (roadmap 2.1.c): con
 * NEXT_PUBLIC_AUDIO_ENGINE=native, los tipos de síntesis simple se crean
 * con nodos puros de la Web Audio API (NativeVoice) en lugar de Tone.js.
 * La síntesis compleja (FM, Duo, Metal, Poly, Sampler…) sigue en Tone
 * durante la transición.
 */
// Motor por defecto: Web Audio nativo (roadmap 2.1, migración completa).
// Escape: NEXT_PUBLIC_AUDIO_ENGINE=tone fuerza el motor Tone.js heredado.
const AUDIO_ENGINE = process.env.NEXT_PUBLIC_AUDIO_ENGINE ?? 'native';
const NATIVE_ENGINE_ENABLED = AUDIO_ENGINE === 'native';
// Todos los tipos de objeto sonoro tienen modelo de síntesis nativo
const NATIVE_ENGINE_TYPES = new Set<SoundObjectType>([
  'cube', 'sphere', 'cylinder', 'cone', 'pyramid',
  'icosahedron', 'plane', 'torus', 'dodecahedronRing', 'spiral',
]);

/** Modelo de síntesis nativo por tipo de objeto (réplica del synth Tone). */
const NATIVE_MODEL_BY_TYPE: Record<string, import('./audio/native/NativeVoice').NativeSynthModel> = {
  cube: 'am',
  sphere: 'fm',
  cylinder: 'duo',
  cone: 'membrane',
  pyramid: 'mono',
  icosahedron: 'metal',
  plane: 'noise',
  torus: 'pluck',
  dodecahedronRing: 'poly',
  spiral: 'sampler',
};

/**
 * Motor Csound WASM opt-in (roadmap 2.3.c): con
 * NEXT_PUBLIC_AUDIO_ENGINE=csound, los tipos simples se sintetizan con la
 * orquesta de Csound (FM + filtro Moog) controlada por canales vinculados
 * a la frecuencia y la posición 3D. Carga perezosa (~6 MB) solo bajo esta
 * bandera; el resto sigue en Tone.
 */
const CSOUND_ENGINE_ENABLED = AUDIO_ENGINE === 'csound';
const CSOUND_ENGINE_TYPES = new Set<SoundObjectType>(['cube']);

// Type for effect parameters
export type EffectParams = EffectZone['effectParams'];

// Re-exportar tipos para mantener compatibilidad
export type { AudioParams, SoundObjectType, SoundSource, EffectType, GlobalEffect, SpatialAudioConfig, ListenerState, AudioContextState, AudioContextConfig, PlaybackState, PlaybackConfig, ParameterUpdateResult, ParameterConfig };

export class AudioManager {
  private static instance: AudioManager;
  private soundSources: Map<string, SoundSource> = new Map();
  private lastSendAmounts: Map<string, number> = new Map(); // Para reducir logs de send amounts
  private warnedMissingSends: Set<string> = new Set(); // Para evitar logs repetitivos
  private soundSourceFactory: SoundSourceFactory;
  private effectManager: EffectManager;
  private spatialAudioManager: SpatialAudioManager;
  private audioContextManager: AudioContextManager;
  private soundPlaybackManager: SoundPlaybackManager;
  private parameterManager: ParameterManager;
  private voiceAllocator: VoiceAllocator;
  private sofaSpatializer: SofaSpatializer;
  private customHrtfEnabled = false;
  /** Voces del motor nativo (2.1.c), paralelas a soundSources de Tone */
  private nativeVoices: Map<string, NativeVoice> = new Map();

  private constructor() {
    // Constructor privado para Singleton
    this.soundSourceFactory = new SoundSourceFactory();
    this.effectManager = new EffectManager();
    this.spatialAudioManager = new SpatialAudioManager();
    this.audioContextManager = new AudioContextManager();
    this.soundPlaybackManager = new SoundPlaybackManager();
    this.parameterManager = new ParameterManager();
    this.voiceAllocator = new VoiceAllocator();
    this.sofaSpatializer = new SofaSpatializer(() =>
      this.spatialAudioManager.getSpatialConfig()
    );

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
      const effectInput = effectData.effectNode.input.input;
      this.soundSources.forEach((source, sourceId) => {
        this.addEffectSendToSource(sourceId, effectId, effectInput);
      });
      // Motor nativo (2.1.d): sends desde las voces nativas al mismo efecto
      this.nativeVoices.forEach((voice) => {
        voice.addEffectSend(effectId, effectInput as unknown as AudioNode);
      });
    }
  }

  /**
 * Añade un send de efecto a una fuente de sonido existente
 */
  private addEffectSendToSource(sourceId: string, effectId: string, effectNode: AudioNode): void {
    try {
      const source = this.soundSources.get(sourceId);
      if (!source) {
        return;
      }

      // Crear el send de efecto
      const send = new Tone.Gain(0); // Inicialmente silenciado
      source.effectSends.set(effectId, send);

      // Conectar synth -> send -> efecto
      source.synth.connect(send);
      send.connect(effectNode);

    } catch {
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
  public forceEffectUpdate(effectId: string, paramName: string): void {
    this.effectManager.forceEffectUpdate(effectId, paramName);
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
    // Motor nativo (2.1.d): retirar el send de cada voz nativa
    this.nativeVoices.forEach((voice) => {
      voice.removeEffectSend(effectId);
      voice.setDryGain(1.0);
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
   * Verifica si un EffectSend existe para una fuente de sonido
   */
  public hasEffectSend(soundSourceId: string, effectId: string): boolean {
    const source = this.soundSources.get(soundSourceId);
    if (!source) return false;
    return source.effectSends.has(effectId);
  }

  /**
   * Controla la cantidad de señal enviada a un efecto específico
   */
  public setEffectSendAmount(soundSourceId: string, effectId: string, amount: number): void {
    try {
      const source = this.soundSources.get(soundSourceId);
      if (!source) {
        // Solo loguear la primera vez que falta la fuente
        const warningKey = `source:${soundSourceId}`;
        if (!this.warnedMissingSends.has(warningKey)) {
          console.warn(`⚠️ AudioManager: Fuente de sonido ${soundSourceId} no encontrada`);
          this.warnedMissingSends.add(warningKey);
        }
        return;
      }

      const effectSend = source.effectSends.get(effectId);
      if (!effectSend) {
        // Silenciar: simplemente retornar sin loguear (puede ser normal durante inicialización o cuando el objeto no tiene ese efecto configurado)
        return;
      }

      if (!this.isAudioContextValid(effectSend, source.dryGain)) return;

      // Aplicar crossfade entre señal seca y efecto
      const effectAmount = Math.max(0, Math.min(1, amount));
      const dryAmount = Math.max(0, Math.min(1, 1 - effectAmount));

      effectSend.gain.setValueAtTime(effectAmount, Tone.now());
      source.dryGain.gain.setValueAtTime(dryAmount, Tone.now());

      // Debug: Log cuando el amount es significativo
      if (amount > 0.1) {
        console.log(`🎛️ AudioManager: Aplicando efecto ${effectId} a ${soundSourceId} con amount: ${amount.toFixed(2)}`);
      }

      // Registrar cambios significativos
      const currentSendAmount = Math.round(amount * 10) / 10;
      const key = `${soundSourceId}-${effectId}`;
      if (this.lastSendAmounts.get(key) !== currentSendAmount) {
        this.lastSendAmounts.set(key, currentSendAmount);
      }
    } catch (error) {
      console.error(`❌ AudioManager: Error en setEffectSendAmount:`, error);
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
      this.sofaSpatializer.detachAll();

      // Liberar las voces del motor nativo (2.1.c / 2.5)
      this.nativeVoices.forEach((voice) => voice.dispose());
      this.nativeVoices.clear();

      // Limpiar el Map de send amounts
      this.lastSendAmounts.clear();
    } catch {
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
    if (this.soundSources.has(id) || this.nativeVoices.has(id) || csoundEngine.hasVoice(id)) return;

    // Motor Csound WASM opt-in (2.3.c): orquesta FM controlada por canales
    if (CSOUND_ENGINE_ENABLED && CSOUND_ENGINE_TYPES.has(type)) {
      this.allocateVoice();
      csoundEngine
        .createVoice(
          id,
          {
            frequency: params.frequency || 440,
            volume: params.volume ?? 0.5,
            harmonicity: params.harmonicity ?? 1.5,
          },
          position
        )
        .then(() => console.log(`🎛️ Csound: voz creada para ${id} (${type})`))
        .catch((error) => console.error(`❌ Csound: error creando voz ${id}:`, error));
      return;
    }

    // Motor nativo (2.1): un modelo de síntesis por tipo de objeto
    if (NATIVE_ENGINE_ENABLED && NATIVE_ENGINE_TYPES.has(type)) {
      try {
        const model = NATIVE_MODEL_BY_TYPE[type] ?? 'am';
        const basicWaveforms: NativeWaveform[] = ['sine', 'square', 'triangle', 'sawtooth'];
        const waveform = basicWaveforms.includes(params.waveform as NativeWaveform)
          ? (params.waveform as NativeWaveform)
          : 'sine';
        const voice = new NativeVoice(
          {
            frequency: params.frequency || 440,
            waveform,
            volume: params.volume ?? 0.5,
            model,
            // Armonicidad por defecto para los modelos modulados (AM/FM)
            harmonicity: params.harmonicity ?? (model === 'fm' ? 2 : model === 'am' ? 3 : 0),
            // Muestra del usuario para el modelo sampler (objeto espiral, 2.7)
            sampleUrl: params.urls?.C4,
            ...audioParamsToNative(params),
          },
          position
        );
        this.nativeVoices.set(id, voice);

        // Conectar la voz a los efectos globales existentes (2.1.d)
        this.effectManager.getAllGlobalEffects().forEach((effectData, effectId) => {
          voice.addEffectSend(effectId, effectData.effectNode.input.input as unknown as AudioNode);
        });
        this.updateNativeVoiceEffectMixing(id, position);

        console.log(`🔈 Motor nativo: voz creada para ${id} (${type})`);
      } catch (error) {
        console.error(`❌ Motor nativo: error creando voz ${id}:`, error);
      }
      return;
    }

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

      // Si hay un perfil HRTF personalizado activo, enrutar la nueva fuente
      // por convolución binaural en lugar del PannerNode estándar
      if (this.customHrtfEnabled) {
        this.routeSourceThroughCustomHrtf(id, soundSource, position);
      }
    } catch (error) {
      console.error(`❌ AudioManager: Error creando fuente de sonido ${id}:`, error);
    }
  }

  /**
   * Re-enruta una fuente por el espacializador SOFA (roadmap 4.2):
   * silencia el camino del Panner3D estándar y conecta
   * `synth → convolución binaural → dryGain`.
   */
  private routeSourceThroughCustomHrtf(
    id: string,
    source: SoundSource,
    position: [number, number, number]
  ): void {
    try {
      source.panner.disconnect();
      this.sofaSpatializer.attach(id, source.synth, source.dryGain, position);
    } catch {
      // Fuente en proceso de liberación
    }
  }

  /**
   * Activa la espacialización con un perfil HRTF personalizado SOFA
   * (roadmap 4.1-4.3), re-enrutando todas las fuentes existentes.
   */
  public enableCustomHrtf(set: HrirSet): void {
    this.sofaSpatializer.setHrirSet(set);

    if (!this.customHrtfEnabled) {
      this.customHrtfEnabled = true;
      this.soundSources.forEach((source, id) => {
        if (!this.sofaSpatializer.hasSource(id)) {
          this.routeSourceThroughCustomHrtf(id, source, this.getSoundSourcePosition(source));
        }
      });
    }
  }

  /**
   * Desactiva el perfil personalizado y restaura el PannerNode HRTF
   * estandarizado del navegador en todas las fuentes.
   */
  public disableCustomHrtf(): void {
    if (!this.customHrtfEnabled) return;
    this.customHrtfEnabled = false;
    this.sofaSpatializer.detachAll();

    this.soundSources.forEach((source) => {
      try {
        source.panner.connect(source.dryGain);
      } catch {
        // Fuente en proceso de liberación
      }
    });
  }

  public isCustomHrtfEnabled(): boolean {
    return this.customHrtfEnabled;
  }

  public getCustomHrtfProfileName(): string | null {
    return this.sofaSpatializer.getHrirSet()?.name ?? null;
  }

  /**
   * Elimina una fuente de sonido
   */
  public removeSoundSource(id: string): void {
    console.log('🎵 AudioManager: removeSoundSource called', id);

    // Motor Csound (2.3.c)
    if (csoundEngine.hasVoice(id)) {
      csoundEngine.removeVoice(id).catch(() => {});
      return;
    }

    // Motor nativo (2.1.c)
    const nativeVoice = this.nativeVoices.get(id);
    if (nativeVoice) {
      nativeVoice.dispose();
      this.nativeVoices.delete(id);
      return;
    }

    const source = this.soundSources.get(id);
    if (!source) {
      console.warn('⚠️ AudioManager: Sound source not found', id);
      return;
    }

    try {
      console.log('🎵 AudioManager: Found sound source, stopping audio');

      // Detener el sonido si está sonando
      if (this.soundPlaybackManager.isSoundPlaying(id)) {
        console.log('🔧 AudioManager: Stopping sound playback');
        this.soundPlaybackManager.stopSound(id, source);
        console.log('✅ AudioManager: Sound stopped');
      } else {
        console.log('ℹ️ AudioManager: Sound was not playing');
      }

      // Limpiar todas las conexiones
      console.log('🔧 AudioManager: Cleaning up connections');
      this.sofaSpatializer.detach(id);
      this.cleanupSourceEffectConnections(id);
      source.panner.disconnect();
      source.dryGain.disconnect();
      source.synth.disconnect();

      // Limpiar recursos
      console.log('🔧 AudioManager: Disposing resources');
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
      console.log('✅ AudioManager: Sound source removed successfully');

    } catch (error) {
      console.error('❌ AudioManager: Error removing sound source:', error);
    }
  }

  /**
   * Aplica la política de voces (roadmap 2.4): si el presupuesto de voces
   * del dispositivo está agotado, roba (detiene) las voces más antiguas
   * antes de admitir una nueva.
   */
  private allocateVoice(): void {
    const activeVoices = Array.from(this.soundPlaybackManager.getPlayingSounds()).map((id) => ({
      id,
      startTime: this.soundPlaybackManager.getPlaybackState(id)?.startTime ?? 0,
    }));

    // Incluir las voces nativas activas en el presupuesto (2.1.d / 2.4)
    this.nativeVoices.forEach((voice, id) => {
      if (voice.isPlaying()) {
        activeVoices.push({ id, startTime: voice.getStartTime() });
      }
    });

    const toSteal = this.voiceAllocator.requestVoice(activeVoices);
    for (const stolenId of toSteal) {
      const stolenNative = this.nativeVoices.get(stolenId);
      if (stolenNative) {
        console.warn(`🎛️ VoiceAllocator: robando voz nativa ${stolenId} (límite: ${this.voiceAllocator.getConfig().maxVoices})`);
        stolenNative.stop();
        continue;
      }
      const stolenSource = this.soundSources.get(stolenId);
      if (stolenSource) {
        console.warn(`🎛️ VoiceAllocator: robando voz ${stolenId} (límite: ${this.voiceAllocator.getConfig().maxVoices})`);
        this.soundPlaybackManager.stopSound(stolenId, stolenSource);
      }
    }
  }

  /**
   * Inicia el sonido continuo de una fuente (completamente independiente de las interacciones de clic)
   */
  public startContinuousSound(id: string, params: AudioParams): void {
    // Motor Csound (2.3.c)
    if (csoundEngine.hasVoice(id)) {
      this.allocateVoice();
      csoundEngine.updateParams(id, audioParamsToNative(params)).catch(() => {});
      csoundEngine.start(id).catch(() => {});
      return;
    }

    // Motor nativo (2.1.c)
    const nativeVoice = this.nativeVoices.get(id);
    if (nativeVoice) {
      this.allocateVoice();
      nativeVoice.updateParams(audioParamsToNative(params));
      nativeVoice.startContinuous();
      return;
    }

    const source = this.soundSources.get(id);
    if (!source) {
      return;
    }

    this.allocateVoice();

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
    // Motor Csound (2.3.c)
    if (csoundEngine.hasVoice(id)) {
      this.allocateVoice();
      csoundEngine.updateParams(id, audioParamsToNative(params)).catch(() => {});
      csoundEngine.start(id).catch(() => {});
      return;
    }

    // Motor nativo (2.1.c)
    const nativeVoice = this.nativeVoices.get(id);
    if (nativeVoice) {
      this.allocateVoice();
      nativeVoice.updateParams(audioParamsToNative(params));
      nativeVoice.startContinuous();
      return;
    }

    const source = this.soundSources.get(id);
    if (!source) {
      return;
    }

    this.allocateVoice();

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
    // Motor Csound (2.3.c)
    if (csoundEngine.hasVoice(id)) {
      csoundEngine.stop(id).catch(() => {});
      return;
    }

    // Motor nativo (2.1.c)
    const nativeVoice = this.nativeVoices.get(id);
    if (nativeVoice) {
      nativeVoice.stop();
      return;
    }

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
    // Motor nativo (2.1.c)
    const nativeVoice = this.nativeVoices.get(id);
    if (nativeVoice) {
      nativeVoice.updateParams(audioParamsToNative(params));
      nativeVoice.triggerAttackRelease(params.duration ?? 0.5);
      return;
    }

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
    // Motor nativo (2.1.c)
    const nativeVoice = this.nativeVoices.get(id);
    if (nativeVoice) {
      nativeVoice.updateParams(audioParamsToNative(params));
      nativeVoice.triggerAttackRelease(params.duration ?? 0.5);
      return;
    }

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
   * Modula temporalmente un sonido continuo para simular una colisión o interacción
   */
  public triggerDroneInteraction(id: string): void {
    // Motor nativo (2.1.c): realce breve de la envolvente
    const nativeVoice = this.nativeVoices.get(id);
    if (nativeVoice) {
      nativeVoice.pulse();
      return;
    }

    const source = this.soundSources.get(id);
    if (!source) {
      console.log(`[AudioManager] No target source found for ${id} for drone interaction.`);
      return;
    }

    this.soundPlaybackManager.triggerDroneInteraction(id, source);
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
    // Motor Csound (2.3.c)
    if (csoundEngine.hasVoice(id)) {
      const csParams = audioParamsToNative(params);
      csoundEngine.updateParams(id, csParams).catch(() => {});
      return { success: true, updatedParams: Object.keys(csParams), errors: [] };
    }

    // Motor nativo (2.1.c)
    const nativeVoice = this.nativeVoices.get(id);
    if (nativeVoice) {
      const nativeParams = audioParamsToNative(params);
      nativeVoice.updateParams(nativeParams);
      return {
        success: true,
        updatedParams: Object.keys(nativeParams),
        errors: []
      };
    }

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
    // Motor nativo (2.1.d)
    this.nativeVoices.forEach((voice, soundId) => {
      this.updateNativeVoiceEffectMixing(soundId, voice.getPosition());
    });
  }

  /**
   * Mezcla húmeda/seca por proximidad para una voz nativa (2.1.d),
   * espejo de `updateSoundEffectMixing` para el motor Tone.
   */
  private updateNativeVoiceEffectMixing(
    soundId: string,
    soundPosition: [number, number, number]
  ): void {
    const voice = this.nativeVoices.get(soundId);
    if (!voice) return;

    try {
      const globalEffects = this.effectManager.getAllGlobalEffects();
      let maxIntensity = 0;

      globalEffects.forEach((effectData, effectId) => {
        const effectRadius = this.getEffectZoneRadius(effectId);
        const effectIntensity = this.spatialAudioManager.calculateEffectIntensity(
          soundPosition,
          effectData.position,
          effectRadius
        );
        voice.setEffectSendGain(effectId, effectIntensity);
        maxIntensity = Math.max(maxIntensity, effectIntensity);
      });

      // La señal seca decrece según el envío húmedo más fuerte
      voice.setDryGain(1.0 - maxIntensity);
    } catch {
    }
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
    // Motor Csound (2.3.c)
    if (csoundEngine.hasVoice(id)) {
      csoundEngine.setPosition(id, position).catch(() => {});
      return;
    }

    // Motor nativo (2.1.c / 2.1.d)
    const nativeVoice = this.nativeVoices.get(id);
    if (nativeVoice) {
      nativeVoice.setPosition(position);
      this.updateNativeVoiceEffectMixing(id, position);
      return;
    }

    const source = this.soundSources.get(id);
    if (!source) return;

    try {
      // Actualizar la posición del panner usando el SpatialAudioManager
      this.spatialAudioManager.updatePannerPosition(source.panner, position);

      // Mantener sincronizada la convolución binaural personalizada (4.2)
      if (this.customHrtfEnabled) {
        this.sofaSpatializer.updateSourcePosition(id, position);
      }

      // Actualizar la mezcla de efectos basada en la nueva posición
      this.updateSoundEffectMixing(id, position);
    } catch {
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
    }
  }

  /**
   * Actualiza la posición y orientación del oyente global de Tone.js
   */
  public updateListener(position: THREE.Vector3, forward: THREE.Vector3): void {
    this.spatialAudioManager.updateListener(position, forward);

    if (this.customHrtfEnabled) {
      this.sofaSpatializer.updateListener(
        [position.x, position.y, position.z],
        [forward.x, forward.y, forward.z]
      );
    }
  }

  /**
   * Aplica la calibración acústica del usuario (roadmap 4.4) tanto a la
   * configuración espacial global (futuras fuentes) como a los panners de
   * todas las fuentes existentes.
   */
  public applySpatialCalibration(config: Partial<SpatialAudioConfig>): void {
    this.spatialAudioManager.updateSpatialConfig(config);

    this.soundSources.forEach((source) => {
      try {
        if (config.rolloffFactor !== undefined) {
          source.panner.rolloffFactor = config.rolloffFactor;
        }
        if (config.refDistance !== undefined) {
          source.panner.refDistance = config.refDistance;
        }
        if (config.maxDistance !== undefined) {
          source.panner.maxDistance = config.maxDistance;
        }
      } catch {
        // Panner ya liberado
      }
    });
  }

  /**
   * Obtiene la configuración espacial vigente (roadmap 4.4)
   */
  public getSpatialConfig(): SpatialAudioConfig {
    return this.spatialAudioManager.getSpatialConfig();
  }

  /**
   * Obtiene el estado de una fuente de sonido
   */
  public getSoundSourceState(id: string): boolean {
    if (this.nativeVoices.has(id) || csoundEngine.hasVoice(id)) return true;

    const source = this.soundSources.get(id);
    if (!source) return false;

    // Verificar si existe la fuente
    return true;
  }

  /**
   * Verifica si una fuente de sonido está activamente sonando
   */
  public isSoundPlaying(id: string): boolean {
    const nativeVoice = this.nativeVoices.get(id);
    if (nativeVoice) return nativeVoice.isPlaying();

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
    // Solo ejecutar en el cliente (navegador), no durante SSR
    if (typeof window === 'undefined') {
      return {
        contextState: 'suspended',
        soundSourcesCount: 0,
        soundSourceIds: [],
        contextDebugInfo: {},
        playbackDebugInfo: {},
        parameterDebugInfo: {},
      };
    }
    return {
      contextState: Tone.getContext().state,
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
   * Mide la latencia real del hardware de audio del cliente (roadmap 2.8)
   */
  public getMeasuredLatency(): { baseLatency: number | null; outputLatency: number | null } {
    return this.audioContextManager.getMeasuredLatency();
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
   * Ajusta el límite de voces simultáneas (roadmap 2.4)
   */
  public setMaxVoices(maxVoices: number): void {
    this.voiceAllocator.updateConfig({ maxVoices });
  }

  /**
   * Obtiene el estado del despachador de voces (roadmap 2.4)
   */
  public getVoiceAllocatorInfo(): { maxVoices: number; stolenCount: number } {
    return this.voiceAllocator.getDebugInfo();
  }

  /**
   * Ejecuta la validación A/B entre el motor nativo y Tone.js (roadmap
   * 2.1.e) y reporta latencia de hardware, coste de construcción y huella
   * de grafo de cada motor.
   */
  public runEngineComparison(voices: number = 24) {
    return runEngineComparison(voices);
  }

  /** Indica qué motor de audio está activo (roadmap 2.1 / 2.3). */
  public getActiveEngine(): 'native' | 'csound' | 'tone' {
    if (CSOUND_ENGINE_ENABLED) return 'csound';
    if (NATIVE_ENGINE_ENABLED) return 'native';
    return 'tone';
  }

  /**
   * Función de debug para verificar el estado completo de la cadena de audio
   */
  public debugAudioChain(soundId: string): void {
    const source = this.soundSources.get(soundId);
    if (!source) {
      return;
    }


    // source.effectSends.forEach((_send, _effectId) => {
    // });

    // Verificar efectos globales
    const globalEffects = this.effectManager.getAllGlobalEffects();
    globalEffects.forEach((effectData, effectId) => {
      console.log(`Efecto global ${effectId}:`, {
        tipo: effectData.effectNode.constructor.name,
        posicion: effectData.position,
        radio: this.getEffectZoneRadius(effectId)
      });
    });
  }


}

// Exportar una única instancia global
export const audioManager = AudioManager.getInstance();