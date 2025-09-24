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
      console.log(`🎵 CreateSoundSourceCommand: Ejecutando creación de fuente ${this.id}`);
      
      // Verificar si ya existe
      if (this.soundSources.has(this.id)) {
        console.warn(`⚠️ CreateSoundSourceCommand: Fuente ${this.id} ya existe`);
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
      
      console.log(`✅ CreateSoundSourceCommand: Fuente ${this.id} creada exitosamente`);
      return true;
      
    } catch (error) {
      console.error(`❌ CreateSoundSourceCommand: Error al crear fuente ${this.id}:`, error);
      return false;
    }
  }

  async undo(): Promise<boolean> {
    try {
      console.log(`🔄 CreateSoundSourceCommand: Deshaciendo creación de fuente ${this.id}`);
      
      // Verificar si existe
      if (!this.soundSources.has(this.id)) {
        console.warn(`⚠️ CreateSoundSourceCommand: Fuente ${this.id} no existe para deshacer`);
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
      
      console.log(`✅ CreateSoundSourceCommand: Fuente ${this.id} eliminada exitosamente`);
      return true;
      
    } catch (error) {
      console.error(`❌ CreateSoundSourceCommand: Error al deshacer creación de fuente ${this.id}:`, error);
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
      console.log(`🗑️ RemoveSoundSourceCommand: Ejecutando eliminación de fuente ${this.id}`);
      
      const source = this.soundSources.get(this.id);
      if (!source) {
        console.warn(`⚠️ RemoveSoundSourceCommand: Fuente ${this.id} no encontrada`);
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
      
      console.log(`✅ RemoveSoundSourceCommand: Fuente ${this.id} eliminada exitosamente`);
      return true;
      
    } catch (error) {
      console.error(`❌ RemoveSoundSourceCommand: Error al eliminar fuente ${this.id}:`, error);
      return false;
    }
  }

  async undo(): Promise<boolean> {
    // Para deshacer una eliminación, necesitaríamos recrear la fuente
    // Esto requeriría almacenar los parámetros originales
    console.warn(`⚠️ RemoveSoundSourceCommand: Deshacer eliminación no implementado para ${this.id}`);
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
      console.log(`🎛️ CreateGlobalEffectCommand: Ejecutando creación de efecto ${this.effectId}`);
      
      // Crear el efecto usando el EffectManager existente
      this.effectManager.createGlobalEffect(this.effectId, this.type, this.position);
      
      // Crear sends para todas las fuentes de sonido existentes
      const effectData = this.effectManager.getGlobalEffect(this.effectId);
      if (effectData) {
        this.soundSources.forEach((source, sourceId) => {
          this.addEffectSendToSource(sourceId, this.effectId, effectData.effectNode.input.input);
        });
        console.log(`🎛️ CreateGlobalEffectCommand: Sends creados para ${this.soundSources.size} fuentes de sonido`);
      }
      
      console.log(`✅ CreateGlobalEffectCommand: Efecto ${this.effectId} creado exitosamente`);
      return true;
      
    } catch (error) {
      console.error(`❌ CreateGlobalEffectCommand: Error al crear efecto ${this.effectId}:`, error);
      return false;
    }
  }

  async undo(): Promise<boolean> {
    try {
      console.log(`🔄 CreateGlobalEffectCommand: Deshaciendo creación de efecto ${this.effectId}`);
      
      // Limpiar todas las conexiones a fuentes de sonido
      this.cleanupEffectSourceConnections(this.effectId);
      
      // Eliminar el efecto usando el EffectManager
      this.effectManager.removeGlobalEffect(this.effectId);
      
      console.log(`✅ CreateGlobalEffectCommand: Efecto ${this.effectId} eliminado exitosamente`);
      return true;
      
    } catch (error) {
      console.error(`❌ CreateGlobalEffectCommand: Error al deshacer creación de efecto ${this.effectId}:`, error);
      return false;
    }
  }

  private addEffectSendToSource(sourceId: string, effectId: string, effectNode: AudioNode): void {
    try {
      const source = this.soundSources.get(sourceId);
      if (!source) {
        console.warn(`⚠️ CreateGlobalEffectCommand: No se encontró fuente de sonido ${sourceId} para crear send de efecto`);
        return;
      }

      // Crear el send de efecto
      const send = new Tone.Gain(0); // Inicialmente silenciado
      source.effectSends.set(effectId, send);
      
      // Conectar synth -> send -> efecto
      source.synth.connect(send);
      send.connect(effectNode);
      
      console.log(`🎛️ CreateGlobalEffectCommand: Send de efecto ${effectId} creado para fuente ${sourceId}`);
    } catch {
      console.error(`❌ CreateGlobalEffectCommand: Error al crear send de efecto`);
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
