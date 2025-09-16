# Atajos de Teclado - Casa de Salomón

## Funcionalidades Implementadas

### 🎯 Modo de Edición
- **G**: Activar modo de traslación (mover objetos)
- **R**: Activar modo de rotación
- **S**: Activar modo de escalado

### 🚪 Salir del Modo Edición
- **ESC**: 
  - Deselecciona la entidad actualmente seleccionada
  - Resetea el modo de transformación a 'translate'
  - Permite mover la cámara libremente con WASD

### 🗑️ Eliminación de Entidades
- **DEL** o **BACKSPACE**: 
  - Elimina la entidad seleccionada (objeto sonoro o zona de efecto)
  - Funciona tanto para objetos sonoros como para zonas de efectos
  - Solo funciona cuando hay una entidad seleccionada

### 🎮 Controles de Cámara
- **W**: Mover cámara hacia adelante
- **S**: Mover cámara hacia atrás
- **A**: Mover cámara hacia la izquierda
- **D**: Mover cámara hacia la derecha
- **Q**: Mover cámara hacia abajo
- **E**: Mover cámara hacia arriba
- **SHIFT**: Movimiento rápido de cámara

## 🆕 Nuevo Editor de Transformación (Estilo Unity)

### 📍 **Control de Posición**
- Campos numéricos X, Y, Z para coordenadas exactas
- Precisión de 0.1 unidades
- Colores de eje estándar (X=Rojo, Y=Verde, Z=Azul)
- Actualización en tiempo real

### 🔄 **Control de Rotación**
- Campos numéricos para ángulos en grados
- Precisión de 1 grado
- Rotación aplicada inmediatamente

### ⤧ **Control de Escala**
- Campos numéricos para factores de escala
- Valor mínimo de 0.1
- Escala uniforme o no uniforme por eje

### 🔧 **Controles Adicionales**
- **Botón Reset**: Restaura valores por defecto
- **Botón Copiar**: Copia valores al portapapeles
- **Colapsar/Expandir**: Oculta o muestra el panel

## Flujo de Trabajo

1. **Seleccionar entidad**: Haz clic en un objeto o zona de efecto
2. **Activar modo edición**: Usa G, R o S para el modo deseado
3. **Editar**: 
   - **Manipulación visual**: Usa el mouse con las herramientas de transformación
   - **Edición numérica**: Usa el panel TransformEditor para valores exactos
4. **Salir edición**: Presiona ESC para volver al modo de navegación
5. **Eliminar**: Selecciona una entidad y presiona DEL para eliminarla

## Notas Técnicas

- Los atajos solo funcionan cuando no estás escribiendo en campos de texto
- La eliminación es permanente y no se puede deshacer
- Al salir del modo edición, la cámara vuelve a estar completamente libre para navegar
- Los atajos funcionan tanto para objetos sonoros como para zonas de efectos
- El editor de transformación aparece automáticamente al seleccionar una entidad
- Los cambios numéricos se aplican inmediatamente en la escena 3D

## Implementación

Las funcionalidades están implementadas en:
- `src/hooks/useKeyboardShortcuts.ts` - Lógica principal de atajos
- `src/state/useWorldStore.ts` - Acciones del store
- `src/components/ui/WorldInfo.tsx` - Interfaz de información
- `src/components/ui/TransformEditor.tsx` - Editor de transformación estilo Unity
- `src/components/ui/TransformToolbar.tsx` - Barra de herramientas de transformación

## 🎨 Interfaz Visual

### **Panel de Transformación**
- Ubicado en la esquina superior derecha
- Diseño oscuro con colores de eje estándar
- Panel colapsable para ahorrar espacio
- Información de la entidad seleccionada

### **Barra de Herramientas**
- Ubicada en la parte superior central
- Botones para cambiar modo de transformación
- Botón de salir del modo edición
- Indicadores visuales del modo activo

### **Información del Mundo**
- Ubicada en la esquina inferior izquierda
- Estadísticas de objetos en la escena
- Estado de selección actual
- Lista de atajos de teclado disponibles
