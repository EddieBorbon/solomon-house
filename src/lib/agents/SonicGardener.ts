import * as THREE from 'three';
import { create } from 'zustand';
import { useWorldStore, type SoundObject, type SoundObjectType } from '../../state/useWorldStore';
import {
  isObjectTypeAllowed,
  usePedagogyStore,
  type ParametricLevel,
} from '../pedagogy/parametricLevels';
import {
  withSessionAuthor,
  recordSessionEvent,
  useSessionRecorderStore,
  type CompositionalLayer,
} from '../session/sessionRecorder';
import { analyzeSessionMusicology } from '../session/musicologicalAnalysis';
import {
  useExpandedScoreStore,
  setManualSessionPhase,
  type SessionPhaseId,
} from '../score/expandedScoreProtocol';
import { TrajectoryPredictor } from './TrajectoryPredictor';
import {
  BANDS,
  analyzeTexture,
  complementaryWaveform,
  counterpointFrequency,
  counterpointPosition,
  retreatPosition,
  type TextureObject,
} from './accompaniment';

/**
 * El Sistema como Compañero de Ejecución y Ensamble de Agentes (Etapa E4 completa).
 *
 * Extiende `SonicGardener` (6.1, 6.3, 6.5) para cumplir todas las tareas de E4:
 *  - E4.1.1: 5 perfiles de comportamiento (`imitate`, `contrast`, `sustain`, `silence`, `provoke`).
 *  - E4.1.2: Detección y respuesta a gestos humanos (aceleración de eventos, saltos de registro,
 *            desplazamiento rápido).
 *  - E4.1.3: Memoria corta de motivos humanos (buffer temporal de 1–5 minutos que el agente
 *            retoma y re-orquesta).
 *  - E4.1.4: Uso de `TrajectoryPredictor` (filtro alfa-beta) para anticipar hacia dónde camina
 *            la persona participante y sembrar material sonoro en su trayectoria futura.
 *  - E4.2.1: Registro e interfaz de intenciones en tiempo real ("voy a contrastar la banda grave").
 *  - E4.2.2: Controles de agencia (nivel de intervención 0–100% y filtro de capas E2.2).
 *  - E4.2.3: Trazabilidad completa de autoría por agente (`AGENTE-...`) para E1.3.6.
 *  - E4.3.1: Múltiples agentes simultáneos con personalidades distintas en la misma sala.
 *  - E4.3.2: Adopción de las reglas de la partitura expandida E2 (turnos y fases).
 *  - E4.3.3: Modo "Ensamble Mínimo" (1 humano + 2 agentes contrastantes para práctica solista).
 *  - E4.3.4: Agente Director que evalúa el estado de la sala y propone cambios de fase o nivel.
 *  - E4.3.5: Comparador experimental de sesiones Con Agente vs. Sin Agente (medido con E1).
 */

export type AgentBehaviorProfile =
  | 'imitate'
  | 'contrast'
  | 'sustain'
  | 'silence'
  | 'provoke';

export const AGENT_PROFILE_LABELS: Record<
  AgentBehaviorProfile,
  { name: string; description: string }
> = {
  imitate: {
    name: 'Imitar (Espejo)',
    description: 'Replica el registro, forma y gestos recientes de quien interpreta con eco cercano.',
  },
  contrast: {
    name: 'Contrastar (Contrapunto)',
    description: 'Ocupa la banda espectral y zona opuesta con timbres complementarios.',
  },
  sustain: {
    name: 'Sostener (Pedal / Drone)',
    description: 'Mantiene un colchón armónico estable de ataque lento en el registro grave-medio.',
  },
  silence: {
    name: 'Callar (Escucha Activa)',
    description: 'Permanece en silencio observando motivos y cede todo el espacio acústico.',
  },
  provoke: {
    name: 'Provocar (Ruptura)',
    description: 'Introduce contrastes abruptos, timbres inarmónicos y anticipa trayectorias.',
  },
};

export const AGENT_LAYER_LABELS: Record<CompositionalLayer, string> = {
  texture: 'Textura / Armonía',
  gesture: 'Gesto / Ritmo',
  spatial: 'Espacio / Trayectorias',
  general: 'General / Libre',
};

export interface HumanMotifMemoryItem {
  timestampMs: number;
  objectType: SoundObjectType;
  frequency: number;
  waveform: string;
  position: [number, number, number];
  authorHash: string;
}

export interface AgentInstanceConfig {
  id: string;
  name: string;
  profile: AgentBehaviorProfile;
  enabled: boolean;
  /** Nivel de intervención 0..1 (E4.2.2) */
  interventionRate: number;
  /** Capas compositivas en las que tiene permiso de actuar (E4.2.2 / E2.2) */
  allowedLayers: CompositionalLayer[];
  /** Objetos actualmente plantados por este agente */
  ownedObjectIds: string[];
  /** Última intención declarada (E4.2.1) */
  currentIntention: string;
}

export interface DirectorProposal {
  id: string;
  timestampIso: string;
  rationale: string;
  suggestedPhase?: SessionPhaseId;
  suggestedLevel?: ParametricLevel;
  applied: boolean;
}

export interface ComparativeSessionEntry {
  id: string;
  label: string;
  condition: 'with_agent' | 'without_agent';
  recordedAtIso: string;
  eventCount: number;
  humanRatio: number;
  agentRatio: number;
  pitchSystem: string;
  rhythmicPeriodicityIndex: number;
  meanDensity: number;
  meanSpectralCentroidHz: number;
}

export interface AgentCompanionState {
  agents: AgentInstanceConfig[];
  minimumEnsembleMode: boolean; // E4.3.3: 1 humano + 2 agentes
  respectScoreRulesE2: boolean; // E4.3.2
  directorAgentEnabled: boolean; // E4.3.4
  directorProposals: DirectorProposal[];
  shortTermMotifMemory: HumanMotifMemoryItem[]; // E4.1.3
  recentHumanGestureRatePerMin: number; // E4.1.2
  predictedListenerTarget: [number, number, number]; // E4.1.4
  comparativeRuns: ComparativeSessionEntry[]; // E4.3.5
}

const DEFAULT_AGENTS: AgentInstanceConfig[] = [
  {
    id: 'AGENTE-JARDINERO',
    name: 'Jardinero Sónico I (Contrapuntista)',
    profile: 'contrast',
    enabled: false,
    interventionRate: 0.7,
    allowedLayers: ['texture', 'spatial'],
    ownedObjectIds: [],
    currentIntention: 'En reposo — esperando activación.',
  },
  {
    id: 'AGENTE-ECO',
    name: 'Jardinero Sónico II (Espejo Motívico)',
    profile: 'imitate',
    enabled: false,
    interventionRate: 0.6,
    allowedLayers: ['gesture', 'general'],
    ownedObjectIds: [],
    currentIntention: 'En reposo — esperando activación.',
  },
  {
    id: 'AGENTE-PROVOCADOR',
    name: 'Jardinero Sónico III (Provocador)',
    profile: 'provoke',
    enabled: false,
    interventionRate: 0.5,
    allowedLayers: ['texture', 'gesture'],
    ownedObjectIds: [],
    currentIntention: 'En reposo — esperando activación.',
  },
];

export const useAgentCompanionStore = create<AgentCompanionState>(() => ({
  agents: DEFAULT_AGENTS,
  minimumEnsembleMode: false,
  respectScoreRulesE2: true,
  directorAgentEnabled: true,
  directorProposals: [],
  shortTermMotifMemory: [],
  recentHumanGestureRatePerMin: 0,
  predictedListenerTarget: [0, 1.5, 0],
  comparativeRuns: [],
}));

const TICK_INTERVAL_MS = 6_000;
const MAX_OWN_OBJECTS_PER_AGENT = 4;
const CROWDED_THRESHOLD = 24;
const DOMINANCE_RATIO = 0.55;
const PLANT_PALETTE: SoundObjectType[] = ['cube', 'sphere', 'cylinder', 'cone', 'torus', 'icosahedron'];

function toTextureObjects(objects: SoundObject[]): TextureObject[] {
  return objects.map((obj) => ({
    id: obj.id,
    frequency: obj.audioParams?.frequency || 440,
    waveform: String(obj.audioParams?.waveform || 'sine'),
    position: obj.position,
  }));
}

export class SonicGardener {
  private timer: ReturnType<typeof setInterval> | null = null;
  private predictor = new TrajectoryPredictor();

  public isRunning(): boolean {
    return useAgentCompanionStore.getState().agents.some((a) => a.enabled);
  }

  public start(): void {
    const st = useAgentCompanionStore.getState();
    if (!st.agents.some((a) => a.enabled)) {
      useAgentCompanionStore.setState({
        agents: st.agents.map((a, idx) =>
          idx === 0
            ? {
                ...a,
                enabled: true,
                currentIntention: 'Despierto: escuchando la textura inicial de la sala.',
              }
            : a
        ),
      });
    }
    this.ensureTimer();
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    useAgentCompanionStore.setState((s) => ({
      minimumEnsembleMode: false,
      agents: s.agents.map((a) => ({
        ...a,
        enabled: false,
        currentIntention: 'En reposo.',
      })),
    }));
  }

  public ensureTimer(): void {
    if (this.timer) return;
    this.timer = setInterval(() => {
      this.tickAll();
    }, TICK_INTERVAL_MS);
  }

  /**
   * Alimenta el predictor de trayectorias (E4.1.4) con la posición actual
   * de la persona participante.
   */
  public feedParticipantPosition(pos: [number, number, number]): [number, number, number] {
    const nowSec = (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;
    this.predictor.update(new THREE.Vector3(pos[0], pos[1], pos[2]), nowSec);
    const pred = this.predictor.predict(4.0);
    const target: [number, number, number] = [
      Math.round(pred.x * 10) / 10,
      Math.max(0.5, Math.min(6, Math.round(pred.y * 10) / 10)),
      Math.round(pred.z * 10) / 10,
    ];
    useAgentCompanionStore.setState({ predictedListenerTarget: target });
    return target;
  }

  /**
   * Activa el modo "Ensamble Mínimo" (E4.3.3): 1 persona + 2 agentes con
   * personalidades complementarias (Imitar + Contrastar) para practicar en solitario.
   */
  public enableMinimumEnsembleMode(enable: boolean): void {
    useAgentCompanionStore.setState((state) => ({
      minimumEnsembleMode: enable,
      agents: state.agents.map((a, i) => {
        if (!enable) {
          return { ...a, enabled: false, currentIntention: 'En reposo.' };
        }
        if (i === 0) {
          return {
            ...a,
            enabled: true,
            profile: 'contrast',
            interventionRate: 0.75,
            currentIntention: 'Ensamble mínimo: preparando contrapunto armónico.',
          };
        }
        if (i === 1) {
          return {
            ...a,
            enabled: true,
            profile: 'imitate',
            interventionRate: 0.65,
            currentIntention: 'Ensamble mínimo: escuchando tus motivos para responder en canon.',
          };
        }
        return { ...a, enabled: false };
      }),
    }));
    if (enable) {
      this.ensureTimer();
    }
  }

  private updateShortTermMemoryAndGestures(): void {
    const recState = useSessionRecorderStore.getState();
    const events = recState.events;
    const now = Date.now();
    const startMs = recState.startedAtMs ?? now - 60_000;
    const oneMinuteAgo = now - 60_000;

    // E4.1.2: Calcular tasa de gestos humanos recientes (eventos/minuto)
    const recentHumanEvents = events.filter(
      (e) => e.author.role === 'user' && now - (startMs + e.t) <= 60_000
    );
    const gestureRate = recentHumanEvents.length;

    // E4.1.3: Extraer motivos humanos de los últimos 5 minutos
    const newMotifs: HumanMotifMemoryItem[] = [];
    for (let i = Math.max(0, events.length - 40); i < events.length; i++) {
      const ev = events[i];
      if (
        ev.author.role === 'user' &&
        (ev.type === 'create' || ev.type === 'trigger' || ev.type === 'param_change') &&
        ev.position
      ) {
        newMotifs.push({
          timestampMs: startMs + ev.t,
          objectType: (ev.objectType as SoundObjectType) ?? 'sphere',
          frequency: Number(ev.params?.frequency ?? 440),
          waveform: String(ev.params?.waveform ?? 'sine'),
          position: ev.position,
          authorHash: ev.author.id,
        });
      }
    }

    if (newMotifs.length > 0) {
      const latestPos = newMotifs[newMotifs.length - 1].position;
      this.feedParticipantPosition(latestPos);
    }

    useAgentCompanionStore.setState((prev) => ({
      recentHumanGestureRatePerMin: gestureRate,
      shortTermMotifMemory: [
        ...prev.shortTermMotifMemory.filter((m) => m.timestampMs > oneMinuteAgo - 240_000),
        ...newMotifs,
      ].slice(-25),
    }));
  }

  private tickAll(): void {
    this.updateShortTermMemoryAndGestures();

    const companionState = useAgentCompanionStore.getState();
    const worldState = useWorldStore.getState();
    const scoreState = useExpandedScoreStore.getState();

    if (!worldState.activeGridId) return;

    // E4.3.2: Si el agente respeta las reglas de la partitura E2:
    if (companionState.respectScoreRulesE2) {
      if (
        scoreState.collaborationMode === 'turn_based' &&
        scoreState.activeTurnParticipantId &&
        !scoreState.activeTurnParticipantId.startsWith('AGENTE')
      ) {
        this.setAllAgentsIntention(
          'Respetando turno humano en la partitura E2 (esperando cesión de turno).'
        );
        return;
      }
    }

    // E4.3.4: Evaluar si el Agente Director debe proponer cambio de fase o nivel
    if (companionState.directorAgentEnabled) {
      this.evaluateDirectorProposal();
    }

    for (const agent of companionState.agents) {
      if (!agent.enabled) continue;
      withSessionAuthor(
        'agent',
        () => this.tickSingleAgent(agent),
        agent.id
      );
    }
  }

  private setAgentIntention(agentId: string, intention: string): void {
    useAgentCompanionStore.setState((s) => ({
      agents: s.agents.map((a) =>
        a.id === agentId ? { ...a, currentIntention: intention } : a
      ),
    }));
  }

  private setAllAgentsIntention(intention: string): void {
    useAgentCompanionStore.setState((s) => ({
      agents: s.agents.map((a) =>
        a.enabled ? { ...a, currentIntention: intention } : a
      ),
    }));
  }

  private tickSingleAgent(agent: AgentInstanceConfig): void {
    const state = useWorldStore.getState();
    const scoreState = useExpandedScoreStore.getState();
    const companionState = useAgentCompanionStore.getState();

    const grid = state.grids.get(state.activeGridId!);
    if (!grid) return;
    const objects = grid.objects;

    const validOwned = agent.ownedObjectIds.filter((id) =>
      objects.some((o) => o.id === id)
    );

    // E4.3.2: Adaptar perfil según fase de la sesión E2 cuando está corriendo el reloj
    let effectiveProfile: AgentBehaviorProfile = agent.profile;
    if (companionState.respectScoreRulesE2 && scoreState.sessionTimerRunning) {
      if (scoreState.currentPhase === 'presentation') {
        effectiveProfile = 'sustain';
      } else if (
        scoreState.currentPhase === 'experimentation' &&
        agent.profile === 'provoke'
      ) {
        effectiveProfile = 'imitate';
      }
    }

    // Perfil CALLAR (E4.1.1)
    if (effectiveProfile === 'silence') {
      this.setAgentIntention(
        agent.id,
        'Perfil Callar: escuchando en silencio y almacenando motivos en memoria corta.'
      );
      return;
    }

    // E4.1.2: Ajustar probabilidad de acción según aceleración gestual humana
    const gestureBoost = Math.min(0.35, companionState.recentHumanGestureRatePerMin * 0.03);
    const effectiveProb = Math.min(1, agent.interventionRate + gestureBoost);
    if (Math.random() > effectiveProb) {
      this.setAgentIntention(
        agent.id,
        `Escuchando compás (${Math.round(effectiveProb * 100)}% agencia activa, ${companionState.recentHumanGestureRatePerMin} gestos/min).`
      );
      return;
    }

    // Podar si la sala supera el umbral de saturación
    if (objects.length > CROWDED_THRESHOLD && validOwned.length > 0) {
      const victimId = validOwned[0];
      this.setAgentIntention(
        agent.id,
        `Podando objeto propio (${victimId.slice(0, 6)}) para aliviar la densidad de la sala.`
      );
      state.removeObject(victimId);
      this.updateOwnedIds(agent.id, validOwned.slice(1));
      return;
    }

    switch (effectiveProfile) {
      case 'imitate':
        this.actImitate(agent, objects, validOwned);
        break;
      case 'contrast':
        this.actContrast(agent, objects, validOwned, grid.gridSize);
        break;
      case 'sustain':
        this.actSustain(agent, objects, validOwned, grid.gridSize);
        break;
      case 'provoke':
        this.actProvoke(agent, objects, validOwned);
        break;
    }
  }

  /** E4.1.1 + E4.1.3: Perfil IMITAR — retoma motivos humanos de la memoria corta. */
  private actImitate(
    agent: AgentInstanceConfig,
    objects: SoundObject[],
    validOwned: string[]
  ): void {
    const memory = useAgentCompanionStore.getState().shortTermMotifMemory;
    const motif =
      memory.length > 0
        ? memory[Math.floor(Math.random() * memory.length)]
        : null;

    if (motif) {
      const targetFreq = Math.max(
        65,
        Math.min(1760, motif.frequency * (Math.random() > 0.5 ? 1 : 1.5))
      );
      const offsetPos: [number, number, number] = [
        Math.max(-8, Math.min(8, motif.position[0] + (Math.random() * 3 - 1.5))),
        Math.max(0.5, Math.min(6, motif.position[1] + 0.4)),
        Math.max(-8, Math.min(8, motif.position[2] + (Math.random() * 3 - 1.5))),
      ];

      this.setAgentIntention(
        agent.id,
        `Voy a retomar el motivo humano (${motif.objectType} a ${Math.round(motif.frequency)} Hz) transportado a ${Math.round(targetFreq)} Hz.`
      );

      if (validOwned.length < MAX_OWN_OBJECTS_PER_AGENT) {
        const planted = this.plantForAgent(agent, motif.objectType, offsetPos);
        if (planted) {
          useWorldStore.getState().updateObject(planted.id, {
            audioParams: {
              ...planted.audioParams,
              frequency: targetFreq,
              waveform: motif.waveform as 'sine' | 'square' | 'sawtooth' | 'triangle',
            },
          });
          useWorldStore.getState().triggerObjectNote(planted.id);
        }
      } else {
        const ownId = validOwned[0];
        const existing = objects.find((o) => o.id === ownId);
        if (existing) {
          useWorldStore.getState().updateObject(ownId, {
            position: offsetPos,
            audioParams: { ...existing.audioParams, frequency: targetFreq },
          });
          useWorldStore.getState().triggerObjectNote(ownId);
        }
      }
      return;
    }

    if (validOwned.length === 0) {
      this.setAgentIntention(
        agent.id,
        'Sembrando motivo inicial para invitar a la imitación dialógica.'
      );
      this.plantForAgent(agent, 'sphere', [1.5, 1.5, -1.5]);
    }
  }

  /** E4.1.1: Perfil CONTRASTAR — contrapunto espectral y espacial (6.3). */
  private actContrast(
    agent: AgentInstanceConfig,
    objects: SoundObject[],
    validOwned: string[],
    gridSize: number
  ): void {
    if (objects.length === 0) {
      this.setAgentIntention(agent.id, 'Sembrando punto de partida en registro medio.');
      this.plantForAgent(agent, 'cube', [-2, 1.2, 2]);
      return;
    }

    const analysis = analyzeTexture(toTextureObjects(objects));
    const dominantBand = BANDS[analysis.dominantIndex];
    const sparseBand = BANDS[analysis.sparseIndex];
    const reference = analysis.dominantObjects[0]?.frequency || dominantBand.center;
    const frequency = counterpointFrequency(reference, sparseBand);
    const waveform = complementaryWaveform(analysis.dominantObjects);

    this.setAgentIntention(
      agent.id,
      `Voy a contrastar la banda ${dominantBand.name} llevando una voz ${waveform} a la banda ${sparseBand.name} (${Math.round(frequency)} Hz).`
    );

    if (validOwned.length > 0 && analysis.dominance >= DOMINANCE_RATIO) {
      const ownObj = objects.find((o) => o.id === validOwned[0]);
      if (ownObj) {
        const pos = retreatPosition(ownObj.position, analysis.centroid, gridSize);
        useWorldStore.getState().updateObject(ownObj.id, {
          position: pos,
          audioParams: { ...ownObj.audioParams, frequency, waveform },
        });
        useWorldStore.getState().triggerObjectNote(ownObj.id);
        return;
      }
    }

    if (validOwned.length < MAX_OWN_OBJECTS_PER_AGENT) {
      const pos = counterpointPosition(analysis.centroid, gridSize);
      const planted = this.plantForAgent(agent, 'cylinder', pos);
      if (planted) {
        useWorldStore.getState().updateObject(planted.id, {
          audioParams: { ...planted.audioParams, frequency, waveform },
        });
      }
    }
  }

  /** E4.1.1: Perfil SOSTENER — pedal armónico grave de ataque y liberación largos. */
  private actSustain(
    agent: AgentInstanceConfig,
    _objects: SoundObject[],
    validOwned: string[],
    gridSize: number
  ): void {
    const droneFreq = 110;
    this.setAgentIntention(
      agent.id,
      `Voy a sostener un pedal armónico grave (${droneFreq} Hz) con envolvente lenta para cohesionar el ensamble.`
    );

    if (validOwned.length === 0) {
      const half = (gridSize || 20) * 0.25;
      const planted = this.plantForAgent(agent, 'sphere', [0, 0.8, -half]);
      if (planted) {
        useWorldStore.getState().updateObject(planted.id, {
          scale: [2.1, 2.1, 2.1],
          audioEnabled: true,
          audioParams: {
            ...planted.audioParams,
            frequency: droneFreq,
            waveform: 'sine',
            ampAttack: 1.2,
            ampRelease: 3.5,
            volume: 0.45,
          },
        });
      }
    } else {
      const ownId = validOwned[0];
      useWorldStore.getState().triggerObjectNote(ownId);
    }
  }

  /**
   * E4.1.1 + E4.1.4: Perfil PROVOCAR — usa `TrajectoryPredictor` para anticipar
   * hacia dónde se dirige la persona participante y prepara material inarmónico allí.
   */
  private actProvoke(
    agent: AgentInstanceConfig,
    objects: SoundObject[],
    validOwned: string[]
  ): void {
    const predictedPos = useAgentCompanionStore.getState().predictedListenerTarget;
    const sharpFreq = Math.round(520 + Math.random() * 980);

    this.setAgentIntention(
      agent.id,
      `Voy a anticipar tu trayectoria hacia [${predictedPos.join(', ')}] y provocar con un timbre metálico a ${sharpFreq} Hz.`
    );

    if (validOwned.length < MAX_OWN_OBJECTS_PER_AGENT) {
      const planted = this.plantForAgent(agent, 'icosahedron', predictedPos);
      if (planted) {
        useWorldStore.getState().updateObject(planted.id, {
          audioParams: {
            ...planted.audioParams,
            frequency: sharpFreq,
            harmonicity: 3.4,
            modulationIndex: 22,
          },
        });
        useWorldStore.getState().triggerObjectNote(planted.id);
      }
    } else {
      const ownId = validOwned[Math.floor(Math.random() * validOwned.length)];
      const existing = objects.find((o) => o.id === ownId);
      if (existing) {
        useWorldStore.getState().updateObject(ownId, {
          position: predictedPos,
          audioParams: { ...existing.audioParams, frequency: sharpFreq },
        });
        useWorldStore.getState().triggerObjectNote(ownId);
      }
    }
  }

  private plantForAgent(
    agent: AgentInstanceConfig,
    preferredType: SoundObjectType,
    position: [number, number, number]
  ): SoundObject | null {
    const state = useWorldStore.getState();
    if (!state.activeGridId) return null;

    const allowedPalette = PLANT_PALETTE.filter((t) => isObjectTypeAllowed(t));
    const chosenType = isObjectTypeAllowed(preferredType)
      ? preferredType
      : allowedPalette[0] ?? 'cube';

    const beforeIds = new Set(
      (state.grids.get(state.activeGridId)?.objects ?? []).map((o) => o.id)
    );

    state.addObject(chosenType, position);

    const afterObjs =
      useWorldStore.getState().grids.get(state.activeGridId)?.objects ?? [];
    const planted = afterObjs.find((o) => !beforeIds.has(o.id));
    if (planted) {
      this.updateOwnedIds(agent.id, [...agent.ownedObjectIds, planted.id]);
      return planted;
    }
    return null;
  }

  private updateOwnedIds(agentId: string, ownedIds: string[]): void {
    useAgentCompanionStore.setState((s) => ({
      agents: s.agents.map((a) =>
        a.id === agentId ? { ...a, ownedObjectIds: ownedIds } : a
      ),
    }));
  }

  /**
   * E4.3.4: Agente Director — analiza la densidad, duración y balance de la sala
   * y propone cambios de fase (E2.3) o de nivel pedagógico (N1–N4).
   */
  public evaluateDirectorProposal(): DirectorProposal | null {
    const worldState = useWorldStore.getState();
    const scoreState = useExpandedScoreStore.getState();
    const pedState = usePedagogyStore.getState();
    const allObjects = Array.from(worldState.grids.values()).flatMap((g) => g.objects);

    let proposal: DirectorProposal | null = null;

    if (allObjects.length >= 6 && scoreState.currentPhase === 'experimentation') {
      proposal = {
        id: `dir-${Date.now()}`,
        timestampIso: new Date().toISOString(),
        rationale:
          'La sala ya cuenta con 6+ objetos activos y textura estable; el Agente Director sugiere avanzar a la fase de Consolidación.',
        suggestedPhase: 'consolidation',
        applied: false,
      };
    } else if (allObjects.length >= 12 && scoreState.currentPhase === 'consolidation') {
      proposal = {
        id: `dir-${Date.now()}`,
        timestampIso: new Date().toISOString(),
        rationale:
          'Alta densidad polifónica detectada (12+ objetos); el Agente Director propone transitar a Producción / Desarrollo.',
        suggestedPhase: 'production',
        applied: false,
      };
    } else if (allObjects.length >= 4 && pedState.level === 1) {
      proposal = {
        id: `dir-${Date.now()}`,
        timestampIso: new Date().toISOString(),
        rationale:
          'Dominio del timbre base verificado; el Agente Director sugiere desbloquear el Nivel 2 (Espacio y Movimiento).',
        suggestedLevel: 2,
        applied: false,
      };
    }

    if (proposal) {
      useAgentCompanionStore.setState((prev) => {
        if (
          prev.directorProposals.length > 0 &&
          prev.directorProposals[0].rationale === proposal!.rationale
        ) {
          return prev;
        }
        return {
          directorProposals: [proposal!, ...prev.directorProposals].slice(0, 8),
        };
      });
    }

    return proposal;
  }
}

export function applyDirectorProposal(proposalId: string): void {
  const st = useAgentCompanionStore.getState();
  const prop = st.directorProposals.find((p) => p.id === proposalId);
  if (!prop) return;

  if (prop.suggestedPhase) {
    setManualSessionPhase(prop.suggestedPhase);
  }
  if (prop.suggestedLevel) {
    usePedagogyStore.getState().setLevel(prop.suggestedLevel);
  }

  useAgentCompanionStore.setState((prev) => ({
    directorProposals: prev.directorProposals.map((p) =>
      p.id === proposalId ? { ...p, applied: true } : p
    ),
  }));

  recordSessionEvent({
    type: 'marker',
    entityType: 'session',
    entityId: proposalId,
    notes: `Propuesta del Agente Director aplicada: ${prop.rationale}`,
  });
}

/**
 * E4.3.5: Captura la sesión actual en el comparador Con Agente vs. Sin Agente
 * usando las métricas musicológicas de E1.3.
 */
export function captureComparativeSessionSnapshot(
  condition: 'with_agent' | 'without_agent',
  customLabel?: string
): ComparativeSessionEntry {
  const recState = useSessionRecorderStore.getState();
  const report = analyzeSessionMusicology();

  const entry: ComparativeSessionEntry = {
    id: `comp-${Date.now()}`,
    label:
      customLabel?.trim() ||
      (condition === 'with_agent' ? 'Sesión con Agente Coproductor' : 'Sesión solo Humanos (Control)'),
    condition,
    recordedAtIso: new Date().toISOString(),
    eventCount: recState.events.length,
    humanRatio: report.agency.humanSharePct / 100,
    agentRatio: report.agency.algorithmicSharePct / 100,
    pitchSystem: report.pitchSystem.classification,
    rhythmicPeriodicityIndex: report.rhythm.periodicityIndex,
    meanDensity: report.meanDensityObjects,
    meanSpectralCentroidHz: report.timbre.meanSpectralCentroidHz,
  };

  useAgentCompanionStore.setState((prev) => ({
    comparativeRuns: [...prev.comparativeRuns, entry],
  }));

  return entry;
}

export function exportComparativeAgencyReportJson(): void {
  const runs = useAgentCompanionStore.getState().comparativeRuns;
  const payload = {
    format: 'solomon-house/comparative-agency-e4',
    exportedAt: new Date().toISOString(),
    runs,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `comparativa-con-sin-agente-e4-${payload.exportedAt.slice(0, 19).replace(/[:T]/g, '-')}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Instancia única del jardinero y coordinador de agentes para toda la aplicación. */
export const sonicGardener = new SonicGardener();
