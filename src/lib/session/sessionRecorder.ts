import { create } from 'zustand';
import * as Tone from 'tone';
import {
  useWorldStore,
  type SoundObject,
  type EffectZone,
  type MobileObject,
} from '../../state/useWorldStore';
import {
  buildTopologicalScore,
  type TopologicalScore,
} from '../score/topologicalScore';
import { getCurrentLevel, type LevelId } from '../pedagogy/parametricLevels';
import { nativeAudioGraph } from '../audio/native/NativeAudioGraph';

/**
 * Grabador de sesión y formato .casa.json v2 (Roadmap Funcional Jurado E1.1).
 *
 * Cubre:
 *  - E1.1.1: Registro de eventos con marca de tiempo (crear, mover, borrar,
 *            cambiar parámetro, entrar y salir de zona, disparo), incluyendo
 *            autor ('user' | 'agent' | 'tutor') y capa compositiva.
 *  - E1.1.2: Grabación del audio maestro (MediaRecorder sobre el bus de salida)
 *            y descarga en OGG/WebM y WAV PCM de 16 bits.
 *  - E1.1.3: Grabación binaural opcional desde la posición [x, y, z] de una
 *            persona oyente concreta.
 *  - E1.1.4: Formato de sesión .casa.json v2 con instantánea inicial, línea de
 *            tiempo de eventos, marcadores y JSON Schema documentado.
 *  - E1.1.5: Consentimiento explícito informado antes de grabar y
 *            anonimización determinista de participantes.
 */

export const CASA_SESSION_V2_VERSION = '2.0.0';

export type SessionAuthorRole = 'user' | 'agent' | 'tutor';
export type CompositionalLayer = 'texture' | 'gesture' | 'spatial' | 'general';

export type SessionEventType =
  | 'create'
  | 'move'
  | 'remove'
  | 'param_change'
  | 'zone_enter'
  | 'zone_exit'
  | 'trigger'
  | 'phase_change'
  | 'marker';

export interface SessionEventAuthor {
  id: string; // ID anonimizado, ej. "P-4f9a" o "AGENTE-JARDINERO"
  role: SessionAuthorRole;
}

export interface SessionEvent {
  id: string;
  /** Tiempo relativo desde el inicio de la grabación (ms). */
  t: number;
  /** Marca temporal ISO 8601. */
  timestamp: string;
  type: SessionEventType;
  entityType: 'soundObject' | 'effectZone' | 'mobileObject' | 'session';
  entityId: string;
  author: SessionEventAuthor;
  layer: CompositionalLayer;
  position?: [number, number, number];
  previousPosition?: [number, number, number];
  objectType?: string;
  zoneId?: string;
  zoneType?: string;
  params?: Record<string, unknown>;
  notes?: string;
}

export interface ResearcherMarker {
  id: string;
  t: number;
  label: string;
  category: 'structural' | 'timbral' | 'interaction' | 'pedagogical' | 'observation';
  notes: string;
  createdAt: string;
}

export interface AnonymousParticipant {
  anonymousId: string;
  role: SessionAuthorRole;
  layer: CompositionalLayer;
  regionCode: string;
  joinedAtMs: number;
}

export interface CasaSessionV2 {
  format: 'solomon-house/session-v2';
  version: string;
  exportedAt: string;
  metadata: {
    title: string;
    roomId: string;
    level: LevelId;
    durationMs: number;
    startedAt: string;
    consentGrantedAt: string;
    anonymized: true;
    binauralListenerPosition?: [number, number, number] | null;
    mappingPreset?: string;
    participants: AnonymousParticipant[];
  };
  initialSnapshot: TopologicalScore;
  events: SessionEvent[];
  markers: ResearcherMarker[];
}

/**
 * JSON Schema (draft 2020-12) para validar archivos .casa.json v2 (E1.1.4).
 */
export const CASA_SESSION_V2_JSON_SCHEMA = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'https://solomon-house.org/schemas/session-v2.0.0.json',
  title: 'Sesión Temporal .casa.json v2 — La Casa de Salomón',
  type: 'object',
  required: ['format', 'version', 'exportedAt', 'metadata', 'initialSnapshot', 'events', 'markers'],
  properties: {
    format: { const: 'solomon-house/session-v2' },
    version: { type: 'string' },
    exportedAt: { type: 'string', format: 'date-time' },
    metadata: {
      type: 'object',
      required: ['title', 'roomId', 'level', 'durationMs', 'startedAt', 'consentGrantedAt', 'anonymized', 'participants'],
      properties: {
        title: { type: 'string' },
        roomId: { type: 'string' },
        level: { enum: ['N1', 'N2', 'N3', 'N4'] },
        durationMs: { type: 'number', minimum: 0 },
        startedAt: { type: 'string', format: 'date-time' },
        consentGrantedAt: { type: 'string', format: 'date-time' },
        anonymized: { const: true },
        binauralListenerPosition: {
          type: ['array', 'null'],
          items: { type: 'number' },
          minItems: 3,
          maxItems: 3,
        },
        mappingPreset: { type: 'string' },
        participants: {
          type: 'array',
          items: {
            type: 'object',
            required: ['anonymousId', 'role', 'layer', 'regionCode', 'joinedAtMs'],
            properties: {
              anonymousId: { type: 'string' },
              role: { enum: ['user', 'agent', 'tutor'] },
              layer: { enum: ['texture', 'gesture', 'spatial', 'general'] },
              regionCode: { type: 'string' },
              joinedAtMs: { type: 'number' },
            },
          },
        },
      },
    },
    initialSnapshot: { type: 'object' },
    events: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 't', 'timestamp', 'type', 'entityType', 'entityId', 'author', 'layer'],
        properties: {
          id: { type: 'string' },
          t: { type: 'number' },
          timestamp: { type: 'string' },
          type: {
            enum: [
              'create',
              'move',
              'remove',
              'param_change',
              'zone_enter',
              'zone_exit',
              'trigger',
              'phase_change',
              'marker',
            ],
          },
          entityType: { enum: ['soundObject', 'effectZone', 'mobileObject', 'session'] },
          entityId: { type: 'string' },
          author: {
            type: 'object',
            required: ['id', 'role'],
            properties: {
              id: { type: 'string' },
              role: { enum: ['user', 'agent', 'tutor'] },
            },
          },
          layer: { enum: ['texture', 'gesture', 'spatial', 'general'] },
          position: { type: 'array', items: { type: 'number' } },
          previousPosition: { type: 'array', items: { type: 'number' } },
          objectType: { type: 'string' },
          zoneId: { type: 'string' },
          zoneType: { type: 'string' },
          params: { type: 'object' },
          notes: { type: 'string' },
        },
      },
    },
    markers: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 't', 'label', 'category', 'notes', 'createdAt'],
      },
    },
  },
} as const;

/**
 * Anonimiza un identificador de participante con un hash FNV-1a de 32 bits
 * para que ningún dato personal quede en el archivo .casa.json (E1.1.5).
 */
export function anonymizeParticipantId(rawId: string, role: SessionAuthorRole = 'user'): string {
  if (role === 'agent') return 'AGENTE-JARDINERO';
  let hash = 0x811c9dc5;
  for (let i = 0; i < rawId.length; i++) {
    hash ^= rawId.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  const hex = (hash >>> 0).toString(16).padStart(8, '0').slice(0, 6);
  const prefix = role === 'tutor' ? 'TUTOR' : 'P';
  return `${prefix}-${hex}`;
}

/**
 * Infiere un código de región aproximado a partir del huso horario del navegador,
 * sin consultar IPs ni almacenar datos personales (E1.4.2).
 */
export function inferAnonymousRegionCode(): string {
  if (typeof Intl === 'undefined') return 'INTL';
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.startsWith('America/Mexico') || tz.includes('Monterrey') || tz.includes('Tijuana')) return 'MX';
    if (tz.includes('Bogota')) return 'CO';
    if (tz.includes('Buenos_Aires') || tz.includes('Argentina')) return 'AR';
    if (tz.includes('Santiago')) return 'CL';
    if (tz.includes('Lima')) return 'PE';
    if (tz.includes('Sao_Paulo')) return 'BR';
    if (tz.includes('Moscow') || tz.includes('Yekaterinburg') || tz.includes('Novosibirsk')) return 'RU';
    if (tz.includes('Shanghai') || tz.includes('Beijing') || tz.includes('Chongqing') || tz.includes('Hong_Kong')) return 'CN';
    if (tz.includes('Tokyo')) return 'JP';
    if (tz.includes('Berlin') || tz.includes('Madrid') || tz.includes('Paris') || tz.includes('London')) return 'EU';
    if (tz.startsWith('America/')) return 'AMER';
    if (tz.startsWith('Europe/')) return 'EU';
    if (tz.startsWith('Asia/')) return 'ASIA';
    return 'INTL';
  } catch {
    return 'INTL';
  }
}

/** Infiere la capa compositiva según el tipo de entidad o síntesis. */
export function inferCompositionalLayer(
  entityType: 'soundObject' | 'effectZone' | 'mobileObject' | 'session',
  objectType?: string
): CompositionalLayer {
  if (entityType === 'mobileObject' || entityType === 'effectZone') return 'spatial';
  if (entityType === 'session') return 'general';
  if (objectType === 'cone' || objectType === 'icosahedron' || objectType === 'torus') {
    return 'gesture';
  }
  return 'texture';
}

export interface SessionRecorderState {
  consentGranted: boolean;
  consentGrantedAt: string | null;
  isRecording: boolean;
  isAudioRecording: boolean;
  binauralEnabled: boolean;
  binauralListenerPosition: [number, number, number];
  sessionTitle: string;
  roomId: string;
  startedAtMs: number | null;
  startedAtIso: string | null;
  initialSnapshot: TopologicalScore | null;
  events: SessionEvent[];
  markers: ResearcherMarker[];
  participants: AnonymousParticipant[];
  localAuthorRole: SessionAuthorRole;
  localLayer: CompositionalLayer;
  lastAudioBlob: Blob | null;
  lastAudioMimeType: string;
}

const LOCAL_SESSION_SEED =
  typeof window !== 'undefined'
    ? `local-${Math.random().toString(36).slice(2, 9)}`
    : 'local-default';

export const useSessionRecorderStore = create<SessionRecorderState>(() => ({
  consentGranted: false,
  consentGrantedAt: null,
  isRecording: false,
  isAudioRecording: false,
  binauralEnabled: false,
  binauralListenerPosition: [0, 1.6, 4],
  sessionTitle: 'Sesión de Estudio — La Casa de Salomón',
  roomId: 'sala-principal',
  startedAtMs: null,
  startedAtIso: null,
  initialSnapshot: null,
  events: [],
  markers: [],
  participants: [
    {
      anonymousId: anonymizeParticipantId(LOCAL_SESSION_SEED, 'user'),
      role: 'user',
      layer: 'texture',
      regionCode: inferAnonymousRegionCode(),
      joinedAtMs: 0,
    },
  ],
  localAuthorRole: 'user',
  localLayer: 'texture',
  lastAudioBlob: null,
  lastAudioMimeType: 'audio/webm',
}));

/** Contexto temporal para atribuir acciones automáticas del agente o tutor. */
let activeActionAuthorOverride: { role: SessionAuthorRole; id?: string; layer?: CompositionalLayer } | null =
  null;

export function withSessionAuthor<T>(
  role: SessionAuthorRole,
  fn: () => T,
  customId?: string,
  layer?: CompositionalLayer
): T {
  const prev = activeActionAuthorOverride;
  activeActionAuthorOverride = { role, id: customId, layer };
  try {
    return fn();
  } finally {
    activeActionAuthorOverride = prev;
  }
}

export function setConsentGranted(granted: boolean): void {
  useSessionRecorderStore.setState({
    consentGranted: granted,
    consentGrantedAt: granted ? new Date().toISOString() : null,
  });
}

export function setBinauralConfig(
  enabled: boolean,
  position?: [number, number, number]
): void {
  useSessionRecorderStore.setState((state) => ({
    binauralEnabled: enabled,
    binauralListenerPosition: position ?? state.binauralListenerPosition,
  }));
}

export function setSessionMetadataConfig(config: {
  sessionTitle?: string;
  roomId?: string;
  localAuthorRole?: SessionAuthorRole;
  localLayer?: CompositionalLayer;
}): void {
  useSessionRecorderStore.setState((state) => ({
    sessionTitle: config.sessionTitle ?? state.sessionTitle,
    roomId: config.roomId ?? state.roomId,
    localAuthorRole: config.localAuthorRole ?? state.localAuthorRole,
    localLayer: config.localLayer ?? state.localLayer,
  }));
}

/** Registra un evento explícito en la sesión activa (E1.1.1). */
export function recordSessionEvent(
  partial: Omit<SessionEvent, 'id' | 't' | 'timestamp' | 'author' | 'layer'> & {
    author?: SessionEventAuthor;
    layer?: CompositionalLayer;
  }
): void {
  const state = useSessionRecorderStore.getState();
  if (!state.isRecording || !state.startedAtMs) return;

  const role =
    partial.author?.role ??
    activeActionAuthorOverride?.role ??
    state.localAuthorRole;

  const authorId =
    partial.author?.id ??
    activeActionAuthorOverride?.id ??
    anonymizeParticipantId(LOCAL_SESSION_SEED, role);

  const layer =
    partial.layer ??
    activeActionAuthorOverride?.layer ??
    (role === 'user' ? state.localLayer : inferCompositionalLayer(partial.entityType, partial.objectType));

  const now = Date.now();
  const event: SessionEvent = {
    id: `ev-${now}-${Math.random().toString(36).slice(2, 7)}`,
    t: Math.max(0, now - state.startedAtMs),
    timestamp: new Date(now).toISOString(),
    type: partial.type,
    entityType: partial.entityType,
    entityId: partial.entityId,
    author: { id: authorId, role },
    layer,
    ...(partial.position ? { position: partial.position } : {}),
    ...(partial.previousPosition ? { previousPosition: partial.previousPosition } : {}),
    ...(partial.objectType ? { objectType: partial.objectType } : {}),
    ...(partial.zoneId ? { zoneId: partial.zoneId } : {}),
    ...(partial.zoneType ? { zoneType: partial.zoneType } : {}),
    ...(partial.params ? { params: partial.params } : {}),
    ...(partial.notes ? { notes: partial.notes } : {}),
  };

  useSessionRecorderStore.setState((prev) => {
    const hasParticipant = prev.participants.some((p) => p.anonymousId === authorId);
    const participants = hasParticipant
      ? prev.participants
      : [
          ...prev.participants,
          {
            anonymousId: authorId,
            role,
            layer,
            regionCode: inferAnonymousRegionCode(),
            joinedAtMs: event.t,
          },
        ];
    return {
      events: [...prev.events, event],
      participants,
    };
  });
}

/** Añade un marcador o anotación del investigador en la línea de tiempo (E1.2.3). */
export function addResearcherMarker(
  label: string,
  category: ResearcherMarker['category'] = 'observation',
  notes: string = '',
  customTimeMs?: number
): ResearcherMarker {
  const state = useSessionRecorderStore.getState();
  const t =
    typeof customTimeMs === 'number'
      ? Math.max(0, Math.round(customTimeMs))
      : state.startedAtMs
        ? Math.max(0, Date.now() - state.startedAtMs)
        : 0;

  const marker: ResearcherMarker = {
    id: `mk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    t,
    label: label.trim() || 'Marcador de observación',
    category,
    notes: notes.trim(),
    createdAt: new Date().toISOString(),
  };

  useSessionRecorderStore.setState((prev) => ({
    markers: [...prev.markers, marker].sort((a, b) => a.t - b.t),
  }));

  if (state.isRecording) {
    recordSessionEvent({
      type: 'marker',
      entityType: 'session',
      entityId: marker.id,
      notes: `${marker.label}: ${marker.notes}`,
    });
  }

  return marker;
}

export function removeResearcherMarker(markerId: string): void {
  useSessionRecorderStore.setState((prev) => ({
    markers: prev.markers.filter((m) => m.id !== markerId),
  }));
}

// ============================================================================
// Observador automático del mundo 3D para capturar eventos (E1.1.1)
// ============================================================================

interface TrackedObjectState {
  type: string;
  position: [number, number, number];
  frequency: number;
  waveform: string;
  volume: number;
  audioEnabled: boolean;
  insideZones: Set<string>;
}

let worldUnsubscribe: (() => void) | null = null;
const trackedObjects = new Map<string, TrackedObjectState>();
const trackedZones = new Map<string, { type: string; position: [number, number, number]; radius: number }>();
const trackedMobiles = new Map<string, [number, number, number]>();

function distance3D(a: [number, number, number], b: [number, number, number]): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

function getZoneRadius(zone: EffectZone): number {
  if (typeof zone.effectParams?.radius === 'number') return zone.effectParams.radius;
  return Math.max(zone.scale[0], zone.scale[1], zone.scale[2]) * 1.5;
}

function snapshotCurrentWorldForDiff(): void {
  trackedObjects.clear();
  trackedZones.clear();
  trackedMobiles.clear();

  const { grids } = useWorldStore.getState();
  grids.forEach((grid) => {
    (grid.effectZones ?? []).forEach((zone) => {
      trackedZones.set(zone.id, {
        type: zone.type,
        position: [...zone.position] as [number, number, number],
        radius: getZoneRadius(zone),
      });
    });
  });

  grids.forEach((grid) => {
    (grid.objects ?? []).forEach((obj) => {
      const insideZones = new Set<string>();
      trackedZones.forEach((z, zoneId) => {
        if (distance3D(obj.position, z.position) <= z.radius) {
          insideZones.add(zoneId);
        }
      });
      trackedObjects.set(obj.id, {
        type: obj.type,
        position: [...obj.position] as [number, number, number],
        frequency: Number(obj.audioParams?.frequency ?? 440),
        waveform: String(obj.audioParams?.waveform ?? 'sine'),
        volume: Number(obj.audioParams?.volume ?? 0.5),
        audioEnabled: Boolean(obj.audioEnabled),
        insideZones,
      });
    });

    (grid.mobileObjects ?? []).forEach((mob) => {
      trackedMobiles.set(mob.id, [...mob.position] as [number, number, number]);
    });
  });
}

function attachWorldEventObserver(): void {
  if (worldUnsubscribe) return;
  snapshotCurrentWorldForDiff();

  worldUnsubscribe = useWorldStore.subscribe((state) => {
    if (!useSessionRecorderStore.getState().isRecording) return;

    const currentObjects = new Map<string, SoundObject>();
    const currentZones = new Map<string, EffectZone>();
    const currentMobiles = new Map<string, MobileObject>();

    state.grids.forEach((grid) => {
      (grid.objects ?? []).forEach((obj) => {
        if (obj?.id) currentObjects.set(obj.id, obj);
      });
      (grid.effectZones ?? []).forEach((zone) => {
        if (zone?.id) currentZones.set(zone.id, zone);
      });
      (grid.mobileObjects ?? []).forEach((mob) => {
        if (mob?.id) currentMobiles.set(mob.id, mob);
      });
    });

    // 1. Zonas de efecto creadas o eliminadas
    currentZones.forEach((zone, zoneId) => {
      if (!trackedZones.has(zoneId)) {
        const radius = getZoneRadius(zone);
        trackedZones.set(zoneId, {
          type: zone.type,
          position: [...zone.position] as [number, number, number],
          radius,
        });
        recordSessionEvent({
          type: 'create',
          entityType: 'effectZone',
          entityId: zoneId,
          zoneType: zone.type,
          position: [...zone.position] as [number, number, number],
          layer: 'spatial',
        });
      }
    });

    trackedZones.forEach((prevZone, zoneId) => {
      if (!currentZones.has(zoneId)) {
        trackedZones.delete(zoneId);
        recordSessionEvent({
          type: 'remove',
          entityType: 'effectZone',
          entityId: zoneId,
          zoneType: prevZone.type,
          previousPosition: prevZone.position,
          layer: 'spatial',
        });
      }
    });

    // 2. Objetos sonoros: crear, mover, cambiar parámetro, entrar/salir de zona, borrar
    currentObjects.forEach((obj, objId) => {
      const prev = trackedObjects.get(objId);
      const pos: [number, number, number] = [obj.position[0], obj.position[1], obj.position[2]];
      const freq = Number(obj.audioParams?.frequency ?? 440);
      const waveform = String(obj.audioParams?.waveform ?? 'sine');
      const volume = Number(obj.audioParams?.volume ?? 0.5);

      const nowInside = new Set<string>();
      trackedZones.forEach((z, zId) => {
        if (distance3D(pos, z.position) <= z.radius) {
          nowInside.add(zId);
        }
      });

      if (!prev) {
        trackedObjects.set(objId, {
          type: obj.type,
          position: pos,
          frequency: freq,
          waveform,
          volume,
          audioEnabled: Boolean(obj.audioEnabled),
          insideZones: nowInside,
        });
        recordSessionEvent({
          type: 'create',
          entityType: 'soundObject',
          entityId: objId,
          objectType: obj.type,
          position: pos,
          params: {
            frequency: freq,
            waveform,
            volume,
            audioEnabled: Boolean(obj.audioEnabled),
          },
        });
        nowInside.forEach((zId) => {
          const z = trackedZones.get(zId);
          recordSessionEvent({
            type: 'zone_enter',
            entityType: 'soundObject',
            entityId: objId,
            objectType: obj.type,
            zoneId: zId,
            zoneType: z?.type,
            position: pos,
            layer: 'spatial',
          });
        });
        return;
      }

      // Movimiento significativo (> 0.08 unidades)
      if (distance3D(pos, prev.position) > 0.08) {
        recordSessionEvent({
          type: 'move',
          entityType: 'soundObject',
          entityId: objId,
          objectType: obj.type,
          previousPosition: prev.position,
          position: pos,
        });
        prev.position = pos;
      }

      // Cambio de parámetros de síntesis
      if (
        Math.abs(freq - prev.frequency) > 0.5 ||
        waveform !== prev.waveform ||
        Math.abs(volume - prev.volume) > 0.02 ||
        Boolean(obj.audioEnabled) !== prev.audioEnabled
      ) {
        recordSessionEvent({
          type: 'param_change',
          entityType: 'soundObject',
          entityId: objId,
          objectType: obj.type,
          position: pos,
          params: {
            frequency: freq,
            waveform,
            volume,
            audioEnabled: Boolean(obj.audioEnabled),
          },
        });
        prev.frequency = freq;
        prev.waveform = waveform;
        prev.volume = volume;
        prev.audioEnabled = Boolean(obj.audioEnabled);
      }

      // Entrada y salida de zonas de efecto
      nowInside.forEach((zId) => {
        if (!prev.insideZones.has(zId)) {
          const z = trackedZones.get(zId);
          recordSessionEvent({
            type: 'zone_enter',
            entityType: 'soundObject',
            entityId: objId,
            objectType: obj.type,
            zoneId: zId,
            zoneType: z?.type,
            position: pos,
            layer: 'spatial',
          });
        }
      });
      prev.insideZones.forEach((zId) => {
        if (!nowInside.has(zId)) {
          const z = trackedZones.get(zId);
          recordSessionEvent({
            type: 'zone_exit',
            entityType: 'soundObject',
            entityId: objId,
            objectType: obj.type,
            zoneId: zId,
            zoneType: z?.type,
            position: pos,
            layer: 'spatial',
          });
        }
      });
      prev.insideZones = nowInside;
    });

    trackedObjects.forEach((prev, objId) => {
      if (!currentObjects.has(objId)) {
        trackedObjects.delete(objId);
        recordSessionEvent({
          type: 'remove',
          entityType: 'soundObject',
          entityId: objId,
          objectType: prev.type,
          previousPosition: prev.position,
        });
      }
    });

    // 3. Objetos móviles
    currentMobiles.forEach((mob, mobId) => {
      if (!trackedMobiles.has(mobId)) {
        const pos: [number, number, number] = [mob.position[0], mob.position[1], mob.position[2]];
        trackedMobiles.set(mobId, pos);
        recordSessionEvent({
          type: 'create',
          entityType: 'mobileObject',
          entityId: mobId,
          position: pos,
          layer: 'spatial',
          params: {
            movementType: mob.mobileParams?.movementType,
            speed: mob.mobileParams?.speed,
            radius: mob.mobileParams?.radius,
          },
        });
      }
    });

    trackedMobiles.forEach((prevPos, mobId) => {
      if (!currentMobiles.has(mobId)) {
        trackedMobiles.delete(mobId);
        recordSessionEvent({
          type: 'remove',
          entityType: 'mobileObject',
          entityId: mobId,
          previousPosition: prevPos,
          layer: 'spatial',
        });
      }
    });
  });
}

// ============================================================================
// Grabador de audio maestro y binaural (E1.1.2 y E1.1.3)
// ============================================================================

let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: BlobPart[] = [];
let streamDest: MediaStreamAudioDestinationNode | null = null;
let binauralPanner: PannerNode | null = null;

function selectSupportedMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return 'audio/webm';
  const candidates = [
    'audio/ogg;codecs=opus',
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
  ];
  for (const mime of candidates) {
    if (MediaRecorder.isTypeSupported(mime)) return mime;
  }
  return '';
}

export async function startMasterAudioRecording(): Promise<boolean> {
  if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') {
    return false;
  }

  try {
    await Tone.start();
    const rawContext = nativeAudioGraph.getContext();
    if (rawContext.state !== 'running') {
      await rawContext.resume();
    }

    streamDest = rawContext.createMediaStreamDestination();
    const state = useSessionRecorderStore.getState();

    const masterGain = nativeAudioGraph.getMasterGain();
    const toneDestNode = Tone.getDestination().output.input as unknown as AudioNode;

    if (state.binauralEnabled) {
      // Grabación binaural desde la posición de una persona oyente concreta (E1.1.3)
      binauralPanner = rawContext.createPanner();
      binauralPanner.panningModel = 'HRTF';
      binauralPanner.distanceModel = 'inverse';
      binauralPanner.refDistance = 1;
      binauralPanner.maxDistance = 100;
      binauralPanner.rolloffFactor = 1.2;
      const [lx, ly, lz] = state.binauralListenerPosition;
      // Vector relativo respecto al centro acústico de la sala
      binauralPanner.positionX.value = -lx;
      binauralPanner.positionY.value = -ly;
      binauralPanner.positionZ.value = -lz;

      masterGain.connect(binauralPanner);
      try {
        toneDestNode.connect(binauralPanner);
      } catch {
        // Nodo de otro contexto o ya conectado
      }
      binauralPanner.connect(streamDest);
    } else {
      masterGain.connect(streamDest);
      try {
        toneDestNode.connect(streamDest);
      } catch {
        // Ignorar si Tone no expone AudioNode nativo directo
      }
    }

    recordedChunks = [];
    const mimeType = selectSupportedMimeType();
    mediaRecorder = mimeType
      ? new MediaRecorder(streamDest.stream, { mimeType })
      : new MediaRecorder(streamDest.stream);

    mediaRecorder.ondataavailable = (ev) => {
      if (ev.data && ev.data.size > 0) {
        recordedChunks.push(ev.data);
      }
    };

    mediaRecorder.onstop = () => {
      const finalMime = mediaRecorder?.mimeType || mimeType || 'audio/webm';
      const blob = new Blob(recordedChunks, { type: finalMime });
      useSessionRecorderStore.setState({
        isAudioRecording: false,
        lastAudioBlob: blob,
        lastAudioMimeType: finalMime,
      });
    };

    mediaRecorder.start(500);
    useSessionRecorderStore.setState({ isAudioRecording: true });
    return true;
  } catch (error) {
    console.error('Error iniciando grabación de audio maestro:', error);
    return false;
  }
}

export function stopMasterAudioRecording(): void {
  try {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
  } catch {
    // Ignorar
  }
  try {
    if (binauralPanner) {
      binauralPanner.disconnect();
      binauralPanner = null;
    }
  } catch {
    // Ignorar
  }
  useSessionRecorderStore.setState({ isAudioRecording: false });
}

/**
 * Convierte un AudioBuffer decodificado en un archivo WAV PCM de 16 bits (E1.1.2).
 */
function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = Math.min(2, buffer.numberOfChannels);
  const sampleRate = buffer.sampleRate;
  const numFrames = buffer.length;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = numFrames * blockAlign;
  const arrayBuffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(arrayBuffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM format = 1
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // 16-bit
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  const channels: Float32Array[] = [];
  for (let ch = 0; ch < numChannels; ch++) {
    channels.push(buffer.getChannelData(ch));
  }

  let offset = 44;
  for (let i = 0; i < numFrames; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channels[ch][i] ?? 0));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

/** Descarga la grabación de audio en OGG/WebM nativo o recodificado a WAV PCM 16-bit (E1.1.2). */
export async function downloadRecordedAudio(format: 'ogg' | 'wav'): Promise<void> {
  const { lastAudioBlob } = useSessionRecorderStore.getState();
  if (!lastAudioBlob) {
    throw new Error('No hay ninguna grabación de audio disponible todavía.');
  }

  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');

  if (format === 'ogg') {
    const ext = lastAudioBlob.type.includes('ogg') ? 'ogg' : 'webm';
    const url = URL.createObjectURL(lastAudioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `casa-salomon-audio-${timestamp}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  // Decodificar el contenedor comprimido y exportar WAV PCM 16-bit
  const rawContext = nativeAudioGraph.getContext();
  const arrayBuf = await lastAudioBlob.arrayBuffer();
  const decoded = await rawContext.decodeAudioData(arrayBuf.slice(0));
  const wavBlob = audioBufferToWavBlob(decoded);
  const url = URL.createObjectURL(wavBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `casa-salomon-audio-${timestamp}.wav`;
  a.click();
  URL.revokeObjectURL(url);
}

// ============================================================================
// Control de sesión de grabación y exportación .casa.json v2 (E1.1.4 y E1.1.5)
// ============================================================================

export async function startSessionRecording(options?: {
  recordAudio?: boolean;
}): Promise<boolean> {
  const state = useSessionRecorderStore.getState();
  if (!state.consentGranted) {
    throw new Error(
      'Se requiere el consentimiento explícito antes de iniciar la grabación (E1.1.5).'
    );
  }

  const now = Date.now();
  const initialSnapshot = buildTopologicalScore({
    title: state.sessionTitle,
    author: anonymizeParticipantId(LOCAL_SESSION_SEED, state.localAuthorRole),
    description: `Instantánea inicial de sesión (${state.roomId})`,
  });

  useSessionRecorderStore.setState({
    isRecording: true,
    startedAtMs: now,
    startedAtIso: new Date(now).toISOString(),
    initialSnapshot,
    events: [],
    participants: [
      {
        anonymousId: anonymizeParticipantId(LOCAL_SESSION_SEED, state.localAuthorRole),
        role: state.localAuthorRole,
        layer: state.localLayer,
        regionCode: inferAnonymousRegionCode(),
        joinedAtMs: 0,
      },
    ],
  });

  attachWorldEventObserver();

  if (options?.recordAudio) {
    await startMasterAudioRecording();
  }

  return true;
}

export function stopSessionRecording(): void {
  const state = useSessionRecorderStore.getState();
  if (state.isAudioRecording) {
    stopMasterAudioRecording();
  }
  useSessionRecorderStore.setState({ isRecording: false });
}

/** Construye el objeto CasaSessionV2 listo para exportar o analizar (E1.1.4). */
export function buildCasaSessionV2(mappingPreset: string = 'structural'): CasaSessionV2 {
  const state = useSessionRecorderStore.getState();
  const now = Date.now();
  const startedAtMs = state.startedAtMs ?? now;
  const lastEventMs = state.events.length > 0 ? state.events[state.events.length - 1].t : 0;
  const durationMs = state.isRecording
    ? Math.max(lastEventMs, now - startedAtMs)
    : Math.max(lastEventMs, 1000);

  const initialSnapshot =
    state.initialSnapshot ??
    buildTopologicalScore({
      title: state.sessionTitle,
      author: anonymizeParticipantId(LOCAL_SESSION_SEED, state.localAuthorRole),
      description: 'Instantánea de sesión',
    });

  return {
    format: 'solomon-house/session-v2',
    version: CASA_SESSION_V2_VERSION,
    exportedAt: new Date().toISOString(),
    metadata: {
      title: state.sessionTitle,
      roomId: state.roomId,
      level: getCurrentLevel().id,
      durationMs,
      startedAt: state.startedAtIso ?? new Date(startedAtMs).toISOString(),
      consentGrantedAt: state.consentGrantedAt ?? new Date().toISOString(),
      anonymized: true,
      binauralListenerPosition: state.binauralEnabled ? state.binauralListenerPosition : null,
      mappingPreset,
      participants: state.participants,
    },
    initialSnapshot,
    events: state.events,
    markers: state.markers,
  };
}

/** Descarga el archivo .casa.json v2 de la sesión actual (E1.1.4). */
export function exportCasaSessionV2(mappingPreset?: string): void {
  const session = buildCasaSessionV2(mappingPreset);
  const blob = new Blob([JSON.stringify(session, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `sesion-${session.exportedAt.slice(0, 19).replace(/[:T]/g, '-')}.casa.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

/** Descarga el JSON Schema de .casa.json v2 para documentación de tesis (E1.1.4). */
export function exportCasaSessionSchema(): void {
  const blob = new Blob([JSON.stringify(CASA_SESSION_V2_JSON_SCHEMA, null, 2)], {
    type: 'application/schema+json',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'casa-session-v2.schema.json';
  anchor.click();
  URL.revokeObjectURL(url);
}
