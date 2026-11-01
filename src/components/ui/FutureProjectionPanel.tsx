'use client';

import React, { useState } from 'react';
import {
  useFutureProjectionStore,
  RAVE_TIMBRE_MODELS,
  RaveLatentModelId,
  XrHandGestureAction,
  executeXrHandParityAction,
  createPassthroughSpatialAnchor,
  runBrowserOnnxAgentStep,
  applyRaveTimbreTransferToSelected,
  generateComplementaryAiSessionAnalysis,
  exportActivityPubNodeManifestJson,
  exportSchoolCurriculumAndImpactPackageJson,
} from '@/lib/future/futureProjection';
import { useCurationArchiveStore } from '@/lib/residency/curationArchive';

export function FutureProjectionPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'xr' | 'ai' | 'federation' | 'sustainability'>('xr');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const [anchorLabel, setAnchorLabel] = useState('Columna Resonante Norte');
  const [anchorX, setAnchorX] = useState('1.8');
  const [anchorY, setAnchorY] = useState('1.5');
  const [anchorZ, setAnchorZ] = useState('-2.2');

  const store = useFutureProjectionStore();
  const archiveFragments = useCurationArchiveStore((s) => s.fragments);

  const notify = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const handleXrAction = (action: XrHandGestureAction) => {
    const res = executeXrHandParityAction(action);
    notify(res);
  };

  const handleCreateAnchor = () => {
    const coord: [number, number, number] = [
      parseFloat(anchorX) || 0,
      parseFloat(anchorY) || 1.5,
      parseFloat(anchorZ) || -1.5,
    ];
    const anchor = createPassthroughSpatialAnchor(anchorLabel, coord);
    notify(
      `Ancla Passthrough "${anchor.label}" fijada en [${anchor.physicalRoomCoordMeters.join(', ')}] m`
    );
  };

  const handleRunOnnxStep = () => {
    const res = runBrowserOnnxAgentStep();
    notify(
      `Inferencia ONNX/WASM: ${res.chosenType} (${res.frequencyHz} Hz) en [${res.position.join(', ')}] — Corpus ético: ${res.eligibleFragmentsCount} obras CC`
    );
  };

  const handleApplyRave = (modelId: RaveLatentModelId) => {
    const msg = applyRaveTimbreTransferToSelected(modelId);
    notify(msg);
  };

  const handleGenerateAiAnalysis = () => {
    generateComplementaryAiSessionAnalysis();
    notify('Análisis complementario IA generado sobre la base determinista E1.3.');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-[420px] z-40 flex items-center gap-2 rounded-lg border border-fuchsia-500/40 bg-black/85 px-3 py-1.5 font-mono text-xs text-fuchsia-300 shadow-lg backdrop-blur-md transition hover:border-fuchsia-400 hover:bg-fuchsia-950/50"
        title="Etapa E8: XR, IA en Navegador, Federación ActivityPub y Sostenibilidad"
      >
        <span>🚀</span>
        <span>E8 · Proyección (XR / IA / Fed)</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-14 left-6 z-50 w-[560px] max-w-[95vw] rounded-xl border border-fuchsia-500/40 bg-zinc-950/95 p-4 text-xs text-zinc-200 shadow-2xl backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between border-b border-zinc-800 pb-2">
        <div>
          <h3 className="font-mono text-sm font-bold text-fuchsia-300">
            ETAPA E8 · PROYECCIÓN FUTURA (XR · IA · FEDERACIÓN · IMPACTO)
          </h3>
          <p className="text-[11px] text-zinc-400">
            WebXR Passthrough, ONNX/RAVE ético en navegador, ActivityPub P2P y Escuela de Música
          </p>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="rounded border border-zinc-700 px-2 py-0.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
        >
          ✕
        </button>
      </div>

      {statusMsg && (
        <div className="mb-3 rounded border border-fuchsia-500/50 bg-fuchsia-950/40 px-2.5 py-1.5 font-mono text-[11px] text-fuchsia-200">
          {statusMsg}
        </div>
      )}

      {/* Pestañas E8.1 - E8.4 */}
      <div className="mb-3 grid grid-cols-4 gap-1 rounded-lg bg-zinc-900 p-1 font-mono text-[11px]">
        <button
          onClick={() => setActiveTab('xr')}
          className={`rounded py-1 transition ${
            activeTab === 'xr'
              ? 'bg-fuchsia-600 font-semibold text-white'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          E8.1 XR / Site
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`rounded py-1 transition ${
            activeTab === 'ai'
              ? 'bg-fuchsia-600 font-semibold text-white'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          E8.2 IA / RAVE
        </button>
        <button
          onClick={() => setActiveTab('federation')}
          className={`rounded py-1 transition ${
            activeTab === 'federation'
              ? 'bg-fuchsia-600 font-semibold text-white'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          E8.3 Federación
        </button>
        <button
          onClick={() => setActiveTab('sustainability')}
          className={`rounded py-1 transition ${
            activeTab === 'sustainability'
              ? 'bg-fuchsia-600 font-semibold text-white'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          E8.4 Pedagogía
        </button>
      </div>

      <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
        {activeTab === 'xr' && (
          <div className="space-y-3">
            {/* E8.1.1 Paridad de manipulación espacial WebXR */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5">
              <div className="mb-1.5 font-mono font-semibold text-fuchsia-300">
                E8.1.1 · Paridad de Manipulación Espacial WebXR (Manos / Controladores)
              </div>
              <p className="mb-2 text-[11px] text-zinc-400">
                Ejecuta con las manos virtuales o controladores 6DoF las mismas operaciones de
                escritorio sobre el objeto activo:
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => handleXrAction('grab_move')}
                  className="rounded border border-fuchsia-500/40 bg-fuchsia-950/30 px-2 py-1 text-left font-mono text-[11px] text-fuchsia-200 hover:bg-fuchsia-900/40"
                >
                  🤏 Pinza (Grab &amp; Move 3D)
                </button>
                <button
                  onClick={() => handleXrAction('pinch_scale')}
                  className="rounded border border-fuchsia-500/40 bg-fuchsia-950/30 px-2 py-1 text-left font-mono text-[11px] text-fuchsia-200 hover:bg-fuchsia-900/40"
                >
                  🙌 Gesto Bimanual (Escalar)
                </button>
                <button
                  onClick={() => handleXrAction('twist_rotate')}
                  className="rounded border border-fuchsia-500/40 bg-fuchsia-950/30 px-2 py-1 text-left font-mono text-[11px] text-fuchsia-200 hover:bg-fuchsia-900/40"
                >
                  🔄 Giro de Muñeca (Rotar)
                </button>
                <button
                  onClick={() => handleXrAction('poke_trigger')}
                  className="rounded border border-fuchsia-500/40 bg-fuchsia-950/30 px-2 py-1 text-left font-mono text-[11px] text-fuchsia-200 hover:bg-fuchsia-900/40"
                >
                  👆 Toque Directo (Disparar Nota)
                </button>
              </div>
            </div>

            {/* E8.1.2 Passthrough AR */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="font-mono font-semibold text-fuchsia-300">
                  E8.1.2 · Realidad Aumentada (Passthrough AR) y Anclas Físicas
                </span>
                <label className="flex items-center gap-1.5 text-[11px]">
                  <input
                    type="checkbox"
                    checked={store.passthroughArEnabled}
                    onChange={(e) =>
                      useFutureProjectionStore.setState({ passthroughArEnabled: e.target.checked })
                    }
                  />
                  <span>Passthrough Activo</span>
                </label>
              </div>
              <div className="mb-2 grid grid-cols-4 gap-1.5">
                <input
                  value={anchorLabel}
                  onChange={(e) => setAnchorLabel(e.target.value)}
                  className="col-span-2 rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-[11px]"
                  placeholder="Etiqueta en sala física"
                />
                <input
                  value={anchorX}
                  onChange={(e) => setAnchorX(e.target.value)}
                  className="rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-[11px]"
                  placeholder="X (m)"
                />
                <div className="flex gap-1">
                  <input
                    value={anchorY}
                    onChange={(e) => setAnchorY(e.target.value)}
                    className="w-1/2 rounded border border-zinc-700 bg-zinc-950 px-1.5 py-1 text-[11px]"
                    placeholder="Y"
                  />
                  <input
                    value={anchorZ}
                    onChange={(e) => setAnchorZ(e.target.value)}
                    className="w-1/2 rounded border border-zinc-700 bg-zinc-950 px-1.5 py-1 text-[11px]"
                    placeholder="Z"
                  />
                </div>
              </div>
              <button
                onClick={handleCreateAnchor}
                className="mb-2 w-full rounded bg-fuchsia-600 px-2.5 py-1 font-mono text-[11px] font-semibold text-white hover:bg-fuchsia-500"
              >
                + Anclar Objeto Sonoro en Coordenada de Habitación Física
              </button>
              <div className="space-y-1">
                {store.passthroughAnchors.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between rounded bg-zinc-950/80 px-2 py-1 font-mono text-[10px]"
                  >
                    <span className="text-zinc-200">{a.label}</span>
                    <span className="text-fuchsia-300">
                      [{a.physicalRoomCoordMeters.join('m, ')}m]
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* E8.1.3 Sesiones mixtas VR + Escritorio + Móvil */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5">
              <div className="mb-1.5 font-mono font-semibold text-fuchsia-300">
                E8.1.3 · Sesión Mixta Multi-Dispositivo (VR + AR + Escritorio + Móvil)
              </div>
              <div className="space-y-1">
                {store.mixedRealityParticipants.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-[11px]"
                  >
                    <div>
                      <span className="font-semibold text-zinc-200">{p.alias}</span>
                      <span className="ml-2 rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-fuchsia-300">
                        {p.deviceModality}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-zinc-400">
                      {p.activeHandTracking ? '🖐 Hand-Tracking' : '🖱 Cursor/Gyro'} · [
                      {p.position.join(', ')}]
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* E8.1.4 Instalaciones Site-Specific */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="font-mono font-semibold text-fuchsia-300">
                  E8.1.4 · Instalación Site-Specific con Coordenadas Físicas
                </span>
                <label className="flex items-center gap-1.5 text-[11px]">
                  <input
                    type="checkbox"
                    checked={store.siteSpecificConfig.enabled}
                    onChange={(e) =>
                      useFutureProjectionStore.setState({
                        siteSpecificConfig: {
                          ...store.siteSpecificConfig,
                          enabled: e.target.checked,
                        },
                      })
                    }
                  />
                  <span>Modo Sala / Museo</span>
                </label>
              </div>
              <div className="text-[11px] text-zinc-300">
                <div>
                  Sede: <span className="font-mono text-fuchsia-200">{store.siteSpecificConfig.venueName}</span>
                </div>
                <div>
                  Dimensiones acústicas:{' '}
                  <span className="font-mono text-zinc-200">
                    {store.siteSpecificConfig.physicalDimensionsMeters.join(' × ')} m
                  </span>{' '}
                  · Auto-reset quiosco: {store.siteSpecificConfig.kioskAutoResetMinutes} min
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-3">
            {/* E8.2.1 Modelos neuronales ligeros ONNX/TF.js en el navegador */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="font-mono font-semibold text-fuchsia-300">
                  E8.2.1 · Agente Neuronal Ligero en Navegador (ONNX / WebAssembly)
                </span>
                <span className="rounded bg-emerald-950 px-1.5 py-0.5 font-mono text-[10px] text-emerald-300">
                  100% Local (Sin API externa)
                </span>
              </div>
              <div className="mb-2 flex items-center justify-between gap-2 text-[11px]">
                <span>Temperatura Latente: {store.onnxTemperature.toFixed(2)}</span>
                <input
                  type="range"
                  min={0.1}
                  max={1.5}
                  step={0.05}
                  value={store.onnxTemperature}
                  onChange={(e) =>
                    useFutureProjectionStore.setState({
                      onnxTemperature: parseFloat(e.target.value),
                    })
                  }
                  className="w-40 accent-fuchsia-500"
                />
              </div>
              <button
                onClick={handleRunOnnxStep}
                className="w-full rounded bg-fuchsia-600 px-3 py-1.5 font-mono text-[11px] font-semibold text-white hover:bg-fuchsia-500"
              >
                🧠 Ejecutar Inferencia Neuronal en Navegador e Insertar Gesto
              </button>
            </div>

            {/* E8.2.2 Síntesis por transferencia de timbre en tiempo real (RAVE) */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5">
              <div className="mb-1.5 font-mono font-semibold text-fuchsia-300">
                E8.2.2 · Transferencia de Timbre en Tiempo Real (Estilo RAVE Latente)
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {(Object.keys(RAVE_TIMBRE_MODELS) as RaveLatentModelId[]).map((id) => {
                  const m = RAVE_TIMBRE_MODELS[id];
                  const active = store.activeRaveModel === id;
                  return (
                    <button
                      key={id}
                      onClick={() => handleApplyRave(id)}
                      className={`flex items-center justify-between rounded border px-2.5 py-1.5 text-left transition ${
                        active
                          ? 'border-fuchsia-400 bg-fuchsia-950/50 text-white'
                          : 'border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <div>
                        <div className="font-mono text-[11px] font-semibold">{m.name}</div>
                        <div className="text-[10px] text-zinc-400">{m.corpusOrigin}</div>
                      </div>
                      <span className="font-mono text-[10px] text-fuchsia-300">
                        {m.spectralShaping.formantHz[1]} Hz
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* E8.2.3 Entrenamiento ético con el archivo comunitario */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5">
              <div className="mb-1 font-mono font-semibold text-fuchsia-300">
                E8.2.3 · Corpus Ético del Archivo Comunitario (Licencias Libres + Consentimiento)
              </div>
              <p className="mb-1.5 text-[11px] text-zinc-400">
                Sólo se emplean fragmentos del archivo E6 con consentimiento informado (E1.1.5) y
                licencia Creative Commons abierta:
              </p>
              <div className="space-y-1">
                {archiveFragments.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between rounded bg-zinc-950 px-2 py-1 font-mono text-[10px]"
                  >
                    <span className="text-zinc-200">{f.title}</span>
                    <span className="text-emerald-400">{f.license} · Consentido ✓</span>
                  </div>
                ))}
              </div>
            </div>

            {/* E8.2.4 Análisis asistido por IA como complemento del determinista */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="font-mono font-semibold text-fuchsia-300">
                  E8.2.4 · Análisis IA Complementario al Musicológico Determinista (E1.3)
                </span>
                <button
                  onClick={handleGenerateAiAnalysis}
                  className="rounded border border-fuchsia-500/50 bg-fuchsia-950/40 px-2 py-0.5 font-mono text-[10px] text-fuchsia-200 hover:bg-fuchsia-900/50"
                >
                  Generar Lectura
                </button>
              </div>
              {store.latestAiInsight ? (
                <div className="space-y-1 rounded bg-zinc-950 p-2 text-[11px]">
                  <div className="font-mono text-[10px] text-zinc-400">
                    {store.latestAiInsight.deterministicBaseSummary}
                  </div>
                  <p className="text-zinc-200">{store.latestAiInsight.structuralNarrative}</p>
                  <p className="text-fuchsia-300">{store.latestAiInsight.pedagogicalSuggestion}</p>
                </div>
              ) : (
                <p className="text-[11px] text-zinc-400">
                  Pulsa &ldquo;Generar Lectura&rdquo; para contrastar las métricas exactas de E1.3
                  con una interpretación estructural asistida.
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'federation' && (
          <div className="space-y-3">
            {/* E8.3.1, E8.3.2, E8.3.3 Federación ActivityPub / P2P */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="font-mono font-semibold text-fuchsia-300">
                  E8.3.1 / E8.3.2 · Nodos Federados (ActivityPub + WebRTC P2P)
                </span>
                <button
                  onClick={() => {
                    exportActivityPubNodeManifestJson();
                    notify('Manifiesto ActivityPub/P2P exportado.');
                  }}
                  className="rounded bg-fuchsia-600 px-2 py-0.5 font-mono text-[10px] font-semibold text-white hover:bg-fuchsia-500"
                >
                  ⬇ Actor ActivityPub JSON
                </button>
              </div>
              <div className="space-y-1.5">
                {store.federatedNodes.map((node) => (
                  <div
                    key={node.id}
                    className="rounded border border-zinc-800 bg-zinc-950 p-2 text-[11px]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-zinc-100">{node.institution}</span>
                      <span className="rounded bg-emerald-950 px-1.5 py-0.5 font-mono text-[10px] text-emerald-300">
                        {node.status} · {node.sharedWorksCount} obras
                      </span>
                    </div>
                    <div className="font-mono text-[10px] text-fuchsia-300">
                      {node.activityPubActorInbox}
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      {node.name} ({node.country}) · Enlace P2P: {node.p2pSignalingEndpoint}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* E8.3.3 Catálogo distribuido */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5">
              <div className="mb-1 font-mono font-semibold text-fuchsia-300">
                E8.3.3 · Archivo Distribuido entre Nodos sin Servidor Central
              </div>
              <p className="text-[11px] text-zinc-300">
                Sesión inter-nodos activa:{' '}
                <span className="font-mono text-fuchsia-300">
                  {store.activeCrossNodeSessionId}
                </span>{' '}
                — Las obras y partituras topológicas E2 se replican mediante resúmenes firmados entre
                CDMX, Moscú, Nanjing y Bangkok.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'sustainability' && (
          <div className="space-y-3">
            {/* E8.4.1 Paquete para escuelas de música */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="font-mono font-semibold text-fuchsia-300">
                  E8.4.1 · Paquete Curricular para Escuelas de Música (8 Semanas)
                </span>
                <button
                  onClick={() => {
                    exportSchoolCurriculumAndImpactPackageJson();
                    notify('Paquete curricular e informe de impacto descargado.');
                  }}
                  className="rounded bg-fuchsia-600 px-2.5 py-1 font-mono text-[10px] font-semibold text-white hover:bg-fuchsia-500"
                >
                  ⬇ Descargar Paquete Escolar
                </button>
              </div>
              <ul className="space-y-1 text-[11px] text-zinc-300">
                <li>• Semanas 1–2 (N1): Morfología geométrica, envolvente y familia tímbrica.</li>
                <li>• Semanas 3–4 (N2): Localización binaural HRTF, Doppler y turnos E2.</li>
                <li>• Semanas 5–6 (N3): Zonas acústicas y cadáver exquisito sonoro.</li>
                <li>• Semanas 7–8 (N4): Csound WASM en vivo, agentes E4 y curaduría E6.</li>
              </ul>
            </div>

            {/* E8.4.2 y E8.4.3 Residencias y Modelo de Sostenibilidad */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5">
              <div className="mb-1 font-mono font-semibold text-fuchsia-300">
                E8.4.2 / E8.4.3 · Residencias Artísticas y Sostenibilidad Tripartita
              </div>
              <p className="mb-1.5 text-[11px] text-zinc-300">
                Convocatoria anual de residencias telemáticas (Obras publicadas en Galería E6 bajo
                CC-BY / CC-BY-SA). Sostenibilidad garantizada sin suscripciones privativas mediante:
              </p>
              <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px]">
                <div className="rounded bg-zinc-950 p-1.5 text-center text-fuchsia-200">
                  1. Fondos Culturales y Becas
                </div>
                <div className="rounded bg-zinc-950 p-1.5 text-center text-fuchsia-200">
                  2. Talleres y Escuelas Aliadas
                </div>
                <div className="rounded bg-zinc-950 p-1.5 text-center text-fuchsia-200">
                  3. Aportes Comunitarios (/apoyo)
                </div>
              </div>
            </div>

            {/* E8.4.4 y E8.4.5 Métricas de impacto y alianzas internacionales */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5">
              <div className="mb-1.5 font-mono font-semibold text-fuchsia-300">
                E8.4.4 / E8.4.5 · Métricas de Impacto Verificables para Fondos y Alianzas
              </div>
              <div className="grid grid-cols-5 gap-1 text-center font-mono">
                <div className="rounded bg-zinc-950 p-1.5">
                  <div className="text-sm font-bold text-fuchsia-300">
                    {store.impactMetrics.activeCommunitiesCount}
                  </div>
                  <div className="text-[9px] text-zinc-400">Nodos Aliados</div>
                </div>
                <div className="rounded bg-zinc-950 p-1.5">
                  <div className="text-sm font-bold text-fuchsia-300">
                    {store.impactMetrics.recordedSessionsCount}
                  </div>
                  <div className="text-[9px] text-zinc-400">Sesiones E1</div>
                </div>
                <div className="rounded bg-zinc-950 p-1.5">
                  <div className="text-sm font-bold text-fuchsia-300">
                    {store.impactMetrics.publishedWorksCount}
                  </div>
                  <div className="text-[9px] text-zinc-400">Obras CC E6</div>
                </div>
                <div className="rounded bg-zinc-950 p-1.5">
                  <div className="text-sm font-bold text-fuchsia-300">
                    {store.impactMetrics.internationalWorkshopsCount}
                  </div>
                  <div className="text-[9px] text-zinc-400">Talleres</div>
                </div>
                <div className="rounded bg-zinc-950 p-1.5">
                  <div className="text-sm font-bold text-fuchsia-300">
                    {store.impactMetrics.openSourceContributorsCount}
                  </div>
                  <div className="text-[9px] text-zinc-400">Autores OS</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
