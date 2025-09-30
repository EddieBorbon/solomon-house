# Configuración del Mundo Global en Firestore

## Reglas de Seguridad

Para habilitar la funcionalidad de colaboración global en tiempo real, necesitas configurar las reglas de seguridad de Firestore.

### Opción 1: Con Autenticación (Recomendado para Producción)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Mundo global - todos pueden leer, solo usuarios autenticados pueden escribir
    match /globalWorldState/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Proyectos individuales
    match /projects/{projectId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Cuadrículas individuales
    match /grids/{gridId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Opción 2: Sin Autenticación (Solo para Desarrollo/Testing)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Mundo global - acceso completo para desarrollo
    match /globalWorldState/{docId} {
      allow read, write: if true;
    }
    
    // Proyectos individuales
    match /projects/{projectId} {
      allow read, write: if true;
    }
    
    // Cuadrículas individuales
    match /grids/{gridId} {
      allow read, write: if true;
    }
  }
}
```

## Cómo Aplicar las Reglas

1. Ve a la [Consola de Firebase](https://console.firebase.google.com/)
2. Selecciona tu proyecto "solomonhouse-5f528"
3. En el menú lateral, ve a "Firestore Database"
4. Haz clic en la pestaña "Rules"
5. Reemplaza las reglas existentes con una de las opciones anteriores
6. Haz clic en "Publish"

## Estructura de Datos

### Colección: `globalWorldState`
- **Documento**: `main`
- **Estructura**:
  ```typescript
  {
    id: string;
    objects: SoundObject[];
    mobileObjects: MobileObject[];
    effectZones: EffectZone[];
    activeGridId: string | null;
    currentGridCoordinates: [number, number, number];
    createdAt: Timestamp;
    updatedAt: Timestamp;
    lastModifiedBy?: string;
  }
  ```

## Funcionalidades Implementadas

### ✅ Sincronización en Tiempo Real
- Múltiples usuarios pueden conectarse simultáneamente
- Cambios se reflejan instantáneamente en todas las instancias
- Debounce implementado para evitar escrituras excesivas

### ✅ Persistencia
- Estado del mundo global se mantiene entre sesiones
- Recarga de página preserva todos los objetos y configuraciones

### ✅ Operaciones CRUD
- **Crear**: Agregar objetos, objetos móviles y zonas de efectos
- **Leer**: Cargar estado inicial y sincronizar cambios
- **Actualizar**: Modificar posición, rotación, escala y parámetros
- **Eliminar**: Remover entidades del mundo global

### ✅ Optimizaciones
- Debounce de 300-500ms para actualizaciones de posición
- ArrayUnion/ArrayRemove para operaciones eficientes
- Bandera de sincronización para evitar bucles infinitos

## Monitoreo y Debugging

### Consola de Firebase
- Ve a "Firestore Database" > "Usage" para monitorear lecturas/escrituras
- Usa "Data" para inspeccionar el documento `globalWorldState/main`

### Logs de la Aplicación
- Estado de conexión visible en la interfaz
- Logs de consola para debugging de sincronización
- Indicadores visuales de actividad de sincronización

## Limitaciones Actuales

1. **Sin Autenticación**: Actualmente no hay sistema de usuarios
2. **Sin Resolución de Conflictos**: Último en escribir gana
3. **Sin Historial**: No hay versionado de cambios
4. **Sin Permisos Granulares**: Todos los usuarios tienen acceso completo

## Próximos Pasos Recomendados

1. Implementar autenticación de usuarios
2. Agregar sistema de permisos por usuario
3. Implementar resolución de conflictos
4. Agregar historial de cambios
5. Optimizar para grandes cantidades de objetos
