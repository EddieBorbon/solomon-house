'use client';

import React from 'react';
import { useWorldStore } from '../stores/useWorldStoreNew';

export function TestNewStore() {
  const {
    // Estado
    grids,
    objects,
    mobileObjects,
    effectZones,
    selectedEntityId,
    transformMode,
    isEditingEffectZone,
    currentProjectId,
    
    // Acciones de objetos
    addObject,
    removeObject,
    updateObject,
    toggleObjectAudio,
    
    // Acciones de móviles
    addMobileObject,
    removeMobileObject,
    
    // Acciones de efectos
    addEffectZone,
    removeEffectZone,
    
    // Acciones de selección
    selectEntity,
    setTransformMode,
    
    // Acciones de proyecto
    setCurrentProjectId,
  } = useWorldStore();

  const handleAddCube = () => {
    addObject('cube', [0, 0, 0]);
  };

  const handleAddSphere = () => {
    addObject('sphere', [2, 0, 0]);
  };

  const handleAddMobile = () => {
    addMobileObject([-2, 0, 0]);
  };

  const handleAddReverb = () => {
    addEffectZone('reverb', [0, 2, 0]);
  };

  const handleSelectObject = (id: string) => {
    selectEntity(id);
  };

  const handleRemoveObject = (id: string) => {
    removeObject(id);
  };

  const handleRemoveMobile = (id: string) => {
    removeMobileObject(id);
  };

  const handleRemoveEffect = (id: string) => {
    removeEffectZone(id);
  };

  const handleToggleAudio = (id: string) => {
    toggleObjectAudio(id);
  };

  const handleSetProject = () => {
    setCurrentProjectId('test-project-' + Date.now());
  };

  return (
    <div className="fixed top-4 left-4 z-50 bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-4 max-w-sm">
      <h2 className="text-white text-lg font-bold mb-4">🧪 Test New Store</h2>
      
      {/* Estado actual */}
      <div className="mb-4 text-sm text-gray-300">
        <div>📐 Grids: {grids.size}</div>
        <div>🎵 Objects: {objects.length}</div>
        <div>🚀 Mobile: {mobileObjects.length}</div>
        <div>🎛️ Effects: {effectZones.length}</div>
        <div>🎯 Selected: {selectedEntityId || 'none'}</div>
        <div>🔄 Transform: {transformMode}</div>
        <div>📡 Project: {currentProjectId || 'none'}</div>
      </div>

      {/* Botones de prueba */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <button
            onClick={handleAddCube}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Add Cube
          </button>
          <button
            onClick={handleAddSphere}
            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
          >
            Add Sphere
          </button>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleAddMobile}
            className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
          >
            Add Mobile
          </button>
          <button
            onClick={handleAddReverb}
            className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
          >
            Add Reverb
          </button>
        </div>

        <button
          onClick={handleSetProject}
          className="w-full px-3 py-1 bg-cyan-600 text-white rounded text-sm hover:bg-cyan-700"
        >
          Set Test Project
        </button>
      </div>

      {/* Lista de objetos */}
      {objects.length > 0 && (
        <div className="mt-4">
          <h3 className="text-white text-sm font-semibold mb-2">🎵 Objects:</h3>
          <div className="space-y-1">
            {objects.map(obj => (
              <div key={obj.id} className="flex items-center justify-between bg-gray-800 rounded p-2">
                <span className="text-xs text-gray-300">
                  {obj.type} {obj.audioEnabled ? '🔊' : '🔇'}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleSelectObject(obj.id)}
                    className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                  >
                    Select
                  </button>
                  <button
                    onClick={() => handleToggleAudio(obj.id)}
                    className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                  >
                    Toggle
                  </button>
                  <button
                    onClick={() => handleRemoveObject(obj.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de objetos móviles */}
      {mobileObjects.length > 0 && (
        <div className="mt-4">
          <h3 className="text-white text-sm font-semibold mb-2">🚀 Mobile Objects:</h3>
          <div className="space-y-1">
            {mobileObjects.map(obj => (
              <div key={obj.id} className="flex items-center justify-between bg-gray-800 rounded p-2">
                <span className="text-xs text-gray-300">
                  Mobile {obj.mobileParams.movementType}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleSelectObject(obj.id)}
                    className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                  >
                    Select
                  </button>
                  <button
                    onClick={() => handleRemoveMobile(obj.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de efectos */}
      {effectZones.length > 0 && (
        <div className="mt-4">
          <h3 className="text-white text-sm font-semibold mb-2">🎛️ Effects:</h3>
          <div className="space-y-1">
            {effectZones.map(zone => (
              <div key={zone.id} className="flex items-center justify-between bg-gray-800 rounded p-2">
                <span className="text-xs text-gray-300">
                  {zone.type} {zone.isLocked ? '🔒' : '🔓'}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleSelectObject(zone.id)}
                    className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                  >
                    Select
                  </button>
                  <button
                    onClick={() => handleRemoveEffect(zone.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
