'use client';

import { useState, useRef } from 'react';
import { useWorldStore } from '../../state/useWorldStore';
import { PersistencePanel } from './PersistencePanel';
import { useLanguage } from '../../contexts/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
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
  const { addObject, addEffectZone, addMobileObject, activeGridId, grids, createGrid, currentGridCoordinates, gridSize } = useWorldStore();
  const { t } = useLanguage();
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
    console.log(`🎯 createGridAtPosition llamado con dirección: ${direction}`);
    console.log(`🎯 activeGrid:`, activeGrid);
    console.log(`🎯 currentGridCoordinates:`, currentGridCoordinates);
    console.log(`🎯 gridSize:`, gridSize);
    
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
    
    console.log(`🎯 Nuevas coordenadas:`, newCoordinates);
    console.log(`🎯 Nueva posición:`, newPosition);
    
    createGrid(newPosition, gridSize);
    console.log(`🎯 createGrid llamado con posición:`, newPosition, `y tamaño:`, gridSize);
  };

  const createGridAtCustomPosition = () => {
    console.log(`🎯 createGridAtCustomPosition llamado`);
    console.log(`🎯 newGridPosition:`, newGridPosition);
    console.log(`🎯 newGridSize:`, newGridSize);
    createGrid(newGridPosition, newGridSize);
    console.log(`🎯 createGrid llamado con posición personalizada:`, newGridPosition, `y tamaño:`, newGridSize);
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
                  <p className="flex items-center gap-2"><CameraIcon className="w-3 h-3" /><span className="text-white">CAMERA:</span> CLICK_ROTATE_SCROLL_ZOOM</p>
                  <p className="flex items-center gap-2"><ComputerDesktopIcon className="w-3 h-3" /><span className="text-white">WASD:</span> MOVEMENT_SHIFT_FAST</p>
                  <p className="flex items-center gap-2"><CursorArrowRaysIcon className="w-3 h-3" /><span className="text-white">CLICK:</span> SELECT_OBJECTS</p>
                  <p className="flex items-center gap-2"><TrashIcon className="w-3 h-3" /><span className="text-white">DELETE:</span> REMOVE_SELECTED</p>
                  <p className="flex items-center gap-2"><CommandLineIcon className="w-3 h-3" /><span className="text-white">G/R/S:</span> TRANSFORM_MODES</p>
                  <p className="flex items-center gap-2"><XMarkIcon className="w-3 h-3" /><span className="text-white">ESC:</span> EXIT_EDIT_MODE</p>
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
                  <span className="relative text-xs font-mono tracking-wider flex items-center gap-2"><Box className="w-3 h-3" />CUBE</span>
                </button>
                <button onClick={handleAddSphere} className="relative border border-white px-2 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider flex items-center gap-2"><Circle className="w-3 h-3" />SPHERE</span>
                </button>
                <button onClick={handleAddCylinder} className="relative border border-white px-2 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider flex items-center gap-2"><Square className="w-3 h-3" />CYLINDER</span>
                </button>
                <button onClick={handleAddCone} className="relative border border-white px-2 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider flex items-center gap-2"><Triangle className="w-3 h-3" />CONE</span>
                </button>
                <button onClick={handleAddPyramid} className="relative border border-white px-2 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider flex items-center gap-2"><Triangle className="w-3 h-3" />PYRAMID</span>
                </button>
                <button onClick={handleAddIcosahedron} className="relative border border-white px-2 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider flex items-center gap-2"><Hexagon className="w-3 h-3" />ICOSAHEDRON</span>
                </button>
                <button onClick={handleAddPlane} className="relative border border-white px-2 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider flex items-center gap-2"><Square className="w-3 h-3" />PLANE</span>
                </button>
                <button onClick={handleAddTorus} className="relative border border-white px-2 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider flex items-center gap-2"><RotateCcw className="w-3 h-3" />TORUS</span>
                </button>
                <button onClick={handleAddDodecahedronRing} className="relative border border-white px-2 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider flex items-center gap-2"><CircleDot className="w-3 h-3" />RING</span>
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
                  <span className="relative text-xs font-mono tracking-wider">PHASER</span>
                </button>
                <button onClick={handleAddAutoFilterZone} className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider">AUTO_FILTER</span>
                </button>
                <button onClick={handleAddAutoWahZone} className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider">AUTO_WAH</span>
                </button>
                <button onClick={handleAddBitCrusherZone} className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider">BIT_CRUSHER</span>
                </button>
                <button onClick={handleAddChebyshevZone} className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider">CHEBYSHEV</span>
                </button>
                <button onClick={handleAddChorusZone} className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider">CHORUS</span>
                </button>
                <button onClick={handleAddDistortionZone} className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider">DISTORTION</span>
                </button>
                <button onClick={handleAddFeedbackDelayZone} className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider">FEEDBACK_DELAY</span>
                </button>
                <button onClick={handleAddFreeverbZone} className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider">FREEVERB</span>
                </button>
                <button onClick={handleAddFrequencyShifterZone} className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider">FREQ_SHIFTER</span>
                </button>
                <button onClick={handleAddJCReverbZone} className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider">JC_REVERB</span>
                </button>
                <button onClick={handleAddPingPongDelayZone} className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider">PING_PONG</span>
                </button>
                <button onClick={handleAddPitchShiftZone} className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider">PITCH_SHIFT</span>
                </button>
                <button onClick={handleAddReverbZone} className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider">REVERB</span>
                </button>
                <button onClick={handleAddStereoWidenerZone} className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider">STEREO_WIDENER</span>
                </button>
                <button onClick={handleAddTremoloZone} className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider">TREMOLO</span>
                </button>
                <button onClick={handleAddVibratoZone} className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider">VIBRATO</span>
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
                <span className="relative text-xs font-mono tracking-wider flex items-center justify-center space-x-2">
                  <span className="text-sm">🚀</span>
                  <span>CREATE_MOBILE_OBJECT</span>
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
              <p><span className="text-white">POS:</span> ({activeGrid ? activeGrid.coordinates[0] : currentGridCoordinates[0]}, {activeGrid ? activeGrid.coordinates[1] : currentGridCoordinates[1]}, {activeGrid ? activeGrid.coordinates[2] : currentGridCoordinates[2]})</p>
              {activeGrid && (
                <p><span className="text-white">ACTIVE:</span> {activeGrid.id.slice(0, 6)}...</p>
              )}
            </div>
          </div>

        {isGridsExpanded && (
          <div className="space-y-2">
            {/* Crear cuadrículas adyacentes */}
            <div className="space-y-1">
              <div className="text-xs font-mono font-bold text-white tracking-wider">ADJACENT_GRIDS</div>
              
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => createGridAtPosition('west')}
                  className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group"
                  title="Oeste"
                >
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider">← WEST</span>
                </button>
                <button
                  onClick={() => createGridAtPosition('east')}
                  className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group"
                  title="Este"
                >
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider">EAST →</span>
                </button>
                <button
                  onClick={() => createGridAtPosition('south')}
                  className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group"
                  title="Sur"
                >
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider">↓ SOUTH</span>
                </button>
                <button
                  onClick={() => createGridAtPosition('north')}
                  className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group"
                  title="Norte"
                >
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider">NORTH ↑</span>
                </button>
                <button
                  onClick={() => createGridAtPosition('down')}
                  className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group"
                  title="Abajo"
                >
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider">⬇ DOWN</span>
                </button>
                <button
                  onClick={() => createGridAtPosition('up')}
                  className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group"
                  title="Arriba"
                >
                  <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative text-xs font-mono tracking-wider">⬆ UP</span>
                </button>
              </div>
            </div>

            {/* Crear cuadrícula personalizada */}
            <div className="space-y-1">
              <div className="text-xs font-mono font-bold text-white tracking-wider">CUSTOM_GRID</div>
              
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
                  <label className="text-xs text-gray-400 block font-mono tracking-wider">SIZE</label>
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
                  <span>CREATE_GRID</span>
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
