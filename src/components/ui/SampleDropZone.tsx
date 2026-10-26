'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWorldStore } from '../../state/useWorldStore';
import { audioManager } from '../../lib/AudioManager';
import { getCurrentLevel } from '../../lib/pedagogy/parametricLevels';
import { granularCloudManager } from '../../lib/audio/GranularCloudManager';

/**
 * Carga de Samples Comunitarios por Drag and Drop (roadmap 2.7).
 *
 * Arrastrar un archivo de audio local (.wav, .mp3, .ogg) sobre el lienzo
 * crea un objeto sonoro de tipo sampler cuyo material es el sample del
 * usuario: síntesis concreta espacializada. El archivo nunca sale del
 * navegador (se usa un blob URL local). Disponible solo en el nivel
 * paramétrico N4 (Experimental Abierto).
 */

const ACCEPTED_TYPES = ['audio/wav', 'audio/x-wav', 'audio/mpeg', 'audio/mp3', 'audio/ogg'];

function isAudioFile(file: File): boolean {
  return (
    ACCEPTED_TYPES.includes(file.type) ||
    /\.(wav|mp3|ogg)$/i.test(file.name)
  );
}

export function SampleDropZone() {
  const [isDragging, setIsDragging] = useState(false);

  const createSampleObject = useCallback((file: File, granular: boolean) => {
    const state = useWorldStore.getState();
    const { activeGridId } = state;
    if (!activeGridId) return;

    if (!getCurrentLevel().allowSampleLoading) {
      alert(`El nivel ${getCurrentLevel().name} no permite cargar samples propios (requiere N4 · Experimental Abierto).`);
      return;
    }

    // Modo granular (roadmap 2.6): el sample se granula en el hilo de
    // audio (AudioWorklet) y se espacializa alrededor de un ancla visual.
    if (granular) {
      const before = new Set(
        (state.grids.get(activeGridId)?.objects ?? []).map((obj) => obj.id)
      );
      const anchorPosition: [number, number, number] = [
        (Math.random() * 2 - 1) * 3,
        1.5 + Math.random(),
        (Math.random() * 2 - 1) * 3,
      ];
      state.addObject('sphere', anchorPosition);

      const after = useWorldStore.getState().grids.get(activeGridId)?.objects ?? [];
      const anchor = after.find((obj) => !before.has(obj.id));
      if (anchor) {
        granularCloudManager
          .createCloud(anchor.id, file, anchor.position)
          .catch((error) => console.error('Error creando nube granular:', error));
      }
      return;
    }

    const blobUrl = URL.createObjectURL(file);

    // Posición de siembra: cerca del centro, con dispersión leve
    const position: [number, number, number] = [
      (Math.random() * 2 - 1) * 3,
      1 + Math.random() * 1.5,
      (Math.random() * 2 - 1) * 3,
    ];

    // Crear el objeto sampler (tipo 'spiral') vía la acción estándar
    const before = new Set(
      (state.grids.get(activeGridId)?.objects ?? []).map((obj) => obj.id)
    );
    state.addObject('spiral', position);

    const after = useWorldStore.getState().grids.get(activeGridId)?.objects ?? [];
    const created = after.find((obj) => !before.has(obj.id));
    if (!created) {
      URL.revokeObjectURL(blobUrl);
      return;
    }

    // Sustituir las urls del sampler por el sample del usuario (mapeado a
    // C4: el acorde de notas lo re-pitcheará por transposición)
    const sampleParams = {
      ...created.audioParams,
      urls: { C4: blobUrl },
      baseUrl: '',
      notes: ['C4'],
    };

    useWorldStore.getState().updateObject(created.id, { audioParams: sampleParams });

    // Recrear el motor de audio con el nuevo material sonoro: el Sampler
    // solo carga sus buffers al construirse.
    audioManager.removeSoundSource(created.id);
    audioManager.createSoundSource(created.id, 'spiral', sampleParams, created.position);

    console.log(`🎙️ Sample "${file.name}" cargado como objeto ${created.id}`);
  }, []);

  useEffect(() => {
    const handleDragOver = (event: DragEvent) => {
      if (event.dataTransfer?.types.includes('Files')) {
        event.preventDefault();
        setIsDragging(true);
      }
    };

    const handleDragLeave = (event: DragEvent) => {
      if (!event.relatedTarget) {
        setIsDragging(false);
      }
    };

    const handleDrop = (event: DragEvent) => {
      event.preventDefault();
      setIsDragging(false);

      const files = Array.from(event.dataTransfer?.files ?? []).filter(isAudioFile);
      if (files.length === 0) return;

      for (const file of files) {
        createSampleObject(file, event.shiftKey);
      }
    };

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, [createSampleObject]);

  if (!isDragging) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-purple-900/40 backdrop-blur-sm flex items-center justify-center pointer-events-none">
      <div className="bg-black/80 rounded-xl px-8 py-6 font-mono text-center">
        <div className="text-3xl mb-2">🎙️</div>
        <div className="text-purple-200 text-lg">Suelta tu sample (.wav, .mp3, .ogg)</div>
        <div className="text-gray-400 text-sm mt-1">
          Se sembrará como objeto de síntesis concreta espacializada
        </div>
        <div className="text-cyan-400/80 text-xs mt-2">
          Mantén Shift al soltar para sembrarlo como nube granular espacial
        </div>
      </div>
    </div>
  );
}
