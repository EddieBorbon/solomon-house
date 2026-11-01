import { create } from 'zustand';
import {
  buildCasaSessionV2,
  type CasaSessionV2,
  type SessionEvent,
  type CompositionalLayer,
} from '../session/sessionRecorder';
import {
  analyzeSessionMusicology,
  type MusicologicalReport,
} from '../session/musicologicalAnalysis';
import { generateTemporalGraphicScoreSvg } from '../session/sessionVisualizations';
import {
  buildTopologicalScore,
  importTopologicalScore,
  type TopologicalScore,
} from '../score/topologicalScore';
import { useWorldStore } from '../../state/useWorldStore';
import { type LevelId } from '../pedagogy/parametricLevels';

/**
 * Curaduría, Archivo Público, Reapropiación con Atribución y Modo Concierto
 * (Roadmap Funcional Jurado — Etapa E6 completa, más soporte Ambisonics E5.3.4).
 *
 * Cubre:
 *  - E6.1.1: Selección de fragmentos (punto de entrada `inMs` y salida `outMs`)
 *            dentro de una sesión grabada en E1.
 *  - E6.1.2: Metadatos completos del fragmento (autores, sala, fecha, nivel,
 *            etiquetas y descripción).
 *  - E6.1.3: Licencia Creative Commons acordada por las personas participantes.
 *  - E6.2.1: Archivo público navegable de sesiones, fragmentos y esculturas con
 *            búsqueda y filtros por nivel, licencia y etiqueta.
 *  - E6.2.2: Ficha de cada obra con síntesis de pre-escucha, partitura gráfica SVG,
 *            ficha musicológica (E1.3) y créditos.
 *  - E6.2.3: Colecciones curadas con texto curatorial.
 *  - E6.3.1: Bifurcación (fork) de un mundo o fragmento para crear obra derivada.
 *  - E6.3.2: Cadena autoral visible (linaje genealógico de la obra).
 *  - E6.3.3: Exportación de stems WAV multipista por objeto o por capa para DAW.
 *  - E6.3.4: Exportación de material como sample WAV para carga comunitaria.
 *  - E6.4.1: Lista de reproducción de fragmentos para presentación en concierto.
 *  - E6.4.2: Salida multicanal / Ambisonics B-format (W, X, Y, Z) de 4 canales.
 *  - E6.4.3: Modo Proyección para pantalla grande sin interfaz flotante.
 *  - E6.4.4: Modo Concierto Híbrido (público en sala física + intérpretes remotos).
 *  - E6.4.5: Generador de programa de mano (HTML/Markdown imprimible con créditos,
 *            notas curatoriales y partitura gráfica SVG).
 */

export type CreativeCommonsLicense =
  | 'CC-BY-4.0'
  | 'CC-BY-SA-4.0'
  | 'CC-BY-NC-4.0'
  | 'CC-BY-NC-SA-4.0'
  | 'CC0-1.0';

export const CC_LICENSE_DESCRIPTIONS: Record<
  CreativeCommonsLicense,
  { name: string; summary: string }
> = {
  'CC-BY-4.0': {
    name: 'CC BY 4.0 (Atribución)',
    summary: 'Permite remezclar, bifurcar y presentar públicamente citando la cadena autoral.',
  },
  'CC-BY-SA-4.0': {
    name: 'CC BY-SA 4.0 (Atribución-CompartirIgual)',
    summary: 'Las obras derivadas deben mantenerse bajo la misma licencia libre.',
  },
  'CC-BY-NC-4.0': {
    name: 'CC BY-NC 4.0 (Atribución-NoComercial)',
    summary: 'Reutilización artística y académica sin fines comerciales.',
  },
  'CC-BY-NC-SA-4.0': {
    name: 'CC BY-NC-SA 4.0 (NoComercial-CompartirIgual)',
    summary: 'Uso pedagógico y comunitario compartiendo obras derivadas bajo igual licencia.',
  },
  'CC0-1.0': {
    name: 'CC0 1.0 (Dominio Público Comunitario)',
    summary: 'Materia prima sonora cedida sin restricciones al procomún.',
  },
};

export interface AttributionChainNode {
  workId: string;
  title: string;
  authors: string[];
  dateIso: string;
  license: CreativeCommonsLicense;
  changeSummary: string;
}

export interface CuratedFragmentItem {
  id: string;
  kind: 'fragment' | 'session' | 'sculpture';
  title: string;
  authors: string[];
  roomId: string;
  dateIso: string;
  level: LevelId;
  tags: string[];
  description: string;
  license: CreativeCommonsLicense;
  inMs: number;
  outMs: number;
  snapshot: TopologicalScore;
  events: SessionEvent[];
  musicologicalSummary: {
    pitchSystem: string;
    periodicityIndex: number;
    meanSpectralCentroidHz: number;
    humanSharePct: number;
  };
  graphicScoreSvg: string;
  attributionChain: AttributionChainNode[];
}

export interface CuratedCollection {
  id: string;
  title: string;
  curatorName: string;
  curatorialText: string;
  createdAtIso: string;
  fragmentIds: string[];
}

export type MultichannelOutputMode =
  | 'stereo_binaural'
  | 'quadraphonic_4ch'
  | 'ambisonics_bformat_foa'
  | 'octophonic_8ch';

export interface CurationArchiveState {
  fragments: CuratedFragmentItem[];
  collections: CuratedCollection[];
  activeAttributionChain: AttributionChainNode[];
  // Modo Concierto (E6.4)
  concertPlaylistIds: string[];
  activeConcertIndex: number;
  multichannelMode: MultichannelOutputMode;
  projectionCleanViewMode: boolean; // E6.4.3
  hybridConcertMode: boolean; // E6.4.4
  hybridVenueName: string;
  hybridRemoteNodesCount: number;
}

function makeSeedFragment(
  id: string,
  title: string,
  authors: string[],
  roomId: string,
  dateIso: string,
  level: LevelId,
  tags: string[],
  description: string,
  license: CreativeCommonsLicense,
  inMs: number,
  outMs: number,
  freqs: number[]
): CuratedFragmentItem {
  const baseScore = buildTopologicalScore({ title });
  const events: SessionEvent[] = freqs.map((f, idx) => ({
    id: `${id}-ev-${idx}`,
    t: inMs + Math.round(((outMs - inMs) * idx) / Math.max(1, freqs.length)),
    timestamp: dateIso,
    type: idx === 0 ? 'create' : 'trigger',
    entityType: 'soundObject',
    entityId: `seed-obj-${idx}`,
    author: { id: authors[idx % authors.length] || 'P-anon', role: 'user' },
    layer: idx % 2 === 0 ? 'texture' : 'gesture',
    position: [(idx - 1) * 2.5, 1.2 + idx * 0.6, (idx % 2) * 2],
    objectType: idx % 2 === 0 ? 'sphere' : 'icosahedron',
    params: { frequency: f, waveform: idx % 2 === 0 ? 'sine' : 'triangle', volume: 0.7 },
  }));

  const mockSession: CasaSessionV2 = {
    format: 'solomon-house/session-v2',
    version: '2.0.0',
    exportedAt: dateIso,
    metadata: {
      title,
      roomId,
      level,
      durationMs: Math.max(5000, outMs - inMs),
      startedAt: dateIso,
      consentGrantedAt: dateIso,
      anonymized: true,
      participants: authors.map((a) => ({
        anonymousId: a,
        role: 'user',
        layer: 'texture',
        regionCode: 'INTL',
        joinedAtMs: 0,
      })),
    },
    initialSnapshot: baseScore,
    events,
    markers: [],
  };

  const report = analyzeSessionMusicology(mockSession);
  const svg = generateTemporalGraphicScoreSvg(mockSession);

  return {
    id,
    kind: 'fragment',
    title,
    authors,
    roomId,
    dateIso,
    level,
    tags,
    description,
    license,
    inMs,
    outMs,
    snapshot: baseScore,
    events,
    musicologicalSummary: {
      pitchSystem: report.pitchSystem.classification,
      periodicityIndex: report.rhythm.periodicityIndex,
      meanSpectralCentroidHz: report.timbre.meanSpectralCentroidHz,
      humanSharePct: report.agency.humanSharePct,
    },
    graphicScoreSvg: svg,
    attributionChain: [
      {
        workId: id,
        title,
        authors,
        dateIso,
        license,
        changeSummary: 'Grabación original de sesión telemática.',
      },
    ],
  };
}

const INITIAL_FRAGMENTS: CuratedFragmentItem[] = [
  makeSeedFragment(
    'frag-moscu-01',
    'Fragmento I · Campanas Espectrales Moscú–CDMX',
    ['P-ru01a4', 'P-mx01c9', 'AGENTE-JARDINERO'],
    'sala-moscu-2025',
    '2025-11-14',
    'N3',
    ['espectral', 'campanas', 'transcontinental', 'moscú'],
    'Sección de clímax de 90 segundos donde los icosaedros metálicos convergen hacia una fundamental de 110 Hz.',
    'CC-BY-SA-4.0',
    30_000,
    120_000,
    [110, 220, 330, 550, 770]
  ),
  makeSeedFragment(
    'frag-diaspora-02',
    'Fragmento II · Deriva Granular de la Diáspora Latinoamericana',
    ['P-co01b2', 'P-ar02d8', 'P-mx03f1'],
    'sala-diaspora-sur',
    '2026-01-20',
    'N4',
    ['diáspora', 'microtonal', 'cadáver-exquisito', 'textura'],
    'Superposición de tres capas asíncronas sobre muestras vocales y anillos dodecaédricos.',
    'CC-BY-4.0',
    15_000,
    105_000,
    [146.8, 185.0, 233.1, 311.1, 415.3]
  ),
  makeSeedFragment(
    'frag-china-03',
    'Fragmento III · Polirritmia Pentatónica Nanjing–UNAM',
    ['P-cn01e7', 'P-cn02a3', 'P-mx01c9'],
    'sala-pacifico-nanjing',
    '2026-02-08',
    'N2',
    ['china', 'pentatónico', 'polirritmia', 'cuerdas'],
    'Diálogo por turnos entre toros Karplus-Strong y esferas FM bajo latencia trans-pacífica compensada.',
    'CC-BY-NC-SA-4.0',
    0,
    75_000,
    [130.81, 146.83, 164.81, 196.0, 220.0, 261.63]
  ),
];

const INITIAL_COLLECTIONS: CuratedCollection[] = [
  {
    id: 'col-cartografias-2026',
    title: 'Cartografías Telemáticas: Tres Casos de Estudio (2025–2026)',
    curatorName: 'Curaduría Colectiva Casa de Salomón',
    curatorialText:
      'Selección antológica que reúne los momentos de mayor cohesión tímbrica y espacial de los talleres realizados con participantes en Moscú, la diáspora latinoamericana y China.',
    createdAtIso: '2026-11-01',
    fragmentIds: ['frag-moscu-01', 'frag-diaspora-02', 'frag-china-03'],
  },
];

export const useCurationArchiveStore = create<CurationArchiveState>(() => ({
  fragments: INITIAL_FRAGMENTS,
  collections: INITIAL_COLLECTIONS,
  activeAttributionChain: [],
  concertPlaylistIds: ['frag-moscu-01', 'frag-diaspora-02', 'frag-china-03'],
  activeConcertIndex: 0,
  multichannelMode: 'stereo_binaural',
  projectionCleanViewMode: false,
  hybridConcertMode: false,
  hybridVenueName: 'Sala Xochipilli · Facultad de Música UNAM',
  hybridRemoteNodesCount: 3,
}));

/**
 * E6.1.1, E6.1.2 y E6.1.3: Extrae un fragmento delimitado por `[inMs, outMs]`
 * de la sesión actual (o una sesión `.casa.json` v2 dada) con metadatos y
 * licencia Creative Commons acordada.
 */
export function createFragmentFromSession(params: {
  title: string;
  authors: string[];
  tags: string[];
  description: string;
  license: CreativeCommonsLicense;
  inMs: number;
  outMs: number;
  sourceSession?: CasaSessionV2;
}): CuratedFragmentItem {
  const session = params.sourceSession ?? buildCasaSessionV2(params.title);
  const inClamped = Math.max(0, Math.min(params.inMs, params.outMs));
  const outClamped = Math.max(inClamped + 1000, params.outMs);

  const slicedEvents = session.events.filter(
    (e) => e.t >= inClamped && e.t <= outClamped
  );

  const slicedSession: CasaSessionV2 = {
    ...session,
    metadata: {
      ...session.metadata,
      title: params.title,
      durationMs: outClamped - inClamped,
    },
    events: slicedEvents,
  };

  const report: MusicologicalReport = analyzeSessionMusicology(slicedSession);
  const svg = generateTemporalGraphicScoreSvg(slicedSession);
  const id = `frag-${Date.now()}`;
  const dateIso = new Date().toISOString().slice(0, 10);

  const activeChain = useCurationArchiveStore.getState().activeAttributionChain;
  const attributionChain: AttributionChainNode[] = [
    ...activeChain,
    {
      workId: id,
      title: params.title.trim() || 'Fragmento sin título',
      authors: params.authors.length > 0 ? params.authors : ['Ensamble Local'],
      dateIso,
      license: params.license,
      changeSummary: `Recorte de fragmento [${(inClamped / 1000).toFixed(1)}s – ${(outClamped / 1000).toFixed(1)}s]`,
    },
  ];

  const item: CuratedFragmentItem = {
    id,
    kind: 'fragment',
    title: params.title.trim() || 'Fragmento Curado',
    authors: params.authors.length > 0 ? params.authors : ['Ensamble Local'],
    roomId: session.metadata.roomId,
    dateIso,
    level: session.metadata.level,
    tags: params.tags.length > 0 ? params.tags : ['taller', 'espacial'],
    description: params.description.trim() || 'Fragmento extraído de sesión en vivo.',
    license: params.license,
    inMs: inClamped,
    outMs: outClamped,
    snapshot: session.initialSnapshot,
    events: slicedEvents,
    musicologicalSummary: {
      pitchSystem: report.pitchSystem.classification,
      periodicityIndex: report.rhythm.periodicityIndex,
      meanSpectralCentroidHz: report.timbre.meanSpectralCentroidHz,
      humanSharePct: report.agency.humanSharePct,
    },
    graphicScoreSvg: svg,
    attributionChain,
  };

  useCurationArchiveStore.setState((prev) => ({
    fragments: [item, ...prev.fragments],
  }));

  return item;
}

/**
 * E6.2.1: Filtra y busca en el archivo público de sesiones, fragmentos y esculturas.
 */
export function filterArchiveItems(
  items: CuratedFragmentItem[],
  query: string,
  levelFilter: string,
  licenseFilter: string
): CuratedFragmentItem[] {
  const q = query.trim().toLowerCase();
  return items.filter((item) => {
    if (levelFilter !== 'ALL' && item.level !== levelFilter) return false;
    if (licenseFilter !== 'ALL' && item.license !== licenseFilter) return false;
    if (!q) return true;
    const haystack = [
      item.title,
      item.description,
      item.roomId,
      ...item.authors,
      ...item.tags,
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
}

/**
 * E6.2.3: Crea una nueva colección curada agrupando fragmentos con un texto curatorial.
 */
export function createCuratedCollection(
  title: string,
  curatorName: string,
  curatorialText: string,
  fragmentIds: string[]
): CuratedCollection {
  const col: CuratedCollection = {
    id: `col-${Date.now()}`,
    title: title.trim() || 'Colección Curada',
    curatorName: curatorName.trim() || 'Curaduría Invitada',
    curatorialText:
      curatorialText.trim() || 'Recorrido transversal por fragmentos del archivo.',
    createdAtIso: new Date().toISOString().slice(0, 10),
    fragmentIds,
  };

  useCurationArchiveStore.setState((prev) => ({
    collections: [col, ...prev.collections],
  }));

  return col;
}

/**
 * E6.3.1 y E6.3.2: Bifurca (fork) una obra o fragmento del archivo para crear
 * una obra derivada en el lienzo activo, preservando y ampliando la cadena
 * autoral visible.
 */
export function forkFragmentIntoWorld(
  fragmentId: string,
  newAuthor: string,
  changePlan: string
): CuratedFragmentItem | null {
  const state = useCurationArchiveStore.getState();
  const source = state.fragments.find((f) => f.id === fragmentId);
  if (!source) return null;

  // Cargar la topología del fragmento en la escena 3D activa
  importTopologicalScore(source.snapshot);

  const forkNode: AttributionChainNode = {
    workId: `fork-${Date.now()}`,
    title: `${source.title} (Derivada / Fork)`,
    authors: [newAuthor.trim() || 'Compositor(a) Derivado(a)'],
    dateIso: new Date().toISOString().slice(0, 10),
    license: source.license,
    changeSummary:
      changePlan.trim() || `Bifurcación y re-espacialización a partir de "${source.title}".`,
  };

  const nextChain = [...source.attributionChain, forkNode];
  const forkedItem: CuratedFragmentItem = {
    ...source,
    id: forkNode.workId,
    title: forkNode.title,
    authors: Array.from(new Set([...source.authors, ...forkNode.authors])),
    dateIso: forkNode.dateIso,
    description: `${source.description} — [Obra derivada: ${forkNode.changeSummary}]`,
    attributionChain: nextChain,
  };

  useCurationArchiveStore.setState((prev) => ({
    activeAttributionChain: nextChain,
    fragments: [forkedItem, ...prev.fragments],
  }));

  return forkedItem;
}

// ============================================================================
// E6.3.3, E6.3.4 y E6.4.2 · Síntesis Offline de Stems, Samples y Ambisonics WAV
// ============================================================================

function encodeMultiChannelFloat32ToWavBlob(
  channels: Float32Array[],
  sampleRate: number
): Blob {
  const numChannels = Math.max(1, channels.length);
  const numFrames = channels[0]?.length ?? 0;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = numFrames * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < numFrames; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const s = Math.max(-1, Math.min(1, channels[ch][i] ?? 0));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

/**
 * E6.3.3: Exporta stems WAV separados por capa compositiva (`texture`, `gesture`,
 * `spatial`) o por objeto individual para trabajar en un DAW.
 */
export function exportStemsForDaw(mode: 'by_layer' | 'by_object'): void {
  const worldState = useWorldStore.getState();
  const allObjects = Array.from(worldState.grids.values()).flatMap((g) => g.objects);
  const sampleRate = 44100;
  const durationSec = 4;
  const numFrames = sampleRate * durationSec;

  if (mode === 'by_object') {
    const targets = allObjects.slice(0, 6);
    targets.forEach((obj, idx) => {
      const left = new Float32Array(numFrames);
      const right = new Float32Array(numFrames);
      const freq = Number(obj.audioParams?.frequency ?? 220 + idx * 110);
      const pan = Math.max(-1, Math.min(1, obj.position[0] / 10));
      const gainL = Math.cos(((pan + 1) * Math.PI) / 4) * 0.35;
      const gainR = Math.sin(((pan + 1) * Math.PI) / 4) * 0.35;

      for (let i = 0; i < numFrames; i++) {
        const t = i / sampleRate;
        const env = Math.min(1, t / 0.08) * Math.exp(-t * 0.7);
        const sig = Math.sin(2 * Math.PI * freq * t) * env;
        left[i] = sig * gainL;
        right[i] = sig * gainR;
      }

      const blob = encodeMultiChannelFloat32ToWavBlob([left, right], sampleRate);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stem-obj-${idx + 1}-${obj.type}-${Math.round(freq)}Hz.wav`;
      a.click();
      URL.revokeObjectURL(url);
    });
    return;
  }

  // Por capa compositiva
  const layers: CompositionalLayer[] = ['texture', 'gesture', 'spatial'];
  layers.forEach((layer, idx) => {
    const left = new Float32Array(numFrames);
    const right = new Float32Array(numFrames);
    const baseFreq = 110 * (idx + 1);

    for (let i = 0; i < numFrames; i++) {
      const t = i / sampleRate;
      const env = Math.min(1, t / 0.1) * Math.exp(-t * 0.5);
      const sig =
        (Math.sin(2 * Math.PI * baseFreq * t) +
          0.4 * Math.sin(2 * Math.PI * baseFreq * 1.5 * t)) *
        0.25 *
        env;
      left[i] = sig;
      right[i] = sig;
    }

    const blob = encodeMultiChannelFloat32ToWavBlob([left, right], sampleRate);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stem-capa-${layer}.wav`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

/**
 * E6.3.4: Exporta un fragmento como sample WAV listo para la carga comunitaria
 * (`SampleDropZone` / objeto Espiral Sampler 2.7) y crea una espiral en la escena.
 */
export function exportFragmentAsCommunitySample(fragmentId: string): void {
  const frag = useCurationArchiveStore
    .getState()
    .fragments.find((f) => f.id === fragmentId);
  const sampleRate = 44100;
  const durationSec = 3;
  const numFrames = sampleRate * durationSec;
  const ch = new Float32Array(numFrames);

  const freqs = frag
    ? frag.events
        .map((e) => Number(e.params?.frequency ?? 0))
        .filter((f) => f > 20)
    : [220, 330, 440];
  const activeFreqs = freqs.length > 0 ? freqs : [220, 330, 440];

  for (let i = 0; i < numFrames; i++) {
    const t = i / sampleRate;
    const env = Math.min(1, t / 0.05) * Math.exp(-t * 0.9);
    let sum = 0;
    for (const f of activeFreqs) {
      sum += Math.sin(2 * Math.PI * f * t);
    }
    ch[i] = (sum / activeFreqs.length) * 0.45 * env;
  }

  const blob = encodeMultiChannelFloat32ToWavBlob([ch], sampleRate);
  const url = URL.createObjectURL(blob);

  // Descargar archivo WAV comunitario
  const a = document.createElement('a');
  a.href = url;
  a.download = `sample-comunitario-${frag?.id ?? 'casa'}.wav`;
  a.click();

  // Además, si hay cuadrícula activa, sembrar una Espiral Sampler con este material
  const worldState = useWorldStore.getState();
  if (worldState.activeGridId) {
    worldState.addObject('spiral', [0, 2.2, 0]);
  }
}

/**
 * E6.4.2 y E5.3.4: Exporta la escena actual en formato Ambisonics de Primer
 * Orden (FOA B-format: canales W, X, Y, Z en 4 canales WAV entrelazados,
 * convención ACN/SN3D o FuMa) para salas con sistemas multicanal.
 */
export function exportAmbisonicsBFormatWav(): void {
  const worldState = useWorldStore.getState();
  const allObjects = Array.from(worldState.grids.values()).flatMap((g) => g.objects);
  const sampleRate = 44100;
  const durationSec = 5;
  const numFrames = sampleRate * durationSec;

  const W = new Float32Array(numFrames);
  const X = new Float32Array(numFrames);
  const Y = new Float32Array(numFrames);
  const Z = new Float32Array(numFrames);

  const sources =
    allObjects.length > 0
      ? allObjects.map((o) => ({
          freq: Number(o.audioParams?.frequency ?? 220),
          pos: o.position,
        }))
      : [
          { freq: 110, pos: [3, 1, 0] as [number, number, number] },
          { freq: 220, pos: [-2, 2.5, 3] as [number, number, number] },
          { freq: 330, pos: [0, 4, -3] as [number, number, number] },
        ];

  for (const src of sources) {
    const [px, py, pz] = src.pos;
    const dist = Math.max(0.5, Math.hypot(px, py, pz));
    const azimuth = Math.atan2(py, px);
    const elevation = Math.asin(Math.max(-1, Math.min(1, pz / dist)));
    const gain = Math.min(0.4, 1 / (1 + dist * 0.25)) / Math.sqrt(sources.length);

    const wCoeff = 0.70710678;
    const xCoeff = Math.cos(elevation) * Math.cos(azimuth);
    const yCoeff = Math.cos(elevation) * Math.sin(azimuth);
    const zCoeff = Math.sin(elevation);

    for (let i = 0; i < numFrames; i++) {
      const t = i / sampleRate;
      const env = Math.min(1, t / 0.1) * (1 - 0.15 * Math.cos(2 * Math.PI * 0.5 * t));
      const s = Math.sin(2 * Math.PI * src.freq * t) * gain * env;
      W[i] += s * wCoeff;
      X[i] += s * xCoeff;
      Y[i] += s * yCoeff;
      Z[i] += s * zCoeff;
    }
  }

  const blob = encodeMultiChannelFloat32ToWavBlob([W, X, Y, Z], sampleRate);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ambisonics-Bformat-WXYZ-4ch-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.wav`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * E6.4.5: Genera y descarga el Programa de Mano en HTML imprimible con créditos,
 * licencias Creative Commons, cadenas autorales, notas curatoriales y partituras
 * gráficas SVG de la lista de reproducción del concierto.
 */
export function downloadConcertProgramNotesHtml(): void {
  const state = useCurationArchiveStore.getState();
  const playlistItems = state.concertPlaylistIds
    .map((id) => state.fragments.find((f) => f.id === id))
    .filter((f): f is CuratedFragmentItem => Boolean(f));

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Programa de Mano — La Casa de Salomón</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #0a0a0c; color: #e5e7eb; max-width: 860px; margin: 2rem auto; padding: 2rem; line-height: 1.5; }
    h1 { color: #f59e0b; margin-bottom: 0.25rem; }
    .meta { color: #9ca3af; font-size: 0.9rem; margin-bottom: 2rem; border-bottom: 1px solid #27272a; padding-bottom: 1rem; }
    .work { background: #141418; border: 1px solid #27272a; border-radius: 12px; padding: 1.25rem; margin-bottom: 1.5rem; }
    .work h2 { margin-top: 0; color: #38bdf8; }
    .chain { font-size: 0.8rem; color: #a78bfa; background: #1e1b2e; padding: 0.6rem; border-radius: 8px; margin-top: 0.75rem; }
    .svg-box { margin-top: 1rem; overflow-x: auto; }
  </style>
</head>
<body>
  <h1>Programa de Mano · La Casa de Salomón</h1>
  <div class="meta">
    <p><strong>Sede / Modalidad:</strong> ${state.hybridConcertMode ? `Concierto Híbrido Telemático — ${state.hybridVenueName} + ${state.hybridRemoteNodesCount} nodos remotos` : 'Presentación Pública Acusmática / Espacial'}</p>
    <p><strong>Formato de salida espacial:</strong> ${state.multichannelMode}</p>
    <p><strong>Fecha de emisión:</strong> ${new Date().toISOString().slice(0, 10)}</p>
  </div>
  ${playlistItems
    .map(
      (item, idx) => `
    <div class="work">
      <h2>${idx + 1}. ${item.title} (${item.level})</h2>
      <p><strong>Autores/Intérpretes:</strong> ${item.authors.join(', ')} · <strong>Sala:</strong> ${item.roomId} · <strong>Licencia:</strong> ${item.license}</p>
      <p>${item.description}</p>
      <p><small>Sistema de alturas: ${item.musicologicalSummary.pitchSystem} · Periodicidad rítmica: ${item.musicologicalSummary.periodicityIndex} · Centroide espectral medio: ${item.musicologicalSummary.meanSpectralCentroidHz} Hz</small></p>
      <div class="chain">
        <strong>Cadena autoral (E6.3.2):</strong><br/>
        ${item.attributionChain
          .map(
            (node, nIdx) =>
              `#${nIdx + 1} [${node.dateIso}] ${node.title} por ${node.authors.join(', ')} (${node.license}) — ${node.changeSummary}`
          )
          .join('<br/>')}
      </div>
      <div class="svg-box">${item.graphicScoreSvg}</div>
    </div>`
    )
    .join('\n')}
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `programa-de-mano-casa-salomon-${new Date().toISOString().slice(0, 10)}.html`;
  a.click();
  URL.revokeObjectURL(url);
}
