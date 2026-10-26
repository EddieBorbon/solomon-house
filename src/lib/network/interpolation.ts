import * as THREE from 'three';

/**
 * Interpolación y extrapolación de movimiento en red (roadmap 1.5).
 *
 * Los estados sincronizados por red (Firebase/WebRTC) llegan en pasos
 * discretos con jitter. Estas utilidades reconstruyen un movimiento continuo
 * en el cliente (Dead Reckoning): interpolación lineal entre instantáneas
 * recibidas y extrapolación acotada por velocidad cuando la red se atrasa.
 */

interface Snapshot {
  position: THREE.Vector3;
  time: number; // ms (performance.now())
}

/** Retardo de render respecto al último estado recibido, para tener
 *  siempre dos instantáneas entre las cuales interpolar. */
const RENDER_DELAY_MS = 100;

/** Máximo tiempo de extrapolación cuando no llegan estados nuevos. */
const MAX_EXTRAPOLATION_MS = 250;

/** Número máximo de instantáneas retenidas en el buffer. */
const MAX_SNAPSHOTS = 20;

export class SnapshotInterpolator {
  private buffer: Snapshot[] = [];

  /** Registra una instantánea de posición recibida por red. */
  public addSnapshot(position: [number, number, number], time = performance.now()): void {
    this.buffer.push({ position: new THREE.Vector3(...position), time });
    if (this.buffer.length > MAX_SNAPSHOTS) {
      this.buffer.shift();
    }
  }

  /**
   * Calcula la posición interpolada para el instante actual.
   * Devuelve null si aún no hay instantáneas.
   */
  public sample(now = performance.now(), out = new THREE.Vector3()): THREE.Vector3 | null {
    if (this.buffer.length === 0) return null;

    const renderTime = now - RENDER_DELAY_MS;

    // Buscar el par de instantáneas que rodea al tiempo de render
    for (let i = this.buffer.length - 1; i > 0; i--) {
      const newer = this.buffer[i];
      const older = this.buffer[i - 1];
      if (older.time <= renderTime && renderTime <= newer.time) {
        const span = newer.time - older.time;
        const t = span > 0 ? (renderTime - older.time) / span : 1;
        return out.copy(older.position).lerp(newer.position, t);
      }
    }

    const last = this.buffer[this.buffer.length - 1];

    // Extrapolación (dead reckoning): proyectar la última velocidad conocida
    if (renderTime > last.time && this.buffer.length >= 2) {
      const prev = this.buffer[this.buffer.length - 2];
      const dt = last.time - prev.time;
      if (dt > 0) {
        const elapsed = Math.min(renderTime - last.time, MAX_EXTRAPOLATION_MS);
        const velocity = out.copy(last.position).sub(prev.position).divideScalar(dt);
        return velocity.multiplyScalar(elapsed).add(last.position);
      }
    }

    return out.copy(last.position);
  }

  public clear(): void {
    this.buffer = [];
  }
}

/** Constante de tiempo del suavizado exponencial (segundos). */
const SMOOTHING_TAU = 0.08;

/** Distancia a partir de la cual se salta directamente (teletransporte). */
const SNAP_DISTANCE = 8;
const SNAP_DISTANCE_SQ = SNAP_DISTANCE * SNAP_DISTANCE;

/**
 * Acerca exponencialmente `current` hacia `target`, independiente del
 * framerate. Si la distancia supera SNAP_DISTANCE se copia directamente
 * (cambio de sala o teletransporte, donde interpolar no tiene sentido).
 */
export function smoothTowards(
  current: THREE.Vector3,
  target: THREE.Vector3,
  deltaSeconds: number
): void {
  if (current.distanceToSquared(target) > SNAP_DISTANCE_SQ) {
    current.copy(target);
    return;
  }
  const alpha = 1 - Math.exp(-deltaSeconds / SMOOTHING_TAU);
  current.lerp(target, alpha);
}
