import { useEffect, useRef, useState, useCallback } from 'react';
import { persistenceService } from '../lib/persistenceService';
import { useWorldStore } from '../state/useWorldStore';

interface RealtimeSyncState {
  isConnected: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  error: string | null;
}

export function useRealtimeSync(projectId: string | null) {
  const [syncState, setSyncState] = useState<RealtimeSyncState>({
    isConnected: false,
    isSyncing: false,
    lastSyncTime: null,
    error: null
  });

  const unsubscribeRef = useRef<(() => void) | null>(null);
  const { } = useWorldStore();
  const lastSyncRef = useRef<number>(0);
  const isUpdatingFromFirebaseRef = useRef<boolean>(false);

  // Iniciar sincronización automática
  const startSync = useCallback(() => {
    if (!projectId) return;

    try {
      setSyncState(prev => ({ ...prev, isSyncing: true, error: null }));
      
      const unsubscribe = persistenceService.startAutoSync(projectId);
      unsubscribeRef.current = unsubscribe;
      
      setSyncState(prev => ({
        ...prev,
        isConnected: true,
        isSyncing: false,
        lastSyncTime: new Date()
      }));
      
      console.log('✅ Sincronización en tiempo real iniciada');
    } catch (error) {
      console.error('❌ Error al iniciar sincronización:', error);
      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }));
    }
  }, [projectId]);

  // Detener sincronización automática
  const stopSync = () => {
    if (unsubscribeRef.current) {
      persistenceService.stopAutoSync(unsubscribeRef.current);
      unsubscribeRef.current = null;
      
      setSyncState(prev => ({
        ...prev,
        isConnected: false,
        isSyncing: false
      }));
      
      console.log('🛑 Sincronización en tiempo real detenida');
    }
  };

  // Sincronizar cambios locales con Firebase
  const syncChanges = useCallback(async () => {
    if (!projectId || isUpdatingFromFirebaseRef.current) return;

    const now = Date.now();
    if (now - lastSyncRef.current < 5000) { // Evitar sincronizaciones muy frecuentes
      console.log('⏳ Sincronización omitida - muy reciente');
      return;
    }

    try {
      setSyncState(prev => ({ ...prev, isSyncing: true, error: null }));
      
      await persistenceService.updateProject(projectId);
      lastSyncRef.current = now;
      
      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncTime: new Date()
      }));
      
      console.log('📤 Cambios sincronizados con Firebase');
    } catch (error) {
      console.error('❌ Error al sincronizar cambios:', error);
      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        error: error instanceof Error ? error.message : 'Error de sincronización'
      }));
    }
  }, [projectId]);

  // Efecto para manejar la sincronización automática
  useEffect(() => {
    if (projectId) {
      startSync();
    }

    return () => {
      stopSync();
    };
  }, [projectId, startSync]);

  // Efecto para sincronizar cambios locales automáticamente
  // TEMPORALMENTE DESHABILITADO para evitar bucles infinitos
  // useEffect(() => {
  //   if (!syncState.isConnected || !projectId || isUpdatingFromFirebaseRef.current) return;

  //   // Debounce para evitar demasiadas actualizaciones
  //   const timeoutId = setTimeout(() => {
  //     syncChanges();
  //   }, 5000); // Aumentar a 5 segundos para evitar bucles

  //   return () => clearTimeout(timeoutId);
  // }, [grids, activeGridId, syncState.isConnected, projectId, syncChanges]);

  return {
    ...syncState,
    startSync,
    stopSync,
    syncChanges
  };
}
