import { v4 as uuidv4 } from 'uuid';
import { MobileObject, MovementType } from '../useWorldStore';

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
    const newMobileObject: MobileObject = {
      id: uuidv4(),
      type: 'mobile',
      position,
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      isSelected: false,
      mobileParams: this.getDefaultMobileParams(position, movementType),
    };

    return newMobileObject;
  }

  /**
   * Actualiza un objeto móvil
   */
  public updateMobileObject(
    id: string,
    updates: Partial<Omit<MobileObject, 'id'>>,
    grids: Map<string, unknown>
  ): void {
    // Buscar el objeto en todas las cuadrículas
    for (const [gridId, grid] of grids) {
      const objectIndex = grid.mobileObjects.findIndex((obj: MobileObject) => obj.id === id);
      if (objectIndex !== -1) {
        // Validar parámetros móviles si se están actualizando
        if (updates.mobileParams) {
          this.validateMobileParams(updates.mobileParams);
        }
        break;
      }
    }
  }

  /**
   * Elimina un objeto móvil
   */
  public removeMobileObject(id: string, grids: Map<string, unknown>): void {
    // Buscar y eliminar el objeto de todas las cuadrículas
    for (const [gridId, grid] of grids) {
      const objectIndex = grid.mobileObjects.findIndex((obj: MobileObject) => obj.id === id);
      if (objectIndex !== -1) {
        const updatedObjects = grid.mobileObjects.filter((obj: MobileObject) => obj.id !== id);
        grid.mobileObjects = updatedObjects;
        break;
      }
    }
  }

  /**
   * Actualiza la posición de un objeto móvil
   */
  public updateMobileObjectPosition(
    id: string,
    position: [number, number, number],
    grids: Map<string, unknown>
  ): void {
    // Buscar el objeto en todas las cuadrículas y actualizar su posición
    for (const [gridId, grid] of grids) {
      const objectIndex = grid.mobileObjects.findIndex((obj: MobileObject) => obj.id === id);
      if (objectIndex !== -1) {
        const updatedObjects = [...grid.mobileObjects];
        updatedObjects[objectIndex] = { ...updatedObjects[objectIndex], position };
        grid.mobileObjects = updatedObjects;
        break;
      }
    }
  }

  /**
   * Busca un objeto móvil por ID en todas las cuadrículas
   */
  public findMobileObjectById(id: string, grids: Map<string, unknown>): { object: MobileObject | null, gridId: string | null } {
    for (const [gridId, grid] of grids) {
      const object = grid.mobileObjects.find((obj: MobileObject) => obj.id === id);
      if (object) {
        return { object, gridId };
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
    const { movementType, speed, radius, centerPosition, direction, axis, amplitude, frequency } = mobileParams;

    switch (movementType) {
      case 'linear':
        return this.calculateLinearMovement(mobileObject, deltaTime, speed, direction);
      
      case 'circular':
        return this.calculateCircularMovement(mobileObject, deltaTime, speed, radius, centerPosition, axis);
      
      case 'polar':
        return this.calculatePolarMovement(mobileObject, deltaTime, speed, radius, centerPosition);
      
      case 'random':
        return this.calculateRandomMovement(mobileObject, deltaTime, speed, amplitude, frequency);
      
      case 'figure8':
        return this.calculateFigure8Movement(mobileObject, deltaTime, speed, radius, centerPosition);
      
      case 'spiral':
        return this.calculateSpiralMovement(mobileObject, deltaTime, speed, radius, centerPosition, axis);
      
      default:
        return mobileObject.position;
    }
  }

  /**
   * Calcula movimiento lineal
   */
  private calculateLinearMovement(
    mobileObject: MobileObject,
    deltaTime: number,
    speed: number,
    direction: [number, number, number]
  ): [number, number, number] {
    const [x, y, z] = mobileObject.position;
    const [dx, dy, dz] = direction;
    
    return [
      x + dx * speed * deltaTime,
      y + dy * speed * deltaTime,
      z + dz * speed * deltaTime,
    ];
  }

  /**
   * Calcula movimiento circular
   */
  private calculateCircularMovement(
    mobileObject: MobileObject,
    deltaTime: number,
    speed: number,
    radius: number,
    centerPosition: [number, number, number],
    axis: [number, number, number]
  ): [number, number, number] {
    const time = Date.now() * 0.001 * speed;
    const [cx, cy, cz] = centerPosition;
    const [ax, ay, az] = axis;
    
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
    centerPosition: [number, number, number],
    axis: [number, number, number]
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
