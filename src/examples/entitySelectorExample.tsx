import React from 'react';
import { useEntitySelector } from '../hooks/useEntitySelector';

/**
 * Ejemplo de uso del hook useEntitySelector
 * Demuestra cómo usar el hook refactorizado para manejar la selección de entidades
 */
export function EntitySelectorExample() {
  const {
    selectedEntity,
    selectedEntityId,
    isSoundObject,
    isMobileObject,
    isEffectZone,
    getSoundObject,
    getMobileObject,
    getEffectZone,
    hasSelection
  } = useEntitySelector();

  if (!hasSelection) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg">
        <h3 className="text-white font-bold mb-2">🎯 Entity Selector Hook</h3>
        <p className="text-gray-400">No hay ninguna entidad seleccionada</p>
        <p className="text-xs text-gray-500 mt-2">
          Selecciona un objeto sonoro, objeto móvil o zona de efecto en el mundo 3D
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h3 className="text-white font-bold mb-2">🎯 Entity Selector Hook</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <span className="text-gray-400">ID:</span>
          <span className="text-white ml-2 font-mono">{selectedEntityId}</span>
        </div>
        
        <div>
          <span className="text-gray-400">Tipo:</span>
          <span className="text-white ml-2">
            {selectedEntity?.type === 'soundObject' && '🎵 Objeto Sonoro'}
            {selectedEntity?.type === 'mobileObject' && '🚀 Objeto Móvil'}
            {selectedEntity?.type === 'effectZone' && '🎛️ Zona de Efecto'}
          </span>
        </div>

        {/* Información específica del tipo */}
        {isSoundObject && (
          <div className="mt-3 p-2 bg-blue-900/20 rounded">
            <h4 className="text-blue-300 font-medium mb-1">🎵 Objeto Sonoro</h4>
            <div className="text-xs text-gray-300">
              <div>Volumen: {getSoundObject()?.audioParams?.volume ?? 'N/A'}</div>
              <div>Pitch: {getSoundObject()?.audioParams?.pitch ?? 'N/A'}</div>
            </div>
          </div>
        )}

        {isMobileObject && (
          <div className="mt-3 p-2 bg-green-900/20 rounded">
            <h4 className="text-green-300 font-medium mb-1">🚀 Objeto Móvil</h4>
            <div className="text-xs text-gray-300">
              <div>Velocidad: {getMobileObject()?.mobileParams?.speed ?? 'N/A'}</div>
              <div>Dirección: [{getMobileObject()?.mobileParams?.direction?.join(', ') ?? 'N/A'}]</div>
            </div>
          </div>
        )}

        {isEffectZone && (
          <div className="mt-3 p-2 bg-purple-900/20 rounded">
            <h4 className="text-purple-300 font-medium mb-1">🎛️ Zona de Efecto</h4>
            <div className="text-xs text-gray-300">
              <div>Tipo: {getEffectZone()?.type ?? 'N/A'}</div>
              <div>Bloqueado: {getEffectZone()?.isLocked ? 'Sí' : 'No'}</div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>✅ Hook refactorizado funcionando correctamente</p>
        <p>📦 Responsabilidad única: Solo maneja selección de entidades</p>
        <p>🔧 Fácil de testear y reutilizar</p>
      </div>
    </div>
  );
}
