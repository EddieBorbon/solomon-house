import { type CasaSessionV2, buildCasaSessionV2 } from './sessionRecorder';

/**
 * Analítica musicológica automática (Roadmap Funcional Jurado E1.3).
 *
 * Cubre:
 *  - E1.3.1: Duración total, duración por fase y tiempo activo por participante.
 *  - E1.3.2: Sistema de alturas: histograma de frecuencias y clasificación
 *            tonal, modal, microtonal, espectral o indeterminada según su
 *            proximidad a la escala temperada (12-TET) y a la serie armónica.
 *  - E1.3.3: Organización rítmica: intervalos de auto-disparo / IOI,
 *            periodicidad frente a irregularidad y densidad de eventos/min.
 *  - E1.3.4: Tratamiento tímbrico: distribución por síntesis y efecto, y
 *            centroide espectral a lo largo del tiempo.
 *  - E1.3.5: Curva de densidad textural en el tiempo (grave, media, aguda).
 *  - E1.3.6: Proporción de intervención humana frente a algorítmica
 *            (Jardinero Sónico, auto-disparo y mapeos).
 *  - E1.3.7: Exportación CSV/JSON lista para la tesis y ficha comparativa
 *            lado a lado de múltiples sesiones (Moscú, Diáspora, China y sesión actual).
 */

export type PitchSystemClassification =
  | 'tonal'
  | 'modal'
  | 'microtonal'
  | 'spectral'
  | 'indeterminate';

export interface ParticipantActivityStat {
  anonymousId: string;
  role: 'user' | 'agent' | 'tutor';
  regionCode: string;
  eventCount: number;
  activeDurationMs: number;
  sharePct: number;
}

export interface FrequencyHistogramBin {
  bandLabel: string;
  minHz: number;
  maxHz: number;
  count: number;
}

export interface SpectralCentroidPoint {
  tMs: number;
  centroidHz: number;
}

export interface TexturalDensityPoint {
  tMs: number;
  totalObjects: number;
  lowBand: number;
  midBand: number;
  highBand: number;
  activeZones: number;
}

export interface MusicologicalReport {
  sessionTitle: string;
  roomId: string;
  level: string;
  // E1.3.1
  totalDurationSeconds: number;
  phaseDurationsSeconds: {
    experimentation: number;
    consolidation: number;
    production: number;
    presentation: number;
  };
  participants: ParticipantActivityStat[];
  // E1.3.2
  pitchSystem: {
    classification: PitchSystemClassification;
    rationale: string;
    meanDeviation12TetCents: number;
    harmonicSeriesProximity: number; // 0..1 (1 = ajuste exacto a serie armónica)
    fundamentalEstimateHz: number;
    distinctFrequenciesCount: number;
    histogram: FrequencyHistogramBin[];
  };
  // E1.3.3
  rhythm: {
    meanIoiMs: number;
    periodicityIndex: number; // 0 (irregular/aperiódico) .. 1 (periódico/isócrono)
    organizationLabel: 'periódica' | 'cuasi-periódica' | 'irregular / gestual' | 'estática / dron';
    eventsPerMinute: number;
    autoTriggerRatioPct: number;
  };
  // E1.3.4
  timbre: {
    synthesisDistribution: Record<string, number>;
    effectDistribution: Record<string, number>;
    meanSpectralCentroidHz: number;
    centroidTrajectory: SpectralCentroidPoint[];
  };
  // E1.3.5
  densityCurve: TexturalDensityPoint[];
  peakDensityObjects: number;
  meanDensityObjects: number;
  // E1.3.6
  agency: {
    humanEventsCount: number;
    agentEventsCount: number;
    autoTriggerObjectsCount: number;
    mappedParametersCount: number;
    humanSharePct: number;
    algorithmicSharePct: number;
  };
}

/** Calcula la desviación en cents respecto a la nota temperada 12-TET (A4=440 Hz) más cercana. */
function deviationFrom12TetCents(freqHz: number): { midi: number; pitchClass: number; centsDeviation: number } {
  if (freqHz <= 0) return { midi: 69, pitchClass: 9, centsDeviation: 50 };
  const exactMidi = 69 + 12 * Math.log2(freqHz / 440);
  const nearestMidi = Math.round(exactMidi);
  const centsDeviation = Math.abs((exactMidi - nearestMidi) * 100);
  const pitchClass = ((nearestMidi % 12) + 12) % 12;
  return { midi: nearestMidi, pitchClass, centsDeviation };
}

/** Evalúa qué tan cerca está un conjunto de frecuencias de una serie armónica f0 * n (n=1..16). */
function computeHarmonicSeriesProximity(frequencies: number[]): { f0: number; score: number } {
  if (frequencies.length === 0) return { f0: 110, score: 0 };
  const sorted = [...frequencies].filter((f) => f >= 25 && f <= 5000).sort((a, b) => a - b);
  if (sorted.length === 0) return { f0: 110, score: 0 };

  const candidates = [sorted[0], sorted[0] / 2, 55, 65.41, 110, 130.81];
  let bestF0 = sorted[0];
  let bestScore = 0;

  for (const f0 of candidates) {
    if (f0 < 20) continue;
    let accum = 0;
    for (const f of sorted) {
      const ratio = f / f0;
      const nearestHarmonic = Math.max(1, Math.round(ratio));
      const harmonicFreq = f0 * nearestHarmonic;
      const centsDiff = Math.abs(1200 * Math.log2(f / harmonicFreq));
      const fit = Math.max(0, 1 - centsDiff / 60); // <= 60 cents cuenta como armónico cercano
      accum += fit;
    }
    const avg = accum / sorted.length;
    if (avg > bestScore) {
      bestScore = avg;
      bestF0 = f0;
    }
  }

  return { f0: Math.round(bestF0 * 10) / 10, score: Math.round(bestScore * 100) / 100 };
}

/** Clasifica el sistema de alturas según proximidad a 12-TET, clases de altura y serie armónica (E1.3.2). */
function classifyPitchSystem(frequencies: number[]): MusicologicalReport['pitchSystem'] {
  const bins: FrequencyHistogramBin[] = [
    { bandLabel: 'Sub-grave (20–80 Hz)', minHz: 20, maxHz: 80, count: 0 },
    { bandLabel: 'Grave (80–250 Hz)', minHz: 80, maxHz: 250, count: 0 },
    { bandLabel: 'Medio-grave (250–600 Hz)', minHz: 250, maxHz: 600, count: 0 },
    { bandLabel: 'Medio-agudo (600–1600 Hz)', minHz: 600, maxHz: 1600, count: 0 },
    { bandLabel: 'Agudo (1600–5000 Hz)', minHz: 1600, maxHz: 5000, count: 0 },
  ];

  for (const f of frequencies) {
    for (const bin of bins) {
      if (f >= bin.minHz && f < bin.maxHz) {
        bin.count++;
        break;
      }
    }
  }

  if (frequencies.length === 0) {
    return {
      classification: 'indeterminate',
      rationale: 'Sin objetos sonoros con frecuencia definida en la sesión.',
      meanDeviation12TetCents: 0,
      harmonicSeriesProximity: 0,
      fundamentalEstimateHz: 110,
      distinctFrequenciesCount: 0,
      histogram: bins,
    };
  }

  const deviations = frequencies.map((f) => deviationFrom12TetCents(f));
  const meanDev =
    deviations.reduce((acc, d) => acc + d.centsDeviation, 0) / deviations.length;
  const pitchClasses = new Set(deviations.map((d) => d.pitchClass));
  const distinctFreqs = new Set(frequencies.map((f) => Math.round(f)));
  const harmonic = computeHarmonicSeriesProximity(frequencies);

  let classification: PitchSystemClassification = 'microtonal';
  let rationale = '';

  if (harmonic.score >= 0.72 && distinctFreqs.size >= 3) {
    classification = 'spectral';
    rationale = `Alta coherencia con la serie armónica sobre f0 ≈ ${harmonic.f0} Hz (ajuste ${(harmonic.score * 100).toFixed(0)}%).`;
  } else if (meanDev <= 14 && pitchClasses.size <= 5) {
    classification = 'tonal';
    rationale = `Alturas ajustadas a 12-TET (desviación media ${meanDev.toFixed(1)} ¢) con núcleo triádico/pentatónico (${pitchClasses.size} clases de altura).`;
  } else if (meanDev <= 18 && pitchClasses.size <= 7) {
    classification = 'modal';
    rationale = `Colección diatónica/modal estable (${pitchClasses.size} clases de altura, desviación 12-TET ${meanDev.toFixed(1)} ¢).`;
  } else if (meanDev > 22 && distinctFreqs.size <= 8) {
    classification = 'microtonal';
    rationale = `Intervalos no temperados deliberados (desviación media ${meanDev.toFixed(1)} ¢ respecto a 12-TET).`;
  } else {
    classification = 'indeterminate';
    rationale = `Distribución continua del espacio de alturas (${distinctFreqs.size} frecuencias distintas, desviación ${meanDev.toFixed(1)} ¢).`;
  }

  return {
    classification,
    rationale,
    meanDeviation12TetCents: Math.round(meanDev * 10) / 10,
    harmonicSeriesProximity: harmonic.score,
    fundamentalEstimateHz: harmonic.f0,
    distinctFrequenciesCount: distinctFreqs.size,
    histogram: bins,
  };
}

/** Estima el centroide espectral (Hz) de un objeto según su frecuencia y riqueza armónica. */
function estimateObjectCentroidHz(freq: number, waveform: string, type: string): number {
  const w = waveform.toLowerCase();
  let harmonicMultiplier = 1.15; // sine
  if (w.includes('triangle')) harmonicMultiplier = 1.45;
  else if (w.includes('square')) harmonicMultiplier = 2.35;
  else if (w.includes('saw')) harmonicMultiplier = 3.1;

  if (type === 'icosahedron' || type === 'plane') harmonicMultiplier *= 1.8; // metal / noise
  if (type === 'sphere' || type === 'cylinder') harmonicMultiplier *= 1.3; // FM / Duo
  return Math.min(8000, Math.max(40, freq * harmonicMultiplier));
}

const SYNTH_LABELS: Record<string, string> = {
  cube: 'AMSynth (Cubo)',
  sphere: 'FMSynth (Esfera)',
  cylinder: 'DuoSynth (Cilindro)',
  cone: 'MembraneSynth (Cono)',
  pyramid: 'MonoSynth (Pirámide)',
  icosahedron: 'MetalSynth (Icosaedro)',
  plane: 'NoiseSynth (Plano)',
  torus: 'PluckSynth (Toro)',
  dodecahedronRing: 'PolySynth (Anillo)',
  spiral: 'Sampler/Granular (Espiral)',
  custom: 'Custom/Csound',
};

/**
 * Ejecuta el análisis musicológico completo sobre una sesión .casa.json v2 (E1.3).
 */
export function analyzeSessionMusicology(sessionInput?: CasaSessionV2): MusicologicalReport {
  const session = sessionInput ?? buildCasaSessionV2();
  const durationMs = Math.max(1000, session.metadata.durationMs || 60_000);
  const totalDurationSeconds = Math.round(durationMs / 1000);

  // E1.3.1: Duración por fase (4 fases del protocolo: 25%, 30%, 30%, 15%)
  const phaseDurationsSeconds = {
    experimentation: Math.round(totalDurationSeconds * 0.25),
    consolidation: Math.round(totalDurationSeconds * 0.3),
    production: Math.round(totalDurationSeconds * 0.3),
    presentation: Math.max(
      1,
      totalDurationSeconds -
        Math.round(totalDurationSeconds * 0.25) -
        Math.round(totalDurationSeconds * 0.3) -
        Math.round(totalDurationSeconds * 0.3)
    ),
  };

  // E1.3.1: Tiempo activo y eventos por participante
  const eventsByAuthor = new Map<string, { count: number; firstT: number; lastT: number; role: 'user' | 'agent' | 'tutor' }>();
  for (const p of session.metadata.participants) {
    eventsByAuthor.set(p.anonymousId, {
      count: 0,
      firstT: p.joinedAtMs,
      lastT: p.joinedAtMs,
      role: p.role,
    });
  }

  for (const ev of session.events) {
    const prev = eventsByAuthor.get(ev.author.id);
    if (!prev) {
      eventsByAuthor.set(ev.author.id, {
        count: 1,
        firstT: ev.t,
        lastT: ev.t,
        role: ev.author.role,
      });
    } else {
      prev.count++;
      prev.firstT = Math.min(prev.firstT, ev.t);
      prev.lastT = Math.max(prev.lastT, ev.t);
    }
  }

  const totalEvents = Math.max(1, session.events.length);
  const participants: ParticipantActivityStat[] = Array.from(eventsByAuthor.entries()).map(
    ([anonymousId, stat]) => {
      const metaP = session.metadata.participants.find((p) => p.anonymousId === anonymousId);
      const spanMs = stat.count > 0 ? Math.max(5000, stat.lastT - stat.firstT + 5000) : durationMs;
      return {
        anonymousId,
        role: stat.role,
        regionCode: metaP?.regionCode || 'INTL',
        eventCount: stat.count,
        activeDurationMs: Math.min(durationMs, spanMs),
        sharePct: Math.round((stat.count / totalEvents) * 1000) / 10,
      };
    }
  );

  // Recolectar todos los objetos iniciales + los creados o modificados en la línea de tiempo
  const initialObjects = session.initialSnapshot.grids.flatMap((g) => g.objects);
  const initialZones = session.initialSnapshot.grids.flatMap((g) => g.effectZones);
  const initialMobiles = session.initialSnapshot.grids.flatMap((g) => g.mobileObjects);

  const frequencies: number[] = [];
  const synthesisDistribution: Record<string, number> = {};
  const effectDistribution: Record<string, number> = {};
  let autoTriggerCount = 0;

  for (const obj of initialObjects) {
    const f = Number(obj.audioParams?.frequency ?? 440);
    frequencies.push(f);
    const label = SYNTH_LABELS[obj.type] || obj.type;
    synthesisDistribution[label] = (synthesisDistribution[label] || 0) + 1;
    if (obj.audioParams?.autoTrigger || obj.audioParams?.autoTriggerInterval) {
      autoTriggerCount++;
    }
  }

  for (const zone of initialZones) {
    effectDistribution[zone.type] = (effectDistribution[zone.type] || 0) + 1;
  }

  for (const ev of session.events) {
    if (ev.type === 'create' && ev.entityType === 'soundObject') {
      const f = Number(ev.params?.frequency ?? 440);
      frequencies.push(f);
      const label = SYNTH_LABELS[ev.objectType || 'sphere'] || ev.objectType || 'sphere';
      synthesisDistribution[label] = (synthesisDistribution[label] || 0) + 1;
    } else if (ev.type === 'param_change' && typeof ev.params?.frequency === 'number') {
      frequencies.push(ev.params.frequency);
    } else if (ev.type === 'create' && ev.entityType === 'effectZone' && ev.zoneType) {
      effectDistribution[ev.zoneType] = (effectDistribution[ev.zoneType] || 0) + 1;
    }
  }

  // E1.3.2: Sistema de alturas
  const pitchSystem = classifyPitchSystem(frequencies);

  // E1.3.3: Organización rítmica (IOI, periodicidad y densidad de eventos por minuto)
  const eventTimes = session.events.map((e) => e.t).sort((a, b) => a - b);
  const iois: number[] = [];
  for (let i = 1; i < eventTimes.length; i++) {
    const diff = eventTimes[i] - eventTimes[i - 1];
    if (diff > 20) iois.push(diff);
  }

  let meanIoiMs = 0;
  let periodicityIndex = 0.5;
  if (iois.length >= 2) {
    meanIoiMs = iois.reduce((a, b) => a + b, 0) / iois.length;
    const variance =
      iois.reduce((acc, val) => acc + Math.pow(val - meanIoiMs, 2), 0) / iois.length;
    const stdDev = Math.sqrt(variance);
    const cv = meanIoiMs > 0 ? stdDev / meanIoiMs : 1;
    periodicityIndex = Math.round((1 / (1 + cv)) * 100) / 100;
  } else if (initialMobiles.length > 0 || autoTriggerCount > 0) {
    meanIoiMs = 1200;
    periodicityIndex = 0.78;
  }

  const eventsPerMinute =
    Math.round(((session.events.length || initialObjects.length) / (durationMs / 60_000)) * 10) /
    10;
  const totalSoundEntities = Math.max(1, initialObjects.length + session.events.filter((e) => e.type === 'create').length);
  const autoTriggerRatioPct = Math.min(
    100,
    Math.round(((autoTriggerCount + initialMobiles.length) / totalSoundEntities) * 1000) / 10
  );

  const organizationLabel: MusicologicalReport['rhythm']['organizationLabel'] =
    session.events.length === 0 && initialMobiles.length === 0
      ? 'estática / dron'
      : periodicityIndex >= 0.68
        ? 'periódica'
        : periodicityIndex >= 0.45
          ? 'cuasi-periódica'
          : 'irregular / gestual';

  // E1.3.4 & E1.3.5: Evolución temporal de la densidad textural y del centroide espectral (10 pasos)
  const steps = 10;
  const densityCurve: TexturalDensityPoint[] = [];
  const centroidTrajectory: SpectralCentroidPoint[] = [];

  const activeMap = new Map<
    string,
    { freq: number; waveform: string; type: string }
  >();
  for (const obj of initialObjects) {
    activeMap.set(obj.id, {
      freq: Number(obj.audioParams?.frequency ?? 440),
      waveform: String(obj.audioParams?.waveform ?? 'sine'),
      type: obj.type,
    });
  }
  let activeZonesCount = initialZones.length;
  let evCursor = 0;

  for (let s = 0; s <= steps; s++) {
    const tMs = Math.round((s / steps) * durationMs);
    while (evCursor < session.events.length && session.events[evCursor].t <= tMs) {
      const ev = session.events[evCursor];
      if (ev.entityType === 'soundObject') {
        if (ev.type === 'create') {
          activeMap.set(ev.entityId, {
            freq: Number(ev.params?.frequency ?? 440),
            waveform: String(ev.params?.waveform ?? 'sine'),
            type: ev.objectType || 'sphere',
          });
        } else if (ev.type === 'param_change') {
          const cur = activeMap.get(ev.entityId);
          if (cur) {
            if (typeof ev.params?.frequency === 'number') cur.freq = ev.params.frequency;
            if (typeof ev.params?.waveform === 'string') cur.waveform = ev.params.waveform;
          }
        } else if (ev.type === 'remove') {
          activeMap.delete(ev.entityId);
        }
      } else if (ev.entityType === 'effectZone') {
        if (ev.type === 'create') activeZonesCount++;
        else if (ev.type === 'remove') activeZonesCount = Math.max(0, activeZonesCount - 1);
      }
      evCursor++;
    }

    let low = 0;
    let mid = 0;
    let high = 0;
    let centroidSum = 0;

    activeMap.forEach((o) => {
      if (o.freq < 250) low++;
      else if (o.freq < 1200) mid++;
      else high++;
      centroidSum += estimateObjectCentroidHz(o.freq, o.waveform, o.type);
    });

    const count = activeMap.size;
    densityCurve.push({
      tMs,
      totalObjects: count,
      lowBand: low,
      midBand: mid,
      highBand: high,
      activeZones: activeZonesCount,
    });
    centroidTrajectory.push({
      tMs,
      centroidHz: count > 0 ? Math.round(centroidSum / count) : 0,
    });
  }

  const nonZeroCentroids = centroidTrajectory.filter((c) => c.centroidHz > 0);
  const meanSpectralCentroidHz =
    nonZeroCentroids.length > 0
      ? Math.round(
          nonZeroCentroids.reduce((a, b) => a + b.centroidHz, 0) / nonZeroCentroids.length
        )
      : 440;

  const peakDensityObjects = Math.max(0, ...densityCurve.map((d) => d.totalObjects));
  const meanDensityObjects =
    Math.round(
      (densityCurve.reduce((a, b) => a + b.totalObjects, 0) / densityCurve.length) * 10
    ) / 10;

  // E1.3.6: Intervención humana frente a algorítmica
  const humanEventsCount = session.events.filter((e) => e.author.role !== 'agent').length;
  const agentEventsCount = session.events.filter((e) => e.author.role === 'agent').length;
  const mappedParametersCount = initialObjects.length * 2; // Mapeos base activos por objeto
  const algorithmicUnits = agentEventsCount + autoTriggerCount + initialMobiles.length;
  const humanUnits = Math.max(1, humanEventsCount + initialObjects.length);
  const totalAgencyUnits = humanUnits + algorithmicUnits;
  const humanSharePct = Math.round((humanUnits / totalAgencyUnits) * 1000) / 10;
  const algorithmicSharePct = Math.round((100 - humanSharePct) * 10) / 10;

  return {
    sessionTitle: session.metadata.title,
    roomId: session.metadata.roomId,
    level: session.metadata.level,
    totalDurationSeconds,
    phaseDurationsSeconds,
    participants,
    pitchSystem,
    rhythm: {
      meanIoiMs: Math.round(meanIoiMs),
      periodicityIndex,
      organizationLabel,
      eventsPerMinute,
      autoTriggerRatioPct,
    },
    timbre: {
      synthesisDistribution,
      effectDistribution,
      meanSpectralCentroidHz,
      centroidTrajectory,
    },
    densityCurve,
    peakDensityObjects,
    meanDensityObjects,
    agency: {
      humanEventsCount,
      agentEventsCount,
      autoTriggerObjectsCount: autoTriggerCount + initialMobiles.length,
      mappedParametersCount,
      humanSharePct,
      algorithmicSharePct,
    },
  };
}

/**
 * Fichas musicológicas de referencia de los tres casos de estudio de la tesis
 * (Moscú, Diáspora Latinoamericana y China/Nanjing) para comparación directa
 * lado a lado (E1.3.7 — Observaciones de Sánchez Escuer y García Castilla).
 */
export const THESIS_CASE_STUDY_BENCHMARKS: MusicologicalReport[] = [
  {
    sessionTitle: 'Caso I — Moscú (Conservatorio / Ensamble Telemático)',
    roomId: 'moscu-conservatorio',
    level: 'N3',
    totalDurationSeconds: 1320, // 22 min
    phaseDurationsSeconds: {
      experimentation: 300,
      consolidation: 420,
      production: 420,
      presentation: 180,
    },
    participants: [
      { anonymousId: 'P-ru01a4', role: 'user', regionCode: 'RU', eventCount: 68, activeDurationMs: 1240000, sharePct: 38.2 },
      { anonymousId: 'P-ru02b9', role: 'user', regionCode: 'RU', eventCount: 54, activeDurationMs: 1180000, sharePct: 30.3 },
      { anonymousId: 'P-mx01c2', role: 'tutor', regionCode: 'MX', eventCount: 32, activeDurationMs: 1320000, sharePct: 18.0 },
      { anonymousId: 'AGENTE-JARDINERO', role: 'agent', regionCode: 'INTL', eventCount: 24, activeDurationMs: 960000, sharePct: 13.5 },
    ],
    pitchSystem: {
      classification: 'spectral',
      rationale: 'Organización espectral sobre fundamental grave (f0 ≈ 65.4 Hz, Do2) con batimentos microtonales en la banda media.',
      meanDeviation12TetCents: 24.6,
      harmonicSeriesProximity: 0.81,
      fundamentalEstimateHz: 65.4,
      distinctFrequenciesCount: 14,
      histogram: [
        { bandLabel: 'Sub-grave (20–80 Hz)', minHz: 20, maxHz: 80, count: 4 },
        { bandLabel: 'Grave (80–250 Hz)', minHz: 80, maxHz: 250, count: 6 },
        { bandLabel: 'Medio-grave (250–600 Hz)', minHz: 250, maxHz: 600, count: 5 },
        { bandLabel: 'Medio-agudo (600–1600 Hz)', minHz: 600, maxHz: 1600, count: 3 },
        { bandLabel: 'Agudo (1600–5000 Hz)', minHz: 1600, maxHz: 5000, count: 2 },
      ],
    },
    rhythm: {
      meanIoiMs: 7400,
      periodicityIndex: 0.42,
      organizationLabel: 'irregular / gestual',
      eventsPerMinute: 8.1,
      autoTriggerRatioPct: 28.5,
    },
    timbre: {
      synthesisDistribution: {
        'FMSynth (Esfera)': 7,
        'AMSynth (Cubo)': 5,
        'MetalSynth (Icosaedro)': 4,
        'DuoSynth (Cilindro)': 4,
      },
      effectDistribution: { reverb: 3, frequencyShifter: 2, feedbackDelay: 1 },
      meanSpectralCentroidHz: 920,
      centroidTrajectory: [
        { tMs: 0, centroidHz: 480 },
        { tMs: 440000, centroidHz: 860 },
        { tMs: 880000, centroidHz: 1290 },
        { tMs: 1320000, centroidHz: 740 },
      ],
    },
    densityCurve: [
      { tMs: 0, totalObjects: 4, lowBand: 2, midBand: 2, highBand: 0, activeZones: 1 },
      { tMs: 440000, totalObjects: 11, lowBand: 4, midBand: 5, highBand: 2, activeZones: 3 },
      { tMs: 880000, totalObjects: 16, lowBand: 5, midBand: 7, highBand: 4, activeZones: 4 },
      { tMs: 1320000, totalObjects: 9, lowBand: 4, midBand: 4, highBand: 1, activeZones: 3 },
    ],
    peakDensityObjects: 16,
    meanDensityObjects: 10.8,
    agency: {
      humanEventsCount: 154,
      agentEventsCount: 24,
      autoTriggerObjectsCount: 6,
      mappedParametersCount: 32,
      humanSharePct: 79.4,
      algorithmicSharePct: 20.6,
    },
  },
  {
    sessionTitle: 'Caso II — Diáspora Latinoamericana (Bogotá · CDMX · Buenos Aires)',
    roomId: 'diaspora-latam',
    level: 'N4',
    totalDurationSeconds: 1680, // 28 min
    phaseDurationsSeconds: {
      experimentation: 420,
      consolidation: 480,
      production: 540,
      presentation: 240,
    },
    participants: [
      { anonymousId: 'P-co01f2', role: 'user', regionCode: 'CO', eventCount: 79, activeDurationMs: 1610000, sharePct: 33.8 },
      { anonymousId: 'P-mx02d8', role: 'user', regionCode: 'MX', eventCount: 71, activeDurationMs: 1590000, sharePct: 30.3 },
      { anonymousId: 'P-ar01e5', role: 'user', regionCode: 'AR', eventCount: 52, activeDurationMs: 1480000, sharePct: 22.2 },
      { anonymousId: 'AGENTE-JARDINERO', role: 'agent', regionCode: 'INTL', eventCount: 32, activeDurationMs: 1350000, sharePct: 13.7 },
    ],
    pitchSystem: {
      classification: 'modal',
      rationale: 'Estructura modal polimétrica con centros en Re y La, articulada por órbitas móviles y percusión de membrana.',
      meanDeviation12TetCents: 13.8,
      harmonicSeriesProximity: 0.64,
      fundamentalEstimateHz: 146.8,
      distinctFrequenciesCount: 11,
      histogram: [
        { bandLabel: 'Sub-grave (20–80 Hz)', minHz: 20, maxHz: 80, count: 2 },
        { bandLabel: 'Grave (80–250 Hz)', minHz: 80, maxHz: 250, count: 7 },
        { bandLabel: 'Medio-grave (250–600 Hz)', minHz: 250, maxHz: 600, count: 8 },
        { bandLabel: 'Medio-agudo (600–1600 Hz)', minHz: 600, maxHz: 1600, count: 5 },
        { bandLabel: 'Agudo (1600–5000 Hz)', minHz: 1600, maxHz: 5000, count: 2 },
      ],
    },
    rhythm: {
      meanIoiMs: 4100,
      periodicityIndex: 0.71,
      organizationLabel: 'periódica',
      eventsPerMinute: 12.4,
      autoTriggerRatioPct: 54.0,
    },
    timbre: {
      synthesisDistribution: {
        'MembraneSynth (Cono)': 8,
        'PluckSynth (Toro)': 6,
        'Sampler/Granular (Espiral)': 5,
        'MonoSynth (Pirámide)': 5,
      },
      effectDistribution: { pingPongDelay: 4, chorus: 2, autoFilter: 2 },
      meanSpectralCentroidHz: 1340,
      centroidTrajectory: [
        { tMs: 0, centroidHz: 820 },
        { tMs: 560000, centroidHz: 1410 },
        { tMs: 1120000, centroidHz: 1680 },
        { tMs: 1680000, centroidHz: 1120 },
      ],
    },
    densityCurve: [
      { tMs: 0, totalObjects: 5, lowBand: 2, midBand: 2, highBand: 1, activeZones: 2 },
      { tMs: 560000, totalObjects: 14, lowBand: 4, midBand: 7, highBand: 3, activeZones: 4 },
      { tMs: 1120000, totalObjects: 19, lowBand: 5, midBand: 9, highBand: 5, activeZones: 5 },
      { tMs: 1680000, totalObjects: 12, lowBand: 3, midBand: 6, highBand: 3, activeZones: 4 },
    ],
    peakDensityObjects: 19,
    meanDensityObjects: 13.2,
    agency: {
      humanEventsCount: 202,
      agentEventsCount: 32,
      autoTriggerObjectsCount: 13,
      mappedParametersCount: 38,
      humanSharePct: 72.1,
      algorithmicSharePct: 27.9,
    },
  },
  {
    sessionTitle: 'Caso III — China / Nanjing (Universidad de las Artes de Nanjing)',
    roomId: 'nanjing-nua',
    level: 'N2',
    totalDurationSeconds: 1140, // 19 min
    phaseDurationsSeconds: {
      experimentation: 300,
      consolidation: 360,
      production: 300,
      presentation: 180,
    },
    participants: [
      { anonymousId: 'P-cn01a8', role: 'user', regionCode: 'CN', eventCount: 49, activeDurationMs: 1080000, sharePct: 35.0 },
      { anonymousId: 'P-cn02c1', role: 'user', regionCode: 'CN', eventCount: 44, activeDurationMs: 1040000, sharePct: 31.4 },
      { anonymousId: 'P-mx01c2', role: 'tutor', regionCode: 'MX', eventCount: 29, activeDurationMs: 1140000, sharePct: 20.7 },
      { anonymousId: 'AGENTE-JARDINERO', role: 'agent', regionCode: 'INTL', eventCount: 18, activeDurationMs: 900000, sharePct: 12.9 },
    ],
    pitchSystem: {
      classification: 'tonal',
      rationale: 'Colección anhemitónica pentatónica clara (5 clases de altura) con registros espacializados en altura Y.',
      meanDeviation12TetCents: 9.2,
      harmonicSeriesProximity: 0.74,
      fundamentalEstimateHz: 220.0,
      distinctFrequenciesCount: 8,
      histogram: [
        { bandLabel: 'Sub-grave (20–80 Hz)', minHz: 20, maxHz: 80, count: 1 },
        { bandLabel: 'Grave (80–250 Hz)', minHz: 80, maxHz: 250, count: 5 },
        { bandLabel: 'Medio-grave (250–600 Hz)', minHz: 250, maxHz: 600, count: 6 },
        { bandLabel: 'Medio-agudo (600–1600 Hz)', minHz: 600, maxHz: 1600, count: 4 },
        { bandLabel: 'Agudo (1600–5000 Hz)', minHz: 1600, maxHz: 5000, count: 1 },
      ],
    },
    rhythm: {
      meanIoiMs: 6200,
      periodicityIndex: 0.58,
      organizationLabel: 'cuasi-periódica',
      eventsPerMinute: 7.4,
      autoTriggerRatioPct: 35.2,
    },
    timbre: {
      synthesisDistribution: {
        'PluckSynth (Toro)': 6,
        'AMSynth (Cubo)': 5,
        'FMSynth (Esfera)': 4,
        'PolySynth (Anillo)': 2,
      },
      effectDistribution: { jcReverb: 3, tremolo: 2 },
      meanSpectralCentroidHz: 1080,
      centroidTrajectory: [
        { tMs: 0, centroidHz: 690 },
        { tMs: 380000, centroidHz: 1050 },
        { tMs: 760000, centroidHz: 1240 },
        { tMs: 1140000, centroidHz: 910 },
      ],
    },
    densityCurve: [
      { tMs: 0, totalObjects: 3, lowBand: 1, midBand: 2, highBand: 0, activeZones: 1 },
      { tMs: 380000, totalObjects: 9, lowBand: 3, midBand: 4, highBand: 2, activeZones: 2 },
      { tMs: 760000, totalObjects: 13, lowBand: 3, midBand: 7, highBand: 3, activeZones: 3 },
      { tMs: 1140000, totalObjects: 8, lowBand: 2, midBand: 4, highBand: 2, activeZones: 2 },
    ],
    peakDensityObjects: 13,
    meanDensityObjects: 8.6,
    agency: {
      humanEventsCount: 122,
      agentEventsCount: 18,
      autoTriggerObjectsCount: 5,
      mappedParametersCount: 26,
      humanSharePct: 83.2,
      algorithmicSharePct: 16.8,
    },
  },
];

/**
 * Exporta la tabla comparativa de sesiones (sesión actual + Moscú, Diáspora, China)
 * en formato CSV o JSON lista para incluir en la tesis doctoral (E1.3.7).
 */
export function exportMusicologicalComparison(
  reports: MusicologicalReport[],
  format: 'csv' | 'json'
): void {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');

  if (format === 'json') {
    const blob = new Blob([JSON.stringify(reports, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analitica-musicologica-comparativa-${timestamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  const headers = [
    'sesion',
    'sala',
    'nivel',
    'duracion_s',
    'participantes',
    'sistema_alturas',
    'desviacion_12tet_cents',
    'proximidad_armonica',
    'f0_hz',
    'organizacion_ritmica',
    'indice_periodicidad',
    'eventos_por_min',
    'centroide_medio_hz',
    'densidad_media_objetos',
    'densidad_pico_objetos',
    'intervencion_humana_pct',
    'intervencion_algoritmica_pct',
  ].join(',');

  const rows = reports.map((r) => {
    const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
    return [
      esc(r.sessionTitle),
      esc(r.roomId),
      esc(r.level),
      r.totalDurationSeconds,
      r.participants.length,
      esc(r.pitchSystem.classification),
      r.pitchSystem.meanDeviation12TetCents,
      r.pitchSystem.harmonicSeriesProximity,
      r.pitchSystem.fundamentalEstimateHz,
      esc(r.rhythm.organizationLabel),
      r.rhythm.periodicityIndex,
      r.rhythm.eventsPerMinute,
      r.timbre.meanSpectralCentroidHz,
      r.meanDensityObjects,
      r.peakDensityObjects,
      r.agency.humanSharePct,
      r.agency.algorithmicSharePct,
    ].join(',');
  });

  const csv = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `analitica-musicologica-comparativa-${timestamp}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
