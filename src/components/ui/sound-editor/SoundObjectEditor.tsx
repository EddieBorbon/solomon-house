'use client';

import { type SoundObject } from '../../../state/useWorldStore';
import { type AudioParams } from '../../../lib/AudioManager';
import { SoundObjectHeader } from './SoundObjectHeader';
import { SoundObjectControls } from './SoundObjectControls';
import { SoundObjectFooter } from './SoundObjectFooter';

interface SoundObjectEditorProps {
  selectedObject: SoundObject;
  onParamChange: (param: keyof AudioParams, value: number | string | string[] | Record<string, string>) => void;
  onTransformChange: (property: 'position' | 'rotation' | 'scale', axis: 0 | 1 | 2, value: number) => void;
  onResetTransform: () => void;
  roundToDecimals: (value: number) => number;
  onRemove: (id: string) => void;
}

export function SoundObjectEditor({
  selectedObject,
  onParamChange,
  onTransformChange,
  onResetTransform,
  roundToDecimals,
  onRemove
}: SoundObjectEditorProps) {
  return (
    <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg border border-gray-700 shadow-2xl p-6 max-w-sm max-h-[90vh] overflow-y-auto">
      {/* Header con información del objeto */}
      <SoundObjectHeader 
        selectedObject={selectedObject}
        onRemove={onRemove}
      />

      <SoundObjectControls 
        selectedObject={selectedObject}
        onParamChange={onParamChange}
        onTransformChange={onTransformChange}
        onResetTransform={onResetTransform}
        roundToDecimals={roundToDecimals}
        onRemove={onRemove}
      />

      <SoundObjectFooter />
    </div>
  );
}
