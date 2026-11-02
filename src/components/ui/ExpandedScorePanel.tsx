'use client';

import { useState } from 'react';
import {
  useExpandedScoreStore,
  ROLE_LABELS,
  ROLE_PERMISSIONS,
  ROLE_VISUAL_COLORS,
  PHASE_DESCRIPTIONS,
  ROOM_CAPACITY_BY_TYPE,
  BUILTIN_GAME_SCORE_TEMPLATES,
  getActivePermissions,
  assignParticipantRole,
  assignParticipantLayer,
  transferObjectOwnership,
  toggleParameterLock,
  setCollaborationMode,
  advanceTurn,
  markAsyncLayerListened,
  commitAsyncExquisiteCorpseLayer,
  setPresetSessionDuration,
  startTimedSession,
  stopTimedSession,
  setManualSessionPhase,
  applyGameScoreTemplate,
  exportCurrentGameScoreTemplate,
  toggleSeasonCallEnrollment,
  createAffinityGroup,
  type RoomRole,
  type CollaborationMode,
  type SessionPhaseId,
  type PresetSessionDuration,
  type RoomAccessType,
  type ParameterFreedomLocks,
} from '../../lib/score/expandedScoreProtocol';
import {
  usePedagogyStore,
  PARAMETRIC_LEVELS,
  evaluateLevelChallenge,
  type ParametricLevel,
} from '../../lib/pedagogy/parametricLevels';
import { analyzeSessionMusicology } from '../../lib/session/musicologicalAnalysis';
import { type CompositionalLayer } from '../../lib/session/sessionRecorder';
import { useWorldStore } from '../../state/useWorldStore';
import { useUIPanelStore } from '../../state/useUIPanelStore';

/**
 * Panel y HUD de la Partitura Expandida (Roadmap Funcional Jurado — Etapa E2 completa).
 */

type TabId = 'roles' | 'modes' | 'temporal' | 'levels' | 'community';

function formatClock(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function ExpandedScorePanel() {
  const activeModal = useUIPanelStore((s) => s.activeModal);
  const closeModal = useUIPanelStore((s) => s.closeModal);
  const open = activeModal === 'score_e2';
  const [activeTab, setActiveTab] = useState<TabId>('roles');
  const [asyncNote, setAsyncNote] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [templateDesc, setTemplateDesc] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupFocus, setNewGroupFocus] = useState('');

  const score = useExpandedScoreStore();
  const pedagogy = usePedagogyStore();
  const { grids } = useWorldStore();

  const allObjectIds = Array.from(grids.values()).flatMap((g) => g.objects.map((o) => o.id));
  const activePerms = getActivePermissions();
  const currentLevelDef = PARAMETRIC_LEVELS[pedagogy.level];
  const challengeResult = evaluateLevelChallenge(
    pedagogy.level,
    analyzeSessionMusicology()
  );

  return (
    <>
      {/* HUD Superior de Forma Temporal, Fase y Turno */}
      {(score.sessionTimerRunning || score.collaborationMode !== 'synchronous') && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-950/90 backdrop-blur-md border border-indigo-500/40 rounded-full px-4 py-1.5 z-40 font-mono text-xs text-gray-100 flex items-center gap-3 shadow-lg">
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{
              backgroundColor: `${ROLE_VISUAL_COLORS[score.localRole]}25`,
              color: ROLE_VISUAL_COLORS[score.localRole],
            }}
          >
            {ROLE_LABELS[score.localRole].split(' ')[0]} · {score.localLayer}
          </span>

          {score.sessionTimerRunning && (
            <>
              <span className="text-indigo-300 font-bold">
                {PHASE_DESCRIPTIONS[score.currentPhase].label}
              </span>
              <span className="text-emerald-300 font-bold">
                ⏱{' '}
                {score.presetDuration === 'free'
                  ? formatClock(score.sessionElapsedSec)
                  : formatClock(score.sessionRemainingSec)}
              </span>
            </>
          )}

          {score.collaborationMode === 'turn_based' && (
            <span className="text-amber-300">
              Turno: <strong>{score.activeTurnParticipantId}</strong> ({score.turnRemainingSec}s)
            </span>
          )}

          {score.collaborationMode === 'asynchronous' && (
            <span className="text-purple-300">
              Cadáver Exquisito ({score.asyncLayers.length} capas)
            </span>
          )}
        </div>
      )}

      {open && (
        <div className="fixed top-14 left-[21rem] w-[480px] max-w-[92vw] max-h-[80vh] overflow-y-auto bg-slate-950/95 backdrop-blur-md border border-indigo-500/40 rounded-xl p-4 z-50 font-mono text-xs text-gray-200 space-y-3 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div>
              <h3 className="text-indigo-300 font-bold text-sm">
                Organización de Sesión en Grupo (Roles, Turnos y Reloj)
              </h3>
              <p className="text-[11px] text-gray-400">
                Coordina quién toca cada parte, organiza turnos o inicia un reloj de ensayo
              </p>
            </div>
            <button
              onClick={closeModal}
              className="text-gray-400 hover:text-white px-2 py-1"
            >
              ✕
            </button>
          </div>

          <div className="rounded-lg bg-indigo-950/30 border border-indigo-500/30 p-2 text-[10px] text-indigo-100 leading-snug">
            💡 <strong>¿Cómo usar esta ventana?</strong> Elige tu rol en la sala, define si todos tocan al mismo tiempo o por turnos, o activa el reloj para dividir tu sesión en fases.
          </div>

          {/* Pestañas */}
          <div className="grid grid-cols-5 gap-1 bg-black/50 p-1 rounded-lg">
            {(
              [
                ['roles', 'Roles'],
                ['modes', 'Turnos'],
                ['temporal', 'Reloj'],
                ['levels', 'Retos'],
                ['community', 'Salas'],
              ] as [TabId, string][]
            ).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`py-1.5 px-1 rounded text-center text-[11px] transition-colors ${
                  activeTab === id
                    ? 'bg-indigo-600/40 text-indigo-100 font-bold'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ============================================================== */}
          {/* ROLES Y PERMISOS */}
          {/* ============================================================== */}
          {activeTab === 'roles' && (
            <div className="space-y-3">
              <div className="bg-white/5 p-2.5 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 font-bold">
                    Participantes en la sala y su función musical
                  </span>
                  <label className="flex items-center gap-1.5 text-[10px] text-gray-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={score.showRoleIndicatorsIn3D}
                      onChange={(e) =>
                        useExpandedScoreStore.setState({
                          showRoleIndicatorsIn3D: e.target.checked,
                        })
                      }
                    />
                    Mostrar indicadores en 3D
                  </label>
                </div>

                <div className="space-y-1.5">
                  {score.participants.map((p) => (
                    <div
                      key={p.id}
                      className="grid grid-cols-12 gap-1.5 items-center bg-black/40 p-1.5 rounded"
                    >
                      <span
                        className="col-span-5 truncate font-bold text-[11px]"
                        style={{ color: ROLE_VISUAL_COLORS[p.role] }}
                      >
                        ● {p.alias}
                      </span>
                      <select
                        value={p.role}
                        onChange={(e) =>
                          assignParticipantRole(p.id, e.target.value as RoomRole)
                        }
                        className="col-span-4 bg-black/70 border border-white/15 rounded px-1 py-0.5 text-[10px]"
                      >
                        <option value="moderator">Moderación</option>
                        <option value="composer">Composición</option>
                        <option value="performer">Interpretación</option>
                        <option value="listener">Escucha</option>
                        <option value="curator">Curaduría</option>
                      </select>
                      <select
                        value={p.layer}
                        onChange={(e) =>
                          assignParticipantLayer(p.id, e.target.value as CompositionalLayer)
                        }
                        className="col-span-3 bg-black/70 border border-white/15 rounded px-1 py-0.5 text-[10px]"
                      >
                        <option value="texture">Textura</option>
                        <option value="gesture">Gesto</option>
                        <option value="spatial">Espacio</option>
                        <option value="general">General</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 p-2.5 rounded-lg space-y-1.5">
                <p className="text-gray-300 font-bold text-[11px]">
                  Acciones permitidas para tu rol actual ({ROLE_LABELS[score.localRole]})
                </p>
                <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                  {(
                    [
                      ['Crear obj.', activePerms.canCreate],
                      ['Mover / gesto', activePerms.canMove],
                      ['Editar síntesis', activePerms.canEditSynth],
                      ['Zonas efecto', activePerms.canEditEffects],
                      ['Grabar sesión', activePerms.canRecord],
                      ['Curar / Galería', activePerms.canCurate],
                    ] as [string, boolean][]
                  ).map(([label, allowed]) => (
                    <div
                      key={label}
                      className={`p-1.5 rounded border ${
                        allowed
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                          : 'bg-red-500/10 border-red-500/30 text-gray-400'
                      }`}
                    >
                      {allowed ? '✔' : '✖'} {label}
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-gray-500">
                  Roles disponibles: {Object.keys(ROLE_PERMISSIONS).length} perfiles con reglas
                  diferenciadas.
                </p>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* CAPAS, TURNOS, CADÁVER EXQUISITO Y BLOQUEO DE PARÁMETROS */}
          {/* ============================================================== */}
          {activeTab === 'modes' && (
            <div className="space-y-3">
              <div className="bg-white/5 p-2.5 rounded-lg space-y-2">
                <p className="text-gray-300 font-bold">
                  ¿Cómo quieren tocar en la sala?
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      ['synchronous', 'Síncrono (Todos)'],
                      ['turn_based', 'Por Turnos'],
                      ['asynchronous', 'Asíncrono (Capas)'],
                    ] as [CollaborationMode, string][]
                  ).map(([mode, label]) => (
                    <button
                      key={mode}
                      onClick={() => setCollaborationMode(mode)}
                      className={`py-1.5 px-2 rounded text-[10px] font-bold transition-colors ${
                        score.collaborationMode === mode
                          ? 'bg-indigo-600 text-white'
                          : 'bg-black/50 text-gray-400 hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {score.collaborationMode === 'turn_based' && (
                  <div className="bg-black/40 p-2 rounded space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span>
                        Turno activo:{' '}
                        <strong className="text-amber-300">
                          {score.activeTurnParticipantId}
                        </strong>{' '}
                        ({score.turnRemainingSec}s)
                      </span>
                      <button
                        onClick={advanceTurn}
                        className="bg-amber-500/30 hover:bg-amber-500/50 text-amber-200 px-2 py-0.5 rounded text-[10px]"
                      >
                        ⏭ Pasar turno
                      </button>
                    </div>
                  </div>
                )}

                {score.collaborationMode === 'asynchronous' && (
                  <div className="bg-black/40 p-2 rounded space-y-2">
                    <p className="text-[10px] text-purple-200">
                      <strong>Composición por Capas (Cadáver Exquisito):</strong> Escucha la capa anterior antes de grabar la tuya.
                    </p>
                    <div className="flex gap-1.5">
                      <button
                        onClick={markAsyncLayerListened}
                        className={`px-2 py-1 rounded text-[10px] ${
                          score.hasListenedToPreviousAsyncLayer
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/40 text-amber-100 font-bold'
                        }`}
                      >
                        {score.hasListenedToPreviousAsyncLayer
                          ? '✔ Capa previa escuchada'
                          : '🎧 1. Escuchar capa previa'}
                      </button>
                      <input
                        type="text"
                        placeholder="Nota para el siguiente participante…"
                        value={asyncNote}
                        onChange={(e) => setAsyncNote(e.target.value)}
                        className="flex-1 bg-black/60 border border-white/15 rounded px-2 py-1 text-[10px]"
                      />
                      <button
                        onClick={() => {
                          commitAsyncExquisiteCorpseLayer(asyncNote, allObjectIds);
                          setAsyncNote('');
                        }}
                        className="bg-purple-500/40 hover:bg-purple-500/60 text-purple-100 px-2 py-1 rounded text-[10px]"
                      >
                        + Dejar capa
                      </button>
                    </div>
                    {score.asyncLayers.length > 0 && (
                      <div className="max-h-20 overflow-y-auto space-y-1 text-[10px] text-gray-400">
                        {score.asyncLayers.map((l, idx) => (
                          <div key={l.id}>
                            #{idx + 1} [{l.layer}] {l.participantId}: {l.notes} (
                            {l.objectIds.length} obj)
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-white/5 p-2.5 rounded-lg space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 font-bold">
                    Autoría de los objetos creados
                  </span>
                  <label className="flex items-center gap-1.5 text-[10px] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={score.enforceOwnership}
                      onChange={(e) =>
                        useExpandedScoreStore.setState({
                          enforceOwnership: e.target.checked,
                        })
                      }
                    />
                    Exigir autoría para editar
                  </label>
                </div>
                {allObjectIds.length > 0 ? (
                  <div className="max-h-24 overflow-y-auto space-y-1">
                    {allObjectIds.slice(0, 6).map((objId) => {
                      const owner = score.objectOwners[objId] || score.localParticipantId;
                      return (
                        <div
                          key={objId}
                          className="flex items-center justify-between bg-black/40 px-2 py-1 rounded text-[10px]"
                        >
                          <span className="truncate w-36">{objId}</span>
                          <span className="text-indigo-300">{owner}</span>
                          <button
                            onClick={() => transferObjectOwnership(objId, 'PUBLIC')}
                            className="bg-white/10 hover:bg-white/20 px-1.5 py-0.5 rounded"
                          >
                            Ceder a común
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[10px] text-gray-500">
                    Crea un objeto para gestionar o ceder su propiedad.
                  </p>
                )}
              </div>

              <div className="bg-white/5 p-2.5 rounded-lg space-y-1.5">
                <p className="text-gray-300 font-bold">
                  Bloquear o permitir cambios en ciertos controles
                </p>
                <div className="grid grid-cols-5 gap-1 text-[10px]">
                  {(
                    [
                      ['frequency', 'Altura'],
                      ['timbre', 'Timbre'],
                      ['position', 'Posición'],
                      ['effects', 'Efectos'],
                      ['scale', 'Escala'],
                    ] as [keyof ParameterFreedomLocks, string][]
                  ).map(([key, label]) => {
                    const locked = score.parameterLocks[key];
                    return (
                      <button
                        key={key}
                        onClick={() => toggleParameterLock(key)}
                        className={`py-1 px-1 rounded border text-center ${
                          locked
                            ? 'bg-red-500/25 border-red-500/50 text-red-200'
                            : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200'
                        }`}
                      >
                        {locked ? '🔒' : '🔓'} {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* SESIONES CON FORMA TEMPORAL Y PLANTILLAS */}
          {/* ============================================================== */}
          {activeTab === 'temporal' && (
            <div className="space-y-3">
              <div className="bg-white/5 p-2.5 rounded-lg space-y-2">
                <p className="text-gray-300 font-bold">
                  Reloj de sesión y etapas de ensayo
                </p>
                <div className="grid grid-cols-4 gap-1.5">
                  {([10, 15, 30, 'free'] as PresetSessionDuration[]).map((dur) => (
                    <button
                      key={String(dur)}
                      onClick={() => setPresetSessionDuration(dur)}
                      className={`py-1 rounded text-[11px] font-bold ${
                        score.presetDuration === dur
                          ? 'bg-indigo-600 text-white'
                          : 'bg-black/50 text-gray-400'
                      }`}
                    >
                      {dur === 'free' ? 'Libre' : `${dur} min`}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between bg-black/40 p-2 rounded">
                  <div>
                    <p className="text-indigo-300 font-bold">
                      {PHASE_DESCRIPTIONS[score.currentPhase].label}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {PHASE_DESCRIPTIONS[score.currentPhase].ruleSummary}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      score.sessionTimerRunning
                        ? stopTimedSession(true)
                        : startTimedSession()
                    }
                    className={`px-3 py-1.5 rounded font-bold ${
                      score.sessionTimerRunning
                        ? 'bg-red-600 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {score.sessionTimerRunning
                      ? `■ Finalizar (${formatClock(score.sessionRemainingSec)})`
                      : '▶ Iniciar Reloj'}
                  </button>
                </div>

                {/* Selector manual de fase */}
                <div className="grid grid-cols-4 gap-1 text-[10px]">
                  {(
                    [
                      ['experimentation', '1. Experim.'],
                      ['consolidation', '2. Consolid.'],
                      ['production', '3. Producc.'],
                      ['presentation', '4. Present.'],
                    ] as [SessionPhaseId, string][]
                  ).map(([ph, label]) => (
                    <button
                      key={ph}
                      onClick={() => setManualSessionPhase(ph)}
                      className={`py-1 rounded ${
                        score.currentPhase === ph
                          ? 'bg-indigo-500/40 text-indigo-100 font-bold'
                          : 'bg-white/5 text-gray-400'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 p-2.5 rounded-lg space-y-2">
                <p className="text-gray-300 font-bold">
                  Plantillas listas para jugar o ensayar en grupo
                </p>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {BUILTIN_GAME_SCORE_TEMPLATES.map((tpl) => (
                    <div
                      key={tpl.id}
                      className="flex items-center justify-between bg-black/40 p-2 rounded"
                    >
                      <div>
                        <p className="text-indigo-200 font-bold text-[11px]">{tpl.name}</p>
                        <p className="text-[10px] text-gray-400">{tpl.description}</p>
                      </div>
                      <button
                        onClick={() => applyGameScoreTemplate(tpl)}
                        className="bg-indigo-500/30 hover:bg-indigo-500/50 text-indigo-100 px-2 py-1 rounded text-[10px] ml-2"
                      >
                        Aplicar
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-1.5 pt-1">
                  <input
                    type="text"
                    placeholder="Nombre de plantilla…"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="flex-1 bg-black/60 border border-white/15 rounded px-2 py-1 text-[10px]"
                  />
                  <button
                    onClick={() => {
                      exportCurrentGameScoreTemplate(templateName, templateDesc);
                      setTemplateName('');
                      setTemplateDesc('');
                    }}
                    className="bg-emerald-500/25 hover:bg-emerald-500/40 text-emerald-200 px-2.5 py-1 rounded text-[10px]"
                  >
                    ⬇ Compartir JSON
                  </button>
                </div>

                {score.archivedSessions.length > 0 && (
                  <p className="text-[10px] text-emerald-300">
                    ✔ {score.archivedSessions.length} sesión(es) guardada(s) automáticamente al terminar.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* NIVELES COMO RECORRIDO Y RETOS COMPOSITIVOS */}
          {/* ============================================================== */}
          {activeTab === 'levels' && (
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-1.5">
                {([1, 2, 3, 4] as ParametricLevel[]).map((lvl) => {
                  const def = PARAMETRIC_LEVELS[lvl];
                  const completed = pedagogy.completedChallenges.includes(lvl);
                  return (
                    <button
                      key={lvl}
                      onClick={() => pedagogy.setLevel(lvl)}
                      className={`p-2 rounded border text-left ${
                        pedagogy.level === lvl
                          ? 'bg-indigo-600/40 border-indigo-400 text-white'
                          : 'bg-white/5 border-white/10 text-gray-300'
                      }`}
                    >
                      <div className="font-bold text-xs flex justify-between">
                        <span>Modo {lvl}</span>
                        {completed && <span className="text-emerald-300">★</span>}
                      </div>
                      <div className="text-[9px] text-gray-400 truncate">{def.name}</div>
                    </button>
                  );
                })}
              </div>

              {/* Restricciones del nivel activo */}
              <div className="bg-white/5 p-2.5 rounded-lg space-y-1.5">
                <p className="text-indigo-200 font-bold">{currentLevelDef.name}</p>
                <p className="text-[10px] text-gray-400">{currentLevelDef.description}</p>
                <div className="grid grid-cols-4 gap-1.5 text-[10px] pt-1">
                  <div className="bg-black/40 p-1.5 rounded">
                    <span className="text-gray-400 block">Registro</span>
                    <span className="text-gray-100 font-bold">
                      {currentLevelDef.frequencyRange[0]}–{currentLevelDef.frequencyRange[1]} Hz
                    </span>
                  </div>
                  <div className="bg-black/40 p-1.5 rounded">
                    <span className="text-gray-400 block">Tempo</span>
                    <span className="text-gray-100 font-bold">
                      {currentLevelDef.tempoRangeBpm[0]}–{currentLevelDef.tempoRangeBpm[1]} BPM
                    </span>
                  </div>
                  <div className="bg-black/40 p-1.5 rounded">
                    <span className="text-gray-400 block">Densidad máx.</span>
                    <span className="text-gray-100 font-bold">
                      {currentLevelDef.maxObjectsDensity} objetos
                    </span>
                  </div>
                  <div className="bg-black/40 p-1.5 rounded">
                    <span className="text-gray-400 block">Duración</span>
                    <span className="text-gray-100 font-bold">
                      {currentLevelDef.recommendedDurationMin} min
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 p-2.5 rounded-lg space-y-2 border border-indigo-500/30">
                <div className="flex justify-between items-center">
                  <span className="text-amber-300 font-bold">
                    🎯 Reto: {currentLevelDef.challenge.title}
                  </span>
                  <span className="text-emerald-300 font-bold">
                    {challengeResult.progressPct}%
                  </span>
                </div>
                <p className="text-[10px] text-gray-300">
                  {currentLevelDef.challenge.objective}
                </p>
                <div className="w-full h-2 bg-black/60 rounded overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 transition-all"
                    style={{ width: `${challengeResult.progressPct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">{challengeResult.feedback}</span>
                  <button
                    onClick={() => {
                      pedagogy.unlockNextLevel(pedagogy.level);
                      if (pedagogy.level < 4) {
                        pedagogy.setLevel((pedagogy.level + 1) as ParametricLevel);
                      }
                    }}
                    className="bg-emerald-500/30 hover:bg-emerald-500/50 text-emerald-200 px-2.5 py-1 rounded text-[10px] font-bold"
                  >
                    {challengeResult.passed
                      ? '🔓 Pasar al siguiente modo'
                      : 'Verificar avance'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* MODELOS DE PARTICIPACIÓN, TEMPORADAS Y MICRO-REDES */}
          {/* ============================================================== */}
          {activeTab === 'community' && (
            <div className="space-y-3">
              <div className="bg-white/5 p-2.5 rounded-lg space-y-2">
                <p className="text-gray-300 font-bold">
                  Tamaño del grupo y acceso a la sala
                </p>
                <div className="grid grid-cols-5 gap-1 text-[10px]">
                  {(
                    [
                      ['open', 'Abierta'],
                      ['invite', 'Invitación'],
                      ['duo', 'Dúo (2)'],
                      ['trio', 'Trío (3)'],
                      ['quartet', 'Cuarteto (4)'],
                    ] as [RoomAccessType, string][]
                  ).map(([rt, label]) => (
                    <button
                      key={rt}
                      onClick={() =>
                        useExpandedScoreStore.setState({ roomAccessType: rt })
                      }
                      className={`py-1 rounded ${
                        score.roomAccessType === rt
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'bg-black/50 text-gray-400'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-gray-400">
                  Cupo máximo: <strong>{ROOM_CAPACITY_BY_TYPE[score.roomAccessType]}</strong>{' '}
                  participantes · Enlace/código: <code>{score.inviteCode}</code>
                </p>
              </div>

              <div className="bg-white/5 p-2.5 rounded-lg space-y-1.5">
                <p className="text-gray-300 font-bold">
                  Convocatorias y Temporadas de Ensayo
                </p>
                <div className="space-y-1.5 max-h-28 overflow-y-auto">
                  {score.seasonCalls.map((call) => (
                    <div
                      key={call.id}
                      className="flex items-center justify-between bg-black/40 p-1.5 rounded text-[10px]"
                    >
                      <div>
                        <p className="text-indigo-200 font-bold">{call.sessionTitle}</p>
                        <p className="text-gray-400">
                          {call.seasonTitle} · Cupo {call.enrolledCount}/{call.quotaMax}
                        </p>
                      </div>
                      <button
                        onClick={() => toggleSeasonCallEnrollment(call.id)}
                        className={`px-2 py-1 rounded ${
                          call.isEnrolled
                            ? 'bg-emerald-500/30 text-emerald-200'
                            : 'bg-indigo-500/30 text-indigo-200'
                        }`}
                      >
                        {call.isEnrolled ? '✔ Inscrito' : 'Inscribirse'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 p-2.5 rounded-lg space-y-1.5">
                <p className="text-gray-300 font-bold">
                  Grupos de Práctica Frecuentes
                </p>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {score.affinityGroups.map((grp) => (
                    <div
                      key={grp.id}
                      className="flex justify-between items-center bg-black/40 px-2 py-1 rounded text-[10px]"
                    >
                      <div>
                        <span className="text-emerald-300 font-bold">{grp.name}</span> ·{' '}
                        <span className="text-gray-400">{grp.focusTag}</span>
                      </div>
                      <span className="text-gray-400">
                        {grp.completedSessionsCount} sesiones
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-1.5 pt-1">
                  <input
                    type="text"
                    placeholder="Nuevo ensamble / micro-red…"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="flex-1 bg-black/60 border border-white/15 rounded px-2 py-1 text-[10px]"
                  />
                  <input
                    type="text"
                    placeholder="Afinidad (ej. Drone)"
                    value={newGroupFocus}
                    onChange={(e) => setNewGroupFocus(e.target.value)}
                    className="w-28 bg-black/60 border border-white/15 rounded px-2 py-1 text-[10px]"
                  />
                  <button
                    onClick={() => {
                      createAffinityGroup(newGroupName, newGroupFocus);
                      setNewGroupName('');
                      setNewGroupFocus('');
                    }}
                    className="bg-emerald-500/30 hover:bg-emerald-500/50 text-emerald-200 px-2 py-1 rounded text-[10px]"
                  >
                    + Crear
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
