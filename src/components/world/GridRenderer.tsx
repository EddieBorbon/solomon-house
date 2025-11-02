'use client';

import React from 'react';
import { useWorldStore } from '../../state/useWorldStore';
import { ManipulatableGrid } from './ManipulatableGrid';

interface GridRendererProps {
  position?: [number, number, number];
}

export function GridRenderer({ position = [0, 0, 0] }: GridRendererProps) {
  const { grids, selectGrid, showGrid } = useWorldStore();

  const handleGridSelect = (gridId: string) => {
    selectGrid(gridId);
  };

  // Si la cuadrícula está oculta, no renderizar nada
  if (!showGrid) {
    return null;
  }

  return (
    <group position={position}>
      {/* Renderizar todas las cuadrículas como objetos manipulables */}
      {Array.from(grids.values()).map((grid) => {
        if (!grid || !grid.id) return null;
        return (
          <ManipulatableGrid
            key={grid.id}
            grid={grid}
            onSelect={handleGridSelect}
          />
        );
      })}
    </group>
  );
}
