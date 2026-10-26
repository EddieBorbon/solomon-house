import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { smoothTowards } from '../lib/network/interpolation';

/**
 * Suavizado de movimiento en red (roadmap 1.5 — Dead Reckoning).
 *
 * Las posiciones sincronizadas llegan en pasos discretos (Firebase u otro
 * transporte), lo que produce saltos visibles. Este hook desacopla la
 * posición renderizada de la posición de red: el grupo se desplaza
 * suavemente hacia el último estado conocido en cada frame, mitigando el
 * jitter sin afectar la posición lógica del objeto en el store.
 *
 * `enabled=false` suspende el suavizado: durante un arrastre local con el
 * gizmo, TransformControls mueve el nodo directamente y el store queda
 * rezagado; sin esta pausa, el suavizado tiraría del objeto de vuelta a la
 * posición vieja en cada frame. Mientras está suspendido, el objetivo se
 * mantiene copiado de la posición real del nodo para que al soltar no haya
 * ningún salto de regreso.
 */
export function useNetworkSmoothing(
  groupRef: React.RefObject<THREE.Group | null>,
  position: [number, number, number],
  enabled: boolean = true
): void {
  const target = useRef(new THREE.Vector3(...position));

  useEffect(() => {
    target.current.set(position[0], position[1], position[2]);
  }, [position]);

  useFrame((_, delta) => {
    const node = groupRef.current;
    if (!node) return;
    if (!enabled) {
      // Arrastre local en curso: el gizmo manda. Mantener el objetivo
      // pegado al nodo para que la reanudación sea continua.
      target.current.copy(node.position);
      return;
    }
    smoothTowards(node.position, target.current, delta);
  });
}
