import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

// Tipos para cuadrículas
export interface Grid {
  id: string;
  coordinates: [number, number, number]; // X, Y, Z de la cuadrícula
  position: [number, number, number]; // Posición 3D en el mundo
  rotation: [number, number, number]; // Rotación 3D
  scale: [number, number, number]; // Escala 3D
  objects: any[]; // Será tipado cuando refactoricemos los objetos
  mobileObjects: any[]; // Será tipado cuando refactoricemos los objetos móviles
  effectZones: any[]; // Será tipado cuando refactoricemos los efectos
  gridSize: number;
  gridColor: string;
  isLoaded: boolean; // Si la cuadrícula está cargada en memoria
  isSelected: boolean; // Si la cuadrícula está seleccionada
  [key: string]: unknown; // Firma de índice para acceso dinámico
}

// Estado específico para cuadrículas
export interface GridState {
  grids: Map<string, Grid>;
  currentGridCoordinates: [number, number, number];
  activeGridId: string | null;
  gridSize: number;
  renderDistance: number;
}

// Acciones específicas para cuadrículas
export interface GridActions {
  // Acciones para cuadrículas
  moveToGrid: (coordinates: [number, number, number]) => void;
  loadGrid: (coordinates: [number, number, number]) => void;
  unloadGrid: (coordinates: [number, number, number]) => void;
  getGridKey: (coordinates: [number, number, number]) => string;
  getAdjacentGrids: () => Array<[number, number, number]>;
  
  // Acciones para manipulación de cuadrículas
  createGrid: (position: [number, number, number], size?: number) => void;
  selectGrid: (gridId: string | null) => void;
  updateGrid: (gridId: string, updates: Partial<Omit<Grid, 'id'>>) => void;
  deleteGrid: (gridId: string) => void;
  resizeGrid: (gridId: string, newSize: number) => void;
  moveGrid: (gridId: string, position: [number, number, number]) => void;
  rotateGrid: (gridId: string, rotation: [number, number, number]) => void;
  scaleGrid: (gridId: string, scale: [number, number, number]) => void;
  
  // Acciones para proyecto actual
  setActiveGrid: (gridId: string | null) => void;
}

/**
 * Store especializado para gestión de cuadrículas
 * Implementa Single Responsibility Principle
 */
export const useGridStore = create<GridState & GridActions>((set, get) => ({
  // Estado inicial
  grids: new Map(),
  currentGridCoordinates: [0, 0, 0],
  activeGridId: null,
  gridSize: 20,
  renderDistance: 2,

  // Acciones para cuadrículas
  moveToGrid: (coordinates: [number, number, number]) => {
    console.log(`🗺️ GridStore: Moviendo a cuadrícula [${coordinates.join(', ')}]`);
    
    set((state) => ({
      currentGridCoordinates: coordinates,
      activeGridId: state.getGridKey(coordinates)
    }));

    // Cargar cuadrículas adyacentes
    const { loadGrid, getAdjacentGrids } = get();
    const adjacentGrids = getAdjacentGrids();
    
    // Cargar cuadrícula actual y adyacentes
    loadGrid(coordinates);
    adjacentGrids.forEach(gridCoords => {
      loadGrid(gridCoords);
    });
  },

  loadGrid: (coordinates: [number, number, number]) => {
    const { getGridKey } = get();
    const gridKey = getGridKey(coordinates);
    
    set((state) => {
      // Si la cuadrícula ya existe, solo marcarla como cargada
      if (state.grids.has(gridKey)) {
        const existingGrid = state.grids.get(gridKey)!;
        return {
          grids: new Map(state.grids.set(gridKey, {
            ...existingGrid,
            isLoaded: true
          }))
        };
      }

      // Crear nueva cuadrícula
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
        gridColor: '#ffffff',
        isLoaded: true,
        isSelected: false
      };

      return {
        grids: new Map(state.grids.set(gridKey, newGrid))
      };
    });

    console.log(`🗺️ GridStore: Cuadrícula [${coordinates.join(', ')}] cargada`);
  },

  unloadGrid: (coordinates: [number, number, number]) => {
    const { getGridKey } = get();
    const gridKey = getGridKey(coordinates);
    
    set((state) => {
      if (state.grids.has(gridKey)) {
        const existingGrid = state.grids.get(gridKey)!;
        return {
          grids: new Map(state.grids.set(gridKey, {
            ...existingGrid,
            isLoaded: false
          }))
        };
      }
      return state;
    });

    console.log(`🗺️ GridStore: Cuadrícula [${coordinates.join(', ')}] descargada`);
  },

  getGridKey: (coordinates: [number, number, number]) => {
    return `${coordinates[0]},${coordinates[1]},${coordinates[2]}`;
  },

  getAdjacentGrids: () => {
    const { currentGridCoordinates, renderDistance } = get();
    const [x, y, z] = currentGridCoordinates;
    const adjacent: Array<[number, number, number]> = [];

    // Generar coordenadas adyacentes
    for (let dx = -renderDistance; dx <= renderDistance; dx++) {
      for (let dy = -renderDistance; dy <= renderDistance; dy++) {
        for (let dz = -renderDistance; dz <= renderDistance; dz++) {
          if (dx === 0 && dy === 0 && dz === 0) continue; // Excluir la cuadrícula actual
          adjacent.push([x + dx, y + dy, z + dz]);
        }
      }
    }

    return adjacent;
  },

  // Acciones para manipulación de cuadrículas
  createGrid: (position: [number, number, number], size: number = 10) => {
    const gridId = uuidv4();
    const coordinates: [number, number, number] = [
      Math.floor(position[0] / size),
      Math.floor(position[1] / size),
      Math.floor(position[2] / size)
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
      gridColor: '#ffffff',
      isLoaded: true,
      isSelected: false
    };

    set((state) => ({
      grids: new Map(state.grids.set(gridId, newGrid))
    }));

    console.log(`🗺️ GridStore: Nueva cuadrícula creada en [${coordinates.join(', ')}]`);
  },

  selectGrid: (gridId: string | null) => {
    set((state) => {
      const newGrids = new Map(state.grids);
      
      // Deseleccionar todas las cuadrículas
      newGrids.forEach((grid, id) => {
        newGrids.set(id, { ...grid, isSelected: false });
      });

      // Seleccionar la cuadrícula especificada
      if (gridId && newGrids.has(gridId)) {
        const selectedGrid = newGrids.get(gridId)!;
        newGrids.set(gridId, { ...selectedGrid, isSelected: true });
      }

      return { grids: newGrids };
    });

    console.log(`🗺️ GridStore: Cuadrícula ${gridId || 'null'} seleccionada`);
  },

  updateGrid: (gridId: string, updates: Partial<Omit<Grid, 'id'>>) => {
    set((state) => {
      if (!state.grids.has(gridId)) {
        console.warn(`⚠️ GridStore: Cuadrícula ${gridId} no encontrada`);
        return state;
      }

      const existingGrid = state.grids.get(gridId)!;
      const updatedGrid = { ...existingGrid, ...updates };
      
      return {
        grids: new Map(state.grids.set(gridId, updatedGrid))
      };
    });

    console.log(`🗺️ GridStore: Cuadrícula ${gridId} actualizada`);
  },

  deleteGrid: (gridId: string) => {
    set((state) => {
      const newGrids = new Map(state.grids);
      newGrids.delete(gridId);
      
      return {
        grids: newGrids,
        activeGridId: state.activeGridId === gridId ? null : state.activeGridId
      };
    });

    console.log(`🗺️ GridStore: Cuadrícula ${gridId} eliminada`);
  },

  resizeGrid: (gridId: string, newSize: number) => {
    set((state) => {
      if (!state.grids.has(gridId)) {
        console.warn(`⚠️ GridStore: Cuadrícula ${gridId} no encontrada`);
        return state;
      }

      const existingGrid = state.grids.get(gridId)!;
      const updatedGrid = { ...existingGrid, gridSize: newSize };
      
      return {
        grids: new Map(state.grids.set(gridId, updatedGrid))
      };
    });

    console.log(`🗺️ GridStore: Cuadrícula ${gridId} redimensionada a ${newSize}`);
  },

  moveGrid: (gridId: string, position: [number, number, number]) => {
    set((state) => {
      if (!state.grids.has(gridId)) {
        console.warn(`⚠️ GridStore: Cuadrícula ${gridId} no encontrada`);
        return state;
      }

      const existingGrid = state.grids.get(gridId)!;
      const updatedGrid = { ...existingGrid, position };
      
      return {
        grids: new Map(state.grids.set(gridId, updatedGrid))
      };
    });

    console.log(`🗺️ GridStore: Cuadrícula ${gridId} movida a [${position.join(', ')}]`);
  },

  rotateGrid: (gridId: string, rotation: [number, number, number]) => {
    set((state) => {
      if (!state.grids.has(gridId)) {
        console.warn(`⚠️ GridStore: Cuadrícula ${gridId} no encontrada`);
        return state;
      }

      const existingGrid = state.grids.get(gridId)!;
      const updatedGrid = { ...existingGrid, rotation };
      
      return {
        grids: new Map(state.grids.set(gridId, updatedGrid))
      };
    });

    console.log(`🗺️ GridStore: Cuadrícula ${gridId} rotada a [${rotation.join(', ')}]`);
  },

  scaleGrid: (gridId: string, scale: [number, number, number]) => {
    set((state) => {
      if (!state.grids.has(gridId)) {
        console.warn(`⚠️ GridStore: Cuadrícula ${gridId} no encontrada`);
        return state;
      }

      const existingGrid = state.grids.get(gridId)!;
      const updatedGrid = { ...existingGrid, scale };
      
      return {
        grids: new Map(state.grids.set(gridId, updatedGrid))
      };
    });

    console.log(`🗺️ GridStore: Cuadrícula ${gridId} escalada a [${scale.join(', ')}]`);
  },

  // Acciones para proyecto actual
  setActiveGrid: (gridId: string | null) => {
    set({ activeGridId: gridId });
    console.log(`🗺️ GridStore: Cuadrícula activa establecida: ${gridId || 'null'}`);
  }
}));