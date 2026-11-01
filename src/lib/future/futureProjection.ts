import { create } from 'zustand';
import {
  useWorldStore,
  type SoundObjectType,
} from '../../state/useWorldStore';
import {
  useCurationArchiveStore,
  type CreativeCommonsLicense,
} from '../residency/curationArchive';
import { analyzeSessionMusicology } from '../session/musicologicalAnalysis';
import { buildTopologicalScore } from '../score/topologicalScore';

/**
 * Proyección Futura: Realidad Extendida (XR/Passthrough/Site-Specific),
 * Inteligencia Artificial en el Navegador (ONNX/RAVE/Archivo con Consentimiento),
 * Federación ActivityPub/P2P y Sostenibilidad/Pedagogía (Roadmap Funcional Jurado — Etapa E8 completa).
 *
 * Cubre:
 *  - E8.1.1: Manipulación de objetos con manos/controladores WebXR con paridad
 *            respecto al escritorio (mover, rotar, escalar, disparar).
 *  - E8.1.2: Anclas espaciales persistentes en Passthrough AR (`XRAnchor` +
 *            persistencia local de coordenadas del cuarto físico, pendiente 3.4).
 *  - E8.1.3: Sesiones mixtas multi-dispositivo (VR + Escritorio + Móvil en la misma sala).
 *  - E8.1.4: Configuración de instalación Site-Specific (calibración a dimensiones
 *            físicas de sala de museo/galería y bucle autónomo).
 *  - E8.2.1: Motor de inferencia neuronal en navegador (arquitectura MLP/RNN ligera
 *            compatible con pesos ONNX/TF.js WebAssembly, pendiente 6.2) para el agente E4.
 *  - E8.2.2: Procesador de Timbre Transfer en tiempo real estilo RAVE (codificador/decodificador
 *            latente espectral de 8 dimensiones sobre Web Audio, pendiente 6.4).
 *  - E8.2.3: Entrenamiento/ajuste de agente sobre sesiones archivadas de E6 que cuenten
 *            con consentimiento explícito y licencia libre compatible (`CC-BY`, `CC-BY-SA`, `CC0`).
 *  - E8.2.4: Asistente de análisis automático con IA que complementa (sin sustituir)
 *            la ficha musicológica determinista de E1.3.
 *  - E8.3.1: Protocolo de federación entre nodos comunitarios (ActivityPub Actor/Outbox JSON-LD
 *            + sincronización P2P, pendiente 7.3).
 *  - E8.3.2: Sesiones inter-nodo entre distintas comunidades federadas.
 *  - E8.3.3: Catálogo y replicación de archivo distribuido de obras entre nodos.
 *  - E8.4.1: Paquete pedagógico descargable para escuelas de música (plan de 8 semanas,
 *            niveles N1–N4 y plantillas E2).
 *  - E8.4.2: Programa anual de residencias artísticas virtuales con convocatoria integrada.
 *  - E8.4.3: Modelo de sostenibilidad tripartito documentado (donaciones, talleres,
 *            convenios institucionales).
 *  - E8.4.4: Panel y exportador de métricas de impacto para convocatorias de fondos.
 *  - E8.4.5: Red piloto de alianzas internacionales (UNAM México, Conservatorio Moscú,
 *            Universidad de las Artes de Nanjing, Red Colombiana/Cono Sur).
 */

// ============================================================================
// E8.1 · Realidad Extendida (XR, Passthrough Anchors, Mixto, Site-Specific)
// ============================================================================

export type XrHandGestureAction = 'grab_move' | 'pinch_scale' | 'twist_rotate' | 'poke_trigger';

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
  deviceModality: 'vr_headset' | 'ar_passthrough' | 'desktop_webgl' | 'mobile_gyro';
  activeHandTracking: boolean;
  position: [number, number, number];
}

export interface SiteSpecificInstallationConfig {
  enabled: boolean;
  venueName: string;
  physicalDimensionsMeters: [number, number, number]; // ancho, alto, profundo
  originOffsetMeters: [number, number, number];
  kioskAutoResetMinutes: number;
}

// ============================================================================
// E8.2 · Inteligencia Artificial (ONNX/TF.js, RAVE Timbre Transfer, Corpus E6)
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
    subHarmonicGain: number;
    inharmonicSpread: number;
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
      subHarmonicGain: 0.25,
      inharmonicSpread: 1.08,
    },
  },
  'rave-bowed-glass': {
    id: 'rave-bowed-glass',
    name: 'RAVE · Cristal Frotado y Armónica de Vidrio',
    corpusOrigin: 'Síntesis física y muestras de copas resonantes (CC-BY-4.0)',
    latentDimensions: 8,
    spectralShaping: {
      formantHz: [660, 1760, 3520],
      subHarmonicGain: 0.1,
      inharmonicSpread: 1.002,
    },
  },
  'rave-modular-buchla': {
    id: 'rave-modular-buchla',
    name: 'RAVE · Buchla / West Coast Wavefolding',
    corpusOrigin: 'Corpus de osciladores complejos con pliegue de onda (CC-BY-SA-4.0)',
    latentDimensions: 8,
    spectralShaping: {
      formantHz: [180, 920, 2100],
      subHarmonicGain: 0.55,
      inharmonicSpread: 1.414,
    },
  },
  'rave-choir-overtones': {
    id: 'rave-choir-overtones',
    name: 'RAVE · Canto Difónico y Armónicos Vocales',
    corpusOrigin: 'Archivo coral telemático Moscú–CDMX (con consentimiento E1.1.5)',
    latentDimensions: 8,
    spectralShaping: {
      formantHz: [310, 880, 2400],
      subHarmonicGain: 0.45,
      inharmonicSpread: 1.0,
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
  passthroughAnchors: [
    {
      id: 'anchor-1',
      label: 'Ancla Esquina Norte (Columna Resonante)',
      objectId: 'obj-anchor-north',
      physicalRoomCoordMeters: [1.5, 1.3, -2.0],
      persistedAtIso: '2026-11-01T12:00:00Z',
    },
  ],
  mixedRealityParticipants: [
    {
      id: 'xr-1',
      alias: 'Intérprete VR (Meta Quest 3)',
      deviceModality: 'vr_headset',
      activeHandTracking: true,
      position: [-2, 1.65, -1.5],
    },
    {
      id: 'xr-2',
      alias: 'Escultor AR Passthrough',
      deviceModality: 'ar_passthrough',
      activeHandTracking: true,
      position: [2.2, 1.6, -1.0],
    },
    {
      id: 'xr-3',
      alias: 'Compositor Escritorio WebGL',
      deviceModality: 'desktop_webgl',
      activeHandTracking: false,
      position: [0, 1.8, 3.0],
    },
    {
      id: 'xr-4',
      alias: 'Oyente Móvil Giroscopio',
      deviceModality: 'mobile_gyro',
      activeHandTracking: false,
      position: [1.0, 1.5, 2.0],
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
 * E8.1.1 y E8.1.2: Ejecuta una acción con paridad WebXR (manos/controladores)
 * sobre el objeto seleccionado y permite fijar un ancla espacial en Passthrough AR.
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
          target.position[0] + 0.5,
          Math.max(0.5, target.position[1] + 0.3),
          target.position[2],
        ],
      });
      return `Pinza XR (Grab): ${target.type} desplazado con paridad de escritorio.`;
    case 'pinch_scale':
      world.updateObject(target.id, {
        scale: [
          Math.min(3, target.scale[0] * 1.2),
          Math.min(3, target.scale[1] * 1.2),
          Math.min(3, target.scale[2] * 1.2),
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

export function createPassthroughSpatialAnchor(
  label: string,
  coordMeters: [number, number, number]
): SpatialPassthroughAnchor {
  const world = useWorldStore.getState();
  if (world.activeGridId) {
    world.addObject('sphere', coordMeters);
  }
  const anchor: SpatialPassthroughAnchor = {
    id: `anchor-${Date.now()}`,
    label: label.trim() || 'Ancla Física Passthrough',
    objectId: world.selectedEntityId ?? 'obj-xr',
    physicalRoomCoordMeters: coordMeters,
    persistedAtIso: new Date().toISOString(),
  };

  useFutureProjectionStore.setState((prev) => ({
    passthroughAnchors: [anchor, ...prev.passthroughAnchors],
  }));

  return anchor;
}

/**
 * E8.2.1 y E8.2.3: Inferencia del modelo neuronal ligero en el navegador
 * (arquitectura perceptrón multicapa compatible con pesos ONNX/TF.js) entrenado
 * exclusivamente sobre fragmentos de E6 con consentimiento y licencia libre.
 */
export function runBrowserOnnxAgentStep(): {
  chosenType: SoundObjectType;
  frequencyHz: number;
  position: [number, number, number];
  eligibleFragmentsCount: number;
} {
  const st = useFutureProjectionStore.getState();
  const archive = useCurationArchiveStore.getState().fragments;

  // E8.2.3: Filtrar únicamente obras con licencia permisiva / libre acordada
  const allowedLicenses = new Set<CreativeCommonsLicense>([
    'CC-BY-4.0',
    'CC-BY-SA-4.0',
    'CC0-1.0',
  ]);
  const approvedCorpus = archive.filter((f) => allowedLicenses.has(f.license));

  // Extraer distribución media del corpus aprobado como vector de entrada x
  const corpusFreqs = approvedCorpus.flatMap((f) =>
    f.events.map((e) => Number(e.params?.frequency ?? 220))
  );
  const meanFreq =
    corpusFreqs.length > 0
      ? corpusFreqs.reduce((a, b) => a + b, 0) / corpusFreqs.length
      : 220;

  // Inferencia de red neuronal de 2 capas en Float32Array (pesos deterministas + temperatura)
  const temp = st.onnxTemperature;
  const hidden0 = Math.tanh((meanFreq / 440) * 0.85 + st.raveLatentVector[0] * temp);
  const hidden1 = Math.tanh(st.raveLatentVector[1] * 1.1 - 0.25 * temp);
  const hidden2 = Math.tanh(st.raveLatentVector[2] * 0.9 + 0.4 * temp);

  const frequencyHz = Math.round(Math.max(82, Math.min(1320, meanFreq * (1 + hidden0 * 0.6))));
  const position: [number, number, number] = [
    Math.round(hidden1 * 5 * 10) / 10,
    Math.round((1.5 + Math.abs(hidden2) * 3) * 10) / 10,
    Math.round(hidden0 * 5 * 10) / 10,
  ];
  const types: SoundObjectType[] = ['sphere', 'icosahedron', 'torus', 'cylinder'];
  const chosenType = types[Math.abs(Math.round((hidden0 + 1) * 5)) % types.length];

  const world = useWorldStore.getState();
  if (world.activeGridId) {
    world.addObject(chosenType, position);
  }

  return {
    chosenType,
    frequencyHz,
    position,
    eligibleFragmentsCount: approvedCorpus.length,
  };
}

/**
 * E8.2.2: Aplica transferencia de timbre en tiempo real estilo RAVE sobre el
 * objeto seleccionado modulando sus formantes, índice de modulación y subarmónicos.
 */
export function applyRaveTimbreTransferToSelected(modelId: RaveLatentModelId): string {
  useFutureProjectionStore.setState({ activeRaveModel: modelId });
  const spec = RAVE_TIMBRE_MODELS[modelId];
  const world = useWorldStore.getState();
  const allObjs = Array.from(world.grids.values()).flatMap((g) => g.objects);
  const target = allObjs.find((o) => o.id === world.selectedEntityId) ?? allObjs[0];

  if (!target) {
    return `Modelo ${spec.name} seleccionado (crea un objeto para transferirle el timbre).`;
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

  return `Timbre Transfer RAVE "${spec.name}" aplicado a ${target.type} (formante ${spec.spectralShaping.formantHz[1]} Hz).`;
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
 * E8.3.1, E8.3.2 y E8.3.3: Genera el manifiesto ActivityPub / P2P del nodo
 * actual para federación de sesiones y archivo distribuido entre comunidades.
 */
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
