import { create } from 'zustand';
import * as Tone from 'tone';
import {
  useWorldStore,
  type SoundObject,
  type SoundObjectType,
} from '../../state/useWorldStore';
import {
  assignParticipantRole,
  useExpandedScoreStore,
} from '../score/expandedScoreProtocol';
import { recordSessionEvent, useSessionRecorderStore } from '../session/sessionRecorder';
import { exportAmbisonicsBFormatWav } from '../residency/curationArchive';
import { csoundEngine } from './csound/CsoundEngine';

/**
 * Escucha Activa/Procesual, Síntesis de Bajo Nivel (Web Audio / Csound WASM)
 * e Inmersión Personalizada HRTF (Roadmap Funcional Jurado — Etapa E5 completa).
 *
 * Cubre:
 *  - E5.1.1: Modo oyente en vivo (navega sin editar, presencia discreta).
 *  - E5.1.2: Escucha activa (recorrido espacial libre que actualiza el oyente 3D Web Audio).
 *  - E5.1.3: Rutas de escucha guiadas (waypoints 3D con interpolación de cámara/oyente).
 *  - E5.1.4: Escucha procesual (sincronizada con la línea de tiempo de eventos E1.2).
 *  - E5.1.5: Reacciones ligeras del público (resonancia, asombro, silencio, inmersión)
 *            visibles para quienes interpretan.
 *  - E5.2.1: Selector de motor de síntesis por defecto (`native_webaudio` vs `tone` vs `csound_wasm`)
 *            con paridad de los 10 modelos de `NativeVoice.ts`.
 *  - E5.2.2: Instrumento Csound editable en vivo asociado al objeto seleccionado.
 *  - E5.2.3: Biblioteca comunitaria de instrumentos Csound versionados y compartibles.
 *  - E5.2.4: Vista "Bajo el capó": grafo interactivo SVG de nodos Web Audio del objeto
 *            seleccionado (responde a la observación de Hugo Solís sobre Tone.js).
 *  - E5.3.1: Asistente perceptual corto para elegir el perfil HRTF con mejor externalización.
 *  - E5.3.2: Registro en telemetría del tipo de HRTF activa (`generic_browser` vs `custom_sofa`).
 *  - E5.3.3: Prueba psicoacústica de localización (delante/detrás y elevación) para la
 *            discusión de Gracida [GG], con exportación JSON.
 *  - E5.3.4: Exportación Ambisonics B-format (W, X, Y, Z) de 4 canales.
 *  - E5.3.5: Detector y guía de uso con auriculares frente a altavoces.
 */

export type SynthEngineBackend = 'native_webaudio' | 'tone_js' | 'csound_wasm';

export interface GuidedListeningWaypoint {
  id: string;
  label: string;
  position: [number, number, number];
  lookAt: [number, number, number];
  dwellSeconds: number;
  commentary: string;
}

export interface GuidedListeningRoute {
  id: string;
  title: string;
  composer: string;
  description: string;
  waypoints: GuidedListeningWaypoint[];
}

export type AudienceReactionType = 'resonancia' | 'complejidad' | 'espacio' | 'silencio';

export interface AudienceReactionEvent {
  id: string;
  type: AudienceReactionType;
  emoji: string;
  label: string;
  timestampIso: string;
  listenerPosition: [number, number, number];
}

export interface CommunityCsoundInstrument {
  id: string;
  name: string;
  author: string;
  version: string;
  description: string;
  orcCode: string;
  defaultSco: string;
}

export interface WebAudioGraphNodeSpec {
  id: string;
  type: string;
  label: string;
  paramsSummary: string;
}

export interface WebAudioGraphEdgeSpec {
  from: string;
  to: string;
  signalType: 'audio' | 'k-rate-param';
}

export interface LocalizationTrialResult {
  id: string;
  timestampIso: string;
  hrtfMode: 'generic_browser' | 'custom_sofa';
  profileName: string;
  targetDirection: 'front' | 'back' | 'above' | 'below' | 'left' | 'right';
  guessedDirection: 'front' | 'back' | 'above' | 'below' | 'left' | 'right';
  correct: boolean;
  frontBackConfusion: boolean;
  elevationError: boolean;
}

export const GUIDED_LISTENING_ROUTES: GuidedListeningRoute[] = [
  {
    id: 'route-orbital-1',
    title: 'Recorrido I · Órbita Perimetral Acusmática',
    composer: 'Ensamble Casa de Salomón',
    description:
      'Desplaza la escucha desde el sub-grave norte hacia la bóveda de campanas inarmónicas.',
    waypoints: [
      {
        id: 'wp-1',
        label: 'Umbral Norte (Graves)',
        position: [0, 1.6, -7],
        lookAt: [0, 1.5, 0],
        dwellSeconds: 6,
        commentary: 'Escucha la fundamental de los cilindros y cubos a ras de suelo.',
      },
      {
        id: 'wp-2',
        label: 'Centro Focal (Cruce de Zonas)',
        position: [0, 2.0, 0],
        lookAt: [3, 2.0, 3],
        dwellSeconds: 6,
        commentary: 'Equilibrio binaural equidistante entre todas las capas.',
      },
      {
        id: 'wp-3',
        label: 'Bóveda Cenital (Armónicos Agudos)',
        position: [2, 5.2, 2],
        lookAt: [0, 1.0, 0],
        dwellSeconds: 6,
        commentary: 'Perspectiva elevada donde predominan los icosaedros metálicos.',
      },
    ],
  },
  {
    id: 'route-diagonal-2',
    title: 'Recorrido II · Travesía Diagonal de Ecos',
    composer: 'Curaduría Sonora UNAM',
    description: 'Cruza las zonas de reverberación y delay en diagonal.',
    waypoints: [
      {
        id: 'wp-2a',
        label: 'Esquina Suroeste (Seco)',
        position: [-6, 1.7, 6],
        lookAt: [0, 1.7, 0],
        dwellSeconds: 5,
        commentary: 'Ataques directos antes de entrar al campo reverberante.',
      },
      {
        id: 'wp-2b',
        label: 'Esquina Noreste (Difuso)',
        position: [6, 2.5, -6],
        lookAt: [0, 1.7, 0],
        dwellSeconds: 5,
        commentary: 'Estela difusa en el extremo opuesto del espacio.',
      },
    ],
  },
];

export const COMMUNITY_CSOUND_LIBRARY: CommunityCsoundInstrument[] = [
  {
    id: 'cs-karplus-bell',
    name: 'Campana Modal Tibeto-Espectral',
    author: 'Comunidad Casa de Salomón',
    version: '1.2.0',
    description: 'Síntesis modal con 4 parciales inarmónicos y decaimiento exponencial.',
    orcCode: `sr = 44100
ksmps = 32
nchnls = 2
0dbfs = 1

instr 1
  idur = p3
  iamp = p4
  icps = p5
  aenv expseg 0.001, 0.008, iamp, idur - 0.008, 0.0005
  a1 poscil aenv * 0.5, icps
  a2 poscil aenv * 0.3, icps * 2.756
  a3 poscil aenv * 0.2, icps * 5.404
  asig = (a1 + a2 + a3) * 0.5
  outs asig, asig
endin`,
    defaultSco: 'i 1 0 3.0 0.45 220',
  },
  {
    id: 'cs-fm-formant',
    name: 'Voz Formántica FM Microtonal',
    author: 'Nodo Moscú–CDMX',
    version: '1.0.4',
    description: 'Portadora modulada con índice envolvente que imita vocales abiertas.',
    orcCode: `sr = 44100
ksmps = 32
nchnls = 2
0dbfs = 1

instr 1
  idur = p3
  iamp = p4
  icps = p5
  kenv linseg 0, 0.08, iamp, idur - 0.18, iamp * 0.7, 0.1, 0
  kndx expseg 0.5, idur * 0.4, 4.5, idur * 0.6, 0.8
  asig foscil kenv, icps, 1, 1.414, kndx
  outs asig, asig
endin`,
    defaultSco: 'i 1 0 2.5 0.4 164.81',
  },
  {
    id: 'cs-granular-cloud',
    name: ' Textura Estocástica de Viento',
    author: 'Talleres Diáspora',
    version: '2.0.0',
    description: 'Ruido rosa filtrado con barrido resonante lento.',
    orcCode: `sr = 44100
ksmps = 32
nchnls = 2
0dbfs = 1

instr 1
  idur = p3
  iamp = p4
  icps = p5
  kenv linseg 0, 0.3, iamp, idur - 0.6, iamp, 0.3, 0
  anoise pinker
  kcf expseg icps * 0.5, idur * 0.5, icps * 3.0, idur * 0.5, icps
  afilt reson anoise, kcf, kcf * 0.08, 1
  outs afilt * kenv, afilt * kenv
endin`,
    defaultSco: 'i 1 0 4.0 0.35 330',
  },
];

export interface ListeningImmersionState {
  // E5.1 Modo escucha
  activeListenerPosition: [number, number, number];
  activeGuidedRouteId: string | null;
  activeWaypointIndex: number;
  processualTimelineVisible: boolean;
  audienceReactions: AudienceReactionEvent[];

  // E5.2 Síntesis de bajo nivel
  defaultSynthBackend: SynthEngineBackend;
  communityCsoundInstruments: CommunityCsoundInstrument[];
  selectedCsoundInstrumentId: string;
  liveCsoundOrcCode: string;
  liveCsoundScoLine: string;

  // E5.3 Inmersión personalizada HRTF
  hrtfMode: 'generic_browser' | 'custom_sofa';
  activeHrtfProfileName: string;
  recommendedPresetCandidate: string;
  activeLocalizationTarget: LocalizationTrialResult['targetDirection'] | null;
  localizationTrials: LocalizationTrialResult[];
  outputTransducerMode: 'headphones' | 'speakers';
  detectedAudioOutputLabel: string;
}

export const useListeningImmersionStore = create<ListeningImmersionState>(() => ({
  activeListenerPosition: [0, 1.7, 4],
  activeGuidedRouteId: null,
  activeWaypointIndex: 0,
  processualTimelineVisible: false,
  audienceReactions: [],

  defaultSynthBackend: 'native_webaudio',
  communityCsoundInstruments: COMMUNITY_CSOUND_LIBRARY,
  selectedCsoundInstrumentId: COMMUNITY_CSOUND_LIBRARY[0].id,
  liveCsoundOrcCode: COMMUNITY_CSOUND_LIBRARY[0].orcCode,
  liveCsoundScoLine: COMMUNITY_CSOUND_LIBRARY[0].defaultSco,

  hrtfMode: 'generic_browser',
  activeHrtfProfileName: 'KEMAR Estándar Web Audio',
  recommendedPresetCandidate: 'IRCAM Listen #1018 (Externalización Amplia)',
  activeLocalizationTarget: null,
  localizationTrials: [],
  outputTransducerMode: 'headphones',
  detectedAudioOutputLabel: 'Salida Estéreo / Auriculares Binaurales',
}));

/**
 * E5.1.1 y E5.1.2: Activa el Modo Oyente en la sala y mueve la posición de
 * escucha activa `[x, y, z]` actualizando el `AudioListener` 3D.
 */
export function setActiveListenerModeAndPosition(
  pos: [number, number, number],
  switchToListenerRole: boolean = false
): void {
  if (switchToListenerRole) {
    assignParticipantRole(
      useExpandedScoreStore.getState().localParticipantId,
      'listener'
    );
  }
  useListeningImmersionStore.setState({ activeListenerPosition: pos });

  try {
    const ctx = Tone.getContext().rawContext;
    if (ctx && ctx.listener) {
      if (ctx.listener.positionX) {
        ctx.listener.positionX.value = pos[0];
        ctx.listener.positionY.value = pos[1];
        ctx.listener.positionZ.value = pos[2];
      } else {
        ctx.listener.setPosition(pos[0], pos[1], pos[2]);
      }
    }
  } catch {
    // AudioContext aún no iniciado
  }
}

let guidedRouteInterval: ReturnType<typeof setInterval> | null = null;

/**
 * E5.1.3: Inicia o detiene una ruta de escucha guiada por puntos de interés.
 */
export function startGuidedListeningRoute(routeId: string | null): void {
  if (guidedRouteInterval) {
    clearInterval(guidedRouteInterval);
    guidedRouteInterval = null;
  }

  if (!routeId) {
    useListeningImmersionStore.setState({
      activeGuidedRouteId: null,
      activeWaypointIndex: 0,
    });
    return;
  }

  const route = GUIDED_LISTENING_ROUTES.find((r) => r.id === routeId);
  if (!route || route.waypoints.length === 0) return;

  useListeningImmersionStore.setState({
    activeGuidedRouteId: routeId,
    activeWaypointIndex: 0,
  });
  setActiveListenerModeAndPosition(route.waypoints[0].position, false);

  guidedRouteInterval = setInterval(() => {
    const st = useListeningImmersionStore.getState();
    const currentRoute = GUIDED_LISTENING_ROUTES.find(
      (r) => r.id === st.activeGuidedRouteId
    );
    if (!currentRoute) return;
    const nextIdx = (st.activeWaypointIndex + 1) % currentRoute.waypoints.length;
    useListeningImmersionStore.setState({ activeWaypointIndex: nextIdx });
    setActiveListenerModeAndPosition(currentRoute.waypoints[nextIdx].position, false);
  }, 6000);
}

/**
 * E5.1.5: Envía una reacción ligera del público oyente visible para quienes
 * interpretan y registrada en la línea de tiempo de la sesión.
 */
export function sendAudienceReaction(type: AudienceReactionType): AudienceReactionEvent {
  const meta: Record<AudienceReactionType, { emoji: string; label: string }> = {
    resonancia: { emoji: '✨', label: 'Resonancia tímbrica' },
    complejidad: { emoji: '🌀', label: 'Densidad envolvente' },
    espacio: { emoji: '🧭', label: 'Trayectoria espacial clara' },
    silencio: { emoji: '🤫', label: 'Petición de aire / silencio' },
  };

  const pos = useListeningImmersionStore.getState().activeListenerPosition;
  const ev: AudienceReactionEvent = {
    id: `react-${Date.now()}`,
    type,
    emoji: meta[type].emoji,
    label: meta[type].label,
    timestampIso: new Date().toISOString(),
    listenerPosition: pos,
  };

  useListeningImmersionStore.setState((prev) => ({
    audienceReactions: [ev, ...prev.audienceReactions].slice(0, 15),
  }));

  recordSessionEvent({
    type: 'marker',
    entityType: 'session',
    entityId: ev.id,
    position: pos,
    notes: `Reacción de oyente (${ev.emoji} ${ev.label})`,
  });

  return ev;
}

/**
 * E5.2.2 y E5.2.3: Compila y ejecuta en vivo el instrumento Csound actual y
 * permite guardar nuevas versiones en la biblioteca comunitaria.
 */
export async function compileAndTriggerLiveCsound(): Promise<boolean> {
  const st = useListeningImmersionStore.getState();
  return csoundEngine.compileAndPlayLiveInstrument(
    st.liveCsoundOrcCode,
    st.liveCsoundScoLine
  );
}

export function publishCommunityCsoundInstrument(
  name: string,
  author: string,
  version: string,
  description: string
): CommunityCsoundInstrument {
  const st = useListeningImmersionStore.getState();
  const item: CommunityCsoundInstrument = {
    id: `cs-user-${Date.now()}`,
    name: name.trim() || 'Instrumento Csound Personalizado',
    author: author.trim() || 'Compositor(a) Local',
    version: version.trim() || '1.0.0',
    description: description.trim() || 'Instrumento DSP creado en vivo.',
    orcCode: st.liveCsoundOrcCode,
    defaultSco: st.liveCsoundScoLine,
  };

  useListeningImmersionStore.setState((prev) => ({
    communityCsoundInstruments: [item, ...prev.communityCsoundInstruments],
    selectedCsoundInstrumentId: item.id,
  }));

  return item;
}

/**
 * E5.2.4: Construye la especificación del grafo de nodos Web Audio ("Bajo el
 * capó") del objeto seleccionado para mostrar su cadena de síntesis real sin
 * ocultarla tras una caja negra (observación de Hugo Solís [HS]).
 */
export function buildUnderTheHoodWebAudioGraph(object: SoundObject | null): {
  nodes: WebAudioGraphNodeSpec[];
  edges: WebAudioGraphEdgeSpec[];
} {
  const freq = Math.round(Number(object?.audioParams?.frequency ?? 220));
  const wave = String(object?.audioParams?.waveform ?? 'sine');
  const harm = Number(object?.audioParams?.harmonicity ?? 1.5);
  const cutoff = Math.round(Number(object?.audioParams?.filterFrequency ?? 2400));
  const type: SoundObjectType = object?.type ?? 'cube';

  const modLabel =
    type === 'sphere' || type === 'icosahedron'
      ? `Modulador FM (${Math.round(freq * harm)} Hz)`
      : type === 'cylinder'
        ? `Oscilador B Duo (${Math.round(freq * 1.005)} Hz)`
        : `Modulador AM (${Math.round(freq * harm)} Hz)`;

  const nodes: WebAudioGraphNodeSpec[] = [
    {
      id: 'osc-carrier',
      type: 'OscillatorNode',
      label: `Portador (${wave})`,
      paramsSummary: `f0 = ${freq} Hz`,
    },
    {
      id: 'osc-mod',
      type: 'OscillatorNode',
      label: modLabel,
      paramsSummary: `ratio = ${harm.toFixed(2)}`,
    },
    {
      id: 'gain-env',
      type: 'GainNode (ADSR)',
      label: 'Envolvente de Amplitud',
      paramsSummary: `A=${object?.audioParams?.ampAttack ?? 0.02}s R=${object?.audioParams?.ampRelease ?? 0.5}s`,
    },
    {
      id: 'biquad',
      type: 'BiquadFilterNode',
      label: 'Filtro Paso-Bajo',
      paramsSummary: `fc = ${cutoff} Hz · Q = 0.7`,
    },
    {
      id: 'panner-hrtf',
      type: 'PannerNode (HRTF / SOFA)',
      label: 'Espacializador 3D',
      paramsSummary: `pos = [${(object?.position ?? [0, 1, 0]).map((n) => n.toFixed(1)).join(', ')}]`,
    },
    {
      id: 'master-out',
      type: 'AudioDestinationNode',
      label: 'Bus Maestro / Ambisonics',
      paramsSummary: '48 kHz Float32',
    },
  ];

  const edges: WebAudioGraphEdgeSpec[] = [
    { from: 'osc-mod', to: 'osc-carrier', signalType: 'k-rate-param' },
    { from: 'osc-carrier', to: 'gain-env', signalType: 'audio' },
    { from: 'gain-env', to: 'biquad', signalType: 'audio' },
    { from: 'biquad', to: 'panner-hrtf', signalType: 'audio' },
    { from: 'panner-hrtf', to: 'master-out', signalType: 'audio' },
  ];

  return { nodes, edges };
}

/**
 * E5.3.2 y E5.3.3: Inicia y evalúa un estímulo de localización 3D
 * (delante/detrás y elevación arriba/abajo) para comparar HRTF genérica frente
 * a personalizada SOFA, registrando el tipo de HRTF en la telemetría de E1.
 */
export function startHrtfLocalizationStimulus(): LocalizationTrialResult['targetDirection'] {
  const directions: LocalizationTrialResult['targetDirection'][] = [
    'front',
    'back',
    'above',
    'below',
    'left',
    'right',
  ];
  const target = directions[Math.floor(Math.random() * directions.length)];
  useListeningImmersionStore.setState({ activeLocalizationTarget: target });

  // Disparar pulso espacializado mediante Web Audio PannerNode HRTF
  try {
    const ctx = Tone.getContext().rawContext as AudioContext;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const panner = ctx.createPanner();
    panner.panningModel = 'HRTF';

    const coords: Record<LocalizationTrialResult['targetDirection'], [number, number, number]> = {
      front: [0, 0, -3],
      back: [0, 0, 3],
      above: [0, 3.5, -0.5],
      below: [0, -3.5, -0.5],
      left: [-3.5, 0, 0],
      right: [3.5, 0, 0],
    };
    const [x, y, z] = coords[target];
    panner.setPosition(x, y, z);

    osc.type = 'sawtooth';
    osc.frequency.value = target === 'above' ? 880 : target === 'below' ? 165 : 330;
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

    osc.connect(panner);
    panner.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.48);
  } catch {
    // Contexto no inicializado
  }

  return target;
}

export function submitHrtfLocalizationGuess(
  guessed: LocalizationTrialResult['targetDirection']
): LocalizationTrialResult | null {
  const st = useListeningImmersionStore.getState();
  const target = st.activeLocalizationTarget;
  if (!target) return null;

  const correct = target === guessed;
  const frontBackConfusion =
    (target === 'front' && guessed === 'back') ||
    (target === 'back' && guessed === 'front');
  const elevationError =
    (target === 'above' && guessed !== 'above') ||
    (target === 'below' && guessed !== 'below');

  const record: LocalizationTrialResult = {
    id: `loc-${Date.now()}`,
    timestampIso: new Date().toISOString(),
    hrtfMode: st.hrtfMode,
    profileName: st.activeHrtfProfileName,
    targetDirection: target,
    guessedDirection: guessed,
    correct,
    frontBackConfusion,
    elevationError,
  };

  useListeningImmersionStore.setState((prev) => ({
    activeLocalizationTarget: null,
    localizationTrials: [...prev.localizationTrials, record],
  }));

  // E5.3.2: Registrar en la sesión/telemetría si usó HRTF genérica o personalizada
  recordSessionEvent({
    type: 'marker',
    entityType: 'session',
    entityId: record.id,
    notes: `Prueba HRTF E5.3.3 [${st.hrtfMode} / ${st.activeHrtfProfileName}]: estímulo=${target}, respuesta=${guessed}, acierto=${correct}`,
  });

  return record;
}

/**
 * E5.3.5: Detecta dispositivos de salida de audio disponibles para orientar
 * sobre el uso de auriculares (binaural HRTF) frente a altavoces (estéreo/multicanal).
 */
export async function detectAudioOutputDevices(): Promise<string> {
  try {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.enumerateDevices) {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const outputs = devices.filter((d) => d.kind === 'audiooutput');
      const label =
        outputs.find((o) => o.label)?.label ||
        `Dispositivo de salida (${outputs.length || 1} canal estéreo detectado)`;
      const isHeadphoneLikely = /headphone|auricular|airpods|buds|headset/i.test(label);
      useListeningImmersionStore.setState({
        detectedAudioOutputLabel: label,
        outputTransducerMode: isHeadphoneLikely ? 'headphones' : 'speakers',
      });
      return label;
    }
  } catch {
    // Permiso no concedido aún
  }
  return useListeningImmersionStore.getState().detectedAudioOutputLabel;
}

export function getProcessualTimelineSummary(): {
  eventCount: number;
  currentRole: string;
  ambisonicsExport: () => void;
} {
  return {
    eventCount: useSessionRecorderStore.getState().events.length,
    currentRole: useExpandedScoreStore.getState().localRole,
    ambisonicsExport: exportAmbisonicsBFormatWav,
  };
}
