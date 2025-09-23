import React from 'react';
import { useTransformHandler } from '../hooks/useTransformHandler';

/**
 * Ejemplo de uso del hook useTransformHandler
 * Demuestra cómo usar el hook refactorizado para manejar transformaciones 3D
 */
export function TransformHandlerExample() {
  const {
    updateTransform,
    resetTransform,
    setTransform,
    getTransform,
    roundToDecimals,
    defaultValues,
    hasSelection,
    canTransform
  } = useTransformHandler();

  // Obtener valores actuales
  const currentPosition = getTransform('position');
  const currentRotation = getTransform('rotation');
  const currentScale = getTransform('scale');

  if (!hasSelection) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg">
        <h3 className="text-white font-bold mb-2">🎯 Transform Handler Hook</h3>
        <p className="text-gray-400">No hay ninguna entidad seleccionada</p>
        <p className="text-xs text-gray-500 mt-2">
          Selecciona un objeto sonoro o zona de efecto para ver los controles de transformación
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h3 className="text-white font-bold mb-2">🎯 Transform Handler Hook</h3>
      
      <div className="space-y-4">
        {/* Estado de transformación */}
        <div className="text-sm">
          <div className="text-gray-400 mb-2">Estado actual:</div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-blue-900/20 p-2 rounded">
              <div className="text-blue-300 font-medium">Posición</div>
              <div className="text-gray-300">
                X: {roundToDecimals(currentPosition[0])}<br/>
                Y: {roundToDecimals(currentPosition[1])}<br/>
                Z: {roundToDecimals(currentPosition[2])}
              </div>
            </div>
            <div className="bg-green-900/20 p-2 rounded">
              <div className="text-green-300 font-medium">Rotación</div>
              <div className="text-gray-300">
                X: {roundToDecimals(currentRotation[0])}°<br/>
                Y: {roundToDecimals(currentRotation[1])}°<br/>
                Z: {roundToDecimals(currentRotation[2])}°
              </div>
            </div>
            <div className="bg-purple-900/20 p-2 rounded">
              <div className="text-purple-300 font-medium">Escala</div>
              <div className="text-gray-300">
                X: {roundToDecimals(currentScale[0])}<br/>
                Y: {roundToDecimals(currentScale[1])}<br/>
                Z: {roundToDecimals(currentScale[2])}
              </div>
            </div>
          </div>
        </div>

        {/* Controles de ejemplo */}
        <div className="space-y-2">
          <div className="text-gray-400 text-sm">Controles de ejemplo:</div>
          
          {/* Posición */}
          <div className="flex gap-2 items-center">
            <label className="text-xs text-gray-300 w-16">Posición X:</label>
            <input
              type="range"
              min="-10"
              max="10"
              step="0.1"
              value={currentPosition[0]}
              onChange={(e) => updateTransform('position', 0, parseFloat(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs text-white w-12">{roundToDecimals(currentPosition[0])}</span>
          </div>

          {/* Rotación */}
          <div className="flex gap-2 items-center">
            <label className="text-xs text-gray-300 w-16">Rotación Y:</label>
            <input
              type="range"
              min="-180"
              max="180"
              step="1"
              value={currentRotation[1]}
              onChange={(e) => updateTransform('rotation', 1, parseFloat(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs text-white w-12">{roundToDecimals(currentRotation[1])}°</span>
          </div>

          {/* Escala */}
          <div className="flex gap-2 items-center">
            <label className="text-xs text-gray-300 w-16">Escala Z:</label>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={currentScale[2]}
              onChange={(e) => updateTransform('scale', 2, parseFloat(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs text-white w-12">{roundToDecimals(currentScale[2])}</span>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2">
          <button
            onClick={() => setTransform('position', [0, 0, 0])}
            className="flex-1 px-3 py-2 text-xs bg-blue-700 hover:bg-blue-600 text-white rounded border border-blue-600 transition-colors"
          >
            Centrar Posición
          </button>
          <button
            onClick={() => setTransform('scale', [1, 1, 1])}
            className="flex-1 px-3 py-2 text-xs bg-purple-700 hover:bg-purple-600 text-white rounded border border-purple-600 transition-colors"
          >
            Resetear Escala
          </button>
          <button
            onClick={resetTransform}
            className="flex-1 px-3 py-2 text-xs bg-red-700 hover:bg-red-600 text-white rounded border border-red-600 transition-colors"
          >
            Resetear Todo
          </button>
        </div>

        {/* Información del hook */}
        <div className="mt-4 text-xs text-gray-500">
          <p>✅ Hook refactorizado funcionando correctamente</p>
          <p>📦 Responsabilidad única: Solo maneja transformaciones 3D</p>
          <p>🔧 Funciones: updateTransform, resetTransform, setTransform, getTransform</p>
          <p>🎯 Puede transformar: {canTransform ? 'Sí' : 'No'}</p>
        </div>
      </div>
    </div>
  );
}
