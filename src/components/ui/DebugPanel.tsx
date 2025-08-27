'use client';

import { useWorldStore } from '../../state/useWorldStore';

export function DebugPanel() {
  const { objects, selectedEntityId, addObject, selectEntity, clearAllObjects } = useWorldStore();

  const handleAddTestObjects = () => {
    // Añadir algunos objetos de prueba
    addObject('cube', [0, 0.5, 0]);
    addObject('sphere', [2, 0.5, 0]);
    addObject('cube', [-2, 0.5, 0]);
    addObject('sphere', [0, 0.5, 2]);
  };

  const handleClearAll = () => {
    clearAllObjects();
  };

  return (
    <div className="fixed top-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg shadow-lg p-4 z-50 min-w-[300px] text-white">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        🐛 Debug Panel
      </h3>
      
      {/* Estado del store */}
      <div className="space-y-3 mb-4">
        <div className="text-sm">
          <div className="flex justify-between mb-2">
            <span>Total objetos:</span>
            <span className="font-mono">{objects.length}</span>
          </div>
          
          <div className="flex justify-between mb-2">
            <span>ID seleccionado:</span>
            <span className="font-mono text-xs break-all">
              {selectedEntityId || 'null'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Estado:</span>
            <span className={`px-2 py-1 rounded text-xs ${
              objects.length > 0 ? 'bg-green-600' : 'bg-red-600'
            }`}>
              {objects.length > 0 ? 'Activo' : 'Vacío'}
            </span>
          </div>
        </div>
      </div>

      {/* Botones de prueba */}
      <div className="space-y-2 mb-4">
        <button
          onClick={handleAddTestObjects}
          className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
        >
          🧪 Añadir Objetos de Prueba
        </button>
        
        <button
          onClick={handleClearAll}
          className="w-full px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
        >
          🗑️ Limpiar Todo
        </button>
      </div>

      {/* Lista de objetos */}
      <div className="max-h-40 overflow-y-auto">
        <h4 className="text-sm font-medium mb-2">Objetos en el mundo:</h4>
        {objects.length === 0 ? (
          <p className="text-xs text-gray-400 italic">No hay objetos</p>
        ) : (
          <div className="space-y-1">
            {objects.map((obj, index) => (
              <div 
                key={obj.id}
                className={`text-xs p-2 rounded cursor-pointer transition-colors ${
                  obj.isSelected 
                    ? 'bg-yellow-600 text-black' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
                onClick={() => selectEntity(obj.id)}
              >
                <div className="flex justify-between items-center">
                  <span>{index + 1}. {obj.type}</span>
                  <span className="text-xs opacity-75">
                    [{obj.position[0].toFixed(1)}, {obj.position[1].toFixed(1)}, {obj.position[2].toFixed(1)}]
                  </span>
                </div>
                <div className="text-xs opacity-75 mt-1">
                  ID: {obj.id.slice(0, 8)}... | Frec: {obj.audioParams.frequency}Hz
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Información del sistema */}
      <div className="mt-4 p-2 bg-gray-800 rounded text-xs">
        <div className="flex justify-between">
          <span>React:</span>
          <span>18.x</span>
        </div>
        <div className="flex justify-between">
          <span>Three.js:</span>
          <span>R3F</span>
        </div>
        <div className="flex justify-between">
          <span>Zustand:</span>
          <span>✓</span>
        </div>
      </div>
    </div>
  );
}
