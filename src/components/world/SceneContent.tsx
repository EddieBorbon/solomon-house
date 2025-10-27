'use client';

import React, { useMemo, useCallback, useEffect, useRef } from 'react';
import { TransformControls } from '@react-three/drei';
import { Group, Mesh } from 'three';
import { useFrame } from '@react-three/fiber';
import { useWorldStore, type SoundObject, type MobileObject as MobileObjectType, type EffectZone as EffectZoneType } from '../../state/useWorldStore';
import { type AudioParams } from '../../lib/factories/SoundSourceFactory';
import { SoundCube } from '../sound-objects/SoundCube';
import { SoundSphere } from '../sound-objects/SoundSphere';
import { SoundCylinder } from '../sound-objects/SoundCylinder';
import { SoundCone } from '../sound-objects/SoundCone';
import { SoundPyramid } from '../sound-objects/SoundPyramid';
import { SoundIcosahedron } from '../sound-objects/SoundIcosahedron';
import { SoundPlane } from '../sound-objects/SoundPlane';
import { SoundTorus } from '../sound-objects/SoundTorus';
import { SoundDodecahedronRing } from '../sound-objects/SoundDodecahedronRing';
import { SoundSpiral } from '../sound-objects/SoundSpiral';
import { SoundCustom } from '../sound-objects/SoundCustom';
import { MobileObject } from '../sound-objects/MobileObject';
import { EffectZone } from './EffectZone';
import { GridRenderer } from './GridRenderer';
import { CameraController } from './CameraController';
import { useEffectZoneDetection } from '../../hooks/useEffectZoneDetection';
import { audioManager } from '../../lib/AudioManager';
import { useGridStore } from '../../stores/useGridStore';

interface SceneContentProps {
  orbitControlsRef: React.RefObject<{
    enabled: boolean;
    update: () => void;
    reset: () => void;
  } | null>;
}

// Componente contenedor para cada objeto de sonido
interface SoundObjectContainerProps {
  object: SoundObject;
  onSelect: (id: string) => void;
}

const SoundObjectContainer = React.forwardRef<Group, SoundObjectContainerProps>(
  ({ object, onSelect }, ref) => {
    const { triggerObjectNote, toggleObjectAudio } = useWorldStore();
    
    const handleClick = useCallback((event: React.MouseEvent) => {
      event.stopPropagation();
      onSelect(object.id);
      
      // Para pirámides, solo selección (el audio se maneja con onPointerDown/onPointerUp)
      if (object.type === 'pyramid') {
        // No hacer nada de audio aquí, se maneja en el componente SoundPyramid
        return;
      }
      
      // Para conos, disparar la nota (el audio se maneja con triggerObjectNote)
      if (object.type === 'cone') {
        triggerObjectNote(object.id);
      } else if (object.type === 'icosahedron' || object.type === 'plane' || object.type === 'torus') {
        // Para icosaedros, planos y toroides, solo disparar la nota (sonido percusivo)
        triggerObjectNote(object.id);
      } else if (object.type === 'dodecahedronRing') {
        // Para anillos de dodecaedros, disparar acorde (sonido percusivo)
        triggerObjectNote(object.id);
      } else if (object.type === 'spiral') {
        // Para espirales, disparar la nota (sonido percusivo)
        triggerObjectNote(object.id);
      } else {
        // Para otros objetos, solo disparar la nota
        triggerObjectNote(object.id);
      }
    }, [object.id, onSelect, triggerObjectNote, toggleObjectAudio, object.type]);

    return (
      <group
        ref={ref}
        position={object.position}
        rotation={object.rotation}
        scale={object.scale}
        onClick={object.type !== 'cone' ? handleClick : undefined}
      >
        {/* Renderizado según el tipo de objeto */}
        {object.type === 'cube' ? (
          <SoundCube
            id={object.id}
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            scale={[1, 1, 1]}
            isSelected={object.isSelected}
            audioEnabled={object.audioEnabled}
            audioParams={object.audioParams as unknown as AudioParams}
          />
        ) : object.type === 'sphere' ? (
          <SoundSphere
            id={object.id}
            position={[0, 0, 0]}
            isSelected={object.isSelected}
            audioEnabled={object.audioEnabled}
            audioParams={object.audioParams as unknown as AudioParams}
          />
        ) : object.type === 'cylinder' ? (
          <SoundCylinder
            id={object.id}
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            scale={[1, 1, 1]}
            isSelected={object.isSelected}
            audioEnabled={object.audioEnabled}
            audioParams={object.audioParams as unknown as AudioParams}
          />
        ) : object.type === 'cone' ? (
          <SoundCone
            id={object.id}
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            scale={[1, 1, 1]}
            isSelected={object.isSelected}
            audioEnabled={object.audioEnabled}
            audioParams={object.audioParams as unknown as AudioParams}
          />
        ) : object.type === 'pyramid' ? (
          <SoundPyramid
            id={object.id}
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            scale={[1, 1, 1]}
            isSelected={object.isSelected}
            audioEnabled={object.audioEnabled}
            audioParams={object.audioParams as unknown as AudioParams}
          />
        ) : object.type === 'icosahedron' ? (
          <SoundIcosahedron
            id={object.id}
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            scale={[1, 1, 1]}
            isSelected={object.isSelected}
            audioEnabled={object.audioEnabled}
            audioParams={object.audioParams as unknown as AudioParams}
          />
        ) : object.type === 'plane' ? (
          <SoundPlane
            id={object.id}
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            scale={[1, 1, 1]}
            isSelected={object.isSelected}
            audioEnabled={object.audioEnabled}
            audioParams={object.audioParams as unknown as AudioParams}
          />
        ) : object.type === 'torus' ? (
          <SoundTorus
            id={object.id}
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            scale={[1, 1, 1]}
            isSelected={object.isSelected}
            audioEnabled={object.audioEnabled}
            audioParams={object.audioParams as unknown as AudioParams}
          />
        ) : object.type === 'dodecahedronRing' ? (
          <SoundDodecahedronRing
            id={object.id}
            position={[0, 0, 0]}
            isSelected={object.isSelected}
            audioEnabled={object.audioEnabled}
            audioParams={object.audioParams as unknown as AudioParams}
          />
        ) : object.type === 'spiral' ? (
          <SoundSpiral
            id={object.id}
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            scale={[1, 1, 1]}
            isSelected={object.isSelected}
            audioEnabled={object.audioEnabled}
            audioParams={object.audioParams as unknown as AudioParams}
          />
        ) : object.type === 'custom' ? (
          <SoundCustom
            id={object.id}
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            scale={[1, 1, 1]}
            isSelected={object.isSelected}
            audioEnabled={object.audioEnabled}
            audioParams={object.audioParams as unknown as AudioParams}
            customShapeCode={object.customShapeCode}
          />
        ) : null}
      </group>
    );
  }
);

SoundObjectContainer.displayName = 'SoundObjectContainer';

// Componente principal de la escena
export function SceneContent({ orbitControlsRef }: SceneContentProps) {
  const { 
    grids, 
    selectedEntityId, 
    transformMode, 
    updateObject, 
    updateMobileObject,
    updateEffectZone, 
    selectEntity,
    loadGrid,
    setActiveGrid,
    getGridKey
  } = useWorldStore();

  // Inicializar la cuadrícula por defecto si no hay ninguna
  useEffect(() => {
    if (grids.size === 0) {
      loadGrid([0, 0, 0]);
      const defaultGridKey = getGridKey([0, 0, 0]);
      setActiveGrid(defaultGridKey);
    }
  }, [grids.size, loadGrid, setActiveGrid, getGridKey]);
  
  // Obtener objetos directamente del useObjectStore organizados por cuadrícula
  const allObjects = useMemo(() => {
    const objects: SoundObject[] = [];
    const mobileObjects: MobileObjectType[] = [];
    const effectZones: EffectZoneType[] = [];
    
    // Convertir Map a Array para que useMemo detecte cambios correctamente
    const gridsArray = Array.from(grids.values());
    
    
    gridsArray.forEach((grid) => {
      // Usar objetos directamente de la cuadrícula (useWorldStore) en lugar del ObjectStore
      const gridObjects = grid.objects || [];
      
      // Usar objetos de la cuadrícula directamente
      objects.push(...gridObjects.filter(obj => obj && obj.id));
      
      // Mantener objetos móviles y zonas de efectos de la cuadrícula
      if (Array.isArray(grid.mobileObjects)) {
        mobileObjects.push(...grid.mobileObjects.filter(obj => obj && obj.id));
      }
      if (Array.isArray(grid.effectZones)) {
        effectZones.push(...grid.effectZones.filter(zone => zone && zone.id));
      }
    });
    
    return { objects, mobileObjects, effectZones };
  }, [grids]);
  
  // Usar el hook de detección de zonas de efectos
  useEffectZoneDetection();
  
  // Crear un Map de refs para cada objeto y zona de efecto
  const entityRefs = useMemo(() => {
    const refs = new Map<string, React.RefObject<Group | null>>();
    
    // Refs para objetos sonoros
    allObjects.objects.forEach(obj => {
      refs.set(obj.id, React.createRef<Group | null>());
    });
    
    // Refs para objetos móviles
    allObjects.mobileObjects.forEach(obj => {
      refs.set(obj.id, React.createRef<Group | null>());
    });
    
    // Refs para zonas de efectos
    allObjects.effectZones.forEach(zone => {
      refs.set(zone.id, React.createRef<Group | null>());
    });
    
    return refs;
  }, [allObjects]);

  // Crear refs auxiliares para los gizmos de objetos móviles
  // Estos grupos vacíos estarán siempre en el centro del objeto móvil (esfera grande de wireframe)
  const mobileGizmoRefs = useMemo(() => {
    const refs = new Map<string, React.RefObject<Group | null>>();
    
    allObjects.mobileObjects.forEach(obj => {
      refs.set(obj.id, React.createRef<Group | null>());
    });
    
    return refs;
  }, [allObjects.mobileObjects]);

  // Refs para rastrear el estado de arrastre de objetos móviles
  const mobileDragRefs = useRef(new Map<string, React.MutableRefObject<boolean>>());
  
  // Refs para los timers de fin de arrastre de objetos móviles
  const mobileDragTimers = useRef(new Map<string, NodeJS.Timeout | null>());
  
  // Inicializar refs de arrastre para objetos móviles
  useEffect(() => {
    allObjects.mobileObjects.forEach(obj => {
      if (!mobileDragRefs.current.has(obj.id)) {
        mobileDragRefs.current.set(obj.id, { current: false });
      }
      if (!mobileDragTimers.current.has(obj.id)) {
        mobileDragTimers.current.set(obj.id, null);
      }
    });
    
    // Limpiar refs de objetos que ya no existen
    const existingIds = new Set(allObjects.mobileObjects.map(obj => obj.id));
    for (const [id] of mobileDragRefs.current) {
      if (!existingIds.has(id)) {
        mobileDragRefs.current.delete(id);
      }
    }
    for (const [id] of mobileDragTimers.current) {
      if (!existingIds.has(id)) {
        const timer = mobileDragTimers.current.get(id);
        if (timer) clearTimeout(timer);
        mobileDragTimers.current.delete(id);
      }
    }
  }, [allObjects.mobileObjects]);


  // Estado para rastrear si se está arrastrando
  const [isDragging, setIsDragging] = React.useState(false);
  const [draggingEntityId, setDraggingEntityId] = React.useState<string | null>(null);

  // Función para manejar cambios en las transformaciones
  const handleTransformChange = useCallback((entityId: string, newTransform: { position?: { x: number, y: number, z: number }, rotation?: { x: number, y: number, z: number }, scale?: { x: number, y: number, z: number } }) => {
    if (newTransform) {
      const updates: Record<string, unknown> = {};
      
      // Determinar si es un objeto sonoro, móvil o una zona de efecto
      const isSoundObject = allObjects.objects.some(obj => obj.id === entityId);
      const isMobileObject = allObjects.mobileObjects.some(obj => obj.id === entityId);
      const isEffectZone = allObjects.effectZones.some(zone => zone.id === entityId);
      
      if (newTransform.position) {
        // Convertir posición mundial a posición local
        let localPosition = [newTransform.position.x, newTransform.position.y, newTransform.position.z];
        
        // Encontrar la cuadrícula que contiene este objeto para convertir a posición local
        for (const grid of grids.values()) {
          if (grid.objects.some(obj => obj.id === entityId) ||
              grid.mobileObjects.some(obj => obj.id === entityId) ||
              grid.effectZones.some(zone => zone.id === entityId)) {
            // Convertir a posición local: posición mundial - posición de la cuadrícula
            localPosition = [
              newTransform.position.x - grid.position[0],
              newTransform.position.y - grid.position[1],
              newTransform.position.z - grid.position[2]
            ];
            break;
          }
        }
        
        updates.position = localPosition;
        
        // Para zonas de efectos durante el arrastre, actualizar directamente el grupo de Three.js
        if (isEffectZone && isDragging && draggingEntityId === entityId) {
          const zoneRef = entityRefs.get(entityId);
          if (zoneRef?.current) {
            // DEBUG: Log de la posición que estamos estableciendo
            console.log('🎯 DRAG ACTIVE - Setting position:', {
              entityId,
              localPosition,
              currentWorldPos: zoneRef.current.position.toArray(),
              isDragging,
              draggingEntityId
            });
            
            // Actualizar directamente la posición del grupo de Three.js
            zoneRef.current.position.set(localPosition[0], localPosition[1], localPosition[2]);
            
            // Verificar que se estableció correctamente
            const afterSet = zoneRef.current.position.toArray();
            if (
              Math.abs(afterSet[0] - localPosition[0]) > 0.001 ||
              Math.abs(afterSet[1] - localPosition[1]) > 0.001 ||
              Math.abs(afterSet[2] - localPosition[2]) > 0.001
            ) {
              console.error('❌ Position NOT set correctly!', {
                expected: localPosition,
                actual: afterSet
              });
            }
            
            // Actualizar audio inmediatamente
            try {
              audioManager.updateEffectZonePosition(entityId, localPosition as [number, number, number]);
            } catch (error) {
              console.error('Error updating effect zone position:', error);
            }
            
            // NO actualizar el estado durante el arrastre para evitar re-renders
            // El estado se actualizará cuando se suelte el mouse
            
            return; // No llamar a updateEffectZone durante el arrastre
          } else {
            console.warn('⚠️ Zone ref not found during drag:', entityId);
          }
        }
      }
      
      if (newTransform.rotation) {
        updates.rotation = [newTransform.rotation.x, newTransform.rotation.y, newTransform.rotation.z];
      }
      
      if (newTransform.scale) {
        updates.scale = [newTransform.scale.x, newTransform.scale.y, newTransform.scale.z];
      }
      
      if (Object.keys(updates).length > 0) {
        if (isSoundObject) {
          updateObject(entityId, updates);
        } else if (isMobileObject) {
          updateMobileObject(entityId, updates);
        } else if (isEffectZone) {
          updateEffectZone(entityId, updates);
        }
      }
    }
  }, [updateObject, updateMobileObject, updateEffectZone, allObjects, grids, isDragging, draggingEntityId, entityRefs]);

  // Función para manejar la selección de entidades
  const handleEntitySelect = useCallback((id: string) => {
    selectEntity(id);
  }, [selectEntity]);

  // Función para manejar clic en el espacio vacío
  const handleBackgroundClick = useCallback((event: { object?: { type?: string; geometry?: { type?: string } } }) => {
    // Solo deseleccionar si se hace clic directamente en el fondo (no en un objeto)
    if (event.object === undefined || event.object.type === 'Mesh' && event.object.geometry?.type === 'PlaneGeometry') {
      selectEntity(null);
    }
  }, [selectEntity]);

  // Funciones de transformación removidas - no se utilizan actualmente

  // Efecto para asegurar que OrbitControls SIEMPRE esté habilitado
  React.useEffect(() => {
    if (orbitControlsRef.current) {
      // FORZAR OrbitControls SIEMPRE HABILITADO - NUNCA BLOQUEAR LA CÁMARA
      orbitControlsRef.current.enabled = true;
      console.log('✅ SceneContent: OrbitControls garantizado como habilitado');
    }
  }, [orbitControlsRef]);

  // Función de emergencia para desbloquear y resetear la cámara
  const handleEmergencyCameraUnlock = useCallback((event: KeyboardEvent) => {
    // Presionar 'C' para desbloquear la cámara
    if (event.key.toLowerCase() === 'c' && !(event.target as HTMLElement)?.tagName?.match(/INPUT|TEXTAREA/)) {
      if (orbitControlsRef.current) {
        const wasDisabled = !orbitControlsRef.current.enabled;
        
        // Reset completo de OrbitControls
        try {
          orbitControlsRef.current.enabled = true;
          orbitControlsRef.current.update();
          orbitControlsRef.current.reset();
          console.log('🚨 SceneContent: OrbitControls reseteado completamente con tecla C', { wasDisabled });
        } catch (error) {
          console.warn('⚠️ SceneContent: Error al resetear OrbitControls:', error);
          // Fallback: solo habilitar
          orbitControlsRef.current.enabled = true;
        }
      } else {
        console.warn('🚨 SceneContent: No se puede resetear cámara - OrbitControls no disponible');
      }
    }
    
    // Presionar 'R' para reset completo de cámara
    if (event.key.toLowerCase() === 'r' && !(event.target as HTMLElement)?.tagName?.match(/INPUT|TEXTAREA/)) {
      if (orbitControlsRef.current) {
        try {
          orbitControlsRef.current.enabled = true;
          orbitControlsRef.current.reset();
          orbitControlsRef.current.update();
          console.log('🔄 SceneContent: Reset completo de cámara con tecla R');
        } catch (error) {
          console.warn('⚠️ SceneContent: Error en reset completo de cámara:', error);
        }
      }
    }
    
    // Presionar 'F' para forzar habilitación inmediata
    if (event.key.toLowerCase() === 'f' && !(event.target as HTMLElement)?.tagName?.match(/INPUT|TEXTAREA/)) {
      if (orbitControlsRef.current) {
        try {
          orbitControlsRef.current.enabled = true;
          orbitControlsRef.current.update();
          console.log('⚡ SceneContent: OrbitControls forzado como habilitado con tecla F');
        } catch (error) {
          console.warn('⚠️ SceneContent: Error al forzar habilitación:', error);
        }
      }
    }
  }, [orbitControlsRef]);

  // Agregar listener de teclado para desbloqueo de emergencia
  useEffect(() => {
    window.addEventListener('keydown', handleEmergencyCameraUnlock);
    return () => {
      window.removeEventListener('keydown', handleEmergencyCameraUnlock);
    };
  }, [handleEmergencyCameraUnlock]);

  // Verificar que está leyendo el estado correctamente (solo cuando cambie)
  useEffect(() => {
    // Log solo en desarrollo y solo cuando realmente cambien los objetos
    if (process.env.NODE_ENV === 'development') {
      console.log('SceneContent: Estado actualizado', {
        objects: allObjects.objects.length,
        mobileObjects: allObjects.mobileObjects.length,
        effectZones: allObjects.effectZones.length,
        grids: grids.size
      });
    }
  }, [allObjects.objects.length, allObjects.mobileObjects.length, allObjects.effectZones.length, grids.size]);

  // Estado para mostrar indicador de cámara bloqueada
  const [showCameraBlockedIndicator, setShowCameraBlockedIndicator] = React.useState(false);
  
  // Efecto para detectar cuando la cámara está bloqueada
  useEffect(() => {
    const interval = setInterval(() => {
      if (orbitControlsRef.current && !orbitControlsRef.current.enabled) {
        setShowCameraBlockedIndicator(true);
      } else {
        setShowCameraBlockedIndicator(false);
      }
    }, 1000); // Verificar cada segundo
    
    return () => clearInterval(interval);
  }, [orbitControlsRef]);

  return (
    <>
      {/* Controlador de cámara para navegación entre cuadrículas */}
      <CameraController />
      
      {/* Renderizador de cuadrículas */}
      <GridRenderer />
      
      {/* Plano invisible para capturar clics en el espacio vacío */}
      <mesh 
        position={[0, -10, 0]} 
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={handleBackgroundClick}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Renderizado de cuadrículas con sus objetos */}
      {Array.from(grids.values()).map((grid) => {
        if (!grid || !grid.id) return null;
        
        // Usar objetos directamente de la cuadrícula
        const gridObjects = grid.objects || [];
        
        return (
          <group key={grid.id} position={grid.position}>
          {/* Renderizado de objetos sonoros de esta cuadrícula */}
          {gridObjects.map((obj) => {
            if (!obj || !obj.id) return null;
            const objectRef = entityRefs.get(obj.id);
            if (!objectRef) return null;
            
            return (
              <SoundObjectContainer 
                key={`sound-${obj.id}`} 
                object={obj} 
                onSelect={handleEntitySelect}
                ref={objectRef}
              />
            );
          })}

          {/* Renderizado de objetos móviles de esta cuadrícula */}
          {Array.isArray(grid.mobileObjects) && grid.mobileObjects.map((mobileObj) => {
            if (!mobileObj || !mobileObj.id) return null;
            const objectRef = entityRefs.get(mobileObj.id);
            if (!objectRef) return null;
            
            // Verificar si este objeto móvil está siendo arrastrado
            const isDraggingThisMobile = mobileDragRefs.current.get(mobileObj.id);
            const isBeingDragged = isDraggingThisMobile?.current || false;
            
            return (
              <MobileObject
                key={`mobile-${mobileObj.id}`}
                id={mobileObj.id}
                position={mobileObj.position} // Posición del objeto móvil completo en el mundo
                rotation={mobileObj.rotation}
                scale={mobileObj.scale}
                isSelected={mobileObj.isSelected}
                mobileParams={{
                  ...mobileObj.mobileParams,
                  centerPosition: [0, 0, 0] // Centro relativo al grupo (origen del movimiento)
                }}
                onUpdatePosition={(id, position) => {
                  // Actualizar la posición de la esfera móvil dentro del grupo
                  // Esto NO afecta la posición del grupo completo
                  updateMobileObject(id, { position });
                }}
                onSelect={handleEntitySelect}
                isBeingDragged={isBeingDragged}
                ref={objectRef}
              />
            );
          })}

          {/* Renderizado de zonas de efectos de esta cuadrícula */}
          {Array.isArray(grid.effectZones) && grid.effectZones.map((zone) => {
            if (!zone || !zone.id) return null;
            const zoneRef = entityRefs.get(zone.id);
            if (!zoneRef) return null;
            
            return (
              <EffectZone
                key={`effect-${zone.id}`}
                zone={zone}
                onSelect={handleEntitySelect}
                ref={zoneRef}
              />
            );
          })}
          </group>
        );
      })}

      {/* TransformControls para la entidad seleccionada */}
      {selectedEntityId && (() => {
        // Buscar la entidad directamente en las cuadrículas para obtener los datos más actualizados
        let selectedEntity = null;
        let foundGrid = null;
        
        for (const grid of grids.values()) {
          const soundObj = grid.objects.find(obj => obj.id === selectedEntityId);
          const mobileObj = grid.mobileObjects.find(obj => obj.id === selectedEntityId);
          const effectZone = grid.effectZones.find(zone => zone.id === selectedEntityId);
          
          if (soundObj) {
            selectedEntity = soundObj;
            foundGrid = grid;
            break;
          } else if (mobileObj) {
            selectedEntity = mobileObj;
            foundGrid = grid;
            break;
          } else if (effectZone) {
            selectedEntity = effectZone;
            foundGrid = grid;
            break;
          }
        }
        
        if (!selectedEntity || !foundGrid) return null;
        
        // Verificar si la zona está bloqueada
        const isLocked = 'isLocked' in selectedEntity && selectedEntity.isLocked;
        
        // Determinar si es un objeto móvil
        const isMobileObject = selectedEntity.type === 'mobile';
        
        // Calcular posición mundial: posición de la cuadrícula + posición local del objeto
        const worldPosition = [
          foundGrid.position[0] + selectedEntity.position[0],
          foundGrid.position[1] + selectedEntity.position[1],
          foundGrid.position[2] + selectedEntity.position[2]
        ] as [number, number, number];
        
        // Para objetos móviles, usar el mismo comportamiento que objetos sonoros
        if (isMobileObject) {
          const objectRef = entityRefs.get(selectedEntityId);
          
          return (
            <TransformControls
              key={`${selectedEntityId}-${transformMode}`}
              object={objectRef?.current || undefined}
              mode={transformMode}
              position={worldPosition}
              rotation={[0, 0, 0]}
              scale={selectedEntity.scale}
              enabled={!isLocked}
              onObjectChange={(e) => {
                const event = e as { target?: { object?: { position?: { x: number; y: number; z: number }; rotation?: { x: number; y: number; z: number }; scale?: { x: number; y: number; z: number } } } };
                if (event?.target?.object) {
                  handleTransformChange(selectedEntityId, event.target.object);
                }
              }}
              onMouseDown={() => {
                setIsDragging(true);
                setDraggingEntityId(selectedEntityId);
              }}
              onMouseUp={() => {
                const wasDraggingEffectZone = isDragging && draggingEntityId === selectedEntityId && allObjects.effectZones.some(zone => zone.id === selectedEntityId);
                const wasDragging = isDragging && draggingEntityId === selectedEntityId;
                
                setIsDragging(false);
                setDraggingEntityId(null);
                
                // Actualizar estado con la posición final después de soltar
                if (wasDragging) {
                  // Obtener la posición actual del grupo de Three.js
                  const zoneRef = entityRefs.get(selectedEntityId);
                  if (zoneRef?.current) {
                    const worldPos = zoneRef.current.position;
                    let finalPosition: [number, number, number] | null = null;
                    
                    // Encontrar la cuadrícula para convertir a posición local
                    for (const grid of grids.values()) {
                      if (grid.effectZones.some(z => z.id === selectedEntityId)) {
                        finalPosition = [
                          worldPos.x - grid.position[0],
                          worldPos.y - grid.position[1],
                          worldPos.z - grid.position[2]
                        ] as [number, number, number];
                        break;
                      }
                    }
                    
                    if (finalPosition) {
                      // Actualizar estado con la posición final
                      updateEffectZone(selectedEntityId, { position: finalPosition });
                    }
                  }
                }
              }}
              size={0.75}
            />
          );
        }
        
        return (
          <TransformControls
            key={`${selectedEntityId}-${transformMode}`}
            object={entityRefs.get(selectedEntityId)?.current || undefined}
            mode={transformMode}
            position={worldPosition}
            // No aplicar la rotación del objeto al gizmo para que se mantenga alineado con la vista
            rotation={[0, 0, 0]} // Gizmo siempre alineado con la vista
            scale={selectedEntity.scale}
            enabled={!isLocked} // Deshabilitar si está bloqueada
            onObjectChange={(e) => {
              const event = e as { target?: { object?: { position?: { x: number; y: number; z: number }; rotation?: { x: number; y: number; z: number }; scale?: { x: number; y: number; z: number } } } };
              if (event?.target?.object) {
                handleTransformChange(selectedEntityId, event.target.object);
              }
            }}
            onMouseDown={() => {
              setIsDragging(true);
              setDraggingEntityId(selectedEntityId);
            }}
            onMouseUp={() => {
              const wasDragging = isDragging && draggingEntityId === selectedEntityId;
              
              setIsDragging(false);
              setDraggingEntityId(null);
              
              // Actualizar estado con la posición final después de soltar
              if (wasDragging) {
                // Obtener la posición actual del grupo de Three.js
                const zoneRef = entityRefs.get(selectedEntityId);
                if (zoneRef?.current) {
                  const worldPos = zoneRef.current.position;
                  let finalPosition: [number, number, number] | null = null;
                  
                  // Encontrar la cuadrícula para convertir a posición local
                  for (const grid of grids.values()) {
                    if (grid.effectZones.some(z => z.id === selectedEntityId)) {
                      finalPosition = [
                        worldPos.x - grid.position[0],
                        worldPos.y - grid.position[1],
                        worldPos.z - grid.position[2]
                      ] as [number, number, number];
                      break;
                    }
                  }
                  
                  if (finalPosition) {
                    // Actualizar estado con la posición final
                    updateEffectZone(selectedEntityId, { position: finalPosition });
                  }
                }
              }
            }}
            size={0.75}
          />
        );
      })()}

      {/* Mensaje cuando no hay entidades */}
      {allObjects.objects.length === 0 && allObjects.mobileObjects.length === 0 && allObjects.effectZones.length === 0 && (
        <group position={[0, 2, 0]}>
          <mesh>
            <boxGeometry args={[0.1, 0.1, 0.1]} />
            <meshStandardMaterial color="#6c5ce7" transparent opacity={0.3} />
          </mesh>
        </group>
      )}

      {/* Indicador de cámara bloqueada */}
      {showCameraBlockedIndicator && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-red-500/90 backdrop-blur-sm rounded-lg p-3 text-white text-sm font-medium shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-300 rounded-full animate-pulse" />
              <span>🎥 Cámara bloqueada - Presiona &apos;C&apos; para desbloquear</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
