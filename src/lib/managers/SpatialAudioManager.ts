import * as Tone from 'tone';
import * as THREE from 'three';

// Tipos para audio espacial
export interface SpatialAudioConfig {
  panningModel: 'HRTF' | 'equalpower';
  distanceModel: 'linear' | 'inverse' | 'exponential';
  refDistance: number;
  maxDistance: number;
  rolloffFactor: number;
  coneInnerAngle: number;
  coneOuterAngle: number;
  coneOuterGain: number;
}

export interface ListenerState {
  position: THREE.Vector3;
  forward: THREE.Vector3;
  up: THREE.Vector3;
}

export class SpatialAudioManager {
  private listenerState: ListenerState;
  private lastListenerPosition: string = ''; // Para reducir logs del listener
  private spatialConfig: SpatialAudioConfig;

  constructor() {
    // Configuración por defecto para audio espacial
    this.spatialConfig = {
      panningModel: 'HRTF',
      distanceModel: 'inverse',
      refDistance: 1,
      maxDistance: 100,
      rolloffFactor: 2,
      coneInnerAngle: 360,
      coneOuterAngle: 360,
      coneOuterGain: 0,
    };

    // Estado inicial del listener
    this.listenerState = {
      position: new THREE.Vector3(0, 0, 0),
      forward: new THREE.Vector3(0, 0, -1),
      up: new THREE.Vector3(0, 1, 0),
    };

    this.initializeListener();
  }

  /**
   * Inicializa el listener global de Tone.js
   */
  private initializeListener(): void {
    try {
      // Configurar el listener con valores iniciales
      this.updateListener(this.listenerState.position, this.listenerState.forward);
    } catch (error) {
    }
  }

  /**
   * Actualiza la posición y orientación del oyente global de Tone.js
   */
  public updateListener(position: THREE.Vector3, forward: THREE.Vector3): void {
    try {
      // Actualizar la posición del oyente
      Tone.Listener.positionX.value = position.x;
      Tone.Listener.positionY.value = position.y;
      Tone.Listener.positionZ.value = position.z;
      
      // Actualizar la orientación del oyente (hacia dónde mira)
      Tone.Listener.forwardX.value = forward.x;
      Tone.Listener.forwardY.value = forward.y;
      Tone.Listener.forwardZ.value = forward.z;
      
      // Configurar el vector "arriba" del oyente (normalmente Y positivo)
      Tone.Listener.upX.value = 0;
      Tone.Listener.upY.value = 1;
      Tone.Listener.upZ.value = 0;
      
      // Actualizar el estado interno
      this.listenerState.position.copy(position);
      this.listenerState.forward.copy(forward);
      
      // Solo loggear cambios significativos en la posición (cada 0.5 unidades)
      const currentPos = `${Math.round(position.x * 2) / 2},${Math.round(position.y * 2) / 2},${Math.round(position.z * 2) / 2}`;
      if (this.lastListenerPosition !== currentPos) {
        this.lastListenerPosition = currentPos;
      }
    } catch (error) {
    }
  }

  /**
   * Crea un panner 3D con configuración espacial
   */
  public createPanner3D(position: [number, number, number], config?: Partial<SpatialAudioConfig>): Tone.Panner3D {
    try {
      const pannerConfig = {
        ...this.spatialConfig,
        ...config,
        positionX: position[0],
        positionY: position[1],
        positionZ: position[2],
      };

      const panner = new Tone.Panner3D(pannerConfig);
      
      console.log('Panner3D creado:', {
        panningModel: pannerConfig.panningModel,
        distanceModel: pannerConfig.distanceModel,
        refDistance: pannerConfig.refDistance,
        maxDistance: pannerConfig.maxDistance,
        rolloffFactor: pannerConfig.rolloffFactor,
      });

      return panner;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualiza la posición de un panner 3D
   */
  public updatePannerPosition(panner: Tone.Panner3D, position: [number, number, number]): void {
    try {
      panner.setPosition(position[0], position[1], position[2]);
    } catch (error) {
    }
  }

  /**
   * Calcula la distancia entre dos puntos en el espacio 3D
   */
  public calculateDistance(position1: [number, number, number], position2: [number, number, number]): number {
    const distance = Math.sqrt(
      Math.pow(position1[0] - position2[0], 2) +
      Math.pow(position1[1] - position2[1], 2) +
      Math.pow(position1[2] - position2[2], 2)
    );
    return distance;
  }

  /**
   * Calcula la intensidad de audio basada en la distancia y el modelo de distancia
   */
  public calculateDistanceAttenuation(distance: number, config?: Partial<SpatialAudioConfig>): number {
    const distanceConfig = { ...this.spatialConfig, ...config };
    
    if (distance <= distanceConfig.refDistance) {
      return 1.0; // Sin atenuación dentro de la distancia de referencia
    }
    
    if (distance >= distanceConfig.maxDistance) {
      return 0.0; // Silenciado completamente más allá de la distancia máxima
    }
    
    switch (distanceConfig.distanceModel) {
      case 'linear':
        return 1.0 - ((distance - distanceConfig.refDistance) / (distanceConfig.maxDistance - distanceConfig.refDistance));
      
      case 'inverse':
        return distanceConfig.refDistance / (distanceConfig.refDistance + distanceConfig.rolloffFactor * (distance - distanceConfig.refDistance));
      
      case 'exponential':
        return Math.pow(distance / distanceConfig.refDistance, -distanceConfig.rolloffFactor);
      
      default:
        return 1.0;
    }
  }

  /**
   * Calcula la intensidad de efecto basada en la distancia y el radio de la zona
   */
  public calculateEffectIntensity(
    soundPosition: [number, number, number], 
    effectPosition: [number, number, number], 
    effectRadius: number
  ): number {
    const distance = this.calculateDistance(soundPosition, effectPosition);
    
    if (distance <= effectRadius) {
      // Dentro de la zona: intensidad completa
      return 1.0;
    } else if (distance <= effectRadius * 2) {
      // Zona de transición: intensidad gradual
      return 1.0 - ((distance - effectRadius) / effectRadius);
    } else {
      // Fuera de la zona: sin efecto
      return 0.0;
    }
  }

  /**
   * Obtiene la posición actual del listener
   */
  public getListenerPosition(): THREE.Vector3 {
    return this.listenerState.position.clone();
  }

  /**
   * Obtiene la orientación actual del listener
   */
  public getListenerForward(): THREE.Vector3 {
    return this.listenerState.forward.clone();
  }

  /**
   * Obtiene el estado completo del listener
   */
  public getListenerState(): ListenerState {
    return {
      position: this.listenerState.position.clone(),
      forward: this.listenerState.forward.clone(),
      up: this.listenerState.up.clone(),
    };
  }

  /**
   * Actualiza la configuración espacial global
   */
  public updateSpatialConfig(config: Partial<SpatialAudioConfig>): void {
    this.spatialConfig = { ...this.spatialConfig, ...config };
  }

  /**
   * Obtiene la configuración espacial actual
   */
  public getSpatialConfig(): SpatialAudioConfig {
    return { ...this.spatialConfig };
  }

  /**
   * Verifica si un punto está dentro de una zona esférica
   */
  public isPointInZone(
    point: [number, number, number], 
    zoneCenter: [number, number, number], 
    zoneRadius: number
  ): boolean {
    const distance = this.calculateDistance(point, zoneCenter);
    return distance <= zoneRadius;
  }

  /**
   * Calcula la intensidad de mezcla para una zona de transición
   */
  public calculateTransitionIntensity(
    point: [number, number, number], 
    zoneCenter: [number, number, number], 
    zoneRadius: number,
    transitionWidth: number = zoneRadius
  ): number {
    const distance = this.calculateDistance(point, zoneCenter);
    
    if (distance <= zoneRadius) {
      return 1.0; // Dentro de la zona
    } else if (distance <= zoneRadius + transitionWidth) {
      // En la zona de transición
      const transitionDistance = distance - zoneRadius;
      return 1.0 - (transitionDistance / transitionWidth);
    } else {
      return 0.0; // Fuera de la zona
    }
  }

  /**
   * Obtiene información de debug del sistema espacial
   */
  public getDebugInfo(): {
    listenerPosition: [number, number, number];
    listenerForward: [number, number, number];
    spatialConfig: SpatialAudioConfig;
  } {
    return {
      listenerPosition: [
        this.listenerState.position.x,
        this.listenerState.position.y,
        this.listenerState.position.z
      ],
      listenerForward: [
        this.listenerState.forward.x,
        this.listenerState.forward.y,
        this.listenerState.forward.z
      ],
      spatialConfig: this.getSpatialConfig(),
    };
  }

  /**
   * Limpia los recursos del SpatialAudioManager
   */
  public cleanup(): void {
    try {
      // Resetear el listener a posición neutral
      this.updateListener(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1));
    } catch (error) {
    }
  }
}
