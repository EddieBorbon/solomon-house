'use client';

import React from 'react';
import { type SoundObject } from '../../../state/useWorldStore';
import { type AudioParams } from '../../../lib/AudioManager';
import { MonoSynthParameters } from './MonoSynthParameters';
import { MetalSynthParameters } from './MetalSynthParameters';
import { NoiseSynthParameters } from './NoiseSynthParameters';
import { PluckSynthParameters } from './PluckSynthParameters';
import { PolySynthParameters } from './PolySynthParameters';
import { SamplerParameters } from './SamplerParameters';

interface SoundObjectSynthParamsProps {
  selectedObject: SoundObject;
  onParamChange: (param: string | number | symbol, value: string | number | string[] | Record<string, string>) => void;
}

export function SoundObjectSynthParams({
  selectedObject,
  onParamChange
}: SoundObjectSynthParamsProps) {
  return (
    <>
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
    </>
  );
}
