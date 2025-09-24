'use client';

import React, { useState } from 'react';
import { ParameterComponentFactory } from '../lib/parameters/ParameterComponentFactory';
import { ParameterManager } from '../lib/parameters/ParameterManager';

export function TestParameterSystem() {
  const [parameterFactory] = useState(() => ParameterComponentFactory.getInstance());
  const [parameterManager] = useState(() => ParameterManager.getInstance());
  const [factoryStats, setFactoryStats] = useState<any>(null);
  const [managerStats, setManagerStats] = useState<any>(null);
  const [validationResult, setValidationResult] = useState<any>(null);

  const handleGetFactoryStats = () => {
    const stats = parameterFactory.getFactoryStats();
    setFactoryStats(stats);
  };

  const handleGetManagerStats = () => {
    const stats = parameterManager.getStats();
    setManagerStats(stats);
  };

  const handleGetSupportedEffectTypes = () => {
    const types = parameterFactory.getSupportedEffectTypes();
  };

  const handleGetSupportedSoundObjectTypes = () => {
    const types = parameterFactory.getSupportedSoundObjectTypes();
  };

  const handleGetEffectTypeInfo = () => {
    const reverbInfo = parameterFactory.getEffectTypeInfo('reverb');
    const chorusInfo = parameterFactory.getEffectTypeInfo('chorus');
  };

  const handleGetSoundObjectTypeInfo = () => {
    const cubeInfo = parameterFactory.getSoundObjectTypeInfo('cube');
    const sphereInfo = parameterFactory.getSoundObjectTypeInfo('sphere');
  };

  const handleTestValidation = () => {
    // Probar validación de parámetros de efecto
    const reverbValidation = parameterManager.validateEffectParameter('reverb', 'roomSize', 0.8);
    const invalidValidation = parameterManager.validateEffectParameter('reverb', 'roomSize', -1);
    
    // Probar validación de parámetros de objeto de sonido
    const cubeValidation = parameterManager.validateSoundObjectParameter('cube', 'frequency', 440);
    const invalidCubeValidation = parameterManager.validateSoundObjectParameter('cube', 'frequency', -100);
    
    setValidationResult({
      reverb: reverbValidation,
      invalidReverb: invalidValidation,
      cube: cubeValidation,
      invalidCube: invalidCubeValidation
    });
    
  };

  const handleTestParameterUpdate = () => {
    // Simular actualización de parámetros
    parameterManager.updateParameter('test-entity-1', 'frequency', 440);
    parameterManager.updateParameter('test-entity-2', 'roomSize', 0.7);
    parameterManager.updateParameter('test-entity-3', 'volume', 0.8);
    
  };

  const handleTestEntityState = () => {
    // Simular estado de entidad
    parameterManager.updateEntityState('test-entity-1', {
      isUpdating: true,
      lastUpdatedParam: 'frequency',
      isRefreshing: false,
      isExpanded: true
    });
    
    setTimeout(() => {
      parameterManager.updateEntityState('test-entity-1', {
        isUpdating: false,
        lastUpdatedParam: null,
        isRefreshing: false,
        isExpanded: true
      });
    }, 2000);
    
  };

  const handleGetParameterInfo = () => {
    const reverbRoomSize = parameterManager.getParameterInfo('effect', 'roomSize');
    const cubeFrequency = parameterManager.getParameterInfo('soundObject', 'frequency');
    const mobileSpeed = parameterManager.getParameterInfo('mobileObject', 'speed');
    
  };

  const handleGetDebugInfo = () => {
    const debugInfo = parameterManager.getDebugInfo();
  };

  const handleResetStats = () => {
    parameterManager.resetStats();
  };

  const handleTestComponentCreation = () => {
    // Probar creación de componentes (simulado)
    const testEffectZone = {
      id: 'test-effect',
      type: 'effectZone',
      effectType: 'reverb',
      effectParams: { roomSize: 0.5, damping: 0.5, wet: 0.3 },
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      isSelected: true,
      isLocked: false
    };

    const testSoundObject = {
      id: 'test-sound',
      type: 'soundObject',
      audioParams: { frequency: 440, volume: 0.5, waveform: 'sine' },
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      isSelected: true
    };

    const effectComponent = parameterFactory.createEffectComponent('reverb', testEffectZone as any);
    const soundComponent = parameterFactory.createSoundObjectComponent('cube', testSoundObject as any);
    
  };

  return (
    <div className="fixed top-4 left-4 z-50 bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-4 max-w-sm">
      <h2 className="text-white text-lg font-bold mb-4">🎛️ Test Parameter System</h2>
      
      {/* Botones de prueba */}
      <div className="space-y-2 mb-4">
        <button
          onClick={handleGetFactoryStats}
          className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Get Factory Stats
        </button>
        
        <button
          onClick={handleGetManagerStats}
          className="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Get Manager Stats
        </button>
        
        <button
          onClick={handleGetSupportedEffectTypes}
          className="w-full px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Get Effect Types
        </button>
        
        <button
          onClick={handleGetSupportedSoundObjectTypes}
          className="w-full px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
        >
          Get Sound Object Types
        </button>
        
        <button
          onClick={handleGetEffectTypeInfo}
          className="w-full px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Get Effect Type Info
        </button>
        
        <button
          onClick={handleGetSoundObjectTypeInfo}
          className="w-full px-3 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
        >
          Get Sound Object Type Info
        </button>
        
        <button
          onClick={handleTestValidation}
          className="w-full px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Test Validation
        </button>
        
        <button
          onClick={handleTestParameterUpdate}
          className="w-full px-3 py-2 bg-pink-600 text-white rounded hover:bg-pink-700"
        >
          Test Parameter Update
        </button>
        
        <button
          onClick={handleTestEntityState}
          className="w-full px-3 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
        >
          Test Entity State
        </button>
        
        <button
          onClick={handleGetParameterInfo}
          className="w-full px-3 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
        >
          Get Parameter Info
        </button>
        
        <button
          onClick={handleTestComponentCreation}
          className="w-full px-3 py-2 bg-lime-600 text-white rounded hover:bg-lime-700"
        >
          Test Component Creation
        </button>
        
        <button
          onClick={handleGetDebugInfo}
          className="w-full px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Get Debug Info
        </button>
        
        <button
          onClick={handleResetStats}
          className="w-full px-3 py-2 bg-slate-600 text-white rounded hover:bg-slate-700"
        >
          Reset Stats
        </button>
      </div>

      {/* Estadísticas del Factory */}
      {factoryStats && (
        <div className="mt-4 p-3 bg-blue-900/30 rounded">
          <h3 className="text-white text-sm font-semibold mb-2">Factory Stats:</h3>
          <div className="text-xs text-gray-300 space-y-1">
            <div>Supported Effect Types: {factoryStats.supportedEffectTypes}</div>
            <div>Supported Sound Object Types: {factoryStats.supportedSoundObjectTypes}</div>
            <div>Total Components: {factoryStats.totalComponents}</div>
            <div>Error Count: {factoryStats.errorCount}</div>
          </div>
        </div>
      )}

      {/* Estadísticas del Manager */}
      {managerStats && (
        <div className="mt-4 p-3 bg-green-900/30 rounded">
          <h3 className="text-white text-sm font-semibold mb-2">Manager Stats:</h3>
          <div className="text-xs text-gray-300 space-y-1">
            <div>Total Parameters: {managerStats.totalParameters}</div>
            <div>Active Entities: {managerStats.activeEntities}</div>
            <div>Update Count: {managerStats.updateCount}</div>
            <div>Error Count: {managerStats.errorCount}</div>
            <div>Validation Count: {managerStats.validationCount}</div>
          </div>
        </div>
      )}

      {/* Resultado de validación */}
      {validationResult && (
        <div className="mt-4 p-3 bg-indigo-900/30 rounded">
          <h3 className="text-white text-sm font-semibold mb-2">Validation Results:</h3>
          <div className="text-xs text-gray-300 space-y-1">
            <div>Reverb Valid: {validationResult.reverb.isValid ? '✅' : '❌'}</div>
            <div>Invalid Reverb: {validationResult.invalidReverb.isValid ? '✅' : '❌'}</div>
            <div>Cube Valid: {validationResult.cube.isValid ? '✅' : '❌'}</div>
            <div>Invalid Cube: {validationResult.invalidCube.isValid ? '✅' : '❌'}</div>
          </div>
        </div>
      )}

      {/* Estado actual */}
      <div className="mt-4 p-3 bg-gray-800 rounded">
        <h3 className="text-white text-sm font-semibold mb-2">Current State:</h3>
        <div className="text-xs text-gray-300">
          <div>Factory: ParameterComponentFactory</div>
          <div>Manager: ParameterManager</div>
          <div>System: Parameter System Refactored</div>
        </div>
      </div>
    </div>
  );
}
