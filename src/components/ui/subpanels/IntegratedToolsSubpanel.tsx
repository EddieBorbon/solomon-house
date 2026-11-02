'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../../contexts/LanguageContext';
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
import { useFutureProjectionStore } from '../../../lib/future/futureProjection';

export function IntegratedToolsSubpanel() {
  const { t } = useLanguage();
  const { activeModal, toggleModal } = useUIPanelStore();
  const { level, setLevel } = usePedagogyStore();
  const fxEnabled = usePostProcessingStore((s) => s.enabled);
  const toggleFx = usePostProcessingStore((s) => s.toggle);
  const guidesEnabled = useNotationGuidesStore((s) => s.enabled);
  const toggleGuides = useNotationGuidesStore((s) => s.toggle);
  const agents = useAgentCompanionStore((s) => s.agents);
  const isRecording = useSessionRecorderStore((s) => s.isRecording);
  const sessionTimerRunning = useExpandedScoreStore((s) => s.sessionTimerRunning);
  const passthroughArEnabled = useFutureProjectionStore((s) => s.passthroughArEnabled);

  const [pedagogyOpen, setPedagogyOpen] = useState(true);
  const [visualAudioOpen, setVisualAudioOpen] = useState(true);
  const [studioOpen, setStudioOpen] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const anyAgentActive = agents.some((a) => a.enabled);

  const levelNameMap: Record<ParametricLevel, string> = {
    1: t('integratedTools.level1Name'),
    2: t('integratedTools.level2Name'),
    3: t('integratedTools.level3Name'),
    4: t('integratedTools.level4Name'),
  };
  const levelDescMap: Record<ParametricLevel, string> = {
    1: t('integratedTools.level1Desc'),
    2: t('integratedTools.level2Desc'),
    3: t('integratedTools.level3Desc'),
    4: t('integratedTools.level4Desc'),
  };

  const handleEnterVR = async () => {
    try {
      const supported =
        typeof navigator !== 'undefined' &&
        'xr' in navigator &&
        (await navigator.xr?.isSessionSupported('immersive-vr'));
      if (supported) {
        await xrStore.enterVR();
      } else {
        toggleModal('future_e8');
      }
    } catch {
      toggleModal('future_e8');
    }
  };

  const handleEnterAR = async () => {
    const next = !passthroughArEnabled;
    useFutureProjectionStore.setState({ passthroughArEnabled: next });
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
        // Permanece en modo de fondo transparente en pantalla
      }
    }
  };

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
        alert(error instanceof Error ? error.message : 'Error al abrir el archivo.');
      }
    }
  };

  const renderToolItem = (
    id: UIModalId,
    title: string,
    subtitle: string,
    badge?: string,
    activeClass = 'border-cyan-400 text-cyan-200 bg-cyan-950/40'
  ) => (
    <button
      onClick={() => toggleModal(id)}
      className={`w-full text-left p-2 border font-mono transition-colors ${
        activeModal === id
          ? activeClass
          : 'border-gray-700 bg-zinc-950 text-gray-200 hover:border-white hover:text-white'
      }`}
    >
      <div className="flex items-center justify-between text-[11px] font-bold">
        <span>{title}</span>
        <span className="text-[10px] opacity-80">{badge ?? t('integratedTools.openAction')}</span>
      </div>
      <p className="text-[10px] text-gray-400 mt-0.5 leading-snug font-normal">{subtitle}</p>
    </button>
  );

  return (
    <div className="space-y-4">
      {/* ================================================================= */}
      {/* 1. APRENDIZAJE, MODO DE CONTROLES Y ACOMPAÑANTE AUTOMÁTICO        */}
      {/* ================================================================= */}
      <div className="relative border border-white p-3">
        <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white" />
        <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white" />
        <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white" />
        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white" />

        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-mono font-bold text-amber-300 tracking-wider">
            {t('integratedTools.learningTitle')}
          </h3>
          <button
            onClick={() => setPedagogyOpen(!pedagogyOpen)}
            className="border border-white px-2 py-0.5 text-[10px] font-mono text-white hover:bg-white hover:text-black"
          >
            {pedagogyOpen ? t('controls.hide') : t('controls.show')}
          </button>
        </div>

        {pedagogyOpen && (
          <div className="space-y-2">
            {/* Selector de Complejidad explicado con claridad */}
            <div className="p-2 border border-amber-500/40 bg-amber-950/20">
              <label className="block text-[11px] font-mono font-bold text-amber-300 mb-0.5">
                {t('integratedTools.howManyControls')}
              </label>
              <p className="text-[10px] font-mono text-gray-300 mb-1.5 leading-snug">
                {t('integratedTools.howManyControlsDesc')}
              </p>
              <select
                value={level}
                onChange={(e) => setLevel(Number(e.target.value) as ParametricLevel)}
                className="w-full bg-black border border-amber-500/50 text-amber-200 text-xs font-mono px-2 py-1.5 focus:outline-none"
              >
                {Object.values(PARAMETRIC_LEVELS).map((def) => (
                  <option key={def.level} value={def.level} className="bg-black text-amber-200">
                    {levelNameMap[def.level]}
                  </option>
                ))}
              </select>
              <p className="text-[10px] font-mono text-amber-200/80 mt-1.5 leading-snug">
                💡 {levelDescMap[level]}
              </p>
            </div>

            {/* Jardinero Sónico (Músico acompañante automático) */}
            <div className="p-2 border border-emerald-500/40 bg-emerald-950/15 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-emerald-300">
                  {t('integratedTools.companionTitle')}
                </span>
                <button
                  onClick={handleToggleGardenerQuick}
                  className={`px-2 py-0.5 border font-mono text-[10px] transition-colors ${
                    anyAgentActive
                      ? 'border-emerald-400 bg-emerald-500 text-black font-bold'
                      : 'border-gray-600 bg-black text-gray-300 hover:border-white'
                  }`}
                >
                  {anyAgentActive ? t('integratedTools.companionOn') : t('integratedTools.companionOff')}
                </button>
              </div>
              <p className="text-[10px] font-mono text-gray-400 leading-snug">
                {t('integratedTools.companionDesc')}
              </p>
              <button
                onClick={() => toggleModal('gardener_e4')}
                className="w-full text-left px-2 py-1 border border-emerald-500/40 bg-black/60 font-mono text-[10px] text-emerald-200 hover:bg-emerald-950/60 flex items-center justify-between"
              >
                <span>{t('integratedTools.companionConfig')}</span>
                <span>{t('integratedTools.openAction')}</span>
              </button>
            </div>

            {renderToolItem(
              'score_e2',
              t('integratedTools.rolesTitle'),
              t('integratedTools.rolesDesc'),
              sessionTimerRunning ? t('integratedTools.inProgress') : t('integratedTools.openAction'),
              'border-indigo-400 text-indigo-200 bg-indigo-950/50'
            )}

            {renderToolItem(
              'curriculum',
              t('integratedTools.guideTitle'),
              t('integratedTools.guideDesc'),
              t('integratedTools.readAction'),
              'border-teal-400 text-teal-200 bg-teal-950/50'
            )}

            {renderToolItem(
              'exam',
              t('integratedTools.earTrainingTitle'),
              t('integratedTools.earTrainingDesc'),
              t('integratedTools.playAction'),
              'border-orange-400 text-orange-200 bg-orange-950/50'
            )}

            {renderToolItem(
              'tutor',
              t('integratedTools.progressTitle'),
              t('integratedTools.progressDesc'),
              t('integratedTools.viewAction'),
              'border-emerald-400 text-emerald-200 bg-emerald-950/50'
            )}
          </div>
        )}
      </div>

      {/* ================================================================= */}
      {/* 2. VISTA DEL MAPA 3D, REALIDAD VIRTUAL Y AJUSTES DE SONIDO        */}
      {/* ================================================================= */}
      <div className="relative border border-white p-3">
        <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white" />
        <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white" />
        <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white" />
        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white" />

        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-mono font-bold text-cyan-300 tracking-wider">
            {t('integratedTools.viewAndSoundTitle')}
          </h3>
          <button
            onClick={() => setVisualAudioOpen(!visualAudioOpen)}
            className="border border-white px-2 py-0.5 text-[10px] font-mono text-white hover:bg-white hover:text-black"
          >
            {visualAudioOpen ? t('controls.hide') : t('controls.show')}
          </button>
        </div>

        {visualAudioOpen && (
          <div className="space-y-2">
            {/* Explicación clara de los controles visuales del mapa */}
            <div className="p-2 border border-gray-700 bg-zinc-950 space-y-2">
              <div className="text-[10px] font-mono font-bold text-gray-200">
                {t('integratedTools.visualOptionsTitle')}
              </div>

              {/* Círculos de alcance sonoro en el suelo */}
              <div className="flex items-start justify-between gap-2 border-t border-gray-800 pt-1.5">
                <div className="text-[10px] font-mono">
                  <div className="text-purple-200 font-bold">{t('integratedTools.floorCirclesTitle')}</div>
                  <div className="text-gray-400 leading-snug">
                    {t('integratedTools.floorCirclesDesc')}
                  </div>
                </div>
                <button
                  onClick={toggleGuides}
                  className={`shrink-0 px-2 py-1 border font-mono text-[10px] ${
                    guidesEnabled
                      ? 'border-purple-400 bg-purple-500 text-black font-bold'
                      : 'border-gray-600 bg-black text-gray-300 hover:border-white'
                  }`}
                >
                  {guidesEnabled ? t('gridsSubpanel.visible').toUpperCase() : t('gridsSubpanel.hidden').toUpperCase()}
                </button>
              </div>

              {/* Brillo suave y viñeta */}
              <div className="flex items-start justify-between gap-2 border-t border-gray-800 pt-1.5">
                <div className="text-[10px] font-mono">
                  <div className="text-amber-200 font-bold">{t('integratedTools.bloomTitle')}</div>
                  <div className="text-gray-400 leading-snug">
                    {t('integratedTools.bloomDesc')}
                  </div>
                </div>
                <button
                  onClick={toggleFx}
                  className={`shrink-0 px-2 py-1 border font-mono text-[10px] ${
                    fxEnabled
                      ? 'border-amber-400 bg-amber-400 text-black font-bold'
                      : 'border-gray-600 bg-black text-gray-300 hover:border-white'
                  }`}
                >
                  {fxEnabled ? t('integratedTools.on') : t('integratedTools.off')}
                </button>
              </div>

              {/* Realidad Virtual (VR) y Fondo Transparente (AR) */}
              <div className="border-t border-gray-800 pt-1.5 space-y-1">
                <div className="text-[10px] font-mono text-gray-300 font-bold">
                  {t('integratedTools.vrCameraTitle')}
                </div>
                <p className="text-[10px] font-mono text-gray-400 leading-snug">
                  {t('integratedTools.vrCameraDesc')}
                </p>
                <div className="grid grid-cols-2 gap-1 pt-0.5">
                  <button
                    onClick={handleEnterVR}
                    className="px-2 py-1 border border-violet-500/40 bg-violet-950/30 font-mono text-[10px] text-violet-200 hover:bg-violet-900/50"
                  >
                    {t('integratedTools.vrHeadset')}
                  </button>
                  <button
                    onClick={handleEnterAR}
                    className={`px-2 py-1 border font-mono text-[10px] transition-colors ${
                      passthroughArEnabled
                        ? 'border-fuchsia-400 bg-fuchsia-500 text-black font-bold'
                        : 'border-fuchsia-500/40 bg-fuchsia-950/30 text-fuchsia-200 hover:bg-fuchsia-900/50'
                    }`}
                  >
                    {t('integratedTools.transparentBg')}: {passthroughArEnabled ? t('integratedTools.yes') : t('integratedTools.no')}
                  </button>
                </div>
              </div>
            </div>

            {renderToolItem(
              'calibrator',
              t('integratedTools.calibratorTitle'),
              t('integratedTools.calibratorDesc')
            )}

            {renderToolItem(
              'hrtf_e5',
              t('integratedTools.hrtfTitle'),
              t('integratedTools.hrtfDesc')
            )}

            {renderToolItem(
              'coherence_e3',
              t('integratedTools.coherenceTitle'),
              t('integratedTools.coherenceDesc'),
              t('integratedTools.viewAction'),
              'border-amber-400 text-amber-200 bg-amber-950/50'
            )}

            {renderToolItem(
              'mapping',
              t('integratedTools.mappingTitle'),
              t('integratedTools.mappingDesc'),
              t('integratedTools.configAction'),
              'border-yellow-400 text-yellow-200 bg-yellow-950/50'
            )}
          </div>
        )}
      </div>

      {/* ================================================================= */}
      {/* 3. GRABAR SESIÓN, GALERÍA DE OBRAS Y CONEXIÓN EXTERNA             */}
      {/* ================================================================= */}
      <div className="relative border border-white p-3">
        <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-white" />
        <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-white" />
        <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-white" />
        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-white" />

        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-mono font-bold text-purple-300 tracking-wider">
            {t('integratedTools.studioTitle')}
          </h3>
          <button
            onClick={() => setStudioOpen(!studioOpen)}
            className="border border-white px-2 py-0.5 text-[10px] font-mono text-white hover:bg-white hover:text-black"
          >
            {studioOpen ? t('controls.hide') : t('controls.show')}
          </button>
        </div>

        {studioOpen && (
          <div className="space-y-2">
            {renderToolItem(
              'session_e1',
              t('integratedTools.sessionTitle'),
              t('integratedTools.sessionDesc'),
              isRecording ? t('integratedTools.recording') : t('integratedTools.openAction'),
              'border-rose-400 text-rose-200 bg-rose-950/50'
            )}

            {renderToolItem(
              'gallery_e6',
              t('integratedTools.galleryTitle'),
              t('integratedTools.galleryDesc'),
              t('integratedTools.openAction'),
              'border-purple-400 text-purple-200 bg-purple-950/50'
            )}

            {renderToolItem(
              'community_e7',
              t('integratedTools.communityTitle'),
              t('integratedTools.communityDesc'),
              t('integratedTools.openAction'),
              'border-emerald-400 text-emerald-200 bg-emerald-950/50'
            )}

            {renderToolItem(
              'future_e8',
              t('integratedTools.futureTitle'),
              t('integratedTools.futureDesc'),
              t('integratedTools.openAction'),
              'border-fuchsia-400 text-fuchsia-200 bg-fuchsia-950/50'
            )}

            {/* Descarga rápida de archivos de tu escena */}
            <div className="pt-2 border-t border-gray-800 space-y-1">
              <div className="text-[10px] font-mono font-bold text-gray-200">
                {t('integratedTools.filesTitle')}
              </div>
              <p className="text-[10px] font-mono text-gray-400 leading-snug">
                {t('integratedTools.filesDesc')}
              </p>
              <div className="grid grid-cols-2 gap-1 pt-0.5">
                <button
                  onClick={() => exportCasaSessionV2()}
                  className="px-2 py-1 border border-rose-500/40 bg-rose-950/30 text-rose-200 font-mono text-[10px] hover:bg-rose-900/50"
                >
                  {t('integratedTools.saveSession')}
                </button>
                <button
                  onClick={() => exportTopologicalScore()}
                  className="px-2 py-1 border border-cyan-500/40 bg-cyan-950/30 text-cyan-200 font-mono text-[10px] hover:bg-cyan-900/50"
                >
                  {t('integratedTools.saveMap')}
                </button>
                <button
                  onClick={() => exportGraphicScore()}
                  className="px-2 py-1 border border-purple-500/40 bg-purple-950/30 text-purple-200 font-mono text-[10px] hover:bg-purple-900/50"
                >
                  {t('integratedTools.drawSvg')}
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2 py-1 border border-amber-500/40 bg-amber-950/30 text-amber-200 font-mono text-[10px] hover:bg-amber-900/50"
                >
                  {t('integratedTools.openFile')}
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.casa.json,application/json"
                onChange={handleImportScore}
                className="hidden"
              />
            </div>

            {/* Enlaces directos a Galería y Apoyo */}
            <div className="grid grid-cols-2 gap-1 pt-1">
              <Link
                href="/galeria"
                className="text-center px-2 py-1.5 border border-purple-500/40 bg-purple-950/20 font-mono text-[10px] text-purple-300 hover:bg-purple-900/40"
              >
                {t('integratedTools.viewWebGallery')}
              </Link>
              <Link
                href="/apoyo"
                className="text-center px-2 py-1.5 border border-pink-500/40 bg-pink-950/20 font-mono text-[10px] text-pink-300 hover:bg-pink-900/40"
              >
                {t('integratedTools.supportProject')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
