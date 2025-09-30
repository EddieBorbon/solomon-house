import { create } from 'zustand';

// Tipos para las cuadrículas
export interface Grid {
  id: string;
  coordinates: [number, number, number]; // X, Y, Z de la cuadrícula
  position: [number, number, number]; // Posición 3D en el mundo
  rotation: [number, number, number]; // Rotación 3D
  scale: [number, number, number]; // Escala 3D
  objects: any[]; // Será tipado cuando refactoricemos useObjectStore
  mobileObjects: any[]; // Será tipado cuando refactoricemos useMobileObjectStore
  effectZones: any[]; // Será tipado cuando refactoricemos useEffectStore
  gridSize: number;
  gridColor: string;
  isLoaded: boolean; // Si la cuadrícula está cargada en memoria
  isSelected: boolean; // Si la cuadrícula está seleccionada
  [key: string]: unknown; // Firma de índice para acceso dinámico
}

// Estado específico para gestión de cuadrículas
export interface GridState {
  // Sistema de cuadrículas contiguas
  grids: Map<string, Grid>; // Mapa de cuadrículas por coordenadas
  currentGridCoordinates: [number, number, number]; // Cuadrícula actual
  activeGridId: string | null; // ID de la cuadrícula activa para crear objetos
  gridSize: number; // Tamaño de cada cuadrícula
  renderDistance: number; // Distancia de renderizado (cuántas cuadrículas cargar)
}

// Acciones específicas para gestión de cuadrículas
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
  setActiveGrid: (gridId: string | null) => void;
  updateGrid: (gridId: string, updates: Partial<Omit<Grid, 'id'>>) => void;
  deleteGrid: (gridId: string) => void;
  resizeGrid: (gridId: string, newSize: number) => void;
  moveGrid: (gridId: string, position: [number, number, number]) => void;
  rotateGrid: (gridId: string, rotation: [number, number, number]) => void;
  scaleGrid: (gridId: string, scale: [number, number, number]) => void;
}

// Función helper para generar ID único de cuadrícula
const generateGridId = (coordinates: [number, number, number]): string => {
  return `grid_${coordinates[0]}_${coordinates[1]}_${coordinates[2]}`;
};

// Función helper para generar clave de cuadrícula
const getGridKey = (coordinates: [number, number, number]): string => {
  return `${coordinates[0]},${coordinates[1]},${coordinates[2]}`;
};

// Creación del store de Zustand para gestión de cuadrículas
export const useGridStore = create<GridState & GridActions>((set, get) => ({
  // Estado inicial
  grids: new Map(),
  currentGridCoordinates: [0, 0, 0],
  activeGridId: null,
  gridSize: 20,
  renderDistance: 2,

  // Acciones para cuadrículas
  getGridKey: (coordinates: [number, number, number]) => {
    return getGridKey(coordinates);
  },

  loadGrid: (coordinates: [number, number, number]) => {
    const state = get();
    const key = getGridKey(coordinates);
    const id = generateGridId(coordinates);
    
    // Si la cuadrícula ya existe, marcarla como cargada
    if (state.grids.has(id)) {
      const existingGrid = state.grids.get(id)!;
      set((state) => ({
        grids: new Map(state.grids.set(id, { ...existingGrid, isLoaded: true }))
      }));
      return;
    }

    // Crear nueva cuadrícula
    const position: [number, number, number] = [
      coordinates[0] * state.gridSize,
      coordinates[1] * state.gridSize,
      coordinates[2] * state.gridSize
    ];

    const newGrid: Grid = {
      id,
      coordinates,
      position,
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
      grids: new Map(state.grids.set(id, newGrid))
    }));
  },

  unloadGrid: (coordinates: [number, number, number]) => {
    const id = generateGridId(coordinates);
    set((state) => {
      const newGrids = new Map(state.grids);
      const grid = newGrids.get(id);
      if (grid) {
        newGrids.set(id, { ...grid, isLoaded: false });
      }
      return { grids: newGrids };
    });
  },

  moveToGrid: (coordinates: [number, number, number]) => {
    const state = get();
    
    // Cargar cuadrícula actual
    state.loadGrid(coordinates);
    
    // Cargar cuadrículas adyacentes
    const adjacentGrids = state.getAdjacentGrids();
    adjacentGrids.forEach(adjCoords => {
      state.loadGrid(adjCoords);
    });

    // Descargar cuadrículas lejanas
    state.grids.forEach((grid, gridId) => {
      const distance = Math.sqrt(
        Math.pow(grid.coordinates[0] - coordinates[0], 2) +
        Math.pow(grid.coordinates[1] - coordinates[1], 2) +
        Math.pow(grid.coordinates[2] - coordinates[2], 2)
      );
      
      if (distance > state.renderDistance) {
        state.unloadGrid(grid.coordinates);
      }
    });

    set({
      currentGridCoordinates: coordinates,
      activeGridId: generateGridId(coordinates)
    });
  },

  getAdjacentGrids: () => {
    const state = get();
    const [x, y, z] = state.currentGridCoordinates;
    const adjacent: Array<[number, number, number]> = [];
    
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dz = -1; dz <= 1; dz++) {
          if (dx === 0 && dy === 0 && dz === 0) continue;
          adjacent.push([x + dx, y + dy, z + dz]);
        }
      }
    }
    
    return adjacent;
  },

  // Acciones para manipulación de cuadrículas
  createGrid: (position: [number, number, number], size: number = 20) => {
    const state = get();
    
    // Calcular coordenadas basadas en la posición
    const coordinates: [number, number, number] = [
      Math.round(position[0] / size),
      Math.round(position[1] / size),
      Math.round(position[2] / size)
    ];
    
    const id = generateGridId(coordinates);
    
    // Verificar si ya existe
    if (state.grids.has(id)) {
      console.warn(`Grid already exists at coordinates ${coordinates}`);
      return;
    }

    const newGrid: Grid = {
      id,
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
      grids: new Map(state.grids.set(id, newGrid)),
      activeGridId: id
    }));
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
      
      return {
        grids: newGrids,
        activeGridId: gridId
      };
    });
  },

  setActiveGrid: (gridId: string | null) => {
    set({ activeGridId: gridId });
  },

  updateGrid: (gridId: string, updates: Partial<Omit<Grid, 'id'>>) => {
    set((state) => {
      const newGrids = new Map(state.grids);
      const grid = newGrids.get(gridId);
      
      if (grid) {
        newGrids.set(gridId, { ...grid, ...updates });
      }
      
      return { grids: newGrids };
    });
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
  },

  resizeGrid: (gridId: string, newSize: number) => {
    set((state) => {
      const newGrids = new Map(state.grids);
      const grid = newGrids.get(gridId);
      
      if (grid) {
        // Recalcular posición basada en el nuevo tamaño
        const newPosition: [number, number, number] = [
          grid.coordinates[0] * newSize,
          grid.coordinates[1] * newSize,
          grid.coordinates[2] * newSize
        ];
        
        newGrids.set(gridId, {
          ...grid,
          gridSize: newSize,
          position: newPosition
        });
      }
      
      return { grids: newGrids };
    });
  },

  moveGrid: (gridId: string, position: [number, number, number]) => {
    set((state) => {
      const newGrids = new Map(state.grids);
      const grid = newGrids.get(gridId);
      
      if (grid) {
        // Recalcular coordenadas basadas en la nueva posición
        const newCoordinates: [number, number, number] = [
          Math.round(position[0] / grid.gridSize),
          Math.round(position[1] / grid.gridSize),
          Math.round(position[2] / grid.gridSize)
        ];
        
        newGrids.set(gridId, {
          ...grid,
          position,
          coordinates: newCoordinates
        });
      }
      
      return { grids: newGrids };
    });
  },

  rotateGrid: (gridId: string, rotation: [number, number, number]) => {
    set((state) => {
      const newGrids = new Map(state.grids);
      const grid = newGrids.get(gridId);
      
      if (grid) {
        newGrids.set(gridId, { ...grid, rotation });
      }
      
      return { grids: newGrids };
    });
  },

  scaleGrid: (gridId: string, scale: [number, number, number]) => {
    set((state) => {
      const newGrids = new Map(state.grids);
      const grid = newGrids.get(gridId);
      
      if (grid) {
        newGrids.set(gridId, { ...grid, scale });
      }
      
      return { grids: newGrids };
    });
  }
}));