'use client';

import { useState } from 'react';
import { publishCurrentWorldAsGallery } from '../../lib/residency/residency';

/**
 * Publicador de galerías para artistas en residencia (roadmap 8.5):
 * convierte el lienzo actual en un cuarto persistente visitable por el
 * público en /galeria/<id>.
 */
export function GalleryPublisher() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [statement, setStatement] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePublish = async () => {
    if (!title.trim() || !artist.trim()) {
      setError('El título y el nombre del artista son obligatorios');
      return;
    }
    setPublishing(true);
    setError(null);
    try {
      const projectId = await publishCurrentWorldAsGallery(
        title.trim(),
        artist.trim(),
        statement.trim()
      );
      setPublishedUrl(`${window.location.origin}/galeria/${projectId}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-28 left-4 bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2 z-50 font-mono text-sm text-gray-400 hover:text-gray-200 transition-colors"
        title="Publicar el lienzo actual como galería visitable (residencias artísticas)"
      >
        🖼 Galería
      </button>

      {open && (
        <div className="fixed bottom-40 left-4 w-80 bg-black/90 backdrop-blur-md rounded-lg p-4 z-50 font-mono text-sm text-gray-200 space-y-3">
          <div>
            <h3 className="text-pink-300 font-bold mb-1">Publicar como galería</h3>
            <p className="text-xs text-gray-400">
              Convierte el lienzo actual en un cuarto persistente de escucha,
              visitable por el público de forma asíncrona.
            </p>
          </div>

          {publishedUrl ? (
            <div className="space-y-2">
              <p className="text-xs text-emerald-300">✅ Galería publicada. URL para compartir:</p>
              <input
                readOnly
                value={publishedUrl}
                onFocus={(e) => e.target.select()}
                className="w-full bg-black/60 rounded px-2 py-1 text-xs text-cyan-300"
              />
              <button
                onClick={() => {
                  setPublishedUrl(null);
                  setTitle('');
                  setArtist('');
                  setStatement('');
                }}
                className="w-full px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs transition-colors"
              >
                Publicar otra
              </button>
            </div>
          ) : (
            <>
              <input
                placeholder="Título de la obra *"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-black/60 rounded px-2 py-1 text-xs"
              />
              <input
                placeholder="Artista *"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full bg-black/60 rounded px-2 py-1 text-xs"
              />
              <textarea
                placeholder="Declaración artística (statement)"
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                rows={3}
                className="w-full bg-black/60 rounded px-2 py-1 text-xs resize-none"
              />
              {error && <p className="text-xs text-red-400">{error}</p>}
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="w-full px-2 py-1 bg-pink-500/20 hover:bg-pink-500/40 rounded text-xs transition-colors disabled:opacity-50"
              >
                {publishing ? 'Publicando…' : 'Publicar galería'}
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
