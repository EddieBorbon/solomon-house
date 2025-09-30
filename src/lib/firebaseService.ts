import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  setDoc,
  deleteDoc, 
  query, 
  orderBy,
  onSnapshot,
  Timestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from './firebase';
import { type SoundObject, type MobileObject, type EffectZone } from '../state/useWorldStore';

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

export interface FirebaseProject {
  id: string;
  name: string;
  description?: string;
  grids: FirebaseGrid[];
  activeGridId: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Interfaz para el documento del mundo global
export interface GlobalWorldDoc {
  id: string;
  objects: SoundObject[];
  mobileObjects: MobileObject[];
  effectZones: EffectZone[];
  activeGridId: string | null;
  currentGridCoordinates: [number, number, number];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastModifiedBy?: string; // Para futuras funcionalidades de autenticación
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

  // ===== MÉTODOS PARA EL MUNDO GLOBAL =====

  // Obtener el estado actual del mundo global
  async getGlobalWorldState(): Promise<GlobalWorldDoc | null> {
    try {
      console.log('🔥 FirebaseService.getGlobalWorldState: Obteniendo estado del mundo global');
      const globalWorldRef = doc(db, this.globalWorldCollection, 'main');
      const docSnap = await getDoc(globalWorldRef);
      
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() } as GlobalWorldDoc;
        console.log('🔥 FirebaseService.getGlobalWorldState: Estado obtenido', { 
          objectsCount: data.objects?.length || 0,
          mobileObjectsCount: data.mobileObjects?.length || 0,
          effectZonesCount: data.effectZones?.length || 0
        });
        return data;
      } else {
        console.log('🔥 FirebaseService.getGlobalWorldState: No hay documento del mundo global');
        return null;
      }
    } catch (error) {
      console.error('🔥 FirebaseService.getGlobalWorldState: Error al obtener estado:', error);
      throw error;
    }
  }

  // Guardar todo el estado del mundo global
  async saveGlobalWorldState(state: GlobalWorldDoc): Promise<void> {
    try {
      const globalWorldRef = doc(db, this.globalWorldCollection, 'main');
      await setDoc(globalWorldRef, {
        ...state,
        createdAt: state.createdAt || Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      throw error;
    }
  }

  // Actualizar solo partes del documento del mundo global
  async updateGlobalWorldState(updates: Partial<GlobalWorldDoc>): Promise<void> {
    try {
      const globalWorldRef = doc(db, this.globalWorldCollection, 'main');
      await updateDoc(globalWorldRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      throw error;
    }
  }

  // Agregar un objeto al mundo global usando arrayUnion
  async addGlobalSoundObject(object: SoundObject): Promise<void> {
    try {
      const globalWorldRef = doc(db, this.globalWorldCollection, 'main');
      await updateDoc(globalWorldRef, {
        objects: arrayUnion(object),
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      throw error;
    }
  }

  // Actualizar un objeto existente en el mundo global
  async updateGlobalSoundObject(objectId: string, updates: Partial<SoundObject>): Promise<void> {
    try {
      console.log('🔥 FirebaseService.updateGlobalSoundObject:', { objectId, updates });
      // Primero obtener el documento actual
      const globalWorldRef = doc(db, this.globalWorldCollection, 'main');
      const docSnap = await getDoc(globalWorldRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as GlobalWorldDoc;
        console.log('🔥 FirebaseService: Documento global encontrado, objetos:', data.objects.length);
        const updatedObjects = data.objects.map(obj => 
          obj.id === objectId ? { ...obj, ...updates } : obj
        );
        
        console.log('🔥 FirebaseService: Actualizando documento global con objetos:', updatedObjects.length);
        await updateDoc(globalWorldRef, {
          objects: updatedObjects,
          updatedAt: Timestamp.now()
        });
        console.log('🔥 FirebaseService: Documento global actualizado exitosamente');
      } else {
        console.log('🔥 FirebaseService: Documento global no existe');
      }
    } catch (error) {
      console.error('🔥 FirebaseService: Error al actualizar objeto global:', error);
      throw error;
    }
  }

  // Eliminar un objeto del mundo global usando arrayRemove
  async removeGlobalSoundObject(objectId: string): Promise<void> {
    try {
      // Primero obtener el documento actual para encontrar el objeto
      const globalWorldRef = doc(db, this.globalWorldCollection, 'main');
      const docSnap = await getDoc(globalWorldRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as GlobalWorldDoc;
        const objectToRemove = data.objects.find(obj => obj.id === objectId);
        
        if (objectToRemove) {
          await updateDoc(globalWorldRef, {
            objects: arrayRemove(objectToRemove),
            updatedAt: Timestamp.now()
          });
        }
      }
    } catch (error) {
      throw error;
    }
  }

  // Métodos similares para objetos móviles
  async addGlobalMobileObject(mobileObject: MobileObject): Promise<void> {
    try {
      const globalWorldRef = doc(db, this.globalWorldCollection, 'main');
      await updateDoc(globalWorldRef, {
        mobileObjects: arrayUnion(mobileObject),
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      throw error;
    }
  }

  async updateGlobalMobileObject(objectId: string, updates: Partial<MobileObject>): Promise<void> {
    try {
      const globalWorldRef = doc(db, this.globalWorldCollection, 'main');
      const docSnap = await getDoc(globalWorldRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as GlobalWorldDoc;
        const updatedObjects = data.mobileObjects.map(obj => 
          obj.id === objectId ? { ...obj, ...updates } : obj
        );
        
        await updateDoc(globalWorldRef, {
          mobileObjects: updatedObjects,
          updatedAt: Timestamp.now()
        });
      }
    } catch (error) {
      throw error;
    }
  }

  async removeGlobalMobileObject(objectId: string): Promise<void> {
    try {
      const globalWorldRef = doc(db, this.globalWorldCollection, 'main');
      const docSnap = await getDoc(globalWorldRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as GlobalWorldDoc;
        const objectToRemove = data.mobileObjects.find(obj => obj.id === objectId);
        
        if (objectToRemove) {
          await updateDoc(globalWorldRef, {
            mobileObjects: arrayRemove(objectToRemove),
            updatedAt: Timestamp.now()
          });
        }
      }
    } catch (error) {
      throw error;
    }
  }

  // Métodos similares para zonas de efectos
  async addGlobalEffectZone(effectZone: EffectZone): Promise<void> {
    try {
      const globalWorldRef = doc(db, this.globalWorldCollection, 'main');
      await updateDoc(globalWorldRef, {
        effectZones: arrayUnion(effectZone),
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      throw error;
    }
  }

  async updateGlobalEffectZone(zoneId: string, updates: Partial<EffectZone>): Promise<void> {
    try {
      const globalWorldRef = doc(db, this.globalWorldCollection, 'main');
      const docSnap = await getDoc(globalWorldRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as GlobalWorldDoc;
        const updatedZones = data.effectZones.map(zone => 
          zone.id === zoneId ? { ...zone, ...updates } : zone
        );
        
        await updateDoc(globalWorldRef, {
          effectZones: updatedZones,
          updatedAt: Timestamp.now()
        });
      }
    } catch (error) {
      throw error;
    }
  }

  async removeGlobalEffectZone(zoneId: string): Promise<void> {
    try {
      const globalWorldRef = doc(db, this.globalWorldCollection, 'main');
      const docSnap = await getDoc(globalWorldRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as GlobalWorldDoc;
        const zoneToRemove = data.effectZones.find(zone => zone.id === zoneId);
        
        if (zoneToRemove) {
          await updateDoc(globalWorldRef, {
            effectZones: arrayRemove(zoneToRemove),
            updatedAt: Timestamp.now()
          });
        }
      }
    } catch (error) {
      throw error;
    }
  }

  // Cargar el estado del mundo global
  async loadGlobalWorldState(): Promise<GlobalWorldDoc | null> {
    try {
      const globalWorldRef = doc(db, this.globalWorldCollection, 'main');
      const docSnap = await getDoc(globalWorldRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as GlobalWorldDoc;
      } else {
        return null;
      }
    } catch (error) {
      throw error;
    }
  }

  // Escuchar cambios en tiempo real del mundo global
  subscribeToGlobalWorld(callback: (state: GlobalWorldDoc | null) => void): () => void {
    const globalWorldRef = doc(db, this.globalWorldCollection, 'main');
    
    console.log('🔥 FirebaseService: Iniciando suscripción al mundo global');
    
    return onSnapshot(globalWorldRef, (doc) => {
      if (doc.exists()) {
        const state = { id: doc.id, ...doc.data() } as GlobalWorldDoc;
        console.log('🔥 FirebaseService: Recibida actualización del mundo global:', state);
        callback(state);
      } else {
        console.log('🔥 FirebaseService: Documento del mundo global no existe');
        callback(null);
      }
    });
  }
}

// Instancia singleton
export const firebaseService = FirebaseService.getInstance();
