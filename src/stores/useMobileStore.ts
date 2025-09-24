import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { type MobileObject, type MobileObjectActions } from '../types/world';

interface MobileState {
  mobileObjects: MobileObject[];
}

export const useMobileStore = create<MobileState & MobileObjectActions>((set, get) => ({
  // Estado inicial
  mobileObjects: [],

  // Acciones para gestión de objetos móviles
  addMobileObject: (position: [number, number, number]) => {
    const newMobileObject: MobileObject = {
      id: uuidv4(),
      type: 'mobile',
      position,
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      isSelected: false,
      mobileParams: {
        movementType: 'circular',
        radius: 2,
        speed: 1,
        proximityThreshold: 1.5,
        isActive: true,
        centerPosition: position,
        direction: [1, 0, 0],
        axis: [0, 1, 0],
        amplitude: 0.5,
        frequency: 1,
        randomSeed: Math.random() * 1000,
        showRadiusIndicator: true,
        showProximityIndicator: true,
      },
    };

    console.log(`➕ Creando objeto móvil en posición:`, newMobileObject.position);

    set((state) => ({
      mobileObjects: [...state.mobileObjects, newMobileObject]
    }));

    console.log(`🚀 Añadiendo objeto móvil en posición ${position}`);
  },

  updateMobileObject: (id: string, updates: Partial<Omit<MobileObject, 'id'>>) => {
    console.log(`🔄 Store: Actualizando objeto móvil ${id} con:`, updates);
    
    set((state) => ({
      mobileObjects: state.mobileObjects.map(obj =>
        obj.id === id ? { ...obj, ...updates } : obj
      )
    }));
  },

  removeMobileObject: (id: string) => {
    set((state) => ({
      mobileObjects: state.mobileObjects.filter(obj => obj.id !== id)
    }));
  },

  updateMobileObjectPosition: (id: string, position: [number, number, number]) => {
    set((state) => ({
      mobileObjects: state.mobileObjects.map(obj =>
        obj.id === id ? { ...obj, position } : obj
      )
    }));
  },

  // Implementación de EntityActions
  add: (entity: Omit<MobileObject, 'id'>) => {
    const newMobileObject: MobileObject = {
      id: uuidv4(),
      ...entity
    };
    
    set((state) => ({
      mobileObjects: [...state.mobileObjects, newMobileObject]
    }));
  },

  update: (id: string, updates: Partial<Omit<MobileObject, 'id'>>) => {
    get().updateMobileObject(id, updates);
  },

  remove: (id: string) => {
    get().removeMobileObject(id);
  },

  select: (id: string | null) => {
    set((state) => ({
      mobileObjects: state.mobileObjects.map((obj) => ({
        ...obj,
        isSelected: obj.id === id,
      }))
    }));
  },

  getById: (id: string) => {
    const state = get();
    return state.mobileObjects.find(obj => obj.id === id);
  },

  getAll: () => {
    const state = get();
    return state.mobileObjects;
  },
}));
