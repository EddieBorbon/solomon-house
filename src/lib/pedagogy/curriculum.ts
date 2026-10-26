import * as Tone from 'tone';
import { useWorldStore } from '../../state/useWorldStore';
import { analyzeTexture, type TextureObject } from '../agents/accompaniment';

/**
 * Guías Curriculares Interactivas (roadmap 8.3) — lógica.
 *
 * Diez lecciones de aprendizaje progresivo, una por principio del
 * *Decálogo del Arquitecto Sonoro*, cada una con un micro-desafío que se
 * verifica automáticamente contra el estado real del mundo: el estudiante
 * no marca casillas, demuestra la destreza en el lienzo.
 *
 * Los textos viven en `src/messages/<locale>.json` bajo `curriculum.*`
 * (siete idiomas); aquí solo está la verificación. El avance se persiste
 * en localStorage.
 */

export const LESSON_COUNT = 10;
const STORAGE_KEY = 'solomon-house:curriculum-progress';

function collectObjects(): TextureObject[] {
  const { grids } = useWorldStore.getState();
  const objects: TextureObject[] = [];
  grids.forEach((grid) => {
    (grid.objects ?? []).forEach((obj) => {
      if (!obj?.id) return;
      objects.push({
        id: obj.id,
        frequency: obj.audioParams?.frequency || 440,
        waveform: String(obj.audioParams?.waveform || 'sine'),
        position: obj.position,
      });
    });
  });
  return objects;
}

/**
 * Verificadores de los micro-desafíos, indexados por lección (1-10).
 * Cada uno comprueba la huella del principio en el mundo real.
 */
export const CHALLENGE_CHECKS: Record<number, () => boolean> = {
  // 1. Escuchar antes de construir: el contexto de audio está corriendo
  1: () => {
    try {
      return Tone.getContext().state === 'running';
    } catch {
      return false;
    }
  },

  // 2. El espacio es partitura: hay al menos un objeto en el lienzo
  2: () => collectObjects().length >= 1,

  // 3. Cada objeto es un instrumento: conviven al menos dos tipos distintos
  3: () => {
    const { grids } = useWorldStore.getState();
    const types = new Set<string>();
    grids.forEach((grid) => (grid.objects ?? []).forEach((obj) => obj && types.add(obj.type)));
    return types.size >= 2;
  },

  // 4. La altura es registro: un objeto agudo (>660 Hz) habita lo alto (y>2)
  4: () =>
    collectObjects().some((obj) => obj.frequency > 660 && obj.position[1] > 2),

  // 5. La distancia es dinámica: un objeto vive lejos del origen (>8 u)
  5: () => collectObjects().some((obj) => Math.hypot(obj.position[0], obj.position[2]) > 8),

  // 6. El silencio también compone: ≥3 objetos sin banda saturada (<60%)
  6: () => {
    const objects = collectObjects();
    if (objects.length < 3) return false;
    return analyzeTexture(objects).dominance < 0.6;
  },

  // 7. El movimiento es fraseo: existe un objeto móvil
  7: () => {
    const { grids } = useWorldStore.getState();
    let found = false;
    grids.forEach((grid) => {
      if ((grid.mobileObjects ?? []).length > 0) found = true;
    });
    return found;
  },

  // 8. Las zonas transforman: existe una zona de efecto
  8: () => {
    const { grids } = useWorldStore.getState();
    let found = false;
    grids.forEach((grid) => {
      if ((grid.effectZones ?? []).length > 0) found = true;
    });
    return found;
  },

  // 9. Construir con otros: conectado al mundo global colaborativo
  9: () => useWorldStore.getState().globalWorldConnected,

  // 10. La obra permanece abierta: el mundo se guardó como proyecto
  //     (o se completó el examen psicoacústico — ambas huellas valen)
  10: () => {
    if (useWorldStore.getState().currentProjectId) return true;
    try {
      return localStorage.getItem('solomon-house:audio-exam-best') !== null;
    } catch {
      return false;
    }
  },
};

export function loadProgress(): boolean[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as boolean[]) : [];
    return Array.from({ length: LESSON_COUNT }, (_, i) => Boolean(parsed[i]));
  } catch {
    return Array(LESSON_COUNT).fill(false);
  }
}

export function saveProgress(progress: boolean[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Sin almacenamiento: el avance vive solo en sesión
  }
}
