'use client';

import React, { useMemo, useCallback } from 'react';
import { TransformControls } from '@react-three/drei';
import { Group } from 'three';
import { useWorldStore } from '../../state/useWorldStore';
import { SoundCube } from '../sound-objects/SoundCube';

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
    const handleClick = useCallback((event: any) => {
      event.stopPropagation();
      onSelect(object.id);
    }, [object.id, onSelect]);

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
          />
        ) : (
          <group>
            <mesh 
              castShadow
              receiveShadow
            >
              <sphereGeometry args={[0.7, 16, 16]} />
              <meshStandardMaterial 
                color={object.isSelected ? '#ff6b6b' : '#a29bfe'} 
                transparent 
                opacity={0.8}
                roughness={0.2}
                metalness={0.3}
              />
            </mesh>
            
            {/* Indicador de selección */}
            {object.isSelected && (
              <mesh position={[0, 1.5, 0]}>
                <sphereGeometry args={[0.2, 8, 6]} />
                <meshStandardMaterial 
                  color="#ffd93d" 
                  emissive="#ffd93d" 
                  emissiveIntensity={0.5} 
                />
              </mesh>
            )}

            {/* Etiqueta del objeto */}
            <group position={[0, -1.2, 0]}>
              <mesh>
                <planeGeometry args={[2, 0.5]} />
                <meshBasicMaterial color="#000000" transparent opacity={0.7} />
              </mesh>
            </group>
          </group>
        )}
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
