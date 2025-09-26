import { EffectZone, SoundObject, MobileObject } from '../../state/useWorldStore';
import { AudioParams } from '../AudioManager';

// Tipos base para el sistema de parámetros
export interface ParameterEntity {
  id: string;
  type: string;
  isSelected: boolean;
}

export interface SoundObjectEntity extends ParameterEntity {
  type: 'soundObject';
  audioParams: AudioParams;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export interface EffectZoneEntity extends ParameterEntity {
  type: 'effectZone';
  effectType: EffectType;
  effectParams: EffectZone['effectParams'];
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  isLocked: boolean;
}

export interface MobileObjectEntity extends ParameterEntity {
  type: 'mobileObject';
  mobileParams: MobileObject['mobileParams'];
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

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
  | 'freeverb';

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

// Interfaces para el sistema de parámetros
export interface IParameterComponentFactory {
  createEffectComponent(effectType: EffectType, zone: EffectZoneEntity): React.ReactElement | null;
  createSoundObjectComponent(objectType: SoundObjectType, object: SoundObjectEntity): React.ReactElement | null;
  createMobileObjectComponent(object: MobileObjectEntity): React.ReactElement | null;
}

export interface IParameterManager {
  updateParameter(entityId: string, param: string, value: unknown): void;
  validateParameter(entityType: string, param: string, value: unknown): boolean;
  getParameterInfo(entityType: string, param: string): ParameterInfo | null;
}

export interface IParameterValidator {
  validateEffectParameter(effectType: EffectType, param: string, value: unknown): ValidationResult;
  validateSoundObjectParameter(objectType: SoundObjectType, param: string, value: unknown): ValidationResult;
  validateMobileObjectParameter(param: string, value: unknown): ValidationResult;
}

// Interfaces para el sistema de UI
export interface IParameterPanel {
  render(entity: ParameterEntity): React.ReactElement | null;
  isExpanded(): boolean;
  toggleExpanded(): void;
  setExpanded(expanded: boolean): void;
}

export interface IParameterSection {
  render(entity: ParameterEntity): React.ReactElement | null;
  getSectionTitle(): string;
  getSectionIcon(): string;
}

// Interfaces para el sistema de transformación
export interface ITransformManager {
  updateTransform(entityId: string, transform: TransformData): void;
  resetTransform(entityId: string): void;
  validateTransform(transform: TransformData): boolean;
}

export interface TransformData {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

// Interfaces para el sistema de estado
export interface IParameterStateManager {
  getEntityState(entityId: string): EntityState | null;
  updateEntityState(entityId: string, updates: Partial<EntityState>): void;
  subscribeToChanges(callback: (entityId: string, state: EntityState) => void): () => void;
}

export interface EntityState {
  isUpdating: boolean;
  lastUpdatedParam: string | null;
  isRefreshing: boolean;
  isExpanded: boolean;
}

// Configuración del sistema de parámetros
export interface ParameterConfig {
  enableRealTimeUpdates: boolean;
  updateDelay: number;
  enableValidation: boolean;
  enableTransformControls: boolean;
  panelWidth: number;
  animationDuration: number;
}

// Información de parámetros
export interface ParameterInfo {
  name: string;
  type: 'number' | 'string' | 'boolean' | 'array' | 'object';
  min?: number;
  max?: number;
  step?: number;
  defaultValue: unknown;
  description: string;
  category: string;
}

// Resultado de validación
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  normalizedValue?: unknown;
}

// Resultado de operaciones de parámetros
export interface ParameterOperationResult {
  success: boolean;
  entityId: string;
  parameter: string;
  operation: string;
  message: string;
  error?: string;
}

// Estadísticas del sistema de parámetros
export interface ParameterStats {
  totalParameters: number;
  activeEntities: number;
  updateCount: number;
  errorCount: number;
  validationCount: number;
}

// Re-exportar tipos necesarios
export type { EffectZone, SoundObject, MobileObject, AudioParams };