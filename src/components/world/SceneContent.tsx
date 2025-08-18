'use client';

import { useWorldStore } from '../../state/useWorldStore';
import { SoundCube } from '../sound-objects/SoundCube';

export function SceneContent() {
  // Suscripción al store de Zustand
  const { objects, selectObject } = useWorldStore();

  // Log para verificar que está leyendo el estado correctamente
  console.log('🎵 SceneContent - Objetos en el mundo:', objects);

  const handleObjectClick = (objectId: string) => {
    selectObject(objectId);
    console.log(`🎯 Objeto seleccionado: ${objectId}`);
  };

  return (
    <>
      {/* Renderizado de objetos del mundo */}
      {objects.map((obj) => {
        console.log(`🎯 Renderizando objeto: ${obj.type} en posición [${obj.position.join(', ')}]`);
        
        return (
          <group key={obj.id}>
            {/* Renderizado según el tipo de objeto */}
            {obj.type === 'cube' ? (
              <SoundCube
                id={obj.id}
                position={obj.position}
                rotation={obj.rotation}
                scale={obj.scale}
                isSelected={obj.isSelected}
                audioEnabled={obj.audioEnabled}
              />
            ) : (
              <group position={obj.position}>
                <mesh 
                  onClick={() => handleObjectClick(obj.id)}
                  castShadow
                  receiveShadow
                >
                  <sphereGeometry args={[0.7, 16, 16]} />
                  <meshStandardMaterial 
                    color={obj.isSelected ? '#ff6b6b' : '#a29bfe'} 
                    transparent 
                    opacity={0.8}
                    roughness={0.2}
                    metalness={0.3}
                  />
                </mesh>
                
                {/* Indicador de selección */}
                {obj.isSelected && (
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
      })}

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
