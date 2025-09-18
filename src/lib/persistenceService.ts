import { firebaseService, type FirebaseProject, type FirebaseGrid } from './firebaseService';
import { useWorldStore, type Grid, type SoundObject, type MobileObject, type EffectZone } from '../state/useWorldStore';

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
      const state = useWorldStore.getState();
      
      // Convertir todas las cuadrículas a formato Firebase
      const firebaseGrids: Omit<FirebaseGrid, 'createdAt' | 'updatedAt'>[] = [];
      
      for (const [, grid] of state.grids) {
        firebaseGrids.push(gridToFirebase(grid));
      }

      // Crear el proyecto
      const projectData: Omit<FirebaseProject, 'id' | 'createdAt' | 'updatedAt'> = {
        name: projectName,
        description: description || '',
        grids: firebaseGrids.map(grid => ({
          ...grid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })),
        activeGridId: state.activeGridId
      };

      const projectId = await firebaseService.saveProject(projectData);
      
      console.log('✅ Mundo guardado como proyecto:', projectName, 'ID:', projectId);
      return projectId;
    } catch (error) {
      console.error('❌ Error al guardar mundo como proyecto:', error);
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

      console.log('🔍 Proyecto cargado desde Firebase:', project);
      console.log('🔍 Cuadrículas en el proyecto:', project.grids.length);

      // Convertir las cuadrículas de Firebase al formato del store
      const grids = new Map<string, Grid>();
      
      for (const firebaseGrid of project.grids) {
        console.log('🔍 Procesando cuadrícula Firebase:', firebaseGrid);
        const grid = firebaseToGrid(firebaseGrid);
        console.log('🔍 Cuadrícula convertida:', grid);
        console.log('🔍 Objetos en la cuadrícula:', grid.objects.length);
        console.log('🔍 Objetos móviles en la cuadrícula:', grid.mobileObjects.length);
        console.log('🔍 Zonas de efectos en la cuadrícula:', grid.effectZones.length);
        grids.set(grid.id, grid);
      }

      console.log('🔍 Total de cuadrículas procesadas:', grids.size);

      // Actualizar el store con los datos cargados
      useWorldStore.setState({
        grids,
        activeGridId: project.activeGridId,
        currentGridCoordinates: project.activeGridId ? 
          grids.get(project.activeGridId)?.coordinates || [0, 0, 0] : 
          [0, 0, 0]
      });

      console.log('✅ Proyecto cargado:', project.name);
    } catch (error) {
      console.error('❌ Error al cargar proyecto:', error);
      throw error;
    }
  }

  // Cargar todos los proyectos disponibles
  async loadAllProjects(): Promise<FirebaseProject[]> {
    try {
      const projects = await firebaseService.loadAllProjects();
      console.log('✅ Proyectos cargados:', projects.length);
      return projects;
    } catch (error) {
      console.error('❌ Error al cargar proyectos:', error);
      throw error;
    }
  }

  // Guardar una cuadrícula individual
  async saveGrid(gridId: string): Promise<string> {
    try {
      const state = useWorldStore.getState();
      const grid = state.grids.get(gridId);
      
      if (!grid) {
        throw new Error('Cuadrícula no encontrada');
      }

      const firebaseGrid = gridToFirebase(grid);
      const savedGridId = await firebaseService.saveGrid(firebaseGrid);
      
      console.log('✅ Cuadrícula guardada:', gridId, '->', savedGridId);
      return savedGridId;
    } catch (error) {
      console.error('❌ Error al guardar cuadrícula:', error);
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
      useWorldStore.setState((state) => ({
        grids: new Map(state.grids.set(gridId, grid))
      }));

      console.log('✅ Cuadrícula cargada:', gridId);
    } catch (error) {
      console.error('❌ Error al cargar cuadrícula:', error);
      throw error;
    }
  }

  // Actualizar un proyecto existente
  async updateProject(projectId: string, projectName?: string, description?: string): Promise<void> {
    try {
      const state = useWorldStore.getState();
      
      // Convertir todas las cuadrículas a formato Firebase
      const firebaseGrids: Omit<FirebaseGrid, 'createdAt' | 'updatedAt'>[] = [];
      
      for (const [, grid] of state.grids) {
        firebaseGrids.push(gridToFirebase(grid));
      }

      const updateData: Partial<FirebaseProject> = {
        grids: firebaseGrids,
        activeGridId: state.activeGridId
      };

      if (projectName) updateData.name = projectName;
      if (description !== undefined) updateData.description = description;

      await firebaseService.updateProject(projectId, updateData);
      
      console.log('✅ Proyecto actualizado:', projectId);
    } catch (error) {
      console.error('❌ Error al actualizar proyecto:', error);
      throw error;
    }
  }

  // Eliminar un proyecto
  async deleteProject(projectId: string): Promise<void> {
    try {
      await firebaseService.deleteProject(projectId);
      console.log('✅ Proyecto eliminado:', projectId);
    } catch (error) {
      console.error('❌ Error al eliminar proyecto:', error);
      throw error;
    }
  }

  // Sincronizar automáticamente los cambios con Firebase
  startAutoSync(projectId: string): () => void {
    console.log('🔄 Iniciando sincronización automática para proyecto:', projectId);
    
    const unsubscribe = firebaseService.subscribeToProject(projectId, (project) => {
      if (project) {
        console.log('📡 Recibiendo actualización del proyecto en tiempo real:', project.name);
        
        // Convertir las cuadrículas de Firebase al formato del store
        const grids = new Map<string, Grid>();
        
        for (const firebaseGrid of project.grids) {
          const grid = firebaseToGrid(firebaseGrid);
          grids.set(grid.id, grid);
        }

        // Actualizar el store con los datos sincronizados
        // Usar setState con una función para evitar bucles
        useWorldStore.setState((currentState) => {
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
            console.log('📡 No hay cambios en los datos, omitiendo actualización');
            return currentState;
          }
          
          console.log('✅ Proyecto sincronizado en tiempo real con cambios');
          
          // Marcar que estamos actualizando desde Firebase para evitar bucles
          setTimeout(() => {
            // Resetear la bandera después de un tiempo
          }, 1000);
          
          return {
            ...currentState,
            grids,
            activeGridId: project.activeGridId,
            currentGridCoordinates: project.activeGridId ? 
              grids.get(project.activeGridId)?.coordinates || [0, 0, 0] : 
              [0, 0, 0]
          };
        });
      }
    });

    return unsubscribe;
  }

  // Detener la sincronización automática
  stopAutoSync(unsubscribe: () => void): void {
    console.log('🛑 Deteniendo sincronización automática');
    unsubscribe();
  }
}

// Instancia singleton
export const persistenceService = PersistenceService.getInstance();
