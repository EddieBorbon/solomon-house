import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { type MobileObject, type MobileObjectActions } from '../types/world';

interface MobileState {
  mobileObjects: MobileObject[];
}

// Función para migrar objetos móviles existentes
const migrateMobileObjects = (objects: MobileObject[]): MobileObject[] => {
  return objects.map(obj => ({
    ...obj,
    mobileParams: {
      ...obj.mobileParams,
      // Asegurar que los nuevos parámetros existan
      height: obj.mobileParams?.height ?? 1,
      heightSpeed: obj.mobileParams?.heightSpeed ?? 0.5,
    }
  }));
};

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
        height: 1, // Altura del movimiento vertical
        heightSpeed: 0.5, // Velocidad del movimiento vertical
        showRadiusIndicator: true,
        showProximityIndicator: true,
        // Propiedades de la esfera móvil pequeña
        spherePosition: [0, 0, 0], // Posición inicial de la esfera (relativa al origen)
        sphereRotation: [0, 0, 0], // Rotación de la esfera
        sphereScale: [1, 1, 1], // Escala de la esfera
      },
    };


    set((state) => ({
      mobileObjects: [...state.mobileObjects, newMobileObject]
    }));

  },

  updateMobileObject: (id: string, updates: Partial<Omit<MobileObject, 'id'>>) => {
    set((state) => ({
      mobileObjects: state.mobileObjects.map(obj => {
        if (obj.id === id) {
          // Migrar parámetros móviles si faltan los nuevos campos
          const updatedMobileParams = {
            ...obj.mobileParams,
            ...updates.mobileParams,
            // Asegurar que los nuevos parámetros existan
            height: updates.mobileParams?.height ?? obj.mobileParams?.height ?? 1,
            heightSpeed: updates.mobileParams?.heightSpeed ?? obj.mobileParams?.heightSpeed ?? 0.5,
          };
          
          return { 
            ...obj, 
            ...updates, 
            mobileParams: updatedMobileParams 
          };
        }
        return obj;
      })
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

  selectEntity: (id: string | null) => {
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
    return migrateMobileObjects(state.mobileObjects);
  }
}));
