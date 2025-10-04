# Sistema de Colaboración Global en Tiempo Real

## Descripción General

El sistema de colaboración global permite que múltiples usuarios interactúen simultáneamente en un único espacio compartido en "Solomon House". Todos los objetos sonoros, zonas de efectos, objetos móviles y cuadrículas se sincronizan en tiempo real entre todos los usuarios conectados.

## Arquitectura

### 1. Modelo de Datos en Firestore

El sistema utiliza una colección llamada `globalWorldState` con un documento único `main` que contiene:

```typescript
interface GlobalWorldDoc {
  objects: SoundObject[];           // Todos los objetos sonoros
  effectZones: EffectZone[];        // Todas las zonas de efectos
  mobileObjects: MobileObject[];    // Todos los objetos móviles
  grids: Grid[];                    // Todas las cuadrículas
  activeGridId: string | null;      // ID de la cuadrícula activa
  lastUpdated: Timestamp;           // Última actualización
  version: number;                  // Versión para manejo de conflictos
}
```

### 2. Servicio de Firebase

El `FirebaseService` se extiende con métodos específicos para el mundo global:

- `initializeGlobalWorldState()`: Inicializa el documento si no existe
- `addGlobalSoundObject()`: Añade un objeto usando `arrayUnion`
- `updateGlobalSoundObject()`: Actualiza un objeto existente
- `removeGlobalSoundObject()`: Elimina un objeto usando `arrayRemove`
- Métodos similares para zonas de efectos y objetos móviles
- `subscribeToGlobalWorld()`: Suscripción en tiempo real

### 3. Store de Zustand

El `useWorldStore` se modifica para:

- **Sincronización Bidireccional**: Prevenir bucles infinitos con bandera `isUpdatingFromFirestore`
- **Debounce**: Limitar escrituras a Firestore durante interacciones continuas (100ms)
- **Fallback Local**: Funcionar sin conexión usando estado local
- **Acciones Globales**: Nuevas acciones que sincronizan con Firestore automáticamente

### 4. Hook de Sincronización

El `useGlobalWorldSync` maneja:

- **Inicialización**: Crea el documento si no existe
- **Suscripción**: Escucha cambios en tiempo real
- **Prevención de Bucles**: Controla la bandera de actualización
- **Manejo de Errores**: Reconexión automática y manejo de errores
- **Estado de Conexión**: Informa sobre el estado de la conexión

## Uso

### 1. Inicialización Automática

El sistema se inicializa automáticamente cuando se monta el componente `Experience`:

```typescript
export function Experience() {
  const { isConnected, error, reconnect } = useGlobalWorldSync();
  // ... resto del componente
}
```

### 2. Acciones Automáticas

Todas las acciones existentes ahora sincronizan automáticamente:

```typescript
// Estas acciones ahora sincronizan con Firestore automáticamente
addObject(type, position);           // → addGlobalSoundObject()
updateObject(id, updates);          // → updateGlobalSoundObject()
removeObject(id);                   // → removeGlobalSoundObject()
addEffectZone(type, position);      // → addGlobalEffectZone()
updateEffectZone(id, updates);      // → updateGlobalEffectZone()
removeEffectZone(id);               // → removeGlobalEffectZone()
addMobileObject(position);          // → addGlobalMobileObject()
updateMobileObject(id, updates);    // → updateGlobalMobileObject()
removeMobileObject(id);             // → removeGlobalMobileObject()
```

### 3. Indicador de Estado

El sistema muestra un indicador visual en la esquina superior derecha:

- 🟢 **Verde**: Mundo Global Conectado
- 🔴 **Rojo**: Mundo Global Desconectado
- **Error**: Muestra errores con opción de reconexión

## Características Técnicas

### 1. Optimización de Rendimiento

- **Debounce**: Las actualizaciones de posición se debouncean a 100ms
- **Escrituras Eficientes**: Usa `arrayUnion` y `arrayRemove` para operaciones atómicas
- **Actualizaciones Locales**: Cambios locales inmediatos, Firestore en background

### 2. Prevención de Bucles

```typescript
// Bandera para prevenir bucles bidireccionales
if (state.isUpdatingFromFirestore) {
  return; // No escribir a Firestore si estamos recibiendo datos
}
```

### 3. Manejo de Conflictos

- **Versión**: Cada actualización incrementa la versión
- **Última Actualización**: Timestamp de la última modificación
- **Operaciones Atómicas**: `arrayUnion`/`arrayRemove` previenen conflictos

### 4. Fallback Local

Si no hay conexión global, el sistema funciona localmente:

```typescript
if (state.globalWorldConnected) {
  get().addGlobalSoundObject(object);
} else {
  // Fallback local
  set({ grids: newGrids });
}
```

## Reglas de Seguridad de Firestore

**IMPORTANTE**: Configura las siguientes reglas en Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Mundo global - todos pueden leer, solo autenticados pueden escribir
    match /globalWorldState/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Para desarrollo/testing (TEMPORAL)
    // allow write: if true;
  }
}
```

## Pruebas

### 1. Conectividad
- Abre la aplicación en múltiples pestañas/navegadores
- Verifica que el indicador muestre "Mundo Global Conectado"

### 2. Sincronización
- Añade objetos en una pestaña
- Verifica que aparezcan en tiempo real en otras pestañas
- Mueve objetos y verifica sincronización de posición

### 3. Persistencia
- Realiza cambios y recarga todas las pestañas
- Verifica que el estado se mantenga

### 4. Manejo de Errores
- Simula pérdida de conexión
- Verifica que el sistema funcione localmente
- Restaura conexión y verifica sincronización

## Consideraciones Futuras

### 1. Escalabilidad
Si el volumen de objetos crece significativamente, considera migrar a subcolecciones:

```
/globalWorldState/main/objects/{objectId}
/globalWorldState/main/effectZones/{zoneId}
/globalWorldState/main/mobileObjects/{objectId}
```

### 2. Autenticación
Implementa autenticación de usuarios para:
- Control de acceso granular
- Historial de cambios por usuario
- Resolución de conflictos avanzada

### 3. Optimizaciones Adicionales
- **Compresión**: Comprimir datos grandes antes de enviar
- **Diferenciales**: Enviar solo los cambios en lugar del estado completo
- **Regiones**: Dividir el mundo en regiones para mejor escalabilidad

## Troubleshooting

### Problemas Comunes

1. **No se conecta al mundo global**
   - Verifica la configuración de Firebase
   - Revisa las reglas de seguridad de Firestore
   - Comprueba la consola para errores

2. **Bucles infinitos de actualización**
   - La bandera `isUpdatingFromFirestore` debería prevenir esto
   - Revisa que no se esté llamando a acciones globales desde listeners

3. **Pérdida de datos**
   - Los datos se guardan en Firestore automáticamente
   - El fallback local mantiene funcionalidad sin conexión
   - Verifica que las reglas de Firestore permitan escritura

4. **Rendimiento lento**
   - Ajusta el `DEBOUNCE_DELAY` en `useWorldStore.ts`
   - Considera reducir la frecuencia de actualizaciones
   - Implementa paginación si hay muchos objetos

## Conclusión

El sistema de colaboración global proporciona una experiencia fluida y en tiempo real para múltiples usuarios. La arquitectura está diseñada para ser robusta, eficiente y escalable, con fallbacks apropiados para garantizar que la aplicación funcione incluso sin conexión.



