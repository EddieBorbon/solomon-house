import * as Tone from 'tone';
import { EffectNode, GlobalEffect } from './types';

export class SpatialEffectManager {
  private globalEffects: Map<string, GlobalEffect> = new Map();
  private effectZoneRadii: Map<string, number> = new Map();
  private lastEffectIntensities: Map<string, number> = new Map();

  /**
   * Crea un efecto global con espacialización independiente
   */
  public createSpatialEffect(
    effectId: string, 
    effectNode: EffectNode, 
    position: [number, number, number]
  ): void {
    try {
      
      // Crear panner 3D independiente para el efecto
      const effectPanner = new Tone.Panner3D({
        positionX: position[0],
        positionY: position[1],
        positionZ: position[2],
        panningModel: 'HRTF',
        distanceModel: 'inverse',
        refDistance: 1,
        maxDistance: 100,
        rolloffFactor: 2,
        coneInnerAngle: 360,
        coneOuterAngle: 360,
        coneOuterGain: 0,
      });
      
      // Conectar efecto -> panner -> destination
      effectNode.chain(effectPanner, Tone.Destination);
      
      // Almacenar tanto el nodo del efecto como su panner y posición
      this.globalEffects.set(effectId, { 
        effectNode, 
        panner: effectPanner, 
        position: position 
      });
      
      // Configurar radio inicial para la zona de efectos
      this.setEffectZoneRadius(effectId, 2.0);
      
    } catch {
    }
  }

  /**
   * Actualiza la posición de un efecto espacial
   */
  public updateEffectPosition(effectId: string, position: [number, number, number]): void {
    const effectData = this.globalEffects.get(effectId);
    if (!effectData) {
      return;
    }

    try {
      const { panner } = effectData;
      
      // Actualizar posición del panner
      panner.positionX.value = position[0];
      panner.positionY.value = position[1];
      panner.positionZ.value = position[2];
      
      // Actualizar posición almacenada
      effectData.position = position;
      this.globalEffects.set(effectId, effectData);
      
    } catch {
    }
  }

  /**
   * Establece el radio de la zona de efecto
   */
  public setEffectZoneRadius(effectId: string, radius: number): void {
    this.effectZoneRadii.set(effectId, radius);
  }

  /**
   * Obtiene el radio de la zona de efecto
   */
  public getEffectZoneRadius(effectId: string): number {
    return this.effectZoneRadii.get(effectId) || 2.0;
  }

  /**
   * Calcula la intensidad del efecto basada en la proximidad
   */
  public calculateEffectIntensity(
    effectId: string, 
    listenerPosition: [number, number, number]
  ): number {
    const effectData = this.globalEffects.get(effectId);
    if (!effectData) {
      return 0;
    }

    const radius = this.getEffectZoneRadius(effectId);
    const distance = this.calculateDistance(effectData.position, listenerPosition);
    
    // Calcular intensidad basada en la distancia
    let intensity = 0;
    if (distance <= radius) {
      // Intensidad máxima en el centro, disminuye hacia el borde
      intensity = Math.max(0, 1 - (distance / radius));
    }

    // Suavizar cambios bruscos de intensidad
    const lastIntensity = this.lastEffectIntensities.get(effectId) || 0;
    const smoothedIntensity = lastIntensity + (intensity - lastIntensity) * 0.1;
    this.lastEffectIntensities.set(effectId, smoothedIntensity);

    return smoothedIntensity;
  }

  /**
   * Actualiza la intensidad de todos los efectos basada en la posición del listener
   */
  public updateAllEffectIntensities(listenerPosition: [number, number, number]): void {
    this.globalEffects.forEach((effectData, effectId) => {
      const intensity = this.calculateEffectIntensity(effectId, listenerPosition);
      
      // Aplicar intensidad al efecto (ajustar wet/dry ratio)
      try {
        if (effectData.effectNode && typeof (effectData.effectNode as unknown as { wet?: unknown }).wet !== 'undefined') {
          (effectData.effectNode as unknown as { wet: { value: number } }).wet.value = intensity;
        }
      } catch {
      }
    });
  }

  /**
   * Obtiene un efecto global por ID
   */
  public getGlobalEffect(effectId: string): GlobalEffect | undefined {
    return this.globalEffects.get(effectId);
  }

  /**
   * Obtiene todos los efectos globales
   */
  public getAllGlobalEffects(): Map<string, GlobalEffect> {
    return this.globalEffects;
  }

  /**
   * Elimina un efecto espacial
   */
  public removeSpatialEffect(effectId: string): void {
    const effectData = this.globalEffects.get(effectId);
    if (effectData) {
      try {
        // Desconectar y limpiar el efecto
        effectData.effectNode.disconnect();
        effectData.panner.disconnect();
        
        // Eliminar de los mapas
        this.globalEffects.delete(effectId);
        this.effectZoneRadii.delete(effectId);
        this.lastEffectIntensities.delete(effectId);
        
      } catch {
      }
    }
  }

  /**
   * Refresca todos los efectos globales
   */
  public refreshAllGlobalEffects(): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.globalEffects.forEach((effectData, _effectId) => {
      try {
        // Forzar actualización del panner
        effectData.panner.positionX.value = effectData.panner.positionX.value;
        effectData.panner.positionY.value = effectData.panner.positionY.value;
        effectData.panner.positionZ.value = effectData.panner.positionZ.value;
        
      } catch {
      }
    });
  }

  /**
   * Calcula la distancia entre dos puntos 3D
   */
  private calculateDistance(
    pos1: [number, number, number], 
    pos2: [number, number, number]
  ): number {
    const dx = pos1[0] - pos2[0];
    const dy = pos1[1] - pos2[1];
    const dz = pos1[2] - pos2[2];
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Limpia todos los efectos espaciales
   */
  public clearAllSpatialEffects(): void {
    this.globalEffects.forEach((_, effectId) => {
      this.removeSpatialEffect(effectId);
    });
  }
}
