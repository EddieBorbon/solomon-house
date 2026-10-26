'use client';

import {
  PARAMETRIC_LEVELS,
  usePedagogyStore,
  type ParametricLevel,
} from '../../lib/pedagogy/parametricLevels';

/**
 * Selector de Nivel Paramétrico N1–N4 (roadmap 8.1).
 *
 * Permite al moderador del cuarto restringir dinámicamente las
 * herramientas disponibles: de la iniciación con osciladores simples (N1)
 * a la experimentación abierta sin restricciones (N4).
 */
export function LevelSelector() {
  const { level, setLevel } = usePedagogyStore();
  const current = PARAMETRIC_LEVELS[level];

  return (
    <div
      className="fixed bottom-4 right-28 bg-black/80 backdrop-blur-sm rounded-lg px-2 py-1 z-50 font-mono text-sm flex items-center gap-2"
      title={current.description}
    >
      <span className="text-amber-300">🎓</span>
      <select
        value={level}
        onChange={(e) => setLevel(Number(e.target.value) as ParametricLevel)}
        className="bg-transparent text-amber-300 text-sm focus:outline-none cursor-pointer"
        aria-label="Nivel paramétrico pedagógico"
      >
        {Object.values(PARAMETRIC_LEVELS).map((def) => (
          <option key={def.level} value={def.level} className="bg-black text-amber-300">
            {def.name}
          </option>
        ))}
      </select>
    </div>
  );
}
