// Ejemplo de uso del efecto StereoWidener en "Casa de Salomon"
import { audioManager } from '../lib/AudioManager';
import { useWorldStore } from '../state/useWorldStore';
import { useState, useEffect } from 'react';

// Ejemplo de componente que demuestra el uso del StereoWidener
export const StereoWidenerExample = () => {
  const { addObject, objects } = useWorldStore();
  const [stereoWidenerEffectId] = useState('stereoWidenerEffect');
  const [isEffectCreated, setIsEffectCreated] = useState(false);
  const [effectParams, setEffectParams] = useState({
    width: 0.5,
    wet: 0.5
  });

  // Crear el efecto StereoWidener al montar el componente
  useEffect(() => {
    if (!isEffectCreated) {
      try {
        audioManager.createGlobalEffect(
          stereoWidenerEffectId,
          'stereoWidener',
          [0, 0, 0] // Posición del efecto en el espacio 3D
        );
        setIsEffectCreated(true);
        console.log('🎛️ StereoWidener creado exitosamente');
      } catch (error) {
        console.error('❌ Error al crear StereoWidener:', error);
      }
    }
  }, [isEffectCreated, stereoWidenerEffectId]);

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

  // Actualizar parámetros del StereoWidener
  const updateEffectParam = (paramName: string, value: string | number) => {
    const newParams = { ...effectParams, [paramName]: value };
    setEffectParams(newParams);
    
    try {
      audioManager.updateGlobalEffect(stereoWidenerEffectId, { [paramName]: value });
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

  // Presets de ancho estéreo
  const applyPreset = (preset: string) => {
    switch (preset) {
      case 'mono':
        updateEffectParam('width', 0);
        break;
      case 'narrow':
        updateEffectParam('width', 0.25);
        break;
      case 'normal':
        updateEffectParam('width', 0.5);
        break;
      case 'wide':
        updateEffectParam('width', 0.75);
        break;
      case 'ultraWide':
        updateEffectParam('width', 1.0);
        break;
      case 'reset':
        updateEffectParam('width', 0.5);
        break;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="bg-cyan-50 p-4 rounded-lg">
        <h2 className="text-2xl font-bold text-cyan-800 mb-2">
          🎛️ Ejemplo de StereoWidener
        </h2>
        <p className="text-cyan-700">
          El StereoWidener aplica un factor de ancho a la separación mid/side. 
          0 es todo mid (mono) y 1 es todo side (estéreo máximo). 
          Utiliza el algoritmo: Mid *= 2*(1-width), Side *= 2*width
        </p>
      </div>

      {/* Controles del efecto */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Controles del StereoWidener</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Width */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Width (Ancho Estéreo): {Math.round(effectParams.width * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={effectParams.width}
              onChange={(e) => updateEffectParam('width', Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0% (Mono)</span>
              <span>100% (Estéreo)</span>
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
        <h3 className="text-lg font-semibold mb-4">Presets de Ancho Estéreo</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <button
            onClick={() => applyPreset('mono')}
            className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            🔇 Mono (0%)
          </button>
          <button
            onClick={() => applyPreset('narrow')}
            className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            📱 Estrecho (25%)
          </button>
          <button
            onClick={() => applyPreset('normal')}
            className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            🎵 Normal (50%)
          </button>
          <button
            onClick={() => applyPreset('wide')}
            className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            🎧 Ancho (75%)
          </button>
          <button
            onClick={() => applyPreset('ultraWide')}
            className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            🌐 Ultra Ancho (100%)
          </button>
          <button
            onClick={() => applyPreset('reset')}
            className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
          >
            🔄 Reset (50%)
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
            <li>Crea un sonido de prueba para escuchar el efecto StereoWidener</li>
            <li>Usa los presets para cambios rápidos de ancho estéreo</li>
            <li>Ajusta el Width para controlar el campo estéreo</li>
            <li>Experimenta con diferentes valores para crear efectos espaciales</li>
            <li>Usa auriculares para mejor percepción del efecto estéreo</li>
          </ul>
        </div>
      </div>

      {/* Información técnica */}
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Información Técnica</h3>
        <div className="text-sm text-gray-700 space-y-1">
          <p><strong>ID del Efecto:</strong> {stereoWidenerEffectId}</p>
          <p><strong>Posición:</strong> [0, 0, 0] (centro del mundo)</p>
          <p><strong>Radio de Efecto:</strong> 2.0 unidades</p>
          <p><strong>Estado:</strong> {isEffectCreated ? '✅ Activo' : '⏳ Creando...'}</p>
          <p><strong>Algoritmo:</strong> Mid *= 2*(1-width), Side *= 2*width</p>
          <p><strong>Base:</strong> MidSideEffect de Tone.js</p>
        </div>
      </div>

      {/* Descripción de parámetros */}
      <div className="bg-purple-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Descripción de Parámetros</h3>
        <div className="text-sm text-gray-700 space-y-2">
          <div>
            <strong>Width:</strong> Controla el ancho del campo estéreo. 0 = mono (100% mid), 0.5 = sin cambio, 1 = estéreo máximo (100% side).
          </div>
          <div>
            <strong>Wet:</strong> Mezcla entre la señal seca y la señal procesada. 0% = solo señal seca, 100% = solo señal procesada.
          </div>
        </div>
      </div>

      {/* Casos de uso */}
      <div className="bg-indigo-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Casos de Uso</h3>
        <div className="text-sm text-gray-700 space-y-2">
          <div>
            <strong>🎵 Producción Musical:</strong> Añadir amplitud estéreo a instrumentos monofónicos
          </div>
          <div>
            <strong>🎬 Post-producción:</strong> Mejorar la espacialidad de grabaciones
          </div>
          <div>
            <strong>🎮 Audio Espacial:</strong> Crear efectos de inmersión en entornos 3D
          </div>
          <div>
            <strong>🎧 Mezcla:</strong> Balancear el campo estéreo en mezclas
          </div>
        </div>
      </div>
    </div>
  );
};

export default StereoWidenerExample;

