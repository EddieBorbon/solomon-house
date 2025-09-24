'use client';

import { useGridStore } from '../stores/useGridStore';
import { useWorldStore } from '../state/useWorldStore';

/**
 * Componente de prueba para verificar el funcionamiento del useGridStore refactorizado
 */
export function TestGridStore() {
  const gridStore = useGridStore();
  const worldStore = useWorldStore();

  const handleCreateGrid = () => {
    const position: [number, number, number] = [10, 0, 10];
    worldStore.createGrid(position, 20);
  };

  const handleMoveToGrid = () => {
    const coordinates: [number, number, number] = [1, 0, 0];
    worldStore.moveToGrid(coordinates);
  };

  const handleLoadGrid = () => {
    const coordinates: [number, number, number] = [0, 1, 0];
    worldStore.loadGrid(coordinates);
  };

  return (
    <div className="fixed top-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg border border-white">
      <h3 className="text-lg font-bold mb-4">🧪 Test Grid Store</h3>
      
      <div className="space-y-2 mb-4">
        <div>
          <strong>Grids Count:</strong> {gridStore.grids.size}
        </div>
        <div>
          <strong>Current Coordinates:</strong> [{gridStore.currentGridCoordinates.join(', ')}]
        </div>
        <div>
          <strong>Active Grid ID:</strong> {gridStore.activeGridId || 'null'}
        </div>
        <div>
          <strong>Grid Size:</strong> {gridStore.gridSize}
        </div>
        <div>
          <strong>Render Distance:</strong> {gridStore.renderDistance}
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={handleCreateGrid}
          className="w-full bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm"
        >
          Create Grid
        </button>
        
        <button
          onClick={handleMoveToGrid}
          className="w-full bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-sm"
        >
          Move to Grid [1,0,0]
        </button>
        
        <button
          onClick={handleLoadGrid}
          className="w-full bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded text-sm"
        >
          Load Grid [0,1,0]
        </button>
      </div>

      <div className="mt-4">
        <h4 className="font-semibold mb-2">Grids List:</h4>
        <div className="max-h-32 overflow-y-auto">
          {Array.from(gridStore.grids.entries()).map(([id, grid]) => (
            <div key={id} className="text-xs bg-gray-800 p-2 rounded mb-1">
              <div><strong>ID:</strong> {id}</div>
              <div><strong>Coords:</strong> [{grid.coordinates.join(', ')}]</div>
              <div><strong>Position:</strong> [{grid.position.join(', ')}]</div>
              <div><strong>Loaded:</strong> {grid.isLoaded ? '✅' : '❌'}</div>
              <div><strong>Selected:</strong> {grid.isSelected ? '✅' : '❌'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
