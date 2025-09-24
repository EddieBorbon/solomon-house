'use client';

import React from 'react';
import { type SoundObject } from '../../../../state/useWorldStore';
import { type AudioParams } from '../../../../lib/AudioManager';
import { BaseSynthParameters } from './BaseSynthParameters';
import { PolySynthParameters } from './PolySynthParameters';
import { PluckSynthParameters } from './PluckSynthParameters';
import { DuoSynthParameters } from './DuoSynthParameters';
import { FMSynthParameters } from './FMSynthParameters';
import { MembraneSynthParameters } from './MembraneSynthParameters';
import { MonoSynthParameters } from './MonoSynthParameters';
import { MetalSynthParameters } from './MetalSynthParameters';
import { NoiseSynthParameters } from './NoiseSynthParameters';

interface SynthParametersFacadeProps {
  selectedObject: SoundObject;
  onParamChange: (param: keyof AudioParams, value: number | string | string[] | Record<string, string>) => void;
}

/**
 * Facade principal para la gestión de parámetros de sintetizadores
 * Responsabilidad única: Coordinar todos los componentes especializados y proporcionar API unificada
 */
export function SynthParametersFacade({
  selectedObject,
  onParamChange
}: SynthParametersFacadeProps) {

  // Función helper para determinar si mostrar modulación
  const shouldShowModulation = () => {
    return selectedObject.type === 'cube' || 
           selectedObject.type === 'sphere' || 
           selectedObject.type === 'cylinder';
  };

  // Función helper para determinar el tipo de modulación
  const getModulationType = (): 'waveform2' | 'modulationWaveform' => {
    return selectedObject.type === 'cylinder' ? 'waveform2' : 'modulationWaveform';
  };

  // Función helper para determinar si mostrar controles básicos
  const shouldShowBasicControls = () => {
    return selectedObject.type !== 'spiral';
  };

  // Renderizar controles específicos según el tipo de sintetizador
  const renderSpecificControls = () => {
    switch (selectedObject.type) {
      case 'sphere':
        return (
          <FMSynthParameters
            selectedObject={selectedObject}
            onParamChange={onParamChange}
          />
        );
      
      case 'cone':
        return (
          <MembraneSynthParameters
            selectedObject={selectedObject}
            onParamChange={onParamChange}
          />
        );
      
      case 'pyramid':
        return (
          <MonoSynthParameters
            selectedObject={selectedObject}
            onParamChange={onParamChange}
          />
        );
      
      case 'icosahedron':
        return (
          <MetalSynthParameters
            selectedObject={selectedObject}
            onParamChange={onParamChange}
          />
        );
      
      case 'plane':
        return (
          <NoiseSynthParameters
            selectedObject={selectedObject}
            onParamChange={onParamChange}
          />
        );
      
      case 'dodecahedronRing':
        return (
          <PolySynthParameters
            selectedObject={selectedObject}
            onParamChange={onParamChange}
          />
        );
      
      case 'torus':
        return (
          <PluckSynthParameters
            selectedObject={selectedObject}
            onParamChange={onParamChange}
          />
        );
      
      case 'cylinder':
        return (
          <DuoSynthParameters
            selectedObject={selectedObject}
            onParamChange={onParamChange}
          />
        );
      
      // Para otros tipos de sintetizadores, solo mostrar controles básicos
      default:
        return null;
    }
  };

  return (
    <>
      {/* Controles comunes usando BaseSynthParameters */}
      <BaseSynthParameters
        selectedObject={selectedObject}
        onParamChange={onParamChange}
        showFrequency={shouldShowBasicControls()}
        showWaveform={shouldShowBasicControls()}
        showDuration={shouldShowBasicControls()}
        showModulation={shouldShowModulation()}
        modulationType={getModulationType()}
      />

      {/* Controles específicos según el tipo de sintetizador */}
      {renderSpecificControls()}
    </>
  );
}

/**
 * Hook helper para obtener información sobre los sintetizadores soportados
 */
export function useSynthInfo() {
  return {
    supportedSynthesizers: [
      { type: 'cone', name: 'MembraneSynth', description: 'Síntesis de membrana' },
      { type: 'cube', name: 'AMSynth', description: 'Modulación de amplitud' },
      { type: 'sphere', name: 'FMSynth', description: 'Modulación de frecuencia' },
      { type: 'cylinder', name: 'DuoSynth', description: 'Síntesis dual' },
      { type: 'pyramid', name: 'MonoSynth', description: 'Síntesis monofónica' },
      { type: 'icosahedron', name: 'MetalSynth', description: 'Síntesis metálica' },
      { type: 'plane', name: 'NoiseSynth', description: 'Síntesis de ruido' },
      { type: 'torus', name: 'PluckSynth', description: 'Síntesis de cuerda' },
      { type: 'dodecahedronRing', name: 'PolySynth', description: 'Síntesis polifónica' },
      { type: 'spiral', name: 'Sampler', description: 'Reproductor de muestras' }
    ],
    getSynthesizerInfo: (type: string) => {
      const synthMap: Record<string, { name: string; description: string }> = {
        'cone': { name: 'MembraneSynth', description: 'Síntesis de membrana' },
        'cube': { name: 'AMSynth', description: 'Modulación de amplitud' },
        'sphere': { name: 'FMSynth', description: 'Modulación de frecuencia' },
        'cylinder': { name: 'DuoSynth', description: 'Síntesis dual' },
        'pyramid': { name: 'MonoSynth', description: 'Síntesis monofónica' },
        'icosahedron': { name: 'MetalSynth', description: 'Síntesis metálica' },
        'plane': { name: 'NoiseSynth', description: 'Síntesis de ruido' },
        'torus': { name: 'PluckSynth', description: 'Síntesis de cuerda' },
        'dodecahedronRing': { name: 'PolySynth', description: 'Síntesis polifónica' },
        'spiral': { name: 'Sampler', description: 'Reproductor de muestras' }
      };
      return synthMap[type] || { name: 'Unknown', description: 'Sintetizador desconocido' };
    }
  };
}
