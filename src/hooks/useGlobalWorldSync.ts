import { useEffect, useRef, useState } from 'react';
import { firebaseService, type GlobalWorldDoc } from '../lib/firebaseService';
import { useWorldStore } from '../state/useWorldStore';

/**
 * Hook para sincronización en tiempo real del mundo global
 * Maneja la conexión bidireccional entre el estado local y Firestore
 */
export function useGlobalWorldSync() {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  
  const isUpdatingFromFirestoreRef = useRef(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const previousStateRef = useRef<GlobalWorldDoc | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const updateThrottleDelay = 100; // ms
  
  const {
    setGlobalStateFromFirestore,
    setIsUpdatingFromFirestore,
    globalWorldConnected,
    updateGlobalSoundObject,
    updateGlobalMobileObject,
    updateGlobalEffectZone
  } = useWorldStore();

  // Función helper para detectar cambios específicos en objetos
  const detectAndProcessChanges = (newState: GlobalWorldDoc, previousState: GlobalWorldDoc | null) => {
    if (!previousState) {
      // Primera carga, no hay cambios específicos que procesar
      console.log('🔍 Primera carga - no hay estado anterior para comparar');
      return;
    }

    console.log('🔍 Detectando cambios específicos en objetos...');
    console.log('📊 Estado anterior:', {
      objects: previousState.objects?.length || 0,
      mobileObjects: previousState.mobileObjects?.length || 0,
      effectZones: previousState.effectZones?.length || 0
    });
    console.log('📊 Estado nuevo:', {
      objects: newState.objects?.length || 0,
      mobileObjects: newState.mobileObjects?.length || 0,
      effectZones: newState.effectZones?.length || 0
    });

    // Función helper para comparar objetos de manera más robusta
    const hasSignificantChange = (prev: any, curr: any, fields: string[]): boolean => {
      for (const field of fields) {
        if (field === 'audioParams') {
          // Comparación más específica para audioParams
          const prevParams = prev[field];
          const currParams = curr[field];
          if (!prevParams || !currParams) return true;
          
          // Comparar todos los campos numéricos de audioParams
          const numericFields = [
            'volume', 'pitch', 'detune', 'frequency', 'harmonicity', 'modulationIndex',
            'vibratoAmount', 'vibratoRate', 'resonance', 'octaves', 'duration',
            'ampAttack', 'ampDecay', 'ampSustain', 'ampRelease',
            'filterAttack', 'filterDecay', 'filterSustain', 'filterRelease',
            'filterBaseFreq', 'filterOctaves', 'filterQ', 'attack', 'decay', 'sustain',
            'release', 'attackNoise', 'dampening', 'polyphony', 'modulationWaveform'
          ];
          
          for (const numericField of numericFields) {
            if (typeof prevParams[numericField] === 'number' && typeof currParams[numericField] === 'number') {
              if (Math.abs(prevParams[numericField] - currParams[numericField]) > 0.001) {
                return true;
              }
            }
          }
          
          // Comparar campos de string
          const stringFields = ['waveform', 'waveform2', 'modulationWaveform', 'noiseType', 'curve'];
          for (const stringField of stringFields) {
            if (prevParams[stringField] !== currParams[stringField]) {
              return true;
            }
          }
          
          // Comparar arrays
          const arrayFields = ['chord', 'notes'];
          for (const arrayField of arrayFields) {
            const prevArray = prevParams[arrayField];
            const currArray = currParams[arrayField];
            if (Array.isArray(prevArray) && Array.isArray(currArray)) {
              if (prevArray.length !== currArray.length) return true;
              for (let i = 0; i < prevArray.length; i++) {
                if (prevArray[i] !== currArray[i]) return true;
              }
            } else if (prevArray !== currArray) {
              return true;
            }
          }
          
          // Comparar objetos
          const objectFields = ['urls'];
          for (const objectField of objectFields) {
            const prevObj = prevParams[objectField];
            const currObj = currParams[objectField];
            if (typeof prevObj === 'object' && typeof currObj === 'object') {
              const prevKeys = Object.keys(prevObj || {});
              const currKeys = Object.keys(currObj || {});
              if (prevKeys.length !== currKeys.length) return true;
              for (const key of prevKeys) {
                if (prevObj[key] !== currObj[key]) return true;
              }
            } else if (prevObj !== currObj) {
              return true;
            }
          }
        } else if (field === 'position' || field === 'rotation' || field === 'scale') {
          // Comparación para arrays de números
          const prevArray = prev[field];
          const currArray = curr[field];
          if (!prevArray || !currArray || prevArray.length !== currArray.length) return true;
          
          for (let i = 0; i < prevArray.length; i++) {
            if (Math.abs(prevArray[i] - currArray[i]) > 0.001) {
              return true;
            }
          }
        } else if (field === 'mobileParams' || field === 'effectParams') {
          // Comparación para objetos complejos
          const prevObj = prev[field];
          const currObj = curr[field];
          if (!prevObj || !currObj) return true;
          
          // Comparar campos específicos de mobileParams
          if (field === 'mobileParams') {
            const mobileFields = ['movementType', 'radius', 'speed', 'proximityThreshold', 'isActive'];
            for (const mobileField of mobileFields) {
              if (prevObj[mobileField] !== currObj[mobileField]) {
                return true;
              }
            }
            // Comparar arrays numéricos
            const arrayFields = ['centerPosition', 'direction', 'axis'];
            for (const arrayField of arrayFields) {
              const prevArray = prevObj[arrayField];
              const currArray = currObj[arrayField];
              if (!prevArray || !currArray || prevArray.length !== currArray.length) return true;
              
              for (let i = 0; i < prevArray.length; i++) {
                if (Math.abs(prevArray[i] - currArray[i]) > 0.001) {
                  return true;
                }
              }
            }
          }
          
          // Comparar campos específicos de effectParams
          if (field === 'effectParams') {
            const effectFields = ['frequency', 'depth', 'feedback', 'decay', 'wet', 'width'];
            for (const effectField of effectFields) {
              if (Math.abs((prevObj[effectField] || 0) - (currObj[effectField] || 0)) > 0.001) {
                return true;
              }
            }
          }
        } else {
          // Comparación simple para otros campos
          if (prev[field] !== curr[field]) {
            return true;
          }
        }
      }
      return false;
    };

    // Detectar cambios en objetos sonoros
    if (newState.objects && previousState.objects) {
      console.log('🔍 Verificando cambios en objetos sonoros...');
      
      // 1. Detectar objetos nuevos y cambios en objetos existentes
      for (const newObject of newState.objects) {
        const previousObject = previousState.objects.find(obj => obj.id === newObject.id);
        
        if (previousObject) {
          // Verificar cambios específicos con comparación más robusta
          const hasChanges = hasSignificantChange(previousObject, newObject, [
            'audioParams', 'audioEnabled', 'position', 'rotation', 'scale'
          ]);
          
          if (hasChanges) {
            console.log(`🎵 Cambio significativo detectado en objeto ${newObject.id}`);
            
            // Determinar qué campos han cambiado específicamente
            const updates: Partial<Omit<typeof newObject, 'id'>> = {};
            
            if (hasSignificantChange(previousObject, newObject, ['audioParams'])) {
              updates.audioParams = newObject.audioParams;
            }
            if (previousObject.audioEnabled !== newObject.audioEnabled) {
              updates.audioEnabled = newObject.audioEnabled;
            }
            if (hasSignificantChange(previousObject, newObject, ['position'])) {
              updates.position = newObject.position;
            }
            if (hasSignificantChange(previousObject, newObject, ['rotation'])) {
              updates.rotation = newObject.rotation;
            }
            if (hasSignificantChange(previousObject, newObject, ['scale'])) {
              updates.scale = newObject.scale;
            }

            // Solo actualizar si hay cambios reales
            if (Object.keys(updates).length > 0) {
              updateGlobalSoundObject(newObject.id, updates);
            }
          } else {
            console.log(`ℹ️ No hay cambios significativos en objeto ${newObject.id}`);
          }
        } else {
          console.log(`🆕 Nuevo objeto detectado: ${newObject.id}`);
        }
      }
      
      // 2. Detectar objetos eliminados
      for (const previousObject of previousState.objects) {
        const stillExists = newState.objects.find(obj => obj.id === previousObject.id);
        if (!stillExists) {
          console.log(`🗑️ Objeto eliminado detectado: ${previousObject.id}`);
          
          // Importar removeGlobalSoundObject desde useWorldStore
          const { removeGlobalSoundObject } = useWorldStore.getState();
          removeGlobalSoundObject(previousObject.id);
        }
      }
    } else {
      console.log('⚠️ No se pueden comparar objetos - arrays faltantes:', {
        newObjects: !!newState.objects,
        previousObjects: !!previousState.objects
      });
    }

    // Detectar cambios en objetos móviles
    if (newState.mobileObjects && previousState.mobileObjects) {
      for (const newMobileObject of newState.mobileObjects) {
        const previousMobileObject = previousState.mobileObjects.find(obj => obj.id === newMobileObject.id);
        
        if (previousMobileObject) {
          const hasChanges = hasSignificantChange(previousMobileObject, newMobileObject, [
            'position', 'rotation', 'scale', 'mobileParams'
          ]);
          
          if (hasChanges) {
            console.log(`🎵 Cambio significativo detectado en objeto móvil ${newMobileObject.id}`);
            
            const updates: Partial<Omit<typeof newMobileObject, 'id'>> = {};
            
            if (hasSignificantChange(previousMobileObject, newMobileObject, ['position'])) {
              updates.position = newMobileObject.position;
            }
            if (hasSignificantChange(previousMobileObject, newMobileObject, ['rotation'])) {
              updates.rotation = newMobileObject.rotation;
            }
            if (hasSignificantChange(previousMobileObject, newMobileObject, ['scale'])) {
              updates.scale = newMobileObject.scale;
            }
            if (hasSignificantChange(previousMobileObject, newMobileObject, ['mobileParams'])) {
              updates.mobileParams = newMobileObject.mobileParams;
            }
            
            if (Object.keys(updates).length > 0) {
              updateGlobalMobileObject(newMobileObject.id, updates);
            }
          }
        }
      }
    }

    // Detectar cambios en zonas de efectos
    if (newState.effectZones && previousState.effectZones) {
      for (const newEffectZone of newState.effectZones) {
        const previousEffectZone = previousState.effectZones.find(zone => zone.id === newEffectZone.id);
        
        if (previousEffectZone) {
          const hasChanges = hasSignificantChange(previousEffectZone, newEffectZone, [
            'effectParams', 'position', 'rotation', 'scale'
          ]);
          
          if (hasChanges) {
            console.log(`🎵 Cambio significativo detectado en zona de efecto ${newEffectZone.id}`);
            
            const updates: Partial<Omit<typeof newEffectZone, 'id'>> = {};
            
            if (hasSignificantChange(previousEffectZone, newEffectZone, ['effectParams'])) {
              updates.effectParams = newEffectZone.effectParams;
            }
            if (hasSignificantChange(previousEffectZone, newEffectZone, ['position'])) {
              updates.position = newEffectZone.position;
            }
            if (hasSignificantChange(previousEffectZone, newEffectZone, ['rotation'])) {
              updates.rotation = newEffectZone.rotation;
            }
            if (hasSignificantChange(previousEffectZone, newEffectZone, ['scale'])) {
              updates.scale = newEffectZone.scale;
            }
            
            if (Object.keys(updates).length > 0) {
              updateGlobalEffectZone(newEffectZone.id, updates);
            }
          }
        }
      }
    }

    console.log('✅ Procesamiento de cambios específicos completado');
  };

  // Inicializar el mundo global y establecer suscripción
  useEffect(() => {
    let mounted = true;

    const initializeGlobalWorld = async () => {
      try {
        setIsInitializing(true);
        setError(null);

        // REACTIVADO - La cuota se ha liberado
        console.log('✅ Reactivando sincronización global');
        // setIsConnected(false);
        // setError('Sincronización global deshabilitada - Cuota de Firestore excedida');
        // return;

        // Inicializar el estado del mundo global si no existe
        await firebaseService.initializeGlobalWorldState();
        
        if (!mounted) return;

        // Establecer suscripción en tiempo real
        const unsubscribe = firebaseService.subscribeToGlobalWorld((state: GlobalWorldDoc | null) => {
          if (!mounted) return;

          if (state) {
            const now = Date.now();
            
            // Throttle para prevenir actualizaciones excesivas
            if (now - lastUpdateTimeRef.current < updateThrottleDelay) {
              console.log('⏸️ Actualización throttled - demasiado frecuente');
              return;
            }
            
            lastUpdateTimeRef.current = now;
            
            console.log('📡 Recibiendo actualización desde Firestore');
            console.log('📊 Estado recibido:', {
              objects: state.objects?.length || 0,
              mobileObjects: state.mobileObjects?.length || 0,
              effectZones: state.effectZones?.length || 0,
              timestamp: new Date().toISOString()
            });
            
            // Detectar y procesar cambios específicos antes de actualizar el estado completo
            detectAndProcessChanges(state, previousStateRef.current);
            
            // Actualizar el estado de referencia anterior
            previousStateRef.current = state;
            
            // Establecer bandera para prevenir bucles bidireccionales
            isUpdatingFromFirestoreRef.current = true;
            setIsUpdatingFromFirestore(true);
            
            // Actualizar el estado local desde Firestore
            setGlobalStateFromFirestore(state);
            
            // Marcar como conectado
            setIsConnected(true);
            
            // Resetear bandera después de un breve delay
            setTimeout(() => {
              if (mounted) {
                isUpdatingFromFirestoreRef.current = false;
                setIsUpdatingFromFirestore(false);
              }
            }, 100); // Aumentado el delay para mayor estabilidad
          } else {
            // No hay estado en Firestore, crear estado inicial
            console.warn('No global world state found in Firestore');
            setIsConnected(false);
          }
        });

        unsubscribeRef.current = unsubscribe;

      } catch (err) {
        console.error('Error initializing global world sync:', err);
        if (mounted) {
          // Manejo específico para errores de cuota
          if (err instanceof Error && err.message.includes('Quota exceeded')) {
            setError('Cuota de Firestore excedida. Usando modo local. Verifica tu plan de Firebase.');
          } else {
            setError(err instanceof Error ? err.message : 'Failed to initialize global world sync');
          }
          setIsConnected(false);
        }
      } finally {
        if (mounted) {
          setIsInitializing(false);
        }
      }
    };

    initializeGlobalWorld();

    // Cleanup function
    return () => {
      mounted = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [setGlobalStateFromFirestore, setIsUpdatingFromFirestore]);

  // Función para verificar si se está actualizando desde Firestore
  const isUpdatingFromFirestore = () => {
    return isUpdatingFromFirestoreRef.current;
  };

  // Función para reconectar manualmente
  const reconnect = async () => {
    try {
      setError(null);
      setIsInitializing(true);
      
      // Limpiar suscripción anterior
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      
      // Reinicializar
      await firebaseService.initializeGlobalWorldState();
      
      // Establecer nueva suscripción
      const unsubscribe = firebaseService.subscribeToGlobalWorld((state: GlobalWorldDoc | null) => {
        if (state) {
          console.log('📡 Reconexión: Recibiendo actualización desde Firestore');
          
          // Detectar y procesar cambios específicos
          detectAndProcessChanges(state, previousStateRef.current);
          previousStateRef.current = state;
          
          isUpdatingFromFirestoreRef.current = true;
          setIsUpdatingFromFirestore(true);
          
          setGlobalStateFromFirestore(state);
          setIsConnected(true);
          
          setTimeout(() => {
            isUpdatingFromFirestoreRef.current = false;
            setIsUpdatingFromFirestore(false);
          }, 50);
        } else {
          setIsConnected(false);
        }
      });

      unsubscribeRef.current = unsubscribe;
      
    } catch (err) {
      console.error('Error reconnecting to global world:', err);
      setError(err instanceof Error ? err.message : 'Failed to reconnect');
      setIsConnected(false);
    } finally {
      setIsInitializing(false);
    }
  };

  // Función para desconectar
  const disconnect = () => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    setIsConnected(false);
    setIsUpdatingFromFirestore(false);
  };

  // Función para obtener el estado actual del mundo global
  const getGlobalWorldState = async (): Promise<GlobalWorldDoc | null> => {
    try {
      return await firebaseService.getGlobalWorldState();
    } catch (err) {
      console.error('Error getting global world state:', err);
      setError(err instanceof Error ? err.message : 'Failed to get global world state');
      return null;
    }
  };

  // Función para sincronizar cuadrículas con el mundo global
  const syncGridsToGlobal = async () => {
    try {
      const state = useWorldStore.getState();
      const gridsArray = Array.from(state.grids.values());
      
      await firebaseService.updateGlobalGrids(gridsArray);
      
      if (state.activeGridId) {
        await firebaseService.updateGlobalActiveGrid(state.activeGridId);
      }
    } catch (err) {
      console.error('Error syncing grids to global:', err);
      setError(err instanceof Error ? err.message : 'Failed to sync grids');
    }
  };

  return {
    // Estado
    isConnected,
    error,
    isInitializing,
    globalWorldConnected,
    
    // Funciones
    isUpdatingFromFirestore,
    reconnect,
    disconnect,
    getGlobalWorldState,
    syncGridsToGlobal,
    
    // Funciones de utilidad
    clearError: () => setError(null),
  };
}

/**
 * Hook simplificado para verificar el estado de conexión
 */
export function useGlobalWorldStatus() {
  const { globalWorldConnected, isUpdatingFromFirestore } = useWorldStore();
  
  return {
    isConnected: globalWorldConnected,
    isUpdating: isUpdatingFromFirestore,
  };
}

/**
 * Hook para obtener funciones de sincronización sin estado
 */
export function useGlobalWorldActions() {
  const {
    addGlobalSoundObject,
    updateGlobalSoundObject,
    removeGlobalSoundObject,
    addGlobalEffectZone,
    updateGlobalEffectZone,
    removeGlobalEffectZone,
    addGlobalMobileObject,
    updateGlobalMobileObject,
    removeGlobalMobileObject,
  } = useWorldStore();

  return {
    // Acciones para objetos sonoros
    addGlobalSoundObject,
    updateGlobalSoundObject,
    removeGlobalSoundObject,
    
    // Acciones para zonas de efectos
    addGlobalEffectZone,
    updateGlobalEffectZone,
    removeGlobalEffectZone,
    
    // Acciones para objetos móviles
    addGlobalMobileObject,
    updateGlobalMobileObject,
    removeGlobalMobileObject,
  };
}
