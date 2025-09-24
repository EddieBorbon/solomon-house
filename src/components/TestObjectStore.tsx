'use client';

import { useObjectStore } from '../stores/useObjectStore';
import { useWorldStore } from '../state/useWorldStore';

/**
 * Componente de prueba para verificar el funcionamiento del useObjectStore refactorizado
 */
export function TestObjectStore() {
  const objectStore = useObjectStore();
  const worldStore = useWorldStore();

  const handleCreateObject = () => {
    const position: [number, number, number] = [0, 0, 0];
    const activeGridId = worldStore.activeGridId;
    
    if (!activeGridId) {
      return;
    }
    
    worldStore.addObject('cube', position);
  };

  const handleToggleAudio = () => {
    const objects = objectStore.getAllObjects();
    if (objects.length > 0) {
      const firstObject = objects[0];
      worldStore.toggleObjectAudio(firstObject.id);
    }
  };

  const handleTriggerNote = () => {
    const objects = objectStore.getAllObjects();
    if (objects.length > 0) {
      const firstObject = objects[0];
      worldStore.triggerObjectNote(firstObject.id);
    }
  };

  const handleClearObjects = () => {
    worldStore.clearAllObjects();
  };

  return (
    <div className="fixed top-4 left-4 bg-black bg-opacity-80 text-white p-4 rounded-lg border border-white">
      <h3 className="text-lg font-bold mb-4">🎵 Test Object Store</h3>
      
      <div className="space-y-2 mb-4">
        <div>
          <strong>Objects Count:</strong> {objectStore.objects.length}
        </div>
        <div>
          <strong>Active Grid:</strong> {worldStore.activeGridId || 'null'}
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={handleCreateObject}
          className="w-full bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm"
        >
          Create Cube Object
        </button>
        
        <button
          onClick={handleToggleAudio}
          className="w-full bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-sm"
        >
          Toggle Audio (First Object)
        </button>
        
        <button
          onClick={handleTriggerNote}
          className="w-full bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded text-sm"
        >
          Trigger Note (First Object)
        </button>
        
        <button
          onClick={handleClearObjects}
          className="w-full bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-sm"
        >
          Clear All Objects
        </button>
      </div>

      <div className="mt-4">
        <h4 className="font-semibold mb-2">Objects List:</h4>
        <div className="max-h-32 overflow-y-auto">
          {objectStore.objects.map((obj) => (
            <div key={obj.id} className="text-xs bg-gray-800 p-2 rounded mb-1">
              <div><strong>ID:</strong> {obj.id.substring(0, 8)}...</div>
              <div><strong>Type:</strong> {obj.type}</div>
              <div><strong>Position:</strong> [{obj.position.join(', ')}]</div>
              <div><strong>Audio:</strong> {obj.audioEnabled ? '✅' : '❌'}</div>
              <div><strong>Selected:</strong> {obj.isSelected ? '✅' : '❌'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
