'use client';

import { type SoundObject } from '../../../state/useWorldStore';
import { type AudioParams } from '../../../lib/AudioManager';
import { useTutorialStore } from '../../../stores/useTutorialStore';
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
  const { isActive: isTutorialActive, currentStep } = useTutorialStore();
  
  // Durante el paso 8 del tutorial (currentStep === 7), solo mostrar Audio Parameters
  const isTutorialStep8 = isTutorialActive && currentStep === 7;
  // Durante el paso 9 del tutorial (currentStep === 8), solo mostrar Color/Material
  const isTutorialStep9 = isTutorialActive && currentStep === 8;

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
      {/* Control de activación de audio - ACTIVO EN TUTORIAL PASO 8 */}
      <div className={isTutorialStep9 ? 'opacity-50 pointer-events-none' : ''}>
        <AudioControlSection 
          selectedObject={selectedObject} 
        />
      </div>

      {/* Controles de parámetros - ACTIVO EN TUTORIAL PASO 8 */}
      <div className={isTutorialStep9 ? 'opacity-50 pointer-events-none' : ''}>
        <SynthSpecificParameters 
          selectedObject={selectedObject}
          onParamChange={onParamChange}
        />
      </div>

      {/* Parámetros avanzados de sintetizadores - DESACTIVADO EN TUTORIAL PASOS 8 y 9 */}
      <div className={isTutorialStep8 || isTutorialStep9 ? 'opacity-50 pointer-events-none' : ''}>
        <AdvancedSynthParameters
          object={selectedObject}
        />
      </div>

      {/* Sección de color - ACTIVO EN TUTORIAL PASO 9, DESACTIVADO EN PASO 8 */}
      <div className={isTutorialStep8 ? 'opacity-50 pointer-events-none' : ''}>
        <ColorSection
          selectedObject={selectedObject}
          onParamChange={onParamChange}
        />
      </div>







      {/* Sección de Posición y Tamaño - DESACTIVADO EN TUTORIAL PASOS 8 y 9 */}
      <div className={isTutorialStep8 || isTutorialStep9 ? 'opacity-50 pointer-events-none' : ''}>
        <SoundTransformSection 
          selectedObject={selectedObject}
          onTransformChange={onTransformChange}
          onResetTransform={onResetTransform}
          roundToDecimals={roundToDecimals}
        />
      </div>
        </>
      )}
    </div>
  );
}
