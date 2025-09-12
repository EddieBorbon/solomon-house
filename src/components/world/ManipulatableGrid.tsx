'use client';

import React, { useRef } from 'react';
import { Grid } from '@react-three/drei';
import { useWorldStore } from '../../state/useWorldStore';
import * as THREE from 'three';

interface ManipulatableGridProps {
  grid: any;
  onSelect: (gridId: string) => void;
}

export function ManipulatableGrid({ grid, onSelect }: ManipulatableGridProps) {
  const { selectGrid, setActiveGrid } = useWorldStore();
  const groupRef = useRef<THREE.Group>(null);

  const handleClick = (event: any) => {
    event.stopPropagation();
    onSelect(grid.id);
    selectGrid(grid.id);
    setActiveGrid(grid.id); // Establecer como cuadrícula activa para crear objetos
    
    console.log(`🎯 Cuadrícula ${grid.id} seleccionada y activada. Coordenadas:`, grid.coordinates);
    console.log(`🎯 Posición 3D de la cuadrícula:`, grid.position);
  };

  return (
    <group 
      ref={groupRef}
      position={grid.position}
      rotation={grid.rotation}
      scale={grid.scale}
      onClick={handleClick}
    >
      {/* Cuadrícula principal - más visible */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[grid.gridSize, grid.gridSize]} />
        <meshBasicMaterial
          color={grid.isSelected ? '#00ff88' : '#606060'}
          transparent
          opacity={grid.isSelected ? 0.4 : 0.2}
        />
      </mesh>
      
      {/* Cuadrícula con líneas usando Grid de drei - más visible */}
      <Grid
        args={[grid.gridSize, grid.gridSize]}
        position={[0, 0, 0]}
        cellSize={1}
        cellThickness={grid.isSelected ? 1 : 0.8}
        cellColor={grid.isSelected ? '#00ff88' : '#888888'}
        sectionSize={5}
        sectionThickness={grid.isSelected ? 2 : 1.5}
        sectionColor={grid.isSelected ? '#00ff88' : '#aaaaaa'}
        fadeDistance={50}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={false}
      />
      
      {/* Borde de la cuadrícula para mayor visibilidad - simplificado */}
      <mesh position={[0, 0.01, 0]}>
        <planeGeometry args={[grid.gridSize, grid.gridSize]} />
        <meshBasicMaterial
          color={grid.isSelected ? '#00ff88' : '#999999'}
          transparent
          opacity={grid.isSelected ? 0.1 : 0.05}
          side={2} // DoubleSide
        />
      </mesh>
      
      {/* Esferas en las esquinas - simplificadas */}
      {[
        [-grid.gridSize/2, 0, -grid.gridSize/2],
        [grid.gridSize/2, 0, -grid.gridSize/2],
        [-grid.gridSize/2, 0, grid.gridSize/2],
        [grid.gridSize/2, 0, grid.gridSize/2]
      ].map((corner, index) => (
        <mesh key={index} position={corner as [number, number, number]}>
          <sphereGeometry args={[0.2, 8, 6]} />
          <meshBasicMaterial 
            color={grid.isSelected ? '#00ff88' : '#888888'}
          />
        </mesh>
      ))}
      
      {/* Etiqueta de la cuadrícula */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshBasicMaterial 
          color={grid.isSelected ? '#00ff88' : '#666666'}
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
}
