import { create } from 'zustand';
import { type SoundObjectType, type EffectZone } from '../../state/useWorldStore';
import { type MusicologicalReport } from '../session/musicologicalAnalysis';

/**
 * Tabla de Niveles Paramétricos N1–N4 y Recorrido Gamificado
 * (roadmap 8.1 y Roadmap Funcional Jurado E2.4).
 *
 * Cubre:
 *  - E2.4.1: Restricciones por nivel en tempo (BPM), registro (Hz), densidad
 *            máxima de objetos y duración recomendada, además de las
 *            herramientas permitidas.
 *  - E2.4.2: Retos compositivos por nivel con criterio de cumplimiento
 *            evaluado automáticamente mediante la analítica musicológica E1.3.
 *  - E2.4.3: Progreso por participante y desbloqueo progresivo del siguiente nivel.
 */

export type ParametricLevel = 1 | 2 | 3 | 4;
export type LevelId = 'N1' | 'N2' | 'N3' | 'N4';
export type EffectType = EffectZone['type'];

export interface LevelChallenge {
  id: string;
  title: string;
  objective: string;
  criteriaDescription: string;
}

export interface LevelDefinition {
  id: LevelId;
  level: ParametricLevel;
  name: string;
  description: string;
  /** Tipos de objeto sonoro permitidos ('all' = sin restricción). */
  allowedObjectTypes: SoundObjectType[] | 'all';
  /** Efectos permitidos ('all' = todos, [] = ninguno). */
  allowedEffectTypes: EffectType[] | 'all';
  /** Registro de frecuencias permitido [min, max] en Hz (E2.4.1). */
  frequencyRange: [number, number];
  /** Rango de tempo / pulso permitido [minBpm, maxBpm] (E2.4.1). */
  tempoRangeBpm: [number, number];
  /** Densidad máxima de objetos simultáneos en la sala (E2.4.1). */
  maxObjectsDensity: number;
  /** Duración máxima o recomendada de sesión en minutos (E2.4.1). */
  recommendedDurationMin: number;
  /** Carga de samples propios (síntesis concreta). */
  allowSampleLoading: boolean;
  /** Programación de formas/síntesis personalizadas (objetos custom). */
  allowCustomCode: boolean;
  /** Reto compositivo del nivel medido con E1.3 (E2.4.2). */
  challenge: LevelChallenge;
}

export const PARAMETRIC_LEVELS: Record<ParametricLevel, LevelDefinition> = {
  1: {
    id: 'N1',
    level: 1,
    name: 'N1 · Iniciación',
    description:
      'Solo osciladores simples, registro medio acotado, densidad controlada y sin zonas de efectos.',
    allowedObjectTypes: ['cube', 'sphere', 'cylinder'],
    allowedEffectTypes: [],
    frequencyRange: [110, 880],
    tempoRangeBpm: [40, 90],
    maxObjectsDensity: 6,
    recommendedDurationMin: 10,
    allowSampleLoading: false,
    allowCustomCode: false,
    challenge: {
      id: 'challenge-n1',
      title: 'Tríada Espacial Equilibrada',
      objective:
        'Construir un tejido de al menos 3 fuentes en el registro medio (110–880 Hz) sin saturar la sala.',
      criteriaDescription: 'Densidad pico ≥ 3 objetos y ≤ 6 objetos, con al menos 2 frecuencias distintas.',
    },
  },
  2: {
    id: 'N2',
    level: 2,
    name: 'N2 · Exploración',
    description:
      'Síntesis FM y percusión de membrana activas con efectos espaciales simples (delay, reverb).',
    allowedObjectTypes: ['cube', 'sphere', 'cylinder', 'cone', 'plane'],
    allowedEffectTypes: ['reverb', 'feedbackDelay', 'jcReverb'],
    frequencyRange: [55, 1760],
    tempoRangeBpm: [45, 120],
    maxObjectsDensity: 12,
    recommendedDurationMin: 15,
    allowSampleLoading: false,
    allowCustomCode: false,
    challenge: {
      id: 'challenge-n2',
      title: 'Diálogo Tímbrico con Espacio Reverberante',
      objective:
        'Combinar al menos 2 familias de síntesis distintas e integrar una zona de efecto espacial.',
      criteriaDescription: '≥ 2 tipos de síntesis activos y ≥ 1 zona de efecto en la ficha E1.3.',
    },
  },
  3: {
    id: 'N3',
    level: 3,
    name: 'N3 · Composición Avanzada',
    description:
      'Todos los motores de síntesis, zonas de efectos complejas y control completo de envolventes.',
    allowedObjectTypes: [
      'cube', 'sphere', 'cylinder', 'cone', 'pyramid', 'icosahedron',
      'plane', 'torus', 'dodecahedronRing', 'spiral',
    ],
    allowedEffectTypes: 'all',
    frequencyRange: [20, 20000],
    tempoRangeBpm: [30, 180],
    maxObjectsDensity: 20,
    recommendedDurationMin: 20,
    allowSampleLoading: false,
    allowCustomCode: false,
    challenge: {
      id: 'challenge-n3',
      title: 'Contrapunto Espectral y Rítmico',
      objective:
        'Articular una textura con contraste espectral en las 3 bandas (grave, media, aguda) y organización rítmica definida.',
      criteriaDescription: '≥ 4 frecuencias distintas, centroide entre 250 y 2500 Hz y ≥ 5 objetos en pico.',
    },
  },
  4: {
    id: 'N4',
    level: 4,
    name: 'N4 · Experimental Abierto',
    description:
      'Sin restricciones: carga de samples comunitarios, síntesis granular, Csound y código personalizado.',
    allowedObjectTypes: 'all',
    allowedEffectTypes: 'all',
    frequencyRange: [20, 20000],
    tempoRangeBpm: [20, 240],
    maxObjectsDensity: 36,
    recommendedDurationMin: 30,
    allowSampleLoading: true,
    allowCustomCode: true,
    challenge: {
      id: 'challenge-n4',
      title: 'Obra Colectiva con Agencia Híbrida',
      objective:
        'Desarrollar una pieza telemática completa donde coexistan intervención humana y coproducción algorítmica.',
      criteriaDescription: 'Densidad pico ≥ 6 objetos e intervención compartida humana + algorítmica.',
    },
  },
};

export interface ChallengeEvaluationResult {
  passed: boolean;
  progressPct: number;
  feedback: string;
}

/**
 * Evalúa si la sesión actual cumple el reto compositivo del nivel indicado
 * utilizando las métricas musicológicas de E1.3 (E2.4.2).
 */
export function evaluateLevelChallenge(
  level: ParametricLevel,
  report: MusicologicalReport
): ChallengeEvaluationResult {
  const synthCount = Object.keys(report.timbre.synthesisDistribution).length;
  const effectCount = Object.values(report.timbre.effectDistribution).reduce((a, b) => a + b, 0);

  if (level === 1) {
    const hasMin = report.peakDensityObjects >= 3;
    const withinMax = report.peakDensityObjects <= 6;
    const hasFreqs = report.pitchSystem.distinctFrequenciesCount >= 2;
    const passed = hasMin && withinMax && hasFreqs;
    const score = (hasMin ? 40 : (report.peakDensityObjects / 3) * 40) + (withinMax ? 30 : 10) + (hasFreqs ? 30 : 0);
    return {
      passed,
      progressPct: Math.min(100, Math.round(score)),
      feedback: passed
        ? 'Reto N1 superado: tríada espacial equilibrada en registro medio.'
        : `Progreso N1: pico=${report.peakDensityObjects}/3 objetos, ${report.pitchSystem.distinctFrequenciesCount}/2 frecuencias.`,
    };
  }

  if (level === 2) {
    const hasSynths = synthCount >= 2;
    const hasEffects = effectCount >= 1;
    const passed = hasSynths && hasEffects;
    const score = Math.min(50, synthCount * 25) + (hasEffects ? 50 : 0);
    return {
      passed,
      progressPct: Math.min(100, Math.round(score)),
      feedback: passed
        ? 'Reto N2 superado: diálogo tímbrico y zona espacial activa.'
        : `Progreso N2: ${synthCount}/2 familias de síntesis, ${effectCount}/1 zonas de efecto.`,
    };
  }

  if (level === 3) {
    const hasFreqs = report.pitchSystem.distinctFrequenciesCount >= 4;
    const hasDensity = report.peakDensityObjects >= 5;
    const passed = hasFreqs && hasDensity;
    const score =
      Math.min(50, (report.pitchSystem.distinctFrequenciesCount / 4) * 50) +
      Math.min(50, (report.peakDensityObjects / 5) * 50);
    return {
      passed,
      progressPct: Math.min(100, Math.round(score)),
      feedback: passed
        ? 'Reto N3 superado: contrapunto espectral y densidad articulada.'
        : `Progreso N3: ${report.pitchSystem.distinctFrequenciesCount}/4 alturas, pico ${report.peakDensityObjects}/5 objetos.`,
    };
  }

  const hasPeak = report.peakDensityObjects >= 6;
  const hasHybrid = report.agency.algorithmicSharePct >= 5;
  const passed = hasPeak && hasHybrid;
  const score =
    Math.min(60, (report.peakDensityObjects / 6) * 60) + (hasHybrid ? 40 : 10);
  return {
    passed,
    progressPct: Math.min(100, Math.round(score)),
    feedback: passed
      ? 'Reto N4 superado: obra híbrida humano-algorítmica consolidada.'
      : `Progreso N4: pico ${report.peakDensityObjects}/6 objetos, agencia algorítmica ${report.agency.algorithmicSharePct}%.`,
  };
}

interface PedagogyState {
  level: ParametricLevel;
  unlockedLevels: ParametricLevel[];
  completedChallenges: ParametricLevel[];
  setLevel: (level: ParametricLevel) => void;
  unlockNextLevel: (completedLevel: ParametricLevel) => void;
}

export const usePedagogyStore = create<PedagogyState>((set) => ({
  level: 4,
  unlockedLevels: [1, 2, 3, 4],
  completedChallenges: [],
  setLevel: (level) => set({ level }),
  unlockNextLevel: (completedLevel) =>
    set((state) => {
      const nextLevel = Math.min(4, completedLevel + 1) as ParametricLevel;
      const unlocked = state.unlockedLevels.includes(nextLevel)
        ? state.unlockedLevels
        : [...state.unlockedLevels, nextLevel];
      const completed = state.completedChallenges.includes(completedLevel)
        ? state.completedChallenges
        : [...state.completedChallenges, completedLevel];
      return {
        unlockedLevels: unlocked,
        completedChallenges: completed,
      };
    }),
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

/** Verifica si se puede añadir un nuevo objeto sin superar la densidad máxima del nivel (E2.4.1). */
export function isWithinLevelDensityLimit(currentObjectCount: number): boolean {
  return currentObjectCount < getCurrentLevel().maxObjectsDensity;
}
