// Ejemplo de uso del efecto Reverb en "Casa de Salomon"
import { audioManager } from '../lib/AudioManager';
import { useWorldStore } from '../state/useWorldStore';
import { useState, useEffect } from 'react';

// Ejemplo de componente que demuestra el uso del Reverb
export const ReverbExample = () => {
  const { addObject, objects } = useWorldStore();
  const [reverbEffectId] = useState('reverbEffect');
  const [isEffectCreated, setIsEffectCreated] = useState(false);
  const [effectParams, setEffectParams] = useState({
    decay: 1.5,
    preDelay: 0.01,
    wet: 0.5
  });

  // Crear el efecto Reverb al montar el componente
  useEffect(() => {
    if (!isEffectCreated) {
      try {
        audioManager.createGlobalEffect(
          reverbEffectId,
          'reverb',
          [0, 0, 0] // Posición del efecto en el espacio 3D
        );
        setIsEffectCreated(true);
        console.log('🎛️ Reverb creado exitosamente');
      } catch (error) {
        console.error('❌ Error al crear Reverb:', error);
      }
    }
  }, [isEffectCreated, reverbEffectId]);

  // Crear una fuente de sonido para probar el efecto
  const createTestSound = () => {
    const soundId = `testSound_${Date.now()}`;
    addObject('sphere', [2, 0, 0]); // Crear una esfera sonora
    
    // Crear la fuente de sonido en el AudioManager
    audioManager.createSoundSource(
      soundId,
      'sphere',
      {
        frequency: 440,
        volume: 0.3,
        attack: 0.1,
        decay: 0.2,
        sustain: 0.5,
        release: 0.8
      },
      [2, 0, 0]
    );

    // Iniciar el sonido continuo para escuchar el efecto
    audioManager.startContinuousSound(soundId, {
      frequency: 440,
      volume: 0.3,
      attack: 0.1,
      decay: 0.2,
      sustain: 0.5,
      release: 0.8
    });

    console.log(`🔊 Sonido de prueba creado: ${soundId}`);
  };

  // Actualizar parámetros del Reverb
  const updateEffectParam = (paramName: string, value: any) => {
    const newParams = { ...effectParams, [paramName]: value };
    setEffectParams(newParams);
    
    try {
      audioManager.updateGlobalEffect(reverbEffectId, { [paramName]: value });
      console.log(`🎛️ Parámetro ${paramName} actualizado a:`, value);
    } catch (error) {
      console.error(`❌ Error al actualizar parámetro ${paramName}:`, error);
    }
  };

  // Detener todos los sonidos
  const stopAllSounds = () => {
    objects.forEach(obj => {
      if (audioManager.isSoundPlaying(obj.id)) {
        audioManager.stopSound(obj.id);
      }
    });
  };

  // Presets de reverb
  const applyPreset = (preset: string) => {
    switch (preset) {
      case 'room':
        updateEffectParam('decay', 0.5);
        updateEffectParam('preDelay', 0.01);
        break;
      case 'hall':
        updateEffectParam('decay', 2.0);
        updateEffectParam('preDelay', 0.02);
        break;
      case 'cathedral':
        updateEffectParam('decay', 5.0);
        updateEffectParam('preDelay', 0.05);
        break;
      case 'chamber':
        updateEffectParam('decay', 1.0);
        updateEffectParam('preDelay', 0.01);
        break;
      case 'plate':
        updateEffectParam('decay', 2.5);
        updateEffectParam('preDelay', 0.01);
        break;
      case 'spring':
        updateEffectParam('decay', 0.8);
        updateEffectParam('preDelay', 0.01);
        break;
      case 'reset':
        updateEffectParam('decay', 1.5);
        updateEffectParam('preDelay', 0.01);
        break;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="bg-amber-50 p-4 rounded-lg">
        <h2 className="text-2xl font-bold text-amber-800 mb-2">
          🎛️ Ejemplo de Reverb
        </h2>
        <p className="text-amber-700">
          El Reverb simula la reverberación natural de un espacio acústico. 
          Utiliza convolución con ruido en decaimiento para generar una respuesta 
          de impulso que simula diferentes tipos de espacios.
        </p>
      </div>

      {/* Controles del efecto */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Controles del Reverb</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Decay */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Decay: {effectParams.decay}s
            </label>
            <input
              type="range"
              min="0.1"
              max="10"
              step="0.1"
              value={effectParams.decay}
              onChange={(e) => updateEffectParam('decay', Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0.1s</span>
              <span>10s</span>
            </div>
          </div>

          {/* PreDelay */}
          <div>
            <label className="block text-sm font-medium mb-2">
              PreDelay: {effectParams.preDelay}s
            </label>
            <input
              type="range"
              min="0"
              max="0.1"
              step="0.001"
              value={effectParams.preDelay}
              onChange={(e) => updateEffectParam('preDelay', Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0s</span>
              <span>0.1s</span>
            </div>
          </div>

          {/* Wet */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Wet (Mezcla): {Math.round(effectParams.wet * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={effectParams.wet}
              onChange={(e) => updateEffectParam('wet', Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Presets */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Presets de Espacios</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            onClick={() => applyPreset('room')}
            className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            🏠 Habitación
          </button>
          <button
            onClick={() => applyPreset('hall')}
            className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            🏛️ Salón
          </button>
          <button
            onClick={() => applyPreset('cathedral')}
            className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            ⛪ Catedral
          </button>
          <button
            onClick={() => applyPreset('chamber')}
            className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            🎭 Cámara
          </button>
          <button
            onClick={() => applyPreset('plate')}
            className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            🎵 Placa
          </button>
          <button
            onClick={() => applyPreset('spring')}
            className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            🌊 Resorte
          </button>
          <button
            onClick={() => applyPreset('reset')}
            className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
          >
            🔄 Reset
          </button>
        </div>
      </div>

      {/* Controles de sonido */}
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Controles de Sonido</h3>
        
        <div className="flex gap-4">
          <button
            onClick={createTestSound}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            🔊 Crear Sonido de Prueba
          </button>
          
          <button
            onClick={stopAllSounds}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            ⏹️ Detener Todos los Sonidos
          </button>
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-600">
            <strong>Instrucciones:</strong>
          </p>
          <ul className="text-sm text-gray-600 list-disc list-inside mt-2 space-y-1">
            <li>Crea un sonido de prueba para escuchar el efecto Reverb</li>
            <li>Usa los presets para simular diferentes espacios acústicos</li>
            <li>Ajusta el Decay para controlar la duración de la reverberación</li>
            <li>Modifica el PreDelay para simular la distancia de las paredes</li>
            <li>Experimenta con diferentes valores de Wet para la mezcla</li>
          </ul>
        </div>
      </div>

      {/* Información técnica */}
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Información Técnica</h3>
        <div className="text-sm text-gray-700 space-y-1">
          <p><strong>ID del Efecto:</strong> {reverbEffectId}</p>
          <p><strong>Posición:</strong> [0, 0, 0] (centro del mundo)</p>
          <p><strong>Radio de Efecto:</strong> 2.0 unidades</p>
          <p><strong>Estado:</strong> {isEffectCreated ? '✅ Activo' : '⏳ Creando...'}</p>
          <p><strong>Algoritmo:</strong> Convolución con ruido en decaimiento</p>
          <p><strong>Generación IR:</strong> Asíncrona con Tone.Offline</p>
        </div>
      </div>

      {/* Descripción de parámetros */}
      <div className="bg-purple-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Descripción de Parámetros</h3>
        <div className="text-sm text-gray-700 space-y-2">
          <div>
            <strong>Decay:</strong> Duración de la reverberación. Valores más altos simulan espacios más grandes.
          </div>
          <div>
            <strong>PreDelay:</strong> Tiempo antes de que la reverberación se active completamente. Simula la distancia a las paredes.
          </div>
          <div>
            <strong>Wet:</strong> Mezcla entre la señal seca y la señal procesada. 0% = solo señal seca, 100% = solo señal procesada.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReverbExample;

