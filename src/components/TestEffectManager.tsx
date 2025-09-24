'use client';

import React, { useState } from 'react';
import { EffectManagerNew } from '../lib/effects/EffectManagerNew';
import { EffectType } from '../lib/effects/types';

export function TestEffectManager() {
  const [effectManager] = useState(() => new EffectManagerNew());
  const [selectedEffectType, setSelectedEffectType] = useState<EffectType>('reverb');
  const [position, setPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [radius, setRadius] = useState(2.0);
  const [effectId, setEffectId] = useState('');

  const supportedTypes = effectManager.getSupportedEffectTypes();

  const handleCreateEffect = () => {
    const id = `test-effect-${Date.now()}`;
    setEffectId(id);
    effectManager.createGlobalEffect(id, selectedEffectType, position);
  };

  const handleUpdatePosition = () => {
    if (effectId) {
      effectManager.updateEffectZonePosition(effectId, position);
    }
  };

  const handleUpdateRadius = () => {
    if (effectId) {
      effectManager.setEffectZoneRadius(effectId, radius);
    }
  };

  const handleUpdateParams = () => {
    if (effectId) {
      const params = {
        wet: 0.5,
        dry: 0.5,
        ...(selectedEffectType === 'reverb' && { decay: 2.0 }),
        ...(selectedEffectType === 'phaser' && { frequency: 1.0 }),
        ...(selectedEffectType === 'chorus' && { depth: 0.8 }),
      };
      effectManager.updateGlobalEffect(effectId, params);
    }
  };

  const handleRemoveEffect = () => {
    if (effectId) {
      effectManager.removeGlobalEffect(effectId);
      setEffectId('');
    }
  };

  const handleRefreshAll = () => {
    effectManager.refreshAllGlobalEffects();
  };

  const handleStopTestOscillators = () => {
    effectManager.stopAllTestOscillators();
  };

  const stats = effectManager.getManagerStats();

  return (
    <div className="fixed top-4 right-4 z-50 bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-4 max-w-sm">
      <h2 className="text-white text-lg font-bold mb-4">🎛️ Test Effect Manager</h2>
      
      {/* Estadísticas */}
      <div className="mb-4 text-sm text-gray-300">
        <div>📊 Total Effects: {stats.totalEffects}</div>
        <div>🎵 Test Oscillators: {stats.testOscillators.total}</div>
        <div>▶️ Playing: {stats.testOscillators.playing}</div>
        <div>⏹️ Stopped: {stats.testOscillators.stopped}</div>
        <div>🔧 Supported Types: {stats.supportedTypes}</div>
      </div>

      {/* Selector de tipo de efecto */}
      <div className="mb-4">
        <label className="block text-white text-sm font-semibold mb-2">Effect Type:</label>
        <select
          value={selectedEffectType}
          onChange={(e) => setSelectedEffectType(e.target.value as EffectType)}
          className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-600"
        >
          {supportedTypes.map(type => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Posición */}
      <div className="mb-4">
        <label className="block text-white text-sm font-semibold mb-2">Position:</label>
        <div className="grid grid-cols-3 gap-2">
          <input
            type="number"
            value={position[0]}
            onChange={(e) => setPosition([parseFloat(e.target.value), position[1], position[2]])}
            placeholder="X"
            className="px-2 py-1 bg-gray-800 text-white rounded text-sm"
          />
          <input
            type="number"
            value={position[1]}
            onChange={(e) => setPosition([position[0], parseFloat(e.target.value), position[2]])}
            placeholder="Y"
            className="px-2 py-1 bg-gray-800 text-white rounded text-sm"
          />
          <input
            type="number"
            value={position[2]}
            onChange={(e) => setPosition([position[0], position[1], parseFloat(e.target.value)])}
            placeholder="Z"
            className="px-2 py-1 bg-gray-800 text-white rounded text-sm"
          />
        </div>
      </div>

      {/* Radio */}
      <div className="mb-4">
        <label className="block text-white text-sm font-semibold mb-2">Radius:</label>
        <input
          type="number"
          value={radius}
          onChange={(e) => setRadius(parseFloat(e.target.value))}
          min="0.1"
          max="10"
          step="0.1"
          className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-600"
        />
      </div>

      {/* Botones de control */}
      <div className="space-y-2">
        <button
          onClick={handleCreateEffect}
          className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create Effect
        </button>
        
        <button
          onClick={handleUpdatePosition}
          disabled={!effectId}
          className="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          Update Position
        </button>
        
        <button
          onClick={handleUpdateRadius}
          disabled={!effectId}
          className="w-full px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
        >
          Update Radius
        </button>
        
        <button
          onClick={handleUpdateParams}
          disabled={!effectId}
          className="w-full px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
        >
          Update Params
        </button>
        
        <button
          onClick={handleRemoveEffect}
          disabled={!effectId}
          className="w-full px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          Remove Effect
        </button>
        
        <button
          onClick={handleRefreshAll}
          className="w-full px-3 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
        >
          Refresh All
        </button>
        
        <button
          onClick={handleStopTestOscillators}
          className="w-full px-3 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
        >
          Stop Test Oscillators
        </button>
      </div>

      {/* Estado del efecto actual */}
      {effectId && (
        <div className="mt-4 p-3 bg-gray-800 rounded">
          <h3 className="text-white text-sm font-semibold mb-2">Current Effect:</h3>
          <div className="text-xs text-gray-300">
            <div>ID: {effectId}</div>
            <div>Type: {selectedEffectType}</div>
            <div>Position: [{position.join(', ')}]</div>
            <div>Radius: {radius}</div>
          </div>
        </div>
      )}
    </div>
  );
}
