'use client';

import React, { useMemo, useCallback, useEffect } from 'react';
import { TransformControls } from '@react-three/drei';
import { Group } from 'three';
import { useWorldStore, type SoundObject, type MobileObject as MobileObjectType, type EffectZone } from '../../state/useWorldStore';
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
  orbitControlsRef: React.RefObject<unknown>;
}

// Componente contenedor para cada objeto de sonido
interface SoundObjectContainerProps {
  object: {
    id: string;
    type: string;
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
    isSelected: boolean;
    audioEnabled: boolean;
    audioParams: Record<string, unknown>;
    [key: string]: unknown;
  };
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
      
      // Para conos, activar/desactivar el audio
      if (object.type === 'cone') {
        toggleObjectAudio(object.id);
      } else if (object.type === 'icosahedron' || object.type === 'plane' || object.type === 'torus') {
        // Para icosaedros, planos y toroides, solo disparar la nota (sonido percusivo)
        triggerObjectNote(object.id);
      } else if (object.type === 'dodecahedronRing') {
        // Para anillos de dodecaedros, activar/desactivar el audio (sonido continuo)
        toggleObjectAudio(object.id);
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
            audioParams={object.audioParams}
          />
        ) : object.type === 'sphere' ? (
          <SoundSphere
            id={object.id}
            position={[0, 0, 0]}
            isSelected={object.isSelected}
            audioEnabled={object.audioEnabled}
            audioParams={object.audioParams}
          />
        ) : object.type === 'cylinder' ? (
          <SoundCylinder
            id={object.id}
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            scale={[1, 1, 1]}
            isSelected={object.isSelected}
            audioEnabled={object.audioEnabled}
            audioParams={object.audioParams}
          />
        ) : object.type === 'cone' ? (
          <SoundCone
            id={object.id}
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            scale={[1, 1, 1]}
            isSelected={object.isSelected}
            audioEnabled={object.audioEnabled}
            audioParams={object.audioParams}
          />
        ) : object.type === 'pyramid' ? (
          <SoundPyramid
            id={object.id}
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            scale={[1, 1, 1]}
            isSelected={object.isSelected}
            audioEnabled={object.audioEnabled}
          />
        ) : object.type === 'icosahedron' ? (
          <SoundIcosahedron
            id={object.id}
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            scale={[1, 1, 1]}
            isSelected={object.isSelected}
            audioParams={object.audioParams}
          />
        ) : object.type === 'plane' ? (
          <SoundPlane
            id={object.id}
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            scale={[1, 1, 1]}
            isSelected={object.isSelected}
            audioParams={object.audioParams}
          />
        ) : object.type === 'torus' ? (
          <SoundTorus
            id={object.id}
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            scale={[1, 1, 1]}
            isSelected={object.isSelected}
            audioParams={object.audioParams}
          />
        ) : object.type === 'dodecahedronRing' ? (
          <SoundDodecahedronRing
            id={object.id}
            position={[0, 0, 0]}
            isSelected={object.isSelected}
            audioEnabled={object.audioEnabled}
            audioParams={object.audioParams}
          />
        ) : object.type === 'spiral' ? (
          <SoundSpiral
            id={object.id}
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            scale={[1, 1, 1]}
            isSelected={object.isSelected}
            audioParams={object.audioParams}
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
    selectEntity
  } = useWorldStore();
  
  // Obtener todos los objetos de todas las cuadrículas
  const allObjects = useMemo(() => {
    const objects: SoundObject[] = [];
    const mobileObjects: MobileObjectType[] = [];
    const effectZones: EffectZone[] = [];
    
    // Convertir Map a Array para que useMemo detecte cambios correctamente
    const gridsArray = Array.from(grids.values());
    
    console.log(`🔍 SceneContent useMemo - Procesando ${gridsArray.length} cuadrículas`);
    
    gridsArray.forEach((grid, index) => {
      console.log(`🔍 Cuadrícula ${index} (${grid.id}):`, {
        objects: grid.objects?.length || 0,
        mobileObjects: grid.mobileObjects?.length || 0,
        effectZones: grid.effectZones?.length || 0
      });
      
      // Verificar que los arrays existan antes de hacer push
      if (Array.isArray(grid.objects)) {
        objects.push(...grid.objects.filter(obj => obj && obj.id));
      }
      if (Array.isArray(grid.mobileObjects)) {
        mobileObjects.push(...grid.mobileObjects.filter(obj => obj && obj.id));
      }
      if (Array.isArray(grid.effectZones)) {
        effectZones.push(...grid.effectZones.filter(zone => zone && zone.id));
      }
    });
    
    console.log(`🔍 SceneContent useMemo - Total recopilado:`, {
      objects: objects.length,
      mobileObjects: mobileObjects.length,
      effectZones: effectZones.length
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

  // Función para manejar cambios en las transformaciones
  const handleTransformChange = useCallback((entityId: string, newTransform: { position?: { x: number, y: number, z: number }, rotation?: { x: number, y: number, z: number }, scale?: { x: number, y: number, z: number } }) => {
    if (newTransform) {
      const updates: Record<string, unknown> = {};
      
      if (newTransform.position) {
        updates.position = [newTransform.position.x, newTransform.position.y, newTransform.position.z];
      }
      
      if (newTransform.rotation) {
        updates.rotation = [newTransform.rotation.x, newTransform.rotation.y, newTransform.rotation.z];
      }
      
      if (newTransform.scale) {
        updates.scale = [newTransform.scale.x, newTransform.scale.y, newTransform.scale.z];
      }
      
      if (Object.keys(updates).length > 0) {
        // Determinar si es un objeto sonoro, móvil o una zona de efecto
        const isSoundObject = allObjects.objects.some(obj => obj.id === entityId);
        const isMobileObject = allObjects.mobileObjects.some(obj => obj.id === entityId);
        const isEffectZone = allObjects.effectZones.some(zone => zone.id === entityId);
        
        if (isSoundObject) {
          updateObject(entityId, updates);
        } else if (isMobileObject) {
          updateMobileObject(entityId, updates);
        } else if (isEffectZone) {
          updateEffectZone(entityId, updates);
        }
      }
    }
  }, [updateObject, updateMobileObject, updateEffectZone, allObjects]);

  // Función para manejar la selección de entidades
  const handleEntitySelect = useCallback((id: string) => {
    console.log(`🎯 Seleccionando entidad: ${id}`);
    selectEntity(id);
    console.log(`🎯 Entidad seleccionada: ${id}`);
  }, [selectEntity]);

  // Función para manejar clic en el espacio vacío
  const handleBackgroundClick = useCallback((event: React.MouseEvent) => {
    // Solo deseleccionar si se hace clic directamente en el fondo (no en un objeto)
    if (event.object === undefined || event.object.type === 'Mesh' && event.object.geometry.type === 'PlaneGeometry') {
      selectEntity(null);
    }
  }, [selectEntity]);

  // Función para manejar el inicio de la manipulación
  const handleTransformStart = useCallback(() => {
    if (orbitControlsRef.current) {
      orbitControlsRef.current.enabled = false;
      console.log('🔄 Transformación iniciada - OrbitControls deshabilitado');
    }
  }, [orbitControlsRef]);

  // Función para manejar el fin de la manipulación
  const handleTransformEnd = useCallback(() => {
    if (orbitControlsRef.current) {
      orbitControlsRef.current.enabled = true;
      console.log('✅ Transformación completada - OrbitControls habilitado');
    }
  }, [orbitControlsRef]);

  // Efecto para controlar OrbitControls basado en el estado de edición de zona de efectos
  // Solo deshabilitar OrbitControls cuando se estén usando TransformControls, no solo por editar
  React.useEffect(() => {
    if (orbitControlsRef.current) {
      // Solo deshabilitar OrbitControls cuando se estén usando TransformControls
      // El estado isEditingEffectZone no debería bloquear la cámara
      // Mantener OrbitControls habilitado para permitir movimiento de cámara
      orbitControlsRef.current.enabled = true;
      console.log('🎛️ OrbitControls siempre habilitados para permitir movimiento de cámara');
    }
  }, [orbitControlsRef]);

  // Log para verificar que está leyendo el estado correctamente (solo cuando cambie)
  useEffect(() => {
    console.log('🎵 SceneContent - Objetos en el mundo:', allObjects.objects.length);
    console.log('🚀 SceneContent - Objetos móviles:', allObjects.mobileObjects.length);
    console.log('🎛️ SceneContent - Zonas de efectos:', allObjects.effectZones.length);
    console.log('📐 SceneContent - Cuadrículas disponibles:', grids.size);
  }, [allObjects.objects.length, allObjects.mobileObjects.length, allObjects.effectZones.length, grids.size]);

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
        return (
          <group key={grid.id} position={grid.position}>
          {/* Renderizado de objetos sonoros de esta cuadrícula */}
          {Array.isArray(grid.objects) && grid.objects.map((obj) => {
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
        const selectedEntity = allObjects.objects.find(obj => obj.id === selectedEntityId) || 
                              allObjects.mobileObjects.find(obj => obj.id === selectedEntityId) ||
                              allObjects.effectZones.find(zone => zone.id === selectedEntityId);
        
        if (!selectedEntity) return null;
        
        // Verificar si la zona está bloqueada
        const isLocked = 'isLocked' in selectedEntity && selectedEntity.isLocked;
        
        return (
          <TransformControls
            key={`${selectedEntityId}-${transformMode}`}
            object={entityRefs.get(selectedEntityId)?.current || undefined}
            mode={transformMode}
            // No aplicar la rotación del objeto al gizmo para que se mantenga alineado con la vista
            position={selectedEntity.position}
            rotation={[0, 0, 0]} // Gizmo siempre alineado con la vista
            scale={selectedEntity.scale}
            enabled={!isLocked} // Deshabilitar si está bloqueada
            onObjectChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (e?.target?.object) {
                handleTransformChange(selectedEntityId, e.target.object);
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
