'use client';

import React from 'react';
import { create } from 'zustand';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';

/**
 * Post-procesamiento Visual Opcional (Brillo suave y viñeta de cámara).
 *
 * Desactivado por defecto para mantener máxima nitidez (MSAA nativo) sobre el
 * mapa blanco (#f0f0f0) y 60 FPS estables. Cuando la persona usuaria lo activa,
 * utiliza `multisampling={4}` y un umbral de luminancia alto (`0.98`) para no
 * difuminar el fondo claro ni las líneas de la cuadrícula.
 */

interface PostProcessingState {
  enabled: boolean;
  toggle: () => void;
}

export const usePostProcessingStore = create<PostProcessingState>((set) => ({
  enabled: false,
  toggle: () => set((state) => ({ enabled: !state.enabled })),
}));

export function PostProcessing() {
  const enabled = usePostProcessingStore((state) => state.enabled);

  if (!enabled) return null;

  return (
    <EffectComposer multisampling={4}>
      <Bloom
        intensity={0.25}
        luminanceThreshold={0.98}
        luminanceSmoothing={0.2}
        mipmapBlur
      />
      <Vignette eskil={false} offset={0.2} darkness={0.35} />
    </EffectComposer>
  );
}
