'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { audioManager } from '../../lib/AudioManager';
import { parseSofa, type HrirSet } from '../../lib/audio/sofa/sofaLoader';
import {
  saveActiveProfile,
  loadActiveProfile,
  clearActiveProfile,
} from '../../lib/audio/sofa/profileStore';

/**
 * Gestor de Perfiles Acústicos (roadmap 4.3).
 *
 * Permite al usuario cargar su propio archivo SOFA (HRTF medida en su
 * anatomía, 4.1) o descargar uno de las bases de datos públicas, y aplica
 * la convolución binaural personalizada (4.2) en sustitución del modelo
 * HRTF promedio del navegador. El perfil se persiste en IndexedDB y se
 * re-aplica en cada sesión; el archivo nunca sale del navegador.
 */

const PUBLIC_DATABASES: { label: string; url: string }[] = [
  { label: 'MIT KEMAR', url: 'https://sofacoustics.org/data/database/mit/' },
  { label: 'IRCAM Listen', url: 'https://sofacoustics.org/data/database/listen/' },
  { label: 'CIPIC', url: 'https://sofacoustics.org/data/database/cipic/' },
  { label: 'SADIE II', url: 'https://sofacoustics.org/data/database/sadie%20ii/' },
];

interface ProfileInfo {
  name: string;
  count: number;
  irLength: number;
  sampleRate: number;
}

function describe(set: HrirSet): ProfileInfo {
  return {
    name: set.name,
    count: set.count,
    irLength: set.irLength,
    sampleRate: set.sampleRate,
  };
}

export function HrtfProfileManager() {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileInfo | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Re-aplicar el perfil persistido al iniciar la sesión
  useEffect(() => {
    let cancelled = false;
    loadActiveProfile()
      .then((stored) => {
        if (!stored || cancelled) return;
        const set = parseSofa(stored.buffer, stored.name);
        audioManager.enableCustomHrtf(set);
        setProfile(describe(set));
      })
      .catch(() => {
        // Perfil corrupto o IndexedDB no disponible: continuar con HRTF estándar
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleFile = useCallback(async (file: File) => {
    setLoading(true);
    setStatus(null);
    try {
      const buffer = await file.arrayBuffer();
      const set = parseSofa(buffer, file.name);
      audioManager.enableCustomHrtf(set);
      setProfile(describe(set));
      setStatus(`Perfil "${file.name}" activo`);
      await saveActiveProfile(file.name, buffer);
    } catch (error) {
      setStatus(`Error: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDisable = useCallback(async () => {
    audioManager.disableCustomHrtf();
    setProfile(null);
    setStatus('HRTF estándar del navegador restaurada');
    try {
      await clearActiveProfile();
    } catch {
      // IndexedDB no disponible
    }
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-4 right-28 bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2 z-50 font-mono text-sm transition-colors ${
          profile ? 'text-emerald-300' : 'text-gray-400 hover:text-gray-200'
        }`}
        title="Perfil HRTF personalizado: carga tu archivo SOFA para una localización 3D fiel a tu anatomía"
      >
        👂 HRTF
      </button>

      {open && (
        <div className="fixed bottom-16 right-4 w-80 bg-black/90 backdrop-blur-md rounded-lg p-4 z-50 font-mono text-sm text-gray-200 space-y-4">
          <div>
            <h3 className="text-emerald-300 font-bold mb-1">Perfil acústico HRTF</h3>
            <p className="text-xs text-gray-400">
              El navegador usa una HRTF promedio que produce conos de confusión.
              Carga un archivo .sofa medido en tu anatomía (o elige uno de una
              base pública) para una espacialización personalizada por
              convolución binaural.
            </p>
          </div>

          <div className="text-xs bg-white/5 rounded p-2">
            {profile ? (
              <>
                <p className="text-emerald-300 truncate" title={profile.name}>
                  ● {profile.name}
                </p>
                <p className="text-gray-400">
                  {profile.count} posiciones · {profile.irLength} muestras ·{' '}
                  {(profile.sampleRate / 1000).toFixed(1)} kHz
                </p>
              </>
            ) : (
              <p className="text-gray-400">○ HRTF estándar del navegador</p>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".sofa"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = '';
            }}
          />

          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="flex-1 px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/40 rounded text-xs transition-colors disabled:opacity-50"
            >
              {loading ? 'Cargando…' : 'Cargar archivo .sofa'}
            </button>
            {profile && (
              <button
                onClick={handleDisable}
                className="flex-1 px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs transition-colors"
              >
                Usar HRTF estándar
              </button>
            )}
          </div>

          {status && <p className="text-xs text-amber-300">{status}</p>}

          <div>
            <p className="text-xs text-gray-400 mb-1">
              Bases de datos públicas (descarga el .sofa y cárgalo aquí):
            </p>
            <div className="flex flex-wrap gap-1">
              {PUBLIC_DATABASES.map(({ label, url }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-0.5 bg-white/10 hover:bg-emerald-500/30 rounded text-xs transition-colors"
                >
                  {label} ↗
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
