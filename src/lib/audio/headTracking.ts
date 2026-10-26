import * as THREE from 'three';

/**
 * Seguimiento de cabeza con la Device Orientation API (roadmap 4.5).
 *
 * En navegadores móviles, la rotación física del dispositivo (sostenido
 * frente al rostro o montado en un visor tipo Cardboard) se interpreta como
 * la rotación de la cabeza del oyente. El vector "hacia adelante" resultante
 * sustituye al de la cámara orbital al actualizar el listener binaural,
 * compensando instantáneamente la espacialización cuando el usuario gira
 * físicamente la cabeza.
 *
 * Es un singleton de módulo: la UI lo enciende/apaga y el bucle de render
 * (Experience) consulta `getForward()` en cada frame.
 */

// Conversión estándar de ángulos deviceorientation a quaternion
// (misma matemática que los DeviceOrientationControls clásicos de Three.js)
const zee = new THREE.Vector3(0, 0, 1);
const euler = new THREE.Euler();
const q0 = new THREE.Quaternion();
// Rotación de -90° en X: alinear "pantalla hacia el usuario" con "mirada al frente"
const q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));

interface HeadTrackingState {
  active: boolean;
  quaternion: THREE.Quaternion;
  hasReading: boolean;
}

const state: HeadTrackingState = {
  active: false,
  quaternion: new THREE.Quaternion(),
  hasReading: false,
};

function getScreenOrientationAngle(): number {
  if (typeof window === 'undefined') return 0;
  return (window.screen?.orientation?.angle ?? 0) as number;
}

function handleOrientation(event: DeviceOrientationEvent): void {
  if (event.alpha === null || event.beta === null || event.gamma === null) {
    return;
  }

  const alpha = THREE.MathUtils.degToRad(event.alpha);
  const beta = THREE.MathUtils.degToRad(event.beta);
  const gamma = THREE.MathUtils.degToRad(event.gamma);
  const orient = THREE.MathUtils.degToRad(getScreenOrientationAngle());

  euler.set(beta, alpha, -gamma, 'YXZ');
  state.quaternion.setFromEuler(euler);
  state.quaternion.multiply(q1);
  state.quaternion.multiply(q0.setFromAxisAngle(zee, -orient));
  state.hasReading = true;
}

/** Comprueba si el dispositivo expone la Device Orientation API. */
export function isHeadTrackingSupported(): boolean {
  return typeof window !== 'undefined' && 'DeviceOrientationEvent' in window;
}

/**
 * Activa el seguimiento. En iOS solicita el permiso explícito requerido.
 * Devuelve true si quedó activo.
 */
export async function enableHeadTracking(): Promise<boolean> {
  if (!isHeadTrackingSupported() || state.active) {
    return state.active;
  }

  // iOS >= 13 exige permiso explícito mediante gesto del usuario
  const DOEvent = DeviceOrientationEvent as unknown as {
    requestPermission?: () => Promise<'granted' | 'denied'>;
  };
  if (typeof DOEvent.requestPermission === 'function') {
    try {
      const permission = await DOEvent.requestPermission();
      if (permission !== 'granted') {
        return false;
      }
    } catch {
      return false;
    }
  }

  window.addEventListener('deviceorientation', handleOrientation);
  state.active = true;
  state.hasReading = false;
  return true;
}

/** Desactiva el seguimiento y vuelve a la orientación de cámara. */
export function disableHeadTracking(): void {
  if (typeof window !== 'undefined') {
    window.removeEventListener('deviceorientation', handleOrientation);
  }
  state.active = false;
  state.hasReading = false;
}

export function isHeadTrackingActive(): boolean {
  return state.active;
}

/**
 * Vector "hacia adelante" del oyente según la orientación física del
 * dispositivo, o null si el seguimiento no está activo o aún no hay
 * lecturas del sensor (en ese caso se usa la cámara).
 */
export function getHeadTrackingForward(out = new THREE.Vector3()): THREE.Vector3 | null {
  if (!state.active || !state.hasReading) {
    return null;
  }
  return out.set(0, 0, -1).applyQuaternion(state.quaternion);
}
