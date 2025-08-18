'use client';

import { useWorldStore } from '../../state/useWorldStore';
import { useMemo } from 'react';
import { type AudioParams } from '../../lib/AudioManager';

export function ParameterEditor() {
  const { objects, selectedObjectId, updateObject, removeObject } = useWorldStore();

  // Encontrar el objeto seleccionado
  const selectedObject = useMemo(() => {
    return objects.find(obj => obj.id === selectedObjectId);
  }, [objects, selectedObjectId]);

  // Función para actualizar un parámetro específico
  const handleParamChange = (param: keyof AudioParams, value: number | string) => {
    if (!selectedObject) return;

    console.log(`🎛️ UI: Cambiando parámetro ${param} a: ${value}`);
    console.log(`🎛️ UI: Objeto seleccionado:`, selectedObject);

    const newAudioParams = {
      ...selectedObject.audioParams,
      [param]: value,
    };

    console.log(`🎛️ UI: Nuevos parámetros de audio:`, newAudioParams);

    updateObject(selectedObject.id, {
      audioParams: newAudioParams,
    });

    console.log(`🎵 Parámetro ${param} actualizado a: ${value}`);
  };

  // Si no hay objeto seleccionado, mostrar mensaje
  if (!selectedObject) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg border border-gray-700 shadow-2xl p-6 max-w-sm max-h-[90vh] overflow-y-auto">
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
      <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg border border-gray-700 shadow-2xl p-6 max-w-sm max-h-[90vh] overflow-y-auto">
        {/* Header con información del objeto */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded ${
                selectedObject.type === 'cube' ? 'bg-blue-500' : 
                selectedObject.type === 'sphere' ? 'bg-purple-500' : 
                selectedObject.type === 'cylinder' ? 'bg-green-500' :
                selectedObject.type === 'cone' ? 'bg-orange-500' :
                selectedObject.type === 'pyramid' ? 'bg-red-500' :
                selectedObject.type === 'icosahedron' ? 'bg-indigo-500' : 'bg-gray-500'
              }`} />
              <h3 className="text-lg font-semibold text-white">
                Editor de Parámetros
              </h3>
            </div>
            <button
              onClick={() => {
                if (confirm('¿Estás seguro de que quieres eliminar este objeto?')) {
                  removeObject(selectedObject.id);
                }
              }}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors duration-200"
              title="Eliminar objeto"
            >
              🗑️
            </button>
          </div>
          <div className="text-sm text-gray-400">
            <p>Objeto: <span className="text-white">{selectedObject.type}</span></p>
            <p>ID: <span className="text-white font-mono text-xs">{selectedObject.id.slice(0, 8)}...</span></p>
          </div>
        </div>

        {/* Control de activación de audio */}
        <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-600">
          <div className="text-center">
            <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${
              selectedObject.type === 'cone' ? 'bg-orange-500' :
              selectedObject.type === 'cube' ? 'bg-blue-500' :
              selectedObject.type === 'sphere' ? 'bg-purple-500' :
              selectedObject.type === 'cylinder' ? 'bg-green-500' :
              selectedObject.type === 'pyramid' ? 'bg-red-500' :
              selectedObject.type === 'icosahedron' ? 'bg-indigo-500' : 'bg-gray-500'
            }`}>
              <span className="text-lg">
                {selectedObject.type === 'cone' ? '🥁' :
                 selectedObject.type === 'cube' ? '🔷' :
                 selectedObject.type === 'sphere' ? '🔮' :
                 selectedObject.type === 'cylinder' ? '🔶' :
                 selectedObject.type === 'pyramid' ? '🔺' :
                 selectedObject.type === 'icosahedron' ? '🔶' : '❓'}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-300">
              {selectedObject.type === 'cone' ? 'MembraneSynth' :
               selectedObject.type === 'cube' ? 'Síntesis AM' :
               selectedObject.type === 'sphere' ? 'Síntesis FM' :
               selectedObject.type === 'cylinder' ? 'DuoSynth' :
               selectedObject.type === 'pyramid' ? 'MonoSynth' :
               selectedObject.type === 'icosahedron' ? 'MetalSynth' : 'Objeto de Sonido'}
            </span>
            
                         {/* Texto informativo específico para cada tipo */}
             {selectedObject.type === 'pyramid' ? (
               <div className="mt-2">
                 <p className="text-xs text-gray-400 mt-1">
                   {selectedObject.audioParams.duration === Infinity 
                     ? 'Haz clic para activar/desactivar el sonido continuo'
                     : 'Mantén presionado el clic sobre el objeto para tocar (gate)'
                   }
                 </p>
               </div>
             ) : selectedObject.type === 'icosahedron' ? (
               <div className="mt-2">
                 <p className="text-xs text-gray-400 mt-1">
                   Haz clic en el objeto para tocar
                 </p>
                 <p className="text-xs text-gray-400 mt-1">
                   Sonido percusivo metálico
                 </p>
               </div>
             ) : (
              <div className="mt-2">
                <p className="text-xs text-gray-400 mt-1">
                  Haz clic en el objeto para tocar
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Duración configurable: {(selectedObject.audioParams.duration || 1.0).toFixed(1)}s
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Controles de parámetros */}
        <div className="space-y-4">
          {/* Frecuencia */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {selectedObject.type === 'cone' ? 'Frecuencia (Tono)' : 'Frecuencia (Hz)'}
            </label>
            <div className="flex items-center gap-3">
                          <input
              type="range"
              min={selectedObject.type === 'cone' ? '20' : selectedObject.type === 'icosahedron' ? '50' : '20'}
              max={selectedObject.type === 'cone' ? '200' : selectedObject.type === 'icosahedron' ? '1200' : '2000'}
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
            <span>{selectedObject.type === 'cone' ? '20 Hz' : selectedObject.type === 'icosahedron' ? '50 Hz' : '20 Hz'}</span>
            <span>{selectedObject.type === 'cone' ? '200 Hz' : selectedObject.type === 'icosahedron' ? '1200 Hz' : '2000 Hz'}</span>
          </div>
          </div>

          {/* Forma de Onda (Portadora) */}
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

                                                      {/* Duración */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duración (segundos)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0.1"
                  max="60"
                  step="0.1"
                  value={selectedObject.audioParams.duration === Infinity ? '' : (selectedObject.audioParams.duration || 1.0)}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      handleParamChange('duration', Infinity);
                    } else {
                      handleParamChange('duration', Number(value));
                    }
                  }}
                  placeholder="∞"
                  className="flex-1 p-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors font-mono"
                />
                <button
                  onClick={() => {
                    const currentDuration = selectedObject.audioParams.duration;
                    if (currentDuration === Infinity) {
                      handleParamChange('duration', 2.0);
                    } else {
                      handleParamChange('duration', Infinity);
                    }
                  }}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                  title={selectedObject.audioParams.duration === Infinity ? "Cambiar a duración finita" : "Cambiar a duración infinita"}
                >
                  {selectedObject.audioParams.duration === Infinity ? '⏱️' : '∞'}
                </button>
                <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                  {selectedObject.audioParams.duration === Infinity ? '∞' : `${(selectedObject.audioParams.duration || 1.0).toFixed(1)}s`}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0.1s</span>
                <span>∞ (continuo)</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {selectedObject.audioParams.duration === Infinity 
                  ? (selectedObject.type === 'pyramid' 
                      ? 'Sonido continuo - haz clic en el objeto para activar/desactivar'
                      : 'Sonido continuo - haz clic en el objeto para detener'
                    )
                  : (selectedObject.type === 'pyramid'
                      ? 'Sonido de gate - mantén presionado el clic para tocar'
                      : 'Sonido con duración finita - se detiene automáticamente'
                    )
                }
              </p>
            </div>

          {/* Controles específicos para MembraneSynth (cono) */}
          {selectedObject.type === 'cone' && (
            <>
              {/* Pitch Decay */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Pitch Decay (Caída de Tono)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0.01"
                    max="0.5"
                    step="0.01"
                    value={selectedObject.audioParams.pitchDecay || 0.05}
                    onChange={(e) => handleParamChange('pitchDecay', Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                    {(selectedObject.audioParams.pitchDecay || 0.05).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0.01</span>
                  <span>0.5</span>
                </div>
              </div>

              {/* Octaves */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Octaves (Impacto)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0.5"
                    max="20"
                    step="0.1"
                    value={selectedObject.audioParams.octaves || 10}
                    onChange={(e) => handleParamChange('octaves', Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                    {(selectedObject.audioParams.octaves || 10).toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0.5</span>
                  <span>20</span>
                </div>
              </div>
            </>
          )}

          {/* Controles específicos para AMSynth (cubo) */}
          {selectedObject.type === 'cube' && (
            <>
              {/* Harmonicity */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Harmonicity
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0.1"
                    max="10"
                    step="0.1"
                    value={selectedObject.audioParams.harmonicity || 1.5}
                    onChange={(e) => handleParamChange('harmonicity', Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                    {selectedObject.audioParams.harmonicity || 1.5}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0.1</span>
                  <span>10</span>
                </div>
              </div>

              {/* Forma de Onda (Moduladora) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Forma de Onda (Moduladora)
                </label>
                <select
                  value={selectedObject.audioParams.modulationWaveform || 'square'}
                  onChange={(e) => handleParamChange('modulationWaveform', e.target.value as OscillatorType)}
                  className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                >
                  <option value="sine">Seno</option>
                  <option value="square">Cuadrada</option>
                  <option value="sawtooth">Sierra</option>
                  <option value="triangle">Triangular</option>
                </select>
              </div>
            </>
          )}

          {/* Controles específicos para FMSynth (esfera) */}
          {selectedObject.type === 'sphere' && (
            <>
              {/* Harmonicity */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Harmonicity
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0.5"
                    max="8"
                    step="0.01"
                    value={selectedObject.audioParams.harmonicity || 2}
                    onChange={(e) => handleParamChange('harmonicity', Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                    {selectedObject.audioParams.harmonicity || 2}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0.5</span>
                  <span>8</span>
                </div>
              </div>

              {/* Modulation Index (Timbre) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Modulation Index (Timbre)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="40"
                    step="0.1"
                    value={selectedObject.audioParams.modulationIndex || 10}
                    onChange={(e) => handleParamChange('modulationIndex', Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                    {selectedObject.audioParams.modulationIndex || 10}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span>40</span>
                </div>
              </div>

              {/* Forma de Onda (Moduladora) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Forma de Onda (Moduladora)
                </label>
                <select
                  value={selectedObject.audioParams.modulationWaveform || 'sine'}
                  onChange={(e) => handleParamChange('modulationWaveform', e.target.value as OscillatorType)}
                  className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                >
                  <option value="sine">Seno</option>
                  <option value="square">Cuadrada</option>
                  <option value="sawtooth">Sierra</option>
                  <option value="triangle">Triangular</option>
                </select>
              </div>
            </>
          )}

          {/* Controles específicos para DuoSynth (cilindro) */}
          {selectedObject.type === 'cylinder' && (
            <>
              {/* Harmonicity (Desafinación) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Harmonicity (Desafinación)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0.5"
                    max="4"
                    step="0.01"
                    value={selectedObject.audioParams.harmonicity || 1.5}
                    onChange={(e) => handleParamChange('harmonicity', Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                    {selectedObject.audioParams.harmonicity || 1.5}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0.5</span>
                  <span>4</span>
                </div>
              </div>

              {/* Velocidad de Vibrato */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Velocidad de Vibrato
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="0.1"
                    value={selectedObject.audioParams.vibratoRate || 5}
                    onChange={(e) => handleParamChange('vibratoRate', Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                    {selectedObject.audioParams.vibratoRate || 5}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1 Hz</span>
                  <span>20 Hz</span>
                </div>
              </div>

              {/* Cantidad de Vibrato */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cantidad de Vibrato
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={selectedObject.audioParams.vibratoAmount || 0.2}
                    onChange={(e) => handleParamChange('vibratoAmount', Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                    {Math.round((selectedObject.audioParams.vibratoAmount || 0.2) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Forma de Onda (Voz 1) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Forma de Onda (Voz 1)
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

              {/* Forma de Onda (Voz 2) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Forma de Onda (Voz 2)
                </label>
                <select
                  value={selectedObject.audioParams.waveform2 || 'sine'}
                  onChange={(e) => handleParamChange('waveform2', e.target.value as OscillatorType)}
                  className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                >
                  <option value="sine">Seno</option>
                  <option value="square">Cuadrada</option>
                  <option value="sawtooth">Sierra</option>
                  <option value="triangle">Triangular</option>
                </select>
              </div>
            </>
          )}

          {/* Controles específicos para MonoSynth (pirámide) */}
          {selectedObject.type === 'pyramid' && (
            <>
              {/* Sección: Envolvente de Amplitud */}
              <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-600">
                <h4 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2">
                  🔺 Envolvente de Amplitud
                </h4>
                
                {/* Amp Attack */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Attack (Ataque)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0.001"
                      max="2"
                      step="0.001"
                      value={selectedObject.audioParams.ampAttack || 0.01}
                      onChange={(e) => handleParamChange('ampAttack', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                      {(selectedObject.audioParams.ampAttack || 0.01).toFixed(3)}s
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.001s</span>
                    <span>2s</span>
                  </div>
                </div>

                {/* Amp Decay */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Decay (Caída)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0.01"
                      max="2"
                      step="0.01"
                      value={selectedObject.audioParams.ampDecay || 0.2}
                      onChange={(e) => handleParamChange('ampDecay', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                      {(selectedObject.audioParams.ampDecay || 0.2).toFixed(2)}s
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.01s</span>
                    <span>2s</span>
                  </div>
                </div>

                {/* Amp Sustain */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sustain (Sostenido)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={selectedObject.audioParams.ampSustain || 0.1}
                      onChange={(e) => handleParamChange('ampSustain', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                      {Math.round((selectedObject.audioParams.ampSustain || 0.1) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Amp Release */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Release (Liberación)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0.01"
                      max="4"
                      step="0.01"
                      value={selectedObject.audioParams.ampRelease || 0.5}
                      onChange={(e) => handleParamChange('ampRelease', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                      {(selectedObject.audioParams.ampRelease || 0.5).toFixed(2)}s
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.01s</span>
                    <span>4s</span>
                  </div>
                </div>
              </div>

              {/* Sección: Envolvente de Filtro */}
              <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-600">
                <h4 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                  🎛️ Envolvente de Filtro
                </h4>
                
                {/* Filter Attack */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Filter Attack
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0.001"
                      max="1"
                      step="0.001"
                      value={selectedObject.audioParams.filterAttack || 0.005}
                      onChange={(e) => handleParamChange('filterAttack', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                      {(selectedObject.audioParams.filterAttack || 0.005).toFixed(3)}s
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.001s</span>
                    <span>1s</span>
                  </div>
                </div>

                {/* Filter Decay */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Filter Decay
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0.01"
                      max="2"
                      step="0.01"
                      value={selectedObject.audioParams.filterDecay || 0.1}
                      onChange={(e) => handleParamChange('filterDecay', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                      {(selectedObject.audioParams.filterDecay || 0.1).toFixed(2)}s
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.01s</span>
                    <span>2s</span>
                  </div>
                </div>

                {/* Filter Sustain */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Filter Sustain
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={selectedObject.audioParams.filterSustain || 0.05}
                      onChange={(e) => handleParamChange('filterSustain', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                      {Math.round((selectedObject.audioParams.filterSustain || 0.05) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Filter Release */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Filter Release
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0.01"
                      max="2"
                      step="0.01"
                      value={selectedObject.audioParams.filterRelease || 0.2}
                      onChange={(e) => handleParamChange('filterRelease', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                      {(selectedObject.audioParams.filterRelease || 0.2).toFixed(2)}s
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.01s</span>
                    <span>2s</span>
                  </div>
                </div>

                {/* Filter Base Frequency */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Frec. Base del Filtro
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="20"
                      max="2000"
                      step="1"
                      value={selectedObject.audioParams.filterBaseFreq || 200}
                      onChange={(e) => handleParamChange('filterBaseFreq', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                      {selectedObject.audioParams.filterBaseFreq || 200}Hz
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>20 Hz</span>
                    <span>2000 Hz</span>
                  </div>
                </div>

                {/* Filter Octaves */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Octavas del Filtro
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0.5"
                      max="8"
                      step="0.1"
                      value={selectedObject.audioParams.filterOctaves || 4}
                      onChange={(e) => handleParamChange('filterOctaves', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                      {(selectedObject.audioParams.filterOctaves || 4).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.5</span>
                    <span>8</span>
                  </div>
                </div>

                {/* Filter Q (Resonancia) */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Resonancia (Q)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0.1"
                      max="10"
                      step="0.1"
                      value={selectedObject.audioParams.filterQ || 2}
                      onChange={(e) => handleParamChange('filterQ', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                      {(selectedObject.audioParams.filterQ || 2).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.1</span>
                    <span>10</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Controles específicos para MetalSynth (icosaedro) */}
          {selectedObject.type === 'icosahedron' && (
            <>
              {/* Sección: Parámetros del MetalSynth */}
              <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-600">
                <h4 className="text-sm font-semibold text-indigo-400 mb-3 flex items-center gap-2">
                  🔶 Parámetros del MetalSynth
                </h4>
                
                {/* Harmonicity */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Harmonicity
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0.1"
                      max="10"
                      step="0.1"
                      value={selectedObject.audioParams.harmonicity || 5.1}
                      onChange={(e) => handleParamChange('harmonicity', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                      {(selectedObject.audioParams.harmonicity || 5.1).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.1</span>
                    <span>10</span>
                  </div>
                </div>

                {/* Modulation Index */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Modulation Index
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max="100"
                      step="1"
                      value={selectedObject.audioParams.modulationIndex || 32}
                      onChange={(e) => handleParamChange('modulationIndex', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                      {selectedObject.audioParams.modulationIndex || 32}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1</span>
                    <span>100</span>
                  </div>
                </div>

                {/* Resonance */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Resonance (Frec. Filtro)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="100"
                      max="7000"
                      step="100"
                      value={selectedObject.audioParams.resonance || 4000}
                      onChange={(e) => handleParamChange('resonance', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                      {selectedObject.audioParams.resonance || 4000}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>100 Hz</span>
                    <span>7000 Hz</span>
                  </div>
                </div>

                {/* Octaves */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Octaves (Barrido de Filtro)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="8"
                      step="0.1"
                      value={selectedObject.audioParams.octaves || 1.5}
                      onChange={(e) => handleParamChange('octaves', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                      {(selectedObject.audioParams.octaves || 1.5).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0</span>
                    <span>8</span>
                  </div>
                </div>
              </div>
            </>
          )}

                     {/* Volumen - Movido al final */}
           <div>
             <label className="block text-sm font-medium text-gray-300 mb-2">
               Volumen
             </label>
             <div className="flex items-center gap-3">
               <input
                 type="range"
                 min="0"
                 max="100"
                 step="1"
                 value={Math.round(selectedObject.audioParams.volume * 100)}
                 onChange={(e) => {
                   const percentage = Number(e.target.value);
                   const actualValue = percentage / 100; // Convertir de 0-100 a 0-1
                   handleParamChange('volume', actualValue);
                 }}
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
