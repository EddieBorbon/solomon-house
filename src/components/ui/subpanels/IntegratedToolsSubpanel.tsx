'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { useUIPanelStore, type UIModalId } from '../../../state/useUIPanelStore';
import {
  PARAMETRIC_LEVELS,
  usePedagogyStore,
  type ParametricLevel,
} from '../../../lib/pedagogy/parametricLevels';
import { usePostProcessingStore } from '../../world/PostProcessing';
import { useNotationGuidesStore } from '../../world/InfluenceGuides';
import { sonicGardener, useAgentCompanionStore } from '../../../lib/agents/SonicGardener';
import { useSessionRecorderStore, exportCasaSessionV2 } from '../../../lib/session/sessionRecorder';
import { useExpandedScoreStore } from '../../../lib/score/expandedScoreProtocol';
import { exportTopologicalScore } from '../../../lib/score/topologicalScore';
import { exportGraphicScore } from '../../../lib/score/graphicScore';
import { importTopologicalScoreFromFile } from '../../../lib/score/scoreInterpreter';
import { importSessionFromFileForReplay } from '../../../lib/session/sessionReplay';
import { xrStore } from '../../world/Experience';

export function IntegratedToolsSubpanel() {
  const { activeModal, toggleModal } = useUIPanelStore();
  const { level, setLevel } = usePedagogyStore();
  const fxEnabled = usePostProcessingStore((s) => s.enabled);
  const toggleFx = usePostProcessingStore((s) => s.toggle);
  const guidesEnabled = useNotationGuidesStore((s) => s.enabled);
  const toggleGuides = useNotationGuidesStore((s) => s.toggle);
  const agents = useAgentCompanionStore((s) => s.agents);
  const isRecording = useSessionRecorderStore((s) => s.isRecording);
  const sessionTimerRunning = useExpandedScoreStore((s) => s.sessionTimerRunning);

  const [pedagogyOpen, setPedagogyOpen] = useState(true);
  const [audioOpen, setAudioOpen] = useState(true);
  const [researchOpen, setResearchOpen] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const anyAgentActive = agents.some((a) => a.enabled);
  const currentLevelDef = PARAMETRIC_LEVELS[level];

  const handleToggleGardenerQuick = () => {
    if (anyAgentActive) {
      sonicGardener.stop();
    } else {
      sonicGardener.start();
    }
  };

  const handleImportScore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      await importSessionFromFileForReplay(file);
      toggleModal('session_e1');
    } catch {
      try {
        await importTopologicalScoreFromFile(file);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Error al importar archivo.');
      }
    }
  };

  const modalButtonClass = (id: UIModalId, activeColor = 'border-cyan-400 text-cyan-200 bg-cyan-950/40') =>
    `w-full text-left px-2 py-1.5 border font-mono text-[11px] transition-colors flex items-center justify-between ${
      activeModal === id
        ? activeColor
        : 'border-gray-700 bg-zinc-950 text-gray-200 hover:border-white hover:text-white'
    }`;

  return (
    <div className="space-y-4">
      {/* ================================================================= */}
      {/* 1. PEDAGOGÍA, PARTITURA EXPANDIDA Y JARDINEROS (E2 · E4 · 8.1-8.4) */}
      {/* ================================================================= */}
      <div className="relative border border-white p-3">
        <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white" />
        <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white" />
        <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white" />
        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white" />

        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-mono font-bold text-amber-300 tracking-wider">
            🎓 PEDAGOGÍA, PARTITURA Y AGENTES
          </h3>
          <button
            onClick={() => setPedagogyOpen(!pedagogyOpen)}
            className="border border-white px-2 py-0.5 text-[10px] font-mono text-white hover:bg-white hover:text-black"
          >
            {pedagogyOpen ? 'OCULTAR' : 'MOSTRAR'}
          </button>
        </div>

        {pedagogyOpen && (
          <div className="space-y-2">
            {/* Selector de Nivel N1-N4 integrado */}
            <div className="p-2 border border-amber-500/40 bg-amber-950/20">
              <label className="block text-[10px] font-mono text-amber-300 mb-1">
                Nivel Paramétrico Activo:
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(Number(e.target.value) as ParametricLevel)}
                className="w-full bg-black border border-amber-500/50 text-amber-200 text-xs font-mono px-2 py-1 focus:outline-none"
              >
                {Object.values(PARAMETRIC_LEVELS).map((def) => (
                  <option key={def.level} value={def.level} className="bg-black text-amber-200">
                    {def.name}
                  </option>
                ))}
              </select>
              <p className="text-[10px] font-mono text-gray-400 mt-1">
                {currentLevelDef.description}
              </p>
            </div>

            {/* Partitura Expandida E2 */}
            <button
              onClick={() => toggleModal('score_e2')}
              className={modalButtonClass(
                'score_e2',
                'border-indigo-400 text-indigo-200 bg-indigo-950/50'
              )}
            >
              <span>🎼 Partitura Expandida (E2)</span>
              <span className="text-[10px] text-indigo-300">
                {sessionTimerRunning ? '● EN CURSO' : 'Roles/Turnos ▸'}
              </span>
            </button>

            {/* Jardinero Sónico E4: interruptor rápido + panel */}
            <div className="flex gap-1">
              <button
                onClick={handleToggleGardenerQuick}
                className={`px-2 py-1.5 border font-mono text-[11px] transition-colors ${
                  anyAgentActive
                    ? 'border-emerald-400 bg-emerald-950/60 text-emerald-300 font-bold'
                    : 'border-gray-700 bg-zinc-950 text-gray-300 hover:border-white'
                }`}
                title="Activar/Desactivar rápido el Jardinero Sónico"
              >
                🌱 {anyAgentActive ? 'ON' : 'OFF'}
              </button>
              <button
                onClick={() => toggleModal('gardener_e4')}
                className={modalButtonClass(
                  'gardener_e4',
                  'border-emerald-400 text-emerald-200 bg-emerald-950/50'
                )}
              >
                <span>Compañero / Ensamble IA (E4)</span>
                <span className="text-[10px] text-emerald-300">Perfiles ▸</span>
              </button>
            </div>

            {/* Decálogo del Arquitecto, Examen y Tutor */}
            <div className="grid grid-cols-1 gap-1">
              <button
                onClick={() => toggleModal('curriculum')}
                className={modalButtonClass(
                  'curriculum',
                  'border-teal-400 text-teal-200 bg-teal-950/50'
                )}
              >
                <span>📚 Decálogo del Arquitecto</span>
                <span className="text-[10px] text-teal-300">10 Lecciones ▸</span>
              </button>
              <button
                onClick={() => toggleModal('exam')}
                className={modalButtonClass(
                  'exam',
                  'border-orange-400 text-orange-200 bg-orange-950/50'
                )}
              >
                <span>🎯 Examen Psicoacústico</span>
                <span className="text-[10px] text-orange-300">Binaural/FM ▸</span>
              </button>
              <button
                onClick={() => toggleModal('tutor')}
                className={modalButtonClass(
                  'tutor',
                  'border-emerald-400 text-emerald-200 bg-emerald-950/50'
                )}
              >
                <span>📊 Panel del Tutor</span>
                <span className="text-[10px] text-emerald-300">Métricas ▸</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================================================================= */}
      {/* 2. CALIBRACIÓN, ESCUCHA, MAPEO Y VISUALIZACIÓN (E3 · E5)          */}
      {/* ================================================================= */}
      <div className="relative border border-white p-3">
        <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white" />
        <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white" />
        <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white" />
        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white" />

        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-mono font-bold text-cyan-300 tracking-wider">
            🎚 CALIBRACIÓN, SÍNTESIS Y ESCENA
          </h3>
          <button
            onClick={() => setAudioOpen(!audioOpen)}
            className="border border-white px-2 py-0.5 text-[10px] font-mono text-white hover:bg-white hover:text-black"
          >
            {audioOpen ? 'OCULTAR' : 'MOSTRAR'}
          </button>
        </div>

        {audioOpen && (
          <div className="space-y-1.5">
            {/* Interruptores rápidos de escena: FX, Guías 3D, VR y AR */}
            <div className="grid grid-cols-2 gap-1 mb-1">
              <button
                onClick={toggleFx}
                className={`px-2 py-1 border font-mono text-[10px] transition-colors ${
                  fxEnabled
                    ? 'border-amber-400 bg-amber-950/40 text-amber-200 font-bold'
                    : 'border-gray-700 bg-zinc-950 text-gray-400 hover:text-white'
                }`}
              >
                ✨ FX: {fxEnabled ? 'ACTIVO' : 'OFF'}
              </button>
              <button
                onClick={toggleGuides}
                className={`px-2 py-1 border font-mono text-[10px] transition-colors ${
                  guidesEnabled
                    ? 'border-purple-400 bg-purple-950/40 text-purple-200 font-bold'
                    : 'border-gray-700 bg-zinc-950 text-gray-400 hover:text-white'
                }`}
              >
                〰 Guías 3D: {guidesEnabled ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1 mb-1">
              <button
                onClick={() => xrStore.enterVR().catch(() => {})}
                className="px-2 py-1 border border-violet-500/40 bg-violet-950/20 font-mono text-[10px] text-violet-200 hover:bg-violet-900/40"
              >
                🥽 Modo WebXR VR
              </button>
              <button
                onClick={() => xrStore.enterAR().catch(() => {})}
                className="px-2 py-1 border border-fuchsia-500/40 bg-fuchsia-950/20 font-mono text-[10px] text-fuchsia-200 hover:bg-fuchsia-900/40"
              >
                📲 Passthrough AR
              </button>
            </div>

            <button
              onClick={() => toggleModal('calibrator')}
              className={modalButtonClass('calibrator')}
            >
              <span>🎚 Calibración Acústica</span>
              <span className="text-[10px] text-cyan-300">Tonos 3D ▸</span>
            </button>

            <button
              onClick={() => toggleModal('hrtf_e5')}
              className={modalButtonClass('hrtf_e5')}
            >
              <span>👂 Escucha · Csound · HRTF (E5)</span>
              <span className="text-[10px] text-cyan-300">DSP/SOFA ▸</span>
            </button>

            <button
              onClick={() => toggleModal('coherence_e3')}
              className={modalButtonClass(
                'coherence_e3',
                'border-amber-400 text-amber-200 bg-amber-950/50'
              )}
            >
              <span>🔷 Coherencia Visual-Sonora (E3)</span>
              <span className="text-[10px] text-amber-300">Morfología ▸</span>
            </button>

            <button
              onClick={() => toggleModal('mapping')}
              className={modalButtonClass(
                'mapping',
                'border-yellow-400 text-yellow-200 bg-yellow-950/50'
              )}
            >
              <span>🔗 Mapeo Paramétrico</span>
              <span className="text-[10px] text-yellow-300">Curvas ▸</span>
            </button>
          </div>
        )}
      </div>

      {/* ================================================================= */}
      {/* 3. INVESTIGACIÓN, ARCHIVO, COMUNIDAD Y PROYECCIÓN (E1·E6·E7·E8)   */}
      {/* ================================================================= */}
      <div className="relative border border-white p-3">
        <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white" />
        <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white" />
        <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white" />
        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white" />

        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-mono font-bold text-purple-300 tracking-wider">
            ⏺ SESIÓN, ARCHIVO Y RED (E1–E8)
          </h3>
          <button
            onClick={() => setResearchOpen(!researchOpen)}
            className="border border-white px-2 py-0.5 text-[10px] font-mono text-white hover:bg-white hover:text-black"
          >
            {researchOpen ? 'OCULTAR' : 'MOSTRAR'}
          </button>
        </div>

        {researchOpen && (
          <div className="space-y-1.5">
            <button
              onClick={() => toggleModal('session_e1')}
              className={modalButtonClass(
                'session_e1',
                'border-purple-400 text-purple-200 bg-purple-950/50'
              )}
            >
              <span>⏺ Sesión y Tesis (E1)</span>
              <span className={`text-[10px] ${isRecording ? 'text-red-400 font-bold animate-pulse' : 'text-purple-300'}`}>
                {isRecording ? '● GRABANDO' : 'Replay/SVG ▸'}
              </span>
            </button>

            {/* Exportación rápida de partituras y sesiones */}
            <div className="grid grid-cols-4 gap-1 pt-0.5 pb-1">
              <button
                onClick={() => exportCasaSessionV2()}
                className="border border-gray-700 bg-zinc-950 py-1 font-mono text-[10px] text-purple-300 hover:border-purple-400"
                title="Exportar sesión completa .casa.json v2"
              >
                ⬇ .casa
              </button>
              <button
                onClick={() => exportTopologicalScore()}
                className="border border-gray-700 bg-zinc-950 py-1 font-mono text-[10px] text-purple-300 hover:border-purple-400"
                title="Exportar partitura topológica JSON"
              >
                ⬇ JSON
              </button>
              <button
                onClick={() => exportGraphicScore()}
                className="border border-gray-700 bg-zinc-950 py-1 font-mono text-[10px] text-purple-300 hover:border-purple-400"
                title="Exportar partitura gráfica vectorial SVG"
              >
                ⬇ SVG
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="border border-gray-700 bg-zinc-950 py-1 font-mono text-[10px] text-purple-300 hover:border-purple-400"
                title="Importar sesión .casa.json o partitura"
              >
                ⬆ Cargar
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json,.casa.json"
                className="hidden"
                onChange={handleImportScore}
              />
            </div>

            <button
              onClick={() => toggleModal('gallery_e6')}
              className={modalButtonClass(
                'gallery_e6',
                'border-fuchsia-400 text-fuchsia-200 bg-fuchsia-950/50'
              )}
            >
              <span>🖼 Archivo y Concierto (E6)</span>
              <span className="text-[10px] text-fuchsia-300">Fork/Stems ▸</span>
            </button>

            <button
              onClick={() => toggleModal('community_e7')}
              className={modalButtonClass(
                'community_e7',
                'border-teal-400 text-teal-200 bg-teal-950/50'
              )}
            >
              <span>🤝 Comunidad y Live Coding (E7)</span>
              <span className="text-[10px] text-teal-300">MIDI/OSC/LAN ▸</span>
            </button>

            <button
              onClick={() => toggleModal('future_e8')}
              className={modalButtonClass(
                'future_e8',
                'border-fuchsia-400 text-fuchsia-200 bg-fuchsia-950/50'
              )}
            >
              <span>🚀 XR · IA RAVE/MLP · Federación (E8)</span>
              <span className="text-[10px] text-fuchsia-300">Integración ▸</span>
            </button>

            <div className="grid grid-cols-2 gap-1 pt-1">
              <Link
                href="/galeria"
                className="border border-gray-700 bg-zinc-950 py-1 text-center font-mono text-[10px] text-cyan-300 hover:border-cyan-400"
              >
                🏛 Ir a /galeria ↗
              </Link>
              <Link
                href="/apoyo"
                className="border border-gray-700 bg-zinc-950 py-1 text-center font-mono text-[10px] text-pink-300 hover:border-pink-400"
              >
                ♥ Sostener (/apoyo) ↗
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
