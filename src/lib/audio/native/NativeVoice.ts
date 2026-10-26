import { nativeAudioGraph } from './NativeAudioGraph';

/**
 * Voz de síntesis nativa (roadmap 2.1 — fase b).
 *
 * Implementa con nodos puros de la Web Audio API la cadena que hoy cubre
 * un sintetizador básico de Tone.js (oscilador + AM opcional + envolvente
 * ADSR + filtro + espacialización HRTF):
 *
 *   OscillatorNode (portador) → GainNode (AM) → GainNode (ADSR)
 *     → BiquadFilterNode → PannerNode (HRTF) → GainNode (dry) → master
 *
 * El oscilador modulador (AM) actúa a tasa de audio sobre la ganancia del
 * portador, replicando el `Tone.AMSynth` del cubo. Los osciladores nativos
 * son de un solo uso: cada ataque crea instancias frescas y la liberación
 * las detiene y desconecta (gestión explícita de memoria, 2.5).
 */

export type NativeWaveform = 'sine' | 'square' | 'triangle' | 'sawtooth';

/**
 * Modelos de síntesis nativos, uno por tipo de objeto sonoro (migración
 * completa del roadmap 2.1). Cada modelo replica el carácter del
 * sintetizador de Tone que sustituye.
 */
export type NativeSynthModel =
  | 'am' // cubo — AMSynth
  | 'fm' // esfera — FMSynth
  | 'duo' // cilindro — DuoSynth (dos osciladores desafinados)
  | 'membrane' // cono — MembraneSynth (envolvente de tono descendente)
  | 'mono' // pirámide — MonoSynth (oscilador + filtro)
  | 'metal' // icosaedro — MetalSynth (FM inarmónica)
  | 'noise' // plano — NoiseSynth (ruido filtrado)
  | 'pluck' // toro — PluckSynth (cuerda pulsada)
  | 'poly' // anillo — PolySynth (acorde)
  | 'sampler'; // espiral — Sampler (reproducción de muestra)

export interface NativeVoiceParams {
  frequency: number;
  waveform: NativeWaveform;
  volume: number; // 0-1
  /** Modelo de síntesis (por defecto 'am') */
  model?: NativeSynthModel;
  /** Relación modulador/portador del AM/FM; 0 = sin modulación */
  harmonicity?: number;
  /** Profundidad de la modulación AM o índice de modulación FM */
  modulationDepth?: number;
  /** Corte del filtro lowpass en Hz */
  filterCutoff?: number;
  /** URL de muestra para el modelo 'sampler' */
  sampleUrl?: string;
  attack?: number;
  decay?: number;
  sustain?: number; // 0-1, proporción del volumen
  release?: number;
}

const DEFAULTS = {
  model: 'am' as NativeSynthModel,
  harmonicity: 0,
  modulationDepth: 0.5,
  filterCutoff: 18000,
  sampleUrl: '',
  attack: 0.01,
  decay: 0.1,
  sustain: 0.8,
  release: 0.4,
};

/** Caché de buffers de muestra por URL (modelo sampler). */
const sampleBufferCache = new Map<string, AudioBuffer>();
/** Buffer de ruido blanco compartido (modelo noise), 2 s en bucle. */
let sharedNoiseBuffer: AudioBuffer | null = null;

function getNoiseBuffer(context: AudioContext): AudioBuffer {
  if (sharedNoiseBuffer && sharedNoiseBuffer.sampleRate === context.sampleRate) {
    return sharedNoiseBuffer;
  }
  const length = context.sampleRate * 2;
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  sharedNoiseBuffer = buffer;
  return buffer;
}

const BASIC_WAVEFORMS: NativeWaveform[] = ['sine', 'square', 'triangle', 'sawtooth'];

/**
 * Traduce los AudioParams de la plataforma (superficie de Tone.js) a los
 * parámetros de la voz nativa (fase c de la integración).
 */
export function audioParamsToNative(params: {
  frequency?: number;
  waveform?: string;
  volume?: number;
  harmonicity?: number;
  ampAttack?: number;
  ampDecay?: number;
  ampSustain?: number;
  ampRelease?: number;
}): Partial<NativeVoiceParams> {
  const native: Partial<NativeVoiceParams> = {};
  if (params.frequency !== undefined) native.frequency = params.frequency;
  if (params.volume !== undefined) native.volume = Math.max(0, Math.min(1, params.volume));
  if (params.waveform && BASIC_WAVEFORMS.includes(params.waveform as NativeWaveform)) {
    native.waveform = params.waveform as NativeWaveform;
  }
  if (params.harmonicity !== undefined) native.harmonicity = params.harmonicity;
  if (params.ampAttack !== undefined) native.attack = params.ampAttack;
  if (params.ampDecay !== undefined) native.decay = params.ampDecay;
  if (params.ampSustain !== undefined) native.sustain = params.ampSustain;
  if (params.ampRelease !== undefined) native.release = params.ampRelease;
  return native;
}

export class NativeVoice {
  private params: Required<NativeVoiceParams>;

  // Nodos persistentes de la voz
  private envelopeGain: GainNode;
  private filter: BiquadFilterNode;
  private panner: PannerNode;
  private dryGain: GainNode;

  // Sends a efectos globales (2.1.d): un GainNode por efecto, tapeado
  // post-filtro (señal con timbre, pre-espacialización seca), análogo al
  // tap del synth crudo del motor Tone.
  private effectSends: Map<string, GainNode> = new Map();

  // Nodos de un solo uso por ataque (todos los modelos)
  private oscillators: OscillatorNode[] = [];
  private bufferSources: AudioBufferSourceNode[] = [];
  private auxNodes: AudioNode[] = [];
  /** Osciladores cuya frecuencia sigue a la frecuencia base × ratio */
  private tuned: { osc: OscillatorNode; ratio: number }[] = [];

  private playing = false;
  private disposed = false;
  private startedAt = 0;

  constructor(params: NativeVoiceParams, position: [number, number, number]) {
    this.params = { ...DEFAULTS, ...params };
    const context = nativeAudioGraph.getContext();

    this.envelopeGain = context.createGain();
    this.envelopeGain.gain.value = 0;

    this.filter = context.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = this.params.filterCutoff;
    this.filter.Q.value = 0.7;

    this.panner = nativeAudioGraph.createPanner(position);

    this.dryGain = context.createGain();
    this.dryGain.gain.value = 1;

    this.envelopeGain.connect(this.filter);
    this.filter.connect(this.panner);
    this.panner.connect(this.dryGain);
    this.dryGain.connect(nativeAudioGraph.getMasterGain());
  }

  /** Punto de salida seca de la voz. */
  public getOutputNode(): GainNode {
    return this.dryGain;
  }

  /**
   * Añade un send hacia un efecto global (2.1.d): conecta el tap post-filtro
   * a la entrada nativa del efecto a través de un GainNode controlable.
   * Inicialmente silenciado (la mezcla por proximidad lo ajusta).
   */
  public addEffectSend(effectId: string, effectInput: AudioNode): void {
    if (this.disposed || this.effectSends.has(effectId)) return;
    const send = nativeAudioGraph.getContext().createGain();
    send.gain.value = 0;
    this.filter.connect(send);
    try {
      send.connect(effectInput);
    } catch {
      // Entrada del efecto incompatible o ya liberada
    }
    this.effectSends.set(effectId, send);
  }

  /** Ajusta la cantidad de señal enviada a un efecto (0-1). */
  public setEffectSendGain(effectId: string, amount: number): void {
    const send = this.effectSends.get(effectId);
    if (!send) return;
    const now = nativeAudioGraph.getContext().currentTime;
    send.gain.setTargetAtTime(Math.max(0, Math.min(1, amount)), now, 0.02);
  }

  /** Ajusta la ganancia de la señal seca (inversa a la mezcla húmeda). */
  public setDryGain(amount: number): void {
    if (this.disposed) return;
    const now = nativeAudioGraph.getContext().currentTime;
    this.dryGain.gain.setTargetAtTime(Math.max(0, Math.min(1, amount)), now, 0.02);
  }

  /** Retira y libera el send de un efecto (al eliminar la zona). */
  public removeEffectSend(effectId: string): void {
    const send = this.effectSends.get(effectId);
    if (!send) return;
    try {
      send.disconnect();
    } catch {
      // Ya desconectado
    }
    this.effectSends.delete(effectId);
  }

  public isPlaying(): boolean {
    return this.playing;
  }

  /** Crea las fuentes frescas del ataque según el modelo de síntesis. */
  private buildSources(): void {
    const context = nativeAudioGraph.getContext();
    this.oscillators = [];
    this.bufferSources = [];
    this.auxNodes = [];
    this.tuned = [];

    switch (this.params.model) {
      case 'fm': this.buildFM(context); break;
      case 'duo': this.buildDuo(context); break;
      case 'membrane': this.buildMembrane(context); break;
      case 'mono': this.buildMono(context); break;
      case 'metal': this.buildMetal(context); break;
      case 'noise': this.buildNoise(context); break;
      case 'pluck': this.buildPluck(context); break;
      case 'poly': this.buildPoly(context); break;
      case 'sampler': this.buildSampler(context); break;
      case 'am':
      default: this.buildAM(context); break;
    }

    this.oscillators.forEach((osc) => osc.start());
    this.bufferSources.forEach((src) => src.start());
  }

  /** Oscilador afinado que sigue a la frecuencia base × ratio. */
  private addOsc(context: AudioContext, type: NativeWaveform, ratio: number): OscillatorNode {
    const osc = context.createOscillator();
    osc.type = type;
    osc.frequency.value = this.params.frequency * ratio;
    this.oscillators.push(osc);
    this.tuned.push({ osc, ratio });
    return osc;
  }

  // cubo — AM: portador × (1 - d/2 + modulador·d/2)
  private buildAM(context: AudioContext): void {
    const { harmonicity, modulationDepth } = this.params;
    const carrier = this.addOsc(context, this.params.waveform, 1);
    if (harmonicity > 0 && modulationDepth > 0) {
      const amGain = context.createGain();
      amGain.gain.value = 1 - modulationDepth / 2;
      const modulator = this.addOsc(context, 'sine', harmonicity);
      const modDepth = context.createGain();
      modDepth.gain.value = modulationDepth / 2;
      modulator.connect(modDepth);
      modDepth.connect(amGain.gain);
      carrier.connect(amGain);
      amGain.connect(this.envelopeGain);
      this.auxNodes.push(amGain, modDepth);
    } else {
      carrier.connect(this.envelopeGain);
    }
  }

  // esfera — FM: modulador → índice → frecuencia del portador
  private buildFM(context: AudioContext): void {
    const harmonicity = this.params.harmonicity || 2;
    const index = (this.params.modulationDepth || 0.5) * 200;
    const carrier = this.addOsc(context, this.params.waveform, 1);
    const modulator = this.addOsc(context, 'sine', harmonicity);
    const modIndex = context.createGain();
    modIndex.gain.value = this.params.frequency * (index / 100);
    modulator.connect(modIndex);
    modIndex.connect(carrier.frequency); // FM a tasa de audio
    carrier.connect(this.envelopeGain);
    this.auxNodes.push(modIndex);
  }

  // cilindro — Duo: dos osciladores ligeramente desafinados
  private buildDuo(context: AudioContext): void {
    const a = this.addOsc(context, this.params.waveform, 1);
    const b = this.addOsc(context, this.params.waveform, 1.005);
    const mix = context.createGain();
    mix.gain.value = 0.5;
    a.connect(mix);
    b.connect(mix);
    mix.connect(this.envelopeGain);
    this.auxNodes.push(mix);
  }

  // cono — Membrane: tono con caída de pitch al ataque (percusivo)
  private buildMembrane(context: AudioContext): void {
    const osc = this.addOsc(context, 'sine', 1);
    const now = context.currentTime;
    // Envolvente de tono: arranca una octava arriba y cae rápido
    osc.frequency.cancelScheduledValues(now);
    osc.frequency.setValueAtTime(this.params.frequency * 2, now);
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(20, this.params.frequency),
      now + 0.08
    );
    osc.connect(this.envelopeGain);
  }

  // pirámide — Mono: un oscilador (el filtro lowpass da el carácter)
  private buildMono(context: AudioContext): void {
    const osc = this.addOsc(context, this.params.waveform || 'sawtooth', 1);
    osc.connect(this.envelopeGain);
  }

  // icosaedro — Metal: FM inarmónica con varios parciales metálicos
  private buildMetal(context: AudioContext): void {
    const ratios = [1, 1.41, 1.73, 2.11];
    const mix = context.createGain();
    mix.gain.value = 0.25;
    for (const ratio of ratios) {
      const osc = this.addOsc(context, 'square', ratio);
      osc.connect(mix);
    }
    mix.connect(this.envelopeGain);
    this.auxNodes.push(mix);
  }

  // plano — Noise: ruido blanco en bucle (el filtro lo modela)
  private buildNoise(context: AudioContext): void {
    const src = context.createBufferSource();
    src.buffer = getNoiseBuffer(context);
    src.loop = true;
    src.connect(this.envelopeGain);
    this.bufferSources.push(src);
  }

  // toro — Pluck: aproximación de cuerda pulsada (triángulo + decaimiento)
  private buildPluck(context: AudioContext): void {
    const osc = this.addOsc(context, 'triangle', 1);
    osc.connect(this.envelopeGain);
    // El carácter pulsado lo da el decay corto en startContinuous (sustain bajo)
  }

  // anillo — Poly: acorde mayor con séptima (raíz, 3ª, 5ª, 7ª)
  private buildPoly(context: AudioContext): void {
    const semis = [0, 4, 7, 11];
    const mix = context.createGain();
    mix.gain.value = 0.25;
    for (const semi of semis) {
      const osc = this.addOsc(context, this.params.waveform, Math.pow(2, semi / 12));
      osc.connect(mix);
    }
    mix.connect(this.envelopeGain);
    this.auxNodes.push(mix);
  }

  // espiral — Sampler: reproduce la muestra del usuario (o sine de respaldo)
  private buildSampler(context: AudioContext): void {
    const url = this.params.sampleUrl;
    const cached = url ? sampleBufferCache.get(url) : undefined;
    if (cached) {
      const src = context.createBufferSource();
      src.buffer = cached;
      src.loop = true;
      // Re-pitch por transposición respecto a C4 (261.63 Hz)
      src.playbackRate.value = this.params.frequency / 261.63;
      src.connect(this.envelopeGain);
      this.bufferSources.push(src);
    } else {
      // Sin muestra cargada: respaldo a oscilador sine
      const osc = this.addOsc(context, 'sine', 1);
      osc.connect(this.envelopeGain);
      if (url) void this.loadSample(url); // cargar para el próximo ataque
    }
  }

  /** Carga y cachea un buffer de muestra para el modelo sampler. */
  private async loadSample(url: string): Promise<void> {
    if (sampleBufferCache.has(url)) return;
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await nativeAudioGraph.getContext().decodeAudioData(arrayBuffer);
      sampleBufferCache.set(url, audioBuffer);
    } catch {
      // Muestra no disponible: el respaldo sine permanece
    }
  }

  /** Detiene y desconecta todas las fuentes del ataque vigente (2.5). */
  private teardownSources(stopAt: number): void {
    const sources: Array<OscillatorNode | AudioBufferSourceNode> = [
      ...this.oscillators,
      ...this.bufferSources,
    ];
    sources.forEach((src) => {
      try {
        src.stop(stopAt);
        src.onended = () => {
          try {
            src.disconnect();
          } catch {
            // Ya desconectado
          }
        };
      } catch {
        // Ya detenido
      }
    });
    const aux = this.auxNodes;
    setTimeout(() => {
      aux.forEach((node) => {
        try {
          node.disconnect();
        } catch {
          // Ya desconectado
        }
      });
    }, Math.max(0, (stopAt - nativeAudioGraph.getContext().currentTime) * 1000) + 100);

    this.oscillators = [];
    this.bufferSources = [];
    this.auxNodes = [];
    this.tuned = [];
  }

  /** Ataque sostenido (drone): suena hasta que se llame a `stop()`. */
  public startContinuous(): void {
    if (this.disposed || this.playing) return;
    const context = nativeAudioGraph.getContext();
    const now = context.currentTime;
    const { volume, attack, decay, sustain } = this.params;

    this.buildSources();

    const gain = this.envelopeGain.gain;
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(0, now);
    gain.linearRampToValueAtTime(volume, now + attack);
    gain.setTargetAtTime(volume * sustain, now + attack, Math.max(0.001, decay / 3));

    this.playing = true;
    // Reloj del contexto compartido (segundos), coherente con Tone.now()
    // para que el robo de voces compare ambos motores en la misma escala.
    this.startedAt = context.currentTime;
  }

  /** Marca de tiempo del último ataque (para el robo de voces 2.4). */
  public getStartTime(): number {
    return this.startedAt;
  }

  /** Liberación: cola de release y limpieza de osciladores. */
  public stop(): void {
    if (this.disposed || !this.playing) return;
    const context = nativeAudioGraph.getContext();
    const now = context.currentTime;
    const { release } = this.params;

    const gain = this.envelopeGain.gain;
    gain.cancelScheduledValues(now);
    gain.setTargetAtTime(0, now, Math.max(0.001, release / 3));

    this.teardownSources(now + release + 0.1);
    this.playing = false;
  }

  /** Nota con duración fija (interacción de clic). */
  public triggerAttackRelease(duration: number): void {
    if (this.disposed) return;
    if (this.playing) this.stop();
    this.startContinuous();
    setTimeout(() => this.stop(), Math.max(10, duration * 1000));
  }

  /** Actualización en vivo de parámetros (suave, sin clics). */
  public updateParams(updates: Partial<NativeVoiceParams>): void {
    if (this.disposed) return;
    this.params = { ...this.params, ...updates };
    const context = nativeAudioGraph.getContext();
    const now = context.currentTime;

    if (updates.frequency !== undefined) {
      // Reafinar cada oscilador a frecuencia base × su ratio
      for (const { osc, ratio } of this.tuned) {
        osc.frequency.setTargetAtTime(updates.frequency * ratio, now, 0.02);
      }
      // El sampler re-pitchea por playbackRate (respecto a C4)
      for (const src of this.bufferSources) {
        if (src.loop && this.params.model === 'sampler') {
          src.playbackRate.setTargetAtTime(updates.frequency / 261.63, now, 0.02);
        }
      }
    }
    if (updates.waveform !== undefined) {
      // Aplicar a los osciladores afinados (no a moduladores sine puros)
      for (const { osc } of this.tuned) {
        if (osc.type !== 'sine' || this.params.model === 'mono' || this.params.model === 'duo') {
          osc.type = updates.waveform;
        }
      }
    }
    if (updates.volume !== undefined && this.playing) {
      this.envelopeGain.gain.setTargetAtTime(
        updates.volume * this.params.sustain,
        now,
        0.02
      );
    }
    if (updates.filterCutoff !== undefined) {
      this.filter.frequency.setTargetAtTime(updates.filterCutoff, now, 0.02);
    }
  }

  /**
   * Modulación breve del drone (interacción de clic sobre un objeto
   * sonando): pequeño realce de ganancia con retorno suave.
   */
  public pulse(): void {
    if (this.disposed || !this.playing) return;
    const context = nativeAudioGraph.getContext();
    const now = context.currentTime;
    const { volume, sustain } = this.params;
    const base = volume * sustain;

    const gain = this.envelopeGain.gain;
    gain.cancelScheduledValues(now);
    gain.setTargetAtTime(Math.min(1, base * 1.6), now, 0.02);
    gain.setTargetAtTime(base, now + 0.15, 0.08);
  }

  public setPosition(position: [number, number, number]): void {
    if (this.disposed) return;
    const now = nativeAudioGraph.getContext().currentTime;
    this.panner.positionX.setTargetAtTime(position[0], now, 0.02);
    this.panner.positionY.setTargetAtTime(position[1], now, 0.02);
    this.panner.positionZ.setTargetAtTime(position[2], now, 0.02);
  }

  /** Posición 3D actual de la voz (leída del panner). */
  public getPosition(): [number, number, number] {
    return [
      this.panner.positionX.value,
      this.panner.positionY.value,
      this.panner.positionZ.value,
    ];
  }

  /** Liberación total de la voz (roadmap 2.5). */
  public dispose(): void {
    if (this.disposed) return;
    this.stop();
    this.disposed = true;

    // Liberar los sends de efectos (2.1.d / 2.5)
    this.effectSends.forEach((send) => {
      try {
        send.disconnect();
      } catch {
        // Ya desconectado
      }
    });
    this.effectSends.clear();

    setTimeout(() => {
      try {
        this.envelopeGain.disconnect();
        this.filter.disconnect();
        this.panner.disconnect();
        this.dryGain.disconnect();
      } catch {
        // Contexto ya cerrado
      }
    }, (this.params.release + 0.3) * 1000);
  }
}
