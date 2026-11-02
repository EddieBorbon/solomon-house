'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  useCommunityInteroperabilityStore,
  SOVEREIGNTY_AUDIT_MATRIX,
  submitCollectiveEvaluation,
  addPeerTimestampedComment,
  exportCollectiveEvaluationReportJson,
  initWebMidiBridge,
  sendMidiNoteOut,
  connectOscBridge,
  sendOscMessage,
  toggleTidalPatternEngine,
  exportSovereignCommunityBundle,
  importSovereignCommunityBundle,
  formatUtcForTimezones,
  scheduleNewInternationalSession,
} from '../../lib/community/communityInteroperability';
import { useUIPanelStore } from '../../state/useUIPanelStore';
import { useLanguage } from '../../contexts/LanguageContext';

export function CommunityInteroperabilityPanel() {
  const { t } = useLanguage();
  const activeModal = useUIPanelStore((s) => s.activeModal);
  const closeModal = useUIPanelStore((s) => s.closeModal);
  const open = activeModal === 'community_e7';
  const [activeTab, setActiveTab] = useState<'eval' | 'livecoding' | 'sovereignty'>('eval');

  const commState = useCommunityInteroperabilityStore();
  const hydraCanvasRef = useRef<HTMLCanvasElement>(null);
  const bundleInputRef = useRef<HTMLInputElement>(null);

  // Estado formulario (Evaluación Colectiva)
  const [alias, setAlias] = useState('Participante Local');
  const [workshopName, setWorkshopName] = useState('Taller de Improvisación Espacial');
  const [listeningScore, setListeningScore] = useState(5);
  const [collabScore, setCollabScore] = useState(5);
  const [coherenceScore, setCoherenceScore] = useState(4);
  const [difficultyScore, setDifficultyScore] = useState(2);
  const [reflection, setReflection] = useState('');
  const [commentSec, setCommentSec] = useState(15);
  const [commentText, setCommentText] = useState('');

  // Estado (Importación soberana y Husos horarios)
  const [bundleStatus, setBundleStatus] = useState<string | null>(null);
  const [intlTitle, setIntlTitle] = useState('');
  const [intlUtc, setIntlUtc] = useState('2026-12-15T18:00:00Z');
  const intlNode = 'Nodo UNAM – Red Sur';

  //: Capa visual estilo Hydra reactiva al tiempo y al código de osciladores
  useEffect(() => {
    if (!commState.hydraLayerEnabled) return;
    const canvas = hydraCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let t = 0;
    const render = () => {
      t += 0.03;
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = 'rgba(8, 6, 18, 0.16)';
      ctx.fillRect(0, 0, w, h);

      const petals = 6;
      const cx = w / 2;
      const cy = h / 2;
      for (let i = 0; i < petals; i++) {
        const angle = (i * Math.PI * 2) / petals + t * 0.5;
        const r = 90 + Math.sin(t * 2 + i) * 45;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        const grad = ctx.createRadialGradient(x, y, 4, x, y, 80);
        grad.addColorStop(0, `hsla(${(t * 45 + i * 60) % 360}, 85%, 60%, 0.35)`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, 80, 0, Math.PI * 2);
        ctx.fill();
      }
      animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
  }, [commState.hydraLayerEnabled]);

  return (
    <>
      {/* Lienzo visual Hydra opcional de fondo */}
      {commState.hydraLayerEnabled && (
        <canvas
          ref={hydraCanvasRef}
          width={640}
          height={360}
          className="pointer-events-none fixed inset-0 z-10 h-full w-full opacity-45 mix-blend-screen"
        />
      )}

      {open && (
        <div className="fixed top-14 left-[21rem] z-50">
          <div className="w-[500px] max-w-[95vw] rounded-2xl border border-teal-500/40 bg-neutral-950/95 p-4 text-xs text-neutral-200 shadow-2xl backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {t('modals.communityTitle')}
                </h3>
                <p className="text-[11px] text-neutral-400">
                  {t('modals.communitySubtitle')}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="rounded-lg px-2 py-1 text-neutral-400 hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mb-3 rounded-lg bg-teal-950/30 border border-teal-500/30 p-2 text-[10px] text-teal-100 leading-snug">
              💡 {t('modals.communityHelp')}
            </div>

            {/* Pestañas */}
            <div className="mb-3 flex gap-1 rounded-lg bg-white/5 p-1">
              {(
                [
                  ['eval', 'Comentarios'],
                  ['livecoding', 'MIDI / Ritmos'],
                  ['sovereignty', 'Modo Sin Internet'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex-1 rounded-md py-1.5 text-[11px] font-medium transition ${
                    activeTab === id
                      ? 'bg-teal-600 text-white'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* PESTAÑA 1: EVALUACIÓN COLECTIVA Y COMENTARIOS ANCLADOS */}
            {activeTab === 'eval' && (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                <div className="rounded-xl border border-teal-500/30 bg-teal-950/20 p-2.5 space-y-2">
                  <div className="font-semibold text-teal-200">
                    Cuestionario de Evaluación Colectiva al Cerrar Sesión
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      placeholder="Tu alias"
                      value={alias}
                      onChange={(e) => setAlias(e.target.value)}
                      className="rounded border border-white/15 bg-black px-2 py-1 text-[11px]"
                    />
                    <input
                      placeholder="Nombre del taller / sesión"
                      value={workshopName}
                      onChange={(e) => setWorkshopName(e.target.value)}
                      className="rounded border border-white/15 bg-black px-2 py-1 text-[11px]"
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 text-[10px]">
                    <label>
                      Escucha (1-5)
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={listeningScore}
                        onChange={(e) => setListeningScore(Number(e.target.value))}
                        className="mt-0.5 w-full rounded border border-white/15 bg-black px-1.5 py-0.5"
                      />
                    </label>
                    <label>
                      Colaboración
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={collabScore}
                        onChange={(e) => setCollabScore(Number(e.target.value))}
                        className="mt-0.5 w-full rounded border border-white/15 bg-black px-1.5 py-0.5"
                      />
                    </label>
                    <label>
                      Coherencia
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={coherenceScore}
                        onChange={(e) => setCoherenceScore(Number(e.target.value))}
                        className="mt-0.5 w-full rounded border border-white/15 bg-black px-1.5 py-0.5"
                      />
                    </label>
                    <label>
                      Dificultad
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={difficultyScore}
                        onChange={(e) => setDifficultyScore(Number(e.target.value))}
                        className="mt-0.5 w-full rounded border border-white/15 bg-black px-1.5 py-0.5"
                      />
                    </label>
                  </div>

                  <div className="flex gap-1.5">
                    <input
                      placeholder="Reflexión cualitativa sobre la escucha y agencia compartida..."
                      value={reflection}
                      onChange={(e) => setReflection(e.target.value)}
                      className="flex-1 rounded border border-white/15 bg-black px-2 py-1 text-[11px]"
                    />
                    <button
                      onClick={() => {
                        submitCollectiveEvaluation({
                          participantAlias: alias,
                          workshopName,
                          listeningQuality: listeningScore,
                          collaborativeAgency: collabScore,
                          spatialCoherence: coherenceScore,
                          perceivedDifficulty: difficultyScore,
                          openReflection:
                            reflection || 'Sesión fluida con diálogo tímbrico claro.',
                        });
                        setReflection('');
                      }}
                      className="rounded bg-teal-600 px-3 py-1 font-semibold text-white hover:bg-teal-500"
                    >
                      Registrar
                    </button>
                  </div>
                </div>

                {/* Ronda de comentarios entre participantes ligada a marcadores */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 space-y-1.5">
                  <div className="font-semibold text-white">
                    Ronda de Comentarios Ligada a Marcadores de Grabación
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      min={0}
                      value={commentSec}
                      onChange={(e) => setCommentSec(Number(e.target.value))}
                      className="w-16 rounded border border-white/15 bg-black px-2 py-1 text-[10px]"
                      title="Segundo de la grabación"
                    />
                    <input
                      placeholder="Comentario en ese instante de la obra..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="flex-1 rounded border border-white/15 bg-black px-2 py-1 text-[10px]"
                    />
                    <button
                      onClick={() => {
                        if (!commentText.trim()) return;
                        addPeerTimestampedComment(alias, commentSec, commentText);
                        setCommentText('');
                      }}
                      className="rounded bg-teal-700 px-2.5 py-1 text-[10px] text-white"
                    >
                      + Anclar
                    </button>
                  </div>
                  <div className="max-h-20 overflow-y-auto space-y-1 pt-1">
                    {commState.peerComments.map((c) => (
                      <div key={c.id} className="rounded bg-black/50 px-2 py-1 text-[10px]">
                        <span className="font-mono text-teal-300">
                          [{(c.tMs / 1000).toFixed(0)}s]
                        </span>{' '}
                        <strong>{c.authorAlias}:</strong> {c.comment}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => exportCollectiveEvaluationReportJson()}
                  className="w-full rounded-lg border border-teal-500/40 bg-teal-950/50 py-1.5 text-[11px] font-medium text-teal-200 hover:bg-teal-900/60"
                >
                  Exportar Resultados Agregados por Sesión y Taller JSON
                </button>
              </div>
            )}

            {/* PESTAÑA 2: INTEROPERABILIDAD CON LIVE CODING */}
            {activeTab === 'livecoding' && (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {/* Web MIDI y Puente OSC */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-2 space-y-1">
                    <div className="font-semibold text-teal-300">
                      Web MIDI In/Out
                    </div>
                    <div className="text-[10px] text-neutral-300 truncate">
                      {commState.midi.lastMessageLog}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => void initWebMidiBridge()}
                        className="flex-1 rounded bg-teal-600 py-1 text-[10px] font-semibold text-white"
                      >
                        Conectar MIDI
                      </button>
                      <button
                        onClick={() => sendMidiNoteOut(60, 100)}
                        className="rounded bg-white/10 px-2 py-1 text-[10px]"
                      >
                        Enviar C4
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-2 space-y-1">
                    <div className="font-semibold text-amber-300">
                      Puente OSC SuperCollider/PD/Tidal
                    </div>
                    <div className="text-[10px] text-neutral-300 truncate">
                      {commState.osc.lastSentAddress} ({commState.osc.messagesCount} msg)
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => connectOscBridge()}
                        className="flex-1 rounded bg-amber-600 py-1 text-[10px] font-semibold text-white"
                      >
                        {commState.osc.connected ? 'OSC Activo' : 'Conectar OSC'}
                      </button>
                      <button
                        onClick={() => sendOscMessage('/salomon/ping', [440, 1])}
                        className="rounded bg-white/10 px-2 py-1 text-[10px]"
                      >
                        Test OSC
                      </button>
                    </div>
                  </div>
                </div>

                {/* Patrones estilo Strudel / TidalCycles */}
                <div className="rounded-xl border border-teal-500/30 bg-black/70 p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-teal-200">
                      Motor de Patrones Cíclicos Strudel / TidalCycles
                    </span>
                    <span className="font-mono text-[10px] text-teal-300">
                      Paso #{commState.activeTidalStep} · {commState.tidalBpm} BPM
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      value={commState.tidalPatternCode}
                      onChange={(e) =>
                        useCommunityInteroperabilityStore.setState({
                          tidalPatternCode: e.target.value,
                        })
                      }
                      className="flex-1 rounded border border-white/15 bg-black px-2 py-1 font-mono text-[11px] text-emerald-300"
                    />
                    <button
                      onClick={() => toggleTidalPatternEngine()}
                      className={`rounded px-3 py-1 text-[10px] font-semibold ${
                        commState.tidalCycleRunning
                          ? 'bg-red-600 text-white'
                          : 'bg-teal-600 text-white'
                      }`}
                    >
                      {commState.tidalCycleRunning ? 'Detener Ciclo' : 'Evaluar Patrón'}
                    </button>
                  </div>
                </div>

                {/* Capa visual Hydra opcional y Diálogo comunitario */}
                <div className="rounded-xl border border-fuchsia-500/30 bg-fuchsia-950/20 p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-fuchsia-200">
                      Sintetizador Visual Hydra Reactivo
                    </span>
                    <button
                      onClick={() =>
                        useCommunityInteroperabilityStore.setState({
                          hydraLayerEnabled: !commState.hydraLayerEnabled,
                        })
                      }
                      className={`rounded px-2.5 py-0.5 text-[10px] font-semibold ${
                        commState.hydraLayerEnabled
                          ? 'bg-fuchsia-600 text-white'
                          : 'bg-white/10 text-neutral-300'
                      }`}
                    >
                      {commState.hydraLayerEnabled ? 'Hydra Activo' : 'Activar Capa Hydra'}
                    </button>
                  </div>
                  <input
                    value={commState.hydraPresetCode}
                    onChange={(e) =>
                      useCommunityInteroperabilityStore.setState({
                        hydraPresetCode: e.target.value,
                      })
                    }
                    className="w-full rounded border border-white/15 bg-black px-2 py-1 font-mono text-[10px] text-fuchsia-300"
                  />
                  <p className="text-[10px] text-neutral-300">
                    <strong>Protocolo de colaboración:</strong> Interoperabilidad
                    documentada con Hydra (Olivia Jack) y Strudel/TidalCycles (Alex McLean)
                    mediante Web MIDI, WebSocket OSC y lienzo compartido sin servidores
                    comerciales.
                  </p>
                </div>
              </div>
            )}

            {/* PESTAÑA 3: SOBERANÍA TECNOLÓGICA REAL Y HUSOS HORARIOS */}
            {activeTab === 'sovereignty' && (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {/* Instalación en 1 comando y LAN sin internet */}
                <div className="rounded-xl border border-teal-500/30 bg-black/70 p-2.5 space-y-1">
                  <div className="font-semibold text-teal-300">
                    Despliegue de Nodo Comunitario en 1 Comando y Modo LAN
                  </div>
                  <code className="block rounded bg-neutral-900 px-2 py-1 font-mono text-[10px] text-emerald-300">
                    docker compose --profile lan-sovereign up -d
                  </code>
                  <div className="text-[10px] text-neutral-300">
                    ✓ {commState.lanDiagnosticReport}
                  </div>
                </div>

                {/* Exportar e importar comunidad completa sin Firebase */}
                <div className="flex gap-2">
                  <button
                    onClick={() => exportSovereignCommunityBundle('Comunidad-Casa-Salomon')}
                    className="flex-1 rounded-lg bg-teal-600 py-1.5 text-[10px] font-semibold text-white hover:bg-teal-500"
                  >
                    Exportar Comunidad sin Firebase
                  </button>
                  <input
                    ref={bundleInputRef}
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        importSovereignCommunityBundle(f)
                          .then(setBundleStatus)
                          .catch((err) => setBundleStatus((err as Error).message));
                      }
                      e.target.value = '';
                    }}
                  />
                  <button
                    onClick={() => bundleInputRef.current?.click()}
                    className="flex-1 rounded-lg border border-teal-400/40 bg-teal-950/40 py-1.5 text-[10px] font-semibold text-teal-200 hover:bg-teal-900/50"
                  >
                    Importar Paquete Comunitario
                  </button>
                </div>
                {bundleStatus && (
                  <div className="rounded bg-emerald-950/60 p-1.5 text-[10px] text-emerald-200">
                    {bundleStatus}
                  </div>
                )}

                {/* Matriz crítica de alcances y límites reales de soberanía */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-2 space-y-1">
                  <div className="font-semibold text-amber-300">
                    Auditoría Crítica de Soberanía Tecnológica
                  </div>
                  {SOVEREIGNTY_AUDIT_MATRIX.map((row, idx) => (
                    <div key={idx} className="rounded bg-black/50 p-1.5 text-[10px]">
                      <div className="font-semibold text-white">
                        {row.subsystem} ({row.currentStatus})
                      </div>
                      <div className="text-neutral-300">{row.realLimitsAndMitigation}</div>
                    </div>
                  ))}
                </div>

                {/* Programador de sesiones internacionales con husos horarios */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 space-y-1.5">
                  <div className="font-semibold text-cyan-300">
                    Calendario Internacional Multihuso Horario
                  </div>
                  {commState.scheduledInternationalSessions.map((slot) => (
                    <div key={slot.id} className="rounded bg-black/60 p-2 text-[10px]">
                      <div className="font-semibold text-white">
                        {slot.title} ({slot.organizerNode})
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {formatUtcForTimezones(slot.utcIso).map((tz) => (
                          <span
                            key={tz.label}
                            className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[9px] text-cyan-200"
                          >
                            {tz.label}: {tz.localTime}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-1 pt-1">
                    <input
                      placeholder="Nueva sesión internacional..."
                      value={intlTitle}
                      onChange={(e) => setIntlTitle(e.target.value)}
                      className="flex-1 rounded border border-white/15 bg-black px-2 py-1 text-[10px]"
                    />
                    <input
                      value={intlUtc}
                      onChange={(e) => setIntlUtc(e.target.value)}
                      className="w-36 rounded border border-white/15 bg-black px-1.5 py-1 font-mono text-[9px]"
                    />
                    <button
                      onClick={() => {
                        scheduleNewInternationalSession(intlTitle, intlUtc, intlNode);
                        setIntlTitle('');
                      }}
                      className="rounded bg-cyan-600 px-2 py-1 text-[10px] text-white"
                    >
                      + Agendar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
