'use client';

import React, { useMemo, useCallback, useEffect, useRef } from 'react';
import { TransformControls } from '@react-three/drei';
import { Group } from 'three';
import { useWorldStore, type SoundObject, type MobileObject as MobileObjectType, type EffectZone as EffectZoneType } from '../../state/useWorldStore';
import { useGridStore, type Grid } from '../../stores/useGridStore';
import { type AudioParams } from '../../lib/factories/SoundSourceFactory';
// import { useObjectStore } from '../../stores/useObjectStore'; // No utilizado
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
import { MobileObject } from '../sound-objects/MobileObject';
import { EffectZone } from './EffectZone';
import { GridRenderer } from './GridRenderer';
import { CameraController } from './CameraController';
import { useEffectZoneDetection } from '../../hooks/useEffectZoneDetection';

interface SceneContentProps {
  orbitControlsRef: React.RefObject<{ enabled: boolean } | null>;
}

// Componente contenedor para cada objeto de sonido
interface SoundObjectContainerProps {
  object: SoundObject;
  onSelect: (id: string) => void;
}

const SoundObjectContainer = React.forwardRef<Group, SoundObjectContainerProps>(
  ({ object, onSelect }, ref) => {
    const { triggerObjectNote, triggerObjectAttackRelease } = useWorldStore();
    
    const handleClick = useCallback((event: React.MouseEvent) => {
      event.stopPropagation();
      onSelect(object.id);
      
      // Para pirámides, solo selección (el audio se maneja con onPointerDown/onPointerUp)
      if (object.type === 'pyramid') {
        // No hacer nada de audio aquí, se maneja en el componente SoundPyramid
        return;
      }
      
      // Para conos, disparar la nota (sonido percusivo)
      if (object.type === 'cone') {
        triggerObjectAttackRelease(object.id);
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
    }, [object.id, onSelect, triggerObjectNote, triggerObjectAttackRelease, object.type]);

    return (
      <group
        ref={ref}
        position={object.position}
        rotation={object.rotation}
        scale={object.scale}
        onClick={handleClick}
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
        ) : null}
      </group>
    );
  }
);

SoundObjectContainer.displayName = 'SoundObjectContainer';

// Componente principal de la escena
export function SceneContent({ orbitControlsRef }: SceneContentProps) {
  const { 
    selectedEntityId, 
    transformMode, 
    updateObject, 
    updateMobileObject,
    updateEffectZone, 
    selectEntity,
    // Acciones globales
    updateGlobalSoundObject,
    updateGlobalMobileObject,
    updateGlobalEffectZone,
    // Acciones de bloqueo de sincronización
    setSyncLock
  } = useWorldStore();

  const { 
    grids, 
    loadGrid,
    setActiveGrid,
    getGridKey,
    activeGridId
  } = useGridStore();

  // Inicializar la cuadrícula por defecto si no hay ninguna
  useEffect(() => {
    if (!grids || grids.size === 0) {
      loadGrid([0, 0, 0]);
      const defaultGridKey = getGridKey([0, 0, 0]);
      setActiveGrid(defaultGridKey);
    }
  }, [grids, loadGrid, setActiveGrid, getGridKey]);
  
  // Obtener objetos directamente del useObjectStore organizados por cuadrícula
  const allObjects = useMemo(() => {
    const objects: SoundObject[] = [];
    const mobileObjects: MobileObjectType[] = [];
    const effectZones: EffectZoneType[] = [];
    
    // Obtener objetos del useObjectStore organizados por cuadrícula
    // const objectStore = useObjectStore.getState(); // No utilizado
    
    // Convertir Map a Array para que useMemo detecte cambios correctamente
    if (!grids) return { objects, mobileObjects, effectZones };
    const gridsArray = Array.from(grids.values());
    
    
    gridsArray.forEach((grid: Grid) => {
      // Usar objetos directamente de la cuadrícula (useWorldStore) en lugar del ObjectStore
      const gridObjects = grid.objects || [];
      
      // console.log(`Grid ${grid.id}:`, {
      //   objectsFromGrid: gridObjects.length,
      //   mobileObjects: grid.mobileObjects?.length || 0,
      //   effectZones: grid.effectZones?.length || 0,
      //   isActive: grid.id === activeGridId
      // });
      
      // Usar objetos de la cuadrícula directamente
      objects.push(...gridObjects.filter((obj: SoundObject) => obj && obj.id));
      
      // Mantener objetos móviles y zonas de efectos de la cuadrícula
      if (Array.isArray(grid.mobileObjects)) {
        mobileObjects.push(...grid.mobileObjects.filter((obj: MobileObjectType) => obj && obj.id));
      }
      if (Array.isArray(grid.effectZones)) {
        effectZones.push(...grid.effectZones.filter((zone: EffectZoneType) => zone && zone.id));
      }
    });
    
    // console.log('Total objects:', {
    //   objects: objects.length,
    //   mobileObjects: mobileObjects.length,
    //   effectZones: effectZones.length
    // });
    
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

  // Referencias para el debounce de transformaciones
  const transformTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const pendingTransforms = useRef<Map<string, { position?: { x: number, y: number, z: number }, rotation?: { x: number, y: number, z: number }, scale?: { x: number, y: number, z: number } }>>(new Map());

  // Función para manejar cambios en las transformaciones con debounce
  const handleTransformChange = useCallback((entityId: string, newTransform: { position?: { x: number, y: number, z: number }, rotation?: { x: number, y: number, z: number }, scale?: { x: number, y: number, z: number } }) => {
    if (!newTransform) return;

    // Guardar la transformación pendiente
    pendingTransforms.current.set(entityId, newTransform);

    // Limpiar timeout anterior si existe
    const existingTimeout = transformTimeouts.current.get(entityId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Crear nuevo timeout para aplicar la transformación después del debounce
    const timeout = setTimeout(async () => {
      const pendingTransform = pendingTransforms.current.get(entityId);
      if (!pendingTransform) return;

      const updates: Record<string, unknown> = {};
      
      if (pendingTransform.position) {
        // Convertir posición mundial a posición local
        let localPosition = [pendingTransform.position.x, pendingTransform.position.y, pendingTransform.position.z];
        
        // Encontrar la cuadrícula que contiene este objeto para convertir a posición local
        if (!grids) return;
        for (const grid of grids.values()) {
          if (grid.objects.some((obj: SoundObject) => obj.id === entityId) ||
              grid.mobileObjects.some((obj: MobileObjectType) => obj.id === entityId) ||
              grid.effectZones.some((zone: EffectZoneType) => zone.id === entityId)) {
            // Convertir a posición local: posición mundial - posición de la cuadrícula
            localPosition = [
              pendingTransform.position.x - grid.position[0],
              pendingTransform.position.y - grid.position[1],
              pendingTransform.position.z - grid.position[2]
            ];
            break;
          }
        }
        
        updates.position = localPosition;
      }
      
      if (pendingTransform.rotation) {
        updates.rotation = [pendingTransform.rotation.x, pendingTransform.rotation.y, pendingTransform.rotation.z];
      }
      
      if (pendingTransform.scale) {
        updates.scale = [pendingTransform.scale.x, pendingTransform.scale.y, pendingTransform.scale.z];
      }
      
      if (Object.keys(updates).length > 0) {
        // Determinar si es un objeto sonoro, móvil o una zona de efecto
        const isSoundObject = allObjects.objects.some(obj => obj.id === entityId);
        const isMobileObject = allObjects.mobileObjects.some(obj => obj.id === entityId);
        const isEffectZone = allObjects.effectZones.some(zone => zone.id === entityId);
        
        // Verificar si estamos en el mundo global
        const isGlobalWorld = activeGridId === 'global-world';
        
        try {
          if (isSoundObject) {
            if (isGlobalWorld) {
              await updateGlobalSoundObject(entityId, updates);
            } else {
              updateObject(entityId, updates);
            }
          } else if (isMobileObject) {
            if (isGlobalWorld) {
              await updateGlobalMobileObject(entityId, updates);
            } else {
              updateMobileObject(entityId, updates);
            }
          } else if (isEffectZone) {
            if (isGlobalWorld) {
              await updateGlobalEffectZone(entityId, updates);
            } else {
              updateEffectZone(entityId, updates);
            }
          }
        } catch (error) {
          console.error('Error al actualizar entidad:', error);
        }
      }

      // Limpiar transformación pendiente
      pendingTransforms.current.delete(entityId);
      transformTimeouts.current.delete(entityId);
    }, 100); // Debounce de 100ms para transformaciones del gizmo

    transformTimeouts.current.set(entityId, timeout);
  }, [updateObject, updateMobileObject, updateEffectZone, updateGlobalSoundObject, updateGlobalMobileObject, updateGlobalEffectZone, allObjects, grids, activeGridId]);

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

  // Función para manejar el inicio de la manipulación
  const handleTransformStart = useCallback(() => {
    console.log('🎮 Iniciando transformación - bloqueando sincronización');
    setIsTransforming(true);
    setSyncLock(true); // Bloquear sincronización globalmente
  }, [setSyncLock]);

  // Función para manejar el fin de la manipulación
  const handleTransformEnd = useCallback(async () => {
    console.log('🎮 Finalizando transformación - desbloqueando sincronización');
    setIsTransforming(false);
    setSyncLock(false); // Desbloquear sincronización globalmente

    // Aplicar cualquier transformación pendiente inmediatamente
    if (selectedEntityId) {
      const pendingTransform = pendingTransforms.current.get(selectedEntityId);
      if (pendingTransform) {
        // Limpiar timeout existente
        const existingTimeout = transformTimeouts.current.get(selectedEntityId);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }

        // Aplicar la transformación inmediatamente
        const updates: Record<string, unknown> = {};
        
        if (pendingTransform.position) {
          // Convertir posición mundial a posición local
          let localPosition = [pendingTransform.position.x, pendingTransform.position.y, pendingTransform.position.z];
          
          // Encontrar la cuadrícula que contiene este objeto para convertir a posición local
          if (!grids) return;
          for (const grid of grids.values()) {
            if (grid.objects.some((obj: SoundObject) => obj.id === selectedEntityId) ||
                grid.mobileObjects.some((obj: MobileObjectType) => obj.id === selectedEntityId) ||
                grid.effectZones.some((zone: EffectZoneType) => zone.id === selectedEntityId)) {
              // Convertir a posición local: posición mundial - posición de la cuadrícula
              localPosition = [
                pendingTransform.position.x - grid.position[0],
                pendingTransform.position.y - grid.position[1],
                pendingTransform.position.z - grid.position[2]
              ];
              break;
            }
          }
          
          updates.position = localPosition;
        }
        
        if (pendingTransform.rotation) {
          updates.rotation = [pendingTransform.rotation.x, pendingTransform.rotation.y, pendingTransform.rotation.z];
        }
        
        if (pendingTransform.scale) {
          updates.scale = [pendingTransform.scale.x, pendingTransform.scale.y, pendingTransform.scale.z];
        }
        
        if (Object.keys(updates).length > 0) {
          // Determinar si es un objeto sonoro, móvil o una zona de efecto
          const isSoundObject = allObjects.objects.some(obj => obj.id === selectedEntityId);
          const isMobileObject = allObjects.mobileObjects.some(obj => obj.id === selectedEntityId);
          const isEffectZone = allObjects.effectZones.some(zone => zone.id === selectedEntityId);
          
          // Verificar si estamos en el mundo global
          const isGlobalWorld = activeGridId === 'global-world';
          
          try {
            if (isSoundObject) {
              if (isGlobalWorld) {
                await updateGlobalSoundObject(selectedEntityId, updates);
              } else {
                updateObject(selectedEntityId, updates);
              }
            } else if (isMobileObject) {
              if (isGlobalWorld) {
                await updateGlobalMobileObject(selectedEntityId, updates);
              } else {
                updateMobileObject(selectedEntityId, updates);
              }
            } else if (isEffectZone) {
              if (isGlobalWorld) {
                await updateGlobalEffectZone(selectedEntityId, updates);
              } else {
                updateEffectZone(selectedEntityId, updates);
              }
            }
          } catch (error) {
            console.error('Error al actualizar entidad al finalizar transformación:', error);
          }
        }

        // Limpiar transformación pendiente
        pendingTransforms.current.delete(selectedEntityId);
        transformTimeouts.current.delete(selectedEntityId);
      }
    }
  }, [selectedEntityId, allObjects, grids, activeGridId, updateObject, updateMobileObject, updateEffectZone, updateGlobalSoundObject, updateGlobalMobileObject, updateGlobalEffectZone, setSyncLock]);

  // Estado para rastrear si se está manipulando un objeto
  const [isTransforming, setIsTransforming] = React.useState(false);

  // Efecto para controlar OrbitControls basado en el estado de transformación
  React.useEffect(() => {
    if (orbitControlsRef.current) {
      // Solo deshabilitar OrbitControls cuando se esté transformando activamente
      orbitControlsRef.current.enabled = !isTransforming;
      console.log('🎮 OrbitControls enabled:', !isTransforming);
    }
  }, [isTransforming, orbitControlsRef]);

  // Limpiar timeouts cuando el componente se desmonte
  useEffect(() => {
    const timeoutsRef = transformTimeouts;
    const pendingRef = pendingTransforms;
    
    return () => {
      // Limpiar todos los timeouts pendientes
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      timeoutsRef.current.clear();
      pendingRef.current.clear();
    };
  }, []);

  // Log para verificar que está leyendo el estado correctamente (solo cuando cambie)
  useEffect(() => {
  }, [allObjects.objects.length, allObjects.mobileObjects.length, allObjects.effectZones.length, grids?.size]);

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
      {grids && Array.from(grids.values()).map((grid: Grid) => {
        if (!grid || !grid.id) return null;
        
        // Usar objetos directamente de la cuadrícula
        const gridObjects = grid.objects || [];
        
        return (
          <group key={grid.id} position={grid.position}>
          {/* Renderizado de objetos sonoros de esta cuadrícula */}
          {gridObjects.map((obj: SoundObject) => {
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
          {Array.isArray(grid.mobileObjects) && grid.mobileObjects.map((mobileObj: MobileObjectType) => {
            if (!mobileObj || !mobileObj.id) return null;
            const objectRef = entityRefs.get(mobileObj.id);
            if (!objectRef) return null;
            
            return (
              <MobileObject
                key={`mobile-${mobileObj.id}`}
                id={mobileObj.id}
                position={[0, 0, 0]} // Posición relativa a la cuadrícula
                rotation={mobileObj.rotation}
                scale={mobileObj.scale}
                isSelected={mobileObj.isSelected}
                mobileParams={{
                  ...mobileObj.mobileParams,
                  centerPosition: [0, 0, 0] // Centro relativo a la cuadrícula
                }}
                onUpdatePosition={(id, position) => updateMobileObject(id, { position })}
                onSelect={handleEntitySelect}
                ref={objectRef}
              />
            );
          })}

          {/* Renderizado de zonas de efectos de esta cuadrícula */}
          {Array.isArray(grid.effectZones) && grid.effectZones.map((zone: EffectZoneType) => {
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
        const selectedEntity = allObjects.objects.find(obj => obj.id === selectedEntityId) || 
                              allObjects.mobileObjects.find(obj => obj.id === selectedEntityId) ||
                              allObjects.effectZones.find(zone => zone.id === selectedEntityId);
        
        if (!selectedEntity) return null;
        
        // Verificar si la zona está bloqueada
        const isLocked = 'isLocked' in selectedEntity && selectedEntity.isLocked;
        
        // Encontrar la cuadrícula que contiene este objeto para calcular la posición mundial
        let worldPosition = selectedEntity.position;
        let foundGrid = null;
        
        // Buscar en todas las cuadrículas para encontrar dónde está el objeto
        if (!grids) return null;
        for (const grid of grids.values()) {
          if (grid.objects.some((obj: SoundObject) => obj.id === selectedEntityId) ||
              grid.mobileObjects.some((obj: MobileObjectType) => obj.id === selectedEntityId) ||
              grid.effectZones.some((zone: EffectZoneType) => zone.id === selectedEntityId)) {
            foundGrid = grid;
            break;
          }
        }
        
        if (foundGrid) {
          // Calcular posición mundial: posición de la cuadrícula + posición local del objeto
          worldPosition = [
            foundGrid.position[0] + selectedEntity.position[0],
            foundGrid.position[1] + selectedEntity.position[1],
            foundGrid.position[2] + selectedEntity.position[2]
          ] as [number, number, number];
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
            onMouseDown={handleTransformStart}
            onMouseUp={handleTransformEnd}
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
    </>
  );
}
