'use client';

import { useState, useEffect } from 'react';
import { useWorldStore } from '../../state/useWorldStore';
import { PersistencePanel } from './PersistencePanel';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  Cog6ToothIcon, 
  MusicalNoteIcon, 
  SpeakerWaveIcon, 
  RocketLaunchIcon, 
  Squares2X2Icon,
  CameraIcon,
  ComputerDesktopIcon,
  CursorArrowRaysIcon,
  TrashIcon,
  CommandLineIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { 
  Box, 
  Circle, 
  Square, 
  Hexagon, 
  Triangle,
  RotateCcw,
  CircleDot,
  Loader2
} from 'lucide-react';

export function ControlPanel() {
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);
  const [isAddMenuExpanded, setIsAddMenuExpanded] = useState(false);
  const [isControlsExpanded, setIsControlsExpanded] = useState(false);
  const [isEffectsExpanded, setIsEffectsExpanded] = useState(false);
  const [isMobileObjectExpanded, setIsMobileObjectExpanded] = useState(false);
  const [isGridsExpanded, setIsGridsExpanded] = useState(false);
  const [newGridPosition, setNewGridPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [newGridSize, setNewGridSize] = useState<number>(20);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const { addObject, addEffectZone, addMobileObject, activeGridId, grids, createGrid, currentGridCoordinates, gridSize } = useWorldStore();
  const { t } = useLanguage();
  
  // Obtener información de la cuadrícula activa
  const activeGrid = activeGridId ? grids.get(activeGridId) : null;

  // Función helper para crear objetos en la cuadrícula activa
  const createObjectInActiveGrid = (type: string) => {
    console.log('🎛️ ControlPanel.createObjectInActiveGrid: INICIANDO', { type, activeGrid, activeGridId });
    
    if (!activeGrid) {
      console.log('🎛️ ControlPanel.createObjectInActiveGrid: ERROR - No hay cuadrícula activa');
      return;
    }
    
    // Calcular posición relativa a la cuadrícula activa (posición local)
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    const position: [number, number, number] = [x, 0.5, z];
    
    console.log('🎛️ ControlPanel.createObjectInActiveGrid: Llamando addObject', { type, position });
    addObject(type as 'cube' | 'sphere' | 'cylinder' | 'cone' | 'pyramid' | 'icosahedron' | 'plane' | 'torus' | 'dodecahedronRing' | 'spiral', position);
  };

  // Funciones para controlar la cámara
  const toggleCamera = () => {
    const newState = !isCameraEnabled;
    const event = new CustomEvent('camera-toggle', { 
      detail: { enabled: newState } 
    });
    window.dispatchEvent(event);
    setIsCameraEnabled(newState);
    console.log(`🎥 Camera controls ${newState ? 'enabled' : 'disabled'}`);
  };

  const enableCamera = () => {
    const event = new CustomEvent('camera-toggle', { 
      detail: { enabled: true } 
    });
    window.dispatchEvent(event);
    setIsCameraEnabled(true);
    console.log('🎥 Camera controls enabled');
  };

  const disableCamera = () => {
    const event = new CustomEvent('camera-toggle', { 
      detail: { enabled: false } 
    });
    window.dispatchEvent(event);
    setIsCameraEnabled(false);
    console.log('🎥 Camera controls disabled');
  };

  const debugCamera = () => {
    const event = new CustomEvent('camera-debug-request');
    window.dispatchEvent(event);
  };

  // Escuchar eventos de cambio de estado de la cámara
  useEffect(() => {
    const handleCameraStateChange = (event: CustomEvent) => {
      setIsCameraEnabled(event.detail.enabled);
    };

    window.addEventListener('camera-state-change', handleCameraStateChange as EventListener);

    return () => {
      window.removeEventListener('camera-state-change', handleCameraStateChange as EventListener);
    };
  }, []);

  // Función helper para crear zonas de efecto en la cuadrícula activa
  const createEffectZoneInActiveGrid = (type: string) => {
    if (!activeGrid) {
      return;
    }
    
    // Calcular posición relativa a la cuadrícula activa (posición local)
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    addEffectZone(type as 'phaser' | 'autoFilter' | 'autoWah' | 'bitCrusher' | 'chebyshev' | 'chorus' | 'distortion' | 'feedbackDelay' | 'freeverb' | 'frequencyShifter' | 'jcReverb' | 'pingPongDelay' | 'pitchShift' | 'reverb' | 'stereoWidener' | 'tremolo' | 'vibrato', [x, 1, z], 'sphere');
  };

  // Función helper para crear objetos móviles en la cuadrícula activa
  const createMobileObjectInActiveGrid = () => {
    
    if (!activeGrid) {
      return;
    }
    
    // Calcular posición relativa a la cuadrícula activa (posición local)
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    const finalPosition: [number, number, number] = [x, 0.5, z];
    
    
    addMobileObject(finalPosition);
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
      {/* Botón de toggle futurista */}
      <button
        onClick={() => setIsPanelExpanded(!isPanelExpanded)}
        className="relative bg-black border border-white p-3 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300 group"
        title={isPanelExpanded ? t('ui.collapsePanel') : t('ui.expandPanel')}
      >
        {/* Decoraciones de esquina */}
        <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
        <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
        <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
        
        {isPanelExpanded ? (
          <svg className="w-4 h-4 text-white group-hover:text-black transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-white group-hover:text-black transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </button>

      {/* Panel principal futurista */}
      <div className={`relative bg-black border border-white transition-all duration-300 overflow-hidden ${
        isPanelExpanded ? 'w-80' : 'w-0'
      }`}>
        {/* Grid pattern background */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        {/* Scan lines effect */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Scanner line effect */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div 
              className="absolute w-full h-1 bg-white shadow-lg shadow-white/80"
              style={{
                animation: 'scanner 2s linear infinite',
                top: '-8px'
              }}
            ></div>
          </div>
        </div>
        
        <div className="p-4 h-full overflow-y-auto">
          {isPanelExpanded && (
            <>
              {/* Sección de Controles */}
      <div className="mb-4 relative">
        {/* Contenedor con borde complejo */}
        <div className="relative border border-white p-3">
          {/* Decoraciones de esquina */}
          <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
          <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
          <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
          
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-mono font-bold text-white tracking-wider flex items-center gap-2">
              <Cog6ToothIcon className="w-3 h-3" />
              {t('controls.controls')}
            </h3>
            <button
              onClick={() => setIsControlsExpanded(!isControlsExpanded)}
              className="relative border border-white px-2 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group"
              title={isControlsExpanded ? "Ocultar controles" : "Mostrar controles"}
            >
              <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
              <span className="relative text-xs font-mono tracking-wider">
                {isControlsExpanded ? t('controls.hide') : t('controls.show')}
              </span>
            </button>
          </div>
          
          {isControlsExpanded && (
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {/* Controles básicos */}
              <div className="p-2 border border-gray-600 text-xs text-gray-300 font-mono">
                <div className="space-y-1">
                  <p className="flex items-center gap-2"><CameraIcon className="w-3 h-3" /><span className="text-white">{t('controls.camera')}</span> {t('controls.clickRotateScrollZoom')}</p>
                  <p className="flex items-center gap-2"><ComputerDesktopIcon className="w-3 h-3" /><span className="text-white">{t('controls.wasd')}</span> {t('controls.movementShiftFast')}</p>
                  <p className="flex items-center gap-2"><CursorArrowRaysIcon className="w-3 h-3" /><span className="text-white">{t('controls.click')}</span> {t('controls.selectObjects')}</p>
                  <p className="flex items-center gap-2"><TrashIcon className="w-3 h-3" /><span className="text-white">{t('controls.delete')}</span> {t('controls.removeSelected')}</p>
                  <p className="flex items-center gap-2"><CommandLineIcon className="w-3 h-3" /><span className="text-white">{t('controls.grs')}</span> {t('controls.transformModes')}</p>
                  <p className="flex items-center gap-2"><XMarkIcon className="w-3 h-3" /><span className="text-white">{t('controls.esc')}</span> {t('controls.exitEditMode')}</p>
                </div>
              </div>

              {/* Controles de cámara */}
              <div className="p-2 border border-gray-600 text-xs text-gray-300 font-mono">
                <div className="space-y-2">
                  {/* Estado de la cámara */}
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isCameraEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-white">
                      {isCameraEnabled ? 'Cámara Activa' : 'Cámara Bloqueada'}
                    </span>
                  </div>

                  {/* Botones de control */}
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      onClick={toggleCamera}
                      className={`px-1 py-1 text-xs font-mono border transition-all duration-300 ${
                        isCameraEnabled
                          ? 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white'
                          : 'border-green-500 text-green-500 hover:bg-green-500 hover:text-white'
                      }`}
                    >
                      {isCameraEnabled ? 'Bloquear' : 'Activar'}
                    </button>

                    <button
                      onClick={enableCamera}
                      className="px-1 py-1 text-xs font-mono border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-all duration-300"
                    >
                      Forzar ON
                    </button>

                    <button
                      onClick={disableCamera}
                      className="px-1 py-1 text-xs font-mono border border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white transition-all duration-300"
                    >
                      Forzar OFF
                    </button>

                    <button
                      onClick={debugCamera}
                      className="px-1 py-1 text-xs font-mono border border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white transition-all duration-300"
                    >
                      Debug
                    </button>
                  </div>

                  {/* Información de estado */}
                  {isCameraEnabled ? (
                    <p className="text-green-400">
                      ✅ Puedes rotar la cámara con el mouse
                    </p>
                  ) : (
                    <p className="text-red-400">
                      ⚠️ La cámara está bloqueada
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>


      {/* Sección de Añadir Objeto */}
      <div className="mb-4 relative">
        {/* Contenedor con borde complejo */}
        <div className="relative border border-white p-3">
          {/* Decoraciones de esquina */}
          <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
          <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
          <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
          
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-mono font-bold text-white tracking-wider flex items-center gap-2">
              <MusicalNoteIcon className="w-3 h-3" />
              {t('controls.soundObjects')}
            </h3>
            <button
              onClick={() => setIsAddMenuExpanded(!isAddMenuExpanded)}
              className="relative border border-white px-2 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group"
              title={isAddMenuExpanded ? "Ocultar menú" : "Mostrar menú"}
            >
              <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
              <span className="relative text-xs font-mono tracking-wider">
                {isAddMenuExpanded ? t('controls.hide') : t('controls.show')}
              </span>
            </button>
          </div>
          
          {isAddMenuExpanded && (
            <div className="space-y-1">
              {/* Botones futuristas en grid */}
              <div className="grid grid-cols-2 gap-1">
                <button onClick={handleAddCube} className="relative border border-white px-2 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider flex items-center gap-2"><Box className="w-3 h-3" />{t('controls.cube')}</span>
                </button>
                <button onClick={handleAddSphere} className="relative border border-white px-2 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider flex items-center gap-2"><Circle className="w-3 h-3" />{t('controls.sphere')}</span>
                </button>
                <button onClick={handleAddCylinder} className="relative border border-white px-2 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider flex items-center gap-2"><Square className="w-3 h-3" />{t('controls.cylinder')}</span>
                </button>
                <button onClick={handleAddCone} className="relative border border-white px-2 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider flex items-center gap-2"><Triangle className="w-3 h-3" />{t('controls.cone')}</span>
                </button>
                <button onClick={handleAddPyramid} className="relative border border-white px-2 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider flex items-center gap-2"><Triangle className="w-3 h-3" />{t('controls.pyramid')}</span>
                </button>
                <button onClick={handleAddIcosahedron} className="relative border border-white px-2 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider flex items-center gap-2"><Hexagon className="w-3 h-3" />{t('controls.icosahedron')}</span>
                </button>
                <button onClick={handleAddPlane} className="relative border border-white px-2 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider flex items-center gap-2"><Square className="w-3 h-3" />{t('controls.plane')}</span>
                </button>
                <button onClick={handleAddTorus} className="relative border border-white px-2 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider flex items-center gap-2"><RotateCcw className="w-3 h-3" />{t('controls.torus')}</span>
                </button>
                <button onClick={handleAddDodecahedronRing} className="relative border border-white px-2 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider flex items-center gap-2"><CircleDot className="w-3 h-3" />{t('controls.ring')}</span>
                </button>
                <button onClick={handleAddSpiral} className="relative border border-white px-2 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider flex items-center gap-2"><Loader2 className="w-3 h-3" />SPIRAL</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sección de Zonas de Efectos */}
      <div className="mb-4 relative">
        {/* Contenedor con borde complejo */}
        <div className="relative border border-white p-3">
          {/* Decoraciones de esquina */}
          <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
          <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
          <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
          
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-mono font-bold text-white tracking-wider flex items-center gap-2">
              <SpeakerWaveIcon className="w-3 h-3" />
              {t('controls.effectZones')}
            </h3>
            <button
              onClick={() => setIsEffectsExpanded(!isEffectsExpanded)}
              className="relative border border-white px-2 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group"
              title={isEffectsExpanded ? "Ocultar menú" : "Mostrar menú"}
            >
              <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
              <span className="relative text-xs font-mono tracking-wider">
                {isEffectsExpanded ? t('controls.hide') : t('controls.show')}
              </span>
            </button>
          </div>
          
          {isEffectsExpanded && (
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {/* Botones futuristas en grid */}
              <div className="grid grid-cols-2 gap-1">
                <button onClick={handleAddPhaserZone} className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider">{t('controls.phaser')}</span>
                </button>
                <button onClick={handleAddAutoFilterZone} className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider">{t('controls.autoFilter')}</span>
                </button>
                <button onClick={handleAddAutoWahZone} className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider">{t('controls.autoWah')}</span>
                </button>
                <button onClick={handleAddBitCrusherZone} className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider">{t('controls.bitCrusher')}</span>
                </button>
                <button onClick={handleAddChebyshevZone} className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider">{t('controls.chebyshev')}</span>
                </button>
                <button onClick={handleAddChorusZone} className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider">{t('controls.chorus')}</span>
                </button>
                <button onClick={handleAddDistortionZone} className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider">{t('controls.distortion')}</span>
                </button>
                <button onClick={handleAddFeedbackDelayZone} className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider">{t('controls.feedbackDelay')}</span>
                </button>
                <button onClick={handleAddFreeverbZone} className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider">{t('controls.freeverb')}</span>
                </button>
                <button onClick={handleAddFrequencyShifterZone} className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider">{t('controls.freqShifter')}</span>
                </button>
                <button onClick={handleAddJCReverbZone} className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider">{t('controls.jcReverb')}</span>
                </button>
                <button onClick={handleAddPingPongDelayZone} className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider">{t('controls.pingPong')}</span>
                </button>
                <button onClick={handleAddPitchShiftZone} className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider">{t('controls.pitchShift')}</span>
                </button>
                <button onClick={handleAddReverbZone} className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider">{t('controls.reverb')}</span>
                </button>
                <button onClick={handleAddStereoWidenerZone} className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider">{t('controls.stereoWidener')}</span>
                </button>
                <button onClick={handleAddTremoloZone} className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider">{t('controls.trem')}</span>
                </button>
                <button onClick={handleAddVibratoZone} className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider">{t('controls.vibrato')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Panel de Persistencia */}
      <PersistencePanel />

      {/* Sección de Objeto Móvil */}
      <div className="mb-4 relative">
        {/* Contenedor con borde complejo */}
        <div className="relative border border-white p-3">
          {/* Decoraciones de esquina */}
          <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
          <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
          <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
          
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-mono font-bold text-white tracking-wider flex items-center gap-2">
              <RocketLaunchIcon className="w-3 h-3" />
              {t('controls.mobileObjects')}
            </h3>
            <button
              onClick={() => setIsMobileObjectExpanded(!isMobileObjectExpanded)}
              className="relative border border-white px-2 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group"
              title={isMobileObjectExpanded ? "Ocultar menú" : "Mostrar menú"}
            >
              <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
              <span className="relative text-xs font-mono tracking-wider">
                {isMobileObjectExpanded ? t('controls.hide') : t('controls.show')}
              </span>
            </button>
          </div>
          
          {isMobileObjectExpanded && (
            <div className="space-y-1">
              <button
                onClick={handleAddMobileObject}
                className="relative w-full border border-white px-3 py-2 text-white hover:bg-white hover:text-black transition-all duration-300 group"
              >
                <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                <span className="relative text-xs font-mono tracking-wider flex items-center justify-center">
                  <span>{t('controls.createMobileObject')}</span>
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sección de Cuadrículas */}
      <div className="mb-4 relative">
        {/* Contenedor con borde complejo */}
        <div className="relative border border-white p-3">
          {/* Decoraciones de esquina */}
          <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
          <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
          <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
          
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-mono font-bold text-white tracking-wider flex items-center gap-2">
              <Squares2X2Icon className="w-3 h-3" />
              {t('controls.grids')}
            </h3>
            <button
              onClick={() => setIsGridsExpanded(!isGridsExpanded)}
              className="relative border border-white px-2 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group"
              title={isGridsExpanded ? "Ocultar cuadrículas" : "Mostrar cuadrículas"}
            >
              <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
              <span className="relative text-xs font-mono tracking-wider">
                {isGridsExpanded ? t('controls.hide') : t('controls.show')}
              </span>
            </button>
          </div>

          {/* Posición actual */}
          <div className="mb-2 p-2 border border-gray-600 text-xs text-gray-300 font-mono">
            <div className="space-y-1">
              <p><span className="text-white">{t('controls.pos')}</span> ({activeGrid ? activeGrid.coordinates[0] : currentGridCoordinates[0]}, {activeGrid ? activeGrid.coordinates[1] : currentGridCoordinates[1]}, {activeGrid ? activeGrid.coordinates[2] : currentGridCoordinates[2]})</p>
              {activeGrid && (
                <p><span className="text-white">{t('controls.active')}</span> {activeGrid.id.slice(0, 6)}...</p>
              )}
            </div>
          </div>

        {isGridsExpanded && (
          <div className="space-y-2">
            {/* Crear cuadrículas adyacentes */}
            <div className="space-y-1">
              <div className="text-xs font-mono font-bold text-white tracking-wider">{t('controls.adjacentGrids')}</div>
              
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => createGridAtPosition('west')}
                  className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group"
                  title="Oeste"
                >
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider">{t('controls.west')}</span>
                </button>
                <button
                  onClick={() => createGridAtPosition('east')}
                  className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group"
                  title="Este"
                >
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider">{t('controls.east')}</span>
                </button>
                <button
                  onClick={() => createGridAtPosition('south')}
                  className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group"
                  title="Sur"
                >
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider">{t('controls.south')}</span>
                </button>
                <button
                  onClick={() => createGridAtPosition('north')}
                  className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group"
                  title="Norte"
                >
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider">{t('controls.north')}</span>
                </button>
                <button
                  onClick={() => createGridAtPosition('down')}
                  className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group"
                  title="Abajo"
                >
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider">{t('controls.down')}</span>
                </button>
                <button
                  onClick={() => createGridAtPosition('up')}
                  className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group"
                  title="Arriba"
                >
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider">{t('controls.up')}</span>
                </button>
              </div>
            </div>

            {/* Crear cuadrícula personalizada */}
            <div className="space-y-1">
              <div className="text-xs font-mono font-bold text-white tracking-wider">{t('controls.customGrid')}</div>
              
              <div className="grid grid-cols-4 gap-1">
                <div>
                  <label className="text-xs text-gray-400 block font-mono tracking-wider">X</label>
                  <input
                    type="number"
                    value={newGridPosition[0]}
                    onChange={(e) => setNewGridPosition([parseInt(e.target.value) || 0, newGridPosition[1], newGridPosition[2]])}
                    className="w-full px-1 py-1 bg-black border border-gray-600 text-white text-xs font-mono focus:border-white focus:outline-none"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block font-mono tracking-wider">Y</label>
                  <input
                    type="number"
                    value={newGridPosition[1]}
                    onChange={(e) => setNewGridPosition([newGridPosition[0], parseInt(e.target.value) || 0, newGridPosition[2]])}
                    className="w-full px-1 py-1 bg-black border border-gray-600 text-white text-xs font-mono focus:border-white focus:outline-none"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block font-mono tracking-wider">Z</label>
                  <input
                    type="number"
                    value={newGridPosition[2]}
                    onChange={(e) => setNewGridPosition([newGridPosition[0], newGridPosition[1], parseInt(e.target.value) || 0])}
                    className="w-full px-1 py-1 bg-black border border-gray-600 text-white text-xs font-mono focus:border-white focus:outline-none"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block font-mono tracking-wider">{t('controls.size')}</label>
                  <input
                    type="number"
                    value={newGridSize}
                    onChange={(e) => setNewGridSize(parseInt(e.target.value) || 20)}
                    className="w-full px-1 py-1 bg-black border border-gray-600 text-white text-xs font-mono focus:border-white focus:outline-none"
                    placeholder="20"
                    min="5"
                    max="100"
                  />
                </div>
              </div>
              
              <button
                onClick={createGridAtCustomPosition}
                className="relative w-full border border-white px-2 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group"
                title="Crear cuadrícula en la posición especificada"
              >
                <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                <span className="relative text-xs font-mono tracking-wider flex items-center justify-center space-x-1">
                  <span>🎯</span>
                  <span>{t('controls.createGridButton')}</span>
                </span>
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
