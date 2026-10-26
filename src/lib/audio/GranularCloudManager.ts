import * as Tone from 'tone';
import { useWorldStore } from '../../state/useWorldStore';
import { GranularEngine } from './GranularEngine';

/**
 * Gestor de Nubes Granulares (roadmap 2.6).
 *
 * Asocia cada motor granular a un objeto visual del mundo (su ancla):
 * sigue su posición, y cuando el objeto desaparece del lienzo libera el
 * motor (roadmap 2.5). Una nube = un sample del usuario granulado y
 * espacializado alrededor del objeto.
 */

const WATCH_INTERVAL_MS = 400;

class GranularCloudManager {
  private clouds = new Map<string, GranularEngine>();
  private lastPositions = new Map<string, string>();
  private watcher: ReturnType<typeof setInterval> | null = null;

  /** Crea una nube granular anclada al objeto dado. */
  public async createCloud(
    objectId: string,
    file: File,
    position: [number, number, number]
  ): Promise<void> {
    const arrayBuffer = await file.arrayBuffer();
    const context = Tone.getContext().rawContext as AudioContext;
    const audioBuffer = await context.decodeAudioData(arrayBuffer);

    const engine = await GranularEngine.create(audioBuffer, position);
    engine.start();

    this.clouds.set(objectId, engine);
    this.ensureWatcher();
    console.log(`🌫️ Nube granular creada para objeto ${objectId} ("${file.name}")`);
  }

  public removeCloud(objectId: string): void {
    const engine = this.clouds.get(objectId);
    if (engine) {
      engine.dispose();
      this.clouds.delete(objectId);
      this.lastPositions.delete(objectId);
    }
    if (this.clouds.size === 0 && this.watcher) {
      clearInterval(this.watcher);
      this.watcher = null;
    }
  }

  public hasCloud(objectId: string): boolean {
    return this.clouds.has(objectId);
  }

  /** Sigue la posición del ancla y libera nubes huérfanas. */
  private ensureWatcher(): void {
    if (this.watcher) return;

    this.watcher = setInterval(() => {
      const { grids } = useWorldStore.getState();

      for (const objectId of [...this.clouds.keys()]) {
        let found = false;

        for (const grid of grids.values()) {
          const object = grid.objects.find((obj) => obj.id === objectId);
          if (!object) continue;
          found = true;

          // Posición mundial = posición de la cuadrícula + local del objeto
          const world: [number, number, number] = [
            grid.position[0] + object.position[0],
            grid.position[1] + object.position[1],
            grid.position[2] + object.position[2],
          ];
          const key = world.join(',');
          if (this.lastPositions.get(objectId) !== key) {
            this.lastPositions.set(objectId, key);
            this.clouds.get(objectId)?.setPosition(world);
          }
          break;
        }

        // El ancla fue eliminada del mundo: liberar la nube
        if (!found) {
          console.log(`🌫️ Nube granular liberada (ancla ${objectId} eliminada)`);
          this.removeCloud(objectId);
        }
      }
    }, WATCH_INTERVAL_MS);
  }

  /** Libera todas las nubes (salida de sala / limpieza global). */
  public disposeAll(): void {
    for (const objectId of [...this.clouds.keys()]) {
      this.removeCloud(objectId);
    }
  }
}

export const granularCloudManager = new GranularCloudManager();
