import { firebaseService, type FirebaseProject, type FirebaseGrid } from './firebaseService';
import { useWorldStore, type Grid, type SoundObject, type MobileObject, type EffectZone, type ParticleSystemObject } from '../state/useWorldStore';
import { Timestamp } from 'firebase/firestore';

// Convertir Grid del store a FirebaseGrid
export function gridToFirebase(grid: Grid): Omit<FirebaseGrid, 'createdAt' | 'updatedAt'> {
  return {
    id: grid.id, // Incluir el ID de la cuadrícula
    coordinates: grid.coordinates,
    position: grid.position,
    objects: grid.objects,
    mobileObjects: grid.mobileObjects,
    effectZones: grid.effectZones,
    particleSystems: grid.particleSystems
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
      movementType: obj.mobileParams?.movementType || 'circular'
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

  const normalizedParticleSystems = (firebaseGrid.particleSystems || []).map((ps: ParticleSystemObject) => ({
    ...ps,
    id: ps.id || `ps-${Math.random().toString(36).substr(2, 9)}`,
    type: ps.type || 'particleSystem',
    position: ps.position || [0, 0, 0],
    rotation: ps.rotation || [0, 0, 0],
    scale: ps.scale || [1, 1, 1],
    isSelected: ps.isSelected || false,
    particleParams: {
      shape: ps.particleParams?.shape || 'vortex',
      color: ps.particleParams?.color || '#ffffff',
      count: ps.particleParams?.count || 1000,
      height: ps.particleParams?.height || 5,
      radius: ps.particleParams?.radius || 2,
      handInteractionEnabled: ps.particleParams?.handInteractionEnabled ?? true,
      synthesisEnabled: ps.particleParams?.synthesisEnabled ?? true,
    }
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
    particleSystems: normalizedParticleSystems,
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
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        })),
        activeGridId: state.activeGridId
      };

      const projectId = await firebaseService.saveProject(projectData);

      return projectId;
    } catch (error) {
      throw error;
    }
  }

  // Crear un nuevo proyecto vacío
  async createEmptyProject(projectName: string, description?: string): Promise<string> {
    try {
      // Crear una cuadrícula vacía por defecto
      const defaultGrid: Omit<FirebaseGrid, 'createdAt' | 'updatedAt'> = {
        id: 'grid_0_0_0',
        coordinates: [0, 0, 0],
        position: [0, 0, 0],
        objects: [],
        mobileObjects: [],
        effectZones: [],
        particleSystems: []
      };

      // Crear el proyecto
      const projectData: Omit<FirebaseProject, 'id' | 'createdAt' | 'updatedAt'> = {
        name: projectName,
        description: description || '',
        grids: [{
          ...defaultGrid,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }],
        activeGridId: 'grid_0_0_0'
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
        throw new Error('Project not found'); // Error message - translation handled in UI
      }

      // IMPORTANTE: Detener todos los sonidos del mundo global antes de cargar el proyecto
      // Esto previene el sonido residual del mundo global
      console.log('🛑 Deteniendo todos los sonidos del mundo global antes de cargar proyecto');
      try {
        const { audioManager } = await import('../lib/AudioManager');

        // Obtener el estado actual antes de limpiar para tener los IDs
        const currentState = useWorldStore.getState();
        const allObjectIds: string[] = [];

        // Recolectar todos los IDs de objetos del mundo global
        for (const grid of currentState.grids.values()) {
          for (const object of grid.objects) {
            allObjectIds.push(object.id);
          }
        }

        console.log(`🛑 Encontrados ${allObjectIds.length} objetos sonoros del mundo global para detener`);

        // Detener todos los sonidos (incluyendo sonidos continuos)
        // stopSound detiene cualquier tipo de sonido, incluyendo continuos
        allObjectIds.forEach(objectId => {
          try {
            audioManager.stopSound(objectId);
          } catch {
            // Ignorar errores si el sonido no existe o ya está detenido
          }
        });

        // Remover todas las fuentes de sonido del mundo global
        // removeSoundSource detiene el sonido si está sonando y remueve la fuente
        allObjectIds.forEach(objectId => {
          try {
            audioManager.removeSoundSource(objectId);
          } catch {
            // Ignorar errores si la fuente ya fue removida
          }
        });

        // Limpiar recursos de efectos y managers (pero sin remover las fuentes nuevas que se crearán)
        // Solo limpiar conexiones de efectos, no todas las fuentes ya que ya las removimos
        try {
          audioManager.cleanup();
        } catch {
          // Ignorar errores en cleanup
        }

        console.log('✅ Todos los sonidos del mundo global detenidos y removidos');
      } catch (error) {
        console.error('❌ Error deteniendo sonidos del mundo global:', error);
        // Continuar de todos modos para cargar el proyecto
      }

      // Convertir las cuadrículas de Firebase al formato del store
      const grids = new Map<string, Grid>();

      for (const firebaseGrid of project.grids) {
        const grid = firebaseToGrid(firebaseGrid);
        grids.set(grid.id, grid);
      }


      // IMPORTANTE: Reemplazar completamente el estado al cargar un proyecto
      // Esto asegura que no se mezclen datos del mundo global con el proyecto
      const currentState = useWorldStore.getState();
      useWorldStore.setState({
        ...currentState,
        grids, // Reemplazar completamente las cuadrículas
        activeGridId: project.activeGridId,
        currentGridCoordinates: project.activeGridId ?
          grids.get(project.activeGridId)?.coordinates || [0, 0, 0] :
          [0, 0, 0],
        // Asegurar que el mundo global esté desactivado
        globalWorldConnected: false,
        // Usar el estado de bloqueo del proyecto (si está bloqueado, no se puede editar)
        isEditingLocked: project.isLocked || false,
        isAdminAuthenticated: false,
        // Resetear la selección y el modo de transformación al cargar un proyecto
        // Esto asegura que no haya selecciones inválidas de otros mundos
        selectedEntityId: null,
        transformMode: 'translate'
      });

      // También resetear en useSelectionStore si existe
      try {
        const { useSelectionStore } = await import('../stores/useSelectionStore');
        if (useSelectionStore && useSelectionStore.getState) {
          useSelectionStore.getState().clearSelection();
        }
      } catch {
        // Si no existe useSelectionStore, ignorar el error
      }

      // Inicializar audio para los objetos del proyecto cargado
      setTimeout(async () => {
        console.log('🎵 Inicializando audio para objetos del proyecto cargado');
        try {
          const { audioManager } = await import('../lib/AudioManager');

          // Asegurar que el contexto de audio esté iniciado
          if (!audioManager.isContextStarted()) {
            console.log('🎵 Iniciando contexto de audio...');
            await audioManager.startContext();
          }

          const state = useWorldStore.getState();
          let initializedCount = 0;

          // Crear todas las fuentes de sonido
          for (const grid of state.grids.values()) {
            for (const object of grid.objects) {
              try {
                // Crear fuente de sonido si no existe
                if (!audioManager.getSoundSourceState(object.id)) {
                  audioManager.createSoundSource(
                    object.id,
                    object.type,
                    object.audioParams || {
                      frequency: 440,
                      waveform: 'sine',
                      volume: 0.3
                    },
                    object.position
                  );

                  console.log(`✅ Fuente de sonido creada para objeto ${object.id} (tipo: ${object.type})`);
                }

                // Iniciar sonido continuo si está habilitado
                if (object.audioEnabled) {
                  // Pequeño delay para asegurar que la fuente esté lista
                  await new Promise(resolve => setTimeout(resolve, 10));
                  audioManager.startContinuousSound(object.id, object.audioParams || {
                    frequency: 440,
                    waveform: 'sine',
                    volume: 0.3
                  });
                  initializedCount++;
                  console.log(`🔊 Audio iniciado para objeto ${object.id}`);
                }
              } catch (error) {
                console.error(`❌ Error inicializando audio para objeto ${object.id}:`, error);
              }
            }
          }

          console.log(`✅ Audio inicializado para ${initializedCount} objetos del proyecto`);
        } catch (error) {
          console.error('❌ Error general inicializando audio:', error);
        }
      }, 300); // Delay para asegurar que el estado se haya actualizado completamente

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
      const state = useWorldStore.getState();
      const grid = state.grids.get(gridId);

      if (!grid) {
        throw new Error('Grid not found'); // Error message - translation handled in UI
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
        throw new Error('Grid not found'); // Error message - translation handled in UI
      }

      const grid = firebaseToGrid(firebaseGrid);

      // Actualizar el store con la cuadrícula cargada
      useWorldStore.setState((state) => ({
        grids: new Map(state.grids.set(gridId, grid))
      }));

    } catch (error) {
      throw error;
    }
  }

  // Actualizar un proyecto existente
  async updateProject(projectId: string, projectName?: string, description?: string): Promise<void> {
    try {
      const state = useWorldStore.getState();

      // IMPORTANTE: Solo actualizar si el proyecto actual coincide con el que se está actualizando
      // Esto previene que se actualice un proyecto incorrecto si hay un cambio de contexto
      if (state.currentProjectId !== projectId) {
        console.warn(`⚠️ Intento de actualizar proyecto ${projectId} pero el proyecto actual es ${state.currentProjectId}`);
        // No hacer nada si el proyecto actual no coincide
        return;
      }

      // Convertir todas las cuadrículas a formato Firebase
      const firebaseGrids: Omit<FirebaseGrid, 'createdAt' | 'updatedAt'>[] = [];

      for (const [, grid] of state.grids) {
        firebaseGrids.push(gridToFirebase(grid));
      }

      const updateData: Partial<FirebaseProject> = {
        grids: firebaseGrids.map(grid => ({
          ...grid,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        })),
        activeGridId: state.activeGridId
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

  // Bloquear un proyecto individual (requiere contraseña de admin)
  async lockProject(projectId: string, password: string): Promise<boolean> {
    const ADMIN_PASSWORD = '%3D27eaf[}V]3]';
    if (password !== ADMIN_PASSWORD) {
      return false;
    }

    try {
      await firebaseService.updateProject(projectId, { isLocked: true });
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Desbloquear un proyecto individual (requiere contraseña de admin)
  async unlockProject(projectId: string, password: string): Promise<boolean> {
    const ADMIN_PASSWORD = '%3D27eaf[}V]3]';
    if (password !== ADMIN_PASSWORD) {
      return false;
    }

    try {
      await firebaseService.updateProject(projectId, { isLocked: false });
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar un proyecto con contraseña de admin
  async deleteProjectWithPassword(projectId: string, password: string): Promise<boolean> {
    const ADMIN_PASSWORD = '%3D27eaf[}V]3]';
    if (password !== ADMIN_PASSWORD) {
      return false;
    }

    try {
      await firebaseService.deleteProject(projectId);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Sincronizar automáticamente los cambios con Firebase
  // Variable para rastrear si estamos actualizando desde Firebase (evitar bucles)
  private isUpdatingFromFirestore = false;
  private updateDebounceTimers = new Map<string, NodeJS.Timeout>();
  private readonly DEBOUNCE_DELAY = 500; // ms - Delay para sincronización

  startAutoSync(projectId: string): () => void {
    const previousGridsRef = { current: null as Map<string, Grid> | null };

    const unsubscribe = firebaseService.subscribeToProject(projectId, async (project) => {
      if (project && !this.isUpdatingFromFirestore) {
        // Marcar que estamos actualizando desde Firebase
        this.isUpdatingFromFirestore = true;

        try {
          // Convertir las cuadrículas de Firebase al formato del store
          const grids = new Map<string, Grid>();

          for (const firebaseGrid of project.grids) {
            const grid = firebaseToGrid(firebaseGrid);
            grids.set(grid.id, grid);
          }

          // Obtener grids anteriores para comparar
          const previousGrids = previousGridsRef.current;
          const currentState = useWorldStore.getState();
          const currentGrids = currentState.grids;

          // Actualizar el store con los datos sincronizados
          // Usar setState con una función para evitar bucles
          useWorldStore.setState((state) => {
            // Solo actualizar si realmente hay cambios
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
              return state;
            }

            // Guardar grids anteriores para la próxima comparación
            previousGridsRef.current = new Map(grids);

            return {
              ...state,
              grids,
              activeGridId: project.activeGridId,
              currentGridCoordinates: project.activeGridId ?
                grids.get(project.activeGridId)?.coordinates || [0, 0, 0] :
                [0, 0, 0]
            };
          });

          // IMPORTANTE: Detectar cambios en audioParams y actualizar AudioManager
          // Similar a como se hace en useGlobalWorldSync
          // Usar setTimeout para asegurar que el estado se haya actualizado primero
          setTimeout(() => {
            if (previousGrids) {
              // Comparar objetos entre grids anteriores y nuevos para detectar cambios en audioParams
              for (const [gridId, newGrid] of grids) {
                const previousGrid = previousGrids.get(gridId);

                if (previousGrid) {
                  // Detectar cambios en objetos sonoros
                  for (const newObject of newGrid.objects) {
                    const previousObject = previousGrid.objects.find(obj => obj.id === newObject.id);

                    if (previousObject) {
                      // Comparar audioParams de manera más robusta (similar a useGlobalWorldSync)
                      const previousParams = JSON.stringify(previousObject.audioParams);
                      const newParams = JSON.stringify(newObject.audioParams);

                      // También comparar audioEnabled
                      const audioEnabledChanged = previousObject.audioEnabled !== newObject.audioEnabled;

                      if (previousParams !== newParams || audioEnabledChanged) {
                        console.log(`🎵 Cambio en audioParams detectado para objeto ${newObject.id} en proyecto ${projectId}`);

                        // Actualizar AudioManager con los nuevos parámetros
                        // Importar AudioManager dinámicamente para evitar dependencias circulares
                        import('../lib/AudioManager').then(({ audioManager }) => {
                          // Verificar si la fuente de sonido existe
                          if (audioManager.getSoundSourceState(newObject.id)) {
                            // Actualizar parámetros de audio
                            audioManager.updateSoundParams(newObject.id, newObject.audioParams);
                            console.log(`✅ AudioManager actualizado para objeto ${newObject.id}`);

                            // Si cambió audioEnabled, actualizar el estado
                            if (audioEnabledChanged) {
                              if (newObject.audioEnabled) {
                                audioManager.startContinuousSound(newObject.id, newObject.audioParams);
                              } else {
                                audioManager.stopSound(newObject.id);
                              }
                            }
                          } else {
                            // Si no existe, crear la fuente de sonido
                            audioManager.createSoundSource(
                              newObject.id,
                              newObject.type,
                              newObject.audioParams,
                              newObject.position
                            );

                            // Si el objeto tiene audio habilitado, iniciar el sonido
                            if (newObject.audioEnabled) {
                              audioManager.startContinuousSound(newObject.id, newObject.audioParams);
                            }

                            console.log(`✅ Fuente de sonido creada y actualizada para objeto ${newObject.id}`);
                          }
                        }).catch(error => {
                          console.error(`❌ Error importando AudioManager para objeto ${newObject.id}:`, error);
                        });
                      }
                    } else {
                      // Nuevo objeto - crear fuente de sonido si no existe
                      import('../lib/AudioManager').then(({ audioManager }) => {
                        if (!audioManager.getSoundSourceState(newObject.id)) {
                          audioManager.createSoundSource(
                            newObject.id,
                            newObject.type,
                            newObject.audioParams,
                            newObject.position
                          );

                          if (newObject.audioEnabled) {
                            audioManager.startContinuousSound(newObject.id, newObject.audioParams);
                          }

                          console.log(`✅ Nueva fuente de sonido creada para objeto ${newObject.id}`);
                        }
                      }).catch(error => {
                        console.error(`❌ Error importando AudioManager para nuevo objeto ${newObject.id}:`, error);
                      });
                    }
                  }
                } else {
                  // Nueva cuadrícula - inicializar audio para todos los objetos
                  for (const newObject of newGrid.objects) {
                    import('../lib/AudioManager').then(({ audioManager }) => {
                      if (!audioManager.getSoundSourceState(newObject.id)) {
                        audioManager.createSoundSource(
                          newObject.id,
                          newObject.type,
                          newObject.audioParams,
                          newObject.position
                        );

                        if (newObject.audioEnabled) {
                          audioManager.startContinuousSound(newObject.id, newObject.audioParams);
                        }
                      }
                    }).catch(error => {
                      console.error(`❌ Error importando AudioManager para objeto ${newObject.id}:`, error);
                    });
                  }
                }
              }
            } else {
              // Primera carga - inicializar audio para todos los objetos
              for (const grid of grids.values()) {
                for (const object of grid.objects) {
                  import('../lib/AudioManager').then(({ audioManager }) => {
                    if (!audioManager.getSoundSourceState(object.id)) {
                      audioManager.createSoundSource(
                        object.id,
                        object.type,
                        object.audioParams,
                        object.position
                      );

                      if (object.audioEnabled) {
                        audioManager.startContinuousSound(object.id, object.audioParams);
                      }
                    }
                  }).catch(error => {
                    console.error(`❌ Error importando AudioManager para objeto ${object.id}:`, error);
                  });
                }
              }
            }
          }, 150); // Delay para asegurar que el estado se haya actualizado

        } finally {
          // Resetear la bandera después de un breve delay para evitar bucles
          setTimeout(() => {
            this.isUpdatingFromFirestore = false;
          }, 100);
        }
      }
    });

    return unsubscribe;
  }

  // Función para sincronizar cambios locales con Firebase (con debounce)
  async syncProjectChanges(projectId: string): Promise<void> {
    if (!projectId || this.isUpdatingFromFirestore) return;

    // Cancelar sincronización previa pendiente
    const existingTimer = this.updateDebounceTimers.get(projectId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Programar nueva sincronización
    const timer = setTimeout(async () => {
      try {
        this.isUpdatingFromFirestore = true;
        await this.updateProject(projectId);
      } catch (error) {
        console.error('Error sincronizando cambios del proyecto:', error);
      } finally {
        this.isUpdatingFromFirestore = false;
        this.updateDebounceTimers.delete(projectId);
      }
    }, this.DEBOUNCE_DELAY);

    this.updateDebounceTimers.set(projectId, timer);
  }

  // Detener la sincronización automática
  stopAutoSync(unsubscribe: () => void): void {
    unsubscribe();
  }
}

// Instancia singleton
export const persistenceService = PersistenceService.getInstance();
