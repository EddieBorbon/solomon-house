'use client';

import { useSelectionStore } from '../stores/useSelectionStore';
import { useWorldStore } from '../state/useWorldStore';

/**
 * Componente de prueba para verificar el funcionamiento del useSelectionStore refactorizado
 */
export function TestSelectionStore() {
  const selectionStore = useSelectionStore();
  const worldStore = useWorldStore();

  const handleSelectEntity = () => {
    const testId = 'test-entity-123';
    worldStore.selectEntity(testId);
  };

  const handleClearSelection = () => {
    worldStore.selectEntity(null);
  };

  const handleSetTransformMode = (mode: 'translate' | 'rotate' | 'scale') => {
    worldStore.setTransformMode(mode);
  };

  return (
    <div className="fixed bottom-4 left-4 bg-black bg-opacity-80 text-white p-4 rounded-lg border border-white">
      <h3 className="text-lg font-bold mb-4">🎯 Test Selection Store</h3>
      
      <div className="space-y-2 mb-4">
        <div>
          <strong>Selected Entity:</strong> {selectionStore.selectedEntityId || 'null'}
        </div>
        <div>
          <strong>Transform Mode:</strong> {selectionStore.transformMode}
        </div>
        <div>
          <strong>Is Test Entity Selected:</strong> {selectionStore.isEntitySelected('test-entity-123') ? '✅' : '❌'}
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={handleSelectEntity}
          className="w-full bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm"
        >
          Select Test Entity
        </button>
        
        <button
          onClick={handleClearSelection}
          className="w-full bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-sm"
        >
          Clear Selection
        </button>
        
        <div className="grid grid-cols-3 gap-1">
          <button
            onClick={() => handleSetTransformMode('translate')}
            className={`px-2 py-1 rounded text-xs ${
              selectionStore.transformMode === 'translate' 
                ? 'bg-green-600' 
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            Translate
          </button>
          
          <button
            onClick={() => handleSetTransformMode('rotate')}
            className={`px-2 py-1 rounded text-xs ${
              selectionStore.transformMode === 'rotate' 
                ? 'bg-green-600' 
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            Rotate
          </button>
          
          <button
            onClick={() => handleSetTransformMode('scale')}
            className={`px-2 py-1 rounded text-xs ${
              selectionStore.transformMode === 'scale' 
                ? 'bg-green-600' 
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            Scale
          </button>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="font-semibold mb-2">Selection Store State:</h4>
        <div className="text-xs bg-gray-800 p-2 rounded">
          <div><strong>selectedEntityId:</strong> {selectionStore.selectedEntityId || 'null'}</div>
          <div><strong>transformMode:</strong> {selectionStore.transformMode}</div>
        </div>
      </div>
    </div>
  );
}
