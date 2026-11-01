'use client';

import { useState, useEffect, useCallback } from 'react';
import * as Tone from 'tone';
import { audioManager } from '../../lib/AudioManager';
import { useUIPanelStore } from '../../state/useUIPanelStore';

/**
 * Calibrador Acústico Básico (roadmap 4.4).
 *
 * Asistente interactivo que reproduce tonos de prueba espacializados en
 * direcciones conocidas (frente, atrás, arriba, abajo, izquierda, derecha)
 * alrededor del oyente, para que el usuario verifique la localización
 * binaural y ajuste manualmente la escala del modelo acústico (atenuación
 * por distancia) según su percepción y auriculares. La calibración se
 * persiste en localStorage y se re-aplica en cada sesión.
 */

const STORAGE_KEY = 'solomon-house:acoustic-calibration';

interface Calibration {
  rolloffFactor: number;
  refDistance: number;
}

const TEST_DIRECTIONS: { label: string; offset: [number, number, number] }[] = [
  { label: 'Frente', offset: [0, 0, -3] },
  { label: 'Atrás', offset: [0, 0, 3] },
  { label: 'Izquierda', offset: [-3, 0, 0] },
  { label: 'Derecha', offset: [3, 0, 0] },
  { label: 'Arriba', offset: [0, 3, 0] },
  { label: 'Abajo', offset: [0, -3, 0] },
];

function loadCalibration(): Calibration | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Calibration) : null;
  } catch {
    return null;
  }
}

/** Reproduce un tono de prueba de 1s en una posición relativa al oyente. */
async function playTestTone(offset: [number, number, number]): Promise<void> {
  await Tone.start();

  const listenerPosition: [number, number, number] = [
    Tone.getListener().positionX.value,
    Tone.getListener().positionY.value,
    Tone.getListener().positionZ.value,
  ];

  const panner = new Tone.Panner3D({
    panningModel: 'HRTF',
    positionX: listenerPosition[0] + offset[0],
    positionY: listenerPosition[1] + offset[1],
    positionZ: listenerPosition[2] + offset[2],
  }).toDestination();

  const oscillator = new Tone.Oscillator(440, 'sine').connect(panner);
  oscillator.volume.value = -12;
  oscillator.start();
  oscillator.stop('+1');

  // Liberación explícita de los nodos de prueba (roadmap 2.5)
  setTimeout(() => {
    oscillator.dispose();
    panner.dispose();
  }, 1500);
}

export function AcousticCalibrator() {
  const activeModal = useUIPanelStore((s) => s.activeModal);
  const closeModal = useUIPanelStore((s) => s.closeModal);
  const open = activeModal === 'calibrator';
  const [calibration, setCalibration] = useState<Calibration>({
    rolloffFactor: 2,
    refDistance: 1,
  });

  // Cargar y aplicar la calibración persistida al iniciar la sesión
  useEffect(() => {
    const saved = loadCalibration();
    if (saved) {
      setCalibration(saved);
      audioManager.applySpatialCalibration(saved);
    }
  }, []);

  const applyCalibration = useCallback((updated: Calibration) => {
    setCalibration(updated);
    audioManager.applySpatialCalibration(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Almacenamiento no disponible: la calibración vivirá solo en sesión
    }
  }, []);

  return (
    <>
      {open && (
        <div className="fixed top-14 left-[21rem] w-80 bg-black/95 border border-cyan-500/40 backdrop-blur-md rounded-xl p-4 z-50 font-mono text-sm text-gray-200 space-y-4 shadow-2xl">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-cyan-300 font-bold mb-1">Calibración acústica</h3>
              <p className="text-xs text-gray-400">
                Usa auriculares. Reproduce cada tono y verifica que lo percibes
                en la dirección indicada; ajusta la escala si las distancias no
                se sienten naturales.
              </p>
            </div>
            <button onClick={closeModal} className="text-gray-400 hover:text-white px-1">
              ✕
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1">
            {TEST_DIRECTIONS.map(({ label, offset }) => (
              <button
                key={label}
                onClick={() => playTestTone(offset)}
                className="px-2 py-1 bg-white/10 hover:bg-cyan-500/30 rounded text-xs transition-colors"
              >
                {label}
              </button>
            ))}
          </div>

          <label className="block">
            <span className="text-xs text-gray-400">
              Escala de atenuación (rolloff): {calibration.rolloffFactor.toFixed(1)}
            </span>
            <input
              type="range"
              min={0.5}
              max={4}
              step={0.1}
              value={calibration.rolloffFactor}
              onChange={(e) =>
                applyCalibration({ ...calibration, rolloffFactor: Number(e.target.value) })
              }
              className="w-full"
            />
          </label>

          <label className="block">
            <span className="text-xs text-gray-400">
              Distancia de referencia: {calibration.refDistance.toFixed(1)} m
            </span>
            <input
              type="range"
              min={0.5}
              max={5}
              step={0.1}
              value={calibration.refDistance}
              onChange={(e) =>
                applyCalibration({ ...calibration, refDistance: Number(e.target.value) })
              }
              className="w-full"
            />
          </label>

          <button
            onClick={() => applyCalibration({ rolloffFactor: 2, refDistance: 1 })}
            className="w-full px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs transition-colors"
          >
            Restablecer valores por defecto
          </button>
        </div>
      )}
    </>
  );
}
