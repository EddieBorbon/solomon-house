# 🎨 Sistema Bento Grid - Solomon House

## Descripción

Sistema de dashboard moderno inspirado en el diseño "Bento Grid" con efectos de glassmorphism y auras de color para el proyecto Solomon House. Este sistema proporciona una interfaz elegante y funcional para gestionar los efectos de audio espacial 3D.

## 🚀 Características

### ✨ Efectos Visuales
- **Glassmorphism**: Efectos de vidrio esmerilado con transparencias
- **Auras de Color**: Efectos de brillo radial animados
- **Transiciones Suaves**: Animaciones fluidas en hover y interacciones
- **Responsive Design**: Adaptable a diferentes tamaños de pantalla

### 🎛️ Componentes Principales

#### 1. **ProjectCard** (`src/components/ui/ProjectCard.tsx`)
Componente base reutilizable para las tarjetas del Bento Grid.

**Props:**
- `title`: Título de la tarjeta
- `lastUpdated`: Información de última actualización
- `members`: Array de avatares o iconos
- `icon`: Icono principal de la tarjeta
- `glowColor`: Color del aura (ej: "from-cyan-500")
- `className`: Clases CSS personalizadas

**Ejemplo de uso:**
```tsx
<ProjectCard
  title="StereoWidener"
  lastUpdated="Nuevo efecto"
  members={["🎧"]}
  icon={<span className="text-lg">🎧</span>}
  glowColor="from-blue-500"
  className="h-48"
/>
```

#### 2. **AudioEffectCard** (`src/components/ui/AudioEffectCard.tsx`)
Tarjeta especializada para efectos de audio con información detallada.

**Props:**
- `title`: Nombre del efecto
- `description`: Descripción del efecto
- `icon`: Icono del efecto
- `glowColor`: Color del aura
- `isActive`: Estado de activación
- `parameters`: Array de parámetros del efecto
- `onClick`: Función de callback

#### 3. **BentoGrid** (`src/components/ui/BentoGrid.tsx`)
Layout principal del Bento Grid con diferentes tamaños de tarjetas.

**Tamaños disponibles:**
- `small`: `h-32`
- `medium`: `h-40`
- `large`: `h-48`
- `wide`: `h-40 lg:col-span-2`
- `tall`: `h-48 lg:row-span-2`

#### 4. **Dashboard** (`src/components/ui/Dashboard.tsx`)
Dashboard principal con todas las funcionalidades del sistema.

#### 5. **AudioEffectsDashboard** (`src/components/ui/AudioEffectsDashboard.tsx`)
Dashboard especializado para gestión de efectos de audio.

## 🎨 Paleta de Colores

### Colores de Aura
- **Cyan**: `from-cyan-500` - Control Panel
- **Purple**: `from-purple-500` - Efectos de Audio
- **Green**: `from-green-500` - Mundo 3D
- **Orange**: `from-orange-500` - Editor de Parámetros
- **Blue**: `from-blue-500` - StereoWidener
- **Pink**: `from-pink-500` - Phaser
- **Teal**: `from-teal-500` - AutoFilter
- **Indigo**: `from-indigo-500` - Reverb

### Colores Base
- **Fondo**: `bg-black`
- **Tarjetas**: `bg-white/5` con `backdrop-blur-lg`
- **Bordes**: `border-white/10`
- **Texto**: `text-white` y `text-gray-400`

## 🛠️ Configuración Técnica

### Tailwind CSS
El sistema utiliza una utilidad personalizada `bg-gradient-radial` para los efectos de aura:

```javascript
// tailwind.config.ts
plugins: [
  require('tailwindcss/plugin')(function ({ addUtilities }) {
    addUtilities({
      '.bg-gradient-radial': {
        'background-image': 'radial-gradient(var(--tw-gradient-stops))',
      },
    })
  }),
],
```

### Estructura de Archivos
```
src/
├── components/ui/
│   ├── ProjectCard.tsx          # Tarjeta base reutilizable
│   ├── AudioEffectCard.tsx     # Tarjeta especializada para efectos
│   ├── BentoGrid.tsx           # Layout principal del Bento Grid
│   ├── Dashboard.tsx           # Dashboard principal
│   ├── AudioEffectsDashboard.tsx # Dashboard de efectos
│   └── index.ts                # Exportaciones
├── app/
│   ├── dashboard/page.tsx      # Página del dashboard principal
│   ├── effects/page.tsx        # Página de efectos
│   └── bento/page.tsx          # Página del Bento Grid
└── tailwind.config.ts          # Configuración de Tailwind
```

## 📱 Páginas Disponibles

### 1. Dashboard Principal
**Ruta**: `/dashboard`
**Componente**: `Dashboard`
**Descripción**: Vista general del sistema con todas las funcionalidades.

### 2. Efectos de Audio
**Ruta**: `/effects`
**Componente**: `AudioEffectsDashboard`
**Descripción**: Gestión detallada de todos los efectos de audio disponibles.

### 3. Bento Grid
**Ruta**: `/bento`
**Componente**: `BentoGrid`
**Descripción**: Layout del Bento Grid con diferentes tamaños de tarjetas.

## 🎯 Uso del Sistema

### 1. Importar Componentes
```tsx
import { 
  ProjectCard, 
  AudioEffectCard, 
  BentoGrid, 
  Dashboard,
  AudioEffectsDashboard 
} from '@/components/ui';
```

### 2. Crear una Tarjeta Personalizada
```tsx
<ProjectCard
  title="Mi Efecto"
  lastUpdated="Hoy"
  members={["🎵", "🔊"]}
  icon={<span className="text-lg">🎵</span>}
  glowColor="from-purple-500"
  className="h-48"
/>
```

### 3. Crear un Dashboard Personalizado
```tsx
function MiDashboard() {
  return (
    <div className="min-h-screen bg-black p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Tus tarjetas aquí */}
      </div>
    </div>
  );
}
```

## 🔧 Personalización

### Colores de Aura
Para cambiar el color del aura, modifica la prop `glowColor`:

```tsx
// Ejemplos de colores
glowColor="from-red-500"      // Rojo
glowColor="from-blue-500"     // Azul
glowColor="from-green-500"    // Verde
glowColor="from-purple-500"   // Púrpura
glowColor="from-yellow-500"   // Amarillo
glowColor="from-pink-500"     // Rosa
```

### Tamaños de Tarjetas
Para cambiar el tamaño de las tarjetas, modifica la prop `className`:

```tsx
// Ejemplos de tamaños
className="h-32"              // Pequeño
className="h-40"              // Mediano
className="h-48"              // Grande
className="h-64"              // Extra grande
```

### Efectos de Hover
Las tarjetas incluyen efectos de hover automáticos:
- Cambio de opacidad del fondo
- Escalado del icono
- Transiciones suaves

## 🎨 Efectos Visuales

### Glassmorphism
- **Fondo**: `bg-white/5` con `backdrop-blur-lg`
- **Bordes**: `border-white/10`
- **Hover**: `hover:bg-white/10`

### Auras de Color
- **Animación**: `animate-pulse`
- **Opacidad**: `opacity-20`
- **Blur**: `blur-3xl`
- **Posición**: `absolute -top-1/2 -left-1/2`

### Transiciones
- **Duración**: `duration-300`
- **Easing**: `ease-in-out`
- **Propiedades**: `transition-all`

## 🚀 Próximas Mejoras

- [ ] Drag & Drop para reordenar tarjetas
- [ ] Modo oscuro/claro
- [ ] Animaciones de entrada más elaboradas
- [ ] Integración con el sistema de audio en tiempo real
- [ ] Tarjetas dinámicas basadas en el estado del sistema
- [ ] Filtros y búsqueda en el dashboard de efectos

## 📝 Notas de Desarrollo

- El sistema está completamente tipado con TypeScript
- Utiliza Tailwind CSS para todos los estilos
- Es completamente responsive
- Compatible con Next.js 14+
- Optimizado para rendimiento

## 🤝 Contribución

Para contribuir al sistema Bento Grid:

1. Crea nuevos componentes en `src/components/ui/`
2. Actualiza las exportaciones en `index.ts`
3. Añade documentación en este README
4. Prueba en diferentes tamaños de pantalla
5. Verifica que no haya errores de linting

---

**Desarrollado para Solomon House - Sistema de Audio Espacial 3D** 🎵✨

