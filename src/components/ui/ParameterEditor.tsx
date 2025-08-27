'use client';

import { useWorldStore } from '../../state/useWorldStore';
import { useMemo } from 'react';
import { type AudioParams } from '../../lib/AudioManager';
import React from 'react';

export function ParameterEditor() {
  const { 
    objects, 
    effectZones, 
    selectedEntityId, 
    updateObject, 
    updateEffectZone, 
    removeObject, 
    removeEffectZone, 
    toggleLockEffectZone,
    setEditingEffectZone 
  } = useWorldStore();

  // Encontrar la entidad seleccionada (objeto sonoro o zona de efecto)
  const selectedEntity = useMemo(() => {
    if (!selectedEntityId) return null;
    
    // Buscar en objetos sonoros
    const soundObject = objects.find(obj => obj.id === selectedEntityId);
    if (soundObject) return { type: 'soundObject', data: soundObject };
    
    // Buscar en zonas de efectos
    const effectZone = effectZones.find(zone => zone.id === selectedEntityId);
    if (effectZone) return { type: 'effectZone', data: effectZone };
    
    return null;
  }, [objects, effectZones, selectedEntityId]);

  // Efecto para activar/desactivar el estado de edición de zona de efectos
  React.useEffect(() => {
    if (selectedEntity?.type === 'effectZone') {
      setEditingEffectZone(true);
      console.log('🎛️ Editor de zona de efectos abierto - OrbitControls deshabilitados');
    } else {
      setEditingEffectZone(false);
      console.log('🎛️ Editor de zona de efectos cerrado - OrbitControls habilitados');
    }

    // Cleanup: desactivar el estado cuando se desmonte el componente
    return () => {
      setEditingEffectZone(false);
      console.log('🎛️ Editor de zona de efectos desmontado - OrbitControls habilitados');
    };
  }, [selectedEntity?.type, setEditingEffectZone]);

  // Función para actualizar un parámetro específico de objeto sonoro
  const handleParamChange = (param: keyof AudioParams, value: number | string | string[] | Record<string, string>) => {
    if (!selectedEntity || selectedEntity.type !== 'soundObject') return;

    const soundObject = selectedEntity.data as any; // Type assertion para objeto sonoro
    console.log(`🎛️ UI: Cambiando parámetro ${param} a:`, value);
    console.log(`🎛️ UI: Objeto seleccionado:`, soundObject);

    const newAudioParams = {
      ...soundObject.audioParams,
      [param]: value,
    };

    console.log(`🎛️ UI: Nuevos parámetros de audio:`, newAudioParams);

    updateObject(soundObject.id, {
      audioParams: newAudioParams,
    });

    console.log(`🎵 Parámetro ${param} actualizado a:`, value);
  };

  // Función para actualizar parámetros de zona de efecto
  const handleEffectParamChange = (param: string, value: number) => {
    if (!selectedEntity || selectedEntity.type !== 'effectZone') return;

    const effectZone = selectedEntity.data as any; // Type assertion para zona de efecto
    console.log(`🎛️ UI: Cambiando parámetro de efecto ${param} a:`, value);

    const newEffectParams = {
      ...effectZone.effectParams,
      [param]: value,
    };

    updateEffectZone(effectZone.id, {
      effectParams: newEffectParams,
    });

    console.log(`🎛️ Parámetro de efecto ${param} actualizado a:`, value);
  };

  // Si no hay entidad seleccionada, mostrar mensaje
  if (!selectedEntity) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg border border-gray-700 shadow-2xl p-6 max-w-sm max-h-[90vh] overflow-y-auto">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              No hay entidad seleccionada
            </h3>
            <p className="text-gray-400 text-sm">
              Haz clic en un objeto sonoro o zona de efecto en el mundo 3D para seleccionarlo y editar sus parámetros.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar controles según el tipo de entidad seleccionada
  if (selectedEntity.type === 'effectZone') {
    const zone = selectedEntity.data as any; // Type assertion para zona de efecto
    
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg border border-gray-700 shadow-2xl p-6 max-w-sm max-h-[90vh] overflow-y-auto">
          {/* Header con información de la zona de efecto */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-purple-500" />
                <h3 className="text-lg font-semibold text-white">
                  Editor de Zona de Efecto
                </h3>
              </div>
              <button
                onClick={() => {
                  if (confirm('¿Estás seguro de que quieres eliminar esta zona de efecto?')) {
                    removeEffectZone(zone.id);
                  }
                }}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors duration-200"
                title="Eliminar zona de efecto"
              >
                🗑️
              </button>
            </div>
            <div className="text-sm text-gray-400">
              <p>Tipo: <span className="text-white">{zone.type}</span></p>
              <p>Forma: <span className="text-white capitalize">{zone.shape}</span></p>
              <p>ID: <span className="text-white font-mono text-xs">{zone.id.slice(0, 8)}...</span></p>
            </div>
          </div>

          {/* Control de bloqueo */}
          <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-600">
            <div className="text-center">
              <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${
                zone.isLocked ? 'bg-red-500' : 'bg-purple-500'
              }`}>
                <span className="text-lg">
                  {zone.isLocked ? '🔒' : '🔓'}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-300">
                {zone.isLocked ? 'Zona Bloqueada' : 'Zona Desbloqueada'}
              </span>
              
              <div className="mt-4">
                <button
                  onClick={() => toggleLockEffectZone(zone.id)}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                    zone.isLocked
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {zone.isLocked ? '🔓 Desbloquear Zona' : '🔒 Bloquear Zona'}
                </button>
                <p className="text-xs text-gray-400 mt-1 text-center">
                  {zone.isLocked 
                    ? 'La zona está protegida contra cambios. Haz clic para desbloquear.'
                    : 'La zona puede ser modificada. Haz clic para bloquear.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Controles de parámetros del Phaser */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-purple-400 mb-3 flex items-center gap-2">
              🎛️ Parámetros del Phaser
            </h4>
            
            {/* Frecuencia de modulación */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Frecuencia de Modulación (Hz)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={zone.effectParams.frequency}
                  onChange={(e) => handleEffectParamChange('frequency', Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  disabled={zone.isLocked}
                />
                <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                  {zone.effectParams.frequency}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0.1 Hz</span>
                <span>10 Hz</span>
              </div>
            </div>

            {/* Octavas */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Octavas
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0.1"
                  max="8"
                  step="0.1"
                  value={zone.effectParams.octaves}
                  onChange={(e) => handleEffectParamChange('octaves', Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  disabled={zone.isLocked}
                />
                <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                  {zone.effectParams.octaves}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0.1</span>
                <span>8</span>
              </div>
            </div>

            {/* Frecuencia base */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Frecuencia Base (Hz)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="20"
                  max="20000"
                  step="10"
                  value={zone.effectParams.baseFrequency}
                  onChange={(e) => handleEffectParamChange('baseFrequency', Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  disabled={zone.isLocked}
                />
                <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                  {zone.effectParams.baseFrequency}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>20 Hz</span>
                <span>20 kHz</span>
              </div>
            </div>
          </div>

          {/* Selector de forma */}
          <div className="mt-6 space-y-4">
            <h4 className="text-sm font-semibold text-purple-400 mb-3 flex items-center gap-2">
              🔷 Cambiar Forma
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {(['sphere', 'cube'] as const).map((shape) => (
                <button
                  key={shape}
                  onClick={() => updateEffectZone(zone.id, { shape })}
                  disabled={zone.isLocked}
                  className={`px-3 py-2 text-xs rounded-md transition-colors ${
                    zone.shape === shape
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  {shape === 'sphere' && '🔵'}
                  {shape === 'cube' && '🟦'}
                  <span className="ml-1 capitalize">{shape}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Información adicional */}
          <div className="mt-6 pt-4 border-t border-gray-700">
            <div className="p-3 bg-purple-900/20 border border-purple-700/50 rounded-lg">
              <p className="text-xs text-purple-300 text-center">
                💡 Los objetos sonoros dentro de esta zona se procesarán automáticamente con el efecto Phaser
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar controles para objeto sonoro (código existente)
  const selectedObject = selectedEntity.data as any; // Type assertion para objeto sonoro
  
  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg border border-gray-700 shadow-2xl p-6 max-w-sm max-h-[90vh] overflow-y-auto">
        {/* Header con información del objeto */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded ${
                selectedObject.type === 'cube' ? 'bg-blue-500' : 
                selectedObject.type === 'sphere' ? 'bg-purple-500' : 
                selectedObject.type === 'cylinder' ? 'bg-green-500' :
                selectedObject.type === 'cone' ? 'bg-orange-500' :
                selectedObject.type === 'pyramid' ? 'bg-red-500' :
                selectedObject.type === 'icosahedron' ? 'bg-indigo-500' :
                selectedObject.type === 'torus' ? 'bg-cyan-500' :
                selectedObject.type === 'dodecahedronRing' ? 'bg-pink-500' :
                selectedObject.type === 'spiral' ? 'bg-cyan-500' : 'bg-gray-500'
              }`} />
              <h3 className="text-lg font-semibold text-white">
                Editor de Parámetros
              </h3>
            </div>
            <button
              onClick={() => {
                if (confirm('¿Estás seguro de que quieres eliminar este objeto?')) {
                  removeObject(selectedObject.id);
                }
              }}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors duration-200"
              title="Eliminar objeto"
            >
              🗑️
            </button>
          </div>
          <div className="text-sm text-gray-400">
            <p>Objeto: <span className="text-white">{selectedObject.type}</span></p>
            <p>ID: <span className="text-white font-mono text-xs">{selectedObject.id.slice(0, 8)}...</span></p>
          </div>
        </div>

        {/* Control de activación de audio */}
        <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-600">
          <div className="text-center">
            <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${
              selectedObject.type === 'cone' ? 'bg-orange-500' :
              selectedObject.type === 'cube' ? 'bg-blue-500' :
              selectedObject.type === 'sphere' ? 'bg-purple-500' :
              selectedObject.type === 'cylinder' ? 'bg-green-500' :
              selectedObject.type === 'pyramid' ? 'bg-red-500' :
              selectedObject.type === 'icosahedron' ? 'bg-indigo-500' :
              selectedObject.type === 'torus' ? 'bg-cyan-500' : 
              selectedObject.type === 'dodecahedronRing' ? 'bg-pink-500' :
              selectedObject.type === 'spiral' ? 'bg-cyan-500' : 'bg-gray-500'
            }`}>
              <span className="text-lg">
                {selectedObject.type === 'cone' ? '🥁' :
                 selectedObject.type === 'cube' ? '🔷' :
                 selectedObject.type === 'sphere' ? '🔮' :
                 selectedObject.type === 'cylinder' ? '🔶' :
                 selectedObject.type === 'pyramid' ? '🔺' :
                 selectedObject.type === 'icosahedron' ? '🔶' :
                 selectedObject.type === 'torus' ? '🔄' : 
                 selectedObject.type === 'dodecahedronRing' ? '🔷' :
                 selectedObject.type === 'spiral' ? '🌀' : '❓'}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-300">
              {selectedObject.type === 'cone' ? 'MembraneSynth' :
               selectedObject.type === 'cube' ? 'Síntesis AM' :
               selectedObject.type === 'sphere' ? 'Síntesis FM' :
               selectedObject.type === 'cylinder' ? 'DuoSynth' :
               selectedObject.type === 'pyramid' ? 'MonoSynth' :
               selectedObject.type === 'icosahedron' ? 'MetalSynth' :
               selectedObject.type === 'plane' ? 'NoiseSynth' :
               selectedObject.type === 'torus' ? 'PluckSynth' : 
               selectedObject.type === 'dodecahedronRing' ? 'PolySynth' :
               selectedObject.type === 'spiral' ? 'Sampler' : 'Objeto de Sonido'}
            </span>
            

            
                         {/* Texto informativo específico para cada tipo */}
             {selectedObject.type === 'pyramid' ? (
               <div className="mt-2">
                 <p className="text-xs text-gray-400 mt-1">
                   {selectedObject.audioParams.duration === Infinity 
                     ? 'Haz clic para activar/desactivar el sonido continuo'
                     : 'Mantén presionado el clic sobre el objeto para tocar (gate)'
                   }
                 </p>
               </div>
             ) : selectedObject.type === 'icosahedron' ? (
               <div className="mt-2">
                 <p className="text-xs text-gray-400 mt-1">
                   Haz clic en el objeto para tocar
                 </p>
                 <p className="text-xs text-gray-400 mt-1">
                   Sonido percusivo metálico
                 </p>
               </div>
             ) : selectedObject.type === 'plane' ? (
               <div className="mt-2">
                 <p className="text-xs text-gray-400 mt-1">
                   Haz clic en el objeto para tocar
                 </p>
                 <p className="text-xs text-gray-400 mt-1">
                   Generador de ruido percusivo
                 </p>
               </div>
             ) : selectedObject.type === 'torus' ? (
               <div className="mt-2">
                 <p className="text-xs text-gray-400 mt-1">
                   Haz clic en el objeto para tocar
                 </p>
                 <p className="text-xs text-gray-400 mt-1">
                   Instrumento de cuerdas percusivo
                 </p>
               </div>
             ) : selectedObject.type === 'dodecahedronRing' ? (
               <div className="mt-2">
                 <p className="text-xs text-gray-400 mt-1">
                   Haz clic para activar/desactivar el acorde continuo
                 </p>
                 <p className="text-xs text-gray-400 mt-1">
                   Instrumento polifónico para acordes
                 </p>
               </div>
             ) : selectedObject.type === 'spiral' ? (
               <div className="mt-2">
                 <p className="text-xs text-gray-400 mt-1">
                   Haz clic en el objeto para tocar
                 </p>
                 <p className="text-xs text-gray-400 mt-1">
                   Sampler percusivo polifónico
                 </p>
               </div>
             ) : (
              <div className="mt-2">
                <p className="text-xs text-gray-400 mt-1">
                  Control de Sonido Continuo
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Duración: {(selectedObject.audioParams.duration || 1.0).toFixed(1)}s
                </p>
              </div>
            )}
            
            {/* Botón de activación/desactivación de audio */}
            <div className="mt-4">
                             <button
                 onClick={() => {
                   const { toggleObjectAudio } = useWorldStore.getState();
                   toggleObjectAudio(selectedObject.id);
                 }}
                 className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                   selectedObject.audioEnabled
                     ? 'bg-red-600 hover:bg-red-700 text-white'
                     : 'bg-green-600 hover:bg-green-700 text-white'
                 }`}
               >
                 {selectedObject.audioEnabled ? '🔇 Desactivar Sonido Continuo' : '🔊 Activar Sonido Continuo'}
               </button>
               <p className="text-xs text-gray-400 mt-1 text-center">
                 {selectedObject.audioEnabled 
                   ? 'Sonido continuo activado. Haz clic para desactivar.'
                   : 'Sonido continuo desactivado. Haz clic para activar.'
                 }
               </p>
              <p className="text-xs text-blue-400 mt-2 text-center">
                💡 El botón controla el sonido continuo. Para sonidos cortos, haz clic en el objeto 3D.
              </p>
            </div>
          </div>
        </div>

                {/* Controles de parámetros */}
        <div className="space-y-4">
          {/* Frecuencia - Para todos los objetos excepto spiral */}
          {selectedObject.type !== 'spiral' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {selectedObject.type === 'cone' ? 'Frecuencia (Tono)' : 'Frecuencia (Hz)'}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={selectedObject.type === 'cone' ? '20' : selectedObject.type === 'icosahedron' ? '50' : selectedObject.type === 'dodecahedronRing' ? '55' : '20'}
                  max={selectedObject.type === 'cone' ? '200' : selectedObject.type === 'icosahedron' ? '1200' : selectedObject.type === 'dodecahedronRing' ? '880' : '2000'}
                  step="1"
                  value={selectedObject.audioParams.frequency}
                  onChange={(e) => handleParamChange('frequency', Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                  {selectedObject.audioParams.frequency}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{selectedObject.type === 'cone' ? '20 Hz' : selectedObject.type === 'icosahedron' ? '50 Hz' : selectedObject.type === 'dodecahedronRing' ? '55 Hz (A1)' : '20 Hz'}</span>
                <span>{selectedObject.type === 'cone' ? '200 Hz' : selectedObject.type === 'icosahedron' ? '1200 Hz' : selectedObject.type === 'dodecahedronRing' ? '880 Hz (A5)' : '2000 Hz'}</span>
              </div>
              {selectedObject.type === 'dodecahedronRing' && (
                <p className="text-xs text-pink-400 mt-1">
                  💡 La frecuencia base transpone el acorde completo
                </p>
              )}
            </div>
          )}

          {/* Forma de Onda (Portadora) - Para todos los objetos excepto spiral */}
          {selectedObject.type !== 'spiral' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Forma de Onda
              </label>
              <select
                value={selectedObject.audioParams.waveform}
                onChange={(e) => handleParamChange('waveform', e.target.value as OscillatorType)}
                className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
              >
                <option value="sine">Seno</option>
                <option value="square">Cuadrada</option>
                <option value="sawtooth">Sierra</option>
                <option value="triangle">Triangular</option>
              </select>
            </div>
          )}

                                                      {/* Duración - Para todos los objetos excepto spiral */}
                                                      {selectedObject.type !== 'spiral' && (
                                                        <div>
                                                          <label className="block text-sm font-medium text-gray-300 mb-2">
                                                            Duración (segundos)
                                                          </label>
                                                          <div className="flex items-center gap-3">
                                                            <input
                                                              type="number"
                                                              min="0.1"
                                                              max="60"
                                                              step="0.1"
                                                              value={selectedObject.audioParams.duration === Infinity ? '' : (selectedObject.audioParams.duration || 1.0)}
                                                              onChange={(e) => {
                                                                const value = e.target.value;
                                                                if (value === '') {
                                                                  handleParamChange('duration', Infinity);
                                                                } else {
                                                                  handleParamChange('duration', Number(value));
                                                                }
                                                              }}
                                                              placeholder="1.0"
                                                              className="flex-1 p-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors font-mono"
                                                            />

                                                            <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                                                              {selectedObject.audioParams.duration === Infinity ? '∞' : `${(selectedObject.audioParams.duration || 1.0).toFixed(1)}s`}
                                                            </span>
                                                          </div>
                                                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                                                            <span>0.1s</span>
                                                            <span>60s</span>
                                                          </div>
                                                          <p className="text-xs text-gray-400 mt-1">
                                                            {selectedObject.audioParams.duration === Infinity 
                                                              ? 'Sonido continuo - usa el botón "Activar Sonido Continuo" para controlar'
                                                              : 'Sonido con duración finita - se detiene automáticamente'
                                                            }
                                                          </p>
                                                        </div>
                                                      )}

          {/* Controles específicos para MembraneSynth (cono) */}
          {selectedObject.type === 'cone' && (
            <>
              {/* Pitch Decay */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Pitch Decay (Caída de Tono)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0.01"
                    max="0.5"
                    step="0.01"
                    value={selectedObject.audioParams.pitchDecay || 0.05}
                    onChange={(e) => handleParamChange('pitchDecay', Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                    {(selectedObject.audioParams.pitchDecay || 0.05).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0.01</span>
                  <span>0.5</span>
                </div>
              </div>

              {/* Octaves */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Octaves (Impacto)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0.5"
                    max="20"
                    step="0.1"
                    value={selectedObject.audioParams.octaves || 10}
                    onChange={(e) => handleParamChange('octaves', Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                    {(selectedObject.audioParams.octaves || 10).toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0.5</span>
                  <span>20</span>
                </div>
              </div>
            </>
          )}

          {/* Controles específicos para AMSynth (cubo) */}
          {selectedObject.type === 'cube' && (
            <>
              {/* Harmonicity */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Harmonicity
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0.1"
                    max="10"
                    step="0.1"
                    value={selectedObject.audioParams.harmonicity || 1.5}
                    onChange={(e) => handleParamChange('harmonicity', Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                    {selectedObject.audioParams.harmonicity || 1.5}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0.1</span>
                  <span>10</span>
                </div>
              </div>

              {/* Forma de Onda (Moduladora) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Forma de Onda (Moduladora)
                </label>
                <select
                  value={selectedObject.audioParams.modulationWaveform || 'square'}
                  onChange={(e) => handleParamChange('modulationWaveform', e.target.value as OscillatorType)}
                  className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                >
                  <option value="sine">Seno</option>
                  <option value="square">Cuadrada</option>
                  <option value="sawtooth">Sierra</option>
                  <option value="triangle">Triangular</option>
                </select>
              </div>
            </>
          )}

          {/* Controles específicos para FMSynth (esfera) */}
          {selectedObject.type === 'sphere' && (
            <>
              {/* Harmonicity */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Harmonicity
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0.5"
                    max="8"
                    step="0.01"
                    value={selectedObject.audioParams.harmonicity || 2}
                    onChange={(e) => handleParamChange('harmonicity', Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                    {selectedObject.audioParams.harmonicity || 2}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0.5</span>
                  <span>8</span>
                </div>
              </div>

              {/* Modulation Index (Timbre) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Modulation Index (Timbre)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="40"
                    step="0.1"
                    value={selectedObject.audioParams.modulationIndex || 10}
                    onChange={(e) => handleParamChange('modulationIndex', Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                    {selectedObject.audioParams.modulationIndex || 10}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span>40</span>
                </div>
              </div>

              {/* Forma de Onda (Moduladora) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Forma de Onda (Moduladora)
                </label>
                <select
                  value={selectedObject.audioParams.modulationWaveform || 'sine'}
                  onChange={(e) => handleParamChange('modulationWaveform', e.target.value as OscillatorType)}
                  className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                >
                  <option value="sine">Seno</option>
                  <option value="square">Cuadrada</option>
                  <option value="sawtooth">Sierra</option>
                  <option value="triangle">Triangular</option>
                </select>
              </div>
            </>
          )}

          {/* Controles específicos para DuoSynth (cilindro) */}
          {selectedObject.type === 'cylinder' && (
            <>
              {/* Harmonicity (Desafinación) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Harmonicity (Desafinación)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0.5"
                    max="4"
                    step="0.01"
                    value={selectedObject.audioParams.harmonicity || 1.5}
                    onChange={(e) => handleParamChange('harmonicity', Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                    {selectedObject.audioParams.harmonicity || 1.5}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0.5</span>
                  <span>4</span>
                </div>
              </div>

              {/* Velocidad de Vibrato */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Velocidad de Vibrato
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="0.1"
                    value={selectedObject.audioParams.vibratoRate || 5}
                    onChange={(e) => handleParamChange('vibratoRate', Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                    {selectedObject.audioParams.vibratoRate || 5}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1 Hz</span>
                  <span>20 Hz</span>
                </div>
              </div>

              {/* Cantidad de Vibrato */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cantidad de Vibrato
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={selectedObject.audioParams.vibratoAmount || 0.2}
                    onChange={(e) => handleParamChange('vibratoAmount', Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                    {Math.round((selectedObject.audioParams.vibratoAmount || 0.2) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Forma de Onda (Voz 1) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Forma de Onda (Voz 1)
                </label>
                <select
                  value={selectedObject.audioParams.waveform}
                  onChange={(e) => handleParamChange('waveform', e.target.value as OscillatorType)}
                  className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                >
                  <option value="sine">Seno</option>
                  <option value="square">Cuadrada</option>
                  <option value="sawtooth">Sierra</option>
                  <option value="triangle">Triangular</option>
                </select>
              </div>

              {/* Forma de Onda (Voz 2) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Forma de Onda (Voz 2)
                </label>
                <select
                  value={selectedObject.audioParams.waveform2 || 'sine'}
                  onChange={(e) => handleParamChange('waveform2', e.target.value as OscillatorType)}
                  className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                >
                  <option value="sine">Seno</option>
                  <option value="square">Cuadrada</option>
                  <option value="sawtooth">Sierra</option>
                  <option value="triangle">Triangular</option>
                </select>
              </div>
            </>
          )}

          {/* Controles específicos para MonoSynth (pirámide) */}
          {selectedObject.type === 'pyramid' && (
            <>
              {/* Sección: Envolvente de Amplitud */}
              <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-600">
                <h4 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2">
                  🔺 Envolvente de Amplitud
                </h4>
                
                {/* Amp Attack */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Attack (Ataque)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0.001"
                      max="2"
                      step="0.001"
                      value={selectedObject.audioParams.ampAttack || 0.01}
                      onChange={(e) => handleParamChange('ampAttack', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                      {(selectedObject.audioParams.ampAttack || 0.01).toFixed(3)}s
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.001s</span>
                    <span>2s</span>
                  </div>
                </div>

                {/* Amp Decay */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Decay (Caída)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0.01"
                      max="2"
                      step="0.01"
                      value={selectedObject.audioParams.ampDecay || 0.2}
                      onChange={(e) => handleParamChange('ampDecay', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                      {(selectedObject.audioParams.ampDecay || 0.2).toFixed(2)}s
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.01s</span>
                    <span>2s</span>
                  </div>
                </div>

                {/* Amp Sustain */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sustain (Sostenido)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={selectedObject.audioParams.ampSustain || 0.1}
                      onChange={(e) => handleParamChange('ampSustain', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                      {Math.round((selectedObject.audioParams.ampSustain || 0.1) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Amp Release */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Release (Liberación)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0.01"
                      max="4"
                      step="0.01"
                      value={selectedObject.audioParams.ampRelease || 0.5}
                      onChange={(e) => handleParamChange('ampRelease', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                      {(selectedObject.audioParams.ampRelease || 0.5).toFixed(2)}s
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.01s</span>
                    <span>4s</span>
                  </div>
                </div>
              </div>

              {/* Sección: Envolvente de Filtro */}
              <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-600">
                <h4 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                  🎛️ Envolvente de Filtro
                </h4>
                
                {/* Filter Attack */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Filter Attack
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0.001"
                      max="1"
                      step="0.001"
                      value={selectedObject.audioParams.filterAttack || 0.005}
                      onChange={(e) => handleParamChange('filterAttack', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                      {(selectedObject.audioParams.filterAttack || 0.005).toFixed(3)}s
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.001s</span>
                    <span>1s</span>
                  </div>
                </div>

                {/* Filter Decay */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Filter Decay
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0.01"
                      max="2"
                      step="0.01"
                      value={selectedObject.audioParams.filterDecay || 0.1}
                      onChange={(e) => handleParamChange('filterDecay', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                      {(selectedObject.audioParams.filterDecay || 0.1).toFixed(2)}s
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.01s</span>
                    <span>2s</span>
                  </div>
                </div>

                {/* Filter Sustain */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Filter Sustain
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={selectedObject.audioParams.filterSustain || 0.05}
                      onChange={(e) => handleParamChange('filterSustain', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                      {Math.round((selectedObject.audioParams.filterSustain || 0.05) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Filter Release */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Filter Release
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0.01"
                      max="2"
                      step="0.01"
                      value={selectedObject.audioParams.filterRelease || 0.2}
                      onChange={(e) => handleParamChange('filterRelease', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                      {(selectedObject.audioParams.filterRelease || 0.2).toFixed(2)}s
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.01s</span>
                    <span>2s</span>
                  </div>
                </div>

                {/* Filter Base Frequency */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Frec. Base del Filtro
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="20"
                      max="2000"
                      step="1"
                      value={selectedObject.audioParams.filterBaseFreq || 200}
                      onChange={(e) => handleParamChange('filterBaseFreq', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                      {selectedObject.audioParams.filterBaseFreq || 200}Hz
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>20 Hz</span>
                    <span>2000 Hz</span>
                  </div>
                </div>

                {/* Filter Octaves */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Octavas del Filtro
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0.5"
                      max="8"
                      step="0.1"
                      value={selectedObject.audioParams.filterOctaves || 4}
                      onChange={(e) => handleParamChange('filterOctaves', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                      {(selectedObject.audioParams.filterOctaves || 4).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.5</span>
                    <span>8</span>
                  </div>
                </div>

                {/* Filter Q (Resonancia) */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Resonancia (Q)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0.1"
                      max="10"
                      step="0.1"
                      value={selectedObject.audioParams.filterQ || 2}
                      onChange={(e) => handleParamChange('filterQ', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                      {(selectedObject.audioParams.filterQ || 2).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.1</span>
                    <span>10</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Controles específicos para MetalSynth (icosaedro) */}
          {selectedObject.type === 'icosahedron' && (
            <>
              {/* Sección: Parámetros del MetalSynth */}
              <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-600">
                <h4 className="text-sm font-semibold text-indigo-400 mb-3 flex items-center gap-2">
                  🔶 Parámetros del MetalSynth
                </h4>
                
                {/* Harmonicity */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Harmonicity
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0.1"
                      max="10"
                      step="0.1"
                      value={selectedObject.audioParams.harmonicity || 5.1}
                      onChange={(e) => handleParamChange('harmonicity', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                      {(selectedObject.audioParams.harmonicity || 5.1).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.1</span>
                    <span>10</span>
                  </div>
                </div>

                {/* Modulation Index */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Modulation Index
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max="100"
                      step="1"
                      value={selectedObject.audioParams.modulationIndex || 32}
                      onChange={(e) => handleParamChange('modulationIndex', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                      {selectedObject.audioParams.modulationIndex || 32}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1</span>
                    <span>100</span>
                  </div>
                </div>

                {/* Resonance */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Resonance (Frec. Filtro)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="100"
                      max="7000"
                      step="100"
                      value={selectedObject.audioParams.resonance || 4000}
                      onChange={(e) => handleParamChange('resonance', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                      {selectedObject.audioParams.resonance || 4000}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>100 Hz</span>
                    <span>7000 Hz</span>
                  </div>
                </div>

                {/* Octaves */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Octaves (Barrido de Filtro)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="8"
                      step="0.1"
                      value={selectedObject.audioParams.octaves || 1.5}
                      onChange={(e) => handleParamChange('octaves', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                      {(selectedObject.audioParams.octaves || 1.5).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0</span>
                    <span>8</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Controles específicos para NoiseSynth (plano) */}
          {selectedObject.type === 'plane' && (
            <>
              {/* Sección: Parámetros del NoiseSynth */}
              <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-600">
                <h4 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2">
                  🟦 Parámetros del NoiseSynth
                </h4>
                
                {/* Tipo de Ruido */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo de Ruido
                  </label>
                  <select
                    value={selectedObject.audioParams.noiseType || 'white'}
                    onChange={(e) => handleParamChange('noiseType', e.target.value as 'white' | 'pink' | 'brown')}
                    className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    <option value="white">Blanco (Ruido completo)</option>
                    <option value="pink">Rosa (Ruido suave)</option>
                    <option value="brown">Marrón (Ruido bajo)</option>
                  </select>
                </div>

                {/* Duración del Golpe */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duración del Golpe (segundos)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0.01"
                      max="1"
                      step="0.01"
                      value={selectedObject.audioParams.duration || 0.1}
                      onChange={(e) => handleParamChange('duration', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                      {(selectedObject.audioParams.duration || 0.1).toFixed(2)}s
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.01s</span>
                    <span>1s</span>
                  </div>
                </div>

                {/* Attack */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Attack (Ataque)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0.001"
                      max="0.5"
                      step="0.001"
                      value={selectedObject.audioParams.attack || 0.001}
                      onChange={(e) => handleParamChange('attack', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                      {(selectedObject.audioParams.attack || 0.001).toFixed(3)}s
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.001s</span>
                    <span>0.5s</span>
                  </div>
                </div>

                {/* Decay */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Decay (Caída)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0.01"
                      max="1"
                      step="0.01"
                      value={selectedObject.audioParams.decay || 0.1}
                      onChange={(e) => handleParamChange('decay', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                      {(selectedObject.audioParams.decay || 0.1).toFixed(2)}s
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.01s</span>
                    <span>1s</span>
                  </div>
                </div>

                {/* Sustain */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sustain (Sostenido)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={selectedObject.audioParams.sustain || 0}
                      onChange={(e) => handleParamChange('sustain', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                      {Math.round((selectedObject.audioParams.sustain || 0) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Controles específicos para PluckSynth (torus) */}
          {selectedObject.type === 'torus' && (
            <>
              {/* Sección: Parámetros del PluckSynth */}
              <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-600">
                <h4 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                  🔄 Parámetros del PluckSynth
                </h4>
                
                {/* Attack Noise */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Attack Noise (Ruido de Ataque)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0.1"
                      max="20"
                      step="0.1"
                      value={selectedObject.audioParams.attackNoise || 1}
                      onChange={(e) => handleParamChange('attackNoise', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                      {(selectedObject.audioParams.attackNoise || 1).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.1</span>
                    <span>20</span>
                  </div>
                </div>

                {/* Dampening */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Dampening (Amortiguación)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="500"
                      max="7000"
                      step="100"
                      value={selectedObject.audioParams.dampening || 4000}
                      onChange={(e) => handleParamChange('dampening', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                      {selectedObject.audioParams.dampening || 4000}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>500</span>
                    <span>7000</span>
                  </div>
                </div>

                {/* Resonance */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Resonance (Sustain)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="0.99"
                      step="0.01"
                      value={selectedObject.audioParams.resonance || 0.9}
                      onChange={(e) => handleParamChange('resonance', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                      {Math.round((selectedObject.audioParams.resonance || 0.9) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>99%</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Controles específicos para PolySynth (dodecahedronRing) */}
          {selectedObject.type === 'dodecahedronRing' && (
            <>
              {/* Sección: Parámetros del PolySynth */}
              <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-600">
                <h4 className="text-sm font-semibold text-pink-400 mb-3 flex items-center gap-2">
                  🔷 Parámetros del PolySynth
                </h4>
                
                {/* Polifonía */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Polifonía (Número de Voces)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max="8"
                      step="1"
                      value={selectedObject.audioParams.polyphony || 4}
                      onChange={(e) => handleParamChange('polyphony', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                      {selectedObject.audioParams.polyphony || 4}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1</span>
                    <span>8</span>
                  </div>
                </div>

                {/* Tipo de Acorde */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo de Acorde
                  </label>
                  <select
                    value={JSON.stringify(selectedObject.audioParams.chord || ["C4", "E4", "G4"])}
                    onChange={(e) => {
                      const chordMap: { [key: string]: string[] } = {
                        '["C4","E4","G4"]': ["C4", "E4", "G4"], // Mayor
                        '["C4","Eb4","G4"]': ["C4", "Eb4", "G4"], // Menor
                        '["C4","E4","G4","B4"]': ["C4", "E4", "G4", "B4"], // Mayor 7
                        '["C4","Eb4","G4","Bb4"]': ["C4", "Eb4", "G4", "Bb4"], // Menor 7
                        '["C4","F4","G4"]': ["C4", "F4", "G4"], // Suspendido 2
                        '["C4","D4","G4"]': ["C4", "D4", "G4"], // Suspendido 4
                        '["C4","E4","G4","Bb4"]': ["C4", "E4", "G4", "Bb4"], // Dominante 7
                      };
                      const selectedChord = chordMap[e.target.value] || ["C4", "E4", "G4"];
                      handleParamChange('chord', selectedChord);
                    }}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value='["C4","E4","G4"]'>Mayor (C-E-G)</option>
                    <option value='["C4","Eb4","G4"]'>Menor (C-Eb-G)</option>
                    <option value='["C4","E4","G4","B4"]'>Mayor 7 (C-E-G-B)</option>
                    <option value='["C4","Eb4","G4","Bb4"]'>Menor 7 (C-Eb-G-Bb)</option>
                    <option value='["C4","F4","G4"]'>Suspendido 2 (C-F-G)</option>
                    <option value='["C4","D4","G4"]'>Suspendido 4 (C-D-G)</option>
                    <option value='["C4","E4","G4","Bb4"]'>Dominante 7 (C-E-G-Bb)</option>
                  </select>
                </div>

                {/* Attack */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Attack (Ataque)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0.1"
                      max="3.0"
                      step="0.1"
                      value={selectedObject.audioParams.attack || 1.5}
                      onChange={(e) => handleParamChange('attack', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                      {(selectedObject.audioParams.attack || 1.5).toFixed(1)}s
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.1s</span>
                    <span>3.0s</span>
                  </div>
                </div>

                {/* Release */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Release (Liberación)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0.5"
                      max="4.0"
                      step="0.1"
                      value={selectedObject.audioParams.release || 2.0}
                      onChange={(e) => handleParamChange('release', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                      {(selectedObject.audioParams.release || 2.0).toFixed(1)}s
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.5s</span>
                    <span>4.0s</span>
                  </div>
                </div>

                {/* Harmonicity */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Harmonicity (Armonicidad)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0.1"
                      max="4.0"
                      step="0.1"
                      value={selectedObject.audioParams.harmonicity || 1}
                      onChange={(e) => handleParamChange('harmonicity', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                      {(selectedObject.audioParams.harmonicity || 1).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.1</span>
                    <span>4.0</span>
                  </div>
                </div>

                {/* Modulation Index */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Modulation Index (Índice de Modulación)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0.1"
                      max="10.0"
                      step="0.1"
                      value={selectedObject.audioParams.modulationIndex || 2}
                      onChange={(e) => handleParamChange('modulationIndex', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                      {(selectedObject.audioParams.modulationIndex || 2).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.1</span>
                    <span>10.0</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Controles específicos para Sampler (spiral) */}
          {selectedObject.type === 'spiral' && (
            <>
              {/* Sección: Parámetros del Sampler */}
              <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-600">
                <h4 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                  🌀 Parámetros del Sampler
                </h4>
                
                {/* Attack */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Attack (Ataque)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={selectedObject.audioParams.attack || 0.1}
                      onChange={(e) => handleParamChange('attack', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                      {(selectedObject.audioParams.attack || 0.1).toFixed(2)}s
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0s</span>
                    <span>1s</span>
                  </div>
                </div>

                {/* Release */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Release (Liberación)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.01"
                      value={selectedObject.audioParams.release || 1.0}
                      onChange={(e) => handleParamChange('release', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                      {(selectedObject.audioParams.release || 1.0).toFixed(2)}s
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0s</span>
                    <span>2s</span>
                  </div>
                </div>

                {/* Curva de Envolvente */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Curva de Envolvente
                  </label>
                  <select
                    value={selectedObject.audioParams.curve || 'exponential'}
                    onChange={(e) => handleParamChange('curve', e.target.value as 'linear' | 'exponential')}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="linear">Linear</option>
                    <option value="exponential">Exponencial</option>
                  </select>
                </div>

                {/* Set de Samples */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Set de Samples
                  </label>
                  <select
                    value={selectedObject.audioParams.baseUrl || '/samples/piano/'}
                    onChange={(e) => {
                      const baseUrl = e.target.value;
                      const urlMap: { [key: string]: Record<string, string> } = {
                        '/samples/piano/': {
                          C4: "C4.mp3",
                          "D#4": "Ds4.mp3",
                          "F#4": "Fs4.mp3",
                          A4: "A4.mp3",
                        },
                        '/samples/guitar/': {
                          C4: "guitar_C4.mp3",
                          "D#4": "guitar_Ds4.mp3",
                          "F#4": "guitar_Fs4.mp3",
                          A4: "guitar_A4.mp3",
                        },
                        '/samples/synth/': {
                          C4: "synth_C4.mp3",
                          "D#4": "synth_Ds4.mp3",
                          "F#4": "synth_Fs4.mp3",
                          A4: "synth_A4.mp3",
                        }
                      };
                      const urls = urlMap[baseUrl] || urlMap['/samples/piano/'];
                      handleParamChange('baseUrl', baseUrl);
                      handleParamChange('urls', urls);
                    }}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="/samples/piano/">Piano</option>
                    <option value="/samples/guitar/">Guitarra</option>
                    <option value="/samples/synth/">Sintetizador</option>
                  </select>
                </div>

                {/* Mensaje informativo */}
                <div className="p-3 bg-cyan-900/20 border border-cyan-700/50 rounded-lg">
                  <p className="text-xs text-cyan-300 text-center">
                    💡 Haz clic en el objeto para tocar el sample
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Volumen - Movido al final */}
           <div>
             <label className="block text-sm font-medium text-gray-300 mb-2">
               Volumen
             </label>
             <div className="flex items-center gap-3">
               <input
                 type="range"
                 min="0"
                 max="100"
                 step="1"
                 value={Math.round(selectedObject.audioParams.volume * 100)}
                 onChange={(e) => {
                   const percentage = Number(e.target.value);
                   const actualValue = percentage / 100; // Convertir de 0-100 a 0-1
                   handleParamChange('volume', actualValue);
                 }}
                 className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
               />
               <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                 {Math.round(selectedObject.audioParams.volume * 100)}%
               </span>
             </div>
             <div className="flex justify-between text-xs text-gray-500 mt-1">
               <span>0%</span>
               <span>100%</span>
             </div>
           </div>
        </div>

        {/* Información adicional */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-400 text-center">
            Los cambios se aplican en tiempo real
          </p>
        </div>
      </div>
    </div>
  );
}
