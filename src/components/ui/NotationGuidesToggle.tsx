'use client';

import { useNotationGuidesStore } from '../world/InfluenceGuides';

/**
 * Activador de las notaciones visuales en tiempo real (roadmap 5.6):
 * anillos de influencia sonora proyectados en el suelo virtual.
 */
export function NotationGuidesToggle() {
  const { enabled, toggle } = useNotationGuidesStore();

  return (
    <button
      onClick={toggle}
      className={`fixed bottom-4 left-[21rem] bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2 z-50 font-mono text-sm transition-colors ${
        enabled ? 'text-purple-300' : 'text-gray-400 hover:text-gray-200'
      }`}
      title="Mostrar/ocultar las guías de influencia espacial del sonido"
    >
      〰 Guías
    </button>
  );
}
