'use client';

import { useState, useEffect } from 'react';
import {
  useTutorMetricsStore,
  startMetricsCollector,
  startGraphRecording,
  stopGraphRecording,
  exportSessionReport,
} from '../../lib/pedagogy/sessionMetrics';
import { BANDS } from '../../lib/agents/accompaniment';
import { getCurrentLevel } from '../../lib/pedagogy/parametricLevels';

/**
 * Panel de Control del Tutor (roadmap 8.2).
 *
 * Portal de observación para profesores: métricas de participación en
 * tiempo real del lienzo colaborativo (objetos colocados/retirados,
 * tiempo de sesión, densidad textural por banda con serie temporal) y
 * grabación de grafos exportable a JSON.
 */

const BAND_COLORS = ['#60a5fa', '#facc15', '#f87171'];
const SPARK_W = 264;
const SPARK_H = 48;

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`;
}

/** Línea de evolución de la densidad total (SVG inline). */
function DensitySparkline({ values }: { values: number[] }) {
  if (values.length < 2) {
    return <p className="text-xs text-gray-500">Recolectando muestras…</p>;
  }
  const max = Math.max(1, ...values);
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * SPARK_W;
      const y = SPARK_H - 3 - (value / max) * (SPARK_H - 6);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg width={SPARK_W} height={SPARK_H} className="bg-black/40 rounded">
      <polyline points={points} fill="none" stroke="#34d399" strokeWidth="1.5" />
    </svg>
  );
}

export function TutorDashboard() {
  const [open, setOpen] = useState(false);
  const [, forceTick] = useState(0);
  const metrics = useTutorMetricsStore();

  // Recolector activo durante toda la sesión; reloj del panel cada segundo
  useEffect(() => {
    startMetricsCollector();
    const clock = setInterval(() => forceTick((n) => n + 1), 1000);
    return () => clearInterval(clock);
  }, []);

  const latest = metrics.densityHistory[metrics.densityHistory.length - 1];
  const totalNow = latest?.total ?? 0;
  const level = getCurrentLevel();

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-16 left-4 bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2 z-50 font-mono text-sm transition-colors ${
          metrics.isRecording
            ? 'text-red-300'
            : open
              ? 'text-emerald-300'
              : 'text-gray-400 hover:text-gray-200'
        }`}
        title="Panel del tutor: métricas de participación y grabación de grafos"
      >
        📊 Tutor{metrics.isRecording ? ' ●' : ''}
      </button>

      {open && (
        <div className="fixed bottom-28 left-4 w-80 max-h-[60vh] overflow-y-auto bg-black/90 backdrop-blur-md rounded-lg p-4 z-50 font-mono text-sm text-gray-200 space-y-4">
          <div>
            <h3 className="text-emerald-300 font-bold mb-1">Panel del tutor</h3>
            <p className="text-xs text-gray-400">
              Observación en tiempo real del lienzo colaborativo. Nivel
              paramétrico activo: <span className="text-gray-200">{level.name}</span>.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white/5 rounded p-2">
              <p className="text-gray-400">Tiempo de sesión</p>
              <p className="text-lg text-gray-100">
                {formatDuration(Date.now() - metrics.sessionStart)}
              </p>
            </div>
            <div className="bg-white/5 rounded p-2">
              <p className="text-gray-400">Objetos en el lienzo</p>
              <p className="text-lg text-gray-100">{totalNow}</p>
            </div>
            <div className="bg-white/5 rounded p-2">
              <p className="text-gray-400">Colocados (sesión)</p>
              <p className="text-lg text-emerald-300">+{metrics.placedCount}</p>
            </div>
            <div className="bg-white/5 rounded p-2">
              <p className="text-gray-400">Retirados (sesión)</p>
              <p className="text-lg text-red-300">−{metrics.removedCount}</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-1">Densidad textural (evolución)</p>
            <DensitySparkline values={metrics.densityHistory.map((sample) => sample.total)} />
          </div>

          {latest && latest.total > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-1">
                Distribución espectral{' '}
                {latest.dominance >= 0.6 && (
                  <span className="text-amber-300">— banda saturada</span>
                )}
              </p>
              <div className="space-y-1">
                {BANDS.map((band, index) => {
                  const count = latest.bands[index] ?? 0;
                  const fraction = latest.total === 0 ? 0 : count / latest.total;
                  return (
                    <div key={band.name} className="flex items-center gap-2 text-xs">
                      <span className="w-12 text-gray-400">{band.name}</span>
                      <div className="flex-1 bg-white/10 rounded h-2 overflow-hidden">
                        <div
                          className="h-full rounded"
                          style={{
                            width: `${Math.round(fraction * 100)}%`,
                            backgroundColor: BAND_COLORS[index],
                          }}
                        />
                      </div>
                      <span className="w-6 text-right text-gray-300">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-xs text-gray-400">
              Grabación de grafos
              {metrics.isRecording && metrics.recordingStart && (
                <span className="text-red-300">
                  {' '}
                  ● {formatDuration(Date.now() - metrics.recordingStart)} ·{' '}
                  {metrics.recording.length} instantáneas
                </span>
              )}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => (metrics.isRecording ? stopGraphRecording() : startGraphRecording())}
                className={`flex-1 px-2 py-1 rounded text-xs transition-colors ${
                  metrics.isRecording
                    ? 'bg-red-500/30 hover:bg-red-500/50'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {metrics.isRecording ? '■ Detener grabación' : '● Grabar grafos'}
              </button>
              <button
                onClick={exportSessionReport}
                className="flex-1 px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/40 rounded text-xs transition-colors"
                title="Descargar informe JSON con métricas, serie de densidad y grabación de grafos"
              >
                ⬇ Informe JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
