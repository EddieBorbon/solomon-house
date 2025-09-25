'use client';

import React from 'react';
import { type EffectZone } from '../../state/useWorldStore';

interface EffectSpecificParametersProps {
  zone: EffectZone;
  onEffectParamChange: (param: string, value: number | string) => void;
}

export function EffectSpecificParameters({ zone, onEffectParamChange }: EffectSpecificParametersProps) {
  const renderParameterSlider = (
    param: string,
    label: string,
    min: number,
    max: number,
    step: number,
    defaultValue: number
  ) => (
    <div>
      <label className="block text-xs font-medium text-gray-300 mb-1">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={zone.effectParams[param as keyof typeof zone.effectParams] ?? defaultValue}
          onChange={(e) => onEffectParamChange(param, Number(e.target.value))}
          className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          disabled={zone.isLocked}
        />
        <span className="text-white font-mono text-sm min-w-[4rem] text-right">
          {zone.effectParams[param as keyof typeof zone.effectParams] ?? defaultValue}
        </span>
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );

  const renderParameterButtons = (
    param: string,
    label: string,
    options: readonly string[],
    defaultValue: string
  ) => (
    <div>
      <label className="block text-xs font-medium text-gray-300 mb-1">
        {label}
      </label>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onEffectParamChange(param, option)}
            disabled={zone.isLocked}
            className={`px-2 py-1 text-xs rounded-md transition-colors ${
              (zone.effectParams[param as keyof typeof zone.effectParams] ?? defaultValue) === option
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            <span className="capitalize">{option}</span>
          </button>
        ))}
      </div>
    </div>
  );



  const renderBitCrusherParams = () => (
    <>
      {renderParameterSlider('bits', 'Bits', 1, 16, 1, 8)}
      {renderParameterSlider('normFreq', 'Frecuencia Normalizada', 0, 1, 0.01, 0.5)}
    </>
  );





  const renderEffectSpecificParams = () => {
    switch (zone.type) {
      // bitCrusher se maneja en EffectParametersSection, no aquí
      default: return null;
    }
  };

  return (
    <>
      {renderEffectSpecificParams()}
    </>
  );
}
