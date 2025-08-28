# Editor de Transformación - Casa de Salomón

## 🎯 Descripción

El **TransformEditor** es un componente de interfaz que permite editar la posición, rotación y escala de objetos sonoros y zonas de efectos directamente desde la interfaz, similar al Inspector de Unity. Proporciona controles numéricos precisos para manipular las transformaciones en tiempo real.

## ✨ Características Principales

### 🎨 **Interfaz Estilo Unity**
- Panel flotante en la esquina superior derecha
- Diseño oscuro con colores de eje estándar (X=Rojo, Y=Verde, Z=Azul)
- Header con icono de transformación y botón de colapsar
- Campos de entrada numérica organizados por eje

### 📍 **Control de Posición**
- Campos X, Y, Z para coordenadas de posición
- Precisión de 0.1 unidades
- Colores de eje para identificación visual
- Actualización en tiempo real en la escena 3D

### 🔄 **Control de Rotación**
- Campos X, Y, Z para ángulos de rotación (en grados)
- Precisión de 1 grado
- Colores de eje consistentes
- Rotación aplicada inmediatamente

### ⤧ **Control de Escala**
- Campos X, Y, Z para factores de escala
- Valor mínimo de 0.1 para evitar objetos invisibles
- Precisión de 0.1 unidades
- Escala uniforme o no uniforme por eje

## 🎮 **Funcionalidades Avanzadas**

### 🔧 **Controles Adicionales**
- **Botón Reset**: Restaura valores por defecto (Pos: [0,0,0], Rot: [0,0,0], Scale: [1,1,1])
- **Botón Copiar**: Copia los valores actuales al portapapeles
- **Colapsar/Expandir**: Oculta o muestra el panel completo

### 📊 **Información de Entidad**
- Tipo de entidad (Objeto Sonoro o Zona de Efecto)
- ID único de la entidad
- Estado del audio (para objetos sonoros)
- Información en tiempo real

### 🎯 **Integración con el Sistema**
- Funciona con objetos sonoros y zonas de efectos
- Sincronización automática con el store de estado
- Actualización inmediata en la escena 3D
- Compatible con el sistema de selección existente

## 🚀 **Cómo Usar**

### 1. **Seleccionar Entidad**
- Haz clic en cualquier objeto sonoro o zona de efecto en la escena
- El panel aparecerá automáticamente en la esquina superior derecha

### 2. **Editar Transformación**
- **Posición**: Modifica los valores X, Y, Z para mover la entidad
- **Rotación**: Cambia los ángulos para rotar la entidad
- **Escala**: Ajusta el tamaño en cada eje

### 3. **Controles Rápidos**
- **ESC**: Salir del modo edición (deseleccionar)
- **DEL**: Eliminar entidad seleccionada
- **G/R/S**: Cambiar modo de transformación (Mover/Rotar/Escalar)

### 4. **Precisión Numérica**
- Usa los campos de entrada para valores exactos
- Los cambios se aplican inmediatamente
- Valores redondeados a 2 decimales para claridad

## 🎨 **Diseño Visual**

### **Colores de Eje**
- **X (Rojo)**: Eje horizontal izquierda-derecha
- **Y (Verde)**: Eje vertical arriba-abajo  
- **Z (Azul)**: Eje de profundidad adelante-atrás

### **Estilo de Interfaz**
- Fondo oscuro semi-transparente con blur
- Bordes y sombras para profundidad visual
- Campos de entrada con estados de focus
- Iconos y emojis para mejor UX

## 🔧 **Implementación Técnica**

### **Componentes Utilizados**
- React Hooks (useState, useEffect, useMemo)
- Zustand Store para estado global
- TypeScript para tipado estático
- Tailwind CSS para estilos

### **Funciones Principales**
- `handleTransformChange`: Maneja cambios en tiempo real
- `resetTransform`: Restaura valores por defecto
- `roundToDecimals`: Formatea valores numéricos
- `selectedEntity`: Lógica de selección de entidades

### **Integración con Store**
- `updateObject`: Actualiza objetos sonoros
- `updateEffectZone`: Actualiza zonas de efectos
- `selectedEntityId`: Estado de selección actual
- `objects` y `effectZones`: Datos del mundo

## 📱 **Responsive Design**

- Panel de ancho fijo (320px) para consistencia
- Campos de entrada optimizados para diferentes tamaños de pantalla
- Botones con tooltips informativos
- Interfaz adaptable a diferentes resoluciones

## 🎵 **Casos de Uso**

### **Objetos Sonoros**
- Posicionar instrumentos en el espacio 3D
- Ajustar orientación para espacialización de audio
- Escalar para efectos visuales y sonoros

### **Zonas de Efectos**
- Colocar efectos de audio en posiciones específicas
- Ajustar tamaño de influencia de efectos
- Orientar zonas para mejor cobertura

## 🔮 **Futuras Mejoras**

- **Snapping**: Alineación automática con grid
- **Undo/Redo**: Historial de transformaciones
- **Constraints**: Limitaciones de movimiento por eje
- **Animation**: Transiciones suaves entre valores
- **Multi-selection**: Edición de múltiples entidades

## 📚 **Referencias**

- **Unity Inspector**: Inspiración para el diseño
- **Three.js**: Sistema de transformaciones 3D
- **React Three Fiber**: Integración React + Three.js
- **Zustand**: Manejo de estado global
