'use client';

import { useState, useEffect, useRef } from 'react';
import {
  useSessionRecorderStore,
  setConsentGranted,
  setBinauralConfig,
  setSessionMetadataConfig,
  startSessionRecording,
  stopSessionRecording,
  exportCasaSessionV2,
  exportCasaSessionSchema,
  downloadRecordedAudio,
  addResearcherMarker,
  removeResearcherMarker,
  type ResearcherMarker,
} from '../../lib/session/sessionRecorder';
import {
  useSessionReplayStore,
  importSessionFromFileForReplay,
  playSessionReplay,
  pauseSessionReplay,
  seekSessionReplay,
  setReplaySpeed,
  exportResearcherMarkers,
  type ReplaySpeed,
} from '../../lib/session/sessionReplay';
import {
  analyzeSessionMusicology,
  THESIS_CASE_STUDY_BENCHMARKS,
  exportMusicologicalComparison,
  type MusicologicalReport,
} from '../../lib/session/musicologicalAnalysis';
import {
  useSessionTelemetryStore,
  startSessionTelemetry,
  setManualRegionCode,
  buildTechnicalTelemetryReport,
  exportTechnicalTelemetryReport,
} from '../../lib/session/sessionTelemetry';
import {
  exportSpatialHeatmapSvg,
  exportPhaseTopologicalSvg,
  exportTemporalGraphicScoreSvg,
} from '../../lib/session/sessionVisualizations';
import { useUIPanelStore } from '../../state/useUIPanelStore';

/**
 * Panel de Registro, Replay, Analítica Musicológica, Telemetría y
 * Visualización de Sesiones (Roadmap Funcional Jurado — Etapa E1 completa).
 */

type TabId = 'recorder' | 'replay' | 'musicology' | 'telemetry' | 'visuals';

export function SessionResearchPanel() {
  const activeModal = useUIPanelStore((s) => s.activeModal);
  const closeModal = useUIPanelStore((s) => s.closeModal);
  const open = activeModal === 'session_e1';
  const [activeTab, setActiveTab] = useState<TabId>('recorder');
  const [recordAudioWithSession, setRecordAudioWithSession] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Estado para nuevos marcadores en Replay
  const [markerLabel, setMarkerLabel] = useState('');
  const [markerCategory, setMarkerCategory] =
    useState<ResearcherMarker['category']>('observation');
  const [markerNotes, setMarkerNotes] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const recorder = useSessionRecorderStore();
  const replay = useSessionReplayStore();
  const telemetry = useSessionTelemetryStore();

  useEffect(() => {
    startSessionTelemetry();
  }, []);

  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleToggleRecording = async () => {
    if (recorder.isRecording) {
      stopSessionRecording();
      showToast('Grabación detenida. Lista para exportar en .casa.json o audio.');
      return;
    }
    try {
      await startSessionRecording({ recordAudio: recordAudioWithSession });
      showToast('Grabación de sesión iniciada.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al iniciar grabación.');
    }
  };

  const handleImportReplayFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const loaded = await importSessionFromFileForReplay(file);
      showToast(`Sesión cargada: ${loaded.metadata.title} (${loaded.events.length} eventos)`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Archivo inválido');
    }
  };

  const handleDownloadAudio = async (fmt: 'ogg' | 'wav') => {
    try {
      await downloadRecordedAudio(fmt);
      showToast(`Audio exportado en formato .${fmt}`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No hay audio grabado');
    }
  };

  const currentMusicology: MusicologicalReport = analyzeSessionMusicology(
    replay.loadedSession ?? undefined
  );
  const techReport = buildTechnicalTelemetryReport();

  return (
    <>
      {open && (
        <div className="fixed top-14 left-[21rem] w-[460px] max-w-[92vw] max-h-[80vh] overflow-y-auto bg-slate-950/95 backdrop-blur-md border border-purple-500/40 rounded-xl p-4 z-50 font-mono text-xs text-gray-200 space-y-3 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div>
              <h3 className="text-purple-300 font-bold text-sm">
                Grabar Audio, Repetir Sesión y Estadísticas
              </h3>
              <p className="text-[11px] text-gray-400">
                Graba tu sesión en WAV, vuelve a escucharla paso a paso o descarga dibujos
              </p>
            </div>
            <button
              onClick={closeModal}
              className="text-gray-400 hover:text-white px-2 py-1"
            >
              ✕
            </button>
          </div>

          <div className="rounded-lg bg-purple-950/30 border border-purple-500/30 p-2 text-[10px] text-purple-100 leading-snug">
            💡 <strong>¿Cómo usar esta ventana?</strong> En <strong>Grabar</strong> puedes guardar el audio y todo lo que mueves en la escena. En <strong>Repetir</strong> puedes volver a reproducir una sesión guardada.
          </div>

          {statusMessage && (
            <div className="bg-purple-500/20 border border-purple-400/40 text-purple-200 px-3 py-1.5 rounded text-[11px]">
              {statusMessage}
            </div>
          )}

          {/* Pestañas */}
          <div className="grid grid-cols-5 gap-1 bg-black/50 p-1 rounded-lg">
            {(
              [
                ['recorder', 'Grabar'],
                ['replay', 'Repetir'],
                ['musicology', 'Resumen'],
                ['telemetry', 'Rendimiento'],
                ['visuals', 'Dibujos SVG'],
              ] as [TabId, string][]
            ).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`py-1.5 px-1 rounded text-center text-[11px] transition-colors ${
                  activeTab === id
                    ? 'bg-purple-600/40 text-purple-100 font-bold'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ============================================================== */}
          {/* GRABADOR DE SESIÓN Y CONSENTIMIENTO */}
          {/* ============================================================== */}
          {activeTab === 'recorder' && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="block text-gray-400">Título de la sesión / caso</label>
                <input
                  type="text"
                  value={recorder.sessionTitle}
                  onChange={(e) => setSessionMetadataConfig({ sessionTitle: e.target.value })}
                  className="w-full bg-black/60 border border-white/15 rounded px-2 py-1 text-gray-100"
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-400">Sala</label>
                    <input
                      type="text"
                      value={recorder.roomId}
                      onChange={(e) => setSessionMetadataConfig({ roomId: e.target.value })}
                      className="w-full bg-black/60 border border-white/15 rounded px-2 py-1 text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400">Capa activa</label>
                    <select
                      value={recorder.localLayer}
                      onChange={(e) =>
                        setSessionMetadataConfig({
                          localLayer: e.target.value as typeof recorder.localLayer,
                        })
                      }
                      className="w-full bg-black/60 border border-white/15 rounded px-2 py-1 text-gray-100"
                    >
                      <option value="texture">Fondo / Textura</option>
                      <option value="gesture">Gesto / Ritmo</option>
                      <option value="spatial">Espacio / Móviles</option>
                      <option value="general">General</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Consentimiento explícito y anonimización */}
              <div className="bg-white/5 rounded-lg p-2.5 space-y-1.5 border border-white/10">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={recorder.consentGranted}
                    onChange={(e) => setConsentGranted(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span className="text-[11px] text-gray-300 leading-tight">
                    <strong>Consentimiento informado:</strong> Autorizo el registro de
                    eventos espaciales y audio para investigación artística. Los identificadores
                    se anonimizan con hash irreversible ({recorder.participants[0]?.anonymousId}).
                  </span>
                </label>
              </div>

              {/* Opciones de grabación de audio maestro y binaural */}
              <div className="bg-white/5 rounded-lg p-2.5 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={recordAudioWithSession}
                    onChange={(e) => setRecordAudioWithSession(e.target.checked)}
                  />
                  <span>Grabar bus de audio maestro (WAV / OGG)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={recorder.binauralEnabled}
                    onChange={(e) => setBinauralConfig(e.target.checked)}
                  />
                  <span>Grabación binaural desde posición de oyente</span>
                </label>

                {recorder.binauralEnabled && (
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    {(['X', 'Y', 'Z'] as const).map((axis, idx) => (
                      <div key={axis}>
                        <span className="text-[10px] text-gray-400">Oyente {axis} (m)</span>
                        <input
                          type="number"
                          step="0.5"
                          value={recorder.binauralListenerPosition[idx]}
                          onChange={(e) => {
                            const next: [number, number, number] = [
                              ...recorder.binauralListenerPosition,
                            ];
                            next[idx] = Number(e.target.value) || 0;
                            setBinauralConfig(true, next);
                          }}
                          className="w-full bg-black/60 border border-white/15 rounded px-1.5 py-0.5 text-gray-100"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Botón principal de grabación */}
              <div className="flex gap-2">
                <button
                  onClick={handleToggleRecording}
                  className={`flex-1 py-2 px-3 rounded-lg font-bold transition-colors ${
                    recorder.isRecording
                      ? 'bg-red-600/80 hover:bg-red-600 text-white'
                      : 'bg-purple-600/80 hover:bg-purple-600 text-white'
                  }`}
                >
                  {recorder.isRecording
                    ? `■ Detener (${recorder.events.length} eventos)`
                    : '● Iniciar grabación de sesión'}
                </button>
              </div>

              {/* Exportaciones .casa.json v2, Schema, WAV y OGG */}
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  onClick={() => exportCasaSessionV2()}
                  className="bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-200 py-1.5 px-2 rounded"
                >
                  ⬇ Exportar .casa.json v2
                </button>
                <button
                  onClick={() => exportCasaSessionSchema()}
                  className="bg-sky-500/20 hover:bg-sky-500/40 text-sky-200 py-1.5 px-2 rounded"
                >
                  ⬇ JSON Schema v2
                </button>
                <button
                  onClick={() => handleDownloadAudio('wav')}
                  disabled={!recorder.lastAudioBlob}
                  className="bg-amber-500/20 hover:bg-amber-500/40 disabled:opacity-40 text-amber-200 py-1.5 px-2 rounded"
                >
                  ⬇ Audio .WAV (16-bit)
                </button>
                <button
                  onClick={() => handleDownloadAudio('ogg')}
                  disabled={!recorder.lastAudioBlob}
                  className="bg-amber-500/20 hover:bg-amber-500/40 disabled:opacity-40 text-amber-200 py-1.5 px-2 rounded"
                >
                  ⬇ Audio .OGG / WebM
                </button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* REPRODUCTOR TEMPORAL (REPLAY) Y MARCADORES */}
          {/* ============================================================== */}
          {activeTab === 'replay' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-white/5 p-2 rounded-lg">
                <div>
                  <p className="text-gray-200 font-bold">
                    {replay.loadedSession
                      ? replay.loadedSession.metadata.title
                      : 'Sin sesión cargada'}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    Navegación 3D libre activa durante el replay
                  </p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-purple-500/30 hover:bg-purple-500/50 text-purple-200 px-2.5 py-1.5 rounded"
                >
                  ⬆ Abrir .casa.json
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.casa.json,application/json"
                  className="hidden"
                  onChange={handleImportReplayFile}
                />
              </div>

              {/* Controles de reproducción y barra de tiempo */}
              <div className="bg-white/5 p-2.5 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <button
                      onClick={() =>
                        replay.isPlaying ? pauseSessionReplay() : playSessionReplay()
                      }
                      disabled={!replay.loadedSession}
                      className="bg-emerald-500/30 hover:bg-emerald-500/50 disabled:opacity-40 text-emerald-200 px-3 py-1 rounded font-bold"
                    >
                      {replay.isPlaying ? '⏸ Pausa' : '▶ Play'}
                    </button>
                    <button
                      onClick={() => {
                        pauseSessionReplay();
                        seekSessionReplay(0);
                      }}
                      disabled={!replay.loadedSession}
                      className="bg-white/10 hover:bg-white/20 disabled:opacity-40 px-2 py-1 rounded"
                    >
                      ⏮ Inicio
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-gray-400 text-[10px]">Vel:</span>
                    {([0.5, 1, 2, 4] as ReplaySpeed[]).map((spd) => (
                      <button
                        key={spd}
                        onClick={() => setReplaySpeed(spd)}
                        className={`px-1.5 py-0.5 rounded text-[10px] ${
                          replay.speed === spd
                            ? 'bg-purple-500/50 text-white'
                            : 'bg-white/5 text-gray-400'
                        }`}
                      >
                        {spd}×
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(1000, replay.durationMs)}
                    value={replay.currentTimeMs}
                    disabled={!replay.loadedSession}
                    onChange={(e) => seekSessionReplay(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>{(replay.currentTimeMs / 1000).toFixed(1)} s</span>
                    <span>
                      Eventos aplicados: {replay.appliedEventCount} /{' '}
                      {replay.loadedSession?.events.length ?? 0}
                    </span>
                    <span>{(replay.durationMs / 1000).toFixed(1)} s</span>
                  </div>
                </div>
              </div>

              {/* Marcadores y anotaciones del investigador */}
              <div className="bg-white/5 p-2.5 rounded-lg space-y-2">
                <p className="text-gray-300 font-bold">
                  Marcadores del investigador ({recorder.markers.length})
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  <input
                    type="text"
                    placeholder="Etiqueta (ej. Clímax)"
                    value={markerLabel}
                    onChange={(e) => setMarkerLabel(e.target.value)}
                    className="col-span-2 bg-black/60 border border-white/15 rounded px-2 py-1 text-gray-100"
                  />
                  <select
                    value={markerCategory}
                    onChange={(e) =>
                      setMarkerCategory(e.target.value as ResearcherMarker['category'])
                    }
                    className="bg-black/60 border border-white/15 rounded px-1 py-1 text-gray-100"
                  >
                    <option value="structural">Estructural</option>
                    <option value="timbral">Tímbrico</option>
                    <option value="interaction">Interacción</option>
                    <option value="pedagogical">Pedagógico</option>
                    <option value="observation">Observación</option>
                  </select>
                </div>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Nota analítica sobre este instante…"
                    value={markerNotes}
                    onChange={(e) => setMarkerNotes(e.target.value)}
                    className="flex-1 bg-black/60 border border-white/15 rounded px-2 py-1 text-gray-100"
                  />
                  <button
                    onClick={() => {
                      const tTarget = replay.loadedSession
                        ? replay.currentTimeMs
                        : undefined;
                      addResearcherMarker(markerLabel, markerCategory, markerNotes, tTarget);
                      setMarkerLabel('');
                      setMarkerNotes('');
                    }}
                    className="bg-amber-500/30 hover:bg-amber-500/50 text-amber-200 px-2.5 py-1 rounded"
                  >
                    + Anotar
                  </button>
                </div>

                {recorder.markers.length > 0 && (
                  <div className="max-h-28 overflow-y-auto space-y-1 pt-1">
                    {recorder.markers.map((mk) => (
                      <div
                        key={mk.id}
                        className="flex items-center justify-between bg-black/40 px-2 py-1 rounded text-[10px]"
                      >
                        <button
                          onClick={() => replay.loadedSession && seekSessionReplay(mk.t)}
                          className="text-left hover:text-amber-300"
                        >
                          <span className="text-amber-300 font-bold">
                            [{(mk.t / 1000).toFixed(1)}s]
                          </span>{' '}
                          {mk.label} — <span className="text-gray-400">{mk.notes}</span>
                        </button>
                        <button
                          onClick={() => removeResearcherMarker(mk.id)}
                          className="text-red-400 hover:text-red-200 ml-2"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-1.5 pt-1">
                  <button
                    onClick={() => exportResearcherMarkers('json')}
                    className="flex-1 bg-white/10 hover:bg-white/20 py-1 rounded"
                  >
                    ⬇ Marcadores JSON
                  </button>
                  <button
                    onClick={() => exportResearcherMarkers('csv')}
                    className="flex-1 bg-white/10 hover:bg-white/20 py-1 rounded"
                  >
                    ⬇ Marcadores CSV
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* ANALÍTICA MUSICOLÓGICA AUTOMÁTICA Y CASOS DE ESTUDIO */}
          {/* ============================================================== */}
          {activeTab === 'musicology' && (
            <div className="space-y-2.5">
              <div className="bg-white/5 p-2.5 rounded-lg space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Sistema de alturas:</span>
                  <span className="text-emerald-300 font-bold uppercase">
                    {currentMusicology.pitchSystem.classification}
                  </span>
                </div>
                <p className="text-[10px] text-gray-300">
                  {currentMusicology.pitchSystem.rationale}
                </p>
                <div className="grid grid-cols-3 gap-1.5 pt-1 text-[10px]">
                  <div className="bg-black/40 p-1.5 rounded">
                    <span className="text-gray-400 block">Desv. 12-TET</span>
                    <span className="text-gray-100 font-bold">
                      {currentMusicology.pitchSystem.meanDeviation12TetCents} ¢
                    </span>
                  </div>
                  <div className="bg-black/40 p-1.5 rounded">
                    <span className="text-gray-400 block">Serie armónica</span>
                    <span className="text-gray-100 font-bold">
                      {Math.round(currentMusicology.pitchSystem.harmonicSeriesProximity * 100)}%
                    </span>
                  </div>
                  <div className="bg-black/40 p-1.5 rounded">
                    <span className="text-gray-400 block">f0 estimada</span>
                    <span className="text-gray-100 font-bold">
                      {currentMusicology.pitchSystem.fundamentalEstimateHz} Hz
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/5 p-2 rounded-lg space-y-1">
                  <p className="text-gray-400 text-[10px]">Ritmo y periodicidad</p>
                  <p className="text-sky-300 font-bold">
                    {currentMusicology.rhythm.organizationLabel}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    Índice: {currentMusicology.rhythm.periodicityIndex} ·{' '}
                    {currentMusicology.rhythm.eventsPerMinute} ev/min
                  </p>
                </div>
                <div className="bg-white/5 p-2 rounded-lg space-y-1">
                  <p className="text-gray-400 text-[10px]">Timbre y centroide</p>
                  <p className="text-amber-300 font-bold">
                    {currentMusicology.timbre.meanSpectralCentroidHz} Hz medio
                  </p>
                  <p className="text-[10px] text-gray-400">
                    Densidad pico: {currentMusicology.peakDensityObjects} obj
                  </p>
                </div>
              </div>

              {/* Intervención humana frente a algorítmica */}
              <div className="bg-white/5 p-2 rounded-lg space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-emerald-300">
                    Humana: {currentMusicology.agency.humanSharePct}%
                  </span>
                  <span className="text-purple-300">
                    Algorítmica (Jardinero + auto): {currentMusicology.agency.algorithmicSharePct}%
                  </span>
                </div>
                <div className="w-full h-2 bg-purple-500/40 rounded overflow-hidden">
                  <div
                    className="h-full bg-emerald-400"
                    style={{ width: `${currentMusicology.agency.humanSharePct}%` }}
                  />
                </div>
              </div>

              {/* Tabla comparativa de los 3 casos de estudio (Moscú, Diáspora, China) */}
              <div className="bg-white/5 p-2 rounded-lg space-y-1.5">
                <p className="text-gray-300 font-bold text-[11px]">
                  Comparativa Casos de Estudio (Moscú · Diáspora · China)
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[10px]">
                    <thead>
                      <tr className="text-gray-400 border-b border-white/10">
                        <th className="py-1">Caso</th>
                        <th>Alturas</th>
                        <th>Ritmo</th>
                        <th>Centroide</th>
                        <th>Hum/Alg</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[currentMusicology, ...THESIS_CASE_STUDY_BENCHMARKS].map((rep, idx) => (
                        <tr key={idx} className="border-b border-white/5">
                          <td className="py-1 text-gray-200">
                            {rep.roomId.slice(0, 12)}
                          </td>
                          <td className="text-emerald-300">{rep.pitchSystem.classification}</td>
                          <td>{rep.rhythm.periodicityIndex}</td>
                          <td>{rep.timbre.meanSpectralCentroidHz}Hz</td>
                          <td>
                            {rep.agency.humanSharePct}/{rep.agency.algorithmicSharePct}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex gap-1.5 pt-1">
                  <button
                    onClick={() =>
                      exportMusicologicalComparison(
                        [currentMusicology, ...THESIS_CASE_STUDY_BENCHMARKS],
                        'csv'
                      )
                    }
                    className="flex-1 bg-emerald-500/25 hover:bg-emerald-500/40 text-emerald-200 py-1.5 rounded"
                  >
                    ⬇ Exportar Tabla CSV (Tesis)
                  </button>
                  <button
                    onClick={() =>
                      exportMusicologicalComparison(
                        [currentMusicology, ...THESIS_CASE_STUDY_BENCHMARKS],
                        'json'
                      )
                    }
                    className="flex-1 bg-sky-500/25 hover:bg-sky-500/40 text-sky-200 py-1.5 rounded"
                  >
                    ⬇ Exportar Fichas JSON
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TELEMETRÍA TÉCNICA Y COMPARACIÓN TCP vs UDP */}
          {/* ============================================================== */}
          {activeTab === 'telemetry' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between bg-white/5 p-2 rounded-lg">
                <div>
                  <span className="text-gray-400 block text-[10px]">
                    Región anónima del participante
                  </span>
                  <span className="text-emerald-300 font-bold">{telemetry.regionCode}</span>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={telemetry.regionCode}
                  onChange={(e) => setManualRegionCode(e.target.value)}
                  className="w-20 bg-black/60 border border-white/15 rounded px-2 py-1 text-center text-gray-100"
                  title="Código de país/región aproximado sin datos personales (ej. MX, RU, CN, CO)"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-white/5 p-2 rounded-lg">
                  <span className="text-gray-400 block text-[10px]">FPS (p50 / mín)</span>
                  <span className="text-emerald-300 font-bold">
                    {techReport.performanceSummary.fpsP50} / {techReport.performanceSummary.fpsMin}{' '}
                    FPS
                  </span>
                </div>
                <div className="bg-white/5 p-2 rounded-lg">
                  <span className="text-gray-400 block text-[10px]">
                    Carga AudioContext / Voces
                  </span>
                  <span className="text-sky-300 font-bold">
                    {techReport.performanceSummary.meanAudioLoadPct}% · pico{' '}
                    {techReport.performanceSummary.peakVoices} voces
                  </span>
                </div>
              </div>

              {/* Comparación TCP (Firebase) frente a UDP (WebRTC) */}
              <div className="bg-white/5 p-2.5 rounded-lg space-y-2">
                <p className="text-gray-200 font-bold text-[11px]">
                  Comparación de campo: TCP (Firebase) vs UDP (WebRTC)
                </p>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="bg-amber-500/10 border border-amber-500/30 p-2 rounded">
                    <p className="text-amber-300 font-bold">TCP / Firebase</p>
                    <p>p50: {techReport.latencyPercentiles.tcpP50Ms} ms</p>
                    <p>p95: {techReport.latencyPercentiles.tcpP95Ms} ms</p>
                    <p>Jitter: {techReport.transportComparison.tcpFirebase.jitterMs} ms</p>
                    <p className="text-gray-400">HoL Blocking: Sí</p>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-2 rounded">
                    <p className="text-emerald-300 font-bold">UDP / WebRTC P2P</p>
                    <p>p50: {techReport.latencyPercentiles.udpP50Ms} ms</p>
                    <p>p95: {techReport.latencyPercentiles.udpP95Ms} ms</p>
                    <p>Jitter: {techReport.transportComparison.udpWebRtc.jitterMs} ms</p>
                    <p className="text-gray-400">HoL Blocking: No</p>
                  </div>
                </div>
                <p className="text-[10px] text-gray-300">
                  {techReport.transportComparison.summary}
                </p>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => exportTechnicalTelemetryReport('json')}
                    className="flex-1 bg-sky-500/25 hover:bg-sky-500/40 text-sky-200 py-1.5 rounded"
                  >
                    ⬇ Informe Técnico JSON
                  </button>
                  <button
                    onClick={() => exportTechnicalTelemetryReport('csv')}
                    className="flex-1 bg-emerald-500/25 hover:bg-emerald-500/40 text-emerald-200 py-1.5 rounded"
                  >
                    ⬇ Serie Temporal CSV
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* VISUALIZACIONES DE SESIÓN (SVG PARA TESIS Y ARTÍCULOS) */}
          {/* ============================================================== */}
          {activeTab === 'visuals' && (
            <div className="space-y-2.5">
              <p className="text-[11px] text-gray-300">
                Exporta gráficos vectoriales (.svg) generados a partir de la sesión activa o
                cargada en Replay para su inclusión directa en la tesis y artículos:
              </p>

              <div className="space-y-2">
                <button
                  onClick={() =>
                    exportSpatialHeatmapSvg(replay.loadedSession ?? undefined)
                  }
                  className="w-full text-left bg-white/5 hover:bg-white/10 border border-white/10 p-2.5 rounded-lg transition-colors"
                >
                  <p className="text-amber-300 font-bold">
                    ⬇ Mapa de Calor Espacial y Recorridos (.svg)
                  </p>
                  <p className="text-[10px] text-gray-400">
                    Densidad cenital X-Z de objetos sonoros, zonas de efectos y trayectorias.
                  </p>
                </button>

                <button
                  onClick={() =>
                    exportPhaseTopologicalSvg(replay.loadedSession ?? undefined)
                  }
                  className="w-full text-left bg-white/5 hover:bg-white/10 border border-white/10 p-2.5 rounded-lg transition-colors"
                >
                  <p className="text-sky-300 font-bold">
                    ⬇ Diagrama Topológico por Fases Animado (.svg)
                  </p>
                  <p className="text-[10px] text-gray-400">
                    Comparativa en 4 paneles (Experimentación → Consolidación → Producción →
                    Presentación) con enlaces espaciales.
                  </p>
                </button>

                <button
                  onClick={() =>
                    exportTemporalGraphicScoreSvg(replay.loadedSession ?? undefined)
                  }
                  className="w-full text-left bg-white/5 hover:bg-white/10 border border-white/10 p-2.5 rounded-lg transition-colors"
                >
                  <p className="text-purple-300 font-bold">
                    ⬇ Partitura Gráfica Temporal (Eje X = Tiempo) (.svg)
                  </p>
                  <p className="text-[10px] text-gray-400">
                    Frecuencia logarítmica vs. tiempo, diferenciando intervención humana,
                    Jardinero Sónico y marcadores del investigador.
                  </p>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
