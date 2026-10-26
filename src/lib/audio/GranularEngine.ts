import * as Tone from 'tone';

/**
 * Motor de Síntesis Granular Espacial (roadmap 2.2 y 2.6).
 *
 * Envoltorio del AudioWorklet `granular-processor` (que corre en el hilo
 * de audio dedicado). El processor reparte cada grano entre varias salidas
 * mono; este motor conecta cada salida a su propio `Panner3D` colocado en
 * un sub-rango tridimensional alrededor de la posición del objeto visual:
 * la nube de granos rodea espacialmente al oyente en lugar de sonar desde
 * un punto único.
 */

/** Número de voces espaciales (salidas del worklet / panners 3D). */
const SPATIAL_VOICES = 4;

export interface GranularParams {
  grainSize?: number; // segundos [0.01..0.5]
  density?: number; // granos/segundo [1..100]
  playbackRate?: number; // transposición [0.25..4]
  position?: number; // lectura normalizada [0..1]
  spray?: number; // jitter de lectura [0..1]
  gain?: number; // [0..1]
}

let modulePromise: Promise<void> | null = null;

/** Carga (una sola vez) el módulo del worklet en el contexto de Tone. */
export async function loadGranularModule(): Promise<void> {
  if (!modulePromise) {
    const context = Tone.getContext().rawContext as AudioContext;
    modulePromise = context.audioWorklet.addModule('/worklets/granular-processor.js');
  }
  return modulePromise;
}

export class GranularEngine {
  private node: AudioWorkletNode;
  private panners: Tone.Panner3D[] = [];
  private offsets: [number, number, number][] = [];
  private disposed = false;

  private constructor(node: AudioWorkletNode, position: [number, number, number], spread: number) {
    this.node = node;

    // Un panner por voz espacial, distribuido alrededor del objeto
    for (let voice = 0; voice < SPATIAL_VOICES; voice++) {
      const angle = (voice / SPATIAL_VOICES) * Math.PI * 2;
      const offset: [number, number, number] = [
        Math.cos(angle) * spread,
        (Math.random() - 0.5) * spread,
        Math.sin(angle) * spread,
      ];
      this.offsets.push(offset);

      const panner = new Tone.Panner3D({
        panningModel: 'HRTF',
        positionX: position[0] + offset[0],
        positionY: position[1] + offset[1],
        positionZ: position[2] + offset[2],
      }).toDestination();
      this.panners.push(panner);

      Tone.connect(this.node, panner, voice, 0);
    }
  }

  /**
   * Crea un motor granular a partir de un AudioBuffer decodificado,
   * anclado a la posición 3D dada con granos dispersos en `spread` metros.
   */
  public static async create(
    buffer: AudioBuffer,
    position: [number, number, number],
    spread = 2
  ): Promise<GranularEngine> {
    await loadGranularModule();

    const context = Tone.getContext().rawContext as AudioContext;
    const node = new AudioWorkletNode(context, 'granular-processor', {
      numberOfInputs: 0,
      numberOfOutputs: SPATIAL_VOICES,
      outputChannelCount: new Array(SPATIAL_VOICES).fill(1),
    });

    // Enviar el sample (mono) al hilo de audio
    const channelData = buffer.getChannelData(0);
    node.port.postMessage(
      { type: 'buffer', channelData, sampleRate: buffer.sampleRate },
      // Copia estructural: el buffer original sigue siendo del llamador
    );

    return new GranularEngine(node, position, spread);
  }

  public start(): void {
    if (this.disposed) return;
    this.node.port.postMessage({ type: 'start' });
  }

  public stop(): void {
    if (this.disposed) return;
    this.node.port.postMessage({ type: 'stop' });
  }

  public setParams(params: GranularParams): void {
    if (this.disposed) return;
    for (const [name, value] of Object.entries(params)) {
      if (value === undefined) continue;
      const param = this.node.parameters.get(name);
      if (param) {
        param.setValueAtTime(value, Tone.now());
      }
    }
  }

  /** Reposiciona la nube: cada voz conserva su offset relativo. */
  public setPosition(position: [number, number, number]): void {
    if (this.disposed) return;
    this.panners.forEach((panner, voice) => {
      const offset = this.offsets[voice];
      panner.setPosition(
        position[0] + offset[0],
        position[1] + offset[1],
        position[2] + offset[2]
      );
    });
  }

  /** Liberación explícita de recursos (roadmap 2.5). */
  public dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.stop();
    try {
      this.node.disconnect();
    } catch {
      // Nodo ya desconectado
    }
    this.panners.forEach((panner) => panner.dispose());
    this.panners = [];
  }
}
