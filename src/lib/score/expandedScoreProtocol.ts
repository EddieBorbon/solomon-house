import { create } from 'zustand';
import {
  usePedagogyStore,
  type ParametricLevel,
} from '../pedagogy/parametricLevels';
import {
  type CompositionalLayer,
  type CasaSessionV2,
  buildCasaSessionV2,
  stopSessionRecording,
  recordSessionEvent,
  setSessionMetadataConfig,
} from '../session/sessionRecorder';

/**
 * Protocolo de Partitura Expandida y Algoritmo Compositivo Social
 * (Roadmap Funcional Jurado — Etapa E2 completa).
 *
 * Cubre:
 *  - E2.1: Roles por sala (moderación, composición, interpretación, escucha,
 *          curaduría), matriz de permisos, asignación en vivo e indicadores.
 *  - E2.2: Capas compositivas, propiedad y cesión de objetos, modos síncrono,
 *          por turnos y asíncrono (cadáver exquisito sonoro), y bloqueo de
 *          parámetros (grados de libertad).
 *  - E2.3: Sesiones con duración fija (10, 15, 30 min, libre), 4 fases con
 *          reglas dinámicas, plantillas compartibles ("partituras de juego")
 *          y archivado automático al finalizar con E1.
 *  - E2.5: Modelos de participación (abierta, invitación, dúo/trío/cuarteto),
 *          convocatorias/temporadas y micro-redes de afinidad.
 */

export type RoomRole = 'moderator' | 'composer' | 'performer' | 'listener' | 'curator';

export interface RolePermissions {
  canCreate: boolean;
  canMove: boolean;
  canEditSynth: boolean;
  canEditEffects: boolean;
  canRecord: boolean;
  canCurate: boolean;
  canManageRoles: boolean;
}

/** Matriz explícita de permisos por rol (E2.1.1 y E2.1.2). */
export const ROLE_PERMISSIONS: Record<RoomRole, RolePermissions> = {
  moderator: {
    canCreate: true,
    canMove: true,
    canEditSynth: true,
    canEditEffects: true,
    canRecord: true,
    canCurate: true,
    canManageRoles: true,
  },
  composer: {
    canCreate: true,
    canMove: true,
    canEditSynth: true,
    canEditEffects: true,
    canRecord: true,
    canCurate: false,
    canManageRoles: false,
  },
  performer: {
    canCreate: false,
    canMove: true,
    canEditSynth: true,
    canEditEffects: true,
    canRecord: false,
    canCurate: false,
    canManageRoles: false,
  },
  listener: {
    canCreate: false,
    canMove: false,
    canEditSynth: false,
    canEditEffects: false,
    canRecord: false,
    canCurate: false,
    canManageRoles: false,
  },
  curator: {
    canCreate: false,
    canMove: false,
    canEditSynth: false,
    canEditEffects: false,
    canRecord: true,
    canCurate: true,
    canManageRoles: false,
  },
};

export const ROLE_LABELS: Record<RoomRole, string> = {
  moderator: 'Moderación / Dirección',
  composer: 'Composición (estructura y síntesis)',
  performer: 'Interpretación (gesto y espacio)',
  listener: 'Escucha activa',
  curator: 'Curaduría y archivo',
};

export const ROLE_VISUAL_COLORS: Record<RoomRole, string> = {
  moderator: '#34d399', // esmeralda
  composer: '#60a5fa', // azul
  performer: '#f59e0b', // ámbar
  listener: '#94a3b8', // gris plata
  curator: '#c084fc', // púrpura
};

export type CollaborationMode = 'synchronous' | 'turn_based' | 'asynchronous';

export type SessionPhaseId =
  | 'experimentation'
  | 'consolidation'
  | 'production'
  | 'presentation';

export interface ParameterFreedomLocks {
  frequency: boolean; // true = bloqueado por la moderación
  timbre: boolean;
  position: boolean;
  effects: boolean;
  scale: boolean;
}

export interface RoomParticipantProtocol {
  id: string;
  alias: string;
  role: RoomRole;
  layer: CompositionalLayer;
  position3D: [number, number, number];
}

export interface ExquisiteCorpseLayerEntry {
  id: string;
  participantId: string;
  layer: CompositionalLayer;
  recordedAtIso: string;
  objectIds: string[];
  notes: string;
}

export type PresetSessionDuration = 10 | 15 | 30 | 'free';

export type RoomAccessType = 'open' | 'invite' | 'duo' | 'trio' | 'quartet';

export interface GameScoreTemplate {
  format: 'solomon-house/game-score-template';
  id: string;
  name: string;
  description: string;
  level: ParametricLevel;
  collaborationMode: CollaborationMode;
  presetDuration: PresetSessionDuration;
  turnDurationSec: number;
  roomAccessType: RoomAccessType;
  parameterLocks: ParameterFreedomLocks;
  defaultRoles: RoomRole[];
  defaultLayers: CompositionalLayer[];
}

export interface SeasonCall {
  id: string;
  seasonTitle: string;
  sessionTitle: string;
  dateIso: string;
  roomType: RoomAccessType;
  level: ParametricLevel;
  quotaMax: number;
  enrolledCount: number;
  isEnrolled: boolean;
}

export interface AffinityGroup {
  id: string;
  name: string;
  focusTag: string;
  memberIds: string[];
  completedSessionsCount: number;
  lastSessionIso: string;
}

export const BUILTIN_GAME_SCORE_TEMPLATES: GameScoreTemplate[] = [
  {
    format: 'solomon-house/game-score-template',
    id: 'tpl-iniciacion-n1',
    name: 'Partitura I · Exploración Acotada (N1)',
    description: 'Sesión guiada de 10 min con osciladores puros, modo síncrono y efectos bloqueados.',
    level: 1,
    collaborationMode: 'synchronous',
    presetDuration: 10,
    turnDurationSec: 45,
    roomAccessType: 'open',
    parameterLocks: {
      frequency: false,
      timbre: false,
      position: false,
      effects: true,
      scale: true,
    },
    defaultRoles: ['moderator', 'composer', 'performer'],
    defaultLayers: ['texture', 'gesture', 'spatial'],
  },
  {
    format: 'solomon-house/game-score-template',
    id: 'tpl-ronda-turnos',
    name: 'Partitura II · Ronda de Contrapunto por Turnos (N2)',
    description: 'Cuarteto cerrado de 15 min por turnos de 45s. Cada intérprete interviene en su capa.',
    level: 2,
    collaborationMode: 'turn_based',
    presetDuration: 15,
    turnDurationSec: 45,
    roomAccessType: 'quartet',
    parameterLocks: {
      frequency: false,
      timbre: false,
      position: false,
      effects: false,
      scale: false,
    },
    defaultRoles: ['moderator', 'composer', 'performer', 'performer'],
    defaultLayers: ['texture', 'gesture', 'spatial', 'general'],
  },
  {
    format: 'solomon-house/game-score-template',
    id: 'tpl-cadaver-exquisito',
    name: 'Partitura III · Cadáver Exquisito Sonoro Asíncrono (N3)',
    description: 'Cada participante escucha la capa anterior antes de depositar su estrato sonoro.',
    level: 3,
    collaborationMode: 'asynchronous',
    presetDuration: 30,
    turnDurationSec: 90,
    roomAccessType: 'invite',
    parameterLocks: {
      frequency: false,
      timbre: false,
      position: false,
      effects: false,
      scale: false,
    },
    defaultRoles: ['composer', 'composer', 'curator'],
    defaultLayers: ['texture', 'gesture', 'spatial'],
  },
  {
    format: 'solomon-house/game-score-template',
    id: 'tpl-ensamble-abierto',
    name: 'Partitura IV · Ensamble Telemático Abierto (N4)',
    description: 'Sesión libre con todas las herramientas, samples, Csound y curaduría activa.',
    level: 4,
    collaborationMode: 'synchronous',
    presetDuration: 'free',
    turnDurationSec: 60,
    roomAccessType: 'open',
    parameterLocks: {
      frequency: false,
      timbre: false,
      position: false,
      effects: false,
      scale: false,
    },
    defaultRoles: ['moderator', 'composer', 'performer', 'listener', 'curator'],
    defaultLayers: ['texture', 'gesture', 'spatial', 'general'],
  },
];

export interface ExpandedScoreState {
  // E2.1 Roles y participantes
  localParticipantId: string;
  localRole: RoomRole;
  localLayer: CompositionalLayer;
  participants: RoomParticipantProtocol[];
  showRoleIndicatorsIn3D: boolean;

  // E2.2 Capas, propiedad, modos y bloqueos
  collaborationMode: CollaborationMode;
  objectOwners: Record<string, string>; // objectId -> participantId ('PUBLIC' = cedido)
  enforceOwnership: boolean;
  turnDurationSec: number;
  turnRemainingSec: number;
  activeTurnParticipantId: string;
  asyncLayers: ExquisiteCorpseLayerEntry[];
  hasListenedToPreviousAsyncLayer: boolean;
  parameterLocks: ParameterFreedomLocks;

  // E2.3 Forma temporal y archivo automático
  presetDuration: PresetSessionDuration;
  sessionTimerRunning: boolean;
  sessionRemainingSec: number;
  sessionElapsedSec: number;
  currentPhase: SessionPhaseId;
  archivedSessions: CasaSessionV2[];

  // E2.5 Modelos de participación, temporadas y micro-redes
  roomAccessType: RoomAccessType;
  inviteCode: string;
  seasonCalls: SeasonCall[];
  affinityGroups: AffinityGroup[];
}

export const ROOM_CAPACITY_BY_TYPE: Record<RoomAccessType, number> = {
  open: 32,
  invite: 12,
  duo: 2,
  trio: 3,
  quartet: 4,
};

export const PHASE_DESCRIPTIONS: Record<
  SessionPhaseId,
  { label: string; ruleSummary: string }
> = {
  experimentation: {
    label: 'Fase 1 · Experimentación',
    ruleSummary: 'Creación y exploración libre de objetos y timbres.',
  },
  consolidation: {
    label: 'Fase 2 · Consolidación',
    ruleSummary: 'Ajuste espacial y tímbrico; densidad controlada.',
  },
  production: {
    label: 'Fase 3 · Producción / Desarrollo',
    ruleSummary: 'Creación de nuevos objetos cerrada; interpretación sobre el tejido existente.',
  },
  presentation: {
    label: 'Fase 4 · Presentación / Coda',
    ruleSummary: 'Frecuencia y timbre fijos; solo espacialización y escucha hacia el cierre.',
  },
};

export const useExpandedScoreStore = create<ExpandedScoreState>(() => ({
  localParticipantId: 'P-local',
  localRole: 'moderator',
  localLayer: 'texture',
  participants: [
    {
      id: 'P-local',
      alias: 'Participante Local (Tú)',
      role: 'moderator',
      layer: 'texture',
      position3D: [0, 1.8, 3],
    },
  ],
  showRoleIndicatorsIn3D: true,

  collaborationMode: 'synchronous',
  objectOwners: {},
  enforceOwnership: false,
  turnDurationSec: 45,
  turnRemainingSec: 45,
  activeTurnParticipantId: 'P-local',
  asyncLayers: [],
  hasListenedToPreviousAsyncLayer: true,
  parameterLocks: {
    frequency: false,
    timbre: false,
    position: false,
    effects: false,
    scale: false,
  },

  presetDuration: 15,
  sessionTimerRunning: false,
  sessionRemainingSec: 15 * 60,
  sessionElapsedSec: 0,
  currentPhase: 'experimentation',
  archivedSessions: [],

  roomAccessType: 'open',
  inviteCode: 'SALOMON-2026',
  seasonCalls: [
    {
      id: 'call-1',
      seasonTitle: 'Temporada Otoño 2026 · Paisajes Espectrales',
      sessionTitle: 'Sesión 1: Resonancias Transatlánticas (N2)',
      dateIso: '2026-11-15T18:00:00Z',
      roomType: 'quartet',
      level: 2,
      quotaMax: 4,
      enrolledCount: 3,
      isEnrolled: false,
    },
    {
      id: 'call-2',
      seasonTitle: 'Temporada Otoño 2026 · Paisajes Espectrales',
      sessionTitle: 'Sesión 2: Cadáver Exquisito Electroacústico (N3)',
      dateIso: '2026-11-22T19:00:00Z',
      roomType: 'invite',
      level: 3,
      quotaMax: 8,
      enrolledCount: 5,
      isEnrolled: true,
    },
    {
      id: 'call-3',
      seasonTitle: 'Temporada Invierno 2026 · Ensamble Abierto',
      sessionTitle: 'Sesión 3: Improvisación Híbrida con Agentes (N4)',
      dateIso: '2026-12-05T17:00:00Z',
      roomType: 'open',
      level: 4,
      quotaMax: 16,
      enrolledCount: 9,
      isEnrolled: false,
    },
  ],
  affinityGroups: [
    {
      id: 'aff-1',
      name: 'Ensamble Espectral UNAM–Nanjing',
      focusTag: 'Síntesis FM y Microtonalidad',
      memberIds: ['P-local', 'P-cn01a8', 'P-cn02c1'],
      completedSessionsCount: 6,
      lastSessionIso: '2026-10-28',
    },
    {
      id: 'aff-2',
      name: 'Red Sur de Improvisación Espacial',
      focusTag: 'Polirritmia Orbital y Granular',
      memberIds: ['P-local', 'P-co01f2', 'P-ar01e5'],
      completedSessionsCount: 9,
      lastSessionIso: '2026-10-31',
    },
  ],
}));

// ============================================================================
// Funciones de Roles, Permisos y Propiedad (E2.1 y E2.2)
// ============================================================================

export function getActivePermissions(): RolePermissions {
  const state = useExpandedScoreStore.getState();
  const base = { ...ROLE_PERMISSIONS[state.localRole] };

  // Si estamos en modo por turnos y no es el turno del participante local (salvo moderador)
  if (
    state.collaborationMode === 'turn_based' &&
    state.localRole !== 'moderator' &&
    state.activeTurnParticipantId !== state.localParticipantId
  ) {
    return {
      ...base,
      canCreate: false,
      canMove: false,
      canEditSynth: false,
      canEditEffects: false,
    };
  }

  // Si estamos en modo asíncrono y aún no ha escuchado la capa previa
  if (
    state.collaborationMode === 'asynchronous' &&
    !state.hasListenedToPreviousAsyncLayer &&
    state.asyncLayers.length > 0
  ) {
    return {
      ...base,
      canCreate: false,
      canMove: false,
      canEditSynth: false,
      canEditEffects: false,
    };
  }

  // Reglas dinámicas por fase de sesión (E2.3.2)
  if (state.sessionTimerRunning) {
    if (state.currentPhase === 'production') {
      base.canCreate = false;
    } else if (state.currentPhase === 'presentation') {
      base.canCreate = false;
      base.canEditSynth = false;
    }
  }

  return base;
}

export function assignParticipantRole(participantId: string, role: RoomRole): void {
  useExpandedScoreStore.setState((state) => {
    const participants = state.participants.map((p) =>
      p.id === participantId ? { ...p, role } : p
    );
    const isLocal = participantId === state.localParticipantId;
    return {
      participants,
      ...(isLocal ? { localRole: role } : {}),
    };
  });
}

export function upsertRoomParticipant(participant: RoomParticipantProtocol): void {
  useExpandedScoreStore.setState((state) => {
    const exists = state.participants.some((p) => p.id === participant.id);
    const participants = exists
      ? state.participants.map((p) => (p.id === participant.id ? { ...p, ...participant } : p))
      : [...state.participants, participant];
    return { participants };
  });
}

export function removeRoomParticipant(participantId: string): void {
  useExpandedScoreStore.setState((state) => {
    if (participantId === state.localParticipantId) return state;
    const participants = state.participants.filter((p) => p.id !== participantId);
    const activeTurnParticipantId =
      state.activeTurnParticipantId === participantId
        ? state.localParticipantId
        : state.activeTurnParticipantId;
    return { participants, activeTurnParticipantId };
  });
}

export function assignParticipantLayer(
  participantId: string,
  layer: CompositionalLayer
): void {
  useExpandedScoreStore.setState((state) => {
    const participants = state.participants.map((p) =>
      p.id === participantId ? { ...p, layer } : p
    );
    const isLocal = participantId === state.localParticipantId;
    if (isLocal) {
      setSessionMetadataConfig({ localLayer: layer });
    }
    return {
      participants,
      ...(isLocal ? { localLayer: layer } : {}),
    };
  });
}

export function registerObjectOwner(objectId: string, ownerId?: string): void {
  const state = useExpandedScoreStore.getState();
  const resolvedOwner = ownerId ?? state.localParticipantId;
  useExpandedScoreStore.setState((prev) => ({
    objectOwners: { ...prev.objectOwners, [objectId]: resolvedOwner },
  }));
}

export function transferObjectOwnership(objectId: string, newOwnerId: string | 'PUBLIC'): void {
  useExpandedScoreStore.setState((prev) => ({
    objectOwners: { ...prev.objectOwners, [objectId]: newOwnerId },
  }));
}

export function canControlObjectByOwnership(objectId: string): boolean {
  const state = useExpandedScoreStore.getState();
  if (!state.enforceOwnership || state.localRole === 'moderator') return true;
  const owner = state.objectOwners[objectId];
  if (!owner || owner === 'PUBLIC') return true;
  return owner === state.localParticipantId;
}

export function toggleParameterLock(param: keyof ParameterFreedomLocks): void {
  useExpandedScoreStore.setState((state) => ({
    parameterLocks: {
      ...state.parameterLocks,
      [param]: !state.parameterLocks[param],
    },
  }));
}

// ============================================================================
// Modos de Colaboración: Turnos y Cadáver Exquisito Asíncrono (E2.2.3–E2.2.5)
// ============================================================================

export function setCollaborationMode(mode: CollaborationMode): void {
  useExpandedScoreStore.setState((state) => ({
    collaborationMode: mode,
    turnRemainingSec: state.turnDurationSec,
    hasListenedToPreviousAsyncLayer: state.asyncLayers.length === 0,
  }));
}

export function advanceTurn(): void {
  useExpandedScoreStore.setState((state) => {
    const activePlayers = state.participants.filter((p) => p.role !== 'listener');
    if (activePlayers.length === 0) return state;
    const idx = activePlayers.findIndex((p) => p.id === state.activeTurnParticipantId);
    const nextPlayer = activePlayers[(idx + 1) % activePlayers.length];
    return {
      activeTurnParticipantId: nextPlayer.id,
      turnRemainingSec: state.turnDurationSec,
    };
  });
}

export function markAsyncLayerListened(): void {
  useExpandedScoreStore.setState({ hasListenedToPreviousAsyncLayer: true });
}

export function commitAsyncExquisiteCorpseLayer(notes: string, objectIds: string[]): void {
  useExpandedScoreStore.setState((state) => {
    const entry: ExquisiteCorpseLayerEntry = {
      id: `layer-${Date.now()}`,
      participantId: state.localParticipantId,
      layer: state.localLayer,
      recordedAtIso: new Date().toISOString(),
      objectIds,
      notes: notes.trim() || `Capa ${state.asyncLayers.length + 1} (${state.localLayer})`,
    };
    return {
      asyncLayers: [...state.asyncLayers, entry],
      hasListenedToPreviousAsyncLayer: false,
    };
  });
}

// ============================================================================
// Temporizador de Sesión, Fases Automáticas y Archivado E1 (E2.3.1–E2.3.4)
// ============================================================================

let sessionClockInterval: ReturnType<typeof setInterval> | null = null;

function computePhaseFromProgress(progressRatio: number): SessionPhaseId {
  if (progressRatio < 0.25) return 'experimentation';
  if (progressRatio < 0.55) return 'consolidation';
  if (progressRatio < 0.85) return 'production';
  return 'presentation';
}

export function setPresetSessionDuration(duration: PresetSessionDuration): void {
  const totalSec = duration === 'free' ? 0 : duration * 60;
  useExpandedScoreStore.setState({
    presetDuration: duration,
    sessionRemainingSec: totalSec,
    sessionElapsedSec: 0,
    currentPhase: 'experimentation',
  });
}

export function startTimedSession(): void {
  if (sessionClockInterval) clearInterval(sessionClockInterval);

  const state = useExpandedScoreStore.getState();
  const initialRemaining =
    state.presetDuration === 'free' ? 0 : state.presetDuration * 60;

  useExpandedScoreStore.setState({
    sessionTimerRunning: true,
    sessionRemainingSec:
      state.sessionRemainingSec > 0 ? state.sessionRemainingSec : initialRemaining,
    currentPhase: 'experimentation',
  });

  sessionClockInterval = setInterval(() => {
    const cur = useExpandedScoreStore.getState();
    if (!cur.sessionTimerRunning) return;

    // Reloj de ronda por turnos (E2.2.4)
    if (cur.collaborationMode === 'turn_based') {
      if (cur.turnRemainingSec <= 1) {
        advanceTurn();
      } else {
        useExpandedScoreStore.setState({ turnRemainingSec: cur.turnRemainingSec - 1 });
      }
    }

    const nextElapsed = cur.sessionElapsedSec + 1;

    if (cur.presetDuration === 'free') {
      useExpandedScoreStore.setState({ sessionElapsedSec: nextElapsed });
      return;
    }

    const totalSec = cur.presetDuration * 60;
    const nextRemaining = Math.max(0, cur.sessionRemainingSec - 1);
    const ratio = Math.min(1, nextElapsed / totalSec);
    const nextPhase = computePhaseFromProgress(ratio);

    if (nextPhase !== cur.currentPhase) {
      recordSessionEvent({
        type: 'phase_change',
        entityType: 'session',
        entityId: nextPhase,
        notes: `Cambio automático a ${PHASE_DESCRIPTIONS[nextPhase].label}`,
      });
    }

    if (nextRemaining <= 0) {
      // E2.3.4: Al terminar, la sesión se archiva sola con el grabador de E1
      stopTimedSession(true);
      return;
    }

    useExpandedScoreStore.setState({
      sessionElapsedSec: nextElapsed,
      sessionRemainingSec: nextRemaining,
      currentPhase: nextPhase,
    });
  }, 1000);
}

export function stopTimedSession(autoArchive: boolean = true): void {
  if (sessionClockInterval) {
    clearInterval(sessionClockInterval);
    sessionClockInterval = null;
  }

  stopSessionRecording();
  const archived = autoArchive ? buildCasaSessionV2() : null;

  useExpandedScoreStore.setState((state) => ({
    sessionTimerRunning: false,
    archivedSessions: archived
      ? [archived, ...state.archivedSessions].slice(0, 20)
      : state.archivedSessions,
  }));
}

export function setManualSessionPhase(phase: SessionPhaseId): void {
  useExpandedScoreStore.setState({ currentPhase: phase });
  recordSessionEvent({
    type: 'phase_change',
    entityType: 'session',
    entityId: phase,
    notes: `Cambio manual a ${PHASE_DESCRIPTIONS[phase].label}`,
  });
}

// ============================================================================
// Plantillas de Sesión ("Partituras de Juego", E2.3.3)
// ============================================================================

export function applyGameScoreTemplate(template: GameScoreTemplate): void {
  usePedagogyStore.getState().setLevel(template.level);
  const totalSec =
    template.presetDuration === 'free' ? 0 : template.presetDuration * 60;

  useExpandedScoreStore.setState((state) => ({
    collaborationMode: template.collaborationMode,
    presetDuration: template.presetDuration,
    turnDurationSec: template.turnDurationSec,
    turnRemainingSec: template.turnDurationSec,
    roomAccessType: template.roomAccessType,
    parameterLocks: { ...template.parameterLocks },
    sessionRemainingSec: totalSec,
    sessionElapsedSec: 0,
    currentPhase: 'experimentation',
    participants: state.participants.map((p, i) => ({
      ...p,
      role: template.defaultRoles[i % template.defaultRoles.length] || p.role,
      layer: template.defaultLayers[i % template.defaultLayers.length] || p.layer,
    })),
  }));
}

export function exportCurrentGameScoreTemplate(name: string, description: string): void {
  const state = useExpandedScoreStore.getState();
  const level = usePedagogyStore.getState().level;
  const tpl: GameScoreTemplate = {
    format: 'solomon-house/game-score-template',
    id: `tpl-${Date.now()}`,
    name: name.trim() || 'Partitura de Juego Personalizada',
    description: description.trim() || 'Plantilla exportada desde La Casa de Salomón',
    level,
    collaborationMode: state.collaborationMode,
    presetDuration: state.presetDuration,
    turnDurationSec: state.turnDurationSec,
    roomAccessType: state.roomAccessType,
    parameterLocks: state.parameterLocks,
    defaultRoles: state.participants.map((p) => p.role),
    defaultLayers: state.participants.map((p) => p.layer),
  };

  const blob = new Blob([JSON.stringify(tpl, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `partitura-juego-${tpl.id}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ============================================================================
// Convocatorias, Temporadas y Micro-redes de Afinidad (E2.5)
// ============================================================================

export function toggleSeasonCallEnrollment(callId: string): void {
  useExpandedScoreStore.setState((state) => ({
    seasonCalls: state.seasonCalls.map((c) => {
      if (c.id !== callId) return c;
      if (c.isEnrolled) {
        return { ...c, isEnrolled: false, enrolledCount: Math.max(0, c.enrolledCount - 1) };
      }
      if (c.enrolledCount >= c.quotaMax) return c;
      return { ...c, isEnrolled: true, enrolledCount: c.enrolledCount + 1 };
    }),
  }));
}

export function createAffinityGroup(name: string, focusTag: string): void {
  if (!name.trim()) return;
  useExpandedScoreStore.setState((state) => ({
    affinityGroups: [
      {
        id: `aff-${Date.now()}`,
        name: name.trim(),
        focusTag: focusTag.trim() || 'Creación Colectiva',
        memberIds: [state.localParticipantId],
        completedSessionsCount: 1,
        lastSessionIso: new Date().toISOString().slice(0, 10),
      },
      ...state.affinityGroups,
    ],
  }));
}
