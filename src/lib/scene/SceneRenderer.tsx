import React, { useMemo, useCallback } from 'react';
import { Group } from 'three';
import { MobileObject } from '../../components/sound-objects/MobileObject';
import { EffectZone } from '../../components/world/EffectZone';
import { SceneObjectFactory } from './SceneObjectFactory';
import { 
  SceneObject, 
  SceneMobileObject, 
  SceneEffectZone,
  ISceneObjectRenderer,
  ISceneMobileObjectRenderer,
  ISceneEffectZoneRenderer,
  SceneOperationResult
} from './types';

/**
 * Renderer especializado para objetos de escena
 * Implementa Strategy Pattern para diferentes tipos de renderizado
 */
export class SceneRenderer implements ISceneObjectRenderer, ISceneMobileObjectRenderer, ISceneEffectZoneRenderer {
  private objectFactory: SceneObjectFactory;
  private renderStats: {
    objectsRendered: number;
    mobileObjectsRendered: number;
    effectZonesRendered: number;
    errors: number;
  };

  constructor() {
    this.objectFactory = SceneObjectFactory.getInstance();
    this.renderStats = {
      objectsRendered: 0,
      mobileObjectsRendered: 0,
      effectZonesRendered: 0,
      errors: 0
    };
  }

  /**
   * Renderiza un objeto de sonido
   */
  public render(object: SceneObject): React.ReactElement | null {
    try {
      const renderedObject = this.objectFactory.render(object);
      if (renderedObject) {
        this.renderStats.objectsRendered++;
      }
      return renderedObject;
    } catch (error) {
      this.renderStats.errors++;
      return null;
    }
  }

  /**
   * Renderiza un objeto móvil
   */
  public renderMobileObject(object: SceneMobileObject): React.ReactElement | null {
    try {
      this.renderStats.mobileObjectsRendered++;
      
      return (
        <MobileObject
          id={object.id}
          position={[0, 0, 0]} // Posición relativa a la cuadrícula
          rotation={object.rotation}
          scale={object.scale}
          isSelected={object.isSelected}
          mobileParams={{
            ...object.mobileParams,
            centerPosition: [0, 0, 0] // Centro relativo a la cuadrícula
          }}
          onUpdatePosition={(id, position) => {
            // Esta función será manejada por el componente padre
          }}
          onSelect={(id) => {
            // Esta función será manejada por el componente padre
          }}
        />
      );
    } catch (error) {
      this.renderStats.errors++;
      return null;
    }
  }

  /**
   * Renderiza una zona de efecto
   */
  public renderEffectZone(zone: SceneEffectZone): React.ReactElement | null {
    try {
      this.renderStats.effectZonesRendered++;
      
      return (
        <EffectZone
          zone={zone as any} // Cast necesario por compatibilidad con el componente existente
          onSelect={(id) => {
            // Esta función será manejada por el componente padre
          }}
        />
      );
    } catch (error) {
      this.renderStats.errors++;
      return null;
    }
  }

  /**
   * Renderiza múltiples objetos en lote
   */
  public renderBatch(entities: {
    objects: SceneObject[];
    mobileObjects: SceneMobileObject[];
    effectZones: SceneEffectZone[];
  }): {
    objects: React.ReactElement[];
    mobileObjects: React.ReactElement[];
    effectZones: React.ReactElement[];
    errors: SceneOperationResult[];
  } {
    const results = {
      objects: [] as React.ReactElement[],
      mobileObjects: [] as React.ReactElement[],
      effectZones: [] as React.ReactElement[],
      errors: [] as SceneOperationResult[]
    };

    // Renderizar objetos de sonido
    entities.objects.forEach(object => {
      try {
        const rendered = this.render(object);
        if (rendered) {
          results.objects.push(rendered);
        }
      } catch (error) {
        results.errors.push({
          success: false,
          entityId: object.id,
          operation: 'render',
          message: `Error renderizando objeto ${object.id}`,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Renderizar objetos móviles
    entities.mobileObjects.forEach(object => {
      try {
        const rendered = this.renderMobileObject(object);
        if (rendered) {
          results.mobileObjects.push(rendered);
        }
      } catch (error) {
        results.errors.push({
          success: false,
          entityId: object.id,
          operation: 'renderMobileObject',
          message: `Error renderizando objeto móvil ${object.id}`,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Renderizar zonas de efecto
    entities.effectZones.forEach(zone => {
      try {
        const rendered = this.renderEffectZone(zone);
        if (rendered) {
          results.effectZones.push(rendered);
        }
      } catch (error) {
        results.errors.push({
          success: false,
          entityId: zone.id,
          operation: 'renderEffectZone',
          message: `Error renderizando zona de efecto ${zone.id}`,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    return results;
  }

  /**
   * Obtiene estadísticas del renderer
   */
  public getRenderStats(): typeof this.renderStats {
    return { ...this.renderStats };
  }

  /**
   * Resetea las estadísticas del renderer
   */
  public resetStats(): void {
    this.renderStats = {
      objectsRendered: 0,
      mobileObjectsRendered: 0,
      effectZonesRendered: 0,
      errors: 0
    };
  }

  /**
   * Valida si una entidad puede ser renderizada
   */
  public validateEntity(entity: SceneObject | SceneMobileObject | SceneEffectZone): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!entity.id) {
      errors.push('Entity ID is required');
    }

    if (!entity.position || entity.position.length !== 3) {
      errors.push('Entity position must be a 3D coordinate');
    }

    if (!entity.rotation || entity.rotation.length !== 3) {
      errors.push('Entity rotation must be a 3D rotation');
    }

    if (!entity.scale || entity.scale.length !== 3) {
      errors.push('Entity scale must be a 3D scale');
    }

    // Validaciones específicas por tipo
    if ('type' in entity && !this.objectFactory.isTypeSupported(entity.type)) {
      errors.push(`Unsupported object type: ${entity.type}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Optimiza el renderizado basado en la distancia de la cámara
   */
  public shouldRenderEntity(
    entity: SceneObject | SceneMobileObject | SceneEffectZone,
    cameraPosition: [number, number, number],
    maxRenderDistance: number = 100
  ): boolean {
    const distance = Math.sqrt(
      Math.pow(entity.position[0] - cameraPosition[0], 2) +
      Math.pow(entity.position[1] - cameraPosition[1], 2) +
      Math.pow(entity.position[2] - cameraPosition[2], 2)
    );

    return distance <= maxRenderDistance;
  }

  /**
   * Obtiene información de debugging del renderer
   */
  public getDebugInfo(): {
    stats: typeof this.renderStats;
    factoryStats: ReturnType<SceneObjectFactory['getFactoryStats']>;
    supportedTypes: string[];
  } {
    return {
      stats: this.getRenderStats(),
      factoryStats: this.objectFactory.getFactoryStats(),
      supportedTypes: this.objectFactory.getSupportedTypes()
    };
  }
}
