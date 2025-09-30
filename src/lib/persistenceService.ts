import { firebaseService, type FirebaseProject, type FirebaseGrid } from './firebaseService';
import { type SoundObject, type MobileObject, type EffectZone } from '../state/useWorldStore';
import { useGridStore, type Grid } from '../stores/useGridStore';
import { Timestamp } from 'firebase/firestore';

// Convertir Grid del store a FirebaseGrid
export function gridToFirebase(grid: Grid): Omit<FirebaseGrid, 'createdAt' | 'updatedAt'> {
  return {
    id: grid.id, // Incluir el ID de la cuadrícula
    coordinates: grid.coordinates,
    position: grid.position,
    objects: grid.objects,
    mobileObjects: grid.mobileObjects,
    effectZones: grid.effectZones
  };
}

// Convertir FirebaseGrid a Grid del store
export function firebaseToGrid(firebaseGrid: FirebaseGrid): Grid {
  // Asegurar que los objetos tengan todos los campos requeridos
  const normalizedObjects = (firebaseGrid.objects || []).map((obj: SoundObject) => ({
    id: obj.id || `obj-${Math.random().toString(36).substr(2, 9)}`,
    type: obj.type || 'cube',
    position: obj.position || [0, 0, 0],
    rotation: obj.rotation || [0, 0, 0],
    scale: obj.scale || [1, 1, 1],
    audioParams: obj.audioParams || {},
    isSelected: obj.isSelected || false,
    audioEnabled: obj.audioEnabled || false,
  }));

  const normalizedMobileObjects = (firebaseGrid.mobileObjects || []).map((obj: MobileObject) => ({
    id: obj.id || `mobile-${Math.random().toString(36).substr(2, 9)}`,
    type: obj.type || 'mobile',
    position: obj.position || [0, 0, 0],
    rotation: obj.rotation || [0, 0, 0],
    scale: obj.scale || [1, 1, 1],
    isSelected: obj.isSelected || false,
    mobileParams: {
      ...obj.mobileParams,
      radius: obj.mobileParams?.radius || 5,
      speed: obj.mobileParams?.speed || 1,
      centerPosition: obj.mobileParams?.centerPosition || [0, 0, 0],
      movementType: obj.mobileParams?.movementType || 'linear'
    }
  }));

  const normalizedEffectZones = (firebaseGrid.effectZones || []).map((zone: EffectZone) => ({
    ...zone,
    id: zone.id || `zone-${Math.random().toString(36).substr(2, 9)}`,
    type: zone.type || 'phaser',
    position: zone.position || [0, 0, 0],
    rotation: zone.rotation || [0, 0, 0],
    scale: zone.scale || [1, 1, 1],
    isSelected: zone.isSelected || false,
    isLocked: zone.isLocked || false,
    effectParams: zone.effectParams || {}
  }));

  return {
    id: firebaseGrid.id || `grid-${Math.random().toString(36).substr(2, 9)}`, // Asegurar que siempre haya un ID
    coordinates: firebaseGrid.coordinates || [0, 0, 0],
    position: firebaseGrid.position || [0, 0, 0],
    rotation: [0, 0, 0], // Valores por defecto
    scale: [1, 1, 1], // Valores por defecto
    objects: normalizedObjects,
    mobileObjects: normalizedMobileObjects,
    effectZones: normalizedEffectZones,
    gridSize: 20, // Valor por defecto
    gridColor: '#404040', // Valor por defecto
    isLoaded: true,
    isSelected: false
  };
}

// Servicio de persistencia que integra Firebase con el store de Zustand
export class PersistenceService {
  private static instance: PersistenceService;

  static getInstance(): PersistenceService {
    if (!PersistenceService.instance) {
      PersistenceService.instance = new PersistenceService();
    }
    return PersistenceService.instance;
  }

  // Guardar el estado actual del mundo como un proyecto
  async saveCurrentWorldAsProject(projectName: string, description?: string): Promise<string> {
    try {
      const gridState = useGridStore.getState();
      
      // Convertir todas las cuadrículas a formato Firebase
      const firebaseGrids: Omit<FirebaseGrid, 'createdAt' | 'updatedAt'>[] = [];
      
      for (const [, grid] of gridState.grids) {
        firebaseGrids.push(gridToFirebase(grid));
      }

      // Crear el proyecto
      const projectData: Omit<FirebaseProject, 'id' | 'createdAt' | 'updatedAt'> = {
        name: projectName,
        description: description || '',
        grids: firebaseGrids.map(grid => ({
          ...grid,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        })),
        activeGridId: gridState.activeGridId
      };

      const projectId = await firebaseService.saveProject(projectData);
      
      return projectId;
    } catch (error) {
      throw error;
    }
  }

  // Cargar un proyecto desde Firebase
  async loadProject(projectId: string): Promise<void> {
    try {
      const project = await firebaseService.loadProject(projectId);
      
      if (!project) {
        throw new Error('Proyecto no encontrado');
      }


      // Convertir las cuadrículas de Firebase al formato del store
      const grids = new Map<string, Grid>();
      
      for (const firebaseGrid of project.grids) {
        const grid = firebaseToGrid(firebaseGrid);
        grids.set(grid.id, grid);
      }


      // Actualizar el store con los datos cargados
      useGridStore.setState({
        grids,
        activeGridId: project.activeGridId,
        currentGridCoordinates: project.activeGridId ? 
          grids.get(project.activeGridId)?.coordinates || [0, 0, 0] : 
          [0, 0, 0]
      });

    } catch (error) {
      throw error;
    }
  }

  // Cargar todos los proyectos disponibles
  async loadAllProjects(): Promise<FirebaseProject[]> {
    try {
      const projects = await firebaseService.loadAllProjects();
      return projects;
    } catch (error) {
      throw error;
    }
  }

  // Guardar una cuadrícula individual
  async saveGrid(gridId: string): Promise<string> {
    try {
      const gridState = useGridStore.getState();
      const grid = gridState.grids.get(gridId);
      
      if (!grid) {
        throw new Error('Cuadrícula no encontrada');
      }

      const firebaseGrid = gridToFirebase(grid);
      const savedGridId = await firebaseService.saveGrid(firebaseGrid);
      
      return savedGridId;
    } catch (error) {
      throw error;
    }
  }

  // Cargar una cuadrícula individual
  async loadGrid(gridId: string): Promise<void> {
    try {
      const firebaseGrid = await firebaseService.loadGrid(gridId);
      
      if (!firebaseGrid) {
        throw new Error('Cuadrícula no encontrada');
      }

      const grid = firebaseToGrid(firebaseGrid);
      
      // Actualizar el store con la cuadrícula cargada
      useGridStore.setState((state) => ({
        grids: new Map(state.grids.set(gridId, grid))
      }));

    } catch (error) {
      throw error;
    }
  }

  // Actualizar un proyecto existente
  async updateProject(projectId: string, projectName?: string, description?: string): Promise<void> {
    try {
      const gridState = useGridStore.getState();
      
      // Convertir todas las cuadrículas a formato Firebase
      const firebaseGrids: Omit<FirebaseGrid, 'createdAt' | 'updatedAt'>[] = [];
      
      for (const [, grid] of gridState.grids) {
        firebaseGrids.push(gridToFirebase(grid));
      }

      const updateData: Partial<FirebaseProject> = {
        grids: firebaseGrids.map(grid => ({
          ...grid,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        })),
        activeGridId: gridState.activeGridId
      };

      if (projectName) updateData.name = projectName;
      if (description !== undefined) updateData.description = description;

      await firebaseService.updateProject(projectId, updateData);
      
    } catch (error) {
      throw error;
    }
  }

  // Eliminar un proyecto
  async deleteProject(projectId: string): Promise<void> {
    try {
      await firebaseService.deleteProject(projectId);
    } catch (error) {
      throw error;
    }
  }

  // Sincronizar automáticamente los cambios con Firebase
  startAutoSync(projectId: string): () => void {
    console.log('🌍 PersistenceService: Iniciando sincronización automática - Modo global forzado');
    
    // Asegurar que siempre estemos en modo global
    useGridStore.setState({ activeGridId: 'global-world' });
    
    // Cargar inmediatamente los objetos del mundo global
    this.loadGlobalWorldOnStartup();
    
    const unsubscribeProject = firebaseService.subscribeToProject(projectId, (project) => {
      if (project) {
        
        // Convertir las cuadrículas de Firebase al formato del store
        const grids = new Map<string, Grid>();
        
        for (const firebaseGrid of project.grids) {
          const grid = firebaseToGrid(firebaseGrid);
          grids.set(grid.id, grid);
        }

        // Actualizar el store con los datos sincronizados
        // Usar setState con una función para evitar bucles
        useGridStore.setState((currentState) => {
          // Solo actualizar si realmente hay cambios
          const currentGrids = currentState.grids;
          let hasChanges = false;
          
          // Verificar si hay cambios en las cuadrículas
          if (currentGrids.size !== grids.size) {
            hasChanges = true;
          } else {
            for (const [id, grid] of grids) {
              const currentGrid = currentGrids.get(id);
              if (!currentGrid || JSON.stringify(currentGrid) !== JSON.stringify(grid)) {
                hasChanges = true;
                break;
              }
            }
          }
          
          if (!hasChanges) {
            return currentState;
          }
          
          
          // Marcar que estamos actualizando desde Firebase para evitar bucles
          // setTimeout(() => {
          //   // Resetear la bandera después de un tiempo
          // }, 1000);
          
          return {
            ...currentState,
            grids,
            activeGridId: 'global-world', // Siempre forzar modo global
            currentGridCoordinates: project.activeGridId ? 
              grids.get(project.activeGridId)?.coordinates || [0, 0, 0] : 
              [0, 0, 0]
          };
        });
      }
    });

    // También sincronizar el mundo global
    const unsubscribeGlobalWorld = firebaseService.subscribeToGlobalWorld((globalWorld) => {
      if (globalWorld) {
        console.log('🌍 PersistenceService: Sincronizando mundo global desde Firebase', globalWorld);
        
        // Crear la cuadrícula global con los datos del mundo global
        const globalGrid: Grid = {
          id: 'global-world',
          coordinates: globalWorld.currentGridCoordinates,
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          objects: globalWorld.objects || [],
          mobileObjects: globalWorld.mobileObjects || [],
          effectZones: globalWorld.effectZones || [],
          gridSize: 50,
          gridColor: '#00ff00',
          isLoaded: true,
          isSelected: false
        };

        // Actualizar el store con los datos del mundo global
        useGridStore.setState((currentState) => {
          const currentGrids = new Map(currentState.grids);
          const currentGlobalGrid = currentGrids.get('global-world');
          
          // Solo actualizar si hay cambios
          if (!currentGlobalGrid || JSON.stringify(currentGlobalGrid) !== JSON.stringify(globalGrid)) {
            currentGrids.set('global-world', globalGrid);
            
            return {
              ...currentState,
              grids: currentGrids,
              activeGridId: 'global-world', // Siempre forzar modo global
              currentGridCoordinates: globalWorld.currentGridCoordinates || currentState.currentGridCoordinates
            };
          }
          
          return currentState;
        });
      }
    });

    // Retornar función para desuscribirse de ambos
    return () => {
      unsubscribeProject();
      unsubscribeGlobalWorld();
    };
  }

  // Cargar el mundo global al iniciar la aplicación
  private async loadGlobalWorldOnStartup(): Promise<void> {
    try {
      console.log('🌍 PersistenceService: Cargando mundo global al iniciar aplicación');
      
      // Obtener el estado del mundo global desde Firebase
      const globalWorldDoc = await firebaseService.getGlobalWorldState();
      
      if (globalWorldDoc) {
        console.log('🌍 PersistenceService: Datos del mundo global obtenidos', { 
          objectsCount: globalWorldDoc.objects?.length || 0,
          mobileObjectsCount: globalWorldDoc.mobileObjects?.length || 0,
          effectZonesCount: globalWorldDoc.effectZones?.length || 0
        });
        
        // Crear la cuadrícula global con los datos de Firebase
        const globalGrid: Grid = {
          id: 'global-world',
          coordinates: globalWorldDoc.currentGridCoordinates || [0, 0, 0],
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          objects: globalWorldDoc.objects || [],
          mobileObjects: globalWorldDoc.mobileObjects || [],
          effectZones: globalWorldDoc.effectZones || [],
          gridSize: 50,
          gridColor: '#00ff00',
          isLoaded: true,
          isSelected: false
        };
        
        console.log('🌍 PersistenceService: Cuadrícula global creada con', globalGrid.objects.length, 'objetos');
        
        // Actualizar el store con los datos del mundo global
        useGridStore.setState((currentState) => {
          const currentGrids = new Map(currentState.grids);
          currentGrids.set('global-world', globalGrid);
          
          return {
            ...currentState,
            grids: currentGrids,
            activeGridId: 'global-world',
            currentGridCoordinates: globalWorldDoc.currentGridCoordinates || currentState.currentGridCoordinates
          };
        });
        
        console.log('🌍 PersistenceService: Mundo global cargado exitosamente al iniciar');
      } else {
        console.log('🌍 PersistenceService: No hay datos del mundo global en Firebase, creando cuadrícula vacía');
        
        // Crear cuadrícula global vacía si no hay datos en Firebase
        const globalGrid: Grid = {
          id: 'global-world',
          coordinates: [0, 0, 0],
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          objects: [],
          mobileObjects: [],
          effectZones: [],
          gridSize: 50,
          gridColor: '#00ff00',
          isLoaded: true,
          isSelected: false
        };
        
        useGridStore.setState((currentState) => {
          const currentGrids = new Map(currentState.grids);
          currentGrids.set('global-world', globalGrid);
          
          return {
            ...currentState,
            grids: currentGrids,
            activeGridId: 'global-world',
            currentGridCoordinates: [0, 0, 0]
          };
        });
      }
    } catch (error) {
      console.error('🌍 PersistenceService: Error al cargar mundo global al iniciar:', error);
      
      // En caso de error, crear cuadrícula global vacía
      const globalGrid: Grid = {
        id: 'global-world',
        coordinates: [0, 0, 0],
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        objects: [],
        mobileObjects: [],
        effectZones: [],
        gridSize: 50,
        gridColor: '#00ff00',
        isLoaded: true,
        isSelected: false
      };
      
      useGridStore.setState((currentState) => {
        const currentGrids = new Map(currentState.grids);
        currentGrids.set('global-world', globalGrid);
        
        return {
          ...currentState,
          grids: currentGrids,
          activeGridId: 'global-world',
          currentGridCoordinates: [0, 0, 0]
        };
      });
    }
  }

  // Detener la sincronización automática
  stopAutoSync(unsubscribe: () => void): void {
    unsubscribe();
  }
}

// Instancia singleton
export const persistenceService = PersistenceService.getInstance();
