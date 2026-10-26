import { useWorldStore, type SoundObject, type SoundObjectType } from '../../state/useWorldStore';
import { isObjectTypeAllowed } from '../pedagogy/parametricLevels';
import {
  BANDS,
  analyzeTexture,
  complementaryWaveform,
  counterpointFrequency,
  counterpointPosition,
  retreatPosition,
  type TextureObject,
} from './accompaniment';

/**
 * Agente Autónomo Coproductor — "Jardinero Sónico" (roadmap 6.1 y 6.3).
 *
 * Bot controlado por código que habita la sala como un usuario virtual:
 * observa periódicamente el lienzo topológico y actúa como compañero de
 * ejecución con acompañamiento generativo:
 *
 *   - **Plantar**: si la textura está dispersa, siembra un objeto sonoro
 *     nuevo en una zona despoblada del espacio.
 *   - **Limpiar la textura** (6.3): ante saturación de una banda de
 *     frecuencia, re-afina una planta propia hacia la banda menos poblada
 *     y la *mueve* lejos del foco espacial de la saturación.
 *   - **Contrapunto a distancia** (6.3): si no tiene plantas en la banda
 *     saturada, siembra una voz nueva en el lado opuesto del lienzo con
 *     síntesis complementaria (timbres ricos ↔ puros) afinada por
 *     intervalos consonantes en la banda dispersa.
 *   - **Podar**: si la sala se satura de objetos, retira uno de los suyos.
 *
 * El jardinero solo modifica o elimina objetos que él mismo plantó; las
 * creaciones de los usuarios humanos son intocables.
 */

const TICK_INTERVAL_MS = 12_000;
const MAX_OWN_OBJECTS = 5;
const SPARSE_THRESHOLD = 3; // menos objetos que esto = textura dispersa
const CROWDED_THRESHOLD = 24; // más objetos que esto = podar
const DOMINANCE_RATIO = 0.6; // fracción de una banda que se considera saturación

/** Paleta de tipos que el jardinero puede sembrar (sonidos sostenibles). */
const PLANT_PALETTE: SoundObjectType[] = ['cube', 'sphere', 'cylinder'];

function toTextureObjects(objects: SoundObject[]): TextureObject[] {
  return objects.map((obj) => ({
    id: obj.id,
    frequency: obj.audioParams?.frequency || 440,
    waveform: String(obj.audioParams?.waveform || 'sine'),
    position: obj.position,
  }));
}

export class SonicGardener {
  private ownIds = new Set<string>();
  private timer: ReturnType<typeof setInterval> | null = null;

  public isRunning(): boolean {
    return this.timer !== null;
  }

  public start(): void {
    if (this.timer) return;
    this.timer = setInterval(() => this.tick(), TICK_INTERVAL_MS);
    console.log('🌱 Jardinero Sónico: despierto, observando el lienzo');
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    console.log('🌱 Jardinero Sónico: en reposo');
  }

  /** Un ciclo de observación y acción sobre la cuadrícula activa. */
  private tick(): void {
    const state = useWorldStore.getState();
    const { activeGridId, grids } = state;
    if (!activeGridId || !state.canEdit()) return;

    const grid = grids.get(activeGridId);
    if (!grid) return;

    const objects = grid.objects;

    // Mantener la memoria propia coherente con el mundo (otros pueden
    // haber borrado plantas del jardinero)
    for (const id of [...this.ownIds]) {
      if (!objects.some((obj) => obj.id === id)) {
        this.ownIds.delete(id);
      }
    }

    // 1. Podar: la sala está saturada de objetos
    if (objects.length > CROWDED_THRESHOLD && this.ownIds.size > 0) {
      const victim = objects.find((obj) => this.ownIds.has(obj.id));
      if (victim) {
        console.log('🌱 Jardinero: podando', victim.id);
        state.removeObject(victim.id);
        this.ownIds.delete(victim.id);
        return;
      }
    }

    // 2. Plantar: la textura está dispersa
    if (objects.length < SPARSE_THRESHOLD && this.ownIds.size < MAX_OWN_OBJECTS) {
      this.plant(grid.gridSize, objects);
      return;
    }

    // 3. Acompañamiento generativo (6.3): reaccionar a la saturación
    if (objects.length >= 4) {
      this.accompany(objects, grid.gridSize);
    }
  }

  /** Siembra un objeto nuevo en una zona despoblada del plano. */
  private plant(gridSize: number, objects: SoundObject[]): void {
    // Buscar la posición candidata más alejada de los objetos existentes
    const half = (gridSize || 20) * 0.35;
    let best: [number, number, number] = [0, 1, 0];
    let bestDistance = -1;
    for (let attempt = 0; attempt < 8; attempt++) {
      const candidate: [number, number, number] = [
        (Math.random() * 2 - 1) * half,
        0.5 + Math.random() * 2,
        (Math.random() * 2 - 1) * half,
      ];
      const nearest = objects.reduce((min, obj) => {
        const dx = obj.position[0] - candidate[0];
        const dz = obj.position[2] - candidate[2];
        return Math.min(min, Math.hypot(dx, dz));
      }, Infinity);
      if (nearest > bestDistance) {
        bestDistance = nearest;
        best = candidate;
      }
    }

    this.plantAt(best);
  }

  /** Planta en una posición concreta y devuelve el objeto creado. */
  private plantAt(position: [number, number, number]): SoundObject | null {
    const state = useWorldStore.getState();

    const palette = PLANT_PALETTE.filter((type) => isObjectTypeAllowed(type));
    if (palette.length === 0) return null;
    const type = palette[Math.floor(Math.random() * palette.length)];

    const before = new Set(
      (state.grids.get(state.activeGridId!)?.objects ?? []).map((o) => o.id)
    );

    console.log(`🌱 Jardinero: plantando ${type} en`, position);
    state.addObject(type, position);

    // Identificar el objeto recién plantado para recordarlo como propio
    const after = useWorldStore.getState().grids.get(state.activeGridId!)?.objects ?? [];
    const planted = after.find((obj) => !before.has(obj.id));
    if (planted) {
      this.ownIds.add(planted.id);
      return planted;
    }
    return null;
  }

  /**
   * Acompañamiento generativo (6.3): ante la saturación de una banda,
   * limpiar la textura con una planta propia o generar un contrapunto
   * a distancia con síntesis complementaria.
   */
  private accompany(objects: SoundObject[], gridSize: number): void {
    const state = useWorldStore.getState();
    const analysis = analyzeTexture(toTextureObjects(objects));

    if (analysis.dominance < DOMINANCE_RATIO) {
      return; // La textura está razonablemente equilibrada
    }
    if (analysis.sparseIndex === analysis.dominantIndex) return;

    const sparseBand = BANDS[analysis.sparseIndex];
    const reference =
      analysis.dominantObjects[0]?.frequency || BANDS[analysis.dominantIndex].center;

    // A) Limpiar la textura: re-afinar Y alejar una planta propia que
    //    habite la banda saturada
    const ownInDominant = objects.find(
      (obj) =>
        this.ownIds.has(obj.id) &&
        analysis.dominantObjects.some((dom) => dom.id === obj.id)
    );

    if (ownInDominant) {
      const frequency = counterpointFrequency(
        ownInDominant.audioParams?.frequency || reference,
        sparseBand
      );
      const position = retreatPosition(
        ownInDominant.position,
        analysis.centroid,
        gridSize
      );

      console.log(
        `🌱 Jardinero: limpiando textura — ${ownInDominant.id} se retira del foco y pasa a banda ${sparseBand.name} (${Math.round(frequency)} Hz)`
      );
      state.updateObject(ownInDominant.id, {
        position,
        audioParams: { ...ownInDominant.audioParams, frequency },
      });
      return;
    }

    // B) Contrapunto a distancia: voz nueva en el lado opuesto del lienzo
    //    con síntesis complementaria a la textura saturada
    if (this.ownIds.size < MAX_OWN_OBJECTS) {
      const position = counterpointPosition(analysis.centroid, gridSize);
      const planted = this.plantAt(position);
      if (!planted) return;

      const frequency = counterpointFrequency(reference, sparseBand);
      const waveform = complementaryWaveform(analysis.dominantObjects);

      console.log(
        `🌱 Jardinero: contrapunto a distancia — ${waveform} a ${Math.round(frequency)} Hz en banda ${sparseBand.name}, lejos del foco`
      );
      useWorldStore.getState().updateObject(planted.id, {
        audioParams: { ...planted.audioParams, frequency, waveform },
      });
    }
  }
}

/** Instancia única del jardinero para toda la aplicación. */
export const sonicGardener = new SonicGardener();
