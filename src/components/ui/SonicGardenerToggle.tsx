'use client';

import React, { useState, useEffect } from 'react';
import {
  sonicGardener,
  useAgentCompanionStore,
  AGENT_PROFILE_LABELS,
  AGENT_LAYER_LABELS,
  applyDirectorProposal,
  captureComparativeSessionSnapshot,
  exportComparativeAgencyReportJson,
  type AgentBehaviorProfile,
} from '../../lib/agents/SonicGardener';
import { type CompositionalLayer } from '../../lib/session/sessionRecorder';
import { useUIPanelStore } from '../../state/useUIPanelStore';

export function SonicGardenerToggle() {
  const activeModal = useUIPanelStore((s) => s.activeModal);
  const closeModal = useUIPanelStore((s) => s.closeModal);
  const openModal = activeModal === 'gardener_e4';
  const [activeTab, setActiveTab] = useState<'agents' | 'director' | 'compare'>('agents');

  const companion = useAgentCompanionStore();
  const anyActive = companion.agents.some((a) => a.enabled);

  useEffect(() => {
    return () => sonicGardener.stop();
  }, []);

  const handleQuickToggle = () => {
    if (anyActive) {
      sonicGardener.stop();
    } else {
      sonicGardener.start();
    }
  };

  const toggleSingleAgent = (agentId: string) => {
    useAgentCompanionStore.setState((s) => ({
      agents: s.agents.map((a) =>
        a.id === agentId
          ? {
              ...a,
              enabled: !a.enabled,
              currentIntention: !a.enabled
                ? 'Despierto: escuchando la textura de la sala.'
                : 'En reposo.',
            }
          : a
      ),
    }));
    sonicGardener.ensureTimer();
  };

  const setAgentProfile = (agentId: string, profile: AgentBehaviorProfile) => {
    useAgentCompanionStore.setState((s) => ({
      agents: s.agents.map((a) => (a.id === agentId ? { ...a, profile } : a)),
    }));
  };

  const setAgentIntervention = (agentId: string, rate: number) => {
    useAgentCompanionStore.setState((s) => ({
      agents: s.agents.map((a) =>
        a.id === agentId ? { ...a, interventionRate: rate } : a
      ),
    }));
  };

  const toggleAgentLayer = (agentId: string, layer: CompositionalLayer) => {
    useAgentCompanionStore.setState((s) => ({
      agents: s.agents.map((a) => {
        if (a.id !== agentId) return a;
        const exists = a.allowedLayers.includes(layer);
        const nextLayers = exists
          ? a.allowedLayers.filter((l) => l !== layer)
          : [...a.allowedLayers, layer];
        return {
          ...a,
          allowedLayers: nextLayers.length > 0 ? nextLayers : ['texture'],
        };
      }),
    }));
  };

  return (
    <>
      {openModal && (
        <div className="fixed top-14 left-[21rem] z-50 w-[460px] max-w-[94vw] rounded-2xl border border-emerald-500/40 bg-neutral-950/95 p-4 text-xs text-neutral-200 shadow-2xl backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Músicos Acompañantes Automáticos (Jardineros Sónicos)
              </h3>
              <p className="text-[11px] text-neutral-400">
                Configura cómo te acompañan, si imitan tus ideas o hacen contrapunto
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleQuickToggle}
                className={`rounded-lg px-2.5 py-1 font-mono text-[10px] border transition-colors ${
                  anyActive
                    ? 'border-emerald-500/60 bg-emerald-950/50 text-emerald-300'
                    : 'border-white/15 text-gray-300 hover:text-white'
                }`}
              >
                🌱 {anyActive ? 'Pausar Todos' : 'Encender Acompañante'}
              </button>
              <button
                onClick={closeModal}
                className="rounded-lg px-2 py-1 text-neutral-400 hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="mb-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 p-2 text-[10px] text-emerald-100 leading-snug">
            💡 <strong>¿Cómo funciona?</strong> Al activar un Jardinero, este escucha las notas y figuras que pones en el mapa y cada pocos segundos añade o mueve sus propias figuras para acompañarte.
          </div>

          {/* Barra de estado de escucha del sistema */}
          <div className="mb-3 grid grid-cols-3 gap-2 rounded-xl border border-white/10 bg-white/5 p-2 text-center text-[10px]">
            <div>
              <div className="text-neutral-400">Tu actividad reciente</div>
              <div className="font-mono font-semibold text-emerald-300">
                {companion.recentHumanGestureRatePerMin} acciones/min
              </div>
            </div>
            <div>
              <div className="text-neutral-400">Ideas tuyas recordadas</div>
              <div className="font-mono font-semibold text-amber-300">
                {companion.shortTermMotifMemory.length} motivos
              </div>
            </div>
            <div>
              <div className="text-neutral-400">Hacia dónde caminas</div>
              <div className="font-mono font-semibold text-cyan-300">
                [{companion.predictedListenerTarget.join(', ')}]
              </div>
            </div>
          </div>

          {/* Botón de Ensamble Mínimo y Reglas */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={() =>
                sonicGardener.enableMinimumEnsembleMode(!companion.minimumEnsembleMode)
              }
              className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition ${
                companion.minimumEnsembleMode
                  ? 'bg-emerald-600 text-white'
                  : 'border border-emerald-500/40 bg-emerald-950/40 text-emerald-200 hover:bg-emerald-900/50'
              }`}
            >
              {companion.minimumEnsembleMode
                ? 'Modo Trío (Tú + 2 Acompañantes): ACTIVO'
                : 'Activar Modo Trío (Tú + 2 Acompañantes)'}
            </button>

            <label className="flex items-center gap-1.5 text-[11px] text-neutral-300">
              <input
                type="checkbox"
                checked={companion.respectScoreRulesE2}
                onChange={(e) =>
                  useAgentCompanionStore.setState({
                    respectScoreRulesE2: e.target.checked,
                  })
                }
              />
              <span>Respetar turnos de la sala</span>
            </label>
          </div>

          {/* Pestañas */}
          <div className="mb-3 flex gap-1 rounded-lg bg-white/5 p-1">
            {(
              [
                ['agents', 'Acompañantes'],
                ['director', 'Sugerencias'],
                ['compare', 'Comparar Sesiones'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 rounded-md py-1.5 text-[11px] font-medium transition ${
                  activeTab === id
                    ? 'bg-emerald-600 text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* PESTAÑA 1: AGENTES, INTENCIONES Y CONTROLES DE AGENCIA */}
          {activeTab === 'agents' && (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {companion.agents.map((agent) => (
                <div
                  key={agent.id}
                  className={`rounded-xl border p-2.5 ${
                    agent.enabled
                      ? 'border-emerald-500/40 bg-emerald-950/20'
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{agent.name}</span>
                    <button
                      onClick={() => toggleSingleAgent(agent.id)}
                      className={`rounded px-2.5 py-0.5 text-[10px] font-semibold ${
                        agent.enabled
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white/10 text-neutral-300 hover:bg-white/20'
                      }`}
                    >
                      {agent.enabled ? 'Activo' : 'Activar'}
                    </button>
                  </div>

                  {/* Intención declarada en vivo */}
                  <div className="mt-1.5 rounded bg-black/50 px-2 py-1 text-[10px] text-emerald-200">
                    <strong>Qué está haciendo:</strong> {agent.currentIntention}
                  </div>

                  {/* Selector de perfil */}
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-neutral-400">
                        Estilo musical
                      </label>
                      <select
                        value={agent.profile}
                        onChange={(e) =>
                          setAgentProfile(agent.id, e.target.value as AgentBehaviorProfile)
                        }
                        className="mt-0.5 w-full rounded border border-white/15 bg-black px-2 py-1 text-[10px] text-white"
                      >
                        {(Object.keys(AGENT_PROFILE_LABELS) as AgentBehaviorProfile[]).map(
                          (prof) => (
                            <option key={prof} value={prof}>
                              {AGENT_PROFILE_LABELS[prof].name}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-400">
                        Frecuencia de acción: {Math.round(agent.interventionRate * 100)}%
                      </label>
                      <input
                        type="range"
                        min={0.1}
                        max={1}
                        step={0.05}
                        value={agent.interventionRate}
                        onChange={(e) =>
                          setAgentIntervention(agent.id, Number(e.target.value))
                        }
                        className="mt-1.5 w-full accent-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Capas compositivas permitidas */}
                  <div className="mt-2 flex flex-wrap items-center gap-1">
                    <span className="text-[10px] text-neutral-400 mr-1">Capas:</span>
                    {(['texture', 'gesture', 'spatial', 'general'] as CompositionalLayer[]).map(
                      (layer) => {
                        const active = agent.allowedLayers.includes(layer);
                        return (
                          <button
                            key={layer}
                            onClick={() => toggleAgentLayer(agent.id, layer)}
                            className={`rounded px-1.5 py-0.5 text-[9px] ${
                              active
                                ? 'bg-emerald-700 text-white'
                                : 'bg-black/40 text-neutral-400'
                            }`}
                          >
                            {AGENT_LAYER_LABELS[layer].split(' ')[0]}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PESTAÑA 2: AGENTE DIRECTOR */}
          {activeTab === 'director' && (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-[11px]">
                  <input
                    type="checkbox"
                    checked={companion.directorAgentEnabled}
                    onChange={(e) =>
                      useAgentCompanionStore.setState({
                        directorAgentEnabled: e.target.checked,
                      })
                    }
                  />
                  <span>Agente Director activo (sugiere cambios de fase y nivel)</span>
                </label>
                <button
                  onClick={() => sonicGardener.evaluateDirectorProposal()}
                  className="rounded bg-emerald-700 px-2.5 py-1 text-[10px] font-medium text-white hover:bg-emerald-600"
                >
                  Evaluar sala ahora
                </button>
              </div>

              {companion.directorProposals.length === 0 ? (
                <p className="text-[11px] text-neutral-400">
                  El Director observará cuántos objetos hay en la sala y te sugerirá cuándo pasar a la siguiente etapa o activar más herramientas.
                </p>
              ) : (
                <div className="space-y-2">
                  {companion.directorProposals.map((prop) => (
                    <div
                      key={prop.id}
                      className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-2.5"
                    >
                      <div className="text-[11px] text-neutral-200">{prop.rationale}</div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[10px] text-neutral-400">
                          {prop.suggestedPhase
                            ? `Etapa sugerida: ${prop.suggestedPhase.toUpperCase()}`
                            : `Modo sugerido: Modo ${prop.suggestedLevel}`}
                        </span>
                        {prop.applied ? (
                          <span className="text-[10px] font-semibold text-emerald-400">
                            ✓ Aplicada
                          </span>
                        ) : (
                          <button
                            onClick={() => applyDirectorProposal(prop.id)}
                            className="rounded bg-emerald-600 px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-emerald-500"
                          >
                            Aceptar propuesta
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PESTAÑA 3: COMPARATIVA CON Y SIN AGENTE */}
          {activeTab === 'compare' && (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              <p className="text-[11px] text-neutral-300">
                Guarda fotografías del estado de tu sesión cuando tocas a solas y cuando tocas con el acompañante para comparar los resultados.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => captureComparativeSessionSnapshot('without_agent')}
                  className="flex-1 rounded-lg border border-white/15 bg-white/5 py-1.5 text-[11px] hover:bg-white/10"
                >
                  + Capturar Sin Agente
                </button>
                <button
                  onClick={() => captureComparativeSessionSnapshot('with_agent')}
                  className="flex-1 rounded-lg bg-emerald-600 py-1.5 text-[11px] font-medium text-white hover:bg-emerald-500"
                >
                  + Capturar Con Agente
                </button>
              </div>

              {companion.comparativeRuns.length > 0 && (
                <div className="overflow-x-auto rounded-xl border border-white/10">
                  <table className="w-full text-left text-[10px]">
                    <thead className="bg-white/5 text-neutral-300">
                      <tr>
                        <th className="p-1.5">Condición</th>
                        <th className="p-1.5">Hum / Ag</th>
                        <th className="p-1.5">Densidad</th>
                        <th className="p-1.5">Centroide</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {companion.comparativeRuns.map((r) => (
                        <tr key={r.id}>
                          <td className="p-1.5 font-medium text-emerald-300">{r.label}</td>
                          <td className="p-1.5 font-mono">
                            {Math.round(r.humanRatio * 100)}% / {Math.round(r.agentRatio * 100)}%
                          </td>
                          <td className="p-1.5 font-mono">{r.meanDensity}</td>
                          <td className="p-1.5 font-mono">{r.meanSpectralCentroidHz} Hz</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <button
                onClick={() => exportComparativeAgencyReportJson()}
                disabled={companion.comparativeRuns.length === 0}
                className="w-full rounded-lg border border-emerald-500/40 bg-emerald-950/50 py-1.5 text-[11px] font-medium text-emerald-200 hover:bg-emerald-900/60 disabled:opacity-40"
              >
                Descargar comparativa (JSON)
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
