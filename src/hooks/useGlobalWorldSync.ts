import { useEffect, useRef, useState, useCallback } from 'react';
import { firebaseService, type GlobalWorldDoc } from '../lib/firebaseService';
import { useWorldStore } from '../state/useWorldStore';
import { Timestamp } from 'firebase/firestore';

interface GlobalWorldSyncState {
  isConnected: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  error: string | null;
  isUpdatingFromFirestore: boolean;
}

export function useGlobalWorldSync() {
  const [syncState, setSyncState] = useState<GlobalWorldSyncState>({
    isConnected: false,
    isSyncing: false,
    lastSyncTime: null,
    error: null,
    isUpdatingFromFirestore: false
  });

  const unsubscribeRef = useRef<(() => void) | null>(null);
  const isUpdatingFromFirestoreRef = useRef<boolean>(false);
  const lastSyncRef = useRef<number>(0);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializingRef = useRef<boolean>(false);

  const { 
    setGlobalStateFromFirestore,
    grids,
    activeGridId,
    currentGridCoordinates
  } = useWorldStore();

  // Iniciar sincronización automática con el mundo global
  const startGlobalSync = useCallback(() => {
    try {
      setSyncState(prev => ({ ...prev, isSyncing: true, error: null }));
      
      // Suscribirse a cambios en tiempo real del mundo global
      const unsubscribe = firebaseService.subscribeToGlobalWorld((state: GlobalWorldDoc | null) => {
        if (state && !isUpdatingFromFirestoreRef.current) {
          // console.log('Recibiendo actualización del mundo global:', state);
          
          // Marcar que estamos actualizando desde Firestore
          isUpdatingFromFirestoreRef.current = true;
          setSyncState(prev => ({ ...prev, isUpdatingFromFirestore: true }));
          
          // Actualizar el estado local con los datos de Firestore
          setGlobalStateFromFirestore(state);
          
          // Resetear la bandera después de un pequeño delay
          setTimeout(() => {
            isUpdatingFromFirestoreRef.current = false;
            setSyncState(prev => ({ ...prev, isUpdatingFromFirestore: false }));
          }, 25); // Reducido de 50ms a 25ms
          
          setSyncState(prev => ({
            ...prev,
            isConnected: true,
            isSyncing: false,
            lastSyncTime: new Date(),
            error: null
          }));
        }
      });
      
      unsubscribeRef.current = unsubscribe;
      
      setSyncState(prev => ({
        ...prev,
        isConnected: true,
        isSyncing: false,
        lastSyncTime: new Date()
      }));
      
    } catch (error) {
      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }));
    }
  }, [setGlobalStateFromFirestore]);

  // Detener sincronización automática
  const stopGlobalSync = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
      
      setSyncState(prev => ({
        ...prev,
        isConnected: false,
        isSyncing: false
      }));
    }
  }, []);

  // Función para sincronizar cambios locales con Firestore (con debounce)
  const syncLocalChangesToFirestore = useCallback(async () => {
    if (isUpdatingFromFirestoreRef.current || isInitializingRef.current) {
      console.log('Ignorando sincronización: actualizando desde Firestore o inicializando');
      return;
    }

    const now = Date.now();
    if (now - lastSyncRef.current < 300) { // Debounce de 300ms
      return;
    }

    try {
      setSyncState(prev => ({ ...prev, isSyncing: true, error: null }));
      
      // Obtener datos de la cuadrícula global
      if (!grids) {
        console.log('Grids no está disponible');
        return;
      }
      
      const globalGrid = grids.get('global-world');
      if (!globalGrid) {
        console.log('No hay cuadrícula global para sincronizar');
        return;
      }
      
      // Crear el estado del mundo global
      const globalWorldState: GlobalWorldDoc = {
        id: 'main',
        objects: globalGrid.objects || [],
        mobileObjects: globalGrid.mobileObjects || [],
        effectZones: globalGrid.effectZones || [],
        activeGridId: activeGridId,
        currentGridCoordinates: currentGridCoordinates || [0, 0, 0],
        createdAt: Timestamp.now(), // Se manejará en Firebase
        updatedAt: Timestamp.now()  // Se manejará en Firebase
      };

      // Guardar el estado completo en Firestore
      await firebaseService.saveGlobalWorldState(globalWorldState);
      
      lastSyncRef.current = now;
      
      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncTime: new Date()
      }));
      
      // console.log('Estado local sincronizado con Firestore');
      
    } catch (error) {
      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        error: error instanceof Error ? error.message : 'Error de sincronización'
      }));
      console.error('Error al sincronizar con Firestore:', error);
    }
  }, [grids, activeGridId, currentGridCoordinates]);

  // Función con debounce para sincronizar cambios
  const debouncedSync = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      syncLocalChangesToFirestore();
    }, 500); // Debounce de 500ms
  }, [syncLocalChangesToFirestore]); // Incluir syncLocalChangesToFirestore en las dependencias

  // Efecto para iniciar la sincronización automática
  useEffect(() => {
    startGlobalSync();

    return () => {
      stopGlobalSync();
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [startGlobalSync, stopGlobalSync]);

  // Efecto para sincronizar cambios locales automáticamente (con debounce)
  useEffect(() => {
    if (!syncState.isConnected || isUpdatingFromFirestoreRef.current || isInitializingRef.current) {
      return;
    }

    // Solo sincronizar si hay una cuadrícula global
    if (!grids) {
      return;
    }
    
    const globalGrid = grids.get('global-world');
    if (!globalGrid) {
      return;
    }

    // Solo sincronizar si estamos en el mundo global
    if (activeGridId !== 'global-world') {
      return;
    }

    debouncedSync();

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [grids, activeGridId, currentGridCoordinates, syncState.isConnected, debouncedSync]);

  // Función para sincronizar manualmente
  const syncNow = useCallback(async () => {
    await syncLocalChangesToFirestore();
  }, [syncLocalChangesToFirestore]);

  // Función para cargar el estado inicial del mundo global
  const loadInitialGlobalState = useCallback(async () => {
    if (isInitializingRef.current) return;
    
    try {
      isInitializingRef.current = true;
      setSyncState(prev => ({ ...prev, isSyncing: true, error: null }));
      
      const globalState = await firebaseService.loadGlobalWorldState();
      
      if (globalState) {
        setGlobalStateFromFirestore(globalState);
        // console.log('Estado inicial del mundo global cargado:', globalState);
      } else {
        console.log('No hay estado inicial del mundo global, creando uno vacío');
        // Crear un estado inicial vacío
        const emptyState: GlobalWorldDoc = {
          id: 'main',
          objects: [],
          mobileObjects: [],
          effectZones: [],
          activeGridId: null,
          currentGridCoordinates: [0, 0, 0],
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };
        
        await firebaseService.saveGlobalWorldState(emptyState);
        setGlobalStateFromFirestore(emptyState);
      }
      
      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncTime: new Date()
      }));
      
    } catch (error) {
      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        error: error instanceof Error ? error.message : 'Error al cargar estado inicial'
      }));
      console.error('Error al cargar estado inicial:', error);
    } finally {
      isInitializingRef.current = false;
    }
  }, [setGlobalStateFromFirestore]);

  return {
    ...syncState,
    startGlobalSync,
    stopGlobalSync,
    syncNow,
    loadInitialGlobalState
  };
}
