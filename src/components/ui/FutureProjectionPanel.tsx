'use client';

import React, { useState } from 'react';
import {
  useFutureProjectionStore,
  RAVE_TIMBRE_MODELS,
  RaveLatentModelId,
  XrHandGestureAction,
  executeXrHandParityAction,
  createPassthroughSpatialAnchor,
  removePassthroughSpatialAnchor,
  trainBrowserNeuralAgentOnEthicalCorpus,
  runBrowserOnnxAgentStep,
  applyRaveTimbreTransferToSelected,
  generateComplementaryAiSessionAnalysis,
  syncWithFederatedCommunityNode,
  exportActivityPubNodeManifestJson,
  exportSchoolCurriculumAndImpactPackageJson,
} from '@/lib/future/futureProjection';
import { useCurationArchiveStore } from '@/lib/residency/curationArchive';
import { useUIPanelStore } from '@/state/useUIPanelStore';
import { xrStore } from '../world/Experience';

export function FutureProjectionPanel() {
  const activeModal = useUIPanelStore((s) => s.activeModal);
  const closeModal = useUIPanelStore((s) => s.closeModal);
  const isOpen = activeModal === 'future_e8';

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
    setTimeout(() => setStatusMsg(null), 4500);
  };

  if (!isOpen) return null;

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
      `Ancla 3D Passthrough "${anchor.label}" creada en escena [${anchor.physicalRoomCoordMeters.join(', ')}] m`
    );
  };

  const handleTrainNeural = () => {
    const rep = trainBrowserNeuralAgentOnEthicalCorpus(30);
    notify(
      `Red MLP entrenada (${rep.epochs} épocas, ${rep.samplesCount} transiciones): MSE ${rep.initialLossMse} → ${rep.finalLossMse}`
    );
  };

  const handleRunOnnxStep = () => {
    const res = runBrowserOnnxAgentStep();
    notify(
      `Inferencia MLP en navegador: ${res.chosenType} (${res.frequencyHz} Hz) en [${res.position.join(', ')}] — Corpus ético: ${res.eligibleFragmentsCount} obras CC`
    );
  };

  const handleApplyRave = (modelId: RaveLatentModelId) => {
    const msg = applyRaveTimbreTransferToSelected(modelId);
    notify(msg);
  };

  const handleGenerateAiAnalysis = () => {
    generateComplementaryAiSessionAnalysis();
    notify('Análisis complementario IA generado sobre la base determinista.');
  };

  const handleSyncNode = async (nodeId: string) => {
    const msg = await syncWithFederatedCommunityNode(nodeId);
    notify(msg);
  };

  return (
    <div className="fixed top-14 left-[21rem] z-50 w-[560px] max-w-[92vw] rounded-xl border border-fuchsia-500/50 bg-zinc-950/95 p-4 text-xs text-zinc-200 shadow-2xl backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between border-b border-zinc-800 pb-2">
        <div>
          <h3 className="font-mono text-sm font-bold text-fuchsia-300">
            Medidas de Salón Real, Transformación de Timbres y Red de Escuelas
          </h3>
          <p className="text-[11px] text-zinc-400">
            Anclas en espacio físico, timbres acústicos resonantes y conexión entre escuelas
          </p>
        </div>
        <button
          onClick={closeModal}
          className="rounded border border-zinc-700 px-2 py-0.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
        >
          ✕
        </button>
      </div>

      <div className="mb-3 rounded-lg bg-fuchsia-950/30 border border-fuchsia-500/30 p-2 text-[10px] text-fuchsia-100 leading-snug">
        💡 <strong>¿Cómo usar esta ventana?</strong> En <strong>Salón Físico 3D</strong> puedes dibujar las medidas en metros de un cuarto real o fijar sonidos en puntos exactos. En <strong>Timbres e IA</strong> puedes aplicar resonancias de instrumentos acústicos (violonchelo, flauta, campana) a cualquier figura.
      </div>

      {statusMsg && (
        <div className="mb-3 rounded border border-fuchsia-500/50 bg-fuchsia-950/40 px-2.5 py-1.5 font-mono text-[11px] text-fuchsia-200">
          {statusMsg}
        </div>
      )}

      {/* Pestañas */}
      <div className="mb-3 grid grid-cols-4 gap-1 rounded-lg bg-zinc-900 p-1 font-mono text-[11px]">
        <button
          onClick={() => setActiveTab('xr')}
          className={`rounded py-1 transition ${
            activeTab === 'xr'
              ? 'bg-fuchsia-600 font-semibold text-white'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Salón Físico 3D
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`rounded py-1 transition ${
            activeTab === 'ai'
              ? 'bg-fuchsia-600 font-semibold text-white'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Timbres e IA
        </button>
        <button
          onClick={() => setActiveTab('federation')}
          className={`rounded py-1 transition ${
            activeTab === 'federation'
              ? 'bg-fuchsia-600 font-semibold text-white'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Red de Escuelas
        </button>
        <button
          onClick={() => setActiveTab('sustainability')}
          className={`rounded py-1 transition ${
            activeTab === 'sustainability'
              ? 'bg-fuchsia-600 font-semibold text-white'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Plan de Clases
        </button>
      </div>

      <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
        {activeTab === 'xr' && (
          <div className="space-y-3">
            {/* Sesiones WebXR e inicio directo */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="font-mono font-semibold text-fuchsia-300">
                  Sesión WebXR y Paridad de Manipulación Espacial 6DoF
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={async () => {
                      try {
                        const supported =
                          typeof navigator !== 'undefined' &&
                          'xr' in navigator &&
                          (await navigator.xr?.isSessionSupported('immersive-vr'));
                        if (supported) {
                          await xrStore.enterVR();
                        } else {
                          notify('Visor WebXR VR no detectado en este navegador.');
                        }
                      } catch {
                        notify('Visor WebXR VR no detectado en este navegador.');
                      }
                    }}
                    className="rounded border border-violet-500/50 bg-violet-950/40 px-2 py-0.5 font-mono text-[10px] text-violet-200 hover:bg-violet-800/50"
                  >
                    🥽 Entrar VR
                  </button>
                  <button
                    onClick={async () => {
                      const next = !store.passthroughArEnabled;
                      useFutureProjectionStore.setState({ passthroughArEnabled: next });
                      notify(
                        next
                          ? 'Fondo Passthrough AR activado en el lienzo 3D.'
                          : 'Fondo Passthrough AR desactivado.'
                      );
                      if (next) {
                        try {
                          const supported =
                            typeof navigator !== 'undefined' &&
                            'xr' in navigator &&
                            (await navigator.xr?.isSessionSupported('immersive-ar'));
                          if (supported) {
                            await xrStore.enterAR();
                          }
                        } catch {
                          // Permanece en modo Passthrough WebGL transparente
                        }
                      }
                    }}
                    className="rounded border border-fuchsia-500/50 bg-fuchsia-950/40 px-2 py-0.5 font-mono text-[10px] text-fuchsia-200 hover:bg-fuchsia-800/50"
                  >
                    📲 {store.passthroughArEnabled ? 'Salir AR' : 'Entrar AR'}
                  </button>
                </div>
              </div>
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

            {/* Passthrough AR */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="font-mono font-semibold text-fuchsia-300">
                  Anclas Espaciales Passthrough en Escena 3D (Persistentes)
                </span>
                <label className="flex items-center gap-1.5 text-[11px] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={store.passthroughArEnabled}
                    onChange={(e) =>
                      useFutureProjectionStore.setState({ passthroughArEnabled: e.target.checked })
                    }
                  />
                  <span>Fondo Transparente AR</span>
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
                + Fijar Ancla 3D en Coordenada Física (Metros)
              </button>
              <div className="space-y-1">
                {store.passthroughAnchors.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between rounded bg-zinc-950/80 px-2 py-1 font-mono text-[10px]"
                  >
                    <span className="text-zinc-200">⚓ {a.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-fuchsia-300">
                        [{a.physicalRoomCoordMeters.join('m, ')}m]
                      </span>
                      <button
                        onClick={() => removePassthroughSpatialAnchor(a.id)}
                        className="text-red-400 hover:text-red-200"
                        title="Eliminar ancla"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dispositivos reales conectados en la sesión */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5">
              <div className="mb-1.5 font-mono font-semibold text-fuchsia-300">
                Telemetría de Dispositivos Activos en Sala Mixta
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

            {/* Instalaciones Site-Specific 3D */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="font-mono font-semibold text-fuchsia-300">
                  Recinto Arquitectónico 3D Site-Specific (Escala en Metros)
                </span>
                <label className="flex items-center gap-1.5 text-[11px] cursor-pointer">
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
                  <span>Renderizar Recinto 3D</span>
                </label>
              </div>
              <div className="grid grid-cols-3 gap-1.5 mb-1.5">
                <input
                  value={store.siteSpecificConfig.venueName}
                  onChange={(e) =>
                    useFutureProjectionStore.setState({
                      siteSpecificConfig: {
                        ...store.siteSpecificConfig,
                        venueName: e.target.value,
                      },
                    })
                  }
                  className="col-span-2 rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-[11px]"
                  placeholder="Nombre de la sala / museo"
                />
                <div className="flex items-center gap-1 font-mono text-[10px] text-zinc-300">
                  <span>Dimensiones (m):</span>
                  <span>{store.siteSpecificConfig.physicalDimensionsMeters.join('×')}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-3">
            {/* y Red neuronal MLP con entrenamiento real en navegador */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="font-mono font-semibold text-fuchsia-300">
                  Red Neuronal MLP en Float32Array (Entrenamiento + Inferencia)
                </span>
                <span className="rounded bg-emerald-950 px-1.5 py-0.5 font-mono text-[10px] text-emerald-300">
                  Pesos persistidos en navegador
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
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={handleTrainNeural}
                  className="rounded border border-emerald-500/50 bg-emerald-950/40 px-2.5 py-1.5 font-mono text-[11px] font-semibold text-emerald-200 hover:bg-emerald-900/50"
                >
                  ⚡ Entrenar Red con Corpus CC (SGD)
                </button>
                <button
                  onClick={handleRunOnnxStep}
                  className="rounded bg-fuchsia-600 px-2.5 py-1.5 font-mono text-[11px] font-semibold text-white hover:bg-fuchsia-500"
                >
                  🧠 Ejecutar Inferencia e Insertar Gesto
                </button>
              </div>
              {store.lastTrainingReport && (
                <div className="mt-2 rounded bg-zinc-950 px-2 py-1 font-mono text-[10px] text-emerald-300">
                  Entrenamiento completado: {store.lastTrainingReport.epochs} épocas sobre{' '}
                  {store.lastTrainingReport.samplesCount} pares · Pérdida MSE:{' '}
                  {store.lastTrainingReport.initialLossMse} → {store.lastTrainingReport.finalLossMse}
                </div>
              )}
            </div>

            {/* Procesador DSP Web Audio RAVE */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5">
              <div className="mb-1.5 font-mono font-semibold text-fuchsia-300">
                Procesador DSP Web Audio RAVE (Banco de Formantes + Wavefolding)
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
                        <div className="font-mono text-[11px] font-semibold">🔊 {m.name}</div>
                        <div className="text-[10px] text-zinc-400">{m.corpusOrigin}</div>
                      </div>
                      <span className="font-mono text-[10px] text-fuchsia-300">
                        [{m.spectralShaping.formantHz.join(' / ')} Hz]
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Corpus Ético */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5">
              <div className="mb-1 font-mono font-semibold text-fuchsia-300">
                Corpus Ético del Archivo Comunitario ({archiveFragments.length} obras CC)
              </div>
              <div className="max-h-24 overflow-y-auto space-y-1">
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

            {/* Análisis asistido por IA */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="font-mono font-semibold text-fuchsia-300">
                  Análisis IA Complementario al Determinista
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
                  Pulsa &ldquo;Generar Lectura&rdquo; para contrastar las métricas exactas de
                  con una interpretación estructural asistida.
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'federation' && (
          <div className="space-y-3">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="font-mono font-semibold text-fuchsia-300">
                  Sincronización Federada ActivityPub + P2P
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
                      <button
                        onClick={() => handleSyncNode(node.id)}
                        className="rounded border border-emerald-500/50 bg-emerald-950/60 px-2 py-0.5 font-mono text-[10px] text-emerald-300 hover:bg-emerald-800/60"
                      >
                        🔄 Traer Obra a la Galería
                      </button>
                    </div>
                    <div className="font-mono text-[10px] text-fuchsia-300">
                      {node.activityPubActorInbox}
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      {node.name} ({node.country}) · P2P: {node.p2pSignalingEndpoint}
                      {node.lastSyncedIso && (
                        <span className="ml-2 text-emerald-400">
                          · Sincronizado {node.lastSyncedIso.slice(11, 19)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sustainability' && (
          <div className="space-y-3">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="font-mono font-semibold text-fuchsia-300">
                  Paquete Curricular para Escuelas de Música (8 Semanas)
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
                <li>• Semanas 1–2 (Modo Básico): Formas geométricas, envolvente y familia de timbres.</li>
                <li>• Semanas 3–4 (Modo Intermedio): Sonido 3D en audífonos, movimiento y turnos en grupo.</li>
                <li>• Semanas 5–6 (Modo Avanzado): Zonas de efectos acústicos y composición por capas.</li>
                <li>• Semanas 7–8 (Estudio Completo): Instrumentos Csound, acompañantes automáticos y galería pública.</li>
              </ul>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5">
              <div className="mb-1.5 font-mono font-semibold text-fuchsia-300">
                Estadísticas de Uso y Comunidad
              </div>
              <div className="grid grid-cols-5 gap-1 text-center font-mono">
                <div className="rounded bg-zinc-950 p-1.5">
                  <div className="text-sm font-bold text-fuchsia-300">
                    {store.federatedNodes.length}
                  </div>
                  <div className="text-[9px] text-zinc-400">Escuelas</div>
                </div>
                <div className="rounded bg-zinc-950 p-1.5">
                  <div className="text-sm font-bold text-fuchsia-300">
                    {store.impactMetrics.recordedSessionsCount}
                  </div>
                  <div className="text-[9px] text-zinc-400">Sesiones</div>
                </div>
                <div className="rounded bg-zinc-950 p-1.5">
                  <div className="text-sm font-bold text-fuchsia-300">
                    {archiveFragments.length}
                  </div>
                  <div className="text-[9px] text-zinc-400">Obras Libres</div>
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
