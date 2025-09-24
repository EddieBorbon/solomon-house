'use client';

import React, { useState } from 'react';
import { ParameterManagerNew } from '../lib/parameters/ParameterManagerNew';
import { DEFAULT_PARAMETER_CONFIG } from '../lib/parameters/types';

export function TestParameterManager() {
  const [parameterManager] = useState(() => new ParameterManagerNew());
  const [selectedSynthType, setSelectedSynthType] = useState('PolySynth');
  const [testParams, setTestParams] = useState({
    frequency: 440,
    volume: 0.5,
    harmonicity: 1.5,
    modulationIndex: 2,
    polyphony: 4,
    attack: 0.1,
    release: 0.5
  });
  const [validationResult, setValidationResult] = useState<any>(null);
  const [managerStats, setManagerStats] = useState<any>(null);

  const supportedTypes = parameterManager.getAllSynthTypesInfo();

  const handleValidateParams = () => {
    const result = parameterManager.validateParams(selectedSynthType, testParams);
    setValidationResult(result);
  };

  const handleGetStats = () => {
    const stats = parameterManager.getManagerStats();
    setManagerStats(stats);
  };

  const handleGetSupportedParams = () => {
    const params = parameterManager.getSupportedParams(selectedSynthType);
  };

  const handleGetSynthInfo = () => {
    const info = parameterManager.getSynthTypeInfo(selectedSynthType);
  };

  const handleUpdateConfig = () => {
    const newConfig = {
      ...DEFAULT_PARAMETER_CONFIG,
      rampTime: 0.1,
      frequencyRange: {
        min: 50,
        max: 15000
      }
    };
    parameterManager.updateConfig(newConfig);
  };

  const handleReset = () => {
    parameterManager.reset();
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-4 max-w-sm">
      <h2 className="text-white text-lg font-bold mb-4">🎛️ Test Parameter Manager</h2>
      
      {/* Estadísticas del manager */}
      {managerStats && (
        <div className="mb-4 p-3 bg-gray-800 rounded">
          <h3 className="text-white text-sm font-semibold mb-2">Manager Stats:</h3>
          <div className="text-xs text-gray-300">
            <div>Supported Types: {managerStats.supportedSynthTypes}</div>
            <div>Ramp Time: {managerStats.config.rampTime}s</div>
            <div>Freq Range: {managerStats.config.frequencyRange.min}-{managerStats.config.frequencyRange.max}Hz</div>
          </div>
        </div>
      )}

      {/* Selector de tipo de sintetizador */}
      <div className="mb-4">
        <label className="block text-white text-sm font-semibold mb-2">Synth Type:</label>
        <select
          value={selectedSynthType}
          onChange={(e) => setSelectedSynthType(e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-600"
        >
          {supportedTypes.map(type => (
            <option key={type.type} value={type.type}>
              {type.type} ({type.supported ? '✓' : '✗'})
            </option>
          ))}
        </select>
      </div>

      {/* Parámetros de prueba */}
      <div className="mb-4 space-y-2">
        <h3 className="text-white text-sm font-semibold">Test Parameters:</h3>
        
        <div>
          <label className="block text-white text-xs mb-1">Frequency:</label>
          <input
            type="number"
            value={testParams.frequency}
            onChange={(e) => setTestParams({...testParams, frequency: parseFloat(e.target.value)})}
            className="w-full px-2 py-1 bg-gray-800 text-white rounded text-sm"
          />
        </div>

        <div>
          <label className="block text-white text-xs mb-1">Volume:</label>
          <input
            type="number"
            value={testParams.volume}
            onChange={(e) => setTestParams({...testParams, volume: parseFloat(e.target.value)})}
            min="0"
            max="1"
            step="0.1"
            className="w-full px-2 py-1 bg-gray-800 text-white rounded text-sm"
          />
        </div>

        <div>
          <label className="block text-white text-xs mb-1">Harmonicity:</label>
          <input
            type="number"
            value={testParams.harmonicity}
            onChange={(e) => setTestParams({...testParams, harmonicity: parseFloat(e.target.value)})}
            min="0"
            max="10"
            step="0.1"
            className="w-full px-2 py-1 bg-gray-800 text-white rounded text-sm"
          />
        </div>

        <div>
          <label className="block text-white text-xs mb-1">Modulation Index:</label>
          <input
            type="number"
            value={testParams.modulationIndex}
            onChange={(e) => setTestParams({...testParams, modulationIndex: parseFloat(e.target.value)})}
            min="0"
            max="50"
            step="0.1"
            className="w-full px-2 py-1 bg-gray-800 text-white rounded text-sm"
          />
        </div>

        {selectedSynthType === 'PolySynth' && (
          <div>
            <label className="block text-white text-xs mb-1">Polyphony:</label>
            <input
              type="number"
              value={testParams.polyphony}
              onChange={(e) => setTestParams({...testParams, polyphony: parseInt(e.target.value)})}
              min="1"
              max="32"
              className="w-full px-2 py-1 bg-gray-800 text-white rounded text-sm"
            />
          </div>
        )}
      </div>

      {/* Resultado de validación */}
      {validationResult && (
        <div className="mb-4 p-3 bg-gray-800 rounded">
          <h3 className="text-white text-sm font-semibold mb-2">Validation Result:</h3>
          <div className="text-xs text-gray-300">
            <div className={`mb-1 ${validationResult.isValid ? 'text-green-400' : 'text-red-400'}`}>
              Valid: {validationResult.isValid ? '✓' : '✗'}
            </div>
            {validationResult.errors.length > 0 && (
              <div className="text-red-400 mb-1">
                Errors: {validationResult.errors.join(', ')}
              </div>
            )}
            {validationResult.warnings.length > 0 && (
              <div className="text-yellow-400 mb-1">
                Warnings: {validationResult.warnings.join(', ')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Botones de control */}
      <div className="space-y-2">
        <button
          onClick={handleValidateParams}
          className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Validate Params
        </button>
        
        <button
          onClick={handleGetStats}
          className="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Get Manager Stats
        </button>
        
        <button
          onClick={handleGetSupportedParams}
          className="w-full px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Get Supported Params
        </button>
        
        <button
          onClick={handleGetSynthInfo}
          className="w-full px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
        >
          Get Synth Info
        </button>
        
        <button
          onClick={handleUpdateConfig}
          className="w-full px-3 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
        >
          Update Config
        </button>
        
        <button
          onClick={handleReset}
          className="w-full px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reset Manager
        </button>
      </div>

      {/* Información del tipo seleccionado */}
      <div className="mt-4 p-3 bg-gray-800 rounded">
        <h3 className="text-white text-sm font-semibold mb-2">Current Synth:</h3>
        <div className="text-xs text-gray-300">
          <div>Type: {selectedSynthType}</div>
          <div>Supported: {parameterManager.isSynthTypeSupported(selectedSynthType) ? '✓' : '✗'}</div>
          <div>Params: {parameterManager.getSupportedParams(selectedSynthType).length}</div>
        </div>
      </div>
    </div>
  );
}
