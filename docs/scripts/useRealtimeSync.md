# Documentación: `src/hooks/useRealtimeSync.ts`

## Propósito
Hook personalizado para gestionar la sincronización en tiempo real entre el estado local de la aplicación y Firebase. Maneja la persistencia automática de cambios y la sincronización bidireccional de datos de proyectos.

## Funcionalidades Principales

### 1. Sincronización Automática
- Inicia y detiene sincronización automática con Firebase
- Maneja la conexión y desconexión del servicio
- Persistencia automática de cambios locales

### 2. Gestión de Estado de Sincronización
- Rastrea el estado de conexión (conectado/desconectado)
- Monitorea el estado de sincronización (sincronizando/idle)
- Registra tiempo de última sincronización y errores

### 3. Prevención de Bucles Infinitos
- Implementa debouncing para evitar sincronizaciones excesivas
- Controla actualizaciones desde Firebase vs. locales
- Maneja conflictos de sincronización

## Estructura del Código

```typescript
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

  // ... lógica de sincronización
}
```

## Dependencias

### Externas
- `react`: Para hooks de estado y efectos
- `persistenceService`: Servicio de persistencia con Firebase

### Internas
- `useWorldStore`: Para acceso al estado de grids y objetos

## Parámetros de Entrada

### `projectId: string | null`
- ID del proyecto a sincronizar
- Si es null, no se inicia la sincronización
- Se usa para identificar el documento en Firebase

## Estados de Sincronización

### Estado Inicial
```typescript
const [syncState, setSyncState] = useState<RealtimeSyncState>({
  isConnected: false,      // No conectado inicialmente
  isSyncing: false,        // No sincronizando inicialmente
  lastSyncTime: null,      // Sin tiempo de sincronización
  error: null              // Sin errores
});
```

### Estados Posibles
- **`isConnected`**: true si está conectado a Firebase
- **`isSyncing`**: true si está sincronizando datos
- **`lastSyncTime`**: Timestamp de la última sincronización exitosa
- **`error`**: Mensaje de error si la sincronización falla

## Funciones Principales

### 1. Iniciar Sincronización
```typescript
const startSync = () => {
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
    setSyncState(prev => ({
      ...prev,
      isSyncing: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }));
  }
};
```

### 2. Detener Sincronización
```typescript
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
```

### 3. Sincronizar Cambios Locales
```typescript
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
    setSyncState(prev => ({
      ...prev,
      isSyncing: false,
      error: error instanceof Error ? error.message : 'Error de sincronización'
    }));
  }
}, [projectId]);
```

## Gestión de Referencias

### Referencias de Control
```typescript
const unsubscribeRef = useRef<(() => void) | null>(null);
const lastSyncRef = useRef<number>(0);
const isUpdatingFromFirebaseRef = useRef<boolean>(false);
```

### Propósito de las Referencias
- **`unsubscribeRef`**: Guarda la función de desuscripción de Firebase
- **`lastSyncRef`**: Timestamp de la última sincronización para debouncing
- **`isUpdatingFromFirebaseRef`**: Flag para evitar bucles infinitos

## Prevención de Bucles Infinitos

### Debouncing
```typescript
const now = Date.now();
if (now - lastSyncRef.current < 5000) { // 5 segundos
  console.log('⏳ Sincronización omitida - muy reciente');
  return;
}
```

### Control de Origen de Actualización
```typescript
if (!projectId || isUpdatingFromFirebaseRef.current) return;
```

### Sincronización Automática Deshabilitada
```typescript
// TEMPORALMENTE DESHABILITADO para evitar bucles infinitos
// useEffect(() => {
//   if (!syncState.isConnected || !projectId || isUpdatingFromFirebaseRef.current) return;
//
//   const timeoutId = setTimeout(() => {
//     syncChanges();
//   }, 5000);
//
//   return () => clearTimeout(timeoutId);
// }, [grids, activeGridId, syncState.isConnected, projectId, syncChanges]);
```

## Uso en la Aplicación

### Importación
```typescript
import { useRealtimeSync } from '../hooks/useRealtimeSync';
```

### Implementación Básica
```typescript
function ProjectEditor({ projectId }) {
  const syncState = useRealtimeSync(projectId);
  
  return (
    <div>
      <div>Estado: {syncState.isConnected ? 'Conectado' : 'Desconectado'}</div>
      <div>Sincronizando: {syncState.isSyncing ? 'Sí' : 'No'}</div>
      {syncState.error && <div>Error: {syncState.error}</div>}
    </div>
  );
}
```

### Integración con Componentes
```typescript
function ProjectManager() {
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const { 
    isConnected, 
    isSyncing, 
    lastSyncTime, 
    error,
    startSync,
    stopSync,
    syncChanges 
  } = useRealtimeSync(currentProjectId);
  
  const handleProjectChange = (newProjectId) => {
    setCurrentProjectId(newProjectId);
  };
  
  const handleManualSync = () => {
    syncChanges();
  };
  
  return (
    <div>
      <ProjectSelector onChange={handleProjectChange} />
      <SyncStatus 
        isConnected={isConnected}
        isSyncing={isSyncing}
        lastSyncTime={lastSyncTime}
        error={error}
      />
      <button onClick={handleManualSync} disabled={isSyncing}>
        Sincronizar Manualmente
      </button>
    </div>
  );
}
```

## Gestión de Ciclo de Vida

### Efectos de Montaje/Desmontaje
```typescript
useEffect(() => {
  if (projectId) {
    startSync();
  }

  return () => {
    stopSync();
  };
}, [projectId]);
```

### Limpieza Automática
- Detiene sincronización al cambiar projectId
- Limpia recursos al desmontar componente
- Previene memory leaks

## Información de Debug

### Logging de Estados
```typescript
console.log('✅ Sincronización en tiempo real iniciada');
console.log('🛑 Sincronización en tiempo real detenida');
console.log('📤 Cambios sincronizados con Firebase');
console.log('⏳ Sincronización omitida - muy reciente');
```

### Información de Estado
- Estado de conexión
- Estado de sincronización
- Tiempo de última sincronización
- Mensajes de error detallados

## Relaciones con Otros Archivos

### Dependencias Directas
- `persistenceService`: Servicio de Firebase para persistencia
- `useWorldStore`: Estado de la aplicación a sincronizar

### Archivos Relacionados
- `firebaseService.ts`: Configuración de Firebase
- `persistenceService.ts`: Lógica de persistencia
- `StoreProvider.tsx`: Provider del estado global

## Consideraciones de Rendimiento

### Optimizaciones Implementadas
1. **Debouncing**: Evita sincronizaciones excesivas
2. **Control de Bucles**: Previene bucles infinitos
3. **Limpieza Automática**: Gestiona recursos correctamente
4. **Estados Condicionales**: Solo sincroniza cuando es necesario

### Mejores Prácticas
- Usar solo una instancia por proyecto
- Manejar cambios de projectId correctamente
- Implementar manejo de errores robusto

## Configuración Avanzada

### Personalización de Debouncing
```typescript
// Modificar intervalo de debouncing
const DEBOUNCE_INTERVAL = 10000; // 10 segundos

if (now - lastSyncRef.current < DEBOUNCE_INTERVAL) {
  return;
}
```

### Manejo de Errores Personalizado
```typescript
const handleSyncError = (error: Error) => {
  // Lógica personalizada de manejo de errores
  console.error('Error de sincronización:', error);
  
  // Notificar al usuario
  showNotification('Error de sincronización', 'error');
  
  // Reintentar después de un delay
  setTimeout(() => {
    syncChanges();
  }, 5000);
};
```

## Troubleshooting

### Problemas Comunes
1. **Bucle infinito**: Verificar que `isUpdatingFromFirebaseRef` funcione
2. **Sincronización excesiva**: Ajustar intervalo de debouncing
3. **Errores de conexión**: Verificar configuración de Firebase

### Soluciones
1. Confirmar que `persistenceService` esté configurado correctamente
2. Verificar que `projectId` sea válido
3. Revisar logs de consola para errores específicos

## Ejemplo de Uso Completo

```typescript
import React, { useState, useEffect } from 'react';
import { useRealtimeSync } from '../hooks/useRealtimeSync';
import { useWorldStore } from '../state/useWorldStore';

function ProjectWorkspace() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const { 
    isConnected, 
    isSyncing, 
    lastSyncTime, 
    error,
    syncChanges 
  } = useRealtimeSync(projectId);
  
  const { grids, activeGridId } = useWorldStore();
  
  // Sincronizar cambios locales manualmente
  const handleSaveProject = async () => {
    if (projectId && !isSyncing) {
      await syncChanges();
    }
  };
  
  // Sincronizar automáticamente en cambios importantes
  useEffect(() => {
    if (isConnected && projectId && !isSyncing) {
      const timeoutId = setTimeout(() => {
        syncChanges();
      }, 10000); // 10 segundos después de cambios
      
      return () => clearTimeout(timeoutId);
    }
  }, [grids, activeGridId, isConnected, projectId, isSyncing]);
  
  return (
    <div className="project-workspace">
      <div className="sync-status">
        <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
        </div>
        
        {isSyncing && (
          <div className="sync-indicator">
            🔄 Sincronizando...
          </div>
        )}
        
        {lastSyncTime && (
          <div className="last-sync">
            Última sincronización: {lastSyncTime.toLocaleTimeString()}
          </div>
        )}
        
        {error && (
          <div className="sync-error">
            ❌ Error: {error}
          </div>
        )}
      </div>
      
      <div className="project-controls">
        <input 
          type="text"
          placeholder="ID del Proyecto"
          value={projectId || ''}
          onChange={(e) => setProjectId(e.target.value || null)}
        />
        
        <button 
          onClick={handleSaveProject}
          disabled={!projectId || isSyncing}
        >
          Guardar Proyecto
        </button>
      </div>
      
      {/* Contenido del proyecto */}
      <div className="project-content">
        {/* Componentes de la aplicación */}
      </div>
    </div>
  );
}
```

## Notas de Desarrollo

### Limitaciones Actuales
- Sincronización automática deshabilitada para evitar bucles
- Debouncing fijo a 5 segundos
- Manejo básico de errores

### Futuras Mejoras
- Implementar sincronización automática segura
- Mejor manejo de conflictos de sincronización
- Indicadores visuales más detallados
- Sincronización offline con queue


