'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon, PlayIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';

interface CodeEditorProps {
  title: string;
  code: string;
  onSave: (code: string) => void;
  onClose: () => void;
  example: string;
  language: 'javascript' | 'webgl';
}

interface Example {
  name: string;
  description: string;
  category: 'básico' | 'intermedio' | 'avanzado';
  code: string;
}

const THREE_JS_EXAMPLES: Example[] = [
  // BÁSICO
  {
    name: '01 - Cubo Simple',
    description: 'Un cubo básico',
    category: 'básico',
    code: `const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ 
  color: 0xff00ff,
});
const mesh = new THREE.Mesh(geometry, material);
return mesh;`
  },
  {
    name: '02 - Cubo con Dimensiones',
    description: 'Un cubo con tamaños personalizados',
    category: 'básico',
    code: `const geometry = new THREE.BoxGeometry(2, 1, 0.5);
const material = new THREE.MeshStandardMaterial({ 
  color: 0x00ff00,
});
const mesh = new THREE.Mesh(geometry, material);
return mesh;`
  },
  {
    name: '03 - Esfera',
    description: 'Una esfera básica',
    category: 'básico',
    code: `const geometry = new THREE.SphereGeometry(1, 32, 16);
const material = new THREE.MeshStandardMaterial({ 
  color: 0x00ffff,
});
const mesh = new THREE.Mesh(geometry, material);
return mesh;`
  },
  {
    name: '04 - Cilindro',
    description: 'Un cilindro con capas',
    category: 'básico',
    code: `const geometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 32);
const material = new THREE.MeshStandardMaterial({ 
  color: 0xffff00,
});
const mesh = new THREE.Mesh(geometry, material);
return mesh;`
  },
  {
    name: '05 - Torus',
    description: 'Un toro (donut)',
    category: 'básico',
    code: `const geometry = new THREE.TorusGeometry(1, 0.3, 16, 100);
const material = new THREE.MeshStandardMaterial({ 
  color: 0xff0000,
});
const mesh = new THREE.Mesh(geometry, material);
return mesh;`
  },
  
  // INTERMEDIO
  {
    name: '06 - Cubo Colorido',
    description: 'Cubo con material sólido',
    category: 'intermedio',
    code: `const geometry = new THREE.BoxGeometry(1.5, 1, 0.5);
const material = new THREE.MeshStandardMaterial({ 
  color: 0xff00ff,
  emissive: 0x440044,
  metalness: 0.8,
  roughness: 0.2
});
const mesh = new THREE.Mesh(geometry, material);
return mesh;`
  },
  {
    name: '07 - Esfera Emisiva',
    description: 'Esfera que emite luz propia',
    category: 'intermedio',
    code: `const geometry = new THREE.SphereGeometry(1, 32, 16);
const material = new THREE.MeshStandardMaterial({ 
  color: 0x0000ff,
  emissive: 0x0000ff,
  emissiveIntensity: 0.5
});
const mesh = new THREE.Mesh(geometry, material);
return mesh;`
  },
  {
    name: '08 - Octahedron',
    description: 'Octaedro con caras definidas',
    category: 'intermedio',
    code: `const geometry = new THREE.OctahedronGeometry(1, 0);
const material = new THREE.MeshStandardMaterial({ 
  color: 0x00ff00,
});
const mesh = new THREE.Mesh(geometry, material);
return mesh;`
  },
  {
    name: '09 - Icosahedron',
    description: 'Icosaedro de alta resolución',
    category: 'intermedio',
    code: `const geometry = new THREE.IcosahedronGeometry(1, 1);
const material = new THREE.MeshStandardMaterial({ 
  color: 0xff00ff,
});
const mesh = new THREE.Mesh(geometry, material);
return mesh;`
  },
  {
    name: '10 - Torus Knot',
    description: 'Nudo toroidal complejo',
    category: 'intermedio',
    code: `const geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
const material = new THREE.MeshStandardMaterial({ 
  color: 0xffff00,
});
const mesh = new THREE.Mesh(geometry, material);
return mesh;`
  },
  {
    name: '11 - Tetrahedron',
    description: 'Tetraedro de 4 caras',
    category: 'intermedio',
    code: `const geometry = new THREE.TetrahedronGeometry(1, 0);
const material = new THREE.MeshStandardMaterial({ 
  color: 0xff8800,
});
const mesh = new THREE.Mesh(geometry, material);
return mesh;`
  },
  {
    name: '12 - Dodecahedron',
    description: 'Dodecaedro regular de 12 caras',
    category: 'intermedio',
    code: `const geometry = new THREE.DodecahedronGeometry(1, 0);
const material = new THREE.MeshStandardMaterial({ 
  color: 0x8800ff,
});
const mesh = new THREE.Mesh(geometry, material);
return mesh;`
  },
  {
    name: '13 - Ring',
    description: 'Anillo con dimensiones',
    category: 'intermedio',
    code: `const geometry = new THREE.RingGeometry(0.5, 1, 32);
const material = new THREE.MeshStandardMaterial({ 
  color: 0x00ffff,
});
const mesh = new THREE.Mesh(geometry, material);
return mesh;`
  },
  {
    name: '14 - Cone',
    description: 'Cono con extremos definidos',
    category: 'intermedio',
    code: `const geometry = new THREE.ConeGeometry(0.8, 2, 32);
const material = new THREE.MeshStandardMaterial({ 
  color: 0xff00ff,
});
const mesh = new THREE.Mesh(geometry, material);
return mesh;`
  },
  {
    name: '15 - Plane',
    description: 'Plano 2D con segmentos',
    category: 'intermedio',
    code: `const geometry = new THREE.PlaneGeometry(2, 2, 10, 10);
const material = new THREE.MeshStandardMaterial({ 
  color: 0x00ff00,
});
const mesh = new THREE.Mesh(geometry, material);
return mesh;`
  },
  {
    name: '16 - Cone con Extremos',
    description: 'Cono truncado con radio inferior',
    category: 'intermedio',
    code: `const geometry = new THREE.ConeGeometry(1, 2, 32, 1, true);
const material = new THREE.MeshStandardMaterial({ 
  color: 0xffff00,
});
const mesh = new THREE.Mesh(geometry, material);
return mesh;`
  },
  {
    name: '17 - Material Dual',
    description: 'Objeto con material interior y exterior',
    category: 'intermedio',
    code: `const geometry = new THREE.SphereGeometry(1, 32, 16);
const material1 = new THREE.MeshStandardMaterial({ 
  color: 0xff0000,
  side: THREE.FrontSide
});
const material2 = new THREE.MeshStandardMaterial({ 
  color: 0x0000ff,
  side: THREE.BackSide
});
const mesh = new THREE.Mesh(geometry, material1);
mesh.add(new THREE.Mesh(geometry, material2));
return mesh;`
  },
  
  // AVANZADO
  {
    name: '11 - Geometría Personalizada',
    description: 'Crear geometría desde vértices manual',
    category: 'avanzado',
    code: `const vertices = new Float32Array([
  -1, -1,  0,
   1, -1,  0,
   1,  1,  0,
  -1,  1,  0
]);
const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
const material = new THREE.MeshStandardMaterial({ 
  color: 0xff0000,
});
const mesh = new THREE.Mesh(geometry, material);
return mesh;`
  },
  {
    name: '12 - Multi Geometría',
    description: 'Combinar múltiples geometrías',
    category: 'avanzado',
    code: `const g1 = new THREE.BoxGeometry(0.5, 2, 0.5);
const g2 = new THREE.SphereGeometry(0.8, 16, 16);
const g3 = new THREE.CylinderGeometry(0.3, 0.3, 1.5, 16);
const material = new THREE.MeshStandardMaterial({ 
  color: 0x00ffff,
});
const mesh = new THREE.Mesh(g1, material);
mesh.add(new THREE.Mesh(g2, material.clone()));
mesh.add(new THREE.Mesh(g3, material.clone()));
return mesh;`
  },
  {
    name: '13 - Material Avanzado',
    description: 'Material con múltiples propiedades',
    category: 'avanzado',
    code: `const geometry = new THREE.IcosahedronGeometry(1, 1);
const material = new THREE.MeshStandardMaterial({ 
  color: 0xffffff,
  metalness: 1,
  roughness: 0,
  emissive: 0x5500aa,
  emissiveIntensity: 0.8
});
const mesh = new THREE.Mesh(geometry, material);
return mesh;`
  },
  {
    name: '14 - Tube Geometry',
    description: 'Geometría tubular con curva',
    category: 'avanzado',
    code: `const path = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-2, 0, 0),
  new THREE.Vector3(-1, 1, 0),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(1, -1, 0),
  new THREE.Vector3(2, 0, 0)
]);
const geometry = new THREE.TubeGeometry(path, 100, 0.2, 8, false);
const material = new THREE.MeshStandardMaterial({ 
  color: 0x00ff88,
});
const mesh = new THREE.Mesh(geometry, material);
return mesh;`
  },
  {
    name: '15 - Lathe Geometry',
    description: 'Geometría creada por rotación',
    category: 'avanzado',
    code: `const points = [];
for (let i = 0; i < 10; i++) {
  points.push(new THREE.Vector2(
    Math.sin(i * 0.2) * 0.5 + 0.5,
    (i - 5) * 0.2
  ));
}
const geometry = new THREE.LatheGeometry(points);
const material = new THREE.MeshStandardMaterial({ 
  color: 0xff8800,
});
const mesh = new THREE.Mesh(geometry, material);
return mesh;`
  },
  {
    name: '16 - Extrude Geometry',
    description: 'Extrusión de forma 2D a 3D',
    category: 'avanzado',
    code: `const shape = new THREE.Shape();
shape.moveTo(0, 0);
shape.lineTo(1, 0);
shape.lineTo(1, 1);
shape.lineTo(0, 1);
shape.lineTo(0, 0);
const extrudeSettings = { depth: 0.2, bevelEnabled: true, bevelSegments: 5 };
const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
const material = new THREE.MeshStandardMaterial({ 
  color: 0x8888ff,
});
const mesh = new THREE.Mesh(geometry, material);
return mesh;`
  },
  {
    name: '17 - BufferGeometry Personalizado',
    description: 'Geometría con índices personalizados',
    category: 'avanzado',
    code: `const geometry = new THREE.BufferGeometry();
const vertices = new Float32Array([
  -1, -1, 0,  1, -1, 0,  1, 1, 0,
  -1, 1, 0,   0, 1.5, 0
]);
const indices = new Uint16Array([0, 1, 2, 0, 2, 3, 1, 2, 4]);
geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
geometry.setIndex(new THREE.BufferAttribute(indices, 1));
const material = new THREE.MeshStandardMaterial({ 
  color: 0xff0088,
});
const mesh = new THREE.Mesh(geometry, material);
return mesh;`
  },
  {
    name: '18 - Edges Geometry',
    description: 'Solo bordes de una geometría',
    category: 'avanzado',
    code: `const geometry = new THREE.IcosahedronGeometry(1, 1);
const edges = new THREE.EdgesGeometry(geometry);
const material = new THREE.LineBasicMaterial({ 
  color: 0x00ffff,
  linewidth: 2
});
const mesh = new THREE.LineSegments(edges, material);
return mesh;`
  },
  {
    name: '19 - Geometry con Normal',
    description: 'Geometría con normales personalizadas',
    category: 'avanzado',
    code: `const geometry = new THREE.BoxGeometry(1, 1, 1);
geometry.computeVertexNormals();
const material = new THREE.MeshStandardMaterial({ 
  color: 0xff0000,
});
const mesh = new THREE.Mesh(geometry, material);
return mesh;`
  },
  {
    name: '20 - Procedural Spiral',
    description: 'Espiral generada programáticamente',
    category: 'avanzado',
    code: `const points = [];
for (let i = 0; i < 50; i++) {
  const t = i / 50 * 2 * Math.PI;
  const x = Math.cos(t) * (0.5 + t * 0.1);
  const y = t * 0.2;
  const z = Math.sin(t) * (0.5 + t * 0.1);
  points.push(new THREE.Vector3(x, y, z));
}
const geometry = new THREE.BufferGeometry().setFromPoints(points);
const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
const mesh = new THREE.Line(geometry, material);
return mesh;`
  },
  {
    name: '21 - Parametric Geometry',
    description: 'Geometría paramétrica con función',
    category: 'avanzado',
    code: `const func = (u, v) => {
  const x = u * Math.PI * 2;
  const y = v * Math.PI * 2;
  return new THREE.Vector3(
    Math.sin(x) * Math.cos(y) * 0.8,
    Math.sin(y) * 0.8,
    Math.cos(x) * Math.cos(y) * 0.8
  );
};
const geometry = new THREE.ParametricGeometry(func, 50, 50);
const material = new THREE.MeshStandardMaterial({ 
  color: 0xff00ff,
});
const mesh = new THREE.Mesh(geometry, material);
return mesh;`
  },
  {
    name: '22 - Group Complexo',
    description: 'Grupo con múltiples objetos transformados',
    category: 'avanzado',
    code: `const group = new THREE.Group();
const colors = [0xff0000, 0x00ff00, 0x0000ff];
for (let i = 0; i < 3; i++) {
  const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const material = new THREE.MeshStandardMaterial({ 
    color: colors[i],
  });
  const cube = new THREE.Mesh(geometry, material);
  cube.position.x = (i - 1) * 0.8;
  cube.rotation.y = i * 0.5;
  group.add(cube);
}
return group;`
  },
  {
    name: '23 - Material Double Side',
    description: 'Material que se ve por ambos lados',
    category: 'avanzado',
    code: `const geometry = new THREE.SphereGeometry(1, 32, 16);
const material = new THREE.MeshStandardMaterial({ 
  color: 0xff00ff,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.8
});
const mesh = new THREE.Mesh(geometry, material);
return mesh;`
  },
  {
    name: '24 - Sweep Geometry',
    description: 'Barrido de curva a lo largo de path',
    category: 'avanzado',
    code: `const points = [
  new THREE.Vector3(-1, 0, 0),
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(1, 0, 0)
];
const path = new THREE.CatmullRomCurve3(points);
const geometry = new THREE.TubeGeometry(path, 64, 0.15, 8, false);
const material = new THREE.MeshStandardMaterial({ 
  color: 0xff8888,
});
const mesh = new THREE.Mesh(geometry, material);
return mesh;`
  }
];

const TONE_JS_EXAMPLES: Example[] = [
  // BÁSICO
  {
    name: '01 - Synth Simple',
    description: 'Sintetizador básico simple',
    category: 'básico',
    code: `const synth = new Tone.Synth().toDestination();
return synth;`
  },
  {
    name: '02 - Synth con Nota',
    description: 'Sintetizador que toca una nota',
    category: 'básico',
    code: `const synth = new Tone.Synth({
  oscillator: { type: "sine" }
}).toDestination();
return synth;`
  },
  {
    name: '03 - AM Synth',
    description: 'Síntesis de modulación de amplitud',
    category: 'básico',
    code: `const synth = new Tone.AMSynth().toDestination();
return synth;`
  },
  {
    name: '04 - FM Synth',
    description: 'Síntesis de modulación de frecuencia',
    category: 'básico',
    code: `const synth = new Tone.FMSynth().toDestination();
return synth;`
  },
  {
    name: '05 - MonoSynth',
    description: 'Monosintetizador',
    category: 'básico',
    code: `const synth = new Tone.MonoSynth().toDestination();
return synth;`
  },
  
  // INTERMEDIO
  {
    name: '06 - Synth con Envelope',
    description: 'Synth con envolvente personalizada',
    category: 'intermedio',
    code: `const synth = new Tone.Synth({
  oscillator: { type: "sine" },
  envelope: {
    attack: 0.1,
    decay: 0.2,
    sustain: 0.5,
    release: 0.8
  }
}).toDestination();
return synth;`
  },
  {
    name: '07 - DuoSynth',
    description: 'Síntesis con dos osciladores',
    category: 'intermedio',
    code: `const synth = new Tone.DuoSynth().toDestination();
return synth;`
  },
  {
    name: '08 - MembraneSynth',
    description: 'Simula un tambor',
    category: 'intermedio',
    code: `const synth = new Tone.MembraneSynth({
  pitchDecay: 0.05,
  octaves: 10,
  oscillator: { type: 'sine' },
  envelope: {
    attack: 0.001,
    decay: 0.4,
    sustain: 0.01,
    release: 1.4
  }
}).toDestination();
return synth;`
  },
  {
    name: '09 - MetalSynth',
    description: 'Sonido metálico percusivo',
    category: 'intermedio',
    code: `const synth = new Tone.MetalSynth({
  frequency: 200,
  envelope: {
    attack: 0.001,
    decay: 1.4,
    release: 0.2
  },
  harmonicity: 8.5,
  modulationIndex: 40,
  resonance: 3000,
  octaves: 1.5
}).toDestination();
return synth;`
  },
  {
    name: '10 - PluckSynth',
    description: 'Simula sonido de cuerda pellizcada',
    category: 'intermedio',
    code: `const synth = new Tone.PluckSynth({
  attackNoise: 1,
  dampening: 2000,
  resonance: 0.7
}).toDestination();
return synth;`
  },
  {
    name: '11 - NoiseSynth',
    description: 'Ruido con envolvente',
    category: 'intermedio',
    code: `const synth = new Tone.NoiseSynth({
  noise: { type: "white" },
  envelope: {
    attack: 0.005,
    decay: 0.1,
    sustain: 0.0,
    release: 0.1
  }
}).toDestination();
return synth;`
  },
  {
    name: '12 - Synth con Reverb',
    description: 'Synth con efecto de reverberación',
    category: 'intermedio',
    code: `const synth = new Tone.Synth({
  oscillator: { type: "sine" },
  envelope: {
    attack: 0.1,
    decay: 0.2,
    sustain: 0.5,
    release: 0.8
  }
}).chain(new Tone.Reverb(2).toDestination());
return synth;`
  },
  {
    name: '13 - PolySynth',
    description: 'Puede tocar múltiples notas',
    category: 'intermedio',
    code: `const synth = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: "sine" },
  envelope: {
    attack: 0.1,
    decay: 0.2,
    sustain: 0.5,
    release: 0.8
  }
}).toDestination();
return synth;`
  },
  
  // AVANZADO
  {
    name: '14 - Synth con LFO',
    description: 'Oscilador de baja frecuencia',
    category: 'avanzado',
    code: `const synth = new Tone.Synth({
  oscillator: { type: "sine" }
}).toDestination();

const lfo = new Tone.LFO({
  frequency: 2,
  min: 400,
  max: 800
});
lfo.start();
lfo.connect(synth.oscillator.frequency);

return synth;`
  },
  {
    name: '15 - Synth con Delay',
    description: 'Efecto de delay/eco',
    category: 'avanzado',
    code: `const synth = new Tone.Synth({
  oscillator: { type: "sine" },
  envelope: {
    attack: 0.1,
    decay: 0.2,
    sustain: 0.5,
    release: 0.8
  }
}).chain(new Tone.FeedbackDelay(0.5, 0.3).toDestination());
return synth;`
  },
  {
    name: '16 - Synth con Chorus',
    description: 'Efecto de coro',
    category: 'avanzado',
    code: `const synth = new Tone.Synth({
  oscillator: { type: "sine" }
}).chain(new Tone.Chorus({
  frequency: 1.5,
  delayTime: 3.5,
  depth: 0.7,
  feedback: 0.4
}).toDestination());
return synth;`
  },
  {
    name: '17 - Synth con Filtro',
    description: 'Filtro paso bajo',
    category: 'avanzado',
    code: `const synth = new Tone.Synth({
  oscillator: { type: "sawtooth" },
  envelope: {
    attack: 0.1,
    decay: 0.2,
    sustain: 0.5,
    release: 0.8
  }
}).chain(new Tone.AutoFilter({
  frequency: 1,
  baseFrequency: 200,
  octaves: 2.6,
  depth: 0.1
}).toDestination());
return synth;`
  },
  {
    name: '18 - Synth con Vibrato',
    description: 'Modulación de frecuencia',
    category: 'avanzado',
    code: `const synth = new Tone.Synth({
  oscillator: { type: "sine" },
  envelope: {
    attack: 0.1,
    decay: 0.2,
    sustain: 0.5,
    release: 0.8
  }
}).chain(new Tone.Vibrato({
  frequency: 5,
  depth: 1,
  wet: 0.5
}).toDestination());
return synth;`
  },
  {
    name: '19 - Synth Multiefecto',
    description: 'Múltiples efectos encadenados',
    category: 'avanzado',
    code: `const synth = new Tone.Synth({
  oscillator: { type: "sine" },
  envelope: {
    attack: 0.1,
    decay: 0.2,
    sustain: 0.5,
    release: 0.8
  }
});

const reverb = new Tone.Reverb(2);
const delay = new Tone.PingPongDelay(0.4, 0.3);
const dist = new Tone.Distortion(0.4);

synth.chain(reverb, delay, dist).toDestination();

return synth;`
  },
  {
    name: '20 - Synth con Echo',
    description: 'Síntesis con efecto de eco',
    category: 'avanzado',
    code: `const synth = new Tone.Synth({
  oscillator: { type: "sine" },
  envelope: {
    attack: 0.1,
    decay: 0.2,
    sustain: 0.5,
    release: 0.8
  }
}).chain(
  new Tone.PingPongDelay(0.5, 0.3),
  new Tone.FeedbackDelay(0.3, 0.4)
).toDestination();

return synth;`
  },
  {
    name: '21 - Synth con Waveform',
    description: 'Forma de onda personalizada',
    category: 'avanzado',
    code: `const waveform = [1, 0.5, 0.2, -0.2, -0.5, -1];
const synth = new Tone.Oscillator({
  type: "custom",
  waveform: waveform,
  frequency: 440
}).toDestination();

return synth;`
  },
  {
    name: '22 - Synth Stereo',
    description: 'Configuración estéreo',
    category: 'avanzado',
    code: `const synth = new Tone.Synth({
  oscillator: { type: "sine" },
  envelope: {
    attack: 0.1,
    decay: 0.2,
    sustain: 0.5,
    release: 0.8
  }
});

const panner = new Tone.Panner(0.5);
const reverb = new Tone.Reverb(2);

synth.chain(panner, reverb).toDestination();

return synth;`
  },
  {
    name: '23 - Synth con BitCrusher',
    description: 'Efecto de reducción de bits',
    category: 'avanzado',
    code: `const synth = new Tone.Synth({
  oscillator: { type: "sawtooth" },
  envelope: {
    attack: 0.1,
    decay: 0.2,
    sustain: 0.5,
    release: 0.8
  }
}).chain(new Tone.BitCrusher({
  bits: 4,
  wet: 0.5
}).toDestination());
return synth;`
  },
  {
    name: '24 - Synth Completo',
    description: 'Configuración avanzada completa',
    category: 'avanzado',
    code: `const synth = new Tone.MonoSynth({
  oscillator: {
    type: "sine",
    detune: 0
  },
  filter: {
    Q: 2,
    frequency: 350,
    type: "lowpass",
    detune: 0
  },
  envelope: {
    attack: 0.1,
    decay: 0.2,
    sustain: 0.5,
    release: 0.8
  },
  filterEnvelope: {
    attack: 0.001,
    decay: 0.1,
    sustain: 0.5,
    release: 1,
    baseFrequency: 300,
    octaves: 4
  }
}).chain(
  new Tone.Chorus({ frequency: 1.5, delayTime: 3.5, depth: 0.7 }),
  new Tone.Reverb(2)
).toDestination();

return synth;`
  }
];

export function CodeEditor({ title, code, onSave, onClose, example, language }: CodeEditorProps) {
  const { t } = useLanguage();
  const [editedCode, setEditedCode] = useState(code);
  const [showExamplesPanel, setShowExamplesPanel] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Seleccionar ejemplos según el lenguaje
  const examples = language === 'javascript' ? TONE_JS_EXAMPLES : THREE_JS_EXAMPLES;

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleSave = () => {
    onSave(editedCode);
    onClose();
  };

  const handleLoadExample = (exampleCode: string) => {
    setEditedCode(exampleCode);
    setShowExamplesPanel(false);
  };

  const editorContent = (
    <div className="fixed inset-0 z-[9999] flex bg-black/95 backdrop-blur-md">
      {/* Panel de Ejemplos */}
      {showExamplesPanel && (
        <div className="w-80 bg-black border-r border-purple-500 flex flex-col">
          <div className="p-4 border-b border-purple-500 flex items-center gap-2">
            <BookOpenIcon className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-mono font-bold text-white tracking-wider">{t('codeEditor.examplesTitle')}</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {/* BÁSICO */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2 px-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <h4 className="text-xs font-mono text-green-400 font-bold">{t('codeEditor.basic')}</h4>
              </div>
              {examples.filter(e => e.category === 'básico').map((ex, idx) => (
                <button
                  key={idx}
                  onClick={() => handleLoadExample(ex.code)}
                  className="w-full text-left p-2 mb-1 border border-gray-700 hover:border-purple-500 transition-colors group"
                >
                  <div className="text-xs font-mono text-white group-hover:text-purple-400">
                    {ex.name}
                  </div>
                  <div className="text-xs text-gray-400 text-[10px]">
                    {ex.description}
                  </div>
                </button>
              ))}
            </div>

            {/* INTERMEDIO */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2 px-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <h4 className="text-xs font-mono text-yellow-400 font-bold">{t('codeEditor.intermediate')}</h4>
              </div>
              {examples.filter(e => e.category === 'intermedio').map((ex, idx) => (
                <button
                  key={idx}
                  onClick={() => handleLoadExample(ex.code)}
                  className="w-full text-left p-2 mb-1 border border-gray-700 hover:border-purple-500 transition-colors group"
                >
                  <div className="text-xs font-mono text-white group-hover:text-purple-400">
                    {ex.name}
                  </div>
                  <div className="text-xs text-gray-400 text-[10px]">
                    {ex.description}
                  </div>
                </button>
              ))}
            </div>

            {/* AVANZADO */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2 px-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <h4 className="text-xs font-mono text-red-400 font-bold">{t('codeEditor.advanced')}</h4>
              </div>
              {examples.filter(e => e.category === 'avanzado').map((ex, idx) => (
                <button
                  key={idx}
                  onClick={() => handleLoadExample(ex.code)}
                  className="w-full text-left p-2 mb-1 border border-gray-700 hover:border-purple-500 transition-colors group"
                >
                  <div className="text-xs font-mono text-white group-hover:text-purple-400">
                    {ex.name}
                  </div>
                  <div className="text-xs text-gray-400 text-[10px]">
                    {ex.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Editor Principal */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <CommandLineIcon className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-mono font-bold text-white tracking-wider">{title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowExamplesPanel(!showExamplesPanel)}
              className="relative border border-purple-500 px-3 py-1 text-purple-400 hover:bg-purple-500 hover:text-white transition-all duration-300 group text-sm font-mono"
            >
              <div className="absolute -inset-0.5 border border-purple-600 group-hover:border-purple-400 transition-colors duration-300"></div>
              <span className="relative flex items-center gap-2">
                <BookOpenIcon className="w-4 h-4" />
                {t('codeEditor.examples')}
              </span>
            </button>
            <button
              onClick={onClose}
              className="relative border border-red-500 px-3 py-1 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 group"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 p-4 overflow-hidden flex flex-col">
          <div className="relative flex-1">
            {/* Numbering */}
            <div className="absolute left-0 top-0 bottom-0 w-12 border-r border-gray-700 text-gray-500 text-xs font-mono pt-2 overflow-y-auto">
              {editedCode.split('\n').map((_, i) => (
                <div key={i} className="h-[21px] text-right pr-2">{i + 1}</div>
              ))}
            </div>
            
            {/* Code Textarea */}
            <textarea
              value={editedCode}
              onChange={(e) => setEditedCode(e.target.value)}
              className="w-full h-full bg-black text-green-400 font-mono text-sm p-2 pl-16 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 border-0"
              spellCheck={false}
              placeholder={language === 'javascript' ? t('codeEditor.tonePlaceholder') : t('codeEditor.threePlaceholder')}
              style={{ minHeight: '100%' }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-white bg-black/95 flex-shrink-0">
          <div className="text-xs text-gray-400 font-mono">
            {language === 'javascript' ? t('codeEditor.toneApi') : t('codeEditor.threeApi')}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="relative border border-gray-600 px-4 py-2 text-gray-400 hover:bg-gray-600 hover:text-white transition-all duration-300 text-sm font-mono"
            >
              {t('codeEditor.cancel')}
            </button>
            <button
              onClick={handleSave}
              className="relative border border-green-500 px-4 py-2 text-green-400 hover:bg-green-500 hover:text-white transition-all duration-300 text-sm font-mono flex items-center gap-2"
            >
              <PlayIcon className="w-4 h-4" />
              {t('codeEditor.saveAndExecute')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;

  return createPortal(editorContent, document.body);
}

// Icon component
function CommandLineIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}