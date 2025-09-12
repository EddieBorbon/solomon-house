import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

// Tipos de datos para Firebase
export interface FirebaseGrid {
  id: string;
  coordinates: [number, number, number];
  position: [number, number, number];
  objects: any[];
  mobileObjects: any[];
  effectZones: any[];
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

export class FirebaseService {
  private static instance: FirebaseService;
  private projectsCollection = 'projects';
  private gridsCollection = 'grids';

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
      
      console.log('✅ Proyecto guardado en Firebase:', projectRef.id);
      return projectRef.id;
    } catch (error) {
      console.error('❌ Error al guardar proyecto:', error);
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
      
      console.log('✅ Proyecto actualizado en Firebase:', projectId);
    } catch (error) {
      console.error('❌ Error al actualizar proyecto:', error);
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
        console.log('✅ Proyecto cargado desde Firebase:', projectId);
        return projectData;
      } else {
        console.log('⚠️ Proyecto no encontrado:', projectId);
        return null;
      }
    } catch (error) {
      console.error('❌ Error al cargar proyecto:', error);
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
      
      console.log('✅ Proyectos cargados desde Firebase:', projects.length);
      return projects;
    } catch (error) {
      console.error('❌ Error al cargar proyectos:', error);
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
      
      console.log('✅ Cuadrícula guardada en Firebase:', gridRef.id);
      return gridRef.id;
    } catch (error) {
      console.error('❌ Error al guardar cuadrícula:', error);
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
      
      console.log('✅ Cuadrícula actualizada en Firebase:', gridId);
    } catch (error) {
      console.error('❌ Error al actualizar cuadrícula:', error);
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
        console.log('✅ Cuadrícula cargada desde Firebase:', gridId);
        return gridData;
      } else {
        console.log('⚠️ Cuadrícula no encontrada:', gridId);
        return null;
      }
    } catch (error) {
      console.error('❌ Error al cargar cuadrícula:', error);
      throw error;
    }
  }

  // Eliminar un proyecto
  async deleteProject(projectId: string): Promise<void> {
    try {
      const projectRef = doc(db, this.projectsCollection, projectId);
      await deleteDoc(projectRef);
      
      console.log('✅ Proyecto eliminado de Firebase:', projectId);
    } catch (error) {
      console.error('❌ Error al eliminar proyecto:', error);
      throw error;
    }
  }

  // Eliminar una cuadrícula
  async deleteGrid(gridId: string): Promise<void> {
    try {
      const gridRef = doc(db, this.gridsCollection, gridId);
      await deleteDoc(gridRef);
      
      console.log('✅ Cuadrícula eliminada de Firebase:', gridId);
    } catch (error) {
      console.error('❌ Error al eliminar cuadrícula:', error);
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
}

// Instancia singleton
export const firebaseService = FirebaseService.getInstance();
