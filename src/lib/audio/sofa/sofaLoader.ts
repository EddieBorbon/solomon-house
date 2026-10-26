import * as hdf5 from 'jsfive';

/**
 * Lector de archivos SOFA — Spatially Oriented Format for Acoustics (roadmap 4.1).
 *
 * Los archivos .sofa son contenedores HDF5 (netCDF-4) estandarizados (AES69)
 * que almacenan respuestas al impulso relacionadas con la cabeza (HRIR) medidas
 * en anatomías reales o maniquíes acústicos. Este módulo los interpreta en el
 * cliente con `jsfive` (HDF5 puro en JavaScript, sin WASM), extrayendo el
 * subconjunto de la convención `SimpleFreeFieldHRIR`:
 *
 *   - `Data.IR`            [M, R, N]  — M mediciones, R=2 receptores (oídos), N muestras
 *   - `Data.SamplingRate`  [1]        — frecuencia de muestreo de las HRIR
 *   - `SourcePosition`     [M, 3]     — posición de la fuente por medición
 *                                       (esférica: azimut°, elevación°, distancia m)
 */

export interface HrirSet {
  /** Nombre descriptivo del perfil (nombre del archivo o de la base de datos) */
  name: string;
  /** Frecuencia de muestreo original de las HRIR */
  sampleRate: number;
  /** Número de posiciones medidas (M) */
  count: number;
  /** Longitud de cada respuesta al impulso en muestras (N) */
  irLength: number;
  /** Azimut en grados por medición (convención SOFA: 0=frente, 90=izquierda) */
  azimuths: Float32Array;
  /** Elevación en grados por medición (0=horizonte, 90=cenit) */
  elevations: Float32Array;
  /**
   * Vectores unitarios de dirección precalculados (M*3, sistema SOFA:
   * +X frente, +Y izquierda, +Z arriba) para búsqueda por producto punto.
   */
  directions: Float32Array;
  /** HRIR planas: [m][canal][muestra] → m*2*N + canal*N + muestra */
  irs: Float32Array;
}

function asDataset(node: hdf5.Dataset | hdf5.Group | null, name: string): hdf5.Dataset {
  if (!node || !('value' in node)) {
    throw new Error(`El archivo SOFA no contiene el dataset requerido "${name}"`);
  }
  return node as hdf5.Dataset;
}

function toFloat32(value: hdf5.Dataset['value']): Float32Array {
  if (value instanceof Float32Array) return value;
  if (value instanceof Float64Array) return new Float32Array(value);
  return Float32Array.from(value as number[]);
}

const DEG = Math.PI / 180;

/**
 * Interpreta un archivo .sofa y devuelve el conjunto de HRIR listo para
 * el espacializador binaural (4.2). Lanza Error con mensaje descriptivo
 * si el archivo no sigue la convención SimpleFreeFieldHRIR.
 */
export function parseSofa(buffer: ArrayBuffer, name: string): HrirSet {
  const file = new hdf5.File(buffer, name);

  const irDataset = asDataset(file.get('Data.IR'), 'Data.IR');
  const srDataset = asDataset(file.get('Data.SamplingRate'), 'Data.SamplingRate');
  const posDataset = asDataset(file.get('SourcePosition'), 'SourcePosition');

  const [m, receivers, n] = irDataset.shape;
  if (!m || !n) {
    throw new Error(`Forma de Data.IR inesperada: [${irDataset.shape.join(', ')}]`);
  }
  if (receivers !== 2) {
    throw new Error(
      `El archivo tiene ${receivers} receptores; se requieren 2 (HRIR binaural estéreo)`
    );
  }

  const sampleRate = Number((srDataset.value as number[])[0]);
  if (!Number.isFinite(sampleRate) || sampleRate <= 0) {
    throw new Error('Frecuencia de muestreo inválida en Data.SamplingRate');
  }

  // Posiciones de fuente. La convención SimpleFreeFieldHRIR usa coordenadas
  // esféricas; si el archivo declara cartesianas, se convierten.
  const positions = toFloat32(posDataset.value);
  const positionType = String(posDataset.attrs?.['Type'] ?? 'spherical').toLowerCase();

  const azimuths = new Float32Array(m);
  const elevations = new Float32Array(m);
  const directions = new Float32Array(m * 3);

  for (let i = 0; i < m; i++) {
    let az: number;
    let el: number;

    if (positionType.startsWith('cartesian')) {
      const x = positions[i * 3];
      const y = positions[i * 3 + 1];
      const z = positions[i * 3 + 2];
      const horizontal = Math.hypot(x, y);
      az = Math.atan2(y, x) / DEG;
      el = Math.atan2(z, horizontal) / DEG;
    } else {
      az = positions[i * 3];
      el = positions[i * 3 + 1];
    }

    azimuths[i] = az;
    elevations[i] = el;

    const cosEl = Math.cos(el * DEG);
    directions[i * 3] = cosEl * Math.cos(az * DEG); // +X frente
    directions[i * 3 + 1] = cosEl * Math.sin(az * DEG); // +Y izquierda
    directions[i * 3 + 2] = Math.sin(el * DEG); // +Z arriba
  }

  return {
    name,
    sampleRate,
    count: m,
    irLength: n,
    azimuths,
    elevations,
    directions,
    irs: toFloat32(irDataset.value),
  };
}

/**
 * Encuentra el índice de la HRIR medida más cercana a una dirección dada
 * (vector unitario en sistema SOFA), maximizando el producto punto.
 */
export function findNearestHrir(set: HrirSet, dx: number, dy: number, dz: number): number {
  const { directions, count } = set;
  let best = 0;
  let bestDot = -Infinity;
  for (let i = 0; i < count; i++) {
    const dot =
      directions[i * 3] * dx + directions[i * 3 + 1] * dy + directions[i * 3 + 2] * dz;
    if (dot > bestDot) {
      bestDot = dot;
      best = i;
    }
  }
  return best;
}
