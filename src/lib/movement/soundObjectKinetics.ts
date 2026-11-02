import { type AudioParams } from '../factories/SoundSourceFactory';

/**
 * Motor Cinético 3D y Acústica de Movimiento para Objetos Sonoros (Roadmap M1–M5).
 *
 * Calcula desplazamientos orbitales deterministas, velocidades instantáneas para
 * efecto Doppler, puntos de previsualización de trayectoria 3D, rebote en bordes
 * de cuadrícula y detección de colisiones musicales por proximidad.
 */

export type KineticMovementType =
  | 'circular'
  | 'polar'
  | 'figure8'
  | 'spiral'
  | 'random'
  | 'pendulum'
  | 'waypoints';

export interface KineticState {
  /** Desplazamiento relativo [dx, dy, dz] respecto al punto de anclaje del objeto */
  offset: [number, number, number];
  /** Velocidad instantánea [vx, vy, vz] en metros/segundo */
  velocity: [number, number, number];
}

/**
 * Registro en memoria de la posición mundial en vivo de cada objeto sonoro
 * (ancla + desplazamiento cinético) para que las Zonas de Efecto (M2) y las
 * colisiones entre figuras (M4) respondan en tiempo real sin re-renderizar React a 60 Hz.
 */
const liveLocalPositions = new Map<string, [number, number, number]>();
const liveWorldPositions = new Map<string, [number, number, number]>();
const lastProximityTriggerPair = new Map<string, number>();

export function setLiveObjectKineticPosition(
  id: string,
  localPos: [number, number, number],
  worldPos: [number, number, number]
): void {
  liveLocalPositions.set(id, localPos);
  liveWorldPositions.set(id, worldPos);
}

export function getLiveObjectLocalPosition(
  id: string,
  fallback: [number, number, number]
): [number, number, number] {
  return liveLocalPositions.get(id) ?? fallback;
}

export function getLiveObjectWorldPosition(
  id: string,
  fallback: [number, number, number]
): [number, number, number] {
  return liveWorldPositions.get(id) ?? fallback;
}

export function clearLiveObjectKineticPosition(id: string): void {
  liveLocalPositions.delete(id);
  liveWorldPositions.delete(id);
}

/**
 * Convierte BPM y subdivisión musical en frecuencia angular (rad/s) para una vuelta completa.
 */
export function resolveAngularSpeed(params: AudioParams): number {
  const baseSpeed = Math.max(0.05, Number(params.movementSpeed ?? 1.0));
  if (!params.syncMovementToBpm) {
    return baseSpeed;
  }

  const bpm = Math.max(30, Math.min(240, Number(params.movementBpm ?? 120)));
  const beatsPerSecond = bpm / 60;
  const sub = params.movementBpmSubdivision ?? '1n';
  const beatsPerCycle =
    sub === '1n' ? 4 : sub === '2n' ? 2 : sub === '4n' ? 1 : 0.5;
  const cyclesPerSecond = beatsPerSecond / beatsPerCycle;
  return cyclesPerSecond * Math.PI * 2;
}

/**
 * Aplica rebote suave (reflexión triangular) si el modo de frontera es 'bounce'.
 */
function applyBoundaryConstraint(
  coord: number,
  anchorCoord: number,
  halfLimit: number
): number {
  const abs = anchorCoord + coord;
  if (Math.abs(abs) <= halfLimit) return coord;
  // Reflexión suave dentro de [-halfLimit, halfLimit]
  const period = halfLimit * 2;
  const shifted = ((abs + halfLimit) % (period * 2) + period * 2) % (period * 2);
  const reflected = shifted <= period ? shifted - halfLimit : period * 2 - shifted - halfLimit;
  return reflected - anchorCoord;
}

/**
 * Evalúa la posición relativa [dx, dy, dz] en el instante `t` (segundos).
 */
export function evaluatePositionOffsetAtTime(
  params: AudioParams,
  t: number,
  anchor: [number, number, number] = [0, 0, 0],
  gridHalfSize = 10
): [number, number, number] {
  const type: KineticMovementType = params.movementType ?? 'circular';
  const radius = Math.max(0.1, Number(params.movementRadius ?? 2.5));
  const omega = resolveAngularSpeed(params);
  const phase = Number(params.movementPhaseOffset ?? 0);
  const angle = t * omega + phase;

  const height = Number(params.movementHeight ?? 0.6);
  const heightSpeed = Number(params.movementHeightSpeed ?? 0.8);
  const yOsc = height * Math.sin(t * heightSpeed + phase * 0.5);

  let dx = 0;
  let dy = yOsc;
  let dz = 0;

  switch (type) {
    case 'circular': {
      dx = radius * Math.cos(angle);
      dz = radius * Math.sin(angle);
      break;
    }

    case 'polar': {
      const amp = Number(params.movementAmplitude ?? 0.6);
      const petals = Math.max(1, Math.round(Number(params.movementFrequency ?? 3)));
      const r = radius * (1 + amp * 0.5 * Math.sin(petals * angle));
      dx = r * Math.cos(angle);
      dz = r * Math.sin(angle);
      break;
    }

    case 'figure8': {
      dx = radius * Math.sin(angle);
      dz = radius * 0.55 * Math.sin(2 * angle);
      break;
    }

    case 'spiral': {
      // Espiral respirante de Arquímedes (se expande y contrae cíclicamente)
      const breath = 0.2 + 0.8 * Math.abs(Math.sin(angle * 0.25));
      const r = radius * breath;
      dx = r * Math.cos(angle);
      dz = r * Math.sin(angle);
      break;
    }

    case 'random': {
      const seed = Number(params.movementRandomSeed ?? 42);
      const s = t * omega * 0.45 + seed * 0.17;
      dx =
        radius *
        (0.65 * Math.sin(s) + 0.35 * Math.cos(s * 1.73 + seed));
      dz =
        radius *
        (0.65 * Math.cos(s * 1.31) + 0.35 * Math.sin(s * 2.17 + seed * 0.5));
      dy =
        height *
        (0.7 * Math.sin(s * 0.89 + seed * 0.3) + 0.3 * Math.cos(s * 1.9));
      break;
    }

    case 'pendulum': {
      const axis = params.movementAxis ?? 'x';
      const swing = radius * Math.sin(angle);
      // Arco parabólico de péndulo (sube en los extremos)
      const arcLift = height * Math.pow(Math.sin(angle), 2);
      if (axis === 'x') {
        dx = swing;
        dy = arcLift;
      } else if (axis === 'z') {
        dz = swing;
        dy = arcLift;
      } else {
        dy = swing;
      }
      break;
    }

    case 'waypoints': {
      const raw = params.movementWaypoints;
      const pts: [number, number][] =
        Array.isArray(raw) && raw.length >= 4
          ? []
          : [
              [-radius, -radius * 0.6],
              [radius, -radius * 0.6],
              [0, radius * 0.85],
            ];
      if (Array.isArray(raw) && raw.length >= 4) {
        for (let i = 0; i + 1 < raw.length; i += 2) {
          pts.push([Number(raw[i]) || 0, Number(raw[i + 1]) || 0]);
        }
      }
      const n = pts.length;
      if (n >= 2) {
        const progress = ((angle / (Math.PI * 2)) % 1 + 1) % 1;
        const scaled = progress * n;
        const idx = Math.floor(scaled) % n;
        const nextIdx = (idx + 1) % n;
        const frac = scaled - Math.floor(scaled);
        // Suavizado cosenoidal entre puntos de ruta
        const smooth = 0.5 - 0.5 * Math.cos(frac * Math.PI);
        dx = pts[idx][0] + (pts[nextIdx][0] - pts[idx][0]) * smooth;
        dz = pts[idx][1] + (pts[nextIdx][1] - pts[idx][1]) * smooth;
      }
      break;
    }
  }

  if (params.movementBoundaryMode === 'bounce') {
    dx = applyBoundaryConstraint(dx, anchor[0], gridHalfSize);
    dz = applyBoundaryConstraint(dz, anchor[2], gridHalfSize);
  }

  return [dx, dy, dz];
}

/**
 * Calcula tanto el desplazamiento como la velocidad instantánea (mediante
 * derivada numérica centrada de paso corto) para alimentar el efecto Doppler (M2).
 */
export function computeKineticState(
  params: AudioParams,
  t: number,
  anchor: [number, number, number] = [0, 0, 0],
  gridHalfSize = 10
): KineticState {
  const dt = 0.016;
  const posNow = evaluatePositionOffsetAtTime(params, t, anchor, gridHalfSize);
  const posNext = evaluatePositionOffsetAtTime(params, t + dt, anchor, gridHalfSize);

  const velocity: [number, number, number] = [
    (posNext[0] - posNow[0]) / dt,
    (posNext[1] - posNow[1]) / dt,
    (posNext[2] - posNow[2]) / dt,
  ];

  return { offset: posNow, velocity };
}

/**
 * Calcula el factor multiplicador de frecuencia por Efecto Doppler acústico (M2).
 */
export function computeDopplerFrequencyMultiplier(
  sourceWorldPos: [number, number, number],
  sourceVelocity: [number, number, number],
  listenerWorldPos: [number, number, number],
  intensity = 1.0
): number {
  const rx = listenerWorldPos[0] - sourceWorldPos[0];
  const ry = listenerWorldPos[1] - sourceWorldPos[1];
  const rz = listenerWorldPos[2] - sourceWorldPos[2];
  const dist = Math.hypot(rx, ry, rz);
  if (dist < 0.05) return 1.0;

  // Velocidad radial hacia el oyente (positiva al acercarse)
  const vRadial =
    (sourceVelocity[0] * rx + sourceVelocity[1] * ry + sourceVelocity[2] * rz) / dist;

  // Velocidad acústica escalada a la escena 3D (~34.3 m/s para que sea audible a velocidades de 1–5 m/s)
  const effectiveSpeedOfSound = 34.3 / Math.max(0.1, intensity);
  const clampedVr = Math.max(-effectiveSpeedOfSound * 0.45, Math.min(effectiveSpeedOfSound * 0.45, vRadial));
  const multiplier = effectiveSpeedOfSound / (effectiveSpeedOfSound - clampedVr);
  return Math.max(0.5, Math.min(2.0, multiplier));
}

/**
 * Genera los puntos 3D de la órbita para dibujarla en el mapa (M3) o en SVG (M5).
 */
export function computeOrbitPreviewPoints(
  params: AudioParams,
  anchor: [number, number, number] = [0, 0, 0],
  segments = 72,
  gridHalfSize = 10
): [number, number, number][] {
  const omega = Math.max(0.1, resolveAngularSpeed(params));
  // Periodo para cubrir el patrón completo (en espiral o random cubrimos 4 ciclos)
  const cycles =
    params.movementType === 'spiral' || params.movementType === 'random' ? 2 : 1;
  const totalTime = (Math.PI * 2 * cycles) / omega;

  const points: [number, number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * totalTime;
    const [dx, dy, dz] = evaluatePositionOffsetAtTime(params, t, anchor, gridHalfSize);
    points.push([anchor[0] + dx, anchor[1] + dy, anchor[2] + dz]);
  }
  return points;
}

/**
 * Detecta si un objeto en movimiento acaba de entrar en proximidad con otro objeto
 * sonoro de la escena (M4 — Colisiones Sonoras), aplicando un enfriamiento de 450 ms
 * por par para evitar disparos repetidos en el mismo cruce.
 */
export function checkInterObjectProximityCollision(
  movingId: string,
  movingWorldPos: [number, number, number],
  thresholdRadius: number,
  nowMs: number
): string[] {
  const triggeredIds: string[] = [];
  const cooldownMs = 450;

  liveWorldPositions.forEach((otherPos, otherId) => {
    if (otherId === movingId) return;
    const dist = Math.hypot(
      movingWorldPos[0] - otherPos[0],
      movingWorldPos[1] - otherPos[1],
      movingWorldPos[2] - otherPos[2]
    );
    const pairKey =
      movingId < otherId ? `${movingId}::${otherId}` : `${otherId}::${movingId}`;

    if (dist <= thresholdRadius) {
      const lastTrig = lastProximityTriggerPair.get(pairKey) ?? 0;
      if (nowMs - lastTrig > cooldownMs) {
        lastProximityTriggerPair.set(pairKey, nowMs);
        triggeredIds.push(otherId);
      }
    }
  });

  return triggeredIds;
}
