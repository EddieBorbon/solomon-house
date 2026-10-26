import { create } from 'zustand';
import { audioManager, type AudioParams } from '../AudioManager';
import { useWorldStore, type SoundObject } from '../../state/useWorldStore';
import { evaluateCurve, type CurveType } from './transferCurves';

/**
 * Motor de Mapeo Paramétrico Unificado (roadmap 5.1).
 *
 * Permite al compositor declarar qué parámetro geométrico de un objeto
 * (posición, escala, rotación) controla qué parámetro de síntesis
 * (frecuencia, volumen, armonicidad…), mediado por una curva de
 * transferencia (5.2). Los mapeos se evalúan en un bucle ligero (~15 Hz)
 * que lee las transformaciones del store y aplica los valores al motor
 * de audio, de modo que mover, escalar o rotar un objeto *toca* su
 * sintetizador en tiempo real.
 *
 * Los mapeos se persisten en localStorage por id de objeto.
 */

export type GeometricSource =
  | 'posX' | 'posY' | 'posZ'
  | 'scaleX' | 'scaleY' | 'scaleZ'
  | 'rotX' | 'rotY' | 'rotZ';

export type AudioTarget =
  | 'frequency' | 'volume' | 'harmonicity' | 'modulationIndex'
  | 'vibratoAmount' | 'vibratoRate' | 'ampAttack' | 'ampRelease';

export const SOURCE_LABELS: Record<GeometricSource, string> = {
  posX: 'Posición X', posY: 'Posición Y (altura)', posZ: 'Posición Z',
  scaleX: 'Escala X', scaleY: 'Escala Y', scaleZ: 'Escala Z',
  rotX: 'Rotación X', rotY: 'Rotación Y', rotZ: 'Rotación Z',
};

export const TARGET_LABELS: Record<AudioTarget, string> = {
  frequency: 'Frecuencia (Hz)',
  volume: 'Volumen',
  harmonicity: 'Armonicidad',
  modulationIndex: 'Índice de modulación',
  vibratoAmount: 'Cantidad de vibrato',
  vibratoRate: 'Velocidad de vibrato',
  ampAttack: 'Ataque (s)',
  ampRelease: 'Liberación (s)',
};

/** Rangos de entrada geométrica y salida sonora por defecto */
export const DEFAULT_SOURCE_RANGE: Record<GeometricSource, [number, number]> = {
  posX: [-10, 10], posY: [0, 10], posZ: [-10, 10],
  scaleX: [0.1, 4], scaleY: [0.1, 4], scaleZ: [0.1, 4],
  rotX: [0, 360], rotY: [0, 360], rotZ: [0, 360],
};

export const DEFAULT_TARGET_RANGE: Record<AudioTarget, [number, number]> = {
  frequency: [55, 1760], // A1-A6, rango continuo: precisión de micro-tonos
  volume: [0, 1],
  harmonicity: [0.5, 8],
  modulationIndex: [0, 40],
  vibratoAmount: [0, 1],
  vibratoRate: [0.5, 12],
  ampAttack: [0.005, 2],
  ampRelease: [0.05, 4],
};

export interface ParameterMapping {
  id: string;
  source: GeometricSource;
  target: AudioTarget;
  curve: CurveType;
  /** Intensidad de la curva no lineal (>0) */
  shape: number;
  /** Tabla de la curva libre (5.2), muestras [0,1] */
  freeTable?: number[];
  inMin: number;
  inMax: number;
  outMin: number;
  outMax: number;
  enabled: boolean;
}

const STORAGE_KEY = 'solomon-house:parameter-mappings';
const TICK_MS = 66; // ~15 Hz, mismo orden que la sincronización P2P

function readSourceValue(object: SoundObject, source: GeometricSource): number {
  switch (source) {
    case 'posX': return object.position[0];
    case 'posY': return object.position[1];
    case 'posZ': return object.position[2];
    case 'scaleX': return object.scale[0];
    case 'scaleY': return object.scale[1];
    case 'scaleZ': return object.scale[2];
    case 'rotX': return object.rotation[0];
    case 'rotY': return object.rotation[1];
    case 'rotZ': return object.rotation[2];
  }
}

/** Aplica un mapeo: normaliza, evalúa la curva y des-normaliza. */
export function evaluateMapping(mapping: ParameterMapping, sourceValue: number): number {
  const span = mapping.inMax - mapping.inMin;
  const t = span === 0 ? 0 : (sourceValue - mapping.inMin) / span;
  const shaped = evaluateCurve(mapping.curve, t, mapping.shape, mapping.freeTable);
  return mapping.outMin + shaped * (mapping.outMax - mapping.outMin);
}

interface MappingState {
  /** Mapeos por id de objeto sonoro */
  mappings: Record<string, ParameterMapping[]>;
  addMapping: (objectId: string, mapping: ParameterMapping) => void;
  updateMapping: (objectId: string, mappingId: string, updates: Partial<ParameterMapping>) => void;
  removeMapping: (objectId: string, mappingId: string) => void;
  getMappings: (objectId: string) => ParameterMapping[];
}

function loadPersisted(): Record<string, ParameterMapping[]> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function persist(mappings: Record<string, ParameterMapping[]>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings));
  } catch {
    // Almacenamiento no disponible: los mapeos viven solo en sesión
  }
}

export const useMappingStore = create<MappingState>((set, get) => ({
  mappings: loadPersisted(),

  addMapping: (objectId, mapping) => {
    set((state) => {
      const next = {
        ...state.mappings,
        [objectId]: [...(state.mappings[objectId] ?? []), mapping],
      };
      persist(next);
      return { mappings: next };
    });
  },

  updateMapping: (objectId, mappingId, updates) => {
    set((state) => {
      const list = state.mappings[objectId] ?? [];
      const next = {
        ...state.mappings,
        [objectId]: list.map((m) => (m.id === mappingId ? { ...m, ...updates } : m)),
      };
      persist(next);
      return { mappings: next };
    });
  },

  removeMapping: (objectId, mappingId) => {
    set((state) => {
      const list = (state.mappings[objectId] ?? []).filter((m) => m.id !== mappingId);
      const next = { ...state.mappings, [objectId]: list };
      if (list.length === 0) delete next[objectId];
      persist(next);
      return { mappings: next };
    });
  },

  getMappings: (objectId) => get().mappings[objectId] ?? [],
}));

let runtimeTimer: ReturnType<typeof setInterval> | null = null;
/** Último valor aplicado por mapeo, para no re-enviar parámetros sin cambio */
const lastApplied = new Map<string, number>();

function tick(): void {
  const { mappings } = useMappingStore.getState();
  const objectIds = Object.keys(mappings);
  if (objectIds.length === 0) return;

  const { grids } = useWorldStore.getState();
  const objectsById = new Map<string, SoundObject>();
  grids.forEach((grid) => {
    (grid.objects ?? []).forEach((obj) => {
      if (obj?.id) objectsById.set(obj.id, obj);
    });
  });

  objectIds.forEach((objectId) => {
    const object = objectsById.get(objectId);
    if (!object) return;

    const updates: Partial<AudioParams> = {};
    let hasUpdates = false;

    mappings[objectId].forEach((mapping) => {
      if (!mapping.enabled) return;
      const value = evaluateMapping(mapping, readSourceValue(object, mapping.source));
      const key = `${objectId}:${mapping.id}`;
      const previous = lastApplied.get(key);
      // Umbral relativo pequeño para no saturar el motor de audio
      if (previous === undefined || Math.abs(value - previous) > 1e-4) {
        lastApplied.set(key, value);
        (updates as Record<string, number>)[mapping.target] = value;
        hasUpdates = true;
      }
    });

    if (hasUpdates) {
      try {
        audioManager.updateSoundParams(objectId, updates);
      } catch {
        // Fuente aún no creada o en liberación
      }
    }
  });
}

/** Arranca el bucle de evaluación de mapeos (idempotente). */
export function startMappingRuntime(): void {
  if (runtimeTimer !== null || typeof window === 'undefined') return;
  runtimeTimer = setInterval(tick, TICK_MS);
}

export function stopMappingRuntime(): void {
  if (runtimeTimer !== null) {
    clearInterval(runtimeTimer);
    runtimeTimer = null;
  }
  lastApplied.clear();
}
