import * as THREE from 'three';

/**
 * Predictor de Trayectorias del Usuario (roadmap 6.5).
 *
 * Filtro alfa-beta (forma simplificada y estable del filtro de Kalman de
 * velocidad constante) sobre la posición del oyente. Estima posición y
 * velocidad suavizadas a partir de las muestras por frame y permite
 * extrapolar hacia dónde camina el usuario, de modo que el motor de audio
 * prepare con antelación las transiciones de las zonas de efectos y la
 * espacialización circundante en lugar de reaccionar tarde.
 */

/** Ganancias del filtro: alpha corrige posición, beta corrige velocidad. */
const ALPHA = 0.5;
const BETA = 0.05;

/** Velocidad máxima creíble (unidades/s): descarta teletransportes. */
const MAX_SPEED = 40;

export class TrajectoryPredictor {
  private estimate = new THREE.Vector3();
  private velocity = new THREE.Vector3();
  private lastTime: number | null = null;
  private initialized = false;

  private residual = new THREE.Vector3();
  private predicted = new THREE.Vector3();

  /** Alimenta el filtro con la posición observada en este frame. */
  public update(position: THREE.Vector3, timeSeconds: number): void {
    if (!this.initialized || this.lastTime === null) {
      this.estimate.copy(position);
      this.velocity.set(0, 0, 0);
      this.lastTime = timeSeconds;
      this.initialized = true;
      return;
    }

    const dt = timeSeconds - this.lastTime;
    this.lastTime = timeSeconds;
    if (dt <= 0 || dt > 0.5) {
      // Frame perdido o pausa larga: re-anclar sin inventar velocidad
      this.estimate.copy(position);
      this.velocity.set(0, 0, 0);
      return;
    }

    // Predicción del paso (modelo de velocidad constante)
    this.estimate.addScaledVector(this.velocity, dt);

    // Corrección alfa-beta con el residuo observado
    this.residual.copy(position).sub(this.estimate);
    this.estimate.addScaledVector(this.residual, ALPHA);
    this.velocity.addScaledVector(this.residual, BETA / dt);

    // Descartar velocidades imposibles (teletransporte entre cuadrículas)
    if (this.velocity.length() > MAX_SPEED) {
      this.velocity.set(0, 0, 0);
      this.estimate.copy(position);
    }
  }

  /**
   * Posición anticipada del usuario `horizonSeconds` en el futuro.
   * Si el filtro aún no tiene historia devuelve la última estimación.
   */
  public predict(horizonSeconds: number, out = new THREE.Vector3()): THREE.Vector3 {
    return out.copy(this.estimate).addScaledVector(this.velocity, horizonSeconds);
  }

  /** Velocidad estimada actual (unidades/s). */
  public getVelocity(out = new THREE.Vector3()): THREE.Vector3 {
    return out.copy(this.velocity);
  }

  public reset(): void {
    this.initialized = false;
    this.lastTime = null;
    this.velocity.set(0, 0, 0);
  }
}
