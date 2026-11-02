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
import { useFutureProjectionStore } from '../../../lib/future/futureProjection';

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
  const passthroughArEnabled = useFutureProjectionStore((s) => s.passthroughArEnabled);

  const [pedagogyOpen, setPedagogyOpen] = useState(true);
  const [visualAudioOpen, setVisualAudioOpen] = useState(true);
  const [studioOpen, setStudioOpen] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const anyAgentActive = agents.some((a) => a.enabled);
  const currentLevelDef = PARAMETRIC_LEVELS[level];

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
        <span className="text-[10px] opacity-80">{badge ?? 'Abrir ▸'}</span>
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
            🎓 APRENDIZAJE Y ACOMPAÑANTE
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
            {/* Selector de Complejidad explicado con claridad */}
            <div className="p-2 border border-amber-500/40 bg-amber-950/20">
              <label className="block text-[11px] font-mono font-bold text-amber-300 mb-0.5">
                ¿Cuántos controles quieres ver?
              </label>
              <p className="text-[10px] font-mono text-gray-300 mb-1.5 leading-snug">
                Elige un modo sencillo para aprender paso a paso o el estudio completo con todas las opciones:
              </p>
              <select
                value={level}
                onChange={(e) => setLevel(Number(e.target.value) as ParametricLevel)}
                className="w-full bg-black border border-amber-500/50 text-amber-200 text-xs font-mono px-2 py-1.5 focus:outline-none"
              >
                {Object.values(PARAMETRIC_LEVELS).map((def) => (
                  <option key={def.level} value={def.level} className="bg-black text-amber-200">
                    {def.name}
                  </option>
                ))}
              </select>
              <p className="text-[10px] font-mono text-amber-200/80 mt-1.5 leading-snug">
                💡 {currentLevelDef.description}
              </p>
            </div>

            {/* Jardinero Sónico (Músico acompañante automático) */}
            <div className="p-2 border border-emerald-500/40 bg-emerald-950/15 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-emerald-300">
                  🌱 Músico Acompañante (Jardinero)
                </span>
                <button
                  onClick={handleToggleGardenerQuick}
                  className={`px-2 py-0.5 border font-mono text-[10px] transition-colors ${
                    anyAgentActive
                      ? 'border-emerald-400 bg-emerald-500 text-black font-bold'
                      : 'border-gray-600 bg-black text-gray-300 hover:border-white'
                  }`}
                >
                  {anyAgentActive ? 'ACTIVO (Apagar)' : 'APAGADO (Encender)'}
                </button>
              </div>
              <p className="text-[10px] font-mono text-gray-400 leading-snug">
                Escucha las figuras que pones en el mapa y crea automáticamente nuevas figuras para acompañarte (imitando o haciendo contrapunto).
              </p>
              <button
                onClick={() => toggleModal('gardener_e4')}
                className="w-full text-left px-2 py-1 border border-emerald-500/40 bg-black/60 font-mono text-[10px] text-emerald-200 hover:bg-emerald-950/60 flex items-center justify-between"
              >
                <span>Configurar estilo del acompañante</span>
                <span>Abrir ▸</span>
              </button>
            </div>

            {renderToolItem(
              'score_e2',
              '🎼 Roles y Turnos para Tocar en Grupo',
              'Asigna quién lleva el ritmo, la armonía o el espacio y usa un reloj de fases para ensayar.',
              sessionTimerRunning ? '● EN CURSO' : 'Abrir ▸',
              'border-indigo-400 text-indigo-200 bg-indigo-950/50'
            )}

            {renderToolItem(
              'curriculum',
              '📚 Guía de Estudio (10 Lecciones)',
              'Explicaciones breves sobre cómo funciona el sonido en 3D, los timbres y la composición.',
              'Leer ▸',
              'border-teal-400 text-teal-200 bg-teal-950/50'
            )}

            {renderToolItem(
              'exam',
              '🎯 Entrenamiento de Oído (Juegos)',
              'Ponte audífonos y adivina desde qué dirección suena un objeto o qué instrumento es.',
              'Jugar ▸',
              'border-orange-400 text-orange-200 bg-orange-950/50'
            )}

            {renderToolItem(
              'tutor',
              '📊 Mi Progreso y Estadísticas',
              'Revisa cuántas figuras, efectos y herramientas has probado durante tu sesión.',
              'Ver ▸',
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
            👁️ VISTA DEL MAPA Y SONIDO 3D
          </h3>
          <button
            onClick={() => setVisualAudioOpen(!visualAudioOpen)}
            className="border border-white px-2 py-0.5 text-[10px] font-mono text-white hover:bg-white hover:text-black"
          >
            {visualAudioOpen ? 'OCULTAR' : 'MOSTRAR'}
          </button>
        </div>

        {visualAudioOpen && (
          <div className="space-y-2">
            {/* Explicación clara de los controles visuales del mapa */}
            <div className="p-2 border border-gray-700 bg-zinc-950 space-y-2">
              <div className="text-[10px] font-mono font-bold text-gray-200">
                Opciones Visuales del Mapa 3D:
              </div>

              {/* Círculos de alcance sonoro en el suelo */}
              <div className="flex items-start justify-between gap-2 border-t border-gray-800 pt-1.5">
                <div className="text-[10px] font-mono">
                  <div className="text-purple-200 font-bold">〰 Círculos de Alcance en el Piso</div>
                  <div className="text-gray-400 leading-snug">
                    Dibuja anillos en el suelo debajo de cada figura para ver hasta dónde llega su sonido.
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
                  {guidesEnabled ? 'VISIBLE' : 'OCULTO'}
                </button>
              </div>

              {/* Brillo suave y viñeta */}
              <div className="flex items-start justify-between gap-2 border-t border-gray-800 pt-1.5">
                <div className="text-[10px] font-mono">
                  <div className="text-amber-200 font-bold">✨ Halo de Brillo y Viñeta</div>
                  <div className="text-gray-400 leading-snug">
                    Añade resplandor a los objetos. Mantenlo apagado si prefieres el mapa blanco totalmente nítido.
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
                  {fxEnabled ? 'ENCENDIDO' : 'APAGADO'}
                </button>
              </div>

              {/* Realidad Virtual (VR) y Fondo Transparente (AR) */}
              <div className="border-t border-gray-800 pt-1.5 space-y-1">
                <div className="text-[10px] font-mono text-gray-300 font-bold">
                  Realidad Virtual y Cámara (Opcional):
                </div>
                <p className="text-[10px] font-mono text-gray-400 leading-snug">
                  Usa <strong className="text-violet-200">Casco VR</strong> si tienes un visor conectado (ej. Meta Quest), o <strong className="text-fuchsia-200">Fondo Transparente</strong> para quitar el fondo blanco.
                </p>
                <div className="grid grid-cols-2 gap-1 pt-0.5">
                  <button
                    onClick={handleEnterVR}
                    className="px-2 py-1 border border-violet-500/40 bg-violet-950/30 font-mono text-[10px] text-violet-200 hover:bg-violet-900/50"
                  >
                    🥽 Casco VR
                  </button>
                  <button
                    onClick={handleEnterAR}
                    className={`px-2 py-1 border font-mono text-[10px] transition-colors ${
                      passthroughArEnabled
                        ? 'border-fuchsia-400 bg-fuchsia-500 text-black font-bold'
                        : 'border-fuchsia-500/40 bg-fuchsia-950/30 text-fuchsia-200 hover:bg-fuchsia-900/50'
                    }`}
                  >
                    📲 Fondo Transparente: {passthroughArEnabled ? 'SÍ' : 'NO'}
                  </button>
                </div>
              </div>
            </div>

            {renderToolItem(
              'calibrator',
              '🎚 Probar mis Audífonos o Bocinas',
              'Hace girar un sonido de prueba alrededor de tu cabeza para verificar izquierda, derecha y distancia.'
            )}

            {renderToolItem(
              'hrtf_e5',
              '👂 Ajustes de Oído 3D y Cuerdas/Vientos',
              'Personaliza cómo escuchas el espacio en audífonos y prueba los instrumentos físicos (Csound).'
            )}

            {renderToolItem(
              'coherence_e3',
              '🔷 ¿Por qué cada Figura Suena Distinto?',
              'Explora cómo la forma y el color de cada objeto cambian su timbre y haz una prueba rápida.',
              'Ver ▸',
              'border-amber-400 text-amber-200 bg-amber-950/50'
            )}

            {renderToolItem(
              'mapping',
              '🔗 Conectar Altura o Tamaño con el Sonido',
              'Configura reglas como: "al subir una esfera en el mapa, que su nota sea más aguda".',
              'Configurar ▸',
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
            ⏺ GRABACIÓN, GALERÍA Y CONEXIONES
          </h3>
          <button
            onClick={() => setStudioOpen(!studioOpen)}
            className="border border-white px-2 py-0.5 text-[10px] font-mono text-white hover:bg-white hover:text-black"
          >
            {studioOpen ? 'OCULTAR' : 'MOSTRAR'}
          </button>
        </div>

        {studioOpen && (
          <div className="space-y-2">
            {renderToolItem(
              'session_e1',
              '⏺ Grabar Audio y Repetir Sesión',
              'Graba todo lo que tocas en archivo de audio WAV, repite tus movimientos o descarga gráficas.',
              isRecording ? '● GRABANDO' : 'Abrir ▸',
              'border-rose-400 text-rose-200 bg-rose-950/50'
            )}

            {renderToolItem(
              'gallery_e6',
              '🏛 Publicar Obra y Modo Concierto',
              'Guarda un fragmento en la galería pública, exporta pistas separadas o prepara un concierto.',
              'Abrir ▸',
              'border-purple-400 text-purple-200 bg-purple-950/50'
            )}

            {renderToolItem(
              'community_e7',
              '🤝 Ritmos por Texto y Conexión OSC',
              'Escribe patrones rítmicos en vivo o conecta Casa Salomón con programas como SuperCollider o Max.',
              'Abrir ▸',
              'border-emerald-400 text-emerald-200 bg-emerald-950/50'
            )}

            {renderToolItem(
              'future_e8',
              '🌐 Medidas de Salón Real, Timbres IA y Escuelas',
              'Dibuja las medidas en metros de un salón real, transforma timbres o conecta con otras escuelas.',
              'Abrir ▸',
              'border-fuchsia-400 text-fuchsia-200 bg-fuchsia-950/50'
            )}

            {/* Descarga rápida de archivos de tu escena */}
            <div className="pt-2 border-t border-gray-800 space-y-1">
              <div className="text-[10px] font-mono font-bold text-gray-200">
                Guardar o Abrir tu Mapa en tu Computadora:
              </div>
              <p className="text-[10px] font-mono text-gray-400 leading-snug">
                Descarga un archivo con tus objetos para continuar después o compartirlo:
              </p>
              <div className="grid grid-cols-2 gap-1 pt-0.5">
                <button
                  onClick={() => exportCasaSessionV2()}
                  className="px-2 py-1 border border-rose-500/40 bg-rose-950/30 text-rose-200 font-mono text-[10px] hover:bg-rose-900/50"
                  title="Descarga la sesión completa con su historia de eventos"
                >
                  💾 Guardar Sesión
                </button>
                <button
                  onClick={() => exportTopologicalScore()}
                  className="px-2 py-1 border border-cyan-500/40 bg-cyan-950/30 text-cyan-200 font-mono text-[10px] hover:bg-cyan-900/50"
                  title="Descarga las posiciones y sonidos actuales de la escena"
                >
                  📄 Guardar Mapa
                </button>
                <button
                  onClick={() => exportGraphicScore()}
                  className="px-2 py-1 border border-purple-500/40 bg-purple-950/30 text-purple-200 font-mono text-[10px] hover:bg-purple-900/50"
                  title="Descarga un dibujo vectorial SVG de tu mapa sonoro"
                >
                  🎨 Dibujo SVG
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2 py-1 border border-amber-500/40 bg-amber-950/30 text-amber-200 font-mono text-[10px] hover:bg-amber-900/50"
                  title="Abre un archivo de sesión o mapa guardado previamente"
                >
                  📂 Abrir Archivo
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
                🏛 Ver Galería Web
              </Link>
              <Link
                href="/apoyo"
                className="text-center px-2 py-1.5 border border-pink-500/40 bg-pink-950/20 font-mono text-[10px] text-pink-300 hover:bg-pink-900/40"
              >
                ♥ Apoyar Proyecto
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
