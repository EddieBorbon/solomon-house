import { create } from 'zustand';
import {
  useWorldStore,
  type SoundObject,
  type SoundObjectType,
} from '../../state/useWorldStore';
import {
  useMappingStore,
  startMappingRuntime,
  SOURCE_LABELS,
  TARGET_LABELS,
  evaluateMapping,
  type ParameterMapping,
} from './MappingEngine';
import { recordSessionEvent } from '../session/sessionRecorder';

/**
 * Coherencia Visual-Sonora, Lógica Explícita, Modo Acusmático y Prueba
 * Perceptual (Roadmap Funcional Jurado — Etapa E3 completa).
 *
 * Cubre:
 *  - E3.1.1: Lógica base documentada por tipo de objeto (tamaño → registro,
 *            altura Y → brillo espectral, rotación → modulación, forma →
 *            familia tímbrica).
 *  - E3.1.2: Aplicación automática de mapeos al crear un objeto, con opción
 *            de desactivarlos o editarlos.
 *  - E3.1.3: Tres presets de lógica seleccionables por sala: estructural,
 *            gestual y simbólica.
 *  - E3.2.3: Registro de instantes de disparo (envolvente ataque/decaimiento)
 *            para animar visualmente cada objeto al sonar.
 *  - E3.3.1: Inspector "¿Por qué suena así?" del objeto seleccionado.
 *  - E3.3.2: Leyenda de la sala con la lógica visual-sonora vigente.
 *  - E3.4.1: Modo acusmático experimental que oculta las fuentes visuales.
 *  - E3.4.2 / E3.4.3: Prueba perceptual interactiva (tasa de acierto frente al
 *            azar 1/N) integrada con E1 y exportable para la tesis.
 */

export type VisualSonicPresetId = 'structural' | 'gestural' | 'symbolic';

export interface ObjectTimbralLogicDoc {
  type: SoundObjectType;
  shapeName: string;
  synthFamily: string;
  morphologicalRationale: string;
  defaultRegisterHz: [number, number];
}

/**
 * Documentación explícita de la relación forma geométrica → familia tímbrica
 * (E3.1.1 — Observación de Hugo Solís).
 */
export const OBJECT_TIMBRAL_LOGIC: Record<SoundObjectType, ObjectTimbralLogicDoc> = {
  cube: {
    type: 'cube',
    shapeName: 'Cubo',
    synthFamily: 'AMSynth (Modulación de Amplitud)',
    morphologicalRationale:
      'Sus 6 caras ortogonales producen bandas laterales simétricas (portadora ± moduladora), generando un timbre estable y arquitectónico.',
    defaultRegisterHz: [110, 440],
  },
  sphere: {
    type: 'sphere',
    shapeName: 'Esfera',
    synthFamily: 'FMSynth (Modulación de Frecuencia)',
    morphologicalRationale:
      'Superficie continua sin aristas cuya curvatura controla el índice de modulación armónica continua desde el seno puro hasta el espectro complejo.',
    defaultRegisterHz: [165, 660],
  },
  cylinder: {
    type: 'cylinder',
    shapeName: 'Cilindro',
    synthFamily: 'DuoSynth (Doble Oscilador Acoplado)',
    morphologicalRationale:
      'Sus dos bases circulares paralelas encarnan dos voces acopladas con batimento y detune controlado por su proporción axial.',
    defaultRegisterHz: [82, 330],
  },
  cone: {
    type: 'cone',
    shapeName: 'Cono',
    synthFamily: 'MembraneSynth (Percusión de Membrana)',
    morphologicalRationale:
      'Del círculo basal al vértice agudo proyecta un transitorio de ataque percusivo con caída exponencial de altura (pitch decay).',
    defaultRegisterHz: [55, 220],
  },
  pyramid: {
    type: 'pyramid',
    shapeName: 'Pirámide',
    synthFamily: 'MonoSynth con Filtro Resonante',
    morphologicalRationale:
      'Convergencia de 4 aristas hacia el ápice análoga a un filtro paso-bajo resonante (Q alto) que recorta el espectro hacia la cúspide.',
    defaultRegisterHz: [98, 523],
  },
  icosahedron: {
    type: 'icosahedron',
    shapeName: 'Icosaedro',
    synthFamily: 'MetalSynth (Inarmónico Metálico)',
    morphologicalRationale:
      'Sus 20 caras triangulares reflejan parciales inarmónicos densos propios de campanas, címbalos y placas resonantes.',
    defaultRegisterHz: [220, 1760],
  },
  plane: {
    type: 'plane',
    shapeName: 'Plano',
    synthFamily: 'NoiseSynth (Espectro Estocástico)',
    morphologicalRationale:
      'Superficie extendida sin volumen cerrado que actúa como velo textural de ruido blanco, rosa o marrón filtrado.',
    defaultRegisterHz: [100, 1200],
  },
  torus: {
    type: 'torus',
    shapeName: 'Toro (Anillo)',
    synthFamily: 'PluckSynth (Cuerda Pulsada Karplus-Strong)',
    morphologicalRationale:
      'Lazo cerrado que modela una línea de retardo realimentada (waveguide circular) de excitación punteada.',
    defaultRegisterHz: [130, 784],
  },
  dodecahedronRing: {
    type: 'dodecahedronRing',
    shapeName: 'Anillo Dodecaédrico',
    synthFamily: 'PolySynth (Acorde Polifónico)',
    morphologicalRationale:
      'Constelación de poliedros en órbita que sintetiza múltiples voces armónicas simultáneas (clusters o acordes).',
    defaultRegisterHz: [146, 880],
  },
  spiral: {
    type: 'spiral',
    shapeName: 'Espiral',
    synthFamily: 'Sampler / Nube Granular',
    morphologicalRationale:
      'Trayectoria helicoidal abierta que recorre muestras grabadas y fragmentos temporales en bucle.',
    defaultRegisterHz: [110, 880],
  },
  custom: {
    type: 'custom',
    shapeName: 'Geometría Programable',
    synthFamily: 'Síntesis por Código / Csound WASM',
    morphologicalRationale:
      'Correspondencia algorítmica directa definida por el usuario entre ecuaciones paramétricas 3D y grafo DSP.',
    defaultRegisterHz: [65, 1320],
  },
};

export interface VisualSonicPresetDefinition {
  id: VisualSonicPresetId;
  name: string;
  subtitle: string;
  rulesSummary: string[];
  buildMappingsForObject: (objectId: string, type: SoundObjectType) => ParameterMapping[];
}

export const VISUAL_SONIC_PRESETS: Record<VisualSonicPresetId, VisualSonicPresetDefinition> = {
  structural: {
    id: 'structural',
    name: 'Lógica Estructural (Físico-Acústica)',
    subtitle: 'Tamaño → Registro inverso · Altura Y → Brillo · Rotación → Armonicidad',
    rulesSummary: [
      'Tamaño (Escala X): más grande = más grave (curva exponencial inversa, 1320 → 65 Hz).',
      'Altura vertical (Posición Y): más elevado = mayor índice de modulación / brillo espectral.',
      'Rotación Y: controla la relación de armonicidad (0.5 a 6).',
      'Forma geométrica: determina la familia de síntesis (AM, FM, Membrana, Metal, Karplus-Strong).',
    ],
    buildMappingsForObject: (objectId, type) => {
      const [minF, maxF] = OBJECT_TIMBRAL_LOGIC[type]?.defaultRegisterHz ?? [110, 880];
      return [
        {
          id: `auto-${objectId}-size-freq`,
          source: 'scaleX',
          target: 'frequency',
          curve: 'exponencial',
          shape: 1.8,
          inMin: 0.3,
          inMax: 3.0,
          // Inverso: escala 0.3 -> maxF (agudo), escala 3.0 -> minF (grave)
          outMin: maxF,
          outMax: minF,
          enabled: true,
        },
        {
          id: `auto-${objectId}-height-bright`,
          source: 'posY',
          target: 'modulationIndex',
          curve: 'lineal',
          shape: 1,
          inMin: 0,
          inMax: 8,
          outMin: 1,
          outMax: 28,
          enabled: true,
        },
        {
          id: `auto-${objectId}-rot-harm`,
          source: 'rotY',
          target: 'harmonicity',
          curve: 'lineal',
          shape: 1,
          inMin: 0,
          inMax: 6.28,
          outMin: 0.5,
          outMax: 5.0,
          enabled: true,
        },
      ];
    },
  },
  gestural: {
    id: 'gestural',
    name: 'Lógica Gestual (Cinético-Expresiva)',
    subtitle: 'Eje X → Altura continua · Altura Y → Vibrato · Escala Y → Ataque',
    rulesSummary: [
      'Posición lateral (X): cinta continua de alturas (izquierda grave → derecha aguda).',
      'Altura vertical (Y): intensifica la velocidad de vibrato y modulación expresiva.',
      'Estiramiento vertical (Escala Y): alarga el ataque de la envolvente (percusivo → arco lento).',
    ],
    buildMappingsForObject: (objectId, type) => {
      const [minF, maxF] = OBJECT_TIMBRAL_LOGIC[type]?.defaultRegisterHz ?? [110, 880];
      return [
        {
          id: `auto-${objectId}-posx-freq`,
          source: 'posX',
          target: 'frequency',
          curve: 'exponencial',
          shape: 1.5,
          inMin: -10,
          inMax: 10,
          outMin: minF,
          outMax: maxF,
          enabled: true,
        },
        {
          id: `auto-${objectId}-posy-vibrato`,
          source: 'posY',
          target: 'vibratoRate',
          curve: 'lineal',
          shape: 1,
          inMin: 0,
          inMax: 8,
          outMin: 1,
          outMax: 10,
          enabled: true,
        },
        {
          id: `auto-${objectId}-scaley-attack`,
          source: 'scaleY',
          target: 'ampAttack',
          curve: 'logaritmica',
          shape: 1.4,
          inMin: 0.3,
          inMax: 3.0,
          outMin: 0.01,
          outMax: 1.2,
          enabled: true,
        },
      ];
    },
  },
  symbolic: {
    id: 'symbolic',
    name: 'Lógica Simbólica (Topológico-Ritual)',
    subtitle: 'Profundidad Z → Registro · Altura Y → Resonancia · Escala → Volumen',
    rulesSummary: [
      'Profundidad (Eje Z): norte-sur ritual del registro armónico.',
      'Altura vertical (Y): prolonga la cola de liberación (release) hacia la bóveda.',
      'Escala global: pondera la presencia dinámica (volumen) en el ensamble.',
    ],
    buildMappingsForObject: (objectId, type) => {
      const [minF, maxF] = OBJECT_TIMBRAL_LOGIC[type]?.defaultRegisterHz ?? [110, 880];
      return [
        {
          id: `auto-${objectId}-posz-freq`,
          source: 'posZ',
          target: 'frequency',
          curve: 'sigmoide',
          shape: 2,
          inMin: -10,
          inMax: 10,
          outMin: minF,
          outMax: maxF,
          enabled: true,
        },
        {
          id: `auto-${objectId}-posy-release`,
          source: 'posY',
          target: 'ampRelease',
          curve: 'lineal',
          shape: 1,
          inMin: 0,
          inMax: 8,
          outMin: 0.15,
          outMax: 3.5,
          enabled: true,
        },
        {
          id: `auto-${objectId}-scale-vol`,
          source: 'scaleX',
          target: 'volume',
          curve: 'logaritmica',
          shape: 1.2,
          inMin: 0.3,
          inMax: 3.0,
          outMin: 0.2,
          outMax: 0.9,
          enabled: true,
        },
      ];
    },
  },
};

export interface PerceptualTrialRecord {
  id: string;
  timestampIso: string;
  preset: VisualSonicPresetId;
  candidateObjectIds: string[];
  targetObjectId: string;
  targetType: SoundObjectType;
  guessedObjectId: string;
  correct: boolean;
  chanceProbability: number; // 1 / N
  responseTimeMs: number;
}

export interface VisualSonicState {
  activePreset: VisualSonicPresetId;
  autoApplyMappingsOnCreate: boolean;
  showRoomLegend: boolean;
  acousmaticMode: boolean; // E3.4.1
  /** Marca de tiempo (performance.now) del último disparo por id de objeto para animar envolvente (E3.2.3) */
  lastTriggerTimestamps: Record<string, number>;
  // Prueba perceptual (E3.4.2 y E3.4.3)
  activeTrialTargetId: string | null;
  activeTrialStartedAtMs: number | null;
  perceptualTrials: PerceptualTrialRecord[];
}

export const useVisualSonicStore = create<VisualSonicState>(() => ({
  activePreset: 'structural',
  autoApplyMappingsOnCreate: true,
  showRoomLegend: false,
  acousmaticMode: false,
  lastTriggerTimestamps: {},
  activeTrialTargetId: null,
  activeTrialStartedAtMs: null,
  perceptualTrials: [],
}));

/**
 * Aplica automáticamente los mapeos por defecto del preset activo al crear un
 * objeto sonoro (E3.1.2).
 */
export function applyDefaultMappingsForNewObject(
  objectId: string,
  type: SoundObjectType
): void {
  const state = useVisualSonicStore.getState();
  if (!state.autoApplyMappingsOnCreate) return;

  const presetDef = VISUAL_SONIC_PRESETS[state.activePreset];
  const mappings = presetDef.buildMappingsForObject(objectId, type);
  const mappingStore = useMappingStore.getState();

  mappings.forEach((m) => mappingStore.addMapping(objectId, m));
  startMappingRuntime();
}

/**
 * Cambia el preset de lógica visual-sonora de la sala y actualiza los mapeos
 * automáticos de todos los objetos existentes (E3.1.3).
 */
export function setRoomVisualSonicPreset(preset: VisualSonicPresetId): void {
  useVisualSonicStore.setState({ activePreset: preset });

  const { grids } = useWorldStore.getState();
  const mappingStore = useMappingStore.getState();
  const presetDef = VISUAL_SONIC_PRESETS[preset];

  grids.forEach((grid) => {
    (grid.objects ?? []).forEach((obj) => {
      // Reemplazar los mapeos automáticos previos conservando los manuales
      const existing = mappingStore.getMappings(obj.id);
      existing
        .filter((m) => m.id.startsWith('auto-'))
        .forEach((m) => mappingStore.removeMapping(obj.id, m.id));

      const fresh = presetDef.buildMappingsForObject(obj.id, obj.type);
      fresh.forEach((m) => mappingStore.addMapping(obj.id, m));
    });
  });

  startMappingRuntime();
}

/** Registra un pulso/disparo para que el objeto ejecute su animación de envolvente (E3.2.3). */
export function notifyObjectSoundTriggered(objectId: string): void {
  const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
  useVisualSonicStore.setState((state) => ({
    lastTriggerTimestamps: {
      ...state.lastTriggerTimestamps,
      [objectId]: now,
    },
  }));
}

export interface ObjectSoundExplanation {
  objectId: string;
  shapeName: string;
  synthFamily: string;
  morphologicalRationale: string;
  currentFrequencyHz: number;
  registerLabel: string;
  activePresetName: string;
  activeMappingsDescriptions: string[];
  activeEffects: string[];
}

/**
 * Genera la explicación legible "¿Por qué suena así?" para el objeto
 * seleccionado (E3.3.1).
 */
export function explainWhyObjectSoundsLikeThis(
  object: SoundObject
): ObjectSoundExplanation {
  const doc = OBJECT_TIMBRAL_LOGIC[object.type] ?? OBJECT_TIMBRAL_LOGIC.cube;
  const freq = Math.round(Number(object.audioParams?.frequency ?? 440));
  const registerLabel =
    freq < 130
      ? 'Registro grave (cuerpo grande / base)'
      : freq < 520
        ? 'Registro medio (escala estándar)'
        : 'Registro agudo (escala reducida / posición alta)';

  const preset = VISUAL_SONIC_PRESETS[useVisualSonicStore.getState().activePreset];
  const mappings = useMappingStore.getState().getMappings(object.id);

  const activeMappingsDescriptions = mappings
    .filter((m) => m.enabled)
    .map((m) => {
      const srcVal =
        m.source === 'posX'
          ? object.position[0]
          : m.source === 'posY'
            ? object.position[1]
            : m.source === 'posZ'
              ? object.position[2]
              : m.source === 'scaleX'
                ? object.scale[0]
                : m.source === 'scaleY'
                  ? object.scale[1]
                  : m.source === 'scaleZ'
                    ? object.scale[2]
                    : m.source === 'rotX'
                      ? object.rotation[0]
                      : m.source === 'rotY'
                        ? object.rotation[1]
                        : object.rotation[2];
      const outVal = evaluateMapping(m, srcVal);
      return `${SOURCE_LABELS[m.source]} (${srcVal.toFixed(2)}) ──[${m.curve}]──► ${TARGET_LABELS[m.target]} (${outVal.toFixed(1)})`;
    });

  // Zonas de efecto cercanas
  const activeEffects: string[] = [];
  const { grids } = useWorldStore.getState();
  grids.forEach((g) => {
    (g.effectZones ?? []).forEach((z) => {
      const dist = Math.hypot(
        object.position[0] - z.position[0],
        object.position[1] - z.position[1],
        object.position[2] - z.position[2]
      );
      const radius = z.effectParams?.radius ?? Math.max(...z.scale) * 1.5;
      if (dist <= radius) {
        activeEffects.push(`${z.type} (d=${dist.toFixed(1)}m)`);
      }
    });
  });

  return {
    objectId: object.id,
    shapeName: doc.shapeName,
    synthFamily: doc.synthFamily,
    morphologicalRationale: doc.morphologicalRationale,
    currentFrequencyHz: freq,
    registerLabel,
    activePresetName: preset.name,
    activeMappingsDescriptions,
    activeEffects,
  };
}

// ============================================================================
// E3.4.2 y E3.4.3 · Prueba Perceptual de Reconocimiento Objeto–Sonido
// ============================================================================

/**
 * Inicia un ensayo de la prueba perceptual: elige un objeto al azar de la
 * escena, dispara su sonido y espera a que la persona participante adivine
 * qué objeto sonó observando su forma, escala y posición (E3.4.2).
 */
export function startPerceptualTrial(): SoundObject | null {
  const worldState = useWorldStore.getState();
  const allObjects = Array.from(worldState.grids.values()).flatMap((g) => g.objects);

  // Si hay menos de 3 objetos en la escena, sembrar un trío contrastante de prueba
  if (allObjects.length < 3 && worldState.activeGridId) {
    worldState.addObject('cube', [-3, 0.8, 0]);
    worldState.addObject('sphere', [0, 3.2, 0]);
    worldState.addObject('icosahedron', [3, 5.0, 0]);
  }

  const refreshed = Array.from(useWorldStore.getState().grids.values()).flatMap(
    (g) => g.objects
  );
  if (refreshed.length === 0) return null;

  const target = refreshed[Math.floor(Math.random() * refreshed.length)];
  useVisualSonicStore.setState({
    activeTrialTargetId: target.id,
    activeTrialStartedAtMs: Date.now(),
  });

  useWorldStore.getState().triggerObjectNote(target.id);
  return target;
}

export function submitPerceptualGuess(guessedObjectId: string): PerceptualTrialRecord | null {
  const state = useVisualSonicStore.getState();
  if (!state.activeTrialTargetId) return null;

  const allObjects = Array.from(useWorldStore.getState().grids.values()).flatMap(
    (g) => g.objects
  );
  const targetObj = allObjects.find((o) => o.id === state.activeTrialTargetId);
  const n = Math.max(1, allObjects.length);
  const correct = guessedObjectId === state.activeTrialTargetId;
  const responseTimeMs = state.activeTrialStartedAtMs
    ? Math.max(50, Date.now() - state.activeTrialStartedAtMs)
    : 1000;

  const record: PerceptualTrialRecord = {
    id: `trial-${Date.now()}`,
    timestampIso: new Date().toISOString(),
    preset: state.activePreset,
    candidateObjectIds: allObjects.map((o) => o.id),
    targetObjectId: state.activeTrialTargetId,
    targetType: targetObj?.type ?? 'sphere',
    guessedObjectId,
    correct,
    chanceProbability: Math.round((1 / n) * 1000) / 1000,
    responseTimeMs,
  };

  useVisualSonicStore.setState((prev) => ({
    activeTrialTargetId: null,
    activeTrialStartedAtMs: null,
    perceptualTrials: [...prev.perceptualTrials, record],
  }));

  // Registrar resultado en E1 (E3.4.3)
  recordSessionEvent({
    type: 'marker',
    entityType: 'soundObject',
    entityId: record.targetObjectId,
    objectType: record.targetType,
    notes: `Prueba perceptual E3.4.2 [${record.preset}]: ${correct ? 'ACIERTO' : 'FALLO'} (azar ${(record.chanceProbability * 100).toFixed(1)}%, t=${responseTimeMs}ms)`,
  });

  return record;
}

export function getPerceptualSummaryStats(): {
  totalTrials: number;
  correctCount: number;
  accuracyPct: number;
  meanChancePct: number;
  aboveChance: boolean;
} {
  const trials = useVisualSonicStore.getState().perceptualTrials;
  if (trials.length === 0) {
    return {
      totalTrials: 0,
      correctCount: 0,
      accuracyPct: 0,
      meanChancePct: 33.3,
      aboveChance: false,
    };
  }
  const correctCount = trials.filter((t) => t.correct).length;
  const accuracyPct = Math.round((correctCount / trials.length) * 1000) / 10;
  const meanChancePct =
    Math.round(
      (trials.reduce((a, b) => a + b.chanceProbability, 0) / trials.length) * 1000
    ) / 10;
  return {
    totalTrials: trials.length,
    correctCount,
    accuracyPct,
    meanChancePct,
    aboveChance: accuracyPct > meanChancePct,
  };
}

/** Exporta los resultados de la prueba perceptual E3.4.2 listos para la tesis (E3.4.3). */
export function exportPerceptualEvaluationReport(): void {
  const stats = getPerceptualSummaryStats();
  const state = useVisualSonicStore.getState();
  const payload = {
    format: 'solomon-house/perceptual-evaluation-e3',
    exportedAt: new Date().toISOString(),
    activePreset: state.activePreset,
    summary: stats,
    trials: state.perceptualTrials,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `evaluacion-perceptual-e3-${payload.exportedAt.slice(0, 19).replace(/[:T]/g, '-')}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
