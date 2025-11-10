'use client';

import React from 'react';
import { type SoundObject } from '../../../state/useWorldStore';
import { type AudioParams } from '../../../lib/AudioManager';
import { useLanguage } from '../../../contexts/LanguageContext';

interface PolySynthParametersProps {
  selectedObject: SoundObject;
  onParamChange: (param: keyof AudioParams, value: number | string | string[] | Record<string, string>) => void;
}

export function PolySynthParameters({
  selectedObject,
  onParamChange
}: PolySynthParametersProps) {
  const { t } = useLanguage();

  if (selectedObject.type !== 'dodecahedronRing') return null;

  return (
    <>
      {/* Sección: Parámetros del PolySynth */}
      <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-600">
        <h4 className="text-sm font-semibold text-pink-400 mb-3 flex items-center gap-2">
          🔷 {t('parameterEditor.polySynthParametersTitle')}
        </h4>
        
        {/* Polifonía */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-300 mb-1">
            {t('parameterEditor.polyphony')}
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1"
              max="8"
              step="1"
              value={selectedObject.audioParams.polyphony || 4}
              onChange={(e) => onParamChange('polyphony', Number(e.target.value))}
              className="futuristic-slider flex-1"
            />
            <span className="text-white font-mono text-sm min-w-[4rem] text-right">
              {selectedObject.audioParams.polyphony || 4}
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1</span>
            <span>8</span>
          </div>
        </div>

        {/* Tipo de Acorde */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-300 mb-1">
            {t('parameterEditor.chordType')}
          </label>
          <select
            value={JSON.stringify(selectedObject.audioParams.chord || ["C4", "E4", "G4"])}
            onChange={(e) => {
              const chordMap: { [key: string]: string[] } = {
                '["C4","E4","G4"]': ["C4", "E4", "G4"],
                '["C4","Eb4","G4"]': ["C4", "Eb4", "G4"],
                '["C4","E4","G4","B4"]': ["C4", "E4", "G4", "B4"],
                '["C4","Eb4","G4","Bb4"]': ["C4", "Eb4", "G4", "Bb4"],
                '["C4","E4","G4","B4","D5"]': ["C4", "E4", "G4", "B4", "D5"],
                '["C4","Eb4","G4","Bb4","D5"]': ["C4", "Eb4", "G4", "Bb4", "D5"],
                '["C4","E4","G#4","B4"]': ["C4", "E4", "G#4", "B4"],
                '["C4","Eb4","G4","Bb4","Db5"]': ["C4", "Eb4", "G4", "Bb4", "Db5"],
              };
              const chord = chordMap[e.target.value] || ["C4", "E4", "G4"];
              onParamChange('chord', chord);
            }}
            className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-pink-500 focus:outline-none transition-colors"
          >
            <option value='["C4","E4","G4"]'>{t('parameterEditor.chords.major')}</option>
            <option value='["C4","Eb4","G4"]'>{t('parameterEditor.chords.minor')}</option>
            <option value='["C4","E4","G4","B4"]'>{t('parameterEditor.chords.major7')}</option>
            <option value='["C4","Eb4","G4","Bb4"]'>{t('parameterEditor.chords.minor7')}</option>
            <option value='["C4","E4","G4","B4","D5"]'>{t('parameterEditor.chords.major9')}</option>
            <option value='["C4","Eb4","G4","Bb4","D5"]'>{t('parameterEditor.chords.minor9')}</option>
            <option value='["C4","E4","G#4","B4"]'>{t('parameterEditor.chords.major7Sharp5')}</option>
            <option value='["C4","Eb4","G4","Bb4","Db5"]'>{t('parameterEditor.chords.minor9b5')}</option>
          </select>
        </div>

        {/* Release */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-300 mb-1">
            {t('parameterEditor.release')}
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0.01"
              max="4"
              step="0.01"
              value={selectedObject.audioParams.release || 1}
              onChange={(e) => onParamChange('release', Number(e.target.value))}
              className="futuristic-slider flex-1"
            />
            <span className="text-white font-mono text-sm min-w-[4rem] text-right">
              {(selectedObject.audioParams.release || 1).toFixed(2)}s
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0.01s</span>
            <span>4s</span>
          </div>
        </div>

        {/* Curve */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-300 mb-1">
            {t('parameterEditor.curve')}
          </label>
          <select
            value={selectedObject.audioParams.curve || 'linear'}
            onChange={(e) => onParamChange('curve', e.target.value)}
            className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-pink-500 focus:outline-none transition-colors"
          >
            <option value="linear">{t('parameterEditor.curveLinear')}</option>
            <option value="exponential">{t('parameterEditor.curveExponential')}</option>
            <option value="sine">{t('parameterEditor.curveSine')}</option>
            <option value="cosine">{t('parameterEditor.curveCosine')}</option>
            <option value="bounce">{t('parameterEditor.curveBounce')}</option>
            <option value="ripple">{t('parameterEditor.curveRipple')}</option>
            <option value="step">{t('parameterEditor.curveStep')}</option>
          </select>
        </div>
      </div>
    </>
  );
}
