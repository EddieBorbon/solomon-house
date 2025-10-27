import { type AudioParams } from '../lib/AudioManager';

// Tipos base para el mundo 3D
export type SoundObjectType = 'cube' | 'sphere' | 'cylinder' | 'cone' | 'pyramid' | 'icosahedron' | 'plane' | 'torus' | 'dodecahedronRing' | 'spiral';
export type MovementType = 'linear' | 'circular' | 'polar' | 'random' | 'figure8' | 'spiral';
export type EffectType = 'phaser' | 'autoFilter' | 'autoWah' | 'bitCrusher' | 'chebyshev' | 'chorus' | 'distortion' | 'feedbackDelay' | 'freeverb' | 'frequencyShifter' | 'jcReverb' | 'pingPongDelay' | 'pitchShift' | 'reverb' | 'stereoWidener' | 'tremolo' | 'vibrato';

// Interfaces base para entidades
export interface BaseEntity {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  isSelected: boolean;
}

// Interfaz para objetos de sonido
export interface SoundObject extends BaseEntity {
  type: SoundObjectType;
  audioParams: AudioParams;
  audioEnabled: boolean;
}

// Interfaz para objetos móviles
export interface MobileObject extends BaseEntity {
  type: 'mobile';
  mobileParams: {
    movementType: MovementType;
    radius: number;
    speed: number;
    proximityThreshold: number;
    isActive: boolean;
    centerPosition: [number, number, number];
    direction: [number, number, number];
    axis: [number, number, number];
    amplitude: number;
    frequency: number;
    randomSeed: number;
    height: number;
    heightSpeed: number;
    showRadiusIndicator?: boolean;
    showProximityIndicator?: boolean;
    showSphere?: boolean;
  };
}

// Interfaz para zonas de efecto
export interface EffectZone extends BaseEntity {
  type: EffectType;
  shape: 'sphere' | 'cube';
  isLocked: boolean;
  effectParams: Record<string, unknown>;
}

// Interfaz para cuadrículas
export interface Grid {
  id: string;
  coordinates: [number, number, number];
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  objects: SoundObject[];
  mobileObjects: MobileObject[];
  effectZones: EffectZone[];
  gridSize: number;
  gridColor: string;
  isLoaded: boolean;
  isSelected: boolean;
  [key: string]: unknown;
}

// Interfaces para acciones comunes
export interface EntityActions<T extends BaseEntity> {
  add: (entity: Omit<T, 'id'>) => void;
  update: (id: string, updates: Partial<Omit<T, 'id'>>) => void;
  remove: (id: string) => void;
  select: (id: string | null) => void;
  getById: (id: string) => T | undefined;
  getAll: () => T[];
}

// Interfaces específicas para cada store
export interface GridActions {
  createGrid: (position: [number, number, number], size?: number) => void;
  loadGrid: (coordinates: [number, number, number]) => void;
  unloadGrid: (coordinates: [number, number, number]) => void;
  moveToGrid: (coordinates: [number, number, number]) => void;
  getAdjacentGrids: () => Array<[number, number, number]>;
  selectGrid: (gridId: string | null) => void;
  setActiveGrid: (gridId: string | null) => void;
  updateGrid: (gridId: string, updates: Partial<Omit<Grid, 'id'>>) => void;
  deleteGrid: (gridId: string) => void;
  resizeGrid: (gridId: string, newSize: number) => void;
  moveGrid: (gridId: string, position: [number, number, number]) => void;
  rotateGrid: (gridId: string, rotation: [number, number, number]) => void;
  scaleGrid: (gridId: string, scale: [number, number, number]) => void;
}

export interface SoundObjectActions {
  addObject: (type: SoundObjectType, position: [number, number, number]) => void;
  removeObject: (id: string) => void;
  updateObject: (id: string, updates: Partial<Omit<SoundObject, 'id'>>) => void;
  selectEntity: (id: string | null) => void;
  toggleObjectAudio: (id: string, forceState?: boolean) => void;
  triggerObjectNote: (id: string) => void;
  triggerObjectPercussion: (id: string) => void;
  triggerObjectAttackRelease: (id: string) => void;
  startObjectGate: (id: string) => void;
  stopObjectGate: (id: string) => void;
  clearAllObjects: () => void;
  getById: (id: string) => SoundObject | undefined;
  getAll: () => SoundObject[];
}

export interface MobileObjectActions {
  addMobileObject: (position: [number, number, number]) => void;
  removeMobileObject: (id: string) => void;
  updateMobileObject: (id: string, updates: Partial<Omit<MobileObject, 'id'>>) => void;
  selectEntity: (id: string | null) => void;
  updateMobileObjectPosition: (id: string, position: [number, number, number]) => void;
  getById: (id: string) => MobileObject | undefined;
  getAll: () => MobileObject[];
}

export interface EffectZoneActions {
  addEffectZone: (type: EffectType, position: [number, number, number], shape?: 'sphere' | 'cube') => void;
  removeEffectZone: (id: string) => void;
  updateEffectZone: (id: string, updates: Partial<Omit<EffectZone, 'id'>>) => void;
  selectEntity: (id: string | null) => void;
  toggleLockEffectZone: (id: string) => void;
  setEditingEffectZone: (isEditing: boolean) => void;
  refreshAllEffects: () => void;
  debugAudioChain: (soundId: string) => void;
  getById: (id: string) => EffectZone | undefined;
  getAll: () => EffectZone[];
}

export interface SelectionActions {
  selectEntity: (id: string | null) => void;
  setTransformMode: (mode: 'translate' | 'rotate' | 'scale') => void;
  getSelectedEntity: () => BaseEntity | null;
  getSelectedEntityType: () => 'soundObject' | 'mobileObject' | 'effectZone' | null;
}

// Estado global del mundo
export interface WorldState {
  // Estado de cuadrículas
  grids: Map<string, Grid>;
  currentGridCoordinates: [number, number, number];
  activeGridId: string | null;
  gridSize: number;
  renderDistance: number;
  
  // Estado de selección y transformación
  selectedEntityId: string | null;
  transformMode: 'translate' | 'rotate' | 'scale';
  isEditingEffectZone: boolean;
  
  // Estado de proyecto
  currentProjectId: string | null;
  
  // Estado de mundos
  worlds: Array<{ id: string; name: string }>;
  currentWorldId: string | null;
}

// Acciones globales del mundo
export interface WorldActions extends GridActions, MobileObjectActions, SelectionActions {
  // Acciones de proyecto
  setCurrentProjectId: (projectId: string | null) => void;
  
  // Acciones de mundos
  createWorld: (name: string) => void;
  deleteWorld: (id: string) => void;
  switchWorld: (id: string) => void;
  
  // Acciones específicas de objetos sonoros
  addObject: (type: SoundObjectType, position: [number, number, number]) => void;
  removeObject: (id: string) => void;
  updateObject: (id: string, updates: Partial<Omit<SoundObject, 'id'>>) => void;
  toggleObjectAudio: (id: string, forceState?: boolean) => void;
  triggerObjectNote: (id: string) => void;
  triggerObjectPercussion: (id: string) => void;
  triggerObjectAttackRelease: (id: string) => void;
  startObjectGate: (id: string) => void;
  stopObjectGate: (id: string) => void;
  clearAllObjects: () => void;
  getObjectById: (id: string) => SoundObject | undefined;
  getAllObjects: () => SoundObject[];
  
  // Acciones específicas de zonas de efectos
  addEffectZone: (type: EffectType, position: [number, number, number], shape?: 'sphere' | 'cube') => void;
  removeEffectZone: (id: string) => void;
  updateEffectZone: (id: string, updates: Partial<Omit<EffectZone, 'id'>>) => void;
  toggleLockEffectZone: (id: string) => void;
  setEditingEffectZone: (isEditing: boolean) => void;
  refreshAllEffects: () => void;
  debugAudioChain: (soundId: string) => void;
  getEffectZoneById: (id: string) => EffectZone | undefined;
  getAllEffectZones: () => EffectZone[];
}
