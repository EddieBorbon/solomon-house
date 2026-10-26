import * as Tone from 'tone';
import { NativeVoice } from './NativeVoice';
import { nativeAudioGraph } from './NativeAudioGraph';

/**
 * Validación A/B de motores de audio (roadmap 2.1.e).
 *
 * Compara el motor nativo (Web Audio puro) contra Tone.js en métricas
 * objetivas medibles en el navegador, sin necesidad de oír el resultado:
 *
 *   - **latencia de hardware**: baseLatency / outputLatency del contexto
 *     compartido (igual para ambos motores, 2.8) — referencia del sistema.
 *   - **coste de construcción**: tiempo en crear, arrancar y liberar un
 *     lote de N voces simples en cada motor (proxy del trabajo del hilo
 *     principal al poblar una sala densa).
 *   - **nodos por voz**: huella de grafo de cada arquitectura.
 *
 * El benchmark crea las voces en silencio (volumen 0) y las libera al
 * terminar, de modo que no interfiere con la sesión en curso.
 */

export interface EngineBenchmarkResult {
  engine: 'native' | 'tone';
  voices: number;
  buildMs: number;
  perVoiceMs: number;
  nodesPerVoice: number;
}

export interface ABComparison {
  baseLatencyMs: number | null;
  outputLatencyMs: number | null;
  sampleRate: number;
  native: EngineBenchmarkResult;
  tone: EngineBenchmarkResult;
  /** Veloz relativo: >1 significa que el nativo construyó más rápido */
  buildSpeedup: number;
}

function now(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

/** Mide la construcción de N voces nativas (osc+AM+ADSR+filtro+panner). */
function benchmarkNative(voices: number): EngineBenchmarkResult {
  const created: NativeVoice[] = [];
  const start = now();
  for (let i = 0; i < voices; i++) {
    const voice = new NativeVoice(
      { frequency: 220 + i, waveform: 'sine', volume: 0, harmonicity: 3 },
      [0, 0, 0]
    );
    voice.startContinuous();
    created.push(voice);
  }
  const buildMs = now() - start;
  created.forEach((voice) => voice.dispose());

  // osc(1) + amGain(1) + modulator(1) + modDepth(1) + envelope(1)
  // + filter(1) + panner(1) + dryGain(1) = 8 nodos por voz con AM
  return {
    engine: 'native',
    voices,
    buildMs: Math.round(buildMs * 100) / 100,
    perVoiceMs: Math.round((buildMs / voices) * 1000) / 1000,
    nodesPerVoice: 8,
  };
}

/** Mide la construcción de N AMSynth de Tone con su cadena seca. */
function benchmarkTone(voices: number): EngineBenchmarkResult {
  const created: Array<{ synth: Tone.AMSynth; panner: Tone.Panner3D; gain: Tone.Gain }> = [];
  const destination = Tone.getDestination();
  const start = now();
  for (let i = 0; i < voices; i++) {
    const synth = new Tone.AMSynth({ harmonicity: 3, volume: -Infinity });
    const panner = new Tone.Panner3D({ panningModel: 'HRTF' });
    const gain = new Tone.Gain(1);
    synth.connect(panner);
    panner.connect(gain);
    gain.connect(destination);
    synth.triggerAttack(220 + i);
    created.push({ synth, panner, gain });
  }
  const buildMs = now() - start;
  created.forEach(({ synth, panner, gain }) => {
    try {
      synth.triggerRelease();
      synth.dispose();
      panner.dispose();
      gain.dispose();
    } catch {
      // Ya liberado
    }
  });

  // AMSynth envuelve internamente ~10-14 nodos (2 osc, 2 envelopes,
  // 2 gains de modulación, salida) + panner + gain de cadena.
  return {
    engine: 'tone',
    voices,
    buildMs: Math.round(buildMs * 100) / 100,
    perVoiceMs: Math.round((buildMs / voices) * 1000) / 1000,
    nodesPerVoice: 14,
  };
}

/**
 * Ejecuta la comparación A/B completa. `voices` controla el tamaño del
 * lote (por defecto 24, el tope típico del VoiceAllocator).
 */
export function runEngineComparison(voices: number = 24): ABComparison {
  const rawContext = Tone.getContext().rawContext as AudioContext;
  const baseLatency =
    typeof rawContext.baseLatency === 'number' ? rawContext.baseLatency : null;
  const outputLatency =
    typeof rawContext.outputLatency === 'number' ? rawContext.outputLatency : null;

  // Asegurar que el grafo nativo tiene su master listo antes de medir
  nativeAudioGraph.getMasterGain();

  // Orden: Tone primero (motor pesado) y nativo después, para no favorecer
  // a ninguno por calentamiento de caché del contexto.
  const tone = benchmarkTone(voices);
  const native = benchmarkNative(voices);

  return {
    baseLatencyMs: baseLatency !== null ? Math.round(baseLatency * 100000) / 100 : null,
    outputLatencyMs: outputLatency !== null ? Math.round(outputLatency * 100000) / 100 : null,
    sampleRate: rawContext.sampleRate,
    native,
    tone,
    buildSpeedup: native.buildMs > 0 ? Math.round((tone.buildMs / native.buildMs) * 100) / 100 : 0,
  };
}
