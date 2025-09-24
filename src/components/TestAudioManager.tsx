'use client';

import React, { useState } from 'react';
import { AudioManagerNew } from '../lib/audio/AudioManagerNew';

export function TestAudioManager() {
  const [audioManager] = useState(() => AudioManagerNew.getInstance());
  const [commandHistory, setCommandHistory] = useState<any[]>([]);
  const [systemStats, setSystemStats] = useState<any>(null);
  const [testId, setTestId] = useState('test-sound-1');

  const handleCreateSoundSource = () => {
    const id = `test-sound-${Date.now()}`;
    setTestId(id);
    
    audioManager.createSoundSource(
      id,
      'cube',
      {
        frequency: 440,
        volume: 0.5,
        waveform: 'sine',
        harmonicity: 1.5,
        modulationIndex: 2,
        duration: 2.0,
      },
      [0, 0, 0]
    );
    
    // Actualizar historial y estadísticas
    setTimeout(() => {
      setCommandHistory(audioManager.getCommandHistory());
      setSystemStats(audioManager.getSystemStats());
    }, 100);
  };

  const handleRemoveSoundSource = () => {
    audioManager.removeSoundSource(testId);
    
    // Actualizar historial y estadísticas
    setTimeout(() => {
      setCommandHistory(audioManager.getCommandHistory());
      setSystemStats(audioManager.getSystemStats());
    }, 100);
  };

  const handleCreateEffect = () => {
    const effectId = `test-effect-${Date.now()}`;
    
    audioManager.createGlobalEffect(
      effectId,
      'reverb',
      [2, 0, 0]
    );
    
    // Actualizar historial y estadísticas
    setTimeout(() => {
      setCommandHistory(audioManager.getCommandHistory());
      setSystemStats(audioManager.getSystemStats());
    }, 100);
  };

  const handleUndoLastCommand = async () => {
    const success = await audioManager.undoLastCommand();
    if (success) {
    } else {
    }
    
    // Actualizar historial y estadísticas
    setTimeout(() => {
      setCommandHistory(audioManager.getCommandHistory());
      setSystemStats(audioManager.getSystemStats());
    }, 100);
  };

  const handleClearHistory = () => {
    audioManager.clearCommandHistory();
    setCommandHistory([]);
  };

  const handleStartContext = async () => {
    const success = await audioManager.startContext();
    if (success) {
    } else {
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-4 max-w-sm">
      <h2 className="text-white text-lg font-bold mb-4">🎵 Test Audio Manager</h2>
      
      {/* Botones de prueba */}
      <div className="space-y-2 mb-4">
        <button
          onClick={handleStartContext}
          className="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Start Audio Context
        </button>
        
        <button
          onClick={handleCreateSoundSource}
          className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create Sound Source
        </button>
        
        <button
          onClick={handleRemoveSoundSource}
          className="w-full px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Remove Sound Source
        </button>
        
        <button
          onClick={handleCreateEffect}
          className="w-full px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Create Global Effect
        </button>
        
        <button
          onClick={handleUndoLastCommand}
          className="w-full px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
        >
          Undo Last Command
        </button>
        
        <button
          onClick={handleClearHistory}
          className="w-full px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Clear History
        </button>
      </div>

      {/* Historial de comandos */}
      <div className="mt-4">
        <h3 className="text-white text-sm font-semibold mb-2">Command History:</h3>
        <div className="max-h-32 overflow-y-auto">
          {commandHistory.length === 0 ? (
            <div className="text-xs text-gray-400">No commands yet</div>
          ) : (
            commandHistory.map((cmd, index) => (
              <div key={index} className="text-xs text-gray-300 mb-1 p-1 bg-gray-800 rounded">
                <div>ID: {cmd.id}</div>
                <div>Type: {cmd.type}</div>
              </div>
            ))
          )}
        </div>
        <div className="text-xs text-gray-400 mt-2">
          Total: {commandHistory.length} commands
        </div>
      </div>

      {/* Estado actual */}
      <div className="mt-4 p-3 bg-gray-800 rounded">
        <h3 className="text-white text-sm font-semibold mb-2">Current State:</h3>
        <div className="text-xs text-gray-300">
          <div>Test ID: {testId}</div>
          <div>Commands: {commandHistory.length}</div>
          <div>Manager: AudioManagerNew</div>
        </div>
      </div>

      {/* Estadísticas del sistema */}
      {systemStats && (
        <div className="mt-4 p-3 bg-blue-900/30 rounded">
          <h3 className="text-white text-sm font-semibold mb-2">System Stats:</h3>
          <div className="text-xs text-gray-300 space-y-1">
            <div>Sound Sources: {systemStats.soundSourcesCount}</div>
            <div>Global Effects: {systemStats.globalEffectsCount}</div>
            <div>Context State: {systemStats.contextState}</div>
            <div>Initialized: {systemStats.isInitialized ? 'Yes' : 'No'}</div>
            <div>History Size: {systemStats.historySize}</div>
            <div>Subscribers: {systemStats.subscribersCount}</div>
          </div>
        </div>
      )}
    </div>
  );
}
