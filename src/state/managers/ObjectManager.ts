import { v4 as uuidv4 } from 'uuid';
import { AudioParams } from '../../lib/AudioManager';
import { SoundObjectType, SoundObject } from '../useWorldStore';
import { DefaultParamsProvider } from '../providers/DefaultParamsProvider';
import { useObjectStore } from '../../stores/useObjectStore';

/**
 * Manager para manejar objetos de sonido
 * Responsabilidad única: Gestión completa de objetos de sonido
 */
export class ObjectManager {
  /**
   * Crea un nuevo objeto de sonido
   */
  public createObject(
    type: SoundObjectType, 
    position: [number, number, number], 
    gridId: string
  ): SoundObject {
    const audioParams = DefaultParamsProvider.getDefaultAudioParams(type);
    
    const newObject: SoundObject = {
      id: uuidv4(),
      type,
      position,
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      audioParams,
      isSelected: false,
      audioEnabled: true,
    };

    // Delegar al useObjectStore para manejo interno
    useObjectStore.getState().addObject(type, position, gridId);
    
    return newObject;
  }

  /**
   * Elimina un objeto de sonido
   */
  public removeObject(id: string, gridId: string): void {
    useObjectStore.getState().removeObject(id, gridId);
  }

  /**
   * Actualiza un objeto de sonido
   */
  public updateObject(
    id: string, 
    updates: Partial<Omit<SoundObject, 'id'>>, 
    gridId: string
  ): void {
    useObjectStore.getState().updateObject(id, updates, gridId);
  }

  /**
   * Activa/desactiva el audio de un objeto
   */
  public toggleObjectAudio(id: string, forceState?: boolean, gridId?: string): void {
    if (gridId) {
      useObjectStore.getState().toggleObjectAudio(id, forceState, gridId);
    }
  }

  /**
   * Dispara una nota en un objeto
   */
  public triggerObjectNote(id: string, gridId: string): void {
    useObjectStore.getState().triggerObjectNote(id, gridId);
  }

  /**
   * Dispara un objeto percusivo
   */
  public triggerObjectPercussion(id: string, gridId: string): void {
    useObjectStore.getState().triggerObjectPercussion(id, gridId);
  }

  /**
   * Dispara una nota con duración específica
   */
  public triggerObjectAttackRelease(id: string, gridId: string): void {
    useObjectStore.getState().triggerObjectAttackRelease(id, gridId);
  }

  /**
   * Inicia el gate de un objeto
   */
  public startObjectGate(id: string, gridId: string): void {
    useObjectStore.getState().startObjectGate(id, gridId);
  }

  /**
   * Detiene el gate de un objeto
   */
  public stopObjectGate(id: string, gridId: string): void {
    useObjectStore.getState().stopObjectGate(id, gridId);
  }

  /**
   * Limpia todos los objetos
   */
  public clearAllObjects(): void {
    useObjectStore.getState().clearAllObjects();
  }

  /**
   * Busca un objeto por ID en todas las cuadrículas
   */
  public findObjectById(id: string, grids: Map<string, any>): { object: SoundObject | null, gridId: string | null } {
    for (const [gridId, grid] of grids) {
      const object = grid.objects.find((obj: SoundObject) => obj.id === id);
      if (object) {
        return { object, gridId };
      }
    }
    return { object: null, gridId: null };
  }

  /**
   * Valida los parámetros de audio de un objeto
   */
  public validateAudioParams(params: AudioParams): boolean {
    return (
      typeof params.frequency === 'number' &&
      typeof params.volume === 'number' &&
      params.volume >= 0 &&
      params.volume <= 1 &&
      typeof params.waveform === 'string'
    );
  }

  /**
   * Obtiene los parámetros por defecto para un tipo de objeto
   */
  public getDefaultParams(type: SoundObjectType): AudioParams {
    return DefaultParamsProvider.getDefaultAudioParams(type);
  }
}
