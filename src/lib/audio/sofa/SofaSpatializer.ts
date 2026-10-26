import * as Tone from 'tone';
import type { SpatialAudioConfig } from '../../managers/SpatialAudioManager';
import { type HrirSet, findNearestHrir } from './sofaLoader';

/**
 * Procesador de convolución binaural personalizado (roadmap 4.2).
 *
 * Sustituye al `PannerNode` HRTF estandarizado del navegador por convolución
 * directa con las HRIR del perfil SOFA cargado por el usuario (4.1/4.3):
 * para cada fuente sonora se selecciona la respuesta al impulso medida en el
 * ángulo más cercano a la dirección fuente→oyente y se aplica con un
 * `ConvolverNode` estéreo. Dos convolucionadores en A/B con crossfade corto
 * evitan clics al cambiar de HRIR cuando la fuente o el oyente se mueven.
 *
 * La atenuación por distancia replica el modelo configurado en el
 * calibrador acústico (4.4) mediante un nodo de ganancia por fuente.
 */

const CROSSFADE_S = 0.04; // crossfade entre HRIRs (40 ms)
const LISTENER_THROTTLE_MS = 50; // recálculo de direcciones al mover el oyente

interface BinauralChain {
  input: Tone.Gain;
  convolverA: ConvolverNode;
  convolverB: ConvolverNode;
  gainA: Tone.Gain;
  gainB: Tone.Gain;
  distanceGain: Tone.Gain;
  /** true → A es el convolucionador activo */
  activeIsA: boolean;
  currentHrir: number;
  position: [number, number, number];
  destination: Tone.ToneAudioNode;
}

export class SofaSpatializer {
  private hrirSet: HrirSet | null = null;
  private chains: Map<string, BinauralChain> = new Map();
  private bufferCache: Map<number, AudioBuffer> = new Map();

  private listenerPosition: [number, number, number] = [0, 0, 0];
  private listenerForward: [number, number, number] = [0, 0, -1];
  private listenerUp: [number, number, number] = [0, 1, 0];
  private lastListenerUpdate = 0;

  constructor(private getSpatialConfig: () => SpatialAudioConfig) {}

  public setHrirSet(set: HrirSet): void {
    this.hrirSet = set;
    this.bufferCache.clear();
    // Re-asignar la HRIR de cada cadena existente con el nuevo perfil
    this.chains.forEach((chain, id) => {
      chain.currentHrir = -1;
      this.refreshChain(id, chain, true);
    });
  }

  public getHrirSet(): HrirSet | null {
    return this.hrirSet;
  }

  public hasSource(id: string): boolean {
    return this.chains.has(id);
  }

  /**
   * Inserta la cadena binaural de una fuente: `synthOutput → input →
   * (convA·gainA + convB·gainB) → distanceGain → destination`.
   */
  public attach(
    id: string,
    synthOutput: Tone.ToneAudioNode,
    destination: Tone.ToneAudioNode,
    position: [number, number, number]
  ): void {
    if (this.chains.has(id) || !this.hrirSet) return;

    const rawContext = Tone.getContext().rawContext;
    const input = new Tone.Gain(1);
    const convolverA = rawContext.createConvolver();
    const convolverB = rawContext.createConvolver();
    convolverA.normalize = false;
    convolverB.normalize = false;
    const gainA = new Tone.Gain(1);
    const gainB = new Tone.Gain(0);
    const distanceGain = new Tone.Gain(1);

    synthOutput.connect(input);
    Tone.connect(input, convolverA);
    Tone.connect(input, convolverB);
    Tone.connect(convolverA, gainA);
    Tone.connect(convolverB, gainB);
    gainA.connect(distanceGain);
    gainB.connect(distanceGain);
    distanceGain.connect(destination);

    const chain: BinauralChain = {
      input,
      convolverA,
      convolverB,
      gainA,
      gainB,
      distanceGain,
      activeIsA: true,
      currentHrir: -1,
      position: [...position],
      destination,
    };
    this.chains.set(id, chain);
    this.refreshChain(id, chain, true);
  }

  /** Retira y libera la cadena binaural de una fuente. */
  public detach(id: string): void {
    const chain = this.chains.get(id);
    if (!chain) return;
    try {
      chain.input.disconnect();
      chain.convolverA.disconnect();
      chain.convolverB.disconnect();
      chain.gainA.disconnect();
      chain.gainB.disconnect();
      chain.distanceGain.disconnect();
      chain.input.dispose();
      chain.gainA.dispose();
      chain.gainB.dispose();
      chain.distanceGain.dispose();
    } catch {
      // Nodos ya liberados al cerrar el contexto
    }
    this.chains.delete(id);
  }

  /** Retira todas las cadenas (al desactivar el perfil personalizado). */
  public detachAll(): void {
    Array.from(this.chains.keys()).forEach((id) => this.detach(id));
  }

  public updateSourcePosition(id: string, position: [number, number, number]): void {
    const chain = this.chains.get(id);
    if (!chain) return;
    chain.position = [...position];
    this.refreshChain(id, chain, false);
  }

  /** Recalcula todas las direcciones al moverse el oyente (con throttle). */
  public updateListener(
    position: [number, number, number],
    forward: [number, number, number]
  ): void {
    this.listenerPosition = position;
    this.listenerForward = forward;

    const now = performance.now();
    if (now - this.lastListenerUpdate < LISTENER_THROTTLE_MS) return;
    this.lastListenerUpdate = now;

    this.chains.forEach((chain, id) => this.refreshChain(id, chain, false));
  }

  /**
   * Selecciona la HRIR más cercana a la dirección fuente→oyente y aplica
   * la atenuación por distancia. `force` reasigna el buffer aunque el
   * índice no haya cambiado (cambio de perfil).
   */
  private refreshChain(id: string, chain: BinauralChain, force: boolean): void {
    const set = this.hrirSet;
    if (!set) return;

    const [lx, ly, lz] = this.listenerPosition;
    const [sx, sy, sz] = chain.position;
    let dx = sx - lx;
    let dy = sy - ly;
    let dz = sz - lz;
    const distance = Math.hypot(dx, dy, dz);

    if (distance < 1e-6) {
      dx = 0;
      dy = 0;
      dz = -1; // fuente sobre el oyente: usar el frente
    } else {
      dx /= distance;
      dy /= distance;
      dz /= distance;
    }

    // Base local del oyente (mundo three.js: +Y arriba, -Z frente por defecto)
    const [fx, fy, fz] = this.listenerForward;
    const [ux, uy, uz] = this.listenerUp;
    // izquierda = up × forward
    const ix = uy * fz - uz * fy;
    const iy = uz * fx - ux * fz;
    const iz = ux * fy - uy * fx;

    // Dirección en convención SOFA: X=frente, Y=izquierda, Z=arriba
    const sofaX = dx * fx + dy * fy + dz * fz;
    const sofaY = dx * ix + dy * iy + dz * iz;
    const sofaZ = dx * ux + dy * uy + dz * uz;

    const index = findNearestHrir(set, sofaX, sofaY, sofaZ);
    if (index !== chain.currentHrir || force) {
      this.applyHrir(chain, index, force);
    }

    chain.distanceGain.gain.rampTo(this.computeDistanceGain(distance), 0.05);
  }

  /** Asigna la HRIR al convolucionador inactivo y cruza las ganancias. */
  private applyHrir(chain: BinauralChain, index: number, immediate: boolean): void {
    const buffer = this.getBuffer(index);
    if (!buffer) return;
    chain.currentHrir = index;

    if (immediate) {
      const active = chain.activeIsA ? chain.convolverA : chain.convolverB;
      active.buffer = buffer;
      (chain.activeIsA ? chain.gainA : chain.gainB).gain.value = 1;
      (chain.activeIsA ? chain.gainB : chain.gainA).gain.value = 0;
      return;
    }

    const incoming = chain.activeIsA ? chain.convolverB : chain.convolverA;
    incoming.buffer = buffer;
    const incomingGain = chain.activeIsA ? chain.gainB : chain.gainA;
    const outgoingGain = chain.activeIsA ? chain.gainA : chain.gainB;
    incomingGain.gain.rampTo(1, CROSSFADE_S);
    outgoingGain.gain.rampTo(0, CROSSFADE_S);
    chain.activeIsA = !chain.activeIsA;
  }

  /**
   * Construye (con caché perezosa) el AudioBuffer estéreo de la medición m,
   * remuestreando por interpolación lineal si la frecuencia del perfil
   * difiere de la del contexto de audio.
   */
  private getBuffer(index: number): AudioBuffer | null {
    const cached = this.bufferCache.get(index);
    if (cached) return cached;

    const set = this.hrirSet;
    if (!set) return null;

    const rawContext = Tone.getContext().rawContext;
    const contextRate = rawContext.sampleRate;
    const ratio = contextRate / set.sampleRate;
    const sourceLength = set.irLength;
    const targetLength = Math.max(1, Math.round(sourceLength * ratio));

    const buffer = rawContext.createBuffer(2, targetLength, contextRate);
    for (let channel = 0; channel < 2; channel++) {
      const offset = index * 2 * sourceLength + channel * sourceLength;
      const target = buffer.getChannelData(channel);
      if (ratio === 1) {
        target.set(set.irs.subarray(offset, offset + sourceLength));
      } else {
        for (let i = 0; i < targetLength; i++) {
          const sourceIndex = i / ratio;
          const lower = Math.floor(sourceIndex);
          const upper = Math.min(lower + 1, sourceLength - 1);
          const t = sourceIndex - lower;
          target[i] =
            set.irs[offset + lower] * (1 - t) + set.irs[offset + upper] * t;
        }
      }
    }

    this.bufferCache.set(index, buffer);
    return buffer;
  }

  /** Replica el modelo de atenuación por distancia del calibrador (4.4). */
  private computeDistanceGain(distance: number): number {
    const config = this.getSpatialConfig();
    const { refDistance, maxDistance, rolloffFactor, distanceModel } = config;
    const d = Math.max(distance, refDistance);

    switch (distanceModel) {
      case 'linear':
        return Math.max(
          0,
          1 - (rolloffFactor * (d - refDistance)) / (maxDistance - refDistance)
        );
      case 'exponential':
        return Math.pow(d / refDistance, -rolloffFactor);
      case 'inverse':
      default:
        return refDistance / (refDistance + rolloffFactor * (d - refDistance));
    }
  }
}
