'use client';

import { useWorldStore } from '../../state/useWorldStore';

export function ControlPanel() {
  const { addObject } = useWorldStore();

  const handleAddCube = () => {
    // Añadir cubo en posición aleatoria
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    addObject('cube', [x, 0.5, z]);
  };

  const handleAddSphere = () => {
    // Añadir esfera en posición aleatoria
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    addObject('sphere', [x, 0.5, z]);
  };

  const handleAddCylinder = () => {
    // Añadir cilindro en posición aleatoria
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    addObject('cylinder', [x, 0.5, z]);
  };

  const handleAddCone = () => {
    // Añadir cono en posición aleatoria
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    addObject('cone', [x, 0.5, z]);
  };

  return (
    <div className="fixed top-4 left-4 bg-gray-900/90 backdrop-blur-sm rounded-lg border border-gray-700 shadow-2xl p-4 z-50 min-w-[280px]">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        ➕ Añadir objeto
      </h3>
      
      {/* Botones de creación */}
      <div className="space-y-3 mb-4">
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
      </div>





      {/* Instrucciones */}
      <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-600">
        <p className="text-xs text-gray-300">
          💡 <strong>Controles:</strong><br/>
          • Click izquierdo: Rotar cámara<br/>
          • Scroll: Zoom<br/>
          • Click derecho: Pan<br/>
          • Click en objetos: Seleccionar
        </p>
      </div>
    </div>
  );
}
