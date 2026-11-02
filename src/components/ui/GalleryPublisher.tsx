'use client';

import React, { useState } from 'react';
import { publishCurrentWorldAsGallery } from '../../lib/residency/residency';
import {
  useCurationArchiveStore,
  CC_LICENSE_DESCRIPTIONS,
  createFragmentFromSession,
  filterArchiveItems,
  createCuratedCollection,
  forkFragmentIntoWorld,
  exportStemsForDaw,
  exportFragmentAsCommunitySample,
  exportAmbisonicsBFormatWav,
  downloadConcertProgramNotesHtml,
  type CreativeCommonsLicense,
  type MultichannelOutputMode,
} from '../../lib/residency/curationArchive';
import { importTopologicalScore } from '../../lib/score/topologicalScore';
import { useUIPanelStore } from '../../state/useUIPanelStore';
import { useLanguage } from '../../contexts/LanguageContext';

export function GalleryPublisher() {
  const { t } = useLanguage();
  const activeModal = useUIPanelStore((s) => s.activeModal);
  const closeModal = useUIPanelStore((s) => s.closeModal);
  const open = activeModal === 'gallery_e6';
  const [activeTab, setActiveTab] = useState<
    'fragment' | 'archive' | 'reappropriate' | 'concert'
  >('fragment');

  const archiveState = useCurationArchiveStore();

  // Estado (Fragmento y Galería)
  const [fragTitle, setFragTitle] = useState('');
  const [fragAuthors, setFragAuthors] = useState('Ensamble Local');
  const [fragTags, setFragTags] = useState('espectral, taller');
  const [fragDesc, setFragDesc] = useState('');
  const [fragLicense, setFragLicense] = useState<CreativeCommonsLicense>('CC-BY-SA-4.0');
  const [inSec, setInSec] = useState(0);
  const [outSec, setOutSec] = useState(45);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

  // Estado (Archivo y Colecciones)
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [licenseFilter, setLicenseFilter] = useState('ALL');
  const [selectedWorkId, setSelectedWorkId] = useState<string | null>('frag-moscu-01');
  const [colTitle, setColTitle] = useState('');
  const [colCurator, setColCurator] = useState('');
  const [colText, setColText] = useState('');

  // Estado (Fork y Atribución)
  const [forkAuthor, setForkAuthor] = useState('Intérprete Derivado');
  const [forkChangePlan, setForkChangePlan] = useState(
    'Re-espacialización microtonal sobre la estructura original'
  );

  const filteredItems = filterArchiveItems(
    archiveState.fragments,
    searchQuery,
    levelFilter,
    licenseFilter
  );
  const selectedWork =
    archiveState.fragments.find((f) => f.id === selectedWorkId) ??
    filteredItems[0] ??
    null;

  // Modo Proyección para pantalla grande sin interfaz
  if (archiveState.projectionCleanViewMode) {
    return (
      <button
        onClick={() =>
          useCurationArchiveStore.setState({ projectionCleanViewMode: false })
        }
        className="fixed top-3 right-3 z-50 rounded-lg bg-black/50 px-2.5 py-1 text-[10px] text-neutral-400 hover:bg-black/90 hover:text-white"
        title="Salir del Modo Proyección"
      >
        Salir de Proyección
      </button>
    );
  }

  const handleCreateFragment = () => {
    const created = createFragmentFromSession({
      title: fragTitle || 'Fragmento de Sesión en Vivo',
      authors: fragAuthors
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      tags: fragTags
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      description: fragDesc,
      license: fragLicense,
      inMs: inSec * 1000,
      outMs: outSec * 1000,
    });
    setSelectedWorkId(created.id);
    setActiveTab('archive');
  };

  const handlePublishGallery = async () => {
    try {
      const id = await publishCurrentWorldAsGallery(
        fragTitle.trim() || 'Galería Sonora',
        fragAuthors.trim() || 'Artista en Residencia',
        fragDesc.trim()
      );
      setPublishedUrl(`${window.location.origin}/galeria/${id}`);
    } catch {
      setPublishedUrl(`${window.location.origin}/galeria`);
    }
  };

  return (
    <>
      {open && (
        <div className="fixed top-14 left-[21rem] z-50 w-[490px] max-w-[95vw] rounded-2xl border border-fuchsia-500/40 bg-neutral-950/95 p-4 text-xs text-neutral-200 shadow-2xl backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
            <div>
              <h3 className="text-sm font-semibold text-white">
                {t('modals.galleryTitle')}
              </h3>
              <p className="text-[11px] text-neutral-400">
                {t('modals.gallerySubtitle')}
              </p>
            </div>
            <button
              onClick={closeModal}
              className="rounded-lg px-2 py-1 text-neutral-400 hover:bg-white/10 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="mb-3 rounded-lg bg-fuchsia-950/30 border border-fuchsia-500/30 p-2 text-[10px] text-fuchsia-100 leading-snug">
            💡 {t('modals.galleryHelp')}
          </div>

          {/* Pestañas */}
          <div className="mb-3 flex gap-1 rounded-lg bg-white/5 p-1">
            {(
              [
                ['fragment', '1. Publicar'],
                ['archive', '2. Galería'],
                ['reappropriate', '3. Pistas WAV'],
                ['concert', '4. Concierto'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 rounded-md py-1.5 text-[11px] font-medium transition ${
                  activeTab === id
                    ? 'bg-fuchsia-600 text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* PESTAÑA 1: FRAGMENTOS Y LICENCIAS */}
          {activeTab === 'fragment' && (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-neutral-400">
                    Entrada In (s)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={inSec}
                    onChange={(e) => setInSec(Math.max(0, Number(e.target.value)))}
                    className="w-full rounded border border-white/15 bg-black px-2 py-1 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-400">
                    Salida Out (s)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={outSec}
                    onChange={(e) => setOutSec(Math.max(inSec + 1, Number(e.target.value)))}
                    className="w-full rounded border border-white/15 bg-black px-2 py-1 text-xs"
                  />
                </div>
              </div>

              <input
                placeholder="Título del fragmento u obra"
                value={fragTitle}
                onChange={(e) => setFragTitle(e.target.value)}
                className="w-full rounded border border-white/15 bg-black px-2.5 py-1.5 text-xs"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  placeholder="Autores (separados por coma)"
                  value={fragAuthors}
                  onChange={(e) => setFragAuthors(e.target.value)}
                  className="w-full rounded border border-white/15 bg-black px-2 py-1 text-[11px]"
                />
                <input
                  placeholder="Etiquetas (ej. espectral, moscú)"
                  value={fragTags}
                  onChange={(e) => setFragTags(e.target.value)}
                  className="w-full rounded border border-white/15 bg-black px-2 py-1 text-[11px]"
                />
              </div>

              <textarea
                placeholder="Descripción curatorial / notas del fragmento"
                value={fragDesc}
                onChange={(e) => setFragDesc(e.target.value)}
                rows={2}
                className="w-full rounded border border-white/15 bg-black px-2.5 py-1 text-[11px]"
              />

              <div>
                <label className="block text-[10px] text-neutral-400">
                  Licencia Creative Commons acordada
                </label>
                <select
                  value={fragLicense}
                  onChange={(e) =>
                    setFragLicense(e.target.value as CreativeCommonsLicense)
                  }
                  className="mt-0.5 w-full rounded border border-white/15 bg-black px-2 py-1.5 text-xs"
                >
                  {(Object.keys(CC_LICENSE_DESCRIPTIONS) as CreativeCommonsLicense[]).map(
                    (lic) => (
                      <option key={lic} value={lic}>
                        {CC_LICENSE_DESCRIPTIONS[lic].name}
                      </option>
                    )
                  )}
                </select>
                <p className="mt-0.5 text-[10px] text-fuchsia-300">
                  {CC_LICENSE_DESCRIPTIONS[fragLicense].summary}
                </p>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleCreateFragment}
                  className="flex-1 rounded-lg bg-fuchsia-600 py-1.5 font-semibold text-white hover:bg-fuchsia-500"
                >
                  Guardar fragmento en Archivo
                </button>
                <button
                  onClick={handlePublishGallery}
                  className="rounded-lg border border-fuchsia-400/40 bg-fuchsia-950/40 px-3 py-1.5 text-fuchsia-200 hover:bg-fuchsia-900/50"
                >
                  Publicar en /galeria
                </button>
              </div>
              {publishedUrl && (
                <div className="rounded bg-emerald-950/60 border border-emerald-500/40 p-2 text-[10px] text-emerald-200">
                  Galería publicada: <span className="font-mono">{publishedUrl}</span>
                </div>
              )}
            </div>
          )}

          {/* PESTAÑA 2: ARCHIVO PÚBLICO Y COLECCIONES CURADAS */}
          {activeTab === 'archive' && (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              <div className="flex gap-1.5">
                <input
                  placeholder="Buscar por título, autor, sala o etiqueta..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 rounded border border-white/15 bg-black px-2 py-1 text-[11px]"
                />
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="rounded border border-white/15 bg-black px-1.5 py-1 text-[10px]"
                >
                  <option value="ALL">Niveles</option>
                  <option value="N1">N1</option>
                  <option value="N2">N2</option>
                  <option value="N3">N3</option>
                  <option value="N4">N4</option>
                </select>
                <select
                  value={licenseFilter}
                  onChange={(e) => setLicenseFilter(e.target.value)}
                  className="rounded border border-white/15 bg-black px-1.5 py-1 text-[10px]"
                >
                  <option value="ALL">Licencias</option>
                  <option value="CC-BY-4.0">CC-BY</option>
                  <option value="CC-BY-SA-4.0">CC-BY-SA</option>
                  <option value="CC-BY-NC-SA-4.0">CC-BY-NC-SA</option>
                  <option value="CC0-1.0">CC0</option>
                </select>
              </div>

              <div className="space-y-1.5">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedWorkId(item.id)}
                    className={`cursor-pointer rounded-xl border p-2 transition ${
                      selectedWork?.id === item.id
                        ? 'border-fuchsia-500 bg-fuchsia-950/30'
                        : 'border-white/10 bg-white/5 hover:border-white/25'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{item.title}</span>
                      <span className="rounded bg-black/60 px-1.5 py-0.5 font-mono text-[9px] text-fuchsia-300">
                        {item.level} · {item.license}
                      </span>
                    </div>
                    <div className="text-[10px] text-neutral-400">
                      {item.authors.join(', ')} · Sala: {item.roomId} · [
                      {(item.inMs / 1000).toFixed(0)}s–{(item.outMs / 1000).toFixed(0)}s]
                    </div>
                  </div>
                ))}
              </div>

              {/* Ficha de la obra seleccionada */}
              {selectedWork && (
                <div className="rounded-xl border border-fuchsia-500/30 bg-black/70 p-2.5 space-y-1.5">
                  <div className="font-semibold text-fuchsia-300">
                    Ficha Musicológica: {selectedWork.title}
                  </div>
                  <p className="text-[10px] text-neutral-300">{selectedWork.description}</p>
                  <div className="grid grid-cols-3 gap-1 text-center text-[10px] bg-white/5 rounded p-1.5">
                    <div>
                      <span className="text-neutral-400 block">Alturas</span>
                      <span className="font-mono text-white">
                        {selectedWork.musicologicalSummary.pitchSystem}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block">Periodicidad</span>
                      <span className="font-mono text-white">
                        {selectedWork.musicologicalSummary.periodicityIndex}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block">Centroide</span>
                      <span className="font-mono text-white">
                        {selectedWork.musicologicalSummary.meanSpectralCentroidHz} Hz
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => importTopologicalScore(selectedWork.snapshot)}
                    className="w-full rounded bg-fuchsia-700/70 py-1 text-[10px] font-medium text-white hover:bg-fuchsia-600"
                  >
                    Escuchar / Cargar escultura en el espacio 3D
                  </button>
                </div>
              )}

              {/* Colecciones curadas */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 space-y-1.5">
                <div className="font-semibold text-neutral-200">
                  Colecciones Curadas ({archiveState.collections.length})
                </div>
                {archiveState.collections.map((c) => (
                  <div key={c.id} className="rounded bg-black/50 p-2 text-[10px]">
                    <div className="font-semibold text-fuchsia-300">
                      {c.title} · por {c.curatorName}
                    </div>
                    <div className="text-neutral-300">{c.curatorialText}</div>
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <input
                    placeholder="Título de nueva colección"
                    value={colTitle}
                    onChange={(e) => setColTitle(e.target.value)}
                    className="rounded border border-white/15 bg-black px-2 py-1 text-[10px]"
                  />
                  <input
                    placeholder="Curador(a)"
                    value={colCurator}
                    onChange={(e) => setColCurator(e.target.value)}
                    className="rounded border border-white/15 bg-black px-2 py-1 text-[10px]"
                  />
                </div>
                <div className="flex gap-1.5">
                  <input
                    placeholder="Texto curatorial..."
                    value={colText}
                    onChange={(e) => setColText(e.target.value)}
                    className="flex-1 rounded border border-white/15 bg-black px-2 py-1 text-[10px]"
                  />
                  <button
                    onClick={() => {
                      createCuratedCollection(
                        colTitle,
                        colCurator,
                        colText,
                        archiveState.fragments.slice(0, 3).map((f) => f.id)
                      );
                      setColTitle('');
                      setColText('');
                    }}
                    className="rounded bg-fuchsia-600 px-2.5 py-1 text-[10px] font-medium text-white"
                  >
                    + Crear
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PESTAÑA 3: REAPROPIACIÓN, FORK, CADENA AUTORAL, STEMS Y SAMPLES */}
          {activeTab === 'reappropriate' && (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {selectedWork && (
                <div className="rounded-xl border border-fuchsia-500/30 bg-fuchsia-950/20 p-2.5 space-y-2">
                  <div className="font-semibold text-fuchsia-200">
                    Bifurcar (Fork) obra seleccionada: {selectedWork.title}
                  </div>
                  <input
                    placeholder="Tu nombre / colectivo para la atribución"
                    value={forkAuthor}
                    onChange={(e) => setForkAuthor(e.target.value)}
                    className="w-full rounded border border-white/15 bg-black px-2 py-1 text-[11px]"
                  />
                  <input
                    placeholder="Qué cambia en esta obra derivada"
                    value={forkChangePlan}
                    onChange={(e) => setForkChangePlan(e.target.value)}
                    className="w-full rounded border border-white/15 bg-black px-2 py-1 text-[11px]"
                  />
                  <button
                    onClick={() => {
                      const forked = forkFragmentIntoWorld(
                        selectedWork.id,
                        forkAuthor,
                        forkChangePlan
                      );
                      if (forked) setSelectedWorkId(forked.id);
                    }}
                    className="w-full rounded-lg bg-fuchsia-600 py-1.5 font-semibold text-white hover:bg-fuchsia-500"
                  >
                    Bifurcar (Fork) hacia el lienzo activo
                  </button>

                  {/* Cadena autoral visible */}
                  <div className="rounded bg-black/60 p-2 text-[10px]">
                    <div className="font-semibold text-amber-300 mb-1">
                      Cadena Autoral Visible:
                    </div>
                    <ol className="space-y-1 text-neutral-300">
                      {selectedWork.attributionChain.map((node, i) => (
                        <li key={i}>
                          <span className="font-mono text-fuchsia-300">#{i + 1}</span>{' '}
                          <strong>{node.title}</strong> ({node.dateIso}) por{' '}
                          {node.authors.join(', ')} [{node.license}] —{' '}
                          <em>{node.changeSummary}</em>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}

              {/* Exportación de Stems DAW y Samples Comunitarios */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 space-y-2">
                <div className="font-semibold text-white">
                  Materia Prima para DAW y Comunidad
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => exportStemsForDaw('by_layer')}
                    className="rounded-lg border border-cyan-500/40 bg-cyan-950/40 py-1.5 text-[10px] font-medium text-cyan-200 hover:bg-cyan-900/50"
                  >
                    Exportar Stems WAV por Capa (DAW)
                  </button>
                  <button
                    onClick={() => exportStemsForDaw('by_object')}
                    className="rounded-lg border border-cyan-500/40 bg-cyan-950/40 py-1.5 text-[10px] font-medium text-cyan-200 hover:bg-cyan-900/50"
                  >
                    Exportar Stems WAV por Objeto
                  </button>
                </div>
                <button
                  onClick={() =>
                    exportFragmentAsCommunitySample(
                      selectedWork?.id ?? 'frag-moscu-01'
                    )
                  }
                  className="w-full rounded-lg border border-emerald-500/40 bg-emerald-950/40 py-1.5 text-[10px] font-medium text-emerald-200 hover:bg-emerald-900/50"
                >
                  Exportar como Sample WAV para Carga Comunitaria
                </button>
              </div>
            </div>
          )}

          {/* PESTAÑA 4: MODO CONCIERTO, AMBISONICS Y PROGRAMA DE MANO */}
          {activeTab === 'concert' && (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 space-y-1.5">
                <div className="font-semibold text-fuchsia-300">
                  Lista de Reproducción del Concierto
                </div>
                {archiveState.concertPlaylistIds.map((id, idx) => {
                  const item = archiveState.fragments.find((f) => f.id === id);
                  if (!item) return null;
                  const isCurrent = archiveState.activeConcertIndex === idx;
                  return (
                    <div
                      key={id}
                      className={`flex items-center justify-between rounded p-1.5 text-[10px] ${
                        isCurrent ? 'bg-fuchsia-900/50 text-white' : 'bg-black/40 text-neutral-300'
                      }`}
                    >
                      <span>
                        {idx + 1}. {item.title} ({item.authors.join(', ')})
                      </span>
                      <button
                        onClick={() => {
                          useCurationArchiveStore.setState({ activeConcertIndex: idx });
                          importTopologicalScore(item.snapshot);
                        }}
                        className="rounded bg-fuchsia-600 px-2 py-0.5 text-[9px] text-white"
                      >
                        Cargar en Sala
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Salida Multicanal / Ambisonics */}
              <div>
                <label className="block text-[10px] text-neutral-400">
                  Ruteo Espacial de Sala / Multicanal
                </label>
                <div className="mt-1 flex gap-2">
                  <select
                    value={archiveState.multichannelMode}
                    onChange={(e) =>
                      useCurationArchiveStore.setState({
                        multichannelMode: e.target.value as MultichannelOutputMode,
                      })
                    }
                    className="flex-1 rounded border border-white/15 bg-black px-2 py-1 text-[11px]"
                  >
                    <option value="stereo_binaural">Estéreo Binaural (HRTF)</option>
                    <option value="quadraphonic_4ch">Cuadrafónico (4.0 Sala)</option>
                    <option value="ambisonics_bformat_foa">
                      Ambisonics B-Format FOA (W, X, Y, Z)
                    </option>
                    <option value="octophonic_8ch">Anillo Octofónico (8.0)</option>
                  </select>
                  <button
                    onClick={() => exportAmbisonicsBFormatWav()}
                    className="rounded bg-amber-600 px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-amber-500"
                  >
                    Exportar Ambisonics WAV
                  </button>
                </div>
              </div>

              {/* Concierto Híbrido y Proyección */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() =>
                    useCurationArchiveStore.setState({
                      hybridConcertMode: !archiveState.hybridConcertMode,
                    })
                  }
                  className={`flex-1 rounded-lg py-1.5 text-[10px] font-medium ${
                    archiveState.hybridConcertMode
                      ? 'bg-emerald-600 text-white'
                      : 'border border-white/15 bg-white/5 text-neutral-300'
                  }`}
                >
                  {archiveState.hybridConcertMode
                    ? `Concierto Híbrido Activo (${archiveState.hybridVenueName})`
                    : 'Activar Modo Concierto Híbrido'}
                </button>
                <button
                  onClick={() =>
                    useCurationArchiveStore.setState({ projectionCleanViewMode: true })
                  }
                  className="rounded-lg border border-fuchsia-400/40 bg-fuchsia-950/50 px-3 py-1.5 text-[10px] font-medium text-fuchsia-200 hover:bg-fuchsia-900/60"
                >
                  Modo Proyección Limpia
                </button>
              </div>

              {/* Programa de mano generado */}
              <button
                onClick={() => downloadConcertProgramNotesHtml()}
                className="w-full rounded-lg bg-fuchsia-600 py-2 text-[11px] font-semibold text-white hover:bg-fuchsia-500"
              >
                Generar y Descargar Programa de Mano con Partitura Gráfica
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
