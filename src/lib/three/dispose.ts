import * as THREE from 'three';

/**
 * Utilidades de Garbage Collection manual para recursos de GPU (Three.js).
 *
 * Three.js no libera automáticamente la memoria de GPU (VRAM) asociada a
 * geometrías, materiales y texturas cuando un objeto sale del grafo de escena.
 * Estas utilidades implementan la liberación explícita y recursiva exigida
 * por el roadmap (tarea 3.1) y deben invocarse cada vez que un usuario
 * elimina un objeto del espacio o abandona la sesión/sala.
 */

/**
 * Libera las texturas referenciadas por un material antes de liberarlo.
 */
function disposeMaterial(material: THREE.Material): void {
  // Liberar todas las texturas colgadas del material (map, normalMap, envMap, etc.)
  const record = material as unknown as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    const value = record[key];
    if (value instanceof THREE.Texture) {
      value.dispose();
    }
  }
  material.dispose();
}

/**
 * Libera la geometría y el/los materiales de un mesh individual.
 * Implementación de referencia de la tarea 3.1 del roadmap.
 */
export function disposeMesh(mesh: THREE.Mesh | THREE.Line | THREE.Points): void {
  if (mesh.geometry) {
    mesh.geometry.dispose();
  }
  if (mesh.material) {
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach((m) => disposeMaterial(m));
    } else {
      disposeMaterial(mesh.material);
    }
  }
}

/**
 * Recorre recursivamente un subárbol de la escena (Group, Mesh, etc.)
 * liberando todos los recursos de GPU que encuentre.
 *
 * Uso típico: al desmontar el contenedor de un objeto sonoro o al
 * destruir la escena completa al salir de una sala.
 */
export function disposeObject3D(root: THREE.Object3D | null | undefined): void {
  if (!root) return;
  root.traverse((node) => {
    if (
      node instanceof THREE.Mesh ||
      node instanceof THREE.Line ||
      node instanceof THREE.Points
    ) {
      disposeMesh(node);
    }
  });
}
