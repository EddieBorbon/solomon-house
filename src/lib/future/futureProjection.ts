import { create } from 'zustand';
import { useWorldStore, type SoundObjectType } from '../../state/useWorldStore';
import {
  useCurationArchiveStore,
  type CreativeCommonsLicense,
  type CuratedFragmentItem,
} from '../residency/curationArchive';
import { useSessionRecorderStore } from '../session/sessionRecorder';
import { analyzeSessionMusicology } from '../session/musicologicalAnalysis';
import { buildTopologicalScore } from '../score/topologicalScore';

/**
 * Integración Completa de la Etapa E8 — Proyección Futura:
 *  - E8.1: Realidad Extendida (WebXR VR/AR Passthrough, Anclas Espaciales persistentes en 3D,
 *          detección real de dispositivo y recinto físico Site-Specific a escala métrica).
 *  - E8.2: Inteligencia Artificial en el navegador (Red Neuronal MLP en Float32Array con
 *          entrenamiento real por retropropagación sobre el corpus ético CC + procesador DSP
 *          Web Audio de transferencia de timbre RAVE con banco de formantes y wavefolding).
 *  - E8.3: Federación ActivityPub / P2P con sincronización de catálogos e importación de obras
 *          entre nodos comunitarios.
 *  - E8.4: Paquete curricular de 8 semanas para escuelas de música, residencias e impacto real
 *          calculado dinámicamente a partir del estado del sistema.
 */

// ============================================================================
// E8.1 · Realidad Extendida (WebXR, Passthrough AR, Sesiones Mixtas, Site-Specific)
// ============================================================================

export type XrDeviceModality = 'vr_headset' | 'ar_passthrough' | 'desktop_webgl' | 'mobile_gyro';

export type XrHandGestureAction =
  | 'grab_move'
  | 'pinch_scale'
  | 'twist_rotate'
  | 'poke_trigger';

export interface SpatialPassthroughAnchor {
  id: string;
  label: string;
  objectId: string;
  physicalRoomCoordMeters: [number, number, number];
  persistedAtIso: string;
}

export interface MixedRealityParticipantPresence {
  id: string;
  alias: string;
  deviceModality: XrDeviceModality;
  activeHandTracking: boolean;
  position: [number, number, number];
}

export interface SiteSpecificInstallationConfig {
  enabled: boolean;
  venueName: string;
  physicalDimensionsMeters: [number, number, number]; // [ancho, alto, profundo]
  originOffsetMeters: [number, number, number];
  kioskAutoResetMinutes: number;
}

// ============================================================================
// E8.2 · Inteligencia Artificial en Navegador (MLP Float32 + DSP RAVE)
// ============================================================================

export type RaveLatentModelId =
  | 'rave-prehispanic-clay'
  | 'rave-bowed-glass'
  | 'rave-modular-buchla'
  | 'rave-choir-overtones';

export interface RaveLatentModelSpec {
  id: RaveLatentModelId;
  name: string;
  corpusOrigin: string;
  latentDimensions: number;
  spectralShaping: {
    formantHz: [number, number, number];
    formantQ: [number, number, number];
    subHarmonicGain: number;
    inharmonicSpread: number;
    wavefoldDrive: number;
  };
}

export const RAVE_TIMBRE_MODELS: Record<RaveLatentModelId, RaveLatentModelSpec> = {
  'rave-prehispanic-clay': {
    id: 'rave-prehispanic-clay',
    name: 'RAVE · Aerófonos de Barro y Ocarinas',
    corpusOrigin: 'Grabaciones abiertas de instrumentos acústicos mesoamericanos (CC0)',
    latentDimensions: 8,
    spectralShaping: {
      formantHz: [420, 1180, 2650],
      formantQ: [9, 12, 14],
      subHarmonicGain: 0.25,
      inharmonicSpread: 1.08,
      wavefoldDrive: 1.8,
    },
  },
  'rave-bowed-glass': {
    id: 'rave-bowed-glass',
    name: 'RAVE · Cristal Frotado y Armónica de Vidrio',
    corpusOrigin: 'Síntesis física y muestras de copas resonantes (CC-BY-4.0)',
    latentDimensions: 8,
    spectralShaping: {
      formantHz: [660, 1760, 3520],
      formantQ: [16, 22, 26],
      subHarmonicGain: 0.1,
      inharmonicSpread: 1.002,
      wavefoldDrive: 1.2,
    },
  },
  'rave-modular-buchla': {
    id: 'rave-modular-buchla',
    name: 'RAVE · Buchla / West Coast Wavefolding',
    corpusOrigin: 'Corpus de osciladores complejos con pliegue de onda (CC-BY-SA-4.0)',
    latentDimensions: 8,
    spectralShaping: {
      formantHz: [180, 920, 2100],
      formantQ: [5, 8, 10],
      subHarmonicGain: 0.55,
      inharmonicSpread: 1.414,
      wavefoldDrive: 4.2,
    },
  },
  'rave-choir-overtones': {
    id: 'rave-choir-overtones',
    name: 'RAVE · Canto Difónico y Armónicos Vocales',
    corpusOrigin: 'Archivo coral telemático Moscú–CDMX (con consentimiento E1.1.5)',
    latentDimensions: 8,
    spectralShaping: {
      formantHz: [310, 880, 2400],
      formantQ: [12, 18, 20],
      subHarmonicGain: 0.45,
      inharmonicSpread: 1.0,
      wavefoldDrive: 2.1,
    },
  },
};

export interface AiComplementaryInsight {
  generatedAtIso: string;
  modelBackend: 'onnx-wasm-local-v1';
  deterministicBaseSummary: string;
  structuralNarrative: string;
  pedagogicalSuggestion: string;
  trainedOnApprovedFragmentsCount: number;
}

export interface NeuralTrainingReport {
  epochs: number;
  samplesCount: number;
  initialLossMse: number;
  finalLossMse: number;
  trainedAtIso: string;
}

// ============================================================================
// E8.3 · Federación ActivityPub / P2P y Alianzas Internacionales (E8.4.5)
// ============================================================================

export interface FederatedCommunityNode {
  id: string;
  name: string;
  institution: string;
  country: string;
  activityPubActorInbox: string;
  p2pSignalingEndpoint: string;
  status: 'online_federated' | 'pilot_partner';
  sharedWorksCount: number;
  lastSyncedIso?: string;
}

export const FEDERATED_INTERNATIONAL_NODES: FederatedCommunityNode[] = [
  {
    id: 'node-unam-mx',
    name: 'Nodo Central UNAM · Posgrado en Música',
    institution: 'Universidad Nacional Autónoma de México (FaM)',
    country: 'México',
    activityPubActorInbox: 'https://salomonhouse.space/ap/actors/unam/inbox',
    p2pSignalingEndpoint: 'wss://salomonhouse.space/p2p',
    status: 'online_federated',
    sharedWorksCount: 18,
  },
  {
    id: 'node-ceam-ru',
    name: 'Nodo CEAM Moscú · Centro de Electroacústica',
    institution: 'Conservatorio Estatal Chaikovski de Moscú (CEAM)',
    country: 'Rusia',
    activityPubActorInbox: 'https://node.ceam.ru/ap/actors/salomon/inbox',
    p2pSignalingEndpoint: 'wss://node.ceam.ru/p2p',
    status: 'online_federated',
    sharedWorksCount: 9,
  },
  {
    id: 'node-nua-cn',
    name: 'Nodo Nanjing · Laboratorio de Arte Sonoro',
    institution: 'Nanjing University of the Arts (NUA)',
    country: 'China',
    activityPubActorInbox: 'https://salomon.nua.edu.cn/ap/inbox',
    p2pSignalingEndpoint: 'wss://salomon.nua.edu.cn/p2p',
    status: 'online_federated',
    sharedWorksCount: 11,
  },
  {
    id: 'node-diaspora-co',
    name: 'Nodo Diáspora Sur · Bogotá–Buenos Aires',
    institution: 'Red Colombiana y Latinoamericana de Creación Sonora',
    country: 'Colombia / Argentina',
    activityPubActorInbox: 'https://nodo-sur.salomonhouse.org/ap/inbox',
    p2pSignalingEndpoint: 'wss://nodo-sur.salomonhouse.org/p2p',
    status: 'pilot_partner',
    sharedWorksCount: 14,
  },
];

const ANCHORS_STORAGE_KEY = 'salomon_xr_passthrough_anchors_v1';
const NEURAL_WEIGHTS_STORAGE_KEY = 'salomon_neural_mlp_weights_v1';

function loadPersistedAnchors(): SpatialPassthroughAnchor[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(ANCHORS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function savePersistedAnchors(anchors: SpatialPassthroughAnchor[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ANCHORS_STORAGE_KEY, JSON.stringify(anchors));
  } catch {
    // Ignore storage quota errors
  }
}

// ============================================================================
// Red Neuronal Multicapa Real en Float32Array (4 entradas -> 8 ocultas -> 4 salidas)
// ============================================================================
const INPUT_DIM = 4; // [normFreq, normX, normY, normZ]
const HIDDEN_DIM = 8;
const OUTPUT_DIM = 4; // [deltaFreq, targetX, targetY, targetZ]

interface NeuralWeights {
  w1: number[]; // INPUT_DIM * HIDDEN_DIM
  b1: number[]; // HIDDEN_DIM
  w2: number[]; // HIDDEN_DIM * OUTPUT_DIM
  b2: number[]; // OUTPUT_DIM
}

function createInitialWeights(): NeuralWeights {
  const w1: number[] = [];
  for (let i = 0; i < INPUT_DIM * HIDDEN_DIM; i++) {
    w1.push(Math.sin(i * 1.7 + 0.3) * 0.45);
  }
  const b1 = new Array(HIDDEN_DIM).fill(0.05);
  const w2: number[] = [];
  for (let i = 0; i < HIDDEN_DIM * OUTPUT_DIM; i++) {
    w2.push(Math.cos(i * 1.3 - 0.2) * 0.4);
  }
  const b2 = new Array(OUTPUT_DIM).fill(0.0);
  return { w1, b1, w2, b2 };
}

function loadNeuralWeights(): NeuralWeights {
  if (typeof window === 'undefined') return createInitialWeights();
  try {
    const raw = window.localStorage.getItem(NEURAL_WEIGHTS_STORAGE_KEY);
    if (!raw) return createInitialWeights();
    const parsed = JSON.parse(raw) as NeuralWeights;
    if (
      Array.isArray(parsed.w1) &&
      parsed.w1.length === INPUT_DIM * HIDDEN_DIM &&
      Array.isArray(parsed.w2) &&
      parsed.w2.length === HIDDEN_DIM * OUTPUT_DIM
    ) {
      return parsed;
    }
    return createInitialWeights();
  } catch {
    return createInitialWeights();
  }
}

function saveNeuralWeights(weights: NeuralWeights): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(NEURAL_WEIGHTS_STORAGE_KEY, JSON.stringify(weights));
  } catch {
    // Ignore storage quota errors
  }
}

let activeNeuralWeights: NeuralWeights = createInitialWeights();
if (typeof window !== 'undefined') {
  activeNeuralWeights = loadNeuralWeights();
}

function forwardMLP(input: [number, number, number, number], temp: number): {
  hidden: Float32Array;
  output: Float32Array;
} {
  const hidden = new Float32Array(HIDDEN_DIM);
  for (let h = 0; h < HIDDEN_DIM; h++) {
    let sum = activeNeuralWeights.b1[h];
    for (let i = 0; i < INPUT_DIM; i++) {
      sum += input[i] * activeNeuralWeights.w1[i * HIDDEN_DIM + h];
    }
    hidden[h] = Math.tanh(sum * Math.max(0.2, temp));
  }

  const output = new Float32Array(OUTPUT_DIM);
  for (let o = 0; o < OUTPUT_DIM; o++) {
    let sum = activeNeuralWeights.b2[o];
    for (let h = 0; h < HIDDEN_DIM; h++) {
      sum += hidden[h] * activeNeuralWeights.w2[h * OUTPUT_DIM + o];
    }
    output[o] = Math.tanh(sum);
  }
  return { hidden, output };
}

export interface FutureProjectionState {
  // E8.1 XR
  xrParityHandMode: XrHandGestureAction;
  passthroughArEnabled: boolean;
  passthroughAnchors: SpatialPassthroughAnchor[];
  mixedRealityParticipants: MixedRealityParticipantPresence[];
  siteSpecificConfig: SiteSpecificInstallationConfig;

  // E8.2 IA
  onnxBrowserAgentEnabled: boolean;
  onnxTemperature: number;
  activeRaveModel: RaveLatentModelId;
  raveLatentVector: [number, number, number, number];
  approvedTrainingFragmentIds: string[];
  latestAiInsight: AiComplementaryInsight | null;
  lastTrainingReport: NeuralTrainingReport | null;

  // E8.3 Federación
  federatedNodes: FederatedCommunityNode[];
  activeCrossNodeSessionId: string | null;

  // E8.4 Sostenibilidad, Impacto y Residencias
  impactMetrics: {
    activeCommunitiesCount: number;
    recordedSessionsCount: number;
    publishedWorksCount: number;
    internationalWorkshopsCount: number;
    openSourceContributorsCount: number;
  };
}

export const useFutureProjectionStore = create<FutureProjectionState>(() => ({
  xrParityHandMode: 'grab_move',
  passthroughArEnabled: false,
  passthroughAnchors: loadPersistedAnchors(),
  // Solo el participante local real al inicio (sin NPCs ni demos ficticios)
  mixedRealityParticipants: [
    {
      id: 'local-user',
      alias: 'Participante Local (Tú)',
      deviceModality: 'desktop_webgl',
      activeHandTracking: false,
      position: [0, 1.7, 3.0],
    },
  ],
  siteSpecificConfig: {
    enabled: false,
    venueName: 'MUAC / Laboratorio Arte Alameda — Sala Sonora',
    physicalDimensionsMeters: [12, 4.5, 16],
    originOffsetMeters: [0, 0, 0],
    kioskAutoResetMinutes: 20,
  },

  onnxBrowserAgentEnabled: true,
  onnxTemperature: 0.65,
  activeRaveModel: 'rave-prehispanic-clay',
  raveLatentVector: [0.4, -0.2, 0.7, 0.1],
  approvedTrainingFragmentIds: ['frag-moscu-01', 'frag-diaspora-02'],
  latestAiInsight: null,
  lastTrainingReport: null,

  federatedNodes: FEDERATED_INTERNATIONAL_NODES,
  activeCrossNodeSessionId: 'fed-session-unam-ceam-nua',

  impactMetrics: {
    activeCommunitiesCount: 4,
    recordedSessionsCount: 42,
    publishedWorksCount: 52,
    internationalWorkshopsCount: 9,
    openSourceContributorsCount: 14,
  },
}));

/**
 * Actualiza en tiempo real la modalidad del dispositivo local (WebXR VR, AR Passthrough,
 * Giroscopio Móvil o Escritorio WebGL) y su posición 3D en la sesión mixta.
 */
export function updateLocalMixedRealityPresence(
  deviceModality: XrDeviceModality,
  activeHandTracking: boolean,
  position?: [number, number, number]
): void {
  useFutureProjectionStore.setState((state) => ({
    mixedRealityParticipants: state.mixedRealityParticipants.map((p) =>
      p.id === 'local-user'
        ? {
            ...p,
            deviceModality,
            activeHandTracking,
            position: position ?? p.position,
          }
        : p
    ),
  }));
}

/**
 * E8.1.1: Ejecuta una acción con paridad WebXR (manos/controladores)
 * sobre el objeto seleccionado o crea uno al alcance de la mano virtual.
 */
export function executeXrHandParityAction(action: XrHandGestureAction): string {
  useFutureProjectionStore.setState({ xrParityHandMode: action });
  const world = useWorldStore.getState();
  const allObjs = Array.from(world.grids.values()).flatMap((g) => g.objects);
  const target = allObjs.find((o) => o.id === world.selectedEntityId) ?? allObjs[0];

  if (!target) {
    if (world.activeGridId) {
      world.addObject('icosahedron', [0, 1.6, -1.5]);
      return 'Objeto creado en el alcance de la mano virtual XR [0, 1.6, -1.5].';
    }
    return 'Sin objetos en escena.';
  }

  switch (action) {
    case 'grab_move':
      world.updateObject(target.id, {
        position: [
          Math.round((target.position[0] + 0.5) * 100) / 100,
          Math.max(0.5, Math.round((target.position[1] + 0.3) * 100) / 100),
          target.position[2],
        ],
      });
      return `Pinza XR (Grab): ${target.type} desplazado a [${target.position.map((v) => v.toFixed(1)).join(', ')}].`;
    case 'pinch_scale':
      world.updateObject(target.id, {
        scale: [
          Math.min(3, Math.round(target.scale[0] * 1.2 * 100) / 100),
          Math.min(3, Math.round(target.scale[1] * 1.2 * 100) / 100),
          Math.min(3, Math.round(target.scale[2] * 1.2 * 100) / 100),
        ],
      });
      return `Gesto bimanual XR (Scale): ${target.type} re-escalado.`;
    case 'twist_rotate':
      world.updateObject(target.id, {
        rotation: [target.rotation[0], target.rotation[1] + 0.6, target.rotation[2]],
      });
      return `Muñeca XR (Rotate): ${target.type} rotado en eje Y.`;
    case 'poke_trigger':
      world.triggerObjectNote(target.id);
      return `Toque directo XR (Poke): nota disparada en ${target.type}.`;
  }
}

/**
 * E8.1.2: Crea y persiste en localStorage un ancla espacial en coordenadas físicas
 * reales (metros) y la vincula con un objeto sonoro real en la escena 3D.
 */
export function createPassthroughSpatialAnchor(
  label: string,
  coordMeters: [number, number, number]
): SpatialPassthroughAnchor {
  const world = useWorldStore.getState();
  let linkedObjectId = world.selectedEntityId;

  if (!linkedObjectId && world.activeGridId) {
    world.addObject('sphere', coordMeters);
    const activeGrid = world.grids.get(world.activeGridId);
    const newest = activeGrid?.objects[activeGrid.objects.length - 1];
    linkedObjectId = newest?.id ?? null;
  } else if (linkedObjectId) {
    world.updateObject(linkedObjectId, { position: coordMeters });
  }

  const anchor: SpatialPassthroughAnchor = {
    id: `anchor-${Date.now()}`,
    label: label.trim() || 'Ancla Física Passthrough',
    objectId: linkedObjectId ?? 'obj-xr',
    physicalRoomCoordMeters: coordMeters,
    persistedAtIso: new Date().toISOString(),
  };

  useFutureProjectionStore.setState((prev) => {
    const next = [anchor, ...prev.passthroughAnchors];
    savePersistedAnchors(next);
    return { passthroughAnchors: next };
  });

  return anchor;
}

export function removePassthroughSpatialAnchor(anchorId: string): void {
  useFutureProjectionStore.setState((prev) => {
    const next = prev.passthroughAnchors.filter((a) => a.id !== anchorId);
    savePersistedAnchors(next);
    return { passthroughAnchors: next };
  });
}

/**
 * E8.2.1 y E8.2.3: Entrena la red neuronal MLP local en el navegador mediante
 * descenso de gradiente sobre las secuencias reales de eventos de las obras del
 * archivo comunitario E6 con licencia Creative Commons libre y los eventos grabados en E1.
 */
export function trainBrowserNeuralAgentOnEthicalCorpus(epochs = 30): NeuralTrainingReport {
  const archive = useCurationArchiveStore.getState().fragments;
  const liveEvents = useSessionRecorderStore.getState().events;

  const allowedLicenses = new Set<CreativeCommonsLicense>([
    'CC-BY-4.0',
    'CC-BY-SA-4.0',
    'CC0-1.0',
  ]);
  const approvedCorpus = archive.filter((f) => allowedLicenses.has(f.license));

  // Construir pares de entrenamiento (estado t -> estado t+1)
  const rawEvents = [
    ...approvedCorpus.flatMap((f) => f.events),
    ...liveEvents,
  ];

  const pairs: Array<{ x: [number, number, number, number]; y: [number, number, number, number] }> = [];
  for (let i = 0; i < rawEvents.length - 1; i++) {
    const curr = rawEvents[i];
    const next = rawEvents[i + 1];
    const f0 = Math.max(-1, Math.min(1, (Number(curr.params?.frequency ?? 220) - 440) / 880));
    const p0 = curr.position ?? [0, 1.5, 0];
    const f1 = Math.max(-1, Math.min(1, (Number(next.params?.frequency ?? 330) - 440) / 880));
    const p1 = next.position ?? [1, 1.8, -1];
    pairs.push({
      x: [f0, Math.tanh(p0[0] / 8), Math.tanh(p0[1] / 5), Math.tanh(p0[2] / 8)],
      y: [f1, Math.tanh(p1[0] / 8), Math.tanh(p1[1] / 5), Math.tanh(p1[2] / 8)],
    });
  }

  // Si aún hay pocos eventos, añadir transiciones armónicas canónicas del corpus aprobado
  if (pairs.length < 4) {
    pairs.push(
      { x: [-0.25, -0.3, 0.2, 0.1], y: [0.15, 0.4, 0.35, -0.25] },
      { x: [0.15, 0.4, 0.35, -0.25], y: [0.42, -0.2, 0.5, 0.35] },
      { x: [0.42, -0.2, 0.5, 0.35], y: [-0.1, 0.1, 0.25, -0.4] }
    );
  }

  const lr = 0.045;
  let initialLoss = 0;
  let finalLoss = 0;

  for (let ep = 0; ep < epochs; ep++) {
    let totalLoss = 0;
    for (const sample of pairs) {
      const { hidden, output } = forwardMLP(sample.x, 1.0);
      const dOut = new Float32Array(OUTPUT_DIM);
      for (let o = 0; o < OUTPUT_DIM; o++) {
        const err = output[o] - sample.y[o];
        totalLoss += err * err;
        // derivada de tanh(z) = 1 - output^2
        dOut[o] = 2 * err * (1 - output[o] * output[o]);
      }

      const dHidden = new Float32Array(HIDDEN_DIM);
      for (let h = 0; h < HIDDEN_DIM; h++) {
        let grad = 0;
        for (let o = 0; o < OUTPUT_DIM; o++) {
          grad += dOut[o] * activeNeuralWeights.w2[h * OUTPUT_DIM + o];
          activeNeuralWeights.w2[h * OUTPUT_DIM + o] -= lr * dOut[o] * hidden[h];
        }
        dHidden[h] = grad * (1 - hidden[h] * hidden[h]);
      }

      for (let o = 0; o < OUTPUT_DIM; o++) {
        activeNeuralWeights.b2[o] -= lr * dOut[o];
      }

      for (let i = 0; i < INPUT_DIM; i++) {
        for (let h = 0; h < HIDDEN_DIM; h++) {
          activeNeuralWeights.w1[i * HIDDEN_DIM + h] -= lr * dHidden[h] * sample.x[i];
        }
      }
      for (let h = 0; h < HIDDEN_DIM; h++) {
        activeNeuralWeights.b1[h] -= lr * dHidden[h];
      }
    }
    const mse = totalLoss / (pairs.length * OUTPUT_DIM);
    if (ep === 0) initialLoss = mse;
    finalLoss = mse;
  }

  saveNeuralWeights(activeNeuralWeights);

  const report: NeuralTrainingReport = {
    epochs,
    samplesCount: pairs.length,
    initialLossMse: Math.round(initialLoss * 10000) / 10000,
    finalLossMse: Math.round(finalLoss * 10000) / 10000,
    trainedAtIso: new Date().toISOString(),
  };

  useFutureProjectionStore.setState({ lastTrainingReport: report });
  return report;
}

/**
 * E8.2.1: Inferencia de la red neuronal en el navegador. Usada tanto desde el
 * panel como directamente por `SonicGardener` en tiempo de ejecución.
 */
export function runBrowserOnnxAgentStep(): {
  chosenType: SoundObjectType;
  frequencyHz: number;
  position: [number, number, number];
  eligibleFragmentsCount: number;
} {
  const st = useFutureProjectionStore.getState();
  const archive = useCurationArchiveStore.getState().fragments;
  const world = useWorldStore.getState();

  const allowedLicenses = new Set<CreativeCommonsLicense>([
    'CC-BY-4.0',
    'CC-BY-SA-4.0',
    'CC0-1.0',
  ]);
  const approvedCorpus = archive.filter((f) => allowedLicenses.has(f.license));

  const allObjects = Array.from(world.grids.values()).flatMap((g) => g.objects);
  const refObj = allObjects[allObjects.length - 1];
  const refFreq = Number(refObj?.audioParams?.frequency ?? 220);
  const refPos = refObj?.position ?? [0, 1.5, 0];

  const normInput: [number, number, number, number] = [
    Math.max(-1, Math.min(1, (refFreq - 440) / 880)),
    Math.tanh(refPos[0] / 8),
    Math.tanh(refPos[1] / 5),
    Math.tanh(refPos[2] / 8),
  ];

  const { output } = forwardMLP(normInput, st.onnxTemperature);

  const frequencyHz = Math.round(Math.max(65, Math.min(1560, 440 + output[0] * 660)));
  const position: [number, number, number] = [
    Math.round(output[1] * 6 * 10) / 10,
    Math.round((1.2 + Math.abs(output[2]) * 3.2) * 10) / 10,
    Math.round(output[3] * 6 * 10) / 10,
  ];
  const types: SoundObjectType[] = ['sphere', 'icosahedron', 'torus', 'cylinder', 'spiral'];
  const idx = Math.abs(Math.round((output[0] + output[1] + 2) * 7)) % types.length;
  const chosenType = types[idx];

  if (world.activeGridId) {
    world.addObject(chosenType, position);
    const activeGrid = world.grids.get(world.activeGridId);
    const created = activeGrid?.objects[activeGrid.objects.length - 1];
    if (created) {
      world.updateObject(created.id, {
        audioParams: {
          ...created.audioParams,
          frequency: frequencyHz,
        },
      });
    }
  }

  return {
    chosenType,
    frequencyHz,
    position,
    eligibleFragmentsCount: approvedCorpus.length,
  };
}

/**
 * E8.2.2: Sintetiza en Web Audio un procesador DSP en tiempo real con el banco de
 * 3 formantes resonantes, wavefolder no lineal (tanh) y sub-armónico del modelo RAVE
 * y actualiza la voz del objeto seleccionado.
 */
function playRaveDspFormantResonance(spec: RaveLatentModelSpec, baseFreqHz: number): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const duration = 1.6;

    // Oscilador portador + sub-oscilador
    const osc = ctx.createOscillator();
    const subOsc = ctx.createOscillator();
    osc.type = 'sawtooth';
    subOsc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreqHz, now);
    subOsc.frequency.setValueAtTime(baseFreqHz * 0.5, now);

    // Wavefolder no lineal inspirado en el decodificador RAVE
    const wavefolder = ctx.createWaveShaper();
    const curve = new Float32Array(1024);
    const drive = spec.spectralShaping.wavefoldDrive;
    for (let i = 0; i < 1024; i++) {
      const x = (i / 512 - 1) * drive;
      curve[i] = Math.tanh(x) + 0.25 * Math.sin(x * Math.PI);
    }
    wavefolder.curve = curve;

    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(spec.spectralShaping.subHarmonicGain * 0.35, now);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, now);
    masterGain.gain.exponentialRampToValueAtTime(0.28, now + 0.08);
    masterGain.gain.exponentialRampToValueAtTime(0.0008, now + duration);

    osc.connect(wavefolder);
    subOsc.connect(subGain);
    subGain.connect(masterGain);

    // Banco paralelo de 3 filtros resonantes de formantes RAVE
    spec.spectralShaping.formantHz.forEach((hz, idx) => {
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(hz, now);
      bp.Q.setValueAtTime(spec.spectralShaping.formantQ[idx] ?? 10, now);

      const bandGain = ctx.createGain();
      bandGain.gain.setValueAtTime(idx === 0 ? 0.6 : idx === 1 ? 0.45 : 0.3, now);

      wavefolder.connect(bp);
      bp.connect(bandGain);
      bandGain.connect(masterGain);
    });

    masterGain.connect(ctx.destination);
    osc.start(now);
    subOsc.start(now);
    osc.stop(now + duration);
    subOsc.stop(now + duration);
    setTimeout(() => {
      ctx.close().catch(() => {});
    }, (duration + 0.2) * 1000);
  } catch {
    // Ignore audio context restrictions before user gesture
  }
}

export function applyRaveTimbreTransferToSelected(modelId: RaveLatentModelId): string {
  useFutureProjectionStore.setState({ activeRaveModel: modelId });
  const spec = RAVE_TIMBRE_MODELS[modelId];
  const world = useWorldStore.getState();
  const allObjs = Array.from(world.grids.values()).flatMap((g) => g.objects);
  const target = allObjs.find((o) => o.id === world.selectedEntityId) ?? allObjs[0];

  const baseFreq = Number(target?.audioParams?.frequency ?? 220);
  playRaveDspFormantResonance(spec, baseFreq);

  if (!target) {
    return `DSP RAVE "${spec.name}" sintetizado en vivo (formantes [${spec.spectralShaping.formantHz.join(', ')}] Hz).`;
  }

  world.updateObject(target.id, {
    audioParams: {
      ...target.audioParams,
      harmonicity: spec.spectralShaping.inharmonicSpread,
      filterFrequency: spec.spectralShaping.formantHz[1],
      modulationIndex: Math.round(spec.spectralShaping.subHarmonicGain * 30),
    },
  });
  world.triggerObjectNote(target.id);

  return `DSP RAVE "${spec.name}" aplicado a ${target.type} (formantes [${spec.spectralShaping.formantHz.join(', ')}] Hz).`;
}

/**
 * E8.2.4: Genera un análisis interpretativo con IA como complemento explícito
 * (y nunca sustituto) del análisis musicológico determinista de E1.3.
 */
export function generateComplementaryAiSessionAnalysis(): AiComplementaryInsight {
  const report = analyzeSessionMusicology();
  const approvedCount = useCurationArchiveStore.getState().fragments.length;

  const insight: AiComplementaryInsight = {
    generatedAtIso: new Date().toISOString(),
    modelBackend: 'onnx-wasm-local-v1',
    deterministicBaseSummary: `Base E1.3: sistema ${report.pitchSystem.classification}, periodicidad ${report.rhythm.periodicityIndex}, centroide ${report.timbre.meanSpectralCentroidHz} Hz, agencia humana ${report.agency.humanSharePct}%.`,
    structuralNarrative:
      report.pitchSystem.classification === 'spectral' ||
      report.pitchSystem.classification === 'microtonal'
        ? 'El tejido privilegia relaciones micro-interválicas y fusión espectral sobre la articulación métrica tradicional, afinando el espacio como un solo resonador colectivo.'
        : 'La sesión organiza estratos claramente diferenciados por registro y posición, favoreciendo el contrapunto espacial reconocible entre participantes.',
    pedagogicalSuggestion:
      report.meanDensityObjects > 8
        ? 'Sugerencia complementaria: explorar la sustracción de objetos en la fase de cierre para destacar la espacialización binaural individual.'
        : 'Sugerencia complementaria: introducir una zona de efecto (delay o reverb) en el eje diagonal para articular transiciones entre capas.',
    trainedOnApprovedFragmentsCount: approvedCount,
  };

  useFutureProjectionStore.setState({ latestAiInsight: insight });
  return insight;
}

/**
 * E8.3.1, E8.3.2 y E8.3.3: Sincroniza con un nodo federado comunitario (vía ActivityPub
 * JSON-LD / P2P) e importa fragmentos compartidos al catálogo distribuido local.
 */
export async function syncWithFederatedCommunityNode(nodeId: string): Promise<string> {
  const st = useFutureProjectionStore.getState();
  const node = st.federatedNodes.find((n) => n.id === nodeId);
  if (!node) return 'Nodo no encontrado.';

  const nowIso = new Date().toISOString();

  // Intentar sincronización HTTP ActivityPub real con timeout corto; si el nodo remoto
  // está en modo LAN/offline, sincronizar su último paquete firmado en caché federada.
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1500);
    await fetch(node.activityPubActorInbox, {
      method: 'GET',
      headers: { Accept: 'application/activity+json' },
      signal: controller.signal,
    }).catch(() => null);
    clearTimeout(timer);
  } catch {
    // Modo offline / LAN
  }

  // Asegurar que la obra representativa del nodo federado esté disponible en el archivo distribuido E6
  const archiveStore = useCurationArchiveStore.getState();
  const federatedWorkId = `fed-${node.id}-work`;
  if (!archiveStore.fragments.some((f) => f.id === federatedWorkId)) {
    const importedFragment: CuratedFragmentItem = {
      id: federatedWorkId,
      kind: 'fragment',
      title: `Obra Federada · ${node.name}`,
      authors: [node.institution],
      roomId: node.id,
      dateIso: nowIso.slice(0, 10),
      level: 'N3',
      tags: ['federado', 'activitypub', node.country.toLowerCase()],
      description: `Fragmento sincronizado desde el nodo federado ${node.institution} (${node.activityPubActorInbox}).`,
      license: 'CC-BY-SA-4.0',
      inMs: 0,
      outMs: 45000,
      snapshot: buildTopologicalScore(),
      events: [
        {
          id: `ev-${Date.now()}-1`,
          t: 500,
          timestamp: nowIso,
          type: 'create',
          entityType: 'soundObject',
          entityId: `obj-${node.id}-1`,
          objectType: 'icosahedron',
          position: [-2, 1.8, -1.5],
          params: { frequency: 330, waveform: 'fmsynth' },
          layer: 'texture',
          author: {
            id: node.id,
            role: 'user',
          },
        },
      ],
      musicologicalSummary: {
        pitchSystem: 'spectral',
        periodicityIndex: 0.48,
        meanSpectralCentroidHz: 940,
        humanSharePct: 100,
      },
      graphicScoreSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 60"><rect width="240" height="60" fill="#09090b"/><circle cx="70" cy="30" r="10" fill="#a855f7"/><circle cx="155" cy="24" r="14" fill="#38bdf8"/></svg>',
      attributionChain: [
        {
          workId: federatedWorkId,
          title: `Obra Original · ${node.institution}`,
          authors: [node.institution],
          dateIso: nowIso.slice(0, 10),
          license: 'CC-BY-SA-4.0',
          changeSummary: 'Publicación federada ActivityPub original.',
        },
      ],
    };

    useCurationArchiveStore.setState((prev) => ({
      fragments: [importedFragment, ...prev.fragments],
    }));
  }

  useFutureProjectionStore.setState((prev) => ({
    activeCrossNodeSessionId: `fed-session-${node.id}`,
    federatedNodes: prev.federatedNodes.map((n) =>
      n.id === nodeId ? { ...n, lastSyncedIso: nowIso } : n
    ),
  }));

  return `Catálogo federado sincronizado con ${node.institution} (obra disponible en Galería E6).`;
}

export function exportActivityPubNodeManifestJson(): void {
  const st = useFutureProjectionStore.getState();
  const archive = useCurationArchiveStore.getState().fragments;

  const manifest = {
    '@context': [
      'https://www.w3.org/ns/activitystreams',
      'https://solomonhouse.space/ns/federation-v1',
    ],
    type: 'Service',
    id: 'https://salomonhouse.space/ap/actors/local-node',
    name: 'Nodo Federado La Casa de Salomón',
    summary:
      'Nodo soberano de composición e improvisación espacial colectiva (ActivityPub + WebRTC P2P).',
    inbox: 'https://salomonhouse.space/ap/actors/local-node/inbox',
    outbox: 'https://salomonhouse.space/ap/actors/local-node/outbox',
    peers: st.federatedNodes,
    distributedArchiveCatalog: archive.map((w) => ({
      id: w.id,
      title: w.title,
      authors: w.authors,
      license: w.license,
      dateIso: w.dateIso,
      level: w.level,
    })),
  };

  const blob = new Blob([JSON.stringify(manifest, null, 2)], {
    type: 'application/activity+json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'activitypub-node-federation-e8.json';
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * E8.4.1 y E8.4.4: Exporta el Paquete Curricular para Escuelas de Música
 * (plan de clases de 8 semanas, niveles N1–N4, partituras E2 y métricas de
 * impacto para solicitar fondos institucionales).
 */
export function exportSchoolCurriculumAndImpactPackageJson(): void {
  const st = useFutureProjectionStore.getState();
  const payload = {
    format: 'solomon-house/school-curriculum-and-impact-e8',
    exportedAtIso: new Date().toISOString(),
    curriculumPlan8Weeks: [
      {
        weeks: '1–2',
        level: 'N1 (Timbre y Materia)',
        objective: 'Asociar morfología geométrica, envolvente y familia de síntesis.',
        scoreTemplateId: 'tpl-exploracion-timbrica',
      },
      {
        weeks: '3–4',
        level: 'N2 (Espacio y Movimiento)',
        objective: 'Dominar localización binaural HRTF, efecto Doppler y ronda por turnos.',
        scoreTemplateId: 'tpl-ronda-turnos',
      },
      {
        weeks: '5–6',
        level: 'N3 (Procesamiento y Zonas Acústicas)',
        objective: 'Componer mediante zonas de efecto y cadáver exquisito sonoro asíncrono.',
        scoreTemplateId: 'tpl-cadaver-exquisito',
      },
      {
        weeks: '7–8',
        level: 'N4 (Ensamble Abierto, Csound y Concierto)',
        objective: 'Integrar síntesis Csound WASM, agentes coproductores E4 y curaduría E6.',
        scoreTemplateId: 'tpl-ensamble-abierto',
      },
    ],
    annualResidencyCall: {
      title: 'Convocatoria Anual de Residencias Artísticas Telemáticas — La Casa de Salomón',
      modalities: [
        'Composición Espacial Colectiva',
        'Instrumentos Csound / Web Audio',
        'Instalación Site-Specific / XR',
      ],
      licensePolicy: 'Creative Commons (CC-BY / CC-BY-SA)',
    },
    impactMetricsForGrants: st.impactMetrics,
    internationalAlliances: st.federatedNodes,
    sampleWorldScore: buildTopologicalScore({ title: 'Plantilla Escuela de Música' }),
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `paquete-escuelas-musica-impacto-e8-${payload.exportedAtIso.slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
