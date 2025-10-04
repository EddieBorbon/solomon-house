import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  onSnapshot,
  Timestamp,
  setDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { type SoundObject, type MobileObject, type EffectZone, type Grid } from '../state/useWorldStore';

// Tipos de datos para Firebase
export interface FirebaseGrid {
  id: string;
  coordinates: [number, number, number];
  position: [number, number, number];
  objects: SoundObject[];
  mobileObjects: MobileObject[];
  effectZones: EffectZone[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Tipos para el mundo global
export interface GlobalWorldDoc {
  objects: SoundObject[];
  effectZones: EffectZone[];
  mobileObjects: MobileObject[];
  grids: Grid[];
  activeGridId: string | null;
  lastUpdated: Timestamp;
  version: number; // Para manejo de conflictos
}

export interface FirebaseProject {
  id: string;
  name: string;
  description?: string;
  grids: FirebaseGrid[];
  activeGridId: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class FirebaseService {
  private static instance: FirebaseService;
  private projectsCollection = 'projects';
  private gridsCollection = 'grids';
  private globalWorldCollection = 'globalWorldState';

  static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  // Guardar un proyecto completo
  async saveProject(projectData: Omit<FirebaseProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const projectRef = await addDoc(collection(db, this.projectsCollection), {
        ...projectData,
        createdAt: now,
        updatedAt: now
      });
      
      return projectRef.id;
    } catch (error) {
      throw error;
    }
  }

  // Actualizar un proyecto existente
  async updateProject(projectId: string, projectData: Partial<FirebaseProject>): Promise<void> {
    try {
      const projectRef = doc(db, this.projectsCollection, projectId);
      await updateDoc(projectRef, {
        ...projectData,
        updatedAt: Timestamp.now()
      });
      
    } catch (error) {
      throw error;
    }
  }

  // Cargar un proyecto por ID
  async loadProject(projectId: string): Promise<FirebaseProject | null> {
    try {
      const projectRef = doc(db, this.projectsCollection, projectId);
      const projectSnap = await getDoc(projectRef);
      
      if (projectSnap.exists()) {
        const projectData = { id: projectSnap.id, ...projectSnap.data() } as FirebaseProject;
        return projectData;
      } else {
        return null;
      }
    } catch (error) {
      throw error;
    }
  }

  // Cargar todos los proyectos
  async loadAllProjects(): Promise<FirebaseProject[]> {
    try {
      const projectsQuery = query(
        collection(db, this.projectsCollection),
        orderBy('updatedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(projectsQuery);
      const projects: FirebaseProject[] = [];
      
      querySnapshot.forEach((doc) => {
        projects.push({ id: doc.id, ...doc.data() } as FirebaseProject);
      });
      
      return projects;
    } catch (error) {
      throw error;
    }
  }

  // Guardar una cuadrícula individual
  async saveGrid(gridData: Omit<FirebaseGrid, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const gridRef = await addDoc(collection(db, this.gridsCollection), {
        ...gridData,
        createdAt: now,
        updatedAt: now
      });
      
      return gridRef.id;
    } catch (error) {
      throw error;
    }
  }

  // Actualizar una cuadrícula existente
  async updateGrid(gridId: string, gridData: Partial<FirebaseGrid>): Promise<void> {
    try {
      const gridRef = doc(db, this.gridsCollection, gridId);
      await updateDoc(gridRef, {
        ...gridData,
        updatedAt: Timestamp.now()
      });
      
    } catch (error) {
      throw error;
    }
  }

  // Cargar una cuadrícula por ID
  async loadGrid(gridId: string): Promise<FirebaseGrid | null> {
    try {
      const gridRef = doc(db, this.gridsCollection, gridId);
      const gridSnap = await getDoc(gridRef);
      
      if (gridSnap.exists()) {
        const gridData = { id: gridSnap.id, ...gridSnap.data() } as FirebaseGrid;
        return gridData;
      } else {
        return null;
      }
    } catch (error) {
      throw error;
    }
  }

  // Eliminar un proyecto
  async deleteProject(projectId: string): Promise<void> {
    try {
      const projectRef = doc(db, this.projectsCollection, projectId);
      await deleteDoc(projectRef);
      
    } catch (error) {
      throw error;
    }
  }

  // Eliminar una cuadrícula
  async deleteGrid(gridId: string): Promise<void> {
    try {
      const gridRef = doc(db, this.gridsCollection, gridId);
      await deleteDoc(gridRef);
      
    } catch (error) {
      throw error;
    }
  }

  // Escuchar cambios en tiempo real de un proyecto
  subscribeToProject(projectId: string, callback: (project: FirebaseProject | null) => void): () => void {
    const projectRef = doc(db, this.projectsCollection, projectId);
    
    return onSnapshot(projectRef, (doc) => {
      if (doc.exists()) {
        const projectData = { id: doc.id, ...doc.data() } as FirebaseProject;
        callback(projectData);
      } else {
        callback(null);
      }
    });
  }

  // Escuchar cambios en tiempo real de todas las cuadrículas
  subscribeToGrids(callback: (grids: FirebaseGrid[]) => void): () => void {
    const gridsQuery = query(collection(db, this.gridsCollection), orderBy('updatedAt', 'desc'));
    
    return onSnapshot(gridsQuery, (querySnapshot) => {
      const grids: FirebaseGrid[] = [];
      querySnapshot.forEach((doc) => {
        grids.push({ id: doc.id, ...doc.data() } as FirebaseGrid);
      });
      callback(grids);
    });
  }

  // ========== MÉTODOS PARA EL MUNDO GLOBAL ==========

  /**
   * Inicializa el estado del mundo global si no existe
   * @param initialState Estado inicial del mundo global
   */
  async initializeGlobalWorldState(initialState: Partial<GlobalWorldDoc> = {}): Promise<void> {
    try {
      const globalWorldRef = doc(db, this.globalWorldCollection, 'main');
      const globalWorldSnap = await getDoc(globalWorldRef);
      
      if (!globalWorldSnap.exists()) {
        const defaultState: GlobalWorldDoc = {
          objects: [],
          effectZones: [],
          mobileObjects: [],
          grids: [],
          activeGridId: null,
          lastUpdated: serverTimestamp() as Timestamp,
          version: 1,
          ...initialState
        };
        
        await setDoc(globalWorldRef, defaultState);
        console.log('Global world state initialized');
      }
    } catch (error) {
      console.error('Error initializing global world state:', error);
      throw error;
    }
  }

  /**
   * Actualiza el estado del mundo global
   * @param updates Campos a actualizar
   */
  async updateGlobalWorldState(updates: Partial<Omit<GlobalWorldDoc, 'version' | 'lastUpdated'>>): Promise<void> {
    try {
      const globalWorldRef = doc(db, this.globalWorldCollection, 'main');
      
      await updateDoc(globalWorldRef, {
        ...updates,
        lastUpdated: serverTimestamp(),
        version: arrayUnion(1) // Incrementar versión para manejo de conflictos
      });
    } catch (error) {
      console.error('Error updating global world state:', error);
      throw error;
    }
  }

  /**
   * Añade un objeto al mundo global usando arrayUnion
   * @param object Objeto a añadir
   */
  async addGlobalSoundObject(object: SoundObject): Promise<void> {
    try {
      const globalWorldRef = doc(db, this.globalWorldCollection, 'main');
      
      await updateDoc(globalWorldRef, {
        objects: arrayUnion(object),
        lastUpdated: serverTimestamp(),
        version: arrayUnion(1)
      });
    } catch (error) {
      console.error('Error adding global sound object:', error);
      throw error;
    }
  }

  /**
   * Actualiza un objeto en el mundo global
   * @param objectId ID del objeto a actualizar
   * @param updatedObject Objeto actualizado
   */
  async updateGlobalSoundObject(objectId: string, updatedObject: SoundObject): Promise<void> {
    try {
      const globalWorldRef = doc(db, this.globalWorldCollection, 'main');
      const globalWorldSnap = await getDoc(globalWorldRef);
      
      if (globalWorldSnap.exists()) {
        const currentData = globalWorldSnap.data() as GlobalWorldDoc;
        const updatedObjects = currentData.objects.map(obj => 
          obj.id === objectId ? updatedObject : obj
        );
        
        await updateDoc(globalWorldRef, {
          objects: updatedObjects,
          lastUpdated: serverTimestamp(),
          version: arrayUnion(1)
        });
      }
    } catch (error) {
      console.error('Error updating global sound object:', error);
      throw error;
    }
  }

  /**
   * Elimina un objeto del mundo global
   * @param objectId ID del objeto a eliminar
   */
  async removeGlobalSoundObject(objectId: string): Promise<void> {
    try {
      const globalWorldRef = doc(db, this.globalWorldCollection, 'main');
      const globalWorldSnap = await getDoc(globalWorldRef);
      
      if (globalWorldSnap.exists()) {
        const currentData = globalWorldSnap.data() as GlobalWorldDoc;
        const objectToRemove = currentData.objects.find(obj => obj.id === objectId);
        
        if (objectToRemove) {
          await updateDoc(globalWorldRef, {
            objects: arrayRemove(objectToRemove),
            lastUpdated: serverTimestamp(),
            version: arrayUnion(1)
          });
        }
      }
    } catch (error) {
      console.error('Error removing global sound object:', error);
      throw error;
    }
  }

  /**
   * Añade una zona de efecto al mundo global
   * @param effectZone Zona de efecto a añadir
   */
  async addGlobalEffectZone(effectZone: EffectZone): Promise<void> {
    try {
      const globalWorldRef = doc(db, this.globalWorldCollection, 'main');
      
      await updateDoc(globalWorldRef, {
        effectZones: arrayUnion(effectZone),
        lastUpdated: serverTimestamp(),
        version: arrayUnion(1)
      });
    } catch (error) {
      console.error('Error adding global effect zone:', error);
      throw error;
    }
  }

  /**
   * Actualiza una zona de efecto en el mundo global
   * @param zoneId ID de la zona a actualizar
   * @param updatedZone Zona actualizada
   */
  async updateGlobalEffectZone(zoneId: string, updatedZone: EffectZone): Promise<void> {
    try {
      const globalWorldRef = doc(db, this.globalWorldCollection, 'main');
      const globalWorldSnap = await getDoc(globalWorldRef);
      
      if (globalWorldSnap.exists()) {
        const currentData = globalWorldSnap.data() as GlobalWorldDoc;
        const updatedZones = currentData.effectZones.map(zone => 
          zone.id === zoneId ? updatedZone : zone
        );
        
        await updateDoc(globalWorldRef, {
          effectZones: updatedZones,
          lastUpdated: serverTimestamp(),
          version: arrayUnion(1)
        });
      }
    } catch (error) {
      console.error('Error updating global effect zone:', error);
      throw error;
    }
  }

  /**
   * Elimina una zona de efecto del mundo global
   * @param zoneId ID de la zona a eliminar
   */
  async removeGlobalEffectZone(zoneId: string): Promise<void> {
    try {
      const globalWorldRef = doc(db, this.globalWorldCollection, 'main');
      const globalWorldSnap = await getDoc(globalWorldRef);
      
      if (globalWorldSnap.exists()) {
        const currentData = globalWorldSnap.data() as GlobalWorldDoc;
        const zoneToRemove = currentData.effectZones.find(zone => zone.id === zoneId);
        
        if (zoneToRemove) {
          await updateDoc(globalWorldRef, {
            effectZones: arrayRemove(zoneToRemove),
            lastUpdated: serverTimestamp(),
            version: arrayUnion(1)
          });
        }
      }
    } catch (error) {
      console.error('Error removing global effect zone:', error);
      throw error;
    }
  }

  /**
   * Añade un objeto móvil al mundo global
   * @param mobileObject Objeto móvil a añadir
   */
  async addGlobalMobileObject(mobileObject: MobileObject): Promise<void> {
    try {
      const globalWorldRef = doc(db, this.globalWorldCollection, 'main');
      
      await updateDoc(globalWorldRef, {
        mobileObjects: arrayUnion(mobileObject),
        lastUpdated: serverTimestamp(),
        version: arrayUnion(1)
      });
    } catch (error) {
      console.error('Error adding global mobile object:', error);
      throw error;
    }
  }

  /**
   * Actualiza un objeto móvil en el mundo global
   * @param objectId ID del objeto a actualizar
   * @param updatedObject Objeto actualizado
   */
  async updateGlobalMobileObject(objectId: string, updatedObject: MobileObject): Promise<void> {
    try {
      const globalWorldRef = doc(db, this.globalWorldCollection, 'main');
      const globalWorldSnap = await getDoc(globalWorldRef);
      
      if (globalWorldSnap.exists()) {
        const currentData = globalWorldSnap.data() as GlobalWorldDoc;
        const updatedObjects = currentData.mobileObjects.map(obj => 
          obj.id === objectId ? updatedObject : obj
        );
        
        await updateDoc(globalWorldRef, {
          mobileObjects: updatedObjects,
          lastUpdated: serverTimestamp(),
          version: arrayUnion(1)
        });
      }
    } catch (error) {
      console.error('Error updating global mobile object:', error);
      throw error;
    }
  }

  /**
   * Elimina un objeto móvil del mundo global
   * @param objectId ID del objeto a eliminar
   */
  async removeGlobalMobileObject(objectId: string): Promise<void> {
    try {
      const globalWorldRef = doc(db, this.globalWorldCollection, 'main');
      const globalWorldSnap = await getDoc(globalWorldRef);
      
      if (globalWorldSnap.exists()) {
        const currentData = globalWorldSnap.data() as GlobalWorldDoc;
        const objectToRemove = currentData.mobileObjects.find(obj => obj.id === objectId);
        
        if (objectToRemove) {
          await updateDoc(globalWorldRef, {
            mobileObjects: arrayRemove(objectToRemove),
            lastUpdated: serverTimestamp(),
            version: arrayUnion(1)
          });
        }
      }
    } catch (error) {
      console.error('Error removing global mobile object:', error);
      throw error;
    }
  }

  /**
   * Actualiza las cuadrículas en el mundo global
   * @param grids Array de cuadrículas actualizado
   */
  async updateGlobalGrids(grids: Grid[]): Promise<void> {
    try {
      const globalWorldRef = doc(db, this.globalWorldCollection, 'main');
      
      await updateDoc(globalWorldRef, {
        grids: grids,
        lastUpdated: serverTimestamp(),
        version: arrayUnion(1)
      });
    } catch (error) {
      console.error('Error updating global grids:', error);
      throw error;
    }
  }

  /**
   * Actualiza la cuadrícula activa en el mundo global
   * @param activeGridId ID de la cuadrícula activa
   */
  async updateGlobalActiveGrid(activeGridId: string | null): Promise<void> {
    try {
      const globalWorldRef = doc(db, this.globalWorldCollection, 'main');
      
      await updateDoc(globalWorldRef, {
        activeGridId: activeGridId,
        lastUpdated: serverTimestamp(),
        version: arrayUnion(1)
      });
    } catch (error) {
      console.error('Error updating global active grid:', error);
      throw error;
    }
  }

  /**
   * Suscripción en tiempo real al estado del mundo global
   * @param callback Función callback que recibe el estado actualizado
   * @returns Función para cancelar la suscripción
   */
  subscribeToGlobalWorld(callback: (state: GlobalWorldDoc | null) => void): () => void {
    const globalWorldRef = doc(db, this.globalWorldCollection, 'main');
    
    return onSnapshot(globalWorldRef, (doc) => {
      if (doc.exists()) {
        const globalWorldData = { id: doc.id, ...doc.data() } as unknown as GlobalWorldDoc;
        callback(globalWorldData);
      } else {
        callback(null);
      }
    });
  }

  /**
   * Obtiene el estado actual del mundo global
   * @returns Estado actual del mundo global o null si no existe
   */
  async getGlobalWorldState(): Promise<GlobalWorldDoc | null> {
    try {
      const globalWorldRef = doc(db, this.globalWorldCollection, 'main');
      const globalWorldSnap = await getDoc(globalWorldRef);
      
      if (globalWorldSnap.exists()) {
        return { id: globalWorldSnap.id, ...globalWorldSnap.data() } as unknown as GlobalWorldDoc;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting global world state:', error);
      throw error;
    }
  }
}

// Instancia singleton
export const firebaseService = FirebaseService.getInstance();
