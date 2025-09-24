'use client';

import { useGridStore } from '../stores/useGridStore';
import { useObjectStore } from '../stores/useObjectStore';
import { useEffectStore } from '../stores/useEffectStore';
import { useSelectionStore } from '../stores/useSelectionStore';
import { useWorldStore } from '../state/useWorldStore';

/**
 * Componente maestro para probar todos los stores refactorizados
 * Verifica que la delegación funcione correctamente
 */
export function TestAllStores() {
  const gridStore = useGridStore();
  const objectStore = useObjectStore();
  const effectStore = useEffectStore();
  const selectionStore = useSelectionStore();
  const worldStore = useWorldStore();

  const handleTestGridOperations = () => {
    
    // Crear una cuadrícula
    worldStore.createGrid([0, 0, 0], 20);
    
    // Seleccionar la cuadrícula
    const grids = Array.from(gridStore.grids.values());
    if (grids.length > 0) {
      worldStore.selectGrid(grids[0].id);
    }
    
  };

  const handleTestObjectOperations = () => {
    
    // Crear un objeto
    worldStore.addObject('cube', [0, 0, 0]);
    
    // Seleccionar el objeto
    const objects = objectStore.getAllObjects();
    if (objects.length > 0) {
      worldStore.selectEntity(objects[0].id);
    }
    
  };

  const handleTestEffectOperations = () => {
    
    // Crear una zona de efecto
    worldStore.addEffectZone('reverb', [0, 0, 0], 'sphere');
    
    // Seleccionar la zona de efecto
    const effects = effectStore.getAllEffectZones();
    if (effects.length > 0) {
      worldStore.selectEntity(effects[0].id);
    }
    
  };

  const handleTestSelectionOperations = () => {
    
    // Cambiar modo de transformación
    worldStore.setTransformMode('rotate');
    
    // Limpiar selección
    worldStore.selectEntity(null);
    
  };

  const handleTestAllOperations = () => {
    
    handleTestGridOperations();
    setTimeout(() => handleTestObjectOperations(), 100);
    setTimeout(() => handleTestEffectOperations(), 200);
    setTimeout(() => handleTestSelectionOperations(), 300);
    
  };

  const handleClearAll = () => {
    
    // Limpiar todos los stores
    objectStore.clearAllObjects();
    effectStore.clearAllEffectZones();
    selectionStore.clearSelection();
    
  };

  return (
    <div className="fixed top-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg border border-white max-w-md">
      <h3 className="text-lg font-bold mb-4">🧪 Test All Refactored Stores</h3>
      
      <div className="space-y-3 mb-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <strong>Grids:</strong> {gridStore.grids.size}
          </div>
          <div>
            <strong>Objects:</strong> {objectStore.objects.length}
          </div>
          <div>
            <strong>Effects:</strong> {effectStore.effectZones.length}
          </div>
          <div>
            <strong>Selected:</strong> {selectionStore.selectedEntityId || 'null'}
          </div>
        </div>
        
        <div className="text-sm">
          <strong>Transform Mode:</strong> {selectionStore.transformMode}
        </div>
        
        <div className="text-sm">
          <strong>Active Grid:</strong> {worldStore.activeGridId || 'null'}
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={handleTestAllOperations}
          className="w-full bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-sm font-semibold"
        >
          Test All Operations
        </button>
        
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleTestGridOperations}
            className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm"
          >
            Test Grids
          </button>
          
          <button
            onClick={handleTestObjectOperations}
            className="bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded text-sm"
          >
            Test Objects
          </button>
          
          <button
            onClick={handleTestEffectOperations}
            className="bg-orange-600 hover:bg-orange-700 px-3 py-2 rounded text-sm"
          >
            Test Effects
          </button>
          
          <button
            onClick={handleTestSelectionOperations}
            className="bg-pink-600 hover:bg-pink-700 px-3 py-2 rounded text-sm"
          >
            Test Selection
          </button>
        </div>
        
        <button
          onClick={handleClearAll}
          className="w-full bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-sm"
        >
          Clear All Stores
        </button>
      </div>

      <div className="mt-4">
        <h4 className="font-semibold mb-2 text-sm">Store Status:</h4>
        <div className="text-xs space-y-1">
          <div className={`px-2 py-1 rounded ${gridStore.grids.size > 0 ? 'bg-green-800' : 'bg-gray-800'}`}>
            Grid Store: {gridStore.grids.size} grids
          </div>
          <div className={`px-2 py-1 rounded ${objectStore.objects.length > 0 ? 'bg-green-800' : 'bg-gray-800'}`}>
            Object Store: {objectStore.objects.length} objects
          </div>
          <div className={`px-2 py-1 rounded ${effectStore.effectZones.length > 0 ? 'bg-green-800' : 'bg-gray-800'}`}>
            Effect Store: {effectStore.effectZones.length} effects
          </div>
          <div className={`px-2 py-1 rounded ${selectionStore.selectedEntityId ? 'bg-green-800' : 'bg-gray-800'}`}>
            Selection Store: {selectionStore.selectedEntityId ? 'Selected' : 'None'}
          </div>
        </div>
      </div>
    </div>
  );
}
