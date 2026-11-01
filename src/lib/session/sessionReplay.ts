import { create } from 'zustand';
import {
  useWorldStore,
  type SoundObject,
  type SoundObjectType,
  type EffectZone,
  type MobileObject,
} from '../../state/useWorldStore';
import { applyTopologicalScore } from '../score/scoreInterpreter';
import { type TopologicalScore } from '../score/topologicalScore';
import {
  type CasaSessionV2,
  type SessionEvent,
  type ResearcherMarker,
  useSessionRecorderStore,
} from './sessionRecorder';

/**
 * Reproductor temporal de sesiones (.casa.json v2) — Roadmap Funcional Jurado E1.2.
 *
 * Cubre:
 *  - E1.2.1: Reproducir una sesión grabada en el tiempo con play, pausa,
 *            velocidad (0.5x, 1x, 2x, 4x) y barra de desplazamiento (seek).
 *  - E1.2.2: Navegar en 3D libremente mientras se reproduce la sesión
 *            (la cámara de la escena permanece desbloqueada e interactiva).
 *  - E1.2.3: Marcadores y anotaciones del investigador sobre la línea de
 *            tiempo, exportables en JSON y CSV.
 */

export type ReplaySpeed = 0.5 | 1 | 2 | 4;

export interface SessionReplayState {
  loadedSession: CasaSessionV2 | null;
  isPlaying: boolean;
  currentTimeMs: number;
  durationMs: number;
  speed: ReplaySpeed;
  appliedEventCount: number;
}

export const useSessionReplayStore = create<SessionReplayState>(() => ({
  loadedSession: null,
  isPlaying: false,
  currentTimeMs: 0,
  durationMs: 0,
  speed: 1,
  appliedEventCount: 0,
}));

let replayTimer: ReturnType<typeof setInterval> | null = null;
let lastTickWallMs = 0;

function isCasaSessionV2(value: unknown): value is CasaSessionV2 {
  const s = value as CasaSessionV2;
  return (
    typeof s === 'object' &&
    s !== null &&
    s.format === 'solomon-house/session-v2' &&
    typeof s.initialSnapshot === 'object' &&
    Array.isArray(s.events)
  );
}

function isTopologicalScoreV1(value: unknown): value is TopologicalScore {
  const s = value as TopologicalScore;
  return (
    typeof s === 'object' &&
    s !== null &&
    s.format === 'solomon-house/topological-score' &&
    Array.isArray(s.grids)
  );
}

/** Aplica un evento individual al estado actual del mundo 3D. */
function applySingleEventToWorld(ev: SessionEvent): void {
  const worldState = useWorldStore.getState();
  const activeGridId = worldState.activeGridId ?? worldState.grids.keys().next().value;
  if (!activeGridId) return;

  const grid = worldState.grids.get(activeGridId);
  if (!grid) return;

  if (ev.entityType === 'soundObject') {
    if (ev.type === 'create') {
      const exists = grid.objects.some((o) => o.id === ev.entityId);
      if (!exists) {
        const freq = Number(ev.params?.frequency ?? 440);
        const waveform = (ev.params?.waveform as 'sine' | 'square' | 'triangle' | 'sawtooth') ?? 'sine';
        const volume = Number(ev.params?.volume ?? 0.5);
        const audioEnabled = Boolean(ev.params?.audioEnabled ?? true);
        const newObj: SoundObject = {
          id: ev.entityId,
          type: (ev.objectType as SoundObjectType) || 'sphere',
          position: ev.position ?? [0, 1, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          isSelected: false,
          audioEnabled,
          audioParams: {
            frequency: freq,
            waveform,
            volume,
          },
        };
        const nextGrids = new Map(worldState.grids);
        nextGrids.set(activeGridId, {
          ...grid,
          objects: [...grid.objects, newObj],
        });
        useWorldStore.setState({ grids: nextGrids });
      }
    } else if (ev.type === 'move' && ev.position) {
      worldState.updateObject(ev.entityId, {
        position: ev.position,
      });
    } else if (ev.type === 'param_change' && ev.params) {
      const existing = grid.objects.find((o) => o.id === ev.entityId);
      if (existing) {
        worldState.updateObject(ev.entityId, {
          audioEnabled:
            typeof ev.params.audioEnabled === 'boolean'
              ? ev.params.audioEnabled
              : existing.audioEnabled,
          audioParams: {
            ...existing.audioParams,
            ...(typeof ev.params.frequency === 'number' ? { frequency: ev.params.frequency } : {}),
            ...(typeof ev.params.waveform === 'string'
              ? { waveform: ev.params.waveform as SoundObject['audioParams']['waveform'] }
              : {}),
            ...(typeof ev.params.volume === 'number' ? { volume: ev.params.volume } : {}),
          },
        });
      }
    } else if (ev.type === 'remove') {
      worldState.removeObject(ev.entityId);
    }
  } else if (ev.entityType === 'effectZone') {
    if (ev.type === 'create') {
      const exists = grid.effectZones.some((z) => z.id === ev.entityId);
      if (!exists) {
        const newZone: EffectZone = {
          id: ev.entityId,
          type: (ev.zoneType as EffectZone['type']) || 'reverb',
          shape: 'sphere',
          position: ev.position ?? [0, 1, 0],
          rotation: [0, 0, 0],
          scale: [2, 2, 2],
          isSelected: false,
          isLocked: false,
          effectParams: { radius: 3, wet: 0.5 },
        };
        const nextGrids = new Map(worldState.grids);
        nextGrids.set(activeGridId, {
          ...grid,
          effectZones: [...grid.effectZones, newZone],
        });
        useWorldStore.setState({ grids: nextGrids });
      }
    } else if (ev.type === 'remove') {
      const nextGrids = new Map(worldState.grids);
      nextGrids.set(activeGridId, {
        ...grid,
        effectZones: grid.effectZones.filter((z) => z.id !== ev.entityId),
      });
      useWorldStore.setState({ grids: nextGrids });
    }
  } else if (ev.entityType === 'mobileObject') {
    if (ev.type === 'create') {
      const exists = grid.mobileObjects.some((m) => m.id === ev.entityId);
      if (!exists) {
        const pos = ev.position ?? [0, 1, 0];
        const newMob: MobileObject = {
          id: ev.entityId,
          type: 'mobile',
          position: pos,
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          isSelected: false,
          mobileParams: {
            movementType:
              (ev.params?.movementType as MobileObject['mobileParams']['movementType']) ||
              'circular',
            radius: Number(ev.params?.radius ?? 2),
            speed: Number(ev.params?.speed ?? 1),
            proximityThreshold: 2,
            isActive: true,
            centerPosition: pos,
            direction: [1, 0, 0],
            axis: [0, 1, 0],
            amplitude: 1,
            frequency: 1,
            randomSeed: 42,
            height: pos[1],
            heightSpeed: 0.5,
          },
        };
        const nextGrids = new Map(worldState.grids);
        nextGrids.set(activeGridId, {
          ...grid,
          mobileObjects: [...grid.mobileObjects, newMob],
        });
        useWorldStore.setState({ grids: nextGrids });
      }
    } else if (ev.type === 'remove') {
      const nextGrids = new Map(worldState.grids);
      nextGrids.set(activeGridId, {
        ...grid,
        mobileObjects: grid.mobileObjects.filter((m) => m.id !== ev.entityId),
      });
      useWorldStore.setState({ grids: nextGrids });
    }
  }
}

/**
 * Carga una sesión .casa.json v2 (o convierte una partitura v1) en el
 * reproductor temporal y reconstruye su instantánea inicial (E1.2.1).
 */
export function loadSessionForReplay(session: CasaSessionV2): void {
  pauseSessionReplay();

  const lastEvT = session.events.length > 0 ? session.events[session.events.length - 1].t : 0;
  const durationMs = Math.max(session.metadata?.durationMs || 0, lastEvT, 1000);

  applyTopologicalScore(session.initialSnapshot);

  // Sincronizar marcadores con el almacén de investigación
  useSessionRecorderStore.setState({
    markers: session.markers ?? [],
  });

  useSessionReplayStore.setState({
    loadedSession: session,
    isPlaying: false,
    currentTimeMs: 0,
    durationMs,
    appliedEventCount: 0,
  });
}

/** Importa un archivo .casa.json o .json desde el navegador para reproducirlo. */
export async function importSessionFromFileForReplay(file: File): Promise<CasaSessionV2> {
  const text = await file.text();
  const parsed: unknown = JSON.parse(text);

  if (isCasaSessionV2(parsed)) {
    loadSessionForReplay(parsed);
    return parsed;
  }

  if (isTopologicalScoreV1(parsed)) {
    const converted: CasaSessionV2 = {
      format: 'solomon-house/session-v2',
      version: '2.0.0',
      exportedAt: parsed.exportedAt,
      metadata: {
        title: parsed.metadata?.title || 'Partitura Topológica v1',
        roomId: 'sala-importada',
        level: 'N4',
        durationMs: 60_000,
        startedAt: parsed.exportedAt,
        consentGrantedAt: parsed.exportedAt,
        anonymized: true,
        participants: [
          {
            anonymousId: 'P-v10000',
            role: 'user',
            layer: 'texture',
            regionCode: 'INTL',
            joinedAtMs: 0,
          },
        ],
      },
      initialSnapshot: parsed,
      events: [],
      markers: [],
    };
    loadSessionForReplay(converted);
    return converted;
  }

  throw new Error(
    'El archivo no es una sesión .casa.json v2 ni una partitura topológica válida.'
  );
}

/**
 * Desplaza la reproducción a un instante exacto (ms), reconstruyendo el
 * estado desde la instantánea inicial y aplicando los eventos hasta targetMs.
 */
export function seekSessionReplay(targetMs: number): void {
  const state = useSessionReplayStore.getState();
  if (!state.loadedSession) return;

  const clamped = Math.max(0, Math.min(state.durationMs, targetMs));
  applyTopologicalScore(state.loadedSession.initialSnapshot);

  const events = state.loadedSession.events;
  let count = 0;
  for (let i = 0; i < events.length; i++) {
    if (events[i].t <= clamped) {
      applySingleEventToWorld(events[i]);
      count = i + 1;
    } else {
      break;
    }
  }

  useSessionReplayStore.setState({
    currentTimeMs: clamped,
    appliedEventCount: count,
  });
}

export function playSessionReplay(): void {
  const state = useSessionReplayStore.getState();
  if (!state.loadedSession) return;
  if (state.isPlaying) return;

  if (state.currentTimeMs >= state.durationMs) {
    seekSessionReplay(0);
  }

  lastTickWallMs = performance.now();
  useSessionReplayStore.setState({ isPlaying: true });

  replayTimer = setInterval(() => {
    const now = performance.now();
    const dt = now - lastTickWallMs;
    lastTickWallMs = now;

    const cur = useSessionReplayStore.getState();
    if (!cur.isPlaying || !cur.loadedSession) return;

    const nextTime = Math.min(cur.durationMs, cur.currentTimeMs + dt * cur.speed);
    const events = cur.loadedSession.events;
    let applied = cur.appliedEventCount;

    while (applied < events.length && events[applied].t <= nextTime) {
      applySingleEventToWorld(events[applied]);
      applied++;
    }

    if (nextTime >= cur.durationMs) {
      pauseSessionReplay();
      useSessionReplayStore.setState({
        currentTimeMs: cur.durationMs,
        appliedEventCount: applied,
      });
    } else {
      useSessionReplayStore.setState({
        currentTimeMs: nextTime,
        appliedEventCount: applied,
      });
    }
  }, 80);
}

export function pauseSessionReplay(): void {
  if (replayTimer) {
    clearInterval(replayTimer);
    replayTimer = null;
  }
  useSessionReplayStore.setState({ isPlaying: false });
}

export function setReplaySpeed(speed: ReplaySpeed): void {
  useSessionReplayStore.setState({ speed });
}

/** Exporta los marcadores y anotaciones del investigador en JSON o CSV (E1.2.3). */
export function exportResearcherMarkers(format: 'json' | 'csv'): void {
  const markers: ResearcherMarker[] = useSessionRecorderStore.getState().markers;
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');

  if (format === 'json') {
    const blob = new Blob([JSON.stringify(markers, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marcadores-investigacion-${timestamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  const header = 'id,t_ms,t_segundos,categoria,etiqueta,notas,creado_en\n';
  const rows = markers
    .map((m) => {
      const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
      return [
        esc(m.id),
        m.t,
        (m.t / 1000).toFixed(2),
        esc(m.category),
        esc(m.label),
        esc(m.notes),
        esc(m.createdAt),
      ].join(',');
    })
    .join('\n');

  const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `marcadores-investigacion-${timestamp}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
