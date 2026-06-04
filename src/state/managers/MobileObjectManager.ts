import { MobileObject, MovementType } from '../useWorldStore';
import { useMobileStore } from '../../stores/useMobileStore';

interface GridData {
  mobileObjects: MobileObject[];
}

/**
 * Manager para manejar objetos móviles
 * Responsabilidad única: Gestión completa de objetos móviles
 */
export class MobileObjectManager {
  /**
   * Crea un nuevo objeto móvil
   */
  public createMobileObject(
    position: [number, number, number],
    movementType: MovementType = 'circular'
  ): MobileObject {
    const newMobileObject = useMobileStore.getState().addMobileObject(position);
    if (movementType !== 'circular') {
      useMobileStore.getState().updateMobileObject(newMobileObject.id, {
        mobileParams: {
          ...newMobileObject.mobileParams,
          movementType
        }
      });
      return useMobileStore.getState().getById(newMobileObject.id) || newMobileObject;
    }
    return newMobileObject;
  }

  /**
   * Actualiza un objeto móvil
   */
  public updateMobileObject(
    id: string,
    updates: Partial<Omit<MobileObject, 'id'>>,
    _grids: Map<string, unknown>
  ): void {
    if (updates.mobileParams) {
      this.validateMobileParams(updates.mobileParams);
    }
    useMobileStore.getState().updateMobileObject(id, updates);
  }

  /**
   * Elimina un objeto móvil
   */
  public removeMobileObject(id: string, _grids: Map<string, unknown>): void {
    useMobileStore.getState().removeMobileObject(id);
  }

  /**
   * Actualiza la posición de un objeto móvil
   */
  public updateMobileObjectPosition(
    id: string,
    position: [number, number, number],
    _grids: Map<string, unknown>
  ): void {
    useMobileStore.getState().updateMobileObjectPosition(id, position);
  }

  /**
   * Busca un objeto móvil por ID en todas las cuadrículas
   */
  public findMobileObjectById(id: string, grids: Map<string, unknown>): { object: MobileObject | null, gridId: string | null } {
    const object = useMobileStore.getState().getById(id) || null;
    if (object) {
      // Intentar encontrar el gridId en las grids locales si está presente
      for (const [gridId, grid] of grids) {
        const gridData = grid as GridData;
        if (gridData.mobileObjects && gridData.mobileObjects.some(obj => obj.id === id)) {
          return { object, gridId };
        }
      }
    }
    return { object: null, gridId: null };
  }

  /**
   * Valida los parámetros móviles de un objeto
   */
  public validateMobileParams(params: MobileObject['mobileParams']): boolean {
    return (
      typeof params.radius === 'number' &&
      params.radius > 0 &&
      typeof params.speed === 'number' &&
      params.speed >= 0 &&
      typeof params.proximityThreshold === 'number' &&
      params.proximityThreshold > 0 &&
      typeof params.isActive === 'boolean' &&
      Array.isArray(params.centerPosition) &&
      params.centerPosition.length === 3 &&
      Array.isArray(params.direction) &&
      params.direction.length === 3 &&
      Array.isArray(params.axis) &&
      params.axis.length === 3 &&
      typeof params.amplitude === 'number' &&
      params.amplitude >= 0 &&
      typeof params.frequency === 'number' &&
      params.frequency > 0 &&
      typeof params.randomSeed === 'number'
    );
  }

  /**
   * Obtiene los parámetros por defecto para un objeto móvil
   */
  private getDefaultMobileParams(
    position: [number, number, number],
    movementType: MovementType
  ): MobileObject['mobileParams'] {
    return {
      movementType,
      radius: 2,
      speed: 1,
      proximityThreshold: 1.5,
      isActive: true,
      centerPosition: position,
      direction: [1, 0, 0],
      axis: [0, 1, 0],
      amplitude: 0.5,
      frequency: 1,
      randomSeed: Math.random() * 1000,
      showRadiusIndicator: true,
      showProximityIndicator: true,
      showSphere: true,
      height: 0,
      heightSpeed: 0,
    };
  }

  /**
   * Calcula la próxima posición de un objeto móvil basado en su tipo de movimiento
   */
  public calculateNextPosition(
    mobileObject: MobileObject,
    deltaTime: number
  ): [number, number, number] {
    const { mobileParams } = mobileObject;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { movementType, speed, radius, centerPosition, direction, axis, amplitude, frequency } = mobileParams;

    switch (movementType) {
      case 'circular':
        return this.calculateCircularMovement(mobileObject, deltaTime, speed, radius, centerPosition);
      
      case 'polar':
        return this.calculatePolarMovement(mobileObject, deltaTime, speed, radius, centerPosition);
      
      case 'random':
        return this.calculateRandomMovement(mobileObject, deltaTime, speed, amplitude, frequency);
      
      case 'figure8':
        return this.calculateFigure8Movement(mobileObject, deltaTime, speed, radius, centerPosition);
      
      case 'spiral':
        return this.calculateSpiralMovement(mobileObject, deltaTime, speed, radius, centerPosition);
      
      default:
        return mobileObject.position;
    }
  }

  /**
   * Calcula movimiento circular
   */
  private calculateCircularMovement(
    mobileObject: MobileObject,
    deltaTime: number,
    speed: number,
    radius: number,
    centerPosition: [number, number, number]
  ): [number, number, number] {
    const time = Date.now() * 0.001 * speed;
    const [cx, cy, cz] = centerPosition;
    
    // Simplificado: movimiento circular en el plano XY
    return [
      cx + Math.cos(time) * radius,
      cy + Math.sin(time) * radius,
      cz,
    ];
  }

  /**
   * Calcula movimiento polar
   */
  private calculatePolarMovement(
    mobileObject: MobileObject,
    deltaTime: number,
    speed: number,
    radius: number,
    centerPosition: [number, number, number]
  ): [number, number, number] {
    const time = Date.now() * 0.001 * speed;
    const [cx, cy, cz] = centerPosition;
    
    return [
      cx + Math.cos(time) * radius * Math.cos(time * 0.5),
      cy + Math.sin(time) * radius * Math.cos(time * 0.5),
      cz + Math.sin(time * 0.5) * radius,
    ];
  }

  /**
   * Calcula movimiento aleatorio
   */
  private calculateRandomMovement(
    mobileObject: MobileObject,
    deltaTime: number,
    speed: number,
    amplitude: number,
    frequency: number
  ): [number, number, number] {
    const [x, y, z] = mobileObject.position;
    const randomFactor = Math.sin(Date.now() * 0.001 * frequency) * amplitude;
    
    return [
      x + (Math.random() - 0.5) * speed * deltaTime * randomFactor,
      y + (Math.random() - 0.5) * speed * deltaTime * randomFactor,
      z + (Math.random() - 0.5) * speed * deltaTime * randomFactor,
    ];
  }

  /**
   * Calcula movimiento en forma de 8
   */
  private calculateFigure8Movement(
    mobileObject: MobileObject,
    deltaTime: number,
    speed: number,
    radius: number,
    centerPosition: [number, number, number]
  ): [number, number, number] {
    const time = Date.now() * 0.001 * speed;
    const [cx, cy, cz] = centerPosition;
    
    return [
      cx + Math.sin(time) * radius,
      cy + Math.sin(time * 2) * radius * 0.5,
      cz,
    ];
  }

  /**
   * Calcula movimiento en espiral
   */
  private calculateSpiralMovement(
    mobileObject: MobileObject,
    deltaTime: number,
    speed: number,
    radius: number,
    centerPosition: [number, number, number]
  ): [number, number, number] {
    const time = Date.now() * 0.001 * speed;
    const [cx, cy, cz] = centerPosition;
    const spiralRadius = radius * (1 - time * 0.1); // Radio decreciente
    
    return [
      cx + Math.cos(time) * spiralRadius,
      cy + Math.sin(time) * spiralRadius,
      cz + time * speed * 0.1,
    ];
  }
}
