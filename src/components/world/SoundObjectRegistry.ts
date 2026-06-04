import React from 'react';
import { SoundCube } from '../sound-objects/SoundCube';
import { SoundSphere } from '../sound-objects/SoundSphere';
import { SoundCylinder } from '../sound-objects/SoundCylinder';
import { SoundCone } from '../sound-objects/SoundCone';
import { SoundPyramid } from '../sound-objects/SoundPyramid';
import { SoundIcosahedron } from '../sound-objects/SoundIcosahedron';
import { SoundPlane } from '../sound-objects/SoundPlane';
import { SoundTorus } from '../sound-objects/SoundTorus';
import { SoundDodecahedronRing } from '../sound-objects/SoundDodecahedronRing';
import { SoundSpiral } from '../sound-objects/SoundSpiral';
import { SoundCustom } from '../sound-objects/SoundCustom';
import { SoundObjectType } from '../../state/useWorldStore';

/**
 * Interface unificada para las Props de todas las formas sonoras 3D.
 * Garantiza el principio de sustitución de Liskov (LSP).
 */
export interface SoundObjectProps {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  isSelected: boolean;
  audioEnabled: boolean;
  audioParams: any;
  customShapeCode?: string;
}

/**
 * Registro estático de formas sonoras 3D mapeadas por su tipo.
 * Cumple con el principio de Abstracción y Open/Closed (OCP).
 */
export const SoundObjectRegistry: Record<SoundObjectType, React.ComponentType<SoundObjectProps>> = {
  cube: SoundCube as React.ComponentType<any>,
  sphere: SoundSphere as React.ComponentType<any>,
  cylinder: SoundCylinder as React.ComponentType<any>,
  cone: SoundCone as React.ComponentType<any>,
  pyramid: SoundPyramid as React.ComponentType<any>,
  icosahedron: SoundIcosahedron as React.ComponentType<any>,
  plane: SoundPlane as React.ComponentType<any>,
  torus: SoundTorus as React.ComponentType<any>,
  dodecahedronRing: SoundDodecahedronRing as React.ComponentType<any>,
  spiral: SoundSpiral as React.ComponentType<any>,
  custom: SoundCustom as React.ComponentType<any>
};
