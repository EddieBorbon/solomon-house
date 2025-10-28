import React from 'react';
import { SoundCube } from '../../components/sound-objects/SoundCube';
import { SoundSphere } from '../../components/sound-objects/SoundSphere';
import { SoundCylinder } from '../../components/sound-objects/SoundCylinder';
import { SoundCone } from '../../components/sound-objects/SoundCone';
import { SoundPyramid } from '../../components/sound-objects/SoundPyramid';
import { SoundIcosahedron } from '../../components/sound-objects/SoundIcosahedron';
import { SoundPlane } from '../../components/sound-objects/SoundPlane';
import { SoundTorus } from '../../components/sound-objects/SoundTorus';
import { SoundDodecahedronRing } from '../../components/sound-objects/SoundDodecahedronRing';
import { SoundSpiral } from '../../components/sound-objects/SoundSpiral';
import { 
  SceneObject, 
  SoundObjectType, 
  ISceneObjectRenderer,
  AudioParams 
} from './types';

/**
 * Factory Pattern para crear renderizadores de objetos de escena
 * Resuelve el switch gigante del SceneContent original
 */
export class SceneObjectFactory implements ISceneObjectRenderer {
  private static instance: SceneObjectFactory;
  
  private constructor() {
    // Constructor privado para Singleton
  }

  public static getInstance(): SceneObjectFactory {
    if (!SceneObjectFactory.instance) {
      SceneObjectFactory.instance = new SceneObjectFactory();
    }
    return SceneObjectFactory.instance;
  }

  /**
   * Renderiza un objeto de escena según su tipo
   */
  public render(object: SceneObject): React.ReactElement | null {
    const commonProps = {
      id: object.id,
      position: [0, 0, 0] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      scale: [1, 1, 1] as [number, number, number],
      isSelected: object.isSelected,
      audioEnabled: object.audioEnabled,
      audioParams: object.audioParams as unknown as AudioParams
    };

    try {
      switch (object.type) {
        case 'cube':
          return (
            <SoundCube
              {...commonProps}
              rotation={[0, 0, 0]}
              scale={[1, 1, 1]}
            />
          );

        case 'sphere':
          return (
            <SoundSphere
              {...commonProps}
            />
          );

        case 'cylinder':
          return (
            <SoundCylinder
              {...commonProps}
              rotation={[0, 0, 0]}
              scale={[1, 1, 1]}
            />
          );

        case 'cone':
          return (
            <SoundCone
              {...commonProps}
              rotation={[0, 0, 0]}
              scale={[1, 1, 1]}
            />
          );

        case 'pyramid':
          return (
            <SoundPyramid
              {...commonProps}
              rotation={[0, 0, 0]}
              scale={[1, 1, 1]}
            />
          );

        case 'icosahedron':
          return (
            <SoundIcosahedron
              {...commonProps}
              rotation={[0, 0, 0]}
              scale={[1, 1, 1]}
            />
          );

        case 'plane':
          return (
            <SoundPlane
              {...commonProps}
              rotation={[0, 0, 0]}
              scale={[1, 1, 1]}
            />
          );

        case 'torus':
          return (
            <SoundTorus
              {...commonProps}
              rotation={[0, 0, 0]}
              scale={[1, 1, 1]}
            />
          );

        case 'dodecahedronRing':
          return (
            <SoundDodecahedronRing
              {...commonProps}
            />
          );

        case 'spiral':
          return (
            <SoundSpiral
              {...commonProps}
              rotation={[0, 0, 0]}
              scale={[1, 1, 1]}
            />
          );

        default:
          return null;
      }
    } catch {
      return null;
    }
  }

  /**
   * Obtiene la lista de tipos de objetos soportados
   */
  public getSupportedTypes(): SoundObjectType[] {
    return [
      'cube',
      'sphere', 
      'cylinder',
      'cone',
      'pyramid',
      'icosahedron',
      'plane',
      'torus',
      'dodecahedronRing',
      'spiral'
    ];
  }

  /**
   * Valida si un tipo de objeto es soportado
   */
  public isTypeSupported(type: string): type is SoundObjectType {
    return this.getSupportedTypes().includes(type as SoundObjectType);
  }

  /**
   * Obtiene información sobre un tipo de objeto
   */
  public getObjectTypeInfo(type: SoundObjectType): {
    name: string;
    description: string;
    category: 'basic' | 'advanced' | 'special';
    audioBehavior: 'continuous' | 'percussive' | 'hybrid';
  } {
    const typeInfo = {
      cube: {
        name: 'Cube',
        description: 'Basic cubic sound object',
        category: 'basic' as const,
        audioBehavior: 'percussive' as const
      },
      sphere: {
        name: 'Sphere',
        description: 'Spherical sound object with FM synthesis',
        category: 'basic' as const,
        audioBehavior: 'percussive' as const
      },
      cylinder: {
        name: 'Cylinder',
        description: 'Cylindrical sound object with vibrato',
        category: 'basic' as const,
        audioBehavior: 'continuous' as const
      },
      cone: {
        name: 'Cone',
        description: 'Conical bass sound object',
        category: 'basic' as const,
        audioBehavior: 'continuous' as const
      },
      pyramid: {
        name: 'Pyramid',
        description: 'Pyramidal pluck sound object',
        category: 'basic' as const,
        audioBehavior: 'percussive' as const
      },
      icosahedron: {
        name: 'Icosahedron',
        description: 'Complex geometric sound object',
        category: 'advanced' as const,
        audioBehavior: 'percussive' as const
      },
      plane: {
        name: 'Plane',
        description: 'Flat plane sound object',
        category: 'basic' as const,
        audioBehavior: 'percussive' as const
      },
      torus: {
        name: 'Torus',
        description: 'Torus-shaped sound object',
        category: 'advanced' as const,
        audioBehavior: 'percussive' as const
      },
      dodecahedronRing: {
        name: 'Dodecahedron Ring',
        description: 'Ring of dodecahedrons',
        category: 'special' as const,
        audioBehavior: 'continuous' as const
      },
      spiral: {
        name: 'Spiral',
        description: 'Spiral-shaped sound object',
        category: 'special' as const,
        audioBehavior: 'percussive' as const
      },
      custom: {
        name: 'Custom',
        description: 'Custom sound object',
        category: 'advanced' as const,
        audioBehavior: 'continuous' as const
      }
    };

    return typeInfo[type] || {
      name: 'Unknown',
      description: 'Unknown object type',
      category: 'basic',
      audioBehavior: 'percussive'
    };
  }

  /**
   * Obtiene estadísticas del factory
   */
  public getFactoryStats(): {
    supportedTypes: number;
    totalRenders: number;
    errorCount: number;
  } {
    return {
      supportedTypes: this.getSupportedTypes().length,
      totalRenders: 0, // En una implementación real, llevarías un contador
      errorCount: 0     // En una implementación real, llevarías un contador de errores
    };
  }
}
