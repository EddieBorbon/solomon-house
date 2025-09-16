# Documentación de Scripts - Casa de Salomón

Este directorio contiene documentación específica y detallada para cada script individual de la aplicación. Cada archivo documenta un componente, hook, manager o servicio específico con información completa sobre su propósito, funcionalidades, uso y relaciones.

## 📁 Estructura de Documentación

### 🎯 Componentes de Páginas
- **[app-layout.md](./app-layout.md)** - Layout raíz de la aplicación Next.js
- **[app-page.md](./app-page.md)** - Página principal de la aplicación

### 🎵 Componentes de Audio
- **[AudioManager.md](./AudioManager.md)** - Manager principal de audio
- **[SoundCube.md](./SoundCube.md)** - Componente de cubo sonoro 3D
- **[SpatialAudioManager.md](./SpatialAudioManager.md)** - Manager de audio espacializado

### 🎛️ Managers de Audio
- **[AudioContextManager.md](./AudioContextManager.md)** - Gestión del contexto de audio de Tone.js
- **[EffectManager.md](./EffectManager.md)** - Gestión de efectos de audio globales
- **[ParameterManager.md](./ParameterManager.md)** - Actualización segura de parámetros de sintetizadores
- **[SoundPlaybackManager.md](./SoundPlaybackManager.md)** - Gestión de reproducción de sonidos

### 🏭 Factories y Servicios
- **[SoundSourceFactory.md](./SoundSourceFactory.md)** - Factory para crear fuentes de sonido
- **[StoreProvider.md](./StoreProvider.tsx)** - Provider del estado global de Zustand

### 🎮 Hooks Personalizados
- **[useAudioListener.md](./useAudioListener.md)** - Hook para configurar el listener de audio 3D
- **[useCameraControls.md](./useCameraControls.md)** - Hook para controles de cámara con teclado
- **[useEffectZoneDetection.md](./useEffectZoneDetection.md)** - Hook para detección de colisiones con zonas de efectos
- **[useKeyboardShortcuts.md](./useKeyboardShortcuts.md)** - Hook para atajos de teclado
- **[useRealtimeSync.md](./useRealtimeSync.md)** - Hook para sincronización en tiempo real con Firebase
- **[useWorldStore.md](./useWorldStore.md)** - Hook para el store global de Zustand

### 🎨 Componentes de UI
- **[ControlPanel.md](./ControlPanel.md)** - Panel de control principal
- **[Experience.md](./Experience.md)** - Componente principal de la experiencia 3D

## 📋 Índice por Categorías

### 🎵 Audio y Música
| Script | Tipo | Descripción |
|--------|------|-------------|
| AudioManager | Manager | Gestión central de audio y sintetizadores |
| AudioContextManager | Manager | Control del contexto de audio de Tone.js |
| EffectManager | Manager | Gestión de efectos de audio con espacialización 3D |
| ParameterManager | Manager | Actualización segura de parámetros de sintetizadores |
| SoundPlaybackManager | Manager | Control de reproducción de sonidos |
| SpatialAudioManager | Manager | Audio espacializado 3D |
| SoundCube | Componente | Cubo sonoro interactivo 3D |
| SoundSourceFactory | Factory | Creación de fuentes de sonido |
| useAudioListener | Hook | Configuración del listener de audio 3D |

### 🎮 Interacción y Controles
| Script | Tipo | Descripción |
|--------|------|-------------|
| useCameraControls | Hook | Controles de cámara con teclado WASD |
| useKeyboardShortcuts | Hook | Atajos de teclado globales |
| useEffectZoneDetection | Hook | Detección de colisiones con zonas de efectos |
| ControlPanel | Componente | Panel de control principal de la UI |

### 🌐 Estado y Sincronización
| Script | Tipo | Descripción |
|--------|------|-------------|
| useWorldStore | Hook | Store global de Zustand para estado de la aplicación |
| useRealtimeSync | Hook | Sincronización en tiempo real con Firebase |
| StoreProvider | Componente | Provider del estado global |

### 🎨 UI y Experiencia
| Script | Tipo | Descripción |
|--------|------|-------------|
| Experience | Componente | Componente principal de la experiencia 3D |
| app-layout | Componente | Layout raíz de Next.js |
| app-page | Componente | Página principal de la aplicación |

## 🔗 Relaciones Entre Scripts

### Flujo de Audio
```
AudioContextManager → AudioManager → EffectManager
                         ↓
SoundSourceFactory → SoundPlaybackManager → ParameterManager
                         ↓
                    SpatialAudioManager
```

### Flujo de Estado
```
StoreProvider → useWorldStore → useRealtimeSync
                    ↓
               useEffectZoneDetection
```

### Flujo de Interacción
```
useKeyboardShortcuts → useCameraControls → Experience
                           ↓
                    ControlPanel
```

## 📖 Cómo Usar Esta Documentación

### Para Desarrolladores
1. **Buscar por funcionalidad**: Usa el índice por categorías para encontrar scripts relacionados
2. **Entender relaciones**: Revisa las relaciones entre scripts para comprender el flujo
3. **Ejemplos de uso**: Cada documento incluye ejemplos prácticos de implementación
4. **Troubleshooting**: Cada documento incluye sección de resolución de problemas

### Para Nuevos Miembros del Equipo
1. **Empezar con**: `AudioManager.md` para entender el sistema de audio
2. **Continuar con**: `useWorldStore.md` para entender el estado global
3. **Explorar**: Los managers específicos según necesidades del proyecto
4. **Integrar**: Revisar ejemplos de uso en cada documento

## 🛠️ Convenciones de Documentación

### Estructura Estándar
Cada documento sigue esta estructura:
1. **Propósito**: Descripción clara del objetivo del script
2. **Funcionalidades Principales**: Lista de características principales
3. **Estructura del Código**: Ejemplos de código clave
4. **Dependencias**: Librerías y archivos requeridos
5. **Uso en la Aplicación**: Ejemplos prácticos de implementación
6. **Relaciones con Otros Archivos**: Conexiones con otros scripts
7. **Consideraciones de Rendimiento**: Optimizaciones y mejores prácticas
8. **Troubleshooting**: Problemas comunes y soluciones

### Código de Ejemplo
- Todos los ejemplos están probados y funcionan
- Incluyen manejo de errores apropiado
- Siguen las mejores prácticas de TypeScript
- Incluyen comentarios explicativos

### Información Técnica
- Configuraciones por defecto documentadas
- Rangos de parámetros especificados
- Limitaciones conocidas mencionadas
- Futuras mejoras identificadas

## 🔄 Mantenimiento de la Documentación

### Actualización
- La documentación se actualiza cuando cambian los scripts
- Los ejemplos se mantienen sincronizados con el código
- Las relaciones se actualizan cuando cambia la arquitectura

### Contribución
- Cada nuevo script debe incluir documentación completa
- Los cambios significativos requieren actualización de documentación
- Los ejemplos deben probarse antes de incluirse

## 📞 Contacto y Soporte

Para preguntas sobre la documentación o sugerencias de mejora:
- Revisar la sección de Troubleshooting en cada documento
- Consultar los ejemplos de uso completos
- Verificar las relaciones entre scripts para entender el contexto

---

**Última actualización**: Diciembre 2024  
**Versión**: 1.0  
**Mantenido por**: Equipo de desarrollo Casa de Salomón


