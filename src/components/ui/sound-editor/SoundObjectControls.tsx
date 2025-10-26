'use client';

import { type SoundObject } from '../../../state/useWorldStore';
import { type AudioParams } from '../../../lib/AudioManager';
import { AudioControlSection } from '../AudioControlSection';
import { SynthSpecificParameters } from './SynthSpecificParameters';
import { AdvancedSynthParameters } from './AdvancedSynthParameters';
import { SoundTransformSection } from './SoundTransformSection';
import { ColorSection } from './ColorSection';

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
  // onRemove
}: SoundObjectControlsProps) {
  const isCustomObject = selectedObject.type === 'custom';

  return (
    <div className="space-y-4">
      {/* Para objetos personalizados, solo mostrar transformación */}
      {isCustomObject ? (
        <SoundTransformSection 
          selectedObject={selectedObject}
          onTransformChange={onTransformChange}
          onResetTransform={onResetTransform}
          roundToDecimals={roundToDecimals}
        />
      ) : (
        <>
      {/* Control de activación de audio */}
      <AudioControlSection 
        selectedObject={selectedObject} 
      />

      {/* Controles de parámetros */}
      <SynthSpecificParameters 
        selectedObject={selectedObject}
        onParamChange={onParamChange}
      />

      {/* Parámetros avanzados de sintetizadores */}
      <AdvancedSynthParameters
        object={selectedObject}
      />

      {/* Sección de color */}
      <ColorSection
        selectedObject={selectedObject}
        onParamChange={onParamChange}
      />







      {/* Sección de Posición y Tamaño - Al final */}
      <SoundTransformSection 
        selectedObject={selectedObject}
        onTransformChange={onTransformChange}
        onResetTransform={onResetTransform}
        roundToDecimals={roundToDecimals}
      />
        </>
      )}
    </div>
  );
}
