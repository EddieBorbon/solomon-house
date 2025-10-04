import { ObjectManager } from '../managers/ObjectManager';
import { MobileObjectManager } from '../managers/MobileObjectManager';
import { WorldManager } from '../managers/WorldManager';
import { DefaultParamsProvider } from '../providers/DefaultParamsProvider';
import { useGridStore, type Grid } from '../../stores/useGridStore';
import { useEffectStore, type EffectType } from '../../stores/useEffectStore';
import { useSelectionStore } from '../../stores/useSelectionStore';
import { SoundObjectType, SoundObject, MobileObject, EffectZone } from '../useWorldStore';
import { AudioParams } from '../../lib/AudioManager';

/**
 * Facade para coordinar todos los componentes del sistema de mundo
 * Responsabilidad única: Proporcionar una interfaz unificada para todas las operaciones del mundo
 */
export class WorldStoreFacade {
  private objectManager: ObjectManager;
  private mobileObjectManager: MobileObjectManager;
  private worldManager: WorldManager;

  constructor() {
    this.objectManager = new ObjectManager();
    this.mobileObjectManager = new MobileObjectManager();
    this.worldManager = new WorldManager();
  }

  // ===== OPERACIONES DE OBJETOS =====

  /**
   * Crea un nuevo objeto de sonido
   */
  public createObject(
    type: SoundObjectType,
    position: [number, number, number],
    gridId: string
  ): SoundObject {
    return this.objectManager.createObject(type, position, gridId);
  }

  /**
   * Elimina un objeto de sonido
   */
  public removeObject(id: string, gridId: string): void {
    this.objectManager.removeObject(id, gridId);
  }

  /**
   * Actualiza un objeto de sonido
   */
  public updateObject(
    id: string,
    updates: Partial<Omit<SoundObject, 'id'>>,
    gridId: string
  ): void {
    console.log('🔧 WorldStoreFacade: updateObject called', { id, updates, gridId });
    this.objectManager.updateObject(id, updates, gridId);
    console.log('✅ WorldStoreFacade: updateObject completed');
  }

  /**
   * Activa/desactiva el audio de un objeto
   */
  public toggleObjectAudio(id: string, forceState?: boolean, gridId?: string): void {
    if (gridId) {
      this.objectManager.toggleObjectAudio(id, forceState, gridId);
    }
  }

  /**
   * Dispara una nota en un objeto
   */
  public triggerObjectNote(id: string, gridId: string): void {
    this.objectManager.triggerObjectNote(id, gridId);
  }

  /**
   * Dispara un objeto percusivo
   */
  public triggerObjectPercussion(id: string, gridId: string): void {
    this.objectManager.triggerObjectPercussion(id, gridId);
  }

  /**
   * Dispara una nota con duración específica
   */
  public triggerObjectAttackRelease(id: string, gridId: string): void {
    this.objectManager.triggerObjectAttackRelease(id, gridId);
  }

  /**
   * Inicia el gate de un objeto
   */
  public startObjectGate(id: string, gridId: string): void {
    this.objectManager.startObjectGate(id, gridId);
  }

  /**
   * Detiene el gate de un objeto
   */
  public stopObjectGate(id: string, gridId: string): void {
    this.objectManager.stopObjectGate(id, gridId);
  }

  /**
   * Limpia todos los objetos
   */
  public clearAllObjects(): void {
    this.objectManager.clearAllObjects();
  }

  // ===== OPERACIONES DE OBJETOS MÓVILES =====

  /**
   * Crea un nuevo objeto móvil
   */
  public createMobileObject(position: [number, number, number]): MobileObject {
    return this.mobileObjectManager.createMobileObject(position);
  }

  /**
   * Actualiza un objeto móvil
   */
  public updateMobileObject(
    id: string,
    updates: Partial<Omit<MobileObject, 'id'>>,
    grids: Map<string, unknown>
  ): void {
    this.mobileObjectManager.updateMobileObject(id, updates, grids);
  }

  /**
   * Elimina un objeto móvil
   */
  public removeMobileObject(id: string, grids: Map<string, Grid>): void {
    this.mobileObjectManager.removeMobileObject(id, grids);
  }

  /**
   * Actualiza la posición de un objeto móvil
   */
  public updateMobileObjectPosition(
    id: string,
    position: [number, number, number],
    grids: Map<string, unknown>
  ): void {
    this.mobileObjectManager.updateMobileObjectPosition(id, position, grids);
  }

  // ===== OPERACIONES DE ZONAS DE EFECTOS =====

  /**
   * Crea una nueva zona de efecto
   */
  public createEffectZone(
    type: EffectType,
    position: [number, number, number],
    shape: 'sphere' | 'cube' = 'sphere',
    gridId?: string
  ): EffectZone {
    return useEffectStore.getState().addEffectZone(type, position, shape, gridId);
  }

  /**
   * Actualiza una zona de efecto
   */
  public updateEffectZone(
    id: string,
    updates: Partial<Omit<EffectZone, 'id'>>,
    gridId?: string
  ): void {
    useEffectStore.getState().updateEffectZone(id, updates, gridId);
  }

  /**
   * Elimina una zona de efecto
   */
  public removeEffectZone(id: string, gridId?: string): void {
    useEffectStore.getState().removeEffectZone(id, gridId);
  }

  /**
   * Activa/desactiva el bloqueo de una zona de efecto
   */
  public toggleLockEffectZone(id: string, gridId?: string): void {
    useEffectStore.getState().toggleLockEffectZone(id, gridId);
  }

  // ===== OPERACIONES DE MUNDOS =====

  /**
   * Crea un nuevo mundo
   */
  public createWorld(name: string): { id: string; name: string } {
    return this.worldManager.createWorld(name);
  }

  /**
   * Elimina un mundo
   */
  public deleteWorld(id: string): boolean {
    return this.worldManager.deleteWorld(id);
  }

  /**
   * Cambia al mundo especificado
   */
  public switchWorld(id: string): boolean {
    return this.worldManager.switchWorld(id);
  }

  /**
   * Obtiene el mundo actual
   */
  public getCurrentWorld(): { id: string; name: string } | null {
    return this.worldManager.getCurrentWorld();
  }

  /**
   * Obtiene todos los mundos
   */
  public getAllWorlds(): Array<{ id: string; name: string }> {
    return this.worldManager.getAllWorlds();
  }

  // ===== OPERACIONES DE CUADRÍCULAS =====

  /**
   * Mueve a una cuadrícula específica
   */
  public moveToGrid(coordinates: [number, number, number]): void {
    useGridStore.getState().moveToGrid(coordinates);
  }

  /**
   * Carga una cuadrícula
   */
  public loadGrid(coordinates: [number, number, number]): void {
    useGridStore.getState().loadGrid(coordinates);
  }

  /**
   * Descarga una cuadrícula
   */
  public unloadGrid(coordinates: [number, number, number]): void {
    useGridStore.getState().unloadGrid(coordinates);
  }

  /**
   * Crea una nueva cuadrícula
   */
  public createGrid(position: [number, number, number], size: number = 20): void {
    useGridStore.getState().createGrid(position, size);
  }

  /**
   * Selecciona una cuadrícula
   */
  public selectGrid(gridId: string | null): void {
    useGridStore.getState().selectGrid(gridId);
  }

  /**
   * Actualiza una cuadrícula
   */
  public updateGrid(gridId: string, updates: Partial<Omit<Grid, 'id'>>): void {
    useGridStore.getState().updateGrid(gridId, updates);
  }

  /**
   * Elimina una cuadrícula
   */
  public deleteGrid(gridId: string): void {
    useGridStore.getState().deleteGrid(gridId);
  }

  // ===== OPERACIONES DE SELECCIÓN =====

  /**
   * Selecciona una entidad
   */
  public selectEntity(id: string | null): void {
    useSelectionStore.getState().selectEntity(id);
  }

  /**
   * Establece el modo de transformación
   */
  public setTransformMode(mode: 'translate' | 'rotate' | 'scale'): void {
    useSelectionStore.getState().setTransformMode(mode);
  }

  // ===== OPERACIONES DE PARÁMETROS =====

  /**
   * Obtiene los parámetros por defecto para un tipo de objeto
   */
  public getDefaultAudioParams(type: SoundObjectType): AudioParams {
    return DefaultParamsProvider.getDefaultAudioParams(type);
  }

  /**
   * Valida los parámetros de audio
   */
  public validateAudioParams(params: AudioParams): boolean {
    return this.objectManager.validateAudioParams(params);
  }

  // ===== OPERACIONES DE BÚSQUEDA =====

  /**
   * Busca un objeto por ID
   */
  public findObjectById(id: string, grids: Map<string, Grid>): { object: SoundObject | null, gridId: string | null } {
    return this.objectManager.findObjectById(id, grids);
  }

  /**
   * Busca un objeto móvil por ID
   */
  public findMobileObjectById(id: string, grids: Map<string, Grid>): { object: MobileObject | null, gridId: string | null } {
    return this.mobileObjectManager.findMobileObjectById(id, grids);
  }

  // ===== OPERACIONES DE ESTADO =====

  /**
   * Obtiene el estado actual de todos los componentes
   */
  public getCurrentState(): {
    grids: Map<string, unknown>;
    currentGridCoordinates: [number, number, number];
    activeGridId: string | null;
    worlds: Array<{ id: string; name: string }>;
    currentWorldId: string | null;
    selectedEntityId: string | null;
    transformMode: 'translate' | 'rotate' | 'scale';
    isEditingEffectZone: boolean;
  } {
    const gridStore = useGridStore.getState();
    const effectStore = useEffectStore.getState();
    const selectionStore = useSelectionStore.getState();

    return {
      grids: gridStore.grids,
      currentGridCoordinates: gridStore.currentGridCoordinates,
      activeGridId: gridStore.activeGridId,
      worlds: this.worldManager.getAllWorlds(),
      currentWorldId: this.worldManager.getCurrentWorldId(),
      selectedEntityId: selectionStore.selectedEntityId,
      transformMode: selectionStore.transformMode,
      isEditingEffectZone: effectStore.isEditingEffectZone,
    };
  }

  /**
   * Sincroniza el estado de todos los componentes
   */
  public syncAllComponents(): void {
    // Esta función puede ser utilizada para sincronizar el estado
    // entre todos los componentes cuando sea necesario
    useGridStore.getState();
    useEffectStore.getState();
    useSelectionStore.getState();

    // Aquí se pueden agregar operaciones de sincronización específicas
    // si es necesario en el futuro
  }

  /**
   * Limpia todos los datos del sistema
   */
  public clearAllData(): void {
    this.objectManager.clearAllObjects();
    useEffectStore.getState().clearAllEffectZones();
    this.worldManager.clearAllWorlds();
    // Limpiar cuadrículas individualmente si no hay método clearAllGrids
    const gridStore = useGridStore.getState();
    gridStore.grids.forEach((_, gridId) => {
      gridStore.deleteGrid(gridId);
    });
    useSelectionStore.getState().clearSelection();
  }

  /**
   * Obtiene estadísticas del sistema
   */
  public getSystemStats(): {
    totalObjects: number;
    totalMobileObjects: number;
    totalEffectZones: number;
    totalWorlds: number;
    totalGrids: number;
  } {
    const gridStore = useGridStore.getState();
    const effectStore = useEffectStore.getState();
    
    let totalObjects = 0;
    let totalMobileObjects = 0;
    
    gridStore.grids.forEach(grid => {
      totalObjects += grid.objects.length;
      totalMobileObjects += grid.mobileObjects.length;
    });

    return {
      totalObjects,
      totalMobileObjects,
      totalEffectZones: effectStore.effectZones.length,
      totalWorlds: this.worldManager.getAllWorlds().length,
      totalGrids: gridStore.grids.size,
    };
  }
}
