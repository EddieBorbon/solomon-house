import { TutorialStep } from '../../stores/useTutorialStore';

export const tutorialSteps: TutorialStep[] = [
  {
    id: 'step-1',
    title: 'Rotar con el Mouse',
    description: '👆 Haz clic derecho y arrastra para rotar la cámara alrededor del espacio.',
    targetElement: undefined,
    position: 'center',
    action: {
      type: 'rotate',
      message: 'Clic derecho + arrastrar para rotar la vista',
    },
    verification: {
      check: () => {
        // Se verifica en el componente TutorialOverlay
        return false; // Se actualiza dinámicamente
      },
      successMessage: '¡Perfecto! Ahora sabes rotar la cámara.',
      failureMessage: 'Intenta hacer clic derecho y arrastrar el mouse.',
    },
    hints: [
      '🖱️ Clic derecho + arrastrar = rotar cámara',
      '🔥 La vista girará alrededor del espacio',
      '⚠️ Si la cámara se bloquea, actualiza la página (F5) y vuelve a iniciar',
    ],
    estimatedTime: 30,
    skipAllowed: false,
  },
  {
    id: 'step-2',
    title: 'Hacer Zoom',
    description: '🖱️ Usa la rueda del mouse para acercarte o alejarte.',
    targetElement: undefined,
    position: 'center',
    action: {
      type: 'zoom',
      message: 'Usa la rueda del mouse para hacer zoom',
    },
    verification: {
      check: () => false,
      successMessage: '¡Excelente! Ahora puedes hacer zoom.',
      failureMessage: 'Intenta hacer zoom con la rueda del mouse.',
    },
    hints: [
      '🔍 Rueda arriba = acercar',
      '🔍 Rueda abajo = alejar',
    ],
    estimatedTime: 20,
    skipAllowed: false,
  },
  {
    id: 'step-3',
    title: 'Moverte con el Teclado',
    description: '⌨️ Presiona W/A/S/D/E/Q para mover la cámara en el espacio.',
    targetElement: undefined,
    position: 'center',
    action: {
      type: 'move',
      message: 'Presiona W, A, S, D, E, Q para moverte',
    },
    verification: {
      check: () => false,
      successMessage: '¡Genial! Ya puedes moverte por el espacio.',
      failureMessage: 'Presiona W (adelante), A (izquierda), S (atrás), D (derecha), E (arriba), Q (abajo).',
    },
    hints: [
      '⬆️ W = Adelante',
      '⬅️ A = Izquierda',
      '⬇️ S = Atrás',
      '➡️ D = Derecha',
      '⬆️ E = Arriba',
      '⬇️ Q = Abajo',
    ],
    estimatedTime: 30,
    skipAllowed: false,
  },
  {
    id: 'step-4',
    title: 'Mover Rápidamente',
    description: '⚡ Mantén presionado Shift mientras te mueves para acelerar.',
    targetElement: undefined,
    position: 'center',
    action: {
      type: 'shift',
      message: 'Mantén Shift + WASD para moverte rápido',
    },
    verification: {
      check: () => false,
      successMessage: '¡Perfecto! Ya dominas la navegación.',
      failureMessage: 'Presiona Shift + W para moverte más rápido.',
    },
    hints: [
      '⚡ Shift = Velocidad rápida',
      '🔥 Combina con W/A/S/D/E/Q',
    ],
    estimatedTime: 20,
    skipAllowed: false,
  },
  {
    id: 'step-5',
    title: 'Crear Tu Primer Objeto Sonoro',
    description: '🎵 Ahora aprenderás a crear objetos sonoros. El panel izquierdo se ha desbloqueado.',
    targetElement: undefined,
    position: 'center',
    action: {
      type: 'create',
      message: 'Crea un objeto sonoro usando el panel izquierdo',
    },
    verification: {
      check: () => false,
      successMessage: '¡Excelente! Has creado tu primer objeto sonoro.',
      failureMessage: 'Usa el panel izquierdo para crear un objeto.',
    },
    hints: [
      '1️⃣ Abre el panel izquierdo haciendo clic en la flecha',
      '2️⃣ Busca la sección "OBJETOS SONOROS"',
      '3️⃣ Haz clic en el botón "CUBO" para crear tu primer objeto',
      '4️⃣ El objeto aparecerá en el espacio 3D',
      '🎵 Cada objeto tiene su propio sonido asociado',
    ],
    estimatedTime: 120,
    skipAllowed: false,
  },
  {
    id: 'step-6',
    title: 'Usar Gizmos para Transformar Objetos',
    description: '🎯 Aprende a usar los gizmos (controles visuales) para mover, rotar y escalar objetos.',
    targetElement: undefined,
    position: 'center',
    action: {
      type: 'transform',
      message: 'Usa los gizmos para transformar objetos',
    },
    verification: {
      check: () => false,
      successMessage: '¡Perfecto! Ya sabes usar los gizmos.',
      failureMessage: 'Intenta seleccionar un objeto y usar los gizmos.',
    },
    hints: [
      '1️⃣ Haz clic en un objeto del espacio 3D para seleccionarlo',
      '2️⃣ Aparecerán los gizmos de colores alrededor del objeto',
      '3️⃣ Usa las teclas para cambiar el modo:',
      '   ⌨️ G = Gizmo de Mover (azul/verde/rojo)',
      '   ⌨️ R = Gizmo de Rotar (anillos)',
      '   ⌨️ X = Gizmo de Escalar (cubos pequeños)',
      '4️⃣ Arrastra los controles de colores para transformar',
      '5️⃣ Presiona ESC para salir del modo edición',
      '6️⃣ Presiona DELETE para eliminar el objeto seleccionado',
    ],
    estimatedTime: 180,
    skipAllowed: false,
  },
  {
    id: 'step-7',
    title: 'Experimentar con Audio Espacial',
    description: 'Acércate y aléjate de los objetos sonoros para percibir cómo cambia el audio según tu posición (audio espacial 3D).',
    targetElement: undefined,
    position: 'center',
    action: {
      type: 'playback',
      message: 'Acércate y aléjate de los objetos para experimentar el audio espacial',
    },
    verification: {
      check: () => {
        // Se verifica dinámicamente en el componente TutorialOverlay
        return false; // Se actualiza dinámicamente
      },
      successMessage: '¡Excelente! Ya entiendes cómo funciona el audio espacial.',
      failureMessage: 'Acércate y aléjate de los objetos para experimentar la espacialización.',
    },
    hints: [],
    estimatedTime: 180,
    skipAllowed: false,
  },
  {
    id: 'step-8',
    title: 'Editar Parámetros de Audio',
    description: 'Personaliza los sonidos de los objetos usando el panel derecho. Modifica frecuencia, Attack, Decay, Sustain y Release.',
    targetElement: undefined,
    position: 'center',
    action: {
      type: 'configure',
      message: 'Usa el panel derecho para editar parámetros de audio',
    },
    verification: {
      check: () => {
        // Se verifica dinámicamente en el componente TutorialOverlay
        return false; // Se actualiza dinámicamente
      },
      successMessage: '¡Perfecto! Ya sabes cómo personalizar los sonidos.',
      failureMessage: 'Modifica al menos un parámetro usando los sliders del panel derecho.',
    },
    hints: [
      '1️⃣ Selecciona un objeto en el espacio 3D',
      '2️⃣ El panel derecho se desbloquea automáticamente',
      '3️⃣ Usa los sliders y cajas para modificar parámetros como frecuencia, Attack, Decay, Sustain, Release, waveform, modulation, etc.',
      '4️⃣ Los cambios se aplican en tiempo real',
    ],
    estimatedTime: 240,
    skipAllowed: false,
  },
  {
    id: 'step-9',
    title: 'Editar Apariencia Visual',
    description: 'Personaliza el aspecto visual del objeto modificando su color, material y animación.',
    targetElement: undefined,
    position: 'center',
    action: {
      type: 'configure',
      message: 'Usa la sección de Color y Material para cambiar la apariencia del objeto',
    },
    verification: {
      check: () => {
        // Se verifica dinámicamente en el componente TutorialOverlay
        return false; // Se actualiza dinámicamente
      },
      successMessage: '¡Genial! Ya sabes cómo personalizar la apariencia visual.',
      failureMessage: 'Modifica el color o material del objeto usando la sección de Color.',
    },
    hints: [
      'Experimenta con diferentes materiales, colores y animaciones',
    ],
    estimatedTime: 180,
    skipAllowed: false,
  },
  {
    id: 'step-10',
    title: 'Zonas de Efectos Espaciales',
    description: 'Crea zonas de efectos que aplican diferentes procesamientos de audio según la proximidad de los objetos. Haz clic en una zona para editar sus parámetros.',
    targetElement: undefined,
    position: 'center',
    action: {
      type: 'create',
      message: 'Crea una zona de efecto usando el panel izquierdo y edita sus parámetros',
    },
    verification: {
      check: () => {
        // Se verifica dinámicamente en el componente TutorialOverlay
        return false; // Se actualiza dinámicamente
      },
      successMessage: '¡Excelente! Ya sabes cómo funcionan las zonas de efectos espaciales.',
      failureMessage: 'Crea una zona de efecto usando el panel izquierdo y edita sus parámetros.',
    },
    hints: [
      'Usa el panel izquierdo para crear zonas de efectos',
      'Haz clic en la zona de efectos creada',
      'El panel derecho se habilita para editar parámetros del efecto',
      'Las zonas afectan solo a objetos que estén dentro de ellas',
    ],
    estimatedTime: 300,
    skipAllowed: false,
  },
  {
    id: 'step-11',
    title: 'Objetos Móviles',
    description: 'Crea objetos móviles que se mueven por el espacio y activan objetos sonoros al pasar cerca de ellos.',
    targetElement: undefined,
    position: 'center',
    action: {
      type: 'create',
      message: 'Crea un objeto móvil y objetos sonoros como conos que se activan cuando el objeto móvil pasa cerca',
    },
    verification: {
      check: () => {
        // Se verifica dinámicamente en el componente TutorialOverlay
        return false; // Se actualiza dinámicamente
      },
      successMessage: '¡Perfecto! Ya entiendes cómo funcionan los objetos móviles.',
      failureMessage: 'Crea un objeto móvil y objetos sonoros que se activen con el movimiento.',
    },
    hints: [
      '1️⃣ Crea primero un objeto móvil usando el panel izquierdo',
      '2️⃣ Luego crea objetos sonoros como conos, pirámides o icosaedros cerca del objeto móvil',
      '3️⃣ Estos objetos se activan automáticamente cuando el objeto móvil pasa por encima de ellos',
      '4️⃣ Edita los parámetros del objeto móvil (velocidad, trayectoria) desde el panel derecho',
    ],
    estimatedTime: 300,
    skipAllowed: false,
  },
];

