import { AudioCommand, AudioOperationResult, AudioOperationType } from './types';
import { AudioParams, SoundObjectType, SoundSource } from '../factories/SoundSourceFactory';
import { EffectType } from '../managers/EffectManager';

// Comando base abstracto
export abstract class BaseAudioCommand implements AudioCommand {
  protected id: string;
  protected operationType: AudioOperationType;

  constructor(id: string, operationType: AudioOperationType) {
    this.id = id;
    this.operationType = operationType;
  }

  abstract execute(): Promise<boolean>;
  abstract undo(): Promise<boolean>;

  getType(): string {
    return this.operationType;
  }

  getId(): string {
    return this.id;
  }

  protected createResult(success: boolean, message: string, data?: any, error?: string): AudioOperationResult {
    return {
      success,
      operationId: this.id,
      operationType: this.operationType,
      message,
      data,
      error
    };
  }
}

// Comando para crear fuente de sonido
export class CreateSoundSourceCommand extends BaseAudioCommand {
  private soundSourceFactory: any; // Usaremos el factory existente
  private soundSources: Map<string, SoundSource>;
  private id: string;
  private type: SoundObjectType;
  private params: AudioParams;
  private position: [number, number, number];
  private globalEffects: Map<string, any>;

  constructor(
    id: string,
    type: SoundObjectType,
    params: AudioParams,
    position: [number, number, number],
    soundSourceFactory: any,
    soundSources: Map<string, SoundSource>,
    globalEffects: Map<string, any>
  ) {
    super(id, 'createSoundSource');
    this.soundSourceFactory = soundSourceFactory;
    this.soundSources = soundSources;
    this.id = id;
    this.type = type;
    this.params = params;
    this.position = position;
    this.globalEffects = globalEffects;
  }

  async execute(): Promise<boolean> {
    try {
      
      // Verificar si ya existe
      if (this.soundSources.has(this.id)) {
        return false;
      }

      // Crear la fuente de sonido usando el factory existente
      const soundSource = this.soundSourceFactory.createSoundSource(
        this.id,
        this.type,
        this.params,
        this.position,
        this.globalEffects
      );

      // Almacenar en el mapa
      this.soundSources.set(this.id, soundSource);
      
      return true;
      
    } catch (error) {
      return false;
    }
  }

  async undo(): Promise<boolean> {
    try {
      
      // Verificar si existe
      if (!this.soundSources.has(this.id)) {
        return false;
      }

      // Obtener la fuente y limpiarla
      const source = this.soundSources.get(this.id);
      if (source) {
        // Desconectar y limpiar
        source.synth.disconnect();
        source.dryGain.disconnect();
        source.panner.disconnect();
        
        // Limpiar effect sends
        source.effectSends.forEach(send => {
          try {
            send.disconnect();
          } catch {
            // Manejo silencioso de errores
          }
        });
      }

      // Eliminar del mapa
      this.soundSources.delete(this.id);
      
      return true;
      
    } catch (error) {
      return false;
    }
  }
}

// Comando para eliminar fuente de sonido
export class RemoveSoundSourceCommand extends BaseAudioCommand {
  private soundSources: Map<string, SoundSource>;
  private soundPlaybackManager: any;
  private id: string;

  constructor(
    id: string,
    soundSources: Map<string, SoundSource>,
    soundPlaybackManager: any
  ) {
    super(id, 'removeSoundSource');
    this.soundSources = soundSources;
    this.soundPlaybackManager = soundPlaybackManager;
    this.id = id;
  }

  async execute(): Promise<boolean> {
    try {
      
      const source = this.soundSources.get(this.id);
      if (!source) {
        return false;
      }

      // Detener el sonido si está sonando
      if (this.soundPlaybackManager.isSoundPlaying(this.id)) {
        this.soundPlaybackManager.stopSound(this.id, source);
      }

      // Limpiar todas las conexiones
      source.synth.disconnect();
      source.dryGain.disconnect();
      source.panner.disconnect();
      
      // Limpiar effect sends
      source.effectSends.forEach(send => {
        try {
          send.disconnect();
        } catch {
          // Manejo silencioso de errores
        }
      });

      // Eliminar del mapa
      this.soundSources.delete(this.id);
      
      return true;
      
    } catch (error) {
      return false;
    }
  }

  async undo(): Promise<boolean> {
    // Para deshacer una eliminación, necesitaríamos recrear la fuente
    // Esto requeriría almacenar los parámetros originales
    return false;
  }
}

// Comando para crear efecto global
export class CreateGlobalEffectCommand extends BaseAudioCommand {
  private effectManager: any;
  private soundSources: Map<string, SoundSource>;
  private effectId: string;
  private type: EffectType;
  private position: [number, number, number];

  constructor(
    effectId: string,
    type: EffectType,
    position: [number, number, number],
    effectManager: any,
    soundSources: Map<string, SoundSource>
  ) {
    super(effectId, 'createGlobalEffect');
    this.effectManager = effectManager;
    this.soundSources = soundSources;
    this.effectId = effectId;
    this.type = type;
    this.position = position;
  }

  async execute(): Promise<boolean> {
    try {
      
      // Crear el efecto usando el EffectManager existente
      this.effectManager.createGlobalEffect(this.effectId, this.type, this.position);
      
      // Crear sends para todas las fuentes de sonido existentes
      const effectData = this.effectManager.getGlobalEffect(this.effectId);
      if (effectData) {
        this.soundSources.forEach((source, sourceId) => {
          this.addEffectSendToSource(sourceId, this.effectId, effectData.effectNode.input.input);
        });
      }
      
      return true;
      
    } catch (error) {
      return false;
    }
  }

  async undo(): Promise<boolean> {
    try {
      
      // Limpiar todas las conexiones a fuentes de sonido
      this.cleanupEffectSourceConnections(this.effectId);
      
      // Eliminar el efecto usando el EffectManager
      this.effectManager.removeGlobalEffect(this.effectId);
      
      return true;
      
    } catch (error) {
      return false;
    }
  }

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
}
