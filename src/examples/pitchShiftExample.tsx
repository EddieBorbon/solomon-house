// Ejemplo de uso del efecto PitchShift en "Casa de Salomon"
import { audioManager } from '../lib/AudioManager';
import { useWorldStore } from '../state/useWorldStore';
import { useState, useEffect } from 'react';

// Ejemplo de componente que demuestra el uso del PitchShift
export const PitchShiftExample = () => {
  const { addObject, objects } = useWorldStore();
  const [pitchShiftEffectId] = useState('pitchShiftEffect');
  const [isEffectCreated, setIsEffectCreated] = useState(false);
  const [effectParams, setEffectParams] = useState({
    pitchShift: 0,
    windowSize: 0.1,
    delayTime: 0,
    feedback: 0
  });

  // Crear el efecto PitchShift al montar el componente
  useEffect(() => {
    if (!isEffectCreated) {
      try {
        audioManager.createGlobalEffect(
          pitchShiftEffectId,
          'pitchShift',
          [0, 0, 0] // Posición del efecto en el espacio 3D
        );
        setIsEffectCreated(true);
        console.log('🎛️ PitchShift creado exitosamente');
      } catch (error) {
        console.error('❌ Error al crear PitchShift:', error);
      }
    }
  }, [isEffectCreated, pitchShiftEffectId]);

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
        waveform: 'sine',
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
      waveform: 'sine',
      attack: 0.1,
      decay: 0.2,
      sustain: 0.5,
      release: 0.8
    });

    console.log(`🔊 Sonido de prueba creado: ${soundId}`);
  };

  // Actualizar parámetros del PitchShift
  const updateEffectParam = (paramName: string, value: string | number) => {
    const newParams = { ...effectParams, [paramName]: value };
    setEffectParams(newParams);
    
    try {
      audioManager.updateGlobalEffect(pitchShiftEffectId, { [paramName]: value });
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

  // Presets de pitch shift
  const applyPreset = (preset: string) => {
    switch (preset) {
      case 'octaveUp':
        updateEffectParam('pitchShift', 12);
        break;
      case 'octaveDown':
        updateEffectParam('pitchShift', -12);
        break;
      case 'fifthUp':
        updateEffectParam('pitchShift', 7);
        break;
      case 'fifthDown':
        updateEffectParam('pitchShift', -7);
        break;
      case 'minorThirdUp':
        updateEffectParam('pitchShift', 3);
        break;
      case 'minorThirdDown':
        updateEffectParam('pitchShift', -3);
        break;
      case 'reset':
        updateEffectParam('pitchShift', 0);
        break;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="bg-emerald-50 p-4 rounded-lg">
        <h2 className="text-2xl font-bold text-emerald-800 mb-2">
          🎛️ Ejemplo de PitchShift
        </h2>
        <p className="text-emerald-700">
          El PitchShift realiza cambios de tono en tiempo real a la señal entrante. 
          El efecto se logra acelerando o desacelerando el delayTime de un DelayNode 
          usando una onda diente de sierra.
        </p>
      </div>

      {/* Controles del efecto */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Controles del PitchShift</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pitch */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Pitch (Semi-tonos): {effectParams.pitchShift}
            </label>
            <input
              type="range"
              min="-24"
              max="24"
              step="1"
              value={effectParams.pitchShift}
              onChange={(e) => updateEffectParam('pitchShift', Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>-24 (2 octavas abajo)</span>
              <span>+24 (2 octavas arriba)</span>
            </div>
          </div>

          {/* Window Size */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Window Size: {effectParams.windowSize}s
            </label>
            <input
              type="range"
              min="0.03"
              max="0.1"
              step="0.01"
              value={effectParams.windowSize}
              onChange={(e) => updateEffectParam('windowSize', Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0.03s</span>
              <span>0.1s</span>
            </div>
          </div>

          {/* Delay Time */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Delay Time: {effectParams.delayTime}s
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={effectParams.delayTime}
              onChange={(e) => updateEffectParam('delayTime', Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0s</span>
              <span>1s</span>
            </div>
          </div>

          {/* Feedback */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Feedback: {Math.round(effectParams.feedback * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="0.9"
              step="0.05"
              value={effectParams.feedback}
              onChange={(e) => updateEffectParam('feedback', Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>90%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Presets */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Presets de Pitch</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            onClick={() => applyPreset('octaveUp')}
            className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            +1 Octava
          </button>
          <button
            onClick={() => applyPreset('octaveDown')}
            className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            -1 Octava
          </button>
          <button
            onClick={() => applyPreset('fifthUp')}
            className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            +5ta (7 semitones)
          </button>
          <button
            onClick={() => applyPreset('fifthDown')}
            className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            -5ta (-7 semitones)
          </button>
          <button
            onClick={() => applyPreset('minorThirdUp')}
            className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            +3ra menor
          </button>
          <button
            onClick={() => applyPreset('minorThirdDown')}
            className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            -3ra menor
          </button>
          <button
            onClick={() => applyPreset('reset')}
            className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
          >
            Reset (0)
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
            <li>Crea un sonido de prueba para escuchar el efecto PitchShift</li>
            <li>Usa los presets para cambios rápidos de tono</li>
            <li>Ajusta el Window Size para controlar la suavidad del efecto</li>
            <li>Experimenta con diferentes valores de pitch para crear armonías</li>
          </ul>
        </div>
      </div>

      {/* Información técnica */}
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Información Técnica</h3>
        <div className="text-sm text-gray-700 space-y-1">
          <p><strong>ID del Efecto:</strong> {pitchShiftEffectId}</p>
          <p><strong>Posición:</strong> [0, 0, 0] (centro del mundo)</p>
          <p><strong>Radio de Efecto:</strong> 2.0 unidades</p>
          <p><strong>Estado:</strong> {isEffectCreated ? '✅ Activo' : '⏳ Creando...'}</p>
          <p><strong>Algoritmo:</strong> Basado en DelayNode con onda diente de sierra</p>
        </div>
      </div>
    </div>
  );
};

export default PitchShiftExample;

