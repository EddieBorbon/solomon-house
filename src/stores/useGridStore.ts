import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { type Grid, type GridActions } from '../types/world';

interface GridState {
  grids: Map<string, Grid>;
  currentGridCoordinates: [number, number, number];
  activeGridId: string | null;
  gridSize: number;
  renderDistance: number;
}

export const useGridStore = create<GridState & GridActions>((set, get) => ({
  // Estado inicial
  grids: new Map([
    ['0,0,0', {
      id: '0,0,0',
      coordinates: [0, 0, 0],
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      objects: [],
      mobileObjects: [],
      effectZones: [],
      gridSize: 20,
      gridColor: '#404040',
      isLoaded: true,
      isSelected: false
    }]
  ]),
  currentGridCoordinates: [0, 0, 0],
  activeGridId: '0,0,0',
  gridSize: 20,
  renderDistance: 2,

  // Acciones para gestión de cuadrículas
  getGridKey: (coordinates: [number, number, number]) => {
    return `${coordinates[0]},${coordinates[1]},${coordinates[2]}`;
  },

  loadGrid: (coordinates: [number, number, number]) => {
    const state = get();
    const gridKey = state.getGridKey(coordinates);
    
    if (state.grids.has(gridKey)) {
      return; // Ya está cargada
    }

    const newGrid: Grid = {
      id: gridKey,
      coordinates,
      position: [coordinates[0] * state.gridSize, coordinates[1] * state.gridSize, coordinates[2] * state.gridSize],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      objects: [],
      mobileObjects: [],
      effectZones: [],
      gridSize: state.gridSize,
      gridColor: '#404040',
      isLoaded: true,
      isSelected: false
    };

    set((state) => ({
      grids: new Map(state.grids.set(gridKey, newGrid)),
    }));

    console.log(`📐 Cargando cuadrícula: ${gridKey}`);
  },

  unloadGrid: (coordinates: [number, number, number]) => {
    const state = get();
    const gridKey = state.getGridKey(coordinates);
    
    if (coordinates[0] === 0 && coordinates[1] === 0 && coordinates[2] === 0) {
      console.warn('No se puede descargar la cuadrícula central');
      return;
    }

    set((state) => {
      const newGrids = new Map(state.grids);
      newGrids.delete(gridKey);
      return { grids: newGrids };
    });

    console.log(`📐 Descargando cuadrícula: ${gridKey}`);
  },

  moveToGrid: (coordinates: [number, number, number]) => {
    const state = get();
    const gridKey = state.getGridKey(coordinates);
    
    // Cargar la cuadrícula si no está cargada
    if (!state.grids.has(gridKey)) {
      state.loadGrid(coordinates);
    }

    const grid = state.grids.get(gridKey);
    if (!grid) return;

    set(() => ({
      currentGridCoordinates: coordinates,
    }));

    console.log(`🚀 Moviéndose a cuadrícula: ${gridKey}`);
  },

  getAdjacentGrids: () => {
    const state = get();
    const [x, y, z] = state.currentGridCoordinates;
    const distance = state.renderDistance;
    
    const adjacent: Array<[number, number, number]> = [];
    
    for (let dx = -distance; dx <= distance; dx++) {
      for (let dy = -distance; dy <= distance; dy++) {
        for (let dz = -distance; dz <= distance; dz++) {
          if (dx === 0 && dy === 0 && dz === 0) continue; // Saltar la cuadrícula actual
          adjacent.push([x + dx, y + dy, z + dz]);
        }
      }
    }
    
    return adjacent;
  },

  createGrid: (position: [number, number, number], size: number = 20) => {
    const state = get();
    const gridId = uuidv4();
    
    // Calcular las coordenadas de la cuadrícula basadas en la posición 3D
    const coordinates: [number, number, number] = [
      Math.round(position[0] / size),
      Math.round(position[1] / size),
      Math.round(position[2] / size)
    ];
    
    const newGrid: Grid = {
      id: gridId,
      coordinates,
      position,
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      objects: [],
      mobileObjects: [],
      effectZones: [],
      gridSize: size,
      gridColor: '#404040',
      isLoaded: true,
      isSelected: false
    };

    set((state) => ({
      grids: new Map(state.grids.set(gridId, newGrid)),
    }));

    console.log(`📐 Creando nueva cuadrícula: ${gridId} en coordenadas ${coordinates}, posición 3D ${position}`);
  },

  selectGrid: (gridId: string | null) => {
    set((state) => {
      const newGrids = new Map(state.grids);
      
      // Deseleccionar todas las cuadrículas
      newGrids.forEach((grid) => {
        grid.isSelected = false;
      });
      
      // Seleccionar la cuadrícula especificada
      if (gridId && newGrids.has(gridId)) {
        const grid = newGrids.get(gridId)!;
        grid.isSelected = true;
        newGrids.set(gridId, grid);
      }
      
      return { grids: newGrids };
    });
  },

  setActiveGrid: (gridId: string | null) => {
    const state = get();
    
    if (gridId && state.grids.has(gridId)) {
      set(() => ({
        activeGridId: gridId,
      }));
      
      console.log(`🎯 Cuadrícula activa cambiada a: ${gridId}`);
    } else {
      set(() => ({
        activeGridId: null,
      }));
      
      console.log(`🎯 Cuadrícula activa desactivada`);
    }
  },

  updateGrid: (gridId: string, updates: Partial<Omit<Grid, 'id'>>) => {
    set((state) => {
      const newGrids = new Map(state.grids);
      const grid = newGrids.get(gridId);
      
      if (grid) {
        const updatedGrid = { ...grid, ...updates };
        newGrids.set(gridId, updatedGrid);
      }
      
      return { grids: newGrids };
    });
  },

  deleteGrid: (gridId: string) => {
    const state = get();
    
    // No permitir eliminar la cuadrícula principal
    if (gridId === '0,0,0') {
      console.warn('No se puede eliminar la cuadrícula principal');
      return;
    }

    set((state) => {
      const newGrids = new Map(state.grids);
      newGrids.delete(gridId);
      return { grids: newGrids };
    });

    console.log(`🗑️ Eliminando cuadrícula: ${gridId}`);
  },

  resizeGrid: (gridId: string, newSize: number) => {
    const state = get();
    const grid = state.grids.get(gridId);
    
    if (grid) {
      state.updateGrid(gridId, { gridSize: newSize });
      console.log(`📏 Redimensionando cuadrícula ${gridId} a tamaño ${newSize}`);
    }
  },

  moveGrid: (gridId: string, position: [number, number, number]) => {
    const state = get();
    const grid = state.grids.get(gridId);
    
    if (grid) {
      state.updateGrid(gridId, { position });
      console.log(`🚀 Moviendo cuadrícula ${gridId} a posición ${position}`);
    }
  },

  rotateGrid: (gridId: string, rotation: [number, number, number]) => {
    const state = get();
    const grid = state.grids.get(gridId);
    
    if (grid) {
      state.updateGrid(gridId, { rotation });
      console.log(`🔄 Rotando cuadrícula ${gridId} a rotación ${rotation}`);
    }
  },

  scaleGrid: (gridId: string, scale: [number, number, number]) => {
    const state = get();
    const grid = state.grids.get(gridId);
    
    if (grid) {
      state.updateGrid(gridId, { scale });
      console.log(`📐 Escalando cuadrícula ${gridId} a escala ${scale}`);
    }
  },
}));
