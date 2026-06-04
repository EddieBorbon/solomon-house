import { create } from 'zustand';
import type { SoundObject, MobileObject, EffectZone, Grid, WorldState, WorldActions } from './useWorldStore';
import { firebaseService, type GlobalWorldDoc } from '../lib/firebaseService';
import { useGridStore } from '../stores/useGridStore';
import { useObjectStore } from '../stores/useObjectStore';
import { useMobileStore } from '../stores/useMobileStore';
import { useEffectStore } from '../stores/useEffectStore';
import { audioManager } from '../lib/AudioManager';

// Interface for the telematic sync store state
export interface RealtimeSyncState {
  isUpdatingFromFirestore: boolean;
  globalWorldConnected: boolean;
  locallyDeletedObjects: Set<string>;
}

export interface RealtimeSyncActions {
  setGlobalStateFromFirestore: (state: GlobalWorldDoc) => void;
  setIsUpdatingFromFirestore: (isUpdating: boolean) => void;
  setGlobalWorldConnected: (connected: boolean) => void;
  
  addGlobalSoundObject: (object: SoundObject) => void;
  updateGlobalSoundObject: (objectId: string, updates: Partial<Omit<SoundObject, 'id'>>) => void;
  removeGlobalSoundObject: (objectId: string) => void;
  
  addGlobalEffectZone: (effectZone: EffectZone) => void;
  updateGlobalEffectZone: (zoneId: string, updates: Partial<Omit<EffectZone, 'id'>>) => void;
  removeGlobalEffectZone: (zoneId: string) => void;
  
  addGlobalMobileObject: (mobileObject: MobileObject) => void;
  updateGlobalMobileObject: (objectId: string, updates: Partial<Omit<MobileObject, 'id'>>) => void;
  removeGlobalMobileObject: (objectId: string) => void;
}

const UPDATE_THROTTLE = 50; // ms
const DEBOUNCE_DELAY = 200; // ms
const lastUpdateTimes = new Map<string, number>();
const updateDebounceTimers = new Map<string, NodeJS.Timeout>();

// Break circular dependency dynamically at runtime
let lazyWorldStore: any = null;
const getWorldStore = () => {
  if (!lazyWorldStore) {
    lazyWorldStore = require('./useWorldStore').useWorldStore;
  }
  return lazyWorldStore;
};

export const useRealtimeSyncStore = create<RealtimeSyncState & RealtimeSyncActions>((set, get) => ({
  isUpdatingFromFirestore: false,
  globalWorldConnected: false,
  locallyDeletedObjects: new Set<string>(),

  setIsUpdatingFromFirestore: (isUpdating: boolean) => {
    set({ isUpdatingFromFirestore: isUpdating });
  },

  setGlobalWorldConnected: (connected: boolean) => {
    set({ globalWorldConnected: connected });
  },

  setGlobalStateFromFirestore: (state: GlobalWorldDoc) => {
    set({ isUpdatingFromFirestore: true });
    
    const worldStore = getWorldStore();
    worldStore.setState((currentState: WorldState & WorldActions) => {
      const newGrids = new Map<string, Grid>(currentState.grids);
      
      if (state.grids && state.grids.length > 0) {
        state.grids.forEach(grid => {
          const existingGrid = newGrids.get(grid.id);
          if (existingGrid) {
            const mergedObjects = existingGrid.objects.map((localObj: SoundObject) => {
              const remoteObj = grid.objects.find(ro => ro.id === localObj.id);
              if (!remoteObj) return localObj;
              
              const lastUpdateTime = lastUpdateTimes.get(localObj.id) || 0;
              const timeSinceLocalUpdate = Date.now() - lastUpdateTime;
              if (timeSinceLocalUpdate < 3000) {
                return localObj;
              }
              return remoteObj;
            });
            
            const newObjects = grid.objects.filter((remoteObj: SoundObject) => {
              const existsLocally = existingGrid.objects.some(localObj => localObj.id === remoteObj.id);
              const wasDeletedLocally = get().locallyDeletedObjects.has(remoteObj.id);
              return !existsLocally && !wasDeletedLocally;
            });
            
            const localEffectZones = existingGrid.effectZones.filter((localZone: EffectZone) => {
              const remoteZone = grid.effectZones.find(rz => rz.id === localZone.id);
              const wasDeletedLocally = get().locallyDeletedObjects.has(localZone.id);
              return !remoteZone && !wasDeletedLocally;
            });
            
            const localMobileObjects = existingGrid.mobileObjects.filter((localObj: MobileObject) => {
              const remoteObj = grid.mobileObjects.find(ro => ro.id === localObj.id);
              const wasDeletedLocally = get().locallyDeletedObjects.has(localObj.id);
              return !remoteObj && !wasDeletedLocally;
            });
            
            newGrids.set(grid.id, {
              ...grid,
              objects: [...mergedObjects, ...newObjects],
              effectZones: [...grid.effectZones, ...localEffectZones],
              mobileObjects: [...grid.mobileObjects, ...localMobileObjects],
            });
          } else {
            newGrids.set(grid.id, grid);
          }
        });
      }
      
      const updatedState = {
        grids: newGrids,
        activeGridId: currentState.activeGridId || newGrids.keys().next().value || null,
        globalWorldConnected: true
      };
      
      useGridStore.setState({ grids: newGrids });
      
      return updatedState;
    });

    // Sincronizar sub-stores de la arquitectura refactorizada
    setTimeout(async () => {
      const currentState = worldStore.getState() as WorldState & WorldActions;
      
      const allObjects: any[] = [];
      const objectsByGrid = new Map<string, any[]>();
      const allEffectZones: any[] = [];
      const allMobileObjects: any[] = [];
      
      currentState.grids.forEach((grid: any, gridId: string) => {
        allObjects.push(...grid.objects);
        objectsByGrid.set(gridId, grid.objects);
        allEffectZones.push(...grid.effectZones);
        allMobileObjects.push(...grid.mobileObjects);
      });
      
      useObjectStore.setState({
        objects: allObjects,
        objectsByGrid: objectsByGrid
      });
      useEffectStore.setState({
        effectZones: allEffectZones
      });
      useMobileStore.setState({
        mobileObjects: allMobileObjects
      });

      // Inicializar audio para objetos recibidos
      currentState.grids.forEach((grid: any) => {
        grid.objects.forEach((object: any) => {
          try {
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
          } catch (error) {
            console.error(`Error inicializando audio para objeto ${object.id}:`, error);
          }
        });
      });
    }, 100);

    setTimeout(() => {
      set({ isUpdatingFromFirestore: false });
    }, 50);
  },

  addGlobalSoundObject: (object: SoundObject) => {
    const state = get();
    console.log('🎵 addGlobalSoundObject called', { objectId: object.id, isUpdatingFromFirestore: state.isUpdatingFromFirestore });
    
    const worldStore = getWorldStore();
    
    // Actualizar el estado local inmediatamente (SIEMPRE)
    worldStore.setState((currentState: WorldState & WorldActions) => {
      const newGrids = new Map<string, Grid>(currentState.grids);
      const activeGridId = currentState.activeGridId;
      
      let objectExists = false;
      for (const grid of newGrids.values()) {
        if (grid.objects.some(obj => obj.id === object.id)) {
          objectExists = true;
          console.log(`ℹ️ Objeto ${object.id} ya existe en una cuadrícula, no agregando duplicado`);
          break;
        }
      }
      
      if (!objectExists) {
        if (state.isUpdatingFromFirestore) {
          const firstGridId = newGrids.keys().next().value;
          if (firstGridId) {
            const firstGrid = newGrids.get(firstGridId);
            if (firstGrid) {
              newGrids.set(firstGridId, {
                ...firstGrid,
                objects: [...firstGrid.objects, object]
              });
              useGridStore.setState({ grids: newGrids });
            }
          }
        } else {
          if (activeGridId) {
            const activeGrid = newGrids.get(activeGridId);
            if (activeGrid) {
              newGrids.set(activeGridId, {
                ...activeGrid,
                objects: [...activeGrid.objects, object]
              });
              useGridStore.setState({ grids: newGrids });
            }
          }
        }
      }
      
      return { grids: newGrids };
    });
    
    // Inicializar audio
    setTimeout(() => {
      try {
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
      } catch (error) {
        console.error(`Error inicializando audio para nuevo objeto ${object.id}:`, error);
      }
    }, 50);
    
    if (state.isUpdatingFromFirestore) {
      return;
    }
    
    // Sincronizar con Firestore
    firebaseService.addGlobalSoundObject(object).then(async () => {
      const currentState = worldStore.getState() as WorldState & WorldActions;
      const allGrids = Array.from(currentState.grids.values());
      await firebaseService.updateGlobalGrids(allGrids);
    }).catch(error => {
      console.error('Error syncing to Firestore:', error);
    });
  },

  updateGlobalSoundObject: (objectId: string, updates: Partial<Omit<SoundObject, 'id'>>) => {
    const state = get();
    
    const isFromFirestore = state.isUpdatingFromFirestore;
    const hasAudioParamsUpdate = !!updates.audioParams;
    
    if (isFromFirestore && !hasAudioParamsUpdate) {
      return;
    }
    
    if (!isFromFirestore || !hasAudioParamsUpdate) {
      const now = Date.now();
      const lastUpdateTime = lastUpdateTimes.get(objectId) || 0;
      if (now - lastUpdateTime < UPDATE_THROTTLE) {
        return;
      }
      lastUpdateTimes.set(objectId, now);
    }
    
    let updatedObject: SoundObject | null = null;
    let gridId: string | null = null;
    
    const worldStore = getWorldStore();
    
    if (isFromFirestore && hasAudioParamsUpdate) {
      const currentState = worldStore.getState() as WorldState & WorldActions;
      for (const [gId, grid] of currentState.grids) {
        const object = grid.objects.find(obj => obj.id === objectId);
        if (object) {
          updatedObject = object;
          gridId = gId;
          break;
        }
      }
    } else {
      worldStore.setState((currentState: WorldState & WorldActions) => {
        const newGrids = new Map<string, Grid>(currentState.grids);
        for (const [gId, grid] of newGrids) {
          const objectIndex = grid.objects.findIndex(obj => obj.id === objectId);
          if (objectIndex !== -1) {
            const updatedObjects = [...grid.objects];
            updatedObjects[objectIndex] = { ...updatedObjects[objectIndex], ...updates };
            updatedObject = updatedObjects[objectIndex];
            gridId = gId;
            newGrids.set(gId, {
              ...grid,
              objects: updatedObjects
            });
            break;
          }
        }
        useGridStore.setState({ grids: newGrids });
        return { grids: newGrids };
      });
    }
    
    if (updatedObject && gridId) {
      if (updates.position) {
        audioManager.updateSoundPosition(objectId, updatedObject.position);
      }
      if (updates.audioParams || (isFromFirestore && hasAudioParamsUpdate)) {
        audioManager.updateSoundParams(objectId, updatedObject.audioParams);
      }
      
      if (!isFromFirestore) {
        useObjectStore.getState().updateObject(objectId, updates, gridId);
      }
    }
    
    if (isFromFirestore) {
      return;
    }
    
    const timerKey = `updateObject_${objectId}`;
    const existingTimer = updateDebounceTimers.get(timerKey);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    const timer = setTimeout(async () => {
      try {
        const currentState = worldStore.getState() as WorldState & WorldActions;
        const updatedObject = currentState.grids.get(currentState.activeGridId || '')?.objects.find(obj => obj.id === objectId);
        
        if (updatedObject) {
          await firebaseService.updateGlobalSoundObject(objectId, updatedObject);
          const allGrids = Array.from(currentState.grids.values());
          await firebaseService.updateGlobalGrids(allGrids);
        }
      } catch (error) {
        console.error('Error updating global sound object:', error);
      } finally {
        updateDebounceTimers.delete(timerKey);
        lastUpdateTimes.delete(objectId);
      }
    }, DEBOUNCE_DELAY);
    
    updateDebounceTimers.set(timerKey, timer);
  },

  removeGlobalSoundObject: (objectId: string) => {
    const state = get();
    
    const newDeletedObjects = new Set(state.locallyDeletedObjects);
    newDeletedObjects.add(objectId);
    
    const worldStore = getWorldStore();
    let gridId: string | null = null;
    
    worldStore.setState((currentState: WorldState & WorldActions) => {
      const newGrids = new Map<string, Grid>(currentState.grids);
      for (const [gId, grid] of newGrids) {
        const objectIndex = grid.objects.findIndex(obj => obj.id === objectId);
        if (objectIndex !== -1) {
          const updatedObjects = grid.objects.filter(obj => obj.id !== objectId);
          gridId = gId;
          newGrids.set(gId, {
            ...grid,
            objects: updatedObjects
          });
          break;
        }
      }
      return {
        grids: newGrids,
        selectedEntityId: currentState.selectedEntityId === objectId ? null : currentState.selectedEntityId,
      };
    });
    
    set({ locallyDeletedObjects: newDeletedObjects });
    
    setTimeout(() => {
      const updatedDeletedObjects = new Set(get().locallyDeletedObjects);
      updatedDeletedObjects.delete(objectId);
      set({ locallyDeletedObjects: updatedDeletedObjects });
    }, 5000);
    
    try {
      audioManager.removeSoundSource(objectId);
    } catch (error) {
      console.error('Error cleaning up audio:', error);
    }
    
    const isFromFirestore = state.isUpdatingFromFirestore;
    if (!isFromFirestore && gridId) {
      useObjectStore.getState().removeObject(objectId, gridId);
    }
    
    if (!isFromFirestore) {
      firebaseService.removeGlobalSoundObject(objectId).then(async () => {
        const currentState = worldStore.getState() as WorldState & WorldActions;
        const allGrids = Array.from(currentState.grids.values());
        await firebaseService.updateGlobalGrids(allGrids);
      }).catch(error => {
        console.error('Error removing object from Firestore:', error);
      });
    }
  },

  addGlobalEffectZone: (effectZone: EffectZone) => {
    const state = get();
    const worldStore = getWorldStore();
    
    worldStore.setState((currentState: WorldState & WorldActions) => {
      const newGrids = new Map<string, Grid>(currentState.grids);
      const activeGridId = currentState.activeGridId;
      
      let zoneExists = false;
      for (const grid of newGrids.values()) {
        if (grid.effectZones.some(zone => zone.id === effectZone.id)) {
          zoneExists = true;
          break;
        }
      }
      
      if (!zoneExists) {
        if (state.isUpdatingFromFirestore) {
          const firstGridId = newGrids.keys().next().value;
          if (firstGridId) {
            const firstGrid = newGrids.get(firstGridId);
            if (firstGrid) {
              newGrids.set(firstGridId, {
                ...firstGrid,
                effectZones: [...firstGrid.effectZones, effectZone]
              });
              useGridStore.setState({ grids: newGrids });
            }
          }
        } else {
          if (activeGridId) {
            const activeGrid = newGrids.get(activeGridId);
            if (activeGrid) {
              newGrids.set(activeGridId, {
                ...activeGrid,
                effectZones: [...activeGrid.effectZones, effectZone]
              });
              useGridStore.setState({ grids: newGrids });
            }
          }
        }
      }
      
      return { grids: newGrids };
    });
    
    if (state.isUpdatingFromFirestore) {
      return;
    }
    
    firebaseService.addGlobalEffectZone(effectZone).then(async () => {
      const currentState = worldStore.getState() as WorldState & WorldActions;
      const allGrids = Array.from(currentState.grids.values());
      await firebaseService.updateGlobalGrids(allGrids);
    }).catch(error => {
      console.error('Error adding effect zone to Firestore:', error);
    });
  },

  updateGlobalEffectZone: (zoneId: string, updates: Partial<Omit<EffectZone, 'id'>>) => {
    const state = get();
    if (state.isUpdatingFromFirestore) {
      return;
    }
    
    const now = Date.now();
    const lastUpdateTime = lastUpdateTimes.get(zoneId) || 0;
    if (now - lastUpdateTime < UPDATE_THROTTLE) {
      return;
    }
    lastUpdateTimes.set(zoneId, now);
    
    const worldStore = getWorldStore();
    let updatedZone: EffectZone | null = null;
    let gridId: string | null = null;
    
    worldStore.setState((currentState: WorldState & WorldActions) => {
      const newGrids = new Map<string, Grid>(currentState.grids);
      for (const [gId, grid] of newGrids) {
        const zoneIndex = grid.effectZones.findIndex(zone => zone.id === zoneId);
        if (zoneIndex !== -1) {
          const updatedZones = [...grid.effectZones];
          updatedZones[zoneIndex] = { ...updatedZones[zoneIndex], ...updates };
          updatedZone = updatedZones[zoneIndex];
          gridId = gId;
          newGrids.set(gId, {
            ...grid,
            effectZones: updatedZones
          });
          break;
        }
      }
      useGridStore.setState({ grids: newGrids });
      return { grids: newGrids };
    });
    
    if (updatedZone && gridId) {
      const zone = updatedZone as EffectZone;
      if (updates.position) {
        audioManager.updateEffectZonePosition(zoneId, zone.position);
      }
      useEffectStore.getState().updateEffectZone(zoneId, updates);
    }
    
    const existingTimer = updateDebounceTimers.get(zoneId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    const timer = setTimeout(async () => {
      try {
        const currentState = worldStore.getState() as WorldState & WorldActions;
        const updatedZone = currentState.grids.get(currentState.activeGridId || '')?.effectZones.find(zone => zone.id === zoneId);
        
        if (updatedZone) {
          await firebaseService.updateGlobalEffectZone(zoneId, updatedZone);
          const allGrids = Array.from(currentState.grids.values());
          await firebaseService.updateGlobalGrids(allGrids);
        }
      } catch (error) {
        console.error('Error updating global effect zone:', error);
      } finally {
        updateDebounceTimers.delete(zoneId);
        lastUpdateTimes.delete(zoneId);
      }
    }, DEBOUNCE_DELAY);
    
    updateDebounceTimers.set(zoneId, timer);
  },

  removeGlobalEffectZone: (zoneId: string) => {
    const state = get();
    if (state.isUpdatingFromFirestore) {
      return;
    }
    
    const newDeletedObjects = new Set(state.locallyDeletedObjects);
    newDeletedObjects.add(zoneId);
    
    const worldStore = getWorldStore();
    
    worldStore.setState((currentState: WorldState & WorldActions) => {
      const newGrids = new Map<string, Grid>(currentState.grids);
      for (const [gridId, grid] of newGrids) {
        const zoneIndex = grid.effectZones.findIndex(zone => zone.id === zoneId);
        if (zoneIndex !== -1) {
          const updatedZones = grid.effectZones.filter(zone => zone.id !== zoneId);
          newGrids.set(gridId, {
            ...grid,
            effectZones: updatedZones
          });
          break;
        }
      }
      return {
        grids: newGrids,
        selectedEntityId: currentState.selectedEntityId === zoneId ? null : currentState.selectedEntityId,
      };
    });
    
    set({ locallyDeletedObjects: newDeletedObjects });
    
    setTimeout(() => {
      const updatedDeletedObjects = new Set(get().locallyDeletedObjects);
      updatedDeletedObjects.delete(zoneId);
      set({ locallyDeletedObjects: updatedDeletedObjects });
    }, 5000);
    
    useEffectStore.getState().removeEffectZone(zoneId);
    
    firebaseService.removeGlobalEffectZone(zoneId).then(async () => {
      const currentState = worldStore.getState() as WorldState & WorldActions;
      const allGrids = Array.from(currentState.grids.values());
      await firebaseService.updateGlobalGrids(allGrids);
    }).catch(error => {
      console.error('Error removing effect zone from Firestore:', error);
    });
  },

  addGlobalMobileObject: (mobileObject: MobileObject) => {
    const state = get();
    const worldStore = getWorldStore();
    
    worldStore.setState((currentState: WorldState & WorldActions) => {
      const newGrids = new Map<string, Grid>(currentState.grids);
      const activeGridId = currentState.activeGridId;
      
      let objectExists = false;
      for (const grid of newGrids.values()) {
        if (grid.mobileObjects.some(obj => obj.id === mobileObject.id)) {
          objectExists = true;
          break;
        }
      }
      
      if (!objectExists) {
        if (state.isUpdatingFromFirestore) {
          const firstGridId = newGrids.keys().next().value;
          if (firstGridId) {
            const firstGrid = newGrids.get(firstGridId);
            if (firstGrid) {
              newGrids.set(firstGridId, {
                ...firstGrid,
                mobileObjects: [...firstGrid.mobileObjects, mobileObject]
              });
              useGridStore.setState({ grids: newGrids });
            }
          }
        } else {
          if (activeGridId) {
            const activeGrid = newGrids.get(activeGridId);
            if (activeGrid) {
              newGrids.set(activeGridId, {
                ...activeGrid,
                mobileObjects: [...activeGrid.mobileObjects, mobileObject]
              });
              useGridStore.setState({ grids: newGrids });
            }
          }
        }
      }
      
      return { grids: newGrids };
    });
    
    if (state.isUpdatingFromFirestore) {
      return;
    }
    
    firebaseService.addGlobalMobileObject(mobileObject).catch(error => {
      console.error('Error adding global mobile object:', error);
    });
  },

  updateGlobalMobileObject: (objectId: string, updates: Partial<Omit<MobileObject, 'id'>>) => {
    const state = get();
    const worldStore = getWorldStore();
    
    let updatedObject: MobileObject | null = null;
    let gridId: string | null = null;
    
    worldStore.setState((currentState: WorldState & WorldActions) => {
      const newGrids = new Map<string, Grid>(currentState.grids);
      for (const [gId, grid] of newGrids) {
        const objectIndex = grid.mobileObjects.findIndex(obj => obj.id === objectId);
        if (objectIndex !== -1) {
          const updatedObjects = [...grid.mobileObjects];
          const currentObject = updatedObjects[objectIndex];
          
          if (updates.mobileParams && currentObject.mobileParams) {
            const mergedParams = {
              ...currentObject.mobileParams,
              ...updates.mobileParams,
            };
            updatedObjects[objectIndex] = { 
              ...currentObject, 
              ...updates,
              mobileParams: mergedParams,
            };
          } else {
            updatedObjects[objectIndex] = { ...currentObject, ...updates };
          }
          
          updatedObject = updatedObjects[objectIndex];
          gridId = gId;
          newGrids.set(gId, {
            ...grid,
            mobileObjects: updatedObjects
          });
          break;
        }
      }
      useGridStore.setState({ grids: newGrids });
      return { grids: newGrids };
    });
    
    if (updatedObject && gridId) {
      useMobileStore.getState().updateMobileObject(objectId, updates);
    }
    
    if (state.isUpdatingFromFirestore) {
      return;
    }
    
    const timerKey = `updateMobileObject_${objectId}`;
    const existingTimer = updateDebounceTimers.get(timerKey);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    const timer = setTimeout(async () => {
      try {
        const currentState = worldStore.getState() as WorldState & WorldActions;
        const updatedObject = currentState.grids.get(currentState.activeGridId || '')?.mobileObjects.find(obj => obj.id === objectId);
        
        if (updatedObject) {
          await firebaseService.updateGlobalMobileObject(objectId, updatedObject);
        }
      } catch (error) {
        console.error('Error updating global mobile object:', error);
      } finally {
        updateDebounceTimers.delete(timerKey);
      }
    }, DEBOUNCE_DELAY);
    
    updateDebounceTimers.set(timerKey, timer);
  },

  removeGlobalMobileObject: (objectId: string) => {
    const state = get();
    if (state.isUpdatingFromFirestore) {
      return;
    }
    
    const newDeletedObjects = new Set(state.locallyDeletedObjects);
    newDeletedObjects.add(objectId);
    
    const worldStore = getWorldStore();
    
    worldStore.setState((currentState: WorldState & WorldActions) => {
      const newGrids = new Map<string, Grid>(currentState.grids);
      for (const [gridId, grid] of newGrids) {
        const objectIndex = grid.mobileObjects.findIndex(obj => obj.id === objectId);
        if (objectIndex !== -1) {
          const updatedObjects = grid.mobileObjects.filter(obj => obj.id !== objectId);
          newGrids.set(gridId, {
            ...grid,
            mobileObjects: updatedObjects
          });
          break;
        }
      }
      return {
        grids: newGrids,
        selectedEntityId: currentState.selectedEntityId === objectId ? null : currentState.selectedEntityId,
      };
    });
    
    set({ locallyDeletedObjects: newDeletedObjects });
    
    setTimeout(() => {
      const updatedDeletedObjects = new Set(get().locallyDeletedObjects);
      updatedDeletedObjects.delete(objectId);
      set({ locallyDeletedObjects: updatedDeletedObjects });
    }, 5000);
    
    useMobileStore.getState().removeMobileObject(objectId);
    
    firebaseService.removeGlobalMobileObject(objectId).then(async () => {
      const currentState = worldStore.getState() as WorldState & WorldActions;
      const allGrids = Array.from(currentState.grids.values());
      await firebaseService.updateGlobalGrids(allGrids);
    }).catch(error => {
      console.error('Error removing mobile object from Firestore:', error);
    });
  }
}));
