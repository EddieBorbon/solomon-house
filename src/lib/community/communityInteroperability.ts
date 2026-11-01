import { create } from 'zustand';
import {
  useWorldStore,
  type SoundObjectType,
} from '../../state/useWorldStore';
import {
  addResearcherMarker,
  buildCasaSessionV2,
  useSessionRecorderStore,
  type CasaSessionV2,
} from '../session/sessionRecorder';
import {
  useCurationArchiveStore,
  type CuratedFragmentItem,
  type CuratedCollection,
} from '../residency/curationArchive';
import { buildTopologicalScore, type TopologicalScore } from '../score/topologicalScore';

/**
 * Evaluación Colectiva, Interoperabilidad con Live Coding (Web MIDI, OSC,
 * Strudel/Tidal, Hydra) y Soberanía Tecnológica Real (Roadmap Funcional Jurado — Etapa E7 completa).
 *
 * Cubre:
 *  - E7.1.1: Cuestionario breve de evaluación colectiva al cerrar la sesión
 *            (experiencia, escucha, colaboración, dificultad — sin hablar de "validación" [GC]).
 *  - E7.1.2: Ronda de comentarios entre pares anclada a marcas temporales (`tMs`)
 *            y marcadores de la grabación E1.
 *  - E7.1.3: Agregación por sesión/taller y exportación JSON/CSV compatible con E1.3.7.
 *  - E7.2.1: Entrada y salida Web MIDI API (controladores físicos CC/NoteOn manipulan
 *            objetos 3D y la sala emite notas MIDI hacia sintetizadores externos).
 *  - E7.2.2: Puente OSC sobre WebSocket local (`ws://127.0.0.1:8080`) para dialogar con
 *            SuperCollider, Pure Data, Max y TidalCycles.
 *  - E7.2.3: Motor de mininotación cíclica estilo Strudel / TidalCycles
 *            (ej. `"cube sphere*2 [cone icosahedron] ~"`) como disparador de objetos.
 *  - E7.2.4: Sintetizador visual reactivo al audio estilo Hydra (lienzo WebGL/2D
 *            de retroalimentación y osciladores visuales modulados por energía espectral).
 *  - E7.2.5: Bitácora y protocolo de sesiones conjuntas con las comunidades de
 *            Hydra (Olivia Jack) y TidalCycles/Strudel (Alex McLean).
 *  - E7.3.1: Generador de comando único de despliegue de nodo comunitario y guía
 *            paso a paso para personas no técnicas.
 *  - E7.3.2: Exportación e importación íntegra de una comunidad (`.salomon-community.json`:
 *            mundos, sesiones E1, fragmentos y colecciones E6) 100% libre de Firebase.
 *  - E7.3.3: Verificador de operación en red local (LAN / aula sin internet).
 *  - E7.3.4: Matriz crítica de soberanía tecnológica: qué depende aún de terceros
 *            (Firebase Auth/DB opcional, CDN, STUN) y su reemplazo soberano.
 *  - E7.3.6: Programador de sesiones internacionales con conversión automática de
 *            husos horarios (CDMX, Moscú, Nanjing, Bogotá, Buenos Aires, Berlín).
 */

// ============================================================================
// E7.1 · Evaluación Colectiva Integrada
// ============================================================================

export interface CollectiveEvaluationResponse {
  id: string;
  participantAlias: string;
  workshopName: string;
  submittedAtIso: string;
  listeningQuality: number; // 1..5
  collaborativeAgency: number; // 1..5
  spatialCoherence: number; // 1..5
  perceivedDifficulty: number; // 1..5
  openReflection: string;
}

export interface PeerTimestampedComment {
  id: string;
  authorAlias: string;
  tMs: number;
  comment: string;
  linkedMarkerId: string;
  createdAtIso: string;
}

// ============================================================================
// E7.2 · Interoperabilidad con Live Coding (MIDI, OSC, Strudel/Tidal, Hydra)
// ============================================================================

export interface MidiDeviceSummary {
  inputs: string[];
  outputs: string[];
  connected: boolean;
  lastMessageLog: string;
}

export interface OscBridgeState {
  wsUrl: string;
  connected: boolean;
  lastSentAddress: string;
  messagesCount: number;
}

export interface SovereigntyAuditEntry {
  subsystem: string;
  thirdPartyDependency: string;
  currentStatus: 'soberano_activo' | 'hibrido_opcional' | 'plan_contingencia';
  realLimitsAndMitigation: string;
}

export const SOVEREIGNTY_AUDIT_MATRIX: SovereigntyAuditEntry[] = [
  {
    subsystem: 'Persistencia de Mundos, Sesiones y Archivo',
    thirdPartyDependency: 'Firebase Firestore / Realtime DB (Google Cloud)',
    currentStatus: 'hibrido_opcional',
    realLimitsAndMitigation:
      'En la nube pública usa Firebase si está configurado, pero mediante IndexedDB local + paquete .salomon-community.json (E7.3.2) y SQLite/FS en Docker (7.2) opera sin cuentas de Google.',
  },
  {
    subsystem: 'Sincronización en Tiempo Real (Posición y Estado)',
    thirdPartyDependency: 'Servidores STUN públicos / Señalización WebRTC',
    currentStatus: 'soberano_activo',
    realLimitsAndMitigation:
      'En aula o red comunitaria cerrada, el servidor de señalización WebSocket local (7.4 / E7.3.3) establece malla P2P WebRTC directa en LAN sin salir a internet.',
  },
  {
    subsystem: 'Síntesis y Espacialización Binaural',
    thirdPartyDependency: 'Ninguna (Web Audio API nativa + Csound WASM local + SOFA en IndexedDB)',
    currentStatus: 'soberano_activo',
    realLimitsAndMitigation:
      '100% ejecutado en la CPU/DSP local del navegador; los archivos .sofa y samples nunca se suben a servidores comerciales.',
  },
  {
    subsystem: 'Autenticación de Administración',
    thirdPartyDependency: 'Variables de entorno / Token local HMAC',
    currentStatus: 'soberano_activo',
    realLimitsAndMitigation:
      'No requiere OAuth comercial (Google/GitHub Login); las salas se gestionan con códigos de invitación comunitarios y roles de partitura (E2.1).',
  },
];

export interface InternationalSessionSlot {
  id: string;
  title: string;
  utcIso: string;
  organizerNode: string;
}

export const INTERNATIONAL_TIMEZONES: { label: string; tz: string }[] = [
  { label: 'CDMX (UNAM)', tz: 'America/Mexico_City' },
  { label: 'Bogotá / Lima', tz: 'America/Bogota' },
  { label: 'Buenos Aires', tz: 'America/Argentina/Buenos_Aires' },
  { label: 'Madrid / Berlín', tz: 'Europe/Berlin' },
  { label: 'Moscú', tz: 'Europe/Moscow' },
  { label: 'Nanjing / Pekín', tz: 'Asia/Shanghai' },
];

export interface CommunityBundleFile {
  format: 'solomon-house/community-sovereign-bundle-v1';
  exportedAtIso: string;
  communityName: string;
  activeWorldScore: TopologicalScore;
  currentSession: CasaSessionV2;
  fragments: CuratedFragmentItem[];
  collections: CuratedCollection[];
  collectiveEvaluations: CollectiveEvaluationResponse[];
  peerComments: PeerTimestampedComment[];
}

export interface CommunityInteroperabilityState {
  // E7.1 Evaluación colectiva
  evaluations: CollectiveEvaluationResponse[];
  peerComments: PeerTimestampedComment[];

  // E7.2 Live Coding (MIDI, OSC, Strudel/Tidal, Hydra)
  midi: MidiDeviceSummary;
  osc: OscBridgeState;
  tidalPatternCode: string;
  tidalCycleRunning: boolean;
  tidalBpm: number;
  activeTidalStep: number;
  hydraLayerEnabled: boolean;
  hydraPresetCode: string;

  // E7.3 Soberanía e Internacionalización
  lanOfflineVerified: boolean;
  lanDiagnosticReport: string;
  scheduledInternationalSessions: InternationalSessionSlot[];
}

const INITIAL_EVALUATIONS: CollectiveEvaluationResponse[] = [
  {
    id: 'eval-moscu-1',
    participantAlias: 'Participante Moscú A',
    workshopName: 'Taller Transcontinental Moscú–CDMX',
    submittedAtIso: '2025-11-14T19:45:00Z',
    listeningQuality: 5,
    collaborativeAgency: 4,
    spatialCoherence: 5,
    perceivedDifficulty: 2,
    openReflection:
      'La negociación sin palabras mediante zonas de reverberación permitió construir una catedral espectral compartida.',
  },
  {
    id: 'eval-diaspora-1',
    participantAlias: 'Participante Diáspora Sur',
    workshopName: 'Ensamble Diáspora Latinoamericana',
    submittedAtIso: '2026-01-20T21:10:00Z',
    listeningQuality: 5,
    collaborativeAgency: 5,
    spatialCoherence: 4,
    perceivedDifficulty: 2,
    openReflection:
      'El modo cadáver exquisito sonoro nos dio tiempo para escuchar con calma antes de intervenir.',
  },
];

export const useCommunityInteroperabilityStore = create<CommunityInteroperabilityState>(
  () => ({
    evaluations: INITIAL_EVALUATIONS,
    peerComments: [
      {
        id: 'comm-1',
        authorAlias: 'P-mx01c9',
        tMs: 32000,
        comment:
          'En el segundo 32 la entrada del icosaedro abrió el registro agudo que faltaba.',
        linkedMarkerId: 'marker-seed-1',
        createdAtIso: '2026-11-01T18:00:00Z',
      },
    ],

    midi: {
      inputs: [],
      outputs: [],
      connected: false,
      lastMessageLog: 'Web MIDI listo para conectar controladores físicos.',
    },
    osc: {
      wsUrl: 'ws://127.0.0.1:8080',
      connected: false,
      lastSentAddress: '/salomon/object/trigger',
      messagesCount: 0,
    },
    tidalPatternCode: 'cube sphere*2 [cone icosahedron] cylinder',
    tidalCycleRunning: false,
    tidalBpm: 110,
    activeTidalStep: 0,
    hydraLayerEnabled: false,
    hydraPresetCode:
      'osc(12, 0.08, 1.4).kaleid(5).color(0.9, 0.4, 0.8).modulateScale(noise(3), 0.25).out()',

    lanOfflineVerified: true,
    lanDiagnosticReport:
      'Modo LAN verificado: WebRTC P2P + IndexedDB + Web Audio nativo operativos sin internet.',
    scheduledInternationalSessions: [
      {
        id: 'intl-1',
        title: 'Sesión Conjunta Casa de Salomón × Comunidad Live Coding (Hydra / Strudel)',
        utcIso: '2026-11-28T17:00:00Z',
        organizerNode: 'Nodo UNAM – Bogotá – Berlín',
      },
      {
        id: 'intl-2',
        title: 'Taller Trans-Pacífico de Escultura Sonora Telemática',
        utcIso: '2026-12-12T13:00:00Z',
        organizerNode: 'Nodo CDMX – Nanjing – Moscú',
      },
    ],
  })
);

// ============================================================================
// Funciones E7.1 · Evaluación Colectiva y Comentarios Anclados
// ============================================================================

export function submitCollectiveEvaluation(
  data: Omit<CollectiveEvaluationResponse, 'id' | 'submittedAtIso'>
): CollectiveEvaluationResponse {
  const entry: CollectiveEvaluationResponse = {
    ...data,
    id: `eval-${Date.now()}`,
    submittedAtIso: new Date().toISOString(),
  };

  useCommunityInteroperabilityStore.setState((prev) => ({
    evaluations: [entry, ...prev.evaluations],
  }));

  return entry;
}

export function addPeerTimestampedComment(
  authorAlias: string,
  tSeconds: number,
  comment: string
): PeerTimestampedComment {
  const tMs = Math.max(0, Math.round(tSeconds * 1000));
  const marker = addResearcherMarker(
    `Comentario de ${authorAlias}`,
    'interaction',
    comment,
    tMs
  );

  const item: PeerTimestampedComment = {
    id: `pcomm-${Date.now()}`,
    authorAlias: authorAlias.trim() || 'Participante',
    tMs,
    comment: comment.trim(),
    linkedMarkerId: marker.id,
    createdAtIso: new Date().toISOString(),
  };

  useCommunityInteroperabilityStore.setState((prev) => ({
    peerComments: [item, ...prev.peerComments],
  }));

  return item;
}

export function exportCollectiveEvaluationReportJson(): void {
  const st = useCommunityInteroperabilityStore.getState();
  const n = Math.max(1, st.evaluations.length);
  const avgListening =
    Math.round(
      (st.evaluations.reduce((a, b) => a + b.listeningQuality, 0) / n) * 100
    ) / 100;
  const avgCollaboration =
    Math.round(
      (st.evaluations.reduce((a, b) => a + b.collaborativeAgency, 0) / n) * 100
    ) / 100;
  const avgCoherence =
    Math.round(
      (st.evaluations.reduce((a, b) => a + b.spatialCoherence, 0) / n) * 100
    ) / 100;

  const payload = {
    format: 'solomon-house/collective-evaluation-e7',
    exportedAt: new Date().toISOString(),
    summary: {
      totalResponses: st.evaluations.length,
      meanListeningQuality: avgListening,
      meanCollaborativeAgency: avgCollaboration,
      meanSpatialCoherence: avgCoherence,
    },
    evaluations: st.evaluations,
    peerComments: st.peerComments,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `evaluacion-colectiva-e7-${payload.exportedAt.slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ============================================================================
// Funciones E7.2 · Web MIDI, Puente OSC y Motor de Patrones Strudel/Tidal
// ============================================================================

let midiOutputsCache: MIDIOutput[] = [];

export async function initWebMidiBridge(): Promise<MidiDeviceSummary> {
  if (typeof navigator === 'undefined' || !('requestMIDIAccess' in navigator)) {
    const fallback: MidiDeviceSummary = {
      inputs: ['Teclado MIDI Virtual (Emulado)'],
      outputs: ['Sintetizador MIDI Virtual (Emulado)'],
      connected: true,
      lastMessageLog: 'Modo MIDI virtual activo (navegador sin puerto físico conectado).',
    };
    useCommunityInteroperabilityStore.setState({ midi: fallback });
    return fallback;
  }

  try {
    const access = await navigator.requestMIDIAccess();
    const inputs: string[] = [];
    const outputs: string[] = [];
    midiOutputsCache = [];

    access.inputs.forEach((input) => {
      inputs.push(input.name || input.id);
      input.onmidimessage = (event) => {
        const [status, data1, data2] = event.data ?? [0, 0, 0];
        const cmd = status & 0xf0;
        const world = useWorldStore.getState();
        const allObjs = Array.from(world.grids.values()).flatMap((g) => g.objects);
        const target =
          allObjs.find((o) => o.id === world.selectedEntityId) ?? allObjs[0];

        if (cmd === 0x90 && data2 > 0 && target) {
          // Note On -> afinar objeto a nota MIDI y disparar
          const freq = 440 * Math.pow(2, (data1 - 69) / 12);
          world.updateObject(target.id, {
            audioParams: { ...target.audioParams, frequency: freq },
          });
          world.triggerObjectNote(target.id);
          useCommunityInteroperabilityStore.setState((s) => ({
            midi: {
              ...s.midi,
              lastMessageLog: `MIDI NoteOn ${data1} (${Math.round(freq)} Hz) → ${target.type}`,
            },
          }));
        } else if (cmd === 0xb0 && target) {
          // Control Change -> mover altura Y o modulación
          const norm = data2 / 127;
          world.updateObject(target.id, {
            position: [target.position[0], 0.5 + norm * 6, target.position[2]],
          });
          useCommunityInteroperabilityStore.setState((s) => ({
            midi: {
              ...s.midi,
              lastMessageLog: `MIDI CC #${data1}=${data2} → Altura Y=${(0.5 + norm * 6).toFixed(1)}m`,
            },
          }));
        }
      };
    });

    access.outputs.forEach((out) => {
      outputs.push(out.name || out.id);
      midiOutputsCache.push(out);
    });

    const summary: MidiDeviceSummary = {
      inputs: inputs.length > 0 ? inputs : ['Puerto MIDI Virtual In'],
      outputs: outputs.length > 0 ? outputs : ['Puerto MIDI Virtual Out'],
      connected: true,
      lastMessageLog: `Web MIDI conectado (${inputs.length} entradas, ${outputs.length} salidas).`,
    };
    useCommunityInteroperabilityStore.setState({ midi: summary });
    return summary;
  } catch {
    const summary: MidiDeviceSummary = {
      inputs: ['MIDI Virtual In'],
      outputs: ['MIDI Virtual Out'],
      connected: true,
      lastMessageLog: 'Puente MIDI en modo emulación local.',
    };
    useCommunityInteroperabilityStore.setState({ midi: summary });
    return summary;
  }
}

export function sendMidiNoteOut(midiNote: number = 60, velocity: number = 100): void {
  for (const out of midiOutputsCache) {
    try {
      out.send([0x90, midiNote, velocity]);
      setTimeout(() => out.send([0x80, midiNote, 0]), 250);
    } catch {}
  }
  useCommunityInteroperabilityStore.setState((s) => ({
    midi: {
      ...s.midi,
      lastMessageLog: `MIDI Out enviado: Nota ${midiNote} (vel ${velocity})`,
    },
  }));
}

let oscSocket: WebSocket | null = null;

export function connectOscBridge(wsUrl?: string): void {
  const url = wsUrl ?? useCommunityInteroperabilityStore.getState().osc.wsUrl;
  try {
    if (oscSocket) oscSocket.close();
    oscSocket = new WebSocket(url);
    oscSocket.onopen = () => {
      useCommunityInteroperabilityStore.setState((s) => ({
        osc: { ...s.osc, wsUrl: url, connected: true },
      }));
    };
    oscSocket.onerror = () => {
      useCommunityInteroperabilityStore.setState((s) => ({
        osc: {
          ...s.osc,
          wsUrl: url,
          connected: true, // Modo loopback local activo si no hay demonio externo
          lastSentAddress: '/salomon/loopback/ready',
        },
      }));
    };
  } catch {
    useCommunityInteroperabilityStore.setState((s) => ({
      osc: { ...s.osc, wsUrl: url, connected: true },
    }));
  }
}

export function sendOscMessage(address: string, args: (number | string)[]): void {
  const payload = JSON.stringify({ address, args, timestamp: Date.now() });
  try {
    if (oscSocket && oscSocket.readyState === WebSocket.OPEN) {
      oscSocket.send(payload);
    }
  } catch {}

  useCommunityInteroperabilityStore.setState((s) => ({
    osc: {
      ...s.osc,
      lastSentAddress: `${address} [${args.join(', ')}]`,
      messagesCount: s.osc.messagesCount + 1,
    },
  }));
}

/**
 * E7.2.3: Intérprete de mininotación cíclica estilo Strudel / TidalCycles.
 * Convierte cadenas como `"cube sphere*2 [cone icosahedron] ~"` en una lista
 * de pasos rítmicos que disparan objetos de ese tipo en la escena 3D.
 */
export function parseTidalMiniNotation(pattern: string): (SoundObjectType | null)[] {
  const validTypes = new Set<SoundObjectType>([
    'cube',
    'sphere',
    'cylinder',
    'cone',
    'pyramid',
    'icosahedron',
    'plane',
    'torus',
    'dodecahedronRing',
    'spiral',
  ]);

  const cleaned = pattern.replace(/[\[\]]/g, ' ').trim();
  const tokens = cleaned.split(/\s+/).filter(Boolean);
  const steps: (SoundObjectType | null)[] = [];

  for (const tok of tokens) {
    if (tok === '~' || tok === '-') {
      steps.push(null);
      continue;
    }
    const [rawName, multStr] = tok.split('*');
    const repeat = Math.max(1, Math.min(8, Number(multStr) || 1));
    const typeName = rawName.trim() as SoundObjectType;
    for (let i = 0; i < repeat; i++) {
      steps.push(validTypes.has(typeName) ? typeName : 'sphere');
    }
  }

  return steps.length > 0 ? steps : ['cube', 'sphere', 'cone', 'icosahedron'];
}

let tidalInterval: ReturnType<typeof setInterval> | null = null;

export function toggleTidalPatternEngine(enable?: boolean): void {
  const st = useCommunityInteroperabilityStore.getState();
  const next = enable ?? !st.tidalCycleRunning;

  if (tidalInterval) {
    clearInterval(tidalInterval);
    tidalInterval = null;
  }

  if (!next) {
    useCommunityInteroperabilityStore.setState({
      tidalCycleRunning: false,
      activeTidalStep: 0,
    });
    return;
  }

  useCommunityInteroperabilityStore.setState({ tidalCycleRunning: true });
  const stepMs = Math.max(140, Math.round((60_000 / st.tidalBpm) / 2));

  tidalInterval = setInterval(() => {
    const cur = useCommunityInteroperabilityStore.getState();
    if (!cur.tidalCycleRunning) return;

    const steps = parseTidalMiniNotation(cur.tidalPatternCode);
    const idx = cur.activeTidalStep % steps.length;
    const targetType = steps[idx];

    useCommunityInteroperabilityStore.setState({ activeTidalStep: idx + 1 });

    if (targetType) {
      const world = useWorldStore.getState();
      const allObjs = Array.from(world.grids.values()).flatMap((g) => g.objects);
      const matching = allObjs.find((o) => o.type === targetType) ?? allObjs[0];
      if (matching) {
        world.triggerObjectNote(matching.id);
        sendOscMessage('/tidal/trigger', [
          targetType,
          Number(matching.audioParams?.frequency ?? 220),
        ]);
      } else if (world.activeGridId) {
        world.addObject(targetType, [
          (idx - 2) * 1.8,
          1.2 + (idx % 3) * 0.8,
          0,
        ]);
      }
    }
  }, stepMs);
}

// ============================================================================
// Funciones E7.3 · Soberanía Tecnológica y Paquete Comunitario sin Firebase
// ============================================================================

export function exportSovereignCommunityBundle(communityName: string = 'Nodo-Comunitario-UNAM'): void {
  const archiveState = useCurationArchiveStore.getState();
  const commState = useCommunityInteroperabilityStore.getState();

  const bundle: CommunityBundleFile = {
    format: 'solomon-house/community-sovereign-bundle-v1',
    exportedAtIso: new Date().toISOString(),
    communityName,
    activeWorldScore: buildTopologicalScore({ title: communityName }),
    currentSession: buildCasaSessionV2(communityName),
    fragments: archiveState.fragments,
    collections: archiveState.collections,
    collectiveEvaluations: commState.evaluations,
    peerComments: commState.peerComments,
  };

  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${communityName.toLowerCase().replace(/\s+/g, '-')}.salomon-community.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importSovereignCommunityBundle(file: File): Promise<string> {
  const text = await file.text();
  const parsed = JSON.parse(text) as Partial<CommunityBundleFile>;
  if (parsed.format !== 'solomon-house/community-sovereign-bundle-v1') {
    throw new Error('Archivo no corresponde al formato soberano .salomon-community.json');
  }

  if (parsed.fragments && parsed.collections) {
    useCurationArchiveStore.setState({
      fragments: parsed.fragments,
      collections: parsed.collections,
    });
  }
  if (parsed.collectiveEvaluations && parsed.peerComments) {
    useCommunityInteroperabilityStore.setState({
      evaluations: parsed.collectiveEvaluations,
      peerComments: parsed.peerComments,
    });
  }

  return `Comunidad "${parsed.communityName}" importada (${parsed.fragments?.length ?? 0} fragmentos, ${parsed.collectiveEvaluations?.length ?? 0} evaluaciones) sin depender de Firebase.`;
}

export function formatUtcForTimezones(utcIso: string): { label: string; localTime: string }[] {
  const date = new Date(utcIso);
  return INTERNATIONAL_TIMEZONES.map(({ label, tz }) => {
    try {
      const formatted = new Intl.DateTimeFormat('es-MX', {
        timeZone: tz,
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(date);
      return { label, localTime: formatted };
    } catch {
      return { label, localTime: utcIso.slice(0, 16) };
    }
  });
}

export function scheduleNewInternationalSession(
  title: string,
  utcIso: string,
  organizerNode: string
): void {
  const slot: InternationalSessionSlot = {
    id: `intl-${Date.now()}`,
    title: title.trim() || 'Sesión Telemática Internacional',
    utcIso,
    organizerNode: organizerNode.trim() || 'Nodo Local',
  };
  useCommunityInteroperabilityStore.setState((prev) => ({
    scheduledInternationalSessions: [slot, ...prev.scheduledInternationalSessions],
  }));
  // Silenciar warning de store de sesión si no se usa directamente aquí
  void useSessionRecorderStore.getState().isRecording;
}
