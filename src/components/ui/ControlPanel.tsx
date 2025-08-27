'use client';

import { useState } from 'react';
import { useWorldStore } from '../../state/useWorldStore';

export function ControlPanel() {
  const [isAddMenuExpanded, setIsAddMenuExpanded] = useState(false);
  const [isControlsExpanded, setIsControlsExpanded] = useState(false);
  const [isEffectsExpanded, setIsEffectsExpanded] = useState(false);
  const { addObject, addEffectZone } = useWorldStore();

  const handleAddCube = () => {
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    addObject('cube', [x, 0.5, z]);
  };

  const handleAddSphere = () => {
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    addObject('sphere', [x, 0.5, z]);
  };

  const handleAddCylinder = () => {
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    addObject('cylinder', [x, 0.5, z]);
  };

  const handleAddCone = () => {
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    addObject('cone', [x, 0.5, z]);
  };

  const handleAddPyramid = () => {
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    addObject('pyramid', [x, 0.5, z]);
  };

  const handleAddIcosahedron = () => {
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    addObject('icosahedron', [x, 0.5, z]);
  };

  const handleAddPlane = () => {
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    addObject('plane', [x, 0.5, z]);
  };

  const handleAddTorus = () => {
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    addObject('torus', [x, 0.5, z]);
  };

  const handleAddDodecahedronRing = () => {
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    addObject('dodecahedronRing', [x, 0.5, z]);
  };

  const handleAddSpiral = () => {
    // Añadir espiral de samples en posición aleatoria
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    addObject('spiral', [x, 0.5, z]);
  };

  const handleAddPhaserZone = () => {
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    addEffectZone('phaser', [x, 1, z], 'sphere'); // Usar 'sphere' como forma por defecto
  };

  return (
    <div className="fixed top-4 left-4 bg-gray-900/90 backdrop-blur-sm rounded-lg border border-gray-700 shadow-2xl p-4 z-50 min-w-[280px]">
      
      {/* Sección de Controles */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            💡 Controles
          </h3>
          <button
            onClick={() => setIsControlsExpanded(!isControlsExpanded)}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded"
            title={isControlsExpanded ? "Ocultar controles" : "Mostrar controles"}
          >
            {isControlsExpanded ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
        </div>
        
        {isControlsExpanded && (
          <div className="space-y-3">
            {/* Controles de cámara */}
            <div className="p-3 bg-gray-800/50 border border-gray-600/50 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-300 mb-2">📷 Cámara</h4>
              <div className="space-y-1 text-xs text-gray-400">
                <p>• <strong>Click izquierdo:</strong> Rotar cámara</p>
                <p>• <strong>Scroll:</strong> Zoom</p>
                <p>• <strong>Click derecho:</strong> Pan</p>
                <p>• <strong>Click en objetos:</strong> Seleccionar</p>
              </div>
            </div>

            {/* Controles de teclado WASD */}
            <div className="p-3 bg-green-900/20 border border-green-700/50 rounded-lg">
              <h4 className="text-sm font-semibold text-green-300 mb-2">⌨️ Controles WASD</h4>
              <div className="space-y-1 text-xs text-green-200">
                <p>• <strong>W:</strong> Mover hacia adelante</p>
                <p>• <strong>S:</strong> Mover hacia atrás</p>
                <p>• <strong>A:</strong> Mover a la izquierda</p>
                <p>• <strong>D:</strong> Mover a la derecha</p>
                <p>• <strong>Q:</strong> Mover hacia abajo</p>
                <p>• <strong>E:</strong> Mover hacia arriba</p>
                <p>• <strong>Shift:</strong> Movimiento rápido</p>
              </div>
            </div>

            {/* Modos de interacción */}
            <div className="p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-300 mb-2">🎮 Modos de Interacción</h4>
              <div className="space-y-1 text-xs text-blue-200">
                <p>• <strong>Clic corto:</strong> Toca una nota con duración configurable</p>
                <p>• <strong>Clic sostenido:</strong> Mantén presionado para sonido continuo (gate)</p>
                <p>• <strong>Botón de audio:</strong> Activa/desactiva el sonido permanente</p>
              </div>
            </div>

            {/* Información sobre zonas de efectos */}
            <div className="p-3 bg-purple-900/20 border border-purple-700/50 rounded-lg">
              <h4 className="text-sm font-semibold text-purple-300 mb-2">🎛️ Zonas de Efectos</h4>
              <div className="space-y-1 text-xs text-purple-200">
                <p>• <strong>Zonas Phaser:</strong> Aplican efectos de modulación</p>
                <p>• <strong>Detección automática:</strong> Los objetos dentro de la zona se procesan</p>
                <p>• <strong>Bloqueo:</strong> Usa el candado para proteger zonas de cambios</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sección de Añadir Objeto */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            ➕ Añadir objeto
          </h3>
          <button
            onClick={() => setIsAddMenuExpanded(!isAddMenuExpanded)}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded"
            title={isAddMenuExpanded ? "Ocultar menú" : "Mostrar menú"}
          >
            {isAddMenuExpanded ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
        </div>
        
        {isAddMenuExpanded && (
          <div className="space-y-3">
            {/* Separador para objetos sonoros */}
            <div className="text-center">
              <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">🎵 Objetos Sonoros</span>
            </div>

            <button
              onClick={handleAddCube}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
            >
              <span>⬜</span>
              <span>Cubo</span>
            </button>
            
            <button
              onClick={handleAddSphere}
              className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center space-x-2"
            >
              <span>🔵</span>
              <span>Esfera</span>
            </button>
            
            <button
              onClick={handleAddCylinder}
              className="w-full px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center space-x-2"
            >
              <span>🔶</span>
              <span>Cilindro</span>
            </button>
            
            <button
              onClick={handleAddCone}
              className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2"
            >
              <span>🥁</span>
              <span>Cono</span>
            </button>
            
            <button
              onClick={handleAddPyramid}
              className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
            >
              <span>🔺</span>
              <span>Pirámide</span>
            </button>
            
            <button
              onClick={handleAddIcosahedron}
              className="w-full px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors flex items-center justify-center space-x-2"
            >
              <span>🔶</span>
              <span>Icosaedro</span>
            </button>
            
            <button
              onClick={handleAddPlane}
              className="w-full px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors flex items-center justify-center space-x-2"
            >
              <span>🟦</span>
              <span>Plano</span>
            </button>
            
            <button
              onClick={handleAddTorus}
              className="w-full px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors flex items-center justify-center space-x-2"
            >
              <span>🔄</span>
              <span>Toroide</span>
            </button>

            <button
              onClick={handleAddDodecahedronRing}
              className="w-full px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center justify-center space-x-2"
            >
              <span>🔷</span>
              <span>Anillo de Dodecaedros</span>
            </button>

            <button
              onClick={handleAddSpiral}
              className="w-full px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors flex items-center justify-center space-x-2"
            >
              <span>🌀</span>
              <span>Espiral de Samples</span>
            </button>
          </div>
        )}
      </div>

      {/* Sección de Zonas de Efectos */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            🎛️ Zonas de Efectos
          </h3>
          <button
            onClick={() => setIsEffectsExpanded(!isEffectsExpanded)}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded"
            title={isEffectsExpanded ? "Ocultar menú" : "Mostrar menú"}
          >
            {isEffectsExpanded ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
        </div>
        
        {isEffectsExpanded && (
          <div className="space-y-3">
            <button
              onClick={handleAddPhaserZone}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
            >
              <span>🎛️</span>
              <span>Zona de Phaser (sphere)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
