'use client';

import React, { useState, useEffect } from 'react';
import { useWorldStore } from '../../state/useWorldStore';
import { useGridStore } from '../../stores/useGridStore';

// Estilos CSS para los sliders
const sliderStyles = `
  .slider::-webkit-slider-thumb {
    appearance: none;
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: #ffffff;
    cursor: pointer;
    border: 2px solid #374151;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
  
  .slider::-webkit-slider-thumb:hover {
    background: #f3f4f6;
    border-color: #6b7280;
  }
  
  .slider::-moz-range-thumb {
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: #ffffff;
    cursor: pointer;
    border: 2px solid #374151;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
  
  .slider::-moz-range-thumb:hover {
    background: #f3f4f6;
    border-color: #6b7280;
  }
`;

interface TransformValues {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export function TransformEditor() {
  const { 
    selectedEntityId, 
    objects, 
    effectZones, 
    updateObject, 
    updateEffectZone,
    // Funciones globales
    updateGlobalSoundObject,
    updateGlobalEffectZone
  } = useWorldStore();
  
  const { activeGridId } = useGridStore();

  const [transformValues, setTransformValues] = useState<TransformValues>({
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1]
  });

  const [isExpanded, setIsExpanded] = useState(false);

  // Detectar si estamos en modo global
  const isGlobalMode = activeGridId === 'global-world';

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
        <style dangerouslySetInnerHTML={{ __html: sliderStyles }} />
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
                title={isExpanded ? "Colapsar" : "Expandir"}
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
                <p className="text-sm font-medium mb-2">Sin Entidad Seleccionada</p>
                <p className="text-xs text-gray-500">
                  Haz clic en un objeto sonoro o zona de efecto para editar su transformación
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const handleTransformChange = async (
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

    // Aplicar cambios a la entidad usando función global o local según el modo
    if (selectedEntity.type === 'soundObject') {
      if (isGlobalMode) {
        await updateGlobalSoundObject(selectedEntity.data.id, {
          [property]: newValues[property]
        });
      } else {
        updateObject(selectedEntity.data.id, {
          [property]: newValues[property]
        });
      }
    } else if (selectedEntity.type === 'effectZone') {
      if (isGlobalMode) {
        await updateGlobalEffectZone(selectedEntity.data.id, {
          [property]: newValues[property]
        });
      } else {
        updateEffectZone(selectedEntity.data.id, {
          [property]: newValues[property]
        });
      }
    }
  };

  const resetTransform = async () => {
    const resetValues: TransformValues = {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1]
    };
    
    setTransformValues(resetValues);

    // Aplicar reset a la entidad usando función global o local según el modo
    if (selectedEntity.type === 'soundObject') {
      if (isGlobalMode) {
        await updateGlobalSoundObject(selectedEntity.data.id, resetValues);
      } else {
        updateObject(selectedEntity.data.id, resetValues);
      }
    } else if (selectedEntity.type === 'effectZone') {
      if (isGlobalMode) {
        await updateGlobalEffectZone(selectedEntity.data.id, resetValues);
      } else {
        updateEffectZone(selectedEntity.data.id, resetValues);
      }
    }
  };

  const roundToDecimals = (value: number, decimals: number = 2) => {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  };

  return (
    <div className="fixed top-4 right-4 z-50 w-80">
      <style dangerouslySetInnerHTML={{ __html: sliderStyles }} />
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
                Position
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { axis: 'X', color: 'bg-red-500', value: transformValues.position[0] },
                  { axis: 'Y', color: 'bg-green-500', value: transformValues.position[1] },
                  { axis: 'Z', color: 'bg-blue-500', value: transformValues.position[2] }
                ].map(({ axis, color, value }, index) => (
                  <div key={axis} className="flex flex-col">
                    <div className="flex items-center gap-1 mb-1">
                      <div className={`w-2 h-2 ${color} rounded-sm`}></div>
                      <span className="text-xs text-gray-400">{axis}</span>
                      <span className="text-xs text-white ml-auto">{roundToDecimals(value)}</span>
                    </div>
                    <input
                      type="range"
                      min="-10"
                      max="10"
                      step="0.1"
                      value={value}
                      onChange={(e) => {
                        const newValue = parseFloat(e.target.value);
                        handleTransformChange('position', index as 0 | 1 | 2, newValue);
                      }}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, ${color.replace('bg-', '#')} 0%, ${color.replace('bg-', '#')} ${((value + 10) / 20) * 100}%, #374151 ${((value + 10) / 20) * 100}%, #374151 100%)`
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Rotation */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-300 flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
                Rotation
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { axis: 'X', color: 'bg-red-500', value: transformValues.rotation[0] },
                  { axis: 'Y', color: 'bg-green-500', value: transformValues.rotation[1] },
                  { axis: 'Z', color: 'bg-blue-500', value: transformValues.rotation[2] }
                ].map(({ axis, color, value }, index) => (
                  <div key={axis} className="flex flex-col">
                    <div className="flex items-center gap-1 mb-1">
                      <div className={`w-2 h-2 ${color} rounded-sm`}></div>
                      <span className="text-xs text-gray-400">{axis}</span>
                      <span className="text-xs text-white ml-auto">{roundToDecimals(value)}°</span>
                    </div>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      step="1"
                      value={value}
                      onChange={(e) => {
                        const newValue = parseFloat(e.target.value);
                        handleTransformChange('rotation', index as 0 | 1 | 2, newValue);
                      }}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, ${color.replace('bg-', '#')} 0%, ${color.replace('bg-', '#')} ${((value + 180) / 360) * 100}%, #374151 ${((value + 180) / 360) * 100}%, #374151 100%)`
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Scale */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-300 flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-sm"></div>
                Scale
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { axis: 'X', color: 'bg-red-500', value: transformValues.scale[0] },
                  { axis: 'Y', color: 'bg-green-500', value: transformValues.scale[1] },
                  { axis: 'Z', color: 'bg-blue-500', value: transformValues.scale[2] }
                ].map(({ axis, color, value }, index) => (
                  <div key={axis} className="flex flex-col">
                    <div className="flex items-center gap-1 mb-1">
                      <div className={`w-2 h-2 ${color} rounded-sm`}></div>
                      <span className="text-xs text-gray-400">{axis}</span>
                      <span className="text-xs text-white ml-auto">{roundToDecimals(value)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="5"
                      step="0.1"
                      value={value}
                      onChange={(e) => {
                        const newValue = parseFloat(e.target.value);
                        handleTransformChange('scale', index as 0 | 1 | 2, newValue);
                      }}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, ${color.replace('bg-', '#')} 0%, ${color.replace('bg-', '#')} ${((value - 0.1) / 4.9) * 100}%, #374151 ${((value - 0.1) / 4.9) * 100}%, #374151 100%)`
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Controles adicionales */}
            <div className="pt-2 border-t border-gray-700">
              <div className="flex gap-2">
                <button
                  onClick={resetTransform}
                  className="flex-1 px-3 py-2 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded border border-gray-600 transition-colors"
                  title="Resetear transformación a valores por defecto"
                >
                  🔄 Reset
                </button>
                <button
                  onClick={() => {
                    // Copiar valores al portapapeles
                    const transformText = `Position: [${transformValues.position.join(', ')}]\nRotation: [${transformValues.rotation.join(', ')}]\nScale: [${transformValues.scale.join(', ')}]`;
                    navigator.clipboard.writeText(transformText);
                  }}
                  className="px-3 py-2 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded border border-gray-600 transition-colors"
                  title="Copiar valores al portapapeles"
                >
                  📋
                </button>
              </div>
            </div>

            {/* Información de la entidad */}
            <div className="pt-2 border-t border-gray-700">
              <div className="text-xs text-gray-400 space-y-1">
                <p>Tipo: <span className="text-white">{selectedEntity.type === 'soundObject' ? 'Objeto Sonoro' : 'Zona de Efecto'}</span></p>
                <p>ID: <span className="text-white font-mono text-xs">{selectedEntity.data.id.slice(0, 8)}...</span></p>
                {selectedEntity.type === 'soundObject' && 'audioEnabled' in selectedEntity.data && (
                  <p>Sonido: <span className="text-white">{selectedEntity.data.audioEnabled ? '🟢 Activo' : '🔴 Inactivo'}</span></p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
