'use client';

import { useAudioContext } from '../../hooks/useAudioContext';
import { useObjectAudio } from '../../hooks/useObjectAudio';
import { useState } from 'react';

// Definir el tipo personalizado de OscillatorType
type OscillatorType = 'sine' | 'square' | 'triangle' | 'sawtooth';

export function AudioTestPanel() {
  const { isAudioContextStarted, startAudioContext } = useAudioContext();
  const [testParams, setTestParams] = useState({
    frequency: 440,
    waveform: 'sine' as OscillatorType,
    volume: 0.5,
    reverb: 0.3,
    delay: 0.1,
  });

  const { triggerAttack, triggerRelease, isPlaying, updateParams } = useObjectAudio('cube', testParams);

  const handleStartAudio = async () => {
    if (!isAudioContextStarted) {
      await startAudioContext();
    }
  };

  const handlePlayTest = async () => {
    if (!isAudioContextStarted) {
      await handleStartAudio();
    }
    triggerAttack();
  };

  const handleStopTest = () => {
    triggerRelease();
  };

  const handleParamChange = (param: string, value: number | string) => {
    const newParams = { ...testParams, [param]: value };
    setTestParams(newParams);
    updateParams(newParams);
  };

  return (
    <div className="p-6 bg-gray-900 rounded-lg border border-gray-700">
      <h2 className="text-xl font-bold text-white mb-4">🎵 Panel de Prueba de Audio</h2>
      
      {/* Estado del AudioContext */}
      <div className="mb-4 p-3 bg-gray-800 rounded">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-3 h-3 rounded-full ${
            isAudioContextStarted ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <span className="text-white">
            AudioContext: {isAudioContextStarted ? 'Activo' : 'Inactivo'}
          </span>
        </div>
        
        {!isAudioContextStarted && (
          <button
            onClick={handleStartAudio}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
          >
            Iniciar Audio
          </button>
        )}
      </div>

      {/* Controles de prueba */}
      <div className="mb-4 p-3 bg-gray-800 rounded">
        <h3 className="text-white font-semibold mb-2">Controles de Prueba</h3>
        <div className="flex gap-2 mb-3">
          <button
            onClick={handlePlayTest}
            disabled={!isAudioContextStarted}
            className={`px-4 py-2 rounded text-white font-medium transition-colors ${
              isAudioContextStarted
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-600 cursor-not-allowed'
            }`}
          >
            ▶️ Reproducir
          </button>
          
          <button
            onClick={handleStopTest}
            disabled={!isAudioContextStarted || !isPlaying}
            className={`px-4 py-2 rounded text-white font-medium transition-colors ${
              isAudioContextStarted && isPlaying
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-gray-600 cursor-not-allowed'
            }`}
          >
            ⏹️ Detener
          </button>
        </div>
        
        <div className="text-sm text-gray-300">
          Estado: {isPlaying ? '🔊 Reproduciendo' : '🔇 Silencio'}
        </div>
      </div>

      {/* Controles de parámetros */}
      <div className="p-3 bg-gray-800 rounded">
        <h3 className="text-white font-semibold mb-2">Parámetros de Audio</h3>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Frecuencia */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">Frecuencia (Hz)</label>
            <input
              type="range"
              min="20"
              max="2000"
              step="1"
              value={testParams.frequency}
              onChange={(e) => handleParamChange('frequency', Number(e.target.value))}
              className="w-full"
            />
            <span className="text-xs text-gray-400">{testParams.frequency} Hz</span>
          </div>

          {/* Volumen */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">Volumen</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={testParams.volume}
              onChange={(e) => handleParamChange('volume', Number(e.target.value))}
              className="w-full"
            />
            <span className="text-xs text-gray-400">{Math.round(testParams.volume * 100)}%</span>
          </div>

          {/* Reverb */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">Reverb</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={testParams.reverb}
              onChange={(e) => handleParamChange('reverb', Number(e.target.value))}
              className="w-full"
            />
            <span className="text-xs text-gray-400">{Math.round(testParams.reverb * 100)}%</span>
          </div>

          {/* Delay */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">Delay</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={testParams.delay}
              onChange={(e) => handleParamChange('delay', Number(e.target.value))}
              className="w-full"
            />
            <span className="text-xs text-gray-400">{Math.round(testParams.delay * 100)}%</span>
          </div>
        </div>

        {/* Selector de forma de onda */}
        <div className="mt-4">
          <label className="block text-sm text-gray-300 mb-1">Forma de Onda</label>
          <select
            value={testParams.waveform}
            onChange={(e) => handleParamChange('waveform', e.target.value as OscillatorType)}
            className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
          >
            <option value="sine">Seno</option>
            <option value="square">Cuadrada</option>
            <option value="sawtooth">Sierra</option>
            <option value="triangle">Triangular</option>
          </select>
        </div>
      </div>
    </div>
  );
}
