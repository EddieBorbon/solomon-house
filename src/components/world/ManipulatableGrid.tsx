'use client';

import React, { useRef, useState } from 'react';
import { Grid, Html } from '@react-three/drei';
import { useWorldStore } from '../../state/useWorldStore';
import { useLanguage } from '../../contexts/LanguageContext';
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
  const { selectGrid, setActiveGrid, activeGridId, grids, createGrid, getGridKey } = useWorldStore();
  const { t } = useLanguage();
  const groupRef = useRef<THREE.Group>(null);
  const [isHovered, setIsHovered] = useState(false);

  const isActive = activeGridId === grid.id || Boolean(grid.isSelected);

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onSelect(grid.id);
    selectGrid(grid.id);
    setActiveGrid(grid.id); // Establecer como cuadrícula activa para crear objetos
  };

  const handleSpawnAdjacent = (
    event: { stopPropagation: () => void },
    dx: number,
    dz: number
  ) => {
    event.stopPropagation();
    const [cx, cy, cz] = grid.coordinates;
    const nextCoords: [number, number, number] = [cx + dx, cy, cz + dz];
    const nextKey = getGridKey(nextCoords);
    const size = grid.gridSize || 20;

    if (!grids.has(nextKey)) {
      createGrid([nextCoords[0] * size, nextCoords[1] * size, nextCoords[2] * size], size);
    }
    selectGrid(nextKey);
    setActiveGrid(nextKey);
  };

  return (
    <group 
      ref={groupRef}
      position={grid.position}
      rotation={grid.rotation || [0, 0, 0]}
      scale={grid.scale || [1, 1, 1]}
    >
      {/* Cuadrícula con líneas nítidas de alto contraste sobre el mapa blanco */}
      <Grid
        args={[grid.gridSize, grid.gridSize]}
        position={[0, 0, 0]}
        cellSize={1}
        cellThickness={isActive ? 1.0 : isHovered ? 1.0 : 0.75}
        cellColor={isActive ? '#4b5563' : isHovered ? '#b45309' : '#888888'}
        sectionSize={5}
        sectionThickness={isActive ? 2.0 : isHovered ? 1.8 : 1.3}
        sectionColor={isActive ? '#065f46' : isHovered ? '#d97706' : '#555555'}
        fadeDistance={90}
        fadeStrength={0.6}
        followCamera={false}
        infiniteGrid={false}
      />
      
      
      {/* Esferas en las esquinas - clickeables para selección */}
      {[
        [-grid.gridSize/2, 0, -grid.gridSize/2],
        [grid.gridSize/2, 0, -grid.gridSize/2],
        [-grid.gridSize/2, 0, grid.gridSize/2],
        [grid.gridSize/2, 0, grid.gridSize/2]
      ].map((corner, index) => (
        <mesh 
          key={index} 
          position={corner as [number, number, number]}
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
      
      {/* Bordes clickeables adicionales para facilitar la selección */}
      {/* Bordes horizontales */}
      {[
        [0, 0, -grid.gridSize/2], // Borde frontal
        [0, 0, grid.gridSize/2]  // Borde trasero
      ].map((edge, index) => (
        <mesh 
          key={`horizontal-${index}`} 
          position={edge as [number, number, number]}
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
          <boxGeometry args={[grid.gridSize, 0.1, 0.2]} />
          <meshBasicMaterial 
            color={grid.isSelected ? '#00ff88' : isHovered ? '#ffaa00' : '#888888'}
            transparent
            opacity={0.3}
          />
        </mesh>
      ))}
      
      {/* Bordes verticales */}
      {[
        [-grid.gridSize/2, 0, 0], // Borde izquierdo
        [grid.gridSize/2, 0, 0]   // Borde derecho
      ].map((edge, index) => (
        <mesh 
          key={`vertical-${index}`} 
          position={edge as [number, number, number]}
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
          <boxGeometry args={[0.2, 0.1, grid.gridSize]} />
          <meshBasicMaterial 
            color={grid.isSelected ? '#00ff88' : isHovered ? '#ffaa00' : '#888888'}
            transparent
            opacity={0.3}
          />
        </mesh>
      ))}
      
      {/* Círculo de selección eliminado - solo se mantiene la iluminación verde */}
      
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

      {/* Botones 3D en los 4 lados de la cuadrícula activa para crear cuadrículas adyacentes */}
      {isActive &&
        (
          [
            { label: t('gridsSubpanel.west'), dx: -1, dz: 0, pos: [-grid.gridSize / 2 - 1.1, 0.15, 0] },
            { label: t('gridsSubpanel.east'), dx: 1, dz: 0, pos: [grid.gridSize / 2 + 1.1, 0.15, 0] },
            { label: t('gridsSubpanel.north'), dx: 0, dz: -1, pos: [0, 0.15, -grid.gridSize / 2 - 1.1] },
            { label: t('gridsSubpanel.south'), dx: 0, dz: 1, pos: [0, 0.15, grid.gridSize / 2 + 1.1] },
          ] as const
        ).map((side) => {
          const neighborKey = getGridKey([
            grid.coordinates[0] + side.dx,
            grid.coordinates[1],
            grid.coordinates[2] + side.dz,
          ]);
          const alreadyExists = grids.has(neighborKey);
          if (alreadyExists) return null;

          return (
            <group key={side.label} position={side.pos as unknown as [number, number, number]}>
              <mesh
                onClick={(e) => handleSpawnAdjacent(e, side.dx, side.dz)}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  document.body.style.cursor = 'pointer';
                }}
                onPointerOut={(e) => {
                  e.stopPropagation();
                  document.body.style.cursor = 'auto';
                }}
              >
                <boxGeometry args={[1.6, 0.18, 1.6]} />
                <meshBasicMaterial color="#10b981" transparent opacity={0.75} />
              </mesh>
              <Html position={[0, 0.35, 0]} center distanceFactor={18}>
                <button
                  onClick={(e) => handleSpawnAdjacent(e, side.dx, side.dz)}
                  className="px-1.5 py-0.5 rounded bg-emerald-950/90 border border-emerald-400 text-[9px] font-mono text-emerald-200 hover:bg-emerald-500 hover:text-black transition whitespace-nowrap shadow"
                >
                  {side.label}
                </button>
              </Html>
            </group>
          );
        })}
    </group>
  );
}
