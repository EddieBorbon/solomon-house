'use client';

import React, { useState } from 'react';
import { useWorldStore } from '../../state/useWorldStore';
import {
  useVisualSonicStore,
  VISUAL_SONIC_PRESETS,
  OBJECT_TIMBRAL_LOGIC,
  setRoomVisualSonicPreset,
  explainWhyObjectSoundsLikeThis,
  startPerceptualTrial,
  submitPerceptualGuess,
  getPerceptualSummaryStats,
  exportPerceptualEvaluationReport,
  type VisualSonicPresetId,
} from '../../lib/mapping/visualSonicCoherence';

/**
 * Panel y Leyenda de Coherencia Visual-Sonora (Etapa E3 completa).
 *
 * Incluye:
 *  - Selector de preset de lógica visual-sonora (Estructural, Gestual, Simbólica) (E3.1.3).
 *  - Inspector en vivo "¿Por qué suena así?" del objeto seleccionado (E3.3.1).
 *  - Leyenda flotante de la sala (E3.3.2).
 *  - Modo acusmático experimental (E3.4.1).
 *  - Prueba perceptual de reconocimiento objeto–sonido y exportación JSON (E3.4.2, E3.4.3).
 */
export function VisualSonicCoherencePanel() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'why' | 'presets' | 'perceptual'>('why');

  const vsState = useVisualSonicStore();
  const { grids, selectedEntityId, triggerObjectNote } = useWorldStore();

  const allObjects = Array.from(grids.values()).flatMap((g) => g.objects);
  const selectedObject = allObjects.find((o) => o.id === selectedEntityId) ?? allObjects[0] ?? null;
  const explanation = selectedObject ? explainWhyObjectSoundsLikeThis(selectedObject) : null;
  const currentPreset = VISUAL_SONIC_PRESETS[vsState.activePreset];
  const stats = getPerceptualSummaryStats();

  return (
    <>
      {/* Leyenda flotante de la sala (E3.3.2) */}
      {vsState.showRoomLegend && (
        <div className="fixed top-20 left-4 z-30 max-w-xs rounded-xl border border-amber-500/40 bg-black/85 p-3 text-[11px] text-neutral-200 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-2">
            <span className="font-semibold text-amber-300">
              Leyenda Visual-Sonora · {currentPreset.name}
            </span>
            <button
              onClick={() => useVisualSonicStore.setState({ showRoomLegend: false })}
              className="text-neutral-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <ul className="space-y-1 text-neutral-300">
            {currentPreset.rulesSummary.map((rule, idx) => (
              <li key={idx}>• {rule}</li>
            ))}
          </ul>
          {vsState.acousmaticMode && (
            <div className="mt-2 rounded bg-purple-950/60 border border-purple-500/40 px-2 py-1 text-purple-200">
              Modo Acusmático Activo: geometrías ocultas, escucha espacial pura.
            </div>
          )}
        </div>
      )}

      {/* Botón flotante y modal E3 */}
      <div className="fixed bottom-4 left-[390px] z-40">
        {!open ? (
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-amber-500/40 bg-black/85 px-3.5 py-2 text-xs font-medium text-amber-200 shadow-lg backdrop-blur-md transition hover:border-amber-400 hover:bg-amber-950/60"
            title="Coherencia Visual-Sonora, ¿Por qué suena así? y Prueba Perceptual (Etapa E3)"
          >
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span>Coherencia Visual-Sonora (E3)</span>
          </button>
        ) : (
          <div className="w-[460px] max-w-[94vw] rounded-2xl border border-white/15 bg-neutral-950/95 p-4 text-xs text-neutral-200 shadow-2xl backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Coherencia Visual-Sonora (E3)
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Morfología tímbrica · ¿Por qué suena así? · Modo Acusmático
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-1 text-neutral-400 hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Controles rápidos de barra superior */}
            <div className="mb-3 flex flex-wrap gap-2">
              <button
                onClick={() =>
                  useVisualSonicStore.setState({ showRoomLegend: !vsState.showRoomLegend })
                }
                className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${
                  vsState.showRoomLegend
                    ? 'bg-amber-600 text-white'
                    : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                }`}
              >
                {vsState.showRoomLegend ? 'Ocultar leyenda en sala' : 'Mostrar leyenda en sala'}
              </button>
              <button
                onClick={() =>
                  useVisualSonicStore.setState({ acousmaticMode: !vsState.acousmaticMode })
                }
                className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${
                  vsState.acousmaticMode
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                }`}
              >
                {vsState.acousmaticMode
                  ? 'Modo Acusmático: ACTIVO'
                  : 'Activar Modo Acusmático (E3.4.1)'}
              </button>
            </div>

            {/* Pestañas */}
            <div className="mb-3 flex gap-1 rounded-lg bg-white/5 p-1">
              {(
                [
                  ['why', '¿Por qué suena así?'],
                  ['presets', 'Lógica y Formas'],
                  ['perceptual', 'Prueba Perceptual'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex-1 rounded-md py-1.5 text-[11px] font-medium transition ${
                    activeTab === id
                      ? 'bg-amber-600 text-white'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* PESTAÑA 1: ¿POR QUÉ SUENA ASÍ? (E3.3.1) */}
            {activeTab === 'why' && (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {explanation ? (
                  <>
                    <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-amber-300">
                          {explanation.shapeName} · {explanation.synthFamily}
                        </span>
                        <span className="rounded bg-black/50 px-2 py-0.5 font-mono text-[11px] text-amber-200">
                          {explanation.currentFrequencyHz} Hz
                        </span>
                      </div>
                      <p className="mt-1.5 text-[11px] text-neutral-300">
                        {explanation.morphologicalRationale}
                      </p>
                      <div className="mt-2 text-[11px] text-amber-200/90">
                        <strong>Registro actual:</strong> {explanation.registerLabel}
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                      <div className="mb-1 text-[11px] font-medium text-neutral-300">
                        Mapeos activos ({explanation.activePresetName})
                      </div>
                      {explanation.activeMappingsDescriptions.length === 0 ? (
                        <p className="text-[11px] text-neutral-400">
                          Sin mapeos automáticos activos en este objeto.
                        </p>
                      ) : (
                        <ul className="space-y-1 font-mono text-[10px] text-emerald-300">
                          {explanation.activeMappingsDescriptions.map((desc, idx) => (
                            <li key={idx}>{desc}</li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-[11px]">
                      <strong>Zonas acústicas que lo afectan:</strong>{' '}
                      {explanation.activeEffects.length > 0
                        ? explanation.activeEffects.join(', ')
                        : 'Ninguna (sonido directo)'}
                    </div>
                  </>
                ) : (
                  <p className="text-neutral-400">
                    Crea o selecciona un objeto sonoro en la escena para inspeccionar por qué
                    suena así.
                  </p>
                )}
              </div>
            )}

            {/* PESTAÑA 2: PRESETS Y CATÁLOGO FORMA → TIMBRE (E3.1.1, E3.1.2, E3.1.3) */}
            {activeTab === 'presets' && (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                <div>
                  <label className="mb-1 block text-[11px] text-neutral-400">
                    Preset de lógica visual-sonora de la sala (E3.1.3)
                  </label>
                  <select
                    value={vsState.activePreset}
                    onChange={(e) =>
                      setRoomVisualSonicPreset(e.target.value as VisualSonicPresetId)
                    }
                    className="w-full rounded-lg border border-white/15 bg-black px-2.5 py-1.5 text-xs text-white"
                  >
                    {Object.values(VISUAL_SONIC_PRESETS).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-[10px] text-amber-300">{currentPreset.subtitle}</p>
                </div>

                <label className="flex items-center gap-2 text-[11px]">
                  <input
                    type="checkbox"
                    checked={vsState.autoApplyMappingsOnCreate}
                    onChange={(e) =>
                      useVisualSonicStore.setState({
                        autoApplyMappingsOnCreate: e.target.checked,
                      })
                    }
                  />
                  <span>Aplicar lógica por defecto al crear objetos nuevos (E3.1.2)</span>
                </label>

                <div className="space-y-1.5">
                  <div className="text-[11px] font-medium text-neutral-300">
                    Correspondencia Forma Geométrica → Familia Tímbrica (E3.1.1)
                  </div>
                  {Object.values(OBJECT_TIMBRAL_LOGIC).map((item) => (
                    <div
                      key={item.type}
                      className="rounded-lg border border-white/10 bg-white/5 p-2 text-[10px]"
                    >
                      <div className="font-semibold text-amber-300">
                        {item.shapeName} → {item.synthFamily}
                      </div>
                      <div className="text-neutral-300">{item.morphologicalRationale}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PESTAÑA 3: PRUEBA PERCEPTUAL (E3.4.2 y E3.4.3) */}
            {activeTab === 'perceptual' && (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                <p className="text-[11px] text-neutral-300">
                  Evalúa empíricamente si la lógica visual-sonora permite identificar qué
                  objeto sonó por encima del azar (<span className="font-mono">1/N</span>).
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => startPerceptualTrial()}
                    className="flex-1 rounded-lg bg-amber-600 px-3 py-2 font-medium text-white hover:bg-amber-500"
                  >
                    {vsState.activeTrialTargetId
                      ? 'Repetir estímulo / Nuevo ensayo'
                      : 'Iniciar ensayo perceptual'}
                  </button>
                  {vsState.activeTrialTargetId && (
                    <button
                      onClick={() => triggerObjectNote(vsState.activeTrialTargetId!)}
                      className="rounded-lg border border-amber-400/40 bg-amber-950/50 px-3 py-2 text-amber-200 hover:bg-amber-900/50"
                    >
                      Re-escuchar
                    </button>
                  )}
                </div>

                {vsState.activeTrialTargetId && (
                  <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-2.5">
                    <div className="mb-1.5 text-[11px] font-semibold text-amber-200">
                      ¿Cuál de los {allObjects.length} objetos de la sala acaba de sonar?
                      (Haz clic en él en 3D o elígelo aquí):
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {allObjects.map((obj, i) => (
                        <button
                          key={obj.id}
                          onClick={() => submitPerceptualGuess(obj.id)}
                          className="rounded border border-white/15 bg-black/60 px-2 py-1 text-left text-[10px] hover:border-amber-400"
                        >
                          #{i + 1} {OBJECT_TIMBRAL_LOGIC[obj.type]?.shapeName ?? obj.type} (Y=
                          {obj.position[1].toFixed(1)}m, Esc={obj.scale[0].toFixed(1)})
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2 rounded-xl border border-white/10 bg-white/5 p-2.5 text-center">
                  <div>
                    <div className="text-[10px] text-neutral-400">Ensayos</div>
                    <div className="text-sm font-bold text-white">{stats.totalTrials}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-neutral-400">Tasa de acierto</div>
                    <div
                      className={`text-sm font-bold ${
                        stats.aboveChance ? 'text-emerald-400' : 'text-amber-300'
                      }`}
                    >
                      {stats.accuracyPct}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-neutral-400">Azar esperado (1/N)</div>
                    <div className="text-sm font-bold text-neutral-300">
                      {stats.meanChancePct}%
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => exportPerceptualEvaluationReport()}
                  disabled={stats.totalTrials === 0}
                  className="w-full rounded-lg border border-emerald-500/40 bg-emerald-950/50 py-1.5 text-[11px] font-medium text-emerald-200 hover:bg-emerald-900/60 disabled:opacity-40"
                >
                  Exportar informe perceptual JSON para tesis (E3.4.3)
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
