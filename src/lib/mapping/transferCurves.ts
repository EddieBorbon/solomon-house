/**
 * Curvas de Transferencia Personalizadas (roadmap 5.2).
 *
 * Funciones de forma que median entre un rango geométrico de entrada
 * (posición, escala, rotación) y un rango de síntesis de salida
 * (frecuencia, volumen, índice de modulación…). Todas operan sobre un
 * dominio normalizado [0,1] → [0,1]; el Mapping Engine (5.1) se encarga
 * de normalizar la entrada y des-normalizar la salida.
 *
 * La curva `libre` usa una tabla de puntos de quiebre editable a mano
 * alzada en la UI, con interpolación lineal entre puntos — suficiente
 * para mapeos con precisión de micro-tonos al combinarla con un rango
 * de frecuencia continuo en Hz.
 */

export type CurveType = 'lineal' | 'logaritmica' | 'exponencial' | 'sigmoide' | 'libre';

export const CURVE_LABELS: Record<CurveType, string> = {
  lineal: 'Lineal',
  logaritmica: 'Logarítmica',
  exponencial: 'Exponencial',
  sigmoide: 'Sigmoide',
  libre: 'Libre (dibujada)',
};

/** Número de muestras de la tabla de la curva libre */
export const FREE_CURVE_SIZE = 64;

export function defaultFreeCurve(): number[] {
  return Array.from({ length: FREE_CURVE_SIZE }, (_, i) => i / (FREE_CURVE_SIZE - 1));
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/**
 * Evalúa una curva de transferencia en t ∈ [0,1] → [0,1].
 * `shape` (>0) controla la intensidad de las curvas no lineales.
 */
export function evaluateCurve(
  type: CurveType,
  t: number,
  shape: number = 2,
  freeTable?: number[]
): number {
  const x = clamp01(t);
  switch (type) {
    case 'lineal':
      return x;
    case 'logaritmica':
      // Crece rápido al inicio y se aplana (log1p normalizado)
      return Math.log1p(shape * 9 * x) / Math.log1p(shape * 9);
    case 'exponencial':
      // Crece lento al inicio y se dispara al final
      return Math.pow(x, Math.max(1.01, shape));
    case 'sigmoide': {
      // S-curve centrada en 0.5; shape controla la pendiente
      const k = shape * 4;
      const s = (v: number) => 1 / (1 + Math.exp(-k * (v - 0.5)));
      const lo = s(0);
      const hi = s(1);
      return (s(x) - lo) / (hi - lo);
    }
    case 'libre': {
      const table = freeTable && freeTable.length >= 2 ? freeTable : defaultFreeCurve();
      const pos = x * (table.length - 1);
      const lower = Math.floor(pos);
      const upper = Math.min(lower + 1, table.length - 1);
      const frac = pos - lower;
      return clamp01(table[lower] * (1 - frac) + table[upper] * frac);
    }
    default:
      return x;
  }
}
