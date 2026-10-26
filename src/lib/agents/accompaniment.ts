/**
 * Algoritmos de Acompañamiento Generativo (roadmap 6.3) — lógica pura.
 *
 * Análisis de textura y decisiones musicales del agente coproductor,
 * separados del store para poder probarse de forma aislada:
 *
 *   - análisis de densidad por banda de frecuencia con centroide espacial
 *     de la banda saturada,
 *   - elección de síntesis complementaria (timbres ricos ↔ puros),
 *   - cálculo de contrapunto por intervalos consonantes hacia la banda
 *     menos poblada,
 *   - punto "a distancia": posición alejada del foco de saturación.
 */

export type BasicWaveform = 'sine' | 'triangle' | 'square' | 'sawtooth';

export interface TextureObject {
  id: string;
  frequency: number;
  waveform: string;
  position: [number, number, number];
}

export interface Band {
  name: string;
  range: [number, number];
  center: number;
}

export const BANDS: Band[] = [
  { name: 'grave', range: [20, 220], center: 110 },
  { name: 'media', range: [220, 880], center: 440 },
  { name: 'aguda', range: [880, 20000], center: 1320 },
];

export function bandIndexOf(frequency: number): number {
  const index = BANDS.findIndex(
    (band) => frequency >= band.range[0] && frequency < band.range[1]
  );
  return index === -1 ? 1 : index;
}

export interface TextureAnalysis {
  counts: number[];
  dominantIndex: number;
  sparseIndex: number;
  /** Fracción de objetos en la banda dominante (0-1) */
  dominance: number;
  /** Centroide espacial XZ de los objetos de la banda dominante */
  centroid: [number, number];
  /** Objetos que habitan la banda dominante */
  dominantObjects: TextureObject[];
}

/** Analiza la densidad espectral y espacial de la textura actual. */
export function analyzeTexture(objects: TextureObject[]): TextureAnalysis {
  const counts = BANDS.map(() => 0);
  const byBand: TextureObject[][] = BANDS.map(() => []);

  for (const obj of objects) {
    const index = bandIndexOf(obj.frequency);
    counts[index]++;
    byBand[index].push(obj);
  }

  const dominantIndex = counts.indexOf(Math.max(...counts));
  const sparseIndex = counts.indexOf(Math.min(...counts));
  const dominantObjects = byBand[dominantIndex];

  let cx = 0;
  let cz = 0;
  for (const obj of dominantObjects) {
    cx += obj.position[0];
    cz += obj.position[2];
  }
  const n = Math.max(1, dominantObjects.length);

  return {
    counts,
    dominantIndex,
    sparseIndex,
    dominance: objects.length === 0 ? 0 : counts[dominantIndex] / objects.length,
    centroid: [cx / n, cz / n],
    dominantObjects,
  };
}

const RICH_WAVEFORMS = new Set(['sawtooth', 'square']);

/**
 * Síntesis complementaria: si la saturación está dominada por timbres
 * ricos en armónicos (sawtooth/square), responder con timbres puros
 * (sine/triangle) y viceversa — el contrapunto contrasta, no compite.
 */
export function complementaryWaveform(dominantObjects: TextureObject[]): BasicWaveform {
  let rich = 0;
  for (const obj of dominantObjects) {
    if (RICH_WAVEFORMS.has(obj.waveform)) rich++;
  }
  const mostlyRich = rich >= dominantObjects.length / 2;
  const pool: BasicWaveform[] = mostlyRich ? ['sine', 'triangle'] : ['sawtooth', 'square'];
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Intervalos consonantes para el contrapunto (quinta, cuarta, octavas). */
const CONSONANT_RATIOS = [3 / 2, 4 / 3, 2, 1 / 2, 3, 1 / 3];

/**
 * Contrapunto: transpone la frecuencia de referencia de la banda saturada
 * por intervalos consonantes hasta caer dentro de la banda dispersa,
 * eligiendo el candidato más cercano al centro de esa banda.
 */
export function counterpointFrequency(referenceFreq: number, sparseBand: Band): number {
  const [low, high] = sparseBand.range;
  // El límite superior de la banda aguda (20 kHz) no es musical: acotar
  const usableHigh = Math.min(high, sparseBand.center * 2);

  let best = sparseBand.center;
  let bestDistance = Infinity;

  for (const ratio of CONSONANT_RATIOS) {
    // Aplicar el intervalo y trasladar por octavas hasta entrar en banda
    let candidate = referenceFreq * ratio;
    let guard = 0;
    while (candidate < low && guard++ < 12) candidate *= 2;
    while (candidate > usableHigh && guard++ < 12) candidate /= 2;
    if (candidate < low || candidate > usableHigh) continue;

    const distance = Math.abs(Math.log2(candidate / sparseBand.center));
    if (distance < bestDistance) {
      bestDistance = distance;
      best = candidate;
    }
  }

  return best;
}

/**
 * Punto "a distancia": posición en el lado opuesto del lienzo respecto
 * al foco de saturación, dentro de los límites de la cuadrícula.
 */
export function counterpointPosition(
  centroid: [number, number],
  gridSize: number
): [number, number, number] {
  const half = (gridSize || 20) * 0.35;
  const [cx, cz] = centroid;
  const distance = Math.hypot(cx, cz);

  let dirX: number;
  let dirZ: number;
  if (distance < 0.5) {
    // Saturación en el centro: elegir una dirección aleatoria hacia el borde
    const angle = Math.random() * Math.PI * 2;
    dirX = Math.cos(angle);
    dirZ = Math.sin(angle);
  } else {
    dirX = -cx / distance;
    dirZ = -cz / distance;
  }

  return [
    Math.max(-half, Math.min(half, dirX * half)),
    0.8 + Math.random() * 1.5,
    Math.max(-half, Math.min(half, dirZ * half)),
  ];
}

/**
 * Punto de retirada para "limpiar la textura": aleja una planta del foco
 * de saturación sin sacarla del lienzo.
 */
export function retreatPosition(
  current: [number, number, number],
  centroid: [number, number],
  gridSize: number
): [number, number, number] {
  const half = (gridSize || 20) * 0.35;
  const dx = current[0] - centroid[0];
  const dz = current[2] - centroid[1];
  const distance = Math.hypot(dx, dz);

  const dirX = distance < 0.5 ? Math.random() * 2 - 1 : dx / distance;
  const dirZ = distance < 0.5 ? Math.random() * 2 - 1 : dz / distance;
  const step = half * 0.6;

  return [
    Math.max(-half, Math.min(half, current[0] + dirX * step)),
    current[1],
    Math.max(-half, Math.min(half, current[2] + dirZ * step)),
  ];
}
