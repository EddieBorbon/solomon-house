<div align="center">

# 🏛️ La Casa de Salomón / Solomon House

**Arquitectura Sonoro-Espacial Telemática**  
**Telematic Sonoro-Spatial Architecture**

[![Next.js](https://img.shields.io/badge/Next.js-15.4.6-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-0.179.1-green)](https://threejs.org/)
[![Tone.js](https://img.shields.io/badge/Tone.js-15.1.22-orange)](https://tonejs.github.io/)
[![Firebase](https://img.shields.io/badge/Firebase-12.3.0-yellow)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

**Una plataforma web de composición sonora 3D colaborativa en tiempo real**  
**A web-based collaborative real-time 3D sound composition platform**

[Características](#-características-principales--key-features) • [Instalación](#-instalación--installation) • [Uso](#-uso--usage) • [Documentación](#-documentación--documentation) • [Contacto](#-contacto--contact)

</div>

---

<details>
<summary><h2>📑 Tabla de Contenidos / Table of Contents</h2></summary>

### Español
- [Introducción y Contexto](#-introducción-y-contexto--introduction-and-context)
- [Características Principales](#-características-principales--key-features)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas--tech-stack)
- [Requisitos del Sistema](#-requisitos-del-sistema--system-requirements)
- [Instalación](#-instalación--installation)
- [Configuración](#-configuración--configuration)
- [Uso](#-uso--usage)
- [Atajos de Teclado](#-atajos-de-teclado--keyboard-shortcuts)
- [Arquitectura del Proyecto](#-arquitectura-del-proyecto--project-architecture)
- [Componentes Principales](#-componentes-principales--main-components)
- [Tipos de Objetos Sonoros](#-tipos-de-objetos-sonoros--sound-object-types)
- [Sistema de Efectos](#-sistema-de-efectos--effects-system)
- [Colaboración en Tiempo Real](#-colaboración-en-tiempo-real--real-time-collaboration)
- [Internacionalización](#-internacionalización--internationalization)
- [Tutorial Interactivo](#-tutorial-interactivo--interactive-tutorial)
- [Scripts Disponibles](#-scripts-disponibles--available-scripts)
- [Desarrollo](#-desarrollo--development)
- [Despliegue](#-despliegue--deployment)
- [Solución de Problemas](#-solución-de-problemas--troubleshooting)
- [Rendimiento](#-rendimiento--performance)
- [Seguridad](#-seguridad--security)
- [Roadmap](#-roadmap--roadmap)
- [Contribuir](#-contribuir--contributing)
- [Licencia](#-licencia--license)
- [Autor y Agradecimientos](#-autor-y-agradecimientos--author-and-acknowledgments)
- [Referencias y Recursos](#-referencias-y-recursos--references-and-resources)
- [Contacto](#-contacto--contact)

### English
- [Introduction and Context](#-introducción-y-contexto--introduction-and-context)
- [Key Features](#-características-principales--key-features)
- [Tech Stack](#-tecnologías-utilizadas--tech-stack)
- [System Requirements](#-requisitos-del-sistema--system-requirements)
- [Installation](#-instalación--installation)
- [Configuration](#-configuración--configuration)
- [Usage](#-uso--usage)
- [Keyboard Shortcuts](#-atajos-de-teclado--keyboard-shortcuts)
- [Project Architecture](#-arquitectura-del-proyecto--project-architecture)
- [Main Components](#-componentes-principales--main-components)
- [Sound Object Types](#-tipos-de-objetos-sonoros--sound-object-types)
- [Effects System](#-sistema-de-efectos--effects-system)
- [Real-Time Collaboration](#-colaboración-en-tiempo-real--real-time-collaboration)
- [Internationalization](#-internacionalización--internationalization)
- [Interactive Tutorial](#-tutorial-interactivo--interactive-tutorial)
- [Available Scripts](#-scripts-disponibles--available-scripts)
- [Development](#-desarrollo--development)
- [Deployment](#-despliegue--deployment)
- [Troubleshooting](#-solución-de-problemas--troubleshooting)
- [Performance](#-rendimiento--performance)
- [Security](#-seguridad--security)
- [Roadmap](#-roadmap--roadmap)
- [Contributing](#-contribuir--contributing)
- [License](#-licencia--license)
- [Author and Acknowledgments](#-autor-y-agradecimientos--author-and-acknowledgments)
- [References and Resources](#-referencias-y-recursos--references-and-resources)
- [Contact](#-contacto--contact)

</details>

---

## 🎯 Introducción y Contexto / Introduction and Context

<details>
<summary><h3>🇪🇸 Español</h3></summary>

### ¿Qué es La Casa de Salomón?

**La Casa de Salomón** es una plataforma web de composición sonora 3D colaborativa en tiempo real que materializa la utopía sónica de Francis Bacon (siglo XVII). Concebida como un laboratorio sónico virtual, esta plataforma permite crear composiciones electroacústicas mediante la interacción espacial con objetos sonoros tridimensionales, trascendiendo el paradigma tradicional de la línea de tiempo.

### Origen e Inspiración

El proyecto se inspira en **"La Nueva Atlántida"** (1627) de Francis Bacon, donde describe las "Casas de Sonido" como laboratorios imaginarios capaces de generar, manipular y esculpir cualquier sonido concebible. Esta visión utópica de 400 años de antigüedad encuentra su realización digital en La Casa de Salomón, transformándose en un espacio abierto y accesible para la comunidad artística global.

### Contexto Académico

Esta plataforma es el artefacto central de una **tesis doctoral en Composición Musical** realizada en la **Universidad Nacional Autónoma de México (UNAM)** bajo el enfoque metodológico de **Investigación-Creación** (Practice-led Research). El proyecto representa una contribución al campo de la composición electroacústica, proponiendo un nuevo paradigma que redefine las relaciones entre compositor, instrumento, partitura y performance.

**Título de la Tesis:**  
"La Casa de Salomón: Arquitectura Sonoro-Espacial Telemática"  
"Diseño e Implementación de un Nuevo Paradigma para la Composición Musical Colaborativa en Red"

### Autor

**Eddie Jonathan García Borbón**  
Compositor e investigador en música electroacústica

- **Doctorado en Música (Composición Musical)** - UNAM (2026)
- **Maestría en Arte Digital** - Universidad Federal del Extremo Oriente (Vladivostok, Rusia)
- **Tutor Principal:** PhD. Manuel Rocha Iturbide
- **Co-Tutores:** PhD. Roberto Morales Manzanares, PhD. Hugo Solís García

**Proyectos Anteriores:**
- Simbiosis 1.0/2.0 - Composición algorítmica con entidades sónicas autónomas
- Gesture Music Control - Control gestual de sintetizador con machine learning
- Mosaico de estaciones sonoras - Proyecto de maestría en VR

### Evolución del Proyecto

El proyecto ha evolucionado a través de tres fases principales:

1. **Fase 1 (2021): Paradigma del "Músico de Datos"**
   - Enfoque inicial en composición algorítmica y Big Data
   - Exploración de la creatividad computacional
   - Proyectos: Simbiosis, Gesture Music Control

2. **Fase 2 (2022-2023): Exploración en Realidad Virtual**
   - Desarrollo en Unity y Oculus Quest
   - Experimentación con Spatial.io
   - Materialización del objeto sonoro en espacios inmersivos
   - Hallazgo crítico: limitaciones de ecosistemas cerrados

3. **Fase 3 (2023-2026): Pivote hacia Tecnologías Web**
   - Implementación actual con tecnologías web abiertas
   - Democratización del acceso al laboratorio sónico
   - Validación mediante taller-laboratorio internacional

### Marco Teórico

La plataforma recontextualiza teorías fundamentales de la música electroacústica:

- **Objeto Sonoro** (Pierre Schaeffer) - Materializado como entidad 3D tangible
- **Paisaje Sonoro** (R. Murray Schafer) - Espacios sonoros dinámicos y evolutivos
- **Escultura Sonora** - Práctica compositiva como escultura en tiempo real
- **Composición Colaborativa** - Autoría distribuida y diálogo espacial
- **Arte Telemático** - Creación en red y co-presencia virtual

### Propósito y Objetivos

- **Trascender la línea de tiempo:** Proponer composición como arquitectura de espacios sonoros
- **Democratizar el acceso:** Herramientas avanzadas accesibles desde cualquier navegador
- **Facilitar colaboración:** Creación en tiempo real con múltiples usuarios
- **Investigar nuevas metodologías:** Explorar prácticas compositivas emergentes

### Apoyos Institucionales

- **Ministerio de las Culturas, las Artes y los Saberes de Colombia**  
  Convocatoria "Colombia en el Mundo: Portafolio Cultural Internacional - Línea 2-Diáspora"

- **Center for Electroacoustic Music** - Conservatorio Estatal de Moscú  
  Presentación en conferencia internacional "Archiving the Present 2.0" (2025)

- **Instituciones Académicas:**
  - Universidad Nacional Autónoma de México (UNAM)
  - Universidad Distrital Francisco José de Caldas (UDFJC)
  - Far Eastern Federal University (DVFU)
  - Nanjing University of the Arts (NUA)

</details>

<details>
<summary><h3>🇬🇧 English</h3></summary>

### What is Solomon House?

**Solomon House** is a web-based collaborative real-time 3D sound composition platform that materializes Francis Bacon's sonic utopia (17th century). Conceived as a virtual sonic laboratory, this platform enables the creation of electroacoustic compositions through spatial interaction with three-dimensional sound objects, transcending the traditional timeline paradigm.

### Origin and Inspiration

The project is inspired by Francis Bacon's **"New Atlantis"** (1627), which describes "Houses of Sound" as imaginary laboratories capable of generating, manipulating, and sculpting any conceivable sound. This 400-year-old utopian vision finds its digital realization in Solomon House, transforming into an open and accessible space for the global artistic community.

### Academic Context

This platform is the central artifact of a **doctoral dissertation in Musical Composition** conducted at the **National Autonomous University of Mexico (UNAM)** under the methodological approach of **Research-Creation** (Practice-led Research). The project represents a contribution to the field of electroacoustic composition, proposing a new paradigm that redefines the relationships between composer, instrument, score, and performance.

**Dissertation Title:**  
"Solomon House: Telematic Sonoro-Spatial Architecture"  
"Design and Implementation of a New Paradigm for Collaborative Musical Composition in Network"

### Author

**Eddie Jonathan García Borbón**  
Composer and researcher in electroacoustic music

- **Doctorate in Music (Musical Composition)** - UNAM (2026)
- **Master's in Digital Art** - Far Eastern Federal University (Vladivostok, Russia)
- **Main Advisor:** PhD. Manuel Rocha Iturbide
- **Co-Advisors:** PhD. Roberto Morales Manzanares, PhD. Hugo Solís García

**Previous Projects:**
- Simbiosis 1.0/2.0 - Algorithmic composition with autonomous sonic entities
- Gesture Music Control - Gestural synthesizer control with machine learning
- Mosaic of Sound Stations - Master's project in VR

### Project Evolution

The project has evolved through three main phases:

1. **Phase 1 (2021): "Data Musician" Paradigm**
   - Initial focus on algorithmic composition and Big Data
   - Exploration of computational creativity
   - Projects: Simbiosis, Gesture Music Control

2. **Phase 2 (2022-2023): Virtual Reality Exploration**
   - Development in Unity and Oculus Quest
   - Experimentation with Spatial.io
   - Materialization of sound object in immersive spaces
   - Critical finding: limitations of closed ecosystems

3. **Phase 3 (2023-2026): Pivot to Web Technologies**
   - Current implementation with open web technologies
   - Democratization of access to sonic laboratory
   - Validation through international workshop-laboratory

### Theoretical Framework

The platform recontextualizes fundamental theories of electroacoustic music:

- **Sound Object** (Pierre Schaeffer) - Materialized as tangible 3D entity
- **Soundscape** (R. Murray Schafer) - Dynamic and evolutionary sonic spaces
- **Sound Sculpture** - Compositional practice as real-time sculpture
- **Collaborative Composition** - Distributed authorship and spatial dialogue
- **Telematic Art** - Network creation and virtual co-presence

### Purpose and Objectives

- **Transcend the timeline:** Propose composition as architecture of sonic spaces
- **Democratize access:** Advanced tools accessible from any browser
- **Facilitate collaboration:** Real-time creation with multiple users
- **Investigate new methodologies:** Explore emerging compositional practices

### Institutional Support

- **Ministry of Cultures, Arts, and Knowledge of Colombia**  
  "Colombia in the World: International Cultural Portfolio - Line 2-Diaspora" call

- **Center for Electroacoustic Music** - Moscow State Conservatory  
  Presentation at international conference "Archiving the Present 2.0" (2025)

- **Academic Institutions:**
  - National Autonomous University of Mexico (UNAM)
  - Francisco José de Caldas District University (UDFJC)
  - Far Eastern Federal University (DVFU)
  - Nanjing University of the Arts (NUA)

</details>

---

## ✨ Características Principales / Key Features

<details>
<summary><h3>🇪🇸 Español</h3></summary>

### 🎵 Composición Sonora 3D Espacial
- Creación de composiciones mediante interacción espacial con objetos sonoros 3D
- Espacialización de audio en tiempo real basada en posición 3D
- Sistema de audio espacial inmersivo con HRTF (Head-Related Transfer Function)

### 🤝 Colaboración en Tiempo Real
- Múltiples usuarios pueden crear simultáneamente en el mismo espacio
- Sincronización en tiempo real mediante Firebase
- Co-presencia virtual y diálogo espacial

### 🎨 Múltiples Objetos Sonoros
- **Cubo** - Síntesis AM (Amplitude Modulation)
- **Esfera** - Síntesis FM (Frequency Modulation)
- **Cilindro** - Síntesis Duo
- **Pirámide, Toro, Plano, Icosaedro, Dodecaedro, Espiral, Cono**
- Objetos personalizados con geometrías personalizadas

### 🎛️ Sistema de Efectos Avanzado
- Más de 20 efectos de audio disponibles
- Reverb, Delay, Distortion, Chorus, Tremolo, Vibrato, Phaser
- BitCrusher, AutoFilter, AutoWah, Compressor, FeedbackDelay
- Freeverb, FrequencyShifter, PingPongDelay, PitchShift, StereoWidener
- Zonas de efectos espaciales que modifican el sonido según la posición

### 🖼️ Interfaz 3D Interactiva
- Renderizado 3D con React Three Fiber y Three.js
- Navegación fluida en espacio 3D
- Controles de transformación (mover, rotar, escalar)
- Visualización en tiempo real de parámetros de audio

### 🌐 Multiidioma
- Soporte para 7 idiomas: Español, Inglés, Ruso, Chino, Tailandés, Birmano, Francés
- Interfaz completamente traducida
- Sistema de internacionalización con next-intl

### 📚 Tutorial Interactivo
- Sistema de tutorial paso a paso
- Guía para nuevos usuarios
- Progreso guardado
- Aprendizaje progresivo

### 🎹 Editor de Parámetros en Tiempo Real
- Edición de parámetros de síntesis en tiempo real
- Control de ADSR (Attack, Decay, Sustain, Release)
- Modulación de frecuencia, amplitud y timbre
- Preview instantáneo de cambios

### 🎮 Sistema de Transformación 3D
- Modos de transformación: Mover (G), Rotar (R), Escalar (S)
- Gizmos visuales para manipulación precisa
- Atajos de teclado para operaciones rápidas

### 🔄 Sincronización en Tiempo Real
- Sincronización automática de objetos y parámetros
- Gestión de conflictos en colaboración
- Optimizaciones de Firestore para performance

</details>

<details>
<summary><h3>🇬🇧 English</h3></summary>

### 🎵 3D Spatial Sound Composition
- Create compositions through spatial interaction with 3D sound objects
- Real-time audio spatialization based on 3D position
- Immersive spatial audio system with HRTF (Head-Related Transfer Function)

### 🤝 Real-Time Collaboration
- Multiple users can create simultaneously in the same space
- Real-time synchronization via Firebase
- Virtual co-presence and spatial dialogue

### 🎨 Multiple Sound Objects
- **Cube** - AM Synthesis (Amplitude Modulation)
- **Sphere** - FM Synthesis (Frequency Modulation)
- **Cylinder** - Duo Synthesis
- **Pyramid, Torus, Plane, Icosahedron, Dodecahedron, Spiral, Cone**
- Custom objects with custom geometries

### 🎛️ Advanced Effects System
- More than 20 audio effects available
- Reverb, Delay, Distortion, Chorus, Tremolo, Vibrato, Phaser
- BitCrusher, AutoFilter, AutoWah, Compressor, FeedbackDelay
- Freeverb, FrequencyShifter, PingPongDelay, PitchShift, StereoWidener
- Spatial effect zones that modify sound based on position

### 🖼️ Interactive 3D Interface
- 3D rendering with React Three Fiber and Three.js
- Fluid navigation in 3D space
- Transformation controls (move, rotate, scale)
- Real-time visualization of audio parameters

### 🌐 Multi-Language
- Support for 7 languages: Spanish, English, Russian, Chinese, Thai, Burmese, French
- Fully translated interface
- Internationalization system with next-intl

### 📚 Interactive Tutorial
- Step-by-step tutorial system
- Guide for new users
- Saved progress
- Progressive learning

### 🎹 Real-Time Parameter Editor
- Real-time synthesis parameter editing
- ADSR control (Attack, Decay, Sustain, Release)
- Frequency, amplitude, and timbre modulation
- Instant preview of changes

### 🎮 3D Transformation System
- Transformation modes: Move (G), Rotate (R), Scale (S)
- Visual gizmos for precise manipulation
- Keyboard shortcuts for quick operations

### 🔄 Real-Time Synchronization
- Automatic synchronization of objects and parameters
- Conflict management in collaboration
- Firestore optimizations for performance

</details>

---

## 🛠️ Tecnologías Utilizadas / Tech Stack

<details>
<summary><h3>🇪🇸 Español</h3></summary>

### Stack Principal

- **Next.js 15.4.6** - Framework de aplicación web con SSR y optimizaciones
- **React 19.1.0** - Biblioteca de interfaz de usuario
- **TypeScript 5.0** - Type safety y mejor desarrollo
- **Three.js 0.179.1** - Motor de gráficos 3D
- **React Three Fiber 9.3.0** - Renderizador declarativo para Three.js
- **@react-three/drei 10.7.2** - Utilidades y helpers para R3F
- **Tone.js 15.1.22** - Motor de audio y síntesis
- **Firebase 12.3.0** - Backend y sincronización en tiempo real
- **Zustand 5.0.7** - Gestión de estado global
- **next-intl 4.3.9** - Internacionalización
- **Tailwind CSS 3.4.17** - Estilos utilitarios

### Dependencias Clave

- **@heroicons/react** - Iconos
- **lucide-react** - Iconos adicionales
- **uuid** - Generación de IDs únicos

### Herramientas de Desarrollo

- **ESLint** - Linter de código
- **PostCSS** - Procesamiento de CSS
- **Autoprefixer** - Compatibilidad de CSS

</details>

<details>
<summary><h3>🇬🇧 English</h3></summary>

### Main Stack

- **Next.js 15.4.6** - Web application framework with SSR and optimizations
- **React 19.1.0** - UI library
- **TypeScript 5.0** - Type safety and better development
- **Three.js 0.179.1** - 3D graphics engine
- **React Three Fiber 9.3.0** - Declarative renderer for Three.js
- **@react-three/drei 10.7.2** - Utilities and helpers for R3F
- **Tone.js 15.1.22** - Audio engine and synthesis
- **Firebase 12.3.0** - Backend and real-time synchronization
- **Zustand 5.0.7** - Global state management
- **next-intl 4.3.9** - Internationalization
- **Tailwind CSS 3.4.17** - Utility styles

### Key Dependencies

- **@heroicons/react** - Icons
- **lucide-react** - Additional icons
- **uuid** - Unique ID generation

### Development Tools

- **ESLint** - Code linter
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS compatibility

</details>

---

## 💻 Requisitos del Sistema / System Requirements

<details>
<summary><h3>🇪🇸 Español</h3></summary>

### Requisitos Mínimos

- **Node.js:** 18.x o superior
- **npm/yarn/pnpm:** Versión más reciente
- **Navegador:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **WebGL:** Soporte para WebGL 2.0
- **Conexión a Internet:** Requerida para Firebase
- **RAM:** Mínimo 4GB recomendado
- **Audio:** Tarjeta de sonido compatible con Web Audio API

### Requisitos Recomendados

- **Node.js:** 20.x LTS
- **RAM:** 8GB o más
- **GPU:** Tarjeta gráfica dedicada para mejor rendimiento 3D
- **Conexión:** Banda ancha estable para colaboración en tiempo real

</details>

<details>
<summary><h3>🇬🇧 English</h3></summary>

### Minimum Requirements

- **Node.js:** 18.x or higher
- **npm/yarn/pnpm:** Latest version
- **Browser:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **WebGL:** WebGL 2.0 support
- **Internet Connection:** Required for Firebase
- **RAM:** Minimum 4GB recommended
- **Audio:** Sound card compatible with Web Audio API

### Recommended Requirements

- **Node.js:** 20.x LTS
- **RAM:** 8GB or more
- **GPU:** Dedicated graphics card for better 3D performance
- **Connection:** Stable broadband for real-time collaboration

</details>

---

## 🚀 Instalación / Installation

<details>
<summary><h3>🇪🇸 Español</h3></summary>

### Prerrequisitos

Asegúrate de tener Node.js y npm instalados en tu sistema.

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/solomon-house.git
   cd solomon-house
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   # o
   yarn install
   # o
   pnpm install
   ```

3. **Configurar variables de entorno**
   
   Crea un archivo `.env.local` en la raíz del proyecto:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
   ```

4. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   # o
   yarn dev
   # o
   pnpm dev
   ```

5. **Abrir en el navegador**
   
   Navega a [http://localhost:3000](http://localhost:3000)

### Configuración de Firebase

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilita Firestore Database
3. Configura las reglas de seguridad (ver sección de Seguridad)
4. Obtén las credenciales y añádelas a `.env.local`

</details>

<details>
<summary><h3>🇬🇧 English</h3></summary>

### Prerequisites

Make sure you have Node.js and npm installed on your system.

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/solomon-house.git
   cd solomon-house
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the project root:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Run in development**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. **Open in browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

### Firebase Configuration

1. Create a project in [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Configure security rules (see Security section)
4. Get credentials and add them to `.env.local`

</details>

---

<div align="center">

**La Casa de Salomón** - Materializando la utopía sónica de Francis Bacon  
**Solomon House** - Materializing Francis Bacon's sonic utopia

Desarrollado con ❤️ por Eddie Jonathan García Borbón  
Developed with ❤️ by Eddie Jonathan García Borbón

</div>
