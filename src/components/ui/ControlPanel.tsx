'use client';

import { useState, useRef } from 'react';
import { useWorldStore } from '../../state/useWorldStore';

export function ControlPanel() {
  const [isAddMenuExpanded, setIsAddMenuExpanded] = useState(false);
  const [isControlsExpanded, setIsControlsExpanded] = useState(false);
  const [isEffectsExpanded, setIsEffectsExpanded] = useState(false);
  const [isMobileObjectExpanded, setIsMobileObjectExpanded] = useState(false);
  const { addObject, addEffectZone, addMobileObject, activeGridId, grids } = useWorldStore();
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
    addObject(type as any, [x, 0.5, z]);
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
    addEffectZone(type as any, [x, 1, z], 'sphere');
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


  return (
      <div className="fixed top-4 left-4 bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-4 z-50 min-w-[280px] max-w-[320px] max-h-[70vh] overflow-hidden">
      {/* Efecto de brillo interior */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 rounded-2xl pointer-events-none"></div>
      
      {/* Indicador de Cuadrícula Activa */}
      {activeGrid && (
        <div className="mb-4 p-3 bg-cyan-900/20 border border-cyan-700/50 rounded-lg">
          <div className="text-sm text-cyan-300 mb-1">Cuadrícula Activa</div>
          <div className="text-white font-medium">
            Coordenadas: ({activeGrid.coordinates[0]}, {activeGrid.coordinates[1]}, {activeGrid.coordinates[2]})
          </div>
          <div className="text-xs text-cyan-200">
            {activeGrid.objects.length} objetos, {activeGrid.mobileObjects.length} móviles, {activeGrid.effectZones.length} zonas
          </div>
        </div>
      )}
      
      {/* Sección de Controles */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="text-xl">💡</span>
            Controles
          </h3>
          <button
            onClick={() => setIsControlsExpanded(!isControlsExpanded)}
            className="text-cyan-400 hover:text-cyan-300 transition-all duration-300 hover:scale-110 p-2 rounded-lg hover:bg-cyan-500/20"
            title={isControlsExpanded ? "Ocultar controles" : "Mostrar controles"}
          >
            {isControlsExpanded ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
        </div>
        
        {isControlsExpanded && (
          <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/30 scrollbar-track-transparent">
            {/* Controles de cámara */}
            <div className="p-3 bg-gray-800/50 border border-gray-600/50 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-300 mb-2">📷 Cámara</h4>
              <div className="space-y-1 text-xs text-gray-400">
                <p>• <strong>Click izquierdo:</strong> Rotar cámara</p>
                <p>• <strong>Scroll:</strong> Zoom</p>
                <p>• <strong>Click derecho:</strong> Pan</p>
                <p>• <strong>Click en objetos:</strong> Seleccionar</p>
              </div>
            </div>

            {/* Controles de teclado WASD */}
            <div className="p-3 bg-green-900/20 border border-green-700/50 rounded-lg">
              <h4 className="text-sm font-semibold text-green-300 mb-2">⌨️ Controles WASD</h4>
              <div className="space-y-1 text-xs text-green-200">
                <p>• <strong>W:</strong> Mover hacia adelante</p>
                <p>• <strong>S:</strong> Mover hacia atrás</p>
                <p>• <strong>A:</strong> Mover a la izquierda</p>
                <p>• <strong>D:</strong> Mover a la derecha</p>
                <p>• <strong>Q:</strong> Mover hacia abajo</p>
                <p>• <strong>E:</strong> Mover hacia arriba</p>
                <p>• <strong>Shift:</strong> Movimiento rápido</p>
              </div>
            </div>

            {/* Modos de interacción */}
            <div className="p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-300 mb-2">🎮 Modos de Interacción</h4>
              <div className="space-y-1 text-xs text-blue-200">
                <p>• <strong>Clic corto:</strong> Toca una nota con duración configurable</p>
                <p>• <strong>Clic sostenido:</strong> Mantén presionado para sonido continuo (gate)</p>
                <p>• <strong>Botón de audio:</strong> Activa/desactiva el sonido permanente</p>
              </div>
            </div>

            {/* Información sobre zonas de efectos */}
            <div className="p-3 bg-purple-900/20 border border-purple-700/50 rounded-lg">
              <h4 className="text-sm font-semibold text-purple-300 mb-2">🎛️ Zonas de Efectos</h4>
              <div className="space-y-1 text-xs text-purple-200">
                                    <p>• <strong>Zonas Phaser:</strong> Aplican efectos de modulación de fase</p>
                    <p>• <strong>Zonas AutoFilter:</strong> Aplican filtros automáticos con LFO</p>
                    <p>• <strong>Zonas AutoWah:</strong> Aplican filtros automáticos con seguimiento de amplitud</p>
                    <p>• <strong>Zonas BitCrusher:</strong> Aplican efectos de reducción de bits y frecuencia</p>
                    <p>• <strong>Zonas Chebyshev:</strong> Aplican efectos de distorsión polinomial</p>
                    <p>• <strong>Zonas Chorus:</strong> Aplican efectos de coro estéreo con LFO</p>
                    <p>• <strong>Detección automática:</strong> Los objetos dentro de la zona se procesan</p>
                    <p>• <strong>Bloqueo:</strong> Usa el candado para proteger zonas de cambios</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sección de Añadir Objeto */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="text-xl">➕</span>
            Objetos Sonoros
          </h3>
          <button
            onClick={() => setIsAddMenuExpanded(!isAddMenuExpanded)}
            className="text-purple-400 hover:text-purple-300 transition-all duration-300 hover:scale-110 p-2 rounded-lg hover:bg-purple-500/20"
            title={isAddMenuExpanded ? "Ocultar menú" : "Mostrar menú"}
          >
            {isAddMenuExpanded ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
        </div>
        
        {isAddMenuExpanded && (
          <div className="space-y-3">


            {/* Slider de navegación para objetos sonoros */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-cyan-300 mb-2">
                <span>Objetos Disponibles</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={scrollLeft}
                    className="text-cyan-400 hover:text-cyan-300 transition-all duration-300 hover:scale-110 p-1 rounded-lg hover:bg-cyan-500/20"
                    title="Scroll izquierda"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="text-xs bg-cyan-500/20 px-2 py-1 rounded-full">Scroll</span>
                  <button
                    onClick={scrollRight}
                    className="text-cyan-400 hover:text-cyan-300 transition-all duration-300 hover:scale-110 p-1 rounded-lg hover:bg-cyan-500/20"
                    title="Scroll derecha"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="w-full h-1 bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-pink-500/30 rounded-full"></div>
            </div>

            {/* Contenedor con scroll horizontal para los objetos */}
            <div 
              ref={scrollContainerRef}
              className="flex space-x-3 overflow-x-auto scrollbar-thin scroll-smooth scroll-fade pb-2"
            >
              <button
                onClick={handleAddCube}
                className="flex-shrink-0 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2 min-w-[120px]"
              >
                <span>⬜</span>
                <span>Cubo</span>
              </button>
              
              <button
                onClick={handleAddSphere}
                className="flex-shrink-0 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center space-x-2 min-w-[120px]"
              >
                <span>🔵</span>
                <span>Esfera</span>
              </button>
              
              <button
                onClick={handleAddCylinder}
                className="flex-shrink-0 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center space-x-2 min-w-[120px]"
              >
                <span>🔶</span>
                <span>Cilindro</span>
              </button>
              
              <button
                onClick={handleAddCone}
                className="flex-shrink-0 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2 min-w-[120px]"
              >
                <span>🥁</span>
                <span>Cono</span>
              </button>
              
              <button
                onClick={handleAddPyramid}
                className="flex-shrink-0 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center space-x-2 min-w-[120px]"
              >
                <span>🔺</span>
                <span>Pirámide</span>
              </button>
              
              <button
                onClick={handleAddIcosahedron}
                className="flex-shrink-0 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors flex items-center justify-center space-x-2 min-w-[120px]"
              >
                <span>🔶</span>
                <span>Icosaedro</span>
              </button>
              
              <button
                onClick={handleAddPlane}
                className="flex-shrink-0 px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors flex items-center justify-center space-x-2 min-w-[120px]"
              >
                <span>🟦</span>
                <span>Plano</span>
              </button>
              
              <button
                onClick={handleAddTorus}
                className="flex-shrink-0 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors flex items-center justify-center space-x-2 min-w-[120px]"
              >
                <span>🔄</span>
                <span>Toroide</span>
              </button>

              <button
                onClick={handleAddDodecahedronRing}
                className="flex-shrink-0 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center justify-center space-x-2 min-w-[120px]"
              >
                <span>🔷</span>
                <span>Anillo de Dodecaedros</span>
              </button>

              <button
                onClick={handleAddSpiral}
                className="flex-shrink-0 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors flex items-center justify-center space-x-2 min-w-[120px]"
              >
                <span>🌀</span>
                <span>Espiral de Samples</span>
              </button>

            </div>
          </div>
        )}
      </div>

      {/* Sección de Zonas de Efectos */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="text-xl">🎛️</span>
            Zonas de Efectos
          </h3>
          <button
            onClick={() => setIsEffectsExpanded(!isEffectsExpanded)}
            className="text-pink-400 hover:text-pink-300 transition-all duration-300 hover:scale-110 p-2 rounded-lg hover:bg-pink-500/20"
            title={isEffectsExpanded ? "Ocultar menú" : "Mostrar menú"}
          >
            {isEffectsExpanded ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
        </div>
        
        {isEffectsExpanded && (
          <div className="space-y-3">
            {/* Slider de navegación para zonas de efectos */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-cyan-300 mb-2">
                <span>Efectos Disponibles</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={scrollEffectsLeft}
                    className="text-cyan-400 hover:text-cyan-300 transition-all duration-300 hover:scale-110 p-1 rounded-lg hover:bg-cyan-500/20"
                    title="Scroll izquierda"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="text-xs bg-cyan-500/20 px-2 py-1 rounded-full">Scroll</span>
                  <button
                    onClick={scrollEffectsRight}
                    className="text-cyan-400 hover:text-cyan-300 transition-all duration-300 hover:scale-110 p-1 rounded-lg hover:bg-cyan-500/20"
                    title="Scroll derecha"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="w-full h-1 bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-pink-500/30 rounded-full"></div>
            </div>

            {/* Contenedor con scroll horizontal para las zonas de efectos */}
            <div 
              ref={effectsScrollContainerRef}
              className="flex space-x-3 overflow-x-auto scrollbar-thin scroll-smooth scroll-fade pb-2"
            >
              <button
                onClick={handleAddPhaserZone}
                className="flex-shrink-0 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center space-x-2 min-w-[120px]"
              >
                <span>🎛️</span>
                <span>Phaser</span>
              </button>
              
              <button
                onClick={handleAddAutoFilterZone}
                className="flex-shrink-0 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2 min-w-[120px]"
              >
                <span>🎛️</span>
                <span>AutoFilter</span>
              </button>
              
              <button
                onClick={handleAddAutoWahZone}
                className="flex-shrink-0 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2 min-w-[120px]"
              >
                <span>🎛️</span>
                <span>AutoWah</span>
              </button>
              
              <button
                onClick={handleAddBitCrusherZone}
                className="flex-shrink-0 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center space-x-2 min-w-[120px]"
              >
                <span>🎛️</span>
                <span>BitCrusher</span>
              </button>
              
              <button
                onClick={handleAddChebyshevZone}
                className="flex-shrink-0 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center justify-center space-x-2 min-w-[120px]"
              >
                <span>🎛️</span>
                <span>Chebyshev</span>
              </button>
              
              <button
                onClick={handleAddChorusZone}
                className="flex-shrink-0 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors flex items-center justify-center space-x-2 min-w-[120px]"
              >
                <span>🎛️</span>
                <span>Chorus</span>
              </button>

              <button
                onClick={handleAddDistortionZone}
                className="flex-shrink-0 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center space-x-2 min-w-[120px]"
              >
                <span>🎛️</span>
                <span>Distortion</span>
              </button>

              <button
                onClick={handleAddFeedbackDelayZone}
                className="flex-shrink-0 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors flex items-center justify-center space-x-2 min-w-[120px]"
              >
                <span>🎛️</span>
                <span>FeedbackDelay</span>
              </button>

              <button
                onClick={handleAddFreeverbZone}
                className="flex-shrink-0 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors flex items-center justify-center space-x-2 min-w-[120px]"
              >
                <span>🎛️</span>
                <span>Freeverb</span>
              </button>

              <button
                onClick={handleAddFrequencyShifterZone}
                className="flex-shrink-0 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center space-x-2 min-w-[120px]"
              >
                <span>🎛️</span>
                <span>FrequencyShifter</span>
              </button>

              <button
                onClick={handleAddJCReverbZone}
                className="flex-shrink-0 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors flex items-center justify-center space-x-2 min-w-[120px]"
              >
                <span>🎛️</span>
                <span>JCReverb</span>
              </button>

              <button
                onClick={handleAddPingPongDelayZone}
                className="flex-shrink-0 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors flex items-center justify-center space-x-2 min-w-[120px]"
              >
                <span>🎛️</span>
                <span>PingPongDelay</span>
              </button>

              <button
                onClick={handleAddPitchShiftZone}
                className="flex-shrink-0 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors flex items-center justify-center space-x-2 min-w-[120px]"
              >
                <span>🎛️</span>
                <span>PitchShift</span>
              </button>

              <button
                onClick={handleAddReverbZone}
                className="flex-shrink-0 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center justify-center space-x-2 min-w-[120px]"
              >
                <span>🎛️</span>
                <span>Reverb</span>
              </button>

              <button
                onClick={handleAddStereoWidenerZone}
                className="flex-shrink-0 px-4 py-2 bg-lime-500 text-white rounded-lg hover:bg-lime-600 transition-colors flex items-center justify-center space-x-2 min-w-[120px]"
              >
                <span>🎛️</span>
                <span>StereoWidener</span>
              </button>

              <button
                onClick={handleAddTremoloZone}
                className="flex-shrink-0 px-4 py-2 bg-fuchsia-500 text-white rounded-lg hover:bg-fuchsia-600 transition-colors flex items-center justify-center space-x-2 min-w-[120px]"
              >
                <span>🎛️</span>
                <span>Tremolo</span>
              </button>
              
              <button
                onClick={handleAddVibratoZone}
                className="flex-shrink-0 px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center justify-center space-x-2 min-w-[120px]"
              >
                <span>🎛️</span>
                <span>Vibrato</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sección de Objeto Móvil */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="text-xl">🚀</span>
            Objeto Móvil
          </h3>
          <button
            onClick={() => setIsMobileObjectExpanded(!isMobileObjectExpanded)}
            className="text-purple-400 hover:text-purple-300 transition-all duration-300 hover:scale-110 p-2 rounded-lg hover:bg-purple-500/20"
            title={isMobileObjectExpanded ? "Ocultar menú" : "Mostrar menú"}
          >
            {isMobileObjectExpanded ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
        </div>
        
        {isMobileObjectExpanded && (
          <div className="space-y-3">
            <button
              onClick={handleAddMobileObject}
              className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center justify-center space-x-3 group shadow-lg hover:shadow-purple-500/25"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform duration-200">🚀</span>
              <span className="font-medium text-lg">Añadir Objeto Móvil</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
