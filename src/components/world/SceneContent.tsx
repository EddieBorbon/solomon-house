'use client';

import React, { useMemo, useCallback } from 'react';
import { TransformControls } from '@react-three/drei';
import { Group } from 'three';
import { useWorldStore } from '../../state/useWorldStore';
import { SoundCube } from '../sound-objects/SoundCube';
import { SoundSphere } from '../sound-objects/SoundSphere';
import { SoundCylinder } from '../sound-objects/SoundCylinder';
import { SoundCone } from '../sound-objects/SoundCone';
import { SoundPyramid } from '../sound-objects/SoundPyramid';
import { SoundIcosahedron } from '../sound-objects/SoundIcosahedron';
import { SoundPlane } from '../sound-objects/SoundPlane';
import { SoundTorus } from '../sound-objects/SoundTorus';
import { SoundDodecahedronRing } from '../sound-objects/SoundDodecahedronRing';

interface SceneContentProps {
  orbitControlsRef: React.RefObject<any>;
}

// Componente contenedor para cada objeto de sonido
interface SoundObjectContainerProps {
  object: any;
  onSelect: (id: string) => void;
}

const SoundObjectContainer = React.forwardRef<Group, SoundObjectContainerProps>(
  ({ object, onSelect }, ref) => {
    const { triggerObjectNote, toggleObjectAudio } = useWorldStore();
    
    const handleClick = useCallback((event: any) => {
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
        ) : null}
      </group>
    );
  }
);

SoundObjectContainer.displayName = 'SoundObjectContainer';

// Componente principal de la escena
export function SceneContent({ orbitControlsRef }: SceneContentProps) {
  const { objects, selectedObjectId, transformMode, updateObject, selectObject } = useWorldStore();
  
  // Crear un Map de refs para cada objeto
  const objectRefs = useMemo(() => {
    const refs = new Map<string, React.RefObject<Group | null>>();
    objects.forEach(obj => {
      refs.set(obj.id, React.createRef<Group | null>());
    });
    return refs;
  }, [objects]);

  // Función para manejar cambios en las transformaciones
  const handleTransformChange = useCallback((objectId: string, newTransform: any) => {
    if (newTransform) {
      const updates: any = {};
      
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
        updateObject(objectId, updates);
      }
    }
  }, [updateObject]);

  // Función para manejar la selección de objetos
  const handleObjectSelect = useCallback((id: string) => {
    selectObject(id);
  }, [selectObject]);

  // Función para manejar clic en el espacio vacío
  const handleBackgroundClick = useCallback((event: any) => {
    // Solo deseleccionar si se hace clic directamente en el fondo (no en un objeto)
    if (event.object === undefined || event.object.type === 'Mesh' && event.object.geometry.type === 'PlaneGeometry') {
      selectObject(null);
    }
  }, [selectObject]);

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

  // Log para verificar que está leyendo el estado correctamente
  console.log('🎵 SceneContent - Objetos en el mundo:', objects);

  return (
    <>
      {/* Plano invisible para capturar clics en el espacio vacío */}
      <mesh 
        position={[0, -10, 0]} 
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={handleBackgroundClick}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Renderizado de objetos del mundo */}
      {objects.map((obj) => {
        console.log(`🎯 Renderizando objeto: ${obj.type} en posición [${obj.position.join(', ')}]`);
        
        const objectRef = objectRefs.get(obj.id);
        if (!objectRef) return null;
        
        return (
          <SoundObjectContainer 
            key={obj.id} 
            object={obj} 
            onSelect={handleObjectSelect}
            ref={objectRef}
          />
        );
      })}

            {/* TransformControls para el objeto seleccionado */}
      {selectedObjectId && (() => {
        const selectedObject = objects.find(obj => obj.id === selectedObjectId);
        if (!selectedObject) return null;
        
        return (
          <TransformControls
            key={`${selectedObjectId}-${transformMode}`}
            object={objectRefs.get(selectedObjectId)?.current || undefined}
            mode={transformMode}
            position={selectedObject.position}
            rotation={selectedObject.rotation}
            scale={selectedObject.scale}
            onObjectChange={(e: any) => {
              if (e?.target?.object) {
                handleTransformChange(selectedObjectId, e.target.object);
              }
            }}
            onMouseDown={handleTransformStart}
            onMouseUp={handleTransformEnd}
            size={0.75}
          />
        );
      })()}

      {/* Mensaje cuando no hay objetos */}
      {objects.length === 0 && (
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
