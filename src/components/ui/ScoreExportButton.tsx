'use client';

import { useRef } from 'react';
import { exportTopologicalScore } from '../../lib/score/topologicalScore';
import { exportGraphicScore } from '../../lib/score/graphicScore';
import { importTopologicalScoreFromFile } from '../../lib/score/scoreInterpreter';

/**
 * Barra de partituras topológicas:
 *  - exportación JSON de la sesión (roadmap 5.3),
 *  - exportación como partitura gráfica vectorial SVG (roadmap 5.4),
 *  - importación/reproducción offline de sesiones pasadas (roadmap 5.5).
 */
export function ScoreExportButton() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      await importTopologicalScoreFromFile(file);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al importar la partitura.');
    }
  };

  const buttonClass =
    'px-2 py-1 text-purple-300 hover:text-purple-100 hover:bg-white/10 rounded transition-colors';

  return (
    <div className="fixed bottom-4 left-28 bg-black/80 backdrop-blur-sm rounded-lg px-1 py-1 z-50 font-mono text-sm flex gap-1">
      <button
        onClick={() => exportTopologicalScore()}
        className={buttonClass}
        title="Exportar la sesión como partitura topológica (JSON)"
      >
        ⬇ JSON
      </button>
      <button
        onClick={() => exportGraphicScore()}
        className={buttonClass}
        title="Exportar la sesión como partitura gráfica vectorial (SVG)"
      >
        ⬇ SVG
      </button>
      <button
        onClick={() => fileInputRef.current?.click()}
        className={buttonClass}
        title="Cargar una partitura topológica y recrear la sesión (offline)"
      >
        ⬆ Cargar
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleImport}
      />
    </div>
  );
}
