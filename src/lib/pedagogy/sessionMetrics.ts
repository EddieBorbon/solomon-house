import { create } from 'zustand';
import { useWorldStore } from '../../state/useWorldStore';
import { analyzeTexture, BANDS, type TextureObject } from '../agents/accompaniment';

/**
 * Métricas de participación para el Panel del Tutor (roadmap 8.2).
 *
 * Observa el mundo colaborativo en tiempo real (los objetos de todos los
 * participantes llegan por la sincronización global) y acumula:
 *
 *   - número de objetos colocados y retirados durante la sesión,
 *   - tiempo de sesión,
 *   - densidad textural (total y por banda de frecuencia) muestreada
 *     periódicamente como serie temporal,
 *   - grabaciones de grafos: instantáneas completas del lienzo
 *     (objetos, zonas, móviles) exportables a JSON para su análisis
 *     posterior o re-interpretación con el lector de partituras (5.5).
 */

const DENSITY_SAMPLE_MS = 10_000;
const DENSITY_HISTORY_LIMIT = 360; // ~1 hora de muestras
const RECORDING_SAMPLE_MS = 5_000;
const RECORDING_LIMIT = 720; // ~1 hora de grabación

export interface DensitySample {
  t: number;
  total: number;
  bands: number[]; // [grave, media, aguda]
  dominance: number;
}

export interface GraphSnapshot {
  t: number;
  objects: {
    id: string;
    type: string;
    position: [number, number, number];
    frequency: number;
    waveform: string;
  }[];
  effectZones: { id: string; type: string; position: [number, number, number] }[];
  mobileObjects: { id: string; position: [number, number, number] }[];
}

interface TutorMetricsState {
  sessionStart: number;
  placedCount: number;
  removedCount: number;
  densityHistory: DensitySample[];
  isRecording: boolean;
  recording: GraphSnapshot[];
  recordingStart: number | null;
}

export const useTutorMetricsStore = create<TutorMetricsState>(() => ({
  sessionStart: Date.now(),
  placedCount: 0,
  removedCount: 0,
  densityHistory: [],
  isRecording: false,
  recording: [],
  recordingStart: null,
}));

function collectTextureObjects(): TextureObject[] {
  const { grids } = useWorldStore.getState();
  const objects: TextureObject[] = [];
  grids.forEach((grid) => {
    (grid.objects ?? []).forEach((obj) => {
      if (!obj?.id) return;
      objects.push({
        id: obj.id,
        frequency: obj.audioParams?.frequency || 440,
        waveform: String(obj.audioParams?.waveform || 'sine'),
        position: obj.position,
      });
    });
  });
  return objects;
}

function takeSnapshot(): GraphSnapshot {
  const { grids } = useWorldStore.getState();
  const snapshot: GraphSnapshot = { t: Date.now(), objects: [], effectZones: [], mobileObjects: [] };

  grids.forEach((grid) => {
    (grid.objects ?? []).forEach((obj) => {
      if (!obj?.id) return;
      snapshot.objects.push({
        id: obj.id,
        type: obj.type,
        position: obj.position,
        frequency: obj.audioParams?.frequency || 440,
        waveform: String(obj.audioParams?.waveform || 'sine'),
      });
    });
    (grid.effectZones ?? []).forEach((zone) => {
      if (!zone?.id) return;
      snapshot.effectZones.push({ id: zone.id, type: zone.type, position: zone.position });
    });
    (grid.mobileObjects ?? []).forEach((mobile) => {
      if (!mobile?.id) return;
      snapshot.mobileObjects.push({ id: mobile.id, position: mobile.position });
    });
  });

  return snapshot;
}

let collectorStarted = false;
let knownIds = new Set<string>();
let densityTimer: ReturnType<typeof setInterval> | null = null;
let recordingTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Arranca el recolector de métricas (idempotente): cuenta altas/bajas de
 * objetos por diferencia de conjuntos de ids y muestrea la densidad
 * textural periódicamente.
 */
export function startMetricsCollector(): void {
  if (collectorStarted || typeof window === 'undefined') return;
  collectorStarted = true;

  knownIds = new Set(collectTextureObjects().map((obj) => obj.id));

  useWorldStore.subscribe((state) => {
    const currentIds = new Set<string>();
    state.grids.forEach((grid) => {
      (grid.objects ?? []).forEach((obj) => {
        if (obj?.id) currentIds.add(obj.id);
      });
    });

    let placed = 0;
    let removed = 0;
    currentIds.forEach((id) => {
      if (!knownIds.has(id)) placed++;
    });
    knownIds.forEach((id) => {
      if (!currentIds.has(id)) removed++;
    });

    if (placed > 0 || removed > 0) {
      knownIds = currentIds;
      useTutorMetricsStore.setState((metricsState) => ({
        placedCount: metricsState.placedCount + placed,
        removedCount: metricsState.removedCount + removed,
      }));
    }
  });

  const sampleDensity = () => {
    const objects = collectTextureObjects();
    const analysis = analyzeTexture(objects);
    const sample: DensitySample = {
      t: Date.now(),
      total: objects.length,
      bands: analysis.counts,
      dominance: analysis.dominance,
    };
    useTutorMetricsStore.setState((state) => ({
      densityHistory: [...state.densityHistory, sample].slice(-DENSITY_HISTORY_LIMIT),
    }));
  };

  sampleDensity();
  densityTimer = setInterval(sampleDensity, DENSITY_SAMPLE_MS);
}

export function stopMetricsCollector(): void {
  if (densityTimer) {
    clearInterval(densityTimer);
    densityTimer = null;
  }
  stopGraphRecording();
  collectorStarted = false;
}

/** Inicia la grabación periódica de instantáneas del grafo. */
export function startGraphRecording(): void {
  if (recordingTimer || typeof window === 'undefined') return;

  useTutorMetricsStore.setState({
    isRecording: true,
    recording: [takeSnapshot()],
    recordingStart: Date.now(),
  });

  recordingTimer = setInterval(() => {
    useTutorMetricsStore.setState((state) => ({
      recording: [...state.recording, takeSnapshot()].slice(-RECORDING_LIMIT),
    }));
  }, RECORDING_SAMPLE_MS);
}

export function stopGraphRecording(): void {
  if (recordingTimer) {
    clearInterval(recordingTimer);
    recordingTimer = null;
  }
  useTutorMetricsStore.setState({ isRecording: false });
}

/** Exporta la grabación de grafos y las métricas de la sesión como JSON. */
export function exportSessionReport(): void {
  const state = useTutorMetricsStore.getState();
  const report = {
    format: 'solomon-house/tutor-session-report',
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    session: {
      startedAt: new Date(state.sessionStart).toISOString(),
      durationSeconds: Math.round((Date.now() - state.sessionStart) / 1000),
      objectsPlaced: state.placedCount,
      objectsRemoved: state.removedCount,
    },
    bands: BANDS.map((band) => band.name),
    densityHistory: state.densityHistory,
    graphRecording: {
      sampleIntervalMs: RECORDING_SAMPLE_MS,
      startedAt: state.recordingStart ? new Date(state.recordingStart).toISOString() : null,
      snapshots: state.recording,
    },
  };

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `tutor-session-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
