# 📘 PLAN: Tutorial Interactivo Paso a Paso
## Sistema de Enseñanza para La Casa de Salomón

---

## 📋 RESUMEN EJECUTIVO

Este documento describe el plan para implementar un **tutorial interactivo guiado paso a paso** que enseñe a los usuarios cómo utilizar la plataforma de creación musical 3D colaborativa "La Casa de Salomón".

### Objetivos del Tutorial
1. **Onboarding eficaz**: Guiar nuevos usuarios desde cero hasta su primera composición
2. **Aprendizaje progresivo**: Introducir conceptos de manera gradual y lógica
3. **Interacción práctica**: Los usuarios aprenden haciendo, no solo leyendo
4. **Seguimiento de progreso**: Sistema que recuerda qué pasos ya completó el usuario
5. **Accesibilidad**: Tutorial disponible en múltiples idiomas (ES, EN, RU, ZH)

---

## 🎯 ESTRUCTURA PROPUESTA

### FASE 1: CONCEPTOS BÁSICOS (Pasos 1-5)

#### **Paso 1: Bienvenida y Navegación 3D**
- **Objetivo**: Familiarizar al usuario con la interfaz y controles de cámara
- **Contenido**:
  - Presentación inicial con overlay guiado
  - Explicar controles de cámara básicos:
    - Mouse: Rotar, hacer zoom, pan
    - WASD: Movimiento
    - Shift: Velocidad rápida
  - **Acción práctica**: Invitar al usuario a navegar por el espacio vacío
- **Verificación**: Usuario debe mover la cámara a 3 direcciones diferentes
- **Tiempo estimado**: 3-5 minutos

#### **Paso 2: Crear Tu Primer Objeto Sonoro**
- **Objetivo**: Enseñar a crear un objeto sonoro básico (cubo)
- **Contenido**:
  - Explicar el panel de control izquierdo
  - Mostrar cómo añadir un cubo al mundo
  - Explicar la relación visual-audio en 3D
- **Acción práctica**: Crear un cubo y posicionarlo
- **Verificación**: Usuario debe crear al menos 1 objeto
- **Tiempo estimado**: 2-3 minutos

#### **Paso 3: Seleccionar y Transformar Objetos**
- **Objetivo**: Dominar la manipulación de objetos en el espacio
- **Contenido**:
  - Cómo seleccionar objetos (clic)
  - Modos de transformación:
    - **G**: Translate (mover)
    - **R**: Rotate (rotar)
    - **S**: Scale (escalar)
  - Manipulación con los controles de transformación
  - Atajo **Esc**: Salir del modo edición
- **Acción práctica**: Seleccionar el cubo y moverlo, rotarlo, escalarlo
- **Verificación**: Usuario debe aplicar las 3 transformaciones
- **Tiempo estimado**: 4-5 minutos

#### **Paso 4: Reproducir Sonidos y Entender la Espacialización**
- **Objetivo**: Experimentar con audio espacial
- **Contenido**:
  - Cómo interactuar con objetos sonoros (clic para reproducir)
  - Concepto de audio espacial (cómo cambia el sonido según posición)
  - Explicar que el sonido se escucha desde la perspectiva de la cámara
- **Acción práctica**: 
  - Reproducir un objeto lejano vs cercano
  - Escuchar la diferencia
- **Verificación**: Usuario debe reproducir sonidos en al menos 3 posiciones diferentes
- **Tiempo estimado**: 3-4 minutos

#### **Paso 5: Editar Parámetros de Audio**
- **Objetivo**: Personalizar los sonidos de los objetos
- **Contenido**:
  - Panel derecho: Editor de parámetros
  - Sliders principales: Frecuencia, Attack, Decay, Sustain, Release
  - Cambios en tiempo real
  - Preview: Cómo probar cambios de parámetros
- **Acción práctica**: Modificar frecuencia y ADSR del cubo
- **Verificación**: Usuario debe cambiar al menos 3 parámetros
- **Tiempo estimado**: 4-5 minutos

---

### FASE 2: FUNCIONALIDADES AVANZADAS (Pasos 6-10)

#### **Paso 6: Múltiples Objetos y Composición**
- **Objetivo**: Crear una composición multi-objeto
- **Contenido**:
  - Añadir múltiples objetos de diferentes tipos:
    - Cubo
    - Esfera
    - Cilindro
  - Organización espacial
  - Reproducir múltiples sonidos simultáneamente
- **Acción práctica**: Crear al menos 5 objetos en diferentes posiciones
- **Verificación**: Usuario debe tener 5+ objetos colocados
- **Tiempo estimado**: 5-7 minutos

#### **Paso 7: Objetos Móviles**
- **Objetivo**: Introducir movimiento en la composición
- **Contenido**:
  - Panel: Sección de objetos móviles
  - Crear objeto móvil
  - Tipos de movimiento:
    - Circular
    - Lineal
    - Oscilación
  - Parámetros de velocidad y dirección
- **Acción práctica**: Crear un objeto móvil y configurar su trayectoria
- **Verificación**: Usuario debe crear 1 objeto móvil funcional
- **Tiempo estimado**: 4-5 minutos

#### **Paso 8: Zonas de Efectos Espaciales**
- **Objetivo**: Aplicar efectos de audio según proximidad
- **Contenido**:
  - Concepto de zonas de efectos
  - Efectos disponibles (16 tipos)
  - Cómo funcionan las zonas (solo afectan objetos cercanos)
  - Crear y configurar una zona de reverb
- **Acción práctica**: 
  - Crear zona de efecto
  - Reproducir objeto dentro y fuera de la zona
  - Escuchar la diferencia
- **Verificación**: Usuario debe crear 1 zona y probarla con un objeto
- **Tiempo estimado**: 5-6 minutos

#### **Paso 9: Persistencia y Guardar Proyectos**
- **Objetivo**: Guardar y cargar composiciones
- **Contenido**:
  - Panel de persistencia
  - Guardar proyecto en Firebase
  - Cargar proyectos guardados
  - Gestión de proyectos
- **Acción práctica**: Guardar la composición actual
- **Verificación**: Usuario debe guardar exitosamente un proyecto
- **Tiempo estimado**: 3-4 minutos

#### **Paso 10: Colaboración en Tiempo Real**
- **Objetivo**: Trabajar con otros usuarios
- **Contenido**:
  - Concepto de colaboración en tiempo real
  - Indicadores de otros usuarios
  - Sincronización automática
  - Compartir proyectos
- **Acción práctica**: (Si hay otro usuario) Ver cambios en vivo
- **Verificación**: Comprender el concepto
- **Tiempo estimado**: 3-4 minutos

---

## 🛠️ IMPLEMENTACIÓN TÉCNICA

### Componentes Necesarios

#### **1. Sistema de Guías (GuidedTourSystem)**
```typescript
// Archivo: src/components/tutorial/GuidedTourSystem.tsx

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetElement?: string; // ID del elemento a señalar
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: {
    type: 'click' | 'create' | 'move' | 'configure';
    params: Record<string, any>;
  };
  verification: {
    check: () => boolean | Promise<boolean>;
    successMessage: string;
    failureMessage: string;
  };
  skipAllowed: boolean;
}

interface TutorialState {
  currentStep: number;
  completedSteps: string[];
  isActive: boolean;
  currentStepData: TutorialStep | null;
}
```

#### **2. Componente de Overlay de Tutorial**
```typescript
// Archivo: src/components/tutorial/TutorialOverlay.tsx

// Funcionalidades:
// - Overlay semi-transparente con spotlight en el área activa
// - Arrow apuntando al elemento objetivo
// - Texto de instrucciones
// - Botones: Anterior, Siguiente, Saltar, Cerrar
// - Indicador de progreso (3/10 completado)
```

#### **3. Modal de Verificación de Acciones**
```typescript
// Archivo: src/components/tutorial/VerificationModal.tsx

// Funcionalidades:
// - Verificar que el usuario completó la acción
// - Mensajes de éxito/fallo
// - Opción de volver a intentar o continuar
```

#### **4. Panel de Controles del Tutorial**
```typescript
// Archivo: src/components/tutorial/TutorialControlPanel.tsx

// Funcionalidades:
// - Pausar tutorial
// - Volver a pasos anteriores
// - Reiniciar tutorial
// - Ver progreso
// - Saltar tutorial
```

#### **5. Sistema de Persistencia de Progreso**
```typescript
// Archivo: src/hooks/useTutorialProgress.ts

// Guardar en localStorage:
// - Qué pasos completó
// - Último paso visto
// - Fecha de inicio/fin
// - Puntuación (opcional)

// Restaurar al cargar:
// - Continuar desde donde dejó
// - O reiniciar si decidió empezar de nuevo
```

---

### Diagrama de Flujo

```
┌─────────────────────────────┐
│   Usuario abre plataforma  │
└──────────────┬─────────────┘
               │
               ▼
┌─────────────────────────────┐
│  ¿Es la primera vez?        │
│  (Check localStorage)       │
└──────┬────────────────┬─────┘
       │                │
       │ SÍ             │ NO
       ▼                ▼
┌──────────────┐  ┌─────────────┐
│  Mostrar     │  │  Preguntar  │
│  Tutorial    │  │  ¿Quieres   │
│  Automático  │  │  Reiniciar? │
└──────┬───────┘  └─────┬───────┘
       │                │
       │         ┌──────┴───────┐
       │         │ Reiniciar?   │
       │         │ SÍ/NO        │
       │         └───┬──────┬────┘
       │             │      │
       ▼             ▼      ▼
┌───────────────────────────────┐
│  PASO 1 del Tutorial         │
│  - Overlay con instrucciones │
│  - Highlight elemento        │
│  - Botones: Siguiente/Skip  │
└────────┬────────────────────┘
         │
         ▼ Usuario completa acción
┌───────────────────────────────┐
│  Verificación                 │
│  - ¿Completó la acción?      │
└──────┬────────────────────┬──┘
       │                     │
       │ SÍ                  │ NO
       ▼                     ▼
┌─────────────┐       ┌──────────────┐
│  Mensaje    │       │ Indicar qué  │
│  ¡Bien!     │       │ falta hacer  │
└──────┬──────┘       └──────┬───────┘
       │                      │
       │                      │ (Intenta de nuevo)
       └──────────┬───────────┘
                  │
                  ▼
       ┌────────────────────────┐
       │  ¿Hay más pasos?        │
       └────┬───────────────┬───┘
            │               │
            │ SÍ            │ NO
            ▼               ▼
    ┌───────────────┐  ┌──────────────┐
    │  Ir al        │  │  ¡Tutorial   │
    │  Paso N+1     │  │  Completado! │
    │               │  └──────────────┘
    └───────────────┘
```

---

## 🎨 ESTILO VISUAL Y UX

### Diseño del Tutorial

#### **Overlay de Fondo**
- Fondo negro semi-transparente (bg-black opacity-80)
- **Spotlight**: Área visible sin opacidad para el elemento activo
- Efecto de difuminado perimetral (blur)

#### **Caja de Instrucciones**
- Bordes blancos con estilo glassmorphism
- Decoraciones de esquina neón
- Tipografía monospace
- Colores: Blanco, Neon Cyan, Neon Purple

#### **Indicadores Visuales**
- **Arrow**: Flecha neón apuntando al elemento objetivo
- **Progress Bar**: Barra de progreso horizontal superior
- **Step Counter**: "Paso 3 de 10"
- **Mini Tutorial Panel**: Panel flotante con controles

### Animaciones
- Fade in/out de overlays
- Pulse para elementos interactivos
- Slide de cajas de instrucción
- Glow para elementos objetivo

---

## 📊 BASE DE DATOS Y PERSISTENCIA

### Estructura de Datos

```typescript
interface TutorialProgress {
  userId: string;
  tutorialVersion: string; // "v1.0"
  startedAt: Date;
  completedAt?: Date;
  completedSteps: string[];
  skippedSteps: string[];
  currentStep: number;
  totalSteps: number;
  score?: number; // 0-100
  metadata: {
    timePerStep: { stepId: string; duration: number }[];
    errors: { stepId: string; error: string }[];
  };
}
```

### LocalStorage
```typescript
// Clave: 'solomon-house-tutorial-progress'
// Duración: Permanente hasta que usuario lo borre
// Sincronización: Opcional con Firebase
```

---

## 🚀 PLAN DE IMPLEMENTACIÓN

### Sprint 1: Fundación (Día 1-2)
- [ ] Crear estructura de archivos del tutorial
- [ ] Implementar `TutorialContext` con Zustand
- [ ] Crear `TutorialOverlay` básico con overlay
- [ ] Implementar sistema de spotlight
- [ ] Integrar con sistema existente

### Sprint 2: Tutorial Básico (Día 3-4)
- [ ] Implementar pasos 1-5 (Fase Básica)
- [ ] Sistema de verificación de acciones
- [ ] Botones de navegación (Anterior/Siguiente/Skip)
- [ ] Persistencia en localStorage
- [ ] Testing con usuario real

### Sprint 3: Tutorial Avanzado (Día 5-6)
- [ ] Implementar pasos 6-10 (Fase Avanzada)
- [ ] Sistema de reintentos y ayuda
- [ ] Panel de controles del tutorial
- [ ] Integración con Firebase para progreso
- [ ] Optimización de rendimiento

### Sprint 4: Pulido y Extras (Día 7)
- [ ] Animaciones y transiciones
- [ ] Internacionalización (i18n)
- [ ] Sistema de hints contextuales
- [ ] Modo "Quick Start" para usuarios avanzados
- [ ] Documentación final

---

## 🎓 CONCEPTOS A ENSEÑAR

### Básicos
1. ✅ Navegación en el espacio 3D
2. ✅ Creación de objetos sonoros
3. ✅ Selección y transformación
4. ✅ Reproducción de sonidos
5. ✅ Edición de parámetros de audio

### Intermedio
6. ✅ Composición multi-objeto
7. ✅ Objetos móviles
8. ✅ Zonas de efectos espaciales
9. ✅ Persistencia de proyectos
10. ✅ Colaboración en tiempo real

### Avanzado (Futuros)
- Scripting personalizado
- Integración MIDI
- Renderizado y exportación
- Módulos de síntesis personalizados

---

## 📝 CONFIGURACIÓN DE PASOS (EJEMPLO)

```json
{
  "id": "step-1",
  "title": "Bienvenida a La Casa de Salomón",
  "description": "Aprende a navegar por el espacio 3D. Usa el mouse para rotar, la rueda para hacer zoom, y las teclas WASD para mover la cámara.",
  "targetElement": null,
  "position": "center",
  "action": {
    "type": "info",
    "message": "¡Bienvenido! Explora el espacio moviendo la cámara."
  },
  "verification": {
    "check": "() => checkUserMovedCamera()",
    "required": ["cameraMovedX", "cameraMovedY", "cameraMovedZ"]
  },
  "hints": [
    "Usa W/A/S/D para mover",
    "Mouse para rotar",
    "Shift para moverse rápido"
  ],
  "estimatedTime": 180, // segundos
  "skipAllowed": false
}
```

---

## 🔄 SISTEMA DE VERIFICACIÓN

### Mecanismos de Verificación

#### **1. Verificación por Evento**
```typescript
// Verificar que usuario presionó tecla
function checkKeyPress(key: string): boolean {
  // Escuchar eventos de teclado
}

// Verificar que usuario hizo clic
function checkClickOnElement(selector: string): boolean {
  // Verificar DOM events
}
```

#### **2. Verificación por Estado de Store**
```typescript
// Verificar que objeto fue creado
function checkObjectCreated(): boolean {
  const store = useWorldStore.getState();
  return store.objects.length > 0;
}

// Verificar que objeto fue transformado
function checkObjectTransformed(): boolean {
  const store = useWorldStore.getState();
  return store.objects.some(obj => 
    obj.position[0] !== 0 || 
    obj.rotation[1] !== 0 || 
    obj.scale[0] !== 1
  );
}
```

#### **3. Verificación por Tiempo**
```typescript
// Verificar que usuario pasó tiempo en un paso
function checkTimeSpent(minSeconds: number): boolean {
  // Track tiempo en paso
}
```

#### **4. Verificación de Complejidad**
```typescript
// Verificar que usuario completó tarea completa
function checkTaskComplete(taskConfig: TaskConfig): boolean {
  // Verificar múltiples condiciones
  return taskConfig.requirements.every(req => 
    checkRequirement(req)
  );
}
```

---

## 🎯 MÉTRICAS DE ÉXITO

### Objetivos Medibles
- **Tasa de finalización**: 70%+ de usuarios completan tutorial
- **Tiempo promedio**: < 30 minutos para completar todo
- **Tasa de abandono**: < 20% en los primeros 3 pasos
- **Reutilización**: 30%+ de usuarios usan el tutorial más de una vez
- **Feedback**: Score promedio > 4/5

### Métricas Técnicas
- **Rendimiento**: Tutorial no afecta FPS (mantiene 60fps)
- **Carga**: < 100ms para iniciar tutorial
- **Tamaño**: +30KB agregados al bundle

---

## 🌍 INTERNACIONALIZACIÓN

### Archivos de Traducción
```typescript
// src/messages/es.json
{
  "tutorial": {
    "welcome": "Bienvenido a La Casa de Salomón",
    "description": "...",
    "nextButton": "Siguiente",
    "previousButton": "Anterior",
    "skipButton": "Saltar",
    "complete": "¡Tutorial Completado!",
    // ... todos los textos
  }
}

// src/messages/en.json (igual para EN)
// src/messages/ru.json (igual para RU)
// src/messages/zh.json (igual para ZH)
```

---

## 📚 DOCUMENTACIÓN ADICIONAL

### Archivos a Crear
- `docs/TUTORIAL_GUIDE.md` - Guía para desarrolladores
- `docs/TUTORIAL_TRANSLATIONS.md` - Guía de traducciones
- `docs/TUTORIAL_TESTING.md` - Casos de prueba

### Recursos Visuales
- Screenshots de cada paso
- GIFs animados mostrando interacciones
- Videos explicativos (opcional)

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Preparación
- [x] Plan completo definido ✅
- [ ] Crear branch `feature/interactive-tutorial`
- [ ] Actualizar documentación técnica

### Implementación Core
- [ ] Sistema de tutorial (zustand store)
- [ ] Overlay component con spotlight
- [ ] Verificación de acciones
- [ ] Navegación entre pasos
- [ ] Persistencia de progreso

### Funcionalidades
- [ ] Implementar pasos 1-10
- [ ] Sistema de hints contextuales
- [ ] Panel de controles
- [ ] Internacionalización
- [ ] Animaciones

### Testing
- [ ] Tests unitarios
- [ ] Tests de integración
- [ ] Pruebas con usuarios reales
- [ ] Optimización de rendimiento

### Lanzamiento
- [ ] Code review
- [ ] Merge a main
- [ ] Documentación final
- [ ] Anuncio de la funcionalidad

---

**Fecha de creación**: Diciembre 2024  
**Última actualización**: [Fecha actual]  
**Estado**: Plan completado - Listo para implementación  
**Autor**: Asistente IA con base en análisis de código

