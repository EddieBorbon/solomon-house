'use client';

import React, { useMemo, useRef } from 'react';
import { create } from 'zustand';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useWorldStore } from '../../state/useWorldStore';
import { audioManager } from '../../lib/AudioManager';

/**
 * Notaciones Visuales en Tiempo Real (roadmap 5.6) con Renderizado
 * Instanciado (roadmap 3.2).
 *
 * Proyecta guías en el suelo virtual que indican la influencia espacial
 * del sonido de cada objeto: un anillo concéntrico bajo su posición (radio
 * según el modelo de atenuación vigente y el volumen, color del objeto) y
 * un hilo vertical que une el objeto con su huella.
 *
 * Todas las guías de todos los objetos se agrupan en DOS llamados de
 * dibujo (un InstancedMesh para anillos, otro para pilares),
 * independientemente de la densidad de la sala.
 */

const MAX_GUIDES = 512;

interface NotationGuidesState {
  enabled: boolean;
  toggle: () => void;
}

export const useNotationGuidesStore = create<NotationGuidesState>((set) => ({
  enabled: false,
  toggle: () => set((state) => ({ enabled: !state.enabled })),
}));

/**
 * Radio en el que la atenuación por distancia cae a ~25% según el modelo
 * inverso de la Web Audio API, escalado por el volumen del objeto.
 */
function influenceRadius(volume: number): number {
  const { refDistance, rolloffFactor } = audioManager.getSpatialConfig();
  const base = refDistance + (3 * refDistance) / Math.max(0.1, rolloffFactor);
  return base * (0.5 + Math.min(1, Math.max(0, volume)));
}

export function InfluenceGuides() {
  const enabled = useNotationGuidesStore((state) => state.enabled);
  const ringsRef = useRef<THREE.InstancedMesh>(null);
  const pillarsRef = useRef<THREE.InstancedMesh>(null);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  useFrame(() => {
    const rings = ringsRef.current;
    const pillars = pillarsRef.current;
    if (!rings || !pillars) return;

    const { grids } = useWorldStore.getState();
    let index = 0;

    for (const grid of grids.values()) {
      for (const obj of grid.objects) {
        if (index >= MAX_GUIDES) break;

        const worldX = grid.position[0] + obj.position[0];
        const worldY = grid.position[1] + obj.position[1];
        const worldZ = grid.position[2] + obj.position[2];
        const radius = influenceRadius(obj.audioParams?.volume ?? 0.6);

        // Los drones activos brillan con su color; los percusivos en reposo
        // se atenúan (la opacidad es compartida por todo el lote instanciado)
        tempColor.set(obj.audioParams?.color || '#8b5cf6');
        if (!obj.audioEnabled) {
          tempColor.multiplyScalar(0.35);
        }

        // Anillo de influencia proyectado en el suelo
        dummy.position.set(worldX, 0.02, worldZ);
        dummy.rotation.set(-Math.PI / 2, 0, 0);
        dummy.scale.set(radius, radius, 1);
        dummy.updateMatrix();
        rings.setMatrixAt(index, dummy.matrix);
        rings.setColorAt(index, tempColor);

        // Hilo vertical: une el objeto con su huella
        dummy.position.set(worldX, worldY / 2, worldZ);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, Math.max(0.001, Math.abs(worldY)), 1);
        dummy.updateMatrix();
        pillars.setMatrixAt(index, dummy.matrix);
        pillars.setColorAt(index, tempColor);

        index++;
      }
    }

    rings.count = index;
    pillars.count = index;
    rings.instanceMatrix.needsUpdate = true;
    pillars.instanceMatrix.needsUpdate = true;
    if (rings.instanceColor) rings.instanceColor.needsUpdate = true;
    if (pillars.instanceColor) pillars.instanceColor.needsUpdate = true;
  });

  if (!enabled) return null;

  return (
    <>
      <instancedMesh
        ref={ringsRef}
        args={[undefined, undefined, MAX_GUIDES]}
        frustumCulled={false}
      >
        <ringGeometry args={[0.96, 1, 48]} />
        <meshBasicMaterial
          transparent
          opacity={0.45}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </instancedMesh>

      <instancedMesh
        ref={pillarsRef}
        args={[undefined, undefined, MAX_GUIDES]}
        frustumCulled={false}
      >
        <cylinderGeometry args={[0.01, 0.01, 1, 4]} />
        <meshBasicMaterial transparent opacity={0.15} depthWrite={false} />
      </instancedMesh>
    </>
  );
}
