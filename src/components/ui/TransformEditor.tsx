'use client';

import React, { useState, useEffect } from 'react';
import { useWorldStore } from '../../state/useWorldStore';
import { useLanguage } from '../../contexts/LanguageContext';

interface TransformValues {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export function TransformEditor() {
  const { t } = useLanguage();
  const { 
    selectedEntityId, 
    objects, 
    effectZones, 
    updateObject, 
    updateEffectZone 
  } = useWorldStore();

  const [transformValues, setTransformValues] = useState<TransformValues>({
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1]
  });

  const [isExpanded, setIsExpanded] = useState(false);

  // Encontrar la entidad seleccionada
  const selectedEntity = React.useMemo(() => {
    if (!selectedEntityId) return null;
    
    // Buscar en objetos sonoros
    const soundObject = objects.find(obj => obj.id === selectedEntityId);
    if (soundObject) return { type: 'soundObject', data: soundObject };
    
    // Buscar en zonas de efectos
    const effectZone = effectZones.find(zone => zone.id === selectedEntityId);
    if (effectZone) return { type: 'effectZone', data: effectZone };
    
    return null;
  }, [objects, effectZones, selectedEntityId]);

  // Actualizar valores cuando cambie la entidad seleccionada
  useEffect(() => {
    if (selectedEntity) {
      setTransformValues({
        position: selectedEntity.data.position,
        rotation: selectedEntity.data.rotation,
        scale: selectedEntity.data.scale
      });
    }
  }, [selectedEntity]);

  // Solo mostrar si hay una entidad seleccionada
  if (!selectedEntity) {
    return (
      <div className="fixed top-4 right-4 z-50 w-80">
        <div className="bg-gray-900/95 backdrop-blur-sm rounded-lg border border-gray-700 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-br from-red-500 via-green-500 to-blue-500 rounded-sm"></div>
              <h3 className="text-sm font-semibold text-white">Transform</h3>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded text-xs"
                title={isExpanded ? t('transformEditor.collapse') : t('transformEditor.expand')}
              >
                {isExpanded ? '▼' : '▶'}
              </button>
            </div>
          </div>

          {/* Contenido cuando no hay entidad seleccionada */}
          {isExpanded && (
            <div className="p-4">
              <div className="text-center text-gray-400">
                <div className="text-4xl mb-2">🎯</div>
                <p className="text-sm font-medium mb-2">{t('transformEditor.noEntitySelected')}</p>
                <p className="text-xs text-gray-500">
                  {t('transformEditor.clickToEditTransform')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const handleTransformChange = (
    property: keyof TransformValues,
    axis: 0 | 1 | 2,
    value: number
  ) => {
    const newValues = {
      ...transformValues,
      [property]: [
        ...transformValues[property]
      ] as [number, number, number]
    };
    
    newValues[property][axis] = value;
    setTransformValues(newValues);

    // Aplicar cambios a la entidad
    if (selectedEntity.type === 'soundObject') {
      updateObject(selectedEntity.data.id, {
        [property]: newValues[property]
      });
    } else if (selectedEntity.type === 'effectZone') {
      updateEffectZone(selectedEntity.data.id, {
        [property]: newValues[property]
      });
    }
  };

  const resetTransform = () => {
    const resetValues: TransformValues = {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1]
    };
    
    setTransformValues(resetValues);

    // Aplicar reset a la entidad
    if (selectedEntity.type === 'soundObject') {
      updateObject(selectedEntity.data.id, resetValues);
    } else if (selectedEntity.type === 'effectZone') {
      updateEffectZone(selectedEntity.data.id, resetValues);
    }
  };

  const roundToDecimals = (value: number, decimals: number = 2) => {
    if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
      return 0;
    }
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  };

  // Helper para renderizar inputs de escala
  const renderScaleInputs = () => {
    const scaleInputs = [
      { axis: 'X', color: 'bg-red-500', value: transformValues.scale[0] },
      { axis: 'Y', color: 'bg-green-500', value: transformValues.scale[1] },
      { axis: 'Z', color: 'bg-blue-500', value: transformValues.scale[2] }
    ];
    return scaleInputs.map(({ axis, color, value }, index) => {
      const safeValue = (typeof value === 'number' && !isNaN(value)) ? value : 1;
      const roundedValue = roundToDecimals(safeValue);
      return (
        <div key={axis} className="flex flex-col">
          <div className="flex items-center gap-1 mb-1">
            <div className={`w-2 h-2 ${color} rounded-sm`}></div>
            <span className="text-xs text-gray-400">{axis}</span>
          </div>
          <input
            type="number"
            step="0.1"
            min="0.1"
            value={isNaN(roundedValue) ? 1 : roundedValue}
            onChange={(e) => {
              const newValue = Math.max(0.1, parseFloat(e.target.value) || 1);
              handleTransformChange('scale', index as 0 | 1 | 2, newValue);
            }}
            className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
          />
        </div>
      );
    });
  };

  return (
    <div className="fixed top-4 right-4 z-50 w-80">
      <div className="bg-gray-900/95 backdrop-blur-sm rounded-lg border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-br from-red-500 via-green-500 to-blue-500 rounded-sm"></div>
            <h3 className="text-sm font-semibold text-white">{t('transformEditor.title')}</h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-white transition-colors p-1 rounded text-xs"
              title={isExpanded ? "Colapsar" : "Expandir"}
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          </div>
        </div>

        {/* Contenido expandible */}
        {isExpanded && (
          <div className="p-3 space-y-4">
            {/* Position */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-300 flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                {t('transformEditor.position')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { axis: 'X', color: 'bg-red-500', value: transformValues.position[0] },
                  { axis: 'Y', color: 'bg-green-500', value: transformValues.position[1] },
                  { axis: 'Z', color: 'bg-blue-500', value: transformValues.position[2] }
                ].map(({ axis, color, value }, index) => {
                  const safeValue = (typeof value === 'number' && !isNaN(value)) ? value : 0;
                  const roundedValue = roundToDecimals(safeValue);
                  return (
                    <div key={axis} className="flex flex-col">
                      <div className="flex items-center gap-1 mb-1">
                        <div className={`w-2 h-2 ${color} rounded-sm`}></div>
                        <span className="text-xs text-gray-400">{axis}</span>
                      </div>
                      <input
                        type="number"
                        step="0.1"
                        value={isNaN(roundedValue) ? 0 : roundedValue}
                        onChange={(e) => {
                          const newValue = parseFloat(e.target.value) || 0;
                          handleTransformChange('position', index as 0 | 1 | 2, newValue);
                        }}
                        className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rotation */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-300 flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
                {t('transformEditor.rotation')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { axis: 'X', color: 'bg-red-500', value: transformValues.rotation[0] },
                  { axis: 'Y', color: 'bg-green-500', value: transformValues.rotation[1] },
                  { axis: 'Z', color: 'bg-blue-500', value: transformValues.rotation[2] }
                ].map(({ axis, color, value }, index) => {
                  const safeValue = (typeof value === 'number' && !isNaN(value)) ? value : 0;
                  const roundedValue = roundToDecimals(safeValue);
                  return (
                    <div key={axis} className="flex flex-col">
                      <div className="flex items-center gap-1 mb-1">
                        <div className={`w-2 h-2 ${color} rounded-sm`}></div>
                        <span className="text-xs text-gray-400">{axis}</span>
                      </div>
                      <input
                        type="number"
                        step="1"
                        value={isNaN(roundedValue) ? 0 : roundedValue}
                        onChange={(e) => {
                          const newValue = parseFloat(e.target.value) || 0;
                          handleTransformChange('rotation', index as 0 | 1 | 2, newValue);
                        }}
                        className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Scale */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-300 flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-sm"></div>
                {t('transformEditor.scale')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {renderScaleInputs()}
              </div>
            </div>

            {/* Controles adicionales */}
            <div className="pt-2 border-t border-gray-700">
              <div className="flex gap-2">
                <button
                  onClick={resetTransform}
                  className="flex-1 px-3 py-2 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded border border-gray-600 transition-colors"
                  title={t('transformEditor.resetTransform')}
                >
                  🔄 {t('transformEditor.reset')}
                </button>
                <button
                  onClick={() => {
                    // Copiar valores al portapapeles
                    const transformText = `Position: [${transformValues.position.join(', ')}]\nRotation: [${transformValues.rotation.join(', ')}]\nScale: [${transformValues.scale.join(', ')}]`;
                    navigator.clipboard.writeText(transformText);
                  }}
                  className="px-3 py-2 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded border border-gray-600 transition-colors"
                  title={t('transformEditor.copyClipboard')}
                >
                  📋
                </button>
              </div>
            </div>

            {/* Información de la entidad */}
            <div className="pt-2 border-t border-gray-700">
              <div className="text-xs text-gray-400 space-y-1">
                <p>Tipo: <span className="text-white">{selectedEntity.type === 'soundObject' ? t('transformEditor.objetoSonoro') : t('transformEditor.zonadeEfecto')}</span></p>
                <p>ID: <span className="text-white font-mono text-xs">{selectedEntity.data.id.slice(0, 8)}...</span></p>
                {selectedEntity.type === 'soundObject' && 'audioEnabled' in selectedEntity.data && (
                  <p>Sonido: <span className="text-white">{selectedEntity.data.audioEnabled ? `🟢 ${t('transformEditor.active')}` : `🔴 ${t('transformEditor.inactive')}`}</span></p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
