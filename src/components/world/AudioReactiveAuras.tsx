'use client';

import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import * as Tone from 'tone';
import { useWorldStore } from '../../state/useWorldStore';

/**
 * Shaders Reactivos al Audio (roadmap 3.6).
 *
 * Cada objeto sonoro activo (dron) recibe un aura: una esfera cuyo shader
 * GLSL personalizado desplaza los vértices y modula el color con los datos
 * de análisis espectral FFT en tiempo real. Las bandas graves deforman el
 * ecuador del aura y las agudas los polos, de modo que el espectro se lee
 * como topografía.
 */

const FFT_BINS = 32;

const VERTEX_SHADER = /* glsl */ `
  uniform float uFft[${FFT_BINS}];
  uniform float uTime;
  varying float vEnergy;

  void main() {
    // Latitud del vértice [0..1]: mapea cada franja del aura a una banda FFT
    float latitude = clamp(normal.y * 0.5 + 0.5, 0.0, 0.999);
    int bin = int(latitude * float(${FFT_BINS}));
    float amplitude = uFft[bin];

    vEnergy = amplitude;

    // Desplazamiento radial por banda + respiración lenta
    float displacement = amplitude * 0.45 + sin(uTime * 1.5 + latitude * 12.0) * 0.02;
    vec3 displaced = position + normal * displacement;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColor;
  varying float vEnergy;

  void main() {
    // El color base del objeto se intensifica hacia blanco con la energía
    vec3 color = mix(uColor, vec3(1.0), vEnergy * 0.6);
    float alpha = 0.06 + vEnergy * 0.35;
    gl_FragColor = vec4(color, alpha);
  }
`;

interface AuraProps {
  position: [number, number, number];
  color: string;
  fftRef: React.RefObject<Float32Array | null>;
}

function Aura({ position, color, fftRef }: AuraProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uFft: { value: new Array(FFT_BINS).fill(0) },
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
    }),
    // El color se actualiza por uniform en el frame loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useFrame(({ clock }) => {
    const material = materialRef.current;
    if (!material) return;

    material.uniforms.uTime.value = clock.elapsedTime;
    material.uniforms.uColor.value.set(color);

    const fft = fftRef.current;
    if (fft) {
      const bins = material.uniforms.uFft.value as number[];
      for (let i = 0; i < FFT_BINS; i++) {
        // Normalizar dB [-100..-30] a [0..1] con suavizado de caída
        const normalized = Math.max(0, Math.min(1, (fft[i] + 100) / 70));
        bins[i] = Math.max(normalized, bins[i] * 0.92);
      }
    }
  });

  return (
    <mesh position={position}>
      <sphereGeometry args={[1.1, 48, 32]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

export function AudioReactiveAuras() {
  const { grids } = useWorldStore();
  const analyserRef = useRef<Tone.Analyser | null>(null);
  const fftRef = useRef<Float32Array | null>(null);

  // Analizador FFT global sobre la salida maestra
  useEffect(() => {
    const analyser = new Tone.Analyser('fft', FFT_BINS);
    Tone.getDestination().connect(analyser);
    analyserRef.current = analyser;

    const interval = setInterval(() => {
      const analyserNode = analyserRef.current;
      if (analyserNode) {
        fftRef.current = analyserNode.getValue() as Float32Array;
      }
    }, 50); // ~20 lecturas por segundo

    return () => {
      clearInterval(interval);
      try {
        Tone.getDestination().disconnect(analyser);
      } catch {
        // Contexto ya cerrado
      }
      analyser.dispose();
      analyserRef.current = null;
    };
  }, []);

  return (
    <>
      {Array.from(grids.values()).map((grid) => (
        <group key={`auras-${grid.id}`} position={grid.position}>
          {grid.objects
            .filter((obj) => obj.audioEnabled)
            .map((obj) => (
              <Aura
                key={`aura-${obj.id}`}
                position={obj.position}
                color={obj.audioParams?.color || '#8b5cf6'}
                fftRef={fftRef}
              />
            ))}
        </group>
      ))}
    </>
  );
}
