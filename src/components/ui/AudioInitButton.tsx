'use client';

import { useAudioContext } from '../../hooks/useAudioContext';

export function AudioInitButton() {
  const { 
    isAudioContextStarted, 
    isInitializing, 
    startAudioContext,
    checkAudioContextState 
  } = useAudioContext();

  const handleClick = async () => {
    if (!isAudioContextStarted && !isInitializing) {
      await startAudioContext();
    }
  };

  const handleCheckState = () => {
    checkAudioContextState();
  };

  return (
    <div className="flex flex-col gap-2 p-4 bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold text-white">🎵 Control de Audio</h3>
      
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${
          isAudioContextStarted ? 'bg-green-500' : 'bg-red-500'
        }`} />
        <span className="text-sm text-gray-300">
          {isAudioContextStarted ? 'Audio Activo' : 'Audio Inactivo'}
        </span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleClick}
          disabled={isAudioContextStarted || isInitializing}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            isAudioContextStarted || isInitializing
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isInitializing ? 'Iniciando...' : 'Iniciar Audio'}
        </button>

        <button
          onClick={handleCheckState}
          className="px-4 py-2 rounded-md text-sm font-medium bg-gray-600 hover:bg-gray-700 text-white transition-colors"
        >
          Ver Estado
        </button>
      </div>

      {isAudioContextStarted && (
        <p className="text-xs text-green-400">
          ✅ El contexto de audio está activo. Puedes reproducir sonidos.
        </p>
      )}

      {!isAudioContextStarted && !isInitializing && (
        <p className="text-xs text-yellow-400">
          ⚠️ Haz clic en &quot;Iniciar Audio&quot; para activar la funcionalidad de sonido.
        </p>
      )}
    </div>
  );
}
