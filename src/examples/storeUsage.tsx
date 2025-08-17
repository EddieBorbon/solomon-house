// Ejemplo de uso del store de Zustand para "Casa de Salomon"
import { useWorldStore } from '../state/useWorldStore';

// Ejemplo 1: Componente que añade objetos
export const ObjectCreator = () => {
  const { addObject } = useWorldStore();

  const handleAddCube = () => {
    addObject('cube', [0, 0, 0]);
  };

  const handleAddSphere = () => {
    addObject('sphere', [2, 0, 0]);
  };

  return (
    <div className="p-4 space-y-2">
      <button 
        onClick={handleAddCube}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Añadir Cubo
      </button>
      <button 
        onClick={handleAddSphere}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Añadir Esfera
      </button>
    </div>
  );
};

// Ejemplo 2: Componente que muestra la lista de objetos
export const ObjectList = () => {
  const { objects, selectObject, removeObject } = useWorldStore();

  return (
    <div className="p-4">
      <h3 className="text-lg font-bold mb-4">Objetos en el Mundo</h3>
      <div className="space-y-2">
        {objects.map((obj) => (
          <div 
            key={obj.id}
            className={`p-3 border rounded cursor-pointer ${
              obj.isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
            onClick={() => selectObject(obj.id)}
          >
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium">{obj.type}</span>
                <span className="text-sm text-gray-500 ml-2">
                  Pos: [{obj.position.join(', ')}]
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeObject(obj.id);
                }}
                className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
              >
                Eliminar
              </button>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Frecuencia: {obj.audioParams.frequency}Hz
            </div>
          </div>
        ))}
        {objects.length === 0 && (
          <p className="text-gray-500 text-center py-4">
            No hay objetos en el mundo
          </p>
        )}
      </div>
    </div>
  );
};

// Ejemplo 3: Componente que muestra información del objeto seleccionado
export const SelectedObjectInfo = () => {
  const { objects, selectedObjectId, updateObject } = useWorldStore();
  
  const selectedObject = objects.find(obj => obj.id === selectedObjectId);

  if (!selectedObject) {
    return (
      <div className="p-4 text-gray-500 text-center">
        Selecciona un objeto para ver sus propiedades
      </div>
    );
  }

  const handleFrequencyChange = (newFreq: number) => {
    updateObject(selectedObject.id, {
      audioParams: {
        ...selectedObject.audioParams,
        frequency: newFreq
      }
    });
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-bold mb-4">
        Propiedades de {selectedObject.type}
      </h3>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">
            Frecuencia (Hz)
          </label>
          <input
            type="range"
            min="20"
            max="2000"
            value={selectedObject.audioParams.frequency}
            onChange={(e) => handleFrequencyChange(Number(e.target.value))}
            className="w-full"
          />
          <span className="text-sm text-gray-600">
            {selectedObject.audioParams.frequency} Hz
          </span>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Volumen
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={selectedObject.audioParams.volume}
            onChange={(e) => updateObject(selectedObject.id, {
              audioParams: {
                ...selectedObject.audioParams,
                volume: Number(e.target.value)
              }
            })}
            className="w-full"
          />
          <span className="text-sm text-gray-600">
            {selectedObject.audioParams.volume}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-medium">Posición:</span>
            <div className="text-gray-600">
              X: {selectedObject.position[0].toFixed(2)}<br/>
              Y: {selectedObject.position[1].toFixed(2)}<br/>
              Z: {selectedObject.position[2].toFixed(2)}
            </div>
          </div>
          <div>
            <span className="font-medium">Escala:</span>
            <div className="text-gray-600">
              X: {selectedObject.scale[0].toFixed(2)}<br/>
              Y: {selectedObject.scale[1].toFixed(2)}<br/>
              Z: {selectedObject.scale[2].toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
