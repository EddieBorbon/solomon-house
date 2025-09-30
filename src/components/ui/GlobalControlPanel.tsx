'use client';

import { useState } from 'react';
import { useWorldStore } from '../../state/useWorldStore';
import { useGridStore } from '../../stores/useGridStore';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  Cog6ToothIcon, 
  MusicalNoteIcon, 
  SpeakerWaveIcon, 
  RocketLaunchIcon, 
  Squares2X2Icon,
  CameraIcon,
  GlobeAltIcon
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

export function GlobalControlPanel() {
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);
  const [isAddMenuExpanded, setIsAddMenuExpanded] = useState(false);
  const [isControlsExpanded, setIsControlsExpanded] = useState(false);
  const [isEffectsExpanded, setIsEffectsExpanded] = useState(false);
  const [isMobileObjectExpanded, setIsMobileObjectExpanded] = useState(false);
  const [isGridsExpanded, setIsGridsExpanded] = useState(false);
  const [newGridPosition, setNewGridPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [newGridSize, setNewGridSize] = useState<number>(20);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  
  const { 
    // Funciones locales (para cuadrículas individuales)
    addObject, 
    addEffectZone, 
    addMobileObject, 
    // Funciones globales (para el mundo global)
    addGlobalSoundObject,
    addGlobalEffectZone,
    addGlobalMobileObject
  } = useWorldStore();

  const {
    activeGridId,
    grids,
    createGrid,
    currentGridCoordinates,
    gridSize,
    setActiveGrid
  } = useGridStore();
  
  const { t } = useLanguage();
  
  // Detectar si estamos en modo global - Siempre forzar modo global
  const isGlobalMode = true; // Siempre en modo global
  const activeGrid = grids.get('global-world') || null;

  // Función helper para crear objetos (siempre en modo global)
  const createObjectInActiveGrid = async (type: string) => {
    console.log('🌍 GlobalControlPanel.createObjectInActiveGrid: Creando objeto en modo global', { type });
    
    // Asegurar que la cuadrícula global existe
    if (!activeGrid) {
      console.log('🌍 GlobalControlPanel: Creando cuadrícula global porque no existe');
      
      // Crear cuadrícula global vacía
      const globalGrid = {
        id: 'global-world',
        coordinates: [0, 0, 0] as [number, number, number],
        position: [0, 0, 0] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number],
        scale: [1, 1, 1] as [number, number, number],
        objects: [],
        mobileObjects: [],
        effectZones: [],
        gridSize: 20,
        gridColor: '#404040',
        isLoaded: true,
        isSelected: false
      };
      
      const newGrids = new Map(grids as Map<string, any>);
      newGrids.set('global-world', globalGrid);
      useGridStore.setState({ grids: newGrids });
      
      console.log('🌍 GlobalControlPanel: Cuadrícula global creada');
    }
    
    // Calcular posición
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    const position: [number, number, number] = [x, 0.5, z];
    
    // Siempre crear objeto global
    console.log('🌍 GlobalControlPanel: Creando objeto global', { type, position });
    
    const object = {
      id: crypto.randomUUID(),
      type: type as 'cube' | 'sphere' | 'cylinder' | 'cone' | 'pyramid' | 'icosahedron' | 'plane' | 'torus' | 'dodecahedronRing' | 'spiral',
      position,
      rotation: [0, 0, 0] as [number, number, number],
      scale: [1, 1, 1] as [number, number, number],
      audioParams: {
        frequency: 440,
        volume: 0.5,
        waveform: 'sine' as const,
        harmonicity: 2,
        modulationIndex: 10,
        duration: 1.5,
      },
      isSelected: false,
      audioEnabled: !['icosahedron', 'torus', 'spiral', 'pyramid', 'cone'].includes(type)
    };
    
    await addGlobalSoundObject(object);
    console.log('🌍 GlobalControlPanel: Objeto global creado exitosamente');
  };

  // Función helper para crear zonas de efecto (siempre en modo global)
  const createEffectZoneInActiveGrid = async (type: string) => {
    // Siempre crear en modo global
    
    // Calcular posición
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    const position: [number, number, number] = [x, 1, z];
    
    if (isGlobalMode) {
      // Crear zona de efecto global
      const effectZone = {
        id: crypto.randomUUID(),
        type: type as 'phaser' | 'autoFilter' | 'autoWah' | 'bitCrusher' | 'chebyshev' | 'chorus' | 'distortion' | 'feedbackDelay' | 'freeverb' | 'frequencyShifter' | 'jcReverb' | 'pingPongDelay' | 'pitchShift' | 'reverb' | 'stereoWidener' | 'tremolo' | 'vibrato',
        shape: 'sphere' as const,
        position,
        rotation: [0, 0, 0] as [number, number, number],
        scale: [1, 1, 1] as [number, number, number],
        isSelected: false,
        isLocked: false,
        effectParams: {
          decay: 1.5,
          preDelay: 0.01,
          roomSize: 0.8,
        }
      };
      
      await addGlobalEffectZone(effectZone);
    } else {
      // Crear zona de efecto local
      addEffectZone(type as 'phaser' | 'autoFilter' | 'autoWah' | 'bitCrusher' | 'chebyshev' | 'chorus' | 'distortion' | 'feedbackDelay' | 'freeverb' | 'frequencyShifter' | 'jcReverb' | 'pingPongDelay' | 'pitchShift' | 'reverb' | 'stereoWidener' | 'tremolo' | 'vibrato', position, 'sphere');
    }
  };

  // Función helper para crear objetos móviles (global o local según el modo)
  const createMobileObjectInActiveGrid = async () => {
    if (!activeGrid && !isGlobalMode) {
      return;
    }
    
    // Calcular posición
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    const position: [number, number, number] = [x, 0.5, z];
    
    if (isGlobalMode) {
      // Crear objeto móvil global
      const mobileObject = {
        id: crypto.randomUUID(),
        type: 'mobile' as const,
        position,
        rotation: [0, 0, 0] as [number, number, number],
        scale: [1, 1, 1] as [number, number, number],
        isSelected: false,
        mobileParams: {
          movementType: 'circular' as const,
          radius: 5,
          speed: 1,
          proximityThreshold: 2,
          isActive: true,
          centerPosition: [0, 0, 0] as [number, number, number],
          direction: [1, 0, 0] as [number, number, number],
          axis: [0, 1, 0] as [number, number, number],
          amplitude: 1,
          frequency: 1,
          randomSeed: Math.random(),
          height: 1,
          heightSpeed: 0.5,
        }
      };
      
      await addGlobalMobileObject(mobileObject);
    } else {
      // Crear objeto móvil local
      addMobileObject(position);
    }
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

  // Cambiar entre modo global y local
  const toggleGlobalMode = async () => {
    if (isGlobalMode) {
      // Cambiar a modo local (primera cuadrícula disponible)
      const firstGridId = Array.from(grids.keys()).find(id => id !== 'global-world');
      if (firstGridId && typeof firstGridId === 'string') {
        setActiveGrid(firstGridId);
      }
    } else {
      // Cambiar a modo global - cargar objetos desde Firebase
      const globalGridId = 'global-world';
      
      console.log('🌍 GlobalControlPanel: Cambiando a modo global, cargando objetos desde Firebase');
      
      try {
        // Importar firebaseService dinámicamente para evitar problemas de importación circular
        const { firebaseService } = await import('../../lib/firebaseService');
        
        // Obtener el estado actual del mundo global desde Firebase
        const globalWorldDoc = await firebaseService.getGlobalWorldState();
        
        if (globalWorldDoc) {
          console.log('🌍 GlobalControlPanel: Datos del mundo global obtenidos desde Firebase', globalWorldDoc);
          
          // Crear la cuadrícula global con los datos de Firebase
          const globalGrid = {
            id: globalGridId,
            coordinates: globalWorldDoc.currentGridCoordinates || [0, 0, 0],
            position: [0, 0, 0] as [number, number, number],
            rotation: [0, 0, 0] as [number, number, number],
            scale: [1, 1, 1] as [number, number, number],
            objects: globalWorldDoc.objects || [],
            mobileObjects: globalWorldDoc.mobileObjects || [],
            effectZones: globalWorldDoc.effectZones || [],
            gridSize: 20,
            gridColor: '#404040',
            isLoaded: true,
            isSelected: false
          };
          
          console.log('🌍 GlobalControlPanel: Cuadrícula global creada con', globalGrid.objects.length, 'objetos');
          
          // Agregar la cuadrícula global al store
          const newGrids = new Map(grids as Map<string, any>);
          newGrids.set(globalGridId, globalGrid);
          useGridStore.setState({ grids: newGrids });
          
          // Cambiar a la cuadrícula global
          setActiveGrid(globalGridId);
          
          console.log('🌍 GlobalControlPanel: Modo global activado exitosamente');
        } else {
          console.log('🌍 GlobalControlPanel: No hay datos del mundo global en Firebase, creando cuadrícula vacía');
          
          // Crear cuadrícula global vacía si no hay datos en Firebase
        const globalGrid = {
          id: globalGridId,
          coordinates: [0, 0, 0] as [number, number, number],
          position: [0, 0, 0] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number],
          scale: [1, 1, 1] as [number, number, number],
          objects: [],
          mobileObjects: [],
          effectZones: [],
          gridSize: 20,
          gridColor: '#404040',
          isLoaded: true,
          isSelected: false
        };
        
        const newGrids = new Map(grids as Map<string, any>);
        newGrids.set(globalGridId, globalGrid);
        useGridStore.setState({ grids: newGrids });
          
          setActiveGrid(globalGridId);
        }
      } catch (error) {
        console.error('🌍 GlobalControlPanel: Error al cargar mundo global desde Firebase:', error);
        
        // En caso de error, crear cuadrícula global vacía
        const globalGrid = {
          id: globalGridId,
          coordinates: [0, 0, 0] as [number, number, number],
          position: [0, 0, 0] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number],
          scale: [1, 1, 1] as [number, number, number],
          objects: [],
          mobileObjects: [],
          effectZones: [],
          gridSize: 20,
          gridColor: '#404040',
          isLoaded: true,
          isSelected: false
        };
        
        const newGrids = new Map(grids as Map<string, any>);
        newGrids.set(globalGridId, globalGrid);
        useGridStore.setState({ grids: newGrids });
      
      setActiveGrid(globalGridId);
      }
    }
  };

  // Funciones de creación de objetos
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

  // Funciones de creación de zonas de efecto
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
      default:
        newCoordinates = [x, y, z];
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
              {/* Sección de Modo Global */}
              <div className="mb-4 relative">
                <div className="relative border border-white p-3">
                  <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white"></div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white"></div>
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white"></div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white"></div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-mono font-bold text-white tracking-wider flex items-center gap-2">
                      <GlobeAltIcon className="w-3 h-3" />
                      MODO GLOBAL
                    </h3>
                    <button
                      disabled={true}
                      className="relative border border-green-400 text-green-400 bg-green-400/10 cursor-not-allowed opacity-75"
                      title="Modo global permanente - No se puede cambiar a modo local"
                    >
                      <div className="absolute -inset-0.5 border border-green-600"></div>
                      <span className="relative text-xs font-mono tracking-wider">
                        GLOBAL
                      </span>
                    </button>
                  </div>
                  
                  <div className="text-xs text-gray-300 space-y-1">
                    <div>Estado: <span className={isGlobalMode ? 'text-green-400' : 'text-yellow-400'}>{isGlobalMode ? 'Colaborativo' : 'Individual'}</span></div>
                    <div>Cuadrícula: <span className="text-white">{activeGridId || 'Ninguna'}</span></div>
                    {activeGrid && (
                      <>
                        <div>Objetos: <span className="text-white">{activeGrid.objects?.length || 0}</span></div>
                        <div>Móviles: <span className="text-white">{activeGrid.mobileObjects?.length || 0}</span></div>
                        <div>Efectos: <span className="text-white">{activeGrid.effectZones?.length || 0}</span></div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Sección de Controles */}
              <div className="mb-4 relative">
                <div className="relative border border-white p-3">
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
                    <div className="space-y-3">
                      {/* Botón de Cámara */}
                      <button onClick={toggleCamera} className={`relative border px-2 py-1 transition-all duration-300 group w-full ${
                        isCameraEnabled 
                          ? 'border-green-400 text-green-400 bg-green-400/10' 
                          : 'border-white text-white hover:bg-white hover:text-black'
                      }`}>
                        <div className={`absolute -inset-0.5 border transition-colors duration-300 ${
                          isCameraEnabled ? 'border-green-600 group-hover:border-green-400' : 'border-gray-600 group-hover:border-white'
                        }`}></div>
                        <span className="relative text-xs font-mono tracking-wider flex items-center gap-2">
                          <CameraIcon className="w-3 h-3" />
                          {isCameraEnabled ? 'Cámara ON' : 'Cámara OFF'}
                        </span>
                      </button>

                      {/* Controles de Cámara */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-medium text-white mb-2">CÁMARA:</h4>
                        <div className="text-xs text-gray-300 space-y-1">
                          <div className="flex justify-between">
                            <span>CLICK:</span>
                            <span className="text-white">ROTAR_DESPLAZAR_ZOOM</span>
                          </div>
                          <div className="flex justify-between">
                            <span>WASD:</span>
                            <span className="text-white">MOVIMIENTO_SHIFT_RÁPIDO</span>
                          </div>
                        </div>
                      </div>

                      {/* Controles de Interacción */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-medium text-white mb-2">INTERACCIÓN:</h4>
                        <div className="text-xs text-gray-300 space-y-1">
                          <div className="flex justify-between">
                            <span>CLICK:</span>
                            <span className="text-white">SELECCIONAR_OBJETOS</span>
                          </div>
                          <div className="flex justify-between">
                            <span>ELIMINAR:</span>
                            <span className="text-white">REMOVER_SELECCIONADO</span>
                          </div>
                          <div className="flex justify-between">
                            <span>G/R/S:</span>
                            <span className="text-white">MODOS_TRANSFORMACIÓN</span>
                          </div>
                          <div className="flex justify-between">
                            <span>ESC:</span>
                            <span className="text-white">SALIR_MODO_EDICIÓN</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sección de Objetos Sonoros */}
              <div className="mb-4 relative">
                <div className="relative border border-white p-3">
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
                <div className="relative border border-white p-3">
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
                          <span className="relative text-xs font-mono tracking-wider">{t('controls.frequencyShifter')}</span>
                        </button>
                        <button onClick={handleAddJCReverbZone} className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                          <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                          <span className="relative text-xs font-mono tracking-wider">{t('controls.jcReverb')}</span>
                        </button>
                        <button onClick={handleAddPingPongDelayZone} className="relative border border-white px-1 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group">
                          <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                          <span className="relative text-xs font-mono tracking-wider">{t('controls.pingPongDelay')}</span>
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
                          <span className="relative text-xs font-mono tracking-wider">{t('controls.tremolo')}</span>
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

              {/* Sección de Objetos Móviles */}
              <div className="mb-4 relative">
                <div className="relative border border-white p-3">
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
                      <button onClick={handleAddMobileObject} className="relative border border-white px-2 py-1 text-white hover:bg-white hover:text-black transition-all duration-300 group w-full">
                        <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                        <span className="relative text-xs font-mono tracking-wider flex items-center gap-2">
                          <RocketLaunchIcon className="w-3 h-3" />
                          {t('controls.addMobileObject')}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Sección de Cuadrículas */}
              <div className="mb-4 relative">
                <div className="relative border border-white p-3">
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
                      title={isGridsExpanded ? "Ocultar menú" : "Mostrar menú"}
                    >
                      <div className="absolute -inset-0.5 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                      <span className="relative text-xs font-mono tracking-wider">
                        {isGridsExpanded ? t('controls.hide') : t('controls.show')}
                      </span>
                    </button>
                  </div>
                  
                  {isGridsExpanded && (
                    <div className="space-y-3">
                      {/* Crear cuadrículas en direcciones específicas */}
                      <div>
                        <h4 className="text-xs font-medium text-white mb-2">Crear Cuadrícula:</h4>
                        <div className="grid grid-cols-3 gap-1">
                          <button
                            onClick={() => createGridAtPosition('north')}
                            className="px-2 py-1 text-xs bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 rounded transition-colors"
                          >
                            ↑ Norte
                          </button>
                          <button
                            onClick={() => createGridAtPosition('south')}
                            className="px-2 py-1 text-xs bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 rounded transition-colors"
                          >
                            ↓ Sur
                          </button>
                          <button
                            onClick={() => createGridAtPosition('east')}
                            className="px-2 py-1 text-xs bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 rounded transition-colors"
                          >
                            → Este
                          </button>
                          <button
                            onClick={() => createGridAtPosition('west')}
                            className="px-2 py-1 text-xs bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 rounded transition-colors"
                          >
                            ← Oeste
                          </button>
                          <button
                            onClick={() => createGridAtPosition('up')}
                            className="px-2 py-1 text-xs bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 rounded transition-colors"
                          >
                            ⬆ Arriba
                          </button>
                          <button
                            onClick={() => createGridAtPosition('down')}
                            className="px-2 py-1 text-xs bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 rounded transition-colors"
                          >
                            ⬇ Abajo
                          </button>
                        </div>
                      </div>

                      {/* Crear cuadrícula personalizada */}
                      <div>
                        <h4 className="text-xs font-medium text-white mb-2">Posición Personalizada:</h4>
                        <div className="space-y-2">
                          <div>
                            <label className="text-xs text-gray-300 block mb-1">Posición (X, Y, Z):</label>
                            <div className="flex gap-1">
                              <input
                                type="number"
                                value={newGridPosition[0]}
                                onChange={(e) => setNewGridPosition([Number(e.target.value), newGridPosition[1], newGridPosition[2]])}
                                className="w-16 px-1 py-1 text-xs bg-gray-800 text-white border border-gray-600 rounded"
                                placeholder="X"
                              />
                              <input
                                type="number"
                                value={newGridPosition[1]}
                                onChange={(e) => setNewGridPosition([newGridPosition[0], Number(e.target.value), newGridPosition[2]])}
                                className="w-16 px-1 py-1 text-xs bg-gray-800 text-white border border-gray-600 rounded"
                                placeholder="Y"
                              />
                              <input
                                type="number"
                                value={newGridPosition[2]}
                                onChange={(e) => setNewGridPosition([newGridPosition[0], newGridPosition[1], Number(e.target.value)])}
                                className="w-16 px-1 py-1 text-xs bg-gray-800 text-white border border-gray-600 rounded"
                                placeholder="Z"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-gray-300 block mb-1">Tamaño:</label>
                            <input
                              type="number"
                              value={newGridSize}
                              onChange={(e) => setNewGridSize(Number(e.target.value))}
                              className="w-full px-1 py-1 text-xs bg-gray-800 text-white border border-gray-600 rounded"
                              min="5"
                              max="50"
                            />
                          </div>
                          <button
                            onClick={createGridAtCustomPosition}
                            className="w-full px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                          >
                            Crear Cuadrícula
                          </button>
                        </div>
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
