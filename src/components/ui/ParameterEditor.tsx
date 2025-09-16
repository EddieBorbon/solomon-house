'use client';

import { useWorldStore, type EffectZone, type SoundObject } from '../../state/useWorldStore';
import { useMemo } from 'react';
import { type AudioParams } from '../../lib/AudioManager';
import React from 'react';
import { MobileObjectEditor } from './MobileObjectEditor';

export function ParameterEditor() {
  const { 
    grids,
    selectedEntityId, 
    updateObject, 
    updateEffectZone, 
    removeObject, 
    removeMobileObject,
    removeEffectZone, 
    toggleLockEffectZone,
    setEditingEffectZone,
    refreshAllEffects,
    debugAudioChain
  } = useWorldStore();

  // Estado para mostrar cuando se están actualizando los parámetros
  const [isUpdatingParams, setIsUpdatingParams] = React.useState(false);
  const [isRefreshingEffects, setIsRefreshingEffects] = React.useState(false);
  const [lastUpdatedParam, setLastUpdatedParam] = React.useState<string | null>(null);

  // Encontrar la entidad seleccionada (objeto sonoro o zona de efecto)
  const selectedEntity = useMemo(() => {
    console.log(`🔍 ParameterEditor - Buscando entidad con ID: ${selectedEntityId}`);
    console.log(`🔍 ParameterEditor - Cuadrículas disponibles:`, Array.from(grids.keys()));
    
    if (!selectedEntityId) {
      console.log(`🔍 ParameterEditor - No hay entidad seleccionada`);
      return null;
    }
    
    // Buscar en todas las cuadrículas
    for (const grid of grids.values()) {
      console.log(`🔍 ParameterEditor - Buscando en cuadrícula ${grid.id}:`, {
        objects: grid.objects.length,
        mobileObjects: grid.mobileObjects.length,
        effectZones: grid.effectZones.length
      });
      
      // Buscar en objetos sonoros
      const soundObject = grid.objects.find(obj => obj.id === selectedEntityId);
      if (soundObject) {
        console.log(`✅ ParameterEditor - Objeto sonoro encontrado:`, soundObject);
        return { type: 'soundObject', data: soundObject };
      }
      
      // Buscar en objetos móviles
      const mobileObject = grid.mobileObjects.find(obj => obj.id === selectedEntityId);
      if (mobileObject) {
        console.log(`✅ ParameterEditor - Objeto móvil encontrado:`, mobileObject);
        return { type: 'mobileObject', data: mobileObject };
      }
      
      // Buscar en zonas de efectos
      const effectZone = grid.effectZones.find(zone => zone.id === selectedEntityId);
      if (effectZone) {
        console.log(`✅ ParameterEditor - Zona de efecto encontrada:`, effectZone);
        return { type: 'effectZone', data: effectZone };
      }
    }
    
    console.log(`❌ ParameterEditor - Entidad ${selectedEntityId} no encontrada en ninguna cuadrícula`);
    return null;
  }, [grids, selectedEntityId]);

  // Efecto para activar/desactivar el estado de edición de zona de efectos
  // NOTA: Este estado ya no bloquea OrbitControls, solo se usa para UI
  React.useEffect(() => {
    if (selectedEntity?.type === 'effectZone') {
      setEditingEffectZone(true);
      console.log('🎛️ Editor de zona de efectos abierto');
    } else {
      setEditingEffectZone(false);
      console.log('🎛️ Editor de zona de efectos cerrado');
    }

    // Cleanup: desactivar el estado cuando se desmonte el componente
    return () => {
      setEditingEffectZone(false);
      console.log('🎛️ Editor de zona de efectos desmontado');
    };
  }, [selectedEntity?.type, setEditingEffectZone]);

  // Función para actualizar un parámetro específico de objeto sonoro
  const handleParamChange = (param: keyof AudioParams, value: number | string | string[] | Record<string, string>) => {
    if (!selectedEntity || selectedEntity.type !== 'soundObject') return;

    const soundObject = selectedEntity.data as { audioParams: AudioParams; [key: string]: unknown };
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
  const handleEffectParamChange = (param: string, value: number | string) => {
    if (!selectedEntity || selectedEntity.type !== 'effectZone') return;

    const effectZone = selectedEntity.data as { effectParams: Record<string, unknown>; [key: string]: unknown };
    console.log(`🎛️ UI: Cambiando parámetro de efecto ${param} a:`, value);

    // Mostrar estado de actualización
    setIsUpdatingParams(true);
    setLastUpdatedParam(param);

    const newEffectParams = {
      ...effectZone.effectParams,
      [param]: value,
    };

    updateEffectZone(effectZone.id, {
      effectParams: newEffectParams,
    });

    console.log(`🎛️ Parámetro de efecto ${param} actualizado a:`, value);

    // Ocultar estado de actualización después de un breve delay
    setTimeout(() => {
      setIsUpdatingParams(false);
      setLastUpdatedParam(null);
    }, 1000);
  };

  // Función para actualizar transformación de la entidad
  const handleTransformChange = (
    property: 'position' | 'rotation' | 'scale',
    axis: 0 | 1 | 2,
    value: number
  ) => {
    if (!selectedEntity) return;

    const newValues = [
      ...selectedEntity.data[property]
    ] as [number, number, number];
    
    newValues[axis] = value;

    if (selectedEntity.type === 'soundObject') {
      updateObject(selectedEntity.data.id, {
        [property]: newValues
      });
    } else if (selectedEntity.type === 'effectZone') {
      updateEffectZone(selectedEntity.data.id, {
        [property]: newValues
      });
    }
  };

  // Función para resetear transformación
  const resetTransform = () => {
    if (!selectedEntity) return;

    const resetValues = {
      position: [0, 0, 0] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      scale: [1, 1, 1] as [number, number, number]
    };

    if (selectedEntity.type === 'soundObject') {
      updateObject(selectedEntity.data.id, resetValues);
    } else if (selectedEntity.type === 'effectZone') {
      updateEffectZone(selectedEntity.data.id, resetValues);
    }
  };

  // Función para redondear decimales
  const roundToDecimals = (value: number, decimals: number = 2) => {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  };

  // Si no hay entidad seleccionada, mostrar mensaje
  if (!selectedEntity) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-4 max-w-xs max-h-[75vh] overflow-y-auto">
          {/* Efecto de brillo interior */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 rounded-2xl pointer-events-none"></div>
          
          <div className="text-center relative z-10">
            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-cyan-500/20 to-black/40 rounded-full flex items-center justify-center border border-cyan-400/30">
              <span className="text-lg">🎯</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              No hay entidad seleccionada
            </h3>
            <p className="text-cyan-300 text-sm">
              Haz clic en un objeto sonoro o zona de efecto en el mundo 3D para seleccionarlo y editar sus parámetros.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar controles según el tipo de entidad seleccionada
  if (selectedEntity.type === 'mobileObject') {
    const mobileObject = selectedEntity.data as { mobileParams: Record<string, unknown>; [key: string]: unknown };
    
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg border border-gray-700 shadow-2xl p-6 max-w-sm max-h-[90vh] overflow-y-auto">
          {/* Header con información del objeto móvil */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-gradient-to-br from-purple-500 to-pink-500" />
                <h3 className="text-lg font-semibold text-white">
                  Editor de Objeto Móvil
                </h3>
              </div>
              <button
                onClick={() => {
                  if (confirm('¿Estás seguro de que quieres eliminar este objeto móvil?')) {
                    removeMobileObject(mobileObject.id);
                  }
                }}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors duration-200"
                title="Eliminar objeto móvil"
              >
                🗑️
              </button>
            </div>
            <div className="text-sm text-gray-400">
              <p>Tipo: <span className="text-white">Objeto Móvil</span></p>
              <p>ID: <span className="text-white font-mono text-xs">{mobileObject.id.slice(0, 8)}...</span></p>
            </div>
          </div>

          {/* Contenido del editor de objeto móvil */}
          <MobileObjectEditor mobileObject={mobileObject} />
        </div>
      </div>
    );
  }
  
  if (selectedEntity.type === 'effectZone') {
    const zone = selectedEntity.data as EffectZone; // Type assertion para zona de efecto
    
    // Asegurar que effectParams existe
    if (!zone.effectParams) {
      zone.effectParams = {};
    }
    
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-4 max-w-xs max-h-[75vh] overflow-y-auto">
          {/* Efecto de brillo interior */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 rounded-2xl pointer-events-none"></div>
          {/* Header con información de la zona de efecto */}
          <div className="mb-4 relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-gradient-to-br from-black to-pink-500 shadow-lg shadow-black/50" />
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
                className="px-3 py-2 bg-gradient-to-r from-red-600/80 to-red-700/80 hover:from-red-500/90 hover:to-red-600/90 text-white text-sm rounded-xl hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 border border-red-400/30 hover:border-red-300/50"
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

          {/* Botón de refrescar efectos */}
          <div className="mb-6 p-4 bg-blue-900/20 border border-blue-600/50 rounded-lg">
            <div className="text-center">
              <button
                onClick={() => {
                  // Forzar la actualización de todos los efectos
                  console.log('🔄 Forzando actualización de todos los efectos...');
                  setIsRefreshingEffects(true);
                  refreshAllEffects();
                  
                  // Ocultar estado después de un delay
                  setTimeout(() => {
                    setIsRefreshingEffects(false);
                  }, 1000);
                }}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refrescar todos los efectos para asegurar que los cambios se apliquen"
                disabled={isRefreshingEffects}
              >
                {isRefreshingEffects ? '🔄 Refrescando...' : '🔄 Refrescar Efectos'}
              </button>
              <p className="text-xs text-blue-400 mt-1 text-center">
                Fuerza la actualización de todos los efectos para asegurar que los cambios se apliquen en tiempo real
              </p>
            </div>
          </div>

          {/* Botón de debug de cadena de audio */}
          {selectedEntity && selectedEntity.type === 'soundObject' && (
            <div className="mb-6 p-4 bg-purple-900/20 border border-purple-600/50 rounded-lg">
              <div className="text-center">
                <button
                  onClick={() => debugAudioChain(selectedEntity.data.id)}
                  className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200"
                  title="Debug de la cadena de audio para este objeto sonoro"
                >
                  🔍 Debug Cadena de Audio
                </button>
                <p className="text-xs text-purple-400 mt-1 text-center">
                  Verifica el estado completo de la cadena de audio en la consola
                </p>
              </div>
            </div>
          )}

          {/* Controles de parámetros del efecto */}
          <div className="space-y-4">
                              <h4 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
                    zone.type === 'phaser' ? 'text-purple-400' : 
                    zone.type === 'autoFilter' ? 'text-green-400' : 
                    zone.type === 'autoWah' ? 'text-orange-400' : 
                    zone.type === 'bitCrusher' ? 'text-red-400' : 
                    zone.type === 'chebyshev' ? 'text-indigo-400' : 'text-teal-400'
                  }`}>
                    🎛️ Parámetros del {zone.type === 'phaser' ? 'Phaser' : zone.type === 'autoFilter' ? 'AutoFilter' : zone.type === 'autoWah' ? 'AutoWah' : zone.type === 'bitCrusher' ? 'BitCrusher' : zone.type === 'chebyshev' ? 'Chebyshev' : 'Chorus'}
                    {isUpdatingParams && (
                      <span className="text-yellow-400 animate-pulse">🔄</span>
                    )}
                  </h4>

                  {/* Control de Radio de la Zona de Efectos */}
                  <div className="glass-container p-4">
                    <label className="block text-sm font-bold neon-text mb-3">
                      Radio de la Zona: {zone.effectParams.radius ?? 2.0}
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 relative">
                        <input
                          type="range"
                          min="0.5"
                          max="10"
                          step="0.1"
                          value={zone.effectParams.radius ?? 2.0}
                          onChange={(e) => handleEffectParamChange('radius', Number(e.target.value))}
                          className="w-full h-2 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone.isLocked}
                          style={{
                            background: `linear-gradient(to right, #8b5cf6 0%, #06b6d4 ${((zone.effectParams.radius ?? 2.0) - 0.5) / 9.5 * 100}%, #1f2937 ${((zone.effectParams.radius ?? 2.0) - 0.5) / 9.5 * 100}%, #1f2937 100%)`
                          }}
                        />
                      </div>
                      <span className="text-cyan-300 font-mono text-sm min-w-[4rem] text-right bg-black/60 px-2 py-1 rounded-lg border border-cyan-500/30">
                        {zone.effectParams.radius ?? 2.0}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-purple-300 mt-2">
                      <span>0.5</span>
                      <span>10</span>
                    </div>
                    <p className="text-xs text-cyan-300 mt-2 bg-black/40 px-2 py-1 rounded-lg border border-cyan-500/20">
                      Tamaño de la zona donde se aplica el efecto
                    </p>
                  </div>
                  
                  {/* Indicador de parámetro actualizado */}
                  {lastUpdatedParam && (
                    <div className="mb-3 p-2 bg-green-900/20 border border-green-600/50 rounded-lg">
                      <p className="text-xs text-green-400 text-center">
                        ✅ Parámetro <strong>{lastUpdatedParam}</strong> actualizado en tiempo real
                      </p>
                    </div>
                  )}
                  
                  {/* Indicador de estado del efecto */}
                  <div className="mb-3 p-2 bg-blue-900/20 border border-blue-600/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-blue-400">
                        🎵 Efecto <strong>{zone.type}</strong> activo
                      </span>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-400">En tiempo real</span>
                      </div>
                    </div>
                  </div>
            
            {/* Frecuencia de modulación */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Frecuencia de Modulación (Hz)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={zone.effectParams.frequency ?? 1}
                  onChange={(e) => handleEffectParamChange('frequency', Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  disabled={zone.isLocked}
                />
                <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                  {zone.effectParams.frequency ?? 1}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0.1 Hz</span>
                <span>10 Hz</span>
              </div>
            </div>

            {/* Octavas */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Octavas
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0.1"
                  max="8"
                  step="0.1"
                  value={zone.effectParams.octaves ?? 2}
                  onChange={(e) => handleEffectParamChange('octaves', Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  disabled={zone.isLocked}
                />
                <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                  {zone.effectParams.octaves ?? 2}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0.1</span>
                <span>8</span>
              </div>
            </div>

            {/* Frecuencia base */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Frecuencia Base (Hz)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="20"
                  max="20000"
                  step="10"
                  value={zone.effectParams.baseFrequency ?? 200}
                  onChange={(e) => handleEffectParamChange('baseFrequency', Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  disabled={zone.isLocked}
                />
                <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                  {zone.effectParams.baseFrequency ?? 200}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>20 Hz</span>
                <span>20 kHz</span>
              </div>
            </div>

            {/* Parámetros específicos del AutoFilter */}
            {zone.type === 'autoFilter' && (
              <>
                {/* Depth */}
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Profundidad de Modulación
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={zone.effectParams.depth ?? 0.5}
                      onChange={(e) => handleEffectParamChange('depth', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      disabled={zone.isLocked}
                    />
                    <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                      {zone.effectParams.depth ?? 0.5}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0</span>
                    <span>1</span>
                  </div>
                </div>

                {/* Filter Type */}
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Tipo de Filtro
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['lowpass', 'highpass', 'bandpass', 'notch'] as const).map((filterType) => (
                      <button
                        key={filterType}
                        onClick={() => handleEffectParamChange('filterType', filterType)}
                        disabled={zone.isLocked}
                        className={`px-2 py-1 text-xs rounded-md transition-colors ${
                          (zone.effectParams.filterType ?? 'lowpass') === filterType
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
                        }`}
                      >
                        <span className="capitalize">{filterType}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filter Q */}
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Resonancia (Q)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0.1"
                      max="10"
                      step="0.1"
                      value={zone.effectParams.filterQ ?? 1}
                      onChange={(e) => handleEffectParamChange('filterQ', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      disabled={zone.isLocked}
                    />
                    <span className="text-white font-mono text-sm min-w-[4rem] text-right">
                      {zone.effectParams.filterQ ?? 1}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.1</span>
                    <span>10</span>
                  </div>
                </div>

                {/* LFO Type */}
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Tipo de LFO
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['sine', 'square', 'triangle', 'sawtooth'] as const).map((lfoType) => (
                      <button
                        key={lfoType}
                        onClick={() => handleEffectParamChange('lfoType', lfoType)}
                        disabled={zone.isLocked}
                        className={`px-2 py-1 text-xs rounded-md transition-colors ${
                          (zone.effectParams.lfoType ?? 'sine') === lfoType
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
                        }`}
                      >
                        <span className="capitalize">{lfoType}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

                            {/* Parámetros específicos del AutoWah */}
                {zone.type === 'autoWah' && (
                  <>
                    {/* Sensitivity */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Sensibilidad
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                                                value={zone.effectParams.sensitivity ?? 0.5}
                      onChange={(e) => handleEffectParamChange('sensitivity', Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      disabled={zone.isLocked}
                    />
                                         <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                      {zone.effectParams.sensitivity ?? 0.5}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0</span>
                        <span>1</span>
                      </div>
                    </div>
                  </>
                )}

                {/* Parámetros específicos del BitCrusher */}
                {zone.type === 'bitCrusher' && (
                  <>
                    {/* Bits */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Bits
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="1"
                          max="16"
                          step="1"
                          value={zone.effectParams.bits ?? 4}
                          onChange={(e) => handleEffectParamChange('bits', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                                                     {zone.effectParams.bits ?? 4}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>1</span>
                        <span>16</span>
                      </div>
                    </div>

                    {/* NormFreq */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Frecuencia Normalizada
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={zone.effectParams.normFreq ?? 0.5}
                          onChange={(e) => handleEffectParamChange('normFreq', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                                                     {zone.effectParams.normFreq ?? 0.5}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0</span>
                        <span>1</span>
                      </div>
                    </div>
                  </>
                )}

                {/* Parámetros específicos del Chebyshev */}
                {zone.type === 'chebyshev' && (
                  <>
                    {/* Order */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Orden del Polinomio
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="1"
                          max="100"
                          step="1"
                          value={zone.effectParams.order ?? 50}
                          onChange={(e) => handleEffectParamChange('order', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {zone.effectParams.order ?? 50}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>1</span>
                        <span>100</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Orden impar = distorsión armónica, Orden par = distorsión suave
                      </p>
                    </div>

                    {/* Oversample */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Oversampling
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['none', '2x', '4x'] as const).map((oversampleType) => (
                          <button
                            key={oversampleType}
                            onClick={() => handleEffectParamChange('oversample', oversampleType)}
                            disabled={zone.isLocked}
                            className={`px-2 py-1 text-xs rounded-md transition-colors ${
                              (zone.effectParams.oversample ?? 'none') === oversampleType
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
                            }`}
                          >
                            <span className="capitalize">{oversampleType}</span>
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Mayor oversampling = mejor calidad, más CPU
                      </p>
                    </div>
                  </>
                )}

                {/* Parámetros específicos del Chorus */}
                {zone.type === 'chorus' && (
                  <>
                    {/* Frecuencia del LFO */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Frecuencia del LFO (Hz)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0.1"
                          max="10"
                          step="0.1"
                          value={zone.effectParams.chorusFrequency ?? 1.5}
                          onChange={(e) => handleEffectParamChange('chorusFrequency', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {zone.effectParams.chorusFrequency ?? 1.5}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0.1 Hz</span>
                        <span>10 Hz</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Velocidad de modulación del efecto
                      </p>
                    </div>

                    {/* Tiempo de Delay */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Tiempo de Delay (ms)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="2"
                          max="20"
                          step="0.1"
                          value={zone.effectParams.delayTime ?? 3.5}
                          onChange={(e) => handleEffectParamChange('delayTime', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {zone.effectParams.delayTime ?? 3.5}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>2 ms</span>
                        <span>20 ms</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Tiempo base del delay del chorus
                      </p>
                    </div>

                    {/* Profundidad */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Profundidad
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={zone.effectParams.chorusDepth ?? 0.7}
                          onChange={(e) => handleEffectParamChange('chorusDepth', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {zone.effectParams.chorusDepth ?? 0.7}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0</span>
                        <span>1</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Intensidad de la modulación del delay
                      </p>
                    </div>

                    {/* Feedback */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Feedback
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="0.9"
                          step="0.01"
                          value={zone.effectParams.feedback ?? 0}
                          onChange={(e) => handleEffectParamChange('feedback', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {zone.effectParams.feedback ?? 0}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0</span>
                        <span>0.9</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Cantidad de retroalimentación (0 = chorus, mayor a 0 = flanger)
                      </p>
                    </div>

                    {/* Spread */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Spread Estéreo (grados)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="180"
                          step="1"
                          value={zone.effectParams.spread ?? 180}
                          onChange={(e) => handleEffectParamChange('spread', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {zone.effectParams.spread ?? 180}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0°</span>
                        <span>180°</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        0° = central, 180° = estéreo completo
                      </p>
                    </div>

                    {/* Tipo de LFO */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Tipo de LFO
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['sine', 'square', 'triangle', 'sawtooth'] as const).map((lfoType) => (
                          <button
                            key={lfoType}
                            onClick={() => handleEffectParamChange('chorusType', lfoType)}
                            disabled={zone.isLocked}
                            className={`px-2 py-1 text-xs rounded-md transition-colors ${
                              (zone.effectParams.chorusType ?? 'sine') === lfoType
                                ? 'bg-teal-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
                            }`}
                          >
                            <span className="capitalize">{lfoType}</span>
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Forma de onda del LFO para la modulación
                      </p>
                    </div>
                  </>
                )}

                {/* Parámetros específicos del Distortion */}
                {zone.type === 'distortion' && (
                  <>
                    {/* Distortion amount */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Cantidad de distorsión
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={zone.effectParams.distortion ?? 0.4}
                          onChange={(e) => handleEffectParamChange('distortion', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {zone.effectParams.distortion ?? 0.4}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0</span>
                        <span>1</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Nivel de distorsión (0 a 1)
                      </p>
                    </div>

                    {/* Oversample */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Oversampling
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['none', '2x', '4x'] as const).map((oversampleType) => (
                          <button
                            key={oversampleType}
                            onClick={() => handleEffectParamChange('oversample', oversampleType)}
                            disabled={zone.isLocked}
                            className={`px-2 py-1 text-xs rounded-md transition-colors ${
                              (zone.effectParams.oversample ?? 'none') === oversampleType
                                ? 'bg-pink-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
                            }`}
                          >
                            <span className="capitalize">{oversampleType}</span>
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Mayor oversampling = mejor calidad, más CPU
                      </p>
                    </div>
                  </>
                )}

                {/* Parámetros específicos del FeedbackDelay */}
                {zone.type === 'feedbackDelay' && (
                  <>
                    {/* Delay Time */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Tiempo de Delay
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={typeof zone.effectParams.delayTime === 'number' ? zone.effectParams.delayTime : 0.25}
                          onChange={(e) => handleEffectParamChange('delayTime', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {typeof zone.effectParams.delayTime === 'number' ? zone.effectParams.delayTime : '8n'}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0 s</span>
                        <span>1 s</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Retraso en segundos (puedes usar también valores musicales como &apos;8n&apos;)
                      </p>
                    </div>

                    {/* Feedback */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Feedback
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="0.95"
                          step="0.01"
                          value={zone.effectParams.feedback ?? 0.5}
                          onChange={(e) => handleEffectParamChange('feedback', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {zone.effectParams.feedback ?? 0.5}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0</span>
                        <span>0.95</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Proporción de señal realimentada
                      </p>
                    </div>
                  </>
                )}

                {/* Parámetros específicos del Freeverb */}
                {zone.type === 'freeverb' && (
                  <>
                    {/* Room Size */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Room Size
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={zone.effectParams.roomSize ?? 0.7}
                          onChange={(e) => handleEffectParamChange('roomSize', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {zone.effectParams.roomSize ?? 0.7}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0</span>
                        <span>1</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        0 = sala pequeña, 1 = sala grande (más decay)
                      </p>
                    </div>

                    {/* Dampening */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Dampening (Hz)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="500"
                          max="8000"
                          step="10"
                          value={zone.effectParams.dampening ?? 3000}
                          onChange={(e) => handleEffectParamChange('dampening', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {zone.effectParams.dampening ?? 3000}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>500 Hz</span>
                        <span>8 kHz</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Filtro lowpass interno del reverb
                      </p>
                    </div>
                  </>
                )}

                {/* Parámetros específicos del FrequencyShifter */}
                {zone.type === 'frequencyShifter' && (
                  <>
                    {/* Frequency Shift */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Frecuencia de Shift (Hz)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="-2000"
                          max="2000"
                          step="1"
                          value={zone.effectParams.frequency ?? 0}
                          onChange={(e) => handleEffectParamChange('frequency', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {zone.effectParams.frequency ?? 0}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>-2000 Hz</span>
                        <span>2000 Hz</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Desplaza todas las frecuencias por un valor fijo
                      </p>
                    </div>
                  </>
                )}

                {/* Parámetros específicos del JCReverb */}
                {zone.type === 'jcReverb' && (
                  <>
                    {/* Room Size */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Room Size
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={zone.effectParams.roomSize ?? 0.5}
                          onChange={(e) => handleEffectParamChange('roomSize', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {zone.effectParams.roomSize ?? 0.5}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0</span>
                        <span>1</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        0 = sala pequeña, 1 = sala grande (schroeder)
                      </p>
                    </div>
                  </>
                )}

                {/* Parámetros específicos del PingPongDelay */}
                {zone.type === 'pingPongDelay' && (
                  <>
                    {/* Delay Time */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Tiempo de Delay
                      </label>
                      <div className="flex items-center gap-3">
                        <select
                          value={zone.effectParams.pingPongDelayTime ?? '4n'}
                          onChange={(e) => handleEffectParamChange('pingPongDelayTime', e.target.value)}
                          className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-violet-500 focus:outline-none"
                          disabled={zone.isLocked}
                        >
                          <option value="1n">Nota completa (1n)</option>
                          <option value="2n">Media nota (2n)</option>
                          <option value="4n">Cuarto de nota (4n)</option>
                          <option value="8n">Octavo de nota (8n)</option>
                          <option value="16n">Dieciseisavo de nota (16n)</option>
                          <option value="32n">Treinta y dosavo de nota (32n)</option>
                        </select>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Tiempo entre ecos consecutivos
                      </p>
                    </div>

                    {/* Feedback */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Feedback ({(zone.effectParams.pingPongFeedback ?? 0.2) * 100}%)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="0.9"
                          step="0.05"
                          value={zone.effectParams.pingPongFeedback ?? 0.2}
                          onChange={(e) => handleEffectParamChange('pingPongFeedback', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {Math.round((zone.effectParams.pingPongFeedback ?? 0.2) * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0%</span>
                        <span>90%</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Cantidad de señal que se retroalimenta
                      </p>
                    </div>

                    {/* Max Delay */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Max Delay ({zone.effectParams.maxDelay ?? 1.0}s)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0.1"
                          max="2"
                          step="0.1"
                          value={zone.effectParams.maxDelay ?? 1.0}
                          onChange={(e) => handleEffectParamChange('maxDelay', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {zone.effectParams.maxDelay ?? 1.0}s
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0.1s</span>
                        <span>2.0s</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Tiempo máximo de delay en segundos
                      </p>
                    </div>

                    {/* Wet */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Wet (Mezcla) ({Math.round((zone.effectParams.wet ?? 0.5) * 100)}%)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={zone.effectParams.wet ?? 0.5}
                          onChange={(e) => handleEffectParamChange('wet', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {Math.round((zone.effectParams.wet ?? 0.5) * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0%</span>
                        <span>100%</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Mezcla entre señal seca y procesada
                      </p>
                    </div>
                  </>
                )}

                {/* Parámetros específicos del PitchShift */}
                {zone.type === 'pitchShift' && (
                  <>
                    {/* Pitch */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Pitch (Semi-tonos): {zone.effectParams.pitchShift ?? 0}
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="-24"
                          max="24"
                          step="1"
                          value={zone.effectParams.pitchShift ?? 0}
                          onChange={(e) => handleEffectParamChange('pitchShift', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {zone.effectParams.pitchShift ?? 0}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>-24 (2 octavas abajo)</span>
                        <span>+24 (2 octavas arriba)</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Intervalo de transposición en semi-tonos
                      </p>
                    </div>

                    {/* Window Size */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Window Size ({zone.effectParams.windowSize ?? 0.1}s)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0.03"
                          max="0.1"
                          step="0.01"
                          value={zone.effectParams.windowSize ?? 0.1}
                          onChange={(e) => handleEffectParamChange('windowSize', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {zone.effectParams.windowSize ?? 0.1}s
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0.03s</span>
                        <span>0.1s</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Tamaño de ventana para el pitch shifting (menor = menos delay, mayor = más suave)
                      </p>
                    </div>

                    {/* Delay Time */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Delay Time ({zone.effectParams.delayTime ?? 0}s)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={zone.effectParams.delayTime ?? 0}
                          onChange={(e) => handleEffectParamChange('delayTime', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {zone.effectParams.delayTime ?? 0}s
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0s</span>
                        <span>1s</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Tiempo de delay en la señal de entrada
                      </p>
                    </div>

                    {/* Feedback */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Feedback ({(zone.effectParams.feedback ?? 0) * 100}%)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="0.9"
                          step="0.05"
                          value={zone.effectParams.feedback ?? 0}
                          onChange={(e) => handleEffectParamChange('feedback', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {Math.round((zone.effectParams.feedback ?? 0) * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0%</span>
                        <span>90%</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Cantidad de señal que se retroalimenta
                      </p>
                    </div>
                  </>
                )}

                {/* Parámetros específicos del Reverb */}
                {zone.type === 'reverb' && (
                  <>
                    {/* Decay */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Decay ({zone.effectParams.decay ?? 1.5}s)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0.1"
                          max="10"
                          step="0.1"
                          value={zone.effectParams.decay ?? 1.5}
                          onChange={(e) => handleEffectParamChange('decay', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {zone.effectParams.decay ?? 1.5}s
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0.1s</span>
                        <span>10s</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Duración de la reverberación
                      </p>
                    </div>

                    {/* PreDelay */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        PreDelay ({zone.effectParams.preDelay ?? 0.01}s)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="0.1"
                          step="0.001"
                          value={zone.effectParams.preDelay ?? 0.01}
                          onChange={(e) => handleEffectParamChange('preDelay', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {zone.effectParams.preDelay ?? 0.01}s
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0s</span>
                        <span>0.1s</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Tiempo antes de que la reverberación se active completamente
                      </p>
                    </div>

                    {/* Wet */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Wet (Mezcla) ({Math.round((zone.effectParams.wet ?? 0.5) * 100)}%)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={zone.effectParams.wet ?? 0.5}
                          onChange={(e) => handleEffectParamChange('wet', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {Math.round((zone.effectParams.wet ?? 0.5) * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0%</span>
                        <span>100%</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Mezcla entre señal seca y procesada
                      </p>
                    </div>
                  </>
                )}

                {/* Parámetros específicos del StereoWidener */}
                {zone.type === 'stereoWidener' && (
                  <>
                    {/* Width */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Width (Ancho Estéreo): {Math.round((zone.effectParams.width ?? 0.5) * 100)}%
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={zone.effectParams.width ?? 0.5}
                          onChange={(e) => handleEffectParamChange('width', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {Math.round((zone.effectParams.width ?? 0.5) * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0% (Mono)</span>
                        <span>100% (Estéreo)</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Ancho del campo estéreo (0 = mono, 0.5 = sin cambio, 1 = estéreo máximo)
                      </p>
                    </div>

                    {/* Wet */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Wet (Mezcla) ({Math.round((zone.effectParams.wet ?? 0.5) * 100)}%)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={zone.effectParams.wet ?? 0.5}
                          onChange={(e) => handleEffectParamChange('wet', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {Math.round((zone.effectParams.wet ?? 0.5) * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0%</span>
                        <span>100%</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Mezcla entre señal seca y procesada
                      </p>
                    </div>
                  </>
                )}

                {/* Parámetros específicos del Tremolo */}
                {zone.type === 'tremolo' && (
                  <>
                    {/* Frequency */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Frecuencia: {zone.effectParams.tremoloFrequency ?? 10} Hz
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0.1"
                          max="20"
                          step="0.1"
                          value={zone.effectParams.tremoloFrequency ?? 10}
                          onChange={(e) => handleEffectParamChange('tremoloFrequency', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {zone.effectParams.tremoloFrequency ?? 10} Hz
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0.1 Hz</span>
                        <span>20 Hz</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Velocidad de modulación del tremolo
                      </p>
                    </div>

                    {/* Depth */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Profundidad: {Math.round((zone.effectParams.tremoloDepth ?? 0.5) * 100)}%
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={zone.effectParams.tremoloDepth ?? 0.5}
                          onChange={(e) => handleEffectParamChange('tremoloDepth', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {Math.round((zone.effectParams.tremoloDepth ?? 0.5) * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0%</span>
                        <span>100%</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Intensidad de la modulación de amplitud
                      </p>
                    </div>

                    {/* Spread */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Spread: {zone.effectParams.tremoloSpread ?? 180}°
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="180"
                          step="1"
                          value={zone.effectParams.tremoloSpread ?? 180}
                          onChange={(e) => handleEffectParamChange('tremoloSpread', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {zone.effectParams.tremoloSpread ?? 180}°
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0°</span>
                        <span>180°</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Separación estéreo entre canales LFO
                      </p>
                    </div>

                    {/* Type */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Tipo de Onda
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['sine', 'square', 'triangle', 'sawtooth'] as const).map((waveType) => (
                          <button
                            key={waveType}
                            onClick={() => handleEffectParamChange('tremoloType', waveType)}
                            disabled={zone.isLocked}
                            className={`px-2 py-1 text-xs rounded-md transition-colors ${
                              zone.effectParams.tremoloType === waveType
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
                            }`}
                          >
                            {waveType}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Forma de onda del LFO
                      </p>
                    </div>

                    {/* Wet */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Wet (Mezcla) ({Math.round((zone.effectParams.wet ?? 0.5) * 100)}%)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={zone.effectParams.wet ?? 0.5}
                          onChange={(e) => handleEffectParamChange('wet', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {Math.round((zone.effectParams.wet ?? 0.5) * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0%</span>
                        <span>100%</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Mezcla entre señal seca y procesada
                      </p>
                    </div>
                  </>
                )}

                {/* Parámetros específicos del Vibrato */}
                {zone.type === 'vibrato' && (
                  <>
                    {/* Frequency */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Frecuencia: {zone.effectParams.vibratoFrequency ?? 5} Hz
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0.1"
                          max="20"
                          step="0.1"
                          value={zone.effectParams.vibratoFrequency ?? 5}
                          onChange={(e) => handleEffectParamChange('vibratoFrequency', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {zone.effectParams.vibratoFrequency ?? 5} Hz
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0.1 Hz</span>
                        <span>20 Hz</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Velocidad de modulación del vibrato
                      </p>
                    </div>

                    {/* Depth */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Profundidad: {Math.round((zone.effectParams.vibratoDepth ?? 0.1) * 100)}%
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={zone.effectParams.vibratoDepth ?? 0.1}
                          onChange={(e) => handleEffectParamChange('vibratoDepth', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {Math.round((zone.effectParams.vibratoDepth ?? 0.1) * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0%</span>
                        <span>100%</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Intensidad de la modulación de pitch
                      </p>
                    </div>

                    {/* Type */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Tipo de Onda
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['sine', 'square', 'triangle', 'sawtooth'] as const).map((waveType) => (
                          <button
                            key={waveType}
                            onClick={() => handleEffectParamChange('vibratoType', waveType)}
                            disabled={zone.isLocked}
                            className={`px-2 py-1 text-xs rounded-md transition-colors ${
                              zone.effectParams.vibratoType === waveType
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
                            }`}
                          >
                            {waveType}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Forma de onda del LFO
                      </p>
                    </div>

                    {/* Max Delay */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Max Delay: {(zone.effectParams.vibratoMaxDelay ?? 0.005) * 1000} ms
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0.001"
                          max="0.02"
                          step="0.001"
                          value={zone.effectParams.vibratoMaxDelay ?? 0.005}
                          onChange={(e) => handleEffectParamChange('vibratoMaxDelay', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {Math.round((zone.effectParams.vibratoMaxDelay ?? 0.005) * 1000)} ms
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>1 ms</span>
                        <span>20 ms</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Tiempo máximo de delay para el vibrato
                      </p>
                    </div>

                    {/* Wet */}
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Wet (Mezcla) ({Math.round((zone.effectParams.wet ?? 0.5) * 100)}%)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={zone.effectParams.wet ?? 0.5}
                          onChange={(e) => handleEffectParamChange('wet', Number(e.target.value))}
                          className="flex-1 h-1.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-lg appearance-none cursor-pointer slider-thumb-neon"
                          disabled={zone.isLocked}
                        />
                        <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                          {Math.round((zone.effectParams.wet ?? 0.5) * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0%</span>
                        <span>100%</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Mezcla entre señal seca y procesada
                      </p>
                    </div>
                  </>
                )}
              </div>

          {/* Selector de forma */}
          <div className="mt-4 space-y-3">
            <h4 className="text-xs font-semibold text-purple-400 mb-2 flex items-center gap-2">
              🔷 Cambiar Forma
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {(['sphere', 'cube'] as const).map((shape) => (
                <button
                  key={shape}
                  onClick={() => updateEffectZone(zone.id, { shape })}
                  disabled={zone.isLocked}
                  className={`px-2 py-1 text-xs rounded-md transition-colors ${
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

          {/* Sección de Posición y Tamaño para Zonas de Efectos */}
          <div className="mt-6 pt-4 border-t border-gray-700">
            <h4 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2">
              📍 Posición y Tamaño
            </h4>
            
            {/* Position */}
            <div className="space-y-2 mb-4">
              <label className="text-xs font-medium text-gray-300">Position</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { axis: 'X', color: 'bg-red-500', value: zone.position[0] },
                  { axis: 'Y', color: 'bg-green-500', value: zone.position[1] },
                  { axis: 'Z', color: 'bg-blue-500', value: zone.position[2] }
                ].map(({ axis, color, value }, index) => (
                  <div key={axis} className="flex flex-col">
                    <div className="flex items-center gap-1 mb-1">
                      <div className={`w-2 h-2 ${color} rounded-sm`}></div>
                      <span className="text-xs text-gray-400">{axis}</span>
                    </div>
                    <input
                      type="number"
                      step="0.1"
                      value={roundToDecimals(value)}
                      onChange={(e) => {
                        const newValue = parseFloat(e.target.value) || 0;
                        const newPosition = [...zone.position] as [number, number, number];
                        newPosition[index] = newValue;
                        updateEffectZone(zone.id, { position: newPosition });
                      }}
                      className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                      disabled={zone.isLocked}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Rotation */}
            <div className="space-y-2 mb-4">
              <label className="text-xs font-medium text-gray-300">Rotation</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { axis: 'X', color: 'bg-red-500', value: zone.rotation[0] },
                  { axis: 'Y', color: 'bg-green-500', value: zone.rotation[1] },
                  { axis: 'Z', color: 'bg-blue-500', value: zone.rotation[2] }
                ].map(({ axis, color, value }, index) => (
                  <div key={axis} className="flex flex-col">
                    <div className="flex items-center gap-1 mb-1">
                      <div className={`w-2 h-2 ${color} rounded-sm`}></div>
                      <span className="text-xs text-gray-400">{axis}</span>
                    </div>
                    <input
                      type="number"
                      step="1"
                      value={roundToDecimals(value)}
                      onChange={(e) => {
                        const newValue = parseFloat(e.target.value) || 0;
                        const newRotation = [...zone.rotation] as [number, number, number];
                        newRotation[index] = newValue;
                        updateEffectZone(zone.id, { rotation: newRotation });
                      }}
                      className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                      disabled={zone.isLocked}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Scale */}
            <div className="space-y-2 mb-4">
              <label className="text-xs font-medium text-gray-300">Scale</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { axis: 'X', color: 'bg-red-500', value: zone.scale[0] },
                  { axis: 'Y', color: 'bg-green-500', value: zone.scale[1] },
                  { axis: 'Z', color: 'bg-blue-500', value: zone.scale[2] }
                ].map(({ axis, color, value }, index) => (
                  <div key={axis} className="flex flex-col">
                    <div className="flex items-center gap-1 mb-1">
                      <div className={`w-2 h-2 ${color} rounded-sm`}></div>
                      <span className="text-xs text-gray-400">{axis}</span>
                    </div>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={roundToDecimals(value)}
                      onChange={(e) => {
                        const newValue = Math.max(0.1, parseFloat(e.target.value) || 1);
                        const newScale = [...zone.scale] as [number, number, number];
                        newScale[index] = newValue;
                        updateEffectZone(zone.id, { scale: newScale });
                      }}
                      className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                      disabled={zone.isLocked}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Controles de transformación */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  // Resetear a valores por defecto
                  updateEffectZone(zone.id, { 
                    position: [0, 0, 0], 
                    rotation: [0, 0, 0],
                    scale: [1, 1, 1] 
                  });
                }}
                className="flex-1 px-3 py-2 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded border border-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Resetear posición y tamaño a valores por defecto"
                disabled={zone.isLocked}
              >
                🔄 Reset
              </button>
              <button
                onClick={() => {
                  // Copiar valores al portapapeles
                  const transformText = `Position: [${zone.position.join(', ')}]\nRotation: [${zone.rotation.join(', ')}]\nScale: [${zone.scale.join(', ')}]`;
                  navigator.clipboard.writeText(transformText);
                }}
                className="px-3 py-2 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded border border-gray-600 transition-colors"
                title="Copiar valores al portapapeles"
              >
                📋
              </button>
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
  const selectedObject = selectedEntity.data as SoundObject; // Type assertion para objeto sonoro
  
  // Asegurar que audioParams existe
  if (!selectedObject.audioParams) {
    selectedObject.audioParams = {};
  }
  
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
              <label className="block text-xs font-medium text-gray-300 mb-1">
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
              <label className="block text-xs font-medium text-gray-300 mb-1">
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
                                                          <label className="block text-xs font-medium text-gray-300 mb-1">
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

                                                            <span className="text-white font-mono text-xs min-w-[3rem] text-right">
                                                              {selectedObject.audioParams.duration === Infinity ? '∞' : `${(selectedObject.audioParams.duration || 1.0).toFixed(1)}s`}
                                                            </span>
                                                          </div>
                                                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                                                            <span>0.1s</span>
                                                            <span>60s</span>
                                                          </div>
                                                          <p className="text-xs text-gray-400 mt-0.5">
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
                <label className="block text-xs font-medium text-gray-300 mb-1">
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
                <label className="block text-xs font-medium text-gray-300 mb-1">
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
                <label className="block text-xs font-medium text-gray-300 mb-1">
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
                <label className="block text-xs font-medium text-gray-300 mb-1">
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
                <label className="block text-xs font-medium text-gray-300 mb-1">
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
                <label className="block text-xs font-medium text-gray-300 mb-1">
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
                <label className="block text-xs font-medium text-gray-300 mb-1">
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
                <label className="block text-xs font-medium text-gray-300 mb-1">
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
                <label className="block text-xs font-medium text-gray-300 mb-1">
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
                <label className="block text-xs font-medium text-gray-300 mb-1">
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
                <label className="block text-xs font-medium text-gray-300 mb-1">
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
                <label className="block text-xs font-medium text-gray-300 mb-1">
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
                  <label className="block text-xs font-medium text-gray-300 mb-1">
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
                  <label className="block text-xs font-medium text-gray-300 mb-1">
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
                  <label className="block text-xs font-medium text-gray-300 mb-1">
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
                  <label className="block text-xs font-medium text-gray-300 mb-1">
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
                  <label className="block text-xs font-medium text-gray-300 mb-1">
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
                  <label className="block text-xs font-medium text-gray-300 mb-1">
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
                  <label className="block text-xs font-medium text-gray-300 mb-1">
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
                  <label className="block text-xs font-medium text-gray-300 mb-1">
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
                  <label className="block text-xs font-medium text-gray-300 mb-1">
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
                  <label className="block text-xs font-medium text-gray-300 mb-1">
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
                  <label className="block text-xs font-medium text-gray-300 mb-1">
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
                  <label className="block text-xs font-medium text-gray-300 mb-1">
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
                  <label className="block text-xs font-medium text-gray-300 mb-1">
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
                  <label className="block text-xs font-medium text-gray-300 mb-1">
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
                  <label className="block text-xs font-medium text-gray-300 mb-1">
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
                  <label className="block text-xs font-medium text-gray-300 mb-1">
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
                  <label className="block text-xs font-medium text-gray-300 mb-1">
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
                  <label className="block text-xs font-medium text-gray-300 mb-1">
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
                  <label className="block text-xs font-medium text-gray-300 mb-1">
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
                  <label className="block text-xs font-medium text-gray-300 mb-1">
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
                  <label className="block text-xs font-medium text-gray-300 mb-1">
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
                  <label className="block text-xs font-medium text-gray-300 mb-1">
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
                  <label className="block text-xs font-medium text-gray-300 mb-1">
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
                  <label className="block text-xs font-medium text-gray-300 mb-1">
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
                  <label className="block text-xs font-medium text-gray-300 mb-1">
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
                  <label className="block text-xs font-medium text-gray-300 mb-1">
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
                  <label className="block text-xs font-medium text-gray-300 mb-1">
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
                  <label className="block text-xs font-medium text-gray-300 mb-1">
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
                  <label className="block text-xs font-medium text-gray-300 mb-1">
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
                  <label className="block text-xs font-medium text-gray-300 mb-1">
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
                  <label className="block text-xs font-medium text-gray-300 mb-1">
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
                  <label className="block text-xs font-medium text-gray-300 mb-1">
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
                  <label className="block text-xs font-medium text-gray-300 mb-1">
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

          {/* Sección de Posición y Tamaño - Movida al final */}
          <div className="pt-6 border-t border-gray-700">
            <h4 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2">
              📍 Posición y Tamaño
            </h4>
            
            {/* Position */}
            <div className="space-y-2 mb-4">
              <label className="text-xs font-medium text-gray-300">Position</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { axis: 'X', color: 'bg-red-500', value: selectedObject.position[0] },
                  { axis: 'Y', color: 'bg-green-500', value: selectedObject.position[1] },
                  { axis: 'Z', color: 'bg-blue-500', value: selectedObject.position[2] }
                ].map(({ axis, color, value }, index) => (
                  <div key={axis} className="flex flex-col">
                    <div className="flex items-center gap-1 mb-1">
                      <div className={`w-2 h-2 ${color} rounded-sm`}></div>
                      <span className="text-xs text-gray-400">{axis}</span>
                    </div>
                    <input
                      type="number"
                      step="0.1"
                      value={roundToDecimals(value)}
                      onChange={(e) => {
                        const newValue = parseFloat(e.target.value) || 0;
                        handleTransformChange('position', index as 0 | 1 | 2, newValue);
                      }}
                      className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Rotation */}
            <div className="space-y-2 mb-4">
              <label className="text-xs font-medium text-gray-300">Rotation</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { axis: 'X', color: 'bg-red-500', value: selectedObject.rotation[0] },
                  { axis: 'Y', color: 'bg-green-500', value: selectedObject.rotation[1] },
                  { axis: 'Z', color: 'bg-blue-500', value: selectedObject.rotation[2] }
                ].map(({ axis, color, value }, index) => (
                  <div key={axis} className="flex flex-col">
                    <div className="flex items-center gap-1 mb-1">
                      <div className={`w-2 h-2 ${color} rounded-sm`}></div>
                      <span className="text-xs text-gray-400">{axis}</span>
                    </div>
                    <input
                      type="number"
                      step="1"
                      value={roundToDecimals(value)}
                      onChange={(e) => {
                        const newValue = parseFloat(e.target.value) || 0;
                        handleTransformChange('rotation', index as 0 | 1 | 2, newValue);
                      }}
                      className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Scale */}
            <div className="space-y-2 mb-4">
              <label className="text-xs font-medium text-gray-300">Scale</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { axis: 'X', color: 'bg-red-500', value: selectedObject.scale[0] },
                  { axis: 'Y', color: 'bg-green-500', value: selectedObject.scale[1] },
                  { axis: 'Z', color: 'bg-blue-500', value: selectedObject.scale[2] }
                ].map(({ axis, color, value }, index) => (
                  <div key={axis} className="flex flex-col">
                    <div className="flex items-center gap-1 mb-1">
                      <div className={`w-2 h-2 ${color} rounded-sm`}></div>
                      <span className="text-xs text-gray-400">{axis}</span>
                    </div>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={roundToDecimals(value)}
                      onChange={(e) => {
                        const newValue = Math.max(0.1, parseFloat(e.target.value) || 1);
                        handleTransformChange('scale', index as 0 | 1 | 2, newValue);
                      }}
                      className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Controles de transformación */}
            <div className="flex gap-2">
              <button
                onClick={resetTransform}
                className="flex-1 px-3 py-2 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded border border-gray-600 transition-colors"
                title="Resetear transformación a valores por defecto"
              >
                🔄 Reset
              </button>
              <button
                onClick={() => {
                  // Copiar valores al portapapeles
                  const transformText = `Position: [${selectedObject.position.join(', ')}]\nRotation: [${selectedObject.rotation.join(', ')}]\nScale: [${selectedObject.scale.join(', ')}]`;
                  navigator.clipboard.writeText(transformText);
                }}
                className="px-3 py-2 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded border border-gray-600 transition-colors"
                title="Copiar valores al portapapeles"
              >
                📋
              </button>
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
