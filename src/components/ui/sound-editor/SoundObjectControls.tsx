'use client';

import { type SoundObject } from '../../../state/useWorldStore';
import { type AudioParams } from '../../../lib/AudioManager';
import { AudioControlSection } from '../AudioControlSection';
import { SynthSpecificParameters } from './SynthSpecificParameters';
import { AdvancedSynthParameters } from './AdvancedSynthParameters';
import { MonoSynthParameters } from './MonoSynthParameters';
import { MetalSynthParameters } from './MetalSynthParameters';
import { NoiseSynthParameters } from './NoiseSynthParameters';
import { PluckSynthParameters } from './PluckSynthParameters';
import { PolySynthParameters } from './PolySynthParameters';
import { SamplerParameters } from './SamplerParameters';
import { SoundTransformSection } from './SoundTransformSection';

interface SoundObjectControlsProps {
  selectedObject: SoundObject;
  onParamChange: (param: keyof AudioParams, value: number | string | string[] | Record<string, string>) => void;
  onTransformChange: (property: 'position' | 'rotation' | 'scale', axis: 0 | 1 | 2, value: number) => void;
  onResetTransform: () => void;
  roundToDecimals: (value: number) => number;
  onRemove: (id: string) => void;
}

export function SoundObjectControls({
  selectedObject,
  onParamChange,
  onTransformChange,
  onResetTransform,
  roundToDecimals,
  onRemove
}: SoundObjectControlsProps) {
  return (
    <div className="space-y-4">
      {/* Control de activación de audio */}
      <AudioControlSection 
        selectedObject={selectedObject} 
        onRemove={onRemove} 
      />

      {/* Controles de parámetros */}
      <SynthSpecificParameters 
        selectedObject={selectedObject}
        onParamChange={onParamChange}
      />

      {/* Parámetros avanzados de sintetizadores */}
      <AdvancedSynthParameters 
        selectedObject={selectedObject}
        onParamChange={onParamChange}
      />

      {/* Controles específicos para MonoSynth (pirámide) */}
      <MonoSynthParameters 
        selectedObject={selectedObject}
        onParamChange={onParamChange}
      />

      {/* Controles específicos para MetalSynth (icosaedro) */}
      <MetalSynthParameters 
        selectedObject={selectedObject}
        onParamChange={onParamChange}
      />

      {/* Controles específicos para NoiseSynth (plano) */}
      <NoiseSynthParameters 
        selectedObject={selectedObject}
        onParamChange={onParamChange}
      />

      {/* Controles específicos para PluckSynth (torus) */}
      <PluckSynthParameters 
        selectedObject={selectedObject}
        onParamChange={onParamChange}
      />

      {/* Controles específicos para PolySynth (dodecahedronRing) */}
      <PolySynthParameters 
        selectedObject={selectedObject}
        onParamChange={onParamChange}
      />

      {/* Controles específicos para Sampler (spiral) */}
      <SamplerParameters 
        selectedObject={selectedObject}
        onParamChange={onParamChange}
      />

      {/* Sección de Posición y Tamaño */}
      <SoundTransformSection 
        selectedObject={selectedObject}
        onTransformChange={onTransformChange}
        onResetTransform={onResetTransform}
        roundToDecimals={roundToDecimals}
      />
    </div>
  );
}
