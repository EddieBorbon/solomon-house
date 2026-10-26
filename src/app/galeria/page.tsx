'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { listGalleries } from '../../lib/residency/residency';
import type { FirebaseProject } from '../../lib/firebaseService';

/**
 * Índice público de galerías de esculturas sonoras (roadmap 8.5):
 * cuartos persistentes publicados por artistas en residencia, visitables
 * de forma asíncrona.
 */
export default function GalleryIndexPage() {
  const [galleries, setGalleries] = useState<FirebaseProject[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listGalleries()
      .then(setGalleries)
      .catch((err) => setError((err as Error).message));
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 font-mono p-8">
      <header className="max-w-2xl mx-auto mb-10">
        <h1 className="text-3xl text-white mb-2">🖼 Galerías de esculturas sonoras</h1>
        <p className="text-sm text-gray-400">
          Residencias artísticas virtuales de La Casa de Salomón: cuartos
          persistentes creados por artistas invitados, abiertos a la escucha
          del público. Usa auriculares.
        </p>
        <Link href="/" className="text-xs text-cyan-300 hover:text-cyan-100">
          ← Volver al lienzo colaborativo
        </Link>
      </header>

      <main className="max-w-2xl mx-auto space-y-4">
        {error && <p className="text-red-400 text-sm">Error: {error}</p>}
        {!galleries && !error && <p className="text-gray-500 text-sm">Cargando galerías…</p>}
        {galleries && galleries.length === 0 && (
          <p className="text-gray-500 text-sm">
            Aún no hay galerías publicadas. Un artista puede publicar su lienzo
            con el botón &quot;🖼 Publicar galería&quot; en la página principal.
          </p>
        )}
        {galleries?.map((project) => (
          <Link
            key={project.id}
            href={`/galeria/${project.id}`}
            className="block border border-white/15 hover:border-cyan-400/60 rounded-lg p-4 transition-colors"
          >
            <h2 className="text-lg text-white">{project.name}</h2>
            <p className="text-sm text-cyan-300">{project.gallery?.artist}</p>
            {project.gallery?.statement && (
              <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                {project.gallery.statement}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Publicada el {project.gallery?.publishedAt?.slice(0, 10)} ·{' '}
              {project.gallery?.visits ?? 0} visitas
            </p>
          </Link>
        ))}
      </main>
    </div>
  );
}
