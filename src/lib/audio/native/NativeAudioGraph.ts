import * as Tone from 'tone';

/**
 * Grafo de Nodos Nativo de la Web Audio API (roadmap 2.1 — fase a).
 *
 * Cimientos de la migración gradual de Tone.js a nodos nativos. La
 * estrategia es de **coexistencia**, no de reemplazo total: el grafo
 * nativo comparte el `AudioContext` subyacente de Tone (el contexto de
 * baja latencia de 2.8), de modo que ambos motores conviven, suenan por
 * la misma salida y pueden interconectarse durante toda la transición.
 *
 * ## Diseño del grafo (traducción Tone.js → nativo)
 *
 * | Tone.js                  | Nativo                                       |
 * |--------------------------|----------------------------------------------|
 * | `Tone.Synth.oscillator`  | `OscillatorNode` (type, frequency, detune)   |
 * | `Tone.Synth.envelope`    | `GainNode` + automatización ADSR del `gain`  |
 * | `Tone.AMSynth`           | portador × (modulador → `GainNode.gain`)     |
 * | filtro del `MonoSynth`   | `BiquadFilterNode` (lowpass)                 |
 * | `Tone.Panner3D` (HRTF)   | `PannerNode` (panningModel 'HRTF')           |
 * | `Tone.Gain` (dry/sends)  | `GainNode`                                   |
 * | `Tone.Destination`       | `masterGain → AudioContext.destination`      |
 *
 * Cadena por voz (fase b, `NativeVoice`):
 *
 *   OscillatorNode ──┐
 *   (modulador AM ───┤ opcional, audio-rate sobre la ganancia del portador)
 *                    ▼
 *   GainNode (envolvente ADSR)
 *                    ▼
 *   BiquadFilterNode (lowpass)
 *                    ▼
 *   PannerNode (HRTF, modelo de distancia compartido con la calibración 4.4)
 *                    ▼
 *   GainNode (dry) ──► masterGain ──► destination
 *        └─► GainNodes de send → efectos globales (fase d)
 *
 * Las fases:
 *   a) este módulo — contexto compartido, master, factoría de nodos ✔
 *   b) `NativeVoice` — voz completa con ADSR/AM/filtro/HRTF ✔
 *   c) integración opt-in en AudioManager (`NEXT_PUBLIC_AUDIO_ENGINE`)
 *   d) sends nativos a efectos + VoiceAllocator + liberación (2.5)
 *   e) validación A/B (latencia/CPU) y documentación de conmutación
 */

export class NativeAudioGraph {
  private static instance: NativeAudioGraph | null = null;
  private masterGain: GainNode | null = null;

  public static getInstance(): NativeAudioGraph {
    if (!NativeAudioGraph.instance) {
      NativeAudioGraph.instance = new NativeAudioGraph();
    }
    return NativeAudioGraph.instance;
  }

  /**
   * Contexto nativo compartido con Tone: un único hilo de audio para
   * ambos motores (y un único `latencyHint` de baja latencia, 2.8).
   */
  public getContext(): AudioContext {
    return Tone.getContext().rawContext as AudioContext;
  }

  /** Bus maestro del motor nativo (volumen global y punto de medición). */
  public getMasterGain(): GainNode {
    const context = this.getContext();
    if (!this.masterGain || this.masterGain.context !== context) {
      this.masterGain = context.createGain();
      this.masterGain.gain.value = 1;
      this.masterGain.connect(context.destination);
    }
    return this.masterGain;
  }

  public setMasterVolume(volume: number): void {
    const master = this.getMasterGain();
    master.gain.setTargetAtTime(Math.max(0, Math.min(1, volume)), this.getContext().currentTime, 0.02);
  }

  /**
   * PannerNode HRTF con el mismo modelo espacial que usa el motor Tone
   * (coherente con la calibración acústica 4.4).
   */
  public createPanner(position: [number, number, number]): PannerNode {
    const context = this.getContext();
    const panner = context.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 1;
    panner.maxDistance = 100;
    panner.rolloffFactor = 2;
    panner.coneInnerAngle = 360;
    panner.coneOuterAngle = 360;
    panner.coneOuterGain = 0;
    panner.positionX.value = position[0];
    panner.positionY.value = position[1];
    panner.positionZ.value = position[2];
    return panner;
  }

  /** Libera el bus maestro (cierre de sesión / limpieza total, 2.5). */
  public dispose(): void {
    try {
      this.masterGain?.disconnect();
    } catch {
      // Contexto ya cerrado
    }
    this.masterGain = null;
  }
}

export const nativeAudioGraph = NativeAudioGraph.getInstance();
