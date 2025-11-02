'use client';

import React from 'react';
import { type EffectZone } from '../../../state/useWorldStore';
import { useLanguage } from '../../../contexts/LanguageContext';

interface EffectTransformSectionProps {
  zone: EffectZone;
  onUpdateEffectZone: (id: string, updates: Partial<EffectZone>) => void;
  roundToDecimals: (value: number) => number;
}

export function EffectTransformSection({
  zone,
  onUpdateEffectZone,
  roundToDecimals
}: EffectTransformSectionProps) {
  const { t } = useLanguage();
  return (
    <div className="relative border border-white p-4 mb-4">
      {/* Esquinas cortadas */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
      
      <h4 className="futuristic-label mb-3 text-white text-center">
        {t('parameterEditor.positionAndSize')}
      </h4>
      
      {/* Position, Rotation, Scale - Todo junto */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        {/* Position */}
        <div>
          <label className="futuristic-label block mb-2 text-white text-center">{t('parameterEditor.position')}</label>
          <div className="space-y-1">
            {[
              { axis: 'X', value: zone?.position[0] },
              { axis: 'Y', value: zone?.position[1] },
              { axis: 'Z', value: zone?.position[2] }
            ].map(({ axis, value }, index) => {
              const safeValue = (typeof value === 'number' && !isNaN(value)) ? value : 0;
              const roundedValue = roundToDecimals(safeValue);
              return (
                <div key={axis} className="flex items-center gap-1">
                  <span className="text-xs text-white font-mono tracking-wider w-3">{axis}</span>
                  <input
                    type="number"
                    step="0.1"
                    value={isNaN(roundedValue) ? 0 : roundedValue}
                    onChange={(e) => {
                      const newValue = parseFloat(e.target.value) || 0;
                      const newPosition = [...zone?.position] as [number, number, number];
                      newPosition[index] = newValue;
                      onUpdateEffectZone(zone?.id, { position: newPosition });
                    }}
                    className="bg-black border border-white text-white text-xs font-mono px-1 py-0.5 w-12 h-6 focus:outline-none focus:border-gray-400"
                    disabled={zone?.isLocked}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Rotation */}
        <div>
          <label className="futuristic-label block mb-2 text-white text-center">{t('parameterEditor.rotation')}</label>
          <div className="space-y-1">
            {[
              { axis: 'X', value: zone?.rotation[0] },
              { axis: 'Y', value: zone?.rotation[1] },
              { axis: 'Z', value: zone?.rotation[2] }
            ].map(({ axis, value }, index) => {
              const safeValue = (typeof value === 'number' && !isNaN(value)) ? value : 0;
              const roundedValue = roundToDecimals(safeValue);
              return (
                <div key={axis} className="flex items-center gap-1">
                  <span className="text-xs text-white font-mono tracking-wider w-3">{axis}</span>
                  <input
                    type="number"
                    step="1"
                    value={isNaN(roundedValue) ? 0 : roundedValue}
                    onChange={(e) => {
                      const newValue = parseFloat(e.target.value) || 0;
                      const newRotation = [...zone?.rotation] as [number, number, number];
                      newRotation[index] = newValue;
                      onUpdateEffectZone(zone?.id, { rotation: newRotation });
                    }}
                    className="bg-black border border-white text-white text-xs font-mono px-1 py-0.5 w-12 h-6 focus:outline-none focus:border-gray-400"
                    disabled={zone?.isLocked}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Scale */}
        <div>
          <label className="futuristic-label block mb-2 text-white text-center">{t('parameterEditor.scale')}</label>
          <div className="space-y-1">
            {[
              { axis: 'X', value: zone?.scale[0] },
              { axis: 'Y', value: zone?.scale[1] },
              { axis: 'Z', value: zone?.scale[2] }
            ].map(({ axis, value }, index) => {
              const safeValue = (typeof value === 'number' && !isNaN(value)) ? value : 1;
              const roundedValue = roundToDecimals(safeValue);
              return (
                <div key={axis} className="flex items-center gap-1">
                  <span className="text-xs text-white font-mono tracking-wider w-3">{axis}</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={isNaN(roundedValue) ? 1 : roundedValue}
                    onChange={(e) => {
                      const newValue = Math.max(0.1, parseFloat(e.target.value) || 1);
                      const newScale = [...zone?.scale] as [number, number, number];
                      newScale[index] = newValue;
                      onUpdateEffectZone(zone?.id, { scale: newScale });
                    }}
                    className="bg-black border border-white text-white text-xs font-mono px-1 py-0.5 w-12 h-6 focus:outline-none focus:border-gray-400"
                    disabled={zone?.isLocked}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Controles de transformación */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            // Resetear a valores por defecto
            onUpdateEffectZone(zone?.id, { 
              position: [0, 0, 0], 
              rotation: [0, 0, 0],
              scale: [1, 1, 1] 
            });
          }}
          className="relative bg-black border border-white px-3 py-2 text-white hover:bg-white hover:text-black transition-all duration-300 group flex items-center gap-2 flex-1 justify-center"
          title={t('transformEditor.resetTransform')}
          disabled={zone?.isLocked}
        >
          <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
          <span className="relative text-xs font-mono tracking-wider uppercase">{t('parameterEditor.reset')}</span>
        </button>
        <button
          onClick={() => {
            // Copiar valores al portapapeles
            const transformText = `${t('transformEditor.position')}: [${zone?.position.join(', ')}]\n${t('transformEditor.rotation')}: [${zone?.rotation.join(', ')}]\n${t('transformEditor.scale')}: [${zone?.scale.join(', ')}]`;
            navigator.clipboard.writeText(transformText);
          }}
          className="relative bg-black border border-white px-3 py-2 text-white hover:bg-white hover:text-black transition-all duration-300 group flex items-center gap-2 flex-1 justify-center"
          title={t('transformEditor.copyClipboard')}
        >
          <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
          <span className="relative text-xs font-mono tracking-wider uppercase">{t('parameterEditor.copy')}</span>
        </button>
      </div>
    </div>
  );
}
