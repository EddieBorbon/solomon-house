'use client';

import { useState, useRef } from 'react';
import { useWorldStore } from '../../state/useWorldStore';
import { PersistencePanel } from './PersistencePanel';

export function ControlPanel() {
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);
  const [isAddMenuExpanded, setIsAddMenuExpanded] = useState(false);
  const [isControlsExpanded, setIsControlsExpanded] = useState(false);
  const [isEffectsExpanded, setIsEffectsExpanded] = useState(false);
  const [isMobileObjectExpanded, setIsMobileObjectExpanded] = useState(false);
  const [isGridsExpanded, setIsGridsExpanded] = useState(false);
  const [newGridPosition, setNewGridPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [newGridSize, setNewGridSize] = useState<number>(20);
  const { addObject, addEffectZone, addMobileObject, activeGridId, grids, createGrid, currentGridCoordinates, gridSize } = useWorldStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const effectsScrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Obtener información de la cuadrícula activa
  const activeGrid = activeGridId ? grids.get(activeGridId) : null;

  // Función helper para crear objetos en la cuadrícula activa
  const createObjectInActiveGrid = (type: string) => {
    if (!activeGrid) {
      console.warn('No hay cuadrícula activa para crear objetos');
      return;
    }
    
    // Calcular posición relativa a la cuadrícula activa (posición local)
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    addObject(type as 'cube' | 'sphere' | 'cylinder' | 'cone' | 'pyramid' | 'icosahedron' | 'plane' | 'torus' | 'dodecahedronRing' | 'spiral', [x, 0.5, z]);
    console.log(`🎯 Creando ${type} en cuadrícula activa ${activeGridId} en posición relativa:`, [x, 0.5, z]);
  };

  // Función helper para crear zonas de efecto en la cuadrícula activa
  const createEffectZoneInActiveGrid = (type: string) => {
    if (!activeGrid) {
      console.warn('No hay cuadrícula activa para crear zonas de efecto');
      return;
    }
    
    // Calcular posición relativa a la cuadrícula activa (posición local)
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    addEffectZone(type as 'phaser' | 'autoFilter' | 'autoWah' | 'bitCrusher' | 'chebyshev' | 'chorus' | 'distortion' | 'feedbackDelay' | 'freeverb' | 'frequencyShifter' | 'jcReverb' | 'pingPongDelay' | 'pitchShift' | 'reverb' | 'stereoWidener' | 'tremolo' | 'vibrato', [x, 1, z], 'sphere');
    console.log(`🎯 Creando zona de efecto ${type} en cuadrícula activa ${activeGridId} en posición relativa:`, [x, 1, z]);
  };

  // Función helper para crear objetos móviles en la cuadrícula activa
  const createMobileObjectInActiveGrid = () => {
    console.log(`🚀 createMobileObjectInActiveGrid llamado - Cuadrícula activa: ${activeGridId}`);
    console.log(`🚀 activeGrid:`, activeGrid);
    
    if (!activeGrid) {
      console.warn('No hay cuadrícula activa para crear objetos móviles');
      return;
    }
    
    // Calcular posición relativa a la cuadrícula activa (posición local)
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    const finalPosition: [number, number, number] = [x, 0.5, z];
    
    console.log(`🚀 Posición de la cuadrícula:`, activeGrid.position);
    console.log(`🚀 Posición relativa del objeto móvil:`, finalPosition);
    
    addMobileObject(finalPosition);
    console.log(`🎯 Creando objeto móvil en cuadrícula activa ${activeGridId} en posición relativa:`, finalPosition);
  };

  const handleAddCube = () => createObjectInActiveGrid('cube');
  const handleAddSphere = () => createObjectInActiveGrid('sphere');

  const handleAddCylinder = () => createObjectInActiveGrid('cylinder');
  const handleAddCone = () => createObjectInActiveGrid('cone');
  const handleAddPyramid = () => createObjectInActiveGrid('pyramid');
  const handleAddIcosahedron = () => createObjectInActiveGrid('icosahedron');
  const handleAddPlane = () => createObjectInActiveGrid('plane');
  const handleAddTorus = () => createObjectInActiveGrid('torus');
  const handleAddDodecahedronRing = () => createObjectInActiveGrid('dodecahedronRing');
  const handleAddSpiral = () => createObjectInActiveGrid('spiral');

  const handleAddPhaserZone = () => createEffectZoneInActiveGrid('phaser');
  const handleAddAutoFilterZone = () => createEffectZoneInActiveGrid('autoFilter');
  const handleAddAutoWahZone = () => createEffectZoneInActiveGrid('autoWah');
  const handleAddBitCrusherZone = () => createEffectZoneInActiveGrid('bitCrusher');
  const handleAddChebyshevZone = () => createEffectZoneInActiveGrid('chebyshev');
  const handleAddChorusZone = () => createEffectZoneInActiveGrid('chorus');
  const handleAddDistortionZone = () => createEffectZoneInActiveGrid('distortion');
  const handleAddFeedbackDelayZone = () => createEffectZoneInActiveGrid('feedbackDelay');
  const handleAddFreeverbZone = () => createEffectZoneInActiveGrid('freeverb');
  const handleAddFrequencyShifterZone = () => createEffectZoneInActiveGrid('frequencyShifter');
  const handleAddJCReverbZone = () => createEffectZoneInActiveGrid('jcReverb');
  const handleAddPingPongDelayZone = () => createEffectZoneInActiveGrid('pingPongDelay');
  const handleAddPitchShiftZone = () => createEffectZoneInActiveGrid('pitchShift');
  const handleAddReverbZone = () => createEffectZoneInActiveGrid('reverb');
  const handleAddStereoWidenerZone = () => createEffectZoneInActiveGrid('stereoWidener');
  const handleAddTremoloZone = () => createEffectZoneInActiveGrid('tremolo');
  const handleAddVibratoZone = () => createEffectZoneInActiveGrid('vibrato');

  // Funciones para controlar el scroll horizontal
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -150, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 150, behavior: 'smooth' });
    }
  };

  // Funciones de scroll para zonas de efectos
  const scrollEffectsLeft = () => {
    if (effectsScrollContainerRef.current) {
      effectsScrollContainerRef.current.scrollBy({ left: -150, behavior: 'smooth' });
    }
  };

  const scrollEffectsRight = () => {
    if (effectsScrollContainerRef.current) {
      effectsScrollContainerRef.current.scrollBy({ left: 150, behavior: 'smooth' });
    }
  };

  const handleAddMobileObject = () => createMobileObjectInActiveGrid();

  // Funciones para crear cuadrículas
  const createGridAtPosition = (direction: 'north' | 'south' | 'east' | 'west' | 'up' | 'down') => {
    const baseCoordinates = activeGrid ? activeGrid.coordinates : currentGridCoordinates;
    const [x, y, z] = baseCoordinates;
    let newCoordinates: [number, number, number];
    
    switch (direction) {
      case 'north':
        newCoordinates = [x, y, z + 1];
        break;
      case 'south':
        newCoordinates = [x, y, z - 1];
        break;
      case 'east':
        newCoordinates = [x + 1, y, z];
        break;
      case 'west':
        newCoordinates = [x - 1, y, z];
        break;
      case 'up':
        newCoordinates = [x, y + 1, z];
        break;
      case 'down':
        newCoordinates = [x, y - 1, z];
        break;
    }
    
    const newPosition: [number, number, number] = [
      newCoordinates[0] * gridSize,
      newCoordinates[1] * gridSize,
      newCoordinates[2] * gridSize
    ];
    
    createGrid(newPosition, gridSize);
  };

  const createGridAtCustomPosition = () => {
    createGrid(newGridPosition, newGridSize);
  };


  return (
    <div className="fixed left-0 top-0 h-full z-50 flex">
      {/* Botón de toggle */}
      <button
        onClick={() => setIsPanelExpanded(!isPanelExpanded)}
        className="bg-black/80 backdrop-blur-xl border-r border-white/10 shadow-2xl p-3 flex items-center justify-center hover:bg-black/90 transition-all duration-300"
        title={isPanelExpanded ? "Contraer panel" : "Expandir panel"}
      >
        {isPanelExpanded ? (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </button>

      {/* Panel principal */}
      <div className={`bg-black/80 backdrop-blur-xl border-r border-white/10 shadow-2xl transition-all duration-300 overflow-hidden ${
        isPanelExpanded ? 'w-64' : 'w-0'
      }`}>
        {/* Efecto de brillo interior */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 pointer-events-none"></div>
        
        <div className="p-4 h-full overflow-y-auto">
          {isPanelExpanded && (
            <>
              {/* Sección de Controles */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-white flex items-center gap-1">
            <span className="text-sm">💡</span>
            Controles
          </h3>
          <button
            onClick={() => setIsControlsExpanded(!isControlsExpanded)}
            className="text-cyan-400 hover:text-cyan-300 transition-all duration-300 hover:scale-110 p-1 rounded-lg hover:bg-cyan-500/20"
            title={isControlsExpanded ? "Ocultar controles" : "Mostrar controles"}
          >
            {isControlsExpanded ? (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
        </div>
        
        {isControlsExpanded && (
          <div className="space-y-1 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/30 scrollbar-track-transparent">
            {/* Controles básicos */}
            <div className="p-2 bg-gray-800/50 border border-gray-600/50 rounded text-xs text-gray-300">
              <p><strong>📷 Cámara:</strong> Click rotar, Scroll zoom</p>
              <p><strong>⌨️ WASD:</strong> Movimiento, Shift rápido</p>
              <p><strong>🎮 Click:</strong> Seleccionar objetos</p>
              <p><strong>🗑️ SUPR:</strong> Eliminar objeto seleccionado</p>
              <p><strong>🎮 G/R/S:</strong> Modos de transformación</p>
              <p><strong>🎮 ESC:</strong> Salir modo edición</p>
            </div>
          </div>
        )}
      </div>

      {/* Sección de Añadir Objeto */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-white flex items-center gap-1">
            <span className="text-sm">➕</span>
            Objetos
          </h3>
          <button
            onClick={() => setIsAddMenuExpanded(!isAddMenuExpanded)}
            className="text-purple-400 hover:text-purple-300 transition-all duration-300 hover:scale-110 p-1 rounded-lg hover:bg-purple-500/20"
            title={isAddMenuExpanded ? "Ocultar menú" : "Mostrar menú"}
          >
            {isAddMenuExpanded ? (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
        </div>
        
        {isAddMenuExpanded && (
          <div className="space-y-1">
            {/* Botones compactos en grid */}
            <div className="grid grid-cols-2 gap-1">
              <button onClick={handleAddCube} className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600">⬜ Cubo</button>
              <button onClick={handleAddSphere} className="px-2 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600">🔵 Esfera</button>
              <button onClick={handleAddCylinder} className="px-2 py-1 bg-emerald-500 text-white rounded text-xs hover:bg-emerald-600">🔶 Cilindro</button>
              <button onClick={handleAddCone} className="px-2 py-1 bg-orange-500 text-white rounded text-xs hover:bg-orange-600">🥁 Cono</button>
              <button onClick={handleAddPyramid} className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600">🔺 Pirámide</button>
              <button onClick={handleAddIcosahedron} className="px-2 py-1 bg-indigo-500 text-white rounded text-xs hover:bg-indigo-600">🔶 Icosaedro</button>
              <button onClick={handleAddPlane} className="px-2 py-1 bg-blue-400 text-white rounded text-xs hover:bg-blue-500">🟦 Plano</button>
              <button onClick={handleAddTorus} className="px-2 py-1 bg-cyan-500 text-white rounded text-xs hover:bg-cyan-600">🔄 Toroide</button>
              <button onClick={handleAddDodecahedronRing} className="px-2 py-1 bg-pink-500 text-white rounded text-xs hover:bg-pink-600">🔷 Anillo</button>
              <button onClick={handleAddSpiral} className="px-2 py-1 bg-cyan-500 text-white rounded text-xs hover:bg-cyan-600">🌀 Espiral</button>
            </div>
          </div>
        )}
      </div>

      {/* Sección de Zonas de Efectos */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-white flex items-center gap-1">
            <span className="text-sm">🎛️</span>
            Efectos
          </h3>
          <button
            onClick={() => setIsEffectsExpanded(!isEffectsExpanded)}
            className="text-pink-400 hover:text-pink-300 transition-all duration-300 hover:scale-110 p-1 rounded-lg hover:bg-pink-500/20"
            title={isEffectsExpanded ? "Ocultar menú" : "Mostrar menú"}
          >
            {isEffectsExpanded ? (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
        </div>
        
        {isEffectsExpanded && (
          <div className="space-y-1">
            {/* Botones compactos en grid */}
            <div className="grid grid-cols-2 gap-1">
              <button onClick={handleAddPhaserZone} className="px-2 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600">Phaser</button>
              <button onClick={handleAddAutoFilterZone} className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600">AutoFilter</button>
              <button onClick={handleAddAutoWahZone} className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600">AutoWah</button>
              <button onClick={handleAddBitCrusherZone} className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600">BitCrusher</button>
              <button onClick={handleAddChebyshevZone} className="px-2 py-1 bg-pink-500 text-white rounded text-xs hover:bg-pink-600">Chebyshev</button>
              <button onClick={handleAddChorusZone} className="px-2 py-1 bg-indigo-500 text-white rounded text-xs hover:bg-indigo-600">Chorus</button>
              <button onClick={handleAddDistortionZone} className="px-2 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600">Distortion</button>
              <button onClick={handleAddFeedbackDelayZone} className="px-2 py-1 bg-teal-500 text-white rounded text-xs hover:bg-teal-600">FeedbackDelay</button>
              <button onClick={handleAddFreeverbZone} className="px-2 py-1 bg-cyan-500 text-white rounded text-xs hover:bg-cyan-600">Freeverb</button>
              <button onClick={handleAddFrequencyShifterZone} className="px-2 py-1 bg-emerald-500 text-white rounded text-xs hover:bg-emerald-600">FreqShift</button>
              <button onClick={handleAddJCReverbZone} className="px-2 py-1 bg-violet-500 text-white rounded text-xs hover:bg-violet-600">JCReverb</button>
              <button onClick={handleAddPingPongDelayZone} className="px-2 py-1 bg-rose-500 text-white rounded text-xs hover:bg-rose-600">PingPong</button>
              <button onClick={handleAddPitchShiftZone} className="px-2 py-1 bg-sky-500 text-white rounded text-xs hover:bg-sky-600">PitchShift</button>
              <button onClick={handleAddReverbZone} className="px-2 py-1 bg-amber-500 text-white rounded text-xs hover:bg-amber-600">Reverb</button>
              <button onClick={handleAddStereoWidenerZone} className="px-2 py-1 bg-lime-500 text-white rounded text-xs hover:bg-lime-600">StereoWidener</button>
              <button onClick={handleAddTremoloZone} className="px-2 py-1 bg-fuchsia-500 text-white rounded text-xs hover:bg-fuchsia-600">Tremolo</button>
              <button onClick={handleAddVibratoZone} className="px-2 py-1 bg-slate-500 text-white rounded text-xs hover:bg-slate-600">Vibrato</button>
            </div>
          </div>
        )}
      </div>

      {/* Panel de Persistencia */}
      <PersistencePanel />

      {/* Sección de Objeto Móvil */}
      <div className="mt-2">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-white flex items-center gap-1">
            <span className="text-sm">🚀</span>
            Móvil
          </h3>
          <button
            onClick={() => setIsMobileObjectExpanded(!isMobileObjectExpanded)}
            className="text-purple-400 hover:text-purple-300 transition-all duration-300 hover:scale-110 p-1 rounded-lg hover:bg-purple-500/20"
            title={isMobileObjectExpanded ? "Ocultar menú" : "Mostrar menú"}
          >
            {isMobileObjectExpanded ? (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
        </div>
        
        {isMobileObjectExpanded && (
          <div className="space-y-1">
            <button
              onClick={handleAddMobileObject}
              className="w-full px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded text-xs hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center justify-center space-x-1"
            >
              <span className="text-sm">🚀</span>
              <span>Añadir Móvil</span>
            </button>
          </div>
        )}
      </div>

      {/* Sección de Cuadrículas */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-white flex items-center gap-1">
            <span className="text-sm">➕</span>
            Cuadrículas
          </h3>
          <button
            onClick={() => setIsGridsExpanded(!isGridsExpanded)}
            className="text-cyan-400 hover:text-cyan-300 transition-all duration-300 hover:scale-110 p-1 rounded-lg hover:bg-cyan-500/20"
            title={isGridsExpanded ? "Ocultar cuadrículas" : "Mostrar cuadrículas"}
          >
            {isGridsExpanded ? (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
        </div>

        {/* Posición actual */}
        <div className="mb-1 p-1 bg-cyan-900/20 border border-cyan-700/50 rounded text-xs text-cyan-300">
          <div>Pos: ({activeGrid ? activeGrid.coordinates[0] : currentGridCoordinates[0]}, {activeGrid ? activeGrid.coordinates[1] : currentGridCoordinates[1]}, {activeGrid ? activeGrid.coordinates[2] : currentGridCoordinates[2]})</div>
          {activeGrid && (
            <div className="text-cyan-400">
              Activa: {activeGrid.id.slice(0, 6)}...
            </div>
          )}
        </div>

        {isGridsExpanded && (
          <div className="space-y-1">
            {/* Crear cuadrículas adyacentes */}
            <div className="space-y-1">
              <div className="text-xs font-semibold text-gray-300">Adyacentes</div>
              
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => createGridAtPosition('west')}
                  className="px-1 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
                  title="Oeste"
                >
                  ← O
                </button>
                <button
                  onClick={() => createGridAtPosition('east')}
                  className="px-1 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
                  title="Este"
                >
                  E →
                </button>
                <button
                  onClick={() => createGridAtPosition('south')}
                  className="px-1 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"
                  title="Sur"
                >
                  ↓ S
                </button>
                <button
                  onClick={() => createGridAtPosition('north')}
                  className="px-1 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"
                  title="Norte"
                >
                  N ↑
                </button>
                <button
                  onClick={() => createGridAtPosition('down')}
                  className="px-1 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors"
                  title="Abajo"
                >
                  ⬇ Abajo
                </button>
                <button
                  onClick={() => createGridAtPosition('up')}
                  className="px-1 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors"
                  title="Arriba"
                >
                  ⬆ Arriba
                </button>
              </div>
            </div>

            {/* Crear cuadrícula personalizada */}
            <div className="space-y-1">
              <div className="text-xs font-semibold text-gray-300">Personalizada</div>
              
              <div className="grid grid-cols-4 gap-1">
                <div>
                  <label className="text-xs text-gray-400 block">X</label>
                  <input
                    type="number"
                    value={newGridPosition[0]}
                    onChange={(e) => setNewGridPosition([parseInt(e.target.value) || 0, newGridPosition[1], newGridPosition[2]])}
                    className="w-full px-1 py-1 bg-gray-800 border border-gray-600 rounded text-white text-xs"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block">Y</label>
                  <input
                    type="number"
                    value={newGridPosition[1]}
                    onChange={(e) => setNewGridPosition([newGridPosition[0], parseInt(e.target.value) || 0, newGridPosition[2]])}
                    className="w-full px-1 py-1 bg-gray-800 border border-gray-600 rounded text-white text-xs"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block">Z</label>
                  <input
                    type="number"
                    value={newGridPosition[2]}
                    onChange={(e) => setNewGridPosition([newGridPosition[0], newGridPosition[1], parseInt(e.target.value) || 0])}
                    className="w-full px-1 py-1 bg-gray-800 border border-gray-600 rounded text-white text-xs"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block">T</label>
                  <input
                    type="number"
                    value={newGridSize}
                    onChange={(e) => setNewGridSize(parseInt(e.target.value) || 20)}
                    className="w-full px-1 py-1 bg-gray-800 border border-gray-600 rounded text-white text-xs"
                    placeholder="20"
                    min="5"
                    max="100"
                  />
                </div>
              </div>
              
              <button
                onClick={createGridAtCustomPosition}
                className="w-full px-2 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded text-xs transition-colors"
                title="Crear cuadrícula en la posición especificada"
              >
                🎯 Crear
              </button>
            </div>
          </div>
        )}
      </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
