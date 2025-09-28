# Documentación de Firebase - Solomon House

## Índice
1. [Introducción](#introducción)
2. [Configuración](#configuración)
3. [Arquitectura](#arquitectura)
4. [Servicios](#servicios)
5. [Modelos de Datos](#modelos-de-datos)
6. [Operaciones CRUD](#operaciones-crud)
7. [Sincronización en Tiempo Real](#sincronización-en-tiempo-real)
8. [Interfaz de Usuario](#interfaz-de-usuario)
9. [Flujo de Datos](#flujo-de-datos)
10. [Manejo de Errores](#manejo-de-errores)
11. [Mejores Prácticas](#mejores-prácticas)

## Introducción

Firebase se utiliza en Solomon House como sistema de persistencia y sincronización en tiempo real para proyectos de audio espacial. El sistema permite guardar, cargar y sincronizar proyectos completos que incluyen cuadrículas 3D con objetos sonoros, objetos móviles y zonas de efectos.

### Servicios Utilizados
- **Firestore**: Base de datos NoSQL para almacenar proyectos y cuadrículas
- **Auth**: Autenticación de usuarios (configurado pero no implementado completamente)
- **Analytics**: Métricas de uso de la aplicación

## Configuración

### Archivo de Configuración (`src/lib/firebase.ts`)

```typescript
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBxbFqLXt5ir-Vnbl0H_tX-RwiV1v5hTpE",
  authDomain: "solomonhouse-5f528.firebaseapp.com",
  projectId: "solomonhouse-5f528",
  storageBucket: "solomonhouse-5f528.firebasestorage.app",
  messagingSenderId: "479726159678",
  appId: "1:479726159678:web:8ca0239ef048be1b644e6f",
  measurementId: "G-JKEHV8PDEP"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
```

### Dependencias
- **firebase**: `^12.3.0` - SDK principal de Firebase

## Arquitectura

El sistema Firebase está organizado en tres capas principales:

```
┌─────────────────────────────────────┐
│           UI Layer                  │
│    (PersistencePanel.tsx)           │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│        Service Layer                 │
│  (PersistenceService.ts)            │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│       Firebase Layer                 │
│  (FirebaseService.ts + firebase.ts)  │
└─────────────────────────────────────┘
```

### Patrón Singleton
Tanto `FirebaseService` como `PersistenceService` implementan el patrón Singleton para garantizar una única instancia en toda la aplicación.

## Servicios

### 1. FirebaseService (`src/lib/firebaseService.ts`)

Servicio de bajo nivel que maneja directamente las operaciones de Firestore.

#### Características:
- **Singleton**: Una sola instancia en toda la aplicación
- **Colecciones**: `projects` y `grids`
- **Operaciones**: CRUD completo para proyectos y cuadrículas
- **Tiempo Real**: Suscripciones con `onSnapshot`

#### Métodos Principales:

```typescript
// Proyectos
async saveProject(projectData): Promise<string>
async updateProject(projectId, projectData): Promise<void>
async loadProject(projectId): Promise<FirebaseProject | null>
async loadAllProjects(): Promise<FirebaseProject[]>
async deleteProject(projectId): Promise<void>

// Cuadrículas
async saveGrid(gridData): Promise<string>
async updateGrid(gridId, gridData): Promise<void>
async loadGrid(gridId): Promise<FirebaseGrid | null>
async deleteGrid(gridId): Promise<void>

// Sincronización en tiempo real
subscribeToProject(projectId, callback): () => void
subscribeToGrids(callback): () => void
```

### 2. PersistenceService (`src/lib/persistenceService.ts`)

Servicio de alto nivel que integra Firebase con el store de Zustand.

#### Características:
- **Conversión de Datos**: Transforma entre formatos del store y Firebase
- **Sincronización Automática**: Mantiene el estado sincronizado
- **Gestión de Proyectos**: Operaciones completas de proyectos

#### Funciones de Conversión:

```typescript
// Convierte Grid del store a FirebaseGrid
function gridToFirebase(grid: Grid): Omit<FirebaseGrid, 'createdAt' | 'updatedAt'>

// Convierte FirebaseGrid a Grid del store
function firebaseToGrid(firebaseGrid: FirebaseGrid): Grid
```

#### Métodos Principales:

```typescript
// Gestión de proyectos
async saveCurrentWorldAsProject(name, description): Promise<string>
async loadProject(projectId): Promise<void>
async loadAllProjects(): Promise<FirebaseProject[]>
async updateProject(projectId, name?, description?): Promise<void>
async deleteProject(projectId): Promise<void>

// Sincronización automática
startAutoSync(projectId): () => void
stopAutoSync(unsubscribe): void
```

### 3. Hook useRealtimeSync (`src/hooks/useRealtimeSync.ts`)

Hook personalizado que gestiona la sincronización en tiempo real.

#### Estado del Hook:

```typescript
interface RealtimeSyncState {
  isConnected: boolean;      // Estado de conexión
  isSyncing: boolean;       // Estado de sincronización
  lastSyncTime: Date | null; // Última sincronización
  error: string | null;     // Errores
}
```

#### Funcionalidades:
- **Conexión Automática**: Se conecta cuando hay un projectId
- **Desconexión Limpia**: Limpia recursos al desmontar
- **Manejo de Errores**: Captura y reporta errores
- **Debounce**: Evita sincronizaciones excesivas

## Modelos de Datos

### FirebaseGrid

```typescript
interface FirebaseGrid {
  id: string;
  coordinates: [number, number, number];
  position: [number, number, number];
  objects: SoundObject[];
  mobileObjects: MobileObject[];
  effectZones: EffectZone[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### FirebaseProject

```typescript
interface FirebaseProject {
  id: string;
  name: string;
  description?: string;
  grids: FirebaseGrid[];
  activeGridId: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Estructura de Firestore

```
/projects/{projectId}
  ├── name: string
  ├── description: string
  ├── grids: FirebaseGrid[]
  ├── activeGridId: string
  ├── createdAt: Timestamp
  └── updatedAt: Timestamp

/grids/{gridId}
  ├── coordinates: [number, number, number]
  ├── position: [number, number, number]
  ├── objects: SoundObject[]
  ├── mobileObjects: MobileObject[]
  ├── effectZones: EffectZone[]
  ├── createdAt: Timestamp
  └── updatedAt: Timestamp
```

## Operaciones CRUD

### Crear (Create)

```typescript
// Crear proyecto
const projectId = await persistenceService.saveCurrentWorldAsProject(
  "Mi Proyecto",
  "Descripción del proyecto"
);

// Crear cuadrícula
const gridId = await persistenceService.saveGrid(gridId);
```

### Leer (Read)

```typescript
// Cargar proyecto
await persistenceService.loadProject(projectId);

// Cargar todos los proyectos
const projects = await persistenceService.loadAllProjects();

// Cargar cuadrícula
await persistenceService.loadGrid(gridId);
```

### Actualizar (Update)

```typescript
// Actualizar proyecto
await persistenceService.updateProject(
  projectId,
  "Nuevo Nombre",
  "Nueva Descripción"
);
```

### Eliminar (Delete)

```typescript
// Eliminar proyecto
await persistenceService.deleteProject(projectId);
```

## Sincronización en Tiempo Real

### Flujo de Sincronización

1. **Inicio**: Se establece conexión con `subscribeToProject`
2. **Escucha**: Firestore notifica cambios automáticamente
3. **Conversión**: Los datos se convierten del formato Firebase al store
4. **Actualización**: El store se actualiza con los nuevos datos
5. **UI**: La interfaz se actualiza automáticamente

### Prevención de Bucles Infinitos

El sistema implementa varias estrategias para evitar bucles:

```typescript
// Bandera para evitar actualizaciones circulares
const isUpdatingFromFirebaseRef = useRef<boolean>(false);

// Debounce para limitar frecuencia de sincronización
if (now - lastSyncRef.current < 5000) {
  return;
}

// Verificación de cambios reales
const hasChanges = currentGrids.size !== grids.size || 
  // ... verificación de contenido
```

### Estado de Conexión

```typescript
// Indicador visual de conexión
<div className={`w-1.5 h-1.5 rounded-full ${
  isConnected ? 'bg-white animate-pulse' : 'bg-gray-500'
}`} />
```

## Interfaz de Usuario

### PersistencePanel (`src/components/ui/PersistencePanel.tsx`)

Panel de control que proporciona una interfaz para todas las operaciones de Firebase.

#### Características:
- **Diseño Futurista**: Estilo glassmorphism con bordes neón
- **Información en Tiempo Real**: Muestra estado de sincronización
- **Operaciones Completas**: Guardar, cargar, actualizar, eliminar
- **Diálogos Modales**: Para entrada de datos
- **Estados de Carga**: Indicadores visuales durante operaciones

#### Componentes:

```typescript
// Información del estado actual
<div className="space-y-1">
  <p><span className="text-white">GRIDS:</span> {getGridCount()}</p>
  <p><span className="text-white">OBJECTS:</span> {getObjectCount()}</p>
  <div className="flex items-center gap-2">
    <div className={`w-1.5 h-1.5 rounded-full ${
      isConnected ? 'bg-white animate-pulse' : 'bg-gray-500'
    }`} />
    <span>{isConnected ? 'SYNC_ACTIVE' : 'NO_SYNC'}</span>
  </div>
</div>
```

#### Botones de Acción:

- **SAVE**: Guardar proyecto actual
- **LOAD**: Cargar proyecto existente
- **UPDATE_PROJECT**: Actualizar proyecto actual
- **DELETE**: Eliminar proyecto seleccionado

## Flujo de Datos

### Guardar Proyecto

```
Usuario → PersistencePanel → PersistenceService → FirebaseService → Firestore
```

1. Usuario hace clic en "SAVE"
2. Se abre diálogo para nombre y descripción
3. `PersistenceService.saveCurrentWorldAsProject()` se ejecuta
4. Se obtiene estado actual del store
5. Se convierten cuadrículas a formato Firebase
6. Se guarda en Firestore
7. Se actualiza `currentProjectId` en el store

### Cargar Proyecto

```
Usuario → PersistencePanel → PersistenceService → FirebaseService → Firestore
                                                      ↓
Store ← PersistenceService ← Conversión de Datos ← Datos Firebase
```

1. Usuario selecciona proyecto de la lista
2. `PersistenceService.loadProject()` se ejecuta
3. Se obtienen datos de Firestore
4. Se convierten datos a formato del store
5. Se actualiza el store con los nuevos datos
6. La UI se actualiza automáticamente

### Sincronización Automática

```
Firestore → FirebaseService → PersistenceService → Store → UI
```

1. Se establece suscripción con `onSnapshot`
2. Firestore notifica cambios automáticamente
3. Se ejecuta callback con nuevos datos
4. Se convierten datos a formato del store
5. Se actualiza el store
6. La UI refleja los cambios

## Manejo de Errores

### Estrategias Implementadas

1. **Try-Catch**: Todas las operaciones async están envueltas en try-catch
2. **Mensajes de Usuario**: Alertas simples para errores críticos
3. **Estados de Error**: El hook `useRealtimeSync` mantiene estado de errores
4. **Fallbacks**: Valores por defecto para datos faltantes

### Ejemplo de Manejo de Errores

```typescript
const handleSaveProject = async () => {
  try {
    setIsLoading(true);
    const projectId = await persistenceService.saveCurrentWorldAsProject(
      projectName.trim(),
      projectDescription.trim() || undefined
    );
    // ... éxito
  } catch (error) {
    alert('Error al guardar el proyecto. Inténtalo de nuevo.');
  } finally {
    setIsLoading(false);
  }
};
```

### Normalización de Datos

El sistema incluye normalización robusta para manejar datos faltantes:

```typescript
const normalizedObjects = (firebaseGrid.objects || []).map((obj: SoundObject) => ({
  id: obj.id || `obj-${Math.random().toString(36).substr(2, 9)}`,
  type: obj.type || 'cube',
  position: obj.position || [0, 0, 0],
  // ... valores por defecto
}));
```

## Mejores Prácticas

### 1. Gestión de Estado
- **Singleton Pattern**: Una sola instancia de servicios
- **Separación de Responsabilidades**: FirebaseService para operaciones, PersistenceService para integración
- **Conversión de Datos**: Funciones dedicadas para transformar entre formatos

### 2. Sincronización
- **Debounce**: Evitar sincronizaciones excesivas
- **Prevención de Bucles**: Bandera para evitar actualizaciones circulares
- **Verificación de Cambios**: Solo actualizar cuando hay cambios reales

### 3. Interfaz de Usuario
- **Estados de Carga**: Indicadores visuales durante operaciones
- **Feedback Inmediato**: Confirmaciones y errores claros
- **Diseño Consistente**: Estilo futurista coherente

### 4. Manejo de Errores
- **Graceful Degradation**: La aplicación funciona sin conexión
- **Mensajes Claros**: Errores comprensibles para el usuario
- **Recuperación**: Posibilidad de reintentar operaciones

### 5. Rendimiento
- **Lazy Loading**: Cargar proyectos solo cuando se necesitan
- **Paginación**: Para listas grandes de proyectos
- **Caché Local**: Considerar caché para datos frecuentemente accedidos

## Consideraciones de Seguridad

### Reglas de Firestore (Recomendadas)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura y escritura autenticada
    match /projects/{projectId} {
      allow read, write: if request.auth != null;
    }
    
    match /grids/{gridId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Variables de Entorno

Para producción, mover la configuración a variables de entorno:

```typescript
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // ...
};
```

## Conclusiones

El sistema Firebase en Solomon House proporciona:

- **Persistencia Robusta**: Guardado y carga confiable de proyectos
- **Sincronización en Tiempo Real**: Colaboración en tiempo real
- **Arquitectura Escalable**: Fácil de mantener y extender
- **Interfaz Intuitiva**: Operaciones simples para el usuario
- **Manejo de Errores**: Recuperación graceful de errores

El sistema está diseñado para ser extensible y puede fácilmente agregar nuevas funcionalidades como autenticación de usuarios, permisos granulares, y sincronización de conflictos más sofisticada.
