'use client';

import { useState } from 'react';
import { useWorldStore } from '../../state/useWorldStore';

export function ControlPanel() {
  const [isAddMenuExpanded, setIsAddMenuExpanded] = useState(false);
  const [isControlsExpanded, setIsControlsExpanded] = useState(false);
  const [isEffectsExpanded, setIsEffectsExpanded] = useState(false);
  const { addObject, addEffectZone } = useWorldStore();

  const handleAddCube = () => {
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    addObject('cube', [x, 0.5, z]);
  };

  const handleAddSphere = () => {
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    addObject('sphere', [x, 0.5, z]);
  };

  const handleAddCylinder = () => {
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    addObject('cylinder', [x, 0.5, z]);
  };

  const handleAddCone = () => {
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    addObject('cone', [x, 0.5, z]);
  };

  const handleAddPyramid = () => {
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    addObject('pyramid', [x, 0.5, z]);
  };

  const handleAddIcosahedron = () => {
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    addObject('icosahedron', [x, 0.5, z]);
  };

  const handleAddPlane = () => {
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    addObject('plane', [x, 0.5, z]);
  };

  const handleAddTorus = () => {
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    addObject('torus', [x, 0.5, z]);
  };

  const handleAddDodecahedronRing = () => {
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    addObject('dodecahedronRing', [x, 0.5, z]);
  };

  const handleAddSpiral = () => {
    // Añadir espiral de samples en posición aleatoria
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    addObject('spiral', [x, 0.5, z]);
  };

  const handleAddPhaserZone = () => {
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    addEffectZone('phaser', [x, 1, z], 'sphere'); // Usar 'sphere' como forma por defecto
  };

  const handleAddAutoFilterZone = () => {
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    addEffectZone('autoFilter', [x, 1, z], 'sphere'); // Usar 'sphere' como forma por defecto
  };

  const handleAddAutoWahZone = () => {
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    addEffectZone('autoWah', [x, 1, z], 'sphere'); // Usar 'sphere' como forma por defecto
  };

  const handleAddBitCrusherZone = () => {
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    addEffectZone('bitCrusher', [x, 1, z], 'sphere'); // Usar 'sphere' como forma por defecto
  };

  const handleAddChebyshevZone = () => {
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    addEffectZone('chebyshev', [x, 1, z], 'sphere'); // Usar 'sphere' como forma por defecto
  };

  const handleAddChorusZone = () => {
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    addEffectZone('chorus', [x, 1, z], 'sphere'); // Usar 'sphere' como forma por defecto
  };

  const handleAddDistortionZone = () => {
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    addEffectZone('distortion', [x, 1, z], 'sphere');
  };

  const handleAddFeedbackDelayZone = () => {
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    addEffectZone('feedbackDelay', [x, 1, z], 'sphere');
  };

  const handleAddFreeverbZone = () => {
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    addEffectZone('freeverb', [x, 1, z], 'sphere');
  };

  const handleAddFrequencyShifterZone = () => {
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    addEffectZone('frequencyShifter', [x, 1, z], 'sphere');
  };

  const handleAddJCReverbZone = () => {
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    addEffectZone('jcReverb', [x, 1, z], 'sphere');
  };

  const handleAddPingPongDelayZone = () => {
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    addEffectZone('pingPongDelay', [x, 1, z], 'sphere');
  };

  const handleAddPitchShiftZone = () => {
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    addEffectZone('pitchShift', [x, 1, z], 'sphere');
  };

  const handleAddReverbZone = () => {
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    addEffectZone('reverb', [x, 1, z], 'sphere');
  };

  const handleAddStereoWidenerZone = () => {
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    addEffectZone('stereoWidener', [x, 1, z], 'sphere');
  };

  const handleAddTremoloZone = () => {
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    addEffectZone('tremolo', [x, 1, z], 'sphere');
  };

  const handleAddVibratoZone = () => {
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    addEffectZone('vibrato', [x, 1, z], 'sphere');
  };

  return (
      <div className="fixed top-4 left-4 bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-4 z-50 min-w-[280px] max-w-[320px] max-h-[70vh] overflow-hidden">
      {/* Efecto de brillo interior */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 rounded-2xl pointer-events-none"></div>
      
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
          <div className="space-y-3">
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
            Añadir objeto
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
            {/* Separador para objetos sonoros */}
            <div className="text-center">
              <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">🎵 Objetos Sonoros</span>
            </div>

            <button
              onClick={handleAddCube}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
            >
              <span>⬜</span>
              <span>Cubo</span>
            </button>
            
            <button
              onClick={handleAddSphere}
              className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center space-x-2"
            >
              <span>🔵</span>
              <span>Esfera</span>
            </button>
            
            <button
              onClick={handleAddCylinder}
              className="w-full px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center space-x-2"
            >
              <span>🔶</span>
              <span>Cilindro</span>
            </button>
            
            <button
              onClick={handleAddCone}
              className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2"
            >
              <span>🥁</span>
              <span>Cono</span>
            </button>
            
            <button
              onClick={handleAddPyramid}
              className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
            >
              <span>🔺</span>
              <span>Pirámide</span>
            </button>
            
            <button
              onClick={handleAddIcosahedron}
              className="w-full px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors flex items-center justify-center space-x-2"
            >
              <span>🔶</span>
              <span>Icosaedro</span>
            </button>
            
            <button
              onClick={handleAddPlane}
              className="w-full px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors flex items-center justify-center space-x-2"
            >
              <span>🟦</span>
              <span>Plano</span>
            </button>
            
            <button
              onClick={handleAddTorus}
              className="w-full px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors flex items-center justify-center space-x-2"
            >
              <span>🔄</span>
              <span>Toroide</span>
            </button>

            <button
              onClick={handleAddDodecahedronRing}
              className="w-full px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center justify-center space-x-2"
            >
              <span>🔷</span>
              <span>Anillo de Dodecaedros</span>
            </button>

            <button
              onClick={handleAddSpiral}
              className="w-full px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors flex items-center justify-center space-x-2"
            >
              <span>🌀</span>
              <span>Espiral de Samples</span>
            </button>
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
          <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/50 scrollbar-track-transparent">
            {/* Slider de navegación */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-cyan-300 mb-2">
                <span>Efectos Disponibles</span>
                <span className="text-xs bg-cyan-500/20 px-2 py-1 rounded-full">Scroll ↓</span>
              </div>
              <div className="w-full h-1 bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-pink-500/30 rounded-full"></div>
            </div>

            <button
              onClick={handleAddPhaserZone}
              className="w-full px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200 flex items-center justify-center space-x-2 group"
            >
              <span className="text-lg group-hover:scale-105 transition-transform duration-200">🎛️</span>
              <span className="font-medium text-sm">Zona de Phaser (sphere)</span>
            </button>
            
            <button
              onClick={handleAddAutoFilterZone}
              className="w-full px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200 flex items-center justify-center space-x-2 group"
            >
              <span className="text-lg group-hover:scale-105 transition-transform duration-200">🎛️</span>
              <span className="font-medium text-sm">Zona de AutoFilter (sphere)</span>
            </button>
            
            <button
              onClick={handleAddAutoWahZone}
              className="w-full px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200 flex items-center justify-center space-x-2 group"
            >
              <span className="text-lg group-hover:scale-105 transition-transform duration-200">🎛️</span>
              <span className="font-medium text-sm">Zona de AutoWah (sphere)</span>
            </button>
            
            <button
              onClick={handleAddBitCrusherZone}
              className="w-full px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200 flex items-center justify-center space-x-2 group"
            >
              <span className="text-lg group-hover:scale-105 transition-transform duration-200">🎛️</span>
              <span className="font-medium text-sm">Zona de BitCrusher (sphere)</span>
            </button>
            
            <button
              onClick={handleAddChebyshevZone}
              className="w-full px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200 flex items-center justify-center space-x-2 group"
            >
              <span className="text-lg group-hover:scale-105 transition-transform duration-200">🎛️</span>
              <span className="font-medium text-sm">Zona de Chebyshev (sphere)</span>
            </button>
            
            <button
              onClick={handleAddChorusZone}
              className="w-full px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200 flex items-center justify-center space-x-2 group"
            >
              <span className="text-lg group-hover:scale-105 transition-transform duration-200">🎛️</span>
              <span className="font-medium text-sm">Zona de Chorus (sphere)</span>
            </button>

            <button
              onClick={handleAddDistortionZone}
              className="w-full px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200 flex items-center justify-center space-x-2 group"
            >
              <span className="text-lg group-hover:scale-105 transition-transform duration-200">🎛️</span>
              <span className="font-medium text-sm">Zona de Distortion (sphere)</span>
            </button>

            <button
              onClick={handleAddFeedbackDelayZone}
              className="w-full px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200 flex items-center justify-center space-x-2 group"
            >
              <span className="text-lg group-hover:scale-105 transition-transform duration-200">🎛️</span>
              <span className="font-medium text-sm">Zona de FeedbackDelay (sphere)</span>
            </button>

            <button
              onClick={handleAddFreeverbZone}
              className="w-full px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200 flex items-center justify-center space-x-2 group"
            >
              <span className="text-lg group-hover:scale-105 transition-transform duration-200">🎛️</span>
              <span className="font-medium text-sm">Zona de Freeverb (sphere)</span>
            </button>

            <button
              onClick={handleAddFrequencyShifterZone}
              className="w-full px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200 flex items-center justify-center space-x-2 group"
            >
              <span className="text-lg group-hover:scale-105 transition-transform duration-200">🎛️</span>
              <span className="font-medium text-sm">Zona de FrequencyShifter (sphere)</span>
            </button>

            <button
              onClick={handleAddJCReverbZone}
              className="w-full px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200 flex items-center justify-center space-x-2 group"
            >
              <span className="text-lg group-hover:scale-105 transition-transform duration-200">🎛️</span>
              <span className="font-medium text-sm">Zona de JCReverb (sphere)</span>
            </button>

            <button
              onClick={handleAddPingPongDelayZone}
              className="w-full px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200 flex items-center justify-center space-x-2 group"
            >
              <span className="text-lg group-hover:scale-105 transition-transform duration-200">🎛️</span>
              <span className="font-medium text-sm">Zona de PingPongDelay (sphere)</span>
            </button>

            <button
              onClick={handleAddPitchShiftZone}
              className="w-full px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200 flex items-center justify-center space-x-2 group"
            >
              <span className="text-lg group-hover:scale-105 transition-transform duration-200">🎛️</span>
              <span className="font-medium text-sm">Zona de PitchShift (sphere)</span>
            </button>

            <button
              onClick={handleAddReverbZone}
              className="w-full px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200 flex items-center justify-center space-x-2 group"
            >
              <span className="text-lg group-hover:scale-105 transition-transform duration-200">🎛️</span>
              <span className="font-medium text-sm">Zona de Reverb (sphere)</span>
            </button>

            <button
              onClick={handleAddStereoWidenerZone}
              className="w-full px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200 flex items-center justify-center space-x-2 group"
            >
              <span className="text-lg group-hover:scale-105 transition-transform duration-200">🎛️</span>
              <span className="font-medium text-sm">Zona de StereoWidener (sphere)</span>
            </button>

            <button
              onClick={handleAddTremoloZone}
              className="w-full px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200 flex items-center justify-center space-x-2 group"
            >
              <span className="text-lg group-hover:scale-105 transition-transform duration-200">🎛️</span>
              <span className="font-medium text-sm">Zona de Tremolo (sphere)</span>
            </button>
            
            <button
              onClick={handleAddVibratoZone}
              className="w-full px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200 flex items-center justify-center space-x-2 group"
            >
              <span className="text-lg group-hover:scale-105 transition-transform duration-200">🎛️</span>
              <span className="font-medium text-sm">Zona de Vibrato (sphere)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
