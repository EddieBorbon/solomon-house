export default function Loading() {
  return (
    <div className="w-full h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          🎵 Casa de Salomon
        </h2>
        <p className="text-gray-500">Inicializando el mundo musical 3D...</p>
        <div className="mt-4 text-xs text-gray-400">
          <p>• Cargando Three.js</p>
          <p>• Inicializando Zustand</p>
          <p>• Preparando la escena</p>
        </div>
      </div>
    </div>
  );
}
