'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Experience } from '../../../components/world/Experience';
import { visitGallery } from '../../../lib/residency/residency';
import { audioManager } from '../../../lib/AudioManager';
import type { FirebaseProject } from '../../../lib/firebaseService';

/**
 * Visita asíncrona a una galería de esculturas sonoras (roadmap 8.5).
 *
 * Modo solo-escucha: el cuarto persistente del artista se carga sin
 * conexión al mundo global y con la edición bloqueada; el visitante
 * navega y escucha, pero no altera la obra.
 */
export default function GalleryVisitPage() {
  const params = useParams<{ id: string }>();
  const [project, setProject] = useState<FirebaseProject | null>(null);
  const [entering, setEntering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(true);

  const handleEnter = async () => {
    setEntering(true);
    setError(null);
    try {
      // Gesto del usuario: arrancar el contexto de audio antes de cargar
      await audioManager.startContext();
      const loaded = await visitGallery(params.id);
      setProject(loaded);
    } catch (err) {
      setError((err as Error).message);
      setEntering(false);
    }
  };

  return (
    <div className="w-full h-screen relative bg-gray-950">
      {project && <Experience />}

      {/* Portada de entrada (también asegura el gesto para el audio) */}
      {!project && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gray-950 text-gray-200 font-mono p-8">
          <h1 className="text-2xl text-white mb-2">🖼 Galería de esculturas sonoras</h1>
          <p className="text-sm text-gray-400 mb-6 max-w-md text-center">
            Estás por entrar a un cuarto persistente en modo escucha. Usa
            auriculares para la espacialización binaural.
          </p>
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <button
            onClick={handleEnter}
            disabled={entering}
            className="px-8 py-3 border border-white text-white hover:bg-white hover:text-black transition-all duration-300 disabled:opacity-50"
          >
            {entering ? 'Cargando obra…' : 'Entrar a la galería'}
          </button>
          <Link href="/galeria" className="mt-6 text-xs text-cyan-300 hover:text-cyan-100">
            ← Todas las galerías
          </Link>
        </div>
      )}

      {/* Placa de la obra */}
      {project && showInfo && (
        <div className="fixed top-4 left-4 max-w-sm bg-black/85 backdrop-blur-md rounded-lg p-4 z-50 font-mono text-sm text-gray-200">
          <div className="flex justify-between items-start gap-2">
            <div>
              <h2 className="text-white font-bold">{project.name}</h2>
              <p className="text-cyan-300 text-xs">{project.gallery?.artist}</p>
            </div>
            <button
              onClick={() => setShowInfo(false)}
              className="text-gray-500 hover:text-gray-200 text-xs"
              title="Ocultar placa"
            >
              ✕
            </button>
          </div>
          {project.gallery?.statement && (
            <p className="text-xs text-gray-400 mt-2 whitespace-pre-wrap">
              {project.gallery.statement}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Modo escucha — la obra no puede modificarse ·{' '}
            <Link href="/galeria" className="text-cyan-300 hover:text-cyan-100">
              salir
            </Link>
          </p>
        </div>
      )}

      {project && !showInfo && (
        <button
          onClick={() => setShowInfo(true)}
          className="fixed top-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2 z-50 font-mono text-sm text-gray-400 hover:text-gray-200"
          title="Mostrar placa de la obra"
        >
          ℹ
        </button>
      )}
    </div>
  );
}
