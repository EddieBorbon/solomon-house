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

  const renderAutoFilterParams = () => (
    <>
      {renderParameterSlider('depth', 'Profundidad de Modulación', 0, 1, 0.01, 0.5)}
      {renderParameterButtons('filterType', 'Tipo de Filtro', ['lowpass', 'highpass', 'bandpass', 'notch'] as const, 'lowpass')}
      {renderParameterSlider('filterQ', 'Resonancia del Filtro', 0, 10, 0.1, 1)}
      {renderParameterButtons('lfoType', 'Tipo de LFO', ['sine', 'square', 'triangle', 'sawtooth'] as const, 'sine')}
    </>
  );

  const renderAutoWahParams = () => (
    <>
      {renderParameterSlider('sensitivity', 'Sensibilidad', 0, 1, 0.01, 0.5)}
      {renderParameterSlider('frequency', 'Frecuencia Base', 20, 20000, 10, 200)}
      {renderParameterSlider('octaves', 'Octavas', 0.1, 8, 0.1, 2)}
    </>
  );

  const renderBitCrusherParams = () => (
    <>
      {renderParameterSlider('bits', 'Bits', 1, 16, 1, 8)}
      {renderParameterSlider('normFreq', 'Frecuencia Normalizada', 0, 1, 0.01, 0.5)}
    </>
  );

  const renderChebyshevParams = () => (
    <>
      {renderParameterSlider('order', 'Orden', 1, 50, 1, 2)}
      {renderParameterSlider('oversample', 'Oversample', 0, 4, 1, 0)}
    </>
  );

  const renderChorusParams = () => (
    <>
      {renderParameterSlider('frequency', 'Frecuencia del LFO', 0.1, 10, 0.1, 1)}
      {renderParameterSlider('delayTime', 'Tiempo de Delay', 0.1, 1, 0.01, 0.3)}
      {renderParameterSlider('depth', 'Profundidad', 0, 1, 0.01, 0.5)}
      {renderParameterSlider('feedback', 'Feedback', 0, 1, 0.01, 0.2)}
      {renderParameterSlider('spread', 'Spread', 0, 180, 1, 0)}
      {renderParameterButtons('lfoType', 'Tipo de LFO', ['sine', 'square', 'triangle', 'sawtooth'] as const, 'sine')}
    </>
  );

  const renderDistortionParams = () => (
    <>
      {renderParameterSlider('distortion', 'Distorsión', 0, 1, 0.01, 0.4)}
      {renderParameterSlider('oversample', 'Oversample', 0, 4, 1, 0)}
    </>
  );

  const renderFeedbackDelayParams = () => (
    <>
      {renderParameterSlider('delayTime', 'Tiempo de Delay', 0.1, 1, 0.01, 0.3)}
      {renderParameterSlider('feedback', 'Feedback', 0, 1, 0.01, 0.2)}
    </>
  );

  const renderFreeverbParams = () => (
    <>
      {renderParameterSlider('roomSize', 'Tamaño de Habitación', 0, 1, 0.01, 0.5)}
      {renderParameterSlider('dampening', 'Amortiguación', 0, 1, 0.01, 0.5)}
    </>
  );

  const renderFrequencyShifterParams = () => (
    <>
      {renderParameterSlider('frequency', 'Desplazamiento de Frecuencia', -2000, 2000, 1, 0)}
    </>
  );

  const renderJCReverbParams = () => (
    <>
      {renderParameterSlider('roomSize', 'Tamaño de Habitación', 0, 1, 0.01, 0.5)}
    </>
  );

  const renderPingPongDelayParams = () => (
    <>
      {renderParameterSlider('delayTime', 'Tiempo de Delay', 0.1, 1, 0.01, 0.3)}
      {renderParameterSlider('feedback', 'Feedback', 0, 1, 0.01, 0.2)}
      {renderParameterSlider('maxDelay', 'Delay Máximo', 0.1, 1, 0.01, 1)}
      {renderParameterSlider('wet', 'Wet', 0, 1, 0.01, 0.3)}
    </>
  );

  const renderPitchShiftParams = () => (
    <>
      {renderParameterSlider('pitch', 'Pitch', -12, 12, 0.1, 0)}
      {renderParameterSlider('windowSize', 'Tamaño de Ventana', 0.01, 0.1, 0.001, 0.02)}
      {renderParameterSlider('delayTime', 'Tiempo de Delay', 0, 0.1, 0.001, 0)}
      {renderParameterSlider('feedback', 'Feedback', 0, 1, 0.01, 0)}
    </>
  );

  const renderReverbParams = () => (
    <>
      {renderParameterSlider('decay', 'Decaimiento', 0, 20, 0.1, 1.5)}
      {renderParameterSlider('preDelay', 'Pre-Delay', 0, 1, 0.01, 0.01)}
    </>
  );

  const renderStereoWidenerParams = () => (
    <>
      {renderParameterSlider('width', 'Ancho Estéreo', 0, 2, 0.01, 1)}
    </>
  );

  const renderTremoloParams = () => (
    <>
      {renderParameterSlider('frequency', 'Frecuencia', 0.1, 20, 0.1, 4)}
      {renderParameterSlider('depth', 'Profundidad', 0, 1, 0.01, 0.5)}
      {renderParameterButtons('lfoType', 'Tipo de LFO', ['sine', 'square', 'triangle', 'sawtooth'] as const, 'sine')}
    </>
  );

  const renderVibratoParams = () => (
    <>
      {renderParameterSlider('frequency', 'Frecuencia', 0.1, 20, 0.1, 4)}
      {renderParameterSlider('depth', 'Profundidad', 0, 1, 0.01, 0.5)}
      {renderParameterButtons('lfoType', 'Tipo de LFO', ['sine', 'square', 'triangle', 'sawtooth'] as const, 'sine')}
    </>
  );

  const renderEffectSpecificParams = () => {
    switch (zone.type) {
      case 'autoFilter': return renderAutoFilterParams();
      case 'autoWah': return renderAutoWahParams();
      case 'bitCrusher': return renderBitCrusherParams();
      case 'chebyshev': return renderChebyshevParams();
      case 'chorus': return renderChorusParams();
      case 'distortion': return renderDistortionParams();
      case 'feedbackDelay': return renderFeedbackDelayParams();
      case 'freeverb': return renderFreeverbParams();
      case 'frequencyShifter': return renderFrequencyShifterParams();
      case 'jcReverb': return renderJCReverbParams();
      case 'pingPongDelay': return renderPingPongDelayParams();
      case 'pitchShift': return renderPitchShiftParams();
      case 'reverb': return renderReverbParams();
      case 'stereoWidener': return renderStereoWidenerParams();
      case 'tremolo': return renderTremoloParams();
      case 'vibrato': return renderVibratoParams();
      default: return null;
    }
  };

  return (
    <>
      {renderEffectSpecificParams()}
    </>
  );
}
