/**
 * Optimizaciones para reducir el uso de cuota en Firestore
 */

import { firebaseService } from './firebaseService';

// Configuración de optimizaciones
const OPTIMIZATIONS = {
  // Reducir frecuencia de escrituras
  WRITE_DEBOUNCE_MS: 500, // Aumentado de 100ms a 500ms
  
  // Límites de objetos por operación
  MAX_OBJECTS_PER_BATCH: 10,
  
  // Compresión de datos
  ENABLE_COMPRESSION: false, // Para futuras implementaciones
  
  // Cache local más agresivo
  LOCAL_CACHE_DURATION_MS: 30000, // 30 segundos
};

// Cache local para reducir lecturas
const localCache = new Map<string, { data: any; timestamp: number }>();

/**
 * Obtiene datos del cache local si están frescos
 */
function getCachedData<T>(key: string): T | null {
  const cached = localCache.get(key);
  if (!cached) return null;
  
  const now = Date.now();
  if (now - cached.timestamp > OPTIMIZATIONS.LOCAL_CACHE_DURATION_MS) {
    localCache.delete(key);
    return null;
  }
  
  return cached.data as T;
}

/**
 * Guarda datos en el cache local
 */
function setCachedData<T>(key: string, data: T): void {
  localCache.set(key, {
    data,
    timestamp: Date.now()
  });
}

/**
 * Versión optimizada para obtener estado del mundo global
 */
export async function getOptimizedGlobalWorldState() {
  const cacheKey = 'globalWorldState';
  
  // Intentar obtener del cache primero
  const cached = getCachedData(cacheKey);
  if (cached) {
    console.log('📦 Usando cache local para estado global');
    return cached;
  }
  
  try {
    // Obtener de Firestore
    const state = await firebaseService.getGlobalWorldState();
    if (state) {
      setCachedData(cacheKey, state);
    }
    return state;
  } catch (error) {
    console.warn('Error obteniendo estado global, usando cache si está disponible:', error);
    return cached;
  }
}

/**
 * Limpia el cache local
 */
export function clearLocalCache(): void {
  localCache.clear();
  console.log('🧹 Cache local limpiado');
}

/**
 * Obtiene estadísticas de uso del cache
 */
export function getCacheStats() {
  const now = Date.now();
  const entries = Array.from(localCache.entries());
  
  const stats = {
    totalEntries: entries.length,
    freshEntries: entries.filter(([, value]) => 
      now - value.timestamp <= OPTIMIZATIONS.LOCAL_CACHE_DURATION_MS
    ).length,
    staleEntries: entries.filter(([, value]) => 
      now - value.timestamp > OPTIMIZATIONS.LOCAL_CACHE_DURATION_MS
    ).length
  };
  
  return stats;
}

/**
 * Configuración de optimizaciones para el desarrollo
 */
export const DEV_OPTIMIZATIONS = {
  // En desarrollo, usar cache más agresivo
  LOCAL_CACHE_DURATION_MS: 60000, // 1 minuto
  
  // Reducir escrituras aún más en desarrollo
  WRITE_DEBOUNCE_MS: 1000, // 1 segundo
  
  // Limitar número de objetos en desarrollo
  MAX_OBJECTS_IN_DEV: 5,
};

/**
 * Aplica optimizaciones para desarrollo
 */
export function applyDevOptimizations() {
  if (process.env.NODE_ENV === 'development') {
    Object.assign(OPTIMIZATIONS, DEV_OPTIMIZATIONS);
    console.log('🔧 Optimizaciones de desarrollo aplicadas');
  }
}

// Aplicar optimizaciones automáticamente
applyDevOptimizations();



