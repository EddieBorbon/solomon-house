'use client';

import React, { useRef, useState } from 'react';
import { Grid, Text } from '@react-three/drei';
import { useWorldStore } from '../../state/useWorldStore';
import * as THREE from 'three';

interface ManipulatableGridProps {
  grid: {
    id: string;
    coordinates: [number, number, number];
    position: [number, number, number];
    rotation?: [number, number, number] | THREE.Euler;
    scale?: [number, number, number] | number;
    gridSize: number;
    isSelected?: boolean;
    [key: string]: unknown;
  };
  onSelect: (gridId: string) => void;
}

export function ManipulatableGrid({ grid, onSelect }: ManipulatableGridProps) {
  const { selectGrid, setActiveGrid } = useWorldStore();
  const groupRef = useRef<THREE.Group>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (event: React.MouseEvent) => {
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
      rotation={grid.rotation || [0, 0, 0]}
      scale={grid.scale || [1, 1, 1]}
    >
      {/* Plano invisible más grande para facilitar la selección */}
      <mesh 
        position={[0, 0.01, 0]}
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          setIsHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setIsHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <planeGeometry args={[grid.gridSize + 2, grid.gridSize + 2]} />
        <meshBasicMaterial 
          transparent 
          opacity={0} 
          side={2} // DoubleSide
        />
      </mesh>
      
      {/* Cuadrícula con líneas usando Grid de drei - más visible */}
      <Grid
        args={[grid.gridSize, grid.gridSize]}
        position={[0, 0, 0]}
        cellSize={1}
        cellThickness={grid.isSelected ? 1.2 : isHovered ? 1.0 : 0.8}
        cellColor={grid.isSelected ? '#00ff88' : isHovered ? '#ffaa00' : '#888888'}
        sectionSize={5}
        sectionThickness={grid.isSelected ? 2.5 : isHovered ? 2.0 : 1.5}
        sectionColor={grid.isSelected ? '#00ff88' : isHovered ? '#ffaa00' : '#aaaaaa'}
        fadeDistance={50}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={false}
      />
      
      
      {/* Esferas en las esquinas - más visibles */}
      {[
        [-grid.gridSize/2, 0, -grid.gridSize/2],
        [grid.gridSize/2, 0, -grid.gridSize/2],
        [-grid.gridSize/2, 0, grid.gridSize/2],
        [grid.gridSize/2, 0, grid.gridSize/2]
      ].map((corner, index) => (
        <mesh key={index} position={corner as [number, number, number]}>
          <sphereGeometry args={[0.3, 12, 8]} />
          <meshBasicMaterial 
            color={grid.isSelected ? '#00ff88' : isHovered ? '#ffaa00' : '#888888'}
          />
        </mesh>
      ))}
      
      {/* Indicador central más prominente */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.2, 8]} />
        <meshBasicMaterial 
          color={grid.isSelected ? '#00ff88' : isHovered ? '#ffaa00' : '#666666'}
        />
      </mesh>
      
      {/* Borde de selección más visible */}
      {grid.isSelected && (
        <mesh position={[0, 0.02, 0]}>
          <ringGeometry args={[grid.gridSize/2 - 0.5, grid.gridSize/2 + 0.5, 32]} />
          <meshBasicMaterial 
            color="#00ff88"
            transparent
            opacity={0.6}
            side={2}
          />
        </mesh>
      )}
      
      {/* Indicador de hover */}
      {isHovered && !grid.isSelected && (
        <mesh position={[0, 0.03, 0]}>
          <ringGeometry args={[grid.gridSize/2 - 0.3, grid.gridSize/2 + 0.3, 32]} />
          <meshBasicMaterial 
            color="#ffaa00"
            transparent
            opacity={0.4}
            side={2}
          />
        </mesh>
      )}
      
      {/* Texto de identificación en hover */}
      {isHovered && (
        <Text
          position={[0, 1, 0]}
          fontSize={0.5}
          color="#ffaa00"
          anchorX="center"
          anchorY="middle"
        >
          {grid.id === '0,0,0' ? 'Cuadrícula Principal' : `Cuadrícula ${grid.id.slice(0, 8)}...`}
        </Text>
      )}
    </group>
  );
}
