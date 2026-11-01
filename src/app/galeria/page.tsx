'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { listGalleries } from '../../lib/residency/residency';
import type { FirebaseProject } from '../../lib/firebaseService';
import {
  useCurationArchiveStore,
  filterArchiveItems,
  forkFragmentIntoWorld,
  downloadConcertProgramNotesHtml,
} from '../../lib/residency/curationArchive';

/**
 * Archivo Público Navegable de Sesiones, Fragmentos, Esculturas y Galerías
 * (Roadmap 8.5 + Etapa E6.2 / E6.3).
 */
export default function GalleryIndexPage() {
  const [galleries, setGalleries] = useState<FirebaseProject[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const archiveState = useCurationArchiveStore();
  const [query, setQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [licenseFilter, setLicenseFilter] = useState('ALL');
  const [selectedId, setSelectedId] = useState<string>(
    archiveState.fragments[0]?.id ?? 'frag-moscu-01'
  );

  useEffect(() => {
    listGalleries()
      .then(setGalleries)
      .catch((err) => setError((err as Error).message));
  }, []);

  const filteredFragments = filterArchiveItems(
    archiveState.fragments,
    query,
    levelFilter,
    licenseFilter
  );
  const activeWork =
    archiveState.fragments.find((f) => f.id === selectedId) ?? filteredFragments[0];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 font-mono p-8">
      <header className="max-w-5xl mx-auto mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl text-white mb-2">
            🖼 Archivo Público, Curaduría y Galerías Sonoras (E6)
          </h1>
          <p className="text-sm text-gray-400 max-w-2xl">
            Repositorio comunitario de sesiones, fragmentos curados, colecciones y
            residencias artísticas de La Casa de Salomón. Materia prima compositiva
            bajo licencias Creative Commons con cadena autoral visible.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => downloadConcertProgramNotesHtml()}
            className="rounded-lg border border-fuchsia-500/40 bg-fuchsia-950/50 px-3.5 py-2 text-xs text-fuchsia-200 hover:bg-fuchsia-900/60"
          >
            Descargar Programa de Mano (E6.4.5)
          </button>
          <Link
            href="/"
            className="rounded-lg bg-cyan-600 px-3.5 py-2 text-xs text-white hover:bg-cyan-500"
          >
            ← Volver al lienzo colaborativo
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Columna izquierda: Buscador, Filtros, Fragmentos y Colecciones (E6.2.1, E6.2.3) */}
        <section className="lg:col-span-5 space-y-6">
          <div className="rounded-xl border border-white/15 bg-black/50 p-4 space-y-3">
            <h2 className="text-sm font-bold text-fuchsia-300">
              Explorador del Archivo Sonoro (E6.2.1)
            </h2>
            <input
              placeholder="Buscar obra, autor, sala o etiqueta..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded border border-white/15 bg-black px-3 py-1.5 text-xs"
            />
            <div className="flex gap-2">
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="flex-1 rounded border border-white/15 bg-black px-2 py-1 text-xs"
              >
                <option value="ALL">Todos los niveles</option>
                <option value="N1">Nivel 1 (N1)</option>
                <option value="N2">Nivel 2 (N2)</option>
                <option value="N3">Nivel 3 (N3)</option>
                <option value="N4">Nivel 4 (N4)</option>
              </select>
              <select
                value={licenseFilter}
                onChange={(e) => setLicenseFilter(e.target.value)}
                className="flex-1 rounded border border-white/15 bg-black px-2 py-1 text-xs"
              >
                <option value="ALL">Todas las licencias</option>
                <option value="CC-BY-4.0">CC BY 4.0</option>
                <option value="CC-BY-SA-4.0">CC BY-SA 4.0</option>
                <option value="CC-BY-NC-SA-4.0">CC BY-NC-SA 4.0</option>
                <option value="CC0-1.0">CC0</option>
              </select>
            </div>

            <div className="space-y-2 pt-2">
              {filteredFragments.map((frag) => (
                <div
                  key={frag.id}
                  onClick={() => setSelectedId(frag.id)}
                  className={`cursor-pointer rounded-lg border p-3 transition ${
                    activeWork?.id === frag.id
                      ? 'border-fuchsia-400 bg-fuchsia-950/30'
                      : 'border-white/10 bg-white/5 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{frag.title}</span>
                    <span className="text-[10px] text-fuchsia-300">
                      {frag.level} · {frag.license}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {frag.authors.join(', ')} · {frag.dateIso}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Colecciones Curadas (E6.2.3) */}
          <div className="rounded-xl border border-white/15 bg-black/50 p-4 space-y-3">
            <h2 className="text-sm font-bold text-amber-300">
              Colecciones Curadas (E6.2.3)
            </h2>
            {archiveState.collections.map((col) => (
              <div key={col.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                <h3 className="text-xs font-bold text-white">{col.title}</h3>
                <p className="text-[11px] text-amber-300">Curaduría: {col.curatorName}</p>
                <p className="text-xs text-gray-300 mt-1">{col.curatorialText}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Columna derecha: Ficha completa de la obra, Partitura Gráfica, Ficha Musicológica y Cadena Autoral (E6.2.2, E6.3.2) */}
        <section className="lg:col-span-7 space-y-6">
          {activeWork && (
            <div className="rounded-xl border border-fuchsia-500/30 bg-black/70 p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs text-fuchsia-400">
                    Ficha de Obra y Análisis Musicológico (E6.2.2)
                  </span>
                  <h2 className="text-xl font-bold text-white mt-0.5">
                    {activeWork.title}
                  </h2>
                  <p className="text-xs text-gray-400">
                    Autores: {activeWork.authors.join(', ')} · Sala: {activeWork.roomId} ·
                    Licencia: {activeWork.license}
                  </p>
                </div>
                <Link
                  href="/"
                  onClick={() =>
                    forkFragmentIntoWorld(
                      activeWork.id,
                      'Visitante de Archivo',
                      'Bifurcación desde el archivo público /galeria'
                    )
                  }
                  className="rounded-lg bg-fuchsia-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-fuchsia-500"
                >
                  Bifurcar (Fork) en Lienzo 3D
                </Link>
              </div>

              <p className="text-xs text-gray-300">{activeWork.description}</p>

              {/* Resumen musicológico E1.3 */}
              <div className="grid grid-cols-4 gap-2 rounded-lg bg-white/5 p-3 text-center text-xs">
                <div>
                  <span className="block text-[10px] text-gray-400">Sistema Alturas</span>
                  <span className="font-bold text-emerald-300">
                    {activeWork.musicologicalSummary.pitchSystem}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400">Periodicidad</span>
                  <span className="font-bold text-cyan-300">
                    {activeWork.musicologicalSummary.periodicityIndex}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400">Centroide</span>
                  <span className="font-bold text-amber-300">
                    {activeWork.musicologicalSummary.meanSpectralCentroidHz} Hz
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400">Agencia Humana</span>
                  <span className="font-bold text-fuchsia-300">
                    {activeWork.musicologicalSummary.humanSharePct}%
                  </span>
                </div>
              </div>

              {/* Cadena Autoral Visible (E6.3.2) */}
              <div className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-3 text-xs">
                <h3 className="font-bold text-amber-300 mb-1">
                  Cadena Autoral y Linaje de Reapropiación (E6.3.2)
                </h3>
                <ol className="space-y-1 text-gray-300">
                  {activeWork.attributionChain.map((node, i) => (
                    <li key={i}>
                      #{i + 1} [{node.dateIso}] <strong>{node.title}</strong> —{' '}
                      {node.authors.join(', ')} ({node.license}): {node.changeSummary}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Partitura Gráfica SVG (E1.5.3 / E6.2.2) */}
              <div className="space-y-1">
                <span className="text-xs text-gray-400">
                  Partitura Gráfica Temporal (E1.5.3 / E6.2.2):
                </span>
                <div
                  className="overflow-x-auto rounded-lg border border-white/10 bg-black p-2"
                  dangerouslySetInnerHTML={{ __html: activeWork.graphicScoreSvg }}
                />
              </div>
            </div>
          )}

          {/* Cuartos de residencia publicados en Firebase (8.5) */}
          <div className="rounded-xl border border-white/15 bg-black/50 p-4 space-y-3">
            <h2 className="text-sm font-bold text-cyan-300">
              Cuartos de Residencia Persistentes (8.5)
            </h2>
            {error && <p className="text-red-400 text-xs">Aviso: {error}</p>}
            {!galleries && !error && (
              <p className="text-gray-500 text-xs">Cargando galerías en red…</p>
            )}
            {galleries && galleries.length === 0 && (
              <p className="text-gray-500 text-xs">
                Aún no hay cuartos remotos adicionales publicados en este nodo.
              </p>
            )}
            {galleries?.map((project) => (
              <Link
                key={project.id}
                href={`/galeria/${project.id}`}
                className="block border border-white/15 hover:border-cyan-400/60 rounded-lg p-3 transition-colors"
              >
                <h3 className="text-sm text-white font-bold">{project.name}</h3>
                <p className="text-xs text-cyan-300">{project.gallery?.artist}</p>
                {project.gallery?.statement && (
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                    {project.gallery.statement}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
