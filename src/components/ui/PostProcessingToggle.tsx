'use client';

import { usePostProcessingStore } from '../world/PostProcessing';

/**
 * Activador del post-procesamiento visual (roadmap 3.7):
 * bloom y viñeta, desactivables manualmente para garantizar
 * 60 FPS estables en móviles o gráficos integrados.
 */
export function PostProcessingToggle() {
  const { enabled, toggle } = usePostProcessingStore();

  return (
    <button
      onClick={toggle}
      className={`fixed bottom-4 left-[27rem] bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2 z-50 font-mono text-sm transition-colors ${
        enabled ? 'text-amber-300' : 'text-gray-400 hover:text-gray-200'
      }`}
      title="Activar/desactivar el post-procesamiento visual (bloom y viñeta). Desactívalo si necesitas más FPS."
    >
      ✨ FX
    </button>
  );
}
