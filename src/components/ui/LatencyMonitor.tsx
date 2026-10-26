'use client';

import { useState, useEffect, useRef } from 'react';
import { audioManager } from '../../lib/AudioManager';
import type { ABComparison } from '../../lib/audio/native/engineBenchmark';

/**
 * Monitor de latencia integrado (roadmap 1.7).
 *
 * Mide el Round Trip Time (RTT) hacia el backend de sincronización
 * (Firestore) y lo muestra de forma discreta en la UI para alertar a los
 * usuarios de problemas de red durante la interacción musical telemática.
 *
 * Umbrales según el objetivo del roadmap (<50ms para interacción musical):
 *  - verde:   RTT < 50ms  (apto para interacción en tiempo real)
 *  - amarillo: RTT < 150ms (usable con jitter perceptible)
 *  - rojo:    RTT >= 150ms (degradación notable)
 */

const SAMPLE_INTERVAL_MS = 5000;
const SAMPLES_TO_AVERAGE = 4;
const SYNC_ENDPOINT = 'https://firestore.googleapis.com/';

export function LatencyMonitor() {
  const [rtt, setRtt] = useState<number | null>(null);
  const samplesRef = useRef<number[]>([]);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [comparison, setComparison] = useState<ABComparison | null>(null);
  const [running, setRunning] = useState(false);

  const runBenchmark = async () => {
    setRunning(true);
    try {
      await audioManager.startContext();
      // Ceder un frame para no congelar la UI durante la medición
      await new Promise((resolve) => setTimeout(resolve, 50));
      setComparison(audioManager.runEngineComparison(24));
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const measure = async () => {
      const start = performance.now();
      try {
        // Petición opaca (no-cors): no expone el contenido pero sí completa
        // el viaje de ida y vuelta, suficiente para medir el RTT real.
        await fetch(SYNC_ENDPOINT, {
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-store',
        });
        const elapsed = performance.now() - start;

        if (!cancelled) {
          const samples = samplesRef.current;
          samples.push(elapsed);
          if (samples.length > SAMPLES_TO_AVERAGE) {
            samples.shift();
          }
          const average = samples.reduce((sum, s) => sum + s, 0) / samples.length;
          setRtt(Math.round(average));
        }
      } catch {
        if (!cancelled) {
          setRtt(null);
        }
      }

      if (!cancelled) {
        timeoutId = setTimeout(measure, SAMPLE_INTERVAL_MS);
      }
    };

    measure();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  const color =
    rtt === null
      ? 'text-gray-400'
      : rtt < 50
        ? 'text-green-400'
        : rtt < 150
          ? 'text-yellow-400'
          : 'text-red-400';

  const activeEngine = typeof window !== 'undefined' ? audioManager.getActiveEngine() : 'tone';

  return (
    <>
      <button
        onClick={() => setShowDiagnostics(!showDiagnostics)}
        className="fixed bottom-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2 z-50 font-mono text-sm cursor-pointer"
        title="Latencia de red (RTT) y diagnóstico de motor de audio. Clic para validación A/B."
      >
        <span className={`${color} font-bold`}>
          {rtt === null ? '— ms' : `${rtt} ms`} RTT
        </span>
      </button>

      {showDiagnostics && (
        <div className="fixed bottom-16 left-4 w-80 bg-black/90 backdrop-blur-md rounded-lg p-4 z-50 font-mono text-sm text-gray-200 space-y-3">
          <div>
            <h3 className="text-sky-300 font-bold mb-1">Motor de audio</h3>
            <p className="text-xs text-gray-400">
              Activo:{' '}
              <span className={activeEngine === 'tone' ? 'text-gray-200' : 'text-emerald-300'}>
                {activeEngine === 'native'
                  ? 'Web Audio nativo (2.1)'
                  : activeEngine === 'csound'
                    ? 'Csound WASM (2.3)'
                    : 'Tone.js'}
              </span>
            </p>
          </div>

          <button
            onClick={runBenchmark}
            disabled={running}
            className="w-full px-2 py-1 bg-sky-500/20 hover:bg-sky-500/40 rounded text-xs transition-colors disabled:opacity-50"
          >
            {running ? 'Midiendo…' : 'Ejecutar validación A/B'}
          </button>

          {comparison && (
            <div className="text-xs space-y-2">
              <div className="bg-white/5 rounded p-2">
                <p className="text-gray-400">Latencia de hardware ({comparison.sampleRate / 1000} kHz)</p>
                <p>base: {comparison.baseLatencyMs ?? '—'} ms · salida: {comparison.outputLatencyMs ?? '—'} ms</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-emerald-500/10 rounded p-2">
                  <p className="text-emerald-300">Nativo</p>
                  <p className="text-gray-400">{comparison.native.buildMs} ms / {comparison.native.voices} voces</p>
                  <p className="text-gray-400">{comparison.native.perVoiceMs} ms/voz</p>
                  <p className="text-gray-400">{comparison.native.nodesPerVoice} nodos/voz</p>
                </div>
                <div className="bg-white/5 rounded p-2">
                  <p className="text-gray-300">Tone.js</p>
                  <p className="text-gray-400">{comparison.tone.buildMs} ms / {comparison.tone.voices} voces</p>
                  <p className="text-gray-400">{comparison.tone.perVoiceMs} ms/voz</p>
                  <p className="text-gray-400">{comparison.tone.nodesPerVoice} nodos/voz</p>
                </div>
              </div>
              <p className="text-sky-300">
                Construcción nativa {comparison.buildSpeedup}× vs Tone
              </p>
            </div>
          )}

          <p className="text-xs text-gray-500">
            Conmuta el motor con <code className="text-gray-400">NEXT_PUBLIC_AUDIO_ENGINE=native</code> al construir.
          </p>
        </div>
      )}
    </>
  );
}
