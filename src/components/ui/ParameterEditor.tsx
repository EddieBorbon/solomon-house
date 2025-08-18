'use client';

import { useWorldStore } from '../../state/useWorldStore';
import { useMemo } from 'react';
import { type AudioParams } from '../../hooks/useObjectAudio';

export function ParameterEditor() {
  const { objects, selectedObjectId, updateObject } = useWorldStore();

  // Encontrar el objeto seleccionado
  const selectedObject = useMemo(() => {
    return objects.find(obj => obj.id === selectedObjectId);
  }, [objects, selectedObjectId]);

  // Función para actualizar un parámetro específico
  const handleParamChange = (param: keyof AudioParams, value: number | string) => {
    if (!selectedObject) return;

    const newAudioParams = {
      ...selectedObject.audioParams,
      [param]: value,
    };

    updateObject(selectedObject.id, {
      audioParams: newAudioParams,
    });

    console.log(`🎵 Parámetro ${param} actualizado a: ${value}`);
  };

  // Si no hay objeto seleccionado, mostrar mensaje
  if (!selectedObject) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg border border-gray-700 shadow-2xl p-6 max-w-sm">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              No hay objeto seleccionado
            </h3>
            <p className="text-gray-400 text-sm">
              Haz clic en un objeto en el mundo 3D para seleccionarlo y editar sus parámetros de audio.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg border border-gray-700 shadow-2xl p-6 max-w-sm">
        {/* Header con información del objeto */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-4 h-4 rounded ${
              selectedObject.type === 'cube' ? 'bg-blue-500' : 'bg-purple-500'
            }`} />
            <h3 className="text-lg font-semibold text-white">
              Editor de Parámetros
            </h3>
          </div>
          <div className="text-sm text-gray-400">
            <p>Objeto: <span className="text-white">{selectedObject.type}</span></p>
            <p>ID: <span className="text-white font-mono text-xs">{selectedObject.id.slice(0, 8)}...</span></p>
          </div>
        </div>

        {/* Controles de parámetros */}
        <div className="space-y-4">
          {/* Frecuencia */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Frecuencia (Hz)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="20"
                max="2000"
                step="1"
                value={selectedObject.audioParams.frequency}
                onChange={(e) => handleParamChange('frequency', Number(e.target.value))}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                {selectedObject.audioParams.frequency}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>20 Hz</span>
              <span>2000 Hz</span>
            </div>
          </div>

          {/* Volumen */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Volumen
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={selectedObject.audioParams.volume}
                onChange={(e) => handleParamChange('volume', Number(e.target.value))}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                {Math.round(selectedObject.audioParams.volume * 100)}%
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Reverb */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Reverb
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={selectedObject.audioParams.reverb}
                onChange={(e) => handleParamChange('reverb', Number(e.target.value))}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                {Math.round(selectedObject.audioParams.reverb * 100)}%
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Delay */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Delay
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={selectedObject.audioParams.delay}
                onChange={(e) => handleParamChange('delay', Number(e.target.value))}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                {Math.round(selectedObject.audioParams.delay * 100)}%
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Forma de Onda */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Forma de Onda
            </label>
            <select
              value={selectedObject.audioParams.waveform}
              onChange={(e) => handleParamChange('waveform', e.target.value as OscillatorType)}
              className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
            >
              <option value="sine">Seno</option>
              <option value="square">Cuadrada</option>
              <option value="sawtooth">Sierra</option>
              <option value="triangle">Triangular</option>
            </select>
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-400 text-center">
            Los cambios se aplican en tiempo real
          </p>
        </div>
      </div>
    </div>
  );
}
