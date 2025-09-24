'use client';

import React, { useState } from 'react';
import { SceneObjectFactory } from '../lib/scene/SceneObjectFactory';
import { SceneRenderer } from '../lib/scene/SceneRenderer';

export function TestSceneSystem() {
  const [objectFactory] = useState(() => SceneObjectFactory.getInstance());
  const [sceneRenderer] = useState(() => new SceneRenderer());
  const [factoryStats, setFactoryStats] = useState<any>(null);
  const [rendererStats, setRendererStats] = useState<any>(null);

  const handleGetFactoryStats = () => {
    const stats = objectFactory.getFactoryStats();
    setFactoryStats(stats);
    console.log('📊 Factory Stats:', stats);
  };

  const handleGetRendererStats = () => {
    const stats = sceneRenderer.getRenderStats();
    setRendererStats(stats);
    console.log('📊 Renderer Stats:', stats);
  };

  const handleGetSupportedTypes = () => {
    const types = objectFactory.getSupportedTypes();
    console.log('🎨 Supported Types:', types);
  };

  const handleGetObjectTypeInfo = () => {
    const cubeInfo = objectFactory.getObjectTypeInfo('cube');
    const sphereInfo = objectFactory.getObjectTypeInfo('sphere');
    console.log('📋 Cube Info:', cubeInfo);
    console.log('📋 Sphere Info:', sphereInfo);
  };

  const handleTestRender = () => {
    const testObject = {
      id: 'test-cube',
      type: 'cube' as const,
      position: [0, 0, 0] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      scale: [1, 1, 1] as [number, number, number],
      isSelected: false,
      audioEnabled: true,
      audioParams: {
        frequency: 440,
        volume: 0.5,
        waveform: 'sine'
      }
    };

    const rendered = sceneRenderer.render(testObject);
    console.log('🎨 Rendered Object:', rendered);
  };

  const handleValidateEntity = () => {
    const validObject = {
      id: 'valid-test',
      type: 'sphere' as const,
      position: [0, 0, 0] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      scale: [1, 1, 1] as [number, number, number],
      isSelected: false,
      audioEnabled: true,
      audioParams: {
        frequency: 440,
        volume: 0.5,
        waveform: 'sine'
      }
    };

    const invalidObject = {
      id: '',
      type: 'invalid' as any,
      position: [0, 0] as any,
      rotation: [0, 0] as any,
      scale: [1, 1] as any,
      isSelected: false,
      audioEnabled: true,
      audioParams: {
        frequency: 440,
        volume: 0.5,
        waveform: 'sine'
      }
    };

    const validResult = sceneRenderer.validateEntity(validObject);
    const invalidResult = sceneRenderer.validateEntity(invalidObject);

    console.log('✅ Valid Object Result:', validResult);
    console.log('❌ Invalid Object Result:', invalidResult);
  };

  const handleGetDebugInfo = () => {
    const debugInfo = sceneRenderer.getDebugInfo();
    console.log('🐛 Debug Info:', debugInfo);
  };

  const handleResetStats = () => {
    sceneRenderer.resetStats();
    console.log('🔄 Renderer stats reset');
  };

  return (
    <div className="fixed top-4 left-4 z-50 bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-4 max-w-sm">
      <h2 className="text-white text-lg font-bold mb-4">🎨 Test Scene System</h2>
      
      {/* Botones de prueba */}
      <div className="space-y-2 mb-4">
        <button
          onClick={handleGetFactoryStats}
          className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Get Factory Stats
        </button>
        
        <button
          onClick={handleGetRendererStats}
          className="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Get Renderer Stats
        </button>
        
        <button
          onClick={handleGetSupportedTypes}
          className="w-full px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Get Supported Types
        </button>
        
        <button
          onClick={handleGetObjectTypeInfo}
          className="w-full px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
        >
          Get Object Type Info
        </button>
        
        <button
          onClick={handleTestRender}
          className="w-full px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Test Render
        </button>
        
        <button
          onClick={handleValidateEntity}
          className="w-full px-3 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
        >
          Validate Entity
        </button>
        
        <button
          onClick={handleGetDebugInfo}
          className="w-full px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Get Debug Info
        </button>
        
        <button
          onClick={handleResetStats}
          className="w-full px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Reset Stats
        </button>
      </div>

      {/* Estadísticas del Factory */}
      {factoryStats && (
        <div className="mt-4 p-3 bg-blue-900/30 rounded">
          <h3 className="text-white text-sm font-semibold mb-2">Factory Stats:</h3>
          <div className="text-xs text-gray-300 space-y-1">
            <div>Supported Types: {factoryStats.supportedTypes}</div>
            <div>Total Renders: {factoryStats.totalRenders}</div>
            <div>Error Count: {factoryStats.errorCount}</div>
          </div>
        </div>
      )}

      {/* Estadísticas del Renderer */}
      {rendererStats && (
        <div className="mt-4 p-3 bg-green-900/30 rounded">
          <h3 className="text-white text-sm font-semibold mb-2">Renderer Stats:</h3>
          <div className="text-xs text-gray-300 space-y-1">
            <div>Objects Rendered: {rendererStats.objectsRendered}</div>
            <div>Mobile Objects: {rendererStats.mobileObjectsRendered}</div>
            <div>Effect Zones: {rendererStats.effectZonesRendered}</div>
            <div>Errors: {rendererStats.errors}</div>
          </div>
        </div>
      )}

      {/* Estado actual */}
      <div className="mt-4 p-3 bg-gray-800 rounded">
        <h3 className="text-white text-sm font-semibold mb-2">Current State:</h3>
        <div className="text-xs text-gray-300">
          <div>Factory: SceneObjectFactory</div>
          <div>Renderer: SceneRenderer</div>
          <div>System: Scene System Refactored</div>
        </div>
      </div>
    </div>
  );
}
