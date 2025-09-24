'use client';

import { useEffectStore } from '../stores/useEffectStore';
import { useWorldStore } from '../state/useWorldStore';

/**
 * Componente de prueba para verificar el funcionamiento del useEffectStore refactorizado
 */
export function TestEffectStore() {
  const effectStore = useEffectStore();
  const worldStore = useWorldStore();

  const handleCreateEffect = () => {
    const position: [number, number, number] = [0, 0, 0];
    const activeGridId = worldStore.activeGridId;
    
    if (!activeGridId) {
      console.warn('No hay cuadrícula activa');
      return;
    }
    
    worldStore.addEffectZone('reverb', position, 'sphere');
  };

  const handleToggleLock = () => {
    const zones = effectStore.getAllEffectZones();
    if (zones.length > 0) {
      const firstZone = zones[0];
      worldStore.toggleLockEffectZone(firstZone.id);
    }
  };

  const handleRefreshEffects = () => {
    worldStore.refreshAllEffects();
  };

  const handleClearEffects = () => {
    effectStore.clearAllEffectZones();
  };

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg border border-white">
      <h3 className="text-lg font-bold mb-4">🎛️ Test Effect Store</h3>
      
      <div className="space-y-2 mb-4">
        <div>
          <strong>Effect Zones Count:</strong> {effectStore.effectZones.length}
        </div>
        <div>
          <strong>Active Grid:</strong> {worldStore.activeGridId || 'null'}
        </div>
        <div>
          <strong>Editing Mode:</strong> {effectStore.isEditingEffectZone ? '✅' : '❌'}
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={handleCreateEffect}
          className="w-full bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm"
        >
          Create Reverb Effect
        </button>
        
        <button
          onClick={handleToggleLock}
          className="w-full bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-sm"
        >
          Toggle Lock (First Zone)
        </button>
        
        <button
          onClick={handleRefreshEffects}
          className="w-full bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded text-sm"
        >
          Refresh All Effects
        </button>
        
        <button
          onClick={handleClearEffects}
          className="w-full bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-sm"
        >
          Clear All Effects
        </button>
      </div>

      <div className="mt-4">
        <h4 className="font-semibold mb-2">Effect Zones List:</h4>
        <div className="max-h-32 overflow-y-auto">
          {effectStore.effectZones.map((zone) => (
            <div key={zone.id} className="text-xs bg-gray-800 p-2 rounded mb-1">
              <div><strong>ID:</strong> {zone.id.substring(0, 8)}...</div>
              <div><strong>Type:</strong> {zone.type}</div>
              <div><strong>Shape:</strong> {zone.shape}</div>
              <div><strong>Position:</strong> [{zone.position.join(', ')}]</div>
              <div><strong>Locked:</strong> {zone.isLocked ? '🔒' : '🔓'}</div>
              <div><strong>Selected:</strong> {zone.isSelected ? '✅' : '❌'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
