import { Group } from 'three';
import { SoundObject, MobileObject, EffectZone } from '../../state/useWorldStore';
import { AudioParams } from '../factories/SoundSourceFactory';

// Tipos base para el sistema de escena
export interface SceneEntity {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  isSelected: boolean;
}

export interface SceneObject extends SceneEntity {
  type: SoundObjectType;
  audioEnabled: boolean;
  audioParams: AudioParams;
}

export interface SceneMobileObject extends SceneEntity {
  mobileParams: MobileObject['mobileParams'];
}

export interface SceneEffectZone extends SceneEntity {
  effectType: EffectType;
  effectParams: EffectZone['effectParams'];
  isLocked: boolean;
}

// Tipos de objetos de sonido soportados
export type SoundObjectType = 
  | 'cube' 
  | 'sphere' 
  | 'cylinder' 
  | 'cone' 
  | 'pyramid' 
  | 'icosahedron' 
  | 'plane' 
  | 'torus' 
  | 'dodecahedronRing' 
  | 'spiral';

// Tipos de efectos soportados
export type EffectType = 
  | 'reverb' 
  | 'delay' 
  | 'chorus' 
  | 'distortion' 
  | 'filter' 
  | 'tremolo' 
  | 'vibrato' 
  | 'pitchShift' 
  | 'stereoWidener' 
  | 'pingPongDelay' 
  | 'autoFilter' 
  | 'autoWah' 
  | 'bitCrusher' 
  | 'chebyshev' 
  | 'frequencyShifter' 
  | 'jcReverb' 
  | 'feedbackDelay' 
  | 'freeverb'
  | 'phaser';

// Interfaces para el sistema de renderizado
export interface ISceneObjectRenderer {
  render(object: SceneObject): React.ReactElement | null;
}

export interface ISceneMobileObjectRenderer {
  render(object: SceneMobileObject): React.ReactElement | null;
}

export interface ISceneEffectZoneRenderer {
  render(zone: SceneEffectZone): React.ReactElement | null;
}

// Interfaces para el sistema de transformación
export interface ITransformHandler {
  handleTransformChange(entityId: string, transform: TransformData): void;
  handleTransformStart(): void;
  handleTransformEnd(): void;
}

export interface TransformData {
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  scale?: { x: number; y: number; z: number };
}

// Interfaces para el sistema de selección
export interface ISelectionHandler {
  handleEntitySelect(id: string): void;
  handleBackgroundClick(event: unknown): void;
}

// Interfaces para el sistema de audio
export interface IAudioHandler {
  handleObjectClick(object: SceneObject): void;
  triggerObjectNote(id: string): void;
  toggleObjectAudio(id: string): void;
}

// Configuración del sistema de escena
export interface SceneConfig {
  enableTransformControls: boolean;
  enableAudioInteraction: boolean;
  enableSelection: boolean;
  transformControlSize: number;
  backgroundPlaneSize: number;
}

// Estado del sistema de escena
export interface SceneState {
  selectedEntityId: string | null;
  transformMode: 'translate' | 'rotate' | 'scale';
  isTransforming: boolean;
  entities: {
    objects: SceneObject[];
    mobileObjects: SceneMobileObject[];
    effectZones: SceneEffectZone[];
  };
}

// Resultado de operaciones de escena
export interface SceneOperationResult {
  success: boolean;
  entityId: string;
  operation: string;
  message: string;
  error?: string;
}

// Re-exportar tipos necesarios
export type { SoundObject, MobileObject, EffectZone, AudioParams };
