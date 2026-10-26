import { create } from 'zustand';
import { type SoundObjectType, type EffectZone } from '../../state/useWorldStore';

/**
 * Tabla de Niveles Paramétricos N1–N4 (roadmap 8.1).
 *
 * Sistema de control pedagógico que restringe dinámicamente las
 * herramientas disponibles según el nivel elegido por el moderador del
 * cuarto, siguiendo la progresión propuesta por el Dr. Sánchez Escuer:
 * de la iniciación con osciladores simples a la experimentación abierta.
 */

export type ParametricLevel = 1 | 2 | 3 | 4;
export type EffectType = EffectZone['type'];

export interface LevelDefinition {
  level: ParametricLevel;
  name: string;
  description: string;
  /** Tipos de objeto sonoro permitidos ('all' = sin restricción). */
  allowedObjectTypes: SoundObjectType[] | 'all';
  /** Efectos permitidos ('all' = todos, [] = ninguno). */
  allowedEffectTypes: EffectType[] | 'all';
  /** Registro de frecuencias permitido [min, max] en Hz. */
  frequencyRange: [number, number];
  /** Carga de samples propios (síntesis concreta). */
  allowSampleLoading: boolean;
  /** Programación de formas/síntesis personalizadas (objetos custom). */
  allowCustomCode: boolean;
}

export const PARAMETRIC_LEVELS: Record<ParametricLevel, LevelDefinition> = {
  1: {
    level: 1,
    name: 'N1 · Iniciación',
    description:
      'Solo osciladores simples, registro medio acotado, sin zonas de efectos.',
    allowedObjectTypes: ['cube', 'sphere', 'cylinder'],
    allowedEffectTypes: [],
    frequencyRange: [110, 880],
    allowSampleLoading: false,
    allowCustomCode: false,
  },
  2: {
    level: 2,
    name: 'N2 · Exploración',
    description:
      'Síntesis FM básica activa y efectos simples (delay, reverb).',
    allowedObjectTypes: ['cube', 'sphere', 'cylinder', 'cone', 'plane'],
    allowedEffectTypes: ['reverb', 'feedbackDelay', 'jcReverb'],
    frequencyRange: [55, 1760],
    allowSampleLoading: false,
    allowCustomCode: false,
  },
  3: {
    level: 3,
    name: 'N3 · Composición Avanzada',
    description:
      'Todos los tipos de síntesis, zonas de efectos paramétricas complejas y control completo de envolventes.',
    allowedObjectTypes: [
      'cube', 'sphere', 'cylinder', 'cone', 'pyramid', 'icosahedron',
      'plane', 'torus', 'dodecahedronRing', 'spiral',
    ],
    allowedEffectTypes: 'all',
    frequencyRange: [20, 20000],
    allowSampleLoading: false,
    allowCustomCode: false,
  },
  4: {
    level: 4,
    name: 'N4 · Experimental Abierto',
    description:
      'Sin restricciones: carga de samples propios y programación de síntesis.',
    allowedObjectTypes: 'all',
    allowedEffectTypes: 'all',
    frequencyRange: [20, 20000],
    allowSampleLoading: true,
    allowCustomCode: true,
  },
};

interface PedagogyState {
  level: ParametricLevel;
  setLevel: (level: ParametricLevel) => void;
}

/**
 * Store del nivel paramétrico vigente. Por defecto N4 (experimental
 * abierto) para conservar el comportamiento histórico de la plataforma;
 * el moderador puede restringirlo desde el selector de niveles.
 */
export const usePedagogyStore = create<PedagogyState>((set) => ({
  level: 4,
  setLevel: (level) => set({ level }),
}));

export function getCurrentLevel(): LevelDefinition {
  return PARAMETRIC_LEVELS[usePedagogyStore.getState().level];
}

/** Verifica si un tipo de objeto está permitido en el nivel vigente. */
export function isObjectTypeAllowed(type: SoundObjectType): boolean {
  const level = getCurrentLevel();
  if (type === 'custom' && !level.allowCustomCode) return false;
  if (level.allowedObjectTypes === 'all') return true;
  return level.allowedObjectTypes.includes(type);
}

/** Verifica si un tipo de efecto está permitido en el nivel vigente. */
export function isEffectTypeAllowed(type: EffectType): boolean {
  const level = getCurrentLevel();
  if (level.allowedEffectTypes === 'all') return true;
  return level.allowedEffectTypes.includes(type);
}

/** Acota una frecuencia al registro permitido por el nivel vigente. */
export function clampFrequencyToLevel(frequency: number): number {
  const [min, max] = getCurrentLevel().frequencyRange;
  return Math.max(min, Math.min(max, frequency));
}
