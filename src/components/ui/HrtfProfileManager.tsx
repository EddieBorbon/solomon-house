'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { audioManager } from '../../lib/AudioManager';
import { parseSofa, type HrirSet } from '../../lib/audio/sofa/sofaLoader';
import {
  saveActiveProfile,
  loadActiveProfile,
  clearActiveProfile,
} from '../../lib/audio/sofa/profileStore';
import { useWorldStore } from '../../state/useWorldStore';
import {
  useListeningImmersionStore,
  GUIDED_LISTENING_ROUTES,
  setActiveListenerModeAndPosition,
  startGuidedListeningRoute,
  sendAudienceReaction,
  compileAndTriggerLiveCsound,
  publishCommunityCsoundInstrument,
  buildUnderTheHoodWebAudioGraph,
  startHrtfLocalizationStimulus,
  submitHrtfLocalizationGuess,
  detectAudioOutputDevices,
  type SynthEngineBackend,
} from '../../lib/audio/listeningSynthesisImmersion';
import { exportAmbisonicsBFormatWav } from '../../lib/residency/curationArchive';
import { useSessionRecorderStore } from '../../lib/session/sessionRecorder';
import { useUIPanelStore } from '../../state/useUIPanelStore';

/**
 * Panel Unificado de Escucha Activa/Procesual, Síntesis de Bajo Nivel
 * (Web Audio / Csound WASM) e Inmersión HRTF Personalizada (Roadmap 4.3 + Etapa E5 completa).
 */

const PUBLIC_DATABASES: { label: string; url: string }[] = [
  { label: 'MIT KEMAR', url: 'https://sofacoustics.org/data/database/mit/' },
  { label: 'IRCAM Listen', url: 'https://sofacoustics.org/data/database/listen/' },
  { label: 'CIPIC', url: 'https://sofacoustics.org/data/database/cipic/' },
  { label: 'SADIE II', url: 'https://sofacoustics.org/data/database/sadie%20ii/' },
];

interface ProfileInfo {
  name: string;
  count: number;
  irLength: number;
  sampleRate: number;
}

function describe(set: HrirSet): ProfileInfo {
  return {
    name: set.name,
    count: set.count,
    irLength: set.irLength,
    sampleRate: set.sampleRate,
  };
}

export function HrtfProfileManager() {
  const activeModal = useUIPanelStore((s) => s.activeModal);
  const closeModal = useUIPanelStore((s) => s.closeModal);
  const open = activeModal === 'hrtf_e5';
  const [activeTab, setActiveTab] = useState<'listening' | 'synthesis' | 'hrtf'>('listening');
  const [profile, setProfile] = useState<ProfileInfo | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Campos para publicar instrumento Csound comunitario
  const [csNewName, setCsNewName] = useState('');
  const [csNewVersion, setCsNewVersion] = useState('1.1.0');

  const e5State = useListeningImmersionStore();
  const { grids, selectedEntityId } = useWorldStore();
  const sessionEvents = useSessionRecorderStore((s) => s.events);

  const allObjects = Array.from(grids.values()).flatMap((g) => g.objects);
  const selectedObject =
    allObjects.find((o) => o.id === selectedEntityId) ?? allObjects[0] ?? null;
  const webAudioGraph = buildUnderTheHoodWebAudioGraph(selectedObject);

  useEffect(() => {
    void detectAudioOutputDevices();
    let cancelled = false;
    loadActiveProfile()
      .then((stored) => {
        if (!stored || cancelled) return;
        const set = parseSofa(stored.buffer, stored.name);
        audioManager.enableCustomHrtf(set);
        setProfile(describe(set));
        useListeningImmersionStore.setState({
          hrtfMode: 'custom_sofa',
          activeHrtfProfileName: stored.name,
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const handleFile = useCallback(async (file: File) => {
    setLoading(true);
    setStatus(null);
    try {
      const buffer = await file.arrayBuffer();
      const set = parseSofa(buffer, file.name);
      audioManager.enableCustomHrtf(set);
      setProfile(describe(set));
      setStatus(`Perfil SOFA "${file.name}" activo (registrado en telemetría)`);
      useListeningImmersionStore.setState({
        hrtfMode: 'custom_sofa',
        activeHrtfProfileName: file.name,
      });
      await saveActiveProfile(file.name, buffer);
    } catch (error) {
      setStatus(`Error: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDisable = useCallback(async () => {
    audioManager.disableCustomHrtf();
    setProfile(null);
    setStatus('HRTF estándar del navegador restaurada');
    useListeningImmersionStore.setState({
      hrtfMode: 'generic_browser',
      activeHrtfProfileName: 'KEMAR Estándar Web Audio',
    });
    try {
      await clearActiveProfile();
    } catch {}
  }, []);

  const locStats = {
    total: e5State.localizationTrials.length,
    correct: e5State.localizationTrials.filter((t) => t.correct).length,
    frontBackConfusions: e5State.localizationTrials.filter((t) => t.frontBackConfusion)
      .length,
  };

  return (
    <>
      {open && (
        <div className="fixed top-14 left-[21rem] w-[480px] max-w-[95vw] bg-neutral-950/95 backdrop-blur-xl rounded-2xl border border-cyan-500/40 p-4 z-50 text-xs text-neutral-200 shadow-2xl">
          <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Sonido 3D para Audífonos e Instrumentos Físicos
              </h3>
              <p className="text-[11px] text-neutral-400">
                Recorridos de escucha · Cuerdas y vientos (Csound) · Perfil de oído 3D
              </p>
            </div>
            <button
              onClick={closeModal}
              className="rounded-lg px-2 py-1 text-neutral-400 hover:bg-white/10 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="mb-3 rounded-lg bg-cyan-950/30 border border-cyan-500/30 p-2 text-[10px] text-cyan-100 leading-snug">
            💡 <strong>¿Para qué sirve?</strong> Aquí puedes activar paseos automáticos de cámara para solo escuchar, tocar instrumentos de cuerda/viento o ajustar cómo suenan los audífonos en 3D.
          </div>

          {/* Pestañas */}
          <div className="mb-3 flex gap-1 rounded-lg bg-white/5 p-1">
            {(
              [
                ['listening', 'Modo Oyente'],
                ['synthesis', 'Cuerdas y Vientos'],
                ['hrtf', 'Audífonos 3D'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 rounded-md py-1.5 text-[11px] font-medium transition ${
                  activeTab === id
                    ? 'bg-cyan-600 text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* PESTAÑA 1: MODO ESCUCHA ACTIVA, GUIADA, PROCESUAL Y REACCIONES */}
          {activeTab === 'listening' && (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              <div className="flex items-center justify-between rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-2.5">
                <div>
                  <div className="font-semibold text-cyan-200">
                    Modo Oyente en Vivo
                  </div>
                  <div className="text-[10px] text-neutral-300">
                    Posición binaural actual: [
                    {e5State.activeListenerPosition.map((v) => v.toFixed(1)).join(', ')}]
                  </div>
                </div>
                <button
                  onClick={() =>
                    setActiveListenerModeAndPosition(
                      [
                        Math.round((Math.random() * 10 - 5) * 10) / 10,
                        1.7,
                        Math.round((Math.random() * 10 - 5) * 10) / 10,
                      ],
                      true
                    )
                  }
                  className="rounded-lg bg-cyan-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-cyan-500"
                >
                  Entrar como Oyente Activo
                </button>
              </div>

              {/* Rutas de escucha guiadas */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 space-y-1.5">
                <div className="font-semibold text-white">
                  Rutas de Escucha Guiadas por el Compositor
                </div>
                {GUIDED_LISTENING_ROUTES.map((route) => {
                  const isActive = e5State.activeGuidedRouteId === route.id;
                  const wp = route.waypoints[e5State.activeWaypointIndex] ?? route.waypoints[0];
                  return (
                    <div
                      key={route.id}
                      className={`rounded-lg border p-2 ${
                        isActive
                          ? 'border-cyan-400 bg-cyan-950/40'
                          : 'border-white/10 bg-black/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-cyan-300">{route.title}</span>
                        <button
                          onClick={() =>
                            startGuidedListeningRoute(isActive ? null : route.id)
                          }
                          className="rounded bg-cyan-600 px-2 py-0.5 text-[10px] text-white"
                        >
                          {isActive ? 'Detener' : 'Recorrer'}
                        </button>
                      </div>
                      <p className="text-[10px] text-neutral-300 mt-0.5">
                        {isActive
                          ? `Estación actual: ${wp.label} — "${wp.commentary}"`
                          : route.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Escucha procesual */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-white">
                    Escucha Procesual — Línea de Tiempo en Vivo
                  </span>
                  <span className="font-mono text-[10px] text-cyan-300">
                    {sessionEvents.length} eventos
                  </span>
                </div>
                <div className="max-h-20 overflow-y-auto space-y-1 rounded bg-black/60 p-1.5 font-mono text-[10px]">
                  {sessionEvents.length === 0 ? (
                    <div className="text-neutral-400">
                      Interactúa con la escena para observar el proceso compositivo en tiempo real.
                    </div>
                  ) : (
                    sessionEvents.slice(-5).map((ev) => (
                      <div key={ev.id} className="text-neutral-300">
                        [{(ev.t / 1000).toFixed(1)}s] {ev.author.id} → {ev.type} (
                        {ev.objectType ?? ev.entityType})
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Retroalimentación ligera del público */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-2.5">
                <div className="font-semibold text-white mb-1.5">
                  Reacciones del Público hacia Intérpretes
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {(
                    [
                      ['resonancia', '✨ Resonancia'],
                      ['complejidad', '🌀 Densidad'],
                      ['espacio', '🧭 Espacio'],
                      ['silencio', '🤫 Aire'],
                    ] as const
                  ).map(([type, label]) => (
                    <button
                      key={type}
                      onClick={() => sendAudienceReaction(type)}
                      className="rounded border border-white/15 bg-black/60 py-1 text-[10px] hover:border-cyan-400"
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {e5State.audienceReactions.length > 0 && (
                  <div className="mt-1.5 text-[10px] text-cyan-200">
                    Última reacción: {e5State.audienceReactions[0].emoji}{' '}
                    {e5State.audienceReactions[0].label}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PESTAÑA 2: SÍNTESIS DE BAJO NIVEL, GRAFO WEB AUDIO Y CSOUND */}
          {activeTab === 'synthesis' && (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              <div>
                <label className="block text-[10px] text-neutral-400">
                  Motor de Síntesis Activo por Defecto
                </label>
                <select
                  value={e5State.defaultSynthBackend}
                  onChange={(e) =>
                    useListeningImmersionStore.setState({
                      defaultSynthBackend: e.target.value as SynthEngineBackend,
                    })
                  }
                  className="mt-0.5 w-full rounded border border-white/15 bg-black px-2 py-1.5 text-xs"
                >
                  <option value="native_webaudio">
                    Web Audio API Nativa Pura (NativeVoice 10 modelos — Recomendado [HS])
                  </option>
                  <option value="csound_wasm">
                    Csound WebAssembly (DSP programable en código Csound)
                  </option>
                  <option value="tone_js">Tone.js (Compatibilidad histórica)</option>
                </select>
              </div>

              {/* Vista "Bajo el capó": Grafo de nodos Web Audio */}
              <div className="rounded-xl border border-cyan-500/30 bg-black/70 p-2.5">
                <div className="font-semibold text-cyan-300 mb-1.5">
                  Vista &quot;Bajo el Capó&quot; — Grafo de Nodos Web Audio
                </div>
                <div className="flex flex-wrap items-center gap-1 text-[10px]">
                  {webAudioGraph.nodes.map((node, i) => (
                    <React.Fragment key={node.id}>
                      <div className="rounded border border-cyan-500/40 bg-cyan-950/40 px-2 py-1">
                        <div className="font-mono font-bold text-cyan-200">{node.type}</div>
                        <div className="text-[9px] text-neutral-300">{node.paramsSummary}</div>
                      </div>
                      {i < webAudioGraph.nodes.length - 1 && (
                        <span className="text-cyan-400 font-bold">→</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Biblioteca comunitaria e Instrumento Csound en vivo */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-amber-300">
                    Instrumento Csound Editable en Vivo y Biblioteca
                  </span>
                </div>
                <select
                  value={e5State.selectedCsoundInstrumentId}
                  onChange={(e) => {
                    const inst = e5State.communityCsoundInstruments.find(
                      (i) => i.id === e.target.value
                    );
                    if (inst) {
                      useListeningImmersionStore.setState({
                        selectedCsoundInstrumentId: inst.id,
                        liveCsoundOrcCode: inst.orcCode,
                        liveCsoundScoLine: inst.defaultSco,
                      });
                    }
                  }}
                  className="w-full rounded border border-white/15 bg-black px-2 py-1 text-[11px]"
                >
                  {e5State.communityCsoundInstruments.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name} (v{inst.version} · {inst.author})
                    </option>
                  ))}
                </select>

                <textarea
                  value={e5State.liveCsoundOrcCode}
                  onChange={(e) =>
                    useListeningImmersionStore.setState({ liveCsoundOrcCode: e.target.value })
                  }
                  rows={5}
                  className="w-full rounded border border-white/15 bg-black p-2 font-mono text-[10px] text-emerald-300"
                />
                <div className="flex gap-1.5">
                  <input
                    value={e5State.liveCsoundScoLine}
                    onChange={(e) =>
                      useListeningImmersionStore.setState({
                        liveCsoundScoLine: e.target.value,
                      })
                    }
                    className="flex-1 rounded border border-white/15 bg-black px-2 py-1 font-mono text-[10px]"
                  />
                  <button
                    onClick={() => void compileAndTriggerLiveCsound()}
                    className="rounded bg-amber-600 px-3 py-1 text-[10px] font-semibold text-white hover:bg-amber-500"
                  >
                    Compilar y Sonar (WASM)
                  </button>
                </div>

                {/* Publicar versión en biblioteca comunitaria */}
                <div className="flex gap-1.5 pt-1">
                  <input
                    placeholder="Nombre del instrumento..."
                    value={csNewName}
                    onChange={(e) => setCsNewName(e.target.value)}
                    className="flex-1 rounded border border-white/15 bg-black px-2 py-1 text-[10px]"
                  />
                  <input
                    placeholder="Versión"
                    value={csNewVersion}
                    onChange={(e) => setCsNewVersion(e.target.value)}
                    className="w-16 rounded border border-white/15 bg-black px-2 py-1 text-[10px]"
                  />
                  <button
                    onClick={() => {
                      publishCommunityCsoundInstrument(
                        csNewName,
                        'Comunidad',
                        csNewVersion,
                        'Instrumento compartido en la biblioteca comunitaria'
                      );
                      setCsNewName('');
                    }}
                    className="rounded bg-emerald-700 px-2.5 py-1 text-[10px] text-white"
                  >
                    + Versionar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PESTAÑA 3: INMERSIÓN PERSONALIZADA HRTF, LOCALIZACIÓN Y AURICULARES */}
          {activeTab === 'hrtf' && (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {/* Guía y detección Auriculares vs. Altavoces */}
              <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-2.5 text-[10px]">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-amber-300">
                    Guía de Transductor Acústico:{' '}
                    {e5State.outputTransducerMode === 'headphones'
                      ? '🎧 Auriculares recomendados'
                      : '🔊 Altavoces / Multicanal'}
                  </span>
                  <button
                    onClick={() =>
                      useListeningImmersionStore.setState({
                        outputTransducerMode:
                          e5State.outputTransducerMode === 'headphones'
                            ? 'speakers'
                            : 'headphones',
                      })
                    }
                    className="rounded bg-white/10 px-2 py-0.5 text-[9px]"
                  >
                    Cambiar modo
                  </button>
                </div>
                <div className="text-neutral-300 mt-0.5">
                  Dispositivo detectado: <span className="font-mono">{e5State.detectedAudioOutputLabel}</span>.{' '}
                  {e5State.outputTransducerMode === 'headphones'
                    ? 'Usa auriculares sin cancelación espacial externa para evitar conos de confusión binaural.'
                    : 'En altavoces se recomienda desactivar HRTF binaural o exportar Ambisonics B-format.'}
                </div>
              </div>

              {/* Carga de archivo SOFA y estado en telemetría */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-emerald-300">
                    Perfil HRTF Activo: {e5State.activeHrtfProfileName}
                  </span>
                  <span className="rounded bg-black/50 px-1.5 py-0.5 font-mono text-[9px]">
                    {e5State.hrtfMode}
                  </span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".sofa"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleFile(file);
                    e.target.value = '';
                  }}
                />

                <div className="flex gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className="flex-1 rounded bg-emerald-600 py-1.5 text-[10px] font-semibold text-white hover:bg-emerald-500"
                  >
                    {loading ? 'Cargando .sofa…' : 'Cargar archivo .sofa personalizado'}
                  </button>
                  {profile && (
                    <button
                      onClick={() => void handleDisable()}
                      className="rounded bg-white/10 px-2.5 py-1.5 text-[10px]"
                    >
                      Restaurar genérica
                    </button>
                  )}
                </div>
                {status && <p className="text-[10px] text-amber-300">{status}</p>}

                <div className="flex flex-wrap gap-1 pt-1">
                  {PUBLIC_DATABASES.map(({ label, url }) => (
                    <a
                      key={label}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-0.5 bg-white/10 hover:bg-emerald-500/30 rounded text-[10px]"
                    >
                      {label} ↗
                    </a>
                  ))}
                </div>
              </div>

              {/* Prueba de localización delante/detrás y elevación */}
              <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-2.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-cyan-200">
                    Asistente y Prueba de Localización 3D (Delante/Detrás y Elevación)
                  </span>
                  <button
                    onClick={() => startHrtfLocalizationStimulus()}
                    className="rounded bg-cyan-600 px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-cyan-500"
                  >
                    Disparar estímulo 3D
                  </button>
                </div>

                {e5State.activeLocalizationTarget && (
                  <div className="grid grid-cols-3 gap-1">
                    {(
                      [
                        ['front', '⬆️ Delante'],
                        ['back', '⬇️ Detrás'],
                        ['above', '☁️ Arriba (Elev.)'],
                        ['below', '🕳️ Abajo (Elev.)'],
                        ['left', '⬅️ Izquierda'],
                        ['right', '➡️ Derecha'],
                      ] as const
                    ).map(([dir, label]) => (
                      <button
                        key={dir}
                        onClick={() => submitHrtfLocalizationGuess(dir)}
                        className="rounded border border-white/20 bg-black/60 py-1 text-[10px] hover:border-cyan-400"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}

                <div className="text-[10px] text-neutral-300">
                  Ensayos: <strong>{locStats.total}</strong> · Aciertos:{' '}
                  <strong>{locStats.correct}</strong> · Confusiones delante/detrás:{' '}
                  <strong>{locStats.frontBackConfusions}</strong>
                </div>
              </div>

              {/* Exportar Ambisonics B-format */}
              <button
                onClick={() => exportAmbisonicsBFormatWav()}
                className="w-full rounded-lg border border-emerald-500/40 bg-emerald-950/50 py-1.5 text-[11px] font-medium text-emerald-200 hover:bg-emerald-900/60"
              >
                Exportar Ambisonics B-Format FOA (4 canales W, X, Y, Z)
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
