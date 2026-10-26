'use client';

import React from 'react';
import { create } from 'zustand';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';

/**
 * Post-procesamiento Visual Optimizado (roadmap 3.7).
 *
 * Bloom (resalta las emisiones de los drones activos y las auras FFT) y
 * viñeta sutil. Desactivable manualmente para garantizar 60 FPS estables
 * en dispositivos móviles o con gráficos integrados: por defecto solo se
 * activa en pantallas grandes (heurística de escritorio).
 */

interface PostProcessingState {
  enabled: boolean;
  toggle: () => void;
}

function defaultEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  // Heurística: activar solo en escritorio con suficientes núcleos
  const isDesktop = window.innerWidth > 1024;
  const hasCores = (navigator.hardwareConcurrency || 4) >= 4;
  return isDesktop && hasCores;
}

export const usePostProcessingStore = create<PostProcessingState>((set) => ({
  enabled: defaultEnabled(),
  toggle: () => set((state) => ({ enabled: !state.enabled })),
}));

export function PostProcessing() {
  const enabled = usePostProcessingStore((state) => state.enabled);

  if (!enabled) return null;

  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={0.55}
        luminanceThreshold={0.45}
        luminanceSmoothing={0.3}
        mipmapBlur
      />
      <Vignette eskil={false} offset={0.18} darkness={0.65} />
    </EffectComposer>
  );
}
