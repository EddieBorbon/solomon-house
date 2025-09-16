// Ejemplo de uso del efecto PingPongDelay en "Casa de Salomon"
import { audioManager } from '../lib/AudioManager';
import { useWorldStore } from '../state/useWorldStore';
import { useState, useEffect } from 'react';

// Ejemplo de componente que demuestra el uso del PingPongDelay
export const PingPongDelayExample = () => {
  const { addObject, objects } = useWorldStore();
  const [pingPongEffectId] = useState('pingPongEffect');
  const [isEffectCreated, setIsEffectCreated] = useState(false);
  const [effectParams, setEffectParams] = useState({
    delayTime: '4n',
    feedback: 0.2,
    maxDelay: 1,
    wet: 0.5
  });

  // Crear el efecto PingPongDelay al montar el componente
  useEffect(() => {
    if (!isEffectCreated) {
      try {
        audioManager.createGlobalEffect(
          pingPongEffectId,
          'pingPongDelay',
          [0, 0, 0] // Posición del efecto en el espacio 3D
        );
        setIsEffectCreated(true);
        console.log('🎛️ PingPongDelay creado exitosamente');
      } catch (error) {
        console.error('❌ Error al crear PingPongDelay:', error);
      }
    }
  }, [isEffectCreated, pingPongEffectId]);

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

  // Actualizar parámetros del PingPongDelay
  const updateEffectParam = (paramName: string, value: any) => {
    const newParams = { ...effectParams, [paramName]: value };
    setEffectParams(newParams);
    
    try {
      audioManager.updateGlobalEffect(pingPongEffectId, { [paramName]: value });
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

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h2 className="text-2xl font-bold text-blue-800 mb-2">
          🎛️ Ejemplo de PingPongDelay
        </h2>
        <p className="text-blue-700">
          El PingPongDelay es un efecto de delay estéreo donde el eco se escucha primero en un canal 
          y luego en el canal opuesto, creando un efecto de &quot;ping-pong&quot; entre los altavoces izquierdo y derecho.
        </p>
      </div>

      {/* Controles del efecto */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Controles del PingPongDelay</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Delay Time */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Tiempo de Delay: {effectParams.delayTime}
            </label>
            <select
              value={effectParams.delayTime}
              onChange={(e) => updateEffectParam('delayTime', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="1n">Nota completa (1n)</option>
              <option value="2n">Media nota (2n)</option>
              <option value="4n">Cuarto de nota (4n)</option>
              <option value="8n">Octavo de nota (8n)</option>
              <option value="16n">Dieciseisavo de nota (16n)</option>
              <option value="32n">Treinta y dosavo de nota (32n)</option>
            </select>
          </div>

          {/* Feedback */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Feedback: {(effectParams.feedback * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0"
              max="0.9"
              step="0.05"
              value={effectParams.feedback}
              onChange={(e) => updateEffectParam('feedback', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Max Delay */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Max Delay: {effectParams.maxDelay}s
            </label>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={effectParams.maxDelay}
              onChange={(e) => updateEffectParam('maxDelay', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Wet */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Wet (Mezcla): {(effectParams.wet * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={effectParams.wet}
              onChange={(e) => updateEffectParam('wet', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
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
            <li>Crea un sonido de prueba para escuchar el efecto PingPongDelay</li>
            <li>Ajusta los parámetros en tiempo real para escuchar los cambios</li>
            <li>El efecto se aplicará automáticamente cuando el sonido esté dentro del radio de la zona de efecto</li>
            <li>Mueve el objeto sonoro en el espacio 3D para experimentar con la espacialización</li>
          </ul>
        </div>
      </div>

      {/* Información técnica */}
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Información Técnica</h3>
        <div className="text-sm text-gray-700 space-y-1">
          <p><strong>ID del Efecto:</strong> {pingPongEffectId}</p>
          <p><strong>Posición:</strong> [0, 0, 0] (centro del mundo)</p>
          <p><strong>Radio de Efecto:</strong> 2.0 unidades</p>
          <p><strong>Estado:</strong> {isEffectCreated ? '✅ Activo' : '⏳ Creando...'}</p>
        </div>
      </div>
    </div>
  );
};

export default PingPongDelayExample;

