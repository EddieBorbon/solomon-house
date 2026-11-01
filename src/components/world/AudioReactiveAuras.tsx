'use client';

import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import * as Tone from 'tone';
import { useWorldStore, type EffectZone } from '../../state/useWorldStore';
import { useVisualSonicStore } from '../../lib/mapping/visualSonicCoherence';

/**
 * Shaders Reactivos al Audio y Visuales de Zonas de Efecto (Etapa E3.2.2 y E3.2.4).
 *
 * - Cada objeto sonoro activo recibe un aura cuyo shader GLSL desplaza los
 *   vértices y modula el color con el análisis espectral FFT en tiempo real (E3.2.2).
 * - Cada zona de efecto (`EffectZone`) proyecta una firma visual derivada de su
 *   efecto acústico (E3.2.4):
 *     * Reverb: halo difuso de neblina esférica que se expande.
 *     * Delay / PingPong: anillos concéntricos de eco periódicos.
 *     * Distortion / BitCrusher: pulso octaedral anguloso.
 *     * Chorus / Phaser / Tremolo / Vibrato / PitchShift: ondas toroidales moduladas.
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

function EffectZoneVisualSignature({ zone }: { zone: EffectZone }) {
  const groupRef = useRef<THREE.Group>(null);
  const radius = Math.max(0.8, zone.effectParams?.radius ?? Math.max(...zone.scale) * 1.4);

  useFrame(({ clock }) => {
    const grp = groupRef.current;
    if (!grp) return;
    const t = clock.elapsedTime;
    if (zone.type === 'reverb' || zone.type === 'freeverb' || zone.type === 'jcReverb') {
      // Reverb difumina: respiración suave de neblina
      const s = 1 + Math.sin(t * 1.2) * 0.08;
      grp.scale.set(s, s, s);
    } else if (zone.type === 'feedbackDelay' || zone.type === 'pingPongDelay') {
      // Delay repite: rotación escalonada de anillos concéntricos
      grp.rotation.y = t * 0.6;
    } else if (zone.type === 'distortion' || zone.type === 'bitCrusher' || zone.type === 'chebyshev') {
      // Distorsión satura con pulso anguloso
      const pulse = 1 + (Math.sin(t * 9.0) > 0.3 ? 0.14 : -0.05);
      grp.scale.set(pulse, pulse, pulse);
      grp.rotation.x = t * 0.9;
      grp.rotation.z = t * 0.7;
    } else {
      grp.rotation.y = t * 0.4;
    }
  });

  if (zone.type === 'feedbackDelay' || zone.type === 'pingPongDelay') {
    return (
      <group ref={groupRef} position={zone.position}>
        {[0.55, 0.8, 1.05].map((rFactor, idx) => (
          <mesh key={idx} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[radius * rFactor, 0.025, 12, 48]} />
            <meshBasicMaterial
              color="#38bdf8"
              transparent
              opacity={0.28 - idx * 0.07}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>
    );
  }

  if (zone.type === 'distortion' || zone.type === 'bitCrusher' || zone.type === 'chebyshev') {
    return (
      <group ref={groupRef} position={zone.position}>
        <mesh>
          <octahedronGeometry args={[radius * 0.85, 0]} />
          <meshBasicMaterial
            color="#f97316"
            wireframe
            transparent
            opacity={0.32}
            depthWrite={false}
          />
        </mesh>
      </group>
    );
  }

  // Por defecto (Reverb / Chorus / Phaser / Filter): halo difuso envolvente
  return (
    <group ref={groupRef} position={zone.position}>
      <mesh>
        <sphereGeometry args={[radius, 24, 18]} />
        <meshBasicMaterial
          color="#a78bfa"
          transparent
          opacity={0.09}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

export function AudioReactiveAuras() {
  const { grids } = useWorldStore();
  const acousmaticMode = useVisualSonicStore((s) => s.acousmaticMode);
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

  if (acousmaticMode) return null;

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
          {(grid.effectZones ?? []).map((zone) => (
            <EffectZoneVisualSignature key={`ez-aura-${zone.id}`} zone={zone} />
          ))}
        </group>
      ))}
    </>
  );
}
